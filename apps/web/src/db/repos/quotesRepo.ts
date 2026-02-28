import type { BaseRow } from "@/db/types/base";
import { makeRepo } from "./repoFactory";

export type QuoteRow = BaseRow & {
  clientId: string;
  status: "draft" | "sent" | "approved" | "rejected";
  totalPrice: number;
};

export const quotesRepo = makeRepo<QuoteRow>("quotes");
