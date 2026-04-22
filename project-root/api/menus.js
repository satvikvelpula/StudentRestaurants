import { fetchData } from "../utils/fetchData.js";

export async function getDailyMenu(restaurantId, lang = "en") {
  return await fetchData(`/restaurants/daily/${restaurantId}/${lang}`);
}

export async function getWeeklyMenu(restaurantId, lang = "en") {
  const fetched = await fetchData(`/restaurants/weekly/${restaurantId}/${lang}`);
  console.log(fetched);
  return fetched;
}

