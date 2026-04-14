import { fetchData } from "../utils/fetchData.js";
import { getToken } from "./auth.js";

// Get current logged-in user from server
export async function fetchCurrentUser() {
  return await fetchData("/users/token", {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
}

export async function updateUser(data) {
    return await fetchData("/users", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(data),
      })
}

export async function uploadAvatar(net) {
    const formData = new FormData();
    formData.append("avatar", net);
  
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users/avatar",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      }
    );
  
    if (!response.ok) {
      throw new Error("Avatar upload failed");
    }
  
    return response.json();
  }
