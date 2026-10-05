"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Zap,
  Sparkles,
  Bot,
  ArrowUpRight,
  ShieldCheck,
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

  const getSegmentBadgeVariant = (name: string) => {
    switch (name) {
      case "VIP":
        return "vip";
      case "Loyal":
        return "loyal";
      case "Promising":
        return "promising";
      case "At-Risk":
        return "warning";
      case "Dormant":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Executive CRM Intelligence
              </h1>
              {data?.kpis?.isMockMode ? (
                <Badge variant="warning" className="text-[11px] font-medium">
                  Sandbox Store Mode
                </Badge>
              ) : (
                <Badge variant="success" className="text-[11px] font-medium">
                  Live WooCommerce Connected
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Deterministic RFM segmentation, real-time sales velocity, and AI-prioritized winback actions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="accent" size="sm" className="gap-2 shadow-sm">
              <Link href="/assistant">
                <Bot className="w-4 h-4" />
                <span>Ask AI Copilot</span>
              </Link>
            </Button>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* High-Impact Human Approval Alert Banner */}
        {data?.kpis?.pendingApprovalsCount > 0 && (
          <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 block">
                  {data.kpis.pendingApprovalsCount} AI Communication Draft(s) Awaiting Human Approval
                </span>
                <span className="text-xs text-slate-600">
                  AI Guardrail Enforced: High-impact outbound messages require operator review before sending.
                </span>
              </div>
            </div>
            <Button asChild size="sm" variant="default" className="shrink-0 gap-1.5 self-start sm:self-auto">
              <Link href="/communications">
                <span>Review Approvals</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* 4 Core KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Revenue
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(data?.kpis?.totalRevenue)}
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Synchronized with store</span>
              </p>
            </CardContent>
          </Card>

          {/* Orders & AOV */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Orders
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                {data?.kpis?.totalOrders || 0}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Avg Order Value: <span className="font-semibold text-slate-700">{formatCurrency(data?.kpis?.averageOrderValue)}</span>
              </p>
            </CardContent>
          </Card>

          {/* Customer Directory */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Customers
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                {data?.kpis?.totalCustomers || 0}
              </div>
              <p className="text-xs text-purple-600 font-medium mt-1">
                100% RFM Scored & Cohorted
              </p>
            </CardContent>
          </Card>

          {/* Sync Health */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Sync Pipeline
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-lg font-bold text-slate-900 capitalize">
                  {data?.kpis?.syncStatus || "Active"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                Last synced {formatDateTime(data?.kpis?.lastSyncAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Health Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Velocity Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Sales Velocity Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Daily revenue trajectory over the past 7 days
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs font-medium">
                Last 7 Days
              </Badge>
            </CardHeader>

            <CardContent>
              <div className="h-52 flex items-end gap-3 pt-6 pb-2 border-b border-slate-100">
                {data?.dailyTrends?.map((day: any, idx: number) => {
                  const maxRev = Math.max(...data.dailyTrends.map((d: any) => d.revenue), 100);
                  const heightPct = Math.max(12, Math.round((day.revenue / maxRev) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {formatCurrency(day.revenue)}
                      </span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full rounded-t-md bg-gradient-to-t from-slate-900 to-amber-500 group-hover:from-slate-800 group-hover:to-amber-400 transition-all duration-200 shadow-sm"
                      />
                      <span className="text-xs font-medium text-slate-500">{day.date}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
                <span>Orders Processed: {data?.kpis?.totalOrders || 0}</span>
                <span className="font-medium text-slate-700">Gross: {formatCurrency(data?.kpis?.totalRevenue)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Health Segmentation Breakdown */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Customer Health
                </CardTitle>
                <CardDescription className="text-xs">
                  Deterministic RFM Quintiles
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-amber-600 hover:text-amber-700 p-0">
                <Link href="/customers" className="flex items-center gap-1">
                  <span>Directory</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="space-y-3.5 pt-1">
              {data?.segments?.map((seg: any) => (
                <div key={seg.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={getSegmentBadgeVariant(seg.name)} className="h-5 px-2 text-[10px]">
                        {seg.name}
                      </Badge>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      {seg.count} <span className="font-normal text-slate-400">({seg.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(6, seg.percentage)}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
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
            </CardContent>
          </Card>
        </div>

        {/* Prioritized AI Action Cards & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Prioritized Churn Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Prioritized Churn & Winback Alerts
                </CardTitle>
              </div>
              <Badge variant="destructive" className="text-[10px]">
                Attention Required
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3">
              {data?.atRiskCustomers?.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">
                  Zero high-churn customers detected! Customer retention is healthy.
                </p>
              ) : (
                data?.atRiskCustomers?.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/customers/${c.id}`}
                          className="font-semibold text-xs text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {c.firstName} {c.lastName}
                        </Link>
                        <Badge variant={getSegmentBadgeVariant(c.segment)} className="text-[10px] h-4">
                          {c.segment}
                        </Badge>
                        <span className="text-[11px] text-slate-500 font-medium">
                          • {formatCurrency(c.totalSpend)} LTV
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">
                        {c.churnReason || `Inactivity gap: ${c.rfmRecencyDays} days since last purchase.`}
                      </p>
                    </div>

                    <Button asChild size="sm" variant="outline" className="h-7 text-xs px-2.5 shrink-0 bg-white">
                      <Link href={`/customers/${c.id}`}>
                        <span>Profile</span>
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Orders Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Recent Store Activity
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest synced transactions
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-amber-600 hover:text-amber-700 p-0">
                <Link href="/orders" className="flex items-center gap-1">
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="space-y-2.5">
              {data?.recentOrders?.map((o: any) => (
                <div
                  key={o.id}
                  className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${o.id}`}
                      className="font-semibold text-slate-900 hover:text-amber-600 transition-colors"
                    >
                      {o.orderNumber}
                    </Link>
                    <span className="text-slate-500">
                      by {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : "Customer"}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="font-semibold text-slate-900">{formatCurrency(o.total)}</span>
                    <Badge variant="outline" className="capitalize text-[10px] h-5">
                      {o.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
