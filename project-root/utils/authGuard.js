import { requireAuth } from "./requireAuth.js";
import { clearAuthState } from "../api/auth.js";

export async function authGuard() {
    try {
      return await requireAuth();
    } catch (err) {
      const status = err?.status || err?.response?.status;
  
      if (status === 401) {
        clearAuthState();
        return null;
      }
  
      const cached = localStorage.getItem("user");
  
      if (!cached || cached === "undefined") return null;
  
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
  }
  


  