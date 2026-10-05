"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

function AssistantChat() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; toolUsed?: string }>>([
    {
      role: "assistant",
      content:
        "👋 Hello! I am your **Kilowatt AI CRM Copilot** powered by Google Gemini. I have real-time read-only access to your customer database, orders, and RFM intelligence.\n\nAsk me anything or click a quick suggestion below!",
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
    <div className="min-h-screen bg-slate-50/60 flex flex-col pb-12">
      <Navigation />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-4">
        {/* Header Card */}
        <Card className="p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm shadow-amber-200 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-slate-900">AI CRM Copilot</h1>
                  <Badge variant="success" className="gap-1 text-[10px] h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Grounding
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Natural-language conversational intelligence over verified store transactions and customers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs py-1 px-2.5 gap-1.5 text-slate-600 bg-slate-50">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Read-Only Guardrails Enforced</span>
              </Badge>
            </div>
          </div>
        </Card>

        {/* Chat History Box */}
        <Card className="flex-1 p-6 shadow-sm overflow-y-auto min-h-[440px] max-h-[580px] flex flex-col gap-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}
              >
                {m.role === "user" ? "You" : <Bot className="w-4 h-4 text-amber-700" />}
              </div>

              <div
                className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-none shadow-sm"
                    : "bg-slate-50/80 border border-slate-200/70 text-slate-800 rounded-tl-none"
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
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-amber-700" />
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                Querying CRM database & reasoning with Gemini...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </Card>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5">
          {promptSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(suggestion)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-colors shadow-2xs font-medium disabled:opacity-50 inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{suggestion}</span>
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
          <Input
            type="text"
            placeholder="Ask Copilot about any customer, order status, or revenue metrics..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="h-12 pl-4 pr-12 bg-white text-xs sm:text-sm shadow-sm"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            size="icon"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-900 text-amber-400 hover:bg-slate-800 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </Button>
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
