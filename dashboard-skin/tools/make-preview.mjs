/**
 * dashboard-skin/skin.html → _workspace/sidebar_mockup-preview.html
 *
 * 티스토리 계정 없이 로컬(Playwright)에서 검증하기 위한 목업 생성기.
 *  - `<s_..._rep>` 반복 블록을 항목별 더미 값으로 N번 확장한다 (RIGHT-WIDGETS SPEC §7)
 *  - 남은 `<s_*>` 조건 블록 마커를 제거한다 (서버가 하는 일과 동일 — 마커만 사라지고 내용은 남는다)
 *  - 남은 `[##_..._##]` 치환자를 전역 더미 값으로 바꾼다
 *  - `./images/...` (티스토리 업로드 경로)를 로컬 상대경로로 되돌린다
 *
 * 출력 5종:
 *  - _workspace/sidebar_mockup-preview.html      전체 프리뷰 (이름은 낡았지만 경로 호환을 위해 유지)
 *                                                 = 인덱스 페이지 / 글 7개 / 페이지 5개
 *  - _workspace/sidebar_mockup-nojs.html         FOUC 검증용 (sidebar.js 제거 사본)
 *  - _workspace/right-widgets_mockup-empty.html  위젯 0건 폴백 검증용 (RIGHT-WIDGETS SPEC §7-3)
 *  - _workspace/content_mockup-empty.html        글 0개 → <s_list_empty> 검증용 (CONTENT SPEC §7)
 *  - _workspace/content_mockup-permalink.html    단일 글 모드 검증용 (CONTENT SPEC §9 / PROSE SPEC §8)
 *  - _workspace/content_mockup-permalink-nojs.html  표 래퍼 CSS 폴백 검증용 (PROSE SPEC §7-2 15번)
 *
 * [2026-09-04 CONTENT SPEC §14-1] ★ index / permalink를 **반드시 따로** 출력해야 한다.
 *   이 생성기는 원래 `<s_*>` 마커만 벗기는 방식이라, 그대로 두면
 *   `<s_index_article_rep>`와 `<s_permalink_article_rep>`가 **동시에** 렌더돼
 *   content.css의 `:has([data-slot="post-single"])` 분기가 항상 permalink로
 *   판정된다(= 인덱스에서 격자 배경이 사라진다). 실사이트에서는 서버가 둘 중
 *   하나만 내려주므로, 목업도 그 동작을 흉내내야 검증이 의미를 갖는다.
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
  article_rep_category_link: "/category/Design",
  article_rep_simple_date: "2026.09.02",
  article_rep_date: "2026. 9. 2. 21:00",
  article_rep_summary: "본문 영역은 다음 구역에서 구현합니다.",
  article_rep_desc: "본문 영역은 다음 구역에서 구현합니다.",
  /* [CONTENT SPEC §0-2-c] ★ 이 세 치환자는 href 값이 아니라 **href="…" 속성
     전체**를 내려준다(공식 예제가 `<a [##_prev_page_##]>`로 쓴다). 목업도
     반드시 같은 형태여야 skin.html의 교정된 마크업을 실제로 검증할 수 있다. */
  prev_page: 'href="/"',
  next_page: 'href="/?page=2"',
  /* 더 이상 이전/다음이 없을 때 서버가 넣어주는 클래스명. 1페이지 상태를
     재현하려고 prev만 비활성으로 둔다(next는 빈 문자열 = 활성). */
  no_more_prev: "no_more_prev",
  no_more_next: "",
  paging_rep_link: 'href="/"',
  paging_rep_link_num: "1",

  /* ── [FOOTER SPEC §10] 글 상세 하단 4종 ──────────────────────────── */
  article_rep_rp_cnt: "3",
  article_rep_rp_link: "return false;",

  /* 관리 기능 — 실사이트에서는 <s_ad_div>가 관리자에게만 렌더된다.
     목업에서는 마커가 벗겨져 항상 보인다(레이아웃 확인용). */
  s_ad_m_link: "/manage/post/301",
  s_ad_m_onclick: "return false;",
  s_ad_s1_label: "공개",
  s_ad_s2_label: "비공개로",
  s_ad_s2_onclick: "return false;",
  s_ad_t_onclick: "return false;",
  s_ad_d_onclick: "return false;",

  /* ★ [##_rp_input_*_##]는 href가 아니라 name 속성의 "값"이다(§0-3).
     실사이트에서 서버가 내려주는 실제 필드명 대신 그럴듯한 값을 둔다. */
  rp_input_name: "name",
  rp_input_password: "password",
  rp_input_homepage: "homepage",
  rp_input_is_secret: "secret",
  rp_input_comment: "comment",
  rp_onclick_submit: "return false;",
  guest_name: "",
  guest_homepage: "",
  rp_admin_check: "",

  /* ★ [##_tag_label_rep_##]는 반복 블록이 아니라 태그 링크 묶음 전체를
     통째로 내려주는 단일 치환자다(§0-2). 서버 출력 형태가 문서에 없어
     "쉼표로 구분된 앵커 나열"로 추정하고 그대로 재현한다 —
     initPostTags()가 이 쉼표 텍스트 노드를 실제로 걷어내는지 보는 것이
     이 목업의 핵심 검증 포인트다. */
  tag_label_rep:
    '<a href="/tag/Pretendard">Pretendard</a>, ' +
    '<a href="/tag/shadcn">shadcn</a>, ' +
    '<a href="/tag/%ED%83%80%EC%9D%B4%ED%8F%AC%EA%B7%B8%EB%9E%98%ED%94%BC">타이포그래피</a>, ' +
    '<a href="/tag/Tailwind">Tailwind</a>, ' +
    '<a href="/tag/%EC%8A%A4%ED%82%A8">스킨</a>',
};

/* ── [RIGHT-WIDGETS SPEC §7] 우측 위젯 반복 블록 확장 ────────────────
   실사이트에서는 티스토리 서버가 관리자 설정 개수만큼 이 블록을 반복해
   내려준다. skin.html에는 항목 1개짜리 템플릿만 있으므로, 로컬에서
   "5개까지" 요구를 눈으로 검증하려면 생성기가 대신 반복해야 한다.
   외부 URL 금지 — 오프라인에서도 그대로 렌더돼야 한다. */
const THUMB =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">' +
      '<rect width="96" height="96" fill="#d4d4d4"/></svg>'
  );

/* ── [PROSE SPEC §8] 단일 글 본문 목업 ─────────────────────────────
   실사이트에서 [##_article_rep_desc_##]는 티스토리 에디터가 만든 임의
   리치 HTML을 통째로 내려준다. 로컬에서 프로즈 타이포그래피를 눈으로
   확인할 방법이 없었으므로(이전엔 문자열 한 줄), 스타일링 대상 요소가
   전부 최소 한 번씩 등장하는 샘플을 여기서 만든다.
   외부 URL 금지 — 오프라인에서도 그대로 렌더돼야 한다. */
const PROSE_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">' +
      '<rect width="1200" height="675" fill="#d4d4d4"/>' +
      '<rect x="72" y="72" width="1056" height="531" fill="#a3a3a3"/></svg>'
  );

const HLJS_CLASS = {
  punct: "hljs-punctuation",
  key: "hljs-attr",
  str: "hljs-string",
  bool: "hljs-literal",
};
const tk = (kind, text) => `<span class="${HLJS_CLASS[kind]}">${text}</span>`;
const codeLine = (inner, highlighted = false) =>
  `<span data-line${highlighted ? " data-highlighted-line" : ""}>${inner}</span>`;

const CODE_JSON_SAMPLE = [
  `<pre data-filename="components.json" data-highlight="7"><code data-line-numbers>`,
  codeLine(tk("punct", "{")),
  codeLine(
    `  ${tk("key", '"$schema"')}${tk("punct", ":")} ${tk("str", '"https://ui.shadcn.com/schema.json"')}${tk("punct", ",")}`
  ),
  codeLine(`  ${tk("key", '"style"')}${tk("punct", ":")} ${tk("str", '"new-york"')}${tk("punct", ",")}`),
  codeLine(`  ${tk("key", '"tailwind"')}${tk("punct", ": {")}`),
  codeLine(`    ${tk("key", '"css"')}${tk("punct", ":")} ${tk("str", '"src/app/globals.css"')}${tk("punct", ",")}`),
  codeLine(`    ${tk("key", '"baseColor"')}${tk("punct", ":")} ${tk("str", '"neutral"')}${tk("punct", ",")}`),
  codeLine(`    ${tk("key", '"cssVariables"')}${tk("punct", ":")} ${tk("bool", "true")}`, true),
  codeLine(`  ${tk("punct", "},")}`),
  codeLine(
    `  ${tk("key", '"aliases"')}${tk("punct", ": {")} ${tk("key", '"components"')}${tk("punct", ":")} ${tk("str", '"@/components"')}${tk("punct", ",")} ${tk("key", '"utils"')}${tk("punct", ":")} ${tk("str", '"@/lib/utils"')} ${tk("punct", "}")}`
  ),
  codeLine(tk("punct", "}")),
  `</code></pre>`,
].join("");

const PROSE_SAMPLE = [
  `<p>이 글은 본문 프로즈 타이포그래피를 실제로 확인하기 위한 목업이다. 한 문장 안에 <strong>굵게</strong>와 <em>기울임</em>, 그리고 <a href="/301">본문 링크</a>를 함께 섞어 각 요소가 서로를 밀어내지 않는지 본다.</p>`,
  `<p>두 번째 문단은 문단 사이 여백(16px)이 실제로 적용되는지 확인한다. 한글 본문은 <code>word-break: keep-all</code>로 어절 단위 줄바꿈이 유지되어야 하고, 문장 중간의 인라인 코드가 행간을 밀어 올리지 않아야 한다. 아주 긴 주소(https://daitnu.tistory.com/manage/design/skin/edit#/source/file)도 본문 폭을 넘기지 않고 끊겨야 한다.</p>`,

  `<h2>h2 — 섹션 제목</h2>`,
  `<p>h2 바로 아래 문단은 제목에 붙어(12px) 한 덩어리로 읽혀야 한다. 제목 위 여백은 48px이다.</p>`,

  `<h3>h3 — 하위 절 제목</h3>`,
  `<p>제목 계층은 크기와 자간으로만 구분되고 굵기는 h2~h6 전부 600으로 통일돼 있다.</p>`,

  `<h4>h4 — 문단 제목</h4>`,
  `<p>h4는 본문과 같은 16px이지만 굵기로 구분된다.</p>`,

  `<h5>h5 — 더 낮은 단계</h5>`,
  `<h6>h6 — 가장 낮은 단계(흐린 색으로만 구분된다)</h6>`,
  `<p>h5와 h6는 크기가 같고 색이 다르다.</p>`,

  `<blockquote><p>인용문은 좌측 세로선과 들여쓰기로 구분한다. Pretendard에는 이탤릭 자족이 없어 문단 단위 합성 기울임을 쓰지 않는다 — 인라인 강조에만 이탤릭을 남겼다.</p></blockquote>`,

  `<h3>목록</h3>`,
  `<ul>`,
  `<li>순서 없는 목록의 첫 항목</li>`,
  `<li>두 번째 항목 — 아래에 중첩 목록이 붙는다`,
  `<ul><li>중첩되면 마커가 circle로 바뀐다</li><li>중첩 항목 사이 간격은 8px</li></ul>`,
  `</li>`,
  `<li>세 번째 항목</li>`,
  `</ul>`,
  `<ol>`,
  `<li>순서 있는 목록</li>`,
  `<li>두 번째<ol><li>중첩은 lower-alpha</li><li>두 번째 중첩</li></ol></li>`,
  `<li>세 번째</li>`,
  `</ol>`,

  `<h3>코드 블록</h3>`,
  `<p>아래 블록에는 본문 폭(720px)보다 훨씬 긴 줄이 하나 들어 있다 — 그 줄이 본문을 밀지 않고 <code>pre</code> 안에서만 가로로 스크롤되어야 한다.</p>`,
  `<pre><code>/* 코드에는 한글 줄바꿈 규칙(keep-all)과 한글 자간(-0.01em)을 적용하지 않는다 */
const spec = { area: "post-single-body", tokens: ["--text-base", "--leading-relaxed", "--tracking-base"] };
document.querySelector('[data-slot="post-single-body"]').querySelectorAll("table").forEach((table) =&gt; wrapWith(table, "prose-table-wrap")); // 이 줄은 가로 스크롤을 발생시키려고 의도적으로 아주 길게 작성한 것이다
</code></pre>`,

  `<p>아래는 파일명·언어·하이라이트 행 메타를 모두 갖춘 사전 강조 샘플이다 — CDN이 없는 로컬에서도 색과 7번 줄 하이라이트를 그대로 확인할 수 있다.</p>`,
  CODE_JSON_SAMPLE,

  `<p>아래는 언어만 지정된 평범한 블록이다. 첫 줄의 <code>// filename:</code> 지시자가 헤더 파일명이 되고, highlight.js CDN에 닿으면 색이 뒤늦게 얹힌다.</p>`,
  `<pre class="language-js" data-highlight="3"><code>// filename: content.js
function initCodeBlocks() {
  var body = document.querySelector('[data-slot="post-single-body"]');
  if (!body) return;

  Array.prototype.forEach.call(body.querySelectorAll("pre"), toCodeBlock);
}
</code></pre>`,

  `<h3>이미지</h3>`,
  `<figure>`,
  `<img src="${PROSE_IMAGE}" alt="샘플 이미지" />`,
  `<figcaption>figcaption — 캡션은 가운데 정렬 + 흐린 색이며 이미지에 8px 붙는다</figcaption>`,
  `</figure>`,
  `<p>아래는 캡션 없는 단독 이미지(원본 96px)다. 본문 폭에 맞춰 <em>늘어나면 안 되고</em>, 가운데 정렬되어야 한다.</p>`,
  `<img src="${THUMB}" alt="작은 이미지" />`,

  `<h3>표</h3>`,
  `<table>`,
  `<thead><tr><th>토큰</th><th>값</th><th>적용 요소</th><th>실측 출처</th><th>비고</th></tr></thead>`,
  `<tbody>`,
  `<tr><td>--text-xl</td><td>1.25rem</td><td>h1 · h2</td><td>Design-system globals.css 379행</td><td>본문 헤딩 스케일 최상단</td></tr>`,
  `<tr><td>--tracking-xl</td><td>-0.012em</td><td>h1 · h2</td><td>Design-system globals.css 417행</td><td>한글 전용 자간 스케일</td></tr>`,
  `<tr><td>--font-mono</td><td>ui-monospace, …</td><td>code · pre</td><td>Design-system extra.css 787행</td><td>reset.css의 Pretendard 별칭은 쓰지 않는다</td></tr>`,
  `<tr><td>--color-link</td><td>#1447e6 / #8ec5ff</td><td>a</td><td>dashboard-skin src/input.css 32 · 63행</td><td>라이트 / 다크</td></tr>`,
  `<tr><td>--content-divider</td><td>foreground 16% 혼합</td><td>blockquote · hr</td><td>dashboard-skin content.css 16행</td><td>content-inner에서 상속</td></tr>`,
  `</tbody>`,
  `</table>`,

  `<hr />`,
  `<p>hr 위아래 여백은 40px로 대칭이다. 이 문단이 본문의 마지막이며, 아래로는 다음 구역(TOC · 댓글)이 들어올 자리가 남는다.</p>`,
].join("\n");

/* SUBSTITUTIONS(34행)는 THUMB보다 위에 있어 객체 리터럴 안에서 위 상수들을
   참조할 수 없다. 파일 순서를 재배치하지 않는 최소 변경으로 여기서 덮어쓴다.
   (54행의 문자열 더미는 그대로 두되 이 대입이 이긴다. 53행
   article_rep_summary는 목록 화면 더미이므로 건드리지 않는다.) */
SUBSTITUTIONS.article_rep_desc = PROSE_SAMPLE;
SUBSTITUTIONS.article_rep_thumbnail_url = PROSE_IMAGE;

/* ── [PREVNEXT] 이전 글 / 다음 글 ──────────────────────────────────────
   <s_article_prev>/<s_article_next>는 각각 독립된 0/1 조건 그룹이라
   (반복 블록이 아님) REPEATS 배열이 아니라 여기 단순 대입으로 채운다 —
   s_ad_div/s_tag_label과 같은 부류. 목업은 둘 다 존재하는(가장 흔한)
   상태를 재현한다 — 한쪽만 있는/둘 다 없는 경우는 Playwright로
   DOM에서 직접 지워보고 검증한다(§Q 참고). */
SUBSTITUTIONS.article_prev_type = "article";
SUBSTITUTIONS.article_prev_link = "/300";
SUBSTITUTIONS.article_prev_title = "shadcn/ui를 처음 쓸 때 헷갈리는 것들";
SUBSTITUTIONS.article_prev_date = "2026.09.01";
SUBSTITUTIONS.article_prev_thumbnail_link = THUMB;

SUBSTITUTIONS.article_next_type = "article";
SUBSTITUTIONS.article_next_link = "/302";
SUBSTITUTIONS.article_next_title = "shadcn/ui 사이드바를 바닐라 CSS로 1:1 포팅하기";
SUBSTITUTIONS.article_next_date = "2026.09.02";
SUBSTITUTIONS.article_next_thumbnail_link = THUMB;

/* ── [FOOTER SPEC §10] 글 상세 하단 목업 ──────────────────────────────
   외부 URL 금지 — 오프라인에서도 그대로 렌더돼야 한다. */
const AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">' +
      '<rect width="64" height="64" fill="#a3a3a3"/>' +
      '<circle cx="32" cy="25" r="11" fill="#f5f5f5"/>' +
      '<path d="M10 64c0-13 10-21 22-21s22 8 22 21z" fill="#f5f5f5"/></svg>'
  );

/* ★ 배열 순서가 결정적이다 — s_rp2_rep가 반드시 s_rp_rep보다 먼저.
   대댓글은 부모와 치환자 이름이 완전히 같아서(rp_rep_*), 부모를 먼저
   확장하면 부모 값이 대댓글 템플릿까지 채워버린다(§10-1). */
const PERMALINK_REPEATS = [
  {
    tag: "s_rp2_rep",
    count: 1,
    item: () => ({
      rp_rep_id: "comment_reply_1",
      rp_rep_class: "reply",
      rp_rep_logo: `<img data-slot="avatar-image" src="${AVATAR}" alt="" loading="lazy" />`,
      rp_rep_name: "다잇누",
      rp_rep_date: "2026.09.04 11:20",
      rp_rep_link: "#comment_reply_1",
      rp_rep_desc: "감사합니다! 자간 값은 Design-system globals.css 416~417행 기준으로 맞췄어요.",
      rp_rep_onclick_delete: "return false;",
      rp_rep_onclick_reply: "return false;",
    }),
  },
  {
    tag: "s_rp_rep",
    count: 3,
    /* 두 번째 댓글에만 대댓글이 달린 상태 — 나머지 복사본에서는
       <s_rp2_container> 블록이 통째로 제거된다. */
    conditional: { tag: "s_rp2_container", when: (i) => i === 1 },
    item: (i) => ({
      rp_rep_id: `comment_${i + 1}`,
      rp_rep_class: ["guest", "guest", "guest"][i],
      /* [FOOTER SPEC §9-2 / Q10] 세 번째 댓글은 일부러 <img>가 아니라
         URL 문자열을 내려준다 — initCommentAvatars()의 승격 방어가
         실제로 동작하는지 보는 유일한 케이스다.
         두 번째는 아예 비워 fallback 아이콘을 확인한다. */
      rp_rep_logo: [
        `<img data-slot="avatar-image" src="${AVATAR}" alt="" loading="lazy" />`,
        "",
        AVATAR,
      ][i],
      rp_rep_name: ["김디자", "지나가던 개발자", "publisher"][i],
      rp_rep_date: [
        "2026.09.04 10:41",
        "2026.09.04 11:02",
        "2026.09.04 13:57",
      ][i],
      rp_rep_link: `#comment_${i + 1}`,
      rp_rep_desc: [
        "자간 값 참고해서 저도 적용해봤습니다. 한글 본문에서 −0.01em이 확실히 낫네요.",
        "shadcn 사이드바를 바닐라로 옮기는 부분이 특히 좋았습니다. 혹시 <a href=\"/1\">이 글</a>에서 쓰신 토큰 목록도 공개하실 계획이 있으신가요? 링크가 댓글 안에서도 제대로 파랗게 보이는지 확인하려고 일부러 길게 씁니다.",
        "비밀댓글입니다.",
      ][i],
      rp_rep_onclick_delete: "return false;",
      rp_rep_onclick_reply: "return false;",
    }),
  },
  {
    tag: "s_article_related_rep",
    count: 5,
    /* 썸네일 블록은 마크업에 아예 넣지 않기로 했으므로(§5-1) 조건부 없음.
       만약 developer가 썸네일을 살리기로 바꾼다면 여기에
       conditional: { tag: "s_article_related_rep_thumbnail", when: (i) => i % 2 === 0 }
       를 추가해야 한다. */
    item: (i) => ({
      article_related_rep_link: `/${401 + i}`,
      article_related_rep_type: i % 2 === 0 ? "thumbnail" : "text",
      article_related_rep_title: [
        "shadcn/ui 사이드바를 바닐라 CSS로 1:1 포팅하기",
        "티스토리 스킨에서 Tailwind v4를 쓰는 법 — 빌드 서버가 없는 환경에서 정적 CSS 파이프라인을 세운 아주 긴 제목의 기록",
        "Figma 변수(Variables)로 다크모드 만들기",
        "무료 상업용 한글 폰트 30종 총정리",
        "로고 파일 형식(AI·SVG·PNG) 언제 뭘 쓰나",
      ][i],
      article_related_rep_date: `2026.08.${String(21 + i)}`,
      article_related_rep_thumbnail_link: THUMB,
    }),
  },
];

const REPEATS = [
  {
    tag: "s_rct_notice_rep",
    count: 3, // 공지는 5개까지 갈 일이 드물다 — 실제 상황 재현
    item: (i) => ({
      notice_rep_link: `/notice/${i + 1}`,
      notice_rep_title: [
        "블로그 운영 원칙과 자료 이용 안내",
        "댓글·방명록 이용 안내",
        "폰트 라이선스 관련 공지",
      ][i],
    }),
  },
  {
    tag: "s_rctps_rep",
    count: 5,
    // 썸네일 있는 항목/없는 항목이 반드시 섞이게 한다 (SPEC §5-1 정렬 검증용)
    conditional: { tag: "s_rctps_rep_thumbnail", when: (i) => i % 2 === 0 },
    item: (i) => ({
      rctps_rep_link: `/${101 + i}`,
      rctps_rep_title: [
        "Pretendard 자간·행간을 실제로 어디까지 좁혀야 하나",
        "shadcn/ui 사이드바를 바닐라 CSS로 1:1 포팅하기",
        "로고 리디자인 전후 비교",
        "티스토리 스킨에서 Tailwind v4를 쓰는 법",
        "AI 프롬프트 아카이브를 시작하며",
      ][i],
      rctps_rep_category: ["Design", "Design", "Design", "Ai", "Ai"][i],
      rctps_rep_category_link: "/category/Design",
      rctps_rep_simple_date: `2026.09.0${i + 1}`,
      rctps_rep_date: `2026.09.0${i + 1} 21:0${i}`,
      rctps_rep_rp_cnt: String([3, 0, 12, 5, 1][i]),
      rctps_rep_thumbnail: THUMB,
    }),
  },
  {
    tag: "s_rctps_popular_rep",
    // 치환자 키가 최근 글과 동일한 rctps_rep_*다(서버 동작 그대로).
    // 블록 단위로 확장하므로 서로 간섭하지 않는다 — 대신 제목/카테고리를
    // 반드시 다르게 줘야 SPEC §5-4의 시각 구분 검증이 의미를 갖는다.
    count: 5,
    conditional: { tag: "s_rctps_rep_thumbnail", when: () => false }, // 인기글은 썸네일 미사용
    item: (i) => ({
      rctps_rep_link: `/${201 + i}`,
      rctps_rep_title: [
        "무료 상업용 한글 폰트 30종 총정리",
        "Figma 변수(Variables)로 다크모드 만들기",
        "shadcn/ui를 처음 쓸 때 헷갈리는 것들",
        "로고 파일 형식(AI·SVG·PNG) 언제 뭘 쓰나",
        "프롬프트를 재사용 가능한 스킬로 만드는 법",
      ][i],
      rctps_rep_category: ["Design", "Design", "Ai", "Design", "Ai"][i],
      rctps_rep_category_link: "/category/Design",
      rctps_rep_simple_date: `2026.08.1${i + 1}`,
      rctps_rep_date: `2026.08.1${i + 1} 09:0${i}`,
      rctps_rep_rp_cnt: String([42, 31, 27, 18, 9][i]),
      rctps_rep_thumbnail: THUMB,
    }),
  },
  {
    tag: "s_random_tags",
    count: 12, // 태그는 실제로 여러 줄로 wrap 되는 모습을 봐야 한다
    item: (i) => ({
      tag_name: [
        "Pretendard", "shadcn", "Tailwind", "타이포그래피",
        "로고", "Figma", "프롬프트", "스킨",
        "CSS", "다크모드", "아카이브", "디자인시스템",
      ][i],
      tag_link: `/tag/${i}`,
      // cloud1~5가 전부 등장하도록 (서버는 빈도 기반으로 매긴다)
      tag_class: `cloud${[5, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 1][i]}`,
    }),
  },
  {
    tag: "s_rctrp_rep",
    count: 5,
    item: (i) => ({
      rctrp_rep_link: `/${101 + i}#comment`,
      rctrp_rep_desc: [
        "이 스킨 정말 깔끔하네요. 혹시 배포 계획도 있으신가요?",
        "자간 값 참고해서 저도 적용해봤습니다 감사합니다",
        "폰트 CDN 링크가 궁금합니다",
        "두 번째 이미지가 안 보여요",
        "잘 보고 갑니다",
      ][i],
      rctrp_rep_name: ["김디자", "무명", "publisher", "지나가던 개발자", "이웃"][i],
      rctrp_rep_time: `2026.09.0${i + 1} 1${i}:0${i}`,
    }),
  },
];

/* ── [CONTENT SPEC §14-1] 글 목록 / 페이징 반복 블록 ──────────────────
   실사이트에서는 서버가 글 개수만큼 <s_index_article_rep>를, 페이지 수만큼
   <s_paging_rep>을 반복해 내려준다. skin.html에는 **정확히 한 번**만 적혀
   있으므로(복붙하면 실사이트에서 배수로 곱해진다) 로컬 검증용 반복은
   전적으로 이 생성기의 몫이다.
   위젯용 REPEATS와 배열을 분리한 이유: right-widgets 목업이 쓰는
   `{count: 0}` 오버라이드가 글 목록까지 0으로 만들어버리면 안 된다. */
const POST_COUNT_DEFAULT = 7; // 160px×7 + 타이틀 160 + 페이징 160 = 1440px → 실제로 스크롤이 생긴다
const POST_REPEATS = [
  {
    tag: "s_index_article_rep",
    count: POST_COUNT_DEFAULT,
    /* 짝수 인덱스만 썸네일 — 없는 글은 텍스트 전폭 레이아웃 검증용 */
    conditional: { tag: "s_article_rep_thumbnail", when: (i) => i % 2 === 0 },
    item: (i) => ({
      article_rep_link: `/${301 + i}`,
      article_rep_title: [
        "Pretendard 자간·행간을 실제로 어디까지 좁혀야 하나",
        "shadcn/ui 사이드바를 바닐라 CSS로 1:1 포팅하기 — React state를 data 속성으로 옮기는 아주 긴 제목의 경우 두 줄까지만 보이고 말줄임 처리된다",
        "티스토리 스킨에서 Tailwind v4를 쓰는 법",
        "로고 리디자인 전후 비교",
        "AI 프롬프트 아카이브를 시작하며",
        "Figma 변수(Variables)로 다크모드 만들기",
        "무료 상업용 한글 폰트 30종 총정리",
      ][i % 7],
      article_rep_category: ["Design", "Design", "Design", "Design", "Ai", "Design", "Design"][i % 7],
      article_rep_category_link: "/category/Design",
      article_rep_simple_date: `2026.09.0${(i % 7) + 1}`,
      article_rep_thumbnail_url: THUMB,
      /* [CONTENT SPEC §6-5] ⚠ [##_article_rep_summary_##]는 본문에서 추출되므로
         HTML 태그가 섞여 나올 수 있다. content.css의 정규화 규칙(미디어 숨김 +
         폰트/색 상속)이 실제로 격자 높이를 지켜내는지 보려고, 두 번째 항목에
         일부러 <strong>/<img>/<p>를 섞어 둔다. */
      article_rep_summary:
        i % 7 === 1
          ? '<p><strong>HTML이 섞인 요약</strong>도 격자 높이를 깨뜨리지 않아야 한다.</p><img src="' +
            THUMB +
            '" alt=""><p>두 번째 문단은 2줄 클램프에 걸려 잘린다.</p>'
          : [
              "Design-system globals.css의 한글 전용 자간 스케일을 실측해 어디까지가 안전한 범위인지 정리했다.",
              "",
              "Tistory에는 빌드 서버가 없다. 로컬에서 정적 CSS로 만들어 업로드하는 파이프라인을 세운 기록.",
              "브랜드 마크가 라이트 테마에서 검정 네모로 읽히던 문제를 액센트 컬러로 해결한 과정.",
              "재사용 가능한 스킬 형태로 프롬프트를 관리하기 시작했다.",
              "Figma 변수로 라이트/다크 두 벌을 한 번에 관리하는 방법.",
              "라이선스 조건까지 한 번에 확인할 수 있게 표로 정리했다.",
            ][i % 7],
    }),
  },
];

const PAGING_REPEATS = [
  {
    tag: "s_paging_rep",
    count: 5,
    item: (i) => ({
      /* ★ href 값이 아니라 속성 전체다(위 SUBSTITUTIONS 주석 참고).
         i===0을 `href="/"`로 두는 건 의도적이다 — 목업 서버의 현재 URL이
         `/`이므로 content.js의 "현재 페이지" 판정(aria-current + outline)이
         로컬에서 실제로 한 번 발동해 검증 가능해진다. */
      paging_rep_link: i === 0 ? 'href="/"' : `href="/?page=${i + 1}"`,
      paging_rep_link_num: String(i + 1),
    }),
  },
];

/**
 * 반복 블록을 count번 복제하면서 항목별 값을 그 자리에 리터럴로 박아 넣는다.
 * 주의 1) 정규식은 반드시 non-greedy — greedy면 최근 글 여는 태그부터
 *        인기 글 닫는 태그까지 한 덩어리로 먹는다.
 * 주의 2) 조건부 썸네일 블록은 이 확장 안에서 처리해야 한다. 뒤의 전역
 *        마커 제거에 맡기면 모든 항목에 썸네일이 생겨 "썸네일 없는 항목"
 *        케이스를 볼 수 없다.
 */
function expandRepeats(html, repeats, { count: countOverride } = {}) {
  for (const { tag, count, item, conditional } of repeats) {
    const block = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
    const n = countOverride === undefined ? count : countOverride;
    html = html.replace(block, (_, tpl) => {
      let out = "";
      for (let i = 0; i < n; i++) {
        let one = tpl;
        if (conditional) {
          const cond = new RegExp(
            `<${conditional.tag}>([\\s\\S]*?)</${conditional.tag}>`,
            "g"
          );
          one = conditional.when(i) ? one.replace(cond, "$1") : one.replace(cond, "");
        }
        const values = item(i);
        one = one.replace(/\[##_([a-z_0-9]+)_##\]/g, (whole, key) =>
          key in values ? values[key] : whole
        );
        out += one;
      }
      return out;
    });
  }
  return html;
}

const raw = readFileSync(resolve(root, "dashboard-skin", "skin.html"), "utf8");

function render(
  source,
  { emptyWidgets = false, posts = POST_COUNT_DEFAULT, mode = "index" } = {}
) {
  /* [실측 버그 수정] HTML 주석 격리.
     skin.html의 주석은 문서화를 위해 `<s_rctps_popular_rep>` 같은 태그 이름을
     문자열 그대로 적고 있다. 그대로 두면 아래 0단계의 반복 확장 정규식이
     "주석 속 여는 태그 ~ 진짜 닫는 태그"를 한 블록으로 잡아 카드 <section>
     전체를 N번 복제해버린다(인기 글·태그 카드가 5장/12장으로 늘어나는 것을
     실측 확인). 주석을 자리표시자로 빼두고 파이프라인을 전부 통과시킨 뒤
     마지막에 되돌린다 — 덤으로 목업의 주석이 원본과 글자 그대로 같아진다. */
  const comments = [];
  let html = source.replace(/<!--[\s\S]*?-->/g, (m) => {
    comments.push(m);
    return `@@SKIN_COMMENT_${comments.length - 1}@@`;
  });

  // 0) [신규] 반복 블록 확장 — 반드시 아래 1)·2)보다 먼저.
  //    여기서 항목별 값을 리터럴로 박아 넣기 때문에 2)의 전역 테이블
  //    (키 하나당 값 하나)과 충돌하지 않는다. 순서가 바뀌면 5개 항목이
  //    전부 같은 제목이 된다.
  if (emptyWidgets) {
    // 공지는 조건 그룹 <s_rct_notice>가 있어 0건이면 서버가 카드째 안 내려준다.
    html = html.replace(/<s_rct_notice>[\s\S]*?<\/s_rct_notice>/g, "");
    html = expandRepeats(html, REPEATS, { count: 0 });
  } else {
    html = expandRepeats(html, REPEATS);
  }

  // 0-b) [CONTENT SPEC §9, §14-1] 페이지 타입 분기 — 서버가 하는 일과 동일하게
  //      index / permalink 중 **한쪽 블록을 통째로 제거**한다. 둘 다 남기면
  //      content.css의 :has([data-slot="post-single"])가 항상 참이 되어
  //      인덱스 페이지에서도 격자 배경/타이틀영역이 꺼진다.
  if (mode === "permalink") {
    html = html.replace(/<s_index_article_rep>[\s\S]*?<\/s_index_article_rep>/g, "");
    // 단일 글 페이지에는 목록 빈 상태도, 목록 페이징도 없다.
    html = html.replace(/<s_list>[\s\S]*?<\/s_list>/g, "");
    html = html.replace(/<s_paging>[\s\S]*?<\/s_paging>/g, "");
    /* [FOOTER SPEC §10-4] 하단 4종 반복 블록 — 이 분기 안에서만 확장한다.
       (index 모드에서는 위 <s_permalink_article_rep> 제거로 이미 사라졌다)
       전역 REPEATS에 넣으면 index 모드에서도 확장한 뒤 곧바로 통째로 지워지는
       낭비가 생기고, 무엇보다 s_rp2_rep → s_rp_rep 순서 의존이 다른 위젯
       확장과 뒤섞인다. */
    html = expandRepeats(html, PERMALINK_REPEATS);
  } else {
    html = html.replace(/<s_permalink_article_rep>[\s\S]*?<\/s_permalink_article_rep>/g, "");
    if (posts > 0) {
      // 글이 있으면 서버는 <s_list_empty>를 내려주지 않는다(빈 상태는 0개일 때만).
      html = html.replace(/<s_list>[\s\S]*?<\/s_list>/g, "");
      html = expandRepeats(html, PAGING_REPEATS);
    } else {
      // 글이 0개면 페이지도 없다 — 페이징 블록 자체가 안 내려온다.
      html = html.replace(/<s_paging>[\s\S]*?<\/s_paging>/g, "");
    }
    html = expandRepeats(html, POST_REPEATS, { count: posts });
  }

  // 1) 티스토리 조건 블록 마커 제거 (내용은 유지)
  html = html.replace(/<\/?s_[a-z_0-9]+>/g, "");

  // 2) 남은 치환자 → 전역 더미 값
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
      /\.\/images\/((?:sidebar|header|tooltip|card|widgets|content|scrollbar|smooth-scroll)\.(?:css|js))/g,
      "/dashboard-skin/components/$1"
    )
    .replace(/\.\/images\//g, "/dashboard-skin/");

  // 4) 격리해 뒀던 HTML 주석 복원 (전역 — 반복 확장으로 복제된 자리도 함께)
  html = html.replace(/@@SKIN_COMMENT_(\d+)@@/g, (_, i) => comments[Number(i)]);

  // 5) 목업임을 표시
  return html.replace(
    "<head>",
    "<head>\n<!-- 자동 생성 파일 — 직접 수정하지 말 것. 원본: dashboard-skin/skin.html -->"
  );
}

const html = render(raw);

writeFileSync(
  resolve(root, "_workspace", "sidebar_mockup-preview.html"),
  html,
  "utf8"
);

// FOUC 검증용 변형 — 지연 로드되는 sidebar.js를 통째로 뺀 사본.
// <head> 인라인 힌트 + wrapper 직후 동기 스크립트만으로 접힘 상태가
// 첫 파싱에 확정되는지(폭 점프가 구조적으로 불가능한지) 확인하는 데 쓴다.
writeFileSync(
  resolve(root, "_workspace", "sidebar_mockup-nojs.html"),
  html.replace(/<script src="[^"]*sidebar\.js"><\/script>/, ""),
  "utf8"
);

// [RIGHT-WIDGETS SPEC §7-3] 위젯 0건 사본 — 새 블로그의 실제 초기 상태.
// 공지 카드가 통째로 사라지고 나머지 4장에 "아직 없습니다" 폴백이 뜨는지
// 확인하는 유일한 방법이다.
writeFileSync(
  resolve(root, "_workspace", "right-widgets_mockup-empty.html"),
  render(raw, { emptyWidgets: true }),
  "utf8"
);

// [CONTENT SPEC §7] 글 0개 — <s_list_empty>(2행 320px)가 뜨고, 그 아래 남은
// 캔버스도 content-grid의 min-height 덕에 격자로 가득 차야 한다.
// (min-height에 퍼센트를 썼다면 0으로 계산돼 격자가 사라졌을 자리다.)
writeFileSync(
  resolve(root, "_workspace", "content_mockup-empty.html"),
  render(raw, { posts: 0 }),
  "utf8"
);

// [CONTENT SPEC §9 / PROSE SPEC §8] 단일 글 모드 — 격자 배경과 타이틀영역이
// :has()로 꺼지는지 + 본문 프로즈 타이포그래피 전체.
// 본문 더미는 이제 SUBSTITUTIONS.article_rep_desc(= PROSE_SAMPLE) 자체가
// 리치 HTML이므로 예전의 문자열 후처리(.replace)는 제거했다.
const permalinkHtml = render(raw, { mode: "permalink" });
writeFileSync(
  resolve(root, "_workspace", "content_mockup-permalink.html"),
  permalinkHtml,
  "utf8"
);

// [PROSE SPEC §7-2 15번] content.js를 뺀 permalink 사본 — 표 가로 스크롤의
// CSS 폴백(`table:not([data-prose-table="wrapped"]) { display:block; overflow-x:auto }`)이
// JS 없이도 발동하는지 확인하는 유일한 방법이다.
// (sidebar_mockup-nojs.html이 FOUC 검증을 위해 sidebar.js를 빼는 것과 같은 성격.)
writeFileSync(
  resolve(root, "_workspace", "content_mockup-permalink-nojs.html"),
  permalinkHtml.replace(/<script src="[^"]*content\.js"><\/script>/, ""),
  "utf8"
);

console.log(
  "wrote _workspace/sidebar_mockup-preview.html, sidebar_mockup-nojs.html, " +
    "right-widgets_mockup-empty.html, content_mockup-empty.html, content_mockup-permalink.html, " +
    "content_mockup-permalink-nojs.html"
);
