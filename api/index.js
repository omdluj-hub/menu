const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const menuData = [
  // 1. 이달의 이벤트 - 피부
  {
    id: 1001,
    category: '이달의 이벤트',
    subCategory: '피부',
    name: '여드름 흉터 (트랜스테라피)',
    price: '50,000',
    description: '패인 흉터를 차오르게 하는 후한의원만의 독자적인 흉터 복원 시술입니다.',
    duration: '60분~',
    image: '/images/menu_3.png',
    options: [
      { label: '1개 (부분)', price: '50,000' },
      { label: '면적당 시술', price: '200,000~' }
    ]
  },
  {
    id: 1002,
    category: '이달의 이벤트',
    subCategory: '피부',
    name: '등·가슴 여드름 케어',
    price: '171,000',
    description: '등이나 가슴 부위의 여드름과 자국을 동시에 해결하는 집중 패키지입니다. (5세트 결제 시 1회 가격)',
    duration: '60분',
    image: '/images/menu_2.png',
    options: [
      { label: '등여드름 (상부) 1회', price: '171,000' },
      { label: '가슴여드름 (전체) 1회', price: '171,000' }
    ]
  },
  {
    id: 1003,
    category: '이달의 이벤트',
    subCategory: '피부',
    name: '모공각화증 (팔·종아리)',
    price: '200,000',
    description: '오톨도톨한 닭살 피부를 매끄럽게 개선하는 필링 및 재생 관리입니다. (5세트 결제 시 1회 가격)',
    duration: '50분',
    image: '/images/menu_4.png',
    options: [
      { label: '팔 모공각화증 (전체) 1회', price: '200,000' },
      { label: '종아리 모공각화증 (한부위) 1회', price: '200,000' }
    ]
  },

  // 1. 이달의 이벤트 - 다이어트
  {
    id: 1101,
    category: '이달의 이벤트',
    subCategory: '다이어트',
    name: '다요정 (다이어트 정약)',
    price: '70,000',
    description: '복용이 간편하고 효과가 빠른 알약 형태의 다이어트 한약입니다.',
    duration: '2주/3개월',
    image: '/images/다요정2.jpg',
    options: [
      { label: '2주 체험분 (90정)', price: '70,000' },
      { label: '3개월분 패키지', price: '390,000' }
    ]
  },
  {
    id: 1102,
    category: '이달의 이벤트',
    subCategory: '다이어트',
    name: '비톡스 (V-Tox) 프로그램',
    price: '99,000',
    description: '체내 독소를 배출하고 신진대사를 활성화하는 단기 집중 해독 다이어트입니다.',
    duration: '7일/10일',
    image: '/images/비움탕2.jpg',
    options: [
      { label: '7일 프로그램', price: '99,000' },
      { label: '10일 프로그램', price: '160,000' }
    ]
  },
  {
    id: 1103,
    category: '이달의 이벤트',
    subCategory: '다이어트',
    name: '다요스틱 (농축환)',
    price: '80,000',
    description: '휴대가 간편하고 효과가 뛰어난 고농축 환 형태의 다이어트 한약입니다.',
    duration: '2주/3개월',
    image: '/images/다요스틱.JPG',
    options: [
      { label: '2주 체험분', price: '80,000' },
      { label: '3개월분 패키지', price: '650,000' }
    ]
  },
  {
    id: 1104,
    category: '이달의 이벤트',
    subCategory: '다이어트',
    name: '두배더블 유지 프로그램',
    price: '상담문의',
    description: '감량 후 요요 방지를 위한 장기 유지 관리 프로그램입니다. (최대 9개월 추가 증정)',
    duration: '유지기 관리',
    image: '/images/미감탕2.JPG',
    options: [
      { label: '2개월 결제 시 4개월 증정', price: '상담문의' },
      { label: '3개월 결제 시 9개월 증정', price: '상담문의' }
    ]
  },

  // 2. 1회 체험 이벤트
  {
    id: 1,
    category: '1회 체험 이벤트',
    subCategory: '피부관리',
    name: '관리사 압출 + 약침',
    price: '29,900',
    description: '전문 관리사의 꼼꼼한 압출과 염증을 진정시키는 한방 약침 시술입니다.',
    duration: '40분',
    image: '/images/menu_1.png',
    options: [{ label: '1회 체험', price: '29,900' }]
  },
  {
    id: 2,
    category: '1회 체험 이벤트',
    subCategory: '피부관리',
    name: '아쿠아필 + 약침',
    price: '19,900',
    description: '모공 속 노폐물 제거와 수분 공급, 그리고 약침으로 피부를 진정시킵니다.',
    duration: '40분',
    image: '/images/menu_2.png',
    options: [{ label: '1회 체험', price: '19,900' }]
  },
  {
    id: 3,
    category: '1회 체험 이벤트',
    subCategory: '피부관리',
    name: 'PDT + 약침',
    price: '9,900',
    description: '피지선을 억제하는 PDT 광동역 치료와 진정 약침 세트입니다.',
    duration: '30분',
    image: '/images/menu_3.png',
    options: [{ label: '1회 체험', price: '9,900' }]
  },
  {
    id: 6,
    category: '1회 체험 이벤트',
    subCategory: '피부관리',
    name: '코 모공 관리',
    price: '59,000',
    description: '늘어지고 넓어진 코 모공을 집중적으로 케어하는 관리입니다.',
    duration: '50분',
    image: '/images/menu_6.png',
    options: [{ label: '1회 체험', price: '59,000' }]
  },
  {
    id: 4,
    category: '1회 체험 이벤트',
    subCategory: '피부질환',
    name: '편평사마귀 제거 (개당)',
    price: '5,000',
    description: '편평사마귀를 깨끗하고 안전하게 제거하는 전문 레이저 시술입니다.',
    duration: '10분~',
    image: '/images/menu_4.png',
    maxCount: 10,
    options: [{ label: '개당', price: '5,000' }]
  },
  {
    id: 5,
    category: '1회 체험 이벤트',
    subCategory: '피부질환',
    name: '스마트피파침',
    price: '10,000',
    description: '피지선증식증, 한관종 전문 치료 시술입니다.',
    duration: '20분~',
    image: '/images/menu_5.png',
    maxCount: 5,
    options: [{ label: '개당', price: '10,000' }]
  },
  {
    id: 7,
    category: '1회 체험 이벤트',
    subCategory: '스킨부스터',
    name: 'QTCell 블랙라벨',
    price: '69,000',
    description: '피부 재생과 탄력을 위한 프리미엄 스킨부스터 시술입니다.',
    duration: '30분',
    image: '/images/menu_7.png',
    options: [{ label: '1회 체험', price: '69,000' }]
  },
  {
    id: 8,
    category: '1회 체험 이벤트',
    subCategory: '스킨부스터',
    name: '셀액티브 스킨부스터',
    price: '49,900',
    description: '세포 활성화를 돕는 성분을 피부 깊숙이 전달하는 스킨부스터입니다.',
    duration: '30분',
    image: '/images/menu_8.png',
    options: [{ label: '1회 체험', price: '49,900' }]
  },
  {
    id: 9,
    category: '1회 체험 이벤트',
    subCategory: '스킨부스터',
    name: 'PDRN 스킨부스터',
    price: '29,900',
    description: '연어 주사 성분으로 잘 알려진 PDRN을 활용한 피부 재생 관리입니다.',
    duration: '30분',
    image: '/images/menu_9.png',
    options: [{ label: '1회 체험', price: '29,900' }]
  },
  {
    id: 10,
    category: '1회 체험 이벤트',
    subCategory: '스킨부스터',
    name: '미주안 PN 약침',
    price: '69,000',
    description: '피부 장벽 강화와 재생에 효과적인 고농축 PN 성분 약침입니다.',
    duration: '20분',
    image: '/images/menu_10.png',
    options: [{ label: '1회 체험', price: '69,000' }]
  },
  {
    id: 11,
    category: '1회 체험 이벤트',
    subCategory: '스킨부스터',
    name: '연아 약침',
    price: '49,900',
    description: '미백과 광채, 피부 결 개선에 도움을 주는 프리미엄 약침입니다.',
    duration: '20분',
    image: '/images/menu_11.png',
    options: [{ label: '1회 체험', price: '49,900' }]
  },
  {
    id: 12,
    category: '1회 체험 이벤트',
    subCategory: '리프팅/바디관리',
    name: 'LIPOSA 윤곽약침',
    price: '19,900',
    description: '불필요한 얼굴 지방을 정리하여 매끄러운 라인을 만들어줍니다.',
    duration: '15분',
    image: '/images/menu_12.png',
    options: [{ label: '1회 체험', price: '19,900' }]
  },
  {
    id: 13,
    category: '1회 체험 이벤트',
    subCategory: '리프팅/바디관리',
    name: '마황천오약침',
    price: '19,900',
    description: '복부 또는 팔뚝의 지방 분해를 돕는 강력한 다이어트 약침입니다.',
    duration: '20분',
    image: '/images/menu_13.png',
    options: [{ label: '1회 체험', price: '19,900' }]
  },
  {
    id: 14,
    category: '1회 체험 이벤트',
    subCategory: '리프팅/바디관리',
    name: '쿨쉐이핑 (복부)',
    price: '19,900',
    description: '냉각 지방 분해술을 통해 복부 지방 세포를 효과적으로 감소시킵니다.',
    duration: '45분',
    image: '/images/menu_14.png',
    options: [{ label: '1회 체험', price: '19,900' }]
  },
  {
    id: 15,
    category: '1회 체험 이벤트',
    subCategory: '리프팅/바디관리',
    name: 'HIFU 리프팅 100샷',
    price: '19,900',
    description: '고강도 집속 초음파를 이용하여 피부 속부터 탄력을 채워주는 리프팅입니다.',
    duration: '20분',
    image: '/images/menu_15.png',
    options: [{ label: '100샷 체험', price: '19,900' }]
  },

  // 3. 여드름
  {
    id: 201,
    category: '여드름',
    name: '여드름 집중 치료',
    price: '88,000',
    description: '여드름의 원인을 근본적으로 해결하는 맞춤형 집중 치료입니다.',
    duration: '60분',
    image: 'https://via.placeholder.com/300?text=Acne',
    options: [{ label: '1회', price: '88,000' }]
  },

  // 4. 흉터,자국,홍조
  {
    id: 301,
    category: '흉터,자국,홍조',
    name: '흉터 재생 레이저',
    price: '150,000',
    description: '패인 흉터와 붉은 자국을 재생시키는 레이저 시술입니다.',
    duration: '40분',
    image: 'https://via.placeholder.com/300?text=Scar',
    options: [{ label: '1회', price: '150,000' }]
  },

  // 5. 스킨부스터
  {
    id: 401,
    category: '스킨부스터',
    name: '리쥬란 힐러',
    price: '250,000',
    description: '피부 재생 성분 PN을 직접 주입하여 피부 장벽을 강화합니다.',
    duration: '30분',
    image: 'https://via.placeholder.com/300?text=Rejuran',
    options: [{ label: '2cc', price: '250,000' }]
  },

  // 6. 피부질환
  {
    id: 501,
    category: '피부질환',
    name: '보험 진료',
    price: '상담문의',
    description: '피부염, 가려움증 등 보험 적용이 가능한 일반 피부 질환 진료입니다.',
    duration: '상담 후 결정',
    image: 'https://via.placeholder.com/300?text=Clinic',
    options: [{ label: '기본 진료', price: '상담문의' }]
  },

  // 7. 다이어트
  {
    id: 601,
    category: '다이어트',
    name: '다이어트 한약 (미감탕)',
    price: '180,000',
    description: '체질에 맞는 약재로 조제하여 건강한 체중 감량을 돕습니다.',
    duration: '상담 필수',
    image: '/images/미감탕2.JPG',
    options: [{ label: '1개월분', price: '180,000' }]
  },

  // 8. 체질개선,보약
  {
    id: 701,
    category: '체질개선,보약',
    name: '공진단/경옥고',
    price: '상담문의',
    description: '기력 회복과 면역력 증진에 탁월한 프리미엄 보약입니다.',
    duration: '즉시 처방',
    image: 'https://via.placeholder.com/300?text=Med',
    options: [{ label: '별도 문의', price: '상담문의' }]
  }
];

let requests = [];

// 유연한 라우팅 처리 ( /api/menu 와 /menu 모두 대응 )
const router = express.Router();

router.get('/menu', (req, res) => {
  res.status(200).json(menuData);
});

router.post('/request', (req, res) => {
  const { patientName, selectedItems } = req.body;
  const newRequest = {
    id: Date.now(),
    patientName: patientName || '익명 환자',
    selectedItems,
    status: '대기 중',
    timestamp: new Date().toLocaleString()
  };
  requests.push(newRequest);
  res.status(201).json({ message: '상담 요청이 완료되었습니다.', request: newRequest });
});

router.get('/requests', (req, res) => {
  res.status(200).json(requests);
});

router.patch('/requests/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const request = requests.find(r => r.id === parseInt(id));
  if (request) {
    request.status = status;
    res.status(200).json(request);
  } else {
    res.status(404).json({ message: '요청을 찾을 수 없습니다.' });
  }
});

// 모든 경로를 라우터로 연결 (Vercel rewrites와 결합하여 /api/menu, /api/request 등을 처리)
app.use('/api', router);
app.use('/', router); // fallback

module.exports = app;
