import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

const COPY = {
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

const missing = [];
const ok = [];
for (const [id, slug] of Object.entries(COPY)) {
  const dir = `posts/2026-09-10-noonnu-font-${slug}`;
  const png = join(dir, "attachments/thumbnail.png");
  const html = join(dir, "final.html");
  const thumbHtml = `_workspace/noonnu-thumbs/thumb-${id}-${slug}.html`;
  const row = {
    id: Number(id),
    slug,
    dir: existsSync(dir),
    html: existsSync(html),
    png: existsSync(png),
    thumbHtml: existsSync(thumbHtml),
  };
  if (!row.dir || !row.html || !row.png || !row.thumbHtml) missing.push(row);
  else ok.push(row);
}

const orphanDirs = readdirSync("posts").filter(
  (d) =>
    d.startsWith("2026-09-10-noonnu-font-") &&
    !Object.values(COPY).some((s) => d === `2026-09-10-noonnu-font-${s}`) &&
    [
      "y-neoman",
      "ainmam",
      "agisarang",
      "bareunhipi",
      "bareunjeongsin",
      "bbanggunimam",
      "baekgeumrye",
      "hanadoeeo",
      "baeeunhye",
      "beodeunamu",
      "beomsom",
      "cheolpil",
      "siwoo-cute",
      "dachae-sarang",
      "dahaeng",
      "uri-ddal",
      "sandoll-samlip-hoppang-basic",
      "sandoll-samlip-hoppang-outline",
    ].some((s) => d.endsWith(s)),
);

console.log(JSON.stringify({ ok: ok.length, missing, orphanDirs }, null, 2));
