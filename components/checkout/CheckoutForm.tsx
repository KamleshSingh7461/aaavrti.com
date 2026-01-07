'use client';

import { useState } from 'react';
import { useCart } from '@/lib/store';
import { saveAddress, createOrder, verifyPincode } from '@/actions/checkout-actions';
import { createRazorpayOrder, verifyPayment } from '@/actions/payment-actions';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, MapPin, Truck, ShieldCheck, CreditCard, Banknote, Package, Check } from 'lucide-react';
import Script from 'next/script';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { CartOffers } from '@/components/cart/CartOffers';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface Address {
    id: string;
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
}

interface CheckoutFormProps {
    initialAddresses: Address[];
    user: any;
}

export function CheckoutForm({ initialAddresses, user }: CheckoutFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { items, getFinalTotal, clearCart, couponCode, discountAmount, getTotal } = useCart();
    const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
    const [selectedAddressId, setSelectedAddressId] = useState<string>(initialAddresses[0]?.id || '');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('ONLINE');
    const [orderNotes, setOrderNotes] = useState('');

    const total = getFinalTotal();

    const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const res = await saveAddress(formData);

        if (res.error) {
            setError(res.error);
        } else if (res.address) {
            const newAddr = res.address as Address;
            setAddresses([newAddr, ...addresses]);
            setSelectedAddressId(newAddr.id);
            setIsAddingNew(false);
        }
        setLoading(false);
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            setError('Please select a shipping address');
            return;
        }
        setLoading(true);
        setError('');

        const cartItems = items.map(item => ({
            id: item.id,
            productId: item.productId || item.id,
            quantity: item.quantity,
            price: item.price,
            attributes: item.attributes || {},
        }));

        try {
            const res = await createOrder(cartItems, selectedAddressId, paymentMethod, couponCode || undefined);

            if ('error' in res) {
                setError(res.error);
                setLoading(false);
                return;
            }

            if (paymentMethod === 'COD') {
                clearCart();
                router.push(`/checkout/success/${res.orderId}`);
            } else {
                const rzpRes = await createRazorpayOrder(res.orderId);

                if ('error' in rzpRes) {
                    setError(rzpRes.error || 'Failed to initiate payment');
                    setLoading(false);
                    return;
                }

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: rzpRes.amount,
                    currency: rzpRes.currency,
                    name: 'Ournika',
                    description: 'Order Payment',
                    order_id: rzpRes.orderId,
                    handler: async function (response: any) {
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            internalOrderId: res.orderId,
                        });

                        if (verifyRes.success) {
                            clearCart();
                            router.push(`/checkout/success/${res.orderId}`);
                        } else {
                            setError('Payment verification failed');
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                    },
                    theme: {
                        color: '#D4AF37',
                    },
                    modal: {
                        ondismiss: function () {
                            setLoading(false);
                        },
                    },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
        } catch (err) {
            setError('Something went wrong');
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h2 className={cn("text-2xl font-light mb-2", cormorant.className)}>Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">Add items to your cart to proceed with checkout</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-primary text-primary-foreground px-8 py-3 hover:bg-accent hover:text-accent-foreground transition-all uppercase tracking-wider text-sm"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Left Column - Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8">
                        {['Cart', 'Information', 'Payment', 'Complete'].map((step, index) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={cn(
                                        "w-10 h-10 flex items-center justify-center border-2 transition-all",
                                        index < 2 ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"
                                    )}>
                                        {index < 2 ? <Check className="w-5 h-5" /> : index + 1}
                                    </div>
                                    <span className={cn(
                                        "text-xs mt-2 uppercase tracking-wider",
                                        index < 2 ? "text-primary font-medium" : "text-muted-foreground"
                                    )}>{step}</span>
                                </div>
                                {index < 3 && (
                                    <div className={cn(
                                        "h-0.5 flex-1 mx-2",
                                        index < 1 ? "bg-primary" : "bg-border"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-secondary/20 border border-border p-6">
                        <h2 className={cn("text-2xl font-light mb-6 flex items-center gap-3", cormorant.className)}>
                            <MapPin className="w-6 h-6 text-primary" />
                            Shipping Address
                        </h2>

                        {!isAddingNew && addresses.length > 0 && (
                            <div className="space-y-3 mb-6">
                                {addresses.map((addr) => (
                                    <label
                                        key={addr.id}
                                        className={cn(
                                            "block border-2 p-4 cursor-pointer transition-all hover:border-primary/40",
                                            selectedAddressId === addr.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border bg-background"
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="address"
                                            value={addr.id}
                                            checked={selectedAddressId === addr.id}
                                            onChange={() => setSelectedAddressId(addr.id)}
                                            className="sr-only"
                                        />
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "w-5 h-5 border-2 flex items-center justify-center mt-0.5 flex-shrink-0",
                                                selectedAddressId === addr.id ? "border-primary bg-primary" : "border-border"
                                            )}>
                                                {selectedAddressId === addr.id && <Check className="w-3 h-3 text-primary-foreground" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{addr.name}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Phone: {addr.phone}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        {isAddingNew ? (
                            <AddressForm
                                onSave={handleAddAddress}
                                onCancel={() => setIsAddingNew(false)}
                                loading={loading}
                            />
                        ) : (
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="w-full border-2 border-dashed border-primary/40 text-primary py-3 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Address
                            </button>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="bg-secondary/20 border border-border p-6">
                        <h2 className={cn("text-2xl font-light mb-6 flex items-center gap-3", cormorant.className)}>
                            <CreditCard className="w-6 h-6 text-primary" />
                            Payment Method
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <label
                                className={cn(
                                    "border-2 p-6 cursor-pointer transition-all hover:border-primary/40 flex flex-col items-center gap-3",
                                    paymentMethod === 'ONLINE'
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-background"
                                )}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value="ONLINE"
                                    checked={paymentMethod === 'ONLINE'}
                                    onChange={() => setPaymentMethod('ONLINE')}
                                    className="sr-only"
                                />
                                <CreditCard className={cn(
                                    "w-8 h-8",
                                    paymentMethod === 'ONLINE' ? "text-primary" : "text-muted-foreground"
                                )} />
                                <span className="font-medium text-sm uppercase tracking-wider">Online Payment</span>
                                <span className="text-xs text-muted-foreground text-center">Card, UPI, Wallet</span>
                            </label>

                            <label
                                className={cn(
                                    "border-2 p-6 cursor-pointer transition-all hover:border-primary/40 flex flex-col items-center gap-3",
                                    paymentMethod === 'COD'
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-background"
                                )}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                    className="sr-only"
                                />
                                <Banknote className={cn(
                                    "w-8 h-8",
                                    paymentMethod === 'COD' ? "text-primary" : "text-muted-foreground"
                                )} />
                                <span className="font-medium text-sm uppercase tracking-wider">Cash on Delivery</span>
                                <span className="text-xs text-muted-foreground text-center">Pay when you receive</span>
                            </label>
                        </div>
                    </div>

                    {/* Order Notes */}
                    <div className="bg-secondary/20 border border-border p-6">
                        <h3 className="font-medium mb-3 text-sm uppercase tracking-wider">Order Notes (Optional)</h3>
                        <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="Special instructions for delivery..."
                            className="w-full bg-background border border-border p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
                        />
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive p-4 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-secondary/20 border border-border p-6 sticky top-24 space-y-6">
                        <h2 className={cn("text-2xl font-light border-b border-border pb-4", cormorant.className)}>
                            Order Summary
                        </h2>

                        {/* Cart Items */}
                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="relative w-16 h-20 bg-secondary/30 flex-shrink-0">
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name_en}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                                            {item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium line-clamp-2">{item.name_en}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            ₹{item.price.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium">
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Offers */}
                        <div className="border-t border-border pt-4">
                            <CartOffers compact />
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-3 border-t border-border pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">₹{getTotal().toLocaleString('en-IN')}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-primary">
                                    <span>Discount</span>
                                    <span className="font-medium">-₹{discountAmount.toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-primary font-medium">FREE</span>
                            </div>

                            <div className={cn("flex justify-between text-xl font-light border-t border-border pt-3", cormorant.className)}>
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                            <div className="text-center">
                                <ShieldCheck className="w-6 h-6 mx-auto text-primary mb-1" />
                                <p className="text-xs text-muted-foreground">Secure Payment</p>
                            </div>
                            <div className="text-center">
                                <Truck className="w-6 h-6 mx-auto text-primary mb-1" />
                                <p className="text-xs text-muted-foreground">Free Shipping</p>
                            </div>
                            <div className="text-center">
                                <Package className="w-6 h-6 mx-auto text-primary mb-1" />
                                <p className="text-xs text-muted-foreground">7-10 Days</p>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || !selectedAddressId}
                            className="w-full bg-primary text-primary-foreground py-4 font-medium hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Place Order • ₹${total.toLocaleString('en-IN')}`
                            )}
                        </button>

                        <p className="text-xs text-center text-muted-foreground">
                            By placing your order, you agree to our terms and conditions
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

// Address Form Component
function AddressForm({ onSave, onCancel, loading }: any) {
    const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
    const [pincodeMsg, setPincodeMsg] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');

    const handlePincodeBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const pincode = e.target.value;
        if (pincode.length !== 6) return;

        // Reset previous state
        setCity('');
        setState('');

        setPincodeStatus('checking');
        const res = await verifyPincode(pincode);

        if (res.success) {
            setPincodeStatus('valid');
            const etdDate = res.etd ? new Date(res.etd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '5-7 days';
            setPincodeMsg(`Delivery available by ${etdDate}`);
            if (res.city) setCity(res.city);
            if (res.state) setState(res.state);
        } else {
            setPincodeStatus('invalid');
            setPincodeMsg('Delivery not available for this pincode');
        }
    };

    return (
        <form onSubmit={onSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    className="col-span-2 bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    className="col-span-2 bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                    type="text"
                    name="houseNo"
                    placeholder="House No / Building Name"
                    required
                    className="col-span-2 bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                    type="text"
                    name="street"
                    placeholder="Street / Area / Colony"
                    required
                    className="col-span-2 bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                    type="text"
                    name="landmark"
                    placeholder="Landmark (Optional)"
                    className="col-span-2 bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                    type="text"
                    name="city"
                    placeholder="City"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                    type="text"
                    name="state"
                    placeholder="State"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="col-span-2 space-y-1">
                    <input
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code"
                        required
                        maxLength={6}
                        onBlur={handlePincodeBlur}
                        onChange={(e) => {
                            if (pincodeStatus !== 'idle') setPincodeStatus('idle');
                            e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        }}
                        className={cn(
                            "w-full bg-background border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary",
                            pincodeStatus === 'invalid' ? "border-red-500 focus:ring-red-500" :
                                pincodeStatus === 'valid' ? "border-green-500 focus:ring-green-500" : "border-border"
                        )}
                    />
                    {pincodeStatus === 'checking' && <p className="text-xs text-muted-foreground">Checking availability...</p>}
                    {pincodeStatus === 'valid' && (
                        <div className="text-xs text-green-600 space-y-0.5">
                            <p className="font-medium">{pincodeMsg}</p>
                            <p className="text-muted-foreground">Dispatches in 24-48 hours</p>
                        </div>
                    )}
                    {pincodeStatus === 'invalid' && <p className="text-xs text-red-600">{pincodeMsg}</p>}
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 border-2 border-border text-foreground py-3 hover:bg-secondary transition-all uppercase tracking-wider text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-primary-foreground py-3 hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50 uppercase tracking-wider text-sm"
                >
                    {loading ? 'Saving...' : 'Save Address'}
                </button>
            </div>
        </form>
    );
}
