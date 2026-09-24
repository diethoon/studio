import React from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${className}`}>
      <div className="space-y-1.5">
        {eyebrow && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-sm bg-[#D2FF24] animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.2em] text-[#D2FF24] uppercase font-space">
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="font-space text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm font-semibold text-[#8F9BB3] max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
