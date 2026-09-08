# 제목: Claude Code 필수 스킬 5개 — 설치부터 검증까지

- 카테고리: Ai > Skill
- 태그: Claude Code, Agent Skills, agent-browser, find-skills, GSD, design-taste, mcp-builder, Vercel Labs, 개발자 도구
- 메타디스크립션: Claude Code 필수 스킬 5개(agent-browser, find-skills, GSD Core, design-taste-frontend, mcp-builder)를 각 공식 GitHub 저장소 기준으로 검증해 설치 명령어와 사용법까지 정리했습니다.
- 썸네일: attachments/thumbnail.png(제작 완료 — 1200×630, 다크 캔버스 + 5개 스킬 실제 로고를 앱 아이콘 형태로 중앙 배치. Vercel 트라이앵글(Agent Browser/Find Skills), GSD Core 공식 마크, Design Taste Frontend 공식 아이콘, Anthropic 공식 마크(MCP Builder) — 전부 각 공식 사이트에서 실측 확보)

## 제외된 항목
- 없음 — 5개 스킬 전부 공식 GitHub 저장소가 확인돼 그대로 포함했습니다.

## 발행 안내
1. 티스토리 글쓰기 → HTML 모드 전환 → final.html 내용 붙여넣기
2. 카테고리 Ai > Skill 지정, 위 태그 입력
3. 공개/비공개 여부는 사용자가 직접 결정 후 저장

## 검증 기록
- 계기(비공개 기록 — 본문·공개 메타에는 미노출, 사용자 요청): 유튜브 쇼츠 "클로드 코드 최고의 스킬 5개 알려줌"(게으른 빌더, https://www.youtube.com/shorts/9_eaZJ0N7Sw) — 자막 트랙이 없어 실시간 자동 캡션(ASR)으로 스크립트를 재구성했고, 스킬 이름 2건(에이전트 브라우저→agent-browser, 테이스트→design-taste)은 사용자가 직접 정정해줌
- 1차 출처: 5개 스킬 각각의 공식 GitHub 저장소 — vercel-labs/agent-browser(Apache-2.0), vercel-labs/skills(MIT, find-skills), open-gsd/gsd-core(MIT), Leonxlnx/taste-skill(MIT, design-taste-frontend), anthropics/skills(mcp-builder)
- 확인 시점: 2026-09-07
- 직접 검증한 항목: 5개 저장소 README 원문 대조(기능 설명·설치 명령어·라이선스), skills CLI 플래그(--agent/--skill/--yes/--copy 등)를 vercel-labs/skills 공식 README와 대조 확인. 2차 참고 자료(짐코딩 gymcoding.co, lazyowen.com 정리 글) 2곳의 설치 명령어가 공식 README와 일치하는지 교차 확인
- 미검증 항목: 5개 스킬을 실제로 설치해 Claude Code에서 구동해보는 것은 하지 않음(README 문서 기준 검증). GSD Core의 `--claude --global` 플래그는 2차 출처에만 등장하고 공식 README에 없어 본문에서 제외
