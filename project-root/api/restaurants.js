import { fetchData } from "../utils/fetchData.js";

export async function getRestaurants() {
  return await fetchData("/restaurants");
}