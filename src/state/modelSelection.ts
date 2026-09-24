import { useState, useEffect } from "react";

export type GeminiModel =
  | "gemini-3.1-flash-lite"
  | "gemini-3.5-flash-lite"
  | "gemini-3.6-flash"
  | "gemini-3.7-flash"
  | "gemini-3.8-flash";

const DEFAULT_MODEL: GeminiModel = "gemini-3.8-flash";

export const useModelSelection = () => {
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(() => {
    const saved = localStorage.getItem("diet_gemini_model");
    if (
      saved === "gemini-3.1-flash-lite" ||
      saved === "gemini-3.5-flash-lite" ||
      saved === "gemini-3.6-flash" ||
      saved === "gemini-3.7-flash" ||
      saved === "gemini-3.8-flash"
    ) {
      return saved as GeminiModel;
    }
    return DEFAULT_MODEL;
  });

  const changeModel = (model: GeminiModel) => {
    setSelectedModel(model);
    localStorage.setItem("diet_gemini_model", model);
  };

  return { selectedModel, changeModel };
};
