import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import clsx from "clsx";
import SearchIcon from "@mui/icons-material/Search";
import Button from "../../../shared/ui/Button/Button";
import { searchSchema } from "../validation/searchSchema";

// 스타일은 Home.module.css 또는 별도의 모듈을 연결해서 사용하세요.
import styles from "../../../page/home/Home.module.css";

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

  const onSubmit = (data) => {
    onSearchSubmit(data.keyword || "");
  };

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
            placeholder="지역, 제목으로 검색"
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
