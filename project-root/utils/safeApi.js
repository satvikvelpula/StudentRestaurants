import { showToast } from "./notifications.js";

export async function safeApi(call, fallback = null, message = "Network error") {
  try {
    return await call();
  } catch (err) {
    console.error(message, err);

    showToast(message, "error");

    return fallback;
  }
}
