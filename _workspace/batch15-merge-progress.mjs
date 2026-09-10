import { copyFileSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const prepared = JSON.parse(readFileSync("_workspace/batch15-prepared.json", "utf8"));
const noonnu = [];
const bad = [];
const missing = [];

for (const p of prepared) {
  const png = join(p.postFolder, "attachments/thumbnail.png");
  const html = join(p.postFolder, "final.html");
  try {
    const buf = readFileSync(png);
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    if (w !== 1200 || h !== 630) bad.push({ id: p.id, w, h });
    copyFileSync(png, `_workspace/noonnu-thumbs/thumb-${p.id}-${p.slug}.png`);
  } catch {
    missing.push(p.id);
  }
  const text = readFileSync(html, "utf8");
  if (text.includes("눈누")) noonnu.push(p.id);
}

if (missing.length || bad.length || noonnu.length) {
  console.error({ missing, bad, noonnu });
  process.exit(1);
}

const progressPath = "_workspace/01_noonnu-batch-progress.json";
const progress = JSON.parse(readFileSync(progressPath, "utf8"));

const entries = prepared.map((p) => ({
  catalogIndex: p.catalogIndex,
  id: p.id,
  name: p.name,
  postFolder: p.postFolder,
  registeredInTistory: false,
  note: `[배치15] final.html \"눈누\" 언급 없음. 1200x630 썸네일 검증 완료.`,
}));

progress.localOnlyPrepared.push(...entries);
progress.status = "batch12_15_local_drafts_2026-09-10";
progress.note =
  "배치12~15 로컬 초안 완성(티스토리 미등록). 배치14 42개(id468~533)+배치15 50개(id534~583 네이버 클로바 나눔손글씨). catalogIndex 147~313. 다음 공개 발행은 티몬체 임시저장 이어쓰기. 다음 초안 조사는 id584부터.";
progress.previousNote_batch15 =
  "배치15(2026-09-10) — id534~583 전부 채택(50개, 스킵 0). 전부 네이버 클로바 나눔손글씨. catalogIndex264~313.";
progress.nextBatchStartsAt = {
  catalogIndex: 314,
  note: "배치15(2026-09-10)는 id534~583 50개를 전부 채택(catalogIndex264~313). 다음 배치는 카탈로그상 id584부터 순차 조사 시작.",
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
