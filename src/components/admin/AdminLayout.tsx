import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  LogOut, 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  Files, 
  Image, 
  ArrowLeftRight, 
  Users, 
  Settings, 
  Home, 
  Leaf,
  ChevronDown,
  ChevronRight,
  Phone
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which sections should be open based on current route
  const isPagesRoute = [
    "/admin/homepage",
    "/admin/chi-siamo", 
    "/admin/microgreens",
    "/admin/microgreens-su-misura",
    "/admin/contatti",
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
    if (!loading && (!user || (userRole !== "admin" && userRole !== "editor"))) {
      navigate("/admin/login");
    }
  }, [user, userRole, loading, navigate]);

  // Update open state when route changes
  useEffect(() => {
    if (isPagesRoute) setPagesOpen(true);
    if (isSettingsRoute) setSettingsOpen(true);
  }, [isPagesRoute, isSettingsRoute]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || (userRole !== "admin" && userRole !== "editor")) {
    return null;
  }

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isExactMatch = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card p-4 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">CMS Admin</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <nav className="space-y-1">
          {/* Dashboard */}
          <Link to="/admin">
            <Button variant={isExactMatch("/admin") ? "default" : "ghost"} className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          {/* Pages Section */}
          <Collapsible open={pagesOpen} onOpenChange={setPagesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant={isPagesRoute && !pagesOpen ? "secondary" : "ghost"} className="w-full justify-between">
                <span className="flex items-center">
                  <Files className="mr-2 h-4 w-4" />
                  Pagine
                </span>
                {pagesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1 mt-1">
              <Link to="/admin/homepage">
                <Button variant={isActive("/admin/homepage") ? "default" : "ghost"} className="w-full justify-start" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Homepage
                </Button>
              </Link>
              <Link to="/admin/chi-siamo">
                <Button variant={isActive("/admin/chi-siamo") ? "default" : "ghost"} className="w-full justify-start" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Chi Siamo
                </Button>
              </Link>
              <Link to="/admin/microgreens">
                <Button variant={isActive("/admin/microgreens") && !location.pathname.includes("su-misura") ? "default" : "ghost"} className="w-full justify-start" size="sm">
                  <Leaf className="mr-2 h-4 w-4" />
                  Microgreens
                </Button>
              </Link>
              <Link to="/admin/microgreens-su-misura">
                <Button variant={isActive("/admin/microgreens-su-misura") ? "default" : "ghost"} className="w-full justify-start" size="sm">
                  <Leaf className="mr-2 h-4 w-4" />
                  Microgreens su Misura
                </Button>
              </Link>
              <Link to="/admin/contatti">
                <Button variant={isActive("/admin/contatti") ? "default" : "ghost"} className="w-full justify-start" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Contatti
                </Button>
              </Link>
              <Link to="/admin/pages">
                <Button variant={isActive("/admin/pages") ? "default" : "ghost"} className="w-full justify-start" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Altre Pagine
                </Button>
              </Link>
            </CollapsibleContent>
          </Collapsible>

          {/* Products */}
          <Link to="/admin/products">
            <Button variant={isActive("/admin/products") ? "default" : "ghost"} className="w-full justify-start">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Prodotti
            </Button>
          </Link>

          {/* Blog Posts */}
          <Link to="/admin/blog">
            <Button variant={isActive("/admin/blog") ? "default" : "ghost"} className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Blog
            </Button>
          </Link>

          {/* Settings Section */}
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant={isSettingsRoute && !settingsOpen ? "secondary" : "ghost"} className="w-full justify-between">
                <span className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Impostazioni
                </span>
                {settingsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1 mt-1">
              <Link to="/admin/media">
                <Button variant={isActive("/admin/media") ? "default" : "ghost"} className="w-full justify-start" size="sm">
                  <Image className="mr-2 h-4 w-4" />
                  Media Library
                </Button>
              </Link>
              {userRole === "admin" && (
                <>
                  <Link to="/admin/users">
                    <Button variant={isActive("/admin/users") ? "default" : "ghost"} className="w-full justify-start" size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      Utenti
                    </Button>
                  </Link>
                  <Link to="/admin/redirects">
                    <Button variant={isActive("/admin/redirects") ? "default" : "ghost"} className="w-full justify-start" size="sm">
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      Redirect
                    </Button>
                  </Link>
                  <Link to="/admin/settings">
                    <Button variant={isActive("/admin/settings") ? "default" : "ghost"} className="w-full justify-start" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Logo & Generali
                    </Button>
                  </Link>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Esci
          </Button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
};
