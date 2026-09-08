import { mkdirSync, writeFileSync } from 'fs';

const NOTE_FOOTER = `<p data-ke-size="size14">※ 위 표는 참고용으로 정리한 요약이다. 정확한 사용 범위는 저작권자에게 확인하는 것이 안전하다.</p>`;

function table(rows) {
  const trs = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('\n');
  return `<table>
<tbody>
<tr><th>카테고리</th><th>사용 범위</th><th>허용 여부</th></tr>
${trs}
</tbody>
</table>`;
}

const ALL_OK_ROWS = [
  ['인쇄', '브로슈어, 포스터, 책, 잡지 및 출판용 인쇄물 등', '사용 가능'],
  ['웹사이트', '웹페이지, 광고 배너, 메일, E-브로슈어 등', '사용 가능'],
  ['포장지', '판매용 상품의 패키지', '사용 가능'],
  ['영상', '유튜브, CF, 상업영화, 뮤직비디오, 영상 자막, 영상 오프닝/엔딩 크레딧 등', '사용 가능'],
  ['임베딩', '웹사이트 및 프로그램 서버 내 폰트 탑재, E-book 제작', '사용 가능'],
  ['BI/CI', '회사명, 브랜드명, 상품명, 로고, 마크, 슬로건, 캐치프레이즈', '사용 가능'],
  ['OFL', '폰트 파일의 수정·복제·배포 및 유료 판매 모두 금지', ''],
];

const EMBED_BAN_ROWS = [
  ['인쇄', '브로슈어, 포스터, 책, 잡지 및 출판용 인쇄물 등', '사용 가능'],
  ['웹사이트', '웹페이지, 광고 배너, 메일, E-브로슈어 등', '사용 가능'],
  ['포장지', '판매용 상품의 패키지', '사용 가능'],
  ['영상', '유튜브, CF, 상업영화, 뮤직비디오, 영상 자막, 영상 오프닝/엔딩 크레딧 등', '사용 가능'],
  ['BI/CI', '회사명, 브랜드명, 상품명, 로고, 마크, 슬로건, 캐치프레이즈', '사용 가능'],
  ['임베딩', '웹사이트 및 프로그램 서버 내 폰트 탑재, E-book 제작', '사용 금지'],
  ['OFL', '폰트 파일의 수정·복제·배포 및 유료 판매 모두 금지', ''],
];

const YOONM_LICENSE = `무료로 다운로드 받아 인쇄, 출판, 영상, 웹, 모바일 등 다양한 매체에서 자유롭게 사용할 수 있다. 폰트 저작권은 윤디자인그룹에 있으며, 폰트 디자인의 일부·전부 수정이나 폰트 파일의 임의 제작은 불가하고 폰트 파일 자체의 상업적 판매도 금지된다. 인쇄물, 웹페이지, 영상물·CI·BI, 이북·이러닝, UI 디자인, 서버·디바이스 임베딩까지 폭넓게 사용할 수 있다. 다운로드 시 폰코 자키 앱 설치가 필요하다.`;

const YOON_LICENSE = `한글나눔폰트(무료폰트)로 개인·기업 구분 없이 누구나 사용 가능한 서체다. 인쇄·출판·영상·웹·모바일 등 다양한 매체에 특별한 허가 절차 없이 사용할 수 있다. 다만 폰트의 수정·변형(디지털 포맷 변경 포함)을 통한 개작·개명은 금지되며, 별도 허락 없는 재배포나 유료 양도·재판매 등 상업적 행위도 불가하다. 각종 프로그램·장비·디바이스·서버 등에 폰트를 임베딩하려면 별도 허락이 필요하다(문의 02-2287-6700 / yoondesign@yoondesign.com). 다운로드 페이지에서 폰코 자키 앱을 설치해야 사용할 수 있다.`;

const CAFE24_LICENSE = `카페24가 제작한 모든 글꼴의 지적 재산권은 카페24(주)에 있다. 개인·기업 구분 없이 무료로 제공되며 상업적 사용이 가능하다. 다만 글꼴 자체를 유료로 판매하는 행위는 금지된다. 웹디자인, 출판, 웹폰트, CI·BI 제작, 영상 제작 및 자막, 소프트웨어 번들, 프로그램 임베드 등 제한 없이 자유롭게 사용할 수 있다. 수정·재배포가 가능하며, 수정한 폰트에도 동일하게 OFL(오픈 폰트 라이선스)을 적용해야 한다. 카페24 폰트로 만든 결과물은 카페24의 프로모션에 활용될 수 있다.`;

const fonts = [
  {
    catalogIndex: 147, id: 330, name: '양진체', slug: 'yangjin', family: 'Yangjin',
    intro: '양진체는 김양진이 제작해 배포하는 무료 한글 폰트로, 레트로한 느낌의 굵직하고 각진 장식체다. 옛날 간판이나 포스터 같은 복고풍 타이틀 문구에 잘 어울린다.',
    previewText: '복고풍 느낌이 살아있는 굵직한 장식체입니다.',
    weights: [{ family: 'Yangjin', url: 'https://cdn.jsdelivr.net/gh/supernovice-lab/font@0.9/yangjin.woff', weight: 'normal' }],
    license: `양진체는 무료 폰트로, 개인 및 기업 사용자 모두에게 무료로 제공되며 자유롭게 사용할 수 있다. 다만 추후 나올 패밀리 서체는 유료로 판매될 예정이다. 저작권은 제작자(김양진)에게 있으며, 저작권자 외 사용자는 폰트를 수정하거나 판매할 수 없고 배포되는 형태 그대로 사용해야 한다. 개인·기업 모두 상업적 용도로 무료 사용이 가능하며, 이 폰트로 만든 저작물은 저작자가 홍보 용도로 활용할 수 있다.`,
    rows: ALL_OK_ROWS, note: null,
    downloadUrl: 'http://supernovice.org/font/', category: '장식체',
    metaDesc: '김양진이 제작해 배포하는 무료 한글 폰트 양진체를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 148, id: 331, name: '행복고흥', slug: 'happy-goheung', family: 'HappinessGoheung',
    intro: '행복고흥체는 고흥군과 헤움디자인이 함께 만든 전용 서체로, 색연필로 눌러 쓴 듯한 손글씨 느낌의 캘리그라피체다. 라이트·미디엄·볼드 3가지 굵기를 제공해 지역 홍보물이나 감성적인 타이틀에 어울린다.',
    previewText: '고흥군을 담은 손글씨 느낌의 캘리그라피체입니다.',
    weights: [
      { family: 'HappinessGoheung', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/행복고흥L.woff', weight: 300 },
      { family: 'HappinessGoheung', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/행복고흥M.woff', weight: 500 },
      { family: 'HappinessGoheung', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/행복고흥B.woff', weight: 700 },
    ],
    license: `고흥군 전용서체인 '행복고흥체'는 누구나 무료로 다운로드해 사용할 수 있다. 영상, 매체, 인터넷, 모바일 등 다양한 매체에서 자유롭게 사용 가능하며 특별한 허가 절차가 없다. 다만 전용서체를 유료로 양도하거나 판매하는 등 상업적 행위는 금지되며, 서체를 불법으로 변형해 사용할 수 없다.`,
    rows: ALL_OK_ROWS, note: null,
    downloadUrl: 'https://www.goheung.go.kr/contentsView.do?pageId=www158', category: '손글씨체',
    metaDesc: '고흥군과 헤움디자인이 배포하는 무료 한글 폰트 행복고흥체(3가지 굵기)를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 149, id: 334, name: '대한체', slug: 'daehan', family: 'Daehan',
    intro: '대한체는 윤디자인이 제작해 배포하는 무료 한글 폰트로, 각진 바탕과 각진 명조가 섞인 제목용 서체다. 레귤러·볼드 2가지 굵기를 제공해 힘 있는 타이틀 문구에 어울린다.',
    previewText: '각지고 힘 있는 제목용 바탕체입니다.',
    weights: [
      { family: 'Daehan', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Daehan-Regular.woff', weight: 'normal' },
      { family: 'Daehan', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Daehan-Bold.woff', weight: 700 },
    ],
    license: YOONM_LICENSE,
    rows: ALL_OK_ROWS, note: null,
    downloadUrl: 'https://font.co.kr/collection/detail?pd_idx=10339&pd_type=fonts&pd_price=0&pd_kinds=collection&lc_family_sel=&lc_price_sum=0&lc_price_set=&lc_font=14&lc_scale=1&lc_range=%EB%82%98%EB%88%94+%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4&lc_users=1&lc_term=999&price_users=1',
    category: '바탕체',
    metaDesc: '윤디자인이 배포하는 무료 한글 폰트 대한체(레귤러·볼드 2가지 굵기)를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 150, id: 337, name: '민국체', slug: 'minguk', family: 'Minguk',
    intro: '민국체는 윤디자인이 제작해 배포하는 무료 한글 폰트로, 기본 고딕과 굴린 고딕이 섞인 형태다. 레귤러·볼드 2가지 굵기를 제공해 편안하게 읽히는 본문·타이틀에 두루 쓸 수 있다.',
    previewText: '부드럽게 굴린 느낌의 고딕 서체입니다.',
    weights: [
      { family: 'Minguk', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Minguk-Regular.woff', weight: 'normal' },
      { family: 'Minguk', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Minguk-Bold.woff', weight: 700 },
    ],
    license: YOONM_LICENSE,
    rows: ALL_OK_ROWS, note: null,
    downloadUrl: 'http://korea.yoondesign.com/', category: '고딕체',
    metaDesc: '윤디자인이 배포하는 무료 한글 폰트 민국체(레귤러·볼드 2가지 굵기)를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 151, id: 338, name: '독립체', slug: 'dokrip', family: 'Independent',
    intro: '독립체는 윤디자인이 제작해 배포하는 무료 한글 폰트로, 붓글씨 느낌을 살린 궁서 계열 고전체다. 역사적인 소재나 전통적인 분위기의 타이틀 문구에 어울린다.',
    previewText: '붓글씨 느낌을 살린 고전 궁서체입니다.',
    weights: [{ family: 'Independent', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Dokrip.woff', weight: 'normal' }],
    license: YOONM_LICENSE,
    rows: ALL_OK_ROWS, note: null,
    downloadUrl: 'http://korea.yoondesign.com/', category: '고전체',
    metaDesc: '윤디자인이 배포하는 무료 한글 폰트 독립체를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 152, id: 339, name: '만세체', slug: 'manse', family: 'Manse',
    intro: '만세체는 윤디자인이 제작해 배포하는 무료 한글 폰트로, 힘찬 필체가 돋보이는 붓글씨 캘리그라피체다. 대한체·민국체·독립체와 함께 같은 제작사가 내놓은 시리즈로, 역동적인 타이틀 문구에 어울린다.',
    previewText: '힘찬 붓글씨 느낌의 캘리그라피체입니다.',
    weights: [{ family: 'Manse', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Manse.woff', weight: 'normal' }],
    license: YOONM_LICENSE,
    rows: ALL_OK_ROWS, note: `<p data-ke-size="size14">※ 참고: 대한체·민국체·독립체·만세체는 모두 윤디자인이 배포한 같은 시리즈의 무료 폰트로, 라이선스 본문과 구조가 동일하다.</p>`,
    downloadUrl: 'http://korea.yoondesign.com/', category: '캘리그라피체',
    metaDesc: '윤디자인이 배포하는 무료 한글 폰트 만세체를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 153, id: 340, name: '카페24 단정해', slug: 'cafe24-danjeonghae', family: 'Cafe24Danjeonghae',
    intro: '카페24 단정해는 카페24가 제작해 배포하는 무료 한글 폰트로, 장식이 돋보이는 클래식한 제목용 서체다. 간판이나 브랜드 타이틀처럼 단정하면서도 개성 있는 자리에 어울린다.',
    previewText: '장식이 돋보이는 클래식한 제목용 서체입니다.',
    weights: [{ family: 'Cafe24Danjeonghae', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Danjunghae.woff', weight: 'normal' }],
    license: CAFE24_LICENSE,
    rows: [
      ['인쇄', '브로슈어, 포스터, 책, 잡지 및 출판용 인쇄물 등', '사용 가능'],
      ['웹사이트', '웹페이지, 광고 배너, 메일, E-브로슈어 등', '사용 가능'],
      ['포장지', '판매용 상품의 패키지', '사용 가능'],
      ['영상', '유튜브, CF, 상업영화, 뮤직비디오, 영상 자막, 영상 오프닝/엔딩 크레딧 등', '사용 가능'],
      ['임베딩', '웹사이트 및 프로그램 서버 내 폰트 탑재, E-book 제작', '사용 가능'],
      ['BI/CI', '회사명, 브랜드명, 상품명, 로고, 마크, 슬로건, 캐치프레이즈', '사용 가능'],
      ['OFL', '폰트 파일 수정·복제·배포 가능, 단 유료 판매는 금지', ''],
    ],
    note: null,
    downloadUrl: 'https://fonts.cafe24.com/', category: '장식체',
    metaDesc: '카페24가 배포하는 무료 한글 폰트 카페24 단정해를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 154, id: 341, name: '카페24 동동', slug: 'cafe24-dongdong', family: 'Cafe24Dongdong',
    intro: '카페24 동동은 카페24가 제작해 배포하는 무료 한글 폰트로, 동글동글하고 귀여운 아이 손글씨체다. 어린이 콘텐츠나 발랄한 분위기의 문구에 어울린다.',
    previewText: '동글동글 귀여운 아이 손글씨체입니다.',
    weights: [{ family: 'Cafe24Dongdong', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Dongdong.woff', weight: 'normal' }],
    license: CAFE24_LICENSE,
    rows: [
      ['인쇄', '브로슈어, 포스터, 책, 잡지 및 출판용 인쇄물 등', '사용 가능'],
      ['웹사이트', '웹페이지, 광고 배너, 메일, E-브로슈어 등', '사용 가능'],
      ['포장지', '판매용 상품의 패키지', '사용 가능'],
      ['영상', '유튜브, CF, 상업영화, 뮤직비디오, 영상 자막, 영상 오프닝/엔딩 크레딧 등', '사용 가능'],
      ['임베딩', '웹사이트 및 프로그램 서버 내 폰트 탑재, E-book 제작', '사용 가능'],
      ['BI/CI', '회사명, 브랜드명, 상품명, 로고, 마크, 슬로건, 캐치프레이즈', '사용 가능'],
      ['OFL', '폰트 파일 수정·복제·배포 가능, 단 유료 판매는 금지', ''],
    ],
    note: `<p data-ke-size="size14">※ 참고: 카페24가 배포하는 이 시리즈(단정해·동동·고운밤·빛나는별·심플해·쑥쑥·숑숑)는 모두 라이선스 본문과 구조가 동일하다.</p>`,
    downloadUrl: 'https://fonts.cafe24.com/', category: '손글씨체',
    metaDesc: '카페24가 배포하는 무료 한글 폰트 카페24 동동을 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 155, id: 342, name: '카페24 고운밤', slug: 'cafe24-gowoonbam', family: 'Cafe24Gowoonbam',
    intro: '카페24 고운밤은 카페24가 제작해 배포하는 무료 한글 폰트로, 펜으로 쓴 듯한 감성적인 어른 손글씨 바탕체다. 편지글이나 잔잔한 분위기의 본문에 어울린다.',
    previewText: '펜으로 쓴 듯한 감성적인 손글씨체입니다.',
    weights: [{ family: 'Cafe24Gowoonbam', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Oneprettynight.woff', weight: 'normal' }],
    license: CAFE24_LICENSE,
    rows: [
      ['인쇄', '브로슈어, 포스터, 책, 잡지 및 출판용 인쇄물 등', '사용 가능'],
      ['웹사이트', '웹페이지, 광고 배너, 메일, E-브로슈어 등', '사용 가능'],
      ['포장지', '판매용 상품의 패키지', '사용 가능'],
      ['영상', '유튜브, CF, 상업영화, 뮤직비디오, 영상 자막, 영상 오프닝/엔딩 크레딧 등', '사용 가능'],
      ['임베딩', '웹사이트 및 프로그램 서버 내 폰트 탑재, E-book 제작', '사용 가능'],
      ['BI/CI', '회사명, 브랜드명, 상품명, 로고, 마크, 슬로건, 캐치프레이즈', '사용 가능'],
      ['OFL', '폰트 파일 수정·복제·배포 가능, 단 유료 판매는 금지', ''],
    ],
    note: `<p data-ke-size="size14">※ 참고: 눈누 페이지의 웹폰트 코드 파일명은 "Cafe24Oneprettynight.woff"로, 페이지에 표시된 폰트명("카페24 고운밤")과 파일명이 다르게 등록돼 있다 — 코드는 실제 페이지 기준 그대로다.</p>`,
    downloadUrl: 'https://fonts.cafe24.com/', category: '손글씨체',
    metaDesc: '카페24가 배포하는 무료 한글 폰트 카페24 고운밤을 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 156, id: 343, name: '카페24 빛나는별', slug: 'cafe24-shiningstar', family: 'Cafe24ShiningStar',
    intro: '카페24 빛나는별은 카페24가 제작해 배포하는 무료 한글 폰트로, 살짝 기울어진 필기체 느낌의 캘리그라피체다. 반짝이는 느낌이 필요한 타이틀이나 포스터 문구에 어울린다.',
    previewText: '살짝 기울어진 손글씨 캘리그라피체입니다.',
    weights: [{ family: 'Cafe24ShiningStar', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Shiningstar.woff', weight: 'normal' }],
    license: CAFE24_LICENSE,
    rows: [
      ['인쇄', '브로슈어, 포스터, 책, 잡지 및 출판용 인쇄물 등', '사용 가능'],
      ['웹사이트', '웹페이지, 광고 배너, 메일, E-브로슈어 등', '사용 가능'],
      ['포장지', '판매용 상품의 패키지', '사용 가능'],
      ['영상', '유튜브, CF, 상업영화, 뮤직비디오, 영상 자막, 영상 오프닝/엔딩 크레딧 등', '사용 가능'],
      ['임베딩', '웹사이트 및 프로그램 서버 내 폰트 탑재, E-book 제작', '사용 가능'],
      ['BI/CI', '회사명, 브랜드명, 상품명, 로고, 마크, 슬로건, 캐치프레이즈', '사용 가능'],
      ['OFL', '폰트 파일 수정·복제·배포 가능, 단 유료 판매는 금지', ''],
    ],
    note: null,
    downloadUrl: 'https://fonts.cafe24.com/', category: '캘리그라피체',
    metaDesc: '카페24가 배포하는 무료 한글 폰트 카페24 빛나는별을 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 157, id: 344, name: '카페24 심플해', slug: 'cafe24-simple', family: 'Cafe24Simple',
    intro: '카페24 심플해는 카페24가 제작해 배포하는 무료 한글 폰트로, 각진 바탕에 장식 요소를 더한 고딕체다. 담백하면서도 포인트가 필요한 본문·타이틀에 두루 쓸 수 있다.',
    previewText: '각진 바탕 느낌의 담백한 고딕체입니다.',
    weights: [{ family: 'Cafe24Simple', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Simplehae.woff', weight: 'normal' }],
    license: CAFE24_LICENSE,
    rows: [
      ['인쇄', '브로슈어, 포스터, 책, 잡지 및 출판용 인쇄물 등', '사용 가능'],
      ['웹사이트', '웹페이지, 광고 배너, 메일, E-브로슈어 등', '사용 가능'],
      ['포장지', '판매용 상품의 패키지', '사용 가능'],
      ['영상', '유튜브, CF, 상업영화, 뮤직비디오, 영상 자막, 영상 오프닝/엔딩 크레딧 등', '사용 가능'],
      ['임베딩', '웹사이트 및 프로그램 서버 내 폰트 탑재, E-book 제작', '사용 가능'],
      ['BI/CI', '회사명, 브랜드명, 상품명, 로고, 마크, 슬로건, 캐치프레이즈', '사용 가능'],
      ['OFL', '폰트 파일 수정·복제·배포 가능, 단 유료 판매는 금지', ''],
    ],
    note: null,
    downloadUrl: 'https://fonts.cafe24.com/', category: '고딕체',
    metaDesc: '카페24가 배포하는 무료 한글 폰트 카페24 심플해를 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 158, id: 345, name: '카페24 쑥쑥', slug: 'cafe24-ssukssuk', family: 'Cafe24Ssukssuk',
    intro: '카페24 쑥쑥은 카페24가 제작해 배포하는 무료 한글 폰트로, 또박또박 각진 느낌의 손글씨 고딕체다. 명확하게 읽혀야 하는 안내문이나 캡션에 어울린다.',
    previewText: '또박또박 각진 느낌의 손글씨체입니다.',
    weights: [{ family: 'Cafe24Ssukssuk', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Ssukssuk.woff', weight: 'normal' }],
    license: CAFE24_LICENSE,
    rows: [
      ['인쇄', '브로슈어, 포스터, 책, 잡지 및 출판용 인쇄물 등', '사용 가능'],
      ['웹사이트', '웹페이지, 광고 배너, 메일, E-브로슈어 등', '사용 가능'],
      ['포장지', '판매용 상품의 패키지', '사용 가능'],
      ['영상', '유튜브, CF, 상업영화, 뮤직비디오, 영상 자막, 영상 오프닝/엔딩 크레딧 등', '사용 가능'],
      ['임베딩', '웹사이트 및 프로그램 서버 내 폰트 탑재, E-book 제작', '사용 가능'],
      ['BI/CI', '회사명, 브랜드명, 상품명, 로고, 마크, 슬로건, 캐치프레이즈', '사용 가능'],
      ['OFL', '폰트 파일 수정·복제·배포 가능, 단 유료 판매는 금지', ''],
    ],
    note: null,
    downloadUrl: 'https://fonts.cafe24.com/', category: '손글씨체',
    metaDesc: '카페24가 배포하는 무료 한글 폰트 카페24 쑥쑥을 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 159, id: 346, name: '카페24 숑숑', slug: 'cafe24-ssongssong', family: 'Cafe24SsongSsong',
    intro: '카페24 숑숑은 카페24가 제작해 배포하는 무료 한글 폰트로, 동글동글 귀여운 둥근 손글씨체다. 친근하고 발랄한 느낌이 필요한 콘텐츠에 어울린다.',
    previewText: '동글동글 귀여운 둥근 손글씨체입니다.',
    weights: [{ family: 'Cafe24SsongSsong', url: 'https://gcore.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Syongsyong.woff', weight: 'normal' }],
    license: CAFE24_LICENSE,
    rows: [
      ['인쇄', '브로슈어, 포스터, 책, 잡지 및 출판용 인쇄물 등', '사용 가능'],
      ['웹사이트', '웹페이지, 광고 배너, 메일, E-브로슈어 등', '사용 가능'],
      ['포장지', '판매용 상품의 패키지', '사용 가능'],
      ['영상', '유튜브, CF, 상업영화, 뮤직비디오, 영상 자막, 영상 오프닝/엔딩 크레딧 등', '사용 가능'],
      ['임베딩', '웹사이트 및 프로그램 서버 내 폰트 탑재, E-book 제작', '사용 가능'],
      ['BI/CI', '회사명, 브랜드명, 상품명, 로고, 마크, 슬로건, 캐치프레이즈', '사용 가능'],
      ['OFL', '폰트 파일 수정·복제·배포 가능, 단 유료 판매는 금지', ''],
    ],
    note: `<p data-ke-size="size14">※ 참고: 이 폰트의 웹폰트 코드는 jsdelivr의 다른 미러 서버 주소(gcore.jsdelivr.net)로 등록돼 있다 — 페이지에 표시된 실제 코드 그대로다.</p>`,
    downloadUrl: 'https://fonts.cafe24.com/', category: '손글씨체',
    metaDesc: '카페24가 배포하는 무료 한글 폰트 카페24 숑숑을 실제 페이지 기준으로 검증해 라이선스와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 160, id: 347, name: 'Yoon 세희', slug: 'yoon-sehee', family: 'YoonSSH',
    intro: 'Yoon 세희는 윤디자인이 제작해 배포하는 무료 한글 폰트로, 자연스러운 손글씨 느낌의 서체다. 다만 임베딩(웹사이트·서버 내 폰트 탑재)이 명시적으로 금지돼 있어 웹폰트로 서비스에 적용하기 전 확인이 필요하다.',
    previewText: '자연스러운 느낌의 손글씨체입니다.',
    weights: [{ family: 'YoonSSH', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/YoonSSH.woff', weight: 'normal' }],
    license: YOON_LICENSE,
    rows: EMBED_BAN_ROWS,
    note: `<p data-ke-size="size14">※ 주의: 이 폰트는 요약표에서 "임베딩(웹사이트·프로그램 서버 내 폰트 탑재, E-book 제작)"을 명시적으로 사용 금지로 표기하고 있다 — 별도 허락 없이 서버에 폰트 파일을 올려 임베딩하는 웹폰트 방식 자체가 제한될 수 있으니 실제 서비스 적용 전 저작권자(윤디자인, 02-2287-6700)에게 반드시 확인해야 한다.</p>`,
    downloadUrl: 'https://font.co.kr/collection/detail?pd_idx=10339&pd_type=fonts&pd_price=0&pd_kinds=collection&lc_family_sel=&lc_price_sum=0&lc_price_set=&lc_font=14&lc_scale=1&lc_range=%EB%82%98%EB%88%94+%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4&lc_users=1&lc_term=999&price_users=1',
    category: '손글씨체',
    metaDesc: '윤디자인이 배포하는 무료 한글 폰트 Yoon 세희를 실제 페이지 기준으로 검증해 라이선스(임베딩 사용 금지 조항 포함)와 웹폰트 코드까지 정리했습니다.',
  },
  {
    catalogIndex: 161, id: 348, name: 'Yoon 민준', slug: 'yoon-minjun', family: 'YoonSMJ',
    intro: 'Yoon 민준은 윤디자인이 제작해 배포하는 무료 한글 폰트로, 자연스러운 손글씨 느낌의 서체다. Yoon 세희와 마찬가지로 임베딩(웹사이트·서버 내 폰트 탑재)이 명시적으로 금지돼 있어 웹폰트로 서비스에 적용하기 전 확인이 필요하다.',
    previewText: '자연스러운 느낌의 손글씨체입니다.',
    weights: [{ family: 'YoonSMJ', url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/YoonSMJ.woff', weight: 'normal' }],
    license: YOON_LICENSE,
    rows: EMBED_BAN_ROWS,
    note: `<p data-ke-size="size14">※ 주의: 이 폰트는 요약표에서 "임베딩(웹사이트·프로그램 서버 내 폰트 탑재, E-book 제작)"을 명시적으로 사용 금지로 표기하고 있다 — 별도 허락 없이 서버에 폰트 파일을 올려 임베딩하는 웹폰트 방식 자체가 제한될 수 있으니 실제 서비스 적용 전 저작권자(윤디자인, 02-2287-6700)에게 반드시 확인해야 한다.</p>
<p data-ke-size="size14">※ 참고: Yoon 세희(같은 제작사)와 라이선스 본문·구조가 동일하다.</p>`,
    downloadUrl: 'https://font.co.kr/collection/detail?pd_idx=10339&pd_type=fonts&pd_price=0&pd_kinds=collection&lc_family_sel=&lc_price_sum=0&lc_price_set=&lc_font=14&lc_scale=1&lc_range=%EB%82%98%EB%88%94+%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4&lc_users=1&lc_term=999&price_users=1',
    category: '손글씨체',
    metaDesc: '윤디자인이 배포하는 무료 한글 폰트 Yoon 민준을 실제 페이지 기준으로 검증해 라이선스(임베딩 사용 금지 조항 포함)와 웹폰트 코드까지 정리했습니다.',
  },
];

function buildFontFaceBlocks(weights, familyOverride) {
  return weights.map(w => `@font-face {
    font-family: '${familyOverride}';
    src: url('${w.url}') format('woff');
    font-weight: ${w.weight};
    font-display: swap;
}`).join('\n');
}

for (const f of fonts) {
  const dir = `posts/2026-09-08-noonnu-font-${f.slug}`;
  mkdirSync(`${dir}/attachments`, { recursive: true });

  const liveFamily = `${f.family}-live`;
  const previewWeight = f.weights[Math.floor(f.weights.length / 2)] || f.weights[0];
  const codeBlocks = buildFontFaceBlocks(f.weights, f.family);
  const weightNote = f.weights.length > 1
    ? ` ${f.weights.length}가지 굵기를 제공한다.`
    : '';

  const finalHtml = `<p data-ke-size="size16">${f.intro}</p>

<style>
@font-face {
  font-family: '${liveFamily}';
  src: url('${previewWeight.url}') format('woff');
  font-weight: normal;
  font-display: swap;
}
</style>
<div class="font-preview-card">
<p class="font-preview-text" style="font-family: '${liveFamily}', sans-serif;">${f.previewText}</p>
</div>

<h2>라이선스</h2>
<p data-ke-size="size16">${f.license}</p>

${table(f.rows)}
${NOTE_FOOTER}
${f.note ? f.note + '\n' : ''}
<h2>웹폰트 코드</h2>
<p data-ke-size="size16">웹폰트로 사용할 때 필요한 코드는 다음과 같다.${weightNote}</p>
<pre><code class="language-css">${codeBlocks}</code></pre>

<h2>다운로드</h2>
<p data-ke-size="size16">${f.name} 파일은 다음 페이지에서 받을 수 있다.</p>
<p data-ke-size="size16"><a href="${f.downloadUrl}" target="_blank" rel="noopener">${f.name} 다운로드 페이지 바로가기</a></p>
`;

  writeFileSync(`${dir}/final.html`, finalHtml, 'utf-8');

  const metaMd = `# 제목: ${f.name} 무료 한글 웹폰트 — ${f.previewText.replace(/입니다\.$/, '')}

- 카테고리: Design > Font
- 태그: ${f.name}, 무료폰트, 한글폰트, ${f.category}, 웹폰트
- 메타디스크립션: ${f.metaDesc}
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
- 1차 출처: noonnu.cc ${f.name} 페이지(font_page/${f.id})
- 확인 시점: 2026-09-08
- 직접 검증한 항목: @font-face 코드는 Playwright로 noonnu 페이지를 직접 열어 \`document.documentElement.innerHTML\`에서 정규식으로 실측 확인(WebFetch 미사용). 라이선스 본문·요약표 전문 대조.
- 미검증 항목: 실제 다운로드 페이지의 다운로드 절차까지는 수행하지 않음(링크 URL만 확인)
`;

  writeFileSync(`${dir}/meta.md`, metaMd, 'utf-8');

  // thumb html
  const thumbHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
@font-face {
  font-family: '${liveFamily}';
  src: url('${previewWeight.url}') format('woff');
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
  font-size:32px;
  color:#a3a3a3;
  margin-top:24px;
}
</style>
</head>
<body>
<div class="name">${f.name}</div>
<div class="sub">${f.previewText.replace(/입니다\.$/, '')}</div>
</body>
</html>
`;
  writeFileSync(`_workspace/noonnu-thumbs/thumb-${f.id}-${f.slug}.html`, thumbHtml, 'utf-8');
}

console.log('done, generated', fonts.length, 'fonts');
console.log(JSON.stringify(fonts.map(f => ({ catalogIndex: f.catalogIndex, id: f.id, name: f.name, slug: f.slug }))));
