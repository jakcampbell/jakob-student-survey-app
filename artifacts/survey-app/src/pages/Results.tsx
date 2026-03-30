import { useGetSurveyResults, getGetSurveyResultsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft, TrendingUp, AlertCircle, Zap, Users, BookOpen, Moon, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_COLORS = [
  "hsl(243 75% 59%)",
  "hsl(173 58% 39%)",
  "hsl(43 74% 55%)",
  "hsl(0 72% 51%)",
  "hsl(280 65% 55%)",
];

const tooltipStyle = {
  borderRadius: "10px",
  border: "1px solid hsl(220 13% 91%)",
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
  fontSize: "12px",
};

function PercentBar({ pct, color = "hsl(243 75% 59%)" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden flex-1">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function InsightList({
  items,
  color,
}: {
  items: { answer: string; count: number; percentage: number }[];
  color?: string;
}) {
  if (!items.length)
    return <p className="text-xs text-muted-foreground">No data yet</p>;
  const max = items[0].count;
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-4 text-right flex-shrink-0">{i + 1}</span>
          <span className="text-sm text-foreground font-medium w-32 flex-shrink-0 truncate">{item.answer}</span>
          <PercentBar pct={(item.count / max) * 100} color={color} />
          <span className="text-xs text-muted-foreground w-10 text-right flex-shrink-0">
            {item.percentage}%
          </span>
        </div>
      ))}
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Results() {
  const { data: results, isLoading, error } = useGetSurveyResults({
    query: { queryKey: getGetSurveyResultsQueryKey() },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8fb] px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-[#f8f8fb] flex flex-col items-center justify-center px-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-5 h-5 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Could not load results</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">Check your connection and try again.</p>
        <Link href="/"><button className="text-sm text-primary hover:underline">Back to survey</button></Link>
      </div>
    );
  }

  const n = results.totalResponses;
  const topDistraction = results.topDistractions[0];
  const topSleep = results.sleepBreakdown[0];
  const topStudy = results.studyHoursBreakdown[0];
  const topHabit = results.topProductivityHabits[0];
  const topAttendance = results.classAttendanceBreakdown[0];

  const studyChartData = results.studyHoursBreakdown.map((d) => ({ name: d.answer, count: d.count }));

  return (
    <div className="min-h-screen bg-[#f8f8fb] px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Nav */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to survey
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Live Data</p>
          <h1 className="text-2xl font-bold text-foreground">Survey Results</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {n === 0
              ? "No responses yet"
              : `Based on ${n} student ${n === 1 ? "response" : "responses"}`}
          </p>
        </div>

        {n === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No responses yet</p>
            <p className="text-xs text-muted-foreground mb-4">Be the first to take the survey.</p>
            <Link href="/"><button className="text-sm text-primary hover:underline font-medium">Take the survey</button></Link>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Top-line stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-border p-4 shadow-sm text-center">
                <p className="text-3xl font-bold text-foreground">{n}</p>
                <p className="text-xs text-muted-foreground mt-1">Total responses</p>
              </div>
              <div className="bg-white rounded-2xl border border-border p-4 shadow-sm text-center">
                <p className="text-3xl font-bold text-primary">{Math.round(results.productivePercentage)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Feel productive</p>
              </div>
              <div className="bg-white rounded-2xl border border-border p-4 shadow-sm text-center">
                <p className="text-3xl font-bold text-foreground">
                  {topDistraction ? topDistraction.percentage : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  distracted by {topDistraction?.answer.toLowerCase() ?? "—"}
                </p>
              </div>
            </div>

            {/* Quick-read summary callouts */}
            <div className="bg-white rounded-2xl border border-border shadow-sm divide-y divide-border">
              {[
                {
                  icon: <Zap className="w-3.5 h-3.5 text-primary" />,
                  label: "Most students feel productive",
                  detail: `${Math.round(results.productivePercentage)}% answered Yes`,
                },
                topDistraction && {
                  icon: <AlertCircle className="w-3.5 h-3.5 text-primary" />,
                  label: `#1 distraction: ${topDistraction.answer}`,
                  detail: `${topDistraction.count} out of ${n} students (${topDistraction.percentage}%)`,
                },
                topSleep && {
                  icon: <Moon className="w-3.5 h-3.5 text-primary" />,
                  label: `Most common sleep: ${topSleep.answer}`,
                  detail: `${topSleep.percentage}% of respondents`,
                },
                topStudy && {
                  icon: <BookOpen className="w-3.5 h-3.5 text-primary" />,
                  label: `Most study ${topStudy.answer} per week`,
                  detail: `${topStudy.percentage}% of students`,
                },
                topHabit && {
                  icon: <Target className="w-3.5 h-3.5 text-primary" />,
                  label: `Top productivity habit: ${topHabit.answer}`,
                  detail: `Used by ${topHabit.percentage}% of students`,
                },
                topAttendance && {
                  icon: <Users className="w-3.5 h-3.5 text-primary" />,
                  label: `Most attend ${topAttendance.answer.toLowerCase()}`,
                  detail: `${topAttendance.percentage}% class attendance rate`,
                },
              ]
                .filter(Boolean)
                .map((item, i) => item && (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="mt-0.5 flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Top Distractions */}
            <Section
              icon={<AlertCircle className="w-4 h-4 text-primary" />}
              title="Most Common Distractions"
              subtitle="What keeps students from studying"
            >
              <InsightList items={results.topDistractions} color={CHART_COLORS[1]} />
            </Section>

            {/* Most common answers overview */}
            <div className="grid grid-cols-2 gap-4">
              <Section
                icon={<BookOpen className="w-4 h-4 text-primary" />}
                title="Class Attendance"
                subtitle="How often students go to class"
              >
                <InsightList items={results.classAttendanceBreakdown} color={CHART_COLORS[0]} />
              </Section>
              <Section
                icon={<Moon className="w-4 h-4 text-primary" />}
                title="Sleep Hours"
                subtitle="Nightly sleep per student"
              >
                <InsightList items={results.sleepBreakdown} color={CHART_COLORS[2]} />
              </Section>
            </div>

            {/* Study Hours Chart */}
            <Section
              icon={<TrendingUp className="w-4 h-4 text-primary" />}
              title="Study Hours Per Week"
              subtitle="Distribution across all respondents"
            >
              <div className="h-52 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyChartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 91%)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(240 3.8% 46.1%)", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(240 3.8% 46.1%)", fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(240 4.8% 95.9%)" }} />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS[0]}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={52}
                      name="Responses"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>

            {/* Productivity Habits */}
            <Section
              icon={<Target className="w-4 h-4 text-primary" />}
              title="Productivity Habits"
              subtitle="What students do to stay on track"
            >
              <InsightList items={results.topProductivityHabits} color={CHART_COLORS[3]} />
            </Section>

            {/* Top Majors */}
            {results.mostCommonMajors.length > 0 && (
              <Section
                icon={<Users className="w-4 h-4 text-primary" />}
                title="Top Majors Represented"
                subtitle="Most common fields of study"
              >
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {results.mostCommonMajors.map((m, i) => (
                    <span key={i} className="text-xs bg-muted text-foreground px-2.5 py-1 rounded-full font-medium">
                      {m.answer}
                      <span className="text-muted-foreground ml-1">({m.count})</span>
                    </span>
                  ))}
                </div>
              </Section>
            )}

          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Results update in real time as new responses come in.
        </p>
      </div>
    </div>
  );
}
