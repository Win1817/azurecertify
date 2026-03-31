import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Cloud, Lock, Mail, ArrowRight, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      localStorage.setItem("azure_token", data.token);
      localStorage.setItem("azure_user", JSON.stringify(data.user));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.name}!`,
      });
      
      if (data.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Azure background" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="absolute w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -top-20 -right-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in slide-in-from-bottom-8 duration-500">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity">
          <Cloud className="h-10 w-10 text-primary" strokeWidth={2.5} />
          <span className="font-display font-bold text-3xl tracking-tight text-white">
            AzureCertify <span className="text-primary">Pro</span>
          </span>
        </Link>

        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-cyan-400"></div>
          
          <h2 className="text-2xl font-display font-bold mb-2">Sign In</h2>
          <p className="text-muted-foreground text-sm mb-8">Access your personalized exam dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Email or Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 shadow-lg shadow-primary/20 mt-6"
            >
              {isLoading ? (
                <>Logging in <Loader2 className="w-5 h-5 animate-spin" /></>
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#111111] px-4 text-muted-foreground font-semibold">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.location.href = "/api/auth/kanidm/login"}
            className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 shadow-lg group"
          >
            <div className="w-8 h-8 flex items-center justify-center p-0.5">
              <img 
                src={`${import.meta.env.BASE_URL}images/kanidm-logo.png`} 
                alt="KanIDM" 
                className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform" 
              />
            </div>
            Sign in with Kanidm SSO
          </button>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account? <Link href="/register" className="text-primary cursor-pointer hover:underline font-medium">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
