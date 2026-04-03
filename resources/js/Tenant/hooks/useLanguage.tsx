import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Language = "en" | "ar";
type Direction = "ltr" | "rtl";

interface LanguageContextType {
  lang: Language;
  dir: Direction;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<string, Record<Language, string>> = {
  // Section Headers
  "nav.main": { en: "Main", ar: "الرئيسية" },
  "nav.storefront": { en: "Storefront", ar: "واجهة المتجر" },
  "nav.sales": { en: "Sales & Commerce", ar: "المبيعات والتجارة" },
  "nav.marketplace": { en: "Marketplace & Growth", ar: "السوق والنمو" },
  "nav.platform": { en: "Platform & Compliance", ar: "المنصة والامتثال" },
  "nav.inventory": { en: "Inventory & Stock", ar: "المخزون" },
  "nav.finance": { en: "Finance & Accounting", ar: "المالية والمحاسبة" },
  "nav.reports": { en: "Reports & Analytics", ar: "التقارير والتحليلات" },
  "nav.hr": { en: "HR & Loyalty", ar: "الموارد البشرية والولاء" },
  "nav.operations": { en: "Operations", ar: "العمليات" },
  "nav.others": { en: "Others", ar: "أخرى" },

  // Nav Items
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "nav.themeBuilder": { en: "Theme Builder", ar: "منشئ القوالب" },
  "nav.orders": { en: "Orders", ar: "الطلبات" },
  "nav.pos": { en: "POS Terminal", ar: "نقطة البيع" },
  "nav.crm": { en: "Customers / CRM", ar: "العملاء" },
  "nav.returns": { en: "Returns & Refunds", ar: "المرتجعات" },
  "nav.salesChannels": { en: "Sales Channels", ar: "قنوات البيع" },
  "nav.payments": { en: "Payments", ar: "المدفوعات" },
  "nav.subscriptions": { en: "Subscriptions", ar: "الاشتراكات" },
  "nav.delivery": { en: "Delivery", ar: "التوصيل" },
  "nav.marketplaceItem": { en: "Marketplace", ar: "السوق" },
  "nav.marketing": { en: "Marketing", ar: "التسويق" },
  "nav.flashSales": { en: "Flash Sales", ar: "عروض سريعة" },
  "nav.whatsapp": { en: "WhatsApp", ar: "واتساب" },
  "nav.seo": { en: "SEO Manager", ar: "إدارة SEO" },
  "nav.pagesBlog": { en: "Pages & Blog", ar: "الصفحات والمدونة" },
  "nav.zatca": { en: "ZATCA Compliance", ar: "امتثال زاتكا" },
  "nav.staffAccess": { en: "Staff Access", ar: "صلاحيات الموظفين" },
  "nav.appMarketplace": { en: "App Marketplace", ar: "متجر التطبيقات" },
  "nav.saudiServices": { en: "Saudi Services", ar: "الخدمات السعودية" },
  "nav.developer": { en: "Developer Portal", ar: "بوابة المطورين" },
  "nav.inventoryItem": { en: "Inventory", ar: "المخزون" },
  "nav.stockOverview": { en: "Stock Overview", ar: "نظرة عامة على المخزون" },
  "nav.products": { en: "Products", ar: "المنتجات" },
  "nav.suppliers": { en: "Suppliers", ar: "الموردون" },
  "nav.purchaseOrders": { en: "Purchase Orders", ar: "أوامر الشراء" },
  "nav.warehouse": { en: "Warehouse", ar: "المستودعات" },
  "nav.financeOverview": { en: "Overview", ar: "نظرة عامة" },
  "nav.taxCurrency": { en: "Multi-currency & Tax", ar: "العملات والضرائب" },
  "nav.salesReport": { en: "Sales Report", ar: "تقرير المبيعات" },
  "nav.inventoryReport": { en: "Inventory Report", ar: "تقرير المخزون" },
  "nav.customerInsights": { en: "Customer Insights", ar: "رؤى العملاء" },
  "nav.staffManagement": { en: "Staff Management", ar: "إدارة الموظفين" },
  "nav.loyalty": { en: "Loyalty & Coupons", ar: "الولاء والكوبونات" },
  "nav.branches": { en: "Branches", ar: "الفروع" },
  "nav.expenses": { en: "Expense Tracker", ar: "تتبع المصاريف" },
  "nav.auditLog": { en: "Audit Log", ar: "سجل المراجعة" },
  "nav.reviews": { en: "Reviews & Ratings", ar: "التقييمات" },
  "nav.calendar": { en: "Calendar", ar: "التقويم" },
  "nav.profile": { en: "User Profile", ar: "الملف الشخصي" },
  "nav.tables": { en: "Tables", ar: "الجداول" },
  "nav.pages": { en: "Pages", ar: "الصفحات" },
  "nav.settings": { en: "Settings", ar: "الإعدادات" },
  "nav.generalSettings": { en: "General Settings", ar: "الإعدادات العامة" },
  "nav.domainsBilling": { en: "Domains & Billing", ar: "النطاقات والفواتير" },
  "nav.emailNotifications": { en: "Email & Notifications", ar: "البريد والتنبيهات" },
  "nav.smsGateway": { en: "SMS Gateway", ar: "بوابة SMS" },
  "nav.whatsappAutomation": { en: "WhatsApp Automation", ar: "أتمتة واتساب" },
  "nav.aiConfig": { en: "AI Configuration", ar: "تكوين الذكاء الاصطناعي" },
  "nav.domains": { en: "Domains & System", ar: "النطاقات والنظام" },
  "nav.auth": { en: "Authentication", ar: "المصادقة" },
  "nav.signIn": { en: "Sign In", ar: "تسجيل الدخول" },
  "nav.signUp": { en: "Sign Up", ar: "إنشاء حساب" },
  "nav.roadmap": { en: "SaaS Roadmap", ar: "خارطة الطريق" },
  "nav.multiTenant": { en: "Multi-Tenant Core", ar: "النظام متعدد المستأجرين" },
  "nav.platformDashboard": { en: "Platform Dashboard", ar: "لوحة تحكم المنصة" },
  
  // Cross-Border IOR
  "nav.sourcing": { en: "Sourcing & Scraping", ar: "التوريد والكشط" },
  "nav.scraper": { en: "Product Scraper", ar: "كاشط المنتجات" },
  "nav.calculator": { en: "Price Calculator", ar: "حاسبة الأسعار" },
  "nav.catalog": { en: "Global Catalog", ar: "الكتالوج العالمي" },
  "nav.fulfillment": { en: "Orders & Fulfillment", ar: "الطلبات والتنفيذ" },
  "nav.foreignOrders": { en: "Foreign Orders", ar: "طلبات خارجية" },
  "nav.shipments": { en: "Shipment Batches", ar: "دفعات الشحن" },
  "nav.couriers": { en: "Couriers & Tracking", ar: "البريد السريع والتتبع" },
  "nav.financeAdmin": { en: "Finance & Admin", ar: "المالية والإدارة" },
  "nav.iorBilling": { en: "Billing & Payments", ar: "الفواتير والمدفوعات" },
  "nav.customs": { en: "Customs & Duty", ar: "الجمارك والرسوم" },
  "nav.iorStorefront": { en: "Storefront", ar: "واجهة المتجر" },
  "nav.iorSettings": { en: "IOR Settings", ar: "إعدادات IOR" },

  // Header
  "header.search": { en: "Type to search...", ar: "اكتب للبحث..." },
  "header.myProfile": { en: "My Profile", ar: "ملفي الشخصي" },
  "header.settings": { en: "Settings", ar: "الإعدادات" },
  "header.logOut": { en: "Log Out", ar: "تسجيل الخروج" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("app-lang") as Language) || "en";
    }
    return "en";
  });

  const dir: Direction = lang === "ar" ? "rtl" : "ltr";
  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem("app-lang", lang);
  }, [lang, dir]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[lang] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
