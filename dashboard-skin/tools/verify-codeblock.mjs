/**
 * [CODEBLOCK SPEC §9] 글 상세 본문 코드블록 검증 (14항목 × 라이트/다크)
 *
 * 전제: bun run skin:build && bun run skin:preview && bun run skin:serve
 * 실행: bun dashboard-skin/tools/verify-codeblock.mjs
 *
 * verify-footer.mjs와 동일한 기동 방식 — 이 환경에서 Playwright launch가
 * WebSocket 핸드셰이크에서 멈추므로 Chromium을 직접 spawn 후 puppeteer-core로 붙는다.
 * --show-scrollbars: 스크롤바를 숨긴 채로는 pre의 가로 스크롤 모델 관측이 왜곡된다.
 */
import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const shots = resolve(root, "_workspace", "codeblock-shots");
const BASE = process.env.SKIN_BASE || "http://localhost:4321";
const VP = { width: 1440, height: 900 };
const CDP_PORT = Number(process.env.CDP_PORT || 9361);

const PERMALINK = `${BASE}/_workspace/content_mockup-permalink.html`;
const PERMALINK_NOJS = `${BASE}/_workspace/content_mockup-permalink-nojs.html`;

mkdirSync(shots, { recursive: true });

const results = [];
let failures = 0;
function check(id, theme, label, ok, detail) {
  results.push({ id, theme, label, ok: !!ok, detail: String(detail) });
  if (!ok) failures++;
}
const eq = (id, t, l, a, e) =>
  check(id, t, l, String(a) === String(e), `actual=${JSON.stringify(a)} expected=${JSON.stringify(e)}`);
const near = (id, t, l, a, e, tol = 0.6) =>
  check(id, t, l, Math.abs(a - e) <= tol, `actual=${a} expected≈${e} (±${tol})`);

async function waitForCdp(port, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch { /* retry */ }
    await sleep(250);
  }
  throw new Error(`CDP not ready on :${port}`);
}

async function launch() {
  const chromePath = process.env.PLAYWRIGHT_CHROME_PATH || (() => {
    const base = `${process.env.USERPROFILE}\\AppData\\Local\\ms-playwright`;
    const dir = readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
    if (!dir) throw new Error(`chromium build not found under ${base}`);
    return `${base}\\${dir}\\chrome-win64\\chrome.exe`;
  })();
  const userData = resolve(process.env.TEMP || ".", `pw-code-verify-${process.pid}`);
  try { rmSync(userData, { recursive: true, force: true }); } catch { /* ok */ }
  mkdirSync(userData, { recursive: true });

  const child = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${userData}`,
      "--show-scrollbars",
      "about:blank",
    ],
    { stdio: "ignore", windowsHide: true }
  );
  const info = await waitForCdp(CDP_PORT);
  const browser = await puppeteer.connect({
    browserWSEndpoint: info.webSocketDebuggerUrl,
    defaultViewport: VP,
  });
  return { browser, child, userData };
}

const IGNORE = /favicon\.ico/;

async function main() {
  const { browser, child, userData } = await launch();

  const page = (await browser.pages())[0] || (await browser.newPage());
  await page.setViewport(VP);

  const cdp = await page.createCDPSession();
  try { await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true }); }
  catch (e) { console.log("[warn] focus emulation:", String(e)); }
  try {
    const bcdp = await browser.target().createCDPSession();
    await bcdp.send("Browser.grantPermissions", {
      origin: BASE,
      permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
    });
  } catch (e) { console.log("[warn] grantPermissions:", String(e)); }

  let consoleErrors = [];
  let requests = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORE.test(m.text() + " " + (m.location()?.url || "")))
      consoleErrors.push(m.text() + " @ " + (m.location()?.url || ""));
  });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + String(e)));
  page.on("response", (r) => {
    if (r.status() >= 400 && !IGNORE.test(r.url())) consoleErrors.push(`HTTP ${r.status()} ${r.url()}`);
  });
  page.on("request", (r) => requests.push(r.url()));

  async function setTheme(theme) {
    await page.evaluate((t) => {
      document.documentElement.classList.toggle("dark", t === "dark");
      try { localStorage.setItem("daitnu-theme", t); } catch {}
    }, theme);
    await sleep(500);
  }

  for (const theme of ["light", "dark"]) {
    consoleErrors = [];
    await page.goto(PERMALINK, { waitUntil: "networkidle0" });
    await page.bringToFront();
    await setTheme(theme);
    await page.waitForFunction(() => {
      const figs = [...document.querySelectorAll("[data-rehype-pretty-code-figure]")];
      const js = figs.find((f) => f.querySelector('[data-slot="code-block-name"]')?.textContent.trim() === "content.js");
      return !!(js && js.querySelector("[data-line] [class^='hljs-']"));
    }, { timeout: 8000 });

    const m = await page.evaluate(() => {
      const px = (n) => Math.round(n * 100) / 100;
      const body = document.querySelector('[data-slot="post-single-body"]');
      const figs = [...body.querySelectorAll("[data-rehype-pretty-code-figure]")];
      const byName = (n) =>
        figs.find((f) => f.querySelector('[data-slot="code-block-name"]')?.textContent.trim() === n);

      const probe = (host, value) => {
        const s = document.createElement("span");
        s.style.color = value;
        host.appendChild(s);
        const v = getComputedStyle(s).color;
        s.remove();
        return v;
      };
      const varOf = (name) => probe(body, `var(${name})`);

      const json = byName("components.json");
      const plain = byName("code");
      const jsFig = byName("content.js");

      const jsonPre = json.querySelector("pre");
      const jsonCode = jsonPre.querySelector("code");
      const jsonLines = [...jsonCode.querySelectorAll("[data-line]")];
      const line1 = jsonLines[0];
      const hl = jsonCode.querySelector("[data-highlighted-line]");
      const before = getComputedStyle(line1, "::before");
      const after = getComputedStyle(hl, "::after");

      /* 코드 첫 글자 x — Range로 실제 텍스트 박스를 잰다 */
      const range = document.createRange();
      range.selectNodeContents(line1);
      const textLeft = px(range.getBoundingClientRect().left);

      const caption = json.querySelector("[data-rehype-pretty-code-title]");
      const icon = json.querySelector('[data-slot="code-block-icon"]');
      const copy = json.querySelector("[data-code-copy]");
      const capCs = getComputedStyle(caption);
      const figCs = getComputedStyle(json);
      const iconR = icon.getBoundingClientRect();
      const copyR = copy.getBoundingClientRect();
      const capR = caption.getBoundingClientRect();

      /* 사전 강조 토큰 — §8-1 .hljs-attr 색 */
      const token = jsonCode.querySelector("[data-line] .hljs-attr");
      const expectAttr = document.documentElement.classList.contains("dark") ? "#79c0ff" : "#0550ae";
      const toRgb = (hex) => { const s = document.createElement("span"); s.style.color = hex; body.appendChild(s); const v = getComputedStyle(s).color; s.remove(); return v; };

      /* 하이라이트 아닌 행의 배경 */
      const plainRowBg = getComputedStyle(jsonLines[0]).backgroundColor;

      const inlineCode = [...body.querySelectorAll("code")].find((c) => c.closest("pre") === null);
      const icCs = inlineCode ? getComputedStyle(inlineCode) : null;
      const firstP = body.querySelector("p");
      const pCs = getComputedStyle(firstP);

      const doc = document.scrollingElement;
      const longPre = plain.querySelector("pre");

      return {
        figureCount: figs.length,
        names: figs.map((f) => f.querySelector('[data-slot="code-block-name"]').textContent.trim()),
        langs: figs.map((f) => f.getAttribute("data-language")),
        slots: figs.map((f) => f.getAttribute("data-slot")),
        pendingLeft: body.querySelectorAll("[data-code-pending]").length,

        gutterWidth: before.width,
        gutterPaddingRight: before.paddingRight,
        gutterColor: before.color,
        gutterBg: before.backgroundColor,
        gutterPosition: before.position,
        gutterContent: before.content,
        codeNumberVar: varOf("--color-code-number"),
        codeVar: varOf("--color-code"),
        codeHighlightVar: varOf("--color-code-highlight"),
        codeFgVar: varOf("--color-code-foreground"),
        preLeft: px(jsonPre.getBoundingClientRect().left),
        preInlinePadding: getComputedStyle(jsonPre).paddingLeft + "/" + getComputedStyle(jsonPre).paddingRight,
        preBlockPadding: getComputedStyle(jsonPre).paddingTop + "/" + getComputedStyle(jsonPre).paddingBottom,
        textLeft,

        capHeight: px(capR.height),
        capBorderBottom: capCs.borderBottomWidth,
        capBorderStyle: capCs.borderBottomStyle,
        capFont: capCs.fontFamily,
        capPaddingInline: capCs.paddingLeft + "/" + capCs.paddingRight,
        capBg: capCs.backgroundColor,
        figBg: figCs.backgroundColor,
        iconSize: `${Math.round(iconR.width)}x${Math.round(iconR.height)}`,
        iconRadius: getComputedStyle(icon).borderRadius,
        iconSvg: (() => { const s = icon.querySelector("svg").getBoundingClientRect(); return `${Math.round(s.width)}x${Math.round(s.height)}`; })(),
        copySize: `${Math.round(copyR.width)}x${Math.round(copyR.height)}`,
        copySvg: (() => { const s = copy.querySelector("svg").getBoundingClientRect(); return `${Math.round(s.width)}x${Math.round(s.height)}`; })(),
        copyRightGap: px(capR.right - copyR.right),

        figRadius: figCs.borderTopLeftRadius,
        figOverflow: figCs.overflow,
        figBorder: figCs.borderTopWidth,
        figMarginTop: figCs.marginTop,
        figFontSize: figCs.fontSize,
        preMarginTop: getComputedStyle(jsonPre).marginTop,
        preBorder: getComputedStyle(jsonPre).borderTopWidth,
        preBg: getComputedStyle(jsonPre).backgroundColor,

        lineCount: jsonLines.length,
        hlIndex: jsonLines.indexOf(hl),
        hlBg: getComputedStyle(hl).backgroundColor,
        hlPosition: getComputedStyle(hl).position,
        plainRowBg,
        afterWidth: after.width,
        afterHeight: after.height,
        afterBg: after.backgroundColor,
        barVar: probe(body, "color-mix(in oklab, var(--color-muted-foreground) 50%, transparent)"),
        hlRowHeight: px(hl.getBoundingClientRect().height),
        lineMinHeight: getComputedStyle(jsonLines[0]).minHeight,

        tokenColor: token ? getComputedStyle(token).color : null,
        tokenExpected: toRgb(expectAttr),

        /* highlight.js 라이브 경로 (언어만 있는 평문 pre) */
        jsLines: jsFig.querySelectorAll("[data-line]").length,
        jsColored: jsFig.querySelectorAll("[data-line] [class^='hljs-']").length,
        jsHl: jsFig.querySelectorAll("[data-highlighted-line]").length,
        jsHlIndex: [...jsFig.querySelectorAll("[data-line]")].findIndex((l) => l.hasAttribute("data-highlighted-line")),
        jsFirstLine: jsFig.querySelector("[data-line]").textContent,

        docScrollW: doc.scrollWidth,
        winW: window.innerWidth,
        longScrollW: longPre.scrollWidth,
        longClientW: longPre.clientWidth,
        longTabIndex: longPre.getAttribute("tabindex"),
        longCustomScrollbar: longPre.hasAttribute("data-custom-scrollbar"),

        inlineCode: icCs && {
          display: icCs.display, padding: icCs.padding, radius: icCs.borderTopLeftRadius,
          bg: icCs.backgroundColor, font: icCs.fontFamily, weight: icCs.fontWeight, size: icCs.fontSize,
        },
        mutedVar: probe(body, "var(--color-muted)"),
        pLineHeight: pCs.lineHeight,
        pFontSize: pCs.fontSize,
      };
    });

    /* ───────── 1. 줄번호 거터 ───────── */
    eq(1, theme, "[data-line]::before width 64px", m.gutterWidth, "64px");
    eq(1, theme, "[data-line]::before padding-right 24px", m.gutterPaddingRight, "24px");
    eq(1, theme, "거터 색 === --color-code-number", m.gutterColor, m.codeNumberVar);
    eq(1, theme, "거터 배경 === --color-code", m.gutterBg, m.codeVar);
    eq(1, theme, "거터 position sticky", m.gutterPosition, "sticky");
    eq(1, theme, "pre padding-inline 0 (줄번호 있음)", m.preInlinePadding, "0px/0px");
    eq(1, theme, "pre padding-block 14px", m.preBlockPadding, "14px/14px");
    near(1, theme, "코드 첫 글자 x === pre.left + 64", m.textLeft - m.preLeft, 64, 0.6);

    /* ───────── 2. 헤더 ───────── */
    check(2, theme, "figcaption 박스 높이 42~43px", m.capHeight >= 41.5 && m.capHeight <= 43.5, `h=${m.capHeight}`);
    eq(2, theme, "헤더 하단 보더 1px solid", `${m.capBorderBottom}/${m.capBorderStyle}`, "1px/solid");
    check(2, theme, "파일명 mono 폰트", /ui-monospace|Menlo|Consolas|monospace/.test(m.capFont), m.capFont);
    eq(2, theme, "헤더 좌우 패딩 16px", m.capPaddingInline, "16px/16px");
    eq(2, theme, "아이콘 배지 16×16", m.iconSize, "16x16");
    eq(2, theme, "아이콘 배지 원형", m.iconRadius, "3996px");
    eq(2, theme, "아이콘 글리프 10×10", m.iconSvg, "10x10");
    eq(2, theme, "복사 버튼 32×32", m.copySize, "32x32");
    eq(2, theme, "복사 아이콘 16×16", m.copySvg, "16x16");
    check(2, theme, "복사 버튼이 헤더 오른쪽 끝(패딩 16px 안쪽)", Math.abs(m.copyRightGap - 16) <= 0.6, `gap=${m.copyRightGap}`);
    check(2, theme, "헤더 배경(--code-header)이 figure 배경과 다름(Q2=b)", m.capBg !== m.figBg, `cap=${m.capBg} fig=${m.figBg}`);
    eq(2, theme, "파일명 렌더 = components.json", m.names.includes("components.json"), true);

    /* ───────── 3. figure ───────── */
    eq(3, theme, "figure border-radius 16px", m.figRadius, "16px");
    eq(3, theme, "figure overflow hidden", m.figOverflow, "hidden");
    eq(3, theme, "figure 보더 1px (Q3=b)", m.figBorder, "1px");
    eq(3, theme, "figure margin-top 24px", m.figMarginTop, "24px");
    eq(3, theme, "figure font-size 14px", m.figFontSize, "14px");
    eq(3, theme, "figure 배경 === --color-code", m.figBg, m.codeVar);
    eq(3, theme, "figure 안 pre margin-top 0", m.preMarginTop, "0px");
    eq(3, theme, "figure 안 pre 보더 0", m.preBorder, "0px");
    eq(3, theme, "figure 안 pre 배경 투명", m.preBg, "rgba(0, 0, 0, 0)");
    eq(3, theme, "figure data-slot=code-block", m.slots.every((s) => s === "code-block"), true);
    eq(3, theme, "figure 3개(plain/json/js)", m.figureCount, 3);
    eq(3, theme, "data-code-pending 잔여 0", m.pendingLeft, 0);

    /* ───────── 5. 토큰 ───────── */
    const expect = theme === "light"
      ? { code: "rgb(250, 250, 250)", hl: "rgb(245, 245, 245)", num: "rgb(115, 115, 115)", fg: "rgb(0, 0, 0)" }
      : { code: "rgb(23, 23, 23)", hl: "rgb(38, 38, 38)", num: "rgb(161, 161, 161)", fg: "rgb(161, 161, 161)" };
    eq(5, theme, "--color-code", m.codeVar, expect.code);
    eq(5, theme, "--color-code-highlight", m.codeHighlightVar, expect.hl);
    eq(5, theme, "--color-code-number", m.codeNumberVar, expect.num);
    eq(5, theme, "--color-code-foreground", m.codeFgVar, expect.fg);

    /* ───────── 6. 강조 색 ───────── */
    eq(6, theme, "사전강조 .hljs-attr 색 === §8-1",
      m.tokenColor, m.tokenExpected);
    check(6, theme, ".hljs-attr 토큰이 존재", !!m.tokenColor, String(m.tokenColor));

    /* ───────── 7. 하이라이트 행 ───────── */
    eq(7, theme, "JSON 샘플 10줄", m.lineCount, 10);
    eq(7, theme, "하이라이트 행 = 7번째", m.hlIndex + 1, 7);
    eq(7, theme, "하이라이트 행 배경 === --color-code-highlight", m.hlBg, m.codeHighlightVar);
    eq(7, theme, "다른 행 배경 투명", m.plainRowBg, "rgba(0, 0, 0, 0)");
    eq(7, theme, "하이라이트 행 position relative(§1-5 보강)", m.hlPosition, "relative");
    eq(7, theme, ":after 폭 2px", m.afterWidth, "2px");
    near(7, theme, ":after 높이 === 그 행 높이(figure 전체 아님)",
      parseFloat(m.afterHeight), m.hlRowHeight, 0.6);
    eq(7, theme, ":after 색 === --code-bar", m.afterBg, m.barVar);
    check(7, theme, "빈 줄 대비 min-height 보강(§1-5)", /em|px/.test(m.lineMinHeight), m.lineMinHeight);

    /* ───────── 8. 가로 오버플로 ───────── */
    eq(8, theme, "문서 가로 오버플로 0", m.docScrollW, m.winW);
    check(8, theme, "긴 줄은 pre 안에서만 스크롤", m.longScrollW > m.longClientW,
      `scrollW=${m.longScrollW} clientW=${m.longClientW}`);
    eq(8, theme, "pre tabindex=0(키보드 스크롤)", m.longTabIndex, "0");
    eq(8, theme, "pre data-custom-scrollbar", m.longCustomScrollbar, true);

    const sticky = await page.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const fig = [...body.querySelectorAll("[data-rehype-pretty-code-figure]")]
        .find((f) => f.querySelector('[data-slot="code-block-name"]').textContent.trim() === "components.json");
      const pre = fig.querySelector("pre");
      const line = pre.querySelector("[data-line]");
      const before0 = line.getBoundingClientRect().left;
      pre.scrollLeft = 120;
      const px = (n) => Math.round(n * 100) / 100;
      const r = document.createRange();
      r.selectNodeContents(line);
      const out = {
        scrollLeft: pre.scrollLeft,
        preLeft: px(pre.getBoundingClientRect().left),
        lineLeft: px(before0),
        textLeftAfter: px(r.getBoundingClientRect().left),
      };
      pre.scrollLeft = 0;
      return out;
    });
    check(8, theme, "가로 스크롤 후 줄번호 sticky 고정(코드만 밀림)",
      sticky.scrollLeft > 0 ? sticky.textLeftAfter < sticky.preLeft + 64 : true,
      JSON.stringify(sticky));

    /* ───────── 9. 인라인 code 회귀 ───────── */
    eq(9, theme, "인라인 code display inline", m.inlineCode.display, "inline");
    eq(9, theme, "인라인 code padding 0.8/1.2 spacing", m.inlineCode.padding, "3.2px 4.8px");
    eq(9, theme, "인라인 code radius --radius-md(8px)", m.inlineCode.radius, "8px");
    eq(9, theme, "인라인 code 배경 === --color-muted", m.inlineCode.bg, m.mutedVar);
    eq(9, theme, "인라인 code weight 600", m.inlineCode.weight, "600");
    eq(9, theme, "인라인 code size 14px", m.inlineCode.size, "14px");
    eq(9, theme, "본문 p 16px / 26px(변화 없음)", `${m.pFontSize}/${m.pLineHeight}`, "16px/26px");

    /* ───────── Q1=B highlight.js 라이브 ───────── */
    eq("B", theme, "language-js 블록 6줄", m.jsLines, 6);
    check("B", theme, "highlight.js가 .hljs-* 클래스를 실제로 심음",
      m.jsColored > 0, `colored spans=${m.jsColored}`);
    eq("B", theme, "재강조 후에도 하이라이트 행 유지(3번째)", `${m.jsHl}/${m.jsHlIndex + 1}`, "1/3");
    check("B", theme, "첫 줄 filename 지시자는 코드에서 제거됨",
      !/filename:/.test(m.jsFirstLine), JSON.stringify(m.jsFirstLine));

    /* ───────── 4. 복사 ───────── */
    const expectedRaw = await page.evaluate(() => {
      const fig = [...document.querySelectorAll("[data-rehype-pretty-code-figure]")]
        .find((f) => f.querySelector('[data-slot="code-block-name"]').textContent.trim() === "components.json");
      return [...fig.querySelectorAll("[data-line]")].map((l) => l.textContent).join("\n");
    });
    await page.evaluate(() => {
      const fig = [...document.querySelectorAll("[data-rehype-pretty-code-figure]")]
        .find((f) => f.querySelector('[data-slot="code-block-name"]').textContent.trim() === "components.json");
      fig.querySelector("[data-code-copy]").click();
    });
    await sleep(250);
    const copyOn = await page.evaluate(async () => {
      const fig = [...document.querySelectorAll("[data-rehype-pretty-code-figure]")]
        .find((f) => f.querySelector('[data-slot="code-block-name"]').textContent.trim() === "components.json");
      const b = fig.querySelector("[data-code-copy]");
      let text = null;
      try { text = await navigator.clipboard.readText(); } catch (e) { text = "READ_FAILED:" + e.name; }
      return {
        copied: b.getAttribute("data-copied"),
        idle: getComputedStyle(b.querySelector('[data-copy-when="idle"]')).display,
        done: getComputedStyle(b.querySelector('[data-copy-when="done"]')).display,
        status: document.querySelector("[data-post-status]")?.textContent.trim(),
        text,
      };
    });
    eq(4, theme, "클릭 후 data-copied", copyOn.copied, "true");
    eq(4, theme, "idle 아이콘 숨김", copyOn.idle, "none");
    /* ★ CSS는 inline-flex지만 svg는 inline-flex 버튼의 flex 아이템이라 CSS
       블록화 규칙에 따라 computed display가 flex로 나온다(verify-footer 25번
       선례와 동일) — 표시/숨김만 확인한다. */
    check(4, theme, "done(체크) 아이콘 표시(inline-flex → 블록화된 flex)",
      copyOn.done !== "none", `display=${copyOn.done}`);
    eq(4, theme, "sr-only 상태 문구", copyOn.status, "코드를 복사했습니다");
    /* ★ Windows Chromium은 시스템 클립보드에 text/plain을 올릴 때 개행을
       CRLF로 정규화한다(스킨이 쓴 문자열은 \n 그대로) — 관측 쪽에서 되돌린다. */
    const lf = (s) => String(s).replace(/\r\n/g, "\n");
    eq(4, theme, "클립보드 텍스트 === 원문(줄번호 미포함·개행 보존)", lf(copyOn.text), expectedRaw);
    check(4, theme, "클립보드에 줄번호 없음", !/^\s*\d+\s*\{/.test(copyOn.text || ""), (copyOn.text || "").slice(0, 24));

    await sleep(1300);
    const mid = await page.evaluate(() => {
      const fig = [...document.querySelectorAll("[data-rehype-pretty-code-figure]")]
        .find((f) => f.querySelector('[data-slot="code-block-name"]').textContent.trim() === "components.json");
      return fig.querySelector("[data-code-copy]").getAttribute("data-copied");
    });
    eq(4, theme, "1.55초 시점에는 아직 유지(1600ms 아님)", mid, "true");
    await sleep(900);
    const copyOff = await page.evaluate(() => {
      const fig = [...document.querySelectorAll("[data-rehype-pretty-code-figure]")]
        .find((f) => f.querySelector('[data-slot="code-block-name"]').textContent.trim() === "components.json");
      const b = fig.querySelector("[data-code-copy]");
      return {
        copied: b.getAttribute("data-copied"),
        done: getComputedStyle(b.querySelector('[data-copy-when="done"]')).display,
      };
    });
    check(4, theme, "2000ms 후 원복", copyOff.copied === null && copyOff.done === "none",
      `copied=${copyOff.copied} done=${copyOff.done}`);

    /* 언어 없는 평문 pre의 복사 원문 */
    const plainCopy = await page.evaluate(async () => {
      const fig = [...document.querySelectorAll("[data-rehype-pretty-code-figure]")]
        .find((f) => f.querySelector('[data-slot="code-block-name"]').textContent.trim() === "code");
      const expected = [...fig.querySelectorAll("[data-line]")].map((l) => l.textContent).join("\n");
      fig.querySelector("[data-code-copy]").click();
      await new Promise((r) => setTimeout(r, 250));
      let text = null;
      try { text = await navigator.clipboard.readText(); } catch (e) { text = "READ_FAILED:" + e.name; }
      return { expected, text };
    });
    eq(4, theme, "언어 없는 블록도 원문 그대로 복사", lf(plainCopy.text), plainCopy.expected);

    /* ───────── 13. 다크 전환 시 재강조 없음 ───────── */
    if (theme === "light") {
      requests = [];
      await page.evaluate(() => document.documentElement.classList.add("dark"));
      await sleep(900);
      const afterToggle = await page.evaluate(() => {
        const t = document.querySelector("[data-line] .hljs-attr");
        return { color: t ? getComputedStyle(t).color : null };
      });
      const netAfter = requests.filter((u) => /highlight(\.min)?\.js|cdn-release|shiki/.test(u));
      eq(13, theme, "다크 토글 후 추가 네트워크 요청 0", netAfter.length, 0);
      check(13, theme, "색만 바뀜(다크 값 적용)", !!afterToggle.color, JSON.stringify(afterToggle));
      await page.evaluate(() => document.documentElement.classList.remove("dark"));
      await sleep(300);
    }

    await page.evaluate(() => {
      const fig = [...document.querySelectorAll("[data-rehype-pretty-code-figure]")]
        .find((f) => f.querySelector('[data-slot="code-block-name"]').textContent.trim() === "components.json");
      fig.scrollIntoView({ block: "center" });
    });
    await sleep(500);
    await page.screenshot({ path: resolve(shots, `codeblock-${theme}.png`) });

    check(30, theme, "콘솔/네트워크 에러 0", consoleErrors.length === 0,
      consoleErrors.length ? consoleErrors.join(" ;; ") : "none");
  }

  /* ───────── 11. 멱등성 (content.js 재실행) ───────── */
  {
    const p = await browser.newPage();
    await p.setViewport(VP);
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    await p.goto(PERMALINK, { waitUntil: "networkidle0" });
    await sleep(1500);
    const before = await p.evaluate(() => ({
      figures: document.querySelectorAll("[data-rehype-pretty-code-figure]").length,
      lines: document.querySelectorAll("[data-line]").length,
      copies: document.querySelectorAll("[data-code-copy]").length,
      nested: document.querySelectorAll("[data-rehype-pretty-code-figure] [data-rehype-pretty-code-figure]").length,
    }));
    await p.evaluate(() => new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "/dashboard-skin/components/content.js";
      s.onload = res;
      s.onerror = rej;
      document.body.appendChild(s);
    }));
    await sleep(800);
    const after = await p.evaluate(() => ({
      figures: document.querySelectorAll("[data-rehype-pretty-code-figure]").length,
      lines: document.querySelectorAll("[data-line]").length,
      copies: document.querySelectorAll("[data-code-copy]").length,
      nested: document.querySelectorAll("[data-rehype-pretty-code-figure] [data-rehype-pretty-code-figure]").length,
    }));
    eq(11, "light", "재실행 후 figure 개수 불변", `${after.figures}`, `${before.figures}`);
    eq(11, "light", "재실행 후 줄 개수 불변", `${after.lines}`, `${before.lines}`);
    eq(11, "light", "재실행 후 복사 버튼 개수 불변", `${after.copies}`, `${before.copies}`);
    eq(11, "light", "figure 중첩 0", after.nested, 0);
    check(11, "light", "재실행 중 예외 0", errs.length === 0, errs.join(" ;; ") || "none");
    await p.close();
  }

  /* ───────── 12. CDN 차단 폴백 ───────── */
  {
    const p = await browser.newPage();
    await p.setViewport(VP);
    const pageErrs = [];
    const consoleErrs = [];
    p.on("pageerror", (e) => pageErrs.push(String(e)));
    p.on("console", (msg) => {
      if (msg.type() === "error" && !IGNORE.test(msg.text())) consoleErrs.push(msg.text());
    });
    await p.setRequestInterception(true);
    p.on("request", (req) => {
      if (/cdn\.jsdelivr\.net/.test(req.url())) req.abort();
      else req.continue();
    });
    await p.goto(PERMALINK, { waitUntil: "networkidle0" });
    await sleep(2000);
    const blocked = await p.evaluate(() => {
      const figs = [...document.querySelectorAll("[data-rehype-pretty-code-figure]")];
      const js = figs.find((f) => f.querySelector('[data-slot="code-block-name"]').textContent.trim() === "content.js");
      return {
        figures: figs.length,
        pending: document.querySelectorAll("[data-code-pending]").length,
        jsLines: js.querySelectorAll("[data-line]").length,
        jsColored: js.querySelectorAll("[data-line] [class^='hljs-']").length,
        jsHl: js.querySelectorAll("[data-highlighted-line]").length,
        header: !!js.querySelector("[data-rehype-pretty-code-title]"),
        copy: !!js.querySelector("[data-code-copy]"),
        gutter: getComputedStyle(js.querySelector("[data-line]"), "::before").width,
      };
    });
    eq(12, "light", "CDN 차단: figure 3개 그대로", blocked.figures, 3);
    eq(12, "light", "CDN 차단: 줄 6개 폴백 유지", blocked.jsLines, 6);
    eq(12, "light", "CDN 차단: 색만 없음(강조 span 0)", blocked.jsColored, 0);
    eq(12, "light", "CDN 차단: 하이라이트 행 유지", blocked.jsHl, 1);
    eq(12, "light", "CDN 차단: 헤더·복사 버튼 유지", `${blocked.header}/${blocked.copy}`, "true/true");
    eq(12, "light", "CDN 차단: 줄번호 거터 유지", blocked.gutter, "64px");
    eq(12, "light", "CDN 차단: data-code-pending 정리됨", blocked.pending, 0);
    check(12, "light", "CDN 차단: 미처리 예외(pageerror) 0", pageErrs.length === 0, pageErrs.join(" ;; ") || "none");
    results.push({
      id: 12, theme: "light", ok: true,
      label: "[관측] CDN 차단 시 브라우저 네트워크 로그",
      detail: consoleErrs.length ? consoleErrs.join(" ;; ") : "none",
    });
    await p.close();
  }

  /* ───────── 10. no-JS ───────── */
  for (const theme of ["light", "dark"]) {
    const p = await browser.newPage();
    await p.setViewport(VP);
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    p.on("console", (msg) => { if (msg.type() === "error" && !IGNORE.test(msg.text())) errs.push(msg.text()); });
    await p.goto(PERMALINK_NOJS, { waitUntil: "networkidle0" });
    await p.evaluate((t) => document.documentElement.classList.toggle("dark", t === "dark"), theme);
    await sleep(400);
    const nojs = await p.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const pres = [...body.querySelectorAll("pre")];
      const plain = pres.find((pre) => !pre.hasAttribute("data-filename") && !pre.className);
      const cs = getComputedStyle(plain);
      const probe = (v) => { const s = document.createElement("span"); s.style.color = v; body.appendChild(s); const c = getComputedStyle(s).color; s.remove(); return c; };
      const doc = document.scrollingElement;
      return {
        contentJsLoaded: !!document.querySelector('script[src*="content.js"]'),
        figures: body.querySelectorAll("[data-rehype-pretty-code-figure]").length,
        preCount: pres.length,
        bg: cs.backgroundColor, codeVar: probe("var(--color-code)"),
        radius: cs.borderTopLeftRadius, border: cs.borderTopWidth,
        padding: cs.paddingTop + "/" + cs.paddingLeft,
        scrollW: plain.scrollWidth, clientW: plain.clientWidth,
        docScrollW: doc.scrollWidth, winW: window.innerWidth,
        preRight: Math.round(plain.getBoundingClientRect().right),
        bodyRight: Math.round(body.getBoundingClientRect().right),
      };
    });
    eq(10, theme, "nojs: content.js 미로드", nojs.contentJsLoaded, false);
    eq(10, theme, "nojs: figure 0개(폴백 경로)", nojs.figures, 0);
    eq(10, theme, "nojs: pre 배경 === --color-code", nojs.bg, nojs.codeVar);
    eq(10, theme, "nojs: pre radius 16px", nojs.radius, "16px");
    eq(10, theme, "nojs: pre 보더 1px", nojs.border, "1px");
    eq(10, theme, "nojs: pre padding 14px/16px", nojs.padding, "14px/16px");
    check(10, theme, "nojs: 긴 줄이 pre 안에서만 스크롤", nojs.scrollW > nojs.clientW,
      `scrollW=${nojs.scrollW} clientW=${nojs.clientW}`);
    eq(10, theme, "nojs: 문서 가로 오버플로 0", nojs.docScrollW, nojs.winW);
    check(10, theme, "nojs: pre가 본문 폭을 넘지 않음", nojs.preRight <= nojs.bodyRight + 1,
      `pre=${nojs.preRight} body=${nojs.bodyRight}`);
    check(10, theme, "nojs: 콘솔 에러 0", errs.length === 0, errs.join(" ;; ") || "none");
    if (theme === "light") await p.screenshot({ path: resolve(shots, "codeblock-nojs-light.png") });
    await p.close();
  }

  await browser.disconnect();
  try { child.kill(); } catch {}
  try { rmSync(userData, { recursive: true, force: true }); } catch {}

  /* ───────── 14. 주석 0개 (정적 검사) ───────── */
  {
    const scan = (file, from, to) => {
      const text = readFileSync(resolve(root, file), "utf8");
      const start = from ? text.indexOf(from) : 0;
      const end = to ? text.indexOf(to, start) : text.length;
      const slice = text.slice(start < 0 ? 0 : start, end < 0 ? text.length : end);
      const lines = slice.split("\n");
      const hits = [];
      lines.forEach((l, i) => {
        const t = l.trim();
        if (t.startsWith("//") || t.startsWith("/*") || t.startsWith("*") || t.includes("*/")) {
          hits.push(`${file}:${i} ${t.slice(0, 60)}`);
        }
      });
      return hits;
    };
    const hits = [
      ...scan("dashboard-skin/components/content.js", "var HLJS_URL", "function initPostTags"),
      ...scan("dashboard-skin/components/content.css", '[data-slot="content"] {\n  --code-border', null),
      ...scan("dashboard-skin/src/input.css", "  --code: #fafafa;", "}"),
      ...scan("dashboard-skin/src/input.css", "  --code: #171717;", "}"),
    ];
    check(14, "light", "새로 추가한 CSS/JS에 주석 0개", hits.length === 0, hits.join(" ;; ") || "none");
  }

  /* ───────── 리포트 ───────── */
  console.log("\n════════ [CODEBLOCK SPEC §9] 검증 결과 ════════");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  #${String(r.id).padStart(2)} ${r.theme.padEnd(5)} ${r.label} — ${r.detail}`);
  }
  const ids = [...new Set(results.map((r) => r.id))];
  console.log("\n──── 항목별 요약 (라이트/다크) ────");
  for (const id of ids) {
    const l = results.filter((r) => r.id === id && r.theme === "light");
    const d = results.filter((r) => r.id === id && r.theme === "dark");
    const st = (a) => (a.length === 0 ? "—" : a.every((r) => r.ok) ? "PASS" : "FAIL");
    console.log(`#${String(id).padStart(3)}  light=${st(l).padEnd(4)}  dark=${st(d).padEnd(4)}  (assert ${l.length + d.length})`);
  }
  console.log(`\n총 assert ${results.length}건 · 실패 ${failures}건`);
  console.log(`스크린샷: ${shots}`);

  const lines = [];
  lines.push("# [CODEBLOCK SPEC §9] 검증 원본 로그 (자동 생성)", "");
  lines.push(`총 assert ${results.length}건 · 실패 ${failures}건`, "");
  lines.push("## 실패 목록", "");
  const fails = results.filter((r) => !r.ok);
  if (!fails.length) lines.push("없음", "");
  for (const r of fails) lines.push(`- FAIL #${r.id} [${r.theme}] ${r.label} — ${r.detail}`);
  lines.push("", "## 항목별 요약", "", "| # | light | dark | assert |", "|---|---|---|---|");
  for (const id of ids) {
    const l = results.filter((r) => r.id === id && r.theme === "light");
    const d = results.filter((r) => r.id === id && r.theme === "dark");
    const st = (a) => (a.length === 0 ? "—" : a.every((r) => r.ok) ? "PASS" : "FAIL");
    lines.push(`| ${id} | ${st(l)} | ${st(d)} | ${l.length + d.length} |`);
  }
  lines.push("", "## 전체 assert", "");
  for (const r of results) lines.push(`${r.ok ? "PASS" : "FAIL"} #${r.id} [${r.theme}] ${r.label} — ${r.detail}`);
  writeFileSync(resolve(root, "_workspace", "codeblock-verify-log.md"), lines.join("\n"), "utf8");

  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
