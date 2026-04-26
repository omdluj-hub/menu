require('dotenv').config();
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const API_KEY = process.env.GOOGLE_API_KEY;
const modelId = "imagen-4.0-generate-001";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${API_KEY}`;

// 이미지 저장 경로 (루트의 public/images로 설정)
const IMAGE_DIR = path.join(__dirname, '../../public/images');

const item = {
  id: 15,
  name: 'HIFU 리프팅 100샷',
  description: '턱 라인 탄력을 위한 고강도 집속 초음파 리프팅'
};

async function generateImage() {
  console.log(`Regenerating image for: ${item.name}...`);
  
  const prompt = `Extreme close-up photography of a HIFU (High-Intensity Focused Ultrasound) treatment being performed on a Korean woman's jawline. 
    The focus is solely on the sharp contour of the lower jaw and the high-tech HIFU device wand gliding along it. 
    NO full faces, NO practitioners visible. Just the device head in contact with the jawline skin. 
    Professional medical setting, clean white clinical environment. 
    Soft professional lighting, 8k resolution, extreme photorealism, realistic skin texture. 
    The composition highlights the precision and effectiveness of the lifting procedure on the jawline.`;

  const payload = {
    instances: [
      {
        prompt: prompt
      }
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: "1:1" 
    }
  };

  try {
    const response = await axios.post(API_URL, payload);
    if (response.data.predictions && response.data.predictions[0].bytesBase64Encoded) {
      const base64Image = response.data.predictions[0].bytesBase64Encoded;
      const fileName = `menu_15.png`; // 15번 파일 교체
      const filePath = path.join(IMAGE_DIR, fileName);
      
      await fs.ensureDir(IMAGE_DIR);
      await fs.writeFile(filePath, Buffer.from(base64Image, 'base64'));
      console.log(`Successfully regenerated and saved: ${fileName}`);
      console.log(`Path: ${filePath}`);
    } else {
      console.log("No image data received from API.");
    }
  } catch (error) {
    console.error(`Error:`, error.response ? error.response.data : error.message);
  }
}

generateImage();
