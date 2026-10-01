# Dynamic Worker — real Worker Loader binding

The parent Worker loads an uppercase plugin into a separate sandbox through `env.LOADER.get()`, then invokes its fetch entrypoint. The sandbox has no outbound network access and receives no storage or secret bindings. Application-level routing is covered separately by the App Routing pattern.

## Setup

Install Node.js 22+, run `npm install`, then `npm run check` to generate binding types, typecheck, and validate the Wrangler configuration. Start locally with `npm run dev`.

```sh
curl 'http://localhost:8787/run?text=hello'
```

The response contains `transformed: "HELLO"`, the sandbox runtime label, and a verification marker. Input is bounded to 200 characters. This public example executes one fixed plugin rather than accepting arbitrary user code.

## Availability and deployment

Dynamic Workers is in open beta. Add the `worker_loaders` binding in the included `wrangler.jsonc`; there is no namespace or bucket to create. Authenticate with `npx wrangler login`, then run `npm run deploy`. If your account's deployment is rejected because the capability is unavailable, consult the current [Dynamic Workers guide](https://developers.cloudflare.com/dynamic-workers/getting-started/) and request access through the linked Cloudflare channels before retrying. A temporary deployment is offered only after the temporary-account capability is independently verified.

The parent is TypeScript; the plugin source is JavaScript because Loader does not transpile TypeScript. Python and Wasm are also supported module formats, but are distinct packaging examples rather than language labels on this code.

## Production fit

Version the cache ID with the code; `get(id, callback)` may reuse a warm Worker. Use `load()` for a fresh one-shot Worker. Grant only required bindings, keep `globalOutbound: null` unless network access is deliberate, and use the current API's resource limits when executing untrusted code.

## Pattern and live demo

- [Pattern page](https://serverless.build/patterns/dynamic-worker)
- [Live deployment](https://workers-dynamic-worker-typescript.dwarven.workers.dev)
