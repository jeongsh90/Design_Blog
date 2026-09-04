/**
 * [PROSE SPEC §7-2] 단일 글 본문 프로즈 타이포그래피 검증 (28항목 × 라이트/다크)
 *
 * 전제: bun run skin:build && bun run skin:preview && bun run skin:serve
 * 실행: bun dashboard-skin/tools/verify-prose.mjs
 *
 * verify-content.mjs와 동일한 기동 방식 — 이 환경에서 Playwright launch가
 * WebSocket 핸드셰이크에서 멈추므로 Chromium을 직접 spawn 후 puppeteer-core로 붙는다.
 * ★ --show-scrollbars: 스펙 §7-2 26번 주석(ignoreDefaultArgs:["--hide-scrollbars"])과
 *   같은 의도 — 스크롤바를 숨긴 채로는 스크롤 모델/오버플로 관측이 왜곡된다.
 */
import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const shots = resolve(root, "_workspace", "prose-shots");
const BASE = process.env.SKIN_BASE || "http://localhost:4321";
const VP = { width: 1440, height: 900 };
const CDP_PORT = Number(process.env.CDP_PORT || 9341);

const PERMALINK = `${BASE}/_workspace/content_mockup-permalink.html`;
const PERMALINK_NOJS = `${BASE}/_workspace/content_mockup-permalink-nojs.html`;
const INDEX = `${BASE}/_workspace/sidebar_mockup-preview.html`;

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
  /* ms-playwright의 chromium 빌드 번호는 playwright 버전에 따라 달라진다
     (verify-content.mjs는 1234로 하드코딩돼 있는데 현재 설치본은 1228) —
     고정하지 않고 실제 설치 디렉터리에서 찾는다. */
  const chromePath = process.env.PLAYWRIGHT_CHROME_PATH || (() => {
    const base = `${process.env.USERPROFILE}\\AppData\\Local\\ms-playwright`;
    const dir = readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
    if (!dir) throw new Error(`chromium build not found under ${base}`);
    return `${base}\\${dir}\\chrome-win64\\chrome.exe`;
  })();
  const userData = resolve(process.env.TEMP || ".", `pw-prose-verify-${process.pid}`);
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

async function main() {
  const { browser, child, userData } = await launch();
  const page = (await browser.pages())[0] || (await browser.newPage());
  await page.setViewport(VP);

  let consoleErrors = [];
  /* favicon.ico는 브라우저가 자동으로 요청하는 것이고 목업 서버에 그 파일이
     없을 뿐이라 스킨의 결함이 아니다 — 유일하게 제외한다. */
  const IGNORE = /favicon\.ico/;
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORE.test(m.text() + " " + (m.location()?.url || "")))
      consoleErrors.push(m.text() + " @ " + (m.location()?.url || ""));
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  page.on("response", (r) => {
    if (r.status() >= 400 && !IGNORE.test(r.url()))
      consoleErrors.push(`HTTP ${r.status()} ${r.url()}`);
  });

  async function setTheme(theme) {
    await page.evaluate((t) => {
      document.documentElement.classList.toggle("dark", t === "dark");
      try { localStorage.setItem("daitnu-theme", t); } catch {}
    }, theme);
    /* 링크에 transition(color 0.15s)이 걸려 있어 150ms 대기로는 보간 중인
       중간색을 읽는다(실측: #8ec5ff 대신 rgb(141,196,255)). 넉넉히 기다린다. */
    await sleep(500);
  }

  /* ═══════════ permalink 본 검증 (1~14, 16~23, 25~28) ═══════════ */
  for (const theme of ["light", "dark"]) {
    consoleErrors = [];
    await page.goto(PERMALINK, { waitUntil: "networkidle0" });
    await setTheme(theme);

    /* ── 1·2. 헤딩 크기/굵기/색 ── */
    const heads = await page.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const probe = (prop, val, read) => {
        const p = document.createElement("span");
        p.style.setProperty(prop, val);
        body.appendChild(p);
        const v = getComputedStyle(p)[read];
        p.remove();
        return v;
      };
      const out = { mutedComputed: probe("color", "var(--color-muted-foreground)", "color") };
      for (const tag of ["h2", "h3", "h4", "h5", "h6"]) {
        const el = body.querySelector(tag);
        const cs = getComputedStyle(el);
        out[tag] = {
          fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color,
          letterSpacing: cs.letterSpacing, lineHeight: cs.lineHeight,
          scrollMarginTop: cs.scrollMarginTop, fontFamily: cs.fontFamily,
        };
      }
      return out;
    });
    const expectSize = { h2: "20px", h3: "18px", h4: "16px", h5: "14px", h6: "14px" };
    const expectLS = { h2: "-0.24px", h3: "-0.18px", h4: "-0.16px", h5: "-0.112px", h6: "-0.112px" };
    for (const tag of ["h2", "h3", "h4", "h5", "h6"]) {
      eq(1, theme, `${tag} font-size`, heads[tag].fontSize, expectSize[tag]);
      eq(1, theme, `${tag} font-weight`, heads[tag].fontWeight, "600");
      eq(1, theme, `${tag} letter-spacing(한글 자간 스케일)`, heads[tag].letterSpacing, expectLS[tag]);
    }
    eq(2, theme, "h6 color === --color-muted-foreground", heads.h6.color, heads.mutedComputed);
    check(2, theme, "h6 color !== h5 color", heads.h6.color !== heads.h5.color,
      `h5=${heads.h5.color} h6=${heads.h6.color}`);
    eq(27, theme, "h2 scroll-margin-top 48px", heads.h2.scrollMarginTop, "48px");

    /* ── 3·4. 목록 ── */
    const lists = await page.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const cs = (s) => getComputedStyle(body.querySelector(s));
      const ul = body.querySelector("ul");
      const li = body.querySelector("li");
      let markerColor = null;
      try { markerColor = getComputedStyle(li, "::marker").color; } catch {}
      const p = document.createElement("span");
      p.style.color = "var(--color-muted-foreground)";
      body.appendChild(p);
      const muted = getComputedStyle(p).color;
      p.remove();
      return {
        ul: cs("ul").listStyleType, ulul: cs("ul ul").listStyleType,
        ulPos: cs("ul").listStylePosition,
        ol: cs("ol").listStyleType, olol: cs("ol ol").listStyleType,
        ulPad: cs("ul").paddingLeft, olPad: cs("ol").paddingLeft,
        markerColor, muted,
        liIndent: Math.round(li.getBoundingClientRect().x - ul.getBoundingClientRect().x),
        liGap: (() => {
          const items = [...body.querySelectorAll("ul > li")];
          for (let i = 0; i < items.length - 1; i++) {
            if (items[i].nextElementSibling === items[i + 1]) {
              return Math.round(
                (items[i + 1].getBoundingClientRect().top -
                  items[i].getBoundingClientRect().bottom) * 100) / 100;
            }
          }
          return null;
        })(),
      };
    });
    eq(3, theme, "ul list-style-type disc", lists.ul, "disc");
    eq(3, theme, "ul ul list-style-type circle", lists.ulul, "circle");
    eq(3, theme, "ol list-style-type decimal", lists.ol, "decimal");
    eq(3, theme, "ol ol list-style-type lower-alpha", lists.olol, "lower-alpha");
    eq(3, theme, "list-style-position outside", lists.ulPos, "outside");
    if (lists.markerColor)
      eq(3, theme, "li::marker color = muted-foreground", lists.markerColor, lists.muted);
    eq(4, theme, "ul padding-left 24px", lists.ulPad, "24px");
    eq(4, theme, "ol padding-left 24px", lists.olPad, "24px");
    near(4, theme, "li 콘텐츠가 ul 좌측에서 24px 안쪽(마커 자리 확보)", lists.liIndent, 24, 1);
    near(4, theme, "li + li 간격 8px", lists.liGap, 8, 0.6);

    /* ── 5~8. 수직 리듬 ── */
    const rhythm = await page.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const r = (e) => e.getBoundingClientRect();
      const ps = [...body.querySelectorAll("p")];
      let pGap = null;
      for (let i = 0; i < ps.length - 1; i++) {
        if (ps[i].nextElementSibling === ps[i + 1]) {
          pGap = Math.round((r(ps[i + 1]).top - r(ps[i]).bottom) * 100) / 100;
          break;
        }
      }
      const h2 = body.querySelector("h2");
      const h3 = body.querySelector("h3");
      const h4 = body.querySelector("h4");
      const first = body.firstElementChild;
      const hr = body.querySelector("hr");
      return {
        pGap,
        h2MT: getComputedStyle(h2).marginTop,
        h3MT: getComputedStyle(h3).marginTop,
        h4MT: getComputedStyle(h4).marginTop,
        afterH2MT: getComputedStyle(h2.nextElementSibling).marginTop,
        afterH2Tag: h2.nextElementSibling.tagName,
        firstMT: getComputedStyle(first).marginTop,
        firstTag: first.tagName,
        blockquoteMT: getComputedStyle(body.querySelector("blockquote")).marginTop,
        preMT: getComputedStyle(body.querySelector("pre")).marginTop,
        hrAbove: Math.round((r(hr).top - r(hr.previousElementSibling).bottom) * 100) / 100,
        hrBelow: Math.round((r(hr.nextElementSibling).top - r(hr).bottom) * 100) / 100,
      };
    });
    near(5, theme, "연속 <p> 간격 16px", rhythm.pGap, 16, 0.6);
    eq(6, theme, "h2 margin-top 48px", rhythm.h2MT, "48px");
    eq(6, theme, "h3 margin-top 40px", rhythm.h3MT, "40px");
    eq(6, theme, "h4 margin-top 32px", rhythm.h4MT, "32px");
    eq(6, theme, `h2 직후(${rhythm.afterH2Tag}) margin-top 12px`, rhythm.afterH2MT, "12px");
    eq(6, theme, "blockquote margin-top 24px", rhythm.blockquoteMT, "24px");
    eq(6, theme, "pre margin-top 24px", rhythm.preMT, "24px");
    eq(7, theme, `첫 자식(${rhythm.firstTag}) margin-top 0`, rhythm.firstMT, "0px");
    near(8, theme, "hr 위 간격 40px", rhythm.hrAbove, 40, 0.6);
    near(8, theme, "hr 아래 간격 40px", rhythm.hrBelow, 40, 0.6);

    /* ── 9~12. 코드 ── */
    const code = await page.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const inner = document.querySelector('[data-slot="content-inner"]');
      const pre = body.querySelector("pre");
      const preCode = pre.querySelector("code");
      const inline = [...body.querySelectorAll("code")].find((c) => !c.closest("pre"));
      const cs = (e) => getComputedStyle(e);
      const p = document.createElement("span");
      p.style.backgroundColor = "var(--color-muted)";
      body.appendChild(p);
      const muted = getComputedStyle(p).backgroundColor;
      p.remove();
      return {
        preFont: cs(pre).fontFamily, inlineFont: cs(inline).fontFamily,
        preLS: cs(pre).letterSpacing, inlineLS: cs(inline).letterSpacing,
        preWS: cs(pre).whiteSpace, preOX: cs(pre).overflowX, preOY: cs(pre).overflowY,
        preTab: cs(pre).tabSize, preSize: cs(pre).fontSize, inlineSize: cs(inline).fontSize,
        inlineWeight: cs(inline).fontWeight,
        preScrollW: pre.scrollWidth, preClientW: pre.clientWidth,
        preCodeBg: cs(preCode).backgroundColor, preCodePad: cs(preCode).paddingTop,
        preBg: cs(pre).backgroundColor, inlineBg: cs(inline).backgroundColor, muted,
        preBorder: cs(pre).borderTopWidth + " " + cs(pre).borderTopStyle,
        innerOverflow: inner.scrollWidth - inner.clientWidth,
        docOverflow: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
        bodyWidth: Math.round(body.getBoundingClientRect().width),
      };
    });
    for (const [k, v] of [["pre", code.preFont], ["inline code", code.inlineFont]]) {
      check(9, theme, `${k} font-family가 ui-monospace로 시작`, v.startsWith("ui-monospace"), v);
      check(9, theme, `${k} font-family에 Pretendard 없음`, !/Pretendard/i.test(v), v);
    }
    eq(10, theme, "pre letter-spacing normal", code.preLS, "normal");
    eq(10, theme, "inline code letter-spacing normal", code.inlineLS, "normal");
    eq(10, theme, "pre white-space pre", code.preWS, "pre");
    eq(10, theme, "pre tab-size 2", code.preTab, "2");
    check(11, theme, "pre 가로 스크롤 발생",
      code.preScrollW > code.preClientW, `scrollW=${code.preScrollW} clientW=${code.preClientW}`);
    eq(11, theme, "pre overflow-x auto", code.preOX, "auto");
    eq(11, theme, "본문 폭 720px 유지(pre가 밀지 않음)", code.bodyWidth, 720);
    eq(11, theme, "content-inner 가로 오버플로 0", code.innerOverflow, 0);
    eq(11, theme, "document 가로 오버플로 0", code.docOverflow, 0);
    check(12, theme, "pre > code 배경 투명",
      /rgba\(0, 0, 0, 0\)|transparent/.test(code.preCodeBg), code.preCodeBg);
    eq(12, theme, "pre > code padding 0", code.preCodePad, "0px");
    eq(12, theme, "pre 배경 = --color-muted", code.preBg, code.muted);
    eq(12, theme, "inline code 배경 = --color-muted", code.inlineBg, code.muted);
    eq(12, theme, "inline code font-size 14px", code.inlineSize, "14px");
    eq(12, theme, "inline code font-weight 600", code.inlineWeight, "600");

    /* ── 13·14·16·17. 표 ── */
    const table = await page.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const inner = document.querySelector('[data-slot="content-inner"]');
      const tables = [...body.querySelectorAll("table")];
      const t = tables[0];
      const wrap = t.parentElement;
      const rows = [...t.querySelectorAll("tbody tr")];
      const cs = (e) => getComputedStyle(e);
      const p = document.createElement("span");
      p.style.backgroundColor = "var(--color-muted)";
      body.appendChild(p);
      const muted = getComputedStyle(p).backgroundColor;
      p.remove();
      return {
        count: tables.length,
        allWrapped: tables.every(
          (x) => x.getAttribute("data-prose-table") === "wrapped" &&
                 x.parentElement.getAttribute("data-slot") === "prose-table-wrap"),
        wrapTabindex: wrap.getAttribute("tabindex"),
        wrapOX: cs(wrap).overflowX,
        wrapScrollW: wrap.scrollWidth, wrapClientW: wrap.clientWidth,
        tableDisplay: cs(t).display, tableWidth: Math.round(t.getBoundingClientRect().width),
        evenBg: cs(rows[1]).backgroundColor, oddBg: cs(rows[0]).backgroundColor, muted,
        thWeight: cs(t.querySelector("th")).fontWeight,
        tdPadding: cs(t.querySelector("td")).padding,
        tdBorder: cs(t.querySelector("td")).borderTopWidth,
        fontSize: cs(t).fontSize,
        wrapMT: cs(wrap).marginTop,
        innerOverflow: inner.scrollWidth - inner.clientWidth,
        docOverflow: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
      };
    });
    check(13, theme, `모든 table(${table.count})이 prose-table-wrap + data-prose-table="wrapped"`,
      table.allWrapped && table.count > 0, `count=${table.count} allWrapped=${table.allWrapped}`);
    eq(13, theme, "table이 폴백(block) 아닌 정상 table 레이아웃", table.tableDisplay, "table");
    eq(13, theme, "래퍼 overflow-x auto", table.wrapOX, "auto");
    eq(13, theme, "래퍼 margin-top 24px", table.wrapMT, "24px");
    /* ★ 실측: 스펙 §8-3은 이 5열 샘플 표가 가로 스크롤을 유발한다고 예상했지만
       실제 min-content 폭은 347px로 본문 720px에 여유롭게 들어간다(= 자연
       상태에서는 넘치지 않는다). 그래서 "넘치는 표"를 런타임에 강제로 만들어
       래퍼의 overflow-x 메커니즘 자체를 검증한다. */
    const wide = await page.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const inner = document.querySelector('[data-slot="content-inner"]');
      const t = body.querySelector("table");
      const wrap = t.parentElement;
      const td = document.createElement("td");
      td.textContent = "X".repeat(240);
      td.style.whiteSpace = "nowrap";
      td.setAttribute("data-prose-test", "wide");
      t.querySelector("tbody tr").appendChild(td);
      const out = {
        natural: { scrollW: wrap.scrollWidth, clientW: wrap.clientWidth },
        wrapScrolls: wrap.scrollWidth > wrap.clientWidth,
        wrapScrollW: wrap.scrollWidth, wrapClientW: wrap.clientWidth,
        bodyWidth: Math.round(body.getBoundingClientRect().width),
        innerOverflow: inner.scrollWidth - inner.clientWidth,
        docOverflow: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
      };
      td.remove();
      return out;
    });
    check(14, theme, "(전제) 샘플 5열 표는 720px에 들어가 자연 오버플로 없음",
      table.wrapScrollW === table.wrapClientW,
      `scrollW=${table.wrapScrollW} clientW=${table.wrapClientW}`);
    check(14, theme, "넘치는 표를 주입하면 래퍼가 가로 스크롤",
      wide.wrapScrolls, `scrollW=${wide.wrapScrollW} clientW=${wide.wrapClientW}`);
    eq(14, theme, "넘치는 표에서도 본문 폭 720px 불변", wide.bodyWidth, 720);
    eq(14, theme, "넘치는 표에서도 content-inner 가로 오버플로 0", wide.innerOverflow, 0);
    eq(14, theme, "넘치는 표에서도 document 가로 오버플로 0", wide.docOverflow, 0);
    eq(14, theme, "평상시 content-inner 가로 오버플로 0", table.innerOverflow, 0);
    eq(14, theme, "평상시 document 가로 오버플로 0", table.docOverflow, 0);
    eq(16, theme, "짝수 행 배경 = --color-muted", table.evenBg, table.muted);
    check(16, theme, "홀수 행 배경 투명",
      /rgba\(0, 0, 0, 0\)|transparent/.test(table.oddBg), table.oddBg);
    eq(16, theme, "th font-weight 600", table.thWeight, "600");
    eq(16, theme, "td padding 8px 16px", table.tdPadding, "8px 16px");
    eq(16, theme, "td border 1px", table.tdBorder, "1px");
    eq(16, theme, "table font-size 14px", table.fontSize, "14px");

    /* :focus-visible은 tabindex-only 요소에서 프로그램적 focus()로는 매치되지
       않는다(Chromium 휴리스틱) — 실제 Tab 키로 도달시켜야 한다. */
    await page.evaluate(() => {
      const w = document.querySelector('[data-slot="prose-table-wrap"]');
      const prev = w.previousElementSibling || w.parentElement;
      prev.setAttribute("tabindex", "-1");
      prev.setAttribute("data-prose-test-prev", "1");
      prev.focus();
    });
    await page.keyboard.press("Tab");
    await sleep(80);
    const wrapFocus = await page.evaluate(() => {
      const w = document.querySelector('[data-slot="prose-table-wrap"]');
      const cs = getComputedStyle(w);
      const out = {
        focused: document.activeElement === w, fv: w.matches(":focus-visible"),
        ow: cs.outlineWidth, os: cs.outlineStyle, oc: cs.outlineColor, oo: cs.outlineOffset,
      };
      const prev = document.querySelector("[data-prose-test-prev]");
      if (prev) { prev.removeAttribute("tabindex"); prev.removeAttribute("data-prose-test-prev"); }
      return out;
    });
    check(17, theme, "래퍼가 실제 Tab 키로 포커스를 받음(tabindex=0)",
      table.wrapTabindex === "0" && wrapFocus.focused, JSON.stringify(wrapFocus));
    check(17, theme, "래퍼 포커스 링 2px solid",
      wrapFocus.fv && wrapFocus.ow === "2px" && wrapFocus.os === "solid" && wrapFocus.oo === "2px",
      JSON.stringify(wrapFocus));

    /* ── 18·19. 링크 ── */
    const LINK = '[data-slot="post-single-body"] a';
    const link = await page.evaluate((sel) => {
      const a = document.querySelector(sel);
      const cs = getComputedStyle(a);
      return { color: cs.color, weight: cs.fontWeight, line: cs.textDecorationLine,
        thick: cs.textDecorationThickness, deco: cs.textDecorationColor, off: cs.textUnderlineOffset };
    }, LINK);
    eq(18, theme, "링크 색", link.color,
      theme === "light" ? "rgb(20, 71, 230)" : "rgb(142, 197, 255)");
    eq(18, theme, "링크 font-weight 500", link.weight, "500");
    eq(18, theme, "링크 underline", link.line, "underline");
    eq(18, theme, "링크 밑줄 오프셋 4px", link.off, "4px");
    check(18, theme, "기본 밑줄색이 텍스트색과 다름(40% mix)",
      link.deco !== link.color, `deco=${link.deco} color=${link.color}`);

    await page.hover(LINK);
    await sleep(300);
    const hov = await page.evaluate((sel) => {
      const a = document.querySelector(sel);
      const cs = getComputedStyle(a);
      return { deco: cs.textDecorationColor, color: cs.color };
    }, LINK);
    eq(18, theme, "hover 밑줄색 = currentColor", hov.deco, hov.color);
    await page.mouse.move(2, 2);

    const lf = await page.evaluate((sel) => {
      const a = document.querySelector(sel);
      a.focus();
      const cs = getComputedStyle(a);
      return { focused: document.activeElement === a, fv: a.matches(":focus-visible"),
        ow: cs.outlineWidth, os: cs.outlineStyle, radius: cs.borderRadius };
    }, LINK);
    check(19, theme, "링크 포커스 링 2px solid",
      lf.focused && lf.fv && lf.ow === "2px" && lf.os === "solid", JSON.stringify(lf));

    /* ── 20·21. 인용 / hr / --content-divider 상속 ── */
    const quote = await page.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const bq = body.querySelector("blockquote");
      const hr = body.querySelector("hr");
      const cs = getComputedStyle(bq), hcs = getComputedStyle(hr);
      const dividerVar = getComputedStyle(body).getPropertyValue("--content-divider").trim();
      const p = document.createElement("span");
      p.style.borderLeft = "2px solid var(--content-divider)";
      body.appendChild(p);
      const probeColor = getComputedStyle(p).borderLeftColor;
      p.remove();
      return { fs: cs.fontStyle, blw: cs.borderLeftWidth, blc: cs.borderLeftColor,
        pl: cs.paddingLeft, dividerVar, probeColor,
        hrW: hcs.borderTopWidth, hrC: hcs.borderTopColor, hrH: hcs.height,
        hrBottom: hcs.borderBottomWidth, hrRect: hr.getBoundingClientRect().height,
        em: getComputedStyle(body.querySelector("em")).fontStyle,
        strong: getComputedStyle(body.querySelector("strong")).fontWeight,
        bodyLH: getComputedStyle(body).lineHeight,
        bodyLS: getComputedStyle(body).letterSpacing,
        bodyWB: getComputedStyle(body).wordBreak,
        bodyOW: getComputedStyle(body).overflowWrap,
        bodyFS: getComputedStyle(body).fontSize };
    });
    eq(20, theme, "blockquote font-style normal(이탤릭 제거)", quote.fs, "normal");
    eq(20, theme, "blockquote border-left-width 2px", quote.blw, "2px");
    eq(20, theme, "blockquote padding-left 24px", quote.pl, "24px");
    eq(20, theme, "blockquote 좌측선 색 = --content-divider", quote.blc, quote.probeColor);
    eq(20, theme, "hr border-top 1px", quote.hrW, "1px");
    eq(20, theme, "hr 색 = --content-divider", quote.hrC, quote.probeColor);
    /* box-sizing:border-box(preflight) 때문에 getComputedStyle().height는
       border를 포함한 1px로 보고된다 — height:0 + border-top:1px이 의도대로
       "1px짜리 선"으로 렌더된다는 것을 실제 렌더 높이와 나머지 변이 0인지로 확인. */
    eq(20, theme, "hr 렌더 높이 정확히 1px(선 하나)", quote.hrRect, 1);
    eq(20, theme, "hr border-bottom 0(위쪽 선만)", quote.hrBottom, "0px");
    check(21, theme, "--content-divider가 post-single-body까지 상속됨",
      quote.dividerVar.length > 0, `value="${quote.dividerVar}"`);
    eq(4, theme, "인라인 em italic 유지", quote.em, "italic");
    eq(4, theme, "strong font-weight 600", quote.strong, "600");
    eq(4, theme, "본문 font-size 16px", quote.bodyFS, "16px");
    eq(4, theme, "본문 line-height 1.625(=26px)", quote.bodyLH, "26px");
    eq(4, theme, "본문 letter-spacing -0.01em(=-0.16px)", quote.bodyLS, "-0.16px");
    eq(4, theme, "본문 word-break keep-all", quote.bodyWB, "keep-all");
    eq(4, theme, "본문 overflow-wrap break-word", quote.bodyOW, "break-word");

    /* ── 22·23. 이미지 / figcaption ── */
    const imgs = await page.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const all = [...body.querySelectorAll("img")];
      const wide = all.find((i) => i.naturalWidth > 500);
      const narrow = all.find((i) => i.naturalWidth <= 200);
      const cap = body.querySelector("figcaption");
      const cs = (e) => getComputedStyle(e);
      const br = body.getBoundingClientRect();
      const nr = narrow.getBoundingClientRect();
      const p = document.createElement("span");
      p.style.color = "var(--color-muted-foreground)";
      body.appendChild(p);
      const muted = getComputedStyle(p).color;
      p.remove();
      return {
        wideW: Math.round(wide.getBoundingClientRect().width),
        wideRadius: cs(wide).borderRadius, wideDisplay: cs(wide).display,
        narrowW: Math.round(nr.width), narrowNatural: narrow.naturalWidth,
        centerDelta: Math.round((nr.left - br.left) - (br.right - nr.right)),
        bodyW: Math.round(br.width),
        capAlign: cs(cap).textAlign, capColor: cs(cap).color,
        capMT: cs(cap).marginTop, capSize: cs(cap).fontSize, muted,
        figImgMT: cs(body.querySelector("figure img")).marginTop,
        figMT: cs(body.querySelector("figure")).marginTop,
        figPrevTag: body.querySelector("figure").previousElementSibling.tagName,
        loneImgMT: cs(narrow).marginTop,
        loneImgPrevTag: narrow.previousElementSibling.tagName,
      };
    });
    eq(22, theme, "넓은 이미지(1200px)가 본문 폭으로 축소", imgs.wideW, imgs.bodyW);
    eq(22, theme, "이미지 radius 8px", imgs.wideRadius, "8px");
    eq(22, theme, "이미지 display block", imgs.wideDisplay, "block");
    eq(22, theme, "좁은 이미지(96px) 확대되지 않음", imgs.narrowW, imgs.narrowNatural);
    near(22, theme, "좁은 이미지 가운데 정렬(좌우 여백 동일)", imgs.centerDelta, 0, 1);
    eq(23, theme, "figcaption text-align center", imgs.capAlign, "center");
    eq(23, theme, "figcaption 색 = muted-foreground", imgs.capColor, imgs.muted);
    eq(23, theme, "figcaption margin-top 8px", imgs.capMT, "8px");
    eq(23, theme, "figcaption font-size 14px", imgs.capSize, "14px");
    eq(23, theme, "figure > img margin-top 0", imgs.figImgMT, "0px");
    /* figure는 <h3>이미지</h3> 바로 뒤라 §4-2의 "제목 직후 12px" 규칙이
       (같은 특이도·뒤에 선언) 24px 규칙을 이긴다 — 스펙 의도대로다.
       24px 규칙 자체는 제목 뒤가 아닌 단독 이미지(<p> 다음)로 확인한다. */
    eq(23, theme, `figure(${imgs.figPrevTag} 직후) margin-top 12px`, imgs.figMT, "12px");
    eq(23, theme, `단독 이미지(${imgs.loneImgPrevTag} 직후) margin-top 24px`, imgs.loneImgMT, "24px");

    /* ── 25. permalink 분기 (격자/타이틀 꺼짐) ── */
    const off = await page.evaluate(() => {
      const grid = document.querySelector('[data-slot="content-grid"]');
      const inner = document.querySelector('[data-slot="content-inner"]');
      const title =
        document.querySelector('[data-slot="content-titlebar"]') ||
        document.querySelector('[data-slot="content-title"]') ||
        document.querySelector('[data-slot="content-header"]');
      return {
        hasSingle: !!document.querySelector('[data-slot="post-single"]'),
        gridExists: !!grid,
        gridBg: grid ? getComputedStyle(grid).backgroundImage : null,
        gridDisplay: grid ? getComputedStyle(grid).display : null,
        innerBg: getComputedStyle(inner).backgroundImage,
        titleSlot: title ? title.getAttribute("data-slot") : null,
        titleDisplay: title ? getComputedStyle(title).display : null,
      };
    });
    check(25, theme, "permalink: post-single 존재", off.hasSingle, JSON.stringify(off));
    /* 격자 배경의 실제 소유자는 content-inner다(content.css 37~55행). */
    check(25, theme, "permalink: content-inner 격자 배경 꺼짐(background-image:none)",
      off.innerBg === "none", `innerBg=${off.innerBg}`);
    check(25, theme, `permalink: 타이틀영역(${off.titleSlot}) 숨김`,
      off.titleSlot === null || off.titleDisplay === "none",
      JSON.stringify({ slot: off.titleSlot, display: off.titleDisplay }));

    /* ── 26. 스크롤 주체 + 커스텀 스크롤바 idle 페이드 ── */
    const sm = await page.evaluate(async () => {
      const inner = document.querySelector('[data-slot="content-inner"]');
      const doc = document.scrollingElement;
      inner.scrollTop = 0;
      inner.scrollTop = 400;
      await new Promise((r) => requestAnimationFrame(r));
      const moved = inner.scrollTop;
      const csi = getComputedStyle(inner);
      return {
        innerScrollable: inner.scrollHeight > inner.clientHeight,
        moved, overflowY: csi.overflowY,
        docScrollable: doc.scrollHeight > doc.clientHeight + 1,
        hasCustomAttr: inner.hasAttribute("data-custom-scrollbar"),
        maskImage: csi.maskImage || csi.webkitMaskImage,
      };
    });
    check(26, theme, "content-inner가 스크롤 컨테이너", sm.innerScrollable && sm.overflowY !== "visible", JSON.stringify(sm));
    check(26, theme, "content-inner가 실제로 스크롤됨", sm.moved > 0, `scrollTop=${sm.moved}`);
    check(26, theme, "문서 자체는 스크롤되지 않음", !sm.docScrollable, `docScrollable=${sm.docScrollable}`);
    check(26, theme, "content-inner에 data-custom-scrollbar", sm.hasCustomAttr, String(sm.hasCustomAttr));

    /* 커스텀 스크롤바 페이드: smooth-scroll.js의 실제 SCROLLBAR_IDLE_MS는
       1000ms다(스펙 §7-2 26번의 "3초"는 낡은 서술 — 구현값 기준으로 검증). */
    await page.evaluate(() => {
      const inner = document.querySelector('[data-slot="content-inner"]');
      inner.scrollTop += 120;
    });
    await sleep(120);
    const scrollingOn = await page.evaluate(() =>
      document.querySelector('[data-slot="content-inner"]').getAttribute("data-scrolling"));
    await sleep(1400);
    const scrollingOff = await page.evaluate(() =>
      document.querySelector('[data-slot="content-inner"]').getAttribute("data-scrolling"));
    eq(26, theme, "스크롤 중 data-scrolling='true'(스크롤바 노출)", scrollingOn, "true");
    check(26, theme, "1초 idle 후 data-scrolling 해제(페이드아웃)",
      scrollingOff === null || scrollingOff === "false", `after-idle=${scrollingOff}`);

    check(27, theme, "content-inner scroll-fade 마스크 적용",
      !!sm.maskImage && sm.maskImage !== "none", String(sm.maskImage).slice(0, 70));

    /* ── 27. 앵커 이동 ── */
    const anchor = await page.evaluate(async () => {
      const inner = document.querySelector('[data-slot="content-inner"]');
      /* 문서 끝 근처 제목을 쓰면 스크롤 여유가 없어 48px에 도달하지 못한다 —
         아래로 충분한 콘텐츠가 남아 있는 첫 h3를 쓴다. */
      const h3 = document.querySelectorAll('[data-slot="post-single-body"] h3')[0];
      h3.id = "prose-anchor-test";
      h3.scrollIntoView();
      await new Promise((r) => setTimeout(r, 200));
      return Math.round(h3.getBoundingClientRect().top - inner.getBoundingClientRect().top);
    });
    near(27, theme, "앵커 이동 시 제목 상단 오프셋 48px(페이드 40px보다 큼)", anchor, 48, 2);

    /* ── 28. 오버플로 / 콘솔 ── */
    await page.evaluate(() => {
      document.querySelector('[data-slot="content-inner"]').scrollTop = 0;
    });
    const ov = await page.evaluate(() => ({
      d: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
      inner: (() => { const i = document.querySelector('[data-slot="content-inner"]'); return i.scrollWidth - i.clientWidth; })(),
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    eq(28, theme, "document 가로 오버플로 0", ov.d, 0);
    eq(28, theme, "body 가로 오버플로 0", ov.body, 0);
    eq(28, theme, "content-inner 가로 오버플로 0", ov.inner, 0);
    check(28, theme, "콘솔 에러 0", consoleErrors.length === 0, JSON.stringify(consoleErrors));

    await page.screenshot({ path: resolve(shots, `permalink-${theme}.png`) });
    const bodyEl = await page.$('[data-slot="post-single-body"]');
    await bodyEl.screenshot({ path: resolve(shots, `prose-body-${theme}.png`) });
  }

  /* ═══════════ 15. content.js 제거 사본 — CSS 폴백 ═══════════ */
  {
    consoleErrors = [];
    await page.goto(PERMALINK_NOJS, { waitUntil: "networkidle0" });
    const fb = await page.evaluate(() => {
      const body = document.querySelector('[data-slot="post-single-body"]');
      const inner = document.querySelector('[data-slot="content-inner"]');
      const t = body.querySelector("table");
      const cs = getComputedStyle(t);
      return {
        hasWrap: !!document.querySelector('[data-slot="prose-table-wrap"]'),
        attr: t.getAttribute("data-prose-table"),
        display: cs.display, overflowX: cs.overflowX,
        naturalScrolls: t.scrollWidth > t.clientWidth,
        scrollW: t.scrollWidth, clientW: t.clientWidth,
        innerOverflow: inner.scrollWidth - inner.clientWidth,
        docOverflow: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
        bodyWidth: Math.round(body.getBoundingClientRect().width),
        /* 샘플 표는 720px에 들어가므로(§14 주석) 넘치는 셀을 주입해
           폴백 경로(display:block + overflow-x:auto)를 실제로 발동시킨다. */
        wide: (() => {
          const td = document.createElement("td");
          td.textContent = "X".repeat(240);
          td.style.whiteSpace = "nowrap";
          t.querySelector("tbody tr").appendChild(td);
          const o = {
            tableScrolls: t.scrollWidth > t.clientWidth,
            scrollW: t.scrollWidth, clientW: t.clientWidth,
            innerOverflow: inner.scrollWidth - inner.clientWidth,
            docOverflow: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
            bodyWidth: Math.round(body.getBoundingClientRect().width),
          };
          td.remove();
          return o;
        })(),
      };
    });
    check(15, "nojs", "JS 미실행 전제: 래퍼 미주입", !fb.hasWrap && fb.attr === null,
      `hasWrap=${fb.hasWrap} attr=${fb.attr}`);
    eq(15, "nojs", "폴백 table display:block", fb.display, "block");
    eq(15, "nojs", "폴백 table overflow-x:auto", fb.overflowX, "auto");
    check(15, "nojs", "(전제) 샘플 표는 자연 상태에서 넘치지 않음",
      !fb.naturalScrolls, `scrollW=${fb.scrollW} clientW=${fb.clientW}`);
    check(15, "nojs", "폴백: 넘치는 표를 주입하면 표 자체가 가로 스크롤",
      fb.wide.tableScrolls, `scrollW=${fb.wide.scrollW} clientW=${fb.wide.clientW}`);
    eq(15, "nojs", "폴백 본문 폭 720px 유지(넘치는 표 주입 상태)", fb.wide.bodyWidth, 720);
    eq(15, "nojs", "폴백 content-inner 가로 오버플로 0(넘치는 표 주입 상태)", fb.wide.innerOverflow, 0);
    eq(15, "nojs", "폴백 document 가로 오버플로 0(넘치는 표 주입 상태)", fb.wide.docOverflow, 0);
    eq(15, "nojs", "평상시 content-inner 가로 오버플로 0", fb.innerOverflow, 0);
    eq(15, "nojs", "평상시 document 가로 오버플로 0", fb.docOverflow, 0);
    check(15, "nojs", "콘솔 에러 0", consoleErrors.length === 0, JSON.stringify(consoleErrors));
    await page.screenshot({ path: resolve(shots, "permalink-nojs-fallback.png") });
  }

  /* ═══════════ 24. 목록(index) 회귀 ═══════════ */
  for (const theme of ["light", "dark"]) {
    consoleErrors = [];
    await page.goto(INDEX, { waitUntil: "networkidle0" });
    await setTheme(theme);
    await sleep(300);
    const idx = await page.evaluate(() => {
      const inner = document.querySelector('[data-slot="content-inner"]');
      const grid = document.querySelector('[data-slot="content-grid"]');
      const items = [...document.querySelectorAll('[data-slot="post-item"]')];
      const cs = getComputedStyle(inner);
      const cols = Number(cs.getPropertyValue("--content-grid-columns"));
      const rowPx = parseFloat(cs.getPropertyValue("--content-grid-row"));
      const heights = items.map((i) => Math.round(i.getBoundingClientRect().height));
      return {
        hasSingle: !!document.querySelector('[data-slot="post-single"]'),
        /* 격자 배경은 content-grid가 아니라 content-inner에 그려진다
           (content.css 37~55행) — grid 요소는 min-height만 담당. */
        gridBg: cs.backgroundImage,
        gridElemExists: !!grid,
        cols, rowPx: Math.round(rowPx * 100) / 100,
        dataCols: inner.getAttribute("data-grid-cols"),
        count: items.length, heights,
        aligned: rowPx > 0 && heights.every((h) => Math.abs(h / rowPx - Math.round(h / rowPx)) < 0.06),
        docOverflow: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
        view: inner.getAttribute("data-view"),
      };
    });
    check(24, theme, "index: post-single 없음(permalink 분기 아님)", !idx.hasSingle, `hasSingle=${idx.hasSingle}`);
    check(24, theme, "index: content-inner 격자 배경 켜짐(점+가로선+세로선 3겹)",
      idx.gridBg !== "none" && (idx.gridBg.match(/gradient/g) || []).length === 3,
      String(idx.gridBg).slice(0, 90));
    check(24, theme, `index: 열 수 유효(${idx.cols}, data-grid-cols=${idx.dataCols})`,
      idx.cols >= 2 && idx.cols <= 12, `cols=${idx.cols}`);
    check(24, theme, `index: 카드 ${idx.count}개 높이가 격자 행(${idx.rowPx}px)의 정수배`,
      idx.aligned && idx.count > 0, JSON.stringify(idx.heights));
    eq(24, theme, "index: document 가로 오버플로 0", idx.docOverflow, 0);
    check(24, theme, "index: 콘솔 에러 0", consoleErrors.length === 0, JSON.stringify(consoleErrors));
    await page.screenshot({ path: resolve(shots, `index-regression-${theme}.png`) });
  }

  await browser.disconnect();
  child.kill();
  try { rmSync(userData, { recursive: true, force: true }); } catch { /* ok */ }

  /* ── 리포트 ── */
  const byId = new Map();
  for (const r of results) {
    if (!byId.has(r.id)) byId.set(r.id, []);
    byId.get(r.id).push(r);
  }
  console.log("\n════════ PROSE SPEC §7-2 검증 결과 ════════");
  for (const id of [...byId.keys()].sort((a, b) => a - b)) {
    const rows = byId.get(id);
    const bad = rows.filter((r) => !r.ok);
    console.log(`[${id}] ${bad.length === 0 ? "PASS" : "FAIL"}  (assert ${rows.length}건 / 실패 ${bad.length}건)`);
    for (const r of bad) console.log(`     ✗ (${r.theme}) ${r.label} — ${r.detail}`);
  }
  console.log(`\n총 ${results.length}건 assert, 실패 ${failures}건`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
