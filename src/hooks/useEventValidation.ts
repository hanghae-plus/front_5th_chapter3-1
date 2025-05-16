import { useToast } from '@chakra-ui/react';

import { EventFormState } from '../types';

const useEventValidation = () => {
  const toast = useToast();

  const validate = (
    eventFormData: EventFormState,
    startTimeError: string | null,
    endTimeError: string | null
  ) => {
    const { title, date, startTime, endTime } = eventFormData;
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  return { validate };
};

export default useEventValidation;
