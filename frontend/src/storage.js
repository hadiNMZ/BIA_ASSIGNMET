const TOKEN_KEY = "bia_store_token";
const TOKEN_TYPE_KEY = "bia_store_token_type";
const USER_KEY = "bia_store_user_id";
const RATINGS_KEY = "bia_store_ratings";

export function getStoredSession() {
  return {
    token: localStorage.getItem(TOKEN_KEY) || "",
    tokenType: localStorage.getItem(TOKEN_TYPE_KEY) || "bearer",
    userId: localStorage.getItem(USER_KEY) || "",
  };
}

export function saveSession({ token, tokenType, userId }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_TYPE_KEY, tokenType || "bearer");
  localStorage.setItem(USER_KEY, userId);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_TYPE_KEY);
  localStorage.removeItem(USER_KEY);
}

export function readRatings() {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getLocalRating(productId) {
  return readRatings()[productId] || 0;
}

export function saveLocalRating(productId, rating) {
  const ratings = readRatings();
  ratings[productId] = rating;
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}
