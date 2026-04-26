# 병원 시술 메뉴판 프로젝트

태블릿 최적화 병원 메뉴판 및 상담 요청 시스템입니다.

## 실행 방법

### 1. 서버 실행
```bash
cd server
npm install
node index.js
```

### 2. 클라이언트 실행
```bash
cd client
npm install
npm run dev
```

## 주요 기능
- **환자용 메뉴 (/):** 시술 항목 확인, 상세 보기, 상담 항목 선택 및 요청
- **실장용 대시보드 (/admin):** 실시간 상담 요청 내역 확인 및 상태 업데이트

## 시술 데이터 수정
`server/index.js` 파일의 `menuData` 배열을 수정하여 실제 시술 항목으로 변경할 수 있습니다.
이미지는 `client/public/images/` 폴더에 넣고 경로를 지정하거나 외부 URL을 사용할 수 있습니다.
