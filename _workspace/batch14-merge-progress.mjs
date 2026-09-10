import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATE = "2026-09-10";
const START_CATALOG = 222;

const NAMES = {
  468: "노회찬체",
  470: "완도청정바다체",
  471: "완도희망체",
  479: "한글재민체",
  480: "위메프체",
  483: "영양군 음식디미방체",
  484: "코트라 고딕체",
  485: "코트라 볼드체",
  486: "코트라 손글씨체",
  497: "잘풀리는오늘체",
  498: "잘풀리는하루체",
  499: "을지로10년후체",
  500: "Y 너만을 비춤체",
  502: "이랜드 초이스체",
  504: "이랜드 나이스체",
  506: "솔뫼 김대건체",
  507: "산돌 삼립호빵체 Basic",
  508: "산돌 삼립호빵체 Outline",
  510: "아인맘 손글씨",
  511: "암스테르담",
  512: "안쌍체",
  513: "아기사랑체",
  514: "바른히피",
  515: "바른정신",
  516: "빵구니맘 손글씨",
  517: "야채장수 백금례",
  518: "하나되어 손글씨",
  519: "배은혜체",
  520: "비상체",
  521: "버드나무",
  522: "부장님 눈치체",
  523: "범솜체",
  524: "초딩희망",
  525: "철필글씨",
  526: "코코체",
  527: "시우 귀여워",
  528: "다채사랑",
  529: "다행체",
  530: "다진체",
  531: "우리딸 손글씨",
  532: "따악단단",
  533: "또박또박",
};

const SLUGS = {
  468: "roh-hoechan",
  470: "wando-cleansea",
  471: "wando-hope",
  479: "hangul-jaemin",
  480: "wemakeprice",
  483: "yeongyang-dimibang",
  484: "kotra-gothic",
  485: "kotra-bold",
  486: "kotra-hand",
  497: "jalpul-oneul",
  498: "jalpul-haru",
  499: "euljiro-10years",
  500: "y-spotlight",
  502: "eland-choice",
  504: "eland-nice",
  506: "solmoe-kimdaegun",
  507: "sandoll-samlip-basic",
  508: "sandoll-samlip-outline",
  510: "ainmom",
  511: "amsterdam",
  512: "anssang",
  513: "baby-love",
  514: "bareun-hipi",
  515: "bareun-mental",
  516: "bbangguni-mom",
  517: "baekeumrye",
  518: "become-one",
  519: "beeunhye",
  520: "bisang",
  521: "bud-tree",
  522: "bujangnim-nunchi",
  523: "bumsom",
  524: "choding-hope",
  525: "chulpil-writing",
  526: "coco",
  527: "cute-siu",
  528: "dache-love",
  529: "daheng",
  530: "dajin",
  531: "daughter-handwriting",
  532: "ddakdandan",
  533: "ddobakddobak",
};

const ids = Object.keys(SLUGS).map(Number).sort((a, b) => a - b);

// IHDR + 눈누 check
const noonnuHits = [];
const badPng = [];
for (const id of ids) {
  const slug = SLUGS[id];
  const folder = `posts/${DATE}-noonnu-font-${slug}`;
  const png = join(folder, "attachments/thumbnail.png");
  const html = join(folder, "final.html");
  const buf = readFileSync(png);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (w !== 1200 || h !== 630) badPng.push({ id, w, h });
  const text = readFileSync(html, "utf8");
  if (text.includes("눈누")) noonnuHits.push(id);
  const thumbDest = `_workspace/noonnu-thumbs/thumb-${id}-${slug}.png`;
  copyFileSync(png, thumbDest);
}

if (badPng.length || noonnuHits.length) {
  console.error({ badPng, noonnuHits });
  process.exit(1);
}

const progressPath = "_workspace/01_noonnu-batch-progress.json";
const progress = JSON.parse(readFileSync(progressPath, "utf8"));

const entries = ids.map((id, i) => ({
  catalogIndex: START_CATALOG + i,
  id,
  name: NAMES[id],
  postFolder: `posts/${DATE}-noonnu-font-${SLUGS[id]}/`,
  registeredInTistory: false,
  note: `[배치14] final.html \"눈누\" 언급 없음. 1200x630 썸네일 검증 완료.`,
}));

progress.localOnlyPrepared.push(...entries);
progress.status = "batch12_13_14_local_drafts_2026-09-10";
progress.note =
  "배치12(35)+배치13(40)+배치14(42, id468~533)를 당일 공개 한도 소진 후 티스토리 등록 없이 로컬 초안으로 완성. catalogIndex 147~263. 임베딩 금지 스킵: 비트로 코어체·프라이드체(477·478). @font-face 없음 스킵: 마루 부리(487). 다음 공개 발행은 티몬체 임시저장 이어쓰기. 다음 초안 조사는 id534부터.";
progress.previousNote_batch13 =
  "배치13(2026-09-10) — id395~466, 40개 로컬 초안, catalogIndex182~221.";
progress.previousNote_batch14 =
  "배치14(2026-09-10) — id468부터 순회 45후보 중 42채택. 네이버 클로바 나눔손글씨 다수(510~533). catalogIndex222~263.";
progress.nextBatchStartsAt = {
  catalogIndex: START_CATALOG + ids.length,
  note: "배치14(2026-09-10)는 id468부터 순회해 42개 채택(catalogIndex222~263). 스킵: 477·478 임베딩 금지, 487 웹폰트 코드 없음. 다음 배치는 카탈로그상 id534부터 순차 조사 시작.",
};

writeFileSync(progressPath, JSON.stringify(progress, null, 2) + "\n");
console.log(
  JSON.stringify(
    {
      added: entries.length,
      localOnlyPrepared: progress.localOnlyPrepared.length,
      next: progress.nextBatchStartsAt,
    },
    null,
    2,
  ),
);
