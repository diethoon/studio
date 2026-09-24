import React from "react";
import type { Recipe } from "@/src/types/domain";
import { RecipeCard } from "@/src/components/RecipeCard";

interface RecipeRailProps {
  recipes: Recipe[];
  onPress?: (recipe: Recipe) => void;
  className?: string;
}

export const RecipeRail: React.FC<RecipeRailProps> = ({
  recipes,
  onPress,
  className = "",
}) => {
  return (
    <div className={`flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin ${className}`}>
      {recipes.map((recipe) => (
        <div key={recipe.id} className="w-[260px] sm:w-[280px] shrink-0 snap-start">
          <RecipeCard recipe={recipe} onPress={onPress} className="h-full" />
        </div>
      ))}
    </div>
  );
};
