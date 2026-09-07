# 제목: Ruflo — Claude Code를 멀티 에이전트 팀으로 바꿔주는 무료 오픈소스 하네스

- 카테고리: Ai > Skill
- 태그: Ruflo, Claude Code, Claude Flow, 에이전트 스웜, MCP, AI 에이전트, 오픈소스, 개발자 도구
- 메타디스크립션: Claude Code에 100개 이상의 전문 에이전트와 공유 메모리, 자동 모델 라우팅을 얹어주는 무료 오픈소스 도구 Ruflo(구 Claude Flow)를 공식 README 기준으로 설치 방법부터 사용법까지 정리했습니다.
- 썸네일: attachments/thumbnail.png(공식 README 배너 이미지 기반 제작, 첨부 완료)

## 제외된 항목
- 없음 — 사용자가 제공한 초기 참고 링크(ruflo.biz)는 실측 결과 별개의 유료 SaaS 사이트로 확인되어 제외하고, 사용자가 재확인해 준 실제 오픈소스 저장소(github.com/ruvnet/ruflo)를 1차 출처로 삼아 작성했습니다.

## 발행 안내
1. 티스토리 글쓰기 → HTML 모드 전환 → final.html 내용 붙여넣기
2. 카테고리 Ai > Skill 지정, 위 태그 입력
3. 사용자 요청대로 **비공개로 저장**(당일 공개 발행 한도 15개 소진 상태) — 한도 초기화 후 공개 전환

## 검증 기록
- 확인 모델/도구: Ruflo(구 Claude Flow), github.com/ruvnet/ruflo 공식 README
- 확인 시점: 2026-09-07
- 직접 검증한 항목: README 원문 대조(설치 명령어·기능 목록·라이선스 원문 인용) + `npm install -g ruflo@latest` 실제 전역 설치 완료(사용자 요청으로 수행) + `ruflo --version`(v3.38.21)·`ruflo --help` 실행 확인 — `agent`/`swarm`/`memory`/`hive-mind`/`hooks` 등 명령어 구조가 README 설명과 일치함을 실측
- 미검증 항목: `ruflo init`으로 실제 프로젝트를 초기화해 에이전트를 구동해보는 것은 하지 않음(이 저장소는 Ruflo와 무관한 별도 프로젝트라 `.claude/`·`CLAUDE.md` 등 관련 파일 생성을 의도적으로 생략). 에이전트 자동 라우팅 정확도 89% 등 구체 수치는 여전히 공식 문서 주장값. final.html에 동일 내용 명시함
