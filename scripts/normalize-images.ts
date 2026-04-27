import fs from 'fs';
import path from 'path';

const imagesDir = './public/images';

// 파일 크기(bytes)를 기준으로 파일명 매핑
const sizeMap = [
  { size: 249758, name: 'kyungokgo.jpg' },
  { size: 66036, name: 'gongjindan.jpg' },
  { size: 5879350, name: 'dayostick.jpg' },
  { size: 6671926, name: 'dayostick2.jpg' },
  { size: 3491072, name: 'dayojung.jpg' },
  { size: 204389, name: 'keratosis.png' },
  { size: 6516722, name: 'migam-s.jpg' },
  { size: 9951093, name: 'migamtang.jpg' },
  { size: 84784, name: 'mijuan.png' },
  { size: 6050321, name: 'biumtang.jpg' },
  { size: 18435, name: 'facial-acupuncture.png' },
  { size: 215601, name: 'facial-acupuncture-2.png' },
  { size: 212766, name: 'facial-redness.jpg' },
  { size: 71915, name: 'yeona.jpg' },
  { size: 193433, name: 'coolshaping.png' }
];

function normalizeImages() {
  const files = fs.readdirSync(imagesDir);
  
  files.forEach(file => {
    const filePath = path.join(imagesDir, file);
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    const match = sizeMap.find(m => Math.abs(m.size - fileSize) < 100); // 100바이트 오차 허용
    if (match) {
      const newPath = path.join(imagesDir, match.name);
      if (filePath !== newPath) {
        // 이미 해당 이름의 파일이 있으면 삭제 후 변경
        if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
        fs.renameSync(filePath, newPath);
        console.log(`Matched by size: ${fileSize} bytes -> ${match.name}`);
      }
    }
  });
}

normalizeImages();
