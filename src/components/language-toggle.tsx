"use client";

import { useLanguage } from "./language-provider";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full border border-slate-300 p-1 text-xs dark:border-slate-700">
      <button
        type="button"
        onClick={() => setLanguage("ar")}
        className={`rounded-full px-2 py-1 ${
          language === "ar" ? "bg-accent font-semibold text-slate-950" : ""
        }`}
      >
        {t("lang_ar")}
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-2 py-1 ${
          language === "en" ? "bg-accent font-semibold text-slate-950" : ""
        }`}
      >
        {t("lang_en")}
      </button>
    </div>
  );
}
