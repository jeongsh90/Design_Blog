import { writeFileSync } from "fs";

function decode(s) {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseFaces(html) {
  const raw = [...html.matchAll(/@font-face\s*\{[^}]+\}/gi)].map((m) => decode(m[0]));
  const parsed = [];
  for (const block of raw) {
    const family = (block.match(/font-family:\s*['"]([^'"]+)['"]/i) || [])[1];
    const url = (block.match(/url\(['"]([^'"]+)['"]\)/i) || [])[1];
    const weight = (block.match(/font-weight:\s*([^;]+)/i) || [])[1]?.trim() || "normal";
    const format = (block.match(/format\(['"]([^'"]+)['"]\)/i) || [])[1] || "";
    if (!family || !url) continue;
    parsed.push({ family, url, weight, format, block });
  }
  const modern = parsed.filter((f) => /\.woff2?(\?|$)/i.test(f.url) || /woff/i.test(f.format));
  const uniq = [];
  const seen = new Set();
  for (const f of modern) {
    const key = `${f.url}|${f.weight}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(f);
  }
  return { all: parsed, modern: uniq };
}

function parseTable(html) {
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)];
  if (!tables.length) return [];
  const t = tables[0][0];
  return [...t.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((tr) =>
    [...tr[0].matchAll(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)]
      .map((c) => c[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
  );
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function licenseText(html) {
  const text = stripTags(html);
  const startKeys = ["지적 재산권", "라이선스", "무료로 제공", "누구나 무료", "지적재산권"];
  let start = -1;
  for (const k of startKeys) {
    const i = text.indexOf(k);
    if (i >= 0 && (start < 0 || i < start)) start = i;
  }
  if (start < 0) return "";
  const end = text.indexOf("라이선스 요약표", start);
  return text.slice(Math.max(0, start - 80), end > start ? end : start + 700).trim();
}

function downloadLink(html) {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const skip = /noonnu\.cc|jsdelivr|google\.com|facebook|twitter|kakao|instagram|cdn\./i;
  const prefer = /download|font\.co|fonts\.|go\.kr|github|cafe24|yoondesign|supernovice|ridicorp|brunch|tistory|notion|official/i;
  const ext = hrefs.filter((h) => /^https?:/i.test(h) && !skip.test(h));
  return ext.find((h) => prefer.test(h)) || ext[0] || "";
}

const catalog = JSON.parse(await Bun.file("_workspace/00_noonnu-catalog.json").text());
const candidates = catalog.filter((f) => f.id >= 534).slice(0, 50);
const results = [];

for (const item of candidates) {
  const url = `https://noonnu.cc/font_page/${item.id}`;
  const row = { id: item.id, catalogName: item.name, maker: item.maker, catalogWeights: item.weights, url };
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();
    row.finalUrl = res.url;
    row.status = res.status;
    const missing =
      !/\/font_page\/\d+/.test(res.url) ||
      /찾을 수 없/.test(html.slice(0, 3000));
    if (missing) {
      row.skip = "page missing/redirect";
      results.push(row);
      console.log(item.id, item.name, "SKIP missing");
      continue;
    }
    const faces = parseFaces(html);
    row.faceCount = faces.all.length;
    row.modern = faces.modern;
    row.table = parseTable(html);
    row.license = licenseText(html);
    row.downloadUrl = downloadLink(html);
    const tableText = JSON.stringify(row.table);
    row.embedBanned = /임베딩[\s\S]{0,80}사용 금지/.test(tableText) || /임베딩[^"]*사용 금지/.test(html);
    if (!faces.modern.length) {
      row.skip = faces.all.length ? "no modern woff" : "no @font-face";
    } else if (row.embedBanned) {
      row.skip = "embedding banned";
    } else {
      row.ok = true;
    }
    console.log(
      item.id,
      item.name,
      row.ok ? `OK ${faces.modern.length} woff` : `SKIP ${row.skip}`,
      row.embedBanned ? "(embed-ban)" : ""
    );
  } catch (e) {
    row.skip = "error";
    row.error = String(e).slice(0, 200);
    console.log(item.id, item.name, "ERR", row.error);
  }
  results.push(row);
  await Bun.sleep(250);
}

writeFileSync("_workspace/batch15-scrape.json", JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.ok);
const skipped = results.filter((r) => !r.ok);
console.log("ok", ok.length, "/", results.length);
console.log("skipped", skipped.map((r) => r.id + " " + r.catalogName + " (" + r.skip + ")").join("\n"));
console.log(ok.map((r) => r.id + " " + r.catalogName).join("\n"));
