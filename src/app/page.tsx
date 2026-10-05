"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  RefreshCw,
  Send,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getSegmentColor = (name: string) => {
    switch (name) {
      case "VIP":
        return "bg-purple-500 text-purple-700";
      case "Loyal":
        return "bg-blue-500 text-blue-700";
      case "Promising":
        return "bg-emerald-500 text-emerald-700";
      case "At-Risk":
        return "bg-amber-500 text-amber-700";
      case "Dormant":
        return "bg-rose-500 text-rose-700";
      default:
        return "bg-slate-400 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Executive CRM Intelligence</h1>
              {data?.kpis?.isMockMode && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  Demo Store Sandbox
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Real-time revenue metrics, deterministic RFM customer segments, and AI-prioritized actions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              <Bot className="w-4 h-4" /> Ask Copilot
            </Link>
            <button
              onClick={fetchDashboardData}
              className="p-2 text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-sm"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Top Notification Banner if Pending Approvals Exist */}
        {data?.kpis?.pendingApprovalsCount > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  {data.kpis.pendingApprovalsCount} Communication Draft(s) Awaiting Human Approval
                </span>
                <span className="text-xs text-slate-600">
                  AI Guardrail enforced: High-impact outreach requires operator confirmation before dispatch.
                </span>
              </div>
            </div>
            <Link
              href="/communications"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0"
            >
              Review Queue <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 4 Core KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Store Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {formatCurrency(data?.kpis?.totalRevenue)}
            </span>
            <span className="text-xs text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Synchronized with WooCommerce
            </span>
          </div>

          {/* Orders */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {data?.kpis?.totalOrders || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium mt-1 block">
              Avg Order Value: {formatCurrency(data?.kpis?.averageOrderValue)}
            </span>
          </div>

          {/* Customers */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Customer Directory</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {data?.kpis?.totalCustomers || 0}
            </span>
            <span className="text-xs text-purple-600 font-medium mt-1 block">
              100% RFM Scored & Segmented
            </span>
          </div>

          {/* Sync Health */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">WooCommerce Sync</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-lg font-bold text-slate-900 capitalize">
                {data?.kpis?.syncStatus || "Active"}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Last synced {formatDateTime(data?.kpis?.lastSyncAt)}
            </span>
          </div>
        </div>

        {/* Charts & Health Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Sales Velocity Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sales Velocity (Past 7 Days)</h2>
                <span className="text-xs text-slate-500">Daily revenue and order volume trends</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                Daily Breakdown
              </span>
            </div>

            <div className="h-48 flex items-end gap-3 pt-6 border-b border-slate-100">
              {data?.dailyTrends?.map((day: any, idx: number) => {
                const maxRev = Math.max(...data.dailyTrends.map((d: any) => d.revenue), 100);
                const heightPct = Math.max(10, Math.round((day.revenue / maxRev) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatCurrency(day.revenue)}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-slate-900 to-amber-500 group-hover:from-slate-800 group-hover:to-amber-400 transition-all"
                    />
                    <span className="text-xs font-semibold text-slate-500">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Health Segmentation Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Customer Health</h2>
                <span className="text-xs text-slate-500">Deterministic RFM Segments</span>
              </div>
              <Link
                href="/customers"
                className="text-xs font-semibold text-amber-600 hover:underline"
              >
                View Directory →
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              {data?.segments?.map((seg: any) => (
                <div key={seg.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{seg.name}</span>
                    <span className="text-slate-500">
                      {seg.count} ({seg.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(5, seg.percentage)}%` }}
                      className={`h-full rounded-full ${
                        seg.name === "VIP"
                          ? "bg-purple-500"
                          : seg.name === "Loyal"
                          ? "bg-blue-500"
                          : seg.name === "Promising"
                          ? "bg-emerald-500"
                          : seg.name === "At-Risk"
                          ? "bg-amber-500"
                          : seg.name === "Dormant"
                          ? "bg-rose-500"
                          : "bg-slate-400"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prioritized AI Action Cards & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Prioritized Churn Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">
                  Prioritized Churn & Winback Alerts
                </h2>
              </div>
              <span className="text-xs font-semibold text-rose-600">Action Required</span>
            </div>

            <div className="space-y-3">
              {data?.atRiskCustomers?.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  Zero high-churn customers detected! Customer retention is healthy.
                </p>
              ) : (
                data?.atRiskCustomers?.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/customers/${c.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {c.firstName} {c.lastName}
                        </Link>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {c.segment}
                        </span>
                        <span className="text-xs text-slate-500">
                          • {formatCurrency(c.totalSpend)} LTV
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {c.churnReason || `Inactive for ${c.rfmRecencyDays} days.`}
                      </p>
                    </div>

                    <Link
                      href={`/customers/${c.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors shrink-0"
                    >
                      View 360 <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Orders Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Store Activity</h2>
              <Link href="/orders" className="text-xs font-semibold text-amber-600 hover:underline">
                All Orders →
              </Link>
            </div>

            <div className="space-y-3">
              {data?.recentOrders?.map((o: any) => (
                <div
                  key={o.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <Link
                      href={`/orders/${o.id}`}
                      className="font-bold text-slate-900 hover:text-amber-600 transition-colors"
                    >
                      {o.orderNumber}
                    </Link>
                    <span className="text-slate-500 ml-2">
                      by {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : "Guest"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{formatCurrency(o.total)}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
