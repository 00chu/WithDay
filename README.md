# WithDay

## 프로젝트 소개

WithDay는 국비지원 과정에서 팀 프로젝트로 진행한 여행/일정 동행 플랫폼입니다.
사용자는 여행이나 일정을 생성할 수 있고, 다른 사용자는 해당 일정에 동행을 신청할 수 있습니다.

## 주요 기능

- **일정 탐색 및 관리**: 다양한 조건으로 일정을 탐색하고, 새로운 여행/일정을 생성 및 관리할 수 있습니다.
- **동행(참여) 시스템**: 마음에 드는 일정에 참여를 신청하고, 호스트가 이를 승인하거나 거절할 수 있습니다.
- **내 일정 관리**: 참여 중, 신청 중, 호스팅 중인 일정을 탭으로 구분하여 한눈에 파악할 수 있습니다.
- **추천 및 위시리스트**: 사용자 맞춤형 추천 일정과 관심 있는 일정을 저장하는 위시리스트 기능을 제공합니다.
- **알림 기능**: 브라우저 푸시 알림(OneSignal)을 통해 참여 승인 등의 주요 소식을 실시간으로 전달받을 수 있습니다.

## 기술 스택

### Frontend

- **Framework**: React 19, Vite 8
- **Routing**: React Router DOM 7
- **State Management**: Zustand, TanStack Query
- **Styling**: CSS Modules, Emotion/MUI (일부)
- **Others**: Axios, React Hook Form, Yup, ApexCharts, Date-fns/Dayjs, OneSignal

### Backend

- **Framework**: Java 17, Spring Boot 4.0.6, Spring MVC, Spring Security
- **Database**: MySQL, MyBatis 4.0.1
- **Authentication**: JWT (jjwt)
- **Others**: Cloudinary, Spring Boot Mail

### Infra & CI/CD

- **Deploy**: AWS S3, CloudFront, Docker, Kubernetes
- **CI/CD**: GitHub Actions

## 프로젝트 구조

```text
WithDay/
 ├── WithDayFront/               # 프론트엔드 프로젝트 루트
 │    ├── src/app/               # 전역 라우팅 및 쿼리 클라이언트 설정
 │    ├── src/features/          # 도메인별 핵심 비즈니스 로직 및 컴포넌트
 │    ├── src/page/              # 화면(페이지) 단위 컴포넌트 모음
 │    └── src/shared/            # 공통 API, 유틸리티, UI 컴포넌트
 └── WithDayBack/                # 백엔드 프로젝트 루트
      ├── src/main/java/com/test/withdayback/ # 도메인별 API 및 서비스 로직
      ├── src/main/resources/    # 프로파일별 설정 파일 및 MyBatis Mapper XML
      └── k8s/                   # Kubernetes 배포 설정 파일
```

## 담당 역할
- **일정 생성 및 관리 기능 구현**: 일정 생성, 수정, 삭제 기능을 구현하였으며, 지역 및 세부 지역 데이터 연동, DatePicker 기반 일정 기간 설정, 상세 일정 자동 생성, 정산 방식 및 오픈채팅 링크 입력 기능을 개발하였습니다.
- **폼 검증 및 이미지 업로드 처리**: React Hook Form과 Yup을 활용해 입력 데이터 검증을 구현하고, 이미지 미리보기 및 최대 3장의 이미지 업로드 기능을 적용하여 사용자 편의성을 개선하였습니다.
- **알림 시스템 구축 및 실시간 푸시 연동**: 내부 알림 데이터 저장 및 조회 기능을 구현하고, 참여 신청·승인·거절·추방 등 일정 상태 변화에 따른 알림 생성 로직을 개발하였습니다. 또한 OneSignal을 연동하여 사용자 수신 동의 여부 기반의 웹 푸시 알림 기능을 구현하였습니다.
- **알림 관리 UI 및 사용자 경험 개선**: 읽지 않은 알림 개수를 헤더 배지로 표시하고, 개별 삭제, 읽은 알림 전체 삭제, 전체 읽음 처리 기능을 제공하여 사용자 중심의 알림 관리 화면을 구현하였습니다.
- **관리자 페이지 및 권한 기반 관리 기능 구현**: 관리자 전용 레이아웃과 반응형 사이드바를 구축하고, 회원·일정·추천 일정 관리 기능을 개발하였습니다. 서버 측 관리자 권한 검증을 통해 관리자 기능 접근 보안을 강화하였습니다.
- **관리자 대시보드 데이터 시각화 구현**: 전체 회원 수, 일정 수, 추천 일정 수, 일정 상태 및 신규 생성 데이터를 요약 카드로 제공하고, 일별·주간·월별 통계 차트를 구현하여 운영 데이터를 직관적으로 확인할 수 있도록 구성하였습니다.
- **회원 관리 시스템 구현**: 회원 목록 조회, 검색, 필터링, 페이지네이션 기능을 구현하고, 회원 상태 변경 및 계정 정지/해제 기능을 통해 효율적인 사용자 관리 기능을 제공하였습니다.
- **일정 운영 및 관리 기능 구현**: 관리자가 전체 일정을 조회하고, 제목·호스트·지역·상태 기준 검색 및 필터링이 가능하도록 구현하였으며, 일정 공개/비공개 전환과 삭제 기능을 적용하였습니다.
- **API 연동 및 서버 상태 관리**: Axios와 TanStack Query를 활용하여 서버 데이터 조회, 캐싱, 상태 동기화를 관리하고, 사용자 동작에 따른 화면 데이터의 즉각적인 갱신 흐름을 구성하였습니다.
- **반응형 UI 및 관리자 모바일 환경 대응**: 데스크탑과 모바일 환경을 고려한 반응형 레이아웃을 적용하고, 모바일 관리자 화면에서는 Drawer 기반 메뉴 구조를 구현하여 사용성을 향상시켰습니다.


## 실행 방법

### Frontend (WithDayFront)

```bash
cd WithDayFront
npm install
npm run dev
npm run build
```

### Backend (WithDayBack)

```bash
cd WithDayBack
./gradlew build
./gradlew bootRun
```

## 환경 변수

로컬 실행 시 다음 환경 변수 설정이 필요합니다.

**Frontend (`WithDayFront/.env` 등)**

```bash
VITE_ONESIGNAL_APP_ID=
VITE_GOOGLE_CLIENT_ID=
VITE_BACKSERVER=
```

**Backend (`WithDayBack/src/main/resources/application-local.properties` 등)**

```bash
DB_URL=
DB_USERNAME=
DB_PASSWORD=
MAIL_USERNAME=
MAIL_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ONESIGNAL_APP_ID=
ONESIGNAL_API_KEY=
```

## 주요 구현 내용

- React Query를 활용해 일정 목록, 내 일정, 위시리스트 데이터를 화면 단위로 조회하고 동기화 처리.
- My Schedule 화면에서 참여중, 신청중, 호스팅 탭을 구분해 사용자 일정 상태를 쉽게 파악하도록 구성.
- 모바일 화면에서도 주요 정보가 잘리지 않도록 일정 카드와 주요 페이지의 반응형 레이아웃 적용.
- OneSignal 연동을 통해 참여 신청 및 승인 등 주요 이벤트 푸시 알림 수신 흐름 구성.
- Axios 인스턴스를 활용해 인증 토큰 포함 등 API 요청 흐름을 일관되게 관리.

## 트러블슈팅

### My Schedule 탭 전환 시 데이터 혼입 현상 해결

- **문제 상황**: `My Schedule` 화면에서 `참여중`, `신청중`, `호스팅` 탭을 빠르게 전환할 때, 이전 탭의 일정 카드가 순간적으로 남아 있거나 다른 탭의 데이터와 섞여 렌더링되는 현상 발생.
- **원인**: React Query 캐시 키가 탭 상태를 충분히 반영하지 못했고, 리스트 렌더링 경계도 명확하지 않아 이전 탭의 데이터가 재사용되어 보일 수 있는 구조였음.
- **해결 방법**: React Query의 `queryKey`에 사용자 정보와 `tab` 값을 명시적으로 포함시켜 탭별 캐시가 분리되도록 개선함.
  ```jsx
  mySchedulesByTab: (email, tab) => [
    "participation",
    "my-schedules",
    email?.trim() || "guest",
    tab?.trim() || "participating",
  ];
  ```
  리스트 아이템 `key`에도 탭 구분 값을 포함하여 부적절한 재사용을 방지함.
- **배운 점**: 조회 기준이 변하는 화면에서는 상태관리 라이브러리의 캐시 전략과 컴포넌트 재사용 경계를 함께 점검해야 함을 체감함. 이후 조회 기준이 바뀌는 화면을 구현할 때 `queryKey` 설계와 렌더링 재사용 경계를 함께 점검하는 기준을 갖게 됨.

## 프로젝트 한 줄 요약

WithDay는 일정 생성, 동행 신청, 참여 관리, 알림, 위시리스트 기능을 중심으로 사용자가 함께할 일정을 탐색하고 관리할 수 있도록 구현한 여행/일정 동행 플랫폼입니다.
