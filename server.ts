import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize server-side Gemini client
  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Helper to map and validate requested model names to supported Gemini endpoints safely
  function getModelName(requestedModel: string | undefined): string {
    // Avoid legacy 2.5 models; default to gemini-3.5-flash or requested model exactly
    return requestedModel || 'gemini-3.5-flash';
  }

  // Server-Side endpoint for recipe generation
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, model } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const targetModel = getModelName(model);

      const recipeSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "레시피 제목 (한국어)" },
          description: { type: Type.STRING, description: "레시피의 짧은 설명" },
          servingCount: { type: Type.INTEGER, description: "몇 인분인지 (기본 1)" },
          cookingTimeMinutes: { type: Type.INTEGER, description: "조리 시간 (분 단위)" },
          difficulty: { type: Type.STRING, description: "난이도 (easy, medium, hard 중 하나)" },
          nutrition: {
            type: Type.OBJECT,
            properties: {
              basis: { type: Type.STRING, description: "per_serving" },
              quality: { type: Type.STRING, description: "estimated" },
              facts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    code: { type: Type.STRING, description: "energy, protein, carbohydrate, fat, fiber" },
                    label: { type: Type.STRING, description: "Calories, Protein, Carbs, Fat, Fiber" },
                    value: { type: Type.NUMBER, description: "숫자 값" },
                    unit: { type: Type.STRING, description: "kcal, g 등" }
                  },
                  required: ["code", "label", "value", "unit"]
                }
              }
            },
            required: ["basis", "quality", "facts"]
          },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ingredientId: { type: Type.STRING, description: "재료 식별자 또는 이름 (예: 계란 또는 ing-egg)" },
                amount: { type: Type.NUMBER, description: "양 (숫자)" },
                unit: { type: Type.STRING, description: "단위 (g, 개, 스푼 등)" },
                preparationNote: { type: Type.STRING, description: "손질 메모 또는 null" },
                optional: { type: Type.BOOLEAN, description: "선택 재료 여부" }
              },
              required: ["ingredientId", "amount", "unit", "optional"]
            }
          },
          instructions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.INTEGER, description: "단계 번호 (1, 2, 3...)" },
                text: { type: Type.STRING, description: "조리 방법 설명" }
              },
              required: ["step", "text"]
            }
          }
        },
        required: [
          "title",
          "description",
          "servingCount",
          "cookingTimeMinutes",
          "difficulty",
          "nutrition",
          "ingredients",
          "instructions"
        ]
      };

      const systemInstruction =
        "당신은 감각적이고 건강한 다이어트 및 식단 맞춤형 레시피를 개발하는 수석 셰프 겸 영양사입니다. 사용자의 요청(보유 재료, 건강 목표, 식단 조건 등)을 반영하여 영양성분이 균형 잡히고 맛있는 건강 레시피를 정확한 JSON 구조로 생성하세요.";

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: recipeSchema,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Failed to receive content from Gemini model.");
      }

      // Automatically translate the generated recipe content for 4-language support as well!
      const generatedJSON = JSON.parse(responseText);
      
      // Attempt an auto-translation of this generated recipe immediately to fill titles, descriptions, and instructions
      try {
        const translationPrompt = `Translate the following recipe details into ko (Korean), en (English), ja (Japanese), and zh (Simplified Chinese).
Title: ${generatedJSON.title}
Description: ${generatedJSON.description}
Instructions:
${generatedJSON.instructions.map((inst: any) => `Step ${inst.step}: ${inst.text}`).join('\n')}`;

        const translateSchema = {
          type: Type.OBJECT,
          properties: {
            titles: {
              type: Type.OBJECT,
              properties: {
                ko: { type: Type.STRING },
                en: { type: Type.STRING },
                ja: { type: Type.STRING },
                zh: { type: Type.STRING }
              },
              required: ["ko", "en", "ja", "zh"]
            },
            descriptions: {
              type: Type.OBJECT,
              properties: {
                ko: { type: Type.STRING },
                en: { type: Type.STRING },
                ja: { type: Type.STRING },
                zh: { type: Type.STRING }
              },
              required: ["ko", "en", "ja", "zh"]
            },
            instructions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  texts: {
                    type: Type.OBJECT,
                    properties: {
                      ko: { type: Type.STRING },
                      en: { type: Type.STRING },
                      ja: { type: Type.STRING },
                      zh: { type: Type.STRING }
                    },
                    required: ["ko", "en", "ja", "zh"]
                  }
                },
                required: ["step", "texts"]
              }
            }
          },
          required: ["titles", "descriptions", "instructions"]
        };

        const translationResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: translationPrompt,
          config: {
            systemInstruction: "You are a professional food and recipe translator. Render natural, appealing translations for all 4 languages (ko, en, ja, zh). Return JSON match.",
            responseMimeType: "application/json",
            responseSchema: translateSchema
          }
        });

        if (translationResponse.text) {
          const transResult = JSON.parse(translationResponse.text);
          generatedJSON.titles = transResult.titles;
          generatedJSON.descriptions = transResult.descriptions;
          generatedJSON.instructions = generatedJSON.instructions.map((item: any) => {
            const transStep = transResult.instructions.find((ts: any) => ts.step === item.step);
            return {
              ...item,
              texts: transStep ? transStep.texts : { ko: item.text, en: item.text, ja: item.text, zh: item.text }
            };
          });
        }
      } catch (transErr) {
        console.warn("Auto-translation for newly generated recipe failed, continuing with default text.", transErr);
        // Fallbacks
        generatedJSON.titles = { ko: generatedJSON.title, en: generatedJSON.title, ja: generatedJSON.title, zh: generatedJSON.title };
        generatedJSON.descriptions = { ko: generatedJSON.description, en: generatedJSON.description, ja: generatedJSON.description, zh: generatedJSON.description };
        generatedJSON.instructions = generatedJSON.instructions.map((item: any) => ({
          ...item,
          texts: { ko: item.text, en: item.text, ja: item.text, zh: item.text }
        }));
      }

      res.json(generatedJSON);
    } catch (error: any) {
      console.error("Gemini Server Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during generation." });
    }
  });

  // Server-Side endpoint for translating a recipe into 4 languages in 1-go!
  app.post('/api/gemini/translate', async (req, res) => {
    try {
      const { title, description, instructions, model } = req.body;
      if (!title || !description || !instructions) {
        return res.status(400).json({ error: "title, description, and instructions are required." });
      }

      const targetModel = getModelName(model);

      // Create a neat prompt for 1-run translation
      const translationPrompt = `Translate the following culinary recipe details into ko (Korean), en (English), ja (Japanese), and zh (Simplified Chinese). Make sure translations are natural, appealing, and sound delicious.
Title: ${title}
Description: ${description}
Instructions:
${instructions.map((inst: any) => `Step ${inst.step}: ${inst.text}`).join('\n')}`;

      const translateSchema = {
        type: Type.OBJECT,
        properties: {
          titles: {
            type: Type.OBJECT,
            properties: {
              ko: { type: Type.STRING },
              en: { type: Type.STRING },
              ja: { type: Type.STRING },
              zh: { type: Type.STRING }
            },
            required: ["ko", "en", "ja", "zh"]
          },
          descriptions: {
            type: Type.OBJECT,
            properties: {
              ko: { type: Type.STRING },
              en: { type: Type.STRING },
              ja: { type: Type.STRING },
              zh: { type: Type.STRING }
            },
            required: ["ko", "en", "ja", "zh"]
          },
          instructions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.INTEGER },
                texts: {
                  type: Type.OBJECT,
                  properties: {
                    ko: { type: Type.STRING },
                    en: { type: Type.STRING },
                    ja: { type: Type.STRING },
                    zh: { type: Type.STRING }
                  },
                  required: ["ko", "en", "ja", "zh"]
                }
              },
              required: ["step", "texts"]
            }
          }
        },
        required: ["titles", "descriptions", "instructions"]
      };

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: translationPrompt,
        config: {
          systemInstruction: "You are a professional culinary and menu translation assistant. Translate all aspects accurately into the requested 4 languages (ko, en, ja, zh) and match the exact JSON structure.",
          responseMimeType: "application/json",
          responseSchema: translateSchema,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Failed to translate contents.");
      }

      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Gemini Translation Server Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during translation." });
    }
  });

  // Server-Side endpoint for translating studio text settings into 4 languages in 1-go!
  app.post('/api/gemini/translate_settings', async (req, res) => {
    try {
      const { heroEyebrow, heroTitle, heroSubtitle, specialEyebrow, specialTitle, specialDesc, model } = req.body;
      if (!heroTitle || !heroSubtitle) {
        return res.status(400).json({ error: "heroTitle and heroSubtitle are required." });
      }

      const targetModel = getModelName(model);

      const translationPrompt = `Translate the following diet studio promotional header texts into ko (Korean), en (English), ja (Japanese), and zh (Simplified Chinese). Keep the vibes hip, trendy, modern, and highly appealing to fitness/diet-conscious young people.
heroEyebrow: ${heroEyebrow || ''}
heroTitle: ${heroTitle}
heroSubtitle: ${heroSubtitle}
specialEyebrow: ${specialEyebrow || ''}
specialTitle: ${specialTitle || ''}
specialDesc: ${specialDesc || ''}`;

      const settingsSchema = {
        type: Type.OBJECT,
        properties: {
          heroEyebrows: {
            type: Type.OBJECT,
            properties: { ko: { type: Type.STRING }, en: { type: Type.STRING }, ja: { type: Type.STRING }, zh: { type: Type.STRING } },
            required: ["ko", "en", "ja", "zh"]
          },
          heroTitles: {
            type: Type.OBJECT,
            properties: { ko: { type: Type.STRING }, en: { type: Type.STRING }, ja: { type: Type.STRING }, zh: { type: Type.STRING } },
            required: ["ko", "en", "ja", "zh"]
          },
          heroSubtitles: {
            type: Type.OBJECT,
            properties: { ko: { type: Type.STRING }, en: { type: Type.STRING }, ja: { type: Type.STRING }, zh: { type: Type.STRING } },
            required: ["ko", "en", "ja", "zh"]
          },
          specialEyebrows: {
            type: Type.OBJECT,
            properties: { ko: { type: Type.STRING }, en: { type: Type.STRING }, ja: { type: Type.STRING }, zh: { type: Type.STRING } },
            required: ["ko", "en", "ja", "zh"]
          },
          specialTitles: {
            type: Type.OBJECT,
            properties: { ko: { type: Type.STRING }, en: { type: Type.STRING }, ja: { type: Type.STRING }, zh: { type: Type.STRING } },
            required: ["ko", "en", "ja", "zh"]
          },
          specialDescs: {
            type: Type.OBJECT,
            properties: { ko: { type: Type.STRING }, en: { type: Type.STRING }, ja: { type: Type.STRING }, zh: { type: Type.STRING } },
            required: ["ko", "en", "ja", "zh"]
          }
        },
        required: [
          "heroEyebrows",
          "heroTitles",
          "heroSubtitles",
          "specialEyebrows",
          "specialTitles",
          "specialDescs"
        ]
      };

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: translationPrompt,
        config: {
          systemInstruction: "You are an expert copywriter and professional culinary/fitness translator. Render highly natural, trendy, and beautiful localized copy for all 4 languages (ko, en, ja, zh). Return strict JSON matching.",
          responseMimeType: "application/json",
          responseSchema: settingsSchema,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Failed to translate settings.");
      }

      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Gemini Settings Translation Server Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during settings translation." });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log(`Vite development server mounted successfully on express.`);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer();
