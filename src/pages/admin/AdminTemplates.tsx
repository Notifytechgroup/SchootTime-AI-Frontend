import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Rocket } from "lucide-react";
import { TemplateEditor } from "@/components/admin/TemplateEditor";
import { GraphicalTemplateEditor } from "@/components/admin/GraphicalTemplateEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleToggleDeploy = async (templateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("templates")
        .update({ is_deployed: !currentStatus })
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Template ${!currentStatus ? "deployed" : "undeployed"} successfully`,
      });
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    }
  };

  if (showEditor) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </h1>
          </div>
          
          <Tabs defaultValue="form" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="form">Form Editor</TabsTrigger>
              <TabsTrigger value="graphical">Graphical Editor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="form">
              <TemplateEditor
                template={editingTemplate}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </TabsContent>
            
            <TabsContent value="graphical">
              <GraphicalTemplateEditor
                onSave={(config) => {
                  // Convert graphical config to template format
                  handleSave();
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Template Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage timetable templates
            </p>
          </div>
          <Button onClick={() => setShowEditor(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-secondary" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No templates created yet. Create your first template to get started!
            </p>
            <Button onClick={() => setShowEditor(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="relative">
                  {template.preview_image ? (
                    <img
                      src={template.preview_image}
                      alt={template.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-secondary flex items-center justify-center">
                      <Eye className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge
                    variant={template.is_active ? "default" : "secondary"}
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                  >
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {template.school_type === "lower_primary" && "Lower Primary (Grade 1-3)"}
                      {template.school_type === "middle_primary" && "Middle Primary (Grade 4-6)"}
                      {template.school_type === "junior_high" && "Junior High School (Grade 7-9)"}
                      {template.school_type === "senior_high" && "Senior High School (Grade 10-12)"}
                    </p>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {template.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Periods:</span>
                      <span className="font-medium">{template.periods_per_day}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{template.period_duration}min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Usage:</span>
                      <span className="font-medium">{template.usage_count} schools</span>
                    </div>
                  </div>

                  {/* Deploy Toggle */}
                  <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      <Label htmlFor={`deploy-${template.id}`} className="cursor-pointer">
                        {template.is_deployed ? "Deployed to Schools" : "Private Template"}
                      </Label>
                    </div>
                    <Switch
                      id={`deploy-${template.id}`}
                      checked={template.is_deployed}
                      onCheckedChange={() => handleToggleDeploy(template.id, template.is_deployed)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminTemplates;
