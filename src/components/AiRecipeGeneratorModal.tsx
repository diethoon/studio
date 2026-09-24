import React, { useState } from "react";
import { repository } from "@/src/data/repository";
import type { Recipe } from "@/src/types/domain";
import { Sparkles, X, ChefHat, Loader2, ArrowRight } from "lucide-react";
import { useModelSelection } from "@/src/state/modelSelection";

interface AiRecipeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeCreated: (recipe: Recipe) => void;
}

export const AiRecipeGeneratorModal: React.FC<AiRecipeGeneratorModalProps> = ({
  isOpen,
  onClose,
  onRecipeCreated,
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedModel } = useModelSelection();

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Call the server-side proxy route instead of calling Gemini directly from the client
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, model: selectedModel }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "서버에서 레시피를 생성하는 도중 오류가 발생했습니다.");
      }

      const generatedData = await res.json();

      const newRecipe: Recipe = {
        id: `recipe-ai-${Date.now()}`,
        title: generatedData.title,
        description: generatedData.description,
        heroMediaUrl: "/src/assets/images/hip_poke_bowl_1790230085855.jpg",
        servingCount: generatedData.servingCount || 1,
        cookingTimeMinutes: generatedData.cookingTimeMinutes || 15,
        difficulty: generatedData.difficulty || "easy",
        nutrition: generatedData.nutrition,
        ingredients: generatedData.ingredients,
        instructions: generatedData.instructions,
        categoryIds: ["cat-weight", "cat-protein"],
        tagIds: ["ai-generated", "healthy"],
        status: "published",
      };

      await repository.addCustomRecipe(newRecipe);
      onRecipeCreated(newRecipe);
      setPrompt("");
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "레시피를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "시금치, 버섯, 두부 있어! 15분 완성 고단백 저열량 레시피 원해.",
    "체중 감량을 위해 야식 대용으로 먹을 수 있는 300kcal 이하 토마토 수프 요리",
    "아보카도랑 연어캔으로 만들 수 있는 힙한 포케 보울 레시피"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F111A]/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#141725] border border-[#282E47] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#282E47] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D2FF24] text-[#0F111A] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(210,255,36,0.3)]">
              <Sparkles className="w-5 h-5 fill-[#0F111A]" />
            </div>
            <div>
              <h2 className="font-space text-xl font-bold text-white">AI DIET CREATOR</h2>
              <p className="text-xs text-[#8F9BB3]">원하는 칼로리와 재료로 설계하는 힙한 커스텀 다이어트 식단</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#282E47] hover:bg-[#D2FF24] hover:text-[#0F111A] flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">
              보유 재료 및 건강 조건
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 두부, 계란이 있고 점심 식사 대용으로 아주 든든하고 트렌디하게 먹을 수 있는 400kcal 이하 고단백 식단을 원해."
              rows={4}
              className="w-full p-4 rounded-2xl bg-[#1E2235] border border-[#282E47] focus:border-[#D2FF24] outline-none text-sm text-white placeholder-[#8F9BB3] resize-none font-semibold"
            />
          </div>

          {/* Quick recommendations */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-[#8F9BB3] tracking-wide uppercase">AI QUICK START:</span>
            <div className="flex flex-col gap-2">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="text-left text-xs p-3 rounded-xl bg-[#1E2235] border border-[#282E47] hover:border-[#D2FF24] text-[#8F9BB3] hover:text-white font-semibold transition-all line-clamp-1 cursor-pointer"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#EF4444]/10 text-[#EF4444] text-xs font-bold border border-[#EF4444]/20">
              {error}
            </div>
          )}

          {/* Action trigger */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#D2FF24] hover:scale-102 hover:shadow-[0_0_20px_rgba(210,255,36,0.3)] disabled:opacity-50 text-[#0F111A] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0F111A]" />
                  <span>AI가 최적 칼로리 및 영양 분석 중...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4" />
                  <span>AI 레시피 즉시 만들기</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
