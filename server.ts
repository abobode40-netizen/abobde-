import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  let aiClient: GoogleGenAI | null = null;
  if (apiKey) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiEnabled: !!aiClient });
  });

  // AI Daily Thimarah & Verse Linker endpoint
  app.post("/api/ai-thimar", async (req, res) => {
    try {
      if (!aiClient) {
        return res.status(503).json({ error: "Gemini API key not configured on server" });
      }

      const { topic, era } = req.body || {};

      const prompt = `أنت عالم محقق بالقرآن الكريم والسنة النبوية ودرر علماء أهل السنة. 
المطلوب: قم بتوليد ثمرة علمية جديدة وموثوقة من أقوال وأعلام أهل السنة والجماعة (مثل: الحسن البصري، سفيان الثوري، ابن تيمية، ابن القيم، ابن رجب، الحافظ ابن الجوزي، أو الشيخ أبو إسحاق الحويني، الشيخ ابن عثيمين، الشيخ الألباني، الشيخ ابن باز، الشيخ عبد الرزاق البدر).
${topic ? `الموضوع المطلوب: ${topic}` : ''}
${era ? `العصر المطلوب: ${era}` : ''}

المطلوب إرجاعه بصيغة JSON فقط بهذا الشكل وبصيغة صحيحة بدون markdown tags:
{
  "quote": "المقولة أو الدرة العلمية المحققة",
  "author": "اسم الشيخ أو الإمام",
  "category": "تصنيف الفائدة",
  "source": "المصدر العلمي أو الكتاب",
  "reflectionPrompt": "وقفة تدبرية موجزة مع الفائدة",
  "era": "إما 'التابعين والأئمة المتقدمين' أو 'أئمة الإسلام المحققين' أو 'مشايخ العصر وأعلام السنة'",
  "relatedVerse": {
    "surahName": "اسم السورة",
    "surahNumber": 1,
    "ayahNumber": 1,
    "verseText": "نص الآية القرآنية الكريمة الدالة والمقترنة بالمعنى",
    "explanation": "وجه الارتباط الشريف بين هذه الآية الكريمة وتلك الفائدة العلمية أو الذكر",
    "audioUrl": "رابط صوتي بصيغة https://everyayah.com/data/Alafasy_128kbps/SSSAAA.mp3 حيث SSS رقم السورة 3 خانات و AAA رقم الآية 3 خانات"
  }
}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const text = response.text || "";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json({ success: true, data: parsed });

    } catch (err: any) {
      console.error("Error in /api/ai-thimar:", err);
      return res.status(500).json({ error: err.message || "Failed to generate AI thimar" });
    }
  });

  // AI Quran Verse Linker for any given Dhikr or quote
  app.post("/api/ai-quran-link", async (req, res) => {
    try {
      if (!aiClient) {
        return res.status(503).json({ error: "Gemini API key not configured on server" });
      }

      const { textToLink } = req.body || {};
      if (!textToLink) {
        return res.status(400).json({ error: "Missing textToLink parameter" });
      }

      const prompt = `استخرج آية قرآنية كريمة دالة ومقترنة مباشرة بهذا الذكر أو المقولة الإيمانية:
"${textToLink}"

قم بإرجاع النتيجة بصيغة JSON فقط:
{
  "surahName": "اسم السورة",
  "surahNumber": 1,
  "ayahNumber": 1,
  "verseText": "نص الآية الكريمة الواضحة الدالة على هذا المعنى",
  "explanation": "شرح موجز لبليغ الربط بين الذكر/الفائدة وهذه الآية المباركة",
  "audioUrl": "رابط صوتي بصيغة https://everyayah.com/data/Alafasy_128kbps/SSSAAA.mp3 حيث SSS رقم السورة 3 خانات و AAA رقم الآية 3 خانات"
}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        }
      });

      const text = response.text || "";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json({ success: true, data: parsed });

    } catch (err: any) {
      console.error("Error in /api/ai-quran-link:", err);
      return res.status(500).json({ error: err.message || "Failed to link Quran verse" });
    }
  });

  // Serve production build from dist if available for true offline-first performance
  const distPath = path.join(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(distPath, {
      setHeaders: (res, pathStr) => {
        if (pathStr.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else if (pathStr.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
