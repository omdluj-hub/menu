import fs from 'fs';
import path from 'path';

const imagesDir = './public/images';
const menuDataPath = './src/data/menuData.json';

// 매핑 테이블
const fileNameMap = {
  '寃쎌.jpg': 'kyungokgo.jpg',
  '怨듭': 'gongjindan.jpg',
  'ㅼㅽ.JPG': 'dayostick.jpg',
  'ㅼㅽ2.JPG': 'dayostick2.jpg',
  'ㅼ2.jpg': 'dayojung.jpg',
  '紐④났媛利.png': 'keratosis.png',
  '誘멸.jpg': 'migam-s.jpg',
  '誘멸2.JPG': 'migamtang.jpg',
  '誘몄＜.png': 'mijuan.png',
  '鍮': 'biumtang.jpg',
  '硫댁쎌묠.png': 'facial-acupuncture.png',
  '硫댄議.jpg': 'facial-redness.jpg',
  '곗': 'yeona.jpg',
  '荑⑥.png': 'coolshaping.png',
  'liposa.png': 'liposa.png',
  'cellactive.webp': 'cellactive.webp',
  'qtcell.png': 'qtcell.png'
};

function fixImages() {
  const files = fs.readdirSync(imagesDir);
  
  // 1. 파일명 변경
  files.forEach(file => {
    for (const [kor, eng] of Object.entries(fileNameMap)) {
      if (file.includes(kor.split('.')[0]) || file === kor) {
        const oldPath = path.join(imagesDir, file);
        const newPath = path.join(imagesDir, eng);
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          console.log(`Renamed: ${file} -> ${eng}`);
        }
      }
    }
  });

  // 2. JSON 데이터 업데이트
  let menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));
  
  menuData = menuData.map(item => {
    let newImage = item.image;
    
    // 특정 이름 기반 매칭 (데이터베이스 일관성을 위해)
    if (item.name.includes('경옥고')) newImage = '/images/kyungokgo.jpg';
    else if (item.name.includes('공진단')) newImage = '/images/gongjindan.jpg';
    else if (item.name.includes('LIPOSA') || item.name.includes('리포사')) newImage = '/images/liposa.png';
    else if (item.name.includes('다요스틱')) newImage = '/images/dayostick.jpg';
    else if (item.name.includes('다요정')) newImage = '/images/dayojung.jpg';
    else if (item.name.includes('미감에스')) newImage = '/images/migam-s.jpg';
    else if (item.name.includes('미감탕')) newImage = '/images/migamtang.jpg';
    else if (item.name.includes('비톡스') || item.name.includes('비움탕')) newImage = '/images/biumtang.jpg';
    else if (item.name.includes('모공각화증')) newImage = '/images/keratosis.png';
    else if (item.name.includes('미주안')) newImage = '/images/mijuan.png';
    else if (item.name.includes('안면약침')) newImage = '/images/facial-acupuncture.png';
    else if (item.name.includes('안면홍조')) newImage = '/images/facial-redness.jpg';
    else if (item.name.includes('연아')) newImage = '/images/yeona.jpg';
    else if (item.name.includes('쿨쉐이핑')) newImage = '/images/coolshaping.png';
    else if (item.name.includes('셀엑소좀')) newImage = '/images/cellactive.webp';
    else if (item.name.includes('QTCell') || item.name.includes('큐티셀')) newImage = '/images/qtcell.png';

    return { ...item, image: newImage };
  });

  fs.writeFileSync(menuDataPath, JSON.stringify(menuData, null, 2));
  console.log('Updated menuData.json');
}

fixImages();
