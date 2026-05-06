import * as yup from "yup";

export const searchSchema = yup.object({
    keyword: yup
        .string()
        .min(2, "검색어는 최소 2글자 이상 입력해주세요.")
        .max(30, "검색어는 최대 30글자까지 입력 가능합니다."),
});