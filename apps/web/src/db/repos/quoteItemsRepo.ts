import type { BaseRow } from "@/db/types/base";
import { makeRepo } from "./repoFactory";

export type QuoteItemRow = BaseRow & {
  quoteId: string;
  product: string;
  quantity: number;
  price: number;
};

export const quoteItemsRepo = makeRepo<QuoteItemRow>("quoteItems");
