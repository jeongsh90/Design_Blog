Bun.serve({
  port: 8811,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file('.' + path);
    return new Response(file);
  },
});
console.log('serving on 8811');
