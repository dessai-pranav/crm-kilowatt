"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Clock,
  Send,
  MessageSquare,
  FileText,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Tag,
  Plus,
  Trash2,
  ChevronRight,
  Bot,
  Zap,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

export default function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "timeline" | "notes">("overview");

  // New Note state
  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // New Tag state
  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);

  // Generating AI Insight
  const [generatingAI, setGeneratingAI] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/customers/${id}/notes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: noteContent.trim(), author: "Operator" }),
      });
      if (res.ok) {
        setNoteContent("");
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/customers/${id}/notes?noteId=${noteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !customer) return;
    const currentTags = customer.tags ? JSON.parse(customer.tags) : [];
    if (!currentTags.includes(newTag.trim())) {
      const updated = [...currentTags, newTag.trim()];
      try {
        const res = await fetch(`/api/customers/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tags: updated }),
        });
        if (res.ok) {
          setNewTag("");
          setAddingTag(false);
          fetchProfile();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    try {
      const res = await fetch(`/api/ai/insights`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerId: id }),
      });
      if (res.ok) {
        await fetchProfile();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 pb-16">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
          <p className="text-sm">Loading Customer 360 Profile...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50/60 pb-16">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-lg font-bold text-slate-900">Customer Not Found</h2>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/customers">Return to Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tagsList: string[] = customer.tags ? JSON.parse(customer.tags) : [];
  const latestInsight = customer.aiInsights?.[0];
  let churnEvidenceList: any[] = [];
  if (latestInsight?.churnEvidence) {
    try {
      churnEvidenceList = JSON.parse(latestInsight.churnEvidence);
    } catch {}
  }

  const getSegmentVariant = (segment: string) => {
    switch (segment) {
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
          </Link>
        </div>

        {/* Profile Header Card */}
        <Card className="p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {customer.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                  {customer.firstName?.[0] || customer.email[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {customer.firstName} {customer.lastName}
                  </h1>
                  <Badge variant={getSegmentVariant(customer.segment)}>
                    {customer.segment} Segment
                  </Badge>
                  {customer.churnRisk === "high" && (
                    <Badge variant="destructive" className="gap-1">
                      <Flame className="w-3 h-3" /> High Churn Risk
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                  <span>{customer.email}</span>
                  {customer.phone && <span>• {customer.phone}</span>}
                  {customer.wooCustomerId && (
                    <span>• WooCommerce ID: #{customer.wooCustomerId}</span>
                  )}
                  <span>• Customer since {formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleGenerateAI}
                disabled={generatingAI}
                variant="outline"
                size="sm"
                className="gap-2 bg-white shadow-sm"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${generatingAI ? "animate-spin" : ""}`} />
                <span>{generatingAI ? "Analyzing with Gemini..." : "Refresh AI Insights"}</span>
              </Button>
              <Button asChild variant="accent" size="sm" className="gap-2 shadow-sm">
                <Link href={`/assistant?q=Summarize customer ${customer.firstName} ${customer.lastName}`}>
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask Copilot</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Tags bar */}
          <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5" /> Tags:
            </span>
            {tagsList.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
            {addingTag ? (
              <div className="inline-flex items-center gap-1.5 ml-1">
                <Input
                  type="text"
                  placeholder="New tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="h-7 w-28 text-xs px-2"
                />
                <Button onClick={handleAddTag} size="sm" className="h-7 px-2.5 text-xs">
                  Save
                </Button>
                <Button onClick={() => setAddingTag(false)} variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setAddingTag(true)}
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-slate-500 hover:text-slate-900 px-2 gap-1"
              >
                <Plus className="w-3 h-3" /> Add Tag
              </Button>
            )}
          </div>
        </Card>

        {/* 360 Core Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <Card className="p-4 shadow-sm">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">Lifetime Spend (LTV)</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 mt-1 block">
              {formatCurrency(customer.totalSpend)}
            </span>
          </Card>

          <Card className="p-4 shadow-sm">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">Orders Completed</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 mt-1 block">
              {customer.ordersCount}
            </span>
          </Card>

          <Card className="p-4 shadow-sm">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">Average Order Value</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 mt-1 block">
              {formatCurrency(customer.averageOrderValue)}
            </span>
          </Card>

          <Card className="p-4 shadow-sm">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">Inactivity Gap</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 mt-1 block">
              {customer.rfmRecencyDays !== null ? `${customer.rfmRecencyDays} days` : "N/A"}
            </span>
          </Card>

          <Card className="p-4 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">RFM Quintile</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 mt-1 block font-mono">
              {customer.rfmScore || "N/A"}
            </span>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Insights & Recommendations
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Order History ({customer.orders?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "timeline"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Communications Feed
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "notes"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" /> Team Notes ({customer.notes?.length || 0})
          </button>
        </div>

        {/* Tab 1: AI Insights */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Summary Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <CardTitle className="text-base font-bold">Executive AI Summary</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Grounded in actual order recency and store LTV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                  {latestInsight?.summary || "Click 'Refresh AI Insights' above to generate with Google Gemini."}
                </p>

                {/* Churn Risk Rationale */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Churn Risk Evaluation
                  </h3>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    {customer.churnRisk === "high" ? (
                      <Flame className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-xs sm:text-sm capitalize text-slate-900 block">
                        {customer.churnRisk} Churn Risk
                      </span>
                      <span className="text-xs text-slate-600 mt-0.5 block">
                        {customer.churnReason || "Healthy transaction cadence within expected store norms."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantitative Evidence Benchmarks */}
                {churnEvidenceList.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Grounded Evidence Benchmarks
                    </h3>
                    <div className="space-y-1.5">
                      {churnEvidenceList.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50/70 border border-slate-100"
                        >
                          <span className="font-medium text-slate-700">{item.metric}:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-900 font-semibold">{item.value}</span>
                            <Badge variant="outline" className="text-[10px] h-4">
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Best Action Card */}
            <Card className="shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-base font-bold">Explainable Next-Best-Action</CardTitle>
                  </div>
                  {latestInsight?.confidenceScore && (
                    <Badge variant="success" className="text-xs font-medium">
                      {Math.round(latestInsight.confidenceScore * 100)}% Confidence
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Prescriptive intervention based on segment indicators
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                    {latestInsight?.nextBestAction || "Standard Retention Protocol"}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {latestInsight?.actionRationale ||
                      "Regular automated post-purchase updates and scheduled marketing newsletters."}
                  </p>
                </div>

                {latestInsight?.suggestedCommunication && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      AI Generated Outreach Draft
                    </h3>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {latestInsight.suggestedCommunication}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-slate-100 flex items-center justify-between pt-4">
                <span className="text-[11px] text-slate-400">
                  Protected by AI Guardrails (Human Approval Required)
                </span>
                <Button asChild size="sm" variant="default" className="gap-1.5">
                  <Link href="/communications">
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open Approvals</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Tab 2: Orders History */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {customer.orders?.length === 0 ? (
              <Card className="p-12 text-center text-slate-400">
                No orders recorded for this customer yet.
              </Card>
            ) : (
              customer.orders.map((order: any) => (
                <Card key={order.id} className="p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-base font-bold text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {order.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        Placed on {formatDateTime(order.dateCreated)}
                        {order.paymentMethodTitle && ` via ${order.paymentMethodTitle}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-slate-900 block">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mt-3 divide-y divide-slate-100">
                    {order.lineItems?.map((item: any) => (
                      <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-medium text-slate-800">{item.name}</span>
                          {item.sku && (
                            <span className="text-slate-400 ml-2">SKU: {item.sku}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 mr-2">
                            {item.quantity} × {formatCurrency(item.price)}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Timeline & Communications */}
        {activeTab === "timeline" && (
          <Card className="p-6 shadow-sm">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">Interaction History</CardTitle>
              <CardDescription className="text-xs">
                All communications and workflow executions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {customer.communications?.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No interaction history recorded yet.</p>
              ) : (
                customer.communications.map((com: any) => (
                  <div
                    key={com.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="uppercase text-[10px] h-4">
                          {com.channel}
                        </Badge>
                        <span className="text-slate-500 capitalize">{com.direction}</span>
                        <span className="text-slate-400">• {formatDateTime(com.createdAt)}</span>
                      </div>
                      {com.subject && (
                        <h4 className="font-semibold text-slate-900 mt-1.5">{com.subject}</h4>
                      )}
                      <p className="text-slate-600 mt-1 leading-relaxed">{com.content}</p>
                    </div>
                    <Badge variant={com.status === "completed" ? "success" : "warning"} className="capitalize text-[10px]">
                      {com.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Internal Notes */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            {/* Create Note Card */}
            <Card className="p-5 shadow-sm">
              <form onSubmit={handleAddNote} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Add Internal Staff Note</h3>
                  <span className="text-[11px] text-slate-400">Visible to CRM operators only</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Record customer preferences, account context, or call summary..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-3 bg-slate-50/60 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={addingNote || !noteContent.trim()}
                    size="sm"
                    className="gap-2"
                  >
                    {addingNote ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Notes List */}
            <div className="space-y-2.5">
              {customer.notes?.length === 0 ? (
                <Card className="p-8 text-center text-slate-400 text-xs">
                  No internal notes recorded yet.
                </Card>
              ) : (
                customer.notes.map((note: any) => (
                  <Card key={note.id} className="p-4 shadow-sm flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-slate-900">{note.author}</span>
                        <span className="text-slate-400 text-xs">• {formatDateTime(note.createdAt)}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleDeleteNote(note.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-rose-600"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
