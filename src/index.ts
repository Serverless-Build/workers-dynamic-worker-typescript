const MARKER = 'SERVERLESS_BUILD_DYNAMIC_WORKER_TYPESCRIPT_V1';
const plugin = `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const text = url.searchParams.get('text') ?? 'Hello from a sandbox';
    return Response.json({ marker: '${MARKER}', transformed: text.toUpperCase(),
      runtime: 'A separate Dynamic Worker', outboundAccess: 'blocked' });
  }
}`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 });
    if (url.pathname === '/health') return Response.json({ ok: true, marker: MARKER });
    if (url.pathname === '/') return Response.json({ marker: MARKER, pattern: 'Dynamic Worker',
      endpoints: ['GET /run?text=...', 'GET /health'], capability: 'Worker Loader binding' });
    if (url.pathname !== '/run') return Response.json({ error: 'Not found' }, { status: 404 });
    if ((url.searchParams.get('text') ?? '').length > 200) return Response.json({ error: 'Text must be at most 200 characters' }, { status: 400 });
    // The ID is versioned with this exact code. No shared mutable request state.
    const worker = env.LOADER.get('uppercase-v1', async () => ({
      compatibilityDate: '2026-09-30', mainModule: 'plugin.js',
      modules: { 'plugin.js': plugin }, globalOutbound: null,
    }));
    return worker.getEntrypoint().fetch(request);
  },
} satisfies ExportedHandler<Env>;
