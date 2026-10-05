"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ShoppingBag,
  User,
  CreditCard,
  MapPin,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Package,
  RefreshCw,
} from "lucide-react";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 pb-16">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
          <p className="text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50/60 pb-16">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/orders">Return to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  let billingObj: any = null;
  let shippingObj: any = null;
  try {
    if (order.billing) billingObj = JSON.parse(order.billing);
    if (order.shipping) shippingObj = JSON.parse(order.shipping);
  } catch {}

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
        {/* Back Link */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </Link>
        </div>

        {/* Order Header Card */}
        <Card className="p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <ShoppingBag className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    Order {order.orderNumber}
                  </h1>
                  <Badge variant={getStatusVariant(order.status)} className="capitalize text-xs font-semibold">
                    {order.status}
                  </Badge>
                  {order.wooOrderId && (
                    <span className="text-xs text-slate-400">WooID: #{order.wooOrderId}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on {formatDateTime(order.dateCreated)}
                  {order.dateCompleted && ` • Completed ${formatDateTime(order.dateCompleted)}`}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Total Amount</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-0.5">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </Card>

        {/* Order Details & Customer Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer & Address Details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {order.customer ? (
                <div>
                  <Link
                    href={`/customers/${order.customer.id}`}
                    className="font-bold text-sm text-slate-900 hover:text-amber-600 transition-colors block"
                  >
                    {order.customer.firstName} {order.customer.lastName}
                  </Link>
                  <span className="text-slate-500 block">{order.customer.email}</span>
                  {order.customer.phone && (
                    <span className="text-slate-500 block mt-0.5">{order.customer.phone}</span>
                  )}
                  <div className="mt-2">
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs px-2.5">
                      <Link href={`/customers/${order.customer.id}`}>
                        <span>View Customer 360</span>
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">Guest Checkout</p>
              )}

              {/* Shipping Address */}
              <div className="pt-3 border-t border-slate-100">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Shipping Destination
                </span>
                {shippingObj ? (
                  <p className="text-slate-600 leading-relaxed">
                    {shippingObj.address_1}
                    {shippingObj.address_2 && `, ${shippingObj.address_2}`}
                    <br />
                    {shippingObj.city}, {shippingObj.state} {shippingObj.postcode}
                    <br />
                    {shippingObj.country}
                  </p>
                ) : (
                  <p className="text-slate-400">No separate shipping address recorded.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment & Financial Breakdown */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-500" /> Payment & Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Gateway</span>
                <span className="font-medium text-slate-900">
                  {order.paymentMethodTitle || order.paymentMethod || "Credit Card"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Items Subtotal</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(order.subtotal || order.total)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Shipping Total</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(order.shippingTotal || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tax</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(order.totalTax || 0)}
                </span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                  <span>Discounts Applied</span>
                  <span className="font-medium">-{formatCurrency(order.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-sm font-bold text-slate-900">
                <span>Net Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment Status & Tracking */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-500" /> Fulfillment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Order Placed</span>
                    <span className="text-slate-400 text-[11px]">{formatDateTime(order.dateCreated)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    order.status === "completed"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    {order.status === "completed" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block capitalize">{order.status}</span>
                    <span className="text-slate-400 text-[11px]">
                      {order.dateCompleted ? formatDateTime(order.dateCompleted) : "Fulfillment in progress"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Line Items Table */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">
              Purchased Line Items
            </CardTitle>
            <CardDescription className="text-xs">
              Itemized products, quantities, and line totals
            </CardDescription>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.lineItems?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-900">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {item.sku || "N/A"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-600">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-slate-800">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
}
