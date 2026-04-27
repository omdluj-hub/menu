import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());

// 이미지 저장 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'images');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 이미지 업로드 API
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('파일이 없습니다.');
  res.json({ url: `/images/${req.file.filename}` });
});

// 메뉴 데이터 로드/저장 API (로컬 JSON 파일 연동)
const menuFilePath = path.join(process.cwd(), 'src/data/menuData.json');

router.get('/menu', (req, res) => {
  const data = fs.readFileSync(menuFilePath, 'utf8');
  res.json(JSON.parse(data));
});

router.post('/menu-update', (req, res) => {
  const newData = req.body;
  fs.writeFileSync(menuFilePath, JSON.stringify(newData, null, 2), 'utf8');
  res.json({ message: '저장 완료' });
});

// 기존 예약 요청 로직 (생략 없이 유지)
let requests = [];
router.get('/requests', (req, res) => res.json(requests));
router.post('/request', (req, res) => {
  const newRequest = { id: Date.now(), ...req.body, status: '대기', timestamp: new Date().toISOString() };
  requests.push(newRequest);
  res.status(201).json(newRequest);
});

app.use('/api', router);
export default app;
