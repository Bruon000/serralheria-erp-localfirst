export type Id = string;

export type BaseRow = {
  id: Id;
  companyId: Id;
  updatedAt: string;     // ISO
  pendingSync: 0 | 1;
  deletedAt?: string | null;
  lastSyncedAt?: string | null;
};

export type DeleteRow = BaseRow & {
  entity: "clients" | "jobsites" | "quotes" | "quoteItems";
  entityId: Id;
};
