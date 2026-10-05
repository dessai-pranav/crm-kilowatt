"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { formatDateTime } from "@/lib/utils";
import {
  Settings,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Globe,
  Key,
  Database,
  Radio,
} from "lucide-react";

export default function SettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [storeUrl, setStoreUrl] = useState("");
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isMockMode, setIsMockMode] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/store/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setStoreUrl(data.storeUrl || "");
        setConsumerKey(data.consumerKey || "");
        setConsumerSecret(data.consumerSecret || "");
        setWebhookSecret(data.webhookSecret || "");
        setIsMockMode(Boolean(data.isMockMode));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/store/config", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storeUrl,
          consumerKey,
          consumerSecret,
          webhookSecret,
          isMockMode,
        }),
      });
      if (res.ok) {
        setMessage({ text: "Store settings saved successfully!", type: "success" });
        loadConfig();
      } else {
        setMessage({ text: "Failed to update configuration", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Error saving configuration", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/store/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storeUrl,
          consumerKey,
          consumerSecret,
          isMockMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `✓ ${data.message}`, type: "success" });
      } else {
        setMessage({ text: `✗ ${data.message}`, type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Connection test failed", type: "error" });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/store/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "manual_settings_sync" }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          text: `✓ Full Synchronization Complete! Synced ${data.customersSynced} customers & ${data.ordersSynced} orders in ${data.durationMs}ms.`,
          type: "success",
        });
        loadConfig();
      } else {
        setMessage({ text: `Sync failed: ${data.error}`, type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Sync execution error", type: "error" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">WooCommerce Integration & Sync</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure WooCommerce REST API credentials, webhook endpoints, and sync mode.
            </p>
          </div>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing Store..." : "Sync Store Now"}
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm border flex items-center gap-2.5 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Mode Switcher */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-sm text-slate-900 block">
                Integration Operating Mode
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                {isMockMode
                  ? "Currently using Mock / Demo Store mode (instant evaluation without live WooCommerce server)."
                  : "Live WooCommerce REST API & Webhooks enabled."}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsMockMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isMockMode ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mock Demo Mode
              </button>
              <button
                type="button"
                onClick={() => setIsMockMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !isMockMode ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Live API Mode
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Store URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://your-store.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Consumer Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={consumerKey}
                    onChange={(e) => setConsumerKey(e.target.value)}
                    placeholder="ck_..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Consumer Secret
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={consumerSecret}
                    onChange={(e) => setConsumerSecret(e.target.value)}
                    placeholder="cs_..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Webhook Secret (For HMAC-SHA256 Verification)
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Endpoint URL for WooCommerce Webhooks: <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">/api/webhooks/woocommerce</code>
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <Radio className="w-3.5 h-3.5" />
              {testing ? "Testing..." : "Test Connection"}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
