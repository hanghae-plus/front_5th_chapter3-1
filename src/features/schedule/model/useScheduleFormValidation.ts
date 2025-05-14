import { useToast } from '@chakra-ui/react';

export const useScheduleFormValidation = () => {
  const toast = useToast();

  const validateRequiredFieldsCheck = (
    title: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  };

  const validateTimeRangeCheck = (startTimeError: string | null, endTimeError: string | null) => {
    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  };

  return { validateRequiredFieldsCheck, validateTimeRangeCheck };
};
