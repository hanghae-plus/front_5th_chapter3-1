import { FormControl, FormLabel, Checkbox } from '@chakra-ui/react';

interface CheckFieldProps {
  label: string;
  content: string;
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
}
export const CheckField = ({ label, content, isChecked, setIsChecked }: CheckFieldProps) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Checkbox isChecked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}>
        {content}
      </Checkbox>
    </FormControl>
  );
};
