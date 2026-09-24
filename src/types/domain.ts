export type EntityStatus = "draft" | "reviewed" | "published" | "deprecated";

export interface NutritionFact {
  code: string;
  label: string;
  value: number;
  unit: string;
}

export interface NutritionProfile {
  basis: "per_serving" | "per_100g" | "whole_recipe";
  quality: "estimated" | "verified";
  source: string | null;
  facts: NutritionFact[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentIds: string[];
  type: string | null;
  sortOrder: number;
  status: EntityStatus;
}

export interface Ingredient {
  id: string;
  name: string;
  canonicalName: string;
  aliases?: string[];
  status: EntityStatus;
}

export interface RecipeIngredient {
  ingredientId: string;
  amount: number | null;
  unit: string | null;
  preparationNote: string | null;
  optional: boolean;
}

export interface RecipeInstruction {
  step: number;
  text: string;
  texts?: Record<string, string>; // Translation mappings (e.g. ko, en, ja, zh)
}

export interface Recipe {
  id: string;
  title: string;
  titles?: Record<string, string>; // Translation mappings (e.g. ko, en, ja, zh)
  description: string;
  descriptions?: Record<string, string>; // Translation mappings (e.g. ko, en, ja, zh)
  heroMediaUrl: string | null;
  servingCount: number;
  cookingTimeMinutes: number | null;
  difficulty: string | null;
  nutrition: NutritionProfile | null;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  categoryIds: string[];
  tagIds: string[];
  status: EntityStatus;
}

export interface RecipeQuery {
  text?: string;
  categoryIds?: string[];
  tagIds?: string[];
  ingredientIds?: string[];
  limit?: number;
  offset?: number;
}

export interface RecipeRepository {
  listCategories(): Promise<Category[]>;
  searchRecipes(query: RecipeQuery): Promise<Recipe[]>;
  getRecipeById(id: string): Promise<Recipe | null>;
  getIngredientsByIds(ids: string[]): Promise<Ingredient[]>;
}

export type MediaStorageStatus = "pending" | "downloaded" | "failed" | "skipped";

export interface MediaAsset {
  id: string;
  sourceUrl: string | null;
  sourceProvider: string | null;
  storageKey: string | null;
  publicUrl: string | null;
  storageStatus: MediaStorageStatus;
  sourceHash: string | null;
  mediaType: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  status: EntityStatus;
}
