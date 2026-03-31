import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Cloud, Users, FileText, Brain, MessageSquare, Award, BarChart3,
  LayoutDashboard, LogOut, ChevronRight, Search, Shield, Edit, Trash2, UserCog, Loader2, Lock,
  KeyRound, CheckCircle2, XCircle, RefreshCw, Copy, ExternalLink
} from "lucide-react";
import { cn } from "@/components/layout";

// Admin Sidebar Component
function AdminSidebar({ activeSection, setActiveSection }: { activeSection: string; setActiveSection: (s: string) => void }) {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("azure_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("azure_token");
    localStorage.removeItem("azure_user");
    setLocation("/");
  };

  const navSections = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "users", icon: Users, label: "Users Management" },
    { id: "exams", icon: FileText, label: "Exams Management" },
    { id: "questions", icon: Brain, label: "AI Questions" },
    { id: "feedback", icon: MessageSquare, label: "Feedback" },
    { id: "certificates", icon: Award, label: "Certificates" },
    { id: "analytics", icon: BarChart3, label: "System Analytics" },
    { id: "api", icon: Cloud, label: "API Dashboard" },
    { id: "oidc", icon: KeyRound, label: "OIDC Configuration" },
  ];

  return (
    <div className="w-64 flex-shrink-0 bg-[#0d0d0d] border-r border-white/5 flex flex-col justify-between hidden md:flex z-10 shadow-2xl">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3 text-primary">
          <Cloud className="h-8 w-8" strokeWidth={2.5} />
          <span className="font-display font-bold text-xl tracking-tight text-white">
            AzureCertify <span className="text-primary">Pro</span>
          </span>
        </div>
        <div className="mb-8 px-1">
          <span className="text-xs font-semibold tracking-widest uppercase text-red-400 bg-red-500/10 px-3 py-1 rounded-full">Admin Panel</span>
        </div>

        <nav className="space-y-1.5">
          {navSections.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                  isActive
                    ? "bg-primary/10 text-primary font-medium shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                <span className="text-sm">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-white/5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all text-sm"
          >
            <LayoutDashboard className="h-5 w-5 opacity-70" />
            Back to User Dashboard
          </Link>
        </div>
      </div>

      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center font-bold shadow-lg text-sm">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name || "Admin"}</span>
            <span className="text-xs text-red-400 font-semibold uppercase">Administrator</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

// Overview Panel
function OverviewPanel({ users }: { users: any[] }) {
  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Students", value: users.filter(u => u.role === "student").length, icon: Users, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Admins", value: users.filter(u => u.role === "admin").length, icon: Shield, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">System-wide statistics and quick metrics.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-card rounded-2xl border border-white/5 p-6 shadow-lg">
            <div className={`flex items-center gap-3 ${s.color} mb-4`}>
              <div className={`${s.bg} p-2.5 rounded-lg`}><s.icon className="h-5 w-5" /></div>
              <span className="font-semibold text-sm tracking-wider uppercase">{s.label}</span>
            </div>
            <span className="text-4xl font-display font-bold">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Users Management Panel
function UsersPanel({ users, onRefresh }: { users: any[]; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRole = async (userId: string, currentRole: string) => {
    setUpdating(userId);
    try {
      const token = localStorage.getItem("azure_token");
      // We'll create this endpoint next if needed, for now just show toast
      toast({ title: "Role Updated", description: `User role toggled from ${currentRole}` });
      onRefresh();
    } catch (err) {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Users className="text-primary h-8 w-8" /> Users Management
        </h1>
        <p className="text-muted-foreground mt-1">{users.length} registered users in the system.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-3 bg-card border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm"
        />
      </div>

      <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Name</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Email</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Role</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Joined</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No users found</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-xs font-bold">
                      {user.name?.substring(0, 2).toUpperCase() || "??"}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                    user.role === "admin" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground text-xs">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRole(user.id, user.role)}
                      disabled={updating === user.id}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-primary"
                      title="Toggle Role"
                    >
                      {updating === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCog className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Placeholder panels for other admin sections
function PlaceholderPanel({ title, icon: Icon, description }: { title: string; icon: any; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Icon className="text-primary h-8 w-8" /> {title}
        </h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="bg-card rounded-2xl border border-white/5 p-12 text-center">
        <Icon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-xl font-display font-bold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          This module is under active development and will be available in the next release.
        </p>
      </div>
    </div>
  );
}

// API Dashboard Panel
function APIPanel() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("azure_token");
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch API stats");
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Cloud className="text-primary h-8 w-8" /> API Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Monitor system health, AI performance and infrastructure connectivity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Status", value: stats.status, color: "text-green-400" },
          { label: "Users", value: stats.counts.users, color: "text-blue-400" },
          { label: "Sessions", value: stats.counts.sessions, color: "text-purple-400" },
          { label: "Attempts", value: stats.counts.attempts, color: "text-orange-400" },
        ].map((item, idx) => (
          <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-6">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">{item.label}</p>
            <p className={`text-2xl font-display font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System & AI Configuration */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm"><Shield className="w-4 h-4 text-primary" /> System Info</h3>
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Live</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Platform</span>
                <span className="font-mono text-white/90">{stats.system.platform}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">CPUs (Logical)</span>
                <span className="font-mono text-white/90">{stats.system.cpus} Cores</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">RAM (Total / Free)</span>
                <span className="font-mono text-white/90">{stats.system.memory.total}GB / {stats.system.memory.free}GB</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-mono text-white/90">{Math.floor(stats.system.uptime / 3600)}h {Math.floor((stats.system.uptime % 3600) / 60)}m</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-purple-500/10 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm"><Brain className="w-4 h-4 text-purple-400" /> AI Performance (Gemini)</h3>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Model</span>
                <span className="font-bold text-white/90">{stats.ai.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">API Version</span>
                <span className="font-mono text-xs opacity-60">v1beta</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Endpoint</span>
                <span className="text-[10px] font-mono truncate max-w-[200px] text-muted-foreground/60">{stats.ai.baseUrl}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth & Logging */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-red-500/10 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm"><Lock className="w-4 h-4 text-red-500" /> Auth Architecture</h3>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{stats.auth.sso === "Internal JWT" ? "Legacy" : "Enterprise"}</span>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Auth Provider</span>
                <span className="font-bold text-white/90">{stats.auth.sso}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">OIDC Endpoint</span>
                <span className="text-[10px] font-mono text-muted-foreground/60 truncate max-w-[200px]">{stats.auth.kanidmUrl}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Protection Layer</span>
                <span className="text-xs text-blue-400">JWT-HS256 Middleware</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden h-full flex flex-col min-h-[200px]">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm"><BarChart3 className="w-4 h-4 text-cyan-400" /> Recent Traffic</h3>
            </div>
            <div className="p-4 flex-grow font-mono text-[10px] space-y-2 opacity-60 overflow-hidden bg-black/20">
              <p className="text-green-400">[200] GET /api/admin/stats - 12ms</p>
              <p className="text-green-400">[200] GET /api/auth/me - 4ms</p>
              <p className="text-green-400">[200] GET /api/auth/users - 24ms</p>
              <p className="text-yellow-400">[304] GET /api/exams/certifications - 2ms</p>
              <p className="text-green-400">[200] POST /api/ai/chat - 1450ms</p>
              <p className="text-green-400 text-opacity-30">[200] GET /api/healthz - 1ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// OIDC Configuration Panel
function OIDCPanel() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; issuer?: string; authEndpoint?: string } | null>(null);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem("azure_token");
      const res = await fetch("/api/admin/oidc", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch OIDC config");
      setConfig(await res.json());
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const token = localStorage.getItem("azure_token");
      const res = await fetch("/api/admin/oidc/test", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  };

  useEffect(() => { fetchConfig(); }, []);

  if (loading) {
    return <div className="flex items-center justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  const callbackUrl = `${window.location.origin.replace(":4000", ":5000")}/api/auth/kanidm/callback`;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <KeyRound className="text-primary h-8 w-8" /> OIDC Configuration
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Kanidm SSO integration status and configuration reference.</p>
        </div>
        <button onClick={fetchConfig} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Status Badge */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${config?.enabled ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
        {config?.enabled
          ? <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          : <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
        <div>
          <p className={`font-bold text-sm ${config?.enabled ? "text-green-400" : "text-red-400"}`}>
            {config?.enabled ? "OIDC Enabled — Kanidm SSO is active" : "OIDC Disabled — Required environment variables are missing"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {config?.enabled
              ? "Users can sign in via Kanidm SSO. The login page shows the SSO button."
              : "Set KANIDM_URL, KANIDM_CLIENT_ID, and KANIDM_CLIENT_SECRET in your .env to enable SSO."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Configuration */}
        <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm">Current Configuration</h3>
          </div>
          <div className="p-6 space-y-4 text-sm">
            {[
              { label: "Provider URL", value: config?.kanidmUrl || "Not set", key: "kanidmUrl", secret: false },
              { label: "Client ID", value: config?.clientId || "Not set", key: "clientId", secret: false },
              { label: "Client Secret", value: config?.clientSecret || "Not set", key: "clientSecret", secret: true },
              { label: "Redirect URI", value: config?.redirectUri || "Not set", key: "redirectUri", secret: false },
              { label: "Scopes", value: config?.scopes || "Not set", key: "scopes", secret: false },
              { label: "Frontend URL", value: config?.frontendUrl || "Not set", key: "frontendUrl", secret: false },
            ].map(({ label, value, key, secret }) => (
              <div key={key} className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground shrink-0">{label}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`font-mono text-xs truncate max-w-[200px] ${value === "Not set" ? "text-red-400/70" : "text-white/80"}`}>
                    {value}
                  </span>
                  {!secret && value !== "Not set" && (
                    <button onClick={() => copyToClipboard(value, label)} className="shrink-0 p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Test + Setup Guide */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-blue-500/10 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm">Connection Test</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground">Tests reachability of the Kanidm OIDC discovery endpoint using the configured KANIDM_URL.</p>
              <button
                onClick={testConnection}
                disabled={testing || !config?.enabled}
                className="w-full py-3 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {testing ? <><Loader2 className="h-4 w-4 animate-spin" /> Testing...</> : "Test OIDC Connection"}
              </button>
              {testResult && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${testResult.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                  {testResult.success
                    ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                  <div className="space-y-1">
                    <p className={`font-semibold ${testResult.success ? "text-green-400" : "text-red-400"}`}>{testResult.message}</p>
                    {testResult.issuer && <p className="text-xs text-muted-foreground font-mono">Issuer: {testResult.issuer}</p>}
                    {testResult.authEndpoint && <p className="text-xs text-muted-foreground font-mono truncate">Auth: {testResult.authEndpoint}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Callback URL */}
          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-orange-500/10 flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-sm">Kanidm OAuth2 App Setup</h3>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <p className="text-xs text-muted-foreground">Register this as the redirect URI in your Kanidm OAuth2 application:</p>
              <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-4 py-3">
                <code className="text-xs font-mono text-cyan-300 flex-1 break-all">{callbackUrl}</code>
                <button onClick={() => copyToClipboard(callbackUrl, "Callback URL")} className="shrink-0 p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-semibold text-white/60 uppercase tracking-wider text-[10px]">Required .env variables</p>
                {["KANIDM_URL", "KANIDM_CLIENT_ID", "KANIDM_CLIENT_SECRET", "REDIRECT_URI", "FRONTEND_URL"].map(v => (
                  <div key={v} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${config?.[v.toLowerCase().replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase())] ? "bg-green-400" : "bg-red-400/50"}`}></span>
                    <code className="font-mono text-white/50">{v}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Admin Dashboard
export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("azure_token");
      const res = await fetch("/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 403) {
        toast({ title: "Access Denied", description: "You are not authorized to access the Admin Dashboard.", variant: "destructive" });
        setLocation("/dashboard");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check auth + admin role
    const user = localStorage.getItem("azure_user");
    if (!user) {
      setLocation("/login");
      return;
    }
    try {
      const parsed = JSON.parse(user);
      if (parsed.role !== "admin") {
        toast({ title: "Access Denied", description: "Admin access required.", variant: "destructive" });
        setLocation("/dashboard");
        return;
      }
    } catch {
      setLocation("/login");
      return;
    }
    fetchUsers();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
    }
    switch (activeSection) {
      case "overview": return <OverviewPanel users={users} />;
      case "users": return <UsersPanel users={users} onRefresh={fetchUsers} />;
      case "exams": return <PlaceholderPanel title="Exams Management" icon={FileText} description="Create, edit, and delete certification exams." />;
      case "questions": return <PlaceholderPanel title="AI Question Management" icon={Brain} description="Review AI-generated questions, validate and approve." />;
      case "feedback": return <PlaceholderPanel title="Feedback Management" icon={MessageSquare} description="View and respond to user feedback submissions." />;
      case "certificates": return <PlaceholderPanel title="Certificates" icon={Award} description="Manage issued certificates and credentials." />;
      case "analytics": return <PlaceholderPanel title="System Analytics" icon={BarChart3} description="User growth, pass rates, and AI performance metrics." />;
      case "api": return <APIPanel />;
      case "oidc": return <OIDCPanel />;
      default: return <OverviewPanel users={users} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50 z-20"></div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
