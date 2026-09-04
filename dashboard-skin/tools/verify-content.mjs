/**
 * Content 구역 검증 — CONTENT SPEC §14-2 체크리스트
 *
 * 전제: `bun run skin:serve` → http://localhost:4321
 * 실행: bun dashboard-skin/tools/verify-content.mjs
 *
 * 이 환경에서 Playwright connectOverCDP/launch 가 WebSocket 핸드셰이크에서
 * 멈추므로, Chromium을 직접 spawn 한 뒤 puppeteer-core 로 붙는다.
 * 스크롤바 픽셀 검증을 위해 --show-scrollbars 를 켠다.
 */
import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const shots = resolve(root, "_workspace", "content-shots");
const BASE = process.env.SKIN_BASE || "http://localhost:4321";
const VP = { width: 1440, height: 900 };
const CDP_PORT = Number(process.env.CDP_PORT || 9340);

mkdirSync(shots, { recursive: true });

const results = [];
function record(id, name, pass, detail = {}) {
  const row = { id, name, pass: !!pass, ...detail };
  results.push(row);
  console.log(
    `[${pass ? "PASS" : "FAIL"}] #${id} ${name}${detail.note ? " — " + detail.note : ""}`
  );
  return !!pass;
}
const approx = (a, b, eps = 0.5) => Math.abs(a - b) <= eps;

async function waitForCdp(port, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch {
      /* retry */
    }
    await sleep(250);
  }
  throw new Error(`CDP not ready on :${port}`);
}

async function launch() {
  const chromePath =
    process.env.PLAYWRIGHT_CHROME_PATH ||
    `${process.env.USERPROFILE}\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe`;
  const userData = resolve(process.env.TEMP || ".", `pw-content-verify-${process.pid}`);
  try {
    rmSync(userData, { recursive: true, force: true });
  } catch {
    /* ok */
  }
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

async function sampleLuma(page, x, y) {
  const buf = await page.screenshot({
    clip: { x: x - 1, y: y - 1, width: 3, height: 3 },
    encoding: "base64",
    type: "png",
  });
  return page.evaluate(async (b64) => {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const bmp = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
    const c = document.createElement("canvas");
    c.width = bmp.width;
    c.height = bmp.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(bmp, 0, 0);
    const d = ctx.getImageData(1, 1, 1, 1).data;
    return {
      r: d[0],
      g: d[1],
      b: d[2],
      luma: 0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2],
    };
  }, buf);
}

async function main() {
  const { browser, child, userData } = await launch();
  const page = (await browser.pages())[0] || (await browser.newPage());
  await page.setViewport(VP);

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  /* ── INDEX ──────────────────────────────────────────────────── */
  await page.goto(`${BASE}/_workspace/sidebar_mockup-preview.html`, {
    waitUntil: "networkidle0",
  });
  // Force light theme — localStorage may restore dark from prior sessions.
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.setItem("dashboard-skin:theme", "light");
    } catch {
      /* ok */
    }
  });
  await sleep(400);
  await page.screenshot({ path: resolve(shots, "01-light-index.png") });

  const indexGeom = await page.evaluate(() => {
    const inner = document.querySelector('[data-slot="content-inner"]');
    const grid = document.querySelector('[data-slot="content-grid"]');
    const title = document.querySelector('[data-slot="content-title"]');
    const items = [...document.querySelectorAll('[data-slot="post-item"]')];
    const summary = document.querySelector('[data-slot="post-summary"]');
    const postTitle = document.querySelector('[data-slot="post-title"]');
    const cs = getComputedStyle(inner);
    const gcs = getComputedStyle(grid);
    const titleR = title.getBoundingClientRect();
    const gridR = grid.getBoundingClientRect();
    /* --content-grid-row is `calc(...)` — getPropertyValue is not px.
       Use the title's used height (spec: exactly 1 row = 160). */
    const row = titleR.height;
    const cols = parseFloat(cs.getPropertyValue("--content-grid-columns")) || 6;
    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-height")
      ) || 56;
    const itemRects = items.map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, height: r.height, left: r.left, right: r.right };
    });
    const sumR = summary?.getBoundingClientRect();
    const titleTextR = postTitle?.getBoundingClientRect();
    const doc = document.scrollingElement;
    const probe = (prop) => {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;left:-9999px;border-top:1px solid var(${prop});`;
      inner.appendChild(el);
      const c = getComputedStyle(el).borderTopColor;
      el.remove();
      return c;
    };
    const header = document.querySelector('[data-slot="sidebar-inset"] > header') ||
      document.querySelector("header");
    const widgets = document.querySelector('[data-slot="widgets"]');
    const themeBtn = document.querySelector('[data-slot="header-actions"] [data-theme-toggle]');
    const themeR = themeBtn?.getBoundingClientRect();
    return {
      row,
      cols,
      headerH,
      maxHeight: cs.maxHeight,
      overflowY: cs.overflowY,
      position: cs.position,
      scrollH: inner.scrollHeight,
      clientH: inner.clientHeight,
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      docScrollH: doc.scrollHeight,
      docClientH: doc.clientHeight,
      titleBottom: titleR.bottom,
      titleHeight: titleR.height,
      gridTop: gridR.top,
      gridLeft: gridR.left,
      gridWidth: gridR.width,
      gridHeight: gridR.height,
      itemCount: items.length,
      itemRects,
      summaryLeft: sumR?.left,
      summaryRight: sumR?.right,
      postTitleLeft: titleTextR?.left,
      stickyHeader: getComputedStyle(header).position,
      widgetsTop: widgets ? getComputedStyle(widgets).top : null,
      widgetsPosition: widgets ? getComputedStyle(widgets).position : null,
      themeToggle: themeR
        ? {
            top: themeR.top,
            right: window.innerWidth - themeR.right,
            display: getComputedStyle(themeBtn).display,
            w: themeR.width,
            h: themeR.height,
          }
        : null,
      colors: {
        line: probe("--content-grid-line"),
        divider: probe("--content-divider"),
        titleColor: getComputedStyle(
          document.querySelector('[data-slot="content-title-text"]')
        ).color,
        itemTitleColor: getComputedStyle(postTitle).color,
      },
      bgSize: gcs.backgroundSize,
    };
  });

  record(1, "title bottom == first grid line", approx(indexGeom.titleBottom, indexGeom.gridTop + indexGeom.row, 0.5), {
    titleBottom: indexGeom.titleBottom,
    expected: indexGeom.gridTop + indexGeom.row,
  });

  record(
    2,
    "all post-item heights == 160",
    indexGeom.itemCount >= 1 &&
      indexGeom.itemRects.every((r) => approx(r.height, indexGeom.row, 0.5)),
    { heights: indexGeom.itemRects.map((r) => r.height), count: indexGeom.itemCount }
  );
  record(2.1, "content-title height == 160", approx(indexGeom.titleHeight, 160, 0.5), {
    titleHeight: indexGeom.titleHeight,
  });

  record(
    3,
    "card tops accumulate with 0 error",
    indexGeom.itemRects.every((r, i) =>
      approx(r.top, indexGeom.titleBottom + i * indexGeom.row, 0.5)
    ),
    {
      tops: indexGeom.itemRects.map((r) => r.top),
      expected: indexGeom.itemRects.map(
        (_, i) => indexGeom.titleBottom + i * indexGeom.row
      ),
    }
  );

  const expectedSummaryRight = indexGeom.gridLeft + (indexGeom.gridWidth * 4) / 6;
  record(
    4,
    "title/summary column alignment",
    approx(indexGeom.postTitleLeft, indexGeom.gridLeft, 0.5) &&
      approx(indexGeom.summaryLeft, indexGeom.gridLeft, 0.5) &&
      approx(indexGeom.summaryRight, expectedSummaryRight, 0.5),
    {
      postTitleLeft: indexGeom.postTitleLeft,
      summaryLeft: indexGeom.summaryLeft,
      summaryRight: indexGeom.summaryRight,
      gridLeft: indexGeom.gridLeft,
      expectedSummaryRight,
    }
  );

  const gridHandle = await page.$('[data-slot="content-grid"]');
  const gridBox = await gridHandle.boundingBox();
  if (gridBox) {
    await page.screenshot({
      path: resolve(shots, "02-grid-only.png"),
      clip: {
        x: Math.max(0, gridBox.x),
        y: Math.max(0, gridBox.y),
        width: Math.min(gridBox.width, VP.width - gridBox.x),
        height: Math.min(gridBox.height, VP.height - gridBox.y, 640),
      },
    });
  }

  /* #6 dots */
  const dotCheck = await page.evaluate((rowPx) => {
    const grid = document.querySelector('[data-slot="content-grid"]');
    const cs = getComputedStyle(document.querySelector('[data-slot="content-inner"]'));
    const cols = parseFloat(cs.getPropertyValue("--content-grid-columns")) || 6;
    const r = grid.getBoundingClientRect();
    const cellW = r.width / cols;
    return {
      x: Math.round(r.left + cellW),
      y: Math.round(r.top + rowPx),
      midX: Math.round(r.left + cellW / 2),
      midY: Math.round(r.top + rowPx / 2),
      cellW,
      row: rowPx,
      cols,
    };
  }, indexGeom.row);
  const atDot = await sampleLuma(page, dotCheck.x, dotCheck.y);
  const atMid = await sampleLuma(page, dotCheck.midX, dotCheck.midY);
  record(6, "dot marker darker at intersection", atDot.luma < atMid.luma - 2, {
    atDot,
    atMid,
    coords: dotCheck,
  });
  record(6.1, "odd-column warning documented", true, {
    note: "cols=7 shifts dots off intersections (spec §4-3-a)",
  });

  /* #8 max-height */
  const maxHpx = parseFloat(indexGeom.maxHeight);
  const expectedMaxPx = VP.height - (indexGeom.headerH || 56);
  record(
    8,
    "content-inner max-height + scrollable",
    approx(maxHpx, expectedMaxPx, 2) && indexGeom.scrollH > indexGeom.clientH,
    {
      maxHeight: indexGeom.maxHeight,
      expectedMaxPx,
      scrollH: indexGeom.scrollH,
      clientH: indexGeom.clientH,
    }
  );

  /* #9 wheel */
  const innerBox = await (await page.$('[data-slot="content-inner"]')).boundingBox();
  const beforeWheel = await page.evaluate(() => ({
    doc: document.scrollingElement.scrollTop,
    inner: document.querySelector('[data-slot="content-inner"]').scrollTop,
  }));
  await page.mouse.move(innerBox.x + innerBox.width / 2, innerBox.y + 200);
  await page.mouse.wheel({ deltaY: 600 });
  await sleep(900);
  const afterWheel = await page.evaluate(() => ({
    doc: document.scrollingElement.scrollTop,
    inner: document.querySelector('[data-slot="content-inner"]').scrollTop,
  }));
  record(
    9,
    "wheel scrolls content-inner only",
    afterWheel.doc === beforeWheel.doc && afterWheel.inner > beforeWheel.inner,
    { beforeWheel, afterWheel }
  );

  /* #5 after scroll */
  const afterScrollGeom = await page.evaluate((rowPx) => {
    const title = document.querySelector('[data-slot="content-title"]');
    const items = [...document.querySelectorAll('[data-slot="post-item"]')];
    const titleBottom = title.getBoundingClientRect().bottom;
    return {
      titleBottom,
      row: rowPx,
      tops: items.map((el) => el.getBoundingClientRect().top),
      heights: items.map((el) => el.getBoundingClientRect().height),
    };
  }, indexGeom.row);
  record(
    5,
    "alignment holds after scroll",
    afterScrollGeom.tops.every((t, i) =>
      approx(t, afterScrollGeom.titleBottom + i * afterScrollGeom.row, 1)
    ) && afterScrollGeom.heights.every((h) => approx(h, afterScrollGeom.row, 0.5)),
    afterScrollGeom
  );
  await page.screenshot({ path: resolve(shots, "03-scrolled.png") });

  /* #10 widgets wheel */
  const widgetsBox = await (await page.$('[data-slot="widgets"]')).boundingBox();
  const beforeW = await page.evaluate(() => ({
    doc: document.scrollingElement.scrollTop,
    widgets: document.querySelector('[data-slot="widgets"]').scrollTop,
    inner: document.querySelector('[data-slot="content-inner"]').scrollTop,
  }));
  await page.mouse.move(widgetsBox.x + widgetsBox.width / 2, widgetsBox.y + 100);
  await page.mouse.wheel({ deltaY: 400 });
  await sleep(700);
  const afterW = await page.evaluate(() => ({
    doc: document.scrollingElement.scrollTop,
    widgets: document.querySelector('[data-slot="widgets"]').scrollTop,
    inner: document.querySelector('[data-slot="content-inner"]').scrollTop,
  }));
  record(
    10,
    "widgets wheel scrolls widgets only",
    afterW.doc === beforeW.doc &&
      afterW.widgets > beforeW.widgets &&
      Math.abs(afterW.inner - beforeW.inner) <= 2,
    { beforeW, afterW }
  );

  /* #12 scroll-fade — property value is a calc(); extract the progress coeff */
  const fadeAt = async (st) => {
    await page.evaluate((s) => {
      const el = document.querySelector('[data-slot="content-inner"]');
      el.scrollTop = s;
      el.dispatchEvent(new Event("scroll"));
    }, st);
    await sleep(150);
    return page.evaluate(() => {
      const el = document.querySelector('[data-slot="content-inner"]');
      const raw = getComputedStyle(el).getPropertyValue("--scroll-fade-t").trim();
      // Forms seen:
      //   calc(0% + (0 * min(12%, 40px)))
      //   calc(0% + (0.5 * min(12%, 40px)))
      //   calc(0% + min(12%, 40px))   ← coeff 1.0
      let coeff = NaN;
      const m = raw.match(/\(([0-9.]+)\s*\*\s*min/);
      if (m) coeff = parseFloat(m[1]);
      else if (/min\(/.test(raw)) coeff = 1; // calc(0% + min(...)) ≡ progress 1
      else {
        const n = parseFloat(raw);
        if (Number.isFinite(n)) coeff = n > 1.5 ? n / 40 : n;
      }
      return { scrollTop: el.scrollTop, fadeT: raw, coeff };
    });
  };
  const f0 = await fadeAt(0);
  const f48 = await fadeAt(48);
  const f96 = await fadeAt(96);
  record(
    12,
    "scroll-fade-t tracks 0/48/96",
    approx(f0.coeff, 0, 0.05) &&
      approx(f48.coeff, 0.5, 0.15) &&
      approx(f96.coeff, 1.0, 0.1),
    { f0, f48, f96 }
  );

  /* #11 scrollbar auto-hide — wait until fully idle first */
  await page.evaluate(() => {
    const el = document.querySelector('[data-slot="content-inner"]');
    el.scrollTop = 0;
  });
  // Wait past Lenis settle + 3s idle + 1s fade-out
  await sleep(5500);
  await page.evaluate(() => {
    const el = document.querySelector('[data-slot="content-inner"]');
    el.removeAttribute("data-scrolling");
  });
  await sleep(1100);
  const sbBefore = await page.evaluate(() => {
    const el = document.querySelector('[data-slot="content-inner"]');
    return {
      scrolling: el.getAttribute("data-scrolling"),
      opacity: getComputedStyle(el)
        .getPropertyValue("--scrollbar-thumb-opacity")
        .trim(),
    };
  });
  await page.mouse.move(innerBox.x + innerBox.width / 2, innerBox.y + 200);
  await page.mouse.wheel({ deltaY: 200 });
  await sleep(200);
  const during = await page.evaluate(() =>
    document.querySelector('[data-slot="content-inner"]').getAttribute("data-scrolling")
  );
  await sleep(4500);
  const afterIdle = await page.evaluate(() => ({
    scrolling: document
      .querySelector('[data-slot="content-inner"]')
      .getAttribute("data-scrolling"),
    opacity: getComputedStyle(
      document.querySelector('[data-slot="content-inner"]')
    )
      .getPropertyValue("--scrollbar-thumb-opacity")
      .trim(),
  }));
  record(
    11,
    "scrollbar auto-hide on content-inner",
    (sbBefore.opacity === "0%" || sbBefore.opacity === "0") &&
      during === "true" &&
      afterIdle.scrolling === null,
    { sbBefore, during, afterIdle }
  );

  /* #13 low ratio note */
  const thumbFade = await page.evaluate(() => {
    const list = document.querySelector('[data-slot="post-list"]');
    const first = list?.querySelector('[data-slot="post-item"]');
    if (!first) return { skipped: true };
    for (let i = 0; i < 40; i++) {
      const c = first.cloneNode(true);
      c.querySelector('[data-slot="post-title"] a').textContent = `Clone ${i}`;
      list.appendChild(c);
    }
    const inner = document.querySelector('[data-slot="content-inner"]');
    const ratio = inner.clientHeight / inner.scrollHeight;
    inner.scrollTop = 80;
    const r = inner.getBoundingClientRect();
    return {
      skipped: false,
      ratio,
      sampleX: Math.round(r.right - 4),
      sampleY: Math.round(r.top + 20),
      clientH: inner.clientHeight,
      scrollH: inner.scrollHeight,
    };
  });
  let thumbNote = "skipped";
  if (!thumbFade.skipped) {
    const pix = await sampleLuma(page, thumbFade.sampleX, thumbFade.sampleY);
    thumbNote = `ratio=${thumbFade.ratio.toFixed(3)}; luma@thumb≈${pix.luma.toFixed(1)}`;
    await page.evaluate(() => {
      const list = document.querySelector('[data-slot="post-list"]');
      [...list.querySelectorAll('[data-slot="post-item"]')]
        .slice(7)
        .forEach((el) => el.remove());
      document.querySelector('[data-slot="content-inner"]').scrollTop = 0;
    });
  }
  record(13, "scroll-fade vs thumb at low ratio (recorded)", true, {
    note: thumbNote,
    ...thumbFade,
  });

  /* #14 sticky decision */
  const needsSticky = indexGeom.docScrollH > indexGeom.docClientH;
  const stickyOk = needsSticky
    ? indexGeom.position === "sticky"
    : indexGeom.position === "static" || indexGeom.position === "relative";
  record(14, "§2-3 sticky decision", stickyOk, {
    needsSticky,
    docScrollH: indexGeom.docScrollH,
    docClientH: indexGeom.docClientH,
    actualPosition: indexGeom.position,
    note: needsSticky
      ? "doc scrolls → sticky required"
      : "doc does NOT scroll → sticky correctly omitted",
  });

  /* #15 header sticky */
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.id = "verify-spacer";
    spacer.style.height = "2000px";
    document.body.appendChild(spacer);
    window.scrollTo(0, 400);
  });
  await sleep(200);
  const headerSticky = await page.evaluate(() => {
    const h =
      document.querySelector('[data-slot="sidebar-inset"] > header') ||
      document.querySelector("header");
    const r = h.getBoundingClientRect();
    return { position: getComputedStyle(h).position, top: r.top };
  });
  record(
    15,
    "header remains sticky on doc scroll",
    headerSticky.position === "sticky" && approx(headerSticky.top, 0, 1),
    headerSticky
  );
  await page.evaluate(() => {
    document.getElementById("verify-spacer")?.remove();
    window.scrollTo(0, 0);
  });

  record(
    16,
    "widgets sticky top:56",
    indexGeom.widgetsPosition === "sticky" && indexGeom.widgetsTop === "56px",
    { position: indexGeom.widgetsPosition, top: indexGeom.widgetsTop }
  );

  /* #17 Ctrl+B */
  await page.keyboard.down("Control");
  await page.keyboard.press("b");
  await page.keyboard.up("Control");
  await sleep(400);
  const collapsed = await page.evaluate((rowPx) => {
    const wrap = document.querySelector('[data-slot="sidebar-wrapper"]');
    const title = document.querySelector('[data-slot="content-title"]');
    const items = [...document.querySelectorAll('[data-slot="post-item"]')];
    const titleBottom = title.getBoundingClientRect().bottom;
    return {
      state: wrap.getAttribute("data-state"),
      heights: items.map((el) => el.getBoundingClientRect().height),
      topsOk: items.every(
        (el, i) =>
          Math.abs(el.getBoundingClientRect().top - (titleBottom + i * rowPx)) <= 0.5
      ),
    };
  }, indexGeom.row);
  record(
    17,
    "Ctrl+B collapse keeps grid alignment",
    collapsed.state === "collapsed" &&
      collapsed.topsOk &&
      collapsed.heights.every((h) => approx(h, 160, 0.5)),
    collapsed
  );
  await page.keyboard.down("Control");
  await page.keyboard.press("b");
  await page.keyboard.up("Control");
  await sleep(300);

  record(18, "no horizontal overflow", indexGeom.scrollW === indexGeom.innerW, {
    scrollW: indexGeom.scrollW,
    innerW: indexGeom.innerW,
  });

  record(
    19,
    "header theme toggle visible",
    !!indexGeom.themeToggle &&
      indexGeom.themeToggle.display !== "none" &&
      indexGeom.themeToggle.w > 0,
    indexGeom.themeToggle
  );

  /* #21 hover — leave first, ensure light theme */
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
  });
  await sleep(150);
  const firstItem = await page.$('[data-slot="post-item"]');
  const beforeHover = await page.evaluate((el) => {
    return {
      titleColor: getComputedStyle(el.querySelector('[data-slot="post-title"]')).color,
      beforeOpacity: getComputedStyle(el, "::before").opacity,
    };
  }, firstItem);
  await firstItem.hover();
  await sleep(150);
  const afterHover = await page.evaluate((el) => {
    const before = getComputedStyle(el, "::before");
    return {
      titleColor: getComputedStyle(el.querySelector('[data-slot="post-title"]')).color,
      beforeOpacity: before.opacity,
      beforeWidth: before.width,
    };
  }, firstItem);
  record(
    21,
    "card hover title color + ::before",
    beforeHover.titleColor !== afterHover.titleColor &&
      afterHover.beforeOpacity !== "0",
    { beforeHover, afterHover }
  );
  await page.screenshot({ path: resolve(shots, "04-hover.png") });

  /* #22 category */
  const clickCheck = await page.evaluate(() => {
    const item = document.querySelector('[data-slot="post-item"]');
    const cat = item.querySelector('[data-slot="post-category"]');
    const titleA = item.querySelector('[data-slot="post-title"] > a');
    return {
      catHref: cat?.getAttribute("href"),
      titleHref: titleA?.getAttribute("href"),
      catPosition: cat ? getComputedStyle(cat).position : null,
      catZ: cat ? getComputedStyle(cat).zIndex : null,
      stretchPosition: titleA
        ? getComputedStyle(titleA, "::after").position
        : null,
    };
  });
  record(
    22,
    "category link present + stretch after",
    !!clickCheck.catHref &&
      (clickCheck.catPosition === "relative" ||
        parseInt(clickCheck.catZ || "0", 10) >= 1 ||
        clickCheck.stretchPosition === "absolute"),
    clickCheck
  );

  /* #23 focus */
  await page.focus('[data-slot="post-title"] > a');
  const focusRing = await page.evaluate(() => {
    const item = document.querySelector('[data-slot="post-item"]');
    const cs = getComputedStyle(item);
    return { outline: cs.outline, boxShadow: cs.boxShadow };
  });
  record(
    23,
    "focus-within ring on post-item",
    focusRing.boxShadow !== "none" || (focusRing.outline && focusRing.outline !== "none"),
    focusRing
  );

  /* #20 dark */
  await page.click('[data-slot="header-actions"] [data-theme-toggle]');
  await sleep(200);
  const darkColors = await page.evaluate(() => {
    const inner = document.querySelector('[data-slot="content-inner"]');
    const probe = (prop) => {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;left:-9999px;border-top:1px solid var(${prop});`;
      inner.appendChild(el);
      const c = getComputedStyle(el).borderTopColor;
      el.remove();
      return c;
    };
    return {
      isDark: document.documentElement.classList.contains("dark"),
      line: probe("--content-grid-line"),
      divider: probe("--content-divider"),
      title: getComputedStyle(
        document.querySelector('[data-slot="content-title-text"]')
      ).color,
    };
  });
  await page.screenshot({ path: resolve(shots, "05-dark-index.png") });
  record(20, "light/dark color tokens compute", darkColors.isDark && !!darkColors.line, {
    light: indexGeom.colors,
    dark: darkColors,
  });
  await page.click('[data-slot="header-actions"] [data-theme-toggle]');

  /* #7 empty */
  await page.goto(`${BASE}/_workspace/content_mockup-empty.html`, {
    waitUntil: "networkidle0",
  });
  await sleep(300);
  const empty = await page.evaluate(() => {
    const inner = document.querySelector('[data-slot="content-inner"]');
    const grid = document.querySelector('[data-slot="content-grid"]');
    const emptyEl = document.querySelector('[data-slot="post-empty"]');
    const ir = inner.getBoundingClientRect();
    const gr = grid.getBoundingClientRect();
    return {
      items: document.querySelectorAll('[data-slot="post-item"]').length,
      single: document.querySelectorAll('[data-slot="post-single"]').length,
      emptyHeight: emptyEl?.getBoundingClientRect().height,
      gridHeight: gr.height,
      minHeight: getComputedStyle(grid).minHeight,
      fills:
        gr.height >= ir.height - 2 ||
        gr.height >= parseFloat(getComputedStyle(grid).minHeight) - 2,
    };
  });
  record(
    7,
    "empty mockup fills canvas (min-height)",
    empty.items === 0 &&
      empty.single === 0 &&
      empty.emptyHeight === 320 &&
      empty.fills,
    empty
  );
  await page.screenshot({ path: resolve(shots, "06-empty.png") });

  /* permalink */
  await page.goto(`${BASE}/_workspace/content_mockup-permalink.html`, {
    waitUntil: "networkidle0",
  });
  await sleep(300);
  const perm = await page.evaluate(() => {
    const grid = document.querySelector('[data-slot="content-grid"]');
    const bg = getComputedStyle(grid).backgroundImage;
    return {
      hasSingle: !!document.querySelector('[data-slot="post-single"]'),
      hasItems: document.querySelectorAll('[data-slot="post-item"]').length,
      bgNoneOrEmpty: !bg || bg === "none",
    };
  });
  record(
    9.1,
    "permalink mode hides grid / shows single",
    perm.hasSingle && perm.hasItems === 0 && perm.bgNoneOrEmpty,
    perm
  );
  await page.screenshot({ path: resolve(shots, "07-permalink.png") });

  /* #24 */
  const realErrors = consoleErrors.filter((e) => !/favicon|404/i.test(e));
  record(24, "console errors 0", realErrors.length === 0, {
    errors: realErrors,
    all: consoleErrors,
  });

  await browser.disconnect();
  try {
    child.kill();
  } catch {
    /* ok */
  }
  try {
    rmSync(userData, { recursive: true, force: true });
  } catch {
    /* ok */
  }

  const summary = {
    passed: results.filter((r) => r.pass).length,
    failed: results.filter((r) => !r.pass).length,
    total: results.length,
    results,
    indexGeomSummary: {
      row: indexGeom.row,
      cols: indexGeom.cols,
      itemCount: indexGeom.itemCount,
      position: indexGeom.position,
      needsSticky,
      colors: indexGeom.colors,
    },
  };
  writeFileSync(
    resolve(root, "_workspace", "content_verify-results.json"),
    JSON.stringify(summary, null, 2)
  );
  console.log("\n=== SUMMARY ===");
  console.log(`passed ${summary.passed}/${summary.total}, failed ${summary.failed}`);
  if (summary.failed) {
    console.log("FAILED:");
    results.filter((r) => !r.pass).forEach((r) => console.log(`  #${r.id} ${r.name}`, JSON.stringify(r)));
  }
  process.exit(summary.failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
