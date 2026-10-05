"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Globe,
  Key,
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
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              WooCommerce Integration & Sync
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure WooCommerce REST API credentials, webhook endpoints, and data ingestion mode.
            </p>
          </div>

          <Button
            onClick={handleSyncNow}
            disabled={syncing}
            variant="default"
            size="sm"
            className="gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Store Now"}</span>
          </Button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm border flex items-center gap-2.5 animate-in fade-in ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 shadow-sm space-y-6">
            {/* Mode Switcher */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-sm text-slate-900 block">
                  Integration Operating Mode
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {isMockMode
                    ? "Currently running in Sandbox Demo mode (safe evaluation without live WooCommerce store)."
                    : "Live WooCommerce REST API & Webhooks enabled."}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                <Button
                  type="button"
                  onClick={() => setIsMockMode(true)}
                  variant={isMockMode ? "accent" : "ghost"}
                  size="sm"
                  className="h-8 text-xs font-semibold"
                >
                  Mock Demo Sandbox
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsMockMode(false)}
                  variant={!isMockMode ? "default" : "ghost"}
                  size="sm"
                  className="h-8 text-xs font-semibold"
                >
                  Live Store API
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  WooCommerce Store URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="url"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    placeholder="https://your-store.com"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Consumer Key (CK)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      value={consumerKey}
                      onChange={(e) => setConsumerKey(e.target.value)}
                      placeholder="ck_..."
                      className="pl-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Consumer Secret (CS)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      value={consumerSecret}
                      onChange={(e) => setConsumerSecret(e.target.value)}
                      placeholder="cs_..."
                      className="pl-9 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Webhook Secret (HMAC-SHA256 Signature)
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    placeholder="whsec_..."
                    className="pl-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                variant="outline"
                size="sm"
                className="gap-2 bg-white text-xs h-9"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{testing ? "Testing..." : "Test Store Connection"}</span>
              </Button>

              <Button
                type="submit"
                disabled={saving}
                size="sm"
                className="gap-2 text-xs h-9"
              >
                <span>{saving ? "Saving..." : "Save Configuration"}</span>
              </Button>
            </div>
          </Card>
        </form>

        {/* Webhook Endpoint Instructions Card */}
        <Card className="p-6 shadow-sm">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-500" /> Real-Time Webhook Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              Configure in WooCommerce &gt; Settings &gt; Advanced &gt; Webhooks for instant sync
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-2 text-xs text-slate-600">
            <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
              http://localhost:3000/api/webhooks/woocommerce
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Supported events: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">order.created</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">order.updated</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">customer.created</code>. All payloads are idempotently verified against HMAC-SHA256 signatures to prevent duplicate or unauthorized records.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
