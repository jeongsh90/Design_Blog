# 제목: KoPub돋움 무료 한글 웹폰트 — 전자책·문서용 표준 고딕체

- 카테고리: Design > Font
- 태그: KoPub돋움, 무료폰트, 한글폰트, 고딕체, 웹폰트
- 메타디스크립션: 문화체육관광부와 한국출판인회의가 배포하는 무료 한글 폰트 KoPub돋움을 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.
- 썸네일: attachments/thumbnail.png(1200×630, IHDR 픽셀 크기 검증 완료 — 배치6에서 제작)

## 제외된 항목
- 없음

## 발행 안내
1. 티스토리 글쓰기 → HTML 모드 전환 → final.html 내용 붙여넣기
2. 카테고리 Design > Font 지정, 위 태그 입력
3. 대표이미지로 attachments/thumbnail.png 첨부
4. **신규 발행 직후 CDN 16:9 패딩 버그 예방 절차 필수**: 대표이미지를 한 번 삭제 후 같은 파일을 재업로드→재발행(R1200x0으로 실제 노출 크기 재검증)
5. 당일 공개 발행 한도(15개)를 확인한 뒤 공개로 저장(이 글은 2026-09-07 세션에서 한도 소진으로 발행하지 못해 로컬 파일로만 준비됨 — 이전 세션에 티스토리 관리자 화면에 임시저장까지 해둔 동일 내용의 초안이 별도로 남아있을 수 있으니, 실제 등록 전에 `/manage/newpost/` 임시저장 목록에 중복 글이 있는지 먼저 확인)

## 검증 기록
- 1차 출처: noonnu.cc 해당 폰트 페이지, 한국출판인회의(kopus.org) 다운로드 페이지
- 확인 시점: 2026-09-07(이전 배치 세션)
- 직접 검증한 항목: @font-face 코드는 Playwright로 noonnu 페이지를 직접 열어 `document.documentElement.innerHTML`에서 실측 확인(WebFetch 미사용) — `font-family: 'KoPubDotumMedium'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_two@1.0/KoPubDotumMedium.woff') format('woff');`. 라이선스 표(인쇄/웹사이트/포장지/영상/임베딩/BI·CI/폰트 파일 자체 조건) 원문 대조.
- 미검증 항목: 다운로드 페이지(kopus.org)의 실제 다운로드 버튼 클릭까지는 수행하지 않음(링크 URL만 확인)
