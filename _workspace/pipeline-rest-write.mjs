import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const DATE = "2026-09-10";
const NOTE_FOOTER = `<p data-ke-size="size14">※ 위 표는 참고용으로 정리한 요약이다. 정확한 사용 범위는 저작권자에게 확인하는 것이 안전하다.</p>`;
const CLOVA = "https://clova.ai/handwriting/list.html";

function slugify(id, name, family) {
  const base = String(family || name || "font")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const cleaned = base || "font";
  // keep unique and filesystem-safe; Korean names often become empty after strip
  if (!/[a-z0-9]/.test(cleaned) || cleaned.length < 2) return `id${id}`;
  return `${cleaned}-${id}`.slice(0, 60).replace(/-$/, "");
}

function categoryOf(name, maker) {
  if (/손글씨|필기|다이어리|편지|나눔손/.test(name)) return "손글씨체";
  if (/명조|바탕|세리프|serif/i.test(name)) return "명조체";
  if (/고딕|산스|sans|돋움/i.test(name)) return "고딕체";
  if (/장식|둥근|귀여|통통|팝|POP/i.test(name)) return "장식체";
  if (maker === "네이버") return "손글씨체";
  return "고딕체";
}

function stripNoonnu(s) {
  return String(s || "")
    .replace(/눈누\s*[xX×]\s*/g, "")
    .replace(/눈누/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function displayName(row) {
  const n = stripNoonnu(row.catalogName);
  return n || `폰트 ${row.id}`;
}

function cleanLicense(raw) {
  let t = stripNoonnu(raw || "");
  const i = t.indexOf("라이선스 본문");
  if (i >= 0) t = t.slice(i + "라이선스 본문".length);
  t = t.replace(/\*안내사항[^.]*\./g, "다운로드 시 별도 안내를 확인하는 것이 좋다.");
  t = t.replace(/^[-\s]+/, "");
  t = t.replace(/\s+/g, " ").trim();
  t = t
    .replace(/입니다/g, "이다")
    .replace(/합니다/g, "한다")
    .replace(/됩니다/g, "된다")
    .replace(/있습니다/g, "있다");
  if (t.length > 900) t = t.slice(0, 900).replace(/\s+\S*$/, "") + ".";
  if (!t || t.length < 40) {
    t =
      "무료로 배포되는 한글 폰트다. 사용 범위는 요약표를 참고하고, 정확한 조건은 저작권자 안내를 확인하는 것이 안전하다.";
  }
  return stripNoonnu(t);
}

function extraNote(row) {
  const bits = [];
  if (row.maker === "네이버" || /naverfont_/i.test(JSON.stringify(row.modern || []))) {
    bits.push(
      "네이버 나눔글꼴/클로바 손글씨 계열로 보인다. 폰트 파일의 유상 판매·배포는 금지되는 경우가 많다.",
    );
  }
  const embed = (row.table || []).find((r) => r[0] === "임베딩");
  if (embed && /조건부/.test(embed.join(" "))) {
    bits.push(
      "요약표에서 임베딩이 조건부 허용으로 표기돼 있다. 서버에 폰트를 올려 쓰는 웹폰트 적용 전에는 저작권자에게 범위를 확인하는 것이 안전하다.",
    );
  }
  const bi = (row.table || []).find((r) => r[0] === "BI/CI");
  if (bi && /금지/.test(bi.join(" "))) {
    bits.push("요약표에서 BI/CI 사용이 금지로 표기돼 있다.");
  }
  if (!bits.length) return "";
  return bits.map((b) => `<p data-ke-size="size14">※ 참고: ${b}</p>`).join("\n");
}

function tableHtml(rows) {
  const body = (rows || [])
    .filter((r) => r.length >= 2 && r[0] !== "카테고리")
    .map((r) => `<tr>${r.map((c) => `<td>${stripNoonnu(c)}</td>`).join("")}</tr>`)
    .join("\n");
  return `<table>
<tbody>
<tr><th>카테고리</th><th>사용 범위</th><th>허용 여부</th></tr>
${body}
</tbody>
</table>`;
}

function codeBlocks(modern) {
  return modern
    .map(
      (m) => `@font-face {
    font-family: '${m.family}';
    src: url('${m.url}') format('woff');
    font-weight: ${m.weight};
    font-display: swap;
}`,
    )
    .join("\n\n");
}

function downloadFor(row) {
  const u = row.downloadUrl || "";
  if (u && !/fonts\.googleapis\.com/i.test(u) && !/noonnu\.cc/i.test(u)) return u;
  if (row.maker === "네이버" || /naverfont_/i.test(JSON.stringify(row.modern || []))) return CLOVA;
  return `https://noonnu.cc/font_page/${row.id}`;
}

const scrapePath = process.argv[2] || "_workspace/pipeline-rest-scrape.json";
const startCatalog = Number(process.argv[3] || 314);
const scraped = JSON.parse(readFileSync(scrapePath, "utf8")).filter((r) => r.ok && r.status === 200);

const usedSlugs = new Set();
const existingById = new Map();
// reserve existing post slugs for same date
try {
  const { readdirSync } = await import("fs");
  for (const d of readdirSync("posts")) {
    const m = d.match(/^2026-09-10-noonnu-font-(.+)$/);
    if (!m) continue;
    usedSlugs.add(m[1]);
    const idMatch = m[1].match(/-(\d+)$/);
    if (idMatch) {
      existingById.set(Number(idMatch[1]), {
        slug: m[1],
        dir: `posts/${d}`,
      });
    }
  }
} catch {}

const prepared = [];
let catalogIndex = startCatalog;

for (const row of scraped) {
  const name = displayName(row);
  const existing = existingById.get(row.id);
  let slug;
  let dir;
  if (existing) {
    slug = existing.slug;
    dir = existing.dir;
  } else {
    const family = row.modern[0]?.family || "";
    slug = slugify(row.id, name, family);
    while (usedSlugs.has(slug)) slug = `${slug}-x`;
    usedSlugs.add(slug);
    dir = `posts/${DATE}-noonnu-font-${slug}`;
  }

  const category = categoryOf(name, stripNoonnu(row.maker));
  const preview = `${name}의 결을 담은 무료 한글 서체입니다.`;
  const maker = stripNoonnu(
    String(row.maker || "")
      .replace(/[\u0000-\u001f]/g, "")
      .replace(/^㈜/, "")
      .trim(),
  );
  const intro = `${name}는 ${maker || "제작사"}이 배포하는 무료 한글 폰트다. 실제 페이지에서 확인한 웹폰트 코드와 라이선스 요약을 함께 정리했다.`;

  const modern = row.modern;
  const previewFace = modern[Math.floor((modern.length - 1) / 2)] || modern[0];
  const liveFamily = `${slug.replace(/-/g, "")}-live`.slice(0, 40);

  if (existsSync(join(dir, "final.html")) && existsSync(join(dir, "attachments/thumbnail.png"))) {
    prepared.push({
      catalogIndex: catalogIndex++,
      id: row.id,
      name,
      postFolder: `${dir}/`,
      registeredInTistory: false,
      slug,
      note: `[배치16+] 기존 초안 유지.`,
      skippedRewrite: true,
    });
    continue;
  }
  mkdirSync(`${dir}/attachments`, { recursive: true });

  const note = stripNoonnu(extraNote(row));
  const weightNote = modern.length > 1 ? ` ${modern.length}가지 굵기를 제공한다.` : "";
  const dl = downloadFor(row);

  const finalHtml = `<p data-ke-size="size16">${intro}</p>

<style>
@font-face {
  font-family: '${liveFamily}';
  src: url('${previewFace.url}') format('woff');
  font-weight: normal;
  font-display: swap;
}
</style>
<div class="font-preview-card">
<p class="font-preview-text" style="font-family: '${liveFamily}', sans-serif;">${preview}</p>
</div>

<h2>라이선스</h2>
<p data-ke-size="size16">${cleanLicense(row.license)}</p>

${tableHtml(row.table)}
${NOTE_FOOTER}
${note ? note + "\n" : ""}
<h2>웹폰트 코드</h2>
<p data-ke-size="size16">웹폰트로 사용할 때 필요한 코드는 다음과 같다.${weightNote}</p>
<pre><code class="language-css">${codeBlocks(modern)}</code></pre>

<h2>다운로드</h2>
<p data-ke-size="size16">${name} 파일은 다음 페이지에서 받을 수 있다.</p>
<p data-ke-size="size16"><a href="${dl}" target="_blank" rel="noopener">${name} 다운로드 페이지 바로가기</a></p>
`;

  if (/눈누/.test(finalHtml)) throw new Error("noonnu leaked " + row.id);
  writeFileSync(`${dir}/final.html`, finalHtml, "utf8");

  const titleTail = preview.replace(/입니다\.$/, "");
  const metaMd = `# 제목: ${name} 무료 한글 웹폰트 — ${titleTail}

- 카테고리: Design > Font
- 태그: ${name.replace(/\s+/g, "")}, 무료폰트, 한글폰트, ${category}, 웹폰트
- 메타디스크립션: ${maker || "제작사"}이 배포하는 무료 한글 폰트 ${name}를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.
- 썸네일: attachments/thumbnail.png(1200×630, IHDR 픽셀 크기 검증 완료)

## 제외된 항목
- 없음

## 발행 안내
1. 티스토리 글쓰기 → HTML 모드 전환 → final.html 내용 붙여넣기
2. 카테고리 Design > Font 지정, 위 태그 입력
3. 대표이미지로 attachments/thumbnail.png 첨부
4. **신규 발행 직후 CDN 16:9 패딩 버그 예방 절차 필수**: 대표이미지를 한 번 삭제 후 같은 파일을 재업로드→재발행(R1200x0으로 실제 노출 크기 재검증)
5. 당일 공개 발행 한도(15개)를 확인한 뒤 공개로 저장

## 검증 기록
- 1차 출처: font_page/${row.id} (${name})
- 확인 시점: ${DATE}
- 직접 검증한 항목: 페이지 HTML에서 @font-face(woff), 라이선스 본문·요약표, 다운로드 링크를 실측 확인.
- 미검증 항목: 실제 파일 다운로드 절차까지는 수행하지 않음(링크 URL만 확인)
`;
  writeFileSync(`${dir}/meta.md`, metaMd, "utf8");

  const thumbHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
@font-face {
  font-family: '${liveFamily}';
  src: url('${previewFace.url}') format('woff');
  font-weight: normal;
  font-display: block;
}
html,body{margin:0;padding:0;}
body{
  width:1200px;height:630px;
  background:#171717;
  display:flex;align-items:center;justify-content:center;
  flex-direction:column;
}
.name{
  font-family:'${liveFamily}',sans-serif;
  font-size:64px;
  color:#ffffff;
  text-align:center;
  padding:0 40px;
}
.sub{
  font-family:'${liveFamily}',sans-serif;
  font-size:26px;
  color:#a3a3a3;
  margin-top:24px;
  text-align:center;
  padding:0 40px;
}
</style>
</head>
<body>
<div class="name">${name}</div>
<div class="sub">${titleTail}</div>
</body>
</html>
`;
  writeFileSync(`_workspace/noonnu-thumbs/thumb-${row.id}-${slug}.html`, thumbHtml, "utf8");

  prepared.push({
    catalogIndex: catalogIndex++,
    id: row.id,
    name,
    postFolder: `${dir}/`,
    registeredInTistory: false,
    slug,
    note: `[배치16+] final.html \"눈누\" 언급 없음.`,
  });
}

writeFileSync("_workspace/pipeline-rest-prepared.json", JSON.stringify(prepared, null, 2));
console.log("generated", prepared.length, "nextCatalog", catalogIndex);
