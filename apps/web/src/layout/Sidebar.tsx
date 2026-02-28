import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Drawer,
  Typography,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  People,
  Business,
  RequestQuote,
  ShoppingCart,
  Build,
  Inventory,
  Payment,
  Assessment,
  Settings,
  AccountTree,
  Description,
  IntegrationInstructions,
} from "@mui/icons-material";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  width: number;
  collapsedWidth: number;
}

type MenuLeaf = { label: string; path: string; icon: JSX.Element };
type MenuGroup = { label: string; icon: JSX.Element; items: MenuLeaf[] };

const menuItems: Array<MenuLeaf | MenuGroup> = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  {
    label: "Comercial",
    icon: <RequestQuote />,
    items: [
      { label: "Clientes", path: "/clients", icon: <People /> },
      { label: "Obras", path: "/jobsites", icon: <Business /> },
      { label: "Orçamentos", path: "/quotes", icon: <RequestQuote /> },
      { label: "Pedidos", path: "/pedidos", icon: <ShoppingCart /> },
    ],
  },
  { label: "Produção", path: "/producao", icon: <Build /> },
  { label: "Estoque", path: "/estoque", icon: <Inventory /> },
  { label: "Financeiro", path: "/financeiro", icon: <Payment /> },
  { label: "Relatórios", path: "/relatorios", icon: <Assessment /> },
  {
    label: "Configurações",
    icon: <Settings />,
    items: [
      { label: "Campos customizados", path: "/settings/custom-fields", icon: <AccountTree /> },
      { label: "Workflows", path: "/settings/workflows", icon: <AccountTree /> },
      { label: "Templates", path: "/settings/templates", icon: <Description /> },
      { label: "Integrações", path: "/settings/integrations", icon: <IntegrationInstructions /> },
    ],
  },
];

export function Sidebar({ open, width, collapsedWidth }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Comercial: true,
    Configurações: false,
  });

  const toggleExpand = (key: string) => {
    setExpanded((e) => ({ ...e, [key]: !e[key] }));
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? width : collapsedWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? width : collapsedWidth,
          boxSizing: "border-box",
          transition: "width 0.2s",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ py: 2, px: 1.5 }}>
        <Typography variant="h6" noWrap sx={{ px: 1.5, fontWeight: 700 }}>
          {open ? "Serralheria ERP" : "ERP"}
        </Typography>
      </Box>

      <List>
        {menuItems.map((item) => {
          if ("items" in item) {
            const isOpen = expanded[item.label] ?? false;

            return (
              <Box key={item.label}>
                <ListItemButton
                  onClick={() => toggleExpand(item.label)}
                  sx={{ borderRadius: 1, mx: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  {open && (
                    <>
                      <ListItemText primary={item.label} />
                      {isOpen ? <ExpandLess /> : <ExpandMore />}
                    </>
                  )}
                </ListItemButton>

                <Collapse in={isOpen && open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.items.map((sub) => (
                      <ListItemButton
                        key={sub.path}
                        onClick={() => navigate(sub.path)}
                        selected={isActive(sub.path)}
                        sx={{ pl: 4, borderRadius: 1, mx: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>{sub.icon}</ListItemIcon>
                        {open && <ListItemText primary={sub.label} />}
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }

          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              selected={isActive(item.path)}
              sx={{ borderRadius: 1, mx: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              {open && <ListItemText primary={item.label} />}
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
