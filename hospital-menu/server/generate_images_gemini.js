require('dotenv').config();
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const API_KEY = process.env.GOOGLE_API_KEY;
const modelId = "imagen-4.0-generate-001";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${API_KEY}`;

const IMAGE_DIR = path.join(__dirname, '../client/public/images');

const menuData = [
  { id: 1, category: '1회 체험 이벤트', name: '관리사 압출 + 약침', description: '전문 관리사의 꼼꼼한 압출과 염증을 진정시키는 한방 약침 시술입니다.' },
  { id: 2, category: '1회 체험 이벤트', name: '아쿠아필 + 약침', description: '모공 속 노폐물 제거와 수분 공급, 그리고 약침으로 피부를 진정시킵니다.' },
  { id: 3, category: '1회 체험 이벤트', name: 'PDT + 약침', description: '피지선을 억제하는 PDT 광동역 치료와 진정 약침 세트입니다.' },
  { id: 4, category: '1회 체험 이벤트', name: '편평사마귀 제거', description: '편평사마귀를 깨끗하고 안전하게 제거하는 레이저 시술입니다.' },
  { id: 5, category: '1회 체험 이벤트', name: '스마트피파침', description: '피지선증식증, 한관종 전문 치료를 위한 특수 침 시술입니다.' },
  { id: 6, category: '1회 체험 이벤트', name: '코 모공 관리', description: '늘어지고 넓어진 코 모공을 집중적으로 케어하는 관리입니다.' },
  { id: 7, category: '1회 체험 이벤트', name: '스킨부스터 QTCell 블랙라벨', description: '피부 재생과 탄력을 위한 프리미엄 스킨부스터 시술입니다.' },
  { id: 8, category: '1회 체험 이벤트', name: '셀액티브 스킨부스터', description: '세포 활성화를 돕는 성분을 피부 깊숙이 전달하는 스킨부스터입니다.' },
  { id: 9, category: '1회 체험 이벤트', name: 'PDRN 스킨부스터', description: '연어 주사 성분으로 잘 알려진 PDRN을 활용한 피부 재생 관리입니다.' },
  { id: 10, category: '1회 체험 이벤트', name: '미주안 PN 약침', description: '피부 장벽 강화와 재생에 효과적인 고농축 PN 성분 약침입니다.' },
  { id: 11, category: '1회 체험 이벤트', name: '연아 약침', description: '미백과 광채, 피부 결 개선에 도움을 주는 프리미엄 약침입니다.' },
  { id: 12, category: '1회 체험 이벤트', name: 'LIPOSA 윤곽약침', description: '불필요한 얼굴 지방을 정리하여 매끄러운 라인을 만들어줍니다.' },
  { id: 13, category: '1회 체험 이벤트', name: '마황천오약침 (지방분해)', description: '복부 또는 팔뚝의 지방 분해를 돕는 강력한 다이어트 약침입니다.' },
  { id: 14, category: '1회 체험 이벤트', name: '쿨쉐이핑 (복부 지방분해)', description: '냉각 지방 분해술을 통해 복부 지방 세포를 효과적으로 감소시킵니다.' },
  { id: 15, category: '1회 체험 이벤트', name: 'HIFU 리프팅 리니어펌', description: '고강도 집속 초음파를 이용하여 피부 속부터 탄력을 채워주는 리프팅입니다.' }
];

async function generateImage(item) {
  console.log(`Generating with Imagen 4: ${item.name}...`);
  
  const payload = {
    instances: [
      {
        prompt: `A professional, ultra-high-end medical clinic photography of "${item.name}". ${item.description}. Pure white medical context, high-end clinic atmosphere, soft cinematic volumetric lighting, 8k resolution, extreme photorealism, realistic skin textures, minimal and clean composition. No text, no labels, no watermarks. Masterpiece quality.`
      }
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: "3:4"
    }
  };

  try {
    const response = await axios.post(API_URL, payload);
    if (response.data.predictions && response.data.predictions[0].bytesBase64Encoded) {
      const base64Image = response.data.predictions[0].bytesBase64Encoded;
      const fileName = `menu_${item.id}.png`;
      const filePath = path.join(IMAGE_DIR, fileName);
      await fs.writeFile(filePath, Buffer.from(base64Image, 'base64'));
      console.log(`Successfully saved: ${fileName}`);
      return `/images/${fileName}`;
    }
    return null;
  } catch (error) {
    console.error(`Error for ${item.name}:`, error.message);
    return null;
  }
}

async function run() {
  await fs.ensureDir(IMAGE_DIR);
  const results = [];
  for (const item of menuData) {
    const localPath = await generateImage(item);
    if (localPath) results.push({ ...item, image: localPath });
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  console.log('\n--- Generation Complete ---');
}

run();
