const scrape = JSON.parse(await Bun.file("_workspace/batch13-scrape.json").text());
const ids = scrape.filter((r) => r.ok).map((r) => r.id);

function decode(s) {
  return s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

const out = {};
for (const id of ids) {
  const res = await fetch("https://noonnu.cc/font_page/" + id);
  const html = await res.text();
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => decode(m[1]));
  const skip = /jsdelivr|facebook|twitter|kakao|instagram|cdn\.|noonnu\.cc\/(fonts|font_page|notice|blog)/i;
  const http = hrefs.filter((h) => /^https?:/i.test(h) && !skip.test(h));
  const prefer = http.filter((h) =>
    /download|font\.co|fonts\.|go\.kr|github|nexon|yes24|chosun|ibm|plex|tmoney|binggrae|gimpo|yp21|andong|kyobo|bccard|paybooc|lotte|daewoong|font\.nexon|company\.yes24|sangsang|tokki/i.test(
      h
    )
  );
  const uniq = [...new Set(prefer.length ? prefer : http.filter((h) => !/google\.com\/fonts/i.test(h)))];
  out[id] = uniq.slice(0, 5);
  console.log(id, uniq.slice(0, 3).join(" | ") || "(none)");
  await Bun.sleep(150);
}

await Bun.write("_workspace/batch13-downloads.json", JSON.stringify(out, null, 2));
