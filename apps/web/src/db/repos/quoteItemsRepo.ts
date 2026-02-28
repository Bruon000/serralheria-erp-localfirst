import { db, type QuoteItemRecord } from "../schema";
import { nowIso } from "../utils/time";
import { getDeviceId } from "../utils/device";
import { enqueueDelete } from "./deletesRepo";

export async function listQuoteItems(params?: { quoteId?: string }) {
  let rows = await db.quoteItems.filter((i) => !i.deletedAt).toArray();
  if (params?.quoteId) rows = rows.filter((i) => i.quoteId === params.quoteId);
  return rows;
}

export async function getQuoteItemById(id: string) {
  return db.quoteItems.get(id);
}

export async function upsertQuoteItem(
  input: Partial<QuoteItemRecord> & {
    id?: string;
    quoteId: string;
    description: string;
    unit: string;
    qty: number;
    cost: number;
    price: number;
    marginPct: number;
    width?: number | null;
    height?: number | null;
    finish?: string | null;
  }
) {
  const existing = input.id ? await db.quoteItems.get(input.id) : null;
  const id = existing?.id ?? input.id ?? crypto.randomUUID();
  const now = nowIso();

  const row: QuoteItemRecord = {
    id,
    companyId: input.companyId ?? existing?.companyId,
    quoteId: input.quoteId,
    description: input.description,
    unit: input.unit,
    qty: input.qty,
    cost: input.cost,
    price: input.price,
    marginPct: input.marginPct,
    width: input.width ?? existing?.width ?? null,
    height: input.height ?? existing?.height ?? null,
    finish: input.finish ?? existing?.finish ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
    version: (existing?.version ?? 0) + 1,
    deviceId: getDeviceId(),
    pendingSync: 1,
    lastSyncedAt: existing?.lastSyncedAt ?? null,
  };

  await db.quoteItems.put(row);
  return row;
}

export async function softDeleteQuoteItem(id: string) {
  const now = nowIso();
  await db.quoteItems.update(id, {
    deletedAt: now,
    updatedAt: now,
    pendingSync: 1,
    deviceId: getDeviceId(),
  });
  await enqueueDelete({ entity: "quoteItems", entityId: id });
}

export async function getPendingQuoteItemUpserts() {
  return db.quoteItems.where("pendingSync").equals(1).toArray();
}

export async function markQuoteItemsSynced(ids: string[], serverTime: string) {
  await db.transaction("rw", db.quoteItems, async () => {
    for (const id of ids) {
      await db.quoteItems.update(id, { pendingSync: 0, lastSyncedAt: serverTime });
    }
  });
}
