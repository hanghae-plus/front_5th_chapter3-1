// src/features/event-form/ui/SelectField.tsx
import { FormControl, FormLabel, Select, SelectProps } from '@chakra-ui/react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends Omit<SelectProps, 'onChange'> {
  label: string;
  value: string | number;
  options: Option[];
  onChange: (value: string | number) => void; // 수정된 부분
  type?: 'number' | 'string';
}

export const SelectField = ({
  label,
  value,
  options,
  onChange,
  type = 'string',
}: SelectFieldProps) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Select
        value={value}
        onChange={(e) => {
          const value = e.target.value;
          // type prop에 따라 적절한 타입으로 변환
          onChange(type === 'number' ? Number(value) : value);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};
