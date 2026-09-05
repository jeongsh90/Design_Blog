# 글 상세(permalink) 하단 기능 4종 비주얼 스펙
### 액션 바 / 관련글 / 글 태그 / 댓글 — Content 구역 후속 (PC / 100vw)

> **범위:** `<s_permalink_article_rep>` 안, 본문(`post-single-body`) **다음**에 이어지는 4개 블록.
> **범위 밖:** TOC · 반응형 · 목록(index) 화면 · 본문 프로즈(이미 완료) · 이전/다음 글 내비게이션.
> **선행 문서:** `content_designer-spec.md`(목록) · `content-permalink-prose_designer-spec.md`(본문 프로즈) — 이 스펙은 후자가 확정한 **무채색 위계 + `--color-link` + 24px 대문자 없는 헤딩** 톤을 그대로 이어받는다.

---

## 0. 실측 결과 — 요구사항 문서 대비 **정정 2건 · 신규 발견 4건**

이번 세션에서 Tistory 공식 문서(`contents/post.html`, `contents/comment.html`)를 다시 실측했다. 오케스트레이터 요구사항 문서(§대기열 3번)의 기록은 대부분 맞았지만, **그대로 구현하면 실패했을 항목이 2건** 있었다.

### 0-1. ★ 정정 1 — 관련글에는 **반복 블록 `<s_article_related_rep>`가 있다**

요구사항 문서는 `<s_article_related>` + `[##_article_related_rep_link/title/date_##]` 3개만 기록했다. 실제 공식 예제는 이렇다(**verbatim**):

```html
<s_article_related>
  <div class="area_related">
    <strong class="tit_related">'[##_article_rep_category_##]' Related Articles</strong>
    <ul class="list_related">
      <s_article_related_rep>
        <li class="[##_article_related_rep_type_##]">
          <a href="[##_article_related_rep_link_##]" class="link_related">
            <s_article_related_rep_thumbnail>
              <span class="thumb_related">
                <img src="[##_article_related_rep_thumbnail_link_##]" class="img_related" alt="">
              </span>
            </s_article_related_rep_thumbnail>
            <span class="txt_related">[##_article_related_rep_title_##]</span>
            <span class="date_related">[##_article_related_rep_date_##]</span>
            <span class="frame_related"></span>
          </a>
        </li>
      </s_article_related_rep>
    </ul>
    <a href="[##_article_rep_category_link_##]" class="link_more">more</a>
  </div>
</s_article_related>
```

**반복 블록을 빠뜨렸으면 관련글이 딱 1개만(혹은 0개) 나왔을 것이다.** 추가로 확인된 것:
- `[##_article_related_rep_type_##]` — 항목 타입(`text` / `thumbnail`)을 `<li>` class로 내려준다.
- `<s_article_related_rep_thumbnail>` — **조건부** 블록(대표이미지 있는 글만) + `[##_article_related_rep_thumbnail_link_##]`.
- `[##_article_rep_category_link_##]` — 카드 제목/더보기 링크에 쓸 수 있다(스크린샷의 "'뉴스' 카테고리의 다른 글"을 **클릭 가능한 제목**으로 만들 수 있다는 뜻).

### 0-2. ★ 정정 2 — 글 태그 `[##_tag_label_rep_##]`는 **반복 블록이 아니라 단일 치환자다**

요구사항 문서는 "`<s_tag_label>`(그룹) 안에 `[##_tag_label_rep_##]`(반복)"으로 적었는데, "반복"이라는 표현이 **반복 블록으로 오해될 수 있다.** 공식 예제 전문은 이게 전부다:

```html
<s_tag_label>
  <div class="tagTrail">
    <span class="tagText">TAG </span> [##_tag_label_rep_##]
  </div>
</s_tag_label>
```

→ **치환자 하나가 태그 링크 묶음 전체를 통째로 내려준다.** 우리가 태그 하나하나에 `data-slot="badge"`를 붙일 마크업 자리가 **구조적으로 없다.** 이 스펙에서 태그 chip을 마크업이 아니라 **JS 정규화 + CSS 폴백**으로 처리하는 이유가 이것이다(§4). 사이드바 위젯의 `<s_random_tags>`(항목당 `<a>` 템플릿을 우리가 직접 쓴다)와는 **작동 방식이 완전히 다르다** — 절대 같은 방식으로 만들면 안 된다.

> ⚠ **`[##_tag_label_rep_##]`의 정확한 출력 형태는 문서에 명시돼 있지 않다.** 예제가 앞에 "TAG " 라벨 텍스트를 두고 그 뒤에 치환자만 놓는 관용구인 점, 그리고 실제 티스토리 스킨들이 이 자리에 쉼표 구분자를 전제한 CSS를 쓰는 점으로 볼 때 **`<a href="/tag/X">X</a>, <a href="/tag/Y">Y</a>` 형태(쉼표 구분 앵커 나열)**로 추정된다. §4의 구현은 **쉼표가 있든 없든, 앵커만 있든 텍스트 노드가 섞이든 동일하게 동작**하도록 설계했다 — 추정에 의존하지 않는다. 실사이트 확인 항목 Q7.

### 0-3. 신규 발견 — 댓글에 **`<s_rp_member>` / `<s_rp>` / `<s_rp_count>`가 더 있다**

공식 예제 전문(**verbatim**, 요구사항 문서에 없던 태그를 굵게):

```html
<s_rp_input_form>
  <div class="commentWrite">
    <s_rp_member>                                          <!-- ★ 신규 발견 -->
      <s_rp_guest>
        <p><input type="text" name="[##_rp_input_name_##]" value="[##_guest_name_##]" /><label for="name"> : 이름 </label></p>
        <p><input type="password" maxlength="8" name="[##_rp_input_password_##]" value="[##_rp_admin_check_##]" /><label for="password"> : 패스워드 </label></p>
        <p><input type="text" class="homepage" name="[##_rp_input_homepage_##]" value="[##_guest_homepage_##]" /><label for="homepage"> : 홈페이지 </label></p>
      </s_rp_guest>
      <p class="secretWrap">
        <input type="checkbox" name="[##_rp_input_is_secret_##]" class="checkbox" /><label for="secret"> 비밀글 </label>
      </p>
    </s_rp_member>
    <p><textarea name="[##_rp_input_comment_##]" rows="10" cols="50"></textarea></p>
    <p><input type="submit" value="댓글 달기" onclick="[##_rp_onclick_submit_##]" /></p>
  </div>
</s_rp_input_form>
```

**여기서 반드시 읽어야 할 3가지:**

1. **`[##_rp_input_*_##]`는 `name` **속성의 값**이다** — href나 요소 전체가 아니다. `name="[##_rp_input_comment_##]"` 형태를 **글자 그대로** 유지해야 한다. 우리가 `name="comment"` 같은 걸 임의로 쓰면 서버가 값을 못 받는다.
2. **로그인 분기는 서버가 한다.** `<s_rp_guest>`(비회원 이름/비번/홈페이지)가 `<s_rp_member>` **안에** 들어있다 — 즉 "회원이면 `s_rp_member`만 남고 그 안의 `s_rp_guest`는 서버가 지운다"는 구조로 읽는 것이 유일하게 앞뒤가 맞는 해석이다(비밀글 체크박스가 `s_rp_member` 안에 있는데, 비회원도 비밀댓글을 쓸 수 있다는 실제 동작과 모순되지 않으려면 이 해석뿐이다). **스킨은 양쪽 마크업을 항상 써 두고 판단을 서버에 맡긴다** — "스킨이 로그인 여부를 알 방법"은 필요 없다. 이것이 요구사항 문서 §4의 "로그인 여부를 스킨이 알 방법이 있는지" 질문에 대한 답이다. 다만 이 해석 자체는 실사이트 미검증(Q8).
3. **`value="[##_rp_admin_check_##]"`** — 비밀번호 칸의 관리자 자동입력 값. 빼면 관리자가 댓글 쓸 때마다 비번을 치게 된다. **반드시 유지.**

댓글 목록 예제(요구사항 문서와 일치, 확인만):

```html
<s_rp_container>
  <ol>
    <s_rp_rep>
      <li id='[##_rp_rep_id_##]'>
        <div class="[##_rp_rep_class_##]">
          <span class="image">[##_rp_rep_logo_##]</span>
          <span class="name">[##_rp_rep_name_##]</span>
          <span class="date"> [##_rp_rep_date_##]</span>
          <span class="control">
            <a href="[##_rp_rep_link_##]" class="address"><span>댓글주소</span></a>
            <a href="#" onclick="[##_rp_rep_onclick_delete_##]" class="modify"><span>수정/삭제</span></a>
            <a href="#" onclick="[##_rp_rep_onclick_reply_##]" class="write"><span>댓글쓰기</span></a>
          </span>
          <p>[##_rp_rep_desc_##]</p>
        </div>
        <s_rp2_container>
          <ul>
            <s_rp2_rep>
              <li id='[##_rp_rep_id_##]'> … 동일 치환자, 단 onclick_reply 없음 … </li>
            </s_rp2_rep>
          </ul>
        </s_rp2_container>
      </li>
    </s_rp_rep>
  </ol>
</s_rp_container>
```

**대댓글(`s_rp2_rep`)은 부모와 치환자 이름이 완전히 같다**(`rp_rep_*` 재사용) — 이게 목업 생성기에서 함정이 된다(§7-3에서 처리).

### 0-4. 신규 발견 — 액션 바에 쓸 수 있는 **진짜 데이터가 2개 더 있다**

`contents/post.html` 치환자 전수 조회 결과, 요구사항 문서에 없던 것들:

| 태그/치환자 | 의미 | 이 스펙에서의 용도 |
|---|---|---|
| **`<s_rp_count>`** | 댓글 수 표시 영역(조건부 그룹) | 액션 바의 **댓글 수 칩** |
| **`[##_article_rep_rp_cnt_##]`** | 댓글 수 | 위 칩의 숫자 |
| `[##_article_rep_rp_link_##]` | 댓글 토글 onclick | **쓰지 않음**(§3-1 사유) |
| **`<s_ad_div>`** | **관리자에게만** 렌더되는 블록 | **"더보기(⋯)" 자리의 대체 — 관리 기능**(§3-1) |
| `[##_s_ad_m_link_##]` / `[##_s_ad_m_onclick_##]` | 글 수정 링크 / onclick | 관리 버튼 |
| `[##_s_ad_s1_label_##]` / `[##_s_ad_s2_label_##]` / `[##_s_ad_s2_onclick_##]` | 현재 공개상태 / 다음 상태 라벨 / 전환 onclick | 관리 버튼 |
| `[##_s_ad_d_onclick_##]` | 글 삭제 onclick | 관리 버튼 |
| `<s_article_prev>` / `<s_article_next>` | 이전/다음 글(+조건부 썸네일) | **이번 범위 밖** — 존재만 기록(다음 구역 후보) |

### 0-5. 요구사항 문서대로 확정 — 재조사하지 않은 것

- 공감/공유는 **스킨 치환자에 없음**(재확인함: `post.html` 치환자 전수 목록에 공감 관련 항목 0건). 공유 = 순수 클라이언트 JS, 공감 = localStorage 장식 카운터(오케스트레이터 결정).
- 댓글은 `[##_comment_group_##]` 단일 치환자가 아니라 **완전 수동 마크업** 채택(오케스트레이터 결정, 이 프로젝트의 일관된 선례).

---

## 1. 구조 결정 — 어디에, 무엇으로 넣는가

### 1-1. 마크업 위치: `<article data-slot="post-single">` **안쪽**, 본문 **다음**

```
<s_permalink_article_rep>
  <article data-slot="post-single">          ← 기존
    <h1 data-slot="post-single-title">       ← 기존
    <p  data-slot="post-single-meta">        ← 기존
    <div data-slot="post-single-body">       ← 기존 (프로즈)
    <footer data-slot="post-footer">         ★ 신규 — 이 스펙의 전부
      ① <div  data-slot="post-actions">
      ② <section data-slot="post-related">
      ③ <section data-slot="post-tags">
      ④ <section data-slot="post-comments">
    </footer>
  </article>
</s_permalink_article_rep>
```

**바깥(형제)이 아니라 안쪽인 이유 3가지:**
1. `[data-slot="post-single"]`이 이미 `max-width: calc(var(--spacing)*180)`(720px)과 `padding-block`을 갖고 있다. 형제로 두면 **같은 max-width를 한 번 더 복제**해야 하고, 두 값이 어긋나면 본문과 댓글의 좌측선이 틀어진다.
2. `content.css`의 `[data-slot="content-inner"]:has([data-slot="post-single"])` 분기(격자 배경 끄기 / 목록 타이틀 숨기기)가 그대로 유효하다.
3. HTML 명세상 `<article>` 안의 `<footer>`, 그리고 `<article>` 안의 댓글은 정상 용법이다.

**프로즈 규칙이 새 마크업으로 새지 않는다는 확인:** §10 프로즈는 전부 `[data-slot="post-single-body"] …` 자손 셀렉터다. `post-footer`는 `post-single-body`의 **형제**이므로 단 한 줄도 상속되지 않는다. 단 **댓글 본문(`[##_rp_rep_desc_##]`)만은 사용자 HTML이 들어오므로 최소 프로즈를 따로 준다**(§5-4).

### 1-2. 블록 순서 — 스크린샷 그대로

`액션 바 → 관련글 → 태그 → 댓글`. (참고: 티스토리 기본 스킨 다수는 태그를 본문 바로 뒤에 둔다. 순서를 바꾸고 싶으면 `<section data-slot="post-tags">` 블록 하나를 통째로 위로 옮기면 되고 **CSS는 한 줄도 바꿀 필요 없다** — 섹션 구분선을 `+` 결합자가 아니라 각 섹션의 `border-top`으로 주기 때문이다.)

### 1-3. CSS 파일: **`content.css` 끝(671행 뒤)에 §11로 이어붙인다** — 새 파일 만들지 않음

| 후보 | 판정 |
|---|---|
| **A. `content.css` §11로 append (채택)** | 같은 페이지·같은 구역. `--content-divider` / `--content-item-title-color`가 `content-inner`에 선언돼 **상속으로 그냥 쓸 수 있다**. 업로드 파일 수 불변(10개) → `skin.html`·`README.md`·`make-preview.mjs` 경로 정규식 **전부 무변경** |
| B. `comments.css` 신규 분리 | 업로드 파일 11개로 증가 + 3개 파일 동시 수정 + `--content-divider` 상속은 그대로 되지만 파일 경계가 실제 스타일 경계와 어긋남. **지금은 이득 없음** |

> `content.css`가 671행 → 약 1,000행이 된다. 그 자체로는 문제가 아니지만, **반응형 구역에서 이 파일이 또 크게 늘어난다면** 그때 `content-list.css` / `content-single.css`로 쪼개는 것을 권한다(지금 쪼개면 근거 없는 선반영이다).

### 1-4. 신규 공용 프리미티브 3개는 **`content.css` §11-0**에 둔다

`Textarea` / `Input` / `Avatar`는 shadcn 정본 프리미티브이고 이 프로젝트에 아직 없다. **Tooltip 선례를 그대로 따른다** — Tooltip도 처음엔 `header.css`에 있다가 두 번째 구역(sidebar)이 쓰게 됐을 때 `tooltip.css`로 분리했다. 지금은 댓글 폼 한 곳만 쓰므로 `content.css` §11-0에 두고, **"두 번째 구역이 쓰게 되면 `form.css`로 분리"** 주석을 남긴다.

---

## 2. shadcn 원본 구조 — 실측 인용(이번 세션 WebFetch)

새로 쓰는 프리미티브 3개의 원본이다. **class 이름을 그대로 옮기지 않고 값만 CSS로 번역**한다(이 프로젝트의 일관 방식).

### 2-1. Textarea — `registry/new-york-v4/ui/textarea.tsx`
```
data-slot="textarea"
flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base
shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground
focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
disabled:cursor-not-allowed disabled:opacity-50
aria-invalid:border-destructive aria-invalid:ring-destructive/20
md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40
```

### 2-2. Input — `registry/new-york-v4/ui/input.tsx`
```
data-slot="input"
h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs
transition-[color,box-shadow] outline-none
selection:bg-primary selection:text-primary-foreground
file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
md:text-sm dark:bg-input/30
focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
```

### 2-3. Avatar — `registry/new-york-v4/ui/avatar.tsx`
```
data-slot="avatar"          group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none
                            data-[size=lg]:size-10 data-[size=sm]:size-6
data-slot="avatar-image"    aspect-square size-full
data-slot="avatar-fallback" flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground
                            group-data-[size=sm]/avatar:text-xs
(그 외 avatar-badge / avatar-group / avatar-group-count 는 이 구역 미사용)
```

### 2-4. 재사용하는 기존 프리미티브 (신규 작성 금지)

| 프리미티브 | 파일 | 이 구역에서의 용도 |
|---|---|---|
| `[data-slot="button"]` + `data-variant="ghost|outline|default"` + `data-size="sm|icon-sm"` | `header.css` 1~195행 | 공감·공유·복사·비밀글·제출·관리·답글 **전부** |
| `[data-slot="badge"][data-variant="outline"]` | `card.css` 52~111행 | 태그 chip (마크업이 아니라 **JS가 부여** — §0-2) |
| `[data-slot="widget-list|widget-item|widget-link|widget-body|widget-title]` | `widgets.css` 82~140행 | **관련글 목록 전부** — 새로 만들지 않는다 |

---

## 3. ① 액션 바 — `[data-slot="post-actions"]`

### 3-1. 무엇을 넣고 무엇을 뺐는가 (스크린샷 대비)

| 스크린샷 | 이 스펙 | 근거 |
|---|---|---|
| 하트 + 카운트 | **공감 토글 + 카운트** (localStorage) | 오케스트레이터 결정. §3-3에 한계 명시 |
| — | **댓글 수 칩** (신규) | `<s_rp_count>` + `[##_article_rep_rp_cnt_##]`라는 **진짜 서버 데이터**가 있다(§0-4). 스크린샷의 아이콘 밀도를 지어내지 않고 채우는 유일한 정직한 방법 |
| 공유 아이콘 **2개** | **공유(Web Share) + 링크 복사** 2개 | 이 블로그는 연결된 SNS 계정이 없어 "카카오/트위터" 같은 대상을 지어낼 수 없다. 대신 **실제로 다른 동작인 두 버튼**으로 같은 자리를 채운다: ①`navigator.share`(모바일 네이티브 시트) ②클립보드 복사(항상 동작) |
| 더보기 **⋯** | **`<s_ad_div>` 관리 버튼 2~3개** | ⋯ 메뉴는 구현하지 않는다. 사유 3가지 ↓ |

**⋯ 드롭다운을 넣지 않는 이유:**
1. 이 스킨에는 **Popover/DropdownMenu 프리미티브가 없고 `--popover` 색 토큰도 없다.** 만들려면 프리미티브 + 토큰 + 포커스 트랩 + 바깥클릭 닫기 + 뷰포트 보정(툴팁에서 이미 겪은 그 작업)이 필요하다 — **별도 구역 규모**다.
2. 스크린샷의 ⋯는 티스토리가 플랫폼 레벨에서 주입하는 메뉴(신고/구독 등)로 보이며, **우리 스킨에는 그 데이터 소스가 없다.**
3. 우리가 실제로 소유한 "추가 동작"은 **관리자 전용 수정/상태변경/삭제**뿐이고, 그건 이미 `<s_ad_div>`가 **서버 차원에서 관리자에게만** 렌더해 준다. 드롭다운에 숨길 이유가 없다(관리자 화면에만 2~3개 버튼이 더 보일 뿐).
→ **확인 필요 Q1**(사용자가 ⋯ 메뉴를 원하면 프리미티브 신설로 별도 진행).

### 3-2. 마크업

```html
<!-- ① 액션 바 -->
<div data-slot="post-actions">

  <div data-slot="post-actions-start">
    <!-- 공감 — 서버 미연동 로컬 카운터 (§3-3) -->
    <button type="button" data-slot="button" data-variant="ghost" data-size="sm"
            data-post-like aria-pressed="false" aria-label="이 글에 공감">
      <svg data-like-icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
      <span data-slot="post-action-count" data-post-like-count>0</span>
    </button>

    <!-- 댓글 수 — 서버 데이터. 클릭 동작 없음(§3-1) -->
    <s_rp_count>
      <span data-slot="post-action-stat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span data-slot="post-action-count">[##_article_rep_rp_cnt_##]</span>
        <span class="sr-only">개의 댓글</span>
      </span>
    </s_rp_count>
  </div>

  <div data-slot="post-actions-end">
    <!-- 공유 — Web Share API. 미지원 브라우저에서는 JS가 이 버튼을 숨긴다 -->
    <button type="button" data-slot="button" data-variant="ghost" data-size="icon-sm"
            data-post-share hidden aria-label="공유하기">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
      </svg>
    </button>

    <!-- 링크 복사 — 항상 동작 -->
    <button type="button" data-slot="button" data-variant="ghost" data-size="icon-sm"
            data-post-copy aria-label="링크 복사">
      <svg data-copy-when="idle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>
      </svg>
      <svg data-copy-when="done" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    </button>

    <!-- 관리자에게만 서버가 렌더한다 (§0-4) -->
    <s_ad_div>
      <span data-slot="post-admin">
        <a href="[##_s_ad_m_link_##]" data-slot="button" data-variant="ghost" data-size="icon-sm" aria-label="글 수정">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
        </a>
        <button type="button" onclick="[##_s_ad_s2_onclick_##]" data-slot="button" data-variant="ghost" data-size="sm"
                aria-label="공개 상태 변경 (현재 [##_s_ad_s1_label_##])">[##_s_ad_s2_label_##]</button>
        <button type="button" onclick="[##_s_ad_d_onclick_##]" data-slot="button" data-variant="ghost" data-size="icon-sm" aria-label="글 삭제">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </span>
    </s_ad_div>

    <span class="sr-only" role="status" data-post-status></span>
  </div>
</div>
```

> **`data-post-share`에 `hidden`을 기본으로 두는 이유:** `navigator.share`가 없는 데스크톱 브라우저(대부분)에서 눌러도 아무 일도 안 일어나는 버튼을 보여주지 않기 위해서다. JS가 지원을 확인하면 `hidden`을 뗀다. **JS가 아예 안 돌면 이 버튼은 계속 안 보이고, 링크 복사 버튼만 남는다** — 안전한 실패다.

### 3-3. 공감 카운터의 정직한 한계 (반드시 주석으로 남길 것)

- 저장 키: **`daitnu-post-like:` + `location.pathname`** (`daitnu-content-view` 네이밍 관례 그대로).
  - `[##_article_rep_id_##]`를 쓰지 않는 이유: `contents/post.html`의 치환자 전수 목록에 **그 치환자가 없다**(댓글 문서에만 등장). 있지도 않은 치환자에 기대는 대신, permalink URL은 항상 그 글을 유일하게 가리키므로 `pathname`이 더 안전하다.
- 표시 숫자 = **`liked ? 1 : 0`**. 서버가 없으므로 **다른 사람의 공감을 알 방법이 없다.** 가짜 숫자를 지어내지 않는다.
- `<noscript>` 환경/JS 실패 시 `0`으로 남고 토글만 안 된다.
- **확인 필요 Q2** — 실제 티스토리 공감 기능이 플랫폼 레벨로 따로 주입된다면 이 버튼과 중복된다. 계정 없어 미검증.

---

## 4. ③ 글 태그 — `[data-slot="post-tags"]` (JS 정규화)

> 순서상 ③이지만, ②(관련글)보다 결정 난이도가 높아 먼저 설명한다.

### 4-1. 마크업 — **치환자 하나가 전부**

```html
<!-- ③ 이 글의 태그 -->
<s_tag_label>
  <section data-slot="post-tags" aria-label="이 글의 태그">
    <h2 data-slot="post-footer-title">태그</h2>
    <div data-slot="post-tags-list">[##_tag_label_rep_##]</div>
  </section>
</s_tag_label>
```

`<s_tag_label>`이 조건부 그룹이므로 **태그가 없는 글에서는 섹션째 사라진다**(빈 상태 폴백 불필요).

### 4-2. 왜 Badge를 마크업으로 못 붙이나 → JS 정규화

`[##_tag_label_rep_##]`가 앵커 묶음 전체를 통째로 내려주므로(§0-2) 개별 `<a>`에 `data-slot="badge"`를 쓸 자리가 없다. `content.js`에 `initPostTags()`를 추가한다 — **`prose-table-wrap` 주입과 완전히 같은 성격의 작업**(서버가 내려준 HTML에 우리 구조를 입히는 것)이라 선례가 이미 있다.

```js
/* [FOOTER SPEC §4-2] 글 태그 정규화.
   [##_tag_label_rep_##]는 태그 링크 묶음 전체를 통째로 내려주는 단일 치환자라
   (사이드바 <s_random_tags>와 달리) 태그 하나하나에 우리 마크업을 쓸 수 없다.
   서버 출력 형태가 문서에 명시돼 있지 않으므로(쉼표 구분 추정, Q7),
   "앵커만 남기고 나머지 노드는 전부 버린다"는 형태 비의존 방식으로 처리한다. */
function initPostTags() {
  var list = document.querySelector('[data-slot="post-tags-list"]');
  if (!list) return;

  var links = list.querySelectorAll("a");
  if (!links.length) return;                    // 앵커가 없으면 손대지 않는다(폴백 유지)

  Array.prototype.forEach.call(links, function (a) {
    a.setAttribute("data-slot", "badge");
    a.setAttribute("data-variant", "outline");
    // '#' 접두어는 CSS ::before가 붙인다 — 텍스트를 고치면 재실행 시 '##'가 된다
  });

  // 앵커 사이의 구분자 텍스트 노드(", " 등)를 제거한다.
  for (var i = list.childNodes.length - 1; i >= 0; i--) {
    var n = list.childNodes[i];
    if (n.nodeType !== 1) list.removeChild(n);  // 요소가 아닌 모든 노드 제거
  }

  list.setAttribute("data-tags", "normalized"); // CSS 폴백을 비켜나게 하는 스위치
}
```

**폴백(JS 미실행) 설계:** `[data-slot="post-tags-list"]:not([data-tags="normalized"])`에는 chip이 아니라 **인라인 링크 나열** 스타일만 준다(쉼표가 그대로 보이지만 읽는 데 지장 없음). `prose-table-wrap`의 CSS 폴백과 동일한 사고방식이다.

### 4-3. `#` 접두어

CSS `::before { content: "#" }` 로 붙인다. JS로 텍스트를 바꾸면 재실행/중복 실행 시 `##`가 되고, 스크린리더가 "샵"을 읽는 문제도 생긴다(`::before` 생성 콘텐츠는 대부분의 SR이 무시하거나 장식으로 처리).

---

## 5. ② 관련글 · ④ 댓글 — 마크업

### 5-1. ② 관련글 — `widget-*` 프리미티브 **그대로 재사용**

```html
<!-- ② '카테고리' 카테고리의 다른 글 -->
<s_article_related>
  <section data-slot="post-related">
    <h2 data-slot="post-footer-title">
      <a href="[##_article_rep_category_link_##]" data-slot="post-related-title-link">‘[##_article_rep_category_##]’ 카테고리의 다른 글</a>
    </h2>
    <ul data-slot="widget-list">
      <s_article_related_rep>
        <li data-slot="widget-item">
          <a href="[##_article_related_rep_link_##]" data-slot="widget-link">
            <span data-slot="widget-body">
              <span data-slot="widget-title">[##_article_related_rep_title_##]</span>
            </span>
            <span data-slot="post-related-date">[##_article_related_rep_date_##]</span>
          </a>
        </li>
      </s_article_related_rep>
    </ul>
  </section>
</s_article_related>
```

**판단 기록:**
- **`widget-list`/`widget-item`/`widget-link`/`widget-body`/`widget-title`는 그대로 쓴다.** 이 프리미티브들은 `widgets.css`에서 **`[data-slot="widgets"]` 하위로 스코프되지 않은 전역 규칙**이라 콘텐츠 영역에서도 그대로 동작한다(실측: `widgets.css` 82~140행). 항목 구분선(`widget-item + widget-item { border-top: 1px solid var(--color-border) }`)이 스크린샷의 "얇은 구분선"과 정확히 같다.
- **딱 한 가지만 보정이 필요하다.** `widget-title`의 색은 `var(--widget-title-color)`인데 그 변수는 `[data-slot="widgets"]`에만 선언돼 있어 콘텐츠 영역에서는 **미정의 → 선언 무효 → 색 상속**이 된다(조용한 실패). §6-2에서 `[data-slot="post-related"]`에 **한 줄로** 재선언한다 — 값은 `content-inner`가 이미 갖고 있는 `--content-item-title-color`(= 완전히 같은 계산식)를 그대로 참조하므로 **새 색을 만들지 않는다.**
- **날짜는 `widget-meta`(제목 아래)가 아니라 우측 정렬**이라 `[data-slot="post-related-date"]` 하나를 신설한다(스크린샷 구조). `widget-link`가 이미 flex이고 `widget-body`가 `flex:1 1 auto`라 **CSS 3줄이면 끝난다.**
- **썸네일(`<s_article_related_rep_thumbnail>`)은 쓰지 않는다.** 스크린샷이 텍스트 목록이고, 우측 위젯의 "인기 글"에서 이미 같은 결정(썸네일 없음)을 내렸다. 쓰지 않는 조건부 블록은 **마크업에 아예 넣지 않는다**(넣고 CSS로 숨기면 서버가 이미지를 다운로드한다).
- `[##_article_related_rep_type_##]`도 쓰지 않는다(썸네일 유무 구분용인데 썸네일을 안 쓰므로 무의미).
- **더보기(`more`) 링크는 별도로 두지 않고 제목 자체를 카테고리 링크로 만든다** — 스크린샷에 more가 없고, 제목이 곧 그 카테고리를 가리키는 게 더 직관적이다.

### 5-2. ④ 댓글 — 목록

```html
<!-- ④ 댓글 -->
<s_rp>
<section data-slot="post-comments" id="comments" aria-label="댓글">
  <h2 data-slot="post-footer-title">댓글 <s_rp_count><span data-slot="post-comments-count">[##_article_rep_rp_cnt_##]</span></s_rp_count></h2>

  <s_rp_container>
    <ol data-slot="comment-list">
      <s_rp_rep>
        <li id="[##_rp_rep_id_##]" data-slot="comment-item" class="[##_rp_rep_class_##]">

          <div data-slot="comment-main">
            <span data-slot="avatar" data-size="default" data-comment-logo>
              <span data-slot="avatar-fallback" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              [##_rp_rep_logo_##]
            </span>

            <div data-slot="comment-body">
              <div data-slot="comment-head">
                <span data-slot="comment-author">[##_rp_rep_name_##]</span>
                <a href="[##_rp_rep_link_##]" data-slot="comment-date">[##_rp_rep_date_##]</a>
                <span data-slot="comment-actions">
                  <button type="button" onclick="[##_rp_rep_onclick_reply_##]" data-slot="button" data-variant="ghost" data-size="xs">답글</button>
                  <button type="button" onclick="[##_rp_rep_onclick_delete_##]" data-slot="button" data-variant="ghost" data-size="xs">수정·삭제</button>
                </span>
              </div>
              <div data-slot="comment-desc">[##_rp_rep_desc_##]</div>
            </div>
          </div>

          <s_rp2_container>
            <ul data-slot="comment-replies">
              <s_rp2_rep>
                <li id="[##_rp_rep_id_##]" data-slot="comment-item" class="[##_rp_rep_class_##]">
                  <div data-slot="comment-main">
                    <span data-slot="avatar" data-size="sm" data-comment-logo>
                      <span data-slot="avatar-fallback" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                      [##_rp_rep_logo_##]
                    </span>
                    <div data-slot="comment-body">
                      <div data-slot="comment-head">
                        <span data-slot="comment-author">[##_rp_rep_name_##]</span>
                        <a href="[##_rp_rep_link_##]" data-slot="comment-date">[##_rp_rep_date_##]</a>
                        <span data-slot="comment-actions">
                          <button type="button" onclick="[##_rp_rep_onclick_delete_##]" data-slot="button" data-variant="ghost" data-size="xs">수정·삭제</button>
                        </span>
                      </div>
                      <div data-slot="comment-desc">[##_rp_rep_desc_##]</div>
                    </div>
                  </div>
                </li>
              </s_rp2_rep>
            </ul>
          </s_rp2_container>

        </li>
      </s_rp_rep>
    </ol>
  </s_rp_container>
```

**판단 기록:**
- **대댓글에는 `onclick_reply`를 넣지 않는다** — 공식 예제가 그렇고(2단계까지만 지원), 있지도 않은 치환자를 쓰면 빈 onclick이 된다.
- **`class="[##_rp_rep_class_##]"`는 유지하되 어떤 스타일도 걸지 않는다.** 이 치환자가 정확히 무엇을 내려주는지(작성자 구분? 비밀댓글?) 문서에 설명이 없다 — **Q9**. 값을 모른 채 스타일을 걸면 조용히 틀린다. 값이 확인되면 그때 한 줄 추가하면 된다.
- **아바타 fallback을 먼저 깔고 `[##_rp_rep_logo_##]`를 뒤에 둔다.** shadcn Avatar는 Radix가 이미지 로드 실패를 감지해 fallback으로 **전환**하지만 바닐라에는 그 런타임이 없다. 대신 **fallback을 배경 레이어로 깔고 이미지가 그 위를 덮는 방식**(CSS `position:absolute` + `inset:0`)으로 같은 결과를 만든다 — 이미지가 없거나 깨지면 자연히 fallback이 보인다. **환경 제약에 따른 의도적 편차**(§8-6).
- `[##_rp_rep_logo_##]`가 **URL 문자열**을 내려줄 가능성에 대비해 `content.js`에 6줄짜리 방어를 둔다(§7-2 `initCommentAvatars`). 문서 예제가 `<span class="image">[##_rp_rep_logo_##]</span>` 형태로 감싸 쓰므로 **`<img>` 요소 전체를 내려줄 가능성이 높지만 확정은 아니다** — Q10.
- **댓글 0건 폴백**: `<s_rp_container>`가 조건부 그룹이라 0건이면 목록이 통째로 사라진다. 위젯에서 쓴 `:not(:has(> li))::after` 트릭이 필요 없다 — 대신 **작성 폼의 안내 문구가 그 역할**을 한다.

### 5-3. ④ 댓글 — 작성 폼

```html
  <s_rp_input_form>
    <div data-slot="comment-form">
      <span data-slot="avatar" data-size="default">
        <span data-slot="avatar-fallback" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </span>
      </span>

      <div data-slot="comment-form-body">
        <s_rp_member>
          <s_rp_guest>
            <div data-slot="comment-form-guest">
              <label class="sr-only" for="rp-name">이름</label>
              <input id="rp-name" type="text" data-slot="input" placeholder="이름"
                     name="[##_rp_input_name_##]" value="[##_guest_name_##]" />

              <label class="sr-only" for="rp-password">비밀번호</label>
              <input id="rp-password" type="password" maxlength="8" data-slot="input" placeholder="비밀번호"
                     name="[##_rp_input_password_##]" value="[##_rp_admin_check_##]" />

              <label class="sr-only" for="rp-homepage">홈페이지</label>
              <input id="rp-homepage" type="text" data-slot="input" placeholder="홈페이지 (선택)"
                     name="[##_rp_input_homepage_##]" value="[##_guest_homepage_##]" />
            </div>
          </s_rp_guest>

          <label class="sr-only" for="rp-comment">댓글 내용</label>
          <textarea id="rp-comment" data-slot="textarea" rows="3" placeholder="내용을 입력하세요"
                    name="[##_rp_input_comment_##]"></textarea>

          <div data-slot="comment-form-actions">
            <label data-slot="comment-secret">
              <input type="checkbox" class="sr-only" name="[##_rp_input_is_secret_##]" />
              <svg data-secret-when="off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
              </svg>
              <svg data-secret-when="on" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span class="sr-only">비밀글로 작성</span>
            </label>

            <button type="button" onclick="[##_rp_onclick_submit_##]"
                    data-slot="button" data-variant="default" data-size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
              </svg>
              등록
            </button>
          </div>
        </s_rp_member>
      </div>
    </div>
  </s_rp_input_form>
</section>
</s_rp>
```

**판단 기록:**
- **`<input type="submit">` → `<button type="button">`으로 바꾼다.** 감싸는 `<form>`이 없어 submit 타입이 의미가 없고(오히려 상위에 폼이 생기면 원치 않는 제출이 발생), 아이콘+텍스트 버튼을 쓰려면 `<button>`이어야 한다. `onclick="[##_rp_onclick_submit_##]"`는 **글자 그대로 유지**한다.
- **비밀글은 shadcn Checkbox가 아니라 자물쇠 아이콘 토글**이다(스크린샷). 네이티브 `<input type="checkbox">`를 `.sr-only`로 숨기고 `<label>`을 아이콘 버튼처럼 그린다 — **`:has(:checked)`로 순수 CSS 토글**이라 JS가 0줄이다. 접근성은 실제 체크박스가 그대로 담당한다(Tab 포커스·Space 토글·`aria` 불필요).
- **`<s_rp_member>` 안에 textarea·제출까지 전부 넣는다** — 공식 예제는 textarea/제출을 밖에 뒀지만, 그러면 **댓글 작성이 막힌 상태(회원 전용 등)에서도 입력창만 덩그러니 남는다.** 우리 구조가 더 안전하며 `s_rp_member`가 항상 렌더된다면 결과는 동일하다. **Q8 확인 대상**(만약 `s_rp_member`가 비로그인에서 통째로 사라지는 의미라면 이 배치는 비로그인 댓글을 막아버린다 → 그 경우 공식 예제 배치로 되돌릴 것. **되돌리기는 태그 2개를 옮기는 1분 작업**이라 리스크를 감수할 만하다).
- **게스트 필드는 조건 없이 항상 마크업에 둔다**(요구사항 문서 §4의 제안 그대로). 숨김/노출은 서버가 `<s_rp_guest>`로 판단한다.

---

## 6. 색상 매핑

> **새 raw 색 토큰 0개.** 전량 기존 토큰 재사용이다. 프로즈 스펙이 만든 `--link`가 여기서 두 번째 소비처(댓글 본문 링크)를 얻는다 — 그 스펙 §3-1 4번의 예측대로다.

### 6-1. 전량 매핑표

| 대상 | 속성 | 토큰 | 라이트 유효값 | 다크 유효값 | 근거 |
|---|---|---|---|---|---|
| **섹션 구분선**(4블록 사이) | `border-top` | `--content-divider` | ≈`#d6d6d6` | ≈`#313131` | `content-inner`에서 상속. 프로즈의 `hr`·인용선과 같은 급 = "콘텐츠 경계" |
| 섹션 제목(`post-footer-title`) | `color` | `--color-foreground` | `#000000` | `#fafafa` | 프로즈 h4와 동급 위계 |
| 관련글 제목 | `color` | `--widget-title-color` ← `--content-item-title-color` | 무채색 중간 | 무채색 중간 | §5-1. **목록 화면 글 제목과 정확히 같은 색** |
| 관련글 제목 hover | `color` | `--color-card-foreground` | `#000000` | `#fafafa` | `widgets.css` 112~114행 그대로(라이트/다크 모두 `--foreground`와 동일값) |
| 관련글 날짜 | `color` | `--color-muted-foreground` | `#737373` | `#a1a1a1` | 보조 정보 축 |
| 관련글 항목 구분선 | `border-top` | `--color-border` | `#e5e5e5` | `#ffffff1a` | `widgets.css` 89~91행 그대로. **섹션 구분선보다 옅다**(위계) |
| 태그 chip | 전체 | Badge `outline` | border `#e5e5e5` / bg `#ffffff` / text `#000000` | border `#ffffff26` / bg input 30% / text `#fafafa` | `card.css` 83~101행 그대로 |
| 태그 chip hover | `background` | `--color-accent` | `#f5f5f5` | input 50% | 위와 동일 |
| 공감/공유/복사 버튼 | 전체 | Button `ghost` | hover bg `--color-accent` | hover bg accent 50% | `header.css` 75~82행 |
| 공감 **비활성** 아이콘 | `color` | `--color-muted-foreground` | `#737373` | `#a1a1a1` | 끈 상태임을 색으로 |
| 공감 **활성** 아이콘 | `color` + `fill` | `--color-foreground` / `currentColor` | `#000000` | `#fafafa` | **무채색 유지** — 빨강을 쓰려면 새 색 토큰이 필요하고 이 스킨의 톤과 충돌한다(§8-9) |
| 카운트 숫자 | `color` | `--color-foreground` | `#000000` | `#fafafa` | `tabular-nums` |
| 댓글 수 칩 | `color` | `--color-muted-foreground` | `#737373` | `#a1a1a1` | 클릭 불가 정보이므로 버튼보다 한 단계 낮게 |
| 댓글 작성자 | `color` | `--color-foreground` | `#000000` | `#fafafa` | 600 |
| 댓글 날짜/액션 | `color` | `--color-muted-foreground` | `#737373` | `#a1a1a1` | |
| 댓글 본문 | `color` | `--color-foreground` | `#000000` | `#fafafa` | |
| **댓글 본문 내 링크** | `color` | **`--color-link`** | `#1447e6` | `#8ec5ff` | 프로즈 스펙 §3-1이 만든 전역 토큰의 **두 번째 소비처** |
| 댓글 항목 구분선 | `border-top` | `--color-border` | `#e5e5e5` | `#ffffff1a` | 관련글 항목과 같은 급 |
| 아바타 fallback | `background` / `color` | `--color-muted` / `--color-muted-foreground` | `#f5f5f5` / `#737373` | `#262626` / `#a1a1a1` | shadcn Avatar 원본(`bg-muted text-muted-foreground`) 그대로 |
| Input / Textarea 테두리 | `border-color` | `--color-input` | `#e5e5e5` | `#ffffff26` | shadcn `border-input` |
| Input / Textarea 배경 | `background` | `transparent` / 다크 `color-mix(--color-input 30%)` | — | — | shadcn `bg-transparent dark:bg-input/30` |
| placeholder | `color` | `--color-muted-foreground` | `#737373` | `#a1a1a1` | shadcn 그대로 |
| 입력 포커스 | `border` + `box-shadow` | `--color-ring` + `ring/50` | `#a1a1a1` | `#737373` | shadcn `focus-visible:border-ring ring-[3px] ring-ring/50` |
| 제출 버튼 | 전체 | Button `default` | bg `--color-primary` `#000000` / text `#fafafa` | bg `#e5e5e5` / text `#171717` | `header.css` 43~53행 |
| 비밀글 토글 **켬** | `color` + `background` | `--color-foreground` + `--color-accent` | `#000000` + `#f5f5f5` | `#fafafa` + `#404040` | 켠 상태를 배경으로도 확실히 |
| 비밀글 토글 **끔** | `color` | `--color-muted-foreground` | `#737373` | `#a1a1a1` | |

### 6-2. 새로 선언하는 **구역 스코프 변수 1개** (색이 아니라 별칭)

```css
[data-slot="post-related"] {
  /* widgets.css의 widget-title은 var(--widget-title-color)를 쓰는데 그 변수는
     [data-slot="widgets"]에만 선언돼 있다. 콘텐츠 영역에서는 미정의라 color
     선언 자체가 무효가 되어 색이 조용히 상속돼 버린다 — 여기서 재선언한다.
     값은 content-inner가 이미 갖고 있는 동일 계산식을 그대로 참조한다(새 색 아님). */
  --widget-title-color: var(--content-item-title-color);
}
```

### 6-3. 대비 검증 (WCAG 2.1)

| 조합 | 비율 | 판정 |
|---|---|---|
| 댓글 날짜/액션 `#737373` on `#ffffff` | 4.54 : 1 | AA ✅ (프로즈 스펙 §3-3 재인용) |
| 댓글 날짜/액션 `#a1a1a1` on `#0a0a0a` | 8.05 : 1 | AAA ✅ |
| 댓글 본문 링크 `#1447e6` on `#ffffff` | 6.78 : 1 | AA ✅ |
| 댓글 본문 링크 `#8ec5ff` on `#0a0a0a` | 11.95 : 1 | AAA ✅ |
| 관련글 제목(무채색 중간, ≈`#3a3a3a` on `#ffffff`) | ≈ 11 : 1 | AAA ✅ |
| 제출 버튼 `#fafafa` on `#000000` / `#171717` on `#e5e5e5` | ≈19.5 / ≈10.9 : 1 | AAA ✅ |
| placeholder `#737373` on `#ffffff` | 4.54 : 1 | AA ✅ (placeholder는 WCAG 필수 대상은 아니나 통과) |
| 구분선(섹션/항목) | — | **대상 아님** — 순수 장식 |

---

## 7. 치수 / 여백

> 전부 `calc(var(--spacing) * n)`. 리터럴 px/rem은 **테두리 1px과 shadcn 원본이 px로 고정한 focus ring 3px(= `calc(var(--spacing)*0.75)`로 표기)** 외에 없다.

### 7-1. 요약표

| 항목 | 값 | = px | 근거 |
|---|---|---|---|
| 푸터 전체 위 여백 | `calc(var(--spacing) * 12)` | 48 | 본문 마지막 요소와 액션 바 사이. 프로즈의 h1/h2 위 여백과 동급 |
| **섹션 상하 패딩** (4블록 공통) | `calc(var(--spacing) * 8)` | 32 | 섹션 구분선 위아래 대칭 |
| 섹션 제목 → 내용 | `calc(var(--spacing) * 4)` | 16 | |
| 섹션 제목 크기/굵기 | `--text-base` / `--font-weight-semibold` | 16 / 600 | 프로즈 h4와 정확히 동급(본문 h1=24px 아래) |
| 액션 바 높이 | 버튼 `data-size="sm"` = `calc(var(--spacing)*8)` | 32 | |
| 액션 바 좌/우 그룹 gap | `calc(var(--spacing) * 1)` | 4 | 아이콘 버튼끼리 밀착 |
| 액션 카운트 폰트 | `--text-sm` + `tabular-nums` | 14 | |
| 관련글 항목 높이 | `widget-link` padding-block `calc(var(--spacing)*2.5)` | 10 (행 ≈40) | `widgets.css` 97행 **그대로** |
| 관련글 날짜 폰트 | `--text-xs` | 12 | |
| 관련글 제목↔날짜 gap | `calc(var(--spacing) * 4)` | 16 | |
| 태그 chip gap | `calc(var(--spacing) * 2)` | 8 | 위젯 태그(1.5=6px)보다 한 단계 넓게 — 본문 폭이 720px로 넓다 |
| 태그 chip 자체 | Badge 원본 패딩 `0.5 / 2` | 2 / 8 | `card.css` 60행 그대로 |
| 댓글 항목 상하 패딩 | `calc(var(--spacing) * 5)` | 20 | |
| 아바타 (기본 / 대댓글) | `calc(var(--spacing)*8)` / `calc(var(--spacing)*6)` | 32 / 24 | shadcn `size-8` / `data-[size=sm]:size-6` **그대로** |
| 아바타 ↔ 본문 gap | `calc(var(--spacing) * 3)` | 12 | |
| **대댓글 들여쓰기** | `calc(var(--spacing) * 11)` | 44 | 아바타 32 + gap 12 = 부모 본문 좌측선과 정확히 일치 |
| 댓글 머리(이름/날짜/액션) gap | `calc(var(--spacing) * 2)` | 8 | |
| 댓글 본문 위 여백 | `calc(var(--spacing) * 1.5)` | 6 | |
| 댓글 본문 행간 | `--leading-relaxed` | 1.625 | 프로즈 본문과 동일 |
| 폼 게스트 필드 3열 gap | `calc(var(--spacing) * 2)` | 8 | `grid-template-columns: repeat(3, minmax(0,1fr))` |
| Input 높이 | `calc(var(--spacing) * 9)` | 36 | shadcn `h-9` **그대로** |
| Input/Textarea 패딩 | `calc(var(--spacing)*1) calc(var(--spacing)*3)` / `calc(var(--spacing)*2) calc(var(--spacing)*3)` | 4·12 / 8·12 | shadcn `px-3 py-1` / `px-3 py-2` **그대로** |
| Textarea 최소 높이 | `calc(var(--spacing) * 16)` | 64 | shadcn `min-h-16` **그대로** |
| Input/Textarea radius | `var(--radius-md)` | 8 | shadcn `rounded-md` |
| 포커스 ring | `calc(var(--spacing) * 0.75)` | 3 | shadcn `ring-[3px]` **그대로**(Button 포커스와 이미 동일) |
| 폼 요소 간 세로 gap | `calc(var(--spacing) * 2)` | 8 | |
| 폼 액션 행 gap | `calc(var(--spacing) * 2)` | 8 | 우측 정렬 |

### 7-2. PC 100vw에서 실제 차지하는 폭

`post-single`의 720px를 그대로 상속한다. 관련글 항목은 `제목(flex:1, 말줄임) + 날짜(고정 ≈72px)`, 댓글은 `아바타 32 + gap 12 + 본문 676`. 좌측 사이드바(펼침 256px)·우측 위젯(320px)과 무관하게 **본문과 정확히 같은 좌우 경계**를 유지한다 — 이것이 §1-1에서 `post-single` 안쪽을 택한 실질 이유다.

---

## 8. Tistory / 바닐라 환경 제약으로 원본과 달라지는 부분

| # | 원본 | 이 스킨 | 이유 |
|---|---|---|---|
| 1 | (shadcn Badge를 **마크업**에 작성) | **JS가 앵커에 `data-slot="badge"` 부여** + CSS 폴백 | `[##_tag_label_rep_##]`가 태그 묶음을 통째로 내려주는 단일 치환자라 개별 마크업 자리가 **없다**(§0-2). **환경 제약(불가피)** |
| 2 | (shadcn엔 없음) | 공감 = **localStorage 장식 카운터** | 서버 API도 스킨 치환자도 없다. 숫자는 `liked?1:0`이며 **가짜 수치를 만들지 않는다**(§3-3) |
| 3 | (shadcn엔 없음) | 공유 = **Web Share API + 클립보드 폴백** | 같은 이유. 미지원 브라우저에선 버튼을 숨긴다 |
| 4 | shadcn **DropdownMenu**(Radix) | ⋯ 메뉴 **미구현**, `<s_ad_div>` 인라인 버튼으로 대체 | Popover 프리미티브·`--popover` 토큰 부재 + 데이터 소스 부재(§3-1). **Q1** |
| 5 | React `onClick={handler}` | `onclick="[##_rp_rep_onclick_delete_##]"` **문자열 주입** | 서버가 JS 코드 문자열을 내려준다. 바닐라에선 이게 정상 경로 |
| 6 | Radix Avatar(이미지 실패 감지 → fallback **전환**) | fallback을 **깔고** 이미지가 덮는 CSS 레이어 방식 | Radix 런타임이 없다. 결과(이미지 없으면 fallback)는 동일 |
| 7 | shadcn `<input type="submit">`(문서 예제) | `<button type="button" onclick=…>` | 감싸는 `<form>`이 없어 submit 의미가 없고, 아이콘+텍스트 버튼이 필요 |
| 8 | shadcn `aria-invalid:border-destructive …` | **생략** | `--destructive` 토큰이 이 프로젝트에 아직 없다. 유효성 표시가 필요한 화면도 아니다 |
| 9 | 스크린샷의 **빨간/주황 하트** | **무채색 하트**(활성 시 `currentColor` 채움) | 새 색 토큰을 만들지 않는다. 이 스킨은 프로즈 스펙 이래 "무채색 위계 + 파랑 링크"만으로 통일돼 있다. **Q3** |
| 10 | 스크린샷의 **테두리 있는 카드**(관련글·댓글 폼) | **카드 없이 구분선만** | 우측 위젯 구역이 2026-09-03에 이미 "카드 배경·보더 제거"로 확정했다. 콘텐츠 영역에만 카드 테를 되살리면 화면 안에서 규칙이 두 개가 된다 |
| 11 | shadcn Textarea `field-sizing-content` | 유지 + `min-height` 폴백 | Chrome 123+/Edge만 지원. 미지원 브라우저는 `rows="3"`+`min-height`로 동작 |
| 12 | 공식 예제: textarea·제출이 `<s_rp_member>` **밖** | **안** | 작성이 막힌 상태에서 입력창만 남는 것을 방지(§5-3). **Q8에 따라 되돌릴 수 있음** |

---

## 9. developer 인계

### 9-1. 파일별 변경 목록

| 파일 | 변경 |
|---|---|
| **`components/content.css`** | **671행 뒤에 §11 블록 추가**(§11-0 프리미티브 3종 → §11-1 푸터 공통 → §11-2 액션 바 → §11-3 관련글 → §11-4 태그 → §11-5 댓글). **1~671행은 한 줄도 건드리지 않는다** |
| **`components/content.js`** | `initPostTags()` / `initPostLike()` / `initPostShare()` / `initCommentAvatars()` 추가 + `init()`에 호출 4줄 |
| **`skin.html`** | `<s_permalink_article_rep>`의 `</div>`(309행 본문) 뒤, `</article>`(310행) **앞**에 §3-2·§5-1·§5-2·§5-3 마크업 삽입 |
| **`tools/make-preview.mjs`** | §10 그대로 적용(전역 치환자 추가 + `PERMALINK_REPEATS` 신설 + permalink 분기에서 호출) |
| **`src/input.css`** | **변경 없음 ★** — 새 색·크기·자간 토큰이 **0개**다 |
| **`tailwind.css`** | **재빌드 필요**(`bun run skin:build`). `class=`는 `sr-only`만 쓰지만 이미 사용 중이라 산출물이 동일할 가능성이 높다 — **md5 전후 비교를 검증 문서에 기록**(선행 구역 관례) |
| **`README.md`** | 업로드 파일 목록 **변경 없음**(새 파일 0개, 10개 유지) |

### 9-2. `content.js` 추가 함수 (전문)

```js
/* [FOOTER SPEC §3-3] 공감 — 서버 API가 없는 로컬 전용 장식 카운터.
   실제 다른 방문자의 공감은 알 수 없으므로 숫자는 항상 0 또는 1이다.
   가짜 수치를 만들지 않는다. */
function initPostLike() {
  var btn = document.querySelector("[data-post-like]");
  if (!btn) return;

  var out = btn.querySelector("[data-post-like-count]");
  var KEY = "daitnu-post-like:" + window.location.pathname;
  var on = false;
  try { on = localStorage.getItem(KEY) === "1"; } catch (e) {}

  function paint() {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("data-liked", on ? "true" : "false");
    if (out) out.textContent = on ? "1" : "0";
  }

  btn.addEventListener("click", function () {
    on = !on;
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {}
    paint();
  });

  paint();
}

/* [FOOTER SPEC §3-1] 공유 / 링크 복사.
   공유는 Web Share API가 있을 때만 노출한다(없으면 눌러도 아무 일이 없는
   버튼이 남는다). 복사는 Clipboard API → execCommand 순으로 폴백. */
function initPostShare() {
  var status = document.querySelector("[data-post-status]");

  function say(msg) { if (status) status.textContent = msg; }

  var share = document.querySelector("[data-post-share]");
  if (share && navigator.share) {
    share.removeAttribute("hidden");
    share.addEventListener("click", function () {
      navigator.share({
        title: document.title,
        url: window.location.href
      }).catch(function () {});
    });
  }

  var copy = document.querySelector("[data-post-copy]");
  if (!copy) return;

  copy.addEventListener("click", function () {
    var url = window.location.href;
    var done = function () {
      copy.setAttribute("data-copied", "true");
      say("링크를 복사했습니다");
      setTimeout(function () { copy.removeAttribute("data-copied"); }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () { say("복사에 실패했습니다"); });
      return;
    }
    /* 구형 폴백 — 화면 밖 textarea + execCommand */
    try {
      var ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      done();
    } catch (e) { say("복사에 실패했습니다"); }
  });
}

/* [FOOTER SPEC §5-2 / Q10] 댓글 아바타 방어.
   [##_rp_rep_logo_##]가 <img> 요소가 아니라 URL 문자열을 내려주는 경우,
   그대로 두면 댓글마다 주소가 텍스트로 노출된다. 요소 자식이 없고
   내용이 URL처럼 보일 때만 <img>로 승격한다. */
function initCommentAvatars() {
  var boxes = document.querySelectorAll("[data-comment-logo]");
  if (!boxes.length) return;

  Array.prototype.forEach.call(boxes, function (box) {
    if (box.querySelector("img")) return;                 // 이미 <img>면 그대로
    var text = (box.textContent || "").trim();
    if (!/^(https?:)?\/\//.test(text)) {                   // URL이 아니면
      /* 남아 있는 텍스트 노드만 제거 — fallback(요소 자식)은 그대로 둔다 */
      for (var i = box.childNodes.length - 1; i >= 0; i--) {
        if (box.childNodes[i].nodeType === 3) box.removeChild(box.childNodes[i]);
      }
      return;
    }
    for (var j = box.childNodes.length - 1; j >= 0; j--) {
      if (box.childNodes[j].nodeType === 3) box.removeChild(box.childNodes[j]);
    }
    var img = document.createElement("img");
    img.setAttribute("data-slot", "avatar-image");
    img.setAttribute("alt", "");
    img.setAttribute("loading", "lazy");
    img.src = text;
    box.appendChild(img);
  });
}
```

`initPostTags()`는 §4-2에 전문이 있다. `init()`에 5줄을 추가한다:

```js
  function init() {
    initPaginationActiveState();
    initSquareGrid();
    initViewToggle();
    initProseTables();
    initPostTags();          /* [FOOTER SPEC §4-2] */
    initPostLike();          /* [FOOTER SPEC §3-3] */
    initPostShare();         /* [FOOTER SPEC §3-1] */
    initCommentAvatars();    /* [FOOTER SPEC §5-2] */
  }
```

### 9-3. CSS 핵심 규칙 — 반드시 이 형태로 (나머지는 §6·§7 표에서 기계적으로 유도)

```css
/* §11-0 공용 프리미티브 — Textarea / Input / Avatar (shadcn 정본, §2)
   ★ 지금은 댓글 폼만 쓴다. 두 번째 구역이 쓰게 되면 tooltip.css 선례대로
     components/form.css로 분리할 것. */
[data-slot="textarea"] {
  display: flex;
  field-sizing: content;                       /* Chrome 123+; 미지원 시 아래 min-height */
  min-height: calc(var(--spacing) * 32);
  width: 100%;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  border: 1px solid var(--color-input);
  border-radius: var(--radius-md);
  background-color: transparent;
  box-shadow: var(--shadow-xs);
  font: var(--font-weight-normal) var(--text-sm)/var(--leading-normal) var(--font-sans);
  letter-spacing: var(--tracking-sm);
  color: var(--color-foreground);
  outline: none;
  resize: vertical;
  transition-property: color, box-shadow, border-color;
  transition-duration: var(--default-transition-duration);
  transition-timing-function: var(--default-transition-timing-function);
}
[data-slot="input"] {
  height: calc(var(--spacing) * 9);
  width: 100%;
  min-width: 0;
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 3);
  /* 나머지는 textarea와 동일 — 실제 파일에서는 선택자를 묶어 쓸 것 */
}
[data-slot="textarea"]::placeholder,
[data-slot="input"]::placeholder { color: var(--color-muted-foreground); }

[data-slot="textarea"]:focus-visible,
[data-slot="input"]:focus-visible {
  border-color: var(--color-ring);
  box-shadow: 0 0 0 calc(var(--spacing) * 0.75) color-mix(in oklab, var(--color-ring) 50%, transparent);
}
.dark [data-slot="textarea"],
.dark [data-slot="input"] { background-color: color-mix(in oklab, var(--color-input) 30%, transparent); }

[data-slot="avatar"] {
  position: relative;
  display: flex;
  flex-shrink: 0;
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  overflow: hidden;
  border-radius: calc(var(--spacing) * 999);
  user-select: none;
}
[data-slot="avatar"][data-size="sm"] { width: calc(var(--spacing) * 6); height: calc(var(--spacing) * 6); }
[data-slot="avatar"][data-size="lg"] { width: calc(var(--spacing) * 10); height: calc(var(--spacing) * 10); }

/* ★ Radix가 없으므로 fallback을 "깔고" 이미지가 덮는다 (§8-6) */
[data-slot="avatar-fallback"] {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  background-color: var(--color-muted);
  color: var(--color-muted-foreground);
  font-size: var(--text-sm);
}
[data-slot="avatar-fallback"] > svg { width: 55%; height: 55%; }
[data-slot="avatar-image"],
[data-slot="avatar"] img {
  position: relative;
  z-index: 1;
  aspect-ratio: 1 / 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* §11-1 푸터 공통 — 섹션 구분선은 인접 결합자가 아니라 각자의 border-top으로
   준다. 그래야 블록 순서를 바꿔도 CSS를 고칠 필요가 없다(§1-2). */
[data-slot="post-footer"] { margin-top: calc(var(--spacing) * 12); }
[data-slot="post-footer"] > * {
  padding-block: calc(var(--spacing) * 8);
  border-top: 1px solid var(--content-divider);
}
[data-slot="post-footer-title"] {
  margin: 0 0 calc(var(--spacing) * 4);
  font: var(--font-weight-semibold) var(--text-base)/var(--leading-snug) var(--font-sans);
  letter-spacing: var(--tracking-base);
  color: var(--color-foreground);
  word-break: keep-all;
}

/* §11-2 액션 바 */
[data-slot="post-actions"] { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--spacing) * 4); }
[data-slot="post-actions-start"],
[data-slot="post-actions-end"] { display: flex; align-items: center; gap: calc(var(--spacing) * 1); }
[data-slot="post-action-count"] { font-variant-numeric: tabular-nums; }
[data-post-like] > svg { color: var(--color-muted-foreground); }
[data-post-like][data-liked="true"] > svg { color: var(--color-foreground); fill: currentColor; }
[data-slot="post-action-stat"] {
  display: inline-flex; align-items: center; gap: calc(var(--spacing) * 1.5);
  padding-inline: calc(var(--spacing) * 2);
  font: var(--font-weight-medium) var(--text-sm)/1 var(--font-sans);
  letter-spacing: var(--tracking-sm);
  color: var(--color-muted-foreground);
}
[data-slot="post-action-stat"] > svg { width: calc(var(--spacing) * 4); height: calc(var(--spacing) * 4); }
[data-post-copy] > [data-copy-when="done"] { display: none; }
[data-post-copy][data-copied="true"] > [data-copy-when="idle"] { display: none; }
[data-post-copy][data-copied="true"] > [data-copy-when="done"] { display: inline-flex; }
[data-slot="post-admin"] { display: inline-flex; align-items: center; gap: calc(var(--spacing) * 1); }

/* §11-3 관련글 — widget-* 재사용 + 보정 2가지 */
[data-slot="post-related"] { --widget-title-color: var(--content-item-title-color); }   /* §6-2 */
[data-slot="post-related-title-link"] { color: inherit; text-decoration: none; }
[data-slot="post-related-title-link"]:hover { text-decoration: underline; text-underline-offset: calc(var(--spacing) * 1); }
[data-slot="post-related-date"] {
  flex-shrink: 0;
  margin-left: calc(var(--spacing) * 4);
  font: var(--font-weight-normal) var(--text-xs)/var(--leading-normal) var(--font-sans);
  letter-spacing: var(--tracking-xs);
  color: var(--color-muted-foreground);
  font-variant-numeric: tabular-nums;
}

/* §11-4 태그 — JS 정규화 성공 시 */
[data-slot="post-tags-list"][data-tags="normalized"] {
  display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 2);
}
[data-slot="post-tags-list"] [data-slot="badge"]::before { content: "#"; opacity: 0.5; }
/* JS 미실행 폴백 — chip이 아니라 인라인 링크 나열(쉼표가 그대로 보인다) */
[data-slot="post-tags-list"]:not([data-tags="normalized"]) {
  font: var(--font-weight-normal) var(--text-sm)/var(--leading-normal) var(--font-sans);
  letter-spacing: var(--tracking-sm);
  color: var(--color-muted-foreground);
}
[data-slot="post-tags-list"]:not([data-tags="normalized"]) a { color: var(--color-link); text-decoration: none; }

/* §11-5 댓글 */
[data-slot="comment-list"],
[data-slot="comment-replies"] { margin: 0; padding: 0; list-style: none; }
[data-slot="comment-item"] { padding-block: calc(var(--spacing) * 5); }
[data-slot="comment-item"] + [data-slot="comment-item"] { border-top: 1px solid var(--color-border); }
[data-slot="comment-main"] { display: flex; align-items: flex-start; gap: calc(var(--spacing) * 3); }
[data-slot="comment-body"] { flex: 1 1 auto; min-width: 0; }
[data-slot="comment-head"] { display: flex; align-items: center; flex-wrap: wrap; gap: calc(var(--spacing) * 2); }
[data-slot="comment-author"] {
  font: var(--font-weight-semibold) var(--text-sm)/var(--leading-snug) var(--font-sans);
  letter-spacing: var(--tracking-sm);
  color: var(--color-foreground);
}
[data-slot="comment-date"] {
  font: var(--font-weight-normal) var(--text-xs)/var(--leading-normal) var(--font-sans);
  letter-spacing: var(--tracking-xs);
  color: var(--color-muted-foreground);
  text-decoration: none;
}
[data-slot="comment-actions"] { margin-left: auto; display: inline-flex; gap: calc(var(--spacing) * 1); opacity: 0; transition-property: opacity; transition-duration: var(--default-transition-duration); }
[data-slot="comment-item"]:hover [data-slot="comment-actions"],
[data-slot="comment-actions"]:focus-within { opacity: 1; }
[data-slot="comment-desc"] {
  margin-top: calc(var(--spacing) * 1.5);
  font: var(--font-weight-normal) var(--text-sm)/var(--leading-relaxed) var(--font-sans);
  letter-spacing: var(--tracking-sm);
  color: var(--color-foreground);
  word-break: keep-all;
  overflow-wrap: break-word;
}
[data-slot="comment-desc"] a { color: var(--color-link); text-underline-offset: calc(var(--spacing) * 1); }
[data-slot="comment-desc"] :is(img, iframe, video) { max-width: 100%; border-radius: var(--radius-md); }
[data-slot="comment-replies"] { margin-left: calc(var(--spacing) * 11); }
[data-slot="comment-replies"] > [data-slot="comment-item"]:first-child { border-top: 1px solid var(--color-border); }

/* 작성 폼 */
[data-slot="comment-form"] {
  display: flex; align-items: flex-start; gap: calc(var(--spacing) * 3);
  margin-top: calc(var(--spacing) * 6);
}
[data-slot="comment-form-body"] { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: calc(var(--spacing) * 2); }
[data-slot="comment-form-guest"] { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: calc(var(--spacing) * 2); }
[data-slot="comment-form-actions"] { display: flex; align-items: center; justify-content: flex-end; gap: calc(var(--spacing) * 2); }

/* 비밀글 토글 — JS 0줄, :has(:checked) 순수 CSS */
[data-slot="comment-secret"] {
  display: inline-flex; align-items: center; justify-content: center;
  width: calc(var(--spacing) * 8); height: calc(var(--spacing) * 8);
  border-radius: var(--radius-md);
  color: var(--color-muted-foreground);
  cursor: pointer;
  transition-property: color, background-color;
  transition-duration: var(--default-transition-duration);
}
[data-slot="comment-secret"] > svg { width: calc(var(--spacing) * 4); height: calc(var(--spacing) * 4); }
[data-slot="comment-secret"] > [data-secret-when="on"] { display: none; }
[data-slot="comment-secret"]:has(:checked) { background-color: var(--color-accent); color: var(--color-foreground); }
[data-slot="comment-secret"]:has(:checked) > [data-secret-when="off"] { display: none; }
[data-slot="comment-secret"]:has(:checked) > [data-secret-when="on"] { display: inline-flex; }
[data-slot="comment-secret"]:has(:focus-visible) {
  box-shadow: 0 0 0 calc(var(--spacing) * 0.75) color-mix(in oklab, var(--color-ring) 50%, transparent);
}
```

### 9-4. Playwright 검증 체크리스트

> `_workspace/content_mockup-permalink.html`(§10 적용 후) 기준. **라이트/다크 각각** 수행.

**구조**
1. `post-footer`가 `post-single` **안**에 있고, 4개 블록의 좌우 경계가 `post-single-body`와 **정확히 동일**(`getBoundingClientRect().left/right` 일치).
2. 4개 블록 각각 `paddingTop === paddingBottom === "32px"`, `borderTopWidth === "1px"` + 색이 `--content-divider` 계산값.
3. **프로즈 규칙 미유출**: `post-footer` 안 임의 `<p>`/`<a>`의 `marginTop`이 16px가 **아니고**, 링크 색이 프로즈 규칙이 아니라 §11-5 규칙에서 온 것.

**① 액션 바**
4. 공감 클릭 → `aria-pressed="true"`, 숫자 `0→1`, 하트 `fill`이 `none`이 아님. **새로고침 후에도 유지**(localStorage).
5. 다시 클릭 → `0`, `aria-pressed="false"`.
6. `navigator.share`를 삭제한 컨텍스트에서 공유 버튼이 `hidden`으로 남는지 / 존재하도록 stub하면 `hidden`이 제거되는지.
7. 링크 복사 클릭 → `data-copied="true"` + 체크 아이콘 표시 + 1.6초 뒤 원복 + `[data-post-status]` 텍스트 변경. (`context.grantPermissions(["clipboard-write"])` 필요)
8. `<s_ad_div>` 블록이 목업에서 보이는지(실사이트에선 관리자에게만 — **이 확인은 목업 한정**).

**② 관련글**
9. 항목이 **5개** 렌더(반복 블록이 실제로 확장됐는지 — §0-1의 정정이 반영됐다는 증거).
10. `widget-title`의 `color`가 `--content-item-title-color` 계산값과 **정확히 일치**(§6-2가 없으면 여기서 다른 색이 나온다 — **반드시 실측**).
11. hover 시 제목 색이 `--color-card-foreground`로 바뀌는지.
12. 아주 긴 제목이 **한 줄 말줄임**(`scrollWidth > clientWidth` + `textOverflow: ellipsis`)이고 날짜가 밀려나지 않는지.
13. 항목 사이 `border-top`이 `--color-border`(섹션 구분선보다 옅음).

**③ 태그**
14. JS 실행 후 `[data-tags="normalized"]`가 붙고, 모든 `<a>`에 `data-slot="badge"`·`data-variant="outline"`, 컨테이너에 **텍스트 노드가 0개**(쉼표가 사라졌는지).
15. `::before`가 `#`을 렌더(`getComputedStyle(a, "::before").content`).
16. **`content.js`를 뺀 사본**(`content_mockup-permalink-nojs.html`)에서 태그가 여전히 읽히는지(폴백, 쉼표 보여도 OK) + 콘솔 에러 0.
17. 태그가 여러 줄로 wrap되고 가로 오버플로 0.

**④ 댓글**
18. 댓글 3개 + 대댓글 1개가 렌더되고, **대댓글 본문 좌측선이 부모 본문 좌측선과 정확히 일치**(들여쓰기 44px 검증).
19. 아바타: 이미지 있는 댓글은 이미지가 fallback을 **덮고**(`z-index`), 없는 댓글은 fallback 아이콘이 보임.
20. `[data-comment-logo]`에 URL 문자열을 넣은 케이스에서 `initCommentAvatars()`가 `<img>`로 승격했는지(목업에 1건 포함).
21. 댓글 액션(답글/수정·삭제)이 기본 `opacity:0`, hover/포커스에서 1 — **Tab만으로도 도달 가능한지**(`:focus-within`).
22. 댓글 본문 안 링크 색이 `--color-link` 계산값.
23. 게스트 입력 3칸이 **정확히 3등분**(각 폭 동일 ±1px).
24. textarea 포커스 → `borderColor`가 `--color-ring`, `boxShadow`에 3px ring.
25. 비밀글 라벨 클릭 → 숨은 체크박스 `checked === true` + 자물쇠가 잠긴 아이콘으로 교체 + 배경이 `--color-accent`. **Tab→Space로도 동작**하는지.
26. 제출 버튼이 Button `default` 스타일(primary 배경)로 렌더되고, `onclick` 속성 문자열이 그대로 살아있는지.

**회귀 / 공통**
27. 인덱스 목업(`sidebar_mockup-preview.html`)에 `post-footer`가 **존재하지 않는지**(permalink 전용 블록이 목록에 새지 않았는지).
28. permalink에서 격자 배경 여전히 `none`, 목록 타이틀 `display:none`(`:has(post-single)` 분기 정상).
29. 긴 댓글 목록에서 **문서가 아니라 `content-inner`가 스크롤**되고 커스텀 스크롤바·`scroll-fade-y` 정상.
30. 가로 오버플로 0(`document.scrollingElement.scrollWidth === window.innerWidth`), 콘솔 에러 0, 라이트/다크 스크린샷 각 1장.

---

## 10. `make-preview.mjs` 목업 데이터 — 그대로 복붙할 완성본

### 10-1. 적용 방법 (4단계)

1. **`SUBSTITUTIONS`(35~67행) 안에** §10-2의 전역 치환자 블록을 추가한다.
2. **`PROSE_SAMPLE` 대입(163행) 바로 아래**에 §10-3의 `AVATAR` 상수와 `PERMALINK_REPEATS` 배열을 추가한다.
3. **`render()`의 permalink 분기(392~396행)에** 확장 호출 1줄을 추가한다(§10-4).
4. 재생성: `bun dashboard-skin/tools/make-preview.mjs`

**파이프라인 안전성 확인(스펙 저자 검토):**
- `PERMALINK_REPEATS`는 **반드시 `mode === "permalink"` 분기 안에서만** 호출한다. 전역 `REPEATS`(0단계)에 넣으면 index 모드에서도 확장한 뒤 곧바로 통째로 지워지는 낭비가 생기고, 무엇보다 **`s_rp2_rep` → `s_rp_rep` 순서 의존**(아래)이 다른 위젯 확장과 뒤섞인다.
- **★ 확장 순서가 결정적이다.** 대댓글 `s_rp2_rep`는 부모와 **완전히 같은 치환자 이름**(`rp_rep_name` 등)을 쓴다(§0-3). `s_rp_rep`를 먼저 확장하면 부모의 값이 중첩된 대댓글 템플릿 안까지 **먼저 채워져** 대댓글 전용 값을 넣을 자리가 사라진다. 그래서 배열에 **`s_rp2_rep`를 먼저** 놓는다(`expandRepeats`는 배열 순서대로 처리한다).
- 그다음 `s_rp_rep`가 `conditional: { tag: "s_rp2_container", when: (i) => i === 1 }`로 **두 번째 댓글에만** 대댓글 블록을 남기고 나머지 복사본에서는 통째로 제거한다. 이때 대댓글은 이미 리터럴로 채워져 있으므로 부모 값 치환에 영향받지 않는다.
- 목업 문자열 어디에도 `</?s_…>` · `[##_…_##]` · `./images/` · `@@SKIN_COMMENT_n@@` 패턴이 없으므로 render()의 나머지 단계와 충돌하지 않는다.

### 10-2. `SUBSTITUTIONS`에 추가 (전역 치환자)

```js
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
```

### 10-3. `PERMALINK_REPEATS` (163행 `SUBSTITUTIONS.article_rep_desc = PROSE_SAMPLE;` 바로 아래)

```js
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
```

### 10-4. `render()` permalink 분기 (392~396행) 수정

```js
  if (mode === "permalink") {
    html = html.replace(/<s_index_article_rep>[\s\S]*?<\/s_index_article_rep>/g, "");
    html = html.replace(/<s_list>[\s\S]*?<\/s_list>/g, "");
    html = html.replace(/<s_paging>[\s\S]*?<\/s_paging>/g, "");
    /* [FOOTER SPEC §10-4] 하단 4종 반복 블록 — 이 분기 안에서만 확장한다.
       (index 모드에서는 위 <s_permalink_article_rep> 제거로 이미 사라졌다) */
    html = expandRepeats(html, PERMALINK_REPEATS);
  } else {
```

> `content_mockup-permalink-nojs.html`(이미 존재)은 `content.js`를 뺀 사본이라 **§9-4의 16번(태그 폴백)·20번 반대 케이스**를 그대로 검증할 수 있다. 새 출력 파일은 필요 없다.

---

## 11. 확인 필요 (사용자 결정 사항)

> **Q1~Q5는 디자인 결정**(사용자가 답하면 즉시 반영 가능), **Q6~Q10은 실사이트 계정이 있어야만 확정 가능한 사실 확인**이다. 전부 **제안값으로 진행 가능**하도록 써 뒀다.

| # | 항목 | 제안값 | 근거 / 대안 |
|---|---|---|---|
| **Q1** | 스크린샷의 **더보기(⋯) 메뉴**를 만들 것인가 | **만들지 않음.** `<s_ad_div>` 관리 버튼으로 대체 | Popover 프리미티브·`--popover` 토큰이 없고, ⋯에 넣을 데이터 소스도 없다(§3-1). 원하면 **DropdownMenu 프리미티브 신설 = 별도 구역**으로 진행 |
| **Q2** | **공감** 버튼을 넣을 것인가 | **넣되 localStorage 장식 카운터로**(숫자 0/1) | 서버 API 없음. 실제 티스토리 공감이 플랫폼 레벨로 주입된다면 중복될 수 있다(Q6과 연동). "가짜 숫자는 싫다"면 **숫자를 빼고 토글만** 남기는 것도 1줄 변경 |
| **Q3** | 공감 하트 **색** | **무채색**(활성 시 `currentColor` 채움) | 빨강을 쓰려면 새 색 토큰이 필요하고, 이 스킨은 프로즈 이래 "무채색 + 파랑 링크"로 통일돼 있다 |
| **Q4** | 공유 버튼 **개수** | **2개**(Web Share + 링크 복사) | 스크린샷의 2개 자리를 **실제로 서로 다른 동작**으로 채운다. SNS 대상을 지어내지 않는다. 1개로 줄이려면 Web Share 쪽을 빼면 된다(데스크톱에선 어차피 숨겨짐) |
| **Q5** | 관련글에 **썸네일**을 넣을 것인가 | **넣지 않음**(텍스트 목록) | 스크린샷이 텍스트 목록이고, 우측 위젯 "인기 글"에서 같은 결정을 이미 내렸다. 넣으려면 §10-3 주석의 `conditional` 한 줄 + `widget-thumb` 재사용 |
| **Q6** | 티스토리가 **자체 공감/공유 UI를 서버에서 주입**하는가 | 미검증 | 주입된다면 우리 액션 바와 중복된다. 관리 메뉴바 선례(2회)가 있어 가능성이 낮지 않다 |
| **Q7** | **`[##_tag_label_rep_##]`의 실제 출력 형태** | "쉼표 구분 앵커 나열"로 추정 | §4-2 구현은 **형태 비의존**이라 어떤 형태여도 동작하지만, 만약 앵커가 아니라 `<span>`이나 평문이면 chip이 안 붙고 폴백 스타일로 남는다 |
| **Q8** | **`<s_rp_member>`의 정확한 의미** | "댓글 작성 영역 전체를 감싸는 그룹, 안쪽 `<s_rp_guest>`가 비로그인 전용" | 이 해석이 틀려서 `s_rp_member`가 비로그인에서 통째로 사라진다면 **비로그인 댓글 작성이 막힌다** — 그 경우 textarea·제출을 `s_rp_member` 밖으로 빼면 즉시 해결(태그 2개 이동) |
| **Q9** | **`[##_rp_rep_class_##]`가 내려주는 값** | 미검증 — 유지하되 **스타일 안 검 |
| | | | 걺** | 값이 확인되면(예: 작성자 구분) `[data-slot="comment-item"].그값 { … }` 한 줄로 블로그 주인 댓글을 강조할 수 있다 |
| **Q10** | **`[##_rp_rep_logo_##]`가 `<img>` 요소인가 URL 문자열인가** | `<img>` 요소로 추정 | 공식 예제가 `<span class="image">[##_rp_rep_logo_##]</span>`로 감싸 쓰므로. **둘 다 대응하는 방어를 이미 넣었다**(§9-2 `initCommentAvatars`) |

### 11-1. 이번 구역에서 **하지 않기로** 명시한 것

- **TOC · 반응형** — 범위 밖(요청 그대로).
- **이전/다음 글 내비게이션**(`<s_article_prev>` / `<s_article_next>`) — 존재를 §0-4에 기록만 해 뒀다. 다음 구역 후보.
- **`[##_comment_group_##]`(티스토리 자동 렌더 댓글)** — 오케스트레이터가 이미 배제 결정.
- **댓글 페이징** — 공식 문서에 해당 치환자가 없다(티스토리 댓글은 전량 렌더).
- **`--secondary` / `--destructive` / `--popover` 토큰 신설** — 이 구역에 필요 없다(삭제 버튼도 ghost로 처리).
