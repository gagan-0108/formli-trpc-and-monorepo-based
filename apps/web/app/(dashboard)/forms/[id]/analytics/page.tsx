"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import {
  ArrowLeft,
  MessageSquare,
  TrendingUp,
  Star,
  BarChart3,
  Layers
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const CHART_COLORS = [
  "#818cf8", // indigo-400
  "#6366f1", // indigo-500
  "#a5b4fc", // indigo-300
  "#4f46e5", // indigo-600
  "#c7d2fe", // indigo-200
  "#3730a3", // indigo-800
  "#e0e7ff", // indigo-100
  "#312e81", // indigo-900
];

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: form } = trpc.form.getById.useQuery({ formId: id });
  const { data: analytics, isLoading } = trpc.response.getAnalytics.useQuery({
    formId: id,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8 page-enter">
        <Skeleton className="h-10 w-64 rounded-lg bg-[#0f0f12] border border-white/[0.06]" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-[#0f0f12] border border-white/[0.06]" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl bg-[#0f0f12] border border-white/[0.06]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/forms/${id}/responses`)}
          className="text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Responses
        </Button>
        <div className="h-4 w-[1px] bg-white/[0.1] hidden sm:block"></div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{form?.title} <span className="text-muted-foreground font-normal ml-2">Analytics</span></h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Total Responses</span>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <span className="text-4xl font-bold text-white relative">
            {analytics?.totalResponses || 0}
          </span>
        </div>
        
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium">Fields Tracked</span>
            </div>
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <BarChart3 className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <span className="text-4xl font-bold text-white relative">
            {analytics?.fieldBreakdowns.length || 0}
          </span>
        </div>
        
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Data Points</span>
            </div>
            <div className="p-2 bg-fuchsia-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-fuchsia-400" />
            </div>
          </div>
          <span className="text-4xl font-bold text-white relative">
            {analytics?.responsesOverTime.length || 0}
          </span>
        </div>
      </div>

      {/* Responses Over Time Chart */}
      {analytics?.responsesOverTime && analytics.responsesOverTime.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">Responses Over Time</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.responsesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  stroke="rgba(255,255,255,0.1)"
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: "#a1a1aa", fontSize: 12 }} 
                  stroke="rgba(255,255,255,0.1)" 
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: "#0f0f12",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "12px",
                    fontSize: 13,
                    color: "#fafafa",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                    padding: "12px 16px"
                  }}
                  itemStyle={{ color: "#818cf8", fontWeight: 500 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#818cf8"
                  fill="url(#colorCount)"
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: "#818cf8", stroke: "#0f0f12", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-field breakdowns */}
      {analytics?.fieldBreakdowns && analytics.fieldBreakdowns.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-violet-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">Field Analysis</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.fieldBreakdowns.map((field) => (
              <div
                key={field.fieldId}
                className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-6 shadow-sm flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div>
                    <h4 className="font-semibold text-zinc-100 text-base mb-1">{field.fieldLabel}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="border-white/[0.06] bg-white/[0.02] text-zinc-400 font-normal uppercase tracking-wider text-[10px]">
                        {field.fieldType.replace('_', ' ')}
                      </Badge>
                      <span>•</span>
                      <span>{field.totalAnswers} answers</span>
                    </div>
                  </div>
                  {field.averageRating !== undefined && (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full border border-amber-500/20">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-sm">{field.averageRating}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  {field.breakdown.length > 0 ? (
                    field.fieldType === "rating" ||
                    field.fieldType === "single_select" ||
                    field.fieldType === "multi_select" ||
                    field.fieldType === "checkbox" ? (
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={field.breakdown.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={true} vertical={false} />
                            <XAxis 
                              type="number" 
                              tick={{ fill: "#71717a", fontSize: 11 }} 
                              stroke="rgba(255,255,255,0.1)" 
                              axisLine={false}
                              tickLine={false}
                              allowDecimals={false}
                            />
                            <YAxis
                              dataKey="value"
                              type="category"
                              width={120}
                              tick={{ fill: "#d4d4d8", fontSize: 12 }}
                              stroke="rgba(255,255,255,0.1)"
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                              contentStyle={{
                                backgroundColor: "#0f0f12",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: "8px",
                                fontSize: 12,
                                color: "#fafafa",
                                padding: "8px 12px"
                              }}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="#6366f1" 
                              radius={[0, 4, 4, 0]} 
                              barSize={24}
                            >
                              {field.breakdown.slice(0, 8).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-black/20 rounded-lg p-4 border border-white/[0.03]">
                        {field.breakdown.slice(0, 5).map((item, i) => (
                          <div key={i} className="flex items-start justify-between text-sm group">
                            <span className="text-zinc-300 pr-4 leading-relaxed group-hover:text-white transition-colors">
                              "{item.value}"
                            </span>
                            <Badge variant="secondary" className="bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 border-0 flex-shrink-0">
                              {item.count}
                            </Badge>
                          </div>
                        ))}
                        {field.breakdown.length > 5 && (
                          <div className="pt-2 mt-2 border-t border-white/[0.05] text-center">
                            <p className="text-xs text-indigo-400 font-medium">
                              + {field.breakdown.length - 5} more distinct answers
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 bg-black/10 rounded-lg border border-dashed border-white/[0.05]">
                      <p className="text-sm text-muted-foreground">No data collected yet</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
