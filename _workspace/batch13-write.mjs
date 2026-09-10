import { mkdirSync, writeFileSync, readFileSync } from "fs";

const DATE = "2026-09-10";
const NOTE_FOOTER = `<p data-ke-size="size14">※ 위 표는 참고용으로 정리한 요약이다. 정확한 사용 범위는 저작권자에게 확인하는 것이 안전하다.</p>`;

const COPY = {
  395: { slug: "jeongmuk-bawi", category: "장식체", preview: "바위에 새긴 듯 묵직한 제목용 서체입니다.", intro: "정묵바위체는 상상토끼가 배포하는 무료 한글 폰트로, 바위에 새긴 듯한 묵직한 획이 돋보이는 장식체다. 단단한 인상의 타이틀에 어울린다." },
  397: { slug: "eomma-kkaturi", category: "손글씨체", preview: "까투리처럼 둥글고 친근한 손글씨체입니다.", intro: "엄마까투리체는 안동시가 배포하는 전용 서체로, 지역 캐릭터 엄마까투리의 친근함을 담은 손글씨체다. 관광 안내나 가족 콘텐츠에 어울린다." },
  398: { slug: "wolyeonggyo", category: "고전체", preview: "달빛 다리처럼 곧은 안동 전용 서체입니다.", intro: "월영교체는 안동시가 배포하는 전용 서체로, 월영교의 곧은 선을 담은 고전체다. 엄마까투리체와 함께 지역 홍보물에 쓸 수 있다." },
  399: { slug: "unp-gothic", category: "고딕체", preview: "세리프를 살짝 남긴 기업 전용 고딕체입니다.", intro: "유앤피플 고딕체는 ㈜유앤피플이 배포하는 무료 한글 폰트로, 로고의 세리프 느낌을 한글 자소에 옮긴 고딕체다. 본문과 짧은 타이틀에 두루 쓸 수 있다." },
  402: { slug: "yes24", category: "장식체", preview: "책방 간판처럼 힘 있는 브랜드 서체입니다.", intro: "예스체는 예스24가 배포하는 무료 한글 폰트로, 책방 브랜드의 힘 있는 인상을 담은 장식체다. 프로모션 타이틀에 어울린다." },
  404: { slug: "yes-gothic", category: "고딕체", preview: "본문과 제목을 나누는 예스24 고딕체입니다.", intro: "예스 고딕은 예스24가 배포하는 무료 한글 폰트로, 레귤러·볼드 두 굵기를 본문과 제목에 나눠 쓸 수 있는 산스 고딕체다." },
  406: { slug: "yes-myeongjo", category: "명조체", preview: "출판 본문에 맞는 예스24 명조체입니다.", intro: "예스 명조는 예스24가 배포하는 무료 한글 폰트로, 레귤러·볼드 두 굵기를 제공하는 출판용 명조체다. 긴 본문과 책 제목에 어울린다." },
  407: { slug: "tt-together", category: "손글씨체", preview: "함께 써 내려간 듯한 손글씨 제목체입니다.", intro: "TT투게더는 투게더그룹이 배포하는 무료 한글 폰트로, 함께 써 내려간 듯한 손글씨 제목체다. 캠페인 문구에 어울린다." },
  408: { slug: "ghana-choco", category: "장식체", preview: "초콜릿처럼 달콤한 브랜드 장식체입니다.", intro: "가나초콜릿체는 롯데웰푸드가 배포하는 무료 한글 폰트로, 가나 초콜릿의 달콤한 조형을 살린 장식체다. 과자·간식 콘텐츠에 어울린다." },
  409: { slug: "solin-sunny", category: "손글씨체", preview: "퍼블리셔의 필력이 남은 손글씨체입니다.", intro: "솔인써니체는 솔인시스템이 배포하는 무료 한글 폰트로, 웹 퍼블리셔 써니의 필력을 살린 손글씨체다. 친근한 안내 문구에 어울린다." },
  410: { slug: "dw-impactamin", category: "장식체", preview: "위아래로 튀어오른 활기찬 브랜드 서체입니다.", intro: "DW임팩타민체는 대웅제약이 배포하는 무료 한글 폰트로, 임팩타민 브랜드의 활기를 담아 획 끝을 뾰족하게 올린 장식체다." },
  411: { slug: "chosun-km", category: "명조체", preview: "신문 제호처럼 굵은 조선일보 명조체입니다.", intro: "조선굵은명조는 조선일보가 배포하는 무료 한글 폰트로, 신문 제호처럼 굵고 또렷한 명조체다. 헤드라인에 어울린다." },
  412: { slug: "chosun-sg", category: "고딕체", preview: "가늘고 단정한 조선일보 고딕체입니다.", intro: "조선가는고딕은 조선일보가 배포하는 무료 한글 폰트로, 가늘고 단정한 고딕체다. 캡션이나 보조 본문에 어울린다." },
  413: { slug: "chosun-kg", category: "고딕체", preview: "굵고 단단한 조선일보 고딕체입니다.", intro: "조선굵은고딕은 조선일보가 배포하는 무료 한글 폰트로, 굵고 단단한 고딕체다. 짧은 제목과 강조 문구에 어울린다." },
  414: { slug: "chosun-bg", category: "고딕체", preview: "견고한 골격의 조선일보 고딕체입니다.", intro: "조선견고딕은 조선일보가 배포하는 무료 한글 폰트로, 견고한 골격을 살린 고딕체다. 안내문처럼 오래 읽혀야 하는 자리에 어울린다." },
  415: { slug: "chosun-gu", category: "고딕체", preview: "둥근 굴림 느낌의 조선일보 서체입니다.", intro: "조선굴림체는 조선일보가 배포하는 무료 한글 폰트로, 모서리를 둥글린 굴림 계열 서체다. 부드러운 본문에 어울린다." },
  416: { slug: "chosun-gs", category: "궁서체", preview: "붓글씨 전통을 살린 조선일보 궁서체입니다.", intro: "조선궁서체는 조선일보가 배포하는 무료 한글 폰트로, 붓글씨 전통을 살린 궁서체다. 격식 있는 제목에 어울린다." },
  417: { slug: "chosun-lo", category: "고딕체", preview: "로고에 맞춘 조선일보 전용 서체입니다.", intro: "조선로고체는 조선일보가 배포하는 무료 한글 폰트로, 로고 조형에 맞춘 전용 서체다. 브랜드 타이틀에 어울린다." },
  418: { slug: "chosun-sm", category: "명조체", preview: "본문용으로 다듬은 조선일보 신명조입니다.", intro: "조선신명조는 조선일보가 배포하는 무료 한글 폰트로, 본문 가독성을 다듬은 신명조체다. 긴 기사형 본문에 어울린다." },
  419: { slug: "kyobo-hand-2019", category: "손글씨체", preview: "책장에 남긴 듯한 교보 손글씨체입니다.", intro: "교보손글씨 2019는 교보문고가 배포하는 무료 한글 폰트로, 손글씨 필기를 살린 2019년 버전이다. 서점·독서 콘텐츠에 어울린다." },
  422: { slug: "yangpyeong", category: "고딕체", preview: "라이트부터 볼드까지 나눈 양평 전용 서체입니다.", intro: "양평군체는 양평군이 배포하는 전용 서체로, 라이트·미디엄·볼드 세 굵기를 본문과 제목에 나눠 쓸 수 있는 고딕체다." },
  423: { slug: "nexon-bazzi", category: "장식체", preview: "카트라이더처럼 통통한 게임 브랜드 서체입니다.", intro: "넥슨 배찌체는 넥슨이 배포하는 무료 한글 폰트로, 카트라이더 캐릭터 배찌의 통통한 조형을 살린 장식체다." },
  426: { slug: "infinity-sans", category: "고딕체", preview: "황금비를 담은 위메이드 산스 고딕체입니다.", intro: "인피니티산스는 위메이드가 배포하는 무료 한글 폰트로, 황금비를 담은 산스 고딕체다. 레귤러·콘덴스드 볼드·볼드 세 굵기를 제공한다." },
  427: { slug: "nexon-maplestory", category: "장식체", preview: "메이플스토리의 둥근 게임 서체입니다.", intro: "넥슨 메이플스토리는 넥슨이 배포하는 무료 한글 폰트로, 게임 메이플스토리의 둥근 조형을 살린 장식체다. 라이트·볼드 두 굵기를 제공한다." },
  432: { slug: "nexon-lv1-gothic", category: "고딕체", preview: "레벨 1처럼 담백한 넥슨 기본 고딕체입니다.", intro: "넥슨 Lv.1 고딕은 넥슨이 배포하는 무료 한글 폰트로, 라이트·레귤러·볼드 세 굵기를 제공하는 기본 산스 고딕체다." },
  435: { slug: "nexon-lv2-gothic", category: "고딕체", preview: "한 단계 다듬은 넥슨 본문용 고딕체입니다.", intro: "넥슨 Lv.2 고딕은 넥슨이 배포하는 무료 한글 폰트로, Lv.1보다 본문 가독성을 다듬은 산스 고딕체다. 라이트·레귤러·볼드 세 굵기를 제공한다." },
  436: { slug: "nexon-football-gothic", category: "고딕체", preview: "경기장 전광판처럼 힘 있는 풋볼 고딕체입니다.", intro: "넥슨 풋볼고딕은 넥슨이 배포하는 무료 한글 폰트로, 전광판처럼 힘 있는 스포츠 고딕체다. 라이트·볼드 두 굵기를 제공한다." },
  438: { slug: "gimpo-title", category: "제목체", preview: "평화를 담은 김포 전용 제목체입니다.", intro: "김포평화제목은 김포시가 배포하는 전용 서체로, 평화라는 메시지를 담은 제목용 서체다. 지역 홍보 타이틀에 어울린다." },
  439: { slug: "gimpo-batang", category: "바탕체", preview: "본문용으로 다듬은 김포 전용 바탕체입니다.", intro: "김포평화바탕은 김포시가 배포하는 전용 서체로, 제목체와 짝을 이루는 본문용 바탕체다. 안내문처럼 긴 글에 어울린다." },
  440: { slug: "62570", category: "명조체", preview: "6·25 70주년을 기념하는 보훈 서체입니다.", intro: "62570체는 국가보훈처와 투게더그룹이 6·25 70주년을 기념해 배포하는 무료 한글 폰트로, 기억과 평화를 담은 명조 계열 서체다." },
  441: { slug: "imcre-soojin", category: "고딕체", preview: "네모꼴에 곡선을 더한 브랜드 고딕체입니다.", intro: "아임크리수진체는 발렌타인드림이 배포하는 무료 한글 폰트로, 네모꼴 고딕에 곡선을 더한 브랜드 서체다. 로고와 짧은 타이틀에 어울린다." },
  442: { slug: "heir-of-light", category: "명조체", preview: "날카로운 게임에 맞는 세리프 제목체입니다.", intro: "빛의계승자체는 펀플로와 산돌이 배포하는 무료 한글 폰트로, 게임 빛의 계승자에 맞춘 날카로운 세리프 제목체다. 레귤러·볼드 두 굵기를 제공한다." },
  443: { slug: "ibm-plex-sans-kr", category: "고딕체", preview: "IBM이 연 오픈소스 한글 산스 고딕체입니다.", intro: "IBM Plex Sans는 IBM이 SIL OFL로 배포하는 무료 한글 폰트로, 엑스트라라이트부터 세미볼드까지 여러 굵기를 제공하는 산스 고딕체다." },
  448: { slug: "ibm-plex-sans-kr", category: "고딕체", preview: "IBM이 연 오픈소스 한글 산스 고딕체입니다.", intro: "IBM Plex Sans는 IBM이 SIL OFL로 배포하는 무료 한글 폰트로, 엑스트라라이트부터 세미볼드까지 여러 굵기를 제공하는 산스 고딕체다." },
  452: { slug: "paybooc", category: "고딕체", preview: "결제 앱처럼 또렷한 페이북 브랜드 고딕체입니다.", intro: "페이북 글꼴은 비씨카드가 배포하는 무료 한글 폰트로, 라이트·미디엄·볼드·엑스트라볼드 네 굵기를 제공하는 브랜드 고딕체다." },
  456: { slug: "bccard", category: "고딕체", preview: "카드사 본문에 맞는 비씨카드 고딕체입니다.", intro: "비씨카드 글꼴은 비씨카드가 배포하는 무료 한글 폰트로, 라이트·볼드 두 굵기를 본문과 제목에 나눠 쓸 수 있는 고딕체다." },
  458: { slug: "tmoney-round-wind", category: "고딕체", preview: "둥근 바람처럼 부드러운 티머니 고딕체입니다.", intro: "티머니 둥근바람은 티머니와 윤디자인이 배포하는 무료 한글 폰트로, 둥근 획의 교통 브랜드 고딕체다. 레귤러·엑스트라볼드 두 굵기를 제공한다." },
  461: { slug: "binggrae-samanco", category: "장식체", preview: "붕어빵처럼 통통한 아이스크림 브랜드 서체입니다.", intro: "빙그레 싸만코체는 빙그레가 배포하는 무료 한글 폰트로, 붕어싸만코의 통통한 조형을 살린 장식체다. 레귤러·볼드 두 굵기를 제공한다." },
  463: { slug: "esamanru", category: "고딕체", preview: "야구 로고와 맞춘 게임 브랜드 고딕체입니다.", intro: "이사만루는 공게임즈와 폰트릭스가 배포하는 무료 한글 폰트로, 야구 게임 브랜드와 맞춘 고딕체다. 라이트·미디엄·볼드 세 굵기를 제공한다." },
  465: { slug: "gosanja", category: "고전체", preview: "지도 위에 올린 듯한 국토 정보 서체입니다.", intro: "고산자는 국토정보플랫폼과 산돌이 배포하는 무료 한글 폰트로, 김정호의 고산자 정신을 담은 고전체다. 지도·지리 콘텐츠에 어울린다." },
  466: { slug: "hs-bombaram-3", category: "고딕체", preview: "봄바람처럼 가벼운 손글씨 고딕체입니다.", intro: "HS봄바람체 3.0은 토끼네활자공장이 배포하는 무료 한글 폰트로, 봄바람체 시리즈의 2020년 개정판이다. 씬·레귤러 두 굵기를 제공한다." },
};

const DOWNLOAD = {
  395: "https://sangsangfont.com/21/?idx=122",
  397: "https://www.andong.go.kr/portal/contents.do?mId=0301030500",
  398: "https://www.andong.go.kr/portal/contents.do?mId=0301030500",
  399: "https://www.unpl.co.kr/portal/main/main.do",
  402: "http://www.yes24.com/campaign/00_corp/2019/0930Yesfont.aspx",
  404: "http://www.yes24.com/campaign/00_corp/2019/0930Yesfont.aspx",
  406: "http://www.yes24.com/campaign/00_corp/2019/0930Yesfont.aspx",
  407: "https://itsfont.com/freefontlist/?idx=809",
  408: "https://www.lottewellfood.com/prcenter/gana",
  409: "https://www.solinsystem.co.kr/companyIntro/solinFont.do",
  410: "https://www.daewoong.co.kr/",
  411: "https://event.chosun.com/100/100font.html",
  412: "https://event.chosun.com/100/100font.html",
  413: "https://event.chosun.com/100/100font.html",
  414: "https://event.chosun.com/100/100font.html",
  415: "https://event.chosun.com/100/100font.html",
  416: "https://event.chosun.com/100/100font.html",
  417: "https://event.chosun.com/100/100font.html",
  418: "https://event.chosun.com/100/100font.html",
  419: "https://www.kyobobook.co.kr/handwriting/font",
  422: "https://www.yp21.go.kr/www/contents.do?key=2620",
  423: "https://brand.nexon.com/ko/ci-brand-guidelines/typeface",
  426: "https://playbook.wemade.com/",
  427: "https://brand.nexon.com/ko/ci-brand-guidelines/typeface",
  432: "https://brand.nexon.com/ko/ci-brand-guidelines/typeface",
  435: "https://brand.nexon.com/ko/ci-brand-guidelines/typeface",
  436: "https://brand.nexon.com/ko/ci-brand-guidelines/typeface",
  438: "https://www.gimpo.go.kr/portal/contents.do?key=2688",
  439: "https://www.gimpo.go.kr/portal/contents.do?key=2688",
  440: "https://gongu.copyright.or.kr/gongu/wrt/wrt/view.do?menuNo=200023&wrtSn=13288429",
  441: "https://iamcreator.creatorlink.net/",
  442: "https://www.sandollcloud.com/free-font/274/Sandoll-HeirofLight",
  448: "https://github.com/IBM/plex",
  452: "https://m.bccard.com/event/2020/2020040025.html",
  456: "https://paybooc.co.kr/app/paybooc/REventDetail.do?evntNo=2020040025&pbCtgClss=5&mFocus=Event",
  458: "https://www.tmoney.co.kr/aeb/cmnctn/ci/ci.dev",
  461: "http://www.bingfont.co.kr/bingfont.html",
  463: "https://www.gonggames.com/",
  465: "http://map.ngii.go.kr/mi/emapMain/emapIntro01.do",
  466: "https://www.sandollcloud.com/free-font/15768/HSBomBaram-3.0",
};

function cleanLicense(raw) {
  let t = raw || "";
  const i = t.indexOf("라이선스 본문");
  if (i >= 0) t = t.slice(i + "라이선스 본문".length);
  t = t.replace(/\*눈누 안내사항[^.]*\./g, "다운로드 시 폰코 자키 앱 설치가 필요하다.");
  t = t.replace(/눈누/g, "");
  t = t.replace(/^[-\s]+/, "");
  t = t.replace(/\s+/g, " ").trim();
  t = t
    .replace(/입니다/g, "이다")
    .replace(/합니다/g, "한다")
    .replace(/됩니다/g, "된다")
    .replace(/있습니다/g, "있다");
  if (t.length > 900) t = t.slice(0, 900).replace(/\s+\S*$/, "") + ".";
  return t;
}

function extraNote(id, row) {
  const bits = [];
  if ([397, 398].includes(id)) {
    bits.push("엄마까투리체와 월영교체는 안동시 전용서체로 라이선스 본문 구조가 같다.");
  }
  if ([402, 404, 406].includes(id)) {
    bits.push("예스체·예스 고딕·예스 명조는 예스24 브랜드 서체다. 요약표에서 BI/CI 사용이 금지로 표기돼 있다.");
  }
  if (id >= 411 && id <= 418) {
    bits.push("조선일보 100주년 기념 서체 시리즈로, 라이선스 본문과 사용 범위 표 구조가 같다.");
  }
  if ([423, 427, 432, 435, 436].includes(id)) {
    bits.push("넥슨이 배포하는 게임·브랜드 서체 시리즈다. 최신 사용 범위는 넥슨 브랜드 가이드에서 확인하는 것이 안전하다.");
  }
  if ([438, 439].includes(id)) {
    bits.push("김포평화제목과 김포평화바탕은 김포시 전용서체로 라이선스가 같다.");
  }
  if ([452, 456].includes(id)) {
    bits.push("페이북 글꼴과 비씨카드 글꼴은 비씨카드가 배포하는 자매 서체다.");
  }
  if (id === 426) {
    bits.push("대한민국 외에서 내려받거나 쓰려면 위메이드의 사전 허락이 필요하다는 조항이 있다. 요약표에서 BI/CI 사용은 금지로 표기돼 있다.");
  }
  if (id === 410) {
    bits.push("요약표에서 BI/CI 사용이 금지로 표기돼 있다. 내려받을 때 연령대·성별 입력을 요구하는 경우가 있다.");
  }
  if ([458, 461].includes(id)) {
    bits.push("요약표에서 BI/CI 사용이 금지로 표기돼 있다.");
  }
  if (id === 442) {
    bits.push("게임(콘솔·PC·모바일 등)에 임베딩하려면 권리자의 서면 동의가 필요하다는 조항이 있다.");
  }
  if (id === 448) {
    bits.push("SIL Open Font License로 배포된다. 폰트 파일 자체의 유료 판매만 금지되는 오픈소스 라이선스다.");
  }
  if (id === 466) {
    bits.push("같은 제작사의 HS봄바람체 2.0과 다른 개정판이다. 웹폰트 파일명도 3.0 전용이다.");
  }
  const embed = (row.table || []).find((r) => r[0] === "임베딩");
  if (embed && /조건부/.test(embed.join(" "))) {
    bits.push("요약표에서 임베딩이 조건부 허용으로 표기돼 있다. 서버에 폰트를 올려 쓰는 웹폰트 적용 전에는 저작권자에게 범위를 확인하는 것이 안전하다.");
  }
  if (!bits.length) return "";
  return bits.map((b) => `<p data-ke-size="size14">※ 참고: ${b}</p>`).join("\n");
}

function tableHtml(rows) {
  const body = (rows || [])
    .filter((r) => r.length >= 2 && r[0] !== "카테고리")
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("\n");
  return `<table>
<tbody>
<tr><th>카테고리</th><th>사용 범위</th><th>허용 여부</th></tr>
${body}
</tbody>
</table>`;
}

function codeBlocks(modern) {
  return modern
    .map(
      (m) => `@font-face {
    font-family: '${m.family}';
    src: url('${m.url}') format('woff');
    font-weight: ${m.weight};
    font-display: swap;
}`
    )
    .join("\n\n");
}

const scraped = JSON.parse(readFileSync("_workspace/batch13-scrape.json", "utf8")).filter((r) => r.ok);
const prepared = [];
let catalogIndex = 182;

for (const row of scraped) {
  const copy = COPY[row.id];
  if (!copy) throw new Error("missing copy " + row.id);
  const modern = row.modern;
  const previewFace = modern[Math.floor((modern.length - 1) / 2)] || modern[0];
  const liveFamily = `${copy.slug.replace(/-/g, "")}-live`;
  const dir = `posts/${DATE}-noonnu-font-${copy.slug}`;
  mkdirSync(`${dir}/attachments`, { recursive: true });

  const license = extraNote(row.id, row);
  const weightNote = modern.length > 1 ? ` ${modern.length}가지 굵기를 제공한다.` : "";
  const finalHtml = `<p data-ke-size="size16">${copy.intro}</p>

<style>
@font-face {
  font-family: '${liveFamily}';
  src: url('${previewFace.url}') format('woff');
  font-weight: normal;
  font-display: swap;
}
</style>
<div class="font-preview-card">
<p class="font-preview-text" style="font-family: '${liveFamily}', sans-serif;">${copy.preview}</p>
</div>

<h2>라이선스</h2>
<p data-ke-size="size16">${cleanLicense(row.license)}</p>

${tableHtml(row.table)}
${NOTE_FOOTER}
${license ? license + "\n" : ""}
<h2>웹폰트 코드</h2>
<p data-ke-size="size16">웹폰트로 사용할 때 필요한 코드는 다음과 같다.${weightNote}</p>
<pre><code class="language-css">${codeBlocks(modern)}</code></pre>

<h2>다운로드</h2>
<p data-ke-size="size16">${row.catalogName} 파일은 다음 페이지에서 받을 수 있다.</p>
<p data-ke-size="size16"><a href="${DOWNLOAD[row.id]}" target="_blank" rel="noopener">${row.catalogName} 다운로드 페이지 바로가기</a></p>
`;

  if (/눈누/.test(finalHtml)) throw new Error("noonnu leaked in html " + row.id);
  writeFileSync(`${dir}/final.html`, finalHtml, "utf8");

  const titleTail = copy.preview.replace(/입니다\.$/, "");
  const maker = row.maker.replace(/^㈜/, "");
  const metaMd = `# 제목: ${row.catalogName} 무료 한글 웹폰트 — ${titleTail}

- 카테고리: Design > Font
- 태그: ${row.catalogName.replace(/\s+/g, "")}, 무료폰트, 한글폰트, ${copy.category}, 웹폰트
- 메타디스크립션: ${maker}이 배포하는 무료 한글 폰트 ${row.catalogName}를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.
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
- 1차 출처: noonnu.cc ${row.catalogName} 페이지(font_page/${row.id})
- 확인 시점: ${DATE}
- 직접 검증한 항목: 페이지 HTML에서 @font-face(woff), 라이선스 본문·요약표, 다운로드 링크를 실측 확인.
- 미검증 항목: 실제 파일 다운로드 절차까지는 수행하지 않음(링크 URL만 확인)
`;
  writeFileSync(`${dir}/meta.md`, metaMd, "utf8");

  const thumbHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
@font-face {
  font-family: '${liveFamily}';
  src: url('${previewFace.url}') format('woff');
  font-weight: normal;
  font-display: block;
}
html,body{margin:0;padding:0;}
body{
  width:1200px;height:630px;
  background:#171717;
  display:flex;align-items:center;justify-content:center;
  flex-direction:column;
}
.name{
  font-family:'${liveFamily}',sans-serif;
  font-size:70px;
  color:#ffffff;
}
.sub{
  font-family:'${liveFamily}',sans-serif;
  font-size:28px;
  color:#a3a3a3;
  margin-top:24px;
}
</style>
</head>
<body>
<div class="name">${row.catalogName}</div>
<div class="sub">${titleTail}</div>
</body>
</html>
`;
  writeFileSync(`_workspace/noonnu-thumbs/thumb-${row.id}-${copy.slug}.html`, thumbHtml, "utf8");

  prepared.push({
    catalogIndex: catalogIndex++,
    id: row.id,
    name: row.catalogName,
    postFolder: `${dir}/`,
    registeredInTistory: false,
    slug: copy.slug,
    note: `[배치13] ${row.maker}. woff ${modern.length}개. final.html \"눈누\" 언급 없음.`,
  });
}

writeFileSync("_workspace/batch13-prepared.json", JSON.stringify(prepared, null, 2));
console.log("generated", prepared.length);
console.log(prepared.map((p) => p.id + " " + p.name).join("\n"));
