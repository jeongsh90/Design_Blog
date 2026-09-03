/**
 * dashboard-skin/skin.html → _workspace/sidebar_mockup-preview.html
 *
 * 티스토리 계정 없이 로컬(Playwright)에서 검증하기 위한 목업 생성기.
 *  - `<s_*>` 조건 블록 마커를 제거한다 (서버가 하는 일과 동일 — 마커만 사라지고 내용은 남는다)
 *  - `[##_..._##]` 치환자를 더미 값으로 바꾼다
 *  - `./images/...` (티스토리 업로드 경로)를 로컬 상대경로로 되돌린다
 *
 * 실행: bun dashboard-skin/tools/make-preview.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");

const SUBSTITUTIONS = {
  page_title: "홈",
  title: "다잇누",
  desc: "디자인 · 코드 · AI 아카이브",
  blogger: "daitnu",
  body_id: "tt-body-index",
  blog_link: "/",
  taglog_link: "/tag",
  guestbook_link: "/guestbook",
  count_today: "12",
  count_total: "1,024",
  revenue_list_upper: "",
  revenue_list_lower: "",
  article_rep_link: "/1",
  article_rep_title: "샘플 글 제목",
  article_rep_category: "Design",
  article_rep_simple_date: "2026.09.02",
  article_rep_date: "2026. 9. 2. 21:00",
  article_rep_summary: "본문 영역은 다음 구역(header / content)에서 구현합니다.",
  article_rep_desc: "본문 영역은 다음 구역(header / content)에서 구현합니다.",
  paging_rep_link: "#",
  paging_rep_link_num: "1",
};

let html = readFileSync(resolve(root, "dashboard-skin", "skin.html"), "utf8");

// 1) 티스토리 조건 블록 마커 제거 (내용은 유지)
html = html.replace(/<\/?s_[a-z_0-9]+>/g, "");

// 2) 치환자 → 더미 값
html = html.replace(/\[##_([a-z_0-9]+)_##\]/g, (whole, key) =>
  key in SUBSTITUTIONS ? SUBSTITUTIONS[key] : ""
);

// 3) 업로드 경로 → 로컬 경로
//    티스토리는 업로드한 파일을 전부 ./images/ 아래 평면으로 서빙하지만,
//    로컬 저장소에서는 컴포넌트 파일이 components/ 하위에 있다.
//    루트 절대경로를 쓴다 — /category/Design/Font 같은 깊은 URL에서도
//    같은 파일을 가리켜야 활성 표시 검증이 가능하다.
html = html
  .replace(
    /\.\/images\/((?:sidebar|header)\.(?:css|js))/g,
    "/dashboard-skin/components/$1"
  )
  .replace(/\.\/images\//g, "/dashboard-skin/");

// 4) 목업임을 표시
html = html.replace(
  "<head>",
  "<head>\n<!-- 자동 생성 파일 — 직접 수정하지 말 것. 원본: dashboard-skin/skin.html -->"
);

writeFileSync(
  resolve(root, "_workspace", "sidebar_mockup-preview.html"),
  html,
  "utf8"
);

// 5) FOUC 검증용 변형 — 지연 로드되는 sidebar.js를 통째로 뺀 사본.
//    <head> 인라인 힌트 + wrapper 직후 동기 스크립트만으로 접힘 상태가
//    첫 파싱에 확정되는지(폭 점프가 구조적으로 불가능한지) 확인하는 데 쓴다.
writeFileSync(
  resolve(root, "_workspace", "sidebar_mockup-nojs.html"),
  html.replace(/<script src="[^"]*sidebar\.js"><\/script>/, ""),
  "utf8"
);

console.log(
  "wrote _workspace/sidebar_mockup-preview.html, _workspace/sidebar_mockup-nojs.html"
);
