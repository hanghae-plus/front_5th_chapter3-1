import { FormControl, FormLabel, Input, InputProps } from '@chakra-ui/react';

interface FormFieldProps extends Omit<InputProps, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const InputField = ({ label, value, onChange, ...inputProps }: FormFieldProps) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Input value={value} onChange={(e) => onChange(e.target.value)} {...inputProps} />
    </FormControl>
  );
};
