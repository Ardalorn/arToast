/**
 * ArToast
 * A lightweight, dependency-free toast notification module with
 * configurable content and an optional checkout/cross-sell CTA that
 * appears while toasts are active.
 *
 * Required markup in the consuming page:
 *   <div id="toastContainer"></div>
 *   <div id="checkout">...</div>   (only needed if you use the CTA)

/*
 * MIT License
 * 
 * Copyright (c) 2026 Ardalorn
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const MAX_TOASTS = 5;
const TOAST_ENTER_SETTLE_MS = 1000;
const TOAST_EXIT_MS = 200;
const TOAST_LIFETIME_MS = 8000;
const CTA_DELAY_MS = 2000;
const CHECKOUT_CLOSE_DELAY_MS = 5000;
const CHECKOUT_GAP_PX = 10;
const CONTAINER_BASE_BOTTOM_PX = 20;
const TOAST_EXIT_GAP_MS = 1000;

/**
 * Mutable config, read fresh each time showToast() is called.
 *   fields: array of { text, className } — wrap a group of fields in []
 *           to render them together on a shared row (e.g. qty + price).
 *   custom: optional string or DOM Node appended after the fields.
 *           Leave null (default) to omit the block entirely.
 */
export const toastConfig = {
  fields: [
    { text: 'Counter increased! (Reactive state changed)', className: 'toast-message' }
  ],
  custom: null
};

let shownCTA = false;
let activeToasts = 0;
let checkoutCloseTimer = null;
let lastToastExitAt = 0;

function buildFieldEl(field) {
  const fieldEl = document.createElement('div');
  if (field.className) fieldEl.className = field.className;
  fieldEl.textContent = field.text;
  return fieldEl;
}

export function showToast() {
  const container = document.getElementById('toastContainer');

  activeToasts++;

  if (checkoutCloseTimer) {
    clearTimeout(checkoutCloseTimer);
    checkoutCloseTimer = null;
  }

  const el = document.createElement('div');
  el.className = 'toast';

  toastConfig.fields.forEach(field => {
    if (Array.isArray(field)) {
      const rowEl = document.createElement('div');
      rowEl.className = 'toast-row';
      field.forEach(subField => rowEl.appendChild(buildFieldEl(subField)));
      el.appendChild(rowEl);
    } else {
      el.appendChild(buildFieldEl(field));
    }
  });

  if (toastConfig.custom) {
    const customEl = document.createElement('div');
    customEl.className = 'toast-custom';
    if (toastConfig.custom instanceof Node) {
      customEl.appendChild(toastConfig.custom);
    } else {
      customEl.textContent = toastConfig.custom;
    }
    el.appendChild(customEl);
  }

  container.appendChild(el);

  requestAnimationFrame(() => el.classList.add('show'));

  el.addEventListener('transitionend', function onEnter(e) {
    if (e.propertyName !== 'transform') return;
    el.removeEventListener('transitionend', onEnter);

    setTimeout(() => {
      const existing = Array.from(container.children).filter(c => c !== el && !c.classList.contains('exit-right') && !c.dataset.exiting);
      const overflow = existing.length - (MAX_TOASTS - 1);

      for (let i = 0; i < overflow; i++) {
        exitToast(existing[i], true);
      }
    }, TOAST_ENTER_SETTLE_MS);
  });

  if (!shownCTA) {
    setTimeout(() => {
      showToastCheckout();
    }, CTA_DELAY_MS);
  }

  setTimeout(() => {
    if (el.isConnected) exitToast(el, false);
  }, TOAST_LIFETIME_MS);
}

function exitToast(el, isOverflow) {
  if (el.dataset.exiting) return;
  el.dataset.exiting = 'true';
  activeToasts--;

  const run = () => {
    const elapsed = Date.now() - lastToastExitAt;

    if (elapsed < TOAST_EXIT_GAP_MS) {
      setTimeout(run, TOAST_EXIT_GAP_MS - elapsed);
      return;
    }

    lastToastExitAt = Date.now();
    el.classList.remove('show');
    if (isOverflow) el.classList.add('exit-right');

    setTimeout(() => {
      if (el.isConnected) el.remove();
      if (!isOverflow) scheduleCheckoutClose();
    }, TOAST_EXIT_MS);
  };

  run();
}

function showToastCheckout() {
  const toastCheck = document.getElementById('checkout');
  const container = document.getElementById('toastContainer');

  toastCheck.classList.add('showC');
  const shift = toastCheck.offsetHeight + CHECKOUT_GAP_PX;
  container.style.bottom = `${CONTAINER_BASE_BOTTOM_PX + shift}px`;
  shownCTA = true;
}

function scheduleCheckoutClose() {
  if (activeToasts > 0) return;

  if (checkoutCloseTimer) {
    clearTimeout(checkoutCloseTimer);
  }

  checkoutCloseTimer = setTimeout(() => {
    const toastCheck = document.getElementById('checkout');
    const container = document.getElementById('toastContainer');

    toastCheck.classList.remove('showC');
    container.style.bottom = `${CONTAINER_BASE_BOTTOM_PX}px`;
    shownCTA = false;
    checkoutCloseTimer = null;
  }, CHECKOUT_CLOSE_DELAY_MS);
}

const ArToast = { show: showToast, config: toastConfig };

export default ArToast;
