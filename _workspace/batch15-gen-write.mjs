import { writeFileSync } from "fs";

const META = [
  [534, "daegwang-yuri", "유리처럼 맑게 비친 손글씨체입니다.", "대광유리는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 맑고 또렷한 손글씨 타이틀에 어울린다."],
  [535, "jalhago-isseo", "응원처럼 따뜻한 손글씨체입니다.", "잘하고 있어는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 응원·격려 문구에 어울린다."],
  [536, "jeomkkol", "점선처럼 리듬 있는 손글씨체입니다.", "점꼴체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 경쾌한 짧은 제목에 어울린다."],
  [537, "donghwa-ddobak", "동화책처럼 또박또박한 손글씨체입니다.", "동화또박은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 동화·어린이 콘텐츠에 어울린다."],
  [538, "appa-geulssi", "아버지가 남긴 듯한 손글씨체입니다.", "아빠글씨는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 가족 편지 감성에 어울린다."],
  [539, "appa-love-letter", "연애편지처럼 흐르는 손글씨체입니다.", "아빠의 연애편지는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 정성 들인 인사 문구에 어울린다."],
  [540, "gomsin", "곰신처럼 다정한 손글씨체입니다.", "곰신체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 따뜻하고 친근한 타이틀에 어울린다."],
  [541, "kkotnaeum", "꽃내음처럼 부드러운 손글씨체입니다.", "꽃내음은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 잔잔한 감성 문구에 어울린다."],
  [542, "gothic-goding", "고딩 노트처럼 캐주얼한 손글씨체입니다.", "고딕 아니고 고딩은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 유머러스한 캡션에 어울린다."],
  [543, "oehalmeoni", "외할머니가 써 준 듯한 손글씨체입니다.", "외할머니글씨는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 정겨운 손편지 감성에 어울린다."],
  [544, "harabeoji-nanum", "할아버지의 나눔을 담은 손글씨체입니다.", "할아버지의나눔은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 나눔·감사 문구에 어울린다."],
  [545, "hana-songeulssi", "하나로 이어진 듯한 손글씨체입니다.", "하나손글씨는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 일상 메모형 타이틀에 어울린다."],
  [546, "sonpyeonji", "손편지처럼 정성 어린 손글씨체입니다.", "손편지체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 편지·초대장 문구에 어울린다."],
  [547, "hanyun", "또렷하게 눌러 쓴 개인 손글씨체입니다.", "한윤체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 짧은 강조 제목에 어울린다."],
  [548, "haengbokhan-dobi", "행복한 도비처럼 밝은 손글씨체입니다.", "행복한 도비는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 밝고 유쾌한 타이틀에 어울린다."],
  [549, "haram", "하람처럼 단정한 손글씨체입니다.", "하람체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 단정한 손글씨 제목에 어울린다."],
  [550, "yeoril", "열일하듯 힘차게 쓴 손글씨체입니다.", "열일체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 다짐·슬로건 문구에 어울린다."],
  [551, "donghee", "노력하는 필치의 손글씨체입니다.", "노력하는 동희는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 성장·응원 콘텐츠에 어울린다."],
  [552, "huimang-nuri", "희망을 적어 둔 손글씨체입니다.", "희망누리는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 희망·캠페인 문구에 어울린다."],
  [553, "hyejun", "혜준이 남긴 듯한 손글씨체입니다.", "혜준체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 친근한 개인 타이틀에 어울린다."],
  [554, "hyeoki", "혁이처럼 또렷한 손글씨체입니다.", "혁이체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 짧고 힘 있는 제목에 어울린다."],
  [555, "naneun-igyeonaenda", "이겨낸다는 말을 남긴 손글씨체입니다.", "나는 이겨낸다는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 다짐·극복 문구에 어울린다."],
  [556, "ajumma-jayu", "자유로운 필치의 손글씨체입니다.", "아줌마 자유는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 자유롭고 캐주얼한 캡션에 어울린다."],
  [557, "jeongeun", "정은이 써 둔 듯한 손글씨체입니다.", "정은체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 부드러운 일상 문구에 어울린다."],
  [558, "kalguksu", "칼국수처럼 구수한 손글씨체입니다.", "칼국수는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 정겨운 안내 문구에 어울린다."],
  [559, "gang-bujangnim", "부장님 메모처럼 재치 있는 손글씨체입니다.", "강부장님체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 사무실 유머 캡션에 어울린다."],
  [560, "ganginhan-wiro", "강인한 위로를 담은 손글씨체입니다.", "강인한 위로는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 위로·응원 문구에 어울린다."],
  [561, "yageun-kimjuim", "야근 메모처럼 솔직한 손글씨체입니다.", "야근하는 김주임은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 직장인 유머 캡션에 어울린다."],
  [562, "kimyui", "유이가 남긴 듯한 손글씨체입니다.", "김유이체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 귀여운 짧은 타이틀에 어울린다."],
  [563, "yeolsa", "열사의 결기를 담은 손글씨체입니다.", "대한민국 열사체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 기념·추모 문구에 어울린다."],
  [564, "goryeo", "고려의 결을 닮은 손글씨체입니다.", "고려글꼴은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 고전 감성 타이틀에 어울린다."],
  [565, "gyuri-ilgi", "일기장에 남긴 듯한 손글씨체입니다.", "규리의 일기는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 일기·노트 감성에 어울린다."],
  [566, "eomma-sarang", "엄마의 사랑을 적은 손글씨체입니다.", "엄마사랑은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 가족·육아 콘텐츠에 어울린다."],
  [567, "saranghae-adeul", "아들에게 남긴 듯한 손글씨체입니다.", "사랑해 아들은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 가족 인사 문구에 어울린다."],
  [568, "mago", "마고처럼 단단한 손글씨체입니다.", "마고체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 힘 있는 짧은 제목에 어울린다."],
  [569, "uimiinneun-hangul", "의미 있는 한글을 담은 손글씨체입니다.", "의미있는 한글은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 한글·교육 콘텐츠에 어울린다."],
  [570, "junghaksaeng", "중학생 노트처럼 솔직한 손글씨체입니다.", "중학생은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 캐주얼한 청소년 감성 문구에 어울린다."],
  [571, "yeppeun-mingyeong", "민경이 써 둔 듯한 예쁜 손글씨체입니다.", "예쁜 민경체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 부드러운 타이틀에 어울린다."],
  [572, "mini-songeulssi", "작게 눌러 쓴 미니 손글씨체입니다.", "미니 손글씨는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 짧은 메모형 제목에 어울린다."],
  [573, "ddal-eomma", "딸에게 남긴 엄마의 손글씨체입니다.", "딸에게 엄마가는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 가족 편지 감성에 어울린다."],
  [574, "mongdol", "몽돌처럼 둥근 손글씨체입니다.", "몽돌은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 둥글고 부드러운 타이틀에 어울린다."],
  [575, "mugunghwa", "무궁화처럼 단정한 손글씨체입니다.", "무궁화는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 단정한 기념 문구에 어울린다."],
  [576, "mujinjang", "끝없이 이어진 듯한 손글씨체입니다.", "무진장체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 활기찬 짧은 제목에 어울린다."],
  [577, "nae-anae", "아내에게 남긴 듯한 손글씨체입니다.", "나의 아내 손글씨는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 부부·가족 인사 문구에 어울린다."],
  [578, "sinhon-bubu", "신혼의 설렘을 담은 손글씨체입니다.", "신혼부부는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 웨딩·축하 문구에 어울린다."],
  [579, "okbi", "옥비처럼 고운 손글씨체입니다.", "옥비체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 고운 손글씨 제목에 어울린다."],
  [580, "dal-gwedo", "달의 궤도처럼 흐르는 손글씨체입니다.", "달의궤도는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 감성 있는 타이틀에 어울린다."],
  [581, "jinju-parkkyunga", "진주 박경아의 필치를 담은 손글씨체입니다.", "진주 박경아체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 개인 필치가 살아있는 제목에 어울린다."],
  [582, "bukgeukseong", "북극성처럼 또렷한 손글씨체입니다.", "북극성은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 또렷한 강조 문구에 어울린다."],
  [583, "oensonjabi-yeppeo", "왼손잡이도 예쁘다는 손글씨체입니다.", "왼손잡이도 예뻐는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 유쾌한 응원 문구에 어울린다."],
];

const CLOVA = "https://clova.ai/handwriting/list.html";
const COPY = Object.fromEntries(
  META.map(([id, slug, preview, intro]) => [
    id,
    { slug, category: "손글씨체", preview, intro },
  ]),
);
const DOWNLOAD = Object.fromEntries(META.map(([id]) => [id, CLOVA]));

const header = `import { mkdirSync, writeFileSync, readFileSync } from "fs";

const DATE = "2026-09-10";
const NOTE_FOOTER = \`<p data-ke-size="size14">※ 위 표는 참고용으로 정리한 요약이다. 정확한 사용 범위는 저작권자에게 확인하는 것이 안전하다.</p>\`;

const COPY = ${JSON.stringify(COPY, null, 2)};

const DOWNLOAD = ${JSON.stringify(DOWNLOAD, null, 2)};

function cleanLicense(raw) {
  let t = raw || "";
  const i = t.indexOf("라이선스 본문");
  if (i >= 0) t = t.slice(i + "라이선스 본문".length);
  t = t.replace(/\\*눈누 안내사항[^.]*\\./g, "다운로드 시 별도 안내를 확인하는 것이 좋다.");
  t = t.replace(/눈누/g, "");
  t = t.replace(/^[\\-\\s]+/, "");
  t = t.replace(/\\s+/g, " ").trim();
  t = t
    .replace(/입니다/g, "이다")
    .replace(/합니다/g, "한다")
    .replace(/됩니다/g, "된다")
    .replace(/있습니다/g, "있다");
  if (t.length > 900) t = t.slice(0, 900).replace(/\\s+\\S*$/, "") + ".";
  if (!t || t.length < 40) {
    t = "네이버 나눔글꼴의 지적 재산권은 네이버와 네이버문화재단에 있다. 개인·기업 사용이 가능하며, 폰트 파일의 유료 판매는 금지된다. 정확한 사용 범위는 저작권자 안내를 확인하는 것이 안전하다.";
  }
  return t;
}

function extraNote(id, row) {
  const bits = [];
  bits.push("네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열이다. 폰트 파일 자체의 유상 판매·배포는 금지된다.");
  const embed = (row.table || []).find((r) => r[0] === "임베딩");
  if (embed && /조건부/.test(embed.join(" "))) {
    bits.push("요약표에서 임베딩이 조건부 허용으로 표기돼 있다. 서버에 폰트를 올려 쓰는 웹폰트 적용 전에는 저작권자에게 범위를 확인하는 것이 안전하다.");
  }
  return bits.map((b) => \`<p data-ke-size="size14">※ 참고: \${b}</p>\`).join("\\n");
}

function tableHtml(rows) {
  const body = (rows || [])
    .filter((r) => r.length >= 2 && r[0] !== "카테고리")
    .map((r) => \`<tr>\${r.map((c) => \`<td>\${c}</td>\`).join("")}</tr>\`)
    .join("\\n");
  return \`<table>
<tbody>
<tr><th>카테고리</th><th>사용 범위</th><th>허용 여부</th></tr>
\${body}
</tbody>
</table>\`;
}

function codeBlocks(modern) {
  return modern
    .map(
      (m) => \`@font-face {
    font-family: '\${m.family}';
    src: url('\${m.url}') format('woff');
    font-weight: \${m.weight};
    font-display: swap;
}\`
    )
    .join("\\n\\n");
}

const scraped = JSON.parse(readFileSync("_workspace/batch15-scrape.json", "utf8")).filter((r) => r.ok);
const prepared = [];
let catalogIndex = 264;

for (const row of scraped) {
  const copy = COPY[row.id];
  if (!copy) throw new Error("missing copy " + row.id);
  const modern = row.modern;
  const previewFace = modern[Math.floor((modern.length - 1) / 2)] || modern[0];
  const liveFamily = \`\${copy.slug.replace(/-/g, "")}-live\`;
  const dir = \`posts/\${DATE}-noonnu-font-\${copy.slug}\`;
  mkdirSync(\`\${dir}/attachments\`, { recursive: true });

  const maker = String(row.maker || "").replace(/[\\u0000-\\u001f]/g, "").replace(/^㈜/, "").trim();
  const license = extraNote(row.id, row);
  const weightNote = modern.length > 1 ? \` \${modern.length}가지 굵기를 제공한다.\` : "";
  const finalHtml = \`<p data-ke-size="size16">\${copy.intro}</p>

<style>
@font-face {
  font-family: '\${liveFamily}';
  src: url('\${previewFace.url}') format('woff');
  font-weight: normal;
  font-display: swap;
}
</style>
<div class="font-preview-card">
<p class="font-preview-text" style="font-family: '\${liveFamily}', sans-serif;">\${copy.preview}</p>
</div>

<h2>라이선스</h2>
<p data-ke-size="size16">\${cleanLicense(row.license)}</p>

\${tableHtml(row.table)}
\${NOTE_FOOTER}
\${license ? license + "\\n" : ""}
<h2>웹폰트 코드</h2>
<p data-ke-size="size16">웹폰트로 사용할 때 필요한 코드는 다음과 같다.\${weightNote}</p>
<pre><code class="language-css">\${codeBlocks(modern)}</code></pre>

<h2>다운로드</h2>
<p data-ke-size="size16">\${row.catalogName} 파일은 다음 페이지에서 받을 수 있다.</p>
<p data-ke-size="size16"><a href="\${DOWNLOAD[row.id]}" target="_blank" rel="noopener">\${row.catalogName} 다운로드 페이지 바로가기</a></p>
\`;

  if (/눈누/.test(finalHtml)) throw new Error("noonnu leaked in html " + row.id);
  writeFileSync(\`\${dir}/final.html\`, finalHtml, "utf8");

  const titleTail = copy.preview.replace(/입니다\\.$/, "");
  const metaMd = \`# 제목: \${row.catalogName} 무료 한글 웹폰트 — \${titleTail}

- 카테고리: Design > Font
- 태그: \${row.catalogName.replace(/\\s+/g, "")}, 무료폰트, 한글폰트, \${copy.category}, 웹폰트
- 메타디스크립션: \${maker}이 배포하는 무료 한글 폰트 \${row.catalogName}를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.
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
- 1차 출처: noonnu.cc \${row.catalogName} 페이지(font_page/\${row.id})
- 확인 시점: \${DATE}
- 직접 검증한 항목: 페이지 HTML에서 @font-face(woff), 라이선스 본문·요약표, 다운로드 링크를 실측 확인.
- 미검증 항목: 실제 파일 다운로드 절차까지는 수행하지 않음(링크 URL만 확인)
\`;
  writeFileSync(\`\${dir}/meta.md\`, metaMd, "utf8");

  const thumbHtml = \`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
@font-face {
  font-family: '\${liveFamily}';
  src: url('\${previewFace.url}') format('woff');
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
  font-family:'\${liveFamily}',sans-serif;
  font-size:70px;
  color:#ffffff;
}
.sub{
  font-family:'\${liveFamily}',sans-serif;
  font-size:28px;
  color:#a3a3a3;
  margin-top:24px;
}
</style>
</head>
<body>
<div class="name">\${row.catalogName}</div>
<div class="sub">\${titleTail}</div>
</body>
</html>
\`;
  writeFileSync(\`_workspace/noonnu-thumbs/thumb-\${row.id}-\${copy.slug}.html\`, thumbHtml, "utf8");

  prepared.push({
    catalogIndex: catalogIndex++,
    id: row.id,
    name: row.catalogName,
    postFolder: \`\${dir}/\`,
    registeredInTistory: false,
    slug: copy.slug,
    note: \`[배치15] final.html "눈누" 언급 없음. 1200x630 썸네일 검증 대기.\`,
  });
  console.log(row.id, row.catalogName);
}

writeFileSync("_workspace/batch15-prepared.json", JSON.stringify(prepared, null, 2));
console.log("generated", prepared.length);
`;

writeFileSync("_workspace/batch15-write.mjs", header);
console.log("wrote batch15-write.mjs", META.length);
