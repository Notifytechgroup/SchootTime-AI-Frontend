import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { GraduationCap, Loader2, Eye, EyeOff } from "lucide-react";
import authBackground from "@/assets/auth-background.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    schoolName: "",
  });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "otp" | "password">("email");
  const [resetData, setResetData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });
  const [isResetting, setIsResetting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async () => {
    if (!resetData.email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: resetData.email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;
      toast.success("OTP has been sent to your email!");
      setOtpSent(true);
      setResetStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsResetting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!resetData.otp) {
      toast.error("Please enter the OTP code");
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: resetData.email,
        token: resetData.otp,
        type: "email",
      });

      if (error) throw error;
      toast.success("OTP verified! Now set your new password.");
      setResetStep("password");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP code");
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!resetData.newPassword || !resetData.confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }
    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (resetData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: resetData.newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setShowResetDialog(false);
      setResetStep("email");
      setOtpSent(false);
      setResetData({ email: "", newPassword: "", confirmPassword: "", otp: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        // Check user role from database
        const { data: { user } } = await supabase.auth.getUser();
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (roleData) {
          navigate("/role-selection");
        } else {
          navigate("/dashboard");
        }
        toast.success("Welcome back! 🎉");
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              school_name: formData.schoolName,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;
        
        // Check user role from database
        const { data: { user } } = await supabase.auth.getUser();
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (roleData) {
          navigate("/role-selection");
        } else {
          navigate("/dashboard");
        }
        toast.success("Registration successful! Welcome aboard! 🎉");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${authBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm"></div>
      <Card className="w-full max-w-md p-8 shadow-2xl animate-scale-in relative z-10 bg-card/95 backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary">SchoolTime AI</h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Welcome back!" : "Create your school account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required={!isLogin}
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name *</Label>
                <Input
                  id="schoolName"
                  type="text"
                  placeholder="Springfield High School"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  required={!isLogin}
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@school.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="transition-all focus:ring-2 focus:ring-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-white hover:opacity-90 transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>

          {isLogin && (
            <button
              type="button"
              onClick={() => {
                setResetData({ ...resetData, email: formData.email });
                setShowResetDialog(true);
              }}
              className="w-full text-sm text-primary hover:underline transition-all mt-2"
            >
              Forgot Password?
            </button>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline transition-all"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>

      <Dialog open={showResetDialog} onOpenChange={(open) => {
        setShowResetDialog(open);
        if (!open) {
          setResetStep("email");
          setOtpSent(false);
          setResetData({ email: "", newPassword: "", confirmPassword: "", otp: "" });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetStep === "email" && "Enter your email address to receive an OTP"}
              {resetStep === "otp" && "Check your email and enter the OTP code sent by Supabase"}
              {resetStep === "password" && "Create your new password"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {resetStep === "email" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@school.com"
                    value={resetData.email}
                    onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                    disabled={otpSent}
                  />
                </div>
                <Button
                  onClick={handleSendOtp}
                  disabled={isResetting}
                  className="w-full"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP Code"
                  )}
                </Button>
              </>
            )}

            {resetStep === "otp" && (
              <>
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    ✉️ OTP has been sent to <strong>{resetData.email}</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={resetData.otp}
                    onChange={(e) => setResetData({ ...resetData, otp: e.target.value })}
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={isResetting}
                  className="w-full"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
              </>
            )}

            {resetStep === "password" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={resetData.newPassword}
                      onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={resetData.confirmPassword}
                      onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleUpdatePassword}
                  disabled={isResetting}
                  className="w-full"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;