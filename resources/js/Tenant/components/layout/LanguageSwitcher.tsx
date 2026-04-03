import { useLanguage } from "@Tenant/hooks/useLanguage";
import { Languages } from "lucide-react";

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-sm"
      title={lang === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      <Languages className="h-5 w-5" />
      <span className="text-xs font-semibold hidden sm:inline">
        {lang === "en" ? "عربي" : "EN"}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
