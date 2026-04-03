import { useState, useEffect, useCallback } from "react";
import { billingApi, type TenantSubscription, type PaymentMethod, type Invoice, type SubscriptionPlan } from "@Tenant/lib/billingApi";
import { toast } from "sonner";

export function useBilling() {
    const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statusRes, plansRes, pmRes, invoicesRes, timelineRes] = await Promise.all([
                billingApi.getStatus(),
                billingApi.getPlans(),
                billingApi.getPaymentMethods(),
                billingApi.getInvoices(),
                billingApi.getTimeline()
            ]);

            if (statusRes.success) setSubscription(statusRes.data);
            if (plansRes.success) setPlans(plansRes.data);
            if (pmRes.success) setPaymentMethods(pmRes.data);
            if (invoicesRes.success) setInvoices(invoicesRes.data);
            if (timelineRes.success) setTimeline(timelineRes.data);
        } catch (error) {
            console.error("Failed to fetch billing data:", error);
            toast.error("Failed to load billing information");
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const cancelSubscription = async () => {
        try {
            const res = await billingApi.cancelSubscription();
            if (res.success) {
                toast.success("Subscription canceled successfully");
                refresh();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to cancel subscription");
        }
    };

    const reactivateSubscription = async () => {
        try {
            const res = await billingApi.reactivateSubscription();
            if (res.success) {
                toast.success("Subscription reactivated!");
                refresh();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to reactivate subscription");
        }
    };

    const setDefaultPaymentMethod = async (id: number) => {
        try {
            const res = await billingApi.setDefaultPaymentMethod(id);
            if (res.success) {
                toast.success("Default payment method updated");
                refresh();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update default payment method");
        }
    };

    const deletePaymentMethod = async (id: number) => {
        if (!confirm("Remove this payment method?")) return;
        try {
            const res = await billingApi.deletePaymentMethod(id);
            if (res.success) {
                toast.success("Payment method removed");
                refresh();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to remove payment method");
        }
    };

    return {
        subscription,
        plans,
        paymentMethods,
        invoices,
        timeline,
        loading,
        refreshing,
        refresh,
        cancelSubscription,
        reactivateSubscription,
        setDefaultPaymentMethod,
        deletePaymentMethod,
    };
}
