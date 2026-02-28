import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async sync(companyId: string, userId: string, payload: {
    lastSync?: string | null;
    deviceId: string;
    changes?: {
      clients?: any[];
      jobsites?: any[];
      quotes?: any[];
      quoteItems?: any[];
      deletes?: { table: string; id: string }[];
    };
  }) {
    const lastSync = payload.lastSync ? new Date(payload.lastSync) : null;
    const lastSyncDate = lastSync ?? new Date(0);
    const deviceId = payload.deviceId;
    const changes = payload.changes || {};
    const deletes = (payload.changes as any)?.deletes || (payload as any).deletes || [];
    const serverTime = new Date();

    // Atualizar o dispositivo de sincronização
    await this.prisma.syncDevice.upsert({
      where: { deviceId },
      create: { companyId, deviceId, lastSync: serverTime },
      update: { lastSync: serverTime },
    });

    const conflicts: { table: string; id: string; reason: string }[] = [];

    

function pickClientFields(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? null,
    phone: row.phone ?? null,
    document: row.document ?? null,
    address: row.address ?? null,
    deletedAt: row.deletedAt ? new Date(row.deletedAt) : null,
    version: row.version ?? 1,
    deviceId: row.deviceId ?? null,
  };
}
// Processar mudanças de clients
    if (changes.clients?.length) {
      for (const row of changes.clients) {
        try {
          const data = pickClientFields(row);
await this.prisma.client.upsert({
  where: { id: data.id },
  create: { ...data, companyId, lastSyncedAt: serverTime },
  update: { ...data, lastSyncedAt: serverTime },
});
        } catch (e) {
          conflicts.push({ table: "clients", id: row.id, reason: String(e) });
        }
      }
    }

    // Processar mudanças de jobsites
    if (changes.jobsites?.length) {
      for (const row of changes.jobsites) {
        try {
          await this.prisma.jobSite.upsert({
            where: { id: row.id },
            create: { ...row, companyId, lastSyncedAt: serverTime },
            update: { ...row, lastSyncedAt: serverTime },
          });
        } catch (e) {
          conflicts.push({ table: "jobsites", id: row.id, reason: String(e) });
        }
      }
    }

    // Processar mudanças de quotes
    if (changes.quotes?.length) {
      for (const row of changes.quotes) {
        try {
          await this.prisma.quote.upsert({
            where: { id: row.id },
            create: { ...row, companyId, lastSyncedAt: serverTime },
            update: { ...row, lastSyncedAt: serverTime },
          });
        } catch (e) {
          conflicts.push({ table: "quotes", id: row.id, reason: String(e) });
        }
      }
    }

    // Processar deletes
    if (deletes?.length) {
      for (const d of deletes) {
        try {
          if (d.entity === "clients") await this.prisma.client.updateMany({ where: { id: d.entityId, companyId }, data: { deletedAt: new Date(d.deletedAt ?? serverTime) } });
          if (d.entity === "jobsites") await this.prisma.jobSite.updateMany({ where: { id: d.entityId, companyId }, data: { deletedAt: new Date(d.deletedAt ?? serverTime) } });
          if (d.entity === "quotes") await this.prisma.quote.updateMany({ where: { id: d.entityId, companyId }, data: { deletedAt: new Date(d.deletedAt ?? serverTime) } });
          if (d.entity === "quoteItems") await this.prisma.quoteItem.updateMany({ where: { id: d.entityId }, data: { deletedAt: new Date(d.deletedAt ?? serverTime) } });
        } catch {}
      }
    }

    // Obter alterações no servidor (clientes, jobsites, quotes)
    const serverChanges: any = {
      clients: [],
      jobsites: [],
      quotes: [],
      quoteItems: [],
      deletes: [],
    };

    const clients = await this.prisma.client.findMany({ where: { companyId, updatedAt: { gt: lastSyncDate } } });
    serverChanges.clients = clients;

    const jobsites = await this.prisma.jobSite.findMany({ where: { companyId, updatedAt: { gt: lastSyncDate } } });
    serverChanges.jobsites = jobsites;

    const quotes = await this.prisma.quote.findMany({ where: { companyId, updatedAt: { gt: lastSyncDate } }, include: { items: true } });
    serverChanges.quotes = quotes.map(q => { const { items, ...rest } = q; return rest; });
    serverChanges.quoteItems = quotes.flatMap(q => q.items);

    // Obter deletes
    const deletedClients = await this.prisma.client.findMany({ where: { companyId, deletedAt: { gt: lastSyncDate } }, select: { id: true, deletedAt: true } });
    const deletedJobsites = await this.prisma.jobSite.findMany({ where: { companyId, deletedAt: { gt: lastSyncDate } }, select: { id: true, deletedAt: true } });
    const deletedQuotes = await this.prisma.quote.findMany({ where: { companyId, deletedAt: { gt: lastSyncDate } }, select: { id: true, deletedAt: true } });

    const companyQuoteIds = (await this.prisma.quote.findMany({ where: { companyId }, select: { id: true } })).map(q => q.id);
    const deletedQuoteItems = await this.prisma.quoteItem.findMany({ where: { quoteId: { in: companyQuoteIds }, deletedAt: { gt: lastSyncDate } }, select: { id: true, deletedAt: true, quoteId: true } });

    serverChanges.deletes = [
      ...deletedClients.map(x => ({ entity: "clients", entityId: x.id, deletedAt: x.deletedAt })),
      ...deletedJobsites.map(x => ({ entity: "jobsites", entityId: x.id, deletedAt: x.deletedAt })),
      ...deletedQuotes.map(x => ({ entity: "quotes", entityId: x.id, deletedAt: x.deletedAt })),
      ...deletedQuoteItems.map(x => ({ entity: "quoteItems", entityId: x.id, deletedAt: x.deletedAt })),
    ];

    return {
      serverTime: serverTime.toISOString(),
      changes: serverChanges,
      conflicts: conflicts.length ? conflicts : undefined,
    };
  }
}


