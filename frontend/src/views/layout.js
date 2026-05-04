import { state } from "../state.js";
import { escapeHtml } from "../utils.js";

export function renderShell(app, { onProfile, onRefresh, onLogout }) {
  app.innerHTML = `
    <div class="min-h-screen">
      <header class="sticky top-0 z-10 flex min-h-[74px] items-center justify-between gap-4 border-b border-store-line bg-store-bg/90 px-5 py-3 backdrop-blur md:px-10 lg:px-14">
        <button class="flex min-w-0 items-center gap-3 rounded-lg border border-store-line bg-white px-3 py-2 text-left shadow-sm transition hover:border-store-teal hover:bg-store-tealSoft/40" id="profile-link" type="button" title="Profile">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-store-teal text-sm font-black text-white">S</span>
          <span class="grid min-w-0 gap-0.5">
            <strong class="truncate text-base font-black text-store-ink">SVU Store</strong>
            <span class="truncate text-sm font-bold text-store-muted">${profileSummary()}</span>
          </span>
        </button>
        <div class="flex items-center gap-2">
          <button class="grid h-11 w-11 place-items-center rounded-lg border border-store-line bg-white font-black text-store-ink shadow-sm transition hover:bg-slate-50" id="refresh" type="button" title="Refresh">R</button>
          <button class="min-h-11 rounded-lg border border-store-line bg-white px-4 font-black text-store-ink shadow-sm transition hover:bg-slate-50" id="logout" type="button">Sign out</button>
        </div>
      </header>
      <main id="view" class="mx-auto w-[calc(100%-32px)] max-w-[1180px] py-8 md:py-10"></main>
    </div>
  `;

  document.querySelector("#profile-link").addEventListener("click", onProfile);
  document.querySelector("#refresh").addEventListener("click", onRefresh);
  document.querySelector("#logout").addEventListener("click", onLogout);
}

function profileSummary() {
  if (state.user) {
    return `User ${escapeHtml(state.user.user_id)} - ${escapeHtml(state.user.country)}`;
  }

  return `User ${escapeHtml(state.userId)}`;
}
