"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
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
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (status !== "all") params.append("status", status);
      params.append("limit", "50");

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "processing":
        return "loyal";
      case "on-hold":
        return "warning";
      case "cancelled":
      case "failed":
        return "destructive";
      default:
        return "secondary";
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
              WooCommerce Order Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Synchronized store orders, lifecycle fulfillment tracking, itemization, and customer links.
            </p>
          </div>
          <div>
            <Button
              onClick={() => fetchOrders()}
              variant="outline"
              size="sm"
              className="bg-white gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <Card className="p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search by order number or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50/60"
              />
            </form>

            {/* Status */}
            <div className="sm:col-span-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-950"
              >
                <option value="all">All Order Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="on-hold">On Hold</option>
                <option value="pending">Pending Payment</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Orders Table Card */}
        <Card className="overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date Placed</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading store orders...</span>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-slate-400">
                    No orders match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link
                        href={`/orders/${o.id}`}
                        className="font-bold text-slate-900 hover:text-amber-600 transition-colors"
                      >
                        {o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(o.dateCreated)}
                    </TableCell>
                    <TableCell>
                      {o.customer ? (
                        <Link
                          href={`/customers/${o.customer.id}`}
                          className="font-medium text-xs text-slate-800 hover:text-amber-600 transition-colors block"
                        >
                          {o.customer.firstName} {o.customer.lastName}
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Guest Checkout</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {o.paymentMethodTitle || o.paymentMethod || "Credit Card"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(o.status)} className="capitalize text-[10px]">
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {formatCurrency(o.total)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500">
                      {o.lineItems?.length || 0} line(s)
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                        <Link href={`/orders/${o.id}`} title="View Order Breakdown">
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
            <span>Showing {orders.length} of {total} orders</span>
            <span className="text-[11px] text-slate-400">Idempotently synchronized from WooCommerce</span>
          </div>
        </Card>
      </main>
    </div>
  );
}
