# 📚 독서 트래커 - Notion Book Widget

노션에서 바로 사용할 수 있는 도서 검색 및 추가 위젯입니다. 알라딘 API로 책을 검색하고, 클릭 한 번으로 노션 데이터베이스에 추가할 수 있습니다.

## ✨ 주요 기능

- 🔍 **알라딘 도서 검색**: 책 제목이나 저자로 간편하게 검색
- 📖 **원클릭 추가**: 검색 결과에서 책을 선택하고 바로 노션에 추가
- 🎨 **노션 스타일 UI**: 노션과 어울리는 깔끔한 디자인
- 🖼️ **자동 커버 이미지**: 책 표지가 노션 페이지 커버로 자동 설정
- 💾 **설정 저장**: API 키와 토큰을 브라우저에 안전하게 저장
- 📱 **반응형 디자인**: 데스크톱과 모바일 모두 지원

## 🚀 빠른 시작

### 1. Vercel에 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/notion-book-widget)

또는 수동 배포:

```bash
# 저장소 클론
git clone https://github.com/your-username/notion-book-widget.git
cd notion-book-widget

# Vercel CLI 설치 (처음 사용 시)
npm i -g vercel

# 배포
vercel
```

### 2. API 키 발급

#### 알라딘 API 키
1. [알라딘 TTB](https://www.aladin.co.kr/ttb/wblog_manage.aspx) 접속
2. 새 TTB 키 발급
3. 링크에 배포한 Vercel URL 입력 (예: `https://your-app.vercel.app`)

#### 노션 통합 생성
1. [Notion Integrations](https://www.notion.so/my-integrations) 접속
2. "+ New integration" 클릭
3. 이름 입력 후 생성
4. "Internal Integration Token" 복사

### 3. 노션 데이터베이스 설정

1. 노션에서 새 데이터베이스 생성 (Table)
2. 다음 속성 추가:
   - **Title** (제목 타입) - 기본으로 존재
   - **Author** (텍스트)
   - **Genre** (텍스트)
   - **Total** (숫자) ⚠️ 반드시 숫자 타입!

3. 데이터베이스 우측 상단 `...` → `연결` → 생성한 통합 선택
4. 데이터베이스 URL에서 ID 복사:
   ```
   https://notion.so/workspace/데이터베이스이름-abc123def456?v=...
                                            ↑ 이 부분이 ID
   ```

### 4. 위젯 사용

1. 배포된 URL 접속 (예: `https://your-app.vercel.app`)
2. 우측 상단 "⚙️ 설정" 클릭
3. API 키와 토큰 입력 후 저장
4. 책 검색 → 선택 → "노션에 추가" 클릭!

### 5. 노션에 임베드 (선택)

```
/embed → 배포한 Vercel URL 입력
```

## 📁 프로젝트 구조

```
notion-book-widget/
├── index.html              # 메인 위젯 UI
├── api/
│   ├── search.js          # 알라딘 검색 API
│   └── add-to-notion.js   # 노션 추가 API
└── README.md
```

## 🛠️ 기술 스택

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Vercel Serverless Functions
- **APIs**: 
  - [알라딘 Open API](https://blog.aladin.co.kr/openapi)
  - [Notion API](https://developers.notion.com/)

## 🔧 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/chacha091/notion-book-widget.git
cd notion-book-widget

# Vercel CLI로 로컬 실행
vercel dev
```

브라우저에서 `http://localhost:3000` 접속

## 📝 사용 예시

### 검색
```
검색창에 "해리포터" 입력 → 검색 버튼 클릭
```

### 선택 및 추가
```
원하는 책 표지 클릭 → 우측 하단 "노션에 추가" 버튼 클릭
```

### 노션에서 확인
```
데이터베이스에 자동으로 추가:
- 제목: 해리포터와 마법사의 돌
- 저자: J.K. 롤링
- 장르: 소설
- 페이지: 352
- 커버 이미지: 자동 설정
```

## ❓ FAQ

### Q: "검색 중 오류가 발생했습니다"
**A**: 다음을 확인하세요:
- 알라딘 API 키가 올바른지
- Vercel에 `api/search.js` 파일이 있는지
- 서버 API URL을 비워뒀는지 (자동 설정)

### Q: "노션 추가가 실패했습니다"
**A**: 다음을 확인하세요:
- 노션 통합 토큰이 올바른지
- 데이터베이스에 통합이 연결되었는지
- 속성 이름이 정확한지 (`Title`, `Author`, `Genre`, `Total`)
- `Total` 속성이 **숫자 타입**인지

### Q: "페이지 수가 null로 표시됩니다"
**A**: 알라딘 API에서 모든 책의 페이지 정보를 제공하지는 않습니다. 정보가 없는 경우 null로 저장됩니다.

### Q: "커버 이미지가 안 보입니다"
**A**: 노션 페이지를 열면 **맨 위**에 커버 이미지가 표시됩니다. 데이터베이스 목록에서는 작게 보일 수 있습니다.
