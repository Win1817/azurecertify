import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function Feedback() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    // Mock submission
    setTimeout(() => {
      setSubmitted(true);
      setFeedback("");
    }, 1000);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <MessageSquare className="text-primary h-8 w-8" /> Feedback
          </h1>
          <p className="text-muted-foreground mt-1">Help us improve the AzureCertify platform.</p>
        </div>

        <Card className="bg-card border-white/5 border-t-primary/50 shadow-2xl">
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-green-500/10 rounded-xl border border-green-500/20">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-green-400 mb-2">Thank You!</h3>
                <p className="text-muted-foreground">Your feedback has been submitted successfully.</p>
                <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>
                  Submit Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">What went wrong or what can we improve?</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    rows={6}
                    className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/50 resize-none text-sm"
                    placeholder="Describe your issue or suggestion..."
                  />
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-sm text-muted-foreground">
                    Optional: You can attach screenshots in the admin console. 
                  </div>
                  <Button type="submit" className="gap-2">
                    <Send className="w-4 h-4 ml-2" /> Send Feedback
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
