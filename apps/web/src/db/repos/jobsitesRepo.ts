import type { BaseRow } from "@/db/types/base";
import { makeRepo } from "./repoFactory";

export type JobsiteRow = BaseRow & {
  clientId: string;
  name: string;
  address?: string;
};

export const jobsitesRepo = makeRepo<JobsiteRow>("jobsites");
