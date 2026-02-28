import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography, List, ListItem, ListItemText, IconButton, MenuItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { jobsitesRepo, type JobsiteRow } from "@/db/repos/jobsitesRepo";
import { clientsRepo } from "@/db/repos/clientsRepo";

export function Jobsites() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-local"],
    queryFn: () => clientsRepo.list(),
  });

  const { data: jobsites = [] } = useQuery({
    queryKey: ["jobsites-local"],
    queryFn: () => jobsitesRepo.list(),
  });

  const clientMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const c of clients as any[]) m.set(c.id, c);
    return m;
  }, [clients]);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["jobsites-local"] });
    await qc.invalidateQueries({ queryKey: ["clients-local"] });
  };

  const onCreate = async () => {
    const n = name.trim();
    if (!n || !clientId) return;

    await jobsitesRepo.upsert({
      clientId,
      name: n,
      address: address.trim(),
    } as Partial<JobsiteRow>);

    setClientId("");
    setName("");
    setAddress("");
    setOpen(false);
    await refresh();
  };

  const onDelete = async (id: string) => {
    await jobsitesRepo.softDelete(id);
    await refresh();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Obras</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Nova obra</Button>
      </Box>

      <Card>
        <CardContent>
          {jobsites.length === 0 ? (
            <Typography color="text.secondary">Nenhuma obra cadastrada.</Typography>
          ) : (
            <List>
              {(jobsites as any[]).map((j) => (
                <ListItem
                  key={j.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => onDelete(j.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={j.name}
                    secondary={`${clientMap.get(j.clientId)?.name ?? "Cliente desconhecido"}${j.address ? " • " + j.address : ""}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova obra</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField select label="Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {(clients as any[]).map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
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
