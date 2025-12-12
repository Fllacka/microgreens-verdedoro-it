import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  LogOut, 
  LayoutDashboard, 
  ShoppingBag, 
  PenSquare, 
  Files, 
  Image, 
  ArrowLeftRight, 
  Users, 
  Settings, 
  Home, 
  Sprout,
  Sparkles,
  ChevronDown,
  Mail,
  FileText,
  Info,
  Palette,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const SIDEBAR_STATE_KEY = "admin-sidebar-collapsed";

const AdminSidebar = () => {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isPagesRoute = [
    "/admin/homepage",
    "/admin/chi-siamo", 
    "/admin/microgreens",
    "/admin/microgreens-su-misura",
    "/admin/contatti",
    "/admin/blog-overview",
    "/admin/pages"
  ].some(path => location.pathname.startsWith(path));

  const isSettingsRoute = [
    "/admin/media",
    "/admin/users",
    "/admin/redirects",
    "/admin/settings"
  ].some(path => location.pathname.startsWith(path));

  const [pagesOpen, setPagesOpen] = useState(isPagesRoute);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsRoute);

  useEffect(() => {
    if (isPagesRoute) setPagesOpen(true);
    if (isSettingsRoute) setSettingsOpen(true);
  }, [isPagesRoute, isSettingsRoute]);

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isExactMatch = (path: string) => location.pathname === path;

  const pageItems = [
    { title: "Homepage", url: "/admin/homepage", icon: Home },
    { title: "Chi Siamo", url: "/admin/chi-siamo", icon: Info },
    { title: "Microgreens", url: "/admin/microgreens", icon: Sprout, checkFn: () => isActive("/admin/microgreens") && !location.pathname.includes("su-misura") },
    { title: "Microgreens su Misura", url: "/admin/microgreens-su-misura", icon: Sparkles },
    { title: "Contatti", url: "/admin/contatti", icon: Mail },
    { title: "Blog", url: "/admin/blog-overview", icon: PenSquare },
    { title: "Altre Pagine", url: "/admin/pages", icon: FileText },
  ];

  const settingsItems = [
    { title: "Media Library", url: "/admin/media", icon: Image, adminOnly: false },
    { title: "Utenti", url: "/admin/users", icon: Users, adminOnly: true },
    { title: "Redirect", url: "/admin/redirects", icon: ArrowLeftRight, adminOnly: true },
    { title: "Logo & Generali", url: "/admin/settings", icon: Palette, adminOnly: true },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
          <LayoutDashboard className="h-6 w-6 text-primary shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-lg truncate">CMS Admin</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Dashboard - Top Level */}
        <SidebarGroup className="py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isExactMatch("/admin")} tooltip="Dashboard">
                <Link to="/admin">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Products - Top Level */}
        <SidebarGroup className="py-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/products")} tooltip="Prodotti">
                <Link to="/admin/products">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Prodotti</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Blog Posts - Top Level */}
        <SidebarGroup className="py-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/blog") && !isActive("/admin/blog-overview")} tooltip="Articoli Blog">
                <Link to="/admin/blog">
                  <PenSquare className="h-4 w-4" />
                  <span>Articoli Blog</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Pages Section - Collapsible */}
        <SidebarGroup className="py-2">
          <Collapsible open={!isCollapsed && pagesOpen} onOpenChange={setPagesOpen}>
            <SidebarGroupLabel asChild className="px-2">
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md transition-colors">
                <span className="flex items-center gap-2">
                  <Files className="h-4 w-4" />
                  {!isCollapsed && <span>Pagine</span>}
                </span>
                {!isCollapsed && (
                  <ChevronDown className={cn("h-4 w-4 transition-transform", !pagesOpen && "-rotate-90")} />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {pageItems.map((item) => {
                    const active = item.checkFn ? item.checkFn() : isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                          <Link to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Settings Section - Collapsible */}
        <SidebarGroup className="py-2">
          <Collapsible open={!isCollapsed && settingsOpen} onOpenChange={setSettingsOpen}>
            <SidebarGroupLabel asChild className="px-2">
              <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-sidebar-accent rounded-md transition-colors">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {!isCollapsed && <span>Impostazioni</span>}
                </span>
                {!isCollapsed && (
                  <ChevronDown className={cn("h-4 w-4 transition-transform", !settingsOpen && "-rotate-90")} />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsItems
                    .filter(item => !item.adminOnly || userRole === "admin")
                    .map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                          <Link to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Esci">
              <LogOut className="h-4 w-4" />
              <span>Esci</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

const AdminHeader = () => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="h-9 w-9"
        aria-label={isCollapsed ? "Espandi menu" : "Comprimi menu"}
      >
        {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </Button>
      <span className="font-medium text-sm md:hidden">CMS Admin</span>
    </header>
  );
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  // Get initial sidebar state from localStorage
  const getDefaultOpen = () => {
    const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
    return stored !== "true"; // Default to open (not collapsed)
  };

  useEffect(() => {
    if (!loading && (!user || (userRole !== "admin" && userRole !== "editor"))) {
      navigate("/admin/login");
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  }

  if (!user || (userRole !== "admin" && userRole !== "editor")) {
    return null;
  }

  return (
    <SidebarProvider 
      defaultOpen={getDefaultOpen()}
      onOpenChange={(open) => {
        localStorage.setItem(SIDEBAR_STATE_KEY, String(!open));
      }}
    >
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-3 md:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
