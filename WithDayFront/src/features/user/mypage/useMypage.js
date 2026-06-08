import { useQuery } from "@tanstack/react-query";
import { getMypageData, getUserProfileData } from "./api";

export const useMypage = (targetEmail, enabled = true) => {
  const mypageQuery = useQuery({
    // 내 프로필과 타인 프로필 캐시를 분리해 캐시 오염으로 서로의 데이터가 섞이지 않게 한다.
    queryKey: ["mypage", targetEmail ?? "me"],
    // targetEmail 이 없으면 내 프로필, 있으면 공개 프로필 조회로 보내는 단일 진입 훅이다.
    queryFn: () =>
      targetEmail ? getUserProfileData(targetEmail) : getMypageData(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    // Header 처럼 로그인 전에도 렌더되는 호출부에서 불필요한 요청을 막기 위한 옵션이다.
    enabled,
  });

  return {
    mypageQuery,
  };
};
