import { useController } from "react-hook-form";

const RHFNumberInput = ({
  name,
  control,
  min,
  max,
  className,
  suffix,
  ...rest
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const value = raw === "" ? null : Number(raw);

    field.onChange(value);
  };

  return (
    <div>
      <input
        {...rest}
        value={field.value ?? ""}
        onChange={handleChange}
        onBlur={field.onBlur}
        className={`${className ?? ""} ${error ? "error" : ""}`}
      />

      {suffix && <span>{suffix}</span>}

      {error && <p className="errorText">{error.message}</p>}
    </div>
  );
};

export default RHFNumberInput;
