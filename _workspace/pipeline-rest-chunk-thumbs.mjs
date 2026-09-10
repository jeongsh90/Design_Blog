import { readFileSync, writeFileSync, existsSync } from "fs";

const prepared = JSON.parse(readFileSync("_workspace/pipeline-rest-prepared.json", "utf8"));
const need = prepared
  .filter((p) => !existsSync(`${p.postFolder}attachments/thumbnail.png`))
  .map((p) => ({ id: p.id, slug: p.slug }));
writeFileSync("_workspace/pipeline-rest-need-thumbs.json", JSON.stringify(need, null, 2));
const CHUNK = 40;
const chunks = [];
for (let i = 0; i < need.length; i += CHUNK) chunks.push(need.slice(i, i + CHUNK));
writeFileSync("_workspace/pipeline-rest-thumb-chunks.json", JSON.stringify(chunks, null, 2));
console.log(JSON.stringify({ need: need.length, chunks: chunks.length, chunkSize: CHUNK }));
