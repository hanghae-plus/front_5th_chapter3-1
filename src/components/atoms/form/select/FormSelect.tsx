import { FormControl, FormLabel, Select, SelectProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface FormSelectProps extends SelectProps {
  title: string;
  children: ReactNode;
}

export const FormSelect = ({ title, children, ...props }: FormSelectProps) => {
  return (
    <FormControl>
      <FormLabel>{title}</FormLabel>
      <Select {...props}>{children}</Select>
    </FormControl>
  );
};
