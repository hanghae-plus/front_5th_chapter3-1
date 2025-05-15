import { Checkbox, CheckboxProps, FormControl, FormLabel } from '@chakra-ui/react';

interface FormCheckboxProps extends CheckboxProps {
  title: string;
  description: string;
}

export const FormCheckbox = ({ title, description, ...props }: FormCheckboxProps) => {
  return (
    <FormControl>
      <FormLabel>{title}</FormLabel>
      <Checkbox {...props}>{description}</Checkbox>
    </FormControl>
  );
};
