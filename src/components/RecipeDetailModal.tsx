import React, { useState, useEffect } from "react";
import type { Recipe } from "@/src/types/domain";
import { repository } from "@/src/data/repository";
import { MediaPlaceholder } from "@/src/components/MediaPlaceholder";
import { SaveButton } from "@/src/components/SaveButton";
import { useI18n } from "@/src/i18n";
import {
  X,
  Clock,
  Users,
  Flame,
  CheckCircle2,
  Circle,
  Share2,
  Plus,
  Minus,
  Activity
} from "lucide-react";

interface RecipeDetailModalProps {
  recipeId: string | null;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipeId,
  onClose,
}) => {
  const { t, lang } = useI18n();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredientNames, setIngredientNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!recipeId) {
      setRecipe(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setCompletedSteps({});

    repository
      .getRecipeById(recipeId)
      .then(async (nextRecipe) => {
        setRecipe(nextRecipe);
        if (nextRecipe) {
          setServings(nextRecipe.servingCount || 1);
          const ingredientIds = nextRecipe.ingredients.map((item) => item.ingredientId);
          const loaded = await repository.getIngredientsByIds(ingredientIds);
          setIngredientNames(
            Object.fromEntries(loaded.map((ing) => [ing.id, ing.name]))
          );
        }
      })
      .finally(() => setLoading(false));
  }, [recipeId]);

  if (!recipeId) return null;

  const baseServings = recipe?.servingCount || 1;
  const multiplier = servings / baseServings;

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const displayTitle = recipe ? (recipe.titles?.[lang] || recipe.title) : "";
  const displayDescription = recipe ? (recipe.descriptions?.[lang] || recipe.description) : "";

  const handleShare = () => {
    if (!recipe) return;
    const shareText = `[${displayTitle}]\n${displayDescription}\n\n${t("recipe.ingredients")}:\n` +
      recipe.ingredients.map((item) => {
        const name = ingredientNames[item.ingredientId] || item.ingredientId;
        const amount = item.amount ? Math.round(item.amount * multiplier * 10) / 10 : "";
        return `- ${name} ${amount} ${item.unit || ""}`;
      }).join("\n");

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0F111A]/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl my-8 bg-[#141725] border border-[#282E47] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#141725]/90 backdrop-blur-md border-b border-[#282E47]">
          <span className="text-[10px] font-black tracking-[0.25em] text-[#D2FF24] uppercase font-space">
            {recipe?.difficulty ? `${recipe.difficulty.toUpperCase()} DISH` : "RECIPE DETAIL"}
          </span>
          <div className="flex items-center gap-2">
            <SaveButton recipeId={recipeId} />
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#282E47] hover:bg-[#D2FF24] text-white hover:text-[#0F111A] text-xs font-bold transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "COPIED" : "SHARE"}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#282E47] hover:bg-[#D2FF24] hover:text-[#0F111A] text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#D2FF24] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !recipe ? (
            <div className="py-12 text-center space-y-3">
              <h3 className="font-space text-xl font-bold text-white">{t("recipe.notFound")}</h3>
              <p className="text-[#8F9BB3] text-sm">{t("recipe.unavailable")}</p>
            </div>
          ) : (
            <>
              {/* Cover Image */}
              <div className="w-full rounded-2xl overflow-hidden bg-[#1E2235] border border-[#282E47] aspect-[16/9] sm:aspect-[21/9]">
                {recipe.heroMediaUrl ? (
                  <img
                    src={recipe.heroMediaUrl}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MediaPlaceholder title={displayTitle} className="w-full h-full" />
                )}
              </div>

              {/* Title Block */}
              <div className="space-y-3">
                <h1 className="font-space text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {displayTitle}
                </h1>
                <p className="text-[#8F9BB3] text-sm sm:text-base leading-relaxed font-medium">
                  {displayDescription}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recipe.cookingTimeMinutes != null && (
                  <div className="p-4 rounded-2xl bg-[#1E2235] border border-[#282E47] flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] font-bold tracking-wider text-[#8F9BB3] uppercase flex items-center gap-1 font-space">
                      <Clock className="w-3.5 h-3.5 text-[#D2FF24]" /> TIME
                    </span>
                    <span className="text-lg font-bold text-white">
                      {recipe.cookingTimeMinutes} mins
                    </span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-[#1E2235] border border-[#282E47] flex flex-col gap-1 shadow-sm">
                  <span className="text-[10px] font-bold tracking-wider text-[#8F9BB3] uppercase flex items-center gap-1 font-space">
                    <Users className="w-3.5 h-3.5 text-[#D2FF24]" /> SERVINGS
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">
                      {servings}P
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setServings((s) => Math.max(1, s - 1))}
                        className="w-5 h-5 rounded-lg bg-[#282E47] hover:bg-[#D2FF24] hover:text-[#0F111A] text-white flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setServings((s) => s + 1)}
                        className="w-5 h-5 rounded-lg bg-[#282E47] hover:bg-[#D2FF24] hover:text-[#0F111A] text-white flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {recipe.nutrition?.facts.find((f) => f.code === "energy") && (
                  <div className="p-4 rounded-2xl bg-[#1E2235] border border-[#282E47] flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] font-bold tracking-wider text-[#8F9BB3] uppercase flex items-center gap-1 font-space">
                      <Flame className="w-3.5 h-3.5 text-[#D2FF24]" /> ENERGY
                    </span>
                    <span className="text-lg font-bold text-white">
                      {Math.round(
                        (recipe.nutrition.facts.find((f) => f.code === "energy")?.value || 0) * multiplier
                      )}{" "}
                      kcal
                    </span>
                  </div>
                )}

                {recipe.nutrition?.facts.find((f) => f.code === "protein") && (
                  <div className="p-4 rounded-2xl bg-[#D2FF24]/10 border border-[#D2FF24]/30 text-white flex flex-col gap-1">
                    <span className="text-[10px] font-bold tracking-wider text-[#D2FF24] uppercase font-space">
                      PROTEIN
                    </span>
                    <span className="text-lg font-black text-[#D2FF24]">
                      {Math.round(
                        (recipe.nutrition.facts.find((f) => f.code === "protein")?.value || 0) * multiplier
                      )}g
                    </span>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-space text-xl font-bold text-white">{t("recipe.ingredients")}</h3>
                  {multiplier !== 1 && (
                    <span className="text-xs font-bold text-[#D2FF24]">
                      {servings}인분 환산 계산 완료
                    </span>
                  )}
                </div>
                <div className="p-5 rounded-2xl bg-[#1E2235] border border-[#282E47] divide-y divide-[#282E47] shadow-sm">
                  {recipe.ingredients.map((item) => {
                    const name = ingredientNames[item.ingredientId] || item.ingredientId;
                    const calculatedAmount = item.amount
                      ? Math.round(item.amount * multiplier * 10) / 10
                      : null;

                    return (
                      <div
                        key={item.ingredientId}
                        className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0 text-sm font-semibold"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-white">
                            {name}
                          </span>
                          {item.preparationNote && (
                            <span className="text-xs text-[#8F9BB3] font-medium">
                              ({item.preparationNote})
                            </span>
                          )}
                        </div>
                        <span className="text-[#8F9BB3]">
                          {[calculatedAmount, item.unit].filter(Boolean).join(" ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step By Step Instructions */}
              <div className="space-y-4">
                <h3 className="font-space text-xl font-bold text-white">{t("recipe.method")}</h3>
                <div className="space-y-3">
                  {recipe.instructions.map((inst) => {
                    const isDone = completedSteps[inst.step];
                    const stepText = inst.texts?.[lang] || inst.text;
                    return (
                      <div
                        key={inst.step}
                        onClick={() => toggleStep(inst.step)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                          isDone
                            ? "bg-[#141725] border-[#282E47] opacity-40"
                            : "bg-[#1E2235] border-[#282E47] hover:border-[#D2FF24] shadow-sm"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                            isDone ? "bg-[#282E47] text-[#8F9BB3]" : "bg-[#D2FF24] text-[#0F111A]"
                          }`}
                        >
                          {inst.step}
                        </div>
                        <p
                          className={`flex-1 text-sm font-semibold pt-0.5 leading-relaxed ${
                            isDone ? "line-through text-[#8F9BB3]" : "text-white"
                          }`}
                        >
                          {stepText}
                        </p>
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[#D2FF24] shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#282E47] shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Nutrition Board */}
              {recipe.nutrition && (
                <div className="space-y-4 p-5 rounded-2xl bg-[#141725] border border-[#282E47]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-space text-lg font-bold text-white">
                      {t("recipe.nutrition")}
                    </h3>
                    <span className="text-[9px] font-black tracking-widest uppercase text-[#D2FF24] bg-[#D2FF24]/10 px-2.5 py-1 rounded-lg border border-[#D2FF24]/20">
                      {recipe.nutrition.quality === "verified" ? "VERIFIED DATA" : "ESTIMATED VALUES"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {recipe.nutrition.facts.map((fact) => (
                      <div
                        key={fact.code}
                        className="p-3.5 rounded-xl bg-[#1E2235] border border-[#282E47] flex flex-col gap-0.5 shadow-sm"
                      >
                        <span className="text-xs font-bold text-[#8F9BB3]">
                          {fact.label}
                        </span>
                        <span className="text-base font-bold text-white">
                          {Math.round(fact.value * multiplier)} {fact.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
