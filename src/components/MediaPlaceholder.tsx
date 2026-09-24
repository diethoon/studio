import React from "react";
import { Flame } from "lucide-react";

interface MediaPlaceholderProps {
  title: string;
  eyebrow?: string;
  className?: string;
}

export const MediaPlaceholder: React.FC<MediaPlaceholderProps> = ({
  title,
  eyebrow = "CORE RECIPE",
  className = "",
}) => {
  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#141725] flex flex-col justify-between p-5 border border-[#282E47] ${className}`}
    >
      {/* Decorative neon linear grid and circles */}
      <div className="absolute right-[-10%] top-[-10%] w-48 h-48 rounded-full border border-[#D2FF24]/20 pointer-events-none" />
      <div className="absolute right-[10%] top-[20%] w-24 h-24 rounded-full bg-[#D2FF24]/5 pointer-events-none blur-xl" />
      <div className="absolute left-[-20px] bottom-[-20px] w-28 h-28 rounded-full border border-dashed border-[#8F9BB3]/20 pointer-events-none" />

      {/* Top row */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[9px] font-black tracking-[0.25em] text-[#D2FF24] uppercase">
          {eyebrow}
        </span>
        <Flame className="w-3.5 h-3.5 text-[#D2FF24] fill-[#D2FF24]" />
      </div>

      {/* Title block */}
      <div className="relative z-10">
        <h4 className="font-space text-white font-bold text-base sm:text-lg leading-snug line-clamp-2">
          {title}
        </h4>
      </div>
    </div>
  );
};
