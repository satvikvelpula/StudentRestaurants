import { authGuard } from "./authGuard.js";
import { showToast } from "./notifications.js";

export async function loadAuthUser({
    redirect = true,
    redirectUrl = "login.html",
    toast = true
  } = {}) {
    const user = await authGuard();
  
    if (!user) {
      if (toast && !sessionStorage.getItem("auth-toast-shown")) {
        showToast("Session unavailable", "error");
        sessionStorage.setItem("auth-toast-shown", "true");
      }
  
      if (redirect && !window.location.pathname.includes(redirectUrl)) {
        window.location.replace(redirectUrl);
      }
  
      return null;
    }
  
    return user;
  }
  
