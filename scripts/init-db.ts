import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function initDB() {
  console.log('데이터 마이그레이션을 시작합니다...');
  
  const menuData = JSON.parse(fs.readFileSync('./src/data/menuData.json', 'utf8'));

  for (const item of menuData) {
    const { error } = await supabase.from('menu_items').insert({
      category: item.category,
      sub_category: item.subCategory || null,
      name: item.name,
      price: item.price,
      description: item.description,
      duration: item.duration,
      image: item.image,
      options: item.options,
      max_count: item.maxCount || null
    });

    if (error) {
      console.error(`에러 발생 (${item.name}):`, error.message);
    } else {
      console.log(`성공: ${item.name}`);
    }
  }
  
  console.log('마이그레이션 완료!');
}

initDB();
