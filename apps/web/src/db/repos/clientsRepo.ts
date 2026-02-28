import type { BaseRow } from "@/db/types/base";
import { makeRepo } from "./repoFactory";

export type ClientRow = BaseRow & {
  name: string;
  address?: string;
};

export const clientsRepo = makeRepo<ClientRow>("clients");
