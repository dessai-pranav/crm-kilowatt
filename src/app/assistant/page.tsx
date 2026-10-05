"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  User,
  ShoppingBag,
  Flame,
  ArrowRight,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

function AssistantChat() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; toolUsed?: string }>>([
    {
      role: "assistant",
      content:
        "👋 Hello! I am your **Kilowatt AI CRM Copilot**. I have real-time read-only access to your synchronized WooCommerce store records, RFM segments, and order data.\n\nAsk me anything or pick a quick suggestion below!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            toolUsed: data.toolUsed,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an issue querying your CRM database. Please try again.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error communicating with the CRM Copilot API.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const promptSuggestions = [
    "Who are our top customers by total spend?",
    "Which customers have high churn risk?",
    "Show store overview and revenue metrics",
    "List recent orders and fulfillment statuses",
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm shadow-amber-200">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">AI CRM Copilot</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Grounding
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Natural-language querying for WooCommerce store, customers, and order history.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Read-Only Guardrails Enforced</span>
            </div>
          </div>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-y-auto mb-4 min-h-[420px] max-h-[560px] flex flex-col gap-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}
              >
                {m.role === "user" ? "You" : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none"
                }`}
              >
                <div
                  className="prose prose-sm max-w-none text-inherit prose-headings:text-inherit prose-strong:text-inherit prose-a:text-amber-600 prose-a:font-semibold"
                  dangerouslySetInnerHTML={{
                    __html: m.content
                      .replace(/\n/g, "<br/>")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/`([^`]+)`/g, "<code class='bg-slate-200 text-slate-900 px-1 py-0.5 rounded text-xs'>$1</code>")
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' class='underline hover:text-amber-700'>$1</a>"),
                  }}
                />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                Querying CRM database & reasoning...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="mb-3 flex flex-wrap gap-2">
          {promptSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(suggestion)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs font-medium disabled:opacity-50"
            >
              ✨ {suggestion}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="relative"
        >
          <input
            type="text"
            placeholder="Ask Copilot about any customer, order status, or revenue metrics..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-slate-900 text-amber-400 hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Assistant...</div>}>
      <AssistantChat />
    </Suspense>
  );
}
