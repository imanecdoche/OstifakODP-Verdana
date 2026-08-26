import {
  gooeyToast as rawGooeyToast,
  type GooeyToastOptions,
  type GooeyPromiseData,
  GooeyToaster,
} from 'goey-toast';

export const DEFAULT_TOAST_OPTIONS: GooeyToastOptions = {
  borderColor: '#E0E0E0',
  borderWidth: 1.5,
  bounce: 0.05,
  showTimestamp: false,
  duration: 3000,
  timing: {
    displayDuration: 3000,
  },
};

function mergeOptions(options?: GooeyToastOptions): GooeyToastOptions {
  return {
    ...DEFAULT_TOAST_OPTIONS,
    ...options,
    borderColor: options?.borderColor ?? DEFAULT_TOAST_OPTIONS.borderColor,
    borderWidth: options?.borderWidth ?? DEFAULT_TOAST_OPTIONS.borderWidth,
    bounce: options?.bounce ?? DEFAULT_TOAST_OPTIONS.bounce,
    showTimestamp: options?.showTimestamp ?? DEFAULT_TOAST_OPTIONS.showTimestamp,
    duration: options?.duration ?? DEFAULT_TOAST_OPTIONS.duration,
    timing: options?.timing ?? DEFAULT_TOAST_OPTIONS.timing,
  };
}

export const gooeyToast = Object.assign(
  (title: string, options?: GooeyToastOptions) => rawGooeyToast(title, mergeOptions(options)),
  {
    success: (title: string, options?: GooeyToastOptions) => rawGooeyToast.success(title, mergeOptions(options)),
    error: (title: string, options?: GooeyToastOptions) => rawGooeyToast.error(title, mergeOptions(options)),
    warning: (title: string, options?: GooeyToastOptions) => rawGooeyToast.warning(title, mergeOptions(options)),
    info: (title: string, options?: GooeyToastOptions) => rawGooeyToast.info(title, mergeOptions(options)),
    promise: <T>(promise: Promise<T>, data: GooeyPromiseData<T>) =>
      rawGooeyToast.promise(promise, {
        ...data,
        borderColor: data.borderColor ?? DEFAULT_TOAST_OPTIONS.borderColor,
        borderWidth: data.borderWidth ?? DEFAULT_TOAST_OPTIONS.borderWidth,
        bounce: data.bounce ?? DEFAULT_TOAST_OPTIONS.bounce,
        showTimestamp: data.showTimestamp ?? DEFAULT_TOAST_OPTIONS.showTimestamp,
        duration: data.duration ?? DEFAULT_TOAST_OPTIONS.duration,
        timing: data.timing ?? DEFAULT_TOAST_OPTIONS.timing,
      }),
    dismiss: rawGooeyToast.dismiss,
    update: rawGooeyToast.update,
  }
);

export { GooeyToaster };
