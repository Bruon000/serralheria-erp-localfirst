import { useState, useCallback } from "react";
import { apiJson } from "@/api/client";
import { sync as syncUrl } from "@/api/endpoints";
import { db } from "@/db";
import { getDeviceId } from "@/db/utils/device";
import { getPendingDeletes, markDeletesSynced, applyServerDeletes } from "@/db/repos/deletesRepo";

export function useSync() {
  const [syncing, setSyncing] = useState(false);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const deviceId = getDeviceId();
      const lastSync = localStorage.getItem("lastSync");

      const localClients = await db.clients.where("pendingSync").equals(1).toArray();
      const localJobsites = await db.jobsites.where("pendingSync").equals(1).toArray();
      const localQuotes = await db.quotes.where("pendingSync").equals(1).toArray();
      const localQuoteItems = await db.quoteItems.where("pendingSync").equals(1).toArray();
      const localDeletes = await getPendingDeletes();

      const payload = {
        lastSync: lastSync || null,
        deviceId,
        changes: {
          clients: localClients,
          jobsites: localJobsites,
          quotes: localQuotes,
          quoteItems: localQuoteItems,
        },
        deletes: localDeletes.map((d) => ({
          entity: d.entity,
          entityId: d.entityId,
          deletedAt: d.deletedAt,
          companyId: d.companyId ?? null,
        })),
      };

      const result = await apiJson<{
        serverTime: string;
        changes?: {
          clients?: any[];
          jobsites?: any[];
          quotes?: any[];
          quoteItems?: any[];
        };
        deletes?: Array<{ entity: "clients" | "jobsites" | "quotes" | "quoteItems"; entityId: string; deletedAt?: string | null }>;
      }>(syncUrl, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      localStorage.setItem("lastSync", result.serverTime);

      // aplica changes vindos do servidor
      if (result.changes?.clients?.length) {
        for (const row of result.changes.clients) {
          await db.clients.put({ ...row, pendingSync: 0, lastSyncedAt: result.serverTime });
        }
      }
      if (result.changes?.jobsites?.length) {
        for (const row of result.changes.jobsites) {
          await db.jobsites.put({ ...row, pendingSync: 0, lastSyncedAt: result.serverTime });
        }
      }
      if (result.changes?.quotes?.length) {
        for (const row of result.changes.quotes) {
          await db.quotes.put({ ...row, pendingSync: 0, lastSyncedAt: result.serverTime });
        }
      }
      if (result.changes?.quoteItems?.length) {
        for (const row of result.changes.quoteItems) {
          await db.quoteItems.put({ ...row, pendingSync: 0, lastSyncedAt: result.serverTime });
        }
      }

      // aplica deletes vindos do servidor
      if (result.deletes?.length) {
        await applyServerDeletes(result.deletes);
      }

      // marca locais como sincronizados (upserts)
      await db.transaction("rw", db.clients, db.jobsites, db.quotes, db.quoteItems, async () => {
        for (const c of localClients) await db.clients.update(c.id, { pendingSync: 0, lastSyncedAt: result.serverTime });
        for (const j of localJobsites) await db.jobsites.update(j.id, { pendingSync: 0, lastSyncedAt: result.serverTime });
        for (const q of localQuotes) await db.quotes.update(q.id, { pendingSync: 0, lastSyncedAt: result.serverTime });
        for (const i of localQuoteItems) await db.quoteItems.update(i.id, { pendingSync: 0, lastSyncedAt: result.serverTime });
      });

      // marca fila de deletes como sincronizada
      if (localDeletes.length) {
        await markDeletesSynced(localDeletes.map((d) => d.id), result.serverTime);
      }
    } finally {
      setSyncing(false);
    }
  }, []);

  return { sync, syncing };
}
