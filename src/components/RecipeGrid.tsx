import React from "react";
import type { Recipe } from "@/src/types/domain";
import { RecipeCard } from "@/src/components/RecipeCard";

interface RecipeGridProps {
  recipes: Recipe[];
  onPress?: (recipe: Recipe) => void;
  className?: string;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  onPress,
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 ${className}`}>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onPress={onPress} />
      ))}
    </div>
  );
};
