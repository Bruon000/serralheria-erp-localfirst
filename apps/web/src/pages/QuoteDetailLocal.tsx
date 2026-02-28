import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography, List, ListItem, ListItemText, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { quotesRepo } from "@/db/repos/quotesRepo";
import { quoteItemsRepo, type QuoteItemRow } from "@/db/repos/quoteItemsRepo";

export function QuoteDetailLocal() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0");

  const { data: quote } = useQuery({
    queryKey: ["quote-local", id],
    queryFn: () => quotesRepo.getById(id),
    enabled: !!id,
  });

  const { data: items = [] } = useQuery({
    queryKey: ["quote-items-local", id],
    queryFn: async () => {
      const all = await quoteItemsRepo.list();
      return all.filter((x: any) => x.quoteId === id);
    },
    enabled: !!id,
  });

  const total = useMemo(() => {
    return (items as any[]).reduce((acc, it) => acc + Number(it.price ?? 0) * Number(it.quantity ?? 0), 0);
  }, [items]);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["quote-local", id] });
    await qc.invalidateQueries({ queryKey: ["quote-items-local", id] });
  };

  const saveTotal = async () => {
    if (!quote) return;
    await quotesRepo.upsert({ id: (quote as any).id, totalPrice: total, clientId: (quote as any).clientId, status: (quote as any).status } as any);
    await refresh();
  };

  const onAddItem = async () => {
    const p = product.trim();
    if (!p || !id) return;
    const q = Math.max(1, Number(quantity || "1"));
    const pr = Math.max(0, Number(price || "0"));

    await quoteItemsRepo.upsert({
      quoteId: id,
      product: p,
      quantity: q,
      price: pr,
    } as Partial<QuoteItemRow>);

    setProduct("");
    setQuantity("1");
    setPrice("0");
    setOpen(false);

    await refresh();
    await saveTotal();
  };

  const onDeleteItem = async (itemId: string) => {
    await quoteItemsRepo.softDelete(itemId);
    await refresh();
    await saveTotal();
  };

  if (!id) return <Box sx={{ p: 2 }}><Typography>Orçamento inválido</Typography></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Orçamento</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Adicionar item</Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1">ID: {id}</Typography>
          <Typography color="text.secondary">Total: R$ {Number(total).toFixed(2)}</Typography>
          <Button size="small" sx={{ mt: 1 }} onClick={saveTotal}>Recalcular total</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {(items as any[]).length === 0 ? (
            <Typography color="text.secondary">Nenhum item.</Typography>
          ) : (
            <List>
              {(items as any[]).map((it) => (
                <ListItem
                  key={it.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => onDeleteItem(it.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`${it.product} • ${it.quantity} x R$ ${Number(it.price ?? 0).toFixed(2)}`}
                    secondary={`Subtotal: R$ ${(Number(it.quantity ?? 0) * Number(it.price ?? 0)).toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo item</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField label="Produto" value={product} onChange={(e) => setProduct(e.target.value)} autoFocus />
          <TextField label="Quantidade" value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="numeric" />
          <TextField label="Preço" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={onAddItem}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
