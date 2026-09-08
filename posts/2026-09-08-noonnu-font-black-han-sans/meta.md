# 제목: 검은고딕(Black Han Sans) 무료 한글 웹폰트 — 꽉 찬 두꺼운 제목용 고딕체

- 카테고리: Design > Font
- 태그: 검은고딕, BlackHanSans, 무료폰트, 한글폰트, 고딕체
- 메타디스크립션: ZESSTYPE이 배포하고 Google Fonts로도 서빙되는 무료 한글 폰트 검은고딕(Black Han Sans)을 실제 페이지 기준으로 검증해 라이선스(SIL OFL 1.1)와 웹폰트 코드까지 정리했습니다.
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
- 1차 출처: noonnu.cc 검은고딕 페이지(font_page/106)
- 확인 시점: 2026-09-08
- 직접 검증한 항목: Playwright로 noonnu 페이지를 직접 열어 `document.documentElement.innerHTML`에서 정규식으로 @font-face를 찾았으나 개별 @font-face 블록은 없고 "웹폰트로 사용" 섹션에 `@import url('https://fonts.googleapis.com/css?family=Black+Han+Sans:400');`만 존재함을 확인(WebFetch 미사용) — 스포카 한 산스(id25)·본고딕(id34) 때와 동일한 패턴으로, 실제 Google Fonts CSS(fonts.googleapis.com→fonts.gstatic.com)를 직접 열어 실존하는 woff2 리소스임을 확인 후 채택. 라이선스 본문(SIL OFL 1.1)·요약표 전문 대조.
- **참고**: 이 폰트는 noonnu 페이지 자체에 개별 @font-face 코드가 없고 Google Fonts CSS를 불러오는 @import 코드만 제공되지만, 실제 CDN이 정상 작동하는 woff2 리소스를 서빙해 모던 브라우저에서 정상 렌더링된다.
- 미검증 항목: Google Fonts 공식 페이지의 실제 다운로드 절차까지는 수행하지 않음(링크 URL만 확인)
