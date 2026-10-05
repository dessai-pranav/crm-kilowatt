"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
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
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-600">Order not found.</p>
          <Link href="/orders" className="mt-4 inline-block text-amber-600 font-semibold hover:underline">
            ← Back to Orders
          </Link>
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

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold capitalize bg-slate-100 text-slate-800 border border-slate-200">
                  {order.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span>Created {formatDateTime(order.dateCreated)}</span>
                {order.dateCompleted && <span>• Completed {formatDateTime(order.dateCompleted)}</span>}
                <span>• WooCommerce ID: #{order.wooOrderId}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Order Total</span>
            <span className="text-3xl font-extrabold text-slate-900 block">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Line Items & Totals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Line items table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Itemized Products</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {order.lineItems?.map((item: any) => (
                  <div key={item.id} className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{item.name}</h4>
                      {item.sku && (
                        <span className="text-xs font-mono text-slate-400 mt-0.5 block">
                          SKU: {item.sku}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 mt-1 block">
                        {item.quantity} × {formatCurrency(item.price)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-slate-900">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Calculations Breakdown */}
              <div className="p-6 bg-slate-50/60 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shippingTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>{formatCurrency(order.totalTax)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Lifecycle Status Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Order Lifecycle Timeline</h3>
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                  <span className="text-xs font-semibold text-slate-900 block">Order Placed</span>
                  <span className="text-xs text-slate-400">{formatDateTime(order.dateCreated)}</span>
                </div>
                {order.dateCompleted ? (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                    <span className="text-xs font-semibold text-slate-900 block">Order Fulfilled & Completed</span>
                    <span className="text-xs text-slate-400">{formatDateTime(order.dateCompleted)}</span>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                    <span className="text-xs font-semibold text-slate-900 block">Currently {order.status}</span>
                    <span className="text-xs text-slate-400">Processing in WooCommerce</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Customer & Addresses */}
          <div className="space-y-6">
            {/* Customer 360 Link Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
                <User className="w-4 h-4 text-amber-500" />
                <h3>Customer 360 Account</h3>
              </div>
              {order.customer ? (
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {order.customer.firstName} {order.customer.lastName}
                  </h4>
                  <span className="text-xs text-slate-500 block mt-0.5">{order.customer.email}</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                      {order.customer.segment} Segment
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {formatCurrency(order.customer.totalSpend)} LTV
                    </span>
                  </div>

                  <Link
                    href={`/customers/${order.customer.id}`}
                    className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                  >
                    View Customer 360 Profile <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Guest order</p>
              )}
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-3">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <h3>Payment Method</h3>
              </div>
              <p className="text-sm text-slate-800 font-medium">
                {order.paymentMethodTitle || order.paymentMethod || "Credit Card / Direct Gateway"}
              </p>
            </div>

            {/* Billing Address */}
            {billingObj && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-3">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <h3>Billing Details</h3>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">
                    {billingObj.first_name} {billingObj.last_name}
                  </p>
                  {billingObj.address_1 && <p>{billingObj.address_1}</p>}
                  {billingObj.city && (
                    <p>
                      {billingObj.city}, {billingObj.state} {billingObj.postcode}
                    </p>
                  )}
                  {billingObj.phone && <p>Phone: {billingObj.phone}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
