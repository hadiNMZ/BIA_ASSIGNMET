import { state } from "../state.js";
import { escapeHtml, formatPrice, productInitial } from "../utils.js";

export function renderProduct(view, actions) {
  if (state.loading) {
    view.innerHTML = `<div class="rounded-xl border border-dashed border-store-line bg-white/70 p-8 text-center font-semibold text-store-muted">Loading product...</div>`;
    return;
  }

  if (!state.product) {
    view.innerHTML = `
      <div class="flex justify-between">
        <button class="min-h-11 rounded-lg border border-store-line bg-white px-4 font-black text-store-ink shadow-sm transition hover:border-store-teal hover:bg-store-tealSoft/50" type="button" id="back">Back</button>
      </div>
      <div class="mt-4 rounded-xl border border-dashed border-store-line bg-white/70 p-8 text-center font-semibold text-store-muted">Product not found.</div>
    `;
    document.querySelector("#back").addEventListener("click", actions.onBack);
    return;
  }

  view.innerHTML = `
    <section class="grid gap-6">
      <div class="flex justify-between">
        <button class="min-h-11 rounded-lg border border-store-line bg-white px-4 font-black text-store-ink shadow-sm transition hover:border-store-teal hover:bg-store-tealSoft/50" type="button" id="back">&larr; Back</button>
      </div>
      <div class="grid gap-6 border-b border-store-line pb-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="grid min-h-72 place-items-center rounded-2xl bg-gradient-to-br from-store-teal/15 to-store-amber/15 text-7xl font-black text-store-tealDark md:min-h-96">${productInitial(state.product)}</div>
        <div class="flex flex-col justify-center gap-5">
          <span class="w-fit max-w-full rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-store-muted">${escapeHtml(state.product.category)}</span>
          <h1 class="text-5xl font-black leading-none tracking-normal text-store-ink md:text-7xl">Product #${state.product.product_id}</h1>
          <p class="max-w-xl text-base leading-7 text-store-muted">Recommended catalog item available for purchase tracking in the backend.</p>
          <div class="text-4xl font-black text-store-ink">$${formatPrice(state.product.price)}</div>
          <div class="flex flex-wrap items-center gap-3">
            <span class="font-semibold text-store-muted">Your rating</span>
            <div class="flex gap-2" role="group" aria-label="Rate product">
              ${[1, 2, 3, 4, 5].map(renderStar).join("")}
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-store-line bg-white p-5 shadow-sm">
        <div>
          <strong class="text-lg font-black text-store-ink">Ready to buy?</strong>
          <div class="mt-1 text-sm font-semibold text-store-muted">Purchases are sent to the backend behavior endpoint.</div>
        </div>
        <button class="min-h-11 rounded-lg bg-store-teal px-5 font-black text-white transition hover:bg-store-tealDark" type="button" id="purchase">Purchase product</button>
      </div>
    </section>
  `;

  document.querySelector("#back").addEventListener("click", actions.onBack);
  document.querySelector("#purchase").addEventListener("click", actions.onPurchase);
  document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", () => actions.onRate(Number(star.dataset.rating)));
  });
}

function renderStar(value) {
  const active = value <= state.rating ? " active" : "";
  const glyph = value <= state.rating ? "&#9733;" : "&#9734;";
  return `<button class="star${active} grid h-11 w-11 place-items-center rounded-lg border border-store-line bg-white text-xl text-store-amber transition hover:border-store-amber hover:bg-amber-50" type="button" data-rating="${value}" title="${value} star">${glyph}</button>`;
}
