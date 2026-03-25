import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMainStore } from "@/store";
import { axiosInstance, baseURL } from "./auth-interceptor";

export { baseURL };

interface ColeAPIOptions {
  endpoint: string;
  method?: string;
  params?: object;
  idempotencyKey?: string | (() => string);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// generates a unique idempotency key for a request
export const generateIdempotencyKey = () => crypto.randomUUID();

export const coleAPI =
  (
    endpointOrOptions: string | ColeAPIOptions,
    method?: string,
    params?: object
  ) =>
  async (data: object) => {
    const token = useMainStore.getState().token;
    let response;

    // support both legacy (string, method, params) and new options object
    const options: ColeAPIOptions =
      typeof endpointOrOptions === "string"
        ? { endpoint: endpointOrOptions, method, params }
        : endpointOrOptions;

    const { endpoint, idempotencyKey } = options;
    const requestMethod = options.method?.toUpperCase();

    // resolve key lazily — supports both string and getter
    const buildHeaders = () => {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      const key =
        typeof idempotencyKey === "function"
          ? idempotencyKey()
          : idempotencyKey;
      if (key) {
        headers["Idempotency-Key"] = key;
      }
      return headers;
    };

    switch (requestMethod) {
      case "POST":
        response = await axiosInstance.post(endpoint, data, {
          headers: buildHeaders(),
          withCredentials: true,
        });
        return response.data;

      case "PATCH":
        response = await axiosInstance.patch(endpoint, data, {
          headers: buildHeaders(),
          withCredentials: true,
        });
        return response.data;

      case "PUT":
        response = await axiosInstance.put(endpoint, data, {
          headers: buildHeaders(),
          withCredentials: true,
        });
        return response.data;

      case "DELETE":
        response = await axiosInstance.delete(endpoint, {
          headers: buildHeaders(),
          withCredentials: true,
          data: data,
        });
        return response.data;

      default:
        // GET request - no idempotency needed
        response = await axiosInstance.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          params: options.params,
        });
        return response.data;
    }
  };

export const handlePhotoUrl = (imgPath?: string | null) => {
  if (!imgPath)
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${crypto.randomUUID()}`;
  return `${baseURL}/uploads/${imgPath}`;
};

export const formatTime = (time: number) => {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  return `${hours}h ${minutes}m`;
};

// formats a date as a local datetime string for datetime-local inputs
export const toLocalDatetime = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export const formatDateTime = (dateString: string | Date | number) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
};
