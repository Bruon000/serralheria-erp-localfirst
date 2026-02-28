import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, List, ListItem, ListItemText, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { clientsRepo, type ClientRow } from "@/db/repos/clientsRepo";

export function Clients() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-local"],
    queryFn: () => clientsRepo.list(),
  });

  const refresh = async () => qc.invalidateQueries({ queryKey: ["clients-local"] });

  const onCreate = async () => {
    const n = name.trim();
    if (!n) return;
    await clientsRepo.upsert({ name: n, address: address.trim() } as Partial<ClientRow>);
    setName("");
    setAddress("");
    setOpen(false);
    await refresh();
  };

  const onDelete = async (id: string) => {
    await clientsRepo.softDelete(id);
    await refresh();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Clientes</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Novo cliente</Button>
      </Box>

      <Card>
        <CardContent>
          {clients.length === 0 ? (
            <Typography color="text.secondary">Nenhum cliente cadastrado.</Typography>
          ) : (
            <List>
              {clients.map((c: any) => (
                <ListItem
                  key={c.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => onDelete(c.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={c.name} secondary={c.address ?? ""} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo cliente</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <TextField label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={onCreate}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
