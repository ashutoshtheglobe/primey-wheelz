import { Vehicle } from "@/types";

const FAVOURITES_KEY = "primey_wheelz_favourites";

export function getFavourites(): Vehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(FAVOURITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading favourites from localStorage:", e);
    return [];
  }
}

export function isFavourite(vehicleId: string): boolean {
  const favs = getFavourites();
  return favs.some((item) => String(item.id) === String(vehicleId));
}

export function toggleFavourite(vehicle: Vehicle): Vehicle[] {
  if (typeof window === "undefined") return [];
  const favs = getFavourites();
  const exists = favs.some((item) => String(item.id) === String(vehicle.id));
  
  let updated: Vehicle[];
  if (exists) {
    updated = favs.filter((item) => String(item.id) !== String(vehicle.id));
  } else {
    updated = [...favs, vehicle];
  }

  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("favouritesUpdated"));
  } catch (e) {
    console.error("Error saving favourites to localStorage:", e);
  }

  return updated;
}
