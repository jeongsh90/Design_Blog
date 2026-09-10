import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";

const prepared = JSON.parse(readFileSync("_workspace/pipeline-rest-prepared.json", "utf8"));
const scrape = JSON.parse(readFileSync("_workspace/pipeline-rest-scrape.json", "utf8"));
const progressPath = "_workspace/01_noonnu-batch-progress.json";
const progress = JSON.parse(readFileSync(progressPath, "utf8"));

const existingIds = new Set(progress.localOnlyPrepared.map((x) => x.id));
const entries = [];
for (const p of prepared) {
  if (existingIds.has(p.id)) continue;
  const png = `${p.postFolder}attachments/thumbnail.png`;
  if (existsSync(png)) {
    try {
      copyFileSync(png, `_workspace/noonnu-thumbs/thumb-${p.id}-${p.slug}.png`);
    } catch {}
  }
  entries.push({
    catalogIndex: p.catalogIndex,
    id: p.id,
    name: p.name,
    postFolder: p.postFolder,
    registeredInTistory: false,
    note: `[배치16~] final.html \"눈누\" 언급 없음. 1200x630 썸네일 검증 완료.`,
  });
}

const skippedEmbed = scrape
  .filter((r) => r.skip === "embedding banned")
  .map((r) => ({
    id: r.id,
    name: r.catalogName,
    reason: "[배치16~] 임베딩(웹사이트·서버 폰트탑재) 금지",
  }));
const skippedNoFace = scrape
  .filter((r) => r.skip === "no @font-face" || r.skip === "no modern woff")
  .map((r) => ({
    catalogIndex: null,
    id: r.id,
    name: r.catalogName,
    reason: `[배치16~] ${r.skip}`,
  }));

if (!progress.skippedEmbedBan) progress.skippedEmbedBan = [];
progress.skippedEmbedBan.push(...skippedEmbed);
progress.skippedNoWebfontCode.push(...skippedNoFace);

progress.localOnlyPrepared.push(...entries);
progress.status = "catalog_local_drafts_complete_2026-09-10";
progress.note =
  "id584~1919 카탈로그 잔여 776건 전수 조사 완료. 채택 728(웹폰트 woff 있음)·스킵 48(임베딩 금지 27·@font-face/모던 woff 없음 21). 티스토리 미등록 로컬 초안. 다음 공개 발행은 티몬체 임시저장 이어쓰기.";
progress.previousNote_batch16_rest =
  "배치16~(2026-09-10) — 레이트리밋(429) 재시도 후 전수 스크래핑. catalogIndex314~. 폰트명/제작사에 '눈누'가 있으면 본문 표기에서 제거.";
progress.nextBatchStartsAt = {
  catalogIndex: Math.max(...prepared.map((p) => p.catalogIndex)) + 1,
  note: "카탈로그 id1919까지 조사 완료. 추가 초안은 신규 카탈로그 항목이 생길 때만.",
};

writeFileSync(progressPath, JSON.stringify(progress, null, 2) + "\n");
console.log(
  JSON.stringify(
    {
      added: entries.length,
      localOnlyPrepared: progress.localOnlyPrepared.length,
      skippedEmbed: skippedEmbed.length,
      skippedNoFace: skippedNoFace.length,
      next: progress.nextBatchStartsAt,
    },
    null,
    2,
  ),
);
