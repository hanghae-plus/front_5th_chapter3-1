import { useToast, UseToastOptions } from '@chakra-ui/react';

export const useToastMessage = () => {
  const toast = useToast();

  const showToast = (options: UseToastOptions) => {
    const defaultOptions: UseToastOptions = {
      duration: 3000,
      isClosable: true,
    };

    toast({
      ...defaultOptions,
      ...options,
    });
  };

  const showSuccessToast = (message: string) => {
    showToast({
      title: message,
      status: 'success',
    });
  };

  const showErrorToast = (message: string) => {
    showToast({
      title: message,
      status: 'error',
    });
  };

  const showInfoToast = (message: string) => {
    showToast({
      title: message,
      status: 'info',
    });
  };

  const showWarningToast = (message: string) => {
    showToast({
      title: message,
      status: 'warning',
    });
  };

  return {
    showToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
  };
};
