import {
  gooeyToast as rawGooeyToast,
  type GooeyToastOptions,
  type GooeyPromiseData,
  GooeyToaster,
} from 'goey-toast';

export const DEFAULT_TOAST_DURATION = 3000; // 3.0 detik untuk toast reguler
export const DESCRIPTION_TOAST_DURATION = 3500; // 3.5 detik untuk toast dengan deskripsi

export const DEFAULT_TOAST_OPTIONS: GooeyToastOptions = {
  borderColor: '#E0E0E0',
  borderWidth: 1.5,
  bounce: 0.05,
  showTimestamp: false,
};

function mergeOptions(options?: GooeyToastOptions): GooeyToastOptions {
  const hasDesc = Boolean(options?.description);
  const targetDuration = hasDesc ? DESCRIPTION_TOAST_DURATION : DEFAULT_TOAST_DURATION;

  return {
    ...DEFAULT_TOAST_OPTIONS,
    ...options,
    borderColor: options?.borderColor ?? DEFAULT_TOAST_OPTIONS.borderColor,
    borderWidth: options?.borderWidth ?? DEFAULT_TOAST_OPTIONS.borderWidth,
    bounce: options?.bounce ?? DEFAULT_TOAST_OPTIONS.bounce,
    showTimestamp: options?.showTimestamp ?? DEFAULT_TOAST_OPTIONS.showTimestamp,
    duration: options?.duration ?? targetDuration,
    timing: options?.timing ?? {
      displayDuration: targetDuration,
    },
  };
}

export const gooeyToast = Object.assign(
  (title: string, options?: GooeyToastOptions) => rawGooeyToast(title, mergeOptions(options)),
  {
    success: (title: string, options?: GooeyToastOptions) => rawGooeyToast.success(title, mergeOptions(options)),
    error: (title: string, options?: GooeyToastOptions) => rawGooeyToast.error(title, mergeOptions(options)),
    warning: (title: string, options?: GooeyToastOptions) => rawGooeyToast.warning(title, mergeOptions(options)),
    info: (title: string, options?: GooeyToastOptions) => rawGooeyToast.info(title, mergeOptions(options)),
    promise: <T>(promise: Promise<T>, data: GooeyPromiseData<T>) => {
      const hasDesc = Boolean((data as any).description);
      const targetDuration = hasDesc ? DESCRIPTION_TOAST_DURATION : DEFAULT_TOAST_DURATION;
      return rawGooeyToast.promise(promise, {
        ...data,
        borderColor: (data as any).borderColor ?? DEFAULT_TOAST_OPTIONS.borderColor,
        borderWidth: (data as any).borderWidth ?? DEFAULT_TOAST_OPTIONS.borderWidth,
        bounce: (data as any).bounce ?? DEFAULT_TOAST_OPTIONS.bounce,
        showTimestamp: (data as any).showTimestamp ?? DEFAULT_TOAST_OPTIONS.showTimestamp,
        timing: (data as any).timing ?? {
          displayDuration: targetDuration,
        },
      } as any);
    },
    dismiss: rawGooeyToast.dismiss,
    update: rawGooeyToast.update,
  }
);

export { GooeyToaster };
