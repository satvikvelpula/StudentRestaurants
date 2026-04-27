import { getToken } from "../api/auth.js";
import { fetchCurrentUser } from "../api/users.js";

export async function requireAuth() {
  const token = getToken();

  if (!token) {
    // window.location.replace("login.html");
    throw new Error("No token");
  }

    const res = await fetchCurrentUser();
    const user = res?.data || res?.user || res;

    if (!user) throw new Error("No user");

    localStorage.setItem("user", JSON.stringify(user));
    return user;
}



  /*catch (err) {
    
    console.error("Auth failed", err);

    const status = err?.status || err?.response?.status;

    if (status === 401) {
      // only REAL logout
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("login.html");
    }

    // IMPORTANT: don't logout on network errors
    throw err;
  } */
