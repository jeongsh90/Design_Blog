# `index.xml` — 설계 주석

소스: `dashboard-skin/index.xml`

티스토리 스킨 편집 화면의 이름·설명·제작자·저작권은 이 파일에서 읽는다.
HTML 탭만 바꿔서는 JQ.Minimal 잔재가 안 지워진다. 새로 등록할 때는
이 파일과 `preview256.jpg` / `preview560.jpg` / `preview1600.jpg`가 패키지에 있어야 한다.

공식 안내: **이 파일이 바뀌면 스킨 설정이 초기화**된다. 기존 JQ.Minimal 스킨을
덮어쓰는 게 아니라 DAITNU로 새로 등록하는 이유이기도 하다.

## 1. 이 스킨의 정체

1차 `daitnu-skin-v1.01`(원작 JQ.Minimal / Jeeqong, 재배포 금지)과 **별개**다.
대시보드 스킨은 greenfield라 원작 귀속을 옮기지 않는다. `daitnu-skin-v1.01/index.xml`은
손대지 않는다.

## 2. 필드

| 태그 | 값 | 이유 |
|---|---|---|
| `name` | DAITNU | 썸네일 워드마크와 동일 |
| `version` | 1.0.0 | 썸네일 `V.1.0.0`과 동일 |
| `description` | 대시보드·shadcn·3축 아카이브 | torytis / hELLO / Berry 문구 제거 |
| `license` | 제작자 저작권 | 슬롯은 유지, 소유는 jeongsanghoon |
| `author/email` | jeongsanghoon@naver.com | 요청한 제작자 연락처 |
| `author/homepage` | https://daitnu.tistory.com | 이 블로그 |

JQ.Minimal 옵션(`list-type`, 커버 아이템 등)은 이 스킨이 쓰지 않아 넣지 않았다.
`<default>`의 최근글·댓글·태그 개수 5는 위젯 설계와 맞춘 값이다.

## 3. 미리보기 이미지

티스토리 파일명 규칙(사이즈 접미사). `index.xml`이 경로를 적지 않고 루트 파일명을 본다.

- `preview256.jpg` — 사용 중 스킨 (256×192)
- `preview560.jpg` — 목록 (560×420)
- `preview1600.jpg` — 상세 (1600×1200)

파일은 `dashboard-skin/deploy/`에 둔다. zip 루트에도 같은 이름으로 넣는다.

## 4. `style.css`

티스토리 스킨 패키지 필수 파일. 실제 스타일은 `./images/*.css`로 올린다.
루트 `style.css`는 빈 스텁이다.
