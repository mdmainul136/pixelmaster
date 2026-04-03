import tenantApi from '@/lib/tenantApi';

export interface SubscriptionPlan {
    id: number;
    name: string;
    plan_key: string; // This is the plan slug (e.g., 'starter', 'growth', 'pro')
    description: string;
    price_monthly: number;
    price_yearly: number;
    currency: string;
    features: string[];
    quotas: Record<string, number>;
}

export interface TenantSubscription {
    id: number;
    tenant_id: number;
    subscription_plan_id: number;
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';
    billing_cycle: 'monthly' | 'yearly';
    trial_ends_at: string | null;
    renews_at: string | null;
    canceled_at: string | null;
    ends_at: string | null;
    auto_renew: boolean;
    plan?: SubscriptionPlan;
    usage?: {
        db_usage_gb: number;
        db_limit_gb: number;
        db_usage_percent: number;
        is_over_quota: boolean;
        ai_daily?: { used: number; limit: number };
        scraping_daily?: { used: number; limit: number };
        whatsapp_monthly?: { used: number; limit: number };
        users?: { used: number; limit: number };
    };
}

export interface PaymentMethod {
    id: number;
    type: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    expiry_display: string;
    display_name: string;
    is_default: boolean;
    is_expired: boolean;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    subscription_type: string;
    total: number;
    status: 'paid' | 'pending' | 'unpaid' | 'canceled';
    notes: string;
    metadata: any;
}

export const billingApi = {
    getPlans: async () => {
        const response = await tenantApi.get('/api/v1/subscriptions/plans');
        return response.data;
    },

    getStatus: async () => {
        const response = await tenantApi.get('/api/v1/subscriptions/status');
        return response.data;
    },

    cancelSubscription: async () => {
        const response = await tenantApi.post('/api/v1/subscriptions/cancel');
        return response.data;
    },

    reactivateSubscription: async () => {
        const response = await tenantApi.post('/api/v1/subscriptions/reactivate');
        return response.data;
    },

    getPaymentHistory: async () => {
        const response = await tenantApi.get('/api/v1/payment/history');
        return response.data;
    },

    getInvoices: async () => {
        const response = await tenantApi.get('/api/v1/invoices');
        return response.data;
    },

    getInvoiceDownloadUrl: (id: number) => {
        return `${(import.meta as any).env.VITE_API_URL || ''}/api/v1/invoices/${id}/download`;
    },

    payInvoice: async (id: number) => {
        const response = await tenantApi.post(`/api/v1/invoices/${id}/pay`);
        return response.data;
    },

    createCheckoutSession: async (data: { module_key?: string; plan_slug?: string; subscription_type?: string }) => {
        const response = await tenantApi.post('/api/v1/payment/checkout', data);
        return response.data;
    },

    verifyPayment: async (sessionId: string) => {
        const response = await tenantApi.post('/api/v1/payment/verify', { session_id: sessionId });
        return response.data;
    },

    // Payment Methods
    getPaymentMethods: async () => {
        const response = await tenantApi.get('/api/v1/payment-methods');
        return response.data;
    },

    createSetupIntent: async () => {
        const response = await tenantApi.post('/api/v1/payment-methods/setup-intent');
        return response.data;
    },

    addPaymentMethod: async (paymentMethodId: string) => {
        const response = await tenantApi.post('/api/v1/payment-methods', {
            stripe_payment_method_id: paymentMethodId
        });
        return response.data;
    },

    deletePaymentMethod: async (id: number) => {
        const response = await tenantApi.delete(`/api/v1/payment-methods/${id}`);
        return response.data;
    },

    setDefaultPaymentMethod: async (id: number) => {
        const response = await tenantApi.post(`/api/v1/payment-methods/${id}/default`);
        return response.data;
    },

    getTimeline: async () => {
        const response = await tenantApi.get('/api/v1/subscriptions/timeline');
        return response.data;
    }
};

