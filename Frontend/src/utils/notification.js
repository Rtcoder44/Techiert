import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showNotification = {
  success: (message) => toast.success(message, defaultConfig),
  error: (message) => toast.error(message, defaultConfig),
  warning: (message) => toast.warning(message, defaultConfig),
  info: (message) => toast.info(message, defaultConfig),
};

export const showAuthError = (message = "You need to be logged in") => {
  toast.error(message, {
    ...defaultConfig,
    toastId: 'auth-error', // Prevents duplicate auth error messages
  });
};

export const showValidationError = (message) => {
  toast.warning(message, {
    ...defaultConfig,
    toastId: 'validation-error',
  });
};

export const showSuccessMessage = (message) => {
  toast.success(message, {
    ...defaultConfig,
    toastId: 'success-message',
  });
};

export const showErrorMessage = (error) => {
  const message = error?.response?.data?.message || error?.message || "Something went wrong";
  toast.error(message, {
    ...defaultConfig,
    toastId: 'error-message',
  });
}; 