import { db } from "@/db/schema";
import { baseFields } from "./_base";
import { nowIso } from "@/db/utils/nowIso";
import type { BaseRow, DeleteRow, Id } from "@/db/types/base";

async function enqueueDelete(entity: DeleteRow["entity"], entityId: Id) {
  const row: DeleteRow = {
    id: crypto.randomUUID(),
    entity,
    entityId,
    ...baseFields(),
    deletedAt: nowIso(),
  };
  await (db as any).deletes.put(row);
}

export function makeRepo<T extends BaseRow>(entity: DeleteRow["entity"]) {
  const table = (db as any)[entity];

  return {
    async list(): Promise<T[]> {
      return (await table.toArray()).filter((r: T) => !r.deletedAt);
    },
    async getById(id: Id): Promise<T | undefined> {
      const r = await table.get(id);
      return r?.deletedAt ? undefined : r;
    },
    async upsert(input: Partial<T> & { id?: Id }): Promise<T> {
      const id = input.id ?? crypto.randomUUID();

      // baseFields: pendingSync=1 e updatedAt=now para alterações locais.
      // Se o input vier do servidor (pendingSync=0/updatedAt/lastSyncedAt), preserva.
      const base = baseFields() as any;

      const row = {
        id,
        ...base,
        ...(input as any),
      } as T;

      if ((input as any).pendingSync === 0) (row as any).pendingSync = 0;

      await table.put(row);
      return row;
    },async softDelete(id: Id): Promise<void> {
      const existing = await table.get(id);
      if (existing) {
        await table.put({ ...existing, deletedAt: nowIso(), pendingSync: 1, updatedAt: nowIso() });
      }
      await enqueueDelete(entity, id);
    },
    async getPending(): Promise<T[]> {
      return await table.where("pendingSync").equals(1).toArray();
    },
    async markSynced(ids: Id[], serverTimeIso: string): Promise<void> {
      await (db as any).transaction("rw", table, async () => {
        for (const id of ids) {
          const r = await table.get(id);
          if (!r) continue;
          await table.put({ ...r, pendingSync: 0, lastSyncedAt: serverTimeIso });
        }
      });
    },
  };
}


