import { useState } from "react";
import { useGetAttempts } from "@workspace/api-client-react";
import { Layout, cn } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  History,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
} from "lucide-react";

type SortField = "date" | "score" | "cert";
type SortDir = "asc" | "desc";
type FilterResult = "all" | "passed" | "failed";
type FilterMode = "all" | "practice" | "simulation";

export default function HistoryPage() {
  const { data: attempts, isLoading } = useGetAttempts();
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState<FilterResult>("all");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = (attempts ?? [])
    .filter((a) => {
      const matchSearch = a.certificationCode
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchResult =
        filterResult === "all" ||
        (filterResult === "passed" && a.passed) ||
        (filterResult === "failed" && !a.passed);
      const matchMode =
        filterMode === "all" || a.mode === filterMode;
      return matchSearch && matchResult && matchMode;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp =
          new Date(a.completedAt).getTime() -
          new Date(b.completedAt).getTime();
      } else if (sortField === "score") {
        cmp = a.score - b.score;
      } else if (sortField === "cert") {
        cmp = a.certificationCode.localeCompare(b.certificationCode);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalAttempts = attempts?.length ?? 0;
  const passedCount = attempts?.filter((a) => a.passed).length ?? 0;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          (attempts ?? []).reduce((sum, a) => sum + a.score, 0) /
            totalAttempts
        )
      : 0;
  const passRate =
    totalAttempts > 0
      ? Math.round((passedCount / totalAttempts) * 100)
      : 0;

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 hover:text-white transition-colors"
    >
      {children}
      {sortField === field ? (
        sortDir === "asc" ? (
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-primary" />
        )
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
      )}
    </button>
  );

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex items-center gap-3">
          <History className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold">Exam History</h1>
            <p className="text-sm text-muted-foreground">
              All your past exam attempts and results
            </p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Attempts",
              value: totalAttempts,
              icon: Activity,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
            {
              label: "Passed",
              value: passedCount,
              icon: CheckCircle2,
              color: "text-green-400",
              bg: "bg-green-400/10",
            },
            {
              label: "Avg Score",
              value: `${avgScore}%`,
              icon: Award,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Pass Rate",
              value: `${passRate}%`,
              icon: TrendingUp,
              color: "text-purple-400",
              bg: "bg-purple-400/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl border border-white/5 p-5 flex items-center gap-4"
            >
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-display font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by certification..."
              className="w-full pl-9 pr-4 py-2.5 bg-card border border-white/10 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value as FilterResult)}
              className="bg-card border border-white/10 rounded-xl text-sm px-3 py-2.5 outline-none focus:border-primary/50 transition-colors text-foreground"
            >
              <option value="all">All Results</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as FilterMode)}
              className="bg-card border border-white/10 rounded-xl text-sm px-3 py-2.5 outline-none focus:border-primary/50 transition-colors text-foreground"
            >
              <option value="all">All Modes</option>
              <option value="practice">Practice</option>
              <option value="simulation">Simulation</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex flex-col items-center gap-3 text-muted-foreground">
                <Activity className="w-8 h-8 animate-pulse" />
                <p>Loading history...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Activity className="w-12 h-12 text-muted-foreground/30" />
              {totalAttempts === 0 ? (
                <>
                  <p className="text-muted-foreground">No exam attempts yet.</p>
                  <Link
                    href="/"
                    className="text-primary text-sm font-medium hover:text-primary/80 transition-colors"
                  >
                    Start your first exam →
                  </Link>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No attempts match your filters.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="p-4 font-medium text-muted-foreground">
                      <SortButton field="cert">Exam</SortButton>
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">
                      Mode
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">
                      <SortButton field="score">Score</SortButton>
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">
                      Result
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">
                      Questions
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">
                      Time
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">
                      <SortButton field="date">Date</SortButton>
                    </th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((attempt, idx) => {
                    const scoreColor =
                      attempt.score >= 80
                        ? "text-green-400"
                        : attempt.score >= 70
                        ? "text-yellow-400"
                        : "text-red-400";

                    const ScoreIcon =
                      attempt.score >= 80
                        ? TrendingUp
                        : attempt.score >= 70
                        ? Minus
                        : TrendingDown;

                    return (
                      <motion.tr
                        key={attempt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4">
                          <span className="font-display font-semibold">
                            {attempt.certificationCode}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "text-xs font-medium px-2.5 py-1 rounded-full border capitalize",
                              attempt.mode === "simulation"
                                ? "text-purple-400 bg-purple-400/10 border-purple-400/20"
                                : "text-blue-400 bg-blue-400/10 border-blue-400/20"
                            )}
                          >
                            {attempt.mode}
                          </span>
                        </td>
                        <td className="p-4">
                          <div
                            className={cn(
                              "flex items-center gap-1.5 font-display font-bold",
                              scoreColor
                            )}
                          >
                            <ScoreIcon className="w-3.5 h-3.5" />
                            {attempt.score}%
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                              attempt.passed
                                ? "text-green-400 bg-green-400/10 border-green-400/20"
                                : "text-red-400 bg-red-400/10 border-red-400/20"
                            )}
                          >
                            {attempt.passed ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {attempt.passed ? "PASSED" : "FAILED"}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {attempt.questionCount} questions
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {Math.floor(attempt.timeSpentSeconds / 60)}m{" "}
                            {attempt.timeSpentSeconds % 60}s
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {format(new Date(attempt.completedAt), "MMM d, yyyy")}
                          <div className="text-xs opacity-60">
                            {format(new Date(attempt.completedAt), "h:mm a")}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/results/${attempt.id}`}
                            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                          >
                            Details →
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length > 0 && (
                <div className="px-4 py-3 border-t border-white/5 text-xs text-muted-foreground">
                  Showing {filtered.length} of {totalAttempts} attempts
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
