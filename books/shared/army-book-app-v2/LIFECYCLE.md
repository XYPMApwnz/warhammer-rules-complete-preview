# ArmyBookApp mount ownership

`mount(document, payload, {roster, root, styles})` returns the existing app API
plus `destroy()` and a read-only `destroyed` flag. Destroy the previous mount
before mounting its replacement. Destruction is idempotent.

`root` defaults to `document.body`. The app appends its own root and removes
only that root on destruction; existing host/shell nodes survive. Common
presentation styles and the supplied book-owned `styles` URLs are owned by the
mount. Entry points remove their own loading placeholder before mounting.
Book entry points supply faction paint as data; the runtime has no army branch.

The shared lifecycle tracks listeners, observers, animation frames, timers and
cleanup callbacks. Listener and asynchronous callbacks are also guarded so
already queued work cannot revive a destroyed owner. Child navigation, layout
and roster panels dispose independently and unregister from their parent when
removed. Detached controls retained by callers no longer dispatch app actions.

Destruction closes dialogs, removes owned styles and DOM, restores the prior
document title, owned body classes, navigation CSS/attributes and external
focus, and releases the global API only if that API still belongs to the mount.
Public view actions become inert. The supplied roster service remains owned by
its caller; in-flight service work cannot be cancelled by presentation, but its
continuations cannot render, navigate or persist through a destroyed panel.

URL identity, history, canonical records and persistent roster storage are not
deleted or rewritten by destruction. A subsequent mount reconstructs the
selected semantic entity through the existing route/context contract. There
is no new router, shell, Core reader or glossary engine.

Run `qa:shared:v2:lifecycle` for synthetic resource ownership controls and
`qa:shared:v2:lifecycle:browser` for independently instrumented desktop and
390×844 switching, retained controls, queued callbacks, deferred roster loading,
theme isolation and effective-reference reconstruction.
