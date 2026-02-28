import Dexie, { type Table } from "dexie";

export interface BaseRecord {
  id: string;
  companyId?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  deletedAt?: string | null; // ISO (soft delete)
  version: number; // LWW/merge helper
  deviceId?: string | null;
  lastSyncedAt?: string | null; // serverTime ISO
  pendingSync?: number; // 1=pendente
}

export interface ClientRecord extends BaseRecord {
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  address?: string | null;
}

export interface JobSiteRecord extends BaseRecord {
  clientId: string;
  name: string;
  address?: string | null;
}

export interface QuoteRecord extends BaseRecord {
  clientId: string;
  jobSiteId?: string | null;
  status: string;
  subtotal: number;
  total: number;
  marginPct: number;
}

export interface QuoteItemRecord extends BaseRecord {
  companyId?: string;
  quoteId: string;
  description: string;
  width?: number | null;
  height?: number | null;
  unit: string;
  finish?: string | null;
  qty: number;
  cost: number;
  price: number;
  marginPct: number;
}

// Fila de deletes (offline-first): a UI faz softDelete e registra aqui
export interface DeleteRecord {
  id: string; // uuid do registro da fila
  entity: "clients" | "jobsites" | "quotes" | "quoteItems";
  entityId: string;
  companyId?: string;
  deletedAt: string; // ISO
  deviceId?: string | null;
  pendingSync?: number; // 1=pendente
  lastSyncedAt?: string | null;
}

export class AppDB extends Dexie {
  clients!: Table<ClientRecord, string>;
  jobsites!: Table<JobSiteRecord, string>;
  quotes!: Table<QuoteRecord, string>;
  quoteItems!: Table<QuoteItemRecord, string>;
  deletes!: Table<DeleteRecord, string>;

  constructor() {
    super("SerralheriaERP");

    this.version(2).stores({
      clients: "id, companyId, name, updatedAt, pendingSync, deletedAt",
      jobsites: "id, companyId, clientId, updatedAt, pendingSync, deletedAt",
      quotes: "id, companyId, clientId, status, updatedAt, pendingSync, deletedAt",
      quoteItems: "id, companyId, quoteId, updatedAt, pendingSync, deletedAt",
      deletes: "id, entity, entityId, companyId, deletedAt, pendingSync",
    });
  }
}

export const db = new AppDB();
