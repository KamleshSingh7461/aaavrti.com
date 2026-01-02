import { getCouponById } from "@/actions/coupon-actions";
import { notFound } from "next/navigation";
import EditCouponForm from "./EditCouponForm";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditCouponPage({ params }: PageProps) {
    const { id } = await params;
    const coupon = await getCouponById(id);

    if (!coupon) {
        notFound();
    }

    return <EditCouponForm coupon={coupon} />;
}
