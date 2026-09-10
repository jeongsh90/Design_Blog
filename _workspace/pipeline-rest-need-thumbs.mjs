import { readFileSync, existsSync, writeFileSync } from "fs";

const prepared = JSON.parse(readFileSync("_workspace/pipeline-rest-prepared.json", "utf8"));
const need = prepared.filter((p) => !existsSync(`${p.postFolder}attachments/thumbnail.png`));
writeFileSync("_workspace/pipeline-rest-need-thumbs.json", JSON.stringify(need.map((p) => ({ id: p.id, slug: p.slug })), null, 2));
console.log(JSON.stringify({ total: prepared.length, need: need.length, sample: need.slice(0, 5) }));
