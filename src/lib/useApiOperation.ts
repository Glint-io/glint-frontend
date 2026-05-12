import { useState, useCallback } from "react";
import { glintToast } from "@/components/ui/toast";

interface UseApiOperationOptions<T> {
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (error: unknown) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string | ((data: T) => string);
  errorMessage?: string | ((error: unknown) => string);
}

interface UseApiOperationResult<T> {
  execute: (
    fn: () => Promise<Response>,
    options?: Partial<UseApiOperationOptions<T>>
  ) => Promise<T | null>;
  isLoading: boolean;
  error: unknown | null;
}

const resolveErrorMessage = (
  errorMessage: string | ((error: unknown) => string),
  err: unknown
): string =>
  typeof errorMessage === "string" ? errorMessage : errorMessage(err);

export function useApiOperation<T = void>(
  defaultOptions: UseApiOperationOptions<T> = {}
): UseApiOperationResult<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const execute = useCallback(
    async (
      fn: () => Promise<Response>,
      options?: Partial<UseApiOperationOptions<T>>
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      const mergedOptions = { ...defaultOptions, ...options };
      const {
        onSuccess,
        onError,
        showSuccessToast = true,
        showErrorToast = true,
        successMessage = "Operation completed successfully",
        errorMessage = "An error occurred. Please try again.",
      } = mergedOptions;

      try {
        const response = await fn();

        if (!response.ok) {
          let errorText: string = resolveErrorMessage(
            errorMessage,
            new Error(response.statusText)
          );

          try {
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
              const data = (await response.json()) as Record<string, unknown>;
              const serverError = data.error || data.message;
              if (typeof serverError === "string") {
                errorText = serverError;
              }
            } else {
              const text = await response.text();
              if (text) {
                errorText = text;
              }
            }
          } catch {
            errorText = resolveErrorMessage(
              errorMessage,
              new Error(response.statusText)
            );
          }

          if (showErrorToast) {
            glintToast.error({ message: errorText });
          }

          const err = new Error(errorText);
          setError(err);
          onError?.(err);
          return null;
        }

        let data: T;
        if (
          response.status === 204 ||
          response.headers.get("content-length") === "0"
        ) {
          data = undefined as T;
        } else {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            data = (await response.json()) as T;
          } else {
            data = (await response.text()) as T;
          }
        }

        if (showSuccessToast) {
          const message =
            typeof successMessage === "string"
              ? successMessage
              : successMessage(data);
          glintToast.success({ message });
        }

        if (onSuccess) {
          await onSuccess(data);
        }

        return data;
      } catch (err) {
        if (showErrorToast) {
          glintToast.error({ message: resolveErrorMessage(errorMessage, err) });
        }
        setError(err);
        onError?.(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultOptions]
  );

  return { execute, isLoading, error };
}