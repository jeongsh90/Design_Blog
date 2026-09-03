/**
 * 로컬 검증용 정적 서버.
 * file:// 에서는 Chromium이 document.cookie를 막아 쿠키 복원 검증이 불가능하므로,
 * Playwright 검증은 반드시 http://localhost 로 연다.
 *
 * 실행: bun dashboard-skin/tools/serve.mjs   → http://localhost:4321/
 */
import { resolve, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PORT = Number(process.env.PORT || 4321);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let path = decodeURIComponent(url.pathname);
    // 확장자 없는 경로(/category/Design 등)는 목업으로 폴백 —
    // 티스토리의 카테고리 URL에서 활성 표시가 붙는지 검증하기 위함.
    if (path === "/" || !/\.[a-z0-9]+$/i.test(path)) {
      path = "/_workspace/sidebar_mockup-preview.html";
    }
    const file = Bun.file(normalize(resolve(root, "." + path)));
    if (!(await file.exists())) return new Response("not found", { status: 404 });
    return new Response(file, {
      headers: { "cache-control": "no-store" },
    });
  },
});

console.log(`serving ${root} at http://localhost:${PORT}/`);
