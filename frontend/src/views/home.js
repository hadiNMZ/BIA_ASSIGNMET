import { state } from "../state.js";
import { escapeHtml, formatPrice, productInitial } from "../utils.js";

export function renderHome(view, actions) {
  view.innerHTML = `
    <section class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="max-w-xl text-5xl font-black leading-tight tracking-normal text-store-ink md:text-6xl">Recommended for you</h1>
        <p class="mt-4 max-w-lg text-base leading-7 text-store-muted">Browse recommended products or filter the catalog by category.</p>
      </div>
      <select class="min-h-12 w-full rounded-lg border border-store-line bg-white px-4 text-store-ink outline-none transition focus:border-store-teal focus:ring-4 focus:ring-store-tealSoft md:w-80" id="sort" aria-label="Sort products by price">
        <option value="">Product ID order</option>
        <option value="asc" ${state.priceSort === "asc" ? "selected" : ""}>Price: low to high</option>
        <option value="desc" ${state.priceSort === "desc" ? "selected" : ""}>Price: high to low</option>
      </select>
    </section>

    <section class="mt-10">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-xl font-black text-store-ink">Top picks</h2>
        <button class="min-h-11 rounded-lg border border-store-line bg-white px-4 font-black text-store-ink shadow-sm transition hover:border-store-teal hover:bg-store-tealSoft/50" id="shuffle" type="button">Refresh picks</button>
      </div>
      ${renderProductGrid(state.recommended)}
    </section>

    <section class="mt-10">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="tabs flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product categories">
          ${["All", ...state.categories].map(renderTab).join("")}
        </div>
      </div>
      ${renderProductGrid(state.products)}
    </section>
  `;

  document.querySelector("#sort").addEventListener("change", actions.onSort);
  document.querySelector("#shuffle").addEventListener("click", actions.onShuffle);
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => actions.onCategory(tab.dataset.category));
  });
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => actions.onProduct(Number(card.dataset.productId)));
  });
}

function renderTab(category) {
  const active =
    category === state.selectedCategory
      ? "border-store-teal bg-store-teal text-white"
      : "border-store-line bg-white text-store-muted hover:border-store-teal hover:text-store-tealDark";

  return `<button class="tab min-h-10 shrink-0 rounded-full border px-4 text-sm font-black transition ${active}" type="button" role="tab" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`;
}

function renderProductGrid(products) {
  if (state.loading) return `<div class="rounded-xl border border-dashed border-store-line bg-white/70 p-8 text-center font-semibold text-store-muted">Loading products...</div>`;
  if (!products.length) return `<div class="rounded-xl border border-dashed border-store-line bg-white/70 p-8 text-center font-semibold text-store-muted">No products found.</div>`;

  return `
    <div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      ${products.map(renderProductCard).join("")}
    </div>
  `;
}

function renderProductCard(product) {
  return `
    <button class="product-card group grid min-h-[244px] gap-4 rounded-xl border border-store-line bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-store-teal hover:shadow-soft" type="button" data-product-id="${product.product_id}">
      <span class="grid min-h-28 place-items-center rounded-lg bg-gradient-to-br from-store-teal/15 to-store-amber/15 text-4xl font-black text-store-tealDark transition group-hover:from-store-teal/20 group-hover:to-store-amber/20">${productInitial(product)}</span>
      <span class="grid gap-3">
        <span class="w-fit max-w-full rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-store-muted">${escapeHtml(product.category)}</span>
        <h2 class="text-lg font-black text-store-ink">Product #${product.product_id}</h2>
      </span>
      <span class="flex items-center justify-between gap-3">
        <span class="text-2xl font-black text-store-ink">$${formatPrice(product.price)}</span>
        <span class="text-sm font-semibold text-store-muted">View</span>
      </span>
    </button>
  `;
}
