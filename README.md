# ArToast

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A lightweight, dependency-free toast notification module for vanilla JS-configurable multi-field content, row grouping, a free-form custom slot, and an optional checkout/cross-sell CTA.

## Features

- Zero dependencies, plain ES module — no build step required
- Multi-field toast content (title, subtitle, price, etc.), each independently styleable via `className`
- Group fields onto a shared row (e.g. qty + price side by side)
- Optional `custom` slot for a plain string or a hand-built DOM node — omitted from the DOM entirely when empty
- Caps toasts on screen (`MAX_TOASTS`) and evicts the oldest overflow toast automatically
- Optional checkout/cross-sell CTA panel that slides in while toasts are active and auto-closes once they've cleared
- Built on standard evergreen-browser APIs (ES modules, `classList`, `dataset`) — no polyfills or transpilation required

## Installation

No package manager needed, copy `arToast.js` into your project and import it as an ES module.

```
your-project/
├── arToast.js
└── index.html
```

## Required markup

```html
<div id="toastContainer"></div>

<!-- Only needed if you use the checkout CTA -->
<div id="checkout">
  <!-- your checkout / cross-sell content -->
</div>
```

## Quick start

```html
<script type="module">
  import { showToast } from './arToast.js';

  showToast(); // uses the default message
</script>
```

Or via the default export:

```js
import ArToast from './arToast.js';

ArToast.show();
```

## Triggering a toast

ArToast doesn't attach itself to any button — wire it to whatever should trigger it:

```js
import { showToast, toastConfig } from './arToast.js';

document.getElementById('addToCartBtn').addEventListener('click', () => {
  toastConfig.fields = [{ text: 'Added to cart', className: 'toast-message' }];
  showToast();
});
```

## Configuration

### `toastConfig.fields`

An array of field descriptors. Each entry is either:

- a single object `{ text, className }` → rendered on its own line
- an array of objects → rendered together on one row (`.toast-row`)

All `text` is rendered via `textContent`, so it's always literal text — never interpreted as HTML.

```js
toastConfig.fields = [
  { text: 'Wireless Headphones', className: 'toast-title' },
  [
    { text: 'Qty: 2', className: 'toast-qty' },
    { text: '$79.99', className: 'toast-price' }
  ]
];

showToast();
```

### `toastConfig.custom`

Optional. Defaults to `null`, meaning nothing is added to the toast at all. Accepts either:

- a string → also rendered as literal text
- a DOM `Node` → appended as-is, giving you full control over markup, styling, and event listeners

```js
function addToCartToast(product) {
  const promo = document.createElement('div');
  promo.innerHTML = `<strong>Save 10%</strong> with code WELCOME10`;
  toastConfig.custom = promo;
  showToast();
}
```

Build a **fresh node on every `showToast()` call**. A DOM node can only have one parent — reusing the same node while an earlier toast is still visible will move it out of that toast and into the new one. If a toast shouldn't have a custom block, reset `toastConfig.custom = null` before calling `showToast()`.

> `custom` is the one place raw HTML can enter — only through markup you build yourself (like `promo.innerHTML` above), never from `arToast.js` itself. Sanitize it if the content ever comes from user input rather than your own trusted data.

## Tuning constants

Not exported — edit these directly in `arToast.js` if you fork it.

| Constant | Default | Description |
|---|---|---|
| `MAX_TOASTS` | `5` | Max toasts visible at once; oldest is evicted past this |
| `TOAST_ENTER_SETTLE_MS` | `1000` | Delay after a toast finishes entering before overflow is checked |
| `TOAST_EXIT_MS` | `200` | Exit animation duration before the element is removed from the DOM |
| `TOAST_LIFETIME_MS` | `8000` | How long a toast stays before auto-dismissing |
| `CTA_DELAY_MS` | `2000` | Delay before the checkout CTA first appears |
| `CHECKOUT_CLOSE_DELAY_MS` | `5000` | Delay after the last toast clears before the checkout CTA closes |
| `CHECKOUT_GAP_PX` | `10` | Gap between the toast container and the checkout CTA |
| `CONTAINER_BASE_BOTTOM_PX` | `20` | Toast container's default distance from the bottom of the viewport |
| `TOAST_EXIT_GAP_MS` | `1000` | Minimum spacing enforced between consecutive toast exit animations |

## Starter CSS

The enter/exit logic waits on a `transform` transition, so at minimum you need transitions defined for `.show` and `.exit-right`. A working starting point — style to taste:

```css
#toastContainer {
  position: fixed;
  left: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: bottom 0.2s ease;
  z-index: 1000;
}

.toast {
  background: #1a1a1a;
  color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateX(-120%);
  opacity: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.toast.show {
  transform: translateX(0);
  opacity: 1;
}

.toast.exit-right {
  transform: translateX(120%);
  opacity: 0;
}

.toast-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.toast-custom {
  margin-top: 4px;
  font-size: 0.8rem;
}

#checkout {
  position: fixed;
  left: 20px;
  bottom: 20px;
  transform: translateY(120%);
  opacity: 0;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

#checkout.showC {
  transform: translateY(0);
  opacity: 1;
}
```

## API

| Export | Description |
|---|---|
| `showToast()` | Renders and displays a toast using the current `toastConfig` |
| `toastConfig` | Mutable config object (`fields`, `custom`), read fresh each time `showToast()` runs |
| default (`ArToast`) | `{ show: showToast, config: toastConfig }`, for `import ArToast from './arToast.js'` |

## License

MIT — use it, fork it, ship it.
