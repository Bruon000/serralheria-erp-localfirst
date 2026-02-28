import Dexie from "dexie";

export const db = new Dexie("ERP_SerralheriaDB");

db.version(1).stores({
  clients: "++id,name,address",
  jobsites: "++id,clientId,name,address",
  quotes: "++id,clientId,totalPrice,status",
  quoteItems: "++id,quoteId,product,quantity,price",
  deletes: "++id,entity,entityId",
});

