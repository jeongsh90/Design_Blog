# `header.css` — 설계 주석

소스: `dashboard-skin/components/header.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. [RESPONSIVE SPEC §5-3] 모바일(≤767px) 헤더

─────────────────────────────────────────────────────────────
   [RESPONSIVE SPEC §5-3] 모바일(≤767px) 헤더
   shadcn 정본이 자기 블록에서 쓰는 처리를 그대로 따른다:
   blocks/sidebar-07/page.tsx —
     <BreadcrumbItem className="hidden md:block"> / <BreadcrumbSeparator className="hidden md:block" />
   즉 선행 크럼(블로그 제목)과 구분자는 md(768) 미만에서 숨기고
   현재 페이지 크럼만 남긴다.
   ─────────────────────────────────────────────────────────────

