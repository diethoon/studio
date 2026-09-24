import React from "react";
import { Heart } from "lucide-react";
import { useSavedRecipes } from "@/src/state/savedRecipes";
import { useI18n } from "@/src/i18n";

interface SaveButtonProps {
  recipeId: string;
  compact?: boolean;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  recipeId,
  compact = false,
  className = "",
}) => {
  const { t } = useI18n();
  const { isSaved, toggleSaved } = useSavedRecipes();
  const saved = isSaved(recipeId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaved(recipeId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? t("recipe.unsave") : t("recipe.save")}
      className={`min-h-[36px] px-3.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer select-none active:scale-90 ${
        compact ? "w-[36px] h-[36px] p-0 rounded-xl" : ""
      } ${
        saved
          ? "bg-[#D2FF24] border-[#D2FF24] text-[#0F111A] shadow-[0_0_15px_rgba(210,255,36,0.3)] font-black"
          : "bg-[#0F111A]/80 backdrop-blur-md border-[#282E47] text-white hover:border-[#D2FF24] hover:bg-[#1E2235]"
      } ${className}`}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-colors ${
          saved ? "fill-[#0F111A] text-[#0F111A]" : "text-white"
        }`}
      />
      {!compact && (
        <span className={saved ? "text-[#0F111A]" : "text-white"}>
          {saved ? "FAVED" : "SAVE"}
        </span>
      )}
    </button>
  );
};
