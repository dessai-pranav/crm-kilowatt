"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
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
  CheckCircle2,
  ExternalLink,
  Bot,
  Zap,
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
      const updatedTags = [...currentTags, newTag.trim()];
      try {
        const res = await fetch(`/api/customers/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tags: updatedTags }),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
          Loading Customer 360 profile...
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-600">Customer profile not found.</p>
          <Link href="/customers" className="mt-4 inline-block text-amber-600 font-semibold hover:underline">
            ← Back to Customer Directory
          </Link>
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

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Customers
          </Link>
        </div>

        {/* Profile Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {customer.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-sm">
                  {customer.firstName?.[0] || customer.email[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {customer.firstName} {customer.lastName}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    {customer.segment} Segment
                  </span>
                  {customer.churnRisk === "high" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                      <Flame className="w-3.5 h-3.5 text-rose-600" /> High Churn Risk
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                  <span>{customer.email}</span>
                  {customer.phone && <span>• {customer.phone}</span>}
                  {customer.wooCustomerId && (
                    <span>• WooCommerce ID: #{customer.wooCustomerId}</span>
                  )}
                  <span>• Customer since {formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <Link
                href={`/assistant?q=Summarize customer ${customer.firstName} ${customer.lastName}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
              >
                <Bot className="w-4 h-4" /> Ask Copilot
              </Link>
            </div>
          </div>

          {/* Tags bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5" /> Tags:
            </span>
            {tagsList.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                {tag}
              </span>
            ))}
            {addingTag ? (
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  placeholder="New tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="px-2 py-0.5 text-xs bg-slate-50 border border-slate-300 rounded"
                />
                <button
                  onClick={handleAddTag}
                  className="px-2 py-0.5 text-xs bg-slate-900 text-white rounded font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setAddingTag(false)}
                  className="px-1.5 py-0.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingTag(true)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
                <Plus className="w-3 h-3" /> Add Tag
              </button>
            )}
          </div>
        </div>

        {/* 360 Core Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Lifetime Spend (LTV)</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {formatCurrency(customer.totalSpend)}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Orders Completed</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {customer.ordersCount}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Average Order Value</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {formatCurrency(customer.averageOrderValue)}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Recency (Inactivity)</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {customer.rfmRecencyDays !== null ? `${customer.rfmRecencyDays} days` : "N/A"}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block">Deterministic RFM</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block font-mono">
              {customer.rfmScore || "N/A"}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Insights & Intelligence
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Order History ({customer.orders?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "timeline"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Communications & Workflows
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "notes"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" /> Internal Notes ({customer.notes?.length || 0})
          </button>
        </div>

        {/* Tab 1: AI Insights */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2>Executive Customer Summary</h2>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {latestInsight?.summary || "No AI summary generated yet."}
              </p>

              {/* Churn Risk Rationale */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Churn Risk Evaluation
                </h3>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  {customer.churnRisk === "high" ? (
                    <Flame className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-sm capitalize text-slate-900 block">
                      {customer.churnRisk} Churn Risk
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5 block">
                      {customer.churnReason || "Regular engagement within store norms."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantitative Evidence */}
              {churnEvidenceList.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Evidence & Underlying Metrics
                  </h3>
                  <div className="space-y-2">
                    {churnEvidenceList.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <span className="font-medium text-slate-700">{item.metric}:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-900 font-semibold">{item.value}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Next Best Action Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h2>Explainable Next-Best-Action</h2>
                  </div>
                  {latestInsight?.confidenceScore && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {Math.round(latestInsight.confidenceScore * 100)}% Confidence
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 mb-4">
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {latestInsight?.nextBestAction || "Regular Engagement Protocol"}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {latestInsight?.actionRationale ||
                      "Continue standard post-purchase tracking and customer check-in."}
                  </p>
                </div>

                {latestInsight?.suggestedCommunication && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      AI Generated Outreach Draft
                    </h3>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-56 overflow-y-auto">
                      {latestInsight.suggestedCommunication}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Requires human review prior to external dispatch
                </span>
                <Link
                  href="/communications"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" /> Open Approval Queue
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders History */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {customer.orders?.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
                No orders recorded for this customer yet.
              </div>
            ) : (
              customer.orders.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-slate-900">
                          {order.orderNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-slate-100 text-slate-800">
                          {order.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Placed on {formatDateTime(order.dateCreated)}
                        {order.paymentMethodTitle && ` via ${order.paymentMethodTitle}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-slate-900">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Line Items
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {order.lineItems?.map((item: any) => (
                        <div
                          key={item.id}
                          className="py-2 flex items-center justify-between text-sm"
                        >
                          <div>
                            <span className="font-medium text-slate-800">{item.name}</span>
                            {item.sku && (
                              <span className="text-xs text-slate-400 ml-2">SKU: {item.sku}</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 text-xs mr-3">
                              {item.quantity} × {formatCurrency(item.price)}
                            </span>
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Timeline & Communications */}
        {activeTab === "timeline" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Customer Interaction Feed</h3>
            <div className="space-y-4">
              {customer.communications?.length === 0 ? (
                <p className="text-sm text-slate-400">No interaction history recorded yet.</p>
              ) : (
                customer.communications.map((com: any) => (
                  <div
                    key={com.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-200 text-slate-800">
                          {com.channel}
                        </span>
                        <span className="text-xs text-slate-500 capitalize">{com.direction}</span>
                        <span className="text-xs text-slate-400">• {formatDateTime(com.createdAt)}</span>
                      </div>
                      {com.subject && (
                        <h4 className="text-sm font-semibold text-slate-900 mt-2">{com.subject}</h4>
                      )}
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{com.content}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        com.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {com.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Internal Notes */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            {/* Create Note Box */}
            <form onSubmit={handleAddNote} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Add Internal Operator Note</h3>
              <textarea
                rows={3}
                placeholder="Write internal team notes regarding preferences, support discussion, or customer context..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={addingNote || !noteContent.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {addingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3">
              {customer.notes?.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-400">
                  No internal notes added yet.
                </div>
              ) : (
                customer.notes.map((note: any) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-slate-900">{note.author}</span>
                        <span className="text-xs text-slate-400">• {formatDateTime(note.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
