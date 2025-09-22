// A simple text input component with label and error handling
import React from "react";
import type { InputProps } from "../../models/inputsModel/Input.model";


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
    <div className="min-w-0 w-full">
      <label>
        {label}
        <input
          type={type}
          placeholder={placeholder}
          {...(register ? register(name, rules) : {})}
          className={error ? "input-error w-full bg-neutral-200 placeholder:text-neutral-600 text-neutral-800 text-sm rounded-md px-3 py-2" : "w-full bg-neutral-200 placeholder:text-neutral-600 text-neutral-800 text-sm rounded-md px-3 py-2"}
        />
      </label>
      {error && <span className="error-message text-red-500">{error}</span>}
    </div>
  );
};