import { ReactNode, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, ShoppingBag, FileText, Files, Image, ArrowLeftRight, Users, Settings, Home, Leaf } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || (userRole !== "admin" && userRole !== "editor"))) {
      navigate("/admin/login");
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || (userRole !== "admin" && userRole !== "editor")) {
    return null;
  }

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">CMS Admin</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <nav className="space-y-2">
          <Link to="/admin">
            <Button variant={isActive("/admin") && location.pathname === "/admin" ? "default" : "ghost"} className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/admin/homepage">
            <Button variant={isActive("/admin/homepage") ? "default" : "ghost"} className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Homepage
            </Button>
          </Link>
          <Link to="/admin/chi-siamo">
            <Button variant={isActive("/admin/chi-siamo") ? "default" : "ghost"} className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Chi Siamo
            </Button>
          </Link>
          <Link to="/admin/microgreens">
            <Button variant={isActive("/admin/microgreens") && !location.pathname.includes("custom") ? "default" : "ghost"} className="w-full justify-start">
              <Leaf className="mr-2 h-4 w-4" />
              Microgreens Page
            </Button>
          </Link>
          <Link to="/admin/microgreens-su-misura">
            <Button variant={isActive("/admin/microgreens-su-misura") ? "default" : "ghost"} className="w-full justify-start">
              <Leaf className="mr-2 h-4 w-4" />
              Microgreens su Misura
            </Button>
          </Link>
          <Link to="/admin/contatti">
            <Button variant={isActive("/admin/contatti") ? "default" : "ghost"} className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Contatti
            </Button>
          </Link>
          <Link to="/admin/products">
            <Button variant={isActive("/admin/products") ? "default" : "ghost"} className="w-full justify-start">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Products
            </Button>
          </Link>
          <Link to="/admin/blog">
            <Button variant={isActive("/admin/blog") ? "default" : "ghost"} className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Blog Posts
            </Button>
          </Link>
          <Link to="/admin/pages">
            <Button variant={isActive("/admin/pages") ? "default" : "ghost"} className="w-full justify-start">
              <Files className="mr-2 h-4 w-4" />
              Pages
            </Button>
          </Link>
          <Link to="/admin/media">
            <Button variant={isActive("/admin/media") ? "default" : "ghost"} className="w-full justify-start">
              <Image className="mr-2 h-4 w-4" />
              Media Library
            </Button>
          </Link>
          {userRole === "admin" && (
            <>
              <Link to="/admin/users">
                <Button variant={isActive("/admin/users") ? "default" : "ghost"} className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </Button>
              </Link>
              <Link to="/admin/redirects">
              <Button variant={isActive("/admin/redirects") ? "default" : "ghost"} className="w-full justify-start">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
                Redirects
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant={isActive("/admin/settings") ? "default" : "ghost"} className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Impostazioni
              </Button>
            </Link>
            </>
          )}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
};