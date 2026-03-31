import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Cloud, Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      
      localStorage.setItem("azure_token", data.token);
      localStorage.setItem("azure_user", JSON.stringify(data.user));
      
      toast({
        title: "Account Created!",
        description: `Welcome to AzureCertify, ${data.user.name}!`,
      });
      
      setLocation("/dashboard");
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
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Azure background" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="absolute w-[800px] h-[800px] bg-cyan-500/15 rounded-full blur-[120px] -bottom-40 -left-20 animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in slide-in-from-bottom-8 duration-500">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity">
          <Cloud className="h-10 w-10 text-primary" strokeWidth={2.5} />
          <span className="font-display font-bold text-3xl tracking-tight text-white">
            AzureCertify <span className="text-primary">Pro</span>
          </span>
        </Link>

        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-primary"></div>
          
          <h2 className="text-2xl font-display font-bold mb-2">Create Account</h2>
          <p className="text-muted-foreground text-sm mb-8">Start your Azure certification journey today.</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground text-primary/50">
                  <span className="text-xs font-bold font-mono">@</span>
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                  placeholder="azure_master"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Email (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                  placeholder="you@example.com"
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 shadow-lg shadow-primary/20 mt-4"
            >
              {isLoading ? (
                <>Creating Account <Loader2 className="w-5 h-5 animate-spin" /></>
              ) : (
                <>Create Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary cursor-pointer hover:underline font-medium">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
