import { UseToastOptions } from '@chakra-ui/react';

export const createEventToasts = (toast: (options: UseToastOptions) => void) => {
  const showSuccessToast = (message: string) => {
    toast({
      title: message,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const showErrorToast = (message: string) => {
    toast({
      title: message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  const showInfoToast = (message: string, duration = 3000) => {
    toast({
      title: message,
      status: 'info',
      duration,
      isClosable: true,
    });
  };

  return {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
  };
};
