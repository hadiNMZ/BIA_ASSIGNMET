export function showToast(message) {
  const existing = document.querySelector(".toast");
  existing?.remove();

  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-5 right-5 z-20 max-w-[min(380px,calc(100vw-36px))] rounded-xl bg-store-ink px-4 py-3 text-sm font-semibold leading-6 text-white shadow-soft";
  toast.textContent = message;
  document.body.append(toast);

  window.setTimeout(() => toast.remove(), 3200);
}

export function friendlyError(error) {
  if (error instanceof TypeError) {
    return "Could not reach the API. Check the API base URL and whether the backend allows this frontend origin.";
  }

  return error.message || "Something went wrong.";
}

export function productInitial(product) {
  return escapeHtml((product.category || "P").slice(0, 1).toUpperCase());
}

export function formatPrice(price) {
  return Number(price).toLocaleString("en-US");
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
