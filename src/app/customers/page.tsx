"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Users,
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedChurn, setSelectedChurn] = useState("all");
  const [sortBy, setSortBy] = useState("totalSpend");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedSegment !== "all") params.append("segment", selectedSegment);
      if (selectedChurn !== "all") params.append("churnRisk", selectedChurn);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      params.append("limit", "50");

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [selectedSegment, selectedChurn, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

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

  const renderChurnBadge = (churn: string) => {
    switch (churn?.toLowerCase()) {
      case "high":
        return (
          <Badge variant="destructive" className="gap-1 font-semibold text-[11px]">
            <Flame className="w-3 h-3" /> High Risk
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="warning" className="gap-1 font-medium text-[11px]">
            <AlertTriangle className="w-3 h-3" /> Medium Risk
          </Badge>
        );
      default:
        return (
          <Badge variant="success" className="gap-1 font-medium text-[11px]">
            <ShieldCheck className="w-3 h-3" /> Low Risk
          </Badge>
        );
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
              Customer 360 Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Centralized customer database, deterministic RFM segmentation, and lifetime value tracking.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => fetchCustomers()}
              variant="outline"
              size="sm"
              className="bg-white gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <Card className="p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50/60"
              />
            </form>

            {/* Segment Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-950"
              >
                <option value="all">All RFM Segments</option>
                <option value="VIP">VIP Segment</option>
                <option value="Loyal">Loyal Segment</option>
                <option value="Promising">Promising Segment</option>
                <option value="At-Risk">At-Risk Segment</option>
                <option value="Dormant">Dormant Segment</option>
                <option value="New">New Segment</option>
              </select>
            </div>

            {/* Churn Risk Selector */}
            <div className="md:col-span-2">
              <select
                value={selectedChurn}
                onChange={(e) => setSelectedChurn(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-950"
              >
                <option value="all">All Churn Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-2">
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split(":");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="w-full h-9 px-3 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-950"
              >
                <option value="totalSpend:desc">Spend: High to Low</option>
                <option value="totalSpend:asc">Spend: Low to High</option>
                <option value="ordersCount:desc">Orders: Most First</option>
                <option value="lastOrderDate:desc">Recent Activity</option>
                <option value="createdAt:desc">Newly Added</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Customer Table Card */}
        <Card className="overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Churn Risk</TableHead>
                <TableHead>RFM Quintile</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading customers...</span>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-slate-400">
                    No customers match the active filters.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/customers/${c.id}`}
                          className="font-semibold text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {c.firstName} {c.lastName}
                        </Link>
                        <span className="text-xs text-slate-500">{c.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSegmentVariant(c.segment)}>
                        {c.segment || "Unassigned"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {renderChurnBadge(c.churnRisk)}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {c.rfmScore || "N/A"}
                      </code>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {formatCurrency(c.totalSpend)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600 font-medium">
                      {c.ordersCount || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                        <Link href={`/customers/${c.id}`} title="View Customer 360">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Table Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {customers.length} of {total} customer profiles</span>
            <span className="text-[11px] text-slate-400">All metrics calculated from verified store transactions</span>
          </div>
        </Card>
      </main>
    </div>
  );
}
