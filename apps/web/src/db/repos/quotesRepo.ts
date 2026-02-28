import { db, type QuoteRecord } from "../schema";
import { nowIso } from "../utils/time";
import { getDeviceId } from "../utils/device";
import { enqueueDelete } from "./deletesRepo";

export async function listQuotes(params?: { clientId?: string; status?: string }) {
  let rows = await db.quotes.filter((q) => !q.deletedAt).toArray();
  if (params?.clientId) rows = rows.filter((q) => q.clientId === params.clientId);
  if (params?.status) rows = rows.filter((q) => q.status === params.status);
  return rows;
}

export async function getQuoteById(id: string) {
  return db.quotes.get(id);
}

export async function upsertQuote(
  input: Partial<QuoteRecord> & {
    id?: string;
    clientId: string;
    status: string;
    subtotal: number;
    total: number;
    marginPct: number;
    jobSiteId?: string | null;
  }
) {
  const existing = input.id ? await db.quotes.get(input.id) : null;
  const id = existing?.id ?? input.id ?? crypto.randomUUID();
  const now = nowIso();

  const row: QuoteRecord = {
    id,
    clientId: input.clientId,
    jobSiteId: input.jobSiteId ?? existing?.jobSiteId ?? null,
    status: input.status,
    subtotal: input.subtotal,
    total: input.total,
    marginPct: input.marginPct,
    companyId: input.companyId ?? existing?.companyId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
    version: (existing?.version ?? 0) + 1,
    deviceId: getDeviceId(),
    pendingSync: 1,
    lastSyncedAt: existing?.lastSyncedAt ?? null,
  };

  await db.quotes.put(row);
  return row;
}

export async function softDeleteQuote(id: string) {
  const now = nowIso();
  await db.quotes.update(id, {
    deletedAt: now,
    updatedAt: now,
    pendingSync: 1,
    deviceId: getDeviceId(),
  });
  await enqueueDelete({ entity: "quotes", entityId: id });
}

export async function getPendingQuoteUpserts() {
  return db.quotes.where("pendingSync").equals(1).toArray();
}

export async function markQuotesSynced(ids: string[], serverTime: string) {
  await db.transaction("rw", db.quotes, async () => {
    for (const id of ids) {
      await db.quotes.update(id, { pendingSync: 0, lastSyncedAt: serverTime });
    }
  });
}
