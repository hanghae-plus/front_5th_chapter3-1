import { FormControl, FormLabel, Input, InputProps, Tooltip } from '@chakra-ui/react';
interface FormTimeInputProps extends InputProps {
  title: string;
  startTimeError: string | null;
  endTimeError: string | null;
}
export const FormTimeInput = ({
  title,
  startTimeError,
  endTimeError,
  ...props
}: FormTimeInputProps) => {
  return (
    <FormControl>
      <FormLabel>{title}</FormLabel>
      <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
        <Input type="time" {...props} />
      </Tooltip>
    </FormControl>
  );
};
