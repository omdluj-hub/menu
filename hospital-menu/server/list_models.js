require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
  try {
    const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // 임시 모델 초기화
    // 가용 모델 리스트 출력 (실제로는 API 엔드포인트 호출 필요)
    // 최신 SDK에서는 genAI 객체에서 직접 모델 목록을 가져오는 메서드가 다를 수 있음
    console.log("Checking available models for your API Key...");
    
    // axios를 사용하여 직접 모델 리스트 API 호출
    const axios = require('axios');
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
    
    console.log("\n--- Available Models ---");
    response.data.models.forEach(m => {
      if (m.name.includes('imagen') || m.name.includes('image')) {
        console.log(`[IMAGE MODEL] ${m.name}`);
      } else {
        console.log(`[OTHER MODEL] ${m.name}`);
      }
    });
    console.log("------------------------\n");
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

listModels();
