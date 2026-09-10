import { writeFileSync, mkdirSync } from "fs";

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
      .filter(Boolean),
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
  const prefer =
    /download|font\.co|fonts\.|go\.kr|github|cafe24|yoondesign|supernovice|ridicorp|brunch|tistory|notion|official|clova/i;
  const ext = hrefs.filter((h) => /^https?:/i.test(h) && !skip.test(h));
  return ext.find((h) => prefer.test(h)) || ext[0] || "";
}

async function scrapeOne(item) {
  const url = `https://noonnu.cc/font_page/${item.id}`;
  const row = {
    id: item.id,
    catalogName: item.name,
    maker: item.maker,
    catalogWeights: item.weights,
    url,
  };
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 DesignBlogDraftBot" },
    });
    const html = await res.text();
    row.finalUrl = res.url;
    row.status = res.status;
    const missing =
      !/\/font_page\/\d+/.test(res.url) || /찾을 수 없/.test(html.slice(0, 3000));
    if (missing) {
      row.skip = "page missing/redirect";
      return row;
    }
    const faces = parseFaces(html);
    row.faceCount = faces.all.length;
    row.modern = faces.modern;
    row.table = parseTable(html);
    row.license = licenseText(html);
    row.downloadUrl = downloadLink(html);
    const tableText = JSON.stringify(row.table);
    row.embedBanned =
      /임베딩[\s\S]{0,80}사용 금지/.test(tableText) || /임베딩[^"]*사용 금지/.test(html);
    if (!faces.modern.length) {
      row.skip = faces.all.length ? "no modern woff" : "no @font-face";
    } else if (row.embedBanned) {
      row.skip = "embedding banned";
    } else {
      row.ok = true;
    }
  } catch (e) {
    row.skip = "error";
    row.error = String(e).slice(0, 200);
  }
  return row;
}

const START = Number(process.argv[2] || 584);
const LIMIT = Number(process.argv[3] || 0);
const CONCURRENCY = Number(process.argv[4] || 12);
const OUT = process.argv[5] || "_workspace/pipeline-rest-scrape.json";

const catalog = JSON.parse(await Bun.file("_workspace/00_noonnu-catalog.json").text());
let candidates = catalog.filter((f) => f.id >= START);
if (LIMIT > 0) candidates = candidates.slice(0, LIMIT);

mkdirSync("_workspace", { recursive: true });
const results = [];
let i = 0;

async function worker() {
  while (true) {
    const idx = i++;
    if (idx >= candidates.length) return;
    const item = candidates[idx];
    const row = await scrapeOne(item);
    results[idx] = row;
    const mark = row.ok ? `OK ${(row.modern || []).length}` : `SKIP ${row.skip}`;
    if (idx % 25 === 0 || !row.ok) {
      console.log(`${idx + 1}/${candidates.length}`, item.id, item.name, mark);
    }
  }
}

const workers = Array.from({ length: Math.min(CONCURRENCY, candidates.length) }, () => worker());
await Promise.all(workers);

const ordered = results.filter(Boolean);
writeFileSync(OUT, JSON.stringify(ordered, null, 2));
const ok = ordered.filter((r) => r.ok);
const skipped = ordered.filter((r) => !r.ok);
const skipCounts = {};
for (const s of skipped) skipCounts[s.skip] = (skipCounts[s.skip] || 0) + 1;
console.log(JSON.stringify({ out: OUT, total: ordered.length, ok: ok.length, skipped: skipped.length, skipCounts }, null, 2));
