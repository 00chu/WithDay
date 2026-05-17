import styles from "./Form.module.css";

// 💡 props 설명
// label: 입력창 위쪽에 띄울 텍스트 (예: "이메일")
// error: Yup 검증 실패 시 받아올 빨간 글씨 객체 (예: { message: "이메일을 입력해주세요." })
// helperText: 평상시에 띄워줄 안내 문구 (에러가 아닐 때 보임)
// children: 이 <FormField> 태그 '사이'에 들어올 모든 자식 태그들! (여기에 <Input>이 통째로 쏙 들어옴)
const FormField = ({ label, error, helperText, children }) => {
  return (
    <div className={styles.field}>
      {/* 1. 라벨(label) 값이 전달됐으면 화면에 그림 */}
      {label && <label className={styles.label}>{label}</label>}

      {/* 2. ⭐️ 자식 태그(<Input> 등)가 들어갈 자리! 
          Login.jsx에서 썼던 <FormField> ... <Input /> ... </FormField> 의 <Input>이 이 위치에 고스란히 렌더링됨. */}
      {children}

      {/* 3. 에러 처리 로직 */}
      {error ? (
        // 에러 객체가 존재하면 무조건 빨간색 에러 문구를 띄움
        <span className={styles.errorText}>{error.message}</span>
      ) : (
        // 에러가 없고 헬퍼 텍스트(안내 문구)가 있으면 안내 문구를 띄움
        helperText && <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
};

export default FormField;