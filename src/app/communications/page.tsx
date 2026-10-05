"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  User,
  RefreshCw,
  Edit3,
  ChevronRight,
  Plus,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function CommunicationsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editedContent, setEditedContent] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // New Message Composer state
  const [showComposer, setShowComposer] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [composerSubject, setComposerSubject] = useState("");
  const [composerContent, setComposerContent] = useState("");
  const [composerChannel, setComposerChannel] = useState("email");
  const [requireApproval, setRequireApproval] = useState(true);
  const [submittingMessage, setSubmittingMessage] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/communications/approvals");
      if (res.ok) {
        const data = await res.json();
        setApprovals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersForComposer = async () => {
    try {
      const res = await fetch("/api/customers?limit=100");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        if (data.customers?.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(data.customers[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApprovals();
    fetchCustomersForComposer();
  }, []);

  const handleApprove = async (id: string, customContent?: string) => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/communications/approvals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id,
          action: "approve",
          operator: "Operator",
          editedContent: customContent || undefined,
        }),
      });
      if (res.ok) {
        setSelectedItem(null);
        fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/communications/approvals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id,
          action: "reject",
          operator: "Operator",
          reason: "Rejected from operator approvals dashboard",
        }),
      });
      if (res.ok) {
        setSelectedItem(null);
        fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !composerContent.trim()) return;

    setSubmittingMessage(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomerId}/communications`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          channel: composerChannel,
          subject: composerSubject.trim() || undefined,
          content: composerContent.trim(),
          requiresApproval: requireApproval,
          actor: "Operator Composer",
        }),
      });
      if (res.ok) {
        setShowComposer(false);
        setComposerSubject("");
        setComposerContent("");
        fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingMessage(false);
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
              <h1 className="text-2xl font-bold text-slate-900">
                Human Review & Approval Queue
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {approvals.length} Pending Review
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              AI-generated customer communications and automated workflow drafts require human confirmation prior to dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComposer(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Message Draft
            </button>
            <button
              onClick={fetchApprovals}
              className="p-2 text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-sm"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Pending Approvals List */}
        {loading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            Checking approval queue...
          </div>
        ) : approvals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All Clear! No Pending Approvals</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Any high-impact AI drafts or automated workflow actions requiring human review will appear here before dispatch.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-amber-200/80 shadow-sm p-6 hover:border-amber-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      {item.customer?.firstName?.[0] || item.customer?.email?.[0] || "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/customers/${item.customer?.id}`}
                          className="font-bold text-base text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {item.customer?.firstName} {item.customer?.lastName}
                        </Link>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">
                          {item.customer?.segment || "Customer"}
                        </span>
                        {item.customer?.churnRisk === "high" && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                            High Churn Risk
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 block">{item.customer?.email}</span>
                    </div>
                  </div>

                  {/* Channel & Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-1 rounded-md bg-slate-100 font-bold uppercase text-slate-700">
                      {item.channel}
                    </span>
                    <span>Queued {formatDateTime(item.createdAt)}</span>
                  </div>
                </div>

                {/* Draft Content Box */}
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  {item.subject && (
                    <div className="text-sm font-bold text-slate-900 mb-1">
                      Subject: {item.subject}
                    </div>
                  )}
                  <p className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Actions Bar */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Guardrail check passed • Operator authorization required
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setEditedContent(item.content);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Draft
                    </button>
                    <button
                      disabled={processingId === item.id}
                      onClick={() => handleReject(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      disabled={processingId === item.id}
                      onClick={() => handleApprove(item.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Approve & Dispatch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Edit & Approve */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Edit & Approve Message
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Recalibrate AI-generated copy before releasing to recipient.
              </p>

              {selectedItem.subject && (
                <div className="mb-3">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedItem.subject}
                    className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Message Content
                </label>
                <textarea
                  rows={6}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={processingId === selectedItem.id}
                  onClick={() => handleApprove(selectedItem.id, editedContent)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Save & Approve Dispatch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: New Message Composer */}
        {showComposer && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Compose Outbound Communication
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Draft a message to a customer or queue for approval.
              </p>

              <form onSubmit={handleCreateOutreach} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Select Target Customer
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.email}) - {c.segment}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Channel
                    </label>
                    <select
                      value={composerChannel}
                      onChange={(e) => setComposerChannel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="call">Call Note</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Template Preset
                    </label>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "vip") {
                          setComposerSubject("VIP Exclusive Early Access");
                          setComposerContent("Hi there,\n\nAs one of our top VIP customers, we are excited to give you early access to our next product launch.");
                        } else if (val === "winback") {
                          setComposerSubject("We miss you at Kilowatt + 15% discount");
                          setComposerContent("Hi there,\n\nWe haven't seen you in a while! Here is an exclusive 15% discount code for your next order: RECONNECT15.");
                        } else if (val === "feedback") {
                          setComposerSubject("How was your recent order experience?");
                          setComposerContent("Hi there,\n\nWe wanted to follow up and see how your equipment is performing. Do you need any assistance?");
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Custom Message</option>
                      <option value="vip">VIP Early Access</option>
                      <option value="winback">15% Winback Offer</option>
                      <option value="feedback">Post-Purchase Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    placeholder="Subject..."
                    value={composerSubject}
                    onChange={(e) => setComposerSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Write message content..."
                    value={composerContent}
                    onChange={(e) => setComposerContent(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <input
                    type="checkbox"
                    id="requireApproval"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="requireApproval" className="font-medium cursor-pointer">
                    Enforce AI Guardrail: Place in Human Approval Queue before actual dispatch
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingMessage || !composerContent.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submittingMessage
                      ? "Submitting..."
                      : requireApproval
                      ? "Submit to Approval Queue"
                      : "Send Immediately"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
