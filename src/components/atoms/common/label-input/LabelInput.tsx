import { FormControl, FormLabel, Input, InputProps } from '@chakra-ui/react';

interface LabelInputProps extends InputProps {
  title: string;
  value: string | number;
}

export const LabelInput = ({ title, value, onChange, ...props }: LabelInputProps) => {
  return (
    <FormControl>
      <FormLabel>{title}</FormLabel>
      <Input {...props} onChange={onChange} />
    </FormControl>
  );
};
