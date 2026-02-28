import { db, type DeleteRecord } from "../schema";
import { nowIso } from "../utils/time";
import { getDeviceId } from "../utils/device";

export async function enqueueDelete(args: Omit<DeleteRecord, "id" | "deletedAt" | "pendingSync" | "deviceId">) {
  const row: DeleteRecord = {
    id: crypto.randomUUID(),
    deletedAt: nowIso(),
    pendingSync: 1,
    deviceId: getDeviceId(),
    ...args,
  };
  await db.deletes.put(row);
  return row;
}

export async function getPendingDeletes() {
  return db.deletes.where("pendingSync").equals(1).toArray();
}

export async function markDeletesSynced(ids: string[], serverTime: string) {
  await db.transaction("rw", db.deletes, async () => {
    for (const id of ids) {
      await db.deletes.update(id, { pendingSync: 0, lastSyncedAt: serverTime });
    }
  });
}

export async function applyServerDeletes(deletes: Array<{ entity: DeleteRecord["entity"]; entityId: string; deletedAt?: string | null }> ) {
  console.log("[SYNC] applyServerDeletes() incoming:", deletes?.length ?? 0, deletes);
  await db.transaction("rw", db.clients, db.jobsites, db.quotes, db.quoteItems, async () => {
    for (const d of deletes) {
      const ts = d.deletedAt ?? nowIso();
      if (d.entity === "clients") await db.clients.update(d.entityId, { deletedAt: ts, pendingSync: 0 });
      if (d.entity === "jobsites") await db.jobsites.update(d.entityId, { deletedAt: ts, pendingSync: 0 });
      if (d.entity === "quotes") await db.quotes.update(d.entityId, { deletedAt: ts, pendingSync: 0 });
      if (d.entity === "quoteItems") await db.quoteItems.update(d.entityId, { deletedAt: ts, pendingSync: 0 });
    }
  });
}

