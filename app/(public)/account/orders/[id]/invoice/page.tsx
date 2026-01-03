
import { auth } from '@/auth';
import { getOrderById } from '@/actions/order-actions';
import { redirect, notFound } from 'next/navigation';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Printer } from 'lucide-react';
import Image from 'next/image';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

export const metadata = {
    title: 'Invoice | Aaavrti',
    description: 'Order Invoice'
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect('/auth/login');

    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) notFound();

    // Verify ownership
    if (order.userId !== session.user.id) {
        redirect('/account/orders');
    }

    return (
        <div className="min-h-screen bg-white text-black p-8 md:p-12 print:p-0">
            {/* Print Button (Hidden in Print) */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-end print:hidden">
                <button
                    id="print-btn"
                    className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded hover:bg-black/90 transition-all"
                >
                    <Printer className="w-4 h-4" />
                    Print Invoice
                </button>
            </div>

            {/* Invoice Container (A4 Proportions) */}
            <div className="max-w-4xl mx-auto bg-white print:w-[210mm] print:h-auto print:mx-0">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
                    <div>
                        <h1 className={cn("text-4xl font-bold uppercase tracking-wider mb-2", cormorant.className)}>Aaavrti</h1>
                        <p className="text-sm text-gray-600">
                            123, Fashion Street, Sector 21<br />
                            Gurugram, Haryana, 122001<br />
                            GSTIN: 06ABCDE1234F1Z5<br />
                            support@aaavrti.com
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-light uppercase text-gray-400 mb-4">Invoice</h2>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-semibold">Invoice No:</span> INV-{order.orderNumber.replace('#', '')}</p>
                            <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                            <p><span className="font-semibold">Order ID:</span> {order.orderNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Billing Details */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="font-bold uppercase text-xs tracking-widest text-gray-500 mb-4">Billed To</h3>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold text-lg">{order.shippingAddress?.name}</p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                            <p>{order.shippingAddress?.postalCode}</p>
                            <p>Phone: {order.shippingAddress?.phone}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold uppercase text-xs tracking-widest text-gray-500 mb-4">Shipped To</h3>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold text-lg">{order.shippingAddress?.name}</p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                            <p>{order.shippingAddress?.postalCode}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b border-black text-left">
                            <th className="py-3 font-bold uppercase text-xs tracking-widest">Item</th>
                            <th className="py-3 font-bold uppercase text-xs tracking-widest text-center">Qty</th>
                            <th className="py-3 font-bold uppercase text-xs tracking-widest text-right">Price</th>
                            <th className="py-3 font-bold uppercase text-xs tracking-widest text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {order.items.map((item: any, index: number) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="py-4">
                                    <p className="font-medium">{item.product?.name_en || item.name}</p>
                                    <p className="text-xs text-gray-500">SKU: {item.product?.sku || 'N/A'}</p>
                                </td>
                                <td className="py-4 text-center">{item.quantity}</td>
                                <td className="py-4 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                                <td className="py-4 text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax</span>
                            <span>₹{order.tax.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span>{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}</span>
                        </div>
                        {order.discountTotal > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span>-₹{order.discountTotal.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-black pt-3 mt-3">
                            <span>Total</span>
                            <span>₹{order.total.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-xs text-right text-gray-500 mt-1">
                            Paid via {order.paymentProtocol === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 mt-20 pt-8 border-t border-gray-100">
                    <p>Thank you for shopping with Aaavrti.</p>
                    <p>This is a computer generated invoice and does not require signature.</p>
                </div>
            </div>

            <Script />
        </div>
    );
}

function Script() {
    return (
        <script dangerouslySetInnerHTML={{
            __html: `
            document.getElementById('print-btn').addEventListener('click', () => window.print());
        `}} />
    )
}
