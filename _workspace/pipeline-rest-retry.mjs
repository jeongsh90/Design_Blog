import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function scrapeOne(item, attempt = 1) {
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
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    row.status = res.status;
    row.finalUrl = res.url;
    if (res.status === 429) {
      if (attempt <= 8) {
        const wait = Math.min(60000, 2000 * 2 ** (attempt - 1));
        console.log("429", item.id, "wait", wait, "attempt", attempt);
        await sleep(wait);
        return scrapeOne(item, attempt + 1);
      }
      row.skip = "rate limited";
      return row;
    }
    const html = await res.text();
    if (html.length < 100) {
      row.skip = "empty body";
      return row;
    }
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
    if (attempt <= 5) {
      await sleep(1500 * attempt);
      return scrapeOne(item, attempt + 1);
    }
    row.skip = "error";
    row.error = String(e).slice(0, 200);
  }
  return row;
}

const OUT = "_workspace/pipeline-rest-scrape.json";
const STATE = "_workspace/pipeline-rest-state.json";
const DELAY = Number(process.argv[2] || 450);
const CONCURRENCY = Number(process.argv[3] || 2);

const catalog = JSON.parse(await Bun.file("_workspace/00_noonnu-catalog.json").text());
const byId = Object.fromEntries(catalog.map((c) => [c.id, c]));

let existing = [];
if (existsSync(OUT)) existing = JSON.parse(readFileSync(OUT, "utf8"));
const doneMap = new Map();
for (const r of existing) {
  // keep only successful HTTP parses (not 429 misclassified)
  if (r.status === 200 || r.ok || (r.skip && r.skip !== "no @font-face" && r.skip !== "rate limited" && r.status !== 429)) {
    if (r.status === 200) doneMap.set(r.id, r);
  } else if (r.status === 200 && r.skip === "no @font-face") {
    doneMap.set(r.id, r);
  } else if (r.status === 200) {
    doneMap.set(r.id, r);
  }
}

// rebuild doneMap properly: keep status===200 only
doneMap.clear();
for (const r of existing) {
  if (r.status === 200) doneMap.set(r.id, r);
}

const remaining = catalog
  .filter((f) => f.id >= 584)
  .filter((f) => !doneMap.has(f.id));

console.log("already 200:", doneMap.size, "remaining:", remaining.length, "delay", DELAY, "conc", CONCURRENCY);

mkdirSync("_workspace", { recursive: true });

let cursor = 0;
const fresh = [];

async function worker(wid) {
  while (true) {
    const idx = cursor++;
    if (idx >= remaining.length) return;
    const item = remaining[idx];
    const row = await scrapeOne(item);
    fresh.push(row);
    doneMap.set(row.id, row);
    const mark = row.ok ? `OK ${(row.modern || []).length}` : `SKIP ${row.skip}`;
    console.log(`[w${wid}] ${doneMap.size}/776`, row.id, row.catalogName, mark, "status", row.status);
    if ((fresh.length + 1) % 20 === 0) {
      const all = [...doneMap.values()].sort((a, b) => a.id - b.id);
      writeFileSync(OUT, JSON.stringify(all, null, 2));
      writeFileSync(
        STATE,
        JSON.stringify(
          {
            done200: all.filter((x) => x.status === 200).length,
            ok: all.filter((x) => x.ok).length,
            remaining: 776 - all.filter((x) => x.status === 200).length,
          },
          null,
          2,
        ),
      );
    }
    await sleep(DELAY);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1)));

const all = [...doneMap.values()].sort((a, b) => a.id - b.id);
writeFileSync(OUT, JSON.stringify(all, null, 2));
const ok = all.filter((r) => r.ok);
const skipped = all.filter((r) => !r.ok);
const skipCounts = {};
for (const s of skipped) skipCounts[s.skip || "unknown"] = (skipCounts[s.skip || "unknown"] || 0) + 1;
console.log(
  JSON.stringify(
    {
      total: all.length,
      status200: all.filter((x) => x.status === 200).length,
      ok: ok.length,
      skipped: skipped.length,
      skipCounts,
    },
    null,
    2,
  ),
);
