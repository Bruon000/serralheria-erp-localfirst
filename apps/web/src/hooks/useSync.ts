import { useCallback, useEffect, useRef, useState } from "react";
import { apiJson } from "@/api/client";
import { sync as syncEndpoint } from "@/api/endpoints";
import { db } from "@/db/schema";
import { getDeviceId } from "@/db/utils/deviceId";

type SyncResult = {
  serverTime: string;
  changes?: {
    clients?: any[];
    jobsites?: any[];
    quotes?: any[];
    quoteItems?: any[];
    deletes?: { entity: string; entityId: string; deletedAt?: string }[];
  };
};

const LAST_SYNC_KEY = "serralheria.lastSync";

function normalizeServerRow(row: any, serverTime: string) {
  return { ...row, pendingSync: 0, lastSyncedAt: serverTime };
}

async function applyServerDeletes(deletes: { entity: string; entityId: string }[]) {
  for (const d of deletes) {
    if (!d?.entity || !d?.entityId) continue;
    const table = (db as any)[d.entity];
    if (table?.delete) await table.delete(d.entityId);
  }
}

export function useSync() {
  const runningRef = useRef(false);
  const [syncing, setSyncing] = useState(false);

  const sync = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setSyncing(true);

    try {
      const deviceId = getDeviceId();
      const lastSync = localStorage.getItem(LAST_SYNC_KEY);

      const pendingClients = (await (db as any).clients?.where?.("pendingSync")?.equals?.(1)?.toArray?.()) ?? [];
      const pendingJobsites = (await (db as any).jobsites?.where?.("pendingSync")?.equals?.(1)?.toArray?.()) ?? [];
      const pendingQuotes = (await (db as any).quotes?.where?.("pendingSync")?.equals?.(1)?.toArray?.()) ?? [];
      const pendingQuoteItems = (await (db as any).quoteItems?.where?.("pendingSync")?.equals?.(1)?.toArray?.()) ?? [];
      const pendingDeletes = (await (db as any).deletes?.where?.("pendingSync")?.equals?.(1)?.toArray?.()) ?? [];

      const payload = {
        deviceId,
        lastSync: lastSync ?? null,
        changes: {
          clients: pendingClients,
          jobsites: pendingJobsites,
          quotes: pendingQuotes,
          quoteItems: pendingQuoteItems,
          deletes: pendingDeletes.map((d: any) => ({
            entity: d.entity,
            entityId: d.entityId,
            deletedAt: d.deletedAt,
          })),
        },
      };

      const result = await apiJson<SyncResult>(syncEndpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const serverTime = result.serverTime ?? new Date().toISOString();
      const changes = (result as any)?.changes ?? {};

      if ((changes.clients ?? []).length) {
        await (db as any).clients.bulkPut((changes.clients ?? []).map((r: any) => normalizeServerRow(r, serverTime)));
      }
      if ((changes.jobsites ?? []).length) {
        await (db as any).jobsites.bulkPut((changes.jobsites ?? []).map((r: any) => normalizeServerRow(r, serverTime)));
      }
      if ((changes.quotes ?? []).length) {
        await (db as any).quotes.bulkPut((changes.quotes ?? []).map((r: any) => normalizeServerRow(r, serverTime)));
      }
      if ((changes.quoteItems ?? []).length) {
        await (db as any).quoteItems.bulkPut((changes.quoteItems ?? []).map((r: any) => normalizeServerRow(r, serverTime)));
      }

      if ((changes.deletes ?? []).length) {
        await applyServerDeletes(changes.deletes ?? []);
      }

      // limpa fila local de deletes (já enviados)
      if (pendingDeletes.length) {
        await (db as any).deletes.bulkDelete(pendingDeletes.map((d: any) => d.id));
      }

      localStorage.setItem(LAST_SYNC_KEY, serverTime);
    } catch (e) {
      console.warn("[SYNC] failed", e);
    } finally {
      runningRef.current = false;
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    sync();
    const t = setInterval(sync, 30_000);
    return () => clearInterval(t);
  }, [sync]);

  return { sync, syncing };
}
