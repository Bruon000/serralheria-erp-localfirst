import { nowIso } from "@/db/utils/nowIso";
import { getCompanyId } from "@/db/utils/companyId";

export function baseFields() {
  return {
    companyId: getCompanyId(),
    updatedAt: nowIso(),
    pendingSync: 1 as const,
    deletedAt: null as string | null,
    lastSyncedAt: null as string | null,
  };
}
