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

- **Deploy**: AWS S3, CloudFront, Docker
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
      └── src/main/resources/    # 프로파일별 설정 파일 및 MyBatis Mapper XML
```

## 담당 역할

- **일정 생성 및 수정 기능 구현**: React Hook Form과 Yup을 활용한 복합 Form 유효성 검증을 적용하고, Multipart 요청을 통해 일정 정보, 상세 일정, 이미지 데이터를 하나의 요청으로 처리하도록 구현.
- **일정 탐색 및 상세 화면 구현**: React Query와 Axios를 활용하여 일정 목록 및 상세 데이터를 조회하고, 사용자 조건에 따른 일정 탐색 UI와 화면 흐름을 구성.
- **마이페이지 기능 구현**: 프로필 조회 및 수정, 비밀번호 변경, 관심사 관리, 마이페이지 요약 등 사용자 개인화 기능 구현.
- **알림 시스템 및 OneSignal Push 알림 구현**: JWT 기반 사용자별 알림 조회, 읽음 처리 및 삭제 기능을 구현하고, OneSignal external_id 연동을 통해 일정 참여 상태 변경 시 실시간 브라우저 Push 알림을 제공.
- **React Query 기반 서버 상태 관리 및 캐시 최적화**: 사용자별 queryKey 분리를 적용하여 계정 변경 시 캐시 데이터 충돌을 방지하고, invalidateQueries를 활용해 알림 상태 변경 후 UI 데이터를 최신 상태로 동기화.
- **관리자 페이지 구현**: 관리자 전용 사이드바, 모바일 헤더, 대시보드 및 회원·일정·이용약관·관심사·추천 일정 관리 화면 구현.
- **프론트엔드 배포 및 운영 환경 구성**: AWS S3와 CloudFront를 활용한 정적 파일 배포 환경을 구성하고, GitHub Actions 기반 CI/CD 파이프라인을 적용하여 자동 배포 환경 구축.


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

### 로그인 계정 변경 시 이전 사용자의 알림 데이터가 유지되는 문제 해결

- **문제 상황**: 기존 사용자가 로그아웃한 뒤 다른 계정으로 로그인했을 때, 페이지를 새로고침하지 않으면 이전 사용자의 알림 목록이 화면에 그대로 표시되는 현상이 발생하였습니다.
- **원인**: React Query의 `queryKey`가 사용자 정보를 포함하지 않은 상태로 구성되어 있어, 계정이 변경되어도 동일한 Query로 인식되었습니다. 이로 인해 이전 로그인 사용자의 알림 캐시 데이터가 새로운 사용자 화면에서 재사용되는 문제가 발생하였습니다.
- **해결 방법**: `queryKey`에 로그인한 사용자의 이메일 정보를 포함하여 사용자별로 캐시를 분리하였습니다. 또한 `enabled` 옵션을 활용하여 사용자 이메일이 존재할 때만 API 요청이 실행되도록 개선하였습니다.

```jsx
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", loginUser?.email],
    queryFn: getNotifications,
    enabled: !!loginUser?.email,
  });
```

 이를 통해 계정 변경 시 React Query가 새로운 Query로 인식하여 최신 알림 데이터를 다시 요청하도록 수정하였으며, 로그인 정보가 없는 상태에서 발생하는 불필요한 API 호출도 방지하였습니다.
- **배운 점**: React Query의 캐시는 `queryKey`를 기준으로 관리된다는 점을 알게 되었습니다. 따라서 사용자, 탭, 필터 등 조회 조건이 변경되는 화면에서는 해당 조건을 `queryKey`에 명확히 포함하여 캐시 범위를 설계해야 한다는 점을 배웠습니다.


## 프로젝트 한 줄 요약

WithDay는 일정 생성, 동행 신청, 참여 관리, 알림, 위시리스트 기능을 중심으로 사용자가 함께할 일정을 탐색하고 관리할 수 있도록 구현한 여행/일정 동행 플랫폼입니다.
