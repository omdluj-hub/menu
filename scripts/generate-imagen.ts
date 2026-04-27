import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === "your_api_key_here") {
  console.error("오류: .env 파일에 VITE_GEMINI_API_KEY를 입력해주세요.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function generateImage(prompt: string, outputName: string) {
  const model = genAI.getGenerativeModel({ model: "imagen-4.0-generate-001" });

  try {
    console.log(`[작업 시작]`);
    console.log(`프롬프트: "${prompt}"`);
    console.log("Imagen 4.0 생성 중...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const imagePart = response.candidates?.[0].content.parts.find(part => part.inlineData);
    
    if (imagePart && imagePart.inlineData) {
      const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
      const imagesDir = path.join(process.cwd(), "images");
      if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
      
      const fileName = `${outputName}_${Date.now()}.png`;
      const filePath = path.join(imagesDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      console.log(`[완료] 이미지가 저장되었습니다: ${filePath}`);
    } else {
      console.error("오류: 이미지 생성 실패 (프롬프트 차단 가능성)");
    }
  } catch (error) {
    console.error("오류:", error);
  }
}

// 명령줄 인자 처리: npx tsx scripts/generate-imagen.ts "프롬프트" "파일명"
const args = process.argv.slice(2);
const customPrompt = args[0] || "A high-quality professional photo of a healthy meal";
const customName = args[1] || "generated_image";

generateImage(customPrompt, customName);
