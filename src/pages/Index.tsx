import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, Users, ArrowRight } from "lucide-react";
import carousel1 from "@/assets/carousel-1.webp";
import carousel2 from "@/assets/carousel-2.jpeg";
import carousel3 from "@/assets/carousel-3.jpeg";

const Index = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const carouselImages = [carousel1, carousel2, carousel3];

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary">SchoolTime AI</span>
        </div>
        <Button
          onClick={() => navigate("/auth")}
          variant="outline"
          className="hover:bg-primary hover:text-primary-foreground transition-all"
        >
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center animate-fade-in">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
                Your timetable, done in seconds.
              </h1>
              <p className="text-xl text-muted-foreground">
                Generate perfect timetables in just 5 seconds with our AI-powered scheduler — fast, accurate, and built to keep you effortlessly organized.
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-primary text-white hover:opacity-90 transition-all text-lg px-8 py-6 gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right Side - Carousel with Background Shape */}
          <div className="relative h-[500px] flex items-center justify-center">
            {/* Curved gradient background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div 
                className="absolute w-[600px] h-[600px] rounded-[40%] opacity-30"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                  transform: 'rotate(-15deg)',
                  top: '-10%',
                  right: '-10%',
                }}
              />
            </div>
            
            {carouselImages.map((img, index) => (
              <div
                key={index}
                className={`absolute transition-all duration-700 rounded-2xl shadow-2xl ${
                  index === currentImage
                    ? "z-30 scale-100 opacity-100 translate-x-0"
                    : index === (currentImage + 1) % carouselImages.length
                    ? "z-20 scale-90 opacity-60 translate-x-12"
                    : "z-10 scale-80 opacity-30 translate-x-24"
                }`}
                style={{
                  width: "400px",
                  height: "450px",
                }}
              >
                <img
                  src={img}
                  alt={`School scene ${index + 1}`}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
            <div className="p-8 bg-card rounded-2xl shadow-lg card-hover">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">
                Teacher Management
              </h3>
              <p className="text-muted-foreground">
                Add teachers, assign subjects, and manage workload efficiently
              </p>
            </div>

            <div className="p-8 bg-card rounded-2xl shadow-lg card-hover">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">
                Smart Streams
              </h3>
              <p className="text-muted-foreground">
                Organize classes and streams automatically for all grades
              </p>
            </div>

            <div className="p-8 bg-card rounded-2xl shadow-lg card-hover">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">
                AI Timetables
              </h3>
              <p className="text-muted-foreground">
                Generate conflict-free timetables powered by artificial intelligence
              </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="pt-20 pb-10">
          <div className="bg-card rounded-2xl shadow-xl p-12 max-w-4xl mx-auto gradient-accent text-center">
            <h2 className="text-3xl font-bold mb-4 text-primary">
              Ready to transform your school's scheduling? 🚀
            </h2>
            <p className="text-lg text-muted-foreground mb-2">
              Join schools using SchoolTime AI to save time and improve efficiency.
            </p>
            <p className="text-lg font-semibold text-primary mb-8">
              View our billing plans
            </p>
          </div>
        </div>

        {/* Billing Plans Section */}
        <div className="pt-10 pb-20">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-bold text-primary">Choose Your Plan</h2>
            <p className="text-muted-foreground">
              Select the plan that works best for your school
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Free Trial Plan */}
            <Card className="p-6 card-hover animate-slide-up relative">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Free Trial</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">KES 0</span>
                <span className="text-muted-foreground text-sm">/14 days</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Up to 5 teachers</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Up to 3 streams</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Basic timetable generation</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Email support</span>
                </li>
              </ul>
              <Button
                onClick={() => navigate("/auth")}
                className="w-full gradient-primary text-white hover:opacity-90"
              >
                Get Started
              </Button>
            </Card>

            {/* Basic Plan */}
            <Card className="p-6 card-hover animate-slide-up relative" style={{ animationDelay: '100ms' }}>
              <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Basic</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">KES 2,500</span>
                <span className="text-muted-foreground text-sm">/per month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Up to 20 teachers</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Unlimited streams</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>AI timetable generation</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Priority email support</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Export to PDF</span>
                </li>
              </ul>
              <Button
                onClick={() => navigate("/auth")}
                className="w-full gradient-primary text-white hover:opacity-90"
              >
                Get Started
              </Button>
            </Card>

            {/* Premium Plan */}
            <Card className="p-6 card-hover animate-slide-up relative" style={{ animationDelay: '200ms' }}>
              <Badge className="absolute top-4 right-4 bg-primary">Most Popular</Badge>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Premium</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">KES 5,000</span>
                <span className="text-muted-foreground text-sm">/per month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Unlimited teachers</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Unlimited streams</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Advanced AI optimization</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Export to PDF/Excel</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Email timetables to teachers</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Custom branding</span>
                </li>
              </ul>
              <Button
                onClick={() => navigate("/auth")}
                className="w-full gradient-primary text-white hover:opacity-90"
              >
                Get Started
              </Button>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 SchoolTime AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
