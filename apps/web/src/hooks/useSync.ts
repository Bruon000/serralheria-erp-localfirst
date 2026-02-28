import { useCallback, useEffect, useRef, useState } from "react";
import { apiJson } from "@/api/client";
import { sync as syncEndpoint } from "@/api/endpoints";


import { db } from "@/db/schema";
type SyncResult = {
  serverTime?: string;
  changes?: {
    clients?: any[];
    jobsites?: any[];
    quotes?: any[];
    quoteItems?: any[];
    deletes?: { entity: string; entityId: string; deletedAt?: string }[];
  };
};

async function applyServerDeletes(deletes: { entity: string; entityId: string }[]) {
  for (const d of deletes) {
    if (!d?.entity || !d?.entityId) continue;
    try {
      const table = (db as any)[d.entity];
      if (table?.delete) await table.delete(d.entityId);
    } catch {
      // ignora entidades desconhecidas
    }
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
      const pending = {
        clients: (await (db as any).clients?.where?.("pendingSync")?.equals?.(1)?.toArray?.()) ?? [],
        jobsites: (await (db as any).jobsites?.where?.("pendingSync")?.equals?.(1)?.toArray?.()) ?? [],
        quotes: (await (db as any).quotes?.where?.("pendingSync")?.equals?.(1)?.toArray?.()) ?? [],
        quoteItems: (await (db as any).quoteItems?.where?.("pendingSync")?.equals?.(1)?.toArray?.()) ?? [],
        deletes: (await (db as any).deletes?.where?.("pendingSync")?.equals?.(1)?.toArray?.()) ?? [],
      };

      const result = await apiJson<SyncResult>(syncEndpoint, {
        method: "POST",
        body: JSON.stringify(pending),
      });

      const changes = (result as any)?.changes ?? {};
      const serverTime = (result as any)?.serverTime ?? new Date().toISOString();

      for (const row of (changes.clients ?? [])) {
        await (db as any).clients.put({ ...row, pendingSync: 0, lastSyncedAt: serverTime });
      }
      for (const row of (changes.jobsites ?? [])) {
        await (db as any).jobsites.put({ ...row, pendingSync: 0, lastSyncedAt: serverTime });
      }
      for (const row of (changes.quotes ?? [])) {
        await (db as any).quotes.put({ ...row, pendingSync: 0, lastSyncedAt: serverTime });
      }
      for (const row of (changes.quoteItems ?? [])) {
        await (db as any).quoteItems.put({ ...row, pendingSync: 0, lastSyncedAt: serverTime });
      }

      if ((changes.deletes ?? []).length) {
        await applyServerDeletes(changes.deletes ?? []);
      }
    } catch (e) {
      console.warn("[SYNC] failed", e);
    } finally {
      runningRef.current = false;
      setSyncing(false);
    }
  }, []);

  // auto-sync ao montar + a cada 30s
  useEffect(() => {
    sync();
    const t = setInterval(sync, 30_000);
    return () => clearInterval(t);
  }, [sync]);

  return { sync, syncing };
}





