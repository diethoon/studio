import React from "react";
import type { Category } from "@/src/types/domain";

interface CategoryListProps {
  categories: Category[];
  selectedId?: string | null;
  onSelect?: (category: Category) => void;
  className?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedId = null,
  onSelect,
  className = "",
}) => {
  if (categories.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 py-1 ${className}`}>
      {categories.map((category) => {
        const isSelected = selectedId === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect?.(category)}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer select-none active:scale-95 ${
              isSelected
                ? "bg-[#D2FF24] text-[#0F111A] shadow-[0_0_15px_rgba(210,255,36,0.25)] border-none"
                : "bg-[#1E2235] border border-[#282E47] text-[#8F9BB3] hover:border-[#D2FF24]/60 hover:text-white"
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
};
