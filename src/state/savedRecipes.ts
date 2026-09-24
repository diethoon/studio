import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "diet:saved-recipe-ids:v1";

export function getSavedRecipeIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveRecipeIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error("Failed to save recipe IDs to localStorage", err);
  }
}

export function useSavedRecipes() {
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>(getSavedRecipeIds);

  useEffect(() => {
    setSavedRecipeIds(getSavedRecipeIds());
  }, []);

  const isSaved = useCallback(
    (recipeId: string) => savedRecipeIds.includes(recipeId),
    [savedRecipeIds]
  );

  const toggleSaved = useCallback((recipeId: string) => {
    setSavedRecipeIds((prev) => {
      const next = prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [recipeId, ...prev];
      saveRecipeIds(next);
      return next;
    });
  }, []);

  return {
    savedRecipeIds,
    isSaved,
    toggleSaved,
    count: savedRecipeIds.length,
  };
}
