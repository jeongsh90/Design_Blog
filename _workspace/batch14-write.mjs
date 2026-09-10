import { mkdirSync, writeFileSync, readFileSync } from "fs";

const DATE = "2026-09-10";
const NOTE_FOOTER = `<p data-ke-size="size14">※ 위 표는 참고용으로 정리한 요약이다. 정확한 사용 범위는 저작권자에게 확인하는 것이 안전하다.</p>`;

const COPY = {
  468: { slug: "roh-hoechan", category: "손글씨체", preview: "따뜻한 손글씨로 남긴 추모 서체입니다.", intro: "노회찬체는 노회찬재단이 배포하는 무료 한글 폰트로, 고 노회찬 의원의 실제 손글씨를 바탕으로 만든 서체다. 담백하고 따뜻한 타이틀에 어울린다." },
  470: { slug: "wando-cleansea", category: "고딕체", preview: "다도해의 섬을 닮은 완도 본문용 서체입니다.", intro: "완도청정바다체는 완도군이 배포하는 전용 서체로, 다도해의 섬을 자소에 담은 본문용 고딕체다. 레귤러·볼드 두 굵기를 제공한다." },
  471: { slug: "wando-hope", category: "손글씨체", preview: "희망을 적어 내린 완도 제목용 서체입니다.", intro: "완도희망체는 완도군이 배포하는 전용 서체로, 제목용으로 다듬은 손글씨체다. 레귤러·볼드 두 굵기를 제공한다." },
  479: { slug: "hangul-jaemin", category: "손글씨체", preview: "또박또박 눌러 쓴 개인 손글씨체입니다.", intro: "한글재민체는 박재갑이 배포하는 무료 한글 폰트로, 또박또박 눌러 쓴 손글씨체다. 일기나 짧은 타이틀에 어울린다." },
  480: { slug: "wemakeprice", category: "고딕체", preview: "굴림과 꺾임이 섞인 쇼핑 브랜드 고딕체입니다.", intro: "위메프체는 위메프가 배포하는 무료 한글 폰트로, CI의 굴림과 꺾임을 살린 브랜드 고딕체다. 레귤러·세미볼드·볼드 세 굵기를 제공한다." },
  483: { slug: "yeongyang-dimibang", category: "고전체", preview: "음식디미방의 결을 담은 영양군 서체입니다.", intro: "영양군 음식디미방체는 영양군과 헤움디자인이 배포하는 전용 서체로, 고전 요리서 음식디미방의 결을 담은 고전체다." },
  484: { slug: "kotra-gothic", category: "고딕체", preview: "무역 안내문에 맞는 코트라 기본 고딕체입니다.", intro: "코트라 고딕체는 KOTRA가 배포하는 무료 한글 폰트로, 본문과 안내문에 두루 쓸 수 있는 산스 고딕체다." },
  485: { slug: "kotra-bold", category: "고딕체", preview: "곧고 굵은 코트라 제목용 고딕체입니다.", intro: "코트라 볼드체는 KOTRA가 배포하는 무료 한글 폰트로, 곧고 굵은 제목용 고딕체다. 헤드라인에 어울린다." },
  486: { slug: "kotra-hand", category: "손글씨체", preview: "펜으로 쓴 듯한 코트라 손글씨체입니다.", intro: "코트라 손글씨체는 KOTRA가 배포하는 무료 한글 폰트로, 펜으로 쓴 듯한 손글씨체다. 부드러운 캠페인 문구에 어울린다." },
  497: { slug: "jalpul-oneul", category: "손글씨체", preview: "오늘을 적어 둔 브랜드 손글씨체입니다.", intro: "잘풀리는오늘체는 잘풀리는집이 배포하는 무료 한글 폰트로, 일상 문구에 맞는 손글씨체다." },
  498: { slug: "jalpul-haru", category: "손글씨체", preview: "하루를 남겨 둔 브랜드 손글씨체입니다.", intro: "잘풀리는하루체는 잘풀리는집이 배포하는 무료 한글 폰트로, 오늘체와 짝을 이루는 손글씨체다." },
  499: { slug: "euljiro-10years", category: "고딕체", preview: "을지로의 세월을 담은 배달의민족 서체입니다.", intro: "을지로10년후체는 우아한형제들이 배포하는 무료 한글 폰트로, 을지로체 시리즈의 연장선에 있는 고딕체다." },
  500: { slug: "y-spotlight", category: "장식체", preview: "스포트라이트처럼 또렷한 KT 브랜드 서체입니다.", intro: "Y 너만을 비춤체는 KT가 배포하는 무료 한글 폰트로, 스포트라이트를 연상시키는 장식체다." },
  502: { slug: "eland-choice", category: "고딕체", preview: "라이트부터 볼드까지 나눈 이랜드 고딕체입니다.", intro: "이랜드 초이스체는 이랜드 리테일이 배포하는 무료 한글 폰트로, 라이트·미디엄·볼드 세 굵기를 제공하는 브랜드 고딕체다." },
  504: { slug: "eland-nice", category: "고딕체", preview: "단정한 인상의 이랜드 브랜드 고딕체입니다.", intro: "이랜드 나이스체는 이랜드 리테일이 배포하는 무료 한글 폰트로, 단정한 인상의 브랜드 고딕체다." },
  506: { slug: "solmoe-kimdaegun", category: "고전체", preview: "성인의 필치를 담은 기념 고전체입니다.", intro: "솔뫼 김대건체는 써밋디자인이 배포하는 무료 한글 폰트로, 김대건 신부의 정신을 담은 고전체다. 라이트·미디엄 두 굵기를 제공한다." },
  507: { slug: "sandoll-samlip-basic", category: "장식체", preview: "호빵처럼 통통한 삼립 브랜드 서체입니다.", intro: "산돌 삼립호빵체 Basic은 SPC삼립과 산돌이 배포하는 무료 한글 폰트로, 호빵의 통통한 조형을 살린 장식체다." },
  508: { slug: "sandoll-samlip-outline", category: "장식체", preview: "윤곽선으로 그린 삼립 호빵 서체입니다.", intro: "산돌 삼립호빵체 Outline은 SPC삼립과 산돌이 배포하는 무료 한글 폰트로, Basic의 윤곽선 버전이다." },
  510: { slug: "ainmom", category: "손글씨체", preview: "엄마가 남긴 듯한 나눔손글씨체입니다.", intro: "아인맘 손글씨는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 친근한 손글씨 타이틀에 어울린다." },
  511: { slug: "amsterdam", category: "손글씨체", preview: "여행 노트에 적은 듯한 손글씨체입니다.", intro: "암스테르담은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 여행·일기 문구에 어울린다." },
  512: { slug: "anssang", category: "손글씨체", preview: "힘주어 눌러 쓴 손글씨체입니다.", intro: "안쌍체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 짧은 강조 문구에 어울린다." },
  513: { slug: "baby-love", category: "손글씨체", preview: "아이를 위해 써 둔 손글씨체입니다.", intro: "아기사랑체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 육아·가족 콘텐츠에 어울린다." },
  514: { slug: "bareun-hipi", category: "손글씨체", preview: "힙한 필치의 바른 손글씨체입니다.", intro: "바른히피는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 캐주얼한 타이틀에 어울린다." },
  515: { slug: "bareun-mental", category: "손글씨체", preview: "단호하게 적어 내린 손글씨체입니다.", intro: "바른정신은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 다짐·슬로건 문구에 어울린다." },
  516: { slug: "bbangguni-mom", category: "손글씨체", preview: "빵집 메모처럼 따뜻한 손글씨체입니다.", intro: "빵구니맘 손글씨는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 일상 메모 감성에 어울린다." },
  517: { slug: "baekeumrye", category: "손글씨체", preview: "시장 장부의 결을 담은 손글씨체입니다.", intro: "야채장수 백금례는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 정겨운 안내 문구에 어울린다." },
  518: { slug: "become-one", category: "손글씨체", preview: "하나로 이어진 듯한 손글씨체입니다.", intro: "하나되어 손글씨는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 연대·캠페인 문구에 어울린다." },
  519: { slug: "beeunhye", category: "손글씨체", preview: "부드럽게 흘려 쓴 손글씨체입니다.", intro: "배은혜체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 편지글 같은 타이틀에 어울린다." },
  520: { slug: "bisang", category: "손글씨체", preview: "비상하듯 뻗어 올린 손글씨체입니다.", intro: "비상체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 힘 있는 짧은 제목에 어울린다." },
  521: { slug: "bud-tree", category: "손글씨체", preview: "버드나무처럼 흐르는 손글씨체입니다.", intro: "버드나무는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 잔잔한 본문 타이틀에 어울린다." },
  522: { slug: "bujangnim-nunchi", category: "손글씨체", preview: "사무실 메모처럼 재치 있는 손글씨체입니다.", intro: "부장님 눈치체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 유머러스한 캡션에 어울린다." },
  523: { slug: "bumsom", category: "손글씨체", preview: "솜처럼 가벼운 손글씨체입니다.", intro: "범솜체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 부드러운 일상 문구에 어울린다." },
  524: { slug: "choding-hope", category: "손글씨체", preview: "초등학생이 쓴 듯한 희망 손글씨체입니다.", intro: "초딩희망은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 밝고 솔직한 타이틀에 어울린다." },
  525: { slug: "chulpil-writing", category: "손글씨체", preview: "철필로 또박또박 쓴 손글씨체입니다.", intro: "철필글씨는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 노트·일기 감성에 어울린다." },
  526: { slug: "coco", category: "손글씨체", preview: "귀엽게 동글린 손글씨체입니다.", intro: "코코체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 귀여운 짧은 문구에 어울린다." },
  527: { slug: "cute-siu", category: "손글씨체", preview: "귀여운 필치의 손글씨체입니다.", intro: "시우 귀여워는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 발랄한 타이틀에 어울린다." },
  528: { slug: "dache-love", category: "손글씨체", preview: "다채로운 사랑을 적은 손글씨체입니다.", intro: "다채사랑은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 다정한 캠페인 문구에 어울린다." },
  529: { slug: "daheng", category: "손글씨체", preview: "다행이라는 말을 남긴 손글씨체입니다.", intro: "다행체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 위로가 필요한 짧은 문장에 어울린다." },
  530: { slug: "dajin", category: "손글씨체", preview: "다져 쓴 듯 또렷한 손글씨체입니다.", intro: "다진체는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 또렷한 손글씨 제목에 어울린다." },
  531: { slug: "daughter-handwriting", category: "손글씨체", preview: "딸이 쓴 듯한 손글씨체입니다.", intro: "우리딸 손글씨는 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 가족·육아 콘텐츠에 어울린다." },
  532: { slug: "ddakdandan", category: "손글씨체", preview: "딱 단단하게 눌러 쓴 손글씨체입니다.", intro: "따악단단은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 힘 있는 짧은 강조에 어울린다." },
  533: { slug: "ddobakddobak", category: "손글씨체", preview: "또박또박 맞춰 쓴 손글씨체입니다.", intro: "또박또박은 네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열 폰트다. 또렷한 손글씨 본문 타이틀에 어울린다." },
};

const DOWNLOAD = {
  468: "https://hcroh.org/",
  470: "http://www.wando.go.kr/wando/sub.cs?m=655",
  471: "http://www.wando.go.kr/wando/sub.cs?m=655",
  479: "https://www.sandollcloud.com/free-font/",
  480: "http://company.wemakeprice.com/wmp/brand",
  483: "https://www.yeongyang.go.kr/",
  484: "https://www.kotra.or.kr/subList/20000005965?tabid=20",
  485: "https://www.kotra.or.kr/subList/20000005965?tabid=20",
  486: "https://www.kotra.or.kr/subList/20000005965?tabid=20",
  497: "https://www.jalpul.com/",
  498: "https://www.jalpul.com/",
  499: "https://font.woowahan.com/",
  500: "https://www.kt.com/",
  502: "https://www.elandretail.com/",
  504: "https://www.elandretail.com/",
  506: "https://www.summitdesign.co.kr/",
  507: "https://www.sandollcloud.com/free-font/",
  508: "https://www.sandollcloud.com/free-font/",
  510: "https://clova.ai/handwriting/list.html",
  511: "https://clova.ai/handwriting/list.html",
  512: "https://clova.ai/handwriting/list.html",
  513: "https://clova.ai/handwriting/list.html",
  514: "https://clova.ai/handwriting/list.html",
  515: "https://clova.ai/handwriting/list.html",
  516: "https://clova.ai/handwriting/list.html",
  517: "https://clova.ai/handwriting/list.html",
  518: "https://clova.ai/handwriting/list.html",
  519: "https://clova.ai/handwriting/list.html",
  520: "https://clova.ai/handwriting/list.html",
  521: "https://clova.ai/handwriting/list.html",
  522: "https://clova.ai/handwriting/list.html",
  523: "https://clova.ai/handwriting/list.html",
  524: "https://clova.ai/handwriting/list.html",
  525: "https://clova.ai/handwriting/list.html",
  526: "https://clova.ai/handwriting/list.html",
  527: "https://clova.ai/handwriting/list.html",
  528: "https://clova.ai/handwriting/list.html",
  529: "https://clova.ai/handwriting/list.html",
  530: "https://clova.ai/handwriting/list.html",
  531: "https://clova.ai/handwriting/list.html",
  532: "https://clova.ai/handwriting/list.html",
  533: "https://clova.ai/handwriting/list.html",
};

function cleanLicense(raw) {
  let t = raw || "";
  const i = t.indexOf("라이선스 본문");
  if (i >= 0) t = t.slice(i + "라이선스 본문".length);
  t = t.replace(/\*눈누 안내사항[^.]*\./g, "다운로드 시 별도 안내를 확인하는 것이 좋다.");
  t = t.replace(/눈누/g, "");
  t = t.replace(/^[-\s]+/, "");
  t = t.replace(/\s+/g, " ").trim();
  t = t
    .replace(/입니다/g, "이다")
    .replace(/합니다/g, "한다")
    .replace(/됩니다/g, "된다")
    .replace(/있습니다/g, "있다");
  if (t.length > 900) t = t.slice(0, 900).replace(/\s+\S*$/, "") + ".";
  return t;
}

function extraNote(id, row) {
  const bits = [];
  if ([470, 471].includes(id)) {
    bits.push("완도청정바다체와 완도희망체는 완도군 전용서체로 라이선스 본문 구조가 같다.");
  }
  if ([484, 485, 486].includes(id)) {
    bits.push("코트라 고딕체·볼드체·손글씨체는 KOTRA 홈페이지를 통해서만 배포하도록 안내돼 있다.");
  }
  if ([497, 498].includes(id)) {
    bits.push("잘풀리는오늘체와 잘풀리는하루체는 같은 제작사의 자매 서체다.");
  }
  if ([502, 504].includes(id)) {
    bits.push("이랜드 초이스체와 나이스체는 이랜드 리테일 브랜드 서체다.");
  }
  if ([507, 508].includes(id)) {
    bits.push("산돌 삼립호빵체 Basic과 Outline은 같은 시리즈의 다른 스타일이다.");
  }
  if (id >= 510 && id <= 533) {
    bits.push("네이버 클로바 손글씨 공모전으로 배포된 나눔손글씨 계열이다. 폰트 파일 자체의 유상 판매·배포는 금지된다.");
  }
  if ([480, 500].includes(id)) {
    bits.push("요약표에서 BI/CI 사용이 금지로 표기돼 있다.");
  }
  const embed = (row.table || []).find((r) => r[0] === "임베딩");
  if (embed && /조건부/.test(embed.join(" "))) {
    bits.push("요약표에서 임베딩이 조건부 허용으로 표기돼 있다. 서버에 폰트를 올려 쓰는 웹폰트 적용 전에는 저작권자에게 범위를 확인하는 것이 안전하다.");
  }
  if (!bits.length) return "";
  return bits.map((b) => `<p data-ke-size="size14">※ 참고: ${b}</p>`).join("\n");
}

function tableHtml(rows) {
  const body = (rows || [])
    .filter((r) => r.length >= 2 && r[0] !== "카테고리")
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
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
}`
    )
    .join("\n\n");
}

const scraped = JSON.parse(readFileSync("_workspace/batch14-scrape.json", "utf8")).filter((r) => r.ok);
const prepared = [];
let catalogIndex = 222;

for (const row of scraped) {
  const copy = COPY[row.id];
  if (!copy) throw new Error("missing copy " + row.id);
  const modern = row.modern;
  const previewFace = modern[Math.floor((modern.length - 1) / 2)] || modern[0];
  const liveFamily = `${copy.slug.replace(/-/g, "")}-live`;
  const dir = `posts/${DATE}-noonnu-font-${copy.slug}`;
  mkdirSync(`${dir}/attachments`, { recursive: true });

  const maker = String(row.maker || "").replace(/[\u0000-\u001f]/g, "").replace(/^㈜/, "").trim();
  const license = extraNote(row.id, row);
  const weightNote = modern.length > 1 ? ` ${modern.length}가지 굵기를 제공한다.` : "";
  const finalHtml = `<p data-ke-size="size16">${copy.intro}</p>

<style>
@font-face {
  font-family: '${liveFamily}';
  src: url('${previewFace.url}') format('woff');
  font-weight: normal;
  font-display: swap;
}
</style>
<div class="font-preview-card">
<p class="font-preview-text" style="font-family: '${liveFamily}', sans-serif;">${copy.preview}</p>
</div>

<h2>라이선스</h2>
<p data-ke-size="size16">${cleanLicense(row.license)}</p>

${tableHtml(row.table)}
${NOTE_FOOTER}
${license ? license + "\n" : ""}
<h2>웹폰트 코드</h2>
<p data-ke-size="size16">웹폰트로 사용할 때 필요한 코드는 다음과 같다.${weightNote}</p>
<pre><code class="language-css">${codeBlocks(modern)}</code></pre>

<h2>다운로드</h2>
<p data-ke-size="size16">${row.catalogName} 파일은 다음 페이지에서 받을 수 있다.</p>
<p data-ke-size="size16"><a href="${DOWNLOAD[row.id]}" target="_blank" rel="noopener">${row.catalogName} 다운로드 페이지 바로가기</a></p>
`;

  if (/눈누/.test(finalHtml)) throw new Error("noonnu leaked in html " + row.id);
  writeFileSync(`${dir}/final.html`, finalHtml, "utf8");

  const titleTail = copy.preview.replace(/입니다\.$/, "");
  const metaMd = `# 제목: ${row.catalogName} 무료 한글 웹폰트 — ${titleTail}

- 카테고리: Design > Font
- 태그: ${row.catalogName.replace(/\s+/g, "")}, 무료폰트, 한글폰트, ${copy.category}, 웹폰트
- 메타디스크립션: ${maker}이 배포하는 무료 한글 폰트 ${row.catalogName}를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.
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
- 1차 출처: noonnu.cc ${row.catalogName} 페이지(font_page/${row.id})
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
  font-size:70px;
  color:#ffffff;
}
.sub{
  font-family:'${liveFamily}',sans-serif;
  font-size:28px;
  color:#a3a3a3;
  margin-top:24px;
}
</style>
</head>
<body>
<div class="name">${row.catalogName}</div>
<div class="sub">${titleTail}</div>
</body>
</html>
`;
  writeFileSync(`_workspace/noonnu-thumbs/thumb-${row.id}-${copy.slug}.html`, thumbHtml, "utf8");

  prepared.push({
    catalogIndex: catalogIndex++,
    id: row.id,
    name: row.catalogName,
    postFolder: `${dir}/`,
    registeredInTistory: false,
    slug: copy.slug,
    note: `[배치14] ${maker}. woff ${modern.length}개. final.html \"눈누\" 언급 없음.`,
  });
}

writeFileSync("_workspace/batch14-prepared.json", JSON.stringify(prepared, null, 2));
console.log("generated", prepared.length);
console.log(prepared.map((p) => p.id + " " + p.name).join("\n"));
