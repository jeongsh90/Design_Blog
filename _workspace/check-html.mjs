async function check(id) {
  const res = await fetch("https://noonnu.cc/font_page/" + id, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const html = await res.text();
  const faces = [...html.matchAll(/@font-face/gi)].length;
  const styleTags = [...html.matchAll(/<style/gi)].length;
  const jsdelivr = (html.match(/jsdelivr[^\s"'<>]*/gi) || []).slice(0, 5);
  const projectnoonnu = (html.match(/projectnoonnu[^\s"'<>]*/gi) || []).slice(0, 5);
  const woff = (html.match(/https?:[^"'\\\s>]+\.woff2?/gi) || []).slice(0, 5);
  console.log(
    JSON.stringify(
      {
        id,
        status: res.status,
        url: res.url,
        len: html.length,
        faces,
        styleTags,
        jsdelivr,
        projectnoonnu,
        woff,
        hasStimulus: html.includes("data-controller"),
      },
      null,
      2,
    ),
  );
}

await check(584);
await check(694);
await check(1050);
await check(533);
await check(1919);
