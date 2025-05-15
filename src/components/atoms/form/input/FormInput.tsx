import { FormControl, FormLabel, Input, InputProps } from '@chakra-ui/react';

interface FormInputProps extends InputProps {
  title: string;
  value: string | number;
}

export const FormInput = ({ title, value, onChange, ...props }: FormInputProps) => {
  return (
    <FormControl>
      <FormLabel>{title}</FormLabel>
      <Input {...props} onChange={onChange} />
    </FormControl>
  );
};
