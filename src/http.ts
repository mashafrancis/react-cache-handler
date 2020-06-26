import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { cache } from "./cacheHandler";
import { setupCache } from 'axios-cache-adapter'

const cacheAdapter = setupCache({
  maxAge: 15 * 60 * 1000
});

// const proxyUrl = 'https://cors-anywhere.herokuapp.com/',
//   proxyTargetUrl = 'http://api.openweathermap.org/data/2.5'

const http = axios.create({
  baseURL: 'http://api.openweathermap.org/data/2.5',
  withCredentials: true,
  adapter: cacheAdapter.adapter,
});

const whitelist = ['auth'];

const isUrlWhiteListed = (url: string) => whitelist.includes(url.split('/')[1]);

const responseHandler = (response: AxiosResponse<any>): AxiosResponse<any> => {
  const {method, url} = response.config;
  if (method === 'GET' || 'get') {
    if (url && !isUrlWhiteListed(url)) {
      console.log('Storing in cache');
      cache.store(url, JSON.stringify(response.data));
    }
  }
  return response;
}

const errorHandler = (error: AxiosError) => {
  // const {cached} = error.response;
  if (error.response?.config === true) {
    console.log('Cache found! Serving it directly.');
    return Promise.resolve(error);
  }
  return Promise.reject(error);
}

const requestHandler = (request: AxiosRequestConfig) => {
  const {method, url} = request;
  if (method === 'GET' || 'get') {
    const checkValidityOfResponse = cache.isValid(url ?? '');
    if (checkValidityOfResponse.isValid) {
      console.log('Serving cached data');
      request.headers.cached = true;
      request.data = JSON.parse(checkValidityOfResponse.value ?? '{}');
      return Promise.reject(request);
    }
  }
  return request;
}

http.interceptors.request.use((request => requestHandler(request)));
http.interceptors.response.use(
  response => responseHandler(response),
  error => errorHandler(error),
);

export default http;
