import { getApiBase } from "./config.js";
import { getStoredSession } from "./storage.js";

const session = getStoredSession();

export const state = {
  apiBase: getApiBase(),
  token: session.token,
  tokenType: session.tokenType,
  userId: session.userId,
  user: null,
  categories: [],
  recommended: [],
  /** From /recommended-products when object-shaped: { fitness_score, fitness_history } */
  recommendationFitness: { fitness_score: null, fitness_history: [] },
  products: [],
  selectedCategory: "All",
  priceSort: "",
  product: null,
  rating: 0,
  loading: false,
  message: "",
  error: "",
};
