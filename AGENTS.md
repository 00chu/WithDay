# AGENTS.md

## 기본 응답 규칙

- 모든 설명과 작업 요약은 한국어로 작성한다.
- 코드의 변수명, 함수명, 클래스명은 영어로 작성한다.
- 기존 코드 스타일과 폴더 구조를 우선 유지한다.
- 사용자가 요청하지 않은 대규모 리팩토링은 하지 않는다.
- 기능을 추가하거나 수정할 때 기존 기능이 깨지지 않도록 최소 변경을 우선한다.
- 변경 전후로 관련 파일의 흐름을 확인하고, 필요한 경우 영향 범위를 함께 설명한다.

## 프로젝트 개요

이 프로젝트는 WithDay 여행/일정 동행 플랫폼이다.

사용자는 일정을 생성하고, 다른 사용자는 일정에 참여 신청할 수 있다.
호스트는 참여 신청을 승인하거나 거절할 수 있으며, 마이페이지에서 참여 이력과 사용자 정보를 확인한다.

## 기술 스택

### Frontend

- React
- Vite
- React Router
- TanStack Query
- Zustand
- Axios
- React Hook Form
- Yup
- CSS Modules
- MUI 일부 사용

### Backend

- Java
- Spring Boot
- Spring MVC
- Spring Security
- MyBatis
- MySQL
- JWT

## 프론트엔드 작업 규칙

- 기존 CSS Module 구조를 유지한다.
- JSX와 CSS는 가능하면 분리해서 작성한다.
- UI 수정 시 기존 className을 최대한 유지한다.
- 반응형 수정은 데스크탑 화면을 깨지 않도록 모바일 media query 중심으로 적용한다.
- Header와 BottomNav가 고정되어 있는 구조를 고려한다.
- API 호출은 기존 axios 인스턴스 또는 기존 API 유틸 구조를 우선 사용한다.
- React Query를 이미 사용하는 데이터는 임의로 useEffect fetch 구조로 바꾸지 않는다.
- Zustand auth 상태 구조를 임의로 변경하지 않는다.
- 폼 처리는 기존 React Hook Form + Yup 구조를 우선 유지한다.

## 백엔드 작업 규칙

- Controller → Service → Mapper/Repository → DB 흐름을 유지한다.
- Controller에는 요청/응답 처리만 두고, 비즈니스 로직은 Service에 둔다.
- SQL은 MyBatis Mapper 기준으로 작성한다.
- DB 컬럼명과 DTO 필드명을 확인한 뒤 수정한다.
- 인증이 필요한 API는 기존 Spring Security/JWT 흐름을 따른다.
- 기존 응답 형식을 임의로 바꾸지 않는다.

## 데이터 기준

### 마이페이지 통계 기준

- 함께한 일정 수는 다음 조건을 기준으로 계산한다.

  - 사용자가 호스트로 만든 completed 일정
  - 사용자가 approved 상태로 참여한 completed 일정
  - 중복 schedule은 DISTINCT 처리한다.

- 만난 위트 수는 함께한 completed 일정에서 본인을 제외한 user_id를 중복 없이 계산한다.

## 코딩 스타일

- React 컴포넌트는 함수형 컴포넌트와 Hooks를 사용한다.
- 비동기 처리는 async/await를 우선 사용한다.
- 에러 처리는 try-catch 또는 React Query의 error 상태를 활용한다.
- 중복 코드는 줄이되, 무리한 추상화는 피한다.
- TypeScript 파일에서는 any 사용을 피한다.
- JavaScript 파일에서는 기존 코드 스타일을 우선한다.

## 보안 규칙

- 민감 정보는 .env 또는 서버 환경 변수로 관리한다.
- .env 파일은 Git에 커밋하지 않는다.
- API Key, JWT Secret, DB 비밀번호를 코드에 직접 작성하지 않는다.
- 사용자 비밀번호는 평문 저장하지 않는다.
- 인증/인가 로직을 우회하는 코드를 작성하지 않는다.

## 환경 변수 예시

### Frontend

```bash
VITE_API_URL=
VITE_ONESIGNAL_APP_ID=
```
