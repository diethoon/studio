import React, { useState, useEffect, useCallback } from "react";
import type { Category, Recipe } from "@/src/types/domain";
import { repository, type StudioSettings } from "@/src/data/repository";
import { Navbar } from "@/src/components/Navbar";
import { SearchField } from "@/src/components/SearchField";
import { CategoryList } from "@/src/components/CategoryList";
import { SectionHeading } from "@/src/components/SectionHeading";
import { RecipeCard } from "@/src/components/RecipeCard";
import { RecipeRail } from "@/src/components/RecipeRail";
import { RecipeDetailModal } from "@/src/components/RecipeDetailModal";
import { AiRecipeGeneratorModal } from "@/src/components/AiRecipeGeneratorModal";
import { AdminConsoleModal } from "@/src/components/AdminConsoleModal";
import { useSavedRecipes } from "@/src/state/savedRecipes";
import { useI18n } from "@/src/i18n";
import { Sparkles, Utensils, RefreshCw, ChefHat, Filter, Heart, ArrowRight, Flame } from "lucide-react";

export default function App() {
  const { lang, t } = useI18n();
  const { savedRecipeIds } = useSavedRecipes();
  const [activeTab, setActiveTab] = useState<"home" | "search" | "saved">("home");
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);

  // Saved recipes list
  const [savedRecipesList, setSavedRecipesList] = useState<Recipe[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Modals
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [nextCategories, nextRecipes, nextSettings] = await Promise.all([
        repository.listCategories(),
        repository.searchRecipes({ limit: 24 }),
        repository.getSettings(),
      ]);
      setCategories(nextCategories);
      setRecipes(nextRecipes);
      setStudioSettings(nextSettings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Load Saved Recipes whenever savedRecipeIds change
  useEffect(() => {
    let isMounted = true;
    async function fetchSaved() {
      if (savedRecipeIds.length === 0) {
        setSavedRecipesList([]);
        return;
      }
      setSavedLoading(true);
      const loaded = await Promise.all(
        savedRecipeIds.map((id) => repository.getRecipeById(id))
      );
      if (isMounted) {
        setSavedRecipesList(loaded.filter((r): r is Recipe => r != null));
        setSavedLoading(false);
      }
    }
    void fetchSaved();
    return () => {
      isMounted = false;
    };
  }, [savedRecipeIds]);

  // Handle Search Input Submit
  const handleSearchSubmit = (text: string) => {
    setSearchQuery(text);
    setActiveTab("search");
    performSearch(text, selectedCategoryId);
  };

  const performSearch = async (text: string, catId: string | null) => {
    setLoading(true);
    try {
      const results = await repository.searchRecipes({
        text: text,
        categoryIds: catId ? [catId] : undefined,
        limit: 30,
      });
      setRecipes(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    const nextCatId = selectedCategoryId === category.id ? null : category.id;
    setSelectedCategoryId(nextCatId);
    if (activeTab === "search" || searchQuery.trim()) {
      performSearch(searchQuery, nextCatId);
    }
  };

  const rootCategories = categories.filter((cat) => cat.parentIds.length === 0);
  const childCategories = selectedCategoryId
    ? categories.filter((cat) => cat.parentIds.includes(selectedCategoryId))
    : [];

  const handleRecipeCreated = (newRecipe: Recipe) => {
    void loadData();
    setSelectedRecipeId(newRecipe.id);
  };

  const featuredRecipes = recipes.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0F111A] text-white font-sans flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenAiGenerator={() => setIsAiModalOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === "home") {
            setSearchQuery("");
            setSelectedCategoryId(null);
            void loadData();
          }
        }}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-16">
        {activeTab === "home" ? (
          <>
            {/* Hip Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D2FF24] animate-pulse" />
                    <span className="text-[#D2FF24] text-[10px] font-black tracking-[0.25em] uppercase font-space">
                      {studioSettings?.heroEyebrows?.[lang] || studioSettings?.heroEyebrow || "EAT SMART · TRAIN HARD · LIVE HIP"}
                    </span>
                  </div>
                  <h1 className="font-space text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                    {studioSettings?.heroTitles?.[lang] || studioSettings?.heroTitle || "식단도 힙하고 스마트하게"}<span className="text-[#D2FF24]">.</span>
                  </h1>
                  <p className="text-[#8F9BB3] text-sm sm:text-base font-semibold leading-relaxed max-w-xl">
                    {studioSettings?.heroSubtitles?.[lang] || studioSettings?.heroSubtitle || "부담스럽고 유치한 레시피는 가라! 고단백, 저탄수, 타겟팅 칼로리를 충족하는 검증된 MZ 전용 헬시 식단 스튜디오입니다."}
                  </p>
                </div>

                {/* Cyber Search Field */}
                <div className="max-w-xl">
                  <SearchField
                    initialValue={searchQuery}
                    onSubmit={handleSearchSubmit}
                    onChange={(val) => setSearchQuery(val)}
                    placeholder="닭가슴살, 연어, 두부 등 헬시 키워드 검색"
                  />
                </div>

                {/* Modern Category List */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#8F9BB3] uppercase tracking-wider font-space">
                      SELECT YOUR TARGET
                    </span>
                    {selectedCategoryId && (
                      <button
                        onClick={() => {
                          setSelectedCategoryId(null);
                          void loadData();
                        }}
                        className="text-xs font-bold text-[#D2FF24] hover:underline cursor-pointer"
                      >
                        RESET FILTER
                      </button>
                    )}
                  </div>

                  <CategoryList
                    categories={rootCategories}
                    selectedId={selectedCategoryId}
                    onSelect={handleCategorySelect}
                  />

                  {selectedCategoryId && childCategories.length > 0 && (
                    <div className="pt-2 pl-3 border-l-2 border-[#D2FF24] animate-fade-in">
                      <CategoryList
                        categories={childCategories}
                        onSelect={(cat) => {
                          setActiveTab("search");
                          performSearch(searchQuery, cat.id);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Hip Culinary Feature Image */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#282E47] aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] group">
                  <img
                    src="/src/assets/images/hip_poke_bowl_1790230085855.jpg"
                    alt="Hip Salmon Avocado Poke Bowl"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-[#0F111A]/20 to-transparent flex flex-col justify-end p-6 space-y-1.5">
                    <span className="text-[9px] font-black tracking-[0.25em] text-[#D2FF24] uppercase font-space">
                      {studioSettings?.specialEyebrows?.[lang] || studioSettings?.specialEyebrow || "TODAY'S SPECIAL"}
                    </span>
                    <h3 className="font-space text-2xl font-bold text-white">
                      {studioSettings?.specialTitles?.[lang] || studioSettings?.specialTitle || "Seongsu Cyber Poke Bowl"}
                    </h3>
                    <p className="text-xs text-[#8F9BB3] font-semibold">
                      {studioSettings?.specialDescs?.[lang] || studioSettings?.specialDesc || "단백질 32g, 410kcal로 조율된 완벽한 애프터워크 식단"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Recipe Rail */}
            {recipes.length > 0 && (
              <section className="space-y-6">
                <SectionHeading
                  eyebrow="TRENDING NOW"
                  title="지금 세대의 원픽 식재료 레시피"
                  description="칼로리는 낮추고 감각은 한 차원 더 끌어올린 하이 퀄리티 밀킷 가이드"
                />
                <RecipeRail
                  recipes={featuredRecipes}
                  onPress={(r) => setSelectedRecipeId(r.id)}
                />
              </section>
            )}

            {/* Cyber AI Culinary Chef Banner */}
            <section className="relative rounded-3xl overflow-hidden border border-[#282E47] bg-[#141725] shadow-2xl grid grid-cols-1 md:grid-cols-12 items-center">
              <div className="p-8 sm:p-10 md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#D2FF24]/10 text-[#D2FF24] text-[10px] font-black font-space border border-[#D2FF24]/20 tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CYBER CHEF INSTANT ENGINE</span>
                </div>
                <h3 className="font-space text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  냉장고 털어서<br />프로틴 밸런스 설계하기
                </h3>
                <p className="text-[#8F9BB3] text-xs sm:text-sm leading-relaxed font-semibold">
                  가지고 계신 남은 재료나 선호하는 타겟 칼로리만 선언해보세요. Gemini AI 알고리즘이 영양 성분 매크로와 조리법 단계를 즉석에서 계산해 드립니다.
                </p>
                <div>
                  <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="px-6 py-3.5 rounded-xl bg-[#D2FF24] hover:shadow-[0_0_20px_rgba(210,255,36,0.3)] text-[#0F111A] font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>AI 커스텀 엔진 런칭</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="md:col-span-5 h-full min-h-[260px] relative">
                <img
                  src="/src/assets/images/cyber_ingredients_1790230098996.jpg"
                  alt="Cyber high-tech ingredients"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </section>

            {/* Main Catalog Grid */}
            <section className="space-y-6">
              <SectionHeading
                eyebrow={t("home.explore")}
                title={t("home.recipesNow")}
                description={t("home.catalogDescription")}
                action={
                  <button
                    onClick={() => void loadData()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E2235] border border-[#282E47] hover:border-[#D2FF24] text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#8F9BB3]" />
                    <span>{t("home.refresh")}</span>
                  </button>
                }
              />

              {loading ? (
                <div className="min-h-[280px] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#D2FF24] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recipes.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-3xl bg-[#1E2235] border border-[#282E47] text-center space-y-4 shadow-sm">
                  <Utensils className="w-10 h-10 text-[#8F9BB3] mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <h3 className="font-space text-2xl font-bold text-white">{t("home.noRecipes")}</h3>
                    <p className="text-[#8F9BB3] text-sm">
                      {t("home.connectRepository")}
                    </p>
                  </div>
                  <button
                    onClick={() => void loadData()}
                    className="px-5 py-2.5 rounded-xl bg-[#D2FF24] text-[#0F111A] text-xs font-black"
                  >
                    {t("home.refresh")}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onPress={(r) => setSelectedRecipeId(r.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : activeTab === "search" ? (
          /* Search view */
          <section className="space-y-8">
            <div className="space-y-4 max-w-2xl mx-auto">
              <SearchField
                initialValue={searchQuery}
                placeholder={t("search.placeholder")}
                onSubmit={(text) => {
                  setSearchQuery(text);
                  performSearch(text, selectedCategoryId);
                }}
                onChange={(text) => {
                  setSearchQuery(text);
                  performSearch(text, selectedCategoryId);
                }}
              />

              {/* Category selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-center">
                <span className="text-[10px] font-black text-[#8F9BB3] uppercase shrink-0 flex items-center gap-1 font-space">
                  <Filter className="w-3.5 h-3.5" /> FILTER:
                </span>
                <CategoryList
                  categories={rootCategories}
                  selectedId={selectedCategoryId}
                  onSelect={handleCategorySelect}
                />
              </div>
            </div>

            <div className="space-y-2 border-b border-[#282E47] pb-4">
              <h2 className="font-space text-2xl font-bold text-white">
                {searchQuery || selectedCategoryId ? t("search.results") : t("search.title")}
              </h2>
              {searchQuery && (
                <p className="text-sm font-semibold text-[#8F9BB3]">
                  {t("search.forQuery", { query: searchQuery })} ({recipes.length})
                </p>
              )}
            </div>

            {loading ? (
              <div className="min-h-[280px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#D2FF24] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recipes.length === 0 ? (
              <div className="py-16 text-center space-y-4 bg-[#1E2235] rounded-3xl border border-[#282E47] shadow-sm max-w-lg mx-auto">
                <h3 className="font-space text-2xl font-bold text-white">{t("search.noMatching")}</h3>
                <p className="text-[#8F9BB3] text-sm font-medium">
                  {t("search.repositorySource")}
                </p>
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#D2FF24] text-[#0F111A] text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 즉시 레시피 빌더 가동</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onPress={(r) => setSelectedRecipeId(r.id)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Saved view */
          <section className="space-y-8">
            <div className="space-y-2 border-b border-[#282E47] pb-6">
              <h1 className="font-space text-3xl font-extrabold text-white flex items-center gap-3">
                <Heart className="w-8 h-8 fill-[#D2FF24] text-[#D2FF24]" />
                <span>SAVED RECIPES</span>
              </h1>
              <p className="text-[#8F9BB3] text-sm font-semibold leading-relaxed max-w-xl">
                {t("saved.description")}
              </p>
            </div>

            {savedLoading ? (
              <div className="min-h-[280px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#D2FF24] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : savedRecipesList.length === 0 ? (
              <div className="py-16 px-6 text-center space-y-4 bg-[#1E2235] rounded-3xl border border-[#282E47] shadow-sm max-w-xl mx-auto">
                <Heart className="w-10 h-10 text-[#282E47] mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-space text-xl font-bold text-white">{t("saved.emptyTitle")}</h3>
                  <p className="text-[#8F9BB3] text-xs leading-relaxed font-semibold">
                    {t("saved.emptyDescription")}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("home")}
                  className="px-6 py-3 rounded-xl bg-[#D2FF24] text-[#0F111A] text-xs font-black transition-all cursor-pointer"
                >
                  EXPLORE RECIPES
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedRecipesList.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onPress={(r) => setSelectedRecipeId(r.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Cyber Minimalist Footer */}
      <footer className="mt-20 border-t border-[#282E47] bg-[#0F111A] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8F9BB3] font-bold">
          <span className="font-space text-lg font-black text-white">DIET_STUDIO<span className="text-[#D2FF24]">.</span></span>
          <p>© 2026 Diet Recipe Studio. Next-gen Nutrition Guide.</p>
          <div className="flex items-center gap-4">
            <span>Powered by Google AI Studio</span>
          </div>
        </div>
      </footer>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipeId={selectedRecipeId}
        onClose={() => setSelectedRecipeId(null)}
      />

      {/* AI Recipe Generator Modal */}
      <AiRecipeGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onRecipeCreated={handleRecipeCreated}
      />

      {/* Admin Console Modal */}
      <AdminConsoleModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshNeeded={loadData}
      />
    </div>
  );
}
