import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography, List, ListItem, ListItemText, IconButton, MenuItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { quotesRepo, type QuoteRow } from "@/db/repos/quotesRepo";
import { clientsRepo } from "@/db/repos/clientsRepo";

export function Quotes() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState<QuoteRow["status"]>("draft");
  const [totalPrice, setTotalPrice] = useState("0");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-local"],
    queryFn: () => clientsRepo.list(),
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes-local"],
    queryFn: () => quotesRepo.list(),
  });

  const clientMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const c of clients as any[]) m.set(c.id, c);
    return m;
  }, [clients]);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["quotes-local"] });
    await qc.invalidateQueries({ queryKey: ["clients-local"] });
  };

  const onCreate = async () => {
    if (!clientId) return;
    const total = Number(totalPrice || "0");
    await quotesRepo.upsert({
      clientId,
      status,
      totalPrice: isFinite(total) ? total : 0,
    } as Partial<QuoteRow>);
    setClientId("");
    setStatus("draft");
    setTotalPrice("0");
    setOpen(false);
    await refresh();
  };

  const onDelete = async (id: string) => {
    await quotesRepo.softDelete(id);
    await refresh();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Orçamentos</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Novo orçamento</Button>
      </Box>

      <Card>
        <CardContent>
          {quotes.length === 0 ? (
            <Typography color="text.secondary">Nenhum orçamento cadastrado.</Typography>
          ) : (
            <List>
              {(quotes as any[]).map((q) => (
                <ListItem
                  key={q.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => onDelete(q.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`${clientMap.get(q.clientId)?.name ?? "Cliente"} • R$ ${Number(q.totalPrice ?? 0).toFixed(2)}`}
                    secondary={`Status: ${q.status}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo orçamento</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField select label="Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {(clients as any[]).map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <MenuItem value="draft">draft</MenuItem>
            <MenuItem value="sent">sent</MenuItem>
            <MenuItem value="approved">approved</MenuItem>
            <MenuItem value="rejected">rejected</MenuItem>
          </TextField>

          <TextField
            label="Total (R$)"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            inputMode="decimal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={onCreate}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
