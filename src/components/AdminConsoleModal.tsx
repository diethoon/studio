import React, { useState, useEffect } from "react";
import { repository, type StudioSettings } from "@/src/data/repository";
import type { Recipe, RecipeIngredient, RecipeInstruction } from "@/src/types/domain";
import { X, Plus, Trash2, Edit3, Sparkles, Loader2, Save, HelpCircle, Settings } from "lucide-react";
import { useModelSelection } from "@/src/state/modelSelection";

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshNeeded: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  onRefreshNeeded,
}) => {
  const { selectedModel } = useModelSelection();
  const [activeTab, setActiveTab] = useState<"recipes" | "settings">("recipes");
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recipe Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servingCount, setServingCount] = useState(1);
  const [cookingTime, setCookingTime] = useState(15);
  const [difficulty, setDifficulty] = useState("easy");
  const [ingredients, setIngredients] = useState<{ name: string; amount: string; unit: string }[]>([
    { name: "닭가슴살", amount: "150", unit: "g" },
  ]);
  const [instructions, setInstructions] = useState<string[]>([
    "닭가슴살을 얇게 썰어 소금과 후추로 밑간을 합니다.",
    "팬에 기름을 살짝 두르고 노릇하게 굽습니다.",
  ]);

  // Studio Settings Fields
  const [heroEyebrow, setHeroEyebrow] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [specialEyebrow, setSpecialEyebrow] = useState("");
  const [specialTitle, setSpecialTitle] = useState("");
  const [specialDesc, setSpecialDesc] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadRecipes();
      loadSettings();
    }
  }, [isOpen]);

  const loadRecipes = async () => {
    const list = await repository.getAllRecipes();
    setRecipes(list);
  };

  const loadSettings = async () => {
    const s = await repository.getSettings();
    setHeroEyebrow(s.heroEyebrow);
    setHeroTitle(s.heroTitle);
    setHeroSubtitle(s.heroSubtitle);
    setSpecialEyebrow(s.specialEyebrow || "");
    setSpecialTitle(s.specialTitle || "");
    setSpecialDesc(s.specialDesc || "");
  };

  if (!isOpen) return null;

  const handleAddIngredientRow = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const handleRemoveIngredientRow = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleAddInstructionRow = () => {
    setInstructions([...instructions, ""]);
  };

  const handleRemoveInstructionRow = (idx: number) => {
    setInstructions(instructions.filter((_, i) => i !== idx));
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm("정말 이 레시피를 삭제하시겠습니까?")) return;
    await repository.deleteRecipe(id);
    await loadRecipes();
    onRefreshNeeded();
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("레시피 제목과 설명을 적어주세요.");
      return;
    }

    setTranslating(true);
    setError(null);

    try {
      const recipeIngredients: RecipeIngredient[] = ingredients
        .filter((ing) => ing.name.trim() !== "")
        .map((ing) => ({
          ingredientId: ing.name.trim(),
          amount: parseFloat(ing.amount) || null,
          unit: ing.unit.trim() || null,
          preparationNote: null,
          optional: false,
        }));

      const baseInstructions: RecipeInstruction[] = instructions
        .filter((inst) => inst.trim() !== "")
        .map((text, idx) => ({
          step: idx + 1,
          text: text.trim(),
        }));

      const transPayload = {
        title: title.trim(),
        description: description.trim(),
        instructions: baseInstructions,
        model: selectedModel,
      };

      const res = await fetch("/api/gemini/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transPayload),
      });

      if (!res.ok) {
        throw new Error("서버 AI 자동 번역에 실패했습니다.");
      }

      const transData = await res.json();

      const newRecipe: Recipe = {
        id: `recipe-custom-${Date.now()}`,
        title: title.trim(),
        titles: transData.titles,
        description: description.trim(),
        descriptions: transData.descriptions,
        heroMediaUrl: "/src/assets/images/hip_poke_bowl_1790230085855.jpg",
        servingCount,
        cookingTimeMinutes: cookingTime,
        difficulty,
        nutrition: {
          basis: "per_serving",
          quality: "estimated",
          source: "AI Auto-Calculated",
          facts: [
            { code: "energy", label: "Calories", value: 340, unit: "kcal" },
            { code: "protein", label: "Protein", value: 24, unit: "g" },
            { code: "carbohydrate", label: "Carbs", value: 18, unit: "g" },
            { code: "fat", label: "Fat", value: 8, unit: "g" }
          ]
        },
        ingredients: recipeIngredients,
        instructions: baseInstructions.map((inst) => {
          const transStep = transData.instructions.find((ts: any) => ts.step === inst.step);
          return {
            ...inst,
            texts: transStep ? transStep.texts : { ko: inst.text, en: inst.text, ja: inst.text, zh: inst.text }
          };
        }),
        categoryIds: ["cat-weight"],
        tagIds: ["custom-added"],
        status: "published",
      };

      await repository.addCustomRecipe(newRecipe);
      await loadRecipes();

      // Reset Form
      setTitle("");
      setDescription("");
      setIngredients([{ name: "", amount: "", unit: "" }]);
      setInstructions([""]);
      onRefreshNeeded();
      alert("레시피가 Gemini AI를 통해 4개국어로 번역되어 성공적으로 등록되었습니다!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "레시피 등록 중 오류가 발생했습니다.");
    } finally {
      setTranslating(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroTitle.trim() || !heroSubtitle.trim()) {
      setError("메인 제목과 한줄 서브타이틀을 입력해주세요.");
      return;
    }

    setTranslating(true);
    setError(null);

    try {
      const payload = {
        heroEyebrow: heroEyebrow.trim(),
        heroTitle: heroTitle.trim(),
        heroSubtitle: heroSubtitle.trim(),
        specialEyebrow: specialEyebrow.trim(),
        specialTitle: specialTitle.trim(),
        specialDesc: specialDesc.trim(),
        model: selectedModel,
      };

      const res = await fetch("/api/gemini/translate_settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("스튜디오 메인 문구 번역에 실패했습니다.");
      }

      const transData = await res.json();

      await repository.saveSettings({
        heroEyebrow: heroEyebrow.trim(),
        heroEyebrows: transData.heroEyebrows,
        heroTitle: heroTitle.trim(),
        heroTitles: transData.heroTitles,
        heroSubtitle: heroSubtitle.trim(),
        heroSubtitles: transData.heroSubtitles,
        specialEyebrow: specialEyebrow.trim(),
        specialEyebrows: transData.specialEyebrows,
        specialTitle: specialTitle.trim(),
        specialTitles: transData.specialTitles,
        specialDesc: specialDesc.trim(),
        specialDescs: transData.specialDescs,
      });

      onRefreshNeeded();
      alert("스튜디오 메인 문구 및 테마 텍스트가 Gemini AI를 통해 4개국어(KO, EN, JA, ZH)로 자동 번역 완료되어 즉시 업데이트되었습니다!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "스튜디오 설정 저장 중 오류가 발생했습니다.");
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F111A]/95 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#141725] border border-[#282E47] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 flex flex-col max-h-[90vh] my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#282E47] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D2FF24] text-[#0F111A] flex items-center justify-center font-bold">
              <Settings className="w-5 h-5 text-[#0F111A]" />
            </div>
            <div>
              <h2 className="font-space text-xl font-bold text-white uppercase tracking-wider">STUDIO CONSOLE</h2>
              <p className="text-xs text-[#8F9BB3]">관리자 제어반 · Gemini AI 실시간 번역 전속 연동</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#282E47] hover:bg-[#D2FF24] hover:text-[#0F111A] flex items-center justify-center text-white cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-[#282E47] pb-1 shrink-0">
          <button
            onClick={() => {
              setActiveTab("recipes");
              setError(null);
            }}
            className={`px-4 py-2 rounded-t-xl text-xs font-black tracking-wider transition-all cursor-pointer ${
              activeTab === "recipes"
                ? "bg-[#1E2235] text-[#D2FF24] border-b-2 border-[#D2FF24]"
                : "text-[#8F9BB3] hover:text-white"
            }`}
          >
            RECIPES MANAGER (레시피 관리)
          </button>
          <button
            onClick={() => {
              setActiveTab("settings");
              setError(null);
            }}
            className={`px-4 py-2 rounded-t-xl text-xs font-black tracking-wider transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#1E2235] text-[#D2FF24] border-b-2 border-[#D2FF24]"
                : "text-[#8F9BB3] hover:text-white"
            }`}
          >
            STUDIO TEXTS (메인 타이틀 설정)
          </button>
        </div>

        {/* Dynamic Content Frame */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === "recipes" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Form: Add Recipe */}
              <form onSubmit={handleSaveRecipe} className="lg:col-span-7 space-y-6">
                <div className="border-b border-[#282E47] pb-2">
                  <h3 className="font-space text-sm font-bold text-[#D2FF24] uppercase tracking-wider">
                    새 건강 레시피 등록
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">레시피 제목</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="예: 초간단 구운 두부 버섯 샐러드"
                      className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-white text-sm outline-none focus:border-[#D2FF24] font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">한줄 설명</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="예: 촉촉하고 바삭하게 구워낸 두부와 버섯의 단백질 가득한 식단입니다."
                      rows={2}
                      className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-white text-sm outline-none focus:border-[#D2FF24] font-semibold resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">인분수 (P)</label>
                      <input
                        type="number"
                        value={servingCount}
                        onChange={(e) => setServingCount(parseInt(e.target.value) || 1)}
                        className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-white text-sm outline-none focus:border-[#D2FF24] font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">시간 (분)</label>
                      <input
                        type="number"
                        value={cookingTime}
                        onChange={(e) => setCookingTime(parseInt(e.target.value) || 15)}
                        className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-white text-sm outline-none focus:border-[#D2FF24] font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">난이도</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-[#D2FF24] text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="easy">EASY</option>
                        <option value="medium">MEDIUM</option>
                        <option value="hard">HARD</option>
                      </select>
                    </div>
                  </div>

                  {/* Ingredients input list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">필요 재료</label>
                      <button
                        type="button"
                        onClick={handleAddIngredientRow}
                        className="text-xs font-bold text-[#D2FF24] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> 행 추가
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {ingredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="재료명"
                            value={ing.name}
                            onChange={(e) => {
                              const next = [...ingredients];
                              next[idx].name = e.target.value;
                              setIngredients(next);
                            }}
                            className="flex-1 p-2.5 rounded-lg bg-[#1E2235] border border-[#282E47] text-white text-xs outline-none"
                          />
                          <input
                            type="text"
                            placeholder="양 (숫자)"
                            value={ing.amount}
                            onChange={(e) => {
                              const next = [...ingredients];
                              next[idx].amount = e.target.value;
                              setIngredients(next);
                            }}
                            className="w-20 p-2.5 rounded-lg bg-[#1E2235] border border-[#282E47] text-white text-xs outline-none"
                          />
                          <input
                            type="text"
                            placeholder="단위"
                            value={ing.unit}
                            onChange={(e) => {
                              const next = [...ingredients];
                              next[idx].unit = e.target.value;
                              setIngredients(next);
                            }}
                            className="w-16 p-2.5 rounded-lg bg-[#1E2235] border border-[#282E47] text-white text-xs outline-none"
                          />
                          <button
                            type="button"
                            disabled={ingredients.length <= 1}
                            onClick={() => handleRemoveIngredientRow(idx)}
                            className="text-[#EF4444] hover:bg-[#EF4444]/10 p-2 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions input list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">조리 방법 순서</label>
                      <button
                        type="button"
                        onClick={handleAddInstructionRow}
                        className="text-xs font-bold text-[#D2FF24] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> 단계 추가
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {instructions.map((inst, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded bg-[#282E47] text-xs font-black text-[#D2FF24] flex items-center justify-center shrink-0 mt-2">
                            {idx + 1}
                          </span>
                          <textarea
                            value={inst}
                            onChange={(e) => {
                              const next = [...instructions];
                              next[idx] = e.target.value;
                              setInstructions(next);
                            }}
                            placeholder="조리 방법 내용을 적어주세요."
                            rows={1}
                            className="flex-1 p-2.5 rounded-lg bg-[#1E2235] border border-[#282E47] text-white text-xs outline-none resize-none"
                          />
                          <button
                            type="button"
                            disabled={instructions.length <= 1}
                            onClick={() => handleRemoveInstructionRow(idx)}
                            className="text-[#EF4444] hover:bg-[#EF4444]/10 p-2 rounded-lg mt-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-[#EF4444]/10 text-[#EF4444] text-xs font-bold border border-[#EF4444]/20">
                      {error}
                    </div>
                  )}

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={translating}
                    className="w-full py-4 rounded-xl bg-[#D2FF24] hover:shadow-[0_0_20px_rgba(210,255,36,0.3)] text-[#0F111A] text-sm font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {translating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gemini AI {selectedModel} 번역 설계 기동중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>AI 4개국어 번역 동시 저장하기</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Right Column: List of existing recipes */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border-b border-[#282E47] pb-2">
                  <h3 className="font-space text-sm font-bold text-[#8F9BB3] uppercase tracking-wider">
                    현재 등록된 레시피 목록 ({recipes.length})
                  </h3>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {recipes.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#1E2235] border border-[#282E47] flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="text-white text-sm font-bold line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-[#8F9BB3] line-clamp-1">{item.description}</p>
                        <div className="flex items-center gap-1">
                          {item.titles ? (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#D2FF24]/10 text-[#D2FF24] border border-[#D2FF24]/20">
                              AI MULTILINGUAL (4개국어 완비)
                            </span>
                          ) : (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/5 text-[#8F9BB3]">
                              DEFAULT LANGUAGE
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteRecipe(item.id)}
                        className="p-2 rounded-xl bg-[#282E47] hover:bg-[#EF4444] text-[#8F9BB3] hover:text-white cursor-pointer transition-colors animate-pulse-slow"
                        title="레시피 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Tab: Customize Studio General Texts */
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl mx-auto">
              <div className="border-b border-[#282E47] pb-2">
                <h3 className="font-space text-sm font-bold text-[#D2FF24] uppercase tracking-wider">
                  메인 홍보 문구 & 스페셜 타겟 수정
                </h3>
                <p className="text-xs text-[#8F9BB3] mt-1">
                  이곳에서 문구를 한글로 입력하면 Gemini AI가 즉시 영문, 일문, 중문으로 초정밀 현지 번역하여 각 언어별 설정에 동적 노출됩니다!
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">히어로 작은 분류 태그 (Eyebrow)</label>
                    <input
                      type="text"
                      value={heroEyebrow}
                      onChange={(e) => setHeroEyebrow(e.target.value)}
                      placeholder="예: EAT SMART · TRAIN HARD · LIVE HIP"
                      className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-white text-sm outline-none focus:border-[#D2FF24] font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">메인 타이틀 문구 (Hero Title)</label>
                    <input
                      type="text"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="예: 식단도 힙하고 스마트하게."
                      className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-white text-sm outline-none focus:border-[#D2FF24] font-bold text-[#D2FF24]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">서브 한줄 요약 문구 (Hero Subtitle)</label>
                  <textarea
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="예: 부담스럽고 유치한 레시피는 가라! 고단백, 저탄수, 타겟팅 칼로리를 충족하는 검증된 MZ 전용 헬시 식단 스튜디오입니다."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-white text-sm outline-none focus:border-[#D2FF24] font-semibold resize-none"
                  />
                </div>

                <div className="border-t border-[#282E47] pt-4 my-2">
                  <h4 className="text-xs font-black tracking-widest text-[#8F9BB3] uppercase mb-3">
                    우측 피처 카드 설정 (Today's Special Card)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">분류 소제목</label>
                      <input
                        type="text"
                        value={specialEyebrow}
                        onChange={(e) => setSpecialEyebrow(e.target.value)}
                        placeholder="예: TODAY'S SPECIAL"
                        className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-white text-sm outline-none focus:border-[#D2FF24] font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">요리명 타이틀</label>
                      <input
                        type="text"
                        value={specialTitle}
                        onChange={(e) => setSpecialTitle(e.target.value)}
                        placeholder="예: Seongsu Cyber Poke Bowl"
                        className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-white text-sm outline-none focus:border-[#D2FF24] font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-wider text-[#8F9BB3] uppercase">요리 요약 정보</label>
                  <input
                    type="text"
                    value={specialDesc}
                    onChange={(e) => setSpecialDesc(e.target.value)}
                    placeholder="예: 단백질 32g, 410kcal로 조율된 완벽한 애프터워크 식단"
                    className="w-full p-3 rounded-xl bg-[#1E2235] border border-[#282E47] text-white text-sm outline-none focus:border-[#D2FF24] font-semibold"
                  />
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-[#EF4444]/10 text-[#EF4444] text-xs font-bold border border-[#EF4444]/20">
                    {error}
                  </div>
                )}

                {/* Submit button for Settings */}
                <button
                  type="submit"
                  disabled={translating}
                  className="w-full py-4 rounded-xl bg-[#D2FF24] hover:shadow-[0_0_20px_rgba(210,255,36,0.3)] text-[#0F111A] text-sm font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {translating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini {selectedModel}이(가) 스튜디오 4개국어 카피라이팅 설계중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI 번역 가동 & 스튜디오 문구 전면 저장</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
