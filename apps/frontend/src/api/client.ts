export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5100";

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { query, body, headers, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${path}`;

  if (query) {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    }

    const queryString = searchParams.toString();

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const requestHeaders = new Headers(headers);

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw {
      code: "INVALID_RESPONSE",
      message: `Server returned an invalid response (${response.status}).`,
      status: response.status
    } satisfies ApiError;
  }

  if (!response.ok || !payload.success) {
    if (!payload.success) {
      throw {
        code: payload.error.code,
        message: payload.error.message,
        status: response.status
      } satisfies ApiError;
    }

    throw {
      code: "HTTP_ERROR",
      message: `Request failed with status ${response.status}.`,
      status: response.status
    } satisfies ApiError;
  }

  return payload.data;
}

export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const value = error as Record<string, unknown>;

  return (
    typeof value.code === "string" &&
    typeof value.message === "string" &&
    typeof value.status === "number"
  );
}

export function toErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}