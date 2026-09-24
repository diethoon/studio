import React, { useState } from "react";
import { useI18n } from "@/src/i18n";
import { Search, X, Sparkles } from "lucide-react";

interface SearchFieldProps {
  initialValue?: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  initialValue = "",
  onSubmit,
  onChange,
  placeholder,
  className = "",
}) => {
  const { t } = useI18n();
  const [value, setValue] = useState(initialValue);
  const hasValue = value.trim().length > 0;

  const updateValue = (nextVal: string) => {
    setValue(nextVal);
    onChange?.(nextVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="min-h-[56px] px-4.5 rounded-2xl bg-[#1E2235] border border-[#282E47] shadow-xl flex items-center gap-3 transition-all focus-within:border-[#D2FF24] focus-within:shadow-[0_0_20px_rgba(210,255,36,0.15)]">
        <Search className="w-4 h-4 text-[#8F9BB3] shrink-0 group-focus-within:text-[#D2FF24]" />

        <input
          type="text"
          value={value}
          onChange={(e) => updateValue(e.target.value)}
          placeholder={placeholder || t("search.placeholder")}
          className="flex-1 bg-transparent py-2.5 text-white placeholder-[#8F9BB3] text-sm font-semibold outline-none"
        />

        {hasValue ? (
          <button
            type="button"
            onClick={() => updateValue("")}
            className="w-7 h-7 rounded-lg bg-[#282E47] text-[#8F9BB3] flex items-center justify-center hover:bg-[#D2FF24] hover:text-[#0F111A] transition-colors cursor-pointer"
            aria-label={t("search.clear")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-[#D2FF24]/10 text-[#D2FF24] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </form>
  );
};
