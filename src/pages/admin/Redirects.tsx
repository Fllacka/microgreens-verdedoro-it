import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminRedirects = () => {
  const [redirects, setRedirects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fromPath: "",
    toPath: "",
    redirectType: "301",
    active: true,
  });

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    try {
      const { data, error } = await supabase
        .from("redirects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRedirects(data || []);
    } catch (error) {
      console.error("Error fetching redirects:", error);
      toast({
        title: "Error",
        description: "Failed to load redirects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const redirectData = {
        from_path: formData.fromPath,
        to_path: formData.toPath,
        redirect_type: parseInt(formData.redirectType),
        active: formData.active,
      };

      if (editingId) {
        const { error } = await supabase
          .from("redirects")
          .update(redirectData)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("redirects").insert(redirectData);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Redirect ${editingId ? "updated" : "created"} successfully`,
      });

      setDialogOpen(false);
      resetForm();
      fetchRedirects();
    } catch (error: any) {
      console.error("Error saving redirect:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save redirect",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (redirect: any) => {
    setEditingId(redirect.id);
    setFormData({
      fromPath: redirect.from_path,
      toPath: redirect.to_path,
      redirectType: redirect.redirect_type.toString(),
      active: redirect.active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this redirect?")) return;

    try {
      const { error } = await supabase.from("redirects").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Redirect deleted successfully",
      });
      fetchRedirects();
    } catch (error) {
      console.error("Error deleting redirect:", error);
      toast({
        title: "Error",
        description: "Failed to delete redirect",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      fromPath: "",
      toPath: "",
      redirectType: "301",
      active: true,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Redirects</h1>
            <p className="text-muted-foreground">Manage URL redirects (301/302)</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Redirect
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Redirect" : "New Redirect"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fromPath">From Path *</Label>
                  <Input
                    id="fromPath"
                    value={formData.fromPath}
                    onChange={(e) => setFormData({ ...formData, fromPath: e.target.value })}
                    placeholder="/old-page"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toPath">To Path *</Label>
                  <Input
                    id="toPath"
                    value={formData.toPath}
                    onChange={(e) => setFormData({ ...formData, toPath: e.target.value })}
                    placeholder="/new-page"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redirectType">Redirect Type</Label>
                  <Select value={formData.redirectType} onValueChange={(value) => setFormData({ ...formData, redirectType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="301">301 (Permanent)</SelectItem>
                      <SelectItem value="302">302 (Temporary)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Active</Label>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"} Redirect
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Path</TableHead>
                <TableHead>To Path</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell className="font-mono text-sm">{redirect.from_path}</TableCell>
                  <TableCell className="font-mono text-sm">{redirect.to_path}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{redirect.redirect_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={redirect.active ? "default" : "secondary"}>
                      {redirect.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(redirect)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(redirect.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {redirects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No redirects found. Create your first redirect!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRedirects;