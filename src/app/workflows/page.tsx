"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatDateTime } from "@/lib/utils";
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
  ChevronDown,
  Sparkles,
  Bot,
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
          conditions: [{ field: "customer.totalSpend", operator: "gte", value: 100 }],
          actionSteps: [
            { type: "delay", days: 2 },
            { type: "ai_action", action: "generate_followup_message" },
            { type: "human_approval" },
            { type: "send_communication", channel: "email" },
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
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Workflow Automation Engine
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Event-driven CRM pipelines with condition rules, delays, AI generation, and human approval gates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Workflow
            </button>
            <button
              onClick={fetchWorkflows}
              className="p-2 text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {triggerSuccessMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{triggerSuccessMsg}</span>
          </div>
        )}

        {/* Workflows Cards */}
        <div className="space-y-6 mb-12">
          {workflows.map((wf) => {
            let steps: any[] = [];
            try {
              steps = JSON.parse(wf.actionSteps);
            } catch {}

            return (
              <div
                key={wf.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Workflow className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{wf.name}</h2>
                        <span className="text-xs text-slate-500">{wf.description}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-400 uppercase">Trigger:</span>
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono font-medium">
                        {wf.triggerEvent}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-400 uppercase">Executions:</span>
                      <span className="font-bold text-slate-700">{wf.executionCount} completed</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={triggeringId === wf.id}
                      onClick={() => handleTriggerTest(wf)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {triggeringId === wf.id ? "Triggering..." : "Test Trigger"}
                    </button>
                  </div>
                </div>

                {/* Pipeline Steps Flow */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Execution Pipeline
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-medium text-slate-800 border border-slate-200">
                      ⚡ Event Trigger: <span className="font-mono font-bold">{wf.triggerEvent}</span>
                    </div>

                    {steps.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                        <div
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                            step.type === "delay"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : step.type === "ai_action"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : step.type === "human_approval"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {step.type === "delay" && `⏳ Wait ${step.days || 3} days`}
                          {step.type === "ai_action" && `✨ AI: ${step.action || "Generate draft"}`}
                          {step.type === "human_approval" && "🛡️ Human Approval Gate"}
                          {step.type === "send_communication" && `📤 Dispatch (${step.channel || "email"})`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Execution History */}
                {wf.executions?.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Recent Execution History
                    </h3>
                    <div className="space-y-1.5">
                      {wf.executions.map((exec: any) => (
                        <div
                          key={exec.id}
                          className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                exec.status === "completed"
                                  ? "bg-emerald-500"
                                  : exec.status === "waiting_approval"
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                              }`}
                            />
                            <span className="font-semibold text-slate-800">
                              {exec.customer?.firstName} {exec.customer?.lastName || "Customer"}
                            </span>
                            <span className="text-slate-400">({exec.customer?.email})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="capitalize font-medium text-slate-600">
                              {exec.status.replace("_", " ")}
                            </span>
                            <span className="text-slate-400">{formatDateTime(exec.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal: Create Workflow */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Create Event-Driven Workflow</h3>
              <p className="text-xs text-slate-500 mb-4">
                Configure a responsive automation rule for customer and order events.
              </p>

              <form onSubmit={handleCreateWorkflow} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP High Spender Thank You"
                    value={wfName}
                    onChange={(e) => setWfName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Trigger Event
                  </label>
                  <select
                    value={wfTrigger}
                    onChange={(e) => setWfTrigger(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="order.completed">order.completed (Delivered / Fulfilled)</option>
                    <option value="customer.churn_risk_high">customer.churn_risk_high (Inactivity alert)</option>
                    <option value="customer.created">customer.created (New signup/first purchase)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Optional workflow description..."
                    value={wfDesc}
                    onChange={(e) => setWfDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold block mb-1 text-slate-800">Standard Guardrail Pipeline:</span>
                  Condition Check → 2-Day Delay → AI Personalized Draft → Mandatory Human Approval → Dispatch.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Save Workflow
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
