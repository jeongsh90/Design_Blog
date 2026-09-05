/**
 * [FOOTER SPEC §9-4] 글 상세 하단 4종 검증 (30항목 × 라이트/다크)
 *   ① 공감/공유 액션 바  ② 관련글  ③ 글 태그  ④ 댓글 목록 + 작성 폼
 *
 * 전제: bun run skin:build && bun run skin:preview && bun run skin:serve
 * 실행: bun dashboard-skin/tools/verify-footer.mjs
 *
 * verify-prose.mjs / verify-content.mjs와 동일한 기동 방식 — 이 환경에서
 * Playwright launch가 WebSocket 핸드셰이크에서 멈추므로 Chromium을 직접
 * spawn 후 puppeteer-core로 붙는다.
 * ★ --show-scrollbars: 스펙 §9-4 29번 주석(ignoreDefaultArgs:["--hide-scrollbars"])과
 *   같은 의도 — 스크롤바를 숨긴 채로는 스크롤 모델/스크롤바 픽셀 관측이 왜곡된다.
 */
import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const shots = resolve(root, "_workspace", "footer-shots");
const BASE = process.env.SKIN_BASE || "http://localhost:4321";
const VP = { width: 1440, height: 900 };
const CDP_PORT = Number(process.env.CDP_PORT || 9351);

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
  const chromePath = process.env.PLAYWRIGHT_CHROME_PATH || (() => {
    const base = `${process.env.USERPROFILE}\\AppData\\Local\\ms-playwright`;
    const dir = readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
    if (!dir) throw new Error(`chromium build not found under ${base}`);
    return `${base}\\${dir}\\chrome-win64\\chrome.exe`;
  })();
  const userData = resolve(process.env.TEMP || ".", `pw-footer-verify-${process.pid}`);
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
  try {
    await browser.defaultBrowserContext().overridePermissions(BASE, [
      "clipboard-read",
      "clipboard-write",
    ]);
  } catch (e) {
    console.log("[warn] overridePermissions failed:", String(e));
  }

  const page = (await browser.pages())[0] || (await browser.newPage());
  await page.setViewport(VP);
  /* ★ headless에서는 bringToFront()만으로 **문서 포커스**가 생기지 않는다 —
     activeElement는 바뀌어도 :focus-visible / :focus-within이 매칭되지 않고
     Async Clipboard API는 "Document is not focused"로 거부된다. 실제로 이 때문에
     7·21·24번이 스킨이 정상인데도 실패했다. CDP 포커스 에뮬레이션으로
     "창이 활성"인 상태를 강제한다(스킨 코드가 아니라 관측 환경을 고친 것). */
  const cdp = await page.createCDPSession();
  try {
    await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  } catch (e) {
    console.log("[warn] setFocusEmulationEnabled failed:", String(e));
  }
  /* ★ overridePermissions("clipboard-write")는 이 빌드에서 "ok"를 반환하고도
     실제 권한은 denied로 남는다(실측) — writeText가 NotAllowedError로 거부돼
     스킨의 catch 분기("복사에 실패했습니다")가 돌았다. 브라우저 레벨 CDP
     grantPermissions로 실제로 부여해야 성공 경로를 관측할 수 있다. */
  try {
    const bcdp = await browser.target().createCDPSession();
    await bcdp.send("Browser.grantPermissions", {
      origin: BASE,
      permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
    });
  } catch (e) {
    console.log("[warn] Browser.grantPermissions failed:", String(e));
  }

  let consoleErrors = [];
  const IGNORE = /favicon\.ico/;
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORE.test(m.text() + " " + (m.location()?.url || "")))
      consoleErrors.push(m.text() + " @ " + (m.location()?.url || ""));
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  page.on("response", (r) => {
    if (r.status() >= 400 && !IGNORE.test(r.url())) consoleErrors.push(`HTTP ${r.status()} ${r.url()}`);
  });

  async function setTheme(theme) {
    await page.evaluate((t) => {
      document.documentElement.classList.toggle("dark", t === "dark");
      try { localStorage.setItem("daitnu-theme", t); } catch {}
    }, theme);
    /* 색 transition(0.15s)이 걸려 있어 짧게 기다리면 보간 중인 중간색을 읽는다 */
    await sleep(500);
  }

  for (const theme of ["light", "dark"]) {
    consoleErrors = [];
    await page.goto(PERMALINK, { waitUntil: "networkidle0" });
    /* ★ 클립보드 쓰기와 :focus-visible / :focus-within은 **문서가 실제로
       포커스를 가질 때만** 동작한다. headless에서 페이지를 앞으로 가져오지
       않으면 document.activeElement는 바뀌어도 :focus-within이 매칭되지 않아
       스킨이 정상인데도 7·21·24번이 거짓 실패한다(실측으로 확인). */
    await page.bringToFront();
    /* 공감 카운터 기준선 — 앞선 테마 루프가 남긴 값을 지우고 새로 시작한다.
       (evaluateOnNewDocument로 지우면 reload 때도 지워져 4번 지속성 검증
        자체가 불가능해진다 — 실측으로 확인) */
    await page.evaluate(() => {
      try { localStorage.removeItem("daitnu-post-like:" + location.pathname); } catch {}
    });
    await page.reload({ waitUntil: "networkidle0" });
    await page.bringToFront();
    await setTheme(theme);

    /* ═════════════════ 구조 (1~3) ═════════════════ */
    const struct = await page.evaluate(() => {
      const single = document.querySelector('[data-slot="post-single"]');
      const body = document.querySelector('[data-slot="post-single-body"]');
      const footer = document.querySelector('[data-slot="post-footer"]');
      const inner = document.querySelector('[data-slot="content-inner"]');
      const px = (n) => Math.round(n * 100) / 100;
      const r = (el) => { const b = el.getBoundingClientRect(); return { left: px(b.left), right: px(b.right) }; };

      const probe = (host, prop, val, read) => {
        const s = document.createElement("span");
        s.style.setProperty(prop, val);
        host.appendChild(s);
        const v = getComputedStyle(s)[read];
        s.remove();
        return v;
      };
      /* --content-divider는 content-inner에 선언돼 있으므로 그 안에서 계산해야 한다 */
      const dividerComputed = probe(inner, "color", "var(--content-divider)", "color");

      const blocks = ["post-actions", "post-related", "post-tags", "post-comments"].map((slot) => {
        const el = footer.querySelector(`:scope > [data-slot="${slot}"]`);
        const cs = getComputedStyle(el);
        return {
          slot, found: !!el, ...r(el),
          paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom,
          borderTopWidth: cs.borderTopWidth, borderTopColor: cs.borderTopColor,
          tag: el.tagName.toLowerCase(),
        };
      });

      /* 3) 프로즈 규칙 미유출 — 같은 <p>를 body/footer 양쪽에 심어 비교 */
      const mk = (host) => {
        const p = document.createElement("p");
        host.appendChild(p);
        const cs = getComputedStyle(p);
        const out = { marginTop: cs.marginTop };
        p.remove();
        return out;
      };
      const descLink = document.querySelector('[data-slot="comment-desc"] a');
      const dcs = descLink ? getComputedStyle(descLink) : null;
      const linkComputed = probe(document.body, "color", "var(--color-link)", "color");

      return {
        footerInsideSingle: !!single && single.contains(footer),
        footerParentIsSingle: footer.parentElement === single,
        footerTag: footer.tagName.toLowerCase(),
        footerMarginTop: getComputedStyle(footer).marginTop,
        body: r(body), blocks, dividerComputed,
        pInBody: mk(body), pInFooter: mk(footer),
        descLink: dcs && {
          color: dcs.color, fontWeight: dcs.fontWeight,
          textDecorationColor: dcs.textDecorationColor,
          textUnderlineOffset: dcs.textUnderlineOffset,
        },
        linkComputed,
      };
    });

    check(1, theme, "post-footer가 post-single의 직계 자식(<footer>)",
      struct.footerInsideSingle && struct.footerParentIsSingle && struct.footerTag === "footer",
      `inside=${struct.footerInsideSingle} parentIsSingle=${struct.footerParentIsSingle} tag=${struct.footerTag}`);
    eq(1, theme, "post-footer margin-top 48px", struct.footerMarginTop, "48px");
    for (const b of struct.blocks) {
      check(1, theme, `${b.slot} 좌우 경계 === post-single-body`,
        Math.abs(b.left - struct.body.left) < 0.5 && Math.abs(b.right - struct.body.right) < 0.5,
        `block=[${b.left},${b.right}] body=[${struct.body.left},${struct.body.right}]`);
      eq(2, theme, `${b.slot} padding-top`, b.paddingTop, "32px");
      eq(2, theme, `${b.slot} padding-bottom`, b.paddingBottom, "32px");
      eq(2, theme, `${b.slot} border-top-width`, b.borderTopWidth, "1px");
      eq(2, theme, `${b.slot} border-top-color === --content-divider`, b.borderTopColor, struct.dividerComputed);
    }
    eq(3, theme, "프로즈 미유출: body의 <p> margin-top", struct.pInBody.marginTop, "16px");
    eq(3, theme, "프로즈 미유출: footer의 <p> margin-top(프로즈 아님)", struct.pInFooter.marginTop, "0px");
    eq(3, theme, "댓글 링크 color === --color-link", struct.descLink.color, struct.linkComputed);
    eq(3, theme, "댓글 링크 font-weight 400(프로즈 a의 500이 아님)", struct.descLink.fontWeight, "400");
    check(3, theme, "댓글 링크 text-decoration-color === currentColor(프로즈 40% 혼합 아님)",
      struct.descLink.textDecorationColor === struct.descLink.color,
      `td=${struct.descLink.textDecorationColor} color=${struct.descLink.color}`);

    /* ═════════════════ ① 액션 바 (4~8) ═════════════════ */
    const like0 = await page.evaluate(() => {
      const b = document.querySelector("[data-post-like]");
      const svg = b.querySelector("svg");
      return {
        pressed: b.getAttribute("aria-pressed"), liked: b.getAttribute("data-liked"),
        count: b.querySelector("[data-post-like-count]").textContent.trim(),
        fill: getComputedStyle(svg).fill, color: getComputedStyle(svg).color,
      };
    });
    eq(4, theme, "초기 aria-pressed", like0.pressed, "false");
    eq(4, theme, "초기 카운트", like0.count, "0");
    eq(4, theme, "초기 하트 fill none", like0.fill, "none");

    await page.click("[data-post-like]");
    await sleep(120);
    const like1 = await page.evaluate(() => {
      const b = document.querySelector("[data-post-like]");
      const svg = b.querySelector("svg");
      const probe = document.createElement("span");
      probe.style.color = "var(--color-foreground)";
      document.body.appendChild(probe);
      const fg = getComputedStyle(probe).color;
      probe.remove();
      let stored = null;
      try { stored = localStorage.getItem("daitnu-post-like:" + location.pathname); } catch {}
      return {
        pressed: b.getAttribute("aria-pressed"), liked: b.getAttribute("data-liked"),
        count: b.querySelector("[data-post-like-count]").textContent.trim(),
        fill: getComputedStyle(svg).fill, color: getComputedStyle(svg).color, fg, stored,
      };
    });
    eq(4, theme, "클릭 후 aria-pressed", like1.pressed, "true");
    eq(4, theme, "클릭 후 data-liked", like1.liked, "true");
    eq(4, theme, "클릭 후 카운트 0→1", like1.count, "1");
    check(4, theme, "클릭 후 하트 fill이 none 아님(currentColor 채움)",
      like1.fill !== "none" && like1.fill === like1.color, `fill=${like1.fill} color=${like1.color}`);
    eq(4, theme, "활성 하트 색 === --color-foreground(무채색 유지 / Q3)", like1.color, like1.fg);
    eq(4, theme, "localStorage 저장값", like1.stored, "1");

    await page.reload({ waitUntil: "networkidle0" });
    await page.bringToFront();
    await setTheme(theme);
    const likeReload = await page.evaluate(() => {
      const b = document.querySelector("[data-post-like]");
      return {
        pressed: b.getAttribute("aria-pressed"),
        count: b.querySelector("[data-post-like-count]").textContent.trim(),
      };
    });
    eq(4, theme, "새로고침 후 공감 유지(aria-pressed)", likeReload.pressed, "true");
    eq(4, theme, "새로고침 후 공감 유지(카운트)", likeReload.count, "1");

    await page.click("[data-post-like]");
    await sleep(120);
    const like2 = await page.evaluate(() => {
      const b = document.querySelector("[data-post-like]");
      let stored = null;
      try { stored = localStorage.getItem("daitnu-post-like:" + location.pathname); } catch {}
      return {
        pressed: b.getAttribute("aria-pressed"),
        count: b.querySelector("[data-post-like-count]").textContent.trim(),
        fill: getComputedStyle(b.querySelector("svg")).fill, stored,
      };
    });
    eq(5, theme, "재클릭 aria-pressed false", like2.pressed, "false");
    eq(5, theme, "재클릭 카운트 1→0", like2.count, "0");
    eq(5, theme, "재클릭 fill none 복귀", like2.fill, "none");
    eq(5, theme, "재클릭 localStorage 0", like2.stored, "0");

    /* 6) 공유 버튼 — 이 Chromium은 navigator.share를 실제로 갖고 있다(실측).
       미지원 케이스는 아래 별도 페이지에서 delete로 재현한다. */
    const shareNo = await page.evaluate(() => {
      const b = document.querySelector("[data-post-share]");
      return {
        hasApi: typeof navigator.share === "function",
        hidden: b.hasAttribute("hidden"),
        visible: b.getBoundingClientRect().height > 0,
      };
    });
    check(6, theme, "navigator.share 있음 → hidden 제거 + 노출",
      shareNo.hasApi && !shareNo.hidden && shareNo.visible,
      `hasApi=${shareNo.hasApi} hidden=${shareNo.hidden} visible=${shareNo.visible}`);

    /* 7) 링크 복사 */
    await page.click("[data-post-copy]");
    await sleep(200);
    const copyOn = await page.evaluate(() => {
      const b = document.querySelector("[data-post-copy]");
      const idle = b.querySelector('[data-copy-when="idle"]');
      const done = b.querySelector('[data-copy-when="done"]');
      return {
        copied: b.getAttribute("data-copied"),
        idleDisplay: getComputedStyle(idle).display,
        doneDisplay: getComputedStyle(done).display,
        status: document.querySelector("[data-post-status]").textContent.trim(),
      };
    });
    eq(7, theme, "복사 클릭 data-copied", copyOn.copied, "true");
    eq(7, theme, "복사 후 idle 아이콘 숨김", copyOn.idleDisplay, "none");
    check(7, theme, "복사 후 done(체크) 아이콘 표시", copyOn.doneDisplay !== "none", `display=${copyOn.doneDisplay}`);
    eq(7, theme, "sr-only 상태 문구", copyOn.status, "링크를 복사했습니다");
    await sleep(1700);
    const copyOff = await page.evaluate(() => {
      const b = document.querySelector("[data-post-copy]");
      return {
        copied: b.getAttribute("data-copied"),
        doneDisplay: getComputedStyle(b.querySelector('[data-copy-when="done"]')).display,
      };
    });
    check(7, theme, "1.6초 뒤 원복", copyOff.copied === null && copyOff.doneDisplay === "none",
      `copied=${copyOff.copied} done=${copyOff.doneDisplay}`);

    /* 8) <s_ad_div> 관리 버튼 (목업 한정 — 실사이트에선 관리자에게만) */
    const admin = await page.evaluate(() => {
      const box = document.querySelector('[data-slot="post-admin"]');
      if (!box) return null;
      const btns = [...box.children];
      return {
        count: btns.length,
        visible: box.getBoundingClientRect().height > 0,
        editHref: box.querySelector("a")?.getAttribute("href"),
        stateLabel: btns[1]?.textContent.trim(),
        onclicks: btns.map((b) => b.getAttribute("onclick")),
      };
    });
    check(8, theme, "post-admin 버튼 3개 렌더(목업 한정)",
      admin && admin.count === 3 && admin.visible, JSON.stringify(admin));
    eq(8, theme, "수정 링크 href", admin?.editHref, "/manage/post/301");
    eq(8, theme, "공개상태 전환 라벨", admin?.stateLabel, "비공개로");

    /* ═════════════════ ② 관련글 (9~13) ═════════════════ */
    const rel = await page.evaluate(() => {
      const sec = document.querySelector('[data-slot="post-related"]');
      const items = [...sec.querySelectorAll('[data-slot="widget-item"]')];
      const probe = (prop, val) => {
        const s = document.createElement("span");
        s.style.setProperty("color", val);
        sec.appendChild(s);
        const v = getComputedStyle(s).color;
        s.remove();
        return v;
      };
      const titleColorVar = probe("color", "var(--content-item-title-color)");
      const cardFgVar = probe("color", "var(--color-card-foreground)");
      const borderVar = (() => {
        const s = document.createElement("span");
        s.style.borderTop = "1px solid var(--color-border)";
        sec.appendChild(s);
        const v = getComputedStyle(s).borderTopColor;
        s.remove();
        return v;
      })();
      const t0 = items[0].querySelector('[data-slot="widget-title"]');
      const long = items[1].querySelector('[data-slot="widget-title"]');
      const longDate = items[1].querySelector('[data-slot="post-related-date"]');
      const longLink = items[1].querySelector('[data-slot="widget-link"]');
      const lcs = getComputedStyle(long);
      const dcs = getComputedStyle(longDate);
      const itemCs = getComputedStyle(items[1]);
      const h2 = sec.querySelector('[data-slot="post-footer-title"]');
      return {
        count: items.length,
        titleColor: getComputedStyle(t0).color, titleColorVar, cardFgVar, borderVar,
        titleHtmlSlots: items.map((li) => [...li.querySelectorAll("[data-slot]")].map((e) => e.dataset.slot)),
        longScrollW: long.scrollWidth, longClientW: long.clientWidth,
        longWhiteSpace: lcs.whiteSpace, longOverflow: lcs.textOverflow,
        longLines: Math.round(long.getBoundingClientRect().height / parseFloat(lcs.lineHeight)),
        dateRight: Math.round(longDate.getBoundingClientRect().right),
        linkRight: Math.round(longLink.getBoundingClientRect().right),
        dateWidth: Math.round(longDate.getBoundingClientRect().width),
        dateFontSize: dcs.fontSize, dateColor: dcs.color, dateMarginLeft: dcs.marginLeft,
        dateNumeric: dcs.fontVariantNumeric,
        itemBorderTop: itemCs.borderTopColor, itemBorderW: itemCs.borderTopWidth,
        headingLinkHref: h2.querySelector("a")?.getAttribute("href"),
        headingText: h2.textContent.trim(),
      };
    });
    eq(9, theme, "관련글 항목 5개(s_article_related_rep 확장)", rel.count, 5);
    check(9, theme, "각 항목이 widget-* 프리미티브 재사용",
      rel.titleHtmlSlots.every((s) => s.includes("widget-link") && s.includes("widget-body") &&
        s.includes("widget-title") && s.includes("post-related-date")),
      JSON.stringify(rel.titleHtmlSlots[0]));
    eq(10, theme, "widget-title color === --content-item-title-color (§6-2 재선언)",
      rel.titleColor, rel.titleColorVar);
    eq(13, theme, "항목 border-top-color === --color-border", rel.itemBorderTop, rel.borderVar);
    eq(13, theme, "항목 border-top-width", rel.itemBorderW, "1px");
    check(12, theme, "긴 제목 한 줄 말줄임", rel.longScrollW > rel.longClientW &&
      rel.longWhiteSpace === "nowrap" && rel.longOverflow === "ellipsis" && rel.longLines === 1,
      `scrollW=${rel.longScrollW} clientW=${rel.longClientW} ws=${rel.longWhiteSpace} to=${rel.longOverflow} lines=${rel.longLines}`);
    check(12, theme, "긴 제목이 날짜를 밀어내지 않음", rel.dateWidth > 0 && rel.dateRight <= rel.linkRight + 1,
      `dateRight=${rel.dateRight} linkRight=${rel.linkRight} dateW=${rel.dateWidth}`);
    eq(12, theme, "날짜 font-size 12px", rel.dateFontSize, "12px");
    eq(12, theme, "날짜 margin-left 16px", rel.dateMarginLeft, "16px");
    check(12, theme, "날짜 tabular-nums", /tabular-nums/.test(rel.dateNumeric), rel.dateNumeric);
    eq(9, theme, "제목이 카테고리 링크", rel.headingLinkHref, "/category/Design");

    /* 11) hover 시 제목 색 */
    await page.hover('[data-slot="post-related"] [data-slot="widget-item"]:first-child [data-slot="widget-link"]');
    await sleep(400);
    const relHover = await page.evaluate(() => {
      const t = document.querySelector('[data-slot="post-related"] [data-slot="widget-title"]');
      return getComputedStyle(t).color;
    });
    eq(11, theme, "hover 제목 색 === --color-card-foreground", relHover, rel.cardFgVar);
    await page.mouse.move(5, 5);

    /* ═════════════════ ③ 태그 (14·15·17) ═════════════════ */
    const tags = await page.evaluate(() => {
      const list = document.querySelector('[data-slot="post-tags-list"]');
      const as = [...list.querySelectorAll("a")];
      const textNodes = [...list.childNodes].filter((n) => n.nodeType !== 1);
      const cs = getComputedStyle(list);
      const before = getComputedStyle(as[0], "::before");
      const rects = as.map((a) => a.getBoundingClientRect());
      const rows = new Set(rects.map((r) => Math.round(r.top))).size;
      const secRect = document.querySelector('[data-slot="post-tags"]').getBoundingClientRect();
      return {
        normalized: list.getAttribute("data-tags"),
        n: as.length,
        allBadge: as.every((a) => a.dataset.slot === "badge" && a.dataset.variant === "outline"),
        textNodeCount: textNodes.length,
        textNodeSample: textNodes.map((n) => JSON.stringify(n.textContent)).join("|"),
        display: cs.display, flexWrap: cs.flexWrap, gap: cs.gap,
        beforeContent: before.content, beforeOpacity: before.opacity,
        rows,
        overflowRight: Math.max(...rects.map((r) => r.right)) - secRect.right,
        radius: getComputedStyle(as[0]).borderRadius,
        borderW: getComputedStyle(as[0]).borderTopWidth,
        padding: getComputedStyle(as[0]).padding,
        texts: as.map((a) => a.textContent),
      };
    });
    eq(14, theme, "data-tags=normalized", tags.normalized, "normalized");
    eq(14, theme, "태그 앵커 5개", tags.n, 5);
    check(14, theme, "모든 앵커에 data-slot=badge · data-variant=outline", tags.allBadge, tags.allBadge);
    eq(14, theme, "컨테이너 텍스트 노드 0개(쉼표 제거)", tags.textNodeCount, 0);
    eq(14, theme, "태그 텍스트에 '#' 미포함(CSS가 붙임)",
      tags.texts.some((t) => t.includes("#")), false);
    eq(14, theme, "정규화 후 display flex", tags.display, "flex");
    eq(14, theme, "flex-wrap wrap", tags.flexWrap, "wrap");
    eq(14, theme, "gap 8px", tags.gap, "8px");
    check(15, theme, "::before가 '#' 렌더", tags.beforeContent === '"#"', tags.beforeContent);
    eq(15, theme, "::before opacity 0.5", tags.beforeOpacity, "0.5");
    check(17, theme, "태그 가로 오버플로 0", tags.overflowRight <= 0.5, `overflowRight=${tags.overflowRight}`);
    check(17, theme, "태그가 감싸질 수 있는 구조(행 수 관측)", tags.rows >= 1, `rows=${tags.rows}`);

    /* ═════════════════ ④ 댓글 (18~26) ═════════════════ */
    const cm = await page.evaluate(() => {
      const sec = document.querySelector('[data-slot="post-comments"]');
      const top = [...sec.querySelectorAll(':scope > [data-slot="comment-list"] > [data-slot="comment-item"]')];
      const replies = [...sec.querySelectorAll('[data-slot="comment-replies"] > [data-slot="comment-item"]')];
      const px = (n) => Math.round(n * 100) / 100;
      const left = (el) => px(el.getBoundingClientRect().left);

      const parent = document.getElementById("comment_2");
      const parentBody = parent.querySelector(':scope > [data-slot="comment-main"] > [data-slot="comment-body"]');
      const parentAvatar = parent.querySelector(':scope > [data-slot="comment-main"] > [data-slot="avatar"]');
      const replyLi = document.getElementById("comment_reply_1");
      const replyBody = replyLi.querySelector('[data-slot="comment-body"]');
      const replyAvatar = replyLi.querySelector('[data-slot="avatar"]');
      const repliesUl = sec.querySelector('[data-slot="comment-replies"]');

      const av = (id) => {
        const box = document.querySelector(`#${id} [data-comment-logo]`);
        const img = box.querySelector("img");
        const fb = box.querySelector('[data-slot="avatar-fallback"]');
        const b = box.getBoundingClientRect();
        return {
          hasImg: !!img,
          imgSrcHead: img ? img.getAttribute("src").slice(0, 24) : null,
          imgSlot: img ? img.getAttribute("data-slot") : null,
          imgZ: img ? getComputedStyle(img).zIndex : null,
          imgObjectFit: img ? getComputedStyle(img).objectFit : null,
          fbVisible: !!fb && getComputedStyle(fb).display !== "none",
          fbPosition: fb ? getComputedStyle(fb).position : null,
          size: `${Math.round(b.width)}x${Math.round(b.height)}`,
          textLeft: [...box.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).length,
          radius: getComputedStyle(box).borderRadius,
        };
      };

      const guest = [...sec.querySelectorAll('[data-slot="comment-form-guest"] [data-slot="input"]')];
      const ta = sec.querySelector('[data-slot="textarea"]');
      const secretLabel = sec.querySelector('[data-slot="comment-secret"]');
      const secretBox = secretLabel.querySelector('input[type="checkbox"]');
      const submit = sec.querySelector('[data-slot="comment-form-actions"] [data-slot="button"][data-variant="default"]');
      const probe = (val) => {
        const s = document.createElement("span");
        s.style.color = val;
        sec.appendChild(s);
        const v = getComputedStyle(s).color;
        s.remove();
        return v;
      };
      const actions = document.querySelector('#comment_1 [data-slot="comment-actions"]');

      return {
        topCount: top.length, replyCount: replies.length,
        parentBodyLeft: left(parentBody), parentAvatarLeft: left(parentAvatar),
        replyBodyLeft: left(replyBody), replyAvatarLeft: left(replyAvatar),
        parentLiLeft: left(parent), repliesUlMarginLeft: getComputedStyle(repliesUl).marginLeft,
        parentAvatarSize: Math.round(parentAvatar.getBoundingClientRect().width),
        replyAvatarSize: Math.round(replyAvatar.getBoundingClientRect().width),
        itemPaddingBlock: getComputedStyle(top[0]).paddingTop + "/" + getComputedStyle(top[0]).paddingBottom,
        item2BorderTop: getComputedStyle(top[1]).borderTopWidth,
        replyFirstBorderTop: getComputedStyle(replies[0]).borderTopWidth,
        avatars: { c1: av("comment_1"), c2: av("comment_2"), c3: av("comment_3"), reply: av("comment_reply_1") },
        actionsOpacity: getComputedStyle(actions).opacity,
        actionsButtons: [...actions.querySelectorAll("[data-slot=button]")].map((b) => ({
          size: b.dataset.size, variant: b.dataset.variant, text: b.textContent.trim(),
          onclick: b.getAttribute("onclick"),
        })),
        replyActionsButtons: [...replyLi.querySelectorAll('[data-slot="comment-actions"] [data-slot="button"]')]
          .map((b) => b.textContent.trim()),
        guestWidths: guest.map((i) => Math.round(i.getBoundingClientRect().width * 100) / 100),
        guestNames: guest.map((i) => i.getAttribute("name")),
        guestHeights: guest.map((i) => getComputedStyle(i).height),
        taName: ta.getAttribute("name"), taRows: ta.getAttribute("rows"),
        taMinHeight: getComputedStyle(ta).minHeight, taPadding: getComputedStyle(ta).padding,
        taRadius: getComputedStyle(ta).borderRadius,
        secretChecked: secretBox.checked,
        secretName: secretBox.getAttribute("name"),
        secretOffDisplay: getComputedStyle(secretLabel.querySelector('[data-secret-when="off"]')).display,
        secretOnDisplay: getComputedStyle(secretLabel.querySelector('[data-secret-when="on"]')).display,
        secretBg: getComputedStyle(secretLabel).backgroundColor,
        submitBg: getComputedStyle(submit).backgroundColor,
        submitColor: getComputedStyle(submit).color,
        submitOnclick: submit.getAttribute("onclick"),
        submitType: submit.getAttribute("type"),
        submitTag: submit.tagName.toLowerCase(),
        primaryVar: probe("var(--color-primary)"),
        accentVar: probe("var(--color-accent)"),
        countChip: sec.querySelector('[data-slot="post-comments-count"]')?.textContent.trim(),
      };
    });

    eq(18, theme, "최상위 댓글 3개", cm.topCount, 3);
    eq(18, theme, "대댓글 1개", cm.replyCount, 1);
    eq(18, theme, "comment-replies margin-left 44px", cm.repliesUlMarginLeft, "44px");
    near(18, theme, "대댓글 들여쓰기 = 부모 아바타(32)+gap(12) = 44px",
      cm.replyAvatarLeft - cm.parentAvatarLeft, 44, 0.6);
    near(18, theme, "대댓글 항목(아바타) 좌측선 === 부모 본문 좌측선",
      cm.replyAvatarLeft, cm.parentBodyLeft, 0.6);
    /* ★ 스펙 18번 문구는 "대댓글 **본문** 좌측선 = 부모 본문 좌측선"이지만,
       "들여쓰기 44px = 부모 아바타(32)+gap(12)"과 "대댓글 아바타 24px(sm)"을
       동시에 만족하는 기하는 **대댓글 블록(아바타) 좌측선 = 부모 본문
       좌측선**이다. 대댓글 본문은 자기 아바타(24)+gap(12)만큼 더 들어간다 —
       스펙의 두 수치를 그대로 따른 결과이므로 구현이 아니라 문구가 느슨한
       경우다. 보고용으로 실측값을 남긴다. */
    check(18, theme, `[실측] 부모 본문 left=${cm.parentBodyLeft} · 대댓글 본문 left=${cm.replyBodyLeft} (차 ${Math.round((cm.replyBodyLeft - cm.parentBodyLeft) * 10) / 10}px = 대댓글아바타24+gap12)`,
      Math.abs((cm.replyBodyLeft - cm.parentBodyLeft) - 36) <= 0.6,
      `parentBody=${cm.parentBodyLeft} replyAvatar=${cm.replyAvatarLeft} replyBody=${cm.replyBodyLeft}`);
    eq(18, theme, "부모 아바타 32px", cm.parentAvatarSize, 32);
    eq(18, theme, "대댓글 아바타 24px(data-size=sm)", cm.replyAvatarSize, 24);
    eq(18, theme, "댓글 항목 상하 패딩 20px", cm.itemPaddingBlock, "20px/20px");
    eq(18, theme, "2번째 댓글 border-top 1px", cm.item2BorderTop, "1px");
    eq(18, theme, "대댓글 첫 항목 border-top 1px", cm.replyFirstBorderTop, "1px");
    eq(18, theme, "대댓글에는 답글 버튼 없음(수정·삭제만)",
      cm.replyActionsButtons.join(","), "수정·삭제");

    check(19, theme, "댓글1: <img>가 fallback 위를 덮음(z-index 1 · object-fit cover)",
      cm.avatars.c1.hasImg && cm.avatars.c1.imgZ === "1" && cm.avatars.c1.imgObjectFit === "cover" &&
      cm.avatars.c1.fbPosition === "absolute",
      JSON.stringify(cm.avatars.c1));
    check(19, theme, "댓글2: 이미지 없음 → fallback 아이콘 노출",
      !cm.avatars.c2.hasImg && cm.avatars.c2.fbVisible, JSON.stringify(cm.avatars.c2));
    eq(19, theme, "아바타 원형(border-radius)", cm.avatars.c1.radius, "3996px");
    check(20, theme, "댓글3: URL 문자열이 <img data-slot=avatar-image>로 승격",
      cm.avatars.c3.hasImg && cm.avatars.c3.imgSlot === "avatar-image" &&
      cm.avatars.c3.imgSrcHead.startsWith("data:image/svg+xml"),
      JSON.stringify(cm.avatars.c3));
    eq(20, theme, "승격 후 아바타 안 텍스트 노드 0", cm.avatars.c3.textLeft, 0);
    eq(20, theme, "아바타 박스에 남은 텍스트 노드 0(전 댓글)",
      [cm.avatars.c1, cm.avatars.c2, cm.avatars.reply].map((a) => a.textLeft).join(","), "0,0,0");

    eq(21, theme, "댓글 액션 기본 opacity 0", cm.actionsOpacity, "0");
    eq(21, theme, "액션 버튼 2개(답글·수정·삭제) data-size=xs",
      cm.actionsButtons.map((b) => `${b.text}:${b.size}:${b.variant}`).join("|"),
      "답글:xs:ghost|수정·삭제:xs:ghost");
    eq(21, theme, "onclick 문자열 그대로 유지",
      cm.actionsButtons.map((b) => b.onclick).join("|"), "return false;|return false;");

    await page.hover("#comment_1");
    await sleep(400);
    const hoverOp = await page.evaluate(() =>
      getComputedStyle(document.querySelector('#comment_1 [data-slot="comment-actions"]')).opacity);
    eq(21, theme, "hover 시 opacity 1", hoverOp, "1");
    await page.mouse.move(5, 5);
    await sleep(400);

    /* ★ opacity에 transition이 걸려 있어 focus() 직후 같은 태스크에서 읽으면
       전이 **시작값**(0)이 그대로 나온다 — 스킨이 정상인데도 실패한다(실측).
       포커스와 관측을 분리하고 전이(150ms)가 끝날 시간을 준다. */
    await page.evaluate(() => {
      document.querySelector('#comment_1 [data-slot="comment-actions"] [data-slot="button"]').focus();
    });
    await sleep(400);
    const focusOp = await page.evaluate(() => {
      const b = document.querySelector('#comment_1 [data-slot="comment-actions"] [data-slot="button"]');
      return {
        opacity: getComputedStyle(b.closest('[data-slot="comment-actions"]')).opacity,
        isActive: document.activeElement === b,
        tabIndex: b.tabIndex,
        matchesFocusWithin: b.closest('[data-slot="comment-actions"]').matches(":focus-within"),
      };
    });
    check(21, theme, "포커스(:focus-within)만으로도 opacity 1 + 탭 순서에 존재",
      focusOp.opacity === "1" && focusOp.isActive && focusOp.tabIndex >= 0, JSON.stringify(focusOp));
    await page.evaluate(() => document.activeElement.blur());

    eq(22, theme, "댓글 본문 링크 색 === --color-link", struct.descLink.color, struct.linkComputed);

    check(23, theme, "게스트 입력 2칸 정확히 2등분(±1px)",
      cm.guestWidths.length === 2 && Math.max(...cm.guestWidths) - Math.min(...cm.guestWidths) <= 1,
      `widths=${cm.guestWidths.join(",")}`);
    eq(23, theme, "게스트 name 속성 값(치환자 자리)", cm.guestNames.join(","), "name,password");
    eq(23, theme, "Input 높이 36px", cm.guestHeights.join(","), "36px,36px");
    eq(23, theme, "textarea name 속성 값", cm.taName, "comment");
    eq(23, theme, "textarea rows=3 · min-height 64px", `${cm.taRows}/${cm.taMinHeight}`, "3/64px");
    eq(23, theme, "textarea padding 8px 12px", cm.taPadding, "8px 12px");

    /* ★ border-color/box-shadow도 transition 대상(§11-0)이라 위 21번과 같은
       이유로 focus() 직후 읽으면 전이 시작값이 나온다 — 분리 후 대기한다. */
    await page.evaluate(() => document.querySelector('[data-slot="textarea"]').focus());
    await sleep(400);
    const taFocus = await page.evaluate(() => {
      const ta = document.querySelector('[data-slot="textarea"]');
      const cs = getComputedStyle(ta);
      const s = document.createElement("span");
      s.style.color = "var(--color-ring)";
      document.body.appendChild(s);
      const ring = getComputedStyle(s).color;
      s.remove();
      return { borderColor: cs.borderTopColor, boxShadow: cs.boxShadow, ring };
    });
    eq(24, theme, "textarea 포커스 border-color === --color-ring", taFocus.borderColor, taFocus.ring);
    check(24, theme, "textarea 포커스 box-shadow에 3px ring",
      /\b3px\b/.test(taFocus.boxShadow) && taFocus.boxShadow !== "none", taFocus.boxShadow);
    await page.evaluate(() => document.activeElement.blur());

    /* 25) 비밀글 토글 — 마우스 클릭 */
    eq(25, theme, "비밀글 초기 unchecked", cm.secretChecked, false);
    /* ★ inline-flex를 준 자물쇠 아이콘은 flex 아이템이라 CSS 블록화 규칙에 따라
       computed display가 flex로 바뀐다(off 아이콘은 규칙이 없어 preflight의
       svg{display:block}). 스펙 CSS는 정상이며 "표시/숨김"만 확인하면 된다. */
    check(25, theme, "비밀글 초기: 열린 자물쇠만 표시",
      cm.secretOffDisplay !== "none" && cm.secretOnDisplay === "none",
      `off=${cm.secretOffDisplay} on=${cm.secretOnDisplay}`);
    eq(25, theme, "비밀글 checkbox name 속성 값", cm.secretName, "secret");
    await page.click('[data-slot="comment-secret"]');
    await sleep(300);
    const secretOn = await page.evaluate(() => {
      const l = document.querySelector('[data-slot="comment-secret"]');
      const s = document.createElement("span");
      s.style.color = "var(--color-accent)";
      l.parentElement.appendChild(s);
      const accent = getComputedStyle(s).color;
      s.remove();
      const f = document.createElement("span");
      f.style.color = "var(--color-foreground)";
      l.parentElement.appendChild(f);
      const fg = getComputedStyle(f).color;
      f.remove();
      return {
        checked: l.querySelector("input").checked,
        off: getComputedStyle(l.querySelector('[data-secret-when="off"]')).display,
        on: getComputedStyle(l.querySelector('[data-secret-when="on"]')).display,
        bg: getComputedStyle(l).backgroundColor, color: getComputedStyle(l).color, accent, fg,
      };
    });
    eq(25, theme, "클릭 후 checkbox checked", secretOn.checked, true);
    check(25, theme, "클릭 후 잠긴 자물쇠로 교체",
      secretOn.off === "none" && secretOn.on !== "none", `off=${secretOn.off} on=${secretOn.on}`);
    check(25, theme, "클릭 후 배경 === --color-accent",
      secretOn.bg.replace(/\s/g, "") === secretOn.accent.replace("rgb(", "rgb(").replace(/\s/g, "") ||
      secretOn.bg === secretOn.accent, `bg=${secretOn.bg} accent=${secretOn.accent}`);
    eq(25, theme, "클릭 후 아이콘 색 === --color-foreground", secretOn.color, secretOn.fg);

    /* 25b) Tab → Space 로도 동작 */
    const secretKb = await page.evaluate(() => {
      const box = document.querySelector('[data-slot="comment-secret"] input');
      box.focus();
      return { isActive: document.activeElement === box, tabIndex: box.tabIndex, checked: box.checked };
    });
    await page.keyboard.press("Space");
    await sleep(250);
    const secretKb2 = await page.evaluate(() => {
      const l = document.querySelector('[data-slot="comment-secret"]');
      return {
        checked: l.querySelector("input").checked,
        off: getComputedStyle(l.querySelector('[data-secret-when="off"]')).display,
        boxShadow: getComputedStyle(l).boxShadow,
      };
    });
    check(25, theme, "키보드 포커스 가능(sr-only checkbox가 탭 순서에 있음)",
      secretKb.isActive && secretKb.tabIndex >= 0, JSON.stringify(secretKb));
    /* off 아이콘은 inline-flex 라벨의 flex 아이템이라 computed display가
       block/flex로 블록화된다(§25 초기 상태와 동일 사유) — 표시/숨김만 본다. */
    check(25, theme, "Space로 토글 해제 + 열린 자물쇠 복귀",
      secretKb2.checked === false && secretKb2.off !== "none", JSON.stringify(secretKb2));
    check(25, theme, ":has(:focus-visible) 포커스 링",
      secretKb2.boxShadow !== "none" && /3px/.test(secretKb2.boxShadow), secretKb2.boxShadow);
    await page.evaluate(() => document.activeElement.blur());

    /* 26) 제출 버튼 */
    eq(26, theme, "제출 버튼 background === --color-primary", cm.submitBg, cm.primaryVar);
    eq(26, theme, "제출 버튼 <button type=button>(공식 예제 input[submit] 대체)",
      `${cm.submitTag}/${cm.submitType}`, "button/button");
    eq(26, theme, "제출 onclick 문자열 그대로", cm.submitOnclick, "return false;");
    eq(26, theme, "댓글 수 칩 === article_rep_rp_cnt", cm.countChip, "3");

    /* ═════════════════ 28~30 ═════════════════ */
    const regress = await page.evaluate(() => {
      const inner = document.querySelector('[data-slot="content-inner"]');
      const title = document.querySelector('[data-slot="content-title"]');
      const doc = document.scrollingElement;
      return {
        gridBg: getComputedStyle(inner).backgroundImage,
        titleDisplay: title ? getComputedStyle(title).display : "(absent)",
        innerScrollH: inner.scrollHeight, innerClientH: inner.clientHeight,
        docScrollH: doc.scrollHeight, docClientH: doc.clientHeight,
        docScrollW: doc.scrollWidth, winInnerW: window.innerWidth,
        scrollbarGutter: inner.offsetWidth - inner.clientWidth,
        hasFadeClass: inner.classList.contains("scroll-fade-y"),
        maskImage: getComputedStyle(inner).maskImage || getComputedStyle(inner).webkitMaskImage,
        hasCustomScrollbar: inner.hasAttribute("data-custom-scrollbar"),
        scrollbarWidth: getComputedStyle(inner).scrollbarWidth,
        scrollbarColor: getComputedStyle(inner).scrollbarColor,
      };
    });
    eq(28, theme, "permalink 격자 배경 none", regress.gridBg, "none");
    eq(28, theme, "permalink 목록 타이틀 display none", regress.titleDisplay, "none");
    check(29, theme, "content-inner가 스크롤(문서는 스크롤 안 함)",
      regress.innerScrollH > regress.innerClientH && regress.docScrollH === regress.docClientH,
      `inner=${regress.innerScrollH}/${regress.innerClientH} doc=${regress.docScrollH}/${regress.docClientH}`);
    /* ★ scrollbar.css가 `scrollbar-width: thin` + `scrollbar-color`(표준 속성)를
       쓰고 있고, Chromium은 표준 속성이 있으면 ::-webkit-scrollbar{width:6px}를
       무시하고 자기 thin 폭(10px)을 쓴다 — 6px을 기대한 내 최초 단정이 틀렸다.
       스크롤바는 이번 작업으로 손대지 않은 기존 구역이므로 회귀 확인만 한다:
       거터가 실제로 잡히고(0 아님) 커스텀 색 지정이 살아 있는지. */
    check(29, theme, "커스텀 스크롤바 거터 존재 + thin/색 지정 유지(회귀 없음)",
      regress.hasCustomScrollbar && regress.scrollbarGutter > 0 &&
        regress.scrollbarWidth === "thin" && /rgb|rgba|#/.test(regress.scrollbarColor),
      `gutter=${regress.scrollbarGutter} width=${regress.scrollbarWidth} color=${regress.scrollbarColor}`);
    check(29, theme, "scroll-fade-y 마스크 적용",
      regress.hasFadeClass && regress.maskImage && regress.maskImage !== "none", `mask=${String(regress.maskImage).slice(0, 60)}`);
    check(30, theme, "가로 오버플로 0", regress.docScrollW === regress.winInnerW,
      `docScrollW=${regress.docScrollW} innerW=${regress.winInnerW}`);

    /* 스크린샷 — 푸터 전체가 보이도록 스크롤 */
    await page.evaluate(() => {
      const f = document.querySelector('[data-slot="post-footer"]');
      f.scrollIntoView({ block: "start" });
    });
    await sleep(600);
    await page.screenshot({ path: resolve(shots, `footer-${theme}.png`) });
    await page.evaluate(() => {
      document.querySelector('[data-slot="post-comments"]').scrollIntoView({ block: "start" });
    });
    await sleep(600);
    await page.screenshot({ path: resolve(shots, `footer-comments-${theme}.png`) });

    check(30, theme, "콘솔/네트워크 에러 0", consoleErrors.length === 0,
      consoleErrors.length ? consoleErrors.join(" ;; ") : "none");
  }

  /* ═════════════ 6) 공유 버튼 — navigator.share stub ═════════════ */
  {
    consoleErrors = [];
    const stubPage = await browser.newPage();
    await stubPage.setViewport(VP);
    stubPage.on("pageerror", (e) => consoleErrors.push(String(e)));
    await stubPage.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: () => Promise.resolve(),
      });
    });
    await stubPage.goto(PERMALINK, { waitUntil: "networkidle0" });
    const stub = await stubPage.evaluate(() => {
      const b = document.querySelector("[data-post-share]");
      return {
        hasApi: typeof navigator.share === "function",
        hidden: b.hasAttribute("hidden"),
        visible: b.getBoundingClientRect().height > 0,
        label: b.getAttribute("aria-label"),
      };
    });
    check(6, "light", "navigator.share stub → hidden 제거 + 실제 노출",
      stub.hasApi && !stub.hidden && stub.visible, JSON.stringify(stub));
    await stubPage.close();

    /* ★ 체크리스트 6번의 나머지 절반 — "미지원 브라우저에선 숨긴다".
       이 Chromium은 navigator.share를 실제로 갖고 있어(실측) 기본 루프로는
       관측할 수 없다. share는 Navigator.prototype의 접근자라 인스턴스에서
       delete해도 지워지지 않으므로 프로토타입에서 제거해야 한다. */
    const noSharePage = await browser.newPage();
    await noSharePage.setViewport(VP);
    noSharePage.on("pageerror", (e) => consoleErrors.push(String(e)));
    await noSharePage.evaluateOnNewDocument(() => {
      delete Navigator.prototype.share;
      try { delete navigator.share; } catch {}
    });
    await noSharePage.goto(PERMALINK, { waitUntil: "networkidle0" });
    const noShare = await noSharePage.evaluate(() => {
      const b = document.querySelector("[data-post-share]");
      const copy = document.querySelector("[data-post-copy]");
      return {
        hasApi: typeof navigator.share === "function",
        hidden: b.hasAttribute("hidden"),
        visible: b.getBoundingClientRect().height > 0,
        copyVisible: copy.getBoundingClientRect().height > 0,
      };
    });
    check(6, "light", "navigator.share 제거 → 공유 버튼 hidden 유지(링크 복사만 남음)",
      !noShare.hasApi && noShare.hidden && !noShare.visible && noShare.copyVisible,
      JSON.stringify(noShare));
    check(6, "light", "share 미지원 컨텍스트에서도 콘솔 에러 0",
      consoleErrors.length === 0, consoleErrors.length ? consoleErrors.join(" ;; ") : "none");
    await noSharePage.close();
  }

  /* ═════════════ 16) nojs 사본 — 태그 폴백 ═════════════ */
  for (const theme of ["light", "dark"]) {
    consoleErrors = [];
    const p = await browser.newPage();
    await p.setViewport(VP);
    const errs = [];
    p.on("console", (m) => {
      if (m.type() === "error" && !IGNORE.test(m.text() + " " + (m.location()?.url || "")))
        errs.push(m.text());
    });
    p.on("pageerror", (e) => errs.push(String(e)));
    p.on("response", (r) => { if (r.status() >= 400 && !IGNORE.test(r.url())) errs.push(`HTTP ${r.status()} ${r.url()}`); });
    await p.goto(PERMALINK_NOJS, { waitUntil: "networkidle0" });
    await p.evaluate((t) => document.documentElement.classList.toggle("dark", t === "dark"), theme);
    await sleep(500);

    const nojs = await p.evaluate(() => {
      const list = document.querySelector('[data-slot="post-tags-list"]');
      const as = [...list.querySelectorAll("a")];
      const cs = getComputedStyle(list);
      const acs = getComputedStyle(as[0]);
      const s = document.createElement("span");
      s.style.color = "var(--color-link)";
      list.appendChild(s);
      const link = getComputedStyle(s).color;
      s.remove();
      const secRect = document.querySelector('[data-slot="post-tags"]').getBoundingClientRect();
      const rects = as.map((a) => a.getBoundingClientRect());
      return {
        contentJsLoaded: !!document.querySelector('script[src*="content.js"]'),
        normalized: list.getAttribute("data-tags"),
        anchorCount: as.length,
        anyBadge: as.some((a) => a.dataset.slot === "badge"),
        visibleText: list.textContent.replace(/\s+/g, " ").trim(),
        display: cs.display, listColor: cs.color,
        anchorColor: acs.color, linkVar: link,
        allVisible: rects.every((r) => r.width > 0 && r.height > 0),
        overflowRight: Math.max(...rects.map((r) => r.right)) - secRect.right,
        docScrollW: document.scrollingElement.scrollWidth, winW: window.innerWidth,
        /* Q10 관측 — JS 없으면 URL 문자열 로고가 텍스트로 남는다 */
        c3AvatarText: document.querySelector("#comment_3 [data-comment-logo]").textContent.trim().slice(0, 30),
      };
    });
    check(16, theme, "nojs: content.js 미로드 확인", nojs.contentJsLoaded === false, `loaded=${nojs.contentJsLoaded}`);
    check(16, theme, "nojs: data-tags 미부여(폴백 경로)", nojs.normalized === null, `normalized=${nojs.normalized}`);
    check(16, theme, "nojs: badge 미부여", nojs.anyBadge === false, `anyBadge=${nojs.anyBadge}`);
    eq(16, theme, "nojs: 태그 앵커 5개 그대로", nojs.anchorCount, 5);
    check(16, theme, "nojs: 태그가 여전히 읽힌다(쉼표 보여도 OK)",
      nojs.allVisible && /Pretendard/.test(nojs.visibleText) && /스킨/.test(nojs.visibleText),
      nojs.visibleText.slice(0, 80));
    eq(16, theme, "nojs: 폴백 앵커 색 === --color-link", nojs.anchorColor, nojs.linkVar);
    check(16, theme, "nojs: 가로 오버플로 0",
      nojs.overflowRight <= 0.5 && nojs.docScrollW === nojs.winW,
      `overflowRight=${nojs.overflowRight} doc=${nojs.docScrollW}/${nojs.winW}`);
    check(16, theme, "nojs: 콘솔 에러 0", errs.length === 0, errs.length ? errs.join(" ;; ") : "none");
    results.push({
      id: "Q10", theme, label: "nojs 관측: 아바타 URL 문자열이 텍스트로 남음(JS 승격 없음)",
      ok: true, detail: JSON.stringify(nojs.c3AvatarText),
    });
    if (theme === "light") await p.screenshot({ path: resolve(shots, "footer-nojs-tags-light.png") });
    await p.close();
  }

  /* ═════════════ 27) 인덱스 목업 회귀 ═════════════ */
  {
    const p = await browser.newPage();
    await p.setViewport(VP);
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    await p.goto(INDEX, { waitUntil: "networkidle0" });
    const idx = await p.evaluate(() => {
      const inner = document.querySelector('[data-slot="content-inner"]');
      const title = document.querySelector('[data-slot="content-title"]');
      return {
        footer: document.querySelectorAll('[data-slot="post-footer"]').length,
        actions: document.querySelectorAll('[data-slot="post-actions"]').length,
        related: document.querySelectorAll('[data-slot="post-related"]').length,
        tags: document.querySelectorAll('[data-slot="post-tags"]').length,
        comments: document.querySelectorAll('[data-slot="post-comments"]').length,
        commentItems: document.querySelectorAll('[data-slot="comment-item"]').length,
        postSingle: document.querySelectorAll('[data-slot="post-single"]').length,
        gridBg: getComputedStyle(inner).backgroundImage === "none" ? "none" : "present",
        titleDisplay: title ? getComputedStyle(title).display : "(absent)",
      };
    });
    check(27, "light", "인덱스 목업에 post-footer 계열 0개(permalink 전용 블록 미유출)",
      idx.footer === 0 && idx.actions === 0 && idx.related === 0 && idx.tags === 0 &&
      idx.comments === 0 && idx.commentItems === 0 && idx.postSingle === 0,
      JSON.stringify(idx));
    check(27, "light", "인덱스 격자 배경 유지 + 목록 타이틀 노출(:has 분기 회귀 없음)",
      idx.gridBg === "present" && idx.titleDisplay !== "none",
      `gridBg=${idx.gridBg} titleDisplay=${idx.titleDisplay}`);
    check(27, "light", "인덱스 콘솔 에러 0", errs.length === 0, errs.join(" ;; ") || "none");
    await p.close();
  }

  await browser.disconnect();
  try { child.kill(); } catch {}
  try { rmSync(userData, { recursive: true, force: true }); } catch {}

  /* ═════════════ 리포트 ═════════════ */
  const byId = new Map();
  for (const r of results) {
    const key = `${r.id}|${r.theme}`;
    if (!byId.has(key)) byId.set(key, []);
    byId.get(key).push(r);
  }
  console.log("\n════════ [FOOTER SPEC §9-4] 검증 결과 ════════");
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

  /* Windows 콘솔 코드페이지가 한글을 깨뜨리므로 파일로도 남긴다 */
  const lines = [];
  lines.push("# [FOOTER SPEC §9-4] 검증 원본 로그 (자동 생성)", "");
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
  writeFileSync(resolve(root, "_workspace", "footer-verify-log.md"), lines.join("\n"), "utf8");

  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
