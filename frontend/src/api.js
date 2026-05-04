import { state } from "./state.js";

export async function login(userId) {
  return request("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, password: "password" }),
  });
}

export function getMe() {
  return apiGet("/me");
}

export function getCategories() {
  return apiGet("/products/categories");
}

export function getRecommendedProducts() {
  return apiGet("/recommended-products");
}

export async function getProducts({ category, priceSort }) {
  const params = new URLSearchParams({ page_size: "60" });
  if (category && category !== "All") params.set("category", category);
  if (priceSort) params.set("price_sort", priceSort);

  const data = await apiGet(`/products?${params.toString()}`);
  return data.items || [];
}

export function getProduct(productId) {
  return apiGet(`/products/${productId}`);
}

export function getRating(productId) {
  return apiGet(`/ratings/${productId}`);
}

export function saveRating(productId, rating) {
  return apiPost("/ratings", { product_id: productId, rating });
}

export function recordBehavior(productId, actions) {
  return apiPost("/behaviors", { product_id: productId, actions });
}

async function apiGet(path) {
  return request(path, { headers: authHeaders() });
}

async function apiPost(path, body) {
  return request(path, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function request(path, options) {
  const response = await fetch(`${state.apiBase}${path}`, options);
  return parseResponse(response);
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(formatApiError(data, response.status));
  }

  return data;
}

function formatApiError(data, status) {
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item?.msg || item?.message || "Validation error")
      .join(" ");
  }

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  return `Request failed with status ${status}`;
}
