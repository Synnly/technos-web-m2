// A simple text input component with label and error handling
import React from "react";
import type { InputProps } from "../../models/inputsModel/input.model";


export const InputText: React.FC<InputProps> = ({
  label,
  type = "text",
  placeholder = "",
  error,
  register,
  name,
  rules
}) => {
  return (
    <div className="text-7xl">
      <label>
        {label}
        <input
          type={type}
          placeholder={placeholder}
          {...(register ? register(name, rules) : {})}
          className={error ? "input-error" : ""}
        />
      </label>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};