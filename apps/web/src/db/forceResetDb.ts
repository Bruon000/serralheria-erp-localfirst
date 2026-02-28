import { db } from "@/db/schema";

export async function forceResetDb() {
  try {
    await db.delete();
  } catch {}
  localStorage.removeItem("serralheria.didResetDbOnce");
  location.replace(window.location.pathname); // volta sem query e sem loop
}
