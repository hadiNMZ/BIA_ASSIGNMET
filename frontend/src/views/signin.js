import { state } from "../state.js";
import { escapeHtml } from "../utils.js";

export function renderSignIn(app, { onLogin }) {
  app.innerHTML = `
    <main class="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.13),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(183,121,31,0.12),transparent_32%)] p-4 md:p-8">
      <section class="flex w-full max-w-md flex-col gap-7 rounded-2xl border border-store-line bg-white p-7 shadow-soft md:p-10" aria-label="Sign in">
        <div class="flex items-center gap-3" aria-label="SVU Store">
          <span class="grid h-12 w-12 place-items-center rounded-xl bg-store-teal text-base font-black text-white">S</span>
          <span class="grid gap-0.5">
            <strong class="text-lg font-black text-store-ink">SVU Store</strong>
            <span class="text-sm font-semibold text-store-muted">Simple e-commerce store</span>
          </span>
        </div>

        <div class="grid gap-2">
          <h1 class="text-5xl font-black leading-none tracking-normal text-store-ink">Sign in</h1>
          <p class="text-base leading-7 text-store-muted">Enter your user ID to continue shopping.</p>
        </div>

        <form id="login-form" class="grid gap-3">
          <label class="grid gap-2" for="user-id">
            <span class="text-sm font-black text-store-muted">User ID</span>
            <input class="min-h-12 rounded-lg border border-store-line bg-white px-4 text-store-ink outline-none transition focus:border-store-teal focus:ring-4 focus:ring-store-tealSoft" id="user-id" name="user_id" type="number" min="1" max="100" inputmode="numeric" value="${escapeHtml(state.userId)}" required autofocus />
          </label>
          <button class="min-h-12 rounded-lg bg-store-teal px-5 font-black text-white transition hover:bg-store-tealDark" type="submit">Continue</button>
        </form>

        ${state.error ? `<div class="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">${escapeHtml(state.error)}</div>` : ""}
        ${state.message ? `<div class="rounded-lg bg-store-tealSoft px-4 py-3 text-sm font-semibold leading-6 text-store-tealDark">${escapeHtml(state.message)}</div>` : ""}
      </section>
    </main>
  `;

  document.querySelector("#login-form").addEventListener("submit", onLogin);
}
