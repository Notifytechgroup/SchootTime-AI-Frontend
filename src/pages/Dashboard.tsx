import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TemplateSelector } from "@/components/TemplateSelector";
import { SchoolTypeSelector } from "@/components/SchoolTypeSelector";
import { PastTimetableUpload } from "@/components/PastTimetableUpload";
import LightRays from "@/components/effects/LightRays";
import Threads from "@/components/effects/Threads";
import {
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Stats {
  teachers: number;
  streams: number;
  timetables: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    teachers: 0,
    streams: 0,
    timetables: 0,
  });
  const [schoolId, setSchoolId] = useState<string>("");
  const [subscription, setSubscription] = useState<any>(null);
  const [currentTemplate, setCurrentTemplate] = useState<string>("classic");

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        setCurrentTemplate(school.timetable_template || "classic");
      }

        // Fetch stats
        const [teachersCount, streamsCount, timetablesCount, subData] =
          await Promise.all([
            supabase
              .from("teachers")
              .select("*", { count: "exact", head: true })
              .eq("school_id", profile.school_id),
            supabase
              .from("streams")
              .select("*", { count: "exact", head: true })
              .eq("school_id", profile.school_id),
            supabase
              .from("timetables")
              .select("*", { count: "exact", head: true })
              .eq("school_id", profile.school_id),
            supabase
              .from("subscriptions")
              .select("*")
              .eq("school_id", profile.school_id)
              .single(),
          ]);

        setStats({
          teachers: teachersCount.count || 0,
          streams: streamsCount.count || 0,
          timetables: timetablesCount.count || 0,
        });

        setSubscription(subData.data);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const cards = [
    {
      title: "Teachers",
      count: stats.teachers,
      icon: Users,
      color: "bg-primary",
      path: "/teachers",
      description: "Manage your teaching staff",
    },
    {
      title: "Streams & Classes",
      count: stats.streams,
      icon: BookOpen,
      color: "bg-success",
      path: "/streams",
      description: "Configure grades and streams",
    },
    {
      title: "Timetables",
      count: stats.timetables,
      icon: Calendar,
      color: "bg-primary",
      path: "/timetables",
      description: "Generate AI timetables",
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Powered by Notify AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2"
        >
          <span className="text-sm text-muted-foreground font-medium tracking-wide">
            Powered by Notify AI
          </span>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative text-center space-y-4"
        >
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold text-primary drop-shadow-lg">
              Welcome to your Dashboard
            </h1>
            <p className="text-lg text-foreground max-w-2xl mx-auto mt-4 drop-shadow">
              Manage your school's timetabling with the power of AI. Let's create
              the perfect schedule for your students and teachers.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => navigate("/teachers")}
                className="gradient-primary text-white transition-all gap-2 mt-6 shadow-2xl"
              >
                <Sparkles className="w-5 h-5" />
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                className="p-6 cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 relative overflow-hidden bg-white/95 backdrop-blur-sm border-white/20 hover:border-blue-400/60"
                onClick={() => navigate(card.path)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center float`}
                    >
                      <card.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <ArrowRight className="w-5 h-5 text-primary group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {card.count}
                  </h3>
                  <p className="text-sm font-semibold text-primary mb-1">
                    {card.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* School Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="hover:shadow-[0_0_40px_rgba(59,130,246,0.7)] transition-all duration-300 rounded-lg"
          >
            <SchoolTypeSelector />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="hover:shadow-[0_0_40px_rgba(59,130,246,0.7)] transition-all duration-300 rounded-lg md:col-span-1"
          >
            <PastTimetableUpload />
          </motion.div>
        </motion.div>

        {/* Template Selector with Threads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 z-0 h-[700px] pointer-events-none">
            <div className="absolute inset-0 opacity-100">
              <Threads
                amplitude={2.5}
                distance={0}
                enableMouseInteraction={true}
                color="#3b82f6"
              />
            </div>
            <div className="absolute inset-0 opacity-80">
              <Threads
                amplitude={2}
                distance={0}
                enableMouseInteraction={true}
                color="#ffffff"
              />
            </div>
            <div className="absolute inset-0 opacity-90">
              <Threads
                amplitude={1.5}
                distance={0}
                enableMouseInteraction={true}
                color="#86efac"
              />
            </div>
          </div>
          <div className="relative z-10">
            <TemplateSelector
              currentTemplate={currentTemplate}
              schoolId={schoolId}
              onTemplateChange={setCurrentTemplate}
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 glass shimmer">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Users, label: "Add Teachers", path: "/teachers" },
                { icon: BookOpen, label: "Setup Classes", path: "/streams" },
                { icon: Calendar, label: "Generate Timetable", path: "/timetables" },
              ].map((action) => (
                <motion.div
                  key={action.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => navigate(action.path)}
                    className="w-full justify-start gap-2 bg-card hover:bg-accent"
                  >
                    <action.icon className="w-5 h-5" />
                    {action.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Subscription Status */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Subscription Status
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Plan: <span className="font-semibold">{subscription.plan_type}</span>
                  </p>
                  {subscription.expires_at && (
                    <p className="text-sm text-muted-foreground">
                      Expires:{" "}
                      {new Date(subscription.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => navigate("/billing")}
                    variant="outline"
                    className="bg-card"
                  >
                    Manage Plan
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;