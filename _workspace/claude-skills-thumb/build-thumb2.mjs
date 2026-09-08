import { readFileSync, writeFileSync } from "node:fs";

const anthropicB64 = readFileSync(new URL("./logos/anthropic-b64.txt", import.meta.url), "utf8").trim();
const tasteB64 = readFileSync(new URL("./logos/taste-b64.txt", import.meta.url), "utf8").trim();

const vercelTriangle = `<svg viewBox="0 0 115 100" width="46" height="40"><path fill="#fff" fill-rule="evenodd" d="M57.5 0 115 100H0z" clip-rule="evenodd"/></svg>`;

const gsdMark = `<svg viewBox="0 0 200 200" width="56" height="56">
<defs>
<linearGradient id="brandCyanGrad" x1="90" y1="20" x2="30" y2="180" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#00E5FF"/><stop offset="45%" stop-color="#00B4D8"/><stop offset="100%" stop-color="#0077B6"/></linearGradient>
<linearGradient id="brandCoralGrad" x1="110" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFA07A"/><stop offset="45%" stop-color="#FF6B4A"/><stop offset="100%" stop-color="#FF4500"/></linearGradient>
</defs>
<path d="M 91 23 A 77.5 77.5 0 0 0 91 177 L 91 143.5 A 44 44 0 0 1 91 56.5 Z" fill="url(#brandCyanGrad)"/>
<path d="M 109 23 A 77.5 77.5 0 0 1 109 177 L 109 143.5 A 44 44 0 0 0 109 56.5 Z" fill="url(#brandCoralGrad)"/>
</svg>`;

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
<style>
html,body{margin:0;padding:0;}
body{
  width:1200px;height:630px;
  background:#171717;
  font-family:'Pretendard Variable','Pretendard',-apple-system,sans-serif;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  position:relative;
  overflow:hidden;
}
.grid-bg{
  position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size:48px 48px;
  mask-image:radial-gradient(ellipse 900px 500px at 50% 40%, black, transparent);
}
.kicker{
  font-weight:600;
  font-size:22px;
  letter-spacing:0.02em;
  color:#8ec5ff;
  position:relative;
  text-align:center;
}
.title{
  font-weight:700;
  font-size:56px;
  letter-spacing:-0.02em;
  color:#fafafa;
  margin-top:14px;
  position:relative;
  text-align:center;
}
.dock{
  margin-top:56px;
  display:flex;
  gap:32px;
  position:relative;
}
.app{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:14px;
  width:150px;
}
.tile{
  width:120px;height:120px;
  border-radius:28px;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 12px 28px rgba(0,0,0,0.45);
  border:1px solid rgba(255,255,255,0.08);
  overflow:hidden;
}
.tile img{
  width:76px;height:76px;
  object-fit:contain;
}
.label{
  font-weight:600;
  font-size:16px;
  color:#d4d4d4;
  text-align:center;
  line-height:1.3;
}
</style>
</head>
<body>
<div class="grid-bg"></div>
<div class="kicker">AI · SKILL</div>
<div class="title">Claude Code 필수 스킬 5개</div>
<div class="dock">
  <div class="app">
    <div class="tile" style="background:#000000;">${vercelTriangle}</div>
    <div class="label">Agent Browser</div>
  </div>
  <div class="app">
    <div class="tile" style="background:#000000;">${vercelTriangle}</div>
    <div class="label">Find Skills</div>
  </div>
  <div class="app">
    <div class="tile" style="background:#0a0a0a;">${gsdMark}</div>
    <div class="label">GSD Core</div>
  </div>
  <div class="app">
    <div class="tile" style="background:#26241f;"><img src="data:image/webp;base64,${tasteB64}" /></div>
    <div class="label">Design Taste<br>Frontend</div>
  </div>
  <div class="app">
    <div class="tile" style="background:#000000;"><img src="data:image/png;base64,${anthropicB64}" style="width:100%;height:100%;" /></div>
    <div class="label">MCP Builder</div>
  </div>
</div>
</body>
</html>
`;

writeFileSync(new URL("./thumb2.html", import.meta.url), html);
console.log("wrote thumb2.html", html.length);
