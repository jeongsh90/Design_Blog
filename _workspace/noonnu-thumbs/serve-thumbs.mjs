Bun.serve({
  port: 8811,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname === '/' ? '/index.html' : url.pathname;
    let filePath = path.startsWith('/draft/') ? '../noonnu-drafts/' + path.slice('/draft/'.length) : '.' + path;
    const file = Bun.file(filePath);
    return new Response(file, { headers: { 'Access-Control-Allow-Origin': '*' } });
  },
});
console.log('serving on 8811');
