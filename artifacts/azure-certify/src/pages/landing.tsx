import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Cloud, 
  BrainCircuit, 
  Target, 
  ShieldCheck, 
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Award,
  ChevronRight,
  Database,
  Lock,
  Cpu,
  Monitor,
  Layout
} from "lucide-react";
import { cn } from "@/components/layout";

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Certifications", href: "#certifications" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#footer" },
  ];

  const features = [
    {
      title: "AI-Powered Exam Generation",
      description: "Dynamic exams powered by Gemini AI that adapt to your study needs and provide realistic certification scenarios.",
      icon: <Target className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Ezzy AI Chatbot",
      description: "Your personalized Azure mentor. Ask questions, clarify concepts, and get tailored study plans directly from Ezzy.",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "from-purple-500 to-indigo-400"
    },
    {
      title: "Full Azure Coverage",
      description: "From Fundamentals to Expert. We cover everything you need including AZ-900, AZ-104, AZ-305, and specialized tracks.",
      icon: <Layout className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-400"
    },
    {
      title: "Personalized Feedback & Hints",
      description: "Get real-time hints during practice and in-depth, mentor-style analysis of your weak points after every exam.",
      icon: <BrainCircuit className="w-6 h-6" />,
      color: "from-amber-500 to-orange-400"
    }
  ];

  const certifications = [
    { code: "AZ-900", name: "Azure Fundamentals", level: "Fundamentals", icon: <Cloud /> },
    { code: "AZ-104", name: "Azure Administrator Associate", level: "Associate", icon: <Monitor /> },
    { code: "AZ-204", name: "Azure Developer Associate", level: "Associate", icon: <Cpu /> },
    { code: "AZ-500", name: "Azure Security Technologies", level: "Associate", icon: <Lock /> },
    { code: "AZ-305", name: "Azure Solutions Architect Expert", level: "Expert", icon: <Layout /> },
    { code: "DP-203", name: "Data Engineering on Microsoft Azure", level: "Specialty", icon: <Database /> },
    { code: "AI-102", name: "Designing and Implementing an Azure AI Solution", level: "Specialty", icon: <BrainCircuit /> },
    { code: "AZ-400", name: "Designing and Implementing DevOps Solutions", level: "Expert", icon: <Target /> },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Fundamentals': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Associate': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Expert': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Specialty': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 scroll-smooth">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="h-8 w-8 text-primary" strokeWidth={2.5} />
            <span className="font-display font-bold text-xl tracking-tight text-white">
              AzureCertify <span className="text-primary">Pro</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="text-sm font-medium hover:text-primary transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link 
              href="/login"
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Azure background" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -top-20 -right-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] bottom-0 -left-20 animate-pulse" style={{ animationDuration: '12s' }}></div>
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-8">
              <SparklesIcon className="w-3.5 h-3.5" />
              Introducing AzureCertify AI Pro
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Master Microsoft Azure with <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                AI-Powered Guidance
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Supercharge your certification journey. Featuring dynamic Gemini AI exams, the Ezzy interactive mentor, step-by-step hints, and personalized performance feedback.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 text-lg"
              >
                Start Learning Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg"
              >
                View Certifications
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-24 relative z-10 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why Choose AzureCertify Pro?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Experience the next generation of certification prep with our suite of AI-integrated tools designed specifically for Azure professionals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
                className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors h-full flex flex-col"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg", `bg-gradient-to-br ${feature.color}`)}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Supported Certifications</h2>
              <p className="text-muted-foreground max-w-2xl">From foundational knowledge to expert architecture, we have the complete path covered for your career growth.</p>
            </div>
            <Link href="/login" className="text-primary hover:text-cyan-400 font-medium inline-flex items-center gap-2 transition-colors">
              View Exam Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {certifications.map((cert, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 4) * 0.1 }}
                key={cert.code}
              >
                <Link 
                  href="/login"
                  className="block group bg-card rounded-2xl p-6 border border-white/5 hover:border-primary/30 hover:bg-white/[0.03] transition-all duration-300 shadow-lg relative overflow-hidden h-full flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-2.5 rounded-lg bg-white/5 text-foreground/80 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      {cert.icon}
                    </div>
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", getLevelColor(cert.level))}>
                      {cert.level}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-black font-display mb-1 group-hover:text-primary transition-colors">
                    {cert.code}
                  </h3>
                  <h4 className="text-sm font-medium text-muted-foreground flex-grow mb-4 leading-relaxed">{cert.name}</h4>
                  
                  <div className="flex items-center text-xs font-bold uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 mt-auto">
                    Practice Now <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-panel p-12 md:p-16 rounded-[2.5rem] relative overflow-hidden text-center border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10 mix-blend-overlay"></div>
            
            <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready to get certified?</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of professionals securing their Azure credentials with the most advanced AI preparation framework available.
            </p>
            
            <Link 
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 text-lg"
            >
              Sign up with Keycloak <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="h-6 w-6 text-primary" strokeWidth={2.5} />
                <span className="font-display font-bold text-lg tracking-tight text-white">
                  AzureCertify <span className="text-primary">Pro</span>
                </span>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-6">
                The premier AI-powered learning platform designed for enterprise professionals mastering Microsoft Azure Cloud technologies.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Exam Dashboard</Link></li>
                <li><a href="#certifications" className="text-sm text-muted-foreground hover:text-primary transition-colors">Certifications</a></li>
                <li><a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">AI Features</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal & Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AzureCertify. All rights reserved. 
              <br className="md:hidden" /> Microsoft and Azure are registered trademarks of Microsoft Corporation.
            </p>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground/80 tracking-wide">
                Developed by Surely Win Dilag
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}
