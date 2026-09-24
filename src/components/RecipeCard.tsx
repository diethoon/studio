import React from "react";
import type { Recipe } from "@/src/types/domain";
import { MediaPlaceholder } from "@/src/components/MediaPlaceholder";
import { SaveButton } from "@/src/components/SaveButton";
import { Clock, Activity } from "lucide-react";
import { useI18n } from "@/src/i18n";

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: (recipe: Recipe) => void;
  className?: string;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  className = "",
}) => {
  const { t, lang } = useI18n();
  const nutrition = recipe.nutrition;
  const energyFact = nutrition?.facts.find((f) => f.code === "energy") || nutrition?.facts[0];
  const proteinFact = nutrition?.facts.find((f) => f.code === "protein");

  const displayTitle = recipe.titles?.[lang] || recipe.title;
  const displayDescription = recipe.descriptions?.[lang] || recipe.description;

  return (
    <div
      onClick={() => onPress?.(recipe)}
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-[#1E2235] border border-[#282E47] hover:border-[#D2FF24] shadow-lg hover:shadow-[0_0_30px_rgba(210,255,36,0.12)] transition-all duration-300 cursor-pointer ${className}`}
    >
      {/* Recipe Media Cover */}
      <div className="relative aspect-[1.1] bg-[#141725] overflow-hidden">
        {recipe.heroMediaUrl ? (
          <img
            src={recipe.heroMediaUrl}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <MediaPlaceholder title={displayTitle} className="w-full h-full" />
        )}

        {/* Favorite Save Button Overlay */}
        <div className="absolute top-3 right-3 z-10">
          <SaveButton recipeId={recipe.id} compact />
        </div>

        {/* Difficulty flag overlay */}
        {recipe.difficulty && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase bg-[#0F111A]/90 text-[#D2FF24] border border-[#282E47]">
            {recipe.difficulty.toUpperCase()}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-3">
        <div className="space-y-1.5">
          <h3 className="font-space text-white font-bold text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-[#D2FF24] transition-colors">
            {displayTitle}
          </h3>
          <p className="text-[#8F9BB3] text-xs line-clamp-2 leading-relaxed font-medium">
            {displayDescription}
          </p>
        </div>

        {/* Dynamic Metrics */}
        <div className="flex items-center gap-2.5 pt-3.5 border-t border-[#282E47] text-xs font-bold text-[#8F9BB3]">
          {recipe.cookingTimeMinutes != null && (
            <span className="flex items-center gap-1 text-[#D2FF24]">
              <Clock className="w-3.5 h-3.5" />
              <span>{recipe.cookingTimeMinutes}m</span>
            </span>
          )}

          {energyFact && (
            <span className="flex items-center gap-1 text-white">
              <Activity className="w-3.5 h-3.5 text-[#8F9BB3]" />
              <span>{Math.round(energyFact.value)} kcal</span>
            </span>
          )}

          {proteinFact && (
            <span className="ml-auto px-2 py-0.5 rounded-md bg-[#D2FF24]/10 text-[#D2FF24] text-[10px] tracking-wide uppercase">
              P: {Math.round(proteinFact.value)}g
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
