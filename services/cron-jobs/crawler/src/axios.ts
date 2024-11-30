import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const MAX_REQUESTS_COUNT = 1;
const INTERVAL_MS = 1000;
let PENDING_REQUESTS = 0;

function setupRequestInterceptor(apiInstance: AxiosInstance): void {
  apiInstance.interceptors.request.use(function (config: InternalAxiosRequestConfig) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
          PENDING_REQUESTS++;
          clearInterval(interval);
          resolve(config);
        }
      }, INTERVAL_MS);
    });
  });
}

function setupResponseInterceptor(apiInstance: AxiosInstance): void {
  apiInstance.interceptors.response.use(
    function (response: AxiosResponse) {
      PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
      return Promise.resolve(response);
    },
    function (error: unknown) {
      PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
      return Promise.reject(error);
    },
  );
}

const createAxiosInstance = (): AxiosInstance => {
  const api = axios.create({});
  setupRequestInterceptor(api);
  setupResponseInterceptor(api);
  return api;
};

const api = createAxiosInstance();

export default api;
