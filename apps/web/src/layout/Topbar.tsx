import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, IconButton, Typography, Box, Chip, Button, Menu, MenuItem,
  Snackbar, Alert
} from "@mui/material";
import { Sync, Person, Logout } from "@mui/icons-material";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSync } from "@/hooks/useSync";
import { clearTokens } from "@/routes/ProtectedRoute";

export function Topbar() {
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const { sync, syncing } = useSync();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("OK");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error" | "info">("info");

  const showToast = (severity: "success" | "error" | "info", msg: string) => {
    setToastSeverity(severity);
    setToastMsg(msg);
    setToastOpen(true);
  };

  const handleLogout = () => {
    clearTokens();
    navigate("/login", { replace: true });
  };

  const handleSyncClick = async () => {
    if (!online) {
      showToast("info", "Você está offline. Conecte para sincronizar.");
      return;
    }
    try {
      await sync();
      showToast("success", "Sincronizado com sucesso!");
    } catch (e: any) {
      showToast("error", String(e?.message ?? "Falha ao sincronizar"));
    }
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Serralheria ERP
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              size="small"
              label={online ? "Online" : "Offline"}
              color={online ? "success" : "default"}
              variant="outlined"
            />

            <Button
              size="small"
              startIcon={<Sync />}
              onClick={handleSyncClick}
              disabled={syncing}
            >
              {syncing ? "Sincronizando..." : "Sincronizar"}
            </Button>

            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Person />
            </IconButton>

            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> Sair
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Snackbar open={toastOpen} autoHideDuration={2500} onClose={() => setToastOpen(false)}>
        <Alert severity={toastSeverity} onClose={() => setToastOpen(false)} sx={{ width: "100%" }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
