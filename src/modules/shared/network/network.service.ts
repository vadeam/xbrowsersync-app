import { Injectable } from 'angular-ts-decorators';
import {
  BaseError,
  HttpRequestAbortedError,
  HttpRequestFailedError,
  HttpRequestTimedOutError,
  NetworkConnectionError
} from '../errors/errors';

@Injectable('NetworkService')
export class NetworkService {
  private $q: ng.IQService;

  static $inject = ['$q'];
  constructor($q: ng.IQService) {
    this.$q = $q;
  }

  checkNetworkConnection(): ng.IPromise<void> {
    return this.$q((resolve, reject) => {
      if (this.isNetworkConnected()) {
        return resolve();
      }
      reject(new NetworkConnectionError());
    });
  }

  getErrorFromHttpResponse(response: ng.IHttpResponse<unknown>): BaseError {
    let error: BaseError;
    switch (true) {
      // Request timed out
      case response.xhrStatus === 'timeout':
        error = new HttpRequestTimedOutError();
        break;
      // Request timed out
      case response.xhrStatus === 'abort':
        error = new HttpRequestAbortedError();
        break;
      // Otherwise generic request failed
      default:
        error = new HttpRequestFailedError(`status: ${response.status}`);
    }
    return error;
  }

  isNetworkConnected(): boolean {
    // `window` is unavailable in service worker context — fall back to the worker navigator
    const hasWindow = typeof window !== 'undefined';
    // eslint-disable-next-line no-undef, no-restricted-globals
    const nav: Navigator | undefined = hasWindow ? window.navigator : self.navigator;
    const Connection = hasWindow ? (window as any).Connection : undefined;
    return Connection && (nav as any)?.connection && (nav as any).connection.type
      ? (nav as any).connection.type !== Connection.NONE && (nav as any).connection.type !== Connection.UNKNOWN
      : (nav?.onLine ?? true);
  }

  isNetworkConnectionError(err: Error): boolean {
    return err instanceof HttpRequestTimedOutError || err instanceof NetworkConnectionError;
  }
}
