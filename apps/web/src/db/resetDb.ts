import { db } from "@/db/schema";

const KEY = "serralheria.didResetDbOnce";

export async function resetDbOnce() {
  if (localStorage.getItem(KEY) === "1") return;
  localStorage.setItem(KEY, "1");
  try {
    await db.delete();
  } catch {}
  location.reload();
}
