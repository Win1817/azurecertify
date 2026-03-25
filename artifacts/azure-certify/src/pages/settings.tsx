import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [user, setUser] = useState<{name: string, email: string, role: string} | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("azure_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and application settings.</p>

        <div className="grid gap-6 max-w-2xl">
          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Update your profile and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{user?.name || "loading..."}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email || "loading..."}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Role</p>
                <p className="text-sm text-muted-foreground capitalize">{user?.role || "student"}</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your exam experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Auto-advance after Answer</p>
                  <p className="text-sm text-muted-foreground">Automatically move to next question in practice mode</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-primary/20 p-1">
                  <div className="h-4 w-4 rounded-full bg-primary translate-x-5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Show AI Feedback Timer</p>
                  <p className="text-sm text-muted-foreground">Display time spent reading hints</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-white/10 p-1">
                  <div className="h-4 w-4 rounded-full bg-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
