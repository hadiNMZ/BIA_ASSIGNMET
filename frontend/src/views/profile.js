import { state } from "../state.js";
import { escapeHtml } from "../utils.js";

export function renderProfile(view, { onBrowse }) {
  if (state.loading) {
    view.innerHTML = `<div class="rounded-xl border border-dashed border-store-line bg-white/70 p-8 text-center font-semibold text-store-muted">Loading profile...</div>`;
    return;
  }

  if (!state.user) {
    view.innerHTML = `<div class="rounded-xl border border-dashed border-store-line bg-white/70 p-8 text-center font-semibold text-store-muted">Profile information could not be loaded.</div>`;
    return;
  }

  view.innerHTML = `
    <section class="grid gap-6" aria-label="Profile information">
      <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-5xl font-black leading-tight tracking-normal text-store-ink md:text-6xl">Profile</h1>
          <p class="mt-4 text-base leading-7 text-store-muted">Your account details from the store API.</p>
        </div>
        <button class="min-h-11 rounded-lg border border-store-line bg-white px-4 font-black text-store-ink shadow-sm transition hover:border-store-teal hover:bg-store-tealSoft/50" id="browse-products" type="button">Browse products</button>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <article class="grid min-h-40 gap-3 rounded-xl border border-store-line bg-white p-5 shadow-sm">
          <span class="text-sm font-black uppercase text-store-muted">ID</span>
          <strong class="self-end break-words text-5xl font-black leading-none text-store-ink">${escapeHtml(state.user.user_id)}</strong>
        </article>
        <article class="grid min-h-40 gap-3 rounded-xl border border-store-line bg-white p-5 shadow-sm">
          <span class="text-sm font-black uppercase text-store-muted">Age</span>
          <strong class="self-end break-words text-5xl font-black leading-none text-store-ink">${escapeHtml(state.user.age)}</strong>
        </article>
        <article class="grid min-h-40 gap-3 rounded-xl border border-store-line bg-white p-5 shadow-sm">
          <span class="text-sm font-black uppercase text-store-muted">Country</span>
          <strong class="self-end break-words text-5xl font-black leading-none text-store-ink">${escapeHtml(state.user.country)}</strong>
        </article>
      </div>
    </section>
  `;

  document.querySelector("#browse-products").addEventListener("click", onBrowse);
}
