export const API_BASE = "https://api.svu.store.abdulha.de";
export const LOCAL_API_PROXY = "/api";

export function getApiBase() {
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return LOCAL_API_PROXY;
  }

  return API_BASE;
}
