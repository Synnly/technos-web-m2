import React from 'react';
import { Input } from 'antd';
import type { InputTextProps } from './InputText.interface';

export const InputText: React.FC<InputTextProps> = ({ value, onChange, placeholder, disabled, name, className, autoFocus }) => {
  return (
    <Input
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

export default InputText;
