import React from 'react';
import { DatePicker } from 'antd';
import type { InputDatePickerProps } from './InputDatePicker.interface';

export const InputDatePicker: React.FC<InputDatePickerProps> = ({ value, onChange, placeholder, disabled, className }) => {
  return (
    <DatePicker
      value={value ?? null}
      onChange={(date) => onChange && onChange(date)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
};

export default InputDatePicker;
