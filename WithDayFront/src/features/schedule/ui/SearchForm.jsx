import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import clsx from "clsx";
import SearchIcon from "@mui/icons-material/Search";
import Button from "../../../shared/ui/Button/Button";
import { searchSchema } from "../validation/searchSchema";

import styles from "../../../page/home/Home.module.css";

/*
 * 탐색 탭의 검색 폼이다.
 * 입력값은 react-hook-form 안에서 관리하고, 사용자가 submit했을 때만 onSearchSubmit으로 검색어를 올린다.
 * 이렇게 하면 타이핑할 때마다 리스트 API가 호출되지 않고, 명시적인 검색 시점에만 react-query key가 바뀐다.
 */
export default function SearchForm({
  onSearchSubmit,
  onResetSubmit,
  submittedKeyword,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(searchSchema),
    defaultValues: { keyword: "" },
  });

  // validation을 통과한 keyword만 부모의 submittedKeyword로 반영한다.
  const onSubmit = (data) => {
    onSearchSubmit(data.keyword || "");
  };

  /*
   * 초기화는 폼 내부 입력값과 부모의 submittedKeyword를 함께 비운다.
   * 부모 상태가 비워져야 ExplorePage의 queryKey도 바뀌고, 검색어 없는 전체 목록을 다시 조회한다.
   */
  const handleReset = () => {
    reset();
    onResetSubmit();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.searchForm}
        noValidate
      >
        <div
          className={clsx(styles.searchInputWrapper, {
            [styles.inputError]: !!errors.keyword,
          })}
        >
          <SearchIcon fontSize="small" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="일정 제목 또는 설명으로 검색"
            className={styles.searchInput}
            {...register("keyword")}
          />
        </div>
        <Button type="submit" variant="accent" size="md">
          검색
        </Button>
        {submittedKeyword && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleReset}
          >
            초기화
          </Button>
        )}
      </form>
      {errors.keyword && (
        <p className={styles.errorMessage}>{errors.keyword.message}</p>
      )}
      {submittedKeyword && (
        <p className={styles.searchResultInfo}>
          <strong>"{submittedKeyword}"</strong> 검색 결과
        </p>
      )}
    </>
  );
}
