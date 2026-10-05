"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Send,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Plus,
  Mail,
  Phone,
  ShieldCheck,
  ChevronRight,
  X,
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
        }),
      });
      if (res.ok) {
        fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
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
          direction: "outbound",
          status: requireApproval ? "pending_approval" : "completed",
          actor: "Operator",
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
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Human Review & Approval Queue
              </h1>
              <Badge variant="warning" className="text-xs font-semibold">
                {approvals.length} Pending Review
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              AI-generated customer communications and automated workflow drafts require human confirmation prior to dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setShowComposer(true)}
              variant="accent"
              size="sm"
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Outreach</span>
            </Button>
            <Button
              onClick={fetchApprovals}
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Pending Approvals List */}
        {loading ? (
          <Card className="p-12 text-center text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
            <p className="text-xs">Checking approval queue...</p>
          </Card>
        ) : approvals.length === 0 ? (
          <Card className="p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">All Clear! No Pending Approvals</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Any high-impact AI drafts or automated workflow actions requiring human review will appear here before dispatch.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {approvals.map((item) => (
              <Card key={item.id} className="p-6 shadow-sm border-amber-200/70 hover:border-amber-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {item.customer?.firstName?.[0] || item.customer?.email?.[0] || "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/customers/${item.customer?.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {item.customer?.firstName} {item.customer?.lastName}
                        </Link>
                        <Badge variant="secondary" className="text-[10px]">
                          {item.customer?.segment || "Customer"}
                        </Badge>
                        {item.customer?.churnRisk === "high" && (
                          <Badge variant="destructive" className="text-[10px]">
                            High Churn Risk
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5">{item.customer?.email}</span>
                    </div>
                  </div>

                  {/* Channel & Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {item.channel}
                    </Badge>
                    <span>Queued {formatDateTime(item.createdAt)}</span>
                  </div>
                </div>

                {/* Draft Content Box */}
                <div className="mt-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs sm:text-sm">
                  {item.subject && (
                    <div className="font-semibold text-slate-900 mb-1">
                      Subject: {item.subject}
                    </div>
                  )}
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Actions Bar */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>AI Guardrail checked • Operator authorization required to dispatch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setSelectedItem(item);
                        setEditedContent(item.content);
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 h-8 text-xs bg-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Draft</span>
                    </Button>
                    <Button
                      disabled={processingId === item.id}
                      onClick={() => handleReject(item.id)}
                      variant="destructive"
                      size="sm"
                      className="gap-1.5 h-8 text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </Button>
                    <Button
                      disabled={processingId === item.id}
                      onClick={() => handleApprove(item.id)}
                      variant="default"
                      size="sm"
                      className="gap-1.5 h-8 text-xs bg-slate-900"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Approve & Dispatch</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Edit & Approve Dialog */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-xl shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold">Edit Communication Draft</CardTitle>
                  <CardDescription className="text-xs">
                    Recipient: {selectedItem.customer?.firstName} {selectedItem.customer?.lastName} ({selectedItem.customer?.email})
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setSelectedItem(null)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedItem.subject && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Subject
                    </label>
                    <Input
                      type="text"
                      defaultValue={selectedItem.subject}
                      disabled
                      className="bg-slate-50 text-xs"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={6}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-950"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button onClick={() => setSelectedItem(null)} variant="outline" size="sm" className="h-8 text-xs">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApprove(selectedItem.id, editedContent)}
                  disabled={processingId === selectedItem.id}
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Approve & Dispatch</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Modal: Compose New Message */}
        {showComposer && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-xl shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <form onSubmit={handleSendMessage}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-bold">New Customer Outreach Draft</CardTitle>
                    <CardDescription className="text-xs">
                      Compose personalized messages with operator approval gating
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Recipient Customer
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950"
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
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950"
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="call">Phone Call Note</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Approval Policy
                      </label>
                      <div className="flex items-center h-9 gap-2">
                        <input
                          type="checkbox"
                          id="requireAppr"
                          checked={requireApproval}
                          onChange={(e) => setRequireApproval(e.target.checked)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-950"
                        />
                        <label htmlFor="requireAppr" className="text-xs text-slate-600">
                          Route through review queue
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Subject
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Special VIP Loyalty Perk for Solar Energy..."
                      value={composerSubject}
                      onChange={(e) => setComposerSubject(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Content
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Type your message draft here..."
                      value={composerContent}
                      onChange={(e) => setComposerContent(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-950"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingMessage || !composerContent.trim()}
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingMessage ? "Queueing..." : requireApproval ? "Queue for Approval" : "Send Directly"}</span>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
