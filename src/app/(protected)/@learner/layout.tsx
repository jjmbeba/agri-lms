import { AppSidebar } from "@/components/features/admin/dashboard/app-sidebar";
import { SiteHeader } from "@/components/features/admin/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 15)",
        } as React.CSSProperties
      }
    >
      <AppSidebar userRole="learner" variant="sidebar" />
      <SidebarInset className="container-type:inline-size container-name:main">
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
