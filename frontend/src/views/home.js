import { state } from "../state.js";
import { escapeHtml, formatPrice, productInitial } from "../utils.js";

/** Cleared whenever the home view is re-rendered so Escape does not leak across DOM swaps. */
let fitnessModalKeydownHandler = null;

export function renderHome(view, actions) {
  if (fitnessModalKeydownHandler) {
    document.removeEventListener("keydown", fitnessModalKeydownHandler);
    fitnessModalKeydownHandler = null;
  }

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
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl font-black text-store-ink">Top picks</h2>
        <div class="flex items-center gap-2">
          <button class="min-h-11 rounded-lg border border-store-line bg-white px-4 font-black text-store-ink shadow-sm transition hover:border-store-teal hover:bg-store-tealSoft/50" id="shuffle" type="button">Refresh picks</button>
          <button
            class="grid size-11 shrink-0 place-items-center rounded-lg border border-store-line bg-white text-store-teal shadow-sm transition hover:border-store-teal hover:bg-store-tealSoft/50"
            id="recommendation-info"
            type="button"
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="fitness-modal"
            title="Recommendation fitness details"
          >
            <span class="sr-only">Open recommendation fitness details</span>
            ${infoIconSvg()}
          </button>
        </div>
      </div>
      ${renderProductGrid(state.recommended)}
    </section>

    <div id="fitness-modal" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true" aria-labelledby="fitness-modal-title">
      <button type="button" id="fitness-modal-backdrop" class="absolute inset-0 z-0 bg-store-ink/40" aria-label="Close dialog"></button>
      <div class="pointer-events-none relative z-10 flex min-h-full items-center justify-center p-4">
        <div id="fitness-modal-panel" class="pointer-events-auto w-full max-w-lg rounded-2xl border border-store-line bg-white p-6 shadow-soft">
          <div class="flex items-start justify-between gap-3">
            <h3 id="fitness-modal-title" class="text-lg font-black text-store-ink">Recommendation fitness</h3>
            <button type="button" id="fitness-modal-close" class="grid size-9 shrink-0 place-items-center rounded-lg border border-store-line text-store-muted transition hover:border-store-teal hover:text-store-ink" aria-label="Close">
              <span aria-hidden="true" class="text-xl leading-none">&times;</span>
            </button>
          </div>
          <p class="mt-2 text-sm leading-6 text-store-muted">Fitness reflects how well the current recommendation set matches the genetic algorithm's objective over iterations.</p>
          <div id="fitness-modal-score" class="mt-5"></div>
          <div id="fitness-modal-chart" class="mt-5"></div>
        </div>
      </div>
    </div>

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
  bindFitnessModal(view);
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

function infoIconSvg() {
  return `<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>`;
}

function renderFitnessHistoryChart(values) {
  const list = Array.isArray(values) ? values.map(Number).filter((n) => Number.isFinite(n)) : [];
  if (!list.length) {
    return `<p class="rounded-xl border border-dashed border-store-line bg-store-bg/80 py-10 text-center text-sm font-semibold text-store-muted">No fitness history in this response.</p>`;
  }

  const w = 480;
  const h = 200;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const min = Math.min(...list);
  const max = Math.max(...list);
  const span = max - min || 1;
  const n = list.length;

  const points = list
    .map((v, i) => {
      const x = padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = padT + (1 - (v - min) / span) * innerH;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const first = list[0];
  const last = list[list.length - 1];
  const yFor = (v) => padT + (1 - (v - min) / span) * innerH;

  return `
    <div>
      <p class="mb-2 text-xs font-black uppercase tracking-wide text-store-muted">Fitness over iterations</p>
      <svg class="h-52 w-full max-w-full rounded-xl border border-store-line bg-gradient-to-b from-white to-store-bg/60" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Line chart of fitness score over time">
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + innerH}" stroke="#d9ded8" stroke-width="1" />
        <line x1="${padL}" y1="${padT + innerH}" x2="${padL + innerW}" y2="${padT + innerH}" stroke="#d9ded8" stroke-width="1" />
        <text x="${padL - 6}" y="${yFor(max) + 4}" text-anchor="end" fill="#66737a" style="font: 10px Inter, system-ui, sans-serif">${escapeHtml(String(max))}</text>
        <text x="${padL - 6}" y="${yFor(min) + 4}" text-anchor="end" fill="#66737a" style="font: 10px Inter, system-ui, sans-serif">${escapeHtml(String(min))}</text>
        <polyline fill="none" stroke="#0f766e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${points}" />
        <text x="${padL}" y="${h - 8}" fill="#66737a" style="font: 10px Inter, system-ui, sans-serif">Iteration 1</text>
        <text x="${padL + innerW}" y="${h - 8}" text-anchor="end" fill="#66737a" style="font: 10px Inter, system-ui, sans-serif">Iteration ${n}</text>
      </svg>
      <p class="mt-2 text-xs text-store-muted">Start: <span class="font-semibold text-store-ink">${escapeHtml(String(first))}</span> → end: <span class="font-semibold text-store-ink">${escapeHtml(String(last))}</span></p>
    </div>
  `;
}

function bindFitnessModal(view) {
  const modal = view.querySelector("#fitness-modal");
  const openBtn = view.querySelector("#recommendation-info");
  const backdrop = view.querySelector("#fitness-modal-backdrop");
  const closeBtn = view.querySelector("#fitness-modal-close");
  const scoreEl = view.querySelector("#fitness-modal-score");
  const chartEl = view.querySelector("#fitness-modal-chart");
  if (!modal || !openBtn || !scoreEl || !chartEl) return;

  function open() {
    const { fitness_score, fitness_history } = state.recommendationFitness;
    if (fitness_score != null && fitness_score !== "") {
      scoreEl.innerHTML = `
        <p class="text-xs font-black uppercase tracking-wide text-store-muted">Current fitness score</p>
        <p class="mt-1 text-4xl font-black tabular-nums text-store-tealDark">${escapeHtml(String(fitness_score))}</p>
      `;
    } else {
      scoreEl.innerHTML = `<p class="text-sm text-store-muted">No score was returned for this recommendation.</p>`;
    }
    chartEl.innerHTML = renderFitnessHistoryChart(fitness_history);
    modal.classList.remove("hidden");
    openBtn.setAttribute("aria-expanded", "true");
    if (fitnessModalKeydownHandler) {
      document.removeEventListener("keydown", fitnessModalKeydownHandler);
    }
    fitnessModalKeydownHandler = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", fitnessModalKeydownHandler);
    closeBtn?.focus();
  }

  function close() {
    modal.classList.add("hidden");
    openBtn.setAttribute("aria-expanded", "false");
    if (fitnessModalKeydownHandler) {
      document.removeEventListener("keydown", fitnessModalKeydownHandler);
      fitnessModalKeydownHandler = null;
    }
    openBtn.focus();
  }

  openBtn.addEventListener("click", open);
  backdrop?.addEventListener("click", close);
  closeBtn?.addEventListener("click", close);
}
