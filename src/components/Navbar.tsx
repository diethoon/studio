import React from "react";
import { Sparkles, Search, Heart, Globe, Flame, Settings } from "lucide-react";
import { useSavedRecipes } from "@/src/state/savedRecipes";
import { useI18n, type Language } from "@/src/i18n";
import { useModelSelection, type GeminiModel } from "@/src/state/modelSelection";

interface NavbarProps {
  onOpenAiGenerator: () => void;
  onOpenAdmin: () => void;
  activeTab?: "home" | "search" | "saved";
  onSelectTab?: (tab: "home" | "search" | "saved") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAiGenerator,
  onOpenAdmin,
  activeTab = "home",
  onSelectTab,
}) => {
  const { lang, setLang, t } = useI18n();
  const { count } = useSavedRecipes();
  const { selectedModel, changeModel } = useModelSelection();

  return (
    <header className="sticky top-0 z-40 bg-[#0F111A]/90 backdrop-blur-md border-b border-[#282E47] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Top bar for mobile: Logo & Action Buttons */}
        <div className="flex items-center justify-between gap-4 w-full md:w-auto">
          {/* Brand Logo - High Tech Gym / Cafe vibe */}
          <button
            onClick={() => onSelectTab?.("home")}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#D2FF24] text-[#0F111A] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(210,255,36,0.4)] group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-[#0F111A]" />
            </div>
            <div className="leading-tight">
              <span className="block text-[8px] sm:text-[9px] font-black tracking-[0.2em] text-[#D2FF24] uppercase">
                NEXT GEN NUTRITION
              </span>
              <span className="block font-space text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-[#D2FF24] transition-colors">
                DIET_STUDIO<span className="text-[#D2FF24]">.</span>
              </span>
            </div>
          </button>

          {/* Core CTAs on Right for fast access on mobile */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAiGenerator}
              className="px-3 py-1.5 rounded-xl bg-white text-[#0F111A] hover:bg-[#D2FF24] hover:shadow-[0_0_15px_rgba(210,255,36,0.3)] text-xs font-black tracking-wide flex items-center gap-1 transition-all cursor-pointer border-none"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="p-1.5 sm:p-2 rounded-xl bg-[#1E2235] border border-[#282E47] hover:border-[#D2FF24] hover:text-[#D2FF24] text-white flex items-center justify-center transition-all cursor-pointer"
              title="관리자 콘솔"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Glass Navigation & Model Selections & Locales */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Segmented Tab Bar */}
          <nav className="flex items-center gap-1 p-1 rounded-full bg-[#1E2235]/60 border border-[#282E47]">
            <button
              onClick={() => onSelectTab?.("home")}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-wide transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-[#D2FF24] text-[#0F111A]"
                  : "text-[#8F9BB3] hover:text-white"
              }`}
            >
              HOME
            </button>

            <button
              onClick={() => onSelectTab?.("search")}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-wide transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "search"
                  ? "bg-[#D2FF24] text-[#0F111A]"
                  : "text-[#8F9BB3] hover:text-white"
              }`}
            >
              <Search className="w-3 h-3" />
              <span>SEARCH</span>
            </button>

            <button
              onClick={() => onSelectTab?.("saved")}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-wide transition-all flex items-center gap-1 cursor-pointer relative ${
                activeTab === "saved"
                  ? "bg-[#D2FF24] text-[#0F111A]"
                  : "text-[#8F9BB3] hover:text-white"
              }`}
            >
              <Heart className={`w-3 h-3 ${count > 0 ? "fill-[#D2FF24] text-current" : ""}`} />
              <span>FAVS</span>
              {count > 0 && (
                <span className="px-1 py-0.2 rounded bg-[#D2FF24] text-[#0F111A] text-[8px] font-black ml-0.5">
                  {count}
                </span>
              )}
            </button>
          </nav>

          {/* Model Selection Menu */}
          <div className="flex items-center gap-1.5 bg-[#1E2235] px-2.5 py-1.5 rounded-xl border border-[#282E47]">
            <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">AI ENGINE:</span>
            <select
              value={selectedModel}
              onChange={(e) => changeModel(e.target.value as GeminiModel)}
              className="bg-transparent text-[11px] sm:text-xs font-black text-[#D2FF24] outline-none cursor-pointer py-0.5"
            >
              <option value="gemini-3.1-flash-lite" className="bg-[#1E2235]">3.1-Lite</option>
              <option value="gemini-3.5-flash-lite" className="bg-[#1E2235]">3.5-Lite</option>
              <option value="gemini-3.6-flash" className="bg-[#1E2235]">3.6-Flash</option>
              <option value="gemini-3.7-flash" className="bg-[#1E2235]">3.7-Flash</option>
              <option value="gemini-3.8-flash" className="bg-[#1E2235]">3.8-Flash</option>
            </select>
          </div>

          {/* Language translation selector */}
          <div className="flex items-center bg-[#1E2235] px-2 py-1.5 rounded-xl border border-[#282E47]">
            <Globe className="w-3.5 h-3.5 text-[#8F9BB3] mr-1 hidden sm:block" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent text-[10px] sm:text-xs font-black text-white outline-none cursor-pointer py-0.5"
            >
              <option value="ko" className="bg-[#1E2235]">KO (한국어)</option>
              <option value="en" className="bg-[#1E2235]">EN (English)</option>
              <option value="ja" className="bg-[#1E2235]">JA (日本語)</option>
              <option value="zh" className="bg-[#1E2235]">ZH (简体中文)</option>
            </select>
          </div>
        </div>

      </div>
    </header>
  );
};
