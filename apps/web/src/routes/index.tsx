import { Outlet } from "react-router-dom";import { MainLayout } from "@/layout/MainLayout";import { ProtectedRoute } from "./ProtectedRoute";import { Login } from "@/pages/Login";import { Dashboard } from "@/pages/Dashboard";import { Clients as ClientList } from "@/pages/Clients";import { Jobsites as JobSiteList } from "@/pages/Jobsites";import { Quotes as QuoteList } from "@/pages/Quotes";import { QuoteDetail } from "@/pages/quotes/QuoteDetail";import { CustomFields } from "@/pages/settings/CustomFields";import { Workflows } from "@/pages/settings/Workflows";import { Templates } from "@/pages/settings/Templates";import { Integrations } from "@/pages/settings/Integrations";import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";export const Routes = {  Login,  ProtectedLayout: () => (    <ProtectedRoute>      <MainLayout>        <Outlet />      </MainLayout>    </ProtectedRoute>  ),  Dashboard,  ClientList,  JobSiteList,  QuoteList,  QuoteDetail,  CustomFields,  Workflows,  Templates,  Integrations,  Placeholder,};function Placeholder() {  return <PlaceholderPage title="Em breve" />;}






