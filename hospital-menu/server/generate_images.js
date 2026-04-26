require('dotenv').config();
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = 'us-central1';
const MODEL_ID = 'imagen-4.0-generate-001';
const API_ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

const IMAGE_DIR = path.join(__dirname, '../client/public/images');

const menuData = [
  { id: 1, category: '1회 체험 이벤트', name: '아쿠아필 1회 체험', description: '모공 속 노폐물과 피지를 깔끔하게 제거합니다.' },
  { id: 101, category: '이달의 이벤트', name: '봄맞이 화이트닝 패키지', description: '레이저 토닝 3회 + 비타민 관리 3회 패키지입니다.' },
  { id: 2, category: '여드름', name: '압출 + PDT 관리', description: '압출과 피지선을 억제하는 PDT 광역동 치료입니다.' },
  { id: 3, category: '흉터,자국,홍조', name: '엑셀V 레이저 (홍조)', description: '붉은 자국과 안면 홍조를 개선하는 혈관 레이저입니다.' },
  { id: 4, category: '스킨부스터', name: '리쥬란 힐러 2cc', description: '피부 재생 성분 PN을 직접 주입하여 피부 탄력을 높여줍니다.' },
  { id: 5, category: '피부질환', name: '편평사마귀 제거', description: 'CO2 레이저를 사용하여 사마귀를 꼼꼼하게 제거합니다.' },
  { id: 6, category: '다이어트', name: '다이어트 환 (한달분)', description: '식욕 억제와 신진대사 활성화를 돕는 맞춤형 다이어트 환약입니다.' },
  { id: 7, category: '체질개선,보약', name: '맞춤 한약 (15일분)', description: '기력을 보강하고 면역력을 높여주는 맞춤 보약입니다.' }
];

async function getAccessToken() {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

async function generateImage(item, accessToken) {
  console.log(`Generating with Imagen 4 (ADC): ${item.name}...`);
  
  const prompt = `A professional, ultra-high-end medical aesthetic photography of "${item.name}". ${item.description}. 
  Pure white medical context, high-end clinic atmosphere, soft cinematic volumetric lighting, 
  8k resolution, extreme photorealism, realistic skin textures, minimal and clean composition. 
  No text, no labels, no watermarks. Masterpiece quality.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        instances: [{ prompt: prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "3:4",
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data.predictions && response.data.predictions[0].bytesBase64Encoded) {
      const base64Image = response.data.predictions[0].bytesBase64Encoded;
      const fileName = `menu_${item.id}.png`;
      const filePath = path.join(IMAGE_DIR, fileName);

      await fs.writeFile(filePath, Buffer.from(base64Image, 'base64'));
      console.log(`Successfully saved: ${fileName}`);
      return `/images/${fileName}`;
    } else {
      throw new Error('No image data in response');
    }
  } catch (error) {
    console.error(`Error generating image for ${item.name}:`, error.response ? JSON.stringify(error.response.data) : error.message);
    return null;
  }
}

async function run() {
  await fs.ensureDir(IMAGE_DIR);

  try {
    console.log('Fetching Google Access Token...');
    const accessToken = await getAccessToken();
    console.log('Token fetched successfully.\n');

    const results = [];
    for (const item of menuData) {
      const localPath = await generateImage(item, accessToken);
      if (localPath) {
        results.push({ ...item, image: localPath });
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('\n--- Imagen 4 Generation Complete ---');
    console.log('Copy this menuData to your server/index.js:');
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Failed to run image generation:', error.message);
    console.log('\nTip: Run "gcloud auth application-default login" in your terminal first.');
  }
}

run();
