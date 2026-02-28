import { db, type ClientRecord } from "../schema";
import { nowIso } from "../utils/time";
import { getDeviceId } from "../utils/device";
import { enqueueDelete } from "./deletesRepo";

export async function listClients() {
  // traz tudo que não está deletado (null/undefined)
  return db.clients
    .filter((c) => !c.deletedAt)
    .toArray();
}

export async function getClientById(id: string) {
  return db.clients.get(id);
}

export async function upsertClient(input: Partial<ClientRecord> & { id?: string; name: string }) {
  const existing = input.id ? await db.clients.get(input.id) : null;
  const id = existing?.id ?? input.id ?? crypto.randomUUID();
  const now = nowIso();

  const row: ClientRecord = {
    id,
    name: input.name,
    email: input.email ?? existing?.email ?? null,
    phone: input.phone ?? existing?.phone ?? null,
    document: input.document ?? existing?.document ?? null,
    address: input.address ?? existing?.address ?? null,
    companyId: input.companyId ?? existing?.companyId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
    version: (existing?.version ?? 0) + 1,
    deviceId: getDeviceId(),
    pendingSync: 1,
    lastSyncedAt: existing?.lastSyncedAt ?? null,
  };

  await db.clients.put(row);
  return row;
}

export async function softDeleteClient(id: string) {
  const now = nowIso();
  await db.clients.update(id, {
    deletedAt: now,
    updatedAt: now,
    pendingSync: 1,
    deviceId: getDeviceId(),
  });
  await enqueueDelete({ entity: "clients", entityId: id });
}

export async function getPendingClientUpserts() {
  return db.clients.where("pendingSync").equals(1).toArray();
}

export async function markClientsSynced(ids: string[], serverTime: string) {
  await db.transaction("rw", db.clients, async () => {
    for (const id of ids) {
      await db.clients.update(id, { pendingSync: 0, lastSyncedAt: serverTime });
    }
  });
}
