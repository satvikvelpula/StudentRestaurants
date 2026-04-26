import { getToken } from "../api/auth.js";

export function requireGuest() {
    if (getToken()) {
      window.location.replace("dashboard.html");
      throw new Error("Already logged in");
    }
  }