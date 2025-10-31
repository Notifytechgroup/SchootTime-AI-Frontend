import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Sparkles, Loader2, Download, Mail, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TimetableDisplay } from "@/components/TimetableDisplay";

interface Timetable {
  id: string;
  stream_id: string;
  generated_at: string;
  timetable_data: any;
  streams: {
    grade: number;
    stream_name: string;
  };
}

const Timetables = () => {
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [schoolId, setSchoolId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [template, setTemplate] = useState<string>("classic");

  useEffect(() => {
    fetchTimetables();
  }, [navigate]);

  const fetchTimetables = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", user.id)
      .single();

    if (profile) {
      setSchoolId(profile.school_id);

      // Fetch school template preference
      const { data: school } = await supabase
        .from("schools")
        .select("timetable_template")
        .eq("id", profile.school_id)
        .single();

      if (school) {
        setTemplate(school.timetable_template || "classic");
      }

      const { data: timetablesData } = await supabase
        .from("timetables")
        .select(
          `
          *,
          streams(grade, stream_name)
        `
        )
        .eq("school_id", profile.school_id)
        .order("generated_at", { ascending: false });

      setTimetables((timetablesData as any) || []);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      // Check if school has teachers and streams
      const [teachersCount, streamsCount] = await Promise.all([
        supabase
          .from("teachers")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId),
        supabase
          .from("streams")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId),
      ]);

      if (!teachersCount.count || teachersCount.count === 0) {
        toast.error("Please add teachers first!");
        setGenerating(false);
        return;
      }

      if (!streamsCount.count || streamsCount.count === 0) {
        toast.error("Please create streams first!");
        setGenerating(false);
        return;
      }

      // Call AI generation edge function
      const { data, error } = await supabase.functions.invoke(
        "generate-timetable",
        {
          body: { schoolId },
        }
      );

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success("Timetables generated successfully! 🎉");
      fetchTimetables();
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate timetables");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Calendar className="w-8 h-8" />
                AI Timetables
              </h1>
              <p className="text-white/80 mt-2">
                Generate and manage automated timetables
              </p>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gradient-primary text-white hover:opacity-90 gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Timetable
              </>
            )}
          </Button>
        </div>

        {generating && (
          <Card className="p-8 text-center gradient-secondary animate-slide-up">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">
              AI is working its magic... ✨
            </h3>
            <p className="text-muted-foreground">
              Creating optimal timetables for all streams
            </p>
          </Card>
        )}

        {timetables.length > 0 ? (
          <div className="space-y-6">
            {timetables.map((timetable, index) => (
              <Card
                key={timetable.id}
                className="p-6 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Badge className="text-lg px-4 py-2">
                      Grade {timetable.streams.grade} -{" "}
                      {timetable.streams.stream_name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Generated:{" "}
                      {new Date(timetable.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                  </div>
                </div>

                <TimetableDisplay
                  timetableData={timetable.timetable_data}
                  template={template}
                />
              </Card>
            ))}
          </div>
        ) : (
          !generating && (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                No timetables yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Generate your first AI-powered timetable
              </p>
              <Button
                onClick={handleGenerate}
                className="gradient-primary text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Timetable
              </Button>
            </Card>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default Timetables;