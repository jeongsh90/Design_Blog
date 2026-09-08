# 제목: 서울한강체 무료 한글 웹폰트 — 한강의 결을 담은 둥근 바탕체

- 카테고리: Design > Font
- 태그: 서울한강체, 무료폰트, 한글폰트, 바탕체, 웹폰트
- 메타디스크립션: 서울시청이 배포하는 무료 한글 폰트 서울한강체를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.
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
- 1차 출처: noonnu.cc 서울한강체 페이지, 서울시청(seoul.go.kr)
- 확인 시점: 2026-09-07
- 직접 검증한 항목: @font-face 코드는 Playwright로 noonnu 페이지를 직접 열어 `document.documentElement.innerHTML`에서 정규식으로 실측 확인(WebFetch 미사용) — `font-family: 'SeoulHangang'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_two@1.0/SeoulHangangM.woff') format('woff');`(페이지 하단 "웹폰트로 사용" 섹션에 실제 노출된 family명 사용). 서울서체 라이선스 본문과 요약표 원문 대조(서울남산체와 동일 라이선스, 자매 폰트).
- 미검증 항목: 서울시청 홈페이지의 실제 다운로드 절차까지는 수행하지 않음(링크 URL만 확인)
