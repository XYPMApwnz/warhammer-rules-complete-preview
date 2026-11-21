# Load-audit measurement review

Read-only methodological review, 21 November 2026. No browser, test or build was run and no repository file was changed. Installed Chrome executable metadata reports **154.0.8037.58**. The main audit must record the version actually launched and validate its exposed CDP protocol; source-main fields may be newer than this installed binary.

## One shared network budget

Page-only CDP emulation does not establish a whole-site cellular budget. Chromium's Network handler applies conditions using a DevTools token; a service-worker target is constructed with its worker token. Two independent target sessions therefore must not be assumed to share one bandwidth budget. Enabling the same 9 Mbps on both can leave aggregate throughput above 9 Mbps. The current request interceptor fairly apportions its own budget among its active records, but that alone does not prove sharing across distinct profiles. [Network handler](https://github.com/chromium/chromium/blob/main/content/browser/devtools/protocol/network_handler.cc), [service-worker target](https://github.com/chromium/chromium/blob/main/content/browser/devtools/service_worker_devtools_agent_host.cc), [interceptor implementation](https://github.com/chromium/chromium/blob/main/services/network/throttling/throttling_network_interceptor.cc).

For this audit, prefer the proposed **one CONNECT proxy with an aggregate downstream token bucket** shared by all of the trial's tunnels. Preserve the origin's end-to-end TLS and HTTP/2, headers and response compression. Set no additional CDP bandwidth or latency emulation. Use one active trial/context at a time; otherwise one trial steals another's budget. Chromium's proxy must cover both page and service-worker traffic. Local-loopback proxy bypass must be explicitly disabled for the local origin when the same proxy is used there.

For simulated RTT, delay the delivery of upstream and downstream encrypted chunks by half the configured RTT each. Queue each chunk with a ready time; do not synchronously wait a full RTT after every chunk. Apply the shared bandwidth tokens after the downstream ready time, with bounded fair writes and real socket backpressure. Record actual downstream wire bytes separately from compressed HTTP body bytes: TLS, HTTP/2 and headers consume capacity too.

This differs slightly from the old local audit, whose server delayed each response and limited HTTP body bytes. Keep the same nominal Fast 4G 9,000,000 bit/s and 170 ms and label the improved transport method explicitly. A newly measured change from the old 22.75 seconds is not purely an application speedup unless the prior method is replayed as a control.

## Calibration before the real matrix

1. Establish an unthrottled baseline for one sufficiently large known immutable response.
2. At both 9 Mbps and 1.6 Mbps, download one known incompressible response; record proxy downstream bytes and elapsed time. Allow for handshake/RTT overhead rather than attributing it to application JavaScript.
3. Repeat with simultaneous transfers initiated by a page and a service worker, using separate immutable URLs. Their **combined** steady-state wire throughput must remain near the one configured cap, not twice the cap. Retain per-tunnel and aggregate counters.
4. Check compression and response hashes against the accepted package without recording roster contents. Distinguish the origin response body from the bytes arriving through the TLS tunnel.
5. Run all measurements sequentially in fresh contexts. The warm measurement reuses only its own completed cold context, with active SW and unchanged storage. Do not clear cache before that warm measurement.

## Capture service-worker network activity before precache

Use a raw browser CDP connection in addition to Playwright's page CDP session. One straightforward implementation is to spawn headless Chrome with a task-owned profile and `--remote-debugging-port=0`, read `DevToolsActivePort` or `/json/version`, and use:

- `chromium.connectOverCDP(...)` for normal Playwright navigation and locators;
- a separate native Node WebSocket connected to `webSocketDebuggerUrl` for flattened child CDP sessions.

`launchServer().wsEndpoint()` is a Playwright RPC endpoint, not the browser CDP endpoint. Do not send CDP messages to it. Public Playwright page `CDPSession.send()` has no child-session routing argument, so a raw flattened connection avoids dependence on private Playwright internals.

Register the raw event handler before enabling auto-attach:

```js
await send('Target.setAutoAttach', {
  autoAttach: true,
  waitForDebuggerOnStart: true,
  flatten: true,
  filter: [{type: 'service_worker', exclude: false}, {exclude: true}]
});
```

On each `Target.attachedToTarget`, send messages with the event's top-level `sessionId`. Enable `Network` and `Runtime`, then promptly call `Runtime.runIfWaitingForDebugger`. This captures install-time fetches before worker application JavaScript runs. Keep the pause/setup duration in the harness record; it is measurement overhead. Use the page session for page requests. If several contexts coexist, filter by `targetInfo.browserContextId`; one active trial makes the bookkeeping simpler. [Target auto-attach protocol](https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-setAutoAttach).

Each request key needs target/session ID plus request ID; preserve redirect hops. Different requests to the same URL are often the very duplicates the audit needs to identify. Never collapse them by URL.

The installed Playwright 1.61.1 code creates a separate network manager for service workers (`playwright-core/lib/coreBundle.js`, approximately lines 37588–37616). Its offline operation calls `Network.emulateNetworkConditions` with zero latency and unlimited throughput (approximately lines 35645–35664). Avoid toggling `context.setOffline()` during throttled timing trials because that can reset custom CDP conditions. Proxy shaping remains independent of those CDP calls.

## Bytes, cache and duplicate accounting

Keep at least three measures with honest labels:

1. **HTTP encoded body bytes:** compressed payload, excluding headers/TLS.
2. **Decoded body bytes:** the resource bytes after HTTP decoding.
3. **Network/wire bytes:** protocol and TLS overhead included where observed by the proxy.

`Network.loadingFinished.encodedDataLength` is total encoded request data, not a guaranteed body-only count. Current Chromium browser-side completion also emits `encodedBodyLength`; detect it in the running browser rather than assuming the installed Playwright protocol typings list every new field. The Network handler forwards completion status's encoded total and body lengths separately. [Completion source](https://github.com/chromium/chromium/blob/main/content/browser/devtools/protocol/network_handler.cc#L3407-L3432), [CDP Network protocol](https://chromedevtools.github.io/devtools-protocol/tot/Network/).

If the body-only field is unavailable, an actual response `Content-Length` can establish a completed body size when appropriate. The audit pilot demonstrated that `Network.dataReceived.encodedDataLength` may include HTTP/2 frame overhead: it is not a strict body-only fallback. Worker Resource Timing can supplement it. Do not blindly subtract a response's early `encodedDataLength` from the final total as though the early value were always headers alone. Some browser-side worker paths may omit body-chunk events. Preserve the chosen byte source per request, plus a clearly named fallback/unknown state.

For 304 responses, body transfer is zero even if `Content-Length` describes the cached representation. For disk/memory cache or a page response supplied by SW, count zero new network body bytes for that wrapper. Count the actual worker fetch separately if it reached the network. A SW-served page resource and its worker network request are two observable events but not two downloads. Store both for attribution; calculate the unique actual network total from the underlying network legs.

For a full immutable successful static resource, the accepted package manifest gives an independent decoded-byte size and SHA. Keep this distinct from a directly measured decoded-body count, especially for partial/failed/redirect responses. Saving `Network.getResponseBody()` for every large file can add copying/parsing overhead and is unnecessary just to obtain sizes.

Resource Timing `transferSize` is not a precise header-byte measurement. Preserve raw CDP and timing records so a reviewer can reconstruct the selected totals. Same-origin worker Resource Timing can supplement missing byte fields; increase resource timing buffers early enough to retain all precache entries.

## Readiness and clocks

Observe FCP independently from useful UI readiness: FCP may be the initial Loading screen. If the root page redirects into V2, retain the navigation chain and state which document's paint is reported. Home readiness should prove the actual nine-book controls are rendered and interactive; book readiness should prove the requested book and content view; imported roster readiness should prove a saved nonempty DG roster after the public import action.

For offline-ready, require the accepted SW to be activated and mandatory precache completeness, not merely a registration or an active worker from an earlier context. Record the first instant the UI becomes useful separately from final background network quiet. Use CDP monotonic timestamps or request `wallTime` anchors to align page and worker timelines; do not sum timestamps from unrelated `performance.timeOrigin` values without alignment.

The proxy's one shared cap, calibration observations and all measured method caveats should accompany the median-of-three tables. Desktop CPU with a 390-pixel mobile browser profile is not a physical-phone CPU benchmark and does not certify Safari performance.

## Completed-pilot NetLog validation

This follow-up parsed already completed pilot profiles only; it did not launch a browser or change application code. `parse-netlog-requests.mjs` counts actual HTTP transactions from request-level `HTTP_TRANSACTION_HTTP2_SEND_REQUEST_HEADERS` / H1 send-header events on `URL_REQUEST` sources. It excludes socket CONNECT handshakes, cache-only URL request attempts and duplicate HTTP2-session header events. `Number(event.time) + Number(constants.timeTickOffset)` gives epoch milliseconds for the row's `[startedEpoch, startedEpoch + totalMs)` boundary. No `devtools_request_id` key was found in these Chrome 154 Default NetLogs, so it is unsafe to equate a NetLog source ID with a CDP request ID.

For H2 payload bytes, the parser joins `HTTP_STREAM_REQUEST_BOUND_TO_JOB` to `HTTP2_SESSION_SEND_HEADERS` by the stream-job source dependency, then sums `HTTP2_SESSION_RECV_DATA.params.size` for that exact session/stream pair. These are DATA payload bytes without the nine-byte frame headers. This also covers zero-copy uncompressed images, which can omit `URL_REQUEST_JOB_BYTES_READ`. It is metadata accounting, not a decoded response-body fetch. All completed pilot body sizes matched Content-Length; decoded `URL_REQUEST_JOB_FILTERED_BYTES_READ` (or identity payload size) also matched the local origin server and CDP body accounting.

| Pilot v2 | Actual network requests | Encoded body bytes | Decoded bytes | Count comparison |
| --- | ---: | ---: | ---: | --- |
| Local cold | 296 | 2,737,161 | 6,451,996 | CDP and local server match |
| Local warm | 14 | 33,098 | 150,393 | CDP and local server match |
| Live cold | 296 | 2,756,413 | 6,461,111 | CDP matches |
| Live warm | 15 | 33,554 | 150,393 | CDP sees 13; NetLog adds two zero-body 304 checks |

The live warm browser-owned checks were `service-worker.js` (send +93 ms, response/end +167 ms) and `glossary/generated/cache-revision.js` (send +169 ms, response +240 ms, end +241 ms). The earlier local v1 pilot had the same two checks (16 actual HTTP requests versus 14 CDP) at +65/+80 ms. In all cases these extra requests have zero body bytes, so they change request counts, not the measured body total. Keep them in the waterfall and classify them as update/revalidation activity.

`NETLOG_PILOT_VALIDATION.json` retains the exact validation result. Raw profiles and NetLogs should remain external; publish only filtered origin records and selected safe response headers, without cookies, authorization headers or unrelated Chrome traffic.
