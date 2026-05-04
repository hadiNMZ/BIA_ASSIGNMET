import { state } from "../state.js";
import { escapeHtml } from "../utils.js";

export function renderShell(app, { onProfile, onRefresh, onLogout, onLink }) {
  app.innerHTML = `
    <div class="min-h-screen">
      <header class="sticky top-0 z-10 flex min-h-[74px] items-center justify-between gap-4 border-b border-store-line bg-store-bg/90 px-5 py-3 backdrop-blur md:px-10 lg:px-14">
        <button class="flex min-w-0 items-center gap-3 rounded-lg border border-store-line bg-white px-3 py-2 text-left shadow-sm transition hover:border-store-teal hover:bg-store-tealSoft/40" id="link" type="button" title="Website Link">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-store-teal text-white">
            <span class="sr-only">Store</span>
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          <span class="grid min-w-0 gap-0.5">
            <strong class="truncate text-base font-black text-store-ink">GA Store - BIA</strong>
          </span>
        </button>
        <div class="flex items-center gap-2">
          <button class="grid h-11 w-11 place-items-center rounded-lg border border-store-line bg-white text-store-ink shadow-sm transition hover:bg-slate-50" id="refresh" type="button" title="Refresh">
            <span class="sr-only">Refresh</span>
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </button>
          <button class="grid h-11 w-11 place-items-center rounded-lg border border-store-line bg-white text-store-ink shadow-sm transition hover:bg-slate-50" id="profile" type="button" title="Profile">
            <span class="sr-only">Profile</span>
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 17c0-2.21-1.79-4-4-4s-4 1.79-4 4" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </button>
          <button class="grid h-11 w-11 place-items-center rounded-lg border border-store-line bg-white text-store-ink shadow-sm transition hover:bg-slate-50" id="logout" type="button" title="Sign out">
            <span class="sr-only">Sign out</span>
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </button>
     
        </div>
      </header>
      <main id="view" class="mx-auto w-[calc(100%-32px)] max-w-[1180px] py-8 md:py-10"></main>
    </div>
  `;

  document.querySelector("#link").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.hash = "/";
  });
  document.querySelector("#refresh").addEventListener("click", onRefresh);
  document.querySelector("#profile").addEventListener("click", onProfile);
  document.querySelector("#logout").addEventListener("click", onLogout);
}

function profileSummary() {
  if (state.user) {
    return `User ${escapeHtml(state.user.user_id)} - ${escapeHtml(state.user.country)}`;
  }

  return `User ${escapeHtml(state.userId)}`;
}
