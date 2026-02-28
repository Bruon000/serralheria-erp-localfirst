import { db, type JobSiteRecord } from "../schema";
import { nowIso } from "../utils/time";
import { getDeviceId } from "../utils/device";
import { enqueueDelete } from "./deletesRepo";

export async function listJobSites(params?: { clientId?: string }) {
  const all = await db.jobsites.filter((j) => !j.deletedAt).toArray();
  if (params?.clientId) return all.filter((j) => j.clientId === params.clientId);
  return all;
}

export async function getJobSiteById(id: string) {
  return db.jobsites.get(id);
}

export async function upsertJobSite(input: Partial<JobSiteRecord> & { id?: string; clientId: string; name: string }) {
  const existing = input.id ? await db.jobsites.get(input.id) : null;
  const id = existing?.id ?? input.id ?? crypto.randomUUID();
  const now = nowIso();

  const row: JobSiteRecord = {
    id,
    clientId: input.clientId,
    name: input.name,
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

  await db.jobsites.put(row);
  return row;
}

export async function softDeleteJobSite(id: string) {
  const now = nowIso();
  await db.jobsites.update(id, {
    deletedAt: now,
    updatedAt: now,
    pendingSync: 1,
    deviceId: getDeviceId(),
  });
  await enqueueDelete({ entity: "jobsites", entityId: id });
}

export async function getPendingJobSiteUpserts() {
  return db.jobsites.where("pendingSync").equals(1).toArray();
}

export async function markJobSitesSynced(ids: string[], serverTime: string) {
  await db.transaction("rw", db.jobsites, async () => {
    for (const id of ids) {
      await db.jobsites.update(id, { pendingSync: 0, lastSyncedAt: serverTime });
    }
  });
}
