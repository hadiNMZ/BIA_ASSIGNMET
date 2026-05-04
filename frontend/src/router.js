import {
  getCategories,
  getMe,
  getProduct,
  getProducts,
  getRating,
  getRecommendedProducts,
  login,
  recordBehavior,
  saveRating,
} from "./api.js";
import { state } from "./state.js";
import { clearSession, getLocalRating, saveLocalRating, saveSession } from "./storage.js";
import { friendlyError, showToast } from "./utils.js";
import { renderHome } from "./views/home.js";
import { renderShell } from "./views/layout.js";
import { renderProduct } from "./views/product.js";
import { renderProfile } from "./views/profile.js";
import { renderSignIn } from "./views/signin.js";

const app = document.querySelector("#app");

export async function renderRoute() {
  const current = getRoute();

  if (!state.token && current.name !== "signin") {
    window.location.hash = "#signin";
    return;
  }

  if (state.token && current.name === "signin") {
    window.location.hash = "#home";
    return;
  }

  if (current.name === "signin") {
    renderSignIn(app, { onLogin: handleLogin });
    return;
  }

  renderShell(app, {
    onProfile: () => navigate("profile"),
    onRefresh: renderRoute,
    onLogout: logout,
  });

  if (current.name === "product" && current.id) {
    await loadProduct(Number(current.id));
    renderProduct(getView(), {
      onBack: () => history.back(),
      onPurchase: purchaseProduct,
      onRate: rateProduct,
    });
    return;
  }

  if (current.name === "profile") {
    await loadProfile();
    renderProfile(getView(), { onBrowse: () => navigate("home") });
    return;
  }

  await loadHome();
  renderHome(getView(), {
    onSort: handleSort,
    onShuffle: refreshRecommended,
    onCategory: selectCategory,
    onProduct: openProduct,
  });
}

function getRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  const [name, id] = hash.split("/");
  return { name: name || "home", id };
}

function getView() {
  return document.querySelector("#view");
}

function navigate(route) {
  window.location.hash = `#${route}`;
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const userId = String(form.get("user_id")).trim();
  const userIdNumber = Number(userId);
  state.error = "";
  state.message = "";

  if (!Number.isInteger(userIdNumber) || userIdNumber < 1 || userIdNumber > 100) {
    state.error = "User ID must be between 1 and 100.";
    renderSignIn(app, { onLogin: handleLogin });
    return;
  }

  try {
    const data = await login(userIdNumber);
    state.token = data.token;
    state.tokenType = data.token_type || "bearer";
    state.userId = userId;
    saveSession({
      token: data.token,
      tokenType: data.token_type,
      userId,
    });
    navigate("home");
  } catch (error) {
    state.error = friendlyError(error);
    renderSignIn(app, { onLogin: handleLogin });
  }
}

async function loadHome() {
  state.loading = true;
  renderLoading("Loading store...");

  try {
    await Promise.all([loadMe(), loadCategories(), loadRecommended(), loadProducts()]);
  } catch (error) {
    showToast(friendlyError(error));
  } finally {
    state.loading = false;
  }
}

async function loadProfile() {
  state.loading = true;
  renderLoading("Loading profile...");

  try {
    await loadMe();
  } catch (error) {
    state.user = null;
    showToast(friendlyError(error));
  } finally {
    state.loading = false;
  }
}

async function loadProduct(productId) {
  state.loading = true;
  renderLoading("Loading product...");

  try {
    state.product = await getProduct(productId);
    state.rating = getLocalRating(productId);

    try {
      const rating = await getRating(productId);
      state.rating = rating?.rating || state.rating;
    } catch {
      state.rating = getLocalRating(productId);
    }

    await recordBehavior(productId, ["viewed"]).catch(() => {});
  } catch (error) {
    state.product = null;
    state.rating = 0;
    showToast(friendlyError(error));
  } finally {
    state.loading = false;
  }
}

function renderLoading(message) {
  const view = getView();
  if (view) {
    view.innerHTML = `<div class="rounded-xl border border-dashed border-store-line bg-white/70 p-8 text-center font-semibold text-store-muted">${message}</div>`;
  }
}

async function loadMe() {
  state.user = await getMe();
}

async function loadCategories() {
  state.categories = await getCategories();
}

async function loadRecommended() {
  const data = await getRecommendedProducts();
  if (Array.isArray(data)) {
    state.recommended = data;
    state.recommendationFitness = { fitness_score: null, fitness_history: [] };
  } else {
    state.recommended = data?.products ?? [];
    state.recommendationFitness = {
      fitness_score: data?.fitness_score ?? null,
      fitness_history: Array.isArray(data?.fitness_history) ? data.fitness_history : [],
    };
  }
}

async function loadProducts() {
  state.products = await getProducts({
    category: state.selectedCategory,
    priceSort: state.priceSort,
  });
}

async function handleSort(event) {
  state.priceSort = event.target.value;
  await loadProducts();
  renderHome(getView(), {
    onSort: handleSort,
    onShuffle: refreshRecommended,
    onCategory: selectCategory,
    onProduct: openProduct,
  });
}

async function refreshRecommended() {
  await loadRecommended();
  renderHome(getView(), {
    onSort: handleSort,
    onShuffle: refreshRecommended,
    onCategory: selectCategory,
    onProduct: openProduct,
  });
}

async function selectCategory(category) {
  state.selectedCategory = category;
  await loadProducts();
  renderHome(getView(), {
    onSort: handleSort,
    onShuffle: refreshRecommended,
    onCategory: selectCategory,
    onProduct: openProduct,
  });
}

async function openProduct(productId) {
  await recordBehavior(productId, ["clicked"]).catch(() => {});
  window.location.hash = `#product/${productId}`;
}

async function purchaseProduct() {
  if (!state.product) return;
  const button = document.querySelector("#purchase");
  button.disabled = true;

  try {
    await recordBehavior(state.product.product_id, ["purchased"]);
    showToast("Purchase recorded.");
  } catch (error) {
    showToast(friendlyError(error));
  } finally {
    button.disabled = false;
  }
}

async function rateProduct(rating) {
  if (!state.product) return;

  saveLocalRating(state.product.product_id, rating);
  state.rating = rating;
  renderProduct(getView(), {
    onBack: () => history.back(),
    onPurchase: purchaseProduct,
    onRate: rateProduct,
  });

  try {
    const saved = await saveRating(state.product.product_id, rating);
    state.rating = saved.rating;
    renderProduct(getView(), {
      onBack: () => history.back(),
      onPurchase: purchaseProduct,
      onRate: rateProduct,
    });
    showToast("Rating saved.");
  } catch (error) {
    showToast(`${friendlyError(error)} Rating kept on this device.`);
  }
}

function logout() {
  clearSession();
  state.token = "";
  state.tokenType = "bearer";
  state.userId = "";
  state.user = null;
  navigate("signin");
}
