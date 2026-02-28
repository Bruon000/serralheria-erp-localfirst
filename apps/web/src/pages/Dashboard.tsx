import { useQuery } from "@tanstack/react-query";
import { Box, Card, CardContent, Grid, Typography, List, ListItem, ListItemText } from "@mui/material";
import { apiJson } from "@/api/client";
import { activityFeed } from "@/api/endpoints";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Seg", orcamentos: 4, aprovados: 2 },
  { name: "Ter", orcamentos: 6, aprovados: 3 },
  { name: "Qua", orcamentos: 3, aprovados: 1 },
  { name: "Qui", orcamentos: 8, aprovados: 5 },
  { name: "Sex", orcamentos: 5, aprovados: 2 },
];

export function Dashboard() {
  const { data: activities = [] } = useQuery({
    queryKey: ["activity-feed"],
    queryFn: () => apiJson<any[]>(activityFeed),
  });

  const chart = (
    <BarChart data={chartData}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="orcamentos" name="Orçamentos" />
      <Bar dataKey="aprovados" name="Aprovados" />
    </BarChart>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary">Orçamentos (mês)</Typography>
            <Typography variant="h4">24</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary">Aprovados</Typography>
            <Typography variant="h4">13</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary">Em produção</Typography>
            <Typography variant="h4">—</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary">A receber</Typography>
            <Typography variant="h4">—</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Orçamentos por semana
              </Typography>

              <ResponsiveContainer width="100%" height={280}>
                {chart as any}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Últimas atividades
              </Typography>

              <List dense>
                {activities.slice(0, 8).map((a: any) => (
                  <ListItem key={a.id}>
                    <ListItemText primary={a.type} secondary={`${a.entityType} • ${a.user?.name || ""}`} />
                  </ListItem>
                ))}

                {activities.length === 0 && (
                  <ListItem>
                    <ListItemText secondary="Nenhuma atividade recente" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
