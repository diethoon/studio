import categoriesData from "@/src/content/categories.json";
import ingredientsData from "@/src/content/ingredients.json";
import recipesData from "@/src/content/recipes.json";
import type { Category, Ingredient, Recipe, RecipeQuery, RecipeRepository } from "@/src/types/domain";

const categories = categoriesData as Category[];
const ingredients = ingredientsData as Ingredient[];
let recipes = [...(recipesData as Recipe[])];

const categoryMap = new Map(categories.map((category) => [category.id, category]));
const ingredientMap = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function matchesQuery(recipe: Recipe, query: string) {
  if (!query) {
    return true;
  }
  const needle = normalize(query);
  const ingredientText = recipe.ingredients
    .map((item) => ingredientMap.get(item.ingredientId))
    .filter((ingredient): ingredient is Ingredient => ingredient != null)
    .flatMap((ingredient) => [ingredient.name, ingredient.canonicalName, ...(ingredient.aliases || [])])
    .join(" ");

  const categoryText = recipe.categoryIds
    .map((id) => categoryMap.get(id)?.name ?? "")
    .join(" ");

  return normalize([
    recipe.title,
    recipe.description,
    Object.values(recipe.titles || {}).join(" "),
    Object.values(recipe.descriptions || {}).join(" "),
    ingredientText,
    categoryText,
    ...(recipe.tagIds || []),
  ].join(" ")).includes(needle);
}

export interface StudioSettings {
  heroEyebrow: string;
  heroEyebrows?: Record<string, string>;
  heroTitle: string;
  heroTitles?: Record<string, string>;
  heroSubtitle: string;
  heroSubtitles?: Record<string, string>;
  specialEyebrow: string;
  specialEyebrows?: Record<string, string>;
  specialTitle: string;
  specialTitles?: Record<string, string>;
  specialDesc: string;
  specialDescs?: Record<string, string>;
}

const DEFAULT_SETTINGS: StudioSettings = {
  heroEyebrow: "EAT SMART · TRAIN HARD · LIVE HIP",
  heroEyebrows: {
    ko: "EAT SMART · TRAIN HARD · LIVE HIP",
    en: "EAT SMART · TRAIN HARD · LIVE HIP",
    ja: "EAT SMART · TRAIN HARD · LIVE HIP",
    zh: "EAT SMART · TRAIN HARD · LIVE HIP"
  },
  heroTitle: "식단도 힙하고 스마트하게.",
  heroTitles: {
    ko: "식단도 힙하고 스마트하게.",
    en: "Smart & Hip Diet Recipes.",
    ja: "食事もヒップでスマートに。",
    zh: "膳食管理也如此时髦与智能。"
  },
  heroSubtitle: "부담스럽고 유치한 레시피는 가라! 고단백, 저탄수, 타겟팅 칼로리를 충족하는 검증된 MZ 전용 헬시 식단 스튜디오입니다.",
  heroSubtitles: {
    ko: "부담스럽고 유치한 레시피는 가라! 고단백, 저탄수, 타겟팅 칼로리를 충족하는 검증된 MZ 전용 헬시 식단 스튜디오입니다.",
    en: "No more boring diet routines. Explore high-protein, low-carb customized smart recipes built for the modern generation.",
    ja: "退屈なダイエットレシピは終わり！高タンパク、低炭水化物、目標カロリーを満たす検証済みのモダンヘルシー食단スタジオです。",
    zh: "告别枯燥单调的减脂餐！为您量身定制高蛋白、低碳水、控卡路里的新一代健康膳食指南。"
  },
  specialEyebrow: "TODAY'S SPECIAL",
  specialEyebrows: {
    ko: "TODAY'S SPECIAL",
    en: "TODAY'S SPECIAL",
    ja: "TODAY'S SPECIAL",
    zh: "今日特推"
  },
  specialTitle: "Seongsu Cyber Poke Bowl",
  specialTitles: {
    ko: "Seongsu Cyber Poke Bowl",
    en: "Seongsu Cyber Poke Bowl",
    ja: "聖水サイバーポキボウル",
    zh: "圣水洞赛博波奇碗"
  },
  specialDesc: "단백질 32g, 410kcal로 조율된 완벽한 애프터워크 식단",
  specialDescs: {
    ko: "단백질 32g, 410kcal로 조율된 완벽한 애프터워크 식단",
    en: "Formulated with 32g protein and 410kcal - the ultimate post-workout recovery meal.",
    ja: "タンパク質32g、410kcalに調整された完璧なアフターワークミール。",
    zh: "精心配备32g蛋白质与410kcal卡路里，下班后的绝佳充能之选。"
  }
};

export interface ExtendedRecipeRepository extends RecipeRepository {
  addCustomRecipe(recipe: Recipe): Promise<void>;
  editRecipe(id: string, updatedRecipe: Partial<Recipe>): Promise<void>;
  deleteRecipe(id: string): Promise<void>;
  getAllRecipes(): Promise<Recipe[]>;
  listIngredients(): Promise<Ingredient[]>;
  getSettings(): Promise<StudioSettings>;
  saveSettings(settings: StudioSettings): Promise<void>;
}

export const repository: ExtendedRecipeRepository = {
  async listCategories() {
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async listIngredients() {
    return [...ingredients];
  },

  async getAllRecipes() {
    return recipes.filter((r) => r.status === "published");
  },

  async searchRecipes(query: RecipeQuery) {
    const filtered = recipes.filter((recipe) => {
      if (recipe.status !== "published") {
        return false;
      }
      if (!matchesQuery(recipe, query.text ?? "")) {
        return false;
      }
      if (query.categoryIds?.length) {
        const categorySet = new Set(recipe.categoryIds);
        if (!query.categoryIds.some((id) => categorySet.has(id))) {
          return false;
        }
      }
      if (query.tagIds?.length) {
        const tagSet = new Set(recipe.tagIds);
        if (!query.tagIds.some((id) => tagSet.has(id))) {
          return false;
        }
      }
      if (query.ingredientIds?.length) {
        const ingredientSet = new Set(recipe.ingredients.map((item) => item.ingredientId));
        if (!query.ingredientIds.some((id) => ingredientSet.has(id))) {
          return false;
        }
      }
      return true;
    });

    const offset = query.offset ?? 0;
    const limit = query.limit ?? filtered.length;
    return filtered.slice(offset, offset + limit);
  },

  async getRecipeById(id: string) {
    return recipes.find((recipe) => recipe.status === "published" && recipe.id === id) ?? null;
  },

  async getIngredientsByIds(ids: string[]) {
    const requested = new Set(ids);
    return ingredients.filter((ingredient) => requested.has(ingredient.id));
  },

  async addCustomRecipe(newRecipe: Recipe) {
    recipes = [newRecipe, ...recipes];
  },

  async editRecipe(id: string, updatedRecipe: Partial<Recipe>) {
    recipes = recipes.map((recipe) => {
      if (recipe.id === id) {
        return { ...recipe, ...updatedRecipe };
      }
      return recipe;
    });
  },

  async deleteRecipe(id: string) {
    recipes = recipes.filter((recipe) => recipe.id !== id);
  },

  async getSettings(): Promise<StudioSettings> {
    try {
      const stored = localStorage.getItem("diet_studio_settings_v1");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read settings from localStorage", e);
    }
    return DEFAULT_SETTINGS;
  },

  async saveSettings(settings: StudioSettings): Promise<void> {
    try {
      localStorage.setItem("diet_studio_settings_v1", JSON.stringify(settings));
    } catch (e) {
      console.warn("Could not write settings to localStorage", e);
    }
  }
};
