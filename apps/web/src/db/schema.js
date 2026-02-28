import Dexie from "dexie";

export const db = new Dexie("ERP_SerralheriaDB");

db.version(4).stores({
  clients:    "id, name, pendingSync, updatedAt, deletedAt",
  jobsites:   "id, clientId, name, pendingSync, updatedAt, deletedAt",
  quotes:     "id, clientId, status, pendingSync, updatedAt, deletedAt",
  quoteItems: "id, quoteId, product, pendingSync, updatedAt, deletedAt",
  deletes:    "id, entity, entityId, pendingSync, deletedAt, updatedAt",
});

export default db;
