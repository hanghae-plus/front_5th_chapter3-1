import { FormControl, FormLabel, Input } from '@chakra-ui/react';

const LabelInput = (props) => {
  const { value, onChange, label, type = 'text' } = props;
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </FormControl>
  );
};

export default LabelInput;
