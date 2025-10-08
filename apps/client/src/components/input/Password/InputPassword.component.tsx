import React from 'react';
import { Input } from 'antd';
import type { InputPasswordProps } from './InputPassword.interface';

export const InputPassword: React.FC<InputPasswordProps> = ({ value, onChange, placeholder, disabled, name, className, autoFocus }) => {
  return (
    <Input.Password
      value={value ?? ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      name={name}
      className={className}
      autoFocus={autoFocus}
    />
  );
};

export default InputPassword;
