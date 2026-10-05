"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Workflow,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [triggerSuccessMsg, setTriggerSuccessMsg] = useState("");

  // New Workflow Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [wfName, setWfName] = useState("");
  const [wfDesc, setWfDesc] = useState("");
  const [wfTrigger, setWfTrigger] = useState("order.completed");

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const [wfRes, custRes, ordRes] = await Promise.all([
        fetch("/api/workflows"),
        fetch("/api/customers?limit=10"),
        fetch("/api/orders?limit=10"),
      ]);

      if (wfRes.ok) setWorkflows(await wfRes.json());
      if (custRes.ok) setCustomers((await custRes.json()).customers || []);
      if (ordRes.ok) setOrders((await ordRes.json()).orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleTriggerTest = async (workflow: any) => {
    setTriggeringId(workflow.id);
    setTriggerSuccessMsg("");
    try {
      const targetCustomer = customers[0];
      const targetOrder = orders[0];

      if (!targetCustomer) {
        alert("No customers available to test workflow. Run sync first.");
        return;
      }

      const res = await fetch("/api/workflows/trigger", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          triggerEvent: workflow.triggerEvent,
          customerId: targetCustomer.id,
          orderId: targetOrder?.id,
        }),
      });

      if (res.ok) {
        setTriggerSuccessMsg(`Test execution triggered for ${workflow.name}! Check Approvals or Execution History below.`);
        fetchWorkflows();
        setTimeout(() => setTriggerSuccessMsg(""), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringId(null);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfName.trim()) return;

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: wfName.trim(),
          description: wfDesc.trim() || undefined,
          triggerEvent: wfTrigger,
          steps: [
            {
              type: "action",
              action: "ai_draft_message",
              config: { template: "Thank you for your order! We appreciate your business." },
            },
            {
              type: "action",
              action: "require_human_approval",
            },
          ],
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setWfName("");
        setWfDesc("");
        fetchWorkflows();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Event-Driven Workflow Automation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Automated multi-step rules triggered by WooCommerce orders, churn indicators, and human approval checkpoints.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="accent"
              size="sm"
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workflow</span>
            </Button>
            <Button
              onClick={fetchWorkflows}
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white"
              title="Refresh Workflows"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Feedback Banner */}
        {triggerSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{triggerSuccessMsg}</span>
          </div>
        )}

        {/* Workflows Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {workflows.map((wf) => {
            let steps: any[] = [];
            try {
              steps = typeof wf.steps === "string" ? JSON.parse(wf.steps) : wf.steps || [];
            } catch {}

            return (
              <Card key={wf.id} className="p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{wf.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{wf.description || "Automated customer retention rule."}</p>
                    </div>
                    <Badge variant={wf.isActive ? "success" : "secondary"} className="capitalize text-[10px]">
                      {wf.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Trigger & Condition Badges */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant="outline" className="text-[10px] gap-1 bg-amber-50/60 border-amber-200 text-amber-900">
                      <Zap className="w-3 h-3 text-amber-600" />
                      Trigger: {wf.triggerEvent}
                    </Badge>
                    {wf.executions?.length > 0 && (
                      <span className="text-[11px] text-slate-400">
                        {wf.executions.length} runs executed
                      </span>
                    )}
                  </div>

                  {/* Steps Chain */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Execution Steps Chain
                    </span>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {steps.map((st: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200/70 text-[11px]">
                            {st.action || st.type}
                          </span>
                          {idx < steps.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Human approval gate enabled
                  </span>
                  <Button
                    onClick={() => handleTriggerTest(wf)}
                    disabled={triggeringId === wf.id}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs bg-white"
                  >
                    <Play className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{triggeringId === wf.id ? "Executing..." : "Run Test"}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Modal: Create Workflow */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <form onSubmit={handleCreateWorkflow}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-bold">Create New Workflow Rule</CardTitle>
                    <CardDescription className="text-xs">
                      Define automated trigger events and actions
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
                      Workflow Name
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. VIP Order Thank You & Feedback"
                      value={wfName}
                      onChange={(e) => setWfName(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Trigger Event
                    </label>
                    <select
                      value={wfTrigger}
                      onChange={(e) => setWfTrigger(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950"
                    >
                      <option value="order.completed">order.completed (WooCommerce Order Placed)</option>
                      <option value="order.delivered">order.delivered (Order Fulfilled)</option>
                      <option value="customer.churn_risk_high">customer.churn_risk_high (Inactivity &gt; 90 days)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Brief note on this rule's retention purpose..."
                      value={wfDesc}
                      onChange={(e) => setWfDesc(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-950"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="h-8 text-xs gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Workflow</span>
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
