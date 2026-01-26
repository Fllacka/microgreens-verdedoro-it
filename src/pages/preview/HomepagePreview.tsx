import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Index from "@/pages/Index";

const HomepagePreview = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/admin/login");
      return;
    }
    if (userRole === "admin" || userRole === "editor") {
      setAuthorized(true);
    } else {
      toast.error("Non hai i permessi per visualizzare l'anteprima");
      navigate("/");
    }
  }, [user, userRole, authLoading, navigate]);

  if (!authorized) return null;

  return (
    <>
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-yellow-900 py-2 px-4 text-center sticky top-0 z-50">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Modalità Anteprima - Homepage</span>
          <Button
            variant="outline"
            size="sm"
            className="ml-4 bg-white hover:bg-yellow-50"
            onClick={() => navigate("/admin/homepage")}
          >
            Torna all'editor
          </Button>
        </div>
      </div>

      {/* Render the actual homepage with preview mode */}
      <Index isPreview={true} />
    </>
  );
};

export default HomepagePreview;
