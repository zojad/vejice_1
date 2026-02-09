/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/lib/adapters/adapters.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/adapters/adapters.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _http_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./http.js */ "./node_modules/axios/lib/helpers/null.js");
/* harmony import */ var _xhr_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./xhr.js */ "./node_modules/axios/lib/adapters/xhr.js");
/* harmony import */ var _fetch_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./fetch.js */ "./node_modules/axios/lib/adapters/fetch.js");
/* harmony import */ var _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/AxiosError.js */ "./node_modules/axios/lib/core/AxiosError.js");






const knownAdapters = {
  http: _http_js__WEBPACK_IMPORTED_MODULE_1__["default"],
  xhr: _xhr_js__WEBPACK_IMPORTED_MODULE_2__["default"],
  fetch: _fetch_js__WEBPACK_IMPORTED_MODULE_3__["default"]
}

_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, 'name', {value});
    } catch (e) {
      // eslint-disable-next-line no-empty
    }
    Object.defineProperty(fn, 'adapterName', {value});
  }
});

const renderReason = (reason) => `- ${reason}`;

const isResolvedHandle = (adapter) => _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFunction(adapter) || adapter === null || adapter === false;

/* harmony default export */ __webpack_exports__["default"] = ({
  getAdapter: (adapters) => {
    adapters = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(adapters) ? adapters : [adapters];

    const {length} = adapters;
    let nameOrAdapter;
    let adapter;

    const rejectedReasons = {};

    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      let id;

      adapter = nameOrAdapter;

      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

        if (adapter === undefined) {
          throw new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_4__["default"](`Unknown adapter '${id}'`);
        }
      }

      if (adapter) {
        break;
      }

      rejectedReasons[id || '#' + i] = adapter;
    }

    if (!adapter) {

      const reasons = Object.entries(rejectedReasons)
        .map(([id, state]) => `adapter ${id} ` +
          (state === false ? 'is not supported by the environment' : 'is not available in the build')
        );

      let s = length ?
        (reasons.length > 1 ? 'since :\n' + reasons.map(renderReason).join('\n') : ' ' + renderReason(reasons[0])) :
        'as no adapter specified';

      throw new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_4__["default"](
        `There is no suitable adapter to dispatch the request ` + s,
        'ERR_NOT_SUPPORT'
      );
    }

    return adapter;
  },
  adapters: knownAdapters
});


/***/ }),

/***/ "./node_modules/axios/lib/adapters/fetch.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/adapters/fetch.js ***!
  \**************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _platform_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../platform/index.js */ "./node_modules/axios/lib/platform/index.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/AxiosError.js */ "./node_modules/axios/lib/core/AxiosError.js");
/* harmony import */ var _helpers_composeSignals_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../helpers/composeSignals.js */ "./node_modules/axios/lib/helpers/composeSignals.js");
/* harmony import */ var _helpers_trackStream_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers/trackStream.js */ "./node_modules/axios/lib/helpers/trackStream.js");
/* harmony import */ var _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/AxiosHeaders.js */ "./node_modules/axios/lib/core/AxiosHeaders.js");
/* harmony import */ var _helpers_progressEventReducer_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../helpers/progressEventReducer.js */ "./node_modules/axios/lib/helpers/progressEventReducer.js");
/* harmony import */ var _helpers_resolveConfig_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../helpers/resolveConfig.js */ "./node_modules/axios/lib/helpers/resolveConfig.js");
/* harmony import */ var _core_settle_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/settle.js */ "./node_modules/axios/lib/core/settle.js");










const isFetchSupported = typeof fetch === 'function' && typeof Request === 'function' && typeof Response === 'function';
const isReadableStreamSupported = isFetchSupported && typeof ReadableStream === 'function';

// used only inside the fetch adapter
const encodeText = isFetchSupported && (typeof TextEncoder === 'function' ?
    ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) :
    async (str) => new Uint8Array(await new Response(str).arrayBuffer())
);

const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false
  }
}

const supportsRequestStream = isReadableStreamSupported && test(() => {
  let duplexAccessed = false;

  const hasContentType = new Request(_platform_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].origin, {
    body: new ReadableStream(),
    method: 'POST',
    get duplex() {
      duplexAccessed = true;
      return 'half';
    },
  }).headers.has('Content-Type');

  return duplexAccessed && !hasContentType;
});

const DEFAULT_CHUNK_SIZE = 64 * 1024;

const supportsResponseStream = isReadableStreamSupported &&
  test(() => _utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isReadableStream(new Response('').body));


const resolvers = {
  stream: supportsResponseStream && ((res) => res.body)
};

isFetchSupported && (((res) => {
  ['text', 'arrayBuffer', 'blob', 'formData', 'stream'].forEach(type => {
    !resolvers[type] && (resolvers[type] = _utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isFunction(res[type]) ? (res) => res[type]() :
      (_, config) => {
        throw new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_2__["default"](`Response type '${type}' is not supported`, _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_2__["default"].ERR_NOT_SUPPORT, config);
      })
  });
})(new Response));

const getBodyLength = async (body) => {
  if (body == null) {
    return 0;
  }

  if(_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isBlob(body)) {
    return body.size;
  }

  if(_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isSpecCompliantForm(body)) {
    const _request = new Request(_platform_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].origin, {
      method: 'POST',
      body,
    });
    return (await _request.arrayBuffer()).byteLength;
  }

  if(_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isArrayBufferView(body) || _utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isArrayBuffer(body)) {
    return body.byteLength;
  }

  if(_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isURLSearchParams(body)) {
    body = body + '';
  }

  if(_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isString(body)) {
    return (await encodeText(body)).byteLength;
  }
}

const resolveBodyLength = async (headers, body) => {
  const length = _utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].toFiniteNumber(headers.getContentLength());

  return length == null ? getBodyLength(body) : length;
}

/* harmony default export */ __webpack_exports__["default"] = (isFetchSupported && (async (config) => {
  let {
    url,
    method,
    data,
    signal,
    cancelToken,
    timeout,
    onDownloadProgress,
    onUploadProgress,
    responseType,
    headers,
    withCredentials = 'same-origin',
    fetchOptions
  } = (0,_helpers_resolveConfig_js__WEBPACK_IMPORTED_MODULE_7__["default"])(config);

  responseType = responseType ? (responseType + '').toLowerCase() : 'text';

  let composedSignal = (0,_helpers_composeSignals_js__WEBPACK_IMPORTED_MODULE_3__["default"])([signal, cancelToken && cancelToken.toAbortSignal()], timeout);

  let request;

  const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
  });

  let requestContentLength;

  try {
    if (
      onUploadProgress && supportsRequestStream && method !== 'get' && method !== 'head' &&
      (requestContentLength = await resolveBodyLength(headers, data)) !== 0
    ) {
      let _request = new Request(url, {
        method: 'POST',
        body: data,
        duplex: "half"
      });

      let contentTypeHeader;

      if (_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isFormData(data) && (contentTypeHeader = _request.headers.get('content-type'))) {
        headers.setContentType(contentTypeHeader)
      }

      if (_request.body) {
        const [onProgress, flush] = (0,_helpers_progressEventReducer_js__WEBPACK_IMPORTED_MODULE_6__.progressEventDecorator)(
          requestContentLength,
          (0,_helpers_progressEventReducer_js__WEBPACK_IMPORTED_MODULE_6__.progressEventReducer)((0,_helpers_progressEventReducer_js__WEBPACK_IMPORTED_MODULE_6__.asyncDecorator)(onUploadProgress))
        );

        data = (0,_helpers_trackStream_js__WEBPACK_IMPORTED_MODULE_4__.trackStream)(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
      }
    }

    if (!_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isString(withCredentials)) {
      withCredentials = withCredentials ? 'include' : 'omit';
    }

    // Cloudflare Workers throws when credentials are defined
    // see https://github.com/cloudflare/workerd/issues/902
    const isCredentialsSupported = "credentials" in Request.prototype;
    request = new Request(url, {
      ...fetchOptions,
      signal: composedSignal,
      method: method.toUpperCase(),
      headers: headers.normalize().toJSON(),
      body: data,
      duplex: "half",
      credentials: isCredentialsSupported ? withCredentials : undefined
    });

    let response = await fetch(request);

    const isStreamResponse = supportsResponseStream && (responseType === 'stream' || responseType === 'response');

    if (supportsResponseStream && (onDownloadProgress || (isStreamResponse && unsubscribe))) {
      const options = {};

      ['status', 'statusText', 'headers'].forEach(prop => {
        options[prop] = response[prop];
      });

      const responseContentLength = _utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].toFiniteNumber(response.headers.get('content-length'));

      const [onProgress, flush] = onDownloadProgress && (0,_helpers_progressEventReducer_js__WEBPACK_IMPORTED_MODULE_6__.progressEventDecorator)(
        responseContentLength,
        (0,_helpers_progressEventReducer_js__WEBPACK_IMPORTED_MODULE_6__.progressEventReducer)((0,_helpers_progressEventReducer_js__WEBPACK_IMPORTED_MODULE_6__.asyncDecorator)(onDownloadProgress), true)
      ) || [];

      response = new Response(
        (0,_helpers_trackStream_js__WEBPACK_IMPORTED_MODULE_4__.trackStream)(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
          flush && flush();
          unsubscribe && unsubscribe();
        }),
        options
      );
    }

    responseType = responseType || 'text';

    let responseData = await resolvers[_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].findKey(resolvers, responseType) || 'text'](response, config);

    !isStreamResponse && unsubscribe && unsubscribe();

    return await new Promise((resolve, reject) => {
      (0,_core_settle_js__WEBPACK_IMPORTED_MODULE_8__["default"])(resolve, reject, {
        data: responseData,
        headers: _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_5__["default"].from(response.headers),
        status: response.status,
        statusText: response.statusText,
        config,
        request
      })
    })
  } catch (err) {
    unsubscribe && unsubscribe();

    if (err && err.name === 'TypeError' && /fetch/i.test(err.message)) {
      throw Object.assign(
        new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_2__["default"]('Network Error', _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_2__["default"].ERR_NETWORK, config, request),
        {
          cause: err.cause || err
        }
      )
    }

    throw _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_2__["default"].from(err, err && err.code, config, request);
  }
}));




/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _core_settle_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./../core/settle.js */ "./node_modules/axios/lib/core/settle.js");
/* harmony import */ var _defaults_transitional_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../defaults/transitional.js */ "./node_modules/axios/lib/defaults/transitional.js");
/* harmony import */ var _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/AxiosError.js */ "./node_modules/axios/lib/core/AxiosError.js");
/* harmony import */ var _cancel_CanceledError_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../cancel/CanceledError.js */ "./node_modules/axios/lib/cancel/CanceledError.js");
/* harmony import */ var _helpers_parseProtocol_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../helpers/parseProtocol.js */ "./node_modules/axios/lib/helpers/parseProtocol.js");
/* harmony import */ var _platform_index_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../platform/index.js */ "./node_modules/axios/lib/platform/index.js");
/* harmony import */ var _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/AxiosHeaders.js */ "./node_modules/axios/lib/core/AxiosHeaders.js");
/* harmony import */ var _helpers_progressEventReducer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../helpers/progressEventReducer.js */ "./node_modules/axios/lib/helpers/progressEventReducer.js");
/* harmony import */ var _helpers_resolveConfig_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../helpers/resolveConfig.js */ "./node_modules/axios/lib/helpers/resolveConfig.js");











const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

/* harmony default export */ __webpack_exports__["default"] = (isXHRAdapterSupported && function (config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = (0,_helpers_resolveConfig_js__WEBPACK_IMPORTED_MODULE_9__["default"])(config);
    let requestData = _config.data;
    const requestHeaders = _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_7__["default"].from(_config.headers).normalize();
    let {responseType, onUploadProgress, onDownloadProgress} = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;

    function done() {
      flushUpload && flushUpload(); // flush events
      flushDownload && flushDownload(); // flush events

      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);

      _config.signal && _config.signal.removeEventListener('abort', onCanceled);
    }

    let request = new XMLHttpRequest();

    request.open(_config.method.toUpperCase(), _config.url, true);

    // Set the request timeout in MS
    request.timeout = _config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      const responseHeaders = _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_7__["default"].from(
        'getAllResponseHeaders' in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
        request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };

      (0,_core_settle_js__WEBPACK_IMPORTED_MODULE_1__["default"])(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_3__["default"]('Request aborted', _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_3__["default"].ECONNABORTED, config, request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_3__["default"]('Network Error', _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_3__["default"].ERR_NETWORK, config, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? 'timeout of ' + _config.timeout + 'ms exceeded' : 'timeout exceeded';
      const transitional = _config.transitional || _defaults_transitional_js__WEBPACK_IMPORTED_MODULE_2__["default"];
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_3__["default"](
        timeoutErrorMessage,
        transitional.clarifyTimeoutError ? _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_3__["default"].ETIMEDOUT : _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_3__["default"].ECONNABORTED,
        config,
        request));

      // Clean up request
      request = null;
    };

    // Remove Content-Type if data is undefined
    requestData === undefined && requestHeaders.setContentType(null);

    // Add headers to the request
    if ('setRequestHeader' in request) {
      _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }

    // Add withCredentials to request if needed
    if (!_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = _config.responseType;
    }

    // Handle progress if needed
    if (onDownloadProgress) {
      ([downloadThrottled, flushDownload] = (0,_helpers_progressEventReducer_js__WEBPACK_IMPORTED_MODULE_8__.progressEventReducer)(onDownloadProgress, true));
      request.addEventListener('progress', downloadThrottled);
    }

    // Not all browsers support upload events
    if (onUploadProgress && request.upload) {
      ([uploadThrottled, flushUpload] = (0,_helpers_progressEventReducer_js__WEBPACK_IMPORTED_MODULE_8__.progressEventReducer)(onUploadProgress));

      request.upload.addEventListener('progress', uploadThrottled);

      request.upload.addEventListener('loadend', flushUpload);
    }

    if (_config.cancelToken || _config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = cancel => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new _cancel_CanceledError_js__WEBPACK_IMPORTED_MODULE_4__["default"](null, config, request) : cancel);
        request.abort();
        request = null;
      };

      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener('abort', onCanceled);
      }
    }

    const protocol = (0,_helpers_parseProtocol_js__WEBPACK_IMPORTED_MODULE_5__["default"])(_config.url);

    if (protocol && _platform_index_js__WEBPACK_IMPORTED_MODULE_6__["default"].protocols.indexOf(protocol) === -1) {
      reject(new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_3__["default"]('Unsupported protocol ' + protocol + ':', _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_3__["default"].ERR_BAD_REQUEST, config));
      return;
    }


    // Send the request
    request.send(requestData || null);
  });
});


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _helpers_bind_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers/bind.js */ "./node_modules/axios/lib/helpers/bind.js");
/* harmony import */ var _core_Axios_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/Axios.js */ "./node_modules/axios/lib/core/Axios.js");
/* harmony import */ var _core_mergeConfig_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/mergeConfig.js */ "./node_modules/axios/lib/core/mergeConfig.js");
/* harmony import */ var _defaults_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./defaults/index.js */ "./node_modules/axios/lib/defaults/index.js");
/* harmony import */ var _helpers_formDataToJSON_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./helpers/formDataToJSON.js */ "./node_modules/axios/lib/helpers/formDataToJSON.js");
/* harmony import */ var _cancel_CanceledError_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./cancel/CanceledError.js */ "./node_modules/axios/lib/cancel/CanceledError.js");
/* harmony import */ var _cancel_CancelToken_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./cancel/CancelToken.js */ "./node_modules/axios/lib/cancel/CancelToken.js");
/* harmony import */ var _cancel_isCancel_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./cancel/isCancel.js */ "./node_modules/axios/lib/cancel/isCancel.js");
/* harmony import */ var _env_data_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./env/data.js */ "./node_modules/axios/lib/env/data.js");
/* harmony import */ var _helpers_toFormData_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./helpers/toFormData.js */ "./node_modules/axios/lib/helpers/toFormData.js");
/* harmony import */ var _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./core/AxiosError.js */ "./node_modules/axios/lib/core/AxiosError.js");
/* harmony import */ var _helpers_spread_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./helpers/spread.js */ "./node_modules/axios/lib/helpers/spread.js");
/* harmony import */ var _helpers_isAxiosError_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./helpers/isAxiosError.js */ "./node_modules/axios/lib/helpers/isAxiosError.js");
/* harmony import */ var _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./core/AxiosHeaders.js */ "./node_modules/axios/lib/core/AxiosHeaders.js");
/* harmony import */ var _adapters_adapters_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./adapters/adapters.js */ "./node_modules/axios/lib/adapters/adapters.js");
/* harmony import */ var _helpers_HttpStatusCode_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./helpers/HttpStatusCode.js */ "./node_modules/axios/lib/helpers/HttpStatusCode.js");




















/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 *
 * @returns {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  const context = new _core_Axios_js__WEBPACK_IMPORTED_MODULE_2__["default"](defaultConfig);
  const instance = (0,_helpers_bind_js__WEBPACK_IMPORTED_MODULE_1__["default"])(_core_Axios_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype.request, context);

  // Copy axios.prototype to instance
  _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].extend(instance, _core_Axios_js__WEBPACK_IMPORTED_MODULE_2__["default"].prototype, context, {allOwnKeys: true});

  // Copy context to instance
  _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].extend(instance, context, null, {allOwnKeys: true});

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance((0,_core_mergeConfig_js__WEBPACK_IMPORTED_MODULE_3__["default"])(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
const axios = createInstance(_defaults_index_js__WEBPACK_IMPORTED_MODULE_4__["default"]);

// Expose Axios class to allow class inheritance
axios.Axios = _core_Axios_js__WEBPACK_IMPORTED_MODULE_2__["default"];

// Expose Cancel & CancelToken
axios.CanceledError = _cancel_CanceledError_js__WEBPACK_IMPORTED_MODULE_6__["default"];
axios.CancelToken = _cancel_CancelToken_js__WEBPACK_IMPORTED_MODULE_7__["default"];
axios.isCancel = _cancel_isCancel_js__WEBPACK_IMPORTED_MODULE_8__["default"];
axios.VERSION = _env_data_js__WEBPACK_IMPORTED_MODULE_9__.VERSION;
axios.toFormData = _helpers_toFormData_js__WEBPACK_IMPORTED_MODULE_10__["default"];

// Expose AxiosError class
axios.AxiosError = _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_11__["default"];

// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};

axios.spread = _helpers_spread_js__WEBPACK_IMPORTED_MODULE_12__["default"];

// Expose isAxiosError
axios.isAxiosError = _helpers_isAxiosError_js__WEBPACK_IMPORTED_MODULE_13__["default"];

// Expose mergeConfig
axios.mergeConfig = _core_mergeConfig_js__WEBPACK_IMPORTED_MODULE_3__["default"];

axios.AxiosHeaders = _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_14__["default"];

axios.formToJSON = thing => (0,_helpers_formDataToJSON_js__WEBPACK_IMPORTED_MODULE_5__["default"])(_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isHTMLForm(thing) ? new FormData(thing) : thing);

axios.getAdapter = _adapters_adapters_js__WEBPACK_IMPORTED_MODULE_15__["default"].getAdapter;

axios.HttpStatusCode = _helpers_HttpStatusCode_js__WEBPACK_IMPORTED_MODULE_16__["default"];

axios.default = axios;

// this module should only have a default export
/* harmony default export */ __webpack_exports__["default"] = (axios);


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _CanceledError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CanceledError.js */ "./node_modules/axios/lib/cancel/CanceledError.js");




/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @param {Function} executor The executor function.
 *
 * @returns {CancelToken}
 */
class CancelToken {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    let resolvePromise;

    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    const token = this;

    // eslint-disable-next-line func-names
    this.promise.then(cancel => {
      if (!token._listeners) return;

      let i = token._listeners.length;

      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });

    // eslint-disable-next-line func-names
    this.promise.then = onfulfilled => {
      let _resolve;
      // eslint-disable-next-line func-names
      const promise = new Promise(resolve => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);

      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };

      return promise;
    };

    executor(function cancel(message, config, request) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new _CanceledError_js__WEBPACK_IMPORTED_MODULE_0__["default"](message, config, request);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }

  /**
   * Subscribe to the cancel signal
   */

  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }

    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }

  /**
   * Unsubscribe from the cancel signal
   */

  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  toAbortSignal() {
    const controller = new AbortController();

    const abort = (err) => {
      controller.abort(err);
    };

    this.subscribe(abort);

    controller.signal.unsubscribe = () => this.unsubscribe(abort);

    return controller.signal;
  }

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
}

/* harmony default export */ __webpack_exports__["default"] = (CancelToken);


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CanceledError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CanceledError.js ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/AxiosError.js */ "./node_modules/axios/lib/core/AxiosError.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");





/**
 * A `CanceledError` is an object that is thrown when an operation is canceled.
 *
 * @param {string=} message The message.
 * @param {Object=} config The config.
 * @param {Object=} request The request.
 *
 * @returns {CanceledError} The created error.
 */
function CanceledError(message, config, request) {
  // eslint-disable-next-line no-eq-null,eqeqeq
  _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_0__["default"].call(this, message == null ? 'canceled' : message, _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_0__["default"].ERR_CANCELED, config, request);
  this.name = 'CanceledError';
}

_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].inherits(CanceledError, _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_0__["default"], {
  __CANCEL__: true
});

/* harmony default export */ __webpack_exports__["default"] = (CanceledError);


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ isCancel; }
/* harmony export */ });


function isCancel(value) {
  return !!(value && value.__CANCEL__);
}


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _helpers_buildURL_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/buildURL.js */ "./node_modules/axios/lib/helpers/buildURL.js");
/* harmony import */ var _InterceptorManager_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./InterceptorManager.js */ "./node_modules/axios/lib/core/InterceptorManager.js");
/* harmony import */ var _dispatchRequest_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./dispatchRequest.js */ "./node_modules/axios/lib/core/dispatchRequest.js");
/* harmony import */ var _mergeConfig_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./mergeConfig.js */ "./node_modules/axios/lib/core/mergeConfig.js");
/* harmony import */ var _buildFullPath_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./buildFullPath.js */ "./node_modules/axios/lib/core/buildFullPath.js");
/* harmony import */ var _helpers_validator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../helpers/validator.js */ "./node_modules/axios/lib/helpers/validator.js");
/* harmony import */ var _AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./AxiosHeaders.js */ "./node_modules/axios/lib/core/AxiosHeaders.js");











const validators = _helpers_validator_js__WEBPACK_IMPORTED_MODULE_6__["default"].validators;

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 *
 * @return {Axios} A new instance of Axios
 */
class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new _InterceptorManager_js__WEBPACK_IMPORTED_MODULE_2__["default"](),
      response: new _InterceptorManager_js__WEBPACK_IMPORTED_MODULE_2__["default"]()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy;

        Error.captureStackTrace ? Error.captureStackTrace(dummy = {}) : (dummy = new Error());

        // slice off the Error: ... line
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, '') : '';
        try {
          if (!err.stack) {
            err.stack = stack;
            // match without the 2 top stack lines
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ''))) {
            err.stack += '\n' + stack
          }
        } catch (e) {
          // ignore the case where "stack" is an un-writable property
        }
      }

      throw err;
    }
  }

  _request(configOrUrl, config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof configOrUrl === 'string') {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }

    config = (0,_mergeConfig_js__WEBPACK_IMPORTED_MODULE_4__["default"])(this.defaults, config);

    const {transitional, paramsSerializer, headers} = config;

    if (transitional !== undefined) {
      _helpers_validator_js__WEBPACK_IMPORTED_MODULE_6__["default"].assertOptions(transitional, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }

    if (paramsSerializer != null) {
      if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        }
      } else {
        _helpers_validator_js__WEBPACK_IMPORTED_MODULE_6__["default"].assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }

    // Set config.method
    config.method = (config.method || this.defaults.method || 'get').toLowerCase();

    // Flatten headers
    let contextHeaders = headers && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].merge(
      headers.common,
      headers[config.method]
    );

    headers && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      (method) => {
        delete headers[method];
      }
    );

    config.headers = _AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_7__["default"].concat(contextHeaders, headers);

    // filter out skipped interceptors
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
        return;
      }

      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    let promise;
    let i = 0;
    let len;

    if (!synchronousRequestInterceptors) {
      const chain = [_dispatchRequest_js__WEBPACK_IMPORTED_MODULE_3__["default"].bind(this), undefined];
      chain.unshift.apply(chain, requestInterceptorChain);
      chain.push.apply(chain, responseInterceptorChain);
      len = chain.length;

      promise = Promise.resolve(config);

      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }

      return promise;
    }

    len = requestInterceptorChain.length;

    let newConfig = config;

    i = 0;

    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }

    try {
      promise = _dispatchRequest_js__WEBPACK_IMPORTED_MODULE_3__["default"].call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }

    i = 0;
    len = responseInterceptorChain.length;

    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }

    return promise;
  }

  getUri(config) {
    config = (0,_mergeConfig_js__WEBPACK_IMPORTED_MODULE_4__["default"])(this.defaults, config);
    const fullPath = (0,_buildFullPath_js__WEBPACK_IMPORTED_MODULE_5__["default"])(config.baseURL, config.url);
    return (0,_helpers_buildURL_js__WEBPACK_IMPORTED_MODULE_1__["default"])(fullPath, config.params, config.paramsSerializer);
  }
}

// Provide aliases for supported request methods
_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request((0,_mergeConfig_js__WEBPACK_IMPORTED_MODULE_4__["default"])(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});

_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/

  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request((0,_mergeConfig_js__WEBPACK_IMPORTED_MODULE_4__["default"])(config || {}, {
        method,
        headers: isForm ? {
          'Content-Type': 'multipart/form-data'
        } : {},
        url,
        data
      }));
    };
  }

  Axios.prototype[method] = generateHTTPMethod();

  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});

/* harmony default export */ __webpack_exports__["default"] = (Axios);


/***/ }),

/***/ "./node_modules/axios/lib/core/AxiosError.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/core/AxiosError.js ***!
  \***************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");




/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [config] The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 *
 * @returns {Error} The created error.
 */
function AxiosError(message, code, config, request, response) {
  Error.call(this);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack;
  }

  this.message = message;
  this.name = 'AxiosError';
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}

_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});

const prototype = AxiosError.prototype;
const descriptors = {};

[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED',
  'ERR_NOT_SUPPORT',
  'ERR_INVALID_URL'
// eslint-disable-next-line func-names
].forEach(code => {
  descriptors[code] = {value: code};
});

Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, 'isAxiosError', {value: true});

// eslint-disable-next-line func-names
AxiosError.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype);

  _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].toFlatObject(error, axiosError, function filter(obj) {
    return obj !== Error.prototype;
  }, prop => {
    return prop !== 'isAxiosError';
  });

  AxiosError.call(axiosError, error.message, code, config, request, response);

  axiosError.cause = error;

  axiosError.name = error.name;

  customProps && Object.assign(axiosError, customProps);

  return axiosError;
};

/* harmony default export */ __webpack_exports__["default"] = (AxiosError);


/***/ }),

/***/ "./node_modules/axios/lib/core/AxiosHeaders.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/AxiosHeaders.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _helpers_parseHeaders_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/parseHeaders.js */ "./node_modules/axios/lib/helpers/parseHeaders.js");





const $internals = Symbol('internals');

function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}

function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }

  return _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(value) ? value.map(normalizeValue) : String(value);
}

function parseTokens(str) {
  const tokens = Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;

  while ((match = tokensRE.exec(str))) {
    tokens[match[1]] = match[2];
  }

  return tokens;
}

const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
  if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFunction(filter)) {
    return filter.call(this, value, header);
  }

  if (isHeaderNameFilter) {
    value = header;
  }

  if (!_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isString(value)) return;

  if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isString(filter)) {
    return value.indexOf(filter) !== -1;
  }

  if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isRegExp(filter)) {
    return filter.test(value);
  }
}

function formatHeader(header) {
  return header.trim()
    .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
      return char.toUpperCase() + str;
    });
}

function buildAccessors(obj, header) {
  const accessorName = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].toCamelCase(' ' + header);

  ['get', 'set', 'has'].forEach(methodName => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}

class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }

  set(header, valueOrRewrite, rewrite) {
    const self = this;

    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);

      if (!lHeader) {
        throw new Error('header name must be a non-empty string');
      }

      const key = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].findKey(self, lHeader);

      if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
        self[key || _header] = normalizeValue(_value);
      }
    }

    const setHeaders = (headers, _rewrite) =>
      _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

    if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite)
    } else if(_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders((0,_helpers_parseHeaders_js__WEBPACK_IMPORTED_MODULE_1__["default"])(header), valueOrRewrite);
    } else if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isHeaders(header)) {
      for (const [key, value] of header.entries()) {
        setHeader(value, key, rewrite);
      }
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }

    return this;
  }

  get(header, parser) {
    header = normalizeHeader(header);

    if (header) {
      const key = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].findKey(this, header);

      if (key) {
        const value = this[key];

        if (!parser) {
          return value;
        }

        if (parser === true) {
          return parseTokens(value);
        }

        if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFunction(parser)) {
          return parser.call(this, value, key);
        }

        if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isRegExp(parser)) {
          return parser.exec(value);
        }

        throw new TypeError('parser must be boolean|regexp|function');
      }
    }
  }

  has(header, matcher) {
    header = normalizeHeader(header);

    if (header) {
      const key = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].findKey(this, header);

      return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }

    return false;
  }

  delete(header, matcher) {
    const self = this;
    let deleted = false;

    function deleteHeader(_header) {
      _header = normalizeHeader(_header);

      if (_header) {
        const key = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].findKey(self, _header);

        if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
          delete self[key];

          deleted = true;
        }
      }
    }

    if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }

    return deleted;
  }

  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;

    while (i--) {
      const key = keys[i];
      if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }

    return deleted;
  }

  normalize(format) {
    const self = this;
    const headers = {};

    _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(this, (value, header) => {
      const key = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].findKey(headers, header);

      if (key) {
        self[key] = normalizeValue(value);
        delete self[header];
        return;
      }

      const normalized = format ? formatHeader(header) : String(header).trim();

      if (normalized !== header) {
        delete self[header];
      }

      self[normalized] = normalizeValue(value);

      headers[normalized] = true;
    });

    return this;
  }

  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }

  toJSON(asStrings) {
    const obj = Object.create(null);

    _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(value) ? value.join(', ') : value);
    });

    return obj;
  }

  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }

  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
  }

  get [Symbol.toStringTag]() {
    return 'AxiosHeaders';
  }

  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }

  static concat(first, ...targets) {
    const computed = new this(first);

    targets.forEach((target) => computed.set(target));

    return computed;
  }

  static accessor(header) {
    const internals = this[$internals] = (this[$internals] = {
      accessors: {}
    });

    const accessors = internals.accessors;
    const prototype = this.prototype;

    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);

      if (!accessors[lHeader]) {
        buildAccessors(prototype, _header);
        accessors[lHeader] = true;
      }
    }

    _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

    return this;
  }
}

AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

// reserved names hotfix
_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].reduceDescriptors(AxiosHeaders.prototype, ({value}, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  }
});

_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].freezeMethods(AxiosHeaders);

/* harmony default export */ __webpack_exports__["default"] = (AxiosHeaders);


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../utils.js */ "./node_modules/axios/lib/utils.js");




class InterceptorManager {
  constructor() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}

/* harmony default export */ __webpack_exports__["default"] = (InterceptorManager);


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ buildFullPath; }
/* harmony export */ });
/* harmony import */ var _helpers_isAbsoluteURL_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers/isAbsoluteURL.js */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
/* harmony import */ var _helpers_combineURLs_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/combineURLs.js */ "./node_modules/axios/lib/helpers/combineURLs.js");





/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 *
 * @returns {string} The combined full path
 */
function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !(0,_helpers_isAbsoluteURL_js__WEBPACK_IMPORTED_MODULE_0__["default"])(requestedURL)) {
    return (0,_helpers_combineURLs_js__WEBPACK_IMPORTED_MODULE_1__["default"])(baseURL, requestedURL);
  }
  return requestedURL;
}


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ dispatchRequest; }
/* harmony export */ });
/* harmony import */ var _transformData_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./transformData.js */ "./node_modules/axios/lib/core/transformData.js");
/* harmony import */ var _cancel_isCancel_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cancel/isCancel.js */ "./node_modules/axios/lib/cancel/isCancel.js");
/* harmony import */ var _defaults_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../defaults/index.js */ "./node_modules/axios/lib/defaults/index.js");
/* harmony import */ var _cancel_CanceledError_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../cancel/CanceledError.js */ "./node_modules/axios/lib/cancel/CanceledError.js");
/* harmony import */ var _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/AxiosHeaders.js */ "./node_modules/axios/lib/core/AxiosHeaders.js");
/* harmony import */ var _adapters_adapters_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../adapters/adapters.js */ "./node_modules/axios/lib/adapters/adapters.js");









/**
 * Throws a `CanceledError` if cancellation has been requested.
 *
 * @param {Object} config The config that is to be used for the request
 *
 * @returns {void}
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new _cancel_CanceledError_js__WEBPACK_IMPORTED_MODULE_3__["default"](null, config);
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 *
 * @returns {Promise} The Promise to be fulfilled
 */
function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  config.headers = _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_4__["default"].from(config.headers);

  // Transform request data
  config.data = _transformData_js__WEBPACK_IMPORTED_MODULE_0__["default"].call(
    config,
    config.transformRequest
  );

  if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
    config.headers.setContentType('application/x-www-form-urlencoded', false);
  }

  const adapter = _adapters_adapters_js__WEBPACK_IMPORTED_MODULE_5__["default"].getAdapter(config.adapter || _defaults_index_js__WEBPACK_IMPORTED_MODULE_2__["default"].adapter);

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = _transformData_js__WEBPACK_IMPORTED_MODULE_0__["default"].call(
      config,
      config.transformResponse,
      response
    );

    response.headers = _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_4__["default"].from(response.headers);

    return response;
  }, function onAdapterRejection(reason) {
    if (!(0,_cancel_isCancel_js__WEBPACK_IMPORTED_MODULE_1__["default"])(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = _transformData_js__WEBPACK_IMPORTED_MODULE_0__["default"].call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_4__["default"].from(reason.response.headers);
      }
    }

    return Promise.reject(reason);
  });
}


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ mergeConfig; }
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AxiosHeaders.js */ "./node_modules/axios/lib/core/AxiosHeaders.js");





const headersToObject = (thing) => thing instanceof _AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_1__["default"] ? { ...thing } : thing;

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 *
 * @returns {Object} New object resulting from merging config2 to config1
 */
function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  const config = {};

  function getMergedValue(target, source, caseless) {
    if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isPlainObject(target) && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isPlainObject(source)) {
      return _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].merge.call({caseless}, target, source);
    } else if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isPlainObject(source)) {
      return _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].merge({}, source);
    } else if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(a, b, caseless) {
    if (!_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(b)) {
      return getMergedValue(a, b, caseless);
    } else if (!_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(a)) {
      return getMergedValue(undefined, a, caseless);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(a, b) {
    if (!_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(b)) {
      return getMergedValue(undefined, b);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(a, b) {
    if (!_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(b)) {
      return getMergedValue(undefined, b);
    } else if (!_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(a)) {
      return getMergedValue(undefined, a);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(undefined, a);
    }
  }

  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
  };

  _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
    const merge = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge(config1[prop], config2[prop], prop);
    (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
}


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ settle; }
/* harmony export */ });
/* harmony import */ var _AxiosError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AxiosError.js */ "./node_modules/axios/lib/core/AxiosError.js");




/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 *
 * @returns {object} The response.
 */
function settle(resolve, reject, response) {
  const validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(new _AxiosError_js__WEBPACK_IMPORTED_MODULE_0__["default"](
      'Request failed with status code ' + response.status,
      [_AxiosError_js__WEBPACK_IMPORTED_MODULE_0__["default"].ERR_BAD_REQUEST, _AxiosError_js__WEBPACK_IMPORTED_MODULE_0__["default"].ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ transformData; }
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _defaults_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../defaults/index.js */ "./node_modules/axios/lib/defaults/index.js");
/* harmony import */ var _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/AxiosHeaders.js */ "./node_modules/axios/lib/core/AxiosHeaders.js");






/**
 * Transform the data for a request or a response
 *
 * @param {Array|Function} fns A single function or Array of functions
 * @param {?Object} response The response object
 *
 * @returns {*} The resulting transformed data
 */
function transformData(fns, response) {
  const config = this || _defaults_index_js__WEBPACK_IMPORTED_MODULE_1__["default"];
  const context = response || config;
  const headers = _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_2__["default"].from(context.headers);
  let data = context.data;

  _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
  });

  headers.normalize();

  return data;
}


/***/ }),

/***/ "./node_modules/axios/lib/defaults/index.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/defaults/index.js ***!
  \**************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/AxiosError.js */ "./node_modules/axios/lib/core/AxiosError.js");
/* harmony import */ var _transitional_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transitional.js */ "./node_modules/axios/lib/defaults/transitional.js");
/* harmony import */ var _helpers_toFormData_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../helpers/toFormData.js */ "./node_modules/axios/lib/helpers/toFormData.js");
/* harmony import */ var _helpers_toURLEncodedForm_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../helpers/toURLEncodedForm.js */ "./node_modules/axios/lib/helpers/toURLEncodedForm.js");
/* harmony import */ var _platform_index_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../platform/index.js */ "./node_modules/axios/lib/platform/index.js");
/* harmony import */ var _helpers_formDataToJSON_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../helpers/formDataToJSON.js */ "./node_modules/axios/lib/helpers/formDataToJSON.js");










/**
 * It takes a string, tries to parse it, and if it fails, it returns the stringified version
 * of the input
 *
 * @param {any} rawValue - The value to be stringified.
 * @param {Function} parser - A function that parses a string into a JavaScript object.
 * @param {Function} encoder - A function that takes a value and returns a string.
 *
 * @returns {string} A stringified version of the rawValue.
 */
function stringifySafely(rawValue, parser, encoder) {
  if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

const defaults = {

  transitional: _transitional_js__WEBPACK_IMPORTED_MODULE_2__["default"],

  adapter: ['xhr', 'http', 'fetch'],

  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || '';
    const hasJSONContentType = contentType.indexOf('application/json') > -1;
    const isObjectPayload = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isObject(data);

    if (isObjectPayload && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isHTMLForm(data)) {
      data = new FormData(data);
    }

    const isFormData = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFormData(data);

    if (isFormData) {
      return hasJSONContentType ? JSON.stringify((0,_helpers_formDataToJSON_js__WEBPACK_IMPORTED_MODULE_6__["default"])(data)) : data;
    }

    if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArrayBuffer(data) ||
      _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isBuffer(data) ||
      _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isStream(data) ||
      _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFile(data) ||
      _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isBlob(data) ||
      _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isReadableStream(data)
    ) {
      return data;
    }
    if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArrayBufferView(data)) {
      return data.buffer;
    }
    if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isURLSearchParams(data)) {
      headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
      return data.toString();
    }

    let isFileList;

    if (isObjectPayload) {
      if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
        return (0,_helpers_toURLEncodedForm_js__WEBPACK_IMPORTED_MODULE_4__["default"])(data, this.formSerializer).toString();
      }

      if ((isFileList = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
        const _FormData = this.env && this.env.FormData;

        return (0,_helpers_toFormData_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
          isFileList ? {'files[]': data} : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }

    if (isObjectPayload || hasJSONContentType ) {
      headers.setContentType('application/json', false);
      return stringifySafely(data);
    }

    return data;
  }],

  transformResponse: [function transformResponse(data) {
    const transitional = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    const JSONRequested = this.responseType === 'json';

    if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isResponse(data) || _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isReadableStream(data)) {
      return data;
    }

    if (data && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
      const silentJSONParsing = transitional && transitional.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;

      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"].from(e, _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"].ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  env: {
    FormData: _platform_index_js__WEBPACK_IMPORTED_MODULE_5__["default"].classes.FormData,
    Blob: _platform_index_js__WEBPACK_IMPORTED_MODULE_5__["default"].classes.Blob
  },

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': undefined
    }
  }
};

_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], (method) => {
  defaults.headers[method] = {};
});

/* harmony default export */ __webpack_exports__["default"] = (defaults);


/***/ }),

/***/ "./node_modules/axios/lib/defaults/transitional.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/defaults/transitional.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);


/* harmony default export */ __webpack_exports__["default"] = ({
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
});


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VERSION: function() { return /* binding */ VERSION; }
/* harmony export */ });
const VERSION = "1.7.7";

/***/ }),

/***/ "./node_modules/axios/lib/helpers/AxiosURLSearchParams.js":
/*!****************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/AxiosURLSearchParams.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _toFormData_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./toFormData.js */ "./node_modules/axios/lib/helpers/toFormData.js");




/**
 * It encodes a string by replacing all characters that are not in the unreserved set with
 * their percent-encoded equivalents
 *
 * @param {string} str - The string to encode.
 *
 * @returns {string} The encoded string.
 */
function encode(str) {
  const charMap = {
    '!': '%21',
    "'": '%27',
    '(': '%28',
    ')': '%29',
    '~': '%7E',
    '%20': '+',
    '%00': '\x00'
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}

/**
 * It takes a params object and converts it to a FormData object
 *
 * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
 * @param {Object<string, any>} options - The options object passed to the Axios constructor.
 *
 * @returns {void}
 */
function AxiosURLSearchParams(params, options) {
  this._pairs = [];

  params && (0,_toFormData_js__WEBPACK_IMPORTED_MODULE_0__["default"])(params, this, options);
}

const prototype = AxiosURLSearchParams.prototype;

prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};

prototype.toString = function toString(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode);
  } : encode;

  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + '=' + _encode(pair[1]);
  }, '').join('&');
};

/* harmony default export */ __webpack_exports__["default"] = (AxiosURLSearchParams);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/HttpStatusCode.js":
/*!**********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/HttpStatusCode.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
const HttpStatusCode = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
};

Object.entries(HttpStatusCode).forEach(([key, value]) => {
  HttpStatusCode[value] = key;
});

/* harmony default export */ __webpack_exports__["default"] = (HttpStatusCode);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ bind; }
/* harmony export */ });


function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ buildURL; }
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _helpers_AxiosURLSearchParams_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/AxiosURLSearchParams.js */ "./node_modules/axios/lib/helpers/AxiosURLSearchParams.js");





/**
 * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
 * URI encoded counterparts
 *
 * @param {string} val The value to be encoded.
 *
 * @returns {string} The encoded value.
 */
function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @param {?object} options
 *
 * @returns {string} The formatted url
 */
function buildURL(url, params, options) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }
  
  const _encode = options && options.encode || encode;

  const serializeFn = options && options.serialize;

  let serializedParams;

  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isURLSearchParams(params) ?
      params.toString() :
      new _helpers_AxiosURLSearchParams_js__WEBPACK_IMPORTED_MODULE_1__["default"](params, options).toString(_encode);
  }

  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");

    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
}


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ combineURLs; }
/* harmony export */ });


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 *
 * @returns {string} The combined URL
 */
function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
}


/***/ }),

/***/ "./node_modules/axios/lib/helpers/composeSignals.js":
/*!**********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/composeSignals.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _cancel_CanceledError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../cancel/CanceledError.js */ "./node_modules/axios/lib/cancel/CanceledError.js");
/* harmony import */ var _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/AxiosError.js */ "./node_modules/axios/lib/core/AxiosError.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");




const composeSignals = (signals, timeout) => {
  const {length} = (signals = signals ? signals.filter(Boolean) : []);

  if (timeout || length) {
    let controller = new AbortController();

    let aborted;

    const onabort = function (reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"] ? err : new _cancel_CanceledError_js__WEBPACK_IMPORTED_MODULE_0__["default"](err instanceof Error ? err.message : err));
      }
    }

    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"](`timeout ${timeout} of ms exceeded`, _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"].ETIMEDOUT))
    }, timeout)

    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach(signal => {
          signal.unsubscribe ? signal.unsubscribe(onabort) : signal.removeEventListener('abort', onabort);
        });
        signals = null;
      }
    }

    signals.forEach((signal) => signal.addEventListener('abort', onabort));

    const {signal} = controller;

    signal.unsubscribe = () => _utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].asap(unsubscribe);

    return signal;
  }
}

/* harmony default export */ __webpack_exports__["default"] = (composeSignals);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _platform_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../platform/index.js */ "./node_modules/axios/lib/platform/index.js");



/* harmony default export */ __webpack_exports__["default"] = (_platform_index_js__WEBPACK_IMPORTED_MODULE_1__["default"].hasStandardBrowserEnv ?

  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure) {
      const cookie = [name + '=' + encodeURIComponent(value)];

      _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isNumber(expires) && cookie.push('expires=' + new Date(expires).toGMTString());

      _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isString(path) && cookie.push('path=' + path);

      _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isString(domain) && cookie.push('domain=' + domain);

      secure === true && cookie.push('secure');

      document.cookie = cookie.join('; ');
    },

    read(name) {
      const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
      return (match ? decodeURIComponent(match[3]) : null);
    },

    remove(name) {
      this.write(name, '', Date.now() - 86400000);
    }
  }

  :

  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {},
    read() {
      return null;
    },
    remove() {}
  });



/***/ }),

/***/ "./node_modules/axios/lib/helpers/formDataToJSON.js":
/*!**********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/formDataToJSON.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");




/**
 * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
 *
 * @param {string} name - The name of the property to get.
 *
 * @returns An array of strings.
 */
function parsePropPath(name) {
  // foo[x][y][z]
  // foo.x.y.z
  // foo-x-y-z
  // foo x y z
  return _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].matchAll(/\w+|\[(\w*)]/g, name).map(match => {
    return match[0] === '[]' ? '' : match[1] || match[0];
  });
}

/**
 * Convert an array to an object.
 *
 * @param {Array<any>} arr - The array to convert to an object.
 *
 * @returns An object with the same keys and values as the array.
 */
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}

/**
 * It takes a FormData object and returns a JavaScript object
 *
 * @param {string} formData The FormData object to convert to JSON.
 *
 * @returns {Object<string, any> | null} The converted object.
 */
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];

    if (name === '__proto__') return true;

    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(target) ? target.length : name;

    if (isLast) {
      if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }

      return !isNumericKey;
    }

    if (!target[name] || !_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isObject(target[name])) {
      target[name] = [];
    }

    const result = buildPath(path, value, target[name], index);

    if (result && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }

    return !isNumericKey;
  }

  if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFormData(formData) && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFunction(formData.entries)) {
    const obj = {};

    _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });

    return obj;
  }

  return null;
}

/* harmony default export */ __webpack_exports__["default"] = (formDataToJSON);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ isAbsoluteURL; }
/* harmony export */ });


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 *
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ isAxiosError; }
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../utils.js */ "./node_modules/axios/lib/utils.js");




/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 *
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
function isAxiosError(payload) {
  return _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isObject(payload) && (payload.isAxiosError === true);
}


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _platform_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../platform/index.js */ "./node_modules/axios/lib/platform/index.js");





/* harmony default export */ __webpack_exports__["default"] = (_platform_index_js__WEBPACK_IMPORTED_MODULE_1__["default"].hasStandardBrowserEnv ?

// Standard browser envs have full support of the APIs needed to test
// whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    const msie = _platform_index_js__WEBPACK_IMPORTED_MODULE_1__["default"].navigator && /(msie|trident)/i.test(_platform_index_js__WEBPACK_IMPORTED_MODULE_1__["default"].navigator.userAgent);
    const urlParsingNode = document.createElement('a');
    let originURL;

    /**
    * Parse a URL to discover its components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      let href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
          urlParsingNode.pathname :
          '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      const parsed = (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
          parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })());


/***/ }),

/***/ "./node_modules/axios/lib/helpers/null.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/null.js ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// eslint-disable-next-line strict
/* harmony default export */ __webpack_exports__["default"] = (null);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../utils.js */ "./node_modules/axios/lib/utils.js");




// RawAxiosHeaders whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
const ignoreDuplicateOf = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].toObjectSet([
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
]);

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} rawHeaders Headers needing to be parsed
 *
 * @returns {Object} Headers parsed into an object
 */
/* harmony default export */ __webpack_exports__["default"] = (rawHeaders => {
  const parsed = {};
  let key;
  let val;
  let i;

  rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
    i = line.indexOf(':');
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();

    if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
      return;
    }

    if (key === 'set-cookie') {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
});


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseProtocol.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseProtocol.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ parseProtocol; }
/* harmony export */ });


function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || '';
}


/***/ }),

/***/ "./node_modules/axios/lib/helpers/progressEventReducer.js":
/*!****************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/progressEventReducer.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   asyncDecorator: function() { return /* binding */ asyncDecorator; },
/* harmony export */   progressEventDecorator: function() { return /* binding */ progressEventDecorator; },
/* harmony export */   progressEventReducer: function() { return /* binding */ progressEventReducer; }
/* harmony export */ });
/* harmony import */ var _speedometer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./speedometer.js */ "./node_modules/axios/lib/helpers/speedometer.js");
/* harmony import */ var _throttle_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./throttle.js */ "./node_modules/axios/lib/helpers/throttle.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");




const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = (0,_speedometer_js__WEBPACK_IMPORTED_MODULE_0__["default"])(50, 250);

  return (0,_throttle_js__WEBPACK_IMPORTED_MODULE_1__["default"])(e => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : undefined;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;

    bytesNotified = loaded;

    const data = {
      loaded,
      total,
      progress: total ? (loaded / total) : undefined,
      bytes: progressBytes,
      rate: rate ? rate : undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? 'download' : 'upload']: true
    };

    listener(data);
  }, freq);
}

const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;

  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
}

const asyncDecorator = (fn) => (...args) => _utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].asap(() => fn(...args));


/***/ }),

/***/ "./node_modules/axios/lib/helpers/resolveConfig.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/resolveConfig.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _platform_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../platform/index.js */ "./node_modules/axios/lib/platform/index.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _isURLSameOrigin_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isURLSameOrigin.js */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
/* harmony import */ var _cookies_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./cookies.js */ "./node_modules/axios/lib/helpers/cookies.js");
/* harmony import */ var _core_buildFullPath_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/buildFullPath.js */ "./node_modules/axios/lib/core/buildFullPath.js");
/* harmony import */ var _core_mergeConfig_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/mergeConfig.js */ "./node_modules/axios/lib/core/mergeConfig.js");
/* harmony import */ var _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/AxiosHeaders.js */ "./node_modules/axios/lib/core/AxiosHeaders.js");
/* harmony import */ var _buildURL_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./buildURL.js */ "./node_modules/axios/lib/helpers/buildURL.js");









/* harmony default export */ __webpack_exports__["default"] = ((config) => {
  const newConfig = (0,_core_mergeConfig_js__WEBPACK_IMPORTED_MODULE_5__["default"])({}, config);

  let {data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth} = newConfig;

  newConfig.headers = headers = _core_AxiosHeaders_js__WEBPACK_IMPORTED_MODULE_6__["default"].from(headers);

  newConfig.url = (0,_buildURL_js__WEBPACK_IMPORTED_MODULE_7__["default"])((0,_core_buildFullPath_js__WEBPACK_IMPORTED_MODULE_4__["default"])(newConfig.baseURL, newConfig.url), config.params, config.paramsSerializer);

  // HTTP basic authentication
  if (auth) {
    headers.set('Authorization', 'Basic ' +
      btoa((auth.username || '') + ':' + (auth.password ? unescape(encodeURIComponent(auth.password)) : ''))
    );
  }

  let contentType;

  if (_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isFormData(data)) {
    if (_platform_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].hasStandardBrowserEnv || _platform_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(undefined); // Let the browser set it
    } else if ((contentType = headers.getContentType()) !== false) {
      // fix semicolon duplication issue for ReactNative FormData implementation
      const [type, ...tokens] = contentType ? contentType.split(';').map(token => token.trim()).filter(Boolean) : [];
      headers.setContentType([type || 'multipart/form-data', ...tokens].join('; '));
    }
  }

  // Add xsrf header
  // This is only done if running in a standard browser environment.
  // Specifically not if we're in a web worker, or react-native.

  if (_platform_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].hasStandardBrowserEnv) {
    withXSRFToken && _utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));

    if (withXSRFToken || (withXSRFToken !== false && (0,_isURLSameOrigin_js__WEBPACK_IMPORTED_MODULE_2__["default"])(newConfig.url))) {
      // Add xsrf header
      const xsrfValue = xsrfHeaderName && xsrfCookieName && _cookies_js__WEBPACK_IMPORTED_MODULE_3__["default"].read(xsrfCookieName);

      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }

  return newConfig;
});



/***/ }),

/***/ "./node_modules/axios/lib/helpers/speedometer.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/speedometer.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);


/**
 * Calculate data maxRate
 * @param {Number} [samplesCount= 10]
 * @param {Number} [min= 1000]
 * @returns {Function}
 */
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;

  min = min !== undefined ? min : 1000;

  return function push(chunkLength) {
    const now = Date.now();

    const startedAt = timestamps[tail];

    if (!firstSampleTS) {
      firstSampleTS = now;
    }

    bytes[head] = chunkLength;
    timestamps[head] = now;

    let i = tail;
    let bytesCount = 0;

    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }

    head = (head + 1) % samplesCount;

    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }

    if (now - firstSampleTS < min) {
      return;
    }

    const passed = startedAt && now - startedAt;

    return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
  };
}

/* harmony default export */ __webpack_exports__["default"] = (speedometer);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ spread; }
/* harmony export */ });


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 *
 * @returns {Function}
 */
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}


/***/ }),

/***/ "./node_modules/axios/lib/helpers/throttle.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/throttle.js ***!
  \****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/**
 * Throttle decorator
 * @param {Function} fn
 * @param {Number} freq
 * @return {Function}
 */
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1000 / freq;
  let lastArgs;
  let timer;

  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn.apply(null, args);
  }

  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if ( passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs)
        }, threshold - passed);
      }
    }
  }

  const flush = () => lastArgs && invoke(lastArgs);

  return [throttled, flush];
}

/* harmony default export */ __webpack_exports__["default"] = (throttle);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/toFormData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/toFormData.js ***!
  \******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/AxiosError.js */ "./node_modules/axios/lib/core/AxiosError.js");
/* harmony import */ var _platform_node_classes_FormData_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../platform/node/classes/FormData.js */ "./node_modules/axios/lib/helpers/null.js");




// temporary hotfix to avoid circular references until AxiosURLSearchParams is refactored


/**
 * Determines if the given thing is a array or js object.
 *
 * @param {string} thing - The object or array to be visited.
 *
 * @returns {boolean}
 */
function isVisitable(thing) {
  return _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isPlainObject(thing) || _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(thing);
}

/**
 * It removes the brackets from the end of a string
 *
 * @param {string} key - The key of the parameter.
 *
 * @returns {string} the key without the brackets.
 */
function removeBrackets(key) {
  return _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].endsWith(key, '[]') ? key.slice(0, -2) : key;
}

/**
 * It takes a path, a key, and a boolean, and returns a string
 *
 * @param {string} path - The path to the current key.
 * @param {string} key - The key of the current object being iterated over.
 * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
 *
 * @returns {string} The path to the current key.
 */
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    // eslint-disable-next-line no-param-reassign
    token = removeBrackets(token);
    return !dots && i ? '[' + token + ']' : token;
  }).join(dots ? '.' : '');
}

/**
 * If the array is an array and none of its elements are visitable, then it's a flat array.
 *
 * @param {Array<any>} arr - The array to check
 *
 * @returns {boolean}
 */
function isFlatArray(arr) {
  return _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(arr) && !arr.some(isVisitable);
}

const predicates = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].toFlatObject(_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"], {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});

/**
 * Convert a data object to FormData
 *
 * @param {Object} obj
 * @param {?Object} [formData]
 * @param {?Object} [options]
 * @param {Function} [options.visitor]
 * @param {Boolean} [options.metaTokens = true]
 * @param {Boolean} [options.dots = false]
 * @param {?Boolean} [options.indexes = false]
 *
 * @returns {Object}
 **/

/**
 * It converts an object into a FormData object
 *
 * @param {Object<any, any>} obj - The object to convert to form data.
 * @param {string} formData - The FormData object to append to.
 * @param {Object<string, any>} options
 *
 * @returns
 */
function toFormData(obj, formData, options) {
  if (!_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isObject(obj)) {
    throw new TypeError('target must be an object');
  }

  // eslint-disable-next-line no-param-reassign
  formData = formData || new (_platform_node_classes_FormData_js__WEBPACK_IMPORTED_MODULE_2__["default"] || FormData)();

  // eslint-disable-next-line no-param-reassign
  options = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    // eslint-disable-next-line no-eq-null,eqeqeq
    return !_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(source[option]);
  });

  const metaTokens = options.metaTokens;
  // eslint-disable-next-line no-use-before-define
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
  const useBlob = _Blob && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isSpecCompliantForm(formData);

  if (!_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFunction(visitor)) {
    throw new TypeError('visitor must be a function');
  }

  function convertValue(value) {
    if (value === null) return '';

    if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isDate(value)) {
      return value.toISOString();
    }

    if (!useBlob && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isBlob(value)) {
      throw new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"]('Blob is not supported. Use a Buffer instead.');
    }

    if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArrayBuffer(value) || _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isTypedArray(value)) {
      return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
    }

    return value;
  }

  /**
   * Default visitor.
   *
   * @param {*} value
   * @param {String|Number} key
   * @param {Array<String|Number>} path
   * @this {FormData}
   *
   * @returns {boolean} return true to visit the each prop of the value recursively
   */
  function defaultVisitor(value, key, path) {
    let arr = value;

    if (value && !path && typeof value === 'object') {
      if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].endsWith(key, '{}')) {
        // eslint-disable-next-line no-param-reassign
        key = metaTokens ? key : key.slice(0, -2);
        // eslint-disable-next-line no-param-reassign
        value = JSON.stringify(value);
      } else if (
        (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isArray(value) && isFlatArray(value)) ||
        ((_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isFileList(value) || _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].endsWith(key, '[]')) && (arr = _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].toArray(value))
        )) {
        // eslint-disable-next-line no-param-reassign
        key = removeBrackets(key);

        arr.forEach(function each(el, index) {
          !(_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
            convertValue(el)
          );
        });
        return false;
      }
    }

    if (isVisitable(value)) {
      return true;
    }

    formData.append(renderKey(path, key, dots), convertValue(value));

    return false;
  }

  const stack = [];

  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });

  function build(value, path) {
    if (_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(value)) return;

    if (stack.indexOf(value) !== -1) {
      throw Error('Circular reference detected in ' + path.join('.'));
    }

    stack.push(value);

    _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].forEach(value, function each(el, key) {
      const result = !(_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isUndefined(el) || el === null) && visitor.call(
        formData, el, _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isString(key) ? key.trim() : key, path, exposedHelpers
      );

      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });

    stack.pop();
  }

  if (!_utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isObject(obj)) {
    throw new TypeError('data must be an object');
  }

  build(obj);

  return formData;
}

/* harmony default export */ __webpack_exports__["default"] = (toFormData);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/toURLEncodedForm.js":
/*!************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/toURLEncodedForm.js ***!
  \************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ toURLEncodedForm; }
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "./node_modules/axios/lib/utils.js");
/* harmony import */ var _toFormData_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./toFormData.js */ "./node_modules/axios/lib/helpers/toFormData.js");
/* harmony import */ var _platform_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../platform/index.js */ "./node_modules/axios/lib/platform/index.js");






function toURLEncodedForm(data, options) {
  return (0,_toFormData_js__WEBPACK_IMPORTED_MODULE_1__["default"])(data, new _platform_index_js__WEBPACK_IMPORTED_MODULE_2__["default"].classes.URLSearchParams(), Object.assign({
    visitor: function(value, key, path, helpers) {
      if (_platform_index_js__WEBPACK_IMPORTED_MODULE_2__["default"].isNode && _utils_js__WEBPACK_IMPORTED_MODULE_0__["default"].isBuffer(value)) {
        this.append(key, value.toString('base64'));
        return false;
      }

      return helpers.defaultVisitor.apply(this, arguments);
    }
  }, options));
}


/***/ }),

/***/ "./node_modules/axios/lib/helpers/trackStream.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/trackStream.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   readBytes: function() { return /* binding */ readBytes; },
/* harmony export */   streamChunk: function() { return /* binding */ streamChunk; },
/* harmony export */   trackStream: function() { return /* binding */ trackStream; }
/* harmony export */ });

const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;

  if (!chunkSize || len < chunkSize) {
    yield chunk;
    return;
  }

  let pos = 0;
  let end;

  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
}

const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
}

const readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }

  const reader = stream.getReader();
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
}

const trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator = readBytes(stream, chunkSize);

  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  }

  return new ReadableStream({
    async pull(controller) {
      try {
        const {done, value} = await iterator.next();

        if (done) {
         _onFinish();
          controller.close();
          return;
        }

        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator.return();
    }
  }, {
    highWaterMark: 2
  })
}


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _env_data_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../env/data.js */ "./node_modules/axios/lib/env/data.js");
/* harmony import */ var _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/AxiosError.js */ "./node_modules/axios/lib/core/AxiosError.js");





const validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

const deprecatedWarnings = {};

/**
 * Transitional option validator
 *
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 *
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + _env_data_js__WEBPACK_IMPORTED_MODULE_0__.VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return (value, opt, opts) => {
    if (validator === false) {
      throw new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"](
        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
        _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"].ERR_DEPRECATED
      );
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 *
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 *
 * @returns {object}
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"]('options must be an object', _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"].ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"]('option ' + opt + ' must be ' + result, _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"].ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"]('Unknown option ' + opt, _core_AxiosError_js__WEBPACK_IMPORTED_MODULE_1__["default"].ERR_BAD_OPTION);
    }
  }
}

/* harmony default export */ __webpack_exports__["default"] = ({
  assertOptions,
  validators
});


/***/ }),

/***/ "./node_modules/axios/lib/platform/browser/classes/Blob.js":
/*!*****************************************************************!*\
  !*** ./node_modules/axios/lib/platform/browser/classes/Blob.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);


/* harmony default export */ __webpack_exports__["default"] = (typeof Blob !== 'undefined' ? Blob : null);


/***/ }),

/***/ "./node_modules/axios/lib/platform/browser/classes/FormData.js":
/*!*********************************************************************!*\
  !*** ./node_modules/axios/lib/platform/browser/classes/FormData.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);


/* harmony default export */ __webpack_exports__["default"] = (typeof FormData !== 'undefined' ? FormData : null);


/***/ }),

/***/ "./node_modules/axios/lib/platform/browser/classes/URLSearchParams.js":
/*!****************************************************************************!*\
  !*** ./node_modules/axios/lib/platform/browser/classes/URLSearchParams.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers_AxiosURLSearchParams_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../helpers/AxiosURLSearchParams.js */ "./node_modules/axios/lib/helpers/AxiosURLSearchParams.js");



/* harmony default export */ __webpack_exports__["default"] = (typeof URLSearchParams !== 'undefined' ? URLSearchParams : _helpers_AxiosURLSearchParams_js__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./node_modules/axios/lib/platform/browser/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/axios/lib/platform/browser/index.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _classes_URLSearchParams_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./classes/URLSearchParams.js */ "./node_modules/axios/lib/platform/browser/classes/URLSearchParams.js");
/* harmony import */ var _classes_FormData_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./classes/FormData.js */ "./node_modules/axios/lib/platform/browser/classes/FormData.js");
/* harmony import */ var _classes_Blob_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./classes/Blob.js */ "./node_modules/axios/lib/platform/browser/classes/Blob.js");




/* harmony default export */ __webpack_exports__["default"] = ({
  isBrowser: true,
  classes: {
    URLSearchParams: _classes_URLSearchParams_js__WEBPACK_IMPORTED_MODULE_0__["default"],
    FormData: _classes_FormData_js__WEBPACK_IMPORTED_MODULE_1__["default"],
    Blob: _classes_Blob_js__WEBPACK_IMPORTED_MODULE_2__["default"]
  },
  protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
});


/***/ }),

/***/ "./node_modules/axios/lib/platform/common/utils.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/platform/common/utils.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hasBrowserEnv: function() { return /* binding */ hasBrowserEnv; },
/* harmony export */   hasStandardBrowserEnv: function() { return /* binding */ hasStandardBrowserEnv; },
/* harmony export */   hasStandardBrowserWebWorkerEnv: function() { return /* binding */ hasStandardBrowserWebWorkerEnv; },
/* harmony export */   navigator: function() { return /* binding */ _navigator; },
/* harmony export */   origin: function() { return /* binding */ origin; }
/* harmony export */ });
const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';

const _navigator = typeof navigator === 'object' && navigator || undefined;

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 *
 * @returns {boolean}
 */
const hasStandardBrowserEnv = hasBrowserEnv &&
  (!_navigator || ['ReactNative', 'NativeScript', 'NS'].indexOf(_navigator.product) < 0);

/**
 * Determine if we're running in a standard browser webWorker environment
 *
 * Although the `isStandardBrowserEnv` method indicates that
 * `allows axios to run in a web worker`, the WebWorker will still be
 * filtered out due to its judgment standard
 * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
 * This leads to a problem when axios post `FormData` in webWorker
 */
const hasStandardBrowserWebWorkerEnv = (() => {
  return (
    typeof WorkerGlobalScope !== 'undefined' &&
    // eslint-disable-next-line no-undef
    self instanceof WorkerGlobalScope &&
    typeof self.importScripts === 'function'
  );
})();

const origin = hasBrowserEnv && window.location.href || 'http://localhost';




/***/ }),

/***/ "./node_modules/axios/lib/platform/index.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/platform/index.js ***!
  \**************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node/index.js */ "./node_modules/axios/lib/platform/browser/index.js");
/* harmony import */ var _common_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./common/utils.js */ "./node_modules/axios/lib/platform/common/utils.js");



/* harmony default export */ __webpack_exports__["default"] = ({
  ..._common_utils_js__WEBPACK_IMPORTED_MODULE_1__,
  ..._node_index_js__WEBPACK_IMPORTED_MODULE_0__["default"]
});


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers_bind_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers/bind.js */ "./node_modules/axios/lib/helpers/bind.js");




// utils is a library of generic helper functions non-specific to axios

const {toString} = Object.prototype;
const {getPrototypeOf} = Object;

const kindOf = (cache => thing => {
    const str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));

const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type
}

const typeOfTest = type => thing => typeof thing === type;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 *
 * @returns {boolean} True if value is an Array, otherwise false
 */
const {isArray} = Array;

/**
 * Determine if a value is undefined
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if the value is undefined, otherwise false
 */
const isUndefined = typeOfTest('undefined');

/**
 * Determine if a value is a Buffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
const isArrayBuffer = kindOfTest('ArrayBuffer');


/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  let result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a String, otherwise false
 */
const isString = typeOfTest('string');

/**
 * Determine if a value is a Function
 *
 * @param {*} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
const isFunction = typeOfTest('function');

/**
 * Determine if a value is a Number
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Number, otherwise false
 */
const isNumber = typeOfTest('number');

/**
 * Determine if a value is an Object
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an Object, otherwise false
 */
const isObject = (thing) => thing !== null && typeof thing === 'object';

/**
 * Determine if a value is a Boolean
 *
 * @param {*} thing The value to test
 * @returns {boolean} True if value is a Boolean, otherwise false
 */
const isBoolean = thing => thing === true || thing === false;

/**
 * Determine if a value is a plain Object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a plain Object, otherwise false
 */
const isPlainObject = (val) => {
  if (kindOf(val) !== 'object') {
    return false;
  }

  const prototype = getPrototypeOf(val);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
}

/**
 * Determine if a value is a Date
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Date, otherwise false
 */
const isDate = kindOfTest('Date');

/**
 * Determine if a value is a File
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */
const isFile = kindOfTest('File');

/**
 * Determine if a value is a Blob
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Blob, otherwise false
 */
const isBlob = kindOfTest('Blob');

/**
 * Determine if a value is a FileList
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */
const isFileList = kindOfTest('FileList');

/**
 * Determine if a value is a Stream
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Stream, otherwise false
 */
const isStream = (val) => isObject(val) && isFunction(val.pipe);

/**
 * Determine if a value is a FormData
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an FormData, otherwise false
 */
const isFormData = (thing) => {
  let kind;
  return thing && (
    (typeof FormData === 'function' && thing instanceof FormData) || (
      isFunction(thing.append) && (
        (kind = kindOf(thing)) === 'formdata' ||
        // detect form-data instance
        (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
      )
    )
  )
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
const isURLSearchParams = kindOfTest('URLSearchParams');

const [isReadableStream, isRequest, isResponse, isHeaders] = ['ReadableStream', 'Request', 'Response', 'Headers'].map(kindOfTest);

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 *
 * @returns {String} The String freed of excess whitespace
 */
const trim = (str) => str.trim ?
  str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 *
 * @param {Boolean} [allOwnKeys = false]
 * @returns {any}
 */
function forEach(obj, fn, {allOwnKeys = false} = {}) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  let i;
  let l;

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;

    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}

function findKey(obj, key) {
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}

const _global = (() => {
  /*eslint no-undef:0*/
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global)
})();

const isContextDefined = (context) => !isUndefined(context) && context !== _global;

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 *
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  const {caseless} = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  }

  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 *
 * @param {Boolean} [allOwnKeys]
 * @returns {Object} The resulting value of object a
 */
const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a[key] = (0,_helpers_bind_js__WEBPACK_IMPORTED_MODULE_0__["default"])(val, thisArg);
    } else {
      a[key] = val;
    }
  }, {allOwnKeys});
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 *
 * @returns {string} content value without BOM
 */
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

/**
 * Inherit the prototype methods from one constructor into another
 * @param {function} constructor
 * @param {function} superConstructor
 * @param {object} [props]
 * @param {object} [descriptors]
 *
 * @returns {void}
 */
const inherits = (constructor, superConstructor, props, descriptors) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, 'super', {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
}

/**
 * Resolve object with deep prototype chain to a flat object
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function|Boolean} [filter]
 * @param {Function} [propFilter]
 *
 * @returns {Object}
 */
const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};

  destObj = destObj || {};
  // eslint-disable-next-line no-eq-null,eqeqeq
  if (sourceObj == null) return destObj;

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
}

/**
 * Determines whether a string ends with the characters of a specified string
 *
 * @param {String} str
 * @param {String} searchString
 * @param {Number} [position= 0]
 *
 * @returns {boolean}
 */
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
}


/**
 * Returns new array from array like object or null if failed
 *
 * @param {*} [thing]
 *
 * @returns {?Array}
 */
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
}

/**
 * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
 * thing passed in is an instance of Uint8Array
 *
 * @param {TypedArray}
 *
 * @returns {Array}
 */
// eslint-disable-next-line func-names
const isTypedArray = (TypedArray => {
  // eslint-disable-next-line func-names
  return thing => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

/**
 * For each entry in the object, call the function with the key and value.
 *
 * @param {Object<any, any>} obj - The object to iterate over.
 * @param {Function} fn - The function to call for each entry.
 *
 * @returns {void}
 */
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[Symbol.iterator];

  const iterator = generator.call(obj);

  let result;

  while ((result = iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
}

/**
 * It takes a regular expression and a string, and returns an array of all the matches
 *
 * @param {string} regExp - The regular expression to match against.
 * @param {string} str - The string to search.
 *
 * @returns {Array<boolean>}
 */
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];

  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }

  return arr;
}

/* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
const isHTMLForm = kindOfTest('HTMLFormElement');

const toCamelCase = str => {
  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};

/* Creating a function that will check if an object has a property. */
const hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

/**
 * Determine if a value is a RegExp object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a RegExp object, otherwise false
 */
const isRegExp = kindOfTest('RegExp');

const reduceDescriptors = (obj, reducer) => {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};

  forEach(descriptors, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });

  Object.defineProperties(obj, reducedDescriptors);
}

/**
 * Makes all methods read-only
 * @param {Object} obj
 */

const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    // skip restricted props in strict mode
    if (isFunction(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
      return false;
    }

    const value = obj[name];

    if (!isFunction(value)) return;

    descriptor.enumerable = false;

    if ('writable' in descriptor) {
      descriptor.writable = false;
      return;
    }

    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error('Can not rewrite read-only method \'' + name + '\'');
      };
    }
  });
}

const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};

  const define = (arr) => {
    arr.forEach(value => {
      obj[value] = true;
    });
  }

  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

  return obj;
}

const noop = () => {}

const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
}

const ALPHA = 'abcdefghijklmnopqrstuvwxyz'

const DIGIT = '0123456789';

const ALPHABET = {
  DIGIT,
  ALPHA,
  ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
}

const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
  let str = '';
  const {length} = alphabet;
  while (size--) {
    str += alphabet[Math.random() * length|0]
  }

  return str;
}

/**
 * If the thing is a FormData object, return true, otherwise return false.
 *
 * @param {unknown} thing - The thing to check.
 *
 * @returns {boolean}
 */
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator]);
}

const toJSONObject = (obj) => {
  const stack = new Array(10);

  const visit = (source, i) => {

    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }

      if(!('toJSON' in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};

        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });

        stack[i] = undefined;

        return target;
      }
    }

    return source;
  }

  return visit(obj, 0);
}

const isAsyncFn = kindOfTest('AsyncFunction');

const isThenable = (thing) =>
  thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);

// original code
// https://github.com/DigitalBrainJS/AxiosPromise/blob/16deab13710ec09779922131f3fa5954320f83ab/lib/utils.js#L11-L34

const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }

  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({source, data}) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);

    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    }
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === 'function',
  isFunction(_global.postMessage)
);

const asap = typeof queueMicrotask !== 'undefined' ?
  queueMicrotask.bind(_global) : ( typeof process !== 'undefined' && process.nextTick || _setImmediate);

// *********************

/* harmony default export */ __webpack_exports__["default"] = ({
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  ALPHABET,
  generateString,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap
});


/***/ }),

/***/ "./src/api/apiVejice.js":
/*!******************************!*\
  !*** ./src/api/apiVejice.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VejiceApiError: function() { return /* binding */ VejiceApiError; },
/* harmony export */   popraviPoved: function() { return /* binding */ popraviPoved; },
/* harmony export */   popraviPovedDetailed: function() { return /* binding */ popraviPovedDetailed; }
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/lib/axios.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _process$env2, _process$env$VEJICE_U, _process$env3;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
/* global window, process, performance, console, setTimeout */
// src/api/apiVejice.js

var envIsProd = function envIsProd() {
  var _process$env;
  return typeof process !== "undefined" && ((_process$env = process.env) === null || _process$env === void 0 ? void 0 : "development") === "production" || typeof window !== "undefined" && window.__VEJICE_ENV__ === "production";
};
var DEBUG_OVERRIDE = typeof window !== "undefined" && typeof window.__VEJICE_DEBUG__ === "boolean" ? window.__VEJICE_DEBUG__ : undefined;
var DEBUG = typeof DEBUG_OVERRIDE === "boolean" ? DEBUG_OVERRIDE : !envIsProd();
var log = function log() {
  var _console;
  for (var _len = arguments.length, a = new Array(_len), _key = 0; _key < _len; _key++) {
    a[_key] = arguments[_key];
  }
  return DEBUG && (_console = console).log.apply(_console, ["[Vejice API]"].concat(a));
};
var MAX_SNIPPET = 120;
var snip = function snip(s) {
  return typeof s === "string" ? s.slice(0, MAX_SNIPPET) : s;
};
var API_KEY = typeof process !== "undefined" && ((_process$env2 = process.env) === null || _process$env2 === void 0 ? void 0 : "vejice_API_beta") || typeof window !== "undefined" && window.__VEJICE_API_KEY || "";
var API_MAX_ATTEMPTS = 3;
var API_RETRY_DELAY_MS = 400;
var boolFromString = function boolFromString(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    var trimmed = value.trim().toLowerCase();
    if (!trimmed) return undefined;
    if (["1", "true", "yes", "on"].includes(trimmed)) return true;
    if (["0", "false", "no", "off"].includes(trimmed)) return false;
  }
  return undefined;
};
var delayMs = function delayMs(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
};
var envMockFlag = typeof process !== "undefined" ? boolFromString((_process$env$VEJICE_U = (_process$env3 = process.env) === null || _process$env3 === void 0 ? void 0 : "false") !== null && _process$env$VEJICE_U !== void 0 ? _process$env$VEJICE_U : "") : undefined;
var winMockFlag = typeof window !== "undefined" && typeof window.__VEJICE_USE_MOCK__ === "boolean" ? window.__VEJICE_USE_MOCK__ : undefined;
var USE_MOCK = false;
if (typeof winMockFlag === "boolean") {
  USE_MOCK = winMockFlag;
} else if (typeof envMockFlag === "boolean") {
  USE_MOCK = envMockFlag;
}
var VejiceApiError = /*#__PURE__*/function (_Error) {
  function VejiceApiError(message) {
    var _this;
    var meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, VejiceApiError);
    _this = _callSuper(this, VejiceApiError, [message]);
    _this.name = "VejiceApiError";
    _this.meta = meta;
    if (meta.cause) _this.cause = meta.cause;
    return _this;
  }
  _inherits(VejiceApiError, _Error);
  return _createClass(VejiceApiError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
function describeAxiosError(err) {
  var _err$response, _err$response2;
  var status = err === null || err === void 0 || (_err$response = err.response) === null || _err$response === void 0 ? void 0 : _err$response.status;
  var code = err === null || err === void 0 ? void 0 : err.code; // e.g. 'ECONNABORTED'
  var data = err === null || err === void 0 || (_err$response2 = err.response) === null || _err$response2 === void 0 ? void 0 : _err$response2.data;
  var msg = err === null || err === void 0 ? void 0 : err.message;
  return {
    status: status,
    code: code,
    msg: msg,
    dataPreview: typeof data === "string" ? snip(data) : data && Object.keys(data)
  };
}
var MOCK_LATENCY_MS = 350;
var MOCK_INSERT_KEYWORDS = ["ki", "ker", "ko", "kjer", "da", "zato", "toda"];
function insertCommaBeforeKeyword() {
  var sentence = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var keyword = arguments.length > 1 ? arguments[1] : undefined;
  if (!sentence || !keyword) return null;
  var lower = sentence.toLowerCase();
  var needle = " ".concat(keyword.toLowerCase());
  var idx = lower.indexOf(needle);
  if (idx > 0) {
    var before = sentence[idx - 1];
    if (before && before !== "," && before !== "\n") {
      return sentence.slice(0, idx) + "," + sentence.slice(idx);
    }
  }
  return null;
}
function removeRedundantComma() {
  var sentence = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var double = sentence.indexOf(", ,");
  if (double >= 0) {
    return sentence.slice(0, double) + sentence.slice(double + 1);
  }
  var beforeAnd = sentence.indexOf(", in");
  if (beforeAnd >= 0) {
    return sentence.slice(0, beforeAnd) + sentence.slice(beforeAnd + 1);
  }
  return null;
}
function mockCorrectSentence() {
  var sentence = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var corrected = sentence;
  var _iterator = _createForOfIteratorHelper(MOCK_INSERT_KEYWORDS),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var keyword = _step.value;
      var updated = insertCommaBeforeKeyword(corrected, keyword);
      if (updated) {
        corrected = updated;
        return corrected;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var removed = removeRedundantComma(corrected);
  if (removed) return removed;
  return corrected;
}
function tokenizeForMock() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "t";
  if (typeof text !== "string" || !text.length) return [];
  var tokens = [];
  var regex = /[^\s]+/g;
  var match;
  var idx = 1;
  while (match = regex.exec(text)) {
    tokens.push({
      token_id: "".concat(prefix).concat(idx++),
      token: match[0],
      start_char: match.index,
      end_char: match.index + match[0].length
    });
  }
  return tokens;
}
function mockRequestPopravljenPoved() {
  return _mockRequestPopravljenPoved.apply(this, arguments);
}
function _mockRequestPopravljenPoved() {
  _mockRequestPopravljenPoved = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var poved,
      _args = arguments;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          poved = _args.length > 0 && _args[0] !== undefined ? _args[0] : "";
          return _context.a(2, new Promise(function (resolve) {
            setTimeout(function () {
              var correctedText = mockCorrectSentence(poved);
              resolve({
                correctedText: correctedText,
                raw: {
                  source_text: poved,
                  target_text: correctedText,
                  source_tokens: tokenizeForMock(poved, "s"),
                  target_tokens: tokenizeForMock(correctedText, "t")
                }
              });
            }, MOCK_LATENCY_MS);
          }));
      }
    }, _callee);
  }));
  return _mockRequestPopravljenPoved.apply(this, arguments);
}
function pickCorrectedText(fallback) {
  var _payload$popravki, _payload$corrections$, _payload$apply_correc;
  var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var candidateTexts = [payload.popravljeno_besedilo, payload.target_text, (_payload$popravki = payload.popravki) === null || _payload$popravki === void 0 || (_payload$popravki = _payload$popravki[0]) === null || _payload$popravki === void 0 ? void 0 : _payload$popravki.predlog, Array.isArray(payload.corrections) ? (_payload$corrections$ = payload.corrections[0]) === null || _payload$corrections$ === void 0 ? void 0 : _payload$corrections$.suggested_text : undefined, Array.isArray(payload.apply_corrections) ? (_payload$apply_correc = payload.apply_corrections[0]) === null || _payload$apply_correc === void 0 ? void 0 : _payload$apply_correc.suggested_text : undefined];
  return candidateTexts.map(function (txt) {
    return typeof txt === "string" ? txt.trim() : "";
  }).find(function (txt) {
    return txt;
  }) || fallback;
}
function isRetryableError(info) {
  var status = info === null || info === void 0 ? void 0 : info.status;
  if (typeof status === "number" && status >= 500 && status < 600) return true;
  var code = typeof (info === null || info === void 0 ? void 0 : info.code) === "string" ? info.code.toUpperCase() : "";
  if (!code) return false;
  return ["ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK"].includes(code);
}
function requestPopravek(_x) {
  return _requestPopravek.apply(this, arguments);
}
/**
 * Pokliče Vejice API in vrne popravljeno poved.
 * Vrne popravljeno besedilo ali original, če pride do težave.
 */
function _requestPopravek() {
  _requestPopravek = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(poved) {
    var url, data, config, attempts, attempt, _performance$now, _performance, _performance$now2, t0, _poved$length, _performance$now3, _performance2, _performance2$now, r, t1, raw, correctedText, _performance$now4, _performance3, _performance3$now, _t, durationMs, info, retryable, delay, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          if (!USE_MOCK) {
            _context2.n = 1;
            break;
          }
          log("Mock API ->", snip(poved));
          return _context2.a(2, mockRequestPopravljenPoved(poved));
        case 1:
          if (API_KEY) {
            _context2.n = 2;
            break;
          }
          throw new VejiceApiError("Missing VEJICE_API_KEY configuration");
        case 2:
          url = "https://gpu-proc1.cjvt.si/popravljalnik-api/postavi_vejice";
          data = {
            vhodna_poved: poved,
            hkratne_napovedi: true,
            ne_označi_imen: false,
            prepričanost_modela: 0.08
          };
          config = {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-API-KEY": API_KEY
            },
            timeout: 15000 // 15s
            // withCredentials: false, // keep default; not needed unless API sets cookies
          };
          attempts = Math.max(1, API_MAX_ATTEMPTS);
          attempt = 1;
        case 3:
          if (!(attempt <= attempts)) {
            _context2.n = 10;
            break;
          }
          t0 = (_performance$now = (_performance = performance) === null || _performance === void 0 || (_performance$now2 = _performance.now) === null || _performance$now2 === void 0 ? void 0 : _performance$now2.call(_performance)) !== null && _performance$now !== void 0 ? _performance$now : Date.now();
          _context2.p = 4;
          log("POST", url, "| len:", (_poved$length = poved === null || poved === void 0 ? void 0 : poved.length) !== null && _poved$length !== void 0 ? _poved$length : 0, "| snippet:", snip(poved), "| attempt:", attempt);
          _context2.n = 5;
          return axios__WEBPACK_IMPORTED_MODULE_0__["default"].post(url, data, config);
        case 5:
          r = _context2.v;
          t1 = (_performance$now3 = (_performance2 = performance) === null || _performance2 === void 0 || (_performance2$now = _performance2.now) === null || _performance2$now === void 0 ? void 0 : _performance2$now.call(_performance2)) !== null && _performance$now3 !== void 0 ? _performance$now3 : Date.now();
          raw = _objectSpread({}, (r === null || r === void 0 ? void 0 : r.data) || {});
          correctedText = pickCorrectedText(poved, raw);
          if (typeof raw.source_text !== "string") raw.source_text = poved;
          if (typeof raw.target_text !== "string") raw.target_text = correctedText;
          log("OK", "".concat(Math.round(t1 - t0), " ms"), "| status:", r === null || r === void 0 ? void 0 : r.status, "| changed:", correctedText !== poved, "| keys:", raw && Object.keys(raw), "| sourceTokens:", Array.isArray(raw === null || raw === void 0 ? void 0 : raw.source_tokens) ? raw.source_tokens.length : 0, "| targetTokens:", Array.isArray(raw === null || raw === void 0 ? void 0 : raw.target_tokens) ? raw.target_tokens.length : 0, "| attempt:", attempt);
          return _context2.a(2, {
            correctedText: correctedText,
            raw: raw
          });
        case 6:
          _context2.p = 6;
          _t2 = _context2.v;
          _t = (_performance$now4 = (_performance3 = performance) === null || _performance3 === void 0 || (_performance3$now = _performance3.now) === null || _performance3$now === void 0 ? void 0 : _performance3$now.call(_performance3)) !== null && _performance$now4 !== void 0 ? _performance$now4 : Date.now();
          durationMs = Math.round(_t - t0);
          info = describeAxiosError(_t2);
          retryable = attempt < attempts && isRetryableError(info);
          log("ERROR", "".concat(durationMs, " ms"), _objectSpread(_objectSpread({}, info), {}, {
            attempt: attempt,
            retryable: retryable
          }));
          if (!retryable) {
            _context2.n = 8;
            break;
          }
          delay = API_RETRY_DELAY_MS * attempt;
          log("Retrying Vejice API request in", delay, "ms");
          _context2.n = 7;
          return delayMs(delay);
        case 7:
          return _context2.a(3, 9);
        case 8:
          throw new VejiceApiError("Vejice API call failed", {
            durationMs: durationMs,
            info: info,
            attempt: attempt,
            cause: _t2
          });
        case 9:
          attempt++;
          _context2.n = 3;
          break;
        case 10:
          return _context2.a(2);
      }
    }, _callee2, null, [[4, 6]]);
  }));
  return _requestPopravek.apply(this, arguments);
}
function popraviPoved(_x2) {
  return _popraviPoved.apply(this, arguments);
}
function _popraviPoved() {
  _popraviPoved = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(poved) {
    var _yield$requestPoprave, correctedText;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          _context3.n = 1;
          return requestPopravek(poved);
        case 1:
          _yield$requestPoprave = _context3.v;
          correctedText = _yield$requestPoprave.correctedText;
          return _context3.a(2, correctedText);
      }
    }, _callee3);
  }));
  return _popraviPoved.apply(this, arguments);
}
function popraviPovedDetailed(_x3) {
  return _popraviPovedDetailed.apply(this, arguments);
}
function _popraviPovedDetailed() {
  _popraviPovedDetailed = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(poved) {
    var _yield$requestPoprave2, correctedText, raw;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          _context4.n = 1;
          return requestPopravek(poved);
        case 1:
          _yield$requestPoprave2 = _context4.v;
          correctedText = _yield$requestPoprave2.correctedText;
          raw = _yield$requestPoprave2.raw;
          return _context4.a(2, {
            correctedText: correctedText,
            raw: raw,
            sourceTokens: Array.isArray(raw === null || raw === void 0 ? void 0 : raw.source_tokens) ? raw.source_tokens : [],
            targetTokens: Array.isArray(raw === null || raw === void 0 ? void 0 : raw.target_tokens) ? raw.target_tokens : [],
            sourceText: typeof (raw === null || raw === void 0 ? void 0 : raw.source_text) === "string" ? raw.source_text : poved,
            targetText: typeof (raw === null || raw === void 0 ? void 0 : raw.target_text) === "string" ? raw.target_text : correctedText
          });
      }
    }, _callee4);
  }));
  return _popraviPovedDetailed.apply(this, arguments);
}

/***/ }),

/***/ "./src/logic/adapters/wordDesktopAdapter.js":
/*!**************************************************!*\
  !*** ./src/logic/adapters/wordDesktopAdapter.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WordDesktopAdapter: function() { return /* binding */ WordDesktopAdapter; }
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var WordDesktopAdapter = /*#__PURE__*/function () {
  function WordDesktopAdapter(_ref) {
    var textBridge = _ref.textBridge;
    _classCallCheck(this, WordDesktopAdapter);
    this.textBridge = textBridge;
  }
  return _createClass(WordDesktopAdapter, [{
    key: "getParagraphs",
    value: function () {
      var _getParagraphs = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(context) {
        var paras;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              paras = context.document.body.paragraphs;
              paras.load("items/text");
              _context.n = 1;
              return context.sync();
            case 1:
              return _context.a(2, paras);
          }
        }, _callee);
      }));
      function getParagraphs(_x) {
        return _getParagraphs.apply(this, arguments);
      }
      return getParagraphs;
    }()
  }, {
    key: "applySuggestion",
    value: function () {
      var _applySuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(context, paragraph, suggestion) {
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              return _context2.a(2, this.textBridge.applySuggestion(context, paragraph, suggestion));
          }
        }, _callee2, this);
      }));
      function applySuggestion(_x2, _x3, _x4) {
        return _applySuggestion.apply(this, arguments);
      }
      return applySuggestion;
    }()
  }]);
}();

/***/ }),

/***/ "./src/logic/adapters/wordOnlineAdapter.js":
/*!*************************************************!*\
  !*** ./src/logic/adapters/wordOnlineAdapter.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WordOnlineAdapter: function() { return /* binding */ WordOnlineAdapter; }
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var WordOnlineAdapter = /*#__PURE__*/function () {
  function WordOnlineAdapter(_ref) {
    var highlightSuggestion = _ref.highlightSuggestion,
      textBridge = _ref.textBridge,
      clearSuggestionMarkers = _ref.clearSuggestionMarkers;
    _classCallCheck(this, WordOnlineAdapter);
    this.highlightSuggestionImpl = highlightSuggestion;
    this.textBridge = textBridge;
    this.clearSuggestionMarkersImpl = clearSuggestionMarkers;
  }
  return _createClass(WordOnlineAdapter, [{
    key: "getParagraphs",
    value: function () {
      var _getParagraphs = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(context) {
        var paras;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              paras = context.document.body.paragraphs;
              paras.load("items/text");
              _context.n = 1;
              return context.sync();
            case 1:
              return _context.a(2, paras);
          }
        }, _callee);
      }));
      function getParagraphs(_x) {
        return _getParagraphs.apply(this, arguments);
      }
      return getParagraphs;
    }()
  }, {
    key: "highlightSuggestion",
    value: function highlightSuggestion(context, paragraph, suggestion) {
      return this.highlightSuggestionImpl(context, paragraph, suggestion);
    }
  }, {
    key: "applySuggestion",
    value: function applySuggestion(context, paragraph, suggestion) {
      return this.textBridge.applySuggestion(context, paragraph, suggestion);
    }
  }, {
    key: "clearHighlights",
    value: function clearHighlights(context, suggestionsOverride, paragraphs) {
      return this.clearSuggestionMarkersImpl(context, suggestionsOverride, paragraphs);
    }
  }, {
    key: "shouldForceSpacingCleanup",
    value: function shouldForceSpacingCleanup() {
      var _this$textBridge$shou, _this$textBridge, _this$textBridge$shou2;
      return (_this$textBridge$shou = (_this$textBridge = this.textBridge) === null || _this$textBridge === void 0 || (_this$textBridge$shou2 = _this$textBridge.shouldForceSpacingCleanup) === null || _this$textBridge$shou2 === void 0 ? void 0 : _this$textBridge$shou2.call(_this$textBridge)) !== null && _this$textBridge$shou !== void 0 ? _this$textBridge$shou : false;
    }
  }]);
}();

/***/ }),

/***/ "./src/logic/anchoring/AnchorProvider.js":
/*!***********************************************!*\
  !*** ./src/logic/anchoring/AnchorProvider.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnchorProvider: function() { return /* binding */ AnchorProvider; }
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var AnchorProvider = /*#__PURE__*/function () {
  function AnchorProvider() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "AnchorProvider";
    _classCallCheck(this, AnchorProvider);
    this.name = name;
  }

  // eslint-disable-next-line class-methods-use-this
  return _createClass(AnchorProvider, [{
    key: "supportsCharHints",
    value: function supportsCharHints() {
      return false;
    }

    // eslint-disable-next-line class-methods-use-this
  }, {
    key: "getAnchors",
    value: function () {
      var _getAnchors = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              throw new Error("getAnchors() not implemented");
            case 1:
              return _context.a(2);
          }
        }, _callee);
      }));
      function getAnchors() {
        return _getAnchors.apply(this, arguments);
      }
      return getAnchors;
    }() // eslint-disable-next-line class-methods-use-this
  }, {
    key: "tokenize",
    value: function tokenize() {
      return [];
    }
  }]);
}();

/***/ }),

/***/ "./src/logic/anchoring/LemmatizerAnchorProvider.js":
/*!*********************************************************!*\
  !*** ./src/logic/anchoring/LemmatizerAnchorProvider.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LemmatizerAnchorProvider: function() { return /* binding */ LemmatizerAnchorProvider; }
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/lib/axios.js");
/* harmony import */ var _AnchorProvider_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AnchorProvider.js */ "./src/logic/anchoring/AnchorProvider.js");
/* harmony import */ var _SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SyntheticAnchorProvider.js */ "./src/logic/anchoring/SyntheticAnchorProvider.js");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }



var MAX_LOG_LENGTH = 120;
var LOG_PREFIX = "[LemmatizerAnchorProvider]";
var snip = function snip(value) {
  return typeof value === "string" && value.length > MAX_LOG_LENGTH ? "".concat(value.slice(0, MAX_LOG_LENGTH), "\u2026") : value;
};
var logInfo = function logInfo() {
  if (typeof console !== "undefined" && typeof console.log === "function") {
    var _console;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    (_console = console).log.apply(_console, [LOG_PREFIX].concat(args));
  }
};
var logWarn = function logWarn() {
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    var _console2;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    (_console2 = console).warn.apply(_console2, [LOG_PREFIX].concat(args));
  }
};
function resolveDefaultEndpoint() {
  var _window$location, _process$env;
  var windowEndpoint = typeof window !== "undefined" && typeof window.__VEJICE_LEMMAS_URL === "string" ? window.__VEJICE_LEMMAS_URL.trim() : "";
  if (windowEndpoint) return windowEndpoint;
  if (typeof window !== "undefined" && (_window$location = window.location) !== null && _window$location !== void 0 && _window$location.origin) {
    var isLocalDevOrigin = window.location.origin === "https://127.0.0.1:4001" || window.location.origin === "https://localhost:4001";
    if (isLocalDevOrigin) {
      return "".concat(window.location.origin, "/lemmas");
    }
  }
  var envEndpoint = typeof process !== "undefined" && typeof ((_process$env = process.env) === null || _process$env === void 0 ? void 0 : "https://127.0.0.1:4001/lemmas") === "string" ? "https://127.0.0.1:4001/lemmas".trim() : "";
  if (envEndpoint) return envEndpoint;
  return "https://lemmas-vejice.com/lemmas";
}

/**
 * Anchor provider that prefers real offsets from a lemmatizer service.
 * Falls back to SyntheticAnchorProvider when the service is unavailable.
 */
var LemmatizerAnchorProvider = /*#__PURE__*/function (_AnchorProvider) {
  function LemmatizerAnchorProvider() {
    var _process$env2;
    var _this;
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      client = _ref.client,
      endpoint = _ref.endpoint,
      timeoutMs = _ref.timeoutMs;
    _classCallCheck(this, LemmatizerAnchorProvider);
    _this = _callSuper(this, LemmatizerAnchorProvider, ["LemmatizerAnchorProvider"]);
    var defaultEndpoint = resolveDefaultEndpoint();
    var resolvedTimeout = typeof timeoutMs === "number" && Number.isFinite(timeoutMs) ? timeoutMs : parseInt(typeof process !== "undefined" && ((_process$env2 = process.env) === null || _process$env2 === void 0 ? void 0 : "8000") || typeof window !== "undefined" && window.__VEJICE_LEMMAS_TIMEOUT_MS || "8000", 10) || 8000;
    _this.endpoint = endpoint || defaultEndpoint;
    _this.client = client || axios__WEBPACK_IMPORTED_MODULE_0__["default"].create({
      timeout: resolvedTimeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    _this.paragraphAnchors = [];
    _this.fallbackProvider = new _SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.SyntheticAnchorProvider();
    return _this;
  }
  _inherits(LemmatizerAnchorProvider, _AnchorProvider);
  return _createClass(LemmatizerAnchorProvider, [{
    key: "supportsCharHints",
    value: function supportsCharHints() {
      return true;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.paragraphAnchors.length = 0;
    }
  }, {
    key: "setAnchors",
    value: function setAnchors(paragraphIndex, anchors) {
      this.paragraphAnchors[paragraphIndex] = anchors;
    }
  }, {
    key: "getAnchorsForParagraph",
    value: function getAnchorsForParagraph(paragraphIndex) {
      return this.paragraphAnchors[paragraphIndex];
    }
  }, {
    key: "deleteAnchors",
    value: function deleteAnchors(paragraphIndex) {
      if (typeof paragraphIndex === "number" && paragraphIndex >= 0) {
        delete this.paragraphAnchors[paragraphIndex];
      }
    }

    /**
     * @param {object} params
     * @returns {Promise<object>} entry describing source/target anchors
     */
  }, {
    key: "getAnchors",
    value: (function () {
      var _getAnchors = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(params) {
        var _console$time, _console3, _console$timeEnd, _console4;
        var paragraphIndex, _params$originalText, originalText, _params$correctedText, correctedText, _params$documentOffse, documentOffset, timerLabel, fallbackEntry, _yield$Promise$all, _yield$Promise$all2, sourceLemmaTokens, targetLemmaTokens, _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              paragraphIndex = params.paragraphIndex, _params$originalText = params.originalText, originalText = _params$originalText === void 0 ? "" : _params$originalText, _params$correctedText = params.correctedText, correctedText = _params$correctedText === void 0 ? "" : _params$correctedText, _params$documentOffse = params.documentOffset, documentOffset = _params$documentOffse === void 0 ? 0 : _params$documentOffse;
              logInfo("getAnchors -> paragraph", paragraphIndex, "| original len:", originalText.length, "| corrected len:", correctedText.length);
              timerLabel = "".concat(LOG_PREFIX, " anchor-").concat(paragraphIndex, "-").concat(Date.now());
              (_console$time = (_console3 = console).time) === null || _console$time === void 0 || _console$time.call(_console3, timerLabel);
              _context.n = 1;
              return this.fallbackProvider.getAnchors(params);
            case 1:
              fallbackEntry = _context.v;
              _context.p = 2;
              _context.n = 3;
              return Promise.all([this.fetchLemmaTokens(originalText), this.fetchLemmaTokens(correctedText)]);
            case 3:
              _yield$Promise$all = _context.v;
              _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
              sourceLemmaTokens = _yield$Promise$all2[0];
              targetLemmaTokens = _yield$Promise$all2[1];
              this.applyLemmaOffsets({
                collection: fallbackEntry.sourceAnchors,
                lemmas: sourceLemmaTokens,
                documentOffset: documentOffset
              });
              this.applyLemmaOffsets({
                collection: fallbackEntry.targetAnchors,
                lemmas: targetLemmaTokens,
                documentOffset: documentOffset
              });
              logInfo("Lemma offsets applied", "| paragraph:", paragraphIndex, "| source tokens:", sourceLemmaTokens.length, "| target tokens:", targetLemmaTokens.length);
              _context.n = 5;
              break;
            case 4:
              _context.p = 4;
              _t = _context.v;
              logWarn("Falling back to synthetic anchors for paragraph", paragraphIndex, _t);
            case 5:
              (_console$timeEnd = (_console4 = console).timeEnd) === null || _console$timeEnd === void 0 || _console$timeEnd.call(_console4, timerLabel);
              this.setAnchors(paragraphIndex, fallbackEntry);
              return _context.a(2, fallbackEntry);
          }
        }, _callee, this, [[2, 4]]);
      }));
      function getAnchors(_x) {
        return _getAnchors.apply(this, arguments);
      }
      return getAnchors;
    }())
  }, {
    key: "fetchLemmaTokens",
    value: function () {
      var _fetchLemmaTokens = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
        var _console$time2, _console5, _this$client$defaults, _console$timeEnd2, _console6;
        var text,
          safeText,
          timerLabel,
          response,
          lemmaTokens,
          _args2 = arguments;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              text = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : "";
              safeText = typeof text === "string" ? text : "";
              if (safeText.trim()) {
                _context2.n = 1;
                break;
              }
              return _context2.a(2, []);
            case 1:
              if (this.endpoint) {
                _context2.n = 2;
                break;
              }
              throw new Error("Lemmatizer endpoint URL is not configured");
            case 2:
              timerLabel = "".concat(LOG_PREFIX, " fetch-").concat(Date.now(), "-").concat(Math.random().toString(16).slice(2));
              logInfo("Fetching lemmas", "| url:", this.endpoint, "| snippet:", snip(safeText));
              (_console$time2 = (_console5 = console).time) === null || _console$time2 === void 0 || _console$time2.call(_console5, timerLabel);
              _context2.n = 3;
              return this.client.post(this.endpoint, {
                lang: "sl",
                text: safeText
              }, {
                timeout: (_this$client$defaults = this.client.defaults) === null || _this$client$defaults === void 0 ? void 0 : _this$client$defaults.timeout
              });
            case 3:
              response = _context2.v;
              (_console$timeEnd2 = (_console6 = console).timeEnd) === null || _console$timeEnd2 === void 0 || _console$timeEnd2.call(_console6, timerLabel);
              lemmaTokens = normalizeLemmaPayload(response === null || response === void 0 ? void 0 : response.data);
              logInfo("Lemma response", "| tokens:", lemmaTokens.length);
              return _context2.a(2, lemmaTokens);
          }
        }, _callee2, this);
      }));
      function fetchLemmaTokens() {
        return _fetchLemmaTokens.apply(this, arguments);
      }
      return fetchLemmaTokens;
    }()
  }, {
    key: "applyLemmaOffsets",
    value: function applyLemmaOffsets(_ref2) {
      var _collection$ordered;
      var collection = _ref2.collection,
        lemmas = _ref2.lemmas,
        _ref2$documentOffset = _ref2.documentOffset,
        documentOffset = _ref2$documentOffset === void 0 ? 0 : _ref2$documentOffset;
      if (!(collection !== null && collection !== void 0 && (_collection$ordered = collection.ordered) !== null && _collection$ordered !== void 0 && _collection$ordered.length) || !Array.isArray(lemmas) || !lemmas.length) return;
      var lemmaIndex = 0;
      var _iterator = _createForOfIteratorHelper(collection.ordered),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _anchor$tokenText;
          var anchor = _step.value;
          if (!anchor) continue;
          var tokenText = (_anchor$tokenText = anchor.tokenText) !== null && _anchor$tokenText !== void 0 ? _anchor$tokenText : "";
          if (!tokenText.trim()) continue;
          var match = findLemmaMatch(tokenText, lemmas, lemmaIndex);
          if (match) {
            var charStart = match.start;
            var charEnd = typeof match.end === "number" ? match.end : typeof charStart === "number" ? charStart + tokenText.length : -1;
            anchor.charStart = charStart !== null && charStart !== void 0 ? charStart : anchor.charStart;
            anchor.charEnd = charEnd !== null && charEnd !== void 0 ? charEnd : anchor.charEnd;
            anchor.documentCharStart = typeof charStart === "number" && charStart >= 0 ? documentOffset + charStart : anchor.documentCharStart;
            anchor.documentCharEnd = typeof charEnd === "number" && charEnd >= 0 ? documentOffset + charEnd : anchor.documentCharEnd;
            anchor.matched = typeof charStart === "number" && charStart >= 0;
            lemmaIndex = match.index + 1;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }]);
}(_AnchorProvider_js__WEBPACK_IMPORTED_MODULE_1__.AnchorProvider);
function normalizeLemmaPayload(payload) {
  if (!payload) return [];
  if (Array.isArray(payload.tokens)) {
    return payload.tokens.map(normalizeLemmaToken).filter(Boolean);
  }
  if (Array.isArray(payload.result)) {
    return payload.result.map(normalizeLemmaToken).filter(Boolean);
  }
  if (Array.isArray(payload.sentences)) {
    return payload.sentences.flatMap(function (sentence) {
      if (Array.isArray(sentence === null || sentence === void 0 ? void 0 : sentence.tokens)) return sentence.tokens;
      return sentence;
    }).map(normalizeLemmaToken).filter(Boolean);
  }
  if (Array.isArray(payload)) {
    return payload.map(normalizeLemmaToken).filter(Boolean);
  }
  if (Array.isArray(payload.words)) {
    return payload.words.map(normalizeLemmaToken).filter(Boolean);
  }
  return [];
}
function normalizeLemmaToken(raw, index) {
  var _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _raw$token;
  if (!raw || _typeof(raw) !== "object") return null;
  var text = (_ref3 = (_ref4 = (_ref5 = (_ref6 = (_ref7 = (_ref8 = (_raw$token = raw.token) !== null && _raw$token !== void 0 ? _raw$token : raw.text) !== null && _ref8 !== void 0 ? _ref8 : raw.word) !== null && _ref7 !== void 0 ? _ref7 : raw.form) !== null && _ref6 !== void 0 ? _ref6 : raw.surface) !== null && _ref5 !== void 0 ? _ref5 : raw.lemma) !== null && _ref4 !== void 0 ? _ref4 : raw.value) !== null && _ref3 !== void 0 ? _ref3 : "";
  var start = pickNumber([raw.start_char, raw.start, raw.begin, raw.position, raw.offset, raw.charStart]);
  var end = pickNumber([raw.end_char, raw.end, raw.finish, raw.charEnd]);
  return {
    text: text,
    normalized: normalizeForMatch(text),
    start: typeof start === "number" ? start : undefined,
    end: typeof end === "number" ? end : undefined,
    index: typeof raw.index === "number" ? raw.index : index !== null && index !== void 0 ? index : 0
  };
}
function pickNumber(candidates) {
  if (!Array.isArray(candidates)) return undefined;
  var _iterator2 = _createForOfIteratorHelper(candidates),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var candidate = _step2.value;
      if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return undefined;
}
function normalizeForMatch(value) {
  return typeof value === "string" ? value.replace(/\s+/g, "").replace(/[.,!?;:“”„'"«»]/g, "").toLowerCase() : "";
}
function findLemmaMatch(tokenText, lemmas) {
  var startIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var normalizedToken = normalizeForMatch(tokenText);
  for (var i = startIndex; i < lemmas.length; i++) {
    var lemma = lemmas[i];
    if (!(lemma !== null && lemma !== void 0 && lemma.text)) continue;
    var lemmaNorm = lemma.normalized || normalizeForMatch(lemma.text);
    if (lemma.text === tokenText || lemmaNorm && lemmaNorm === normalizedToken) {
      return _objectSpread(_objectSpread({}, lemma), {}, {
        index: i
      });
    }
  }
  return null;
}

/***/ }),

/***/ "./src/logic/anchoring/SyntheticAnchorProvider.js":
/*!********************************************************!*\
  !*** ./src/logic/anchoring/SyntheticAnchorProvider.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SyntheticAnchorProvider: function() { return /* binding */ SyntheticAnchorProvider; },
/* harmony export */   findAnchorsNearChar: function() { return /* binding */ findAnchorsNearChar; },
/* harmony export */   mapTokensToParagraphText: function() { return /* binding */ mapTokensToParagraphText; },
/* harmony export */   normalizeToken: function() { return /* binding */ normalizeToken; },
/* harmony export */   normalizeTokenList: function() { return /* binding */ normalizeTokenList; },
/* harmony export */   resolveTokenPosition: function() { return /* binding */ resolveTokenPosition; },
/* harmony export */   tokenizeForAnchoring: function() { return /* binding */ tokenizeForAnchoring; }
/* harmony export */ });
/* harmony import */ var _AnchorProvider_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AnchorProvider.js */ "./src/logic/anchoring/AnchorProvider.js");
/* harmony import */ var _engine_textUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../engine/textUtils.js */ "./src/logic/engine/textUtils.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }


var SyntheticAnchorProvider = /*#__PURE__*/function (_AnchorProvider) {
  function SyntheticAnchorProvider() {
    var _this;
    _classCallCheck(this, SyntheticAnchorProvider);
    _this = _callSuper(this, SyntheticAnchorProvider, ["SyntheticAnchorProvider"]);
    _this.paragraphAnchors = [];
    return _this;
  }
  _inherits(SyntheticAnchorProvider, _AnchorProvider);
  return _createClass(SyntheticAnchorProvider, [{
    key: "reset",
    value: function reset() {
      this.paragraphAnchors.length = 0;
    }
  }, {
    key: "setAnchors",
    value: function setAnchors(paragraphIndex, anchors) {
      this.paragraphAnchors[paragraphIndex] = anchors;
    }
  }, {
    key: "getAnchorsForParagraph",
    value: function getAnchorsForParagraph(paragraphIndex) {
      return this.paragraphAnchors[paragraphIndex];
    }
  }, {
    key: "deleteAnchors",
    value: function deleteAnchors(paragraphIndex) {
      if (typeof paragraphIndex === "number" && paragraphIndex >= 0) {
        delete this.paragraphAnchors[paragraphIndex];
      }
    }
  }, {
    key: "getAnchors",
    value: function () {
      var _getAnchors = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_ref) {
        var paragraphIndex, _ref$originalText, originalText, _ref$correctedText, correctedText, _ref$sourceTokens, sourceTokens, _ref$targetTokens, targetTokens, _ref$documentOffset, documentOffset, safeOriginal, safeCorrected, normalizedSource, normalizedTarget, entry;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              paragraphIndex = _ref.paragraphIndex, _ref$originalText = _ref.originalText, originalText = _ref$originalText === void 0 ? "" : _ref$originalText, _ref$correctedText = _ref.correctedText, correctedText = _ref$correctedText === void 0 ? "" : _ref$correctedText, _ref$sourceTokens = _ref.sourceTokens, sourceTokens = _ref$sourceTokens === void 0 ? [] : _ref$sourceTokens, _ref$targetTokens = _ref.targetTokens, targetTokens = _ref$targetTokens === void 0 ? [] : _ref$targetTokens, _ref$documentOffset = _ref.documentOffset, documentOffset = _ref$documentOffset === void 0 ? 0 : _ref$documentOffset;
              safeOriginal = typeof originalText === "string" ? originalText : "";
              safeCorrected = typeof correctedText === "string" ? correctedText : "";
              normalizedSource = normalizeTokenList(sourceTokens, "s");
              normalizedTarget = normalizeTokenList(targetTokens, "t");
              entry = {
                paragraphIndex: paragraphIndex,
                documentOffset: documentOffset,
                originalText: safeOriginal,
                correctedText: safeCorrected,
                sourceTokens: normalizedSource,
                targetTokens: normalizedTarget,
                sourceAnchors: mapTokensToParagraphText(paragraphIndex, safeOriginal, normalizedSource, documentOffset),
                targetAnchors: mapTokensToParagraphText(paragraphIndex, safeCorrected, normalizedTarget, documentOffset)
              };
              this.setAnchors(paragraphIndex, entry);
              return _context.a(2, entry);
          }
        }, _callee, this);
      }));
      function getAnchors(_x) {
        return _getAnchors.apply(this, arguments);
      }
      return getAnchors;
    }()
  }]);
}(_AnchorProvider_js__WEBPACK_IMPORTED_MODULE_0__.AnchorProvider);
function normalizeTokenList(tokens, prefix) {
  if (!Array.isArray(tokens)) return [];
  var normalized = [];
  for (var i = 0; i < tokens.length; i++) {
    var token = normalizeToken(tokens[i], prefix, i);
    if (token) normalized.push(token);
  }
  return normalized;
}
function normalizeToken(rawToken, prefix, index) {
  if (rawToken === null || typeof rawToken === "undefined") return null;
  if (typeof rawToken === "string") {
    return {
      id: "".concat(prefix).concat(index + 1),
      text: rawToken,
      raw: rawToken
    };
  }
  if (_typeof(rawToken) === "object") {
    var _ref2, _ref3, _ref4, _ref5, _rawToken$token_id, _ref6, _ref7, _ref8, _ref9, _rawToken$token, _ref0, _ref1, _ref10, _ref11, _rawToken$whitespace, _ref12, _ref13, _ref14, _rawToken$leading_ws;
    var idCandidate = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_rawToken$token_id = rawToken.token_id) !== null && _rawToken$token_id !== void 0 ? _rawToken$token_id : rawToken.tokenId) !== null && _ref5 !== void 0 ? _ref5 : rawToken.id) !== null && _ref4 !== void 0 ? _ref4 : rawToken.ID) !== null && _ref3 !== void 0 ? _ref3 : rawToken.name) !== null && _ref2 !== void 0 ? _ref2 : rawToken.key;
    var textCandidate = (_ref6 = (_ref7 = (_ref8 = (_ref9 = (_rawToken$token = rawToken.token) !== null && _rawToken$token !== void 0 ? _rawToken$token : rawToken.text) !== null && _ref9 !== void 0 ? _ref9 : rawToken.form) !== null && _ref8 !== void 0 ? _ref8 : rawToken.value) !== null && _ref7 !== void 0 ? _ref7 : rawToken.surface) !== null && _ref6 !== void 0 ? _ref6 : rawToken.word;
    var trailing = (_ref0 = (_ref1 = (_ref10 = (_ref11 = (_rawToken$whitespace = rawToken.whitespace) !== null && _rawToken$whitespace !== void 0 ? _rawToken$whitespace : rawToken.trailing_ws) !== null && _ref11 !== void 0 ? _ref11 : rawToken.trailingWhitespace) !== null && _ref10 !== void 0 ? _ref10 : rawToken.after) !== null && _ref1 !== void 0 ? _ref1 : rawToken.space) !== null && _ref0 !== void 0 ? _ref0 : "";
    var leading = (_ref12 = (_ref13 = (_ref14 = (_rawToken$leading_ws = rawToken.leading_ws) !== null && _rawToken$leading_ws !== void 0 ? _rawToken$leading_ws : rawToken.leadingWhitespace) !== null && _ref14 !== void 0 ? _ref14 : rawToken.before) !== null && _ref13 !== void 0 ? _ref13 : rawToken.prefix) !== null && _ref12 !== void 0 ? _ref12 : "";
    return {
      id: typeof idCandidate === "string" ? idCandidate : "".concat(prefix).concat(index + 1),
      text: typeof textCandidate === "string" ? textCandidate : "",
      trailingWhitespace: typeof trailing === "string" ? trailing : "",
      leadingWhitespace: typeof leading === "string" ? leading : "",
      raw: rawToken
    };
  }
  return null;
}
function mapTokensToParagraphText(paragraphIndex, paragraphText, tokens) {
  var documentOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var byId = Object.create(null);
  var ordered = [];
  if (!Array.isArray(tokens) || !tokens.length) {
    return {
      byId: byId,
      ordered: ordered
    };
  }
  var safeParagraph = typeof paragraphText === "string" ? paragraphText : "";
  var searchableParagraph = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.normalizeParagraphWhitespace)(safeParagraph);
  var textOccurrences = Object.create(null);
  var trimmedOccurrences = Object.create(null);
  var cursor = 0;
  for (var i = 0; i < tokens.length; i++) {
    var _token$text, _token$id, _textOccurrences$text, _trimmedOccurrences$t;
    var token = tokens[i];
    var tokenText = (_token$text = token === null || token === void 0 ? void 0 : token.text) !== null && _token$text !== void 0 ? _token$text : "";
    var tokenId = (_token$id = token === null || token === void 0 ? void 0 : token.id) !== null && _token$id !== void 0 ? _token$id : "tok".concat(i + 1);
    var tokenLength = tokenText.length;
    var charStart = resolveTokenPosition(searchableParagraph, tokenText, cursor);
    var charEnd = charStart >= 0 ? charStart + tokenLength : -1;
    if (charStart >= 0) {
      cursor = charEnd;
    }
    var textKey = tokenText || "";
    var trimmedKey = textKey.trim();
    var occurrence = (_textOccurrences$text = textOccurrences[textKey]) !== null && _textOccurrences$text !== void 0 ? _textOccurrences$text : 0;
    textOccurrences[textKey] = occurrence + 1;
    var trimmedOccurrence = trimmedKey && trimmedKey !== textKey ? (_trimmedOccurrences$t = trimmedOccurrences[trimmedKey]) !== null && _trimmedOccurrences$t !== void 0 ? _trimmedOccurrences$t : 0 : occurrence;
    if (trimmedKey && trimmedKey !== textKey) {
      trimmedOccurrences[trimmedKey] = trimmedOccurrence + 1;
    }
    var anchor = {
      paragraphIndex: paragraphIndex,
      tokenId: tokenId,
      tokenIndex: i,
      tokenText: tokenText,
      length: tokenLength,
      textOccurrence: occurrence,
      trimmedTextOccurrence: trimmedKey ? trimmedOccurrence : occurrence,
      charStart: charStart,
      charEnd: charEnd,
      documentCharStart: charStart >= 0 ? documentOffset + charStart : -1,
      documentCharEnd: charEnd >= 0 ? documentOffset + charEnd : -1,
      matched: charStart >= 0,
      repeatKey: (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.normalizeTokenRepeatKey)(tokenText)
    };
    byId[tokenId] = anchor;
    ordered.push(anchor);
  }
  annotateRepeatKeyTotals(ordered);
  return {
    byId: byId,
    ordered: ordered
  };
}
function annotateRepeatKeyTotals(list) {
  if (!Array.isArray(list) || !list.length) return;
  var totals = Object.create(null);
  var positions = Object.create(null);
  var _iterator = _createForOfIteratorHelper(list),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _totals$_key;
      var anchor = _step.value;
      var _key = anchor === null || anchor === void 0 ? void 0 : anchor.repeatKey;
      if (!_key) continue;
      totals[_key] = ((_totals$_key = totals[_key]) !== null && _totals$_key !== void 0 ? _totals$_key : 0) + 1;
      positions[_key] = positions[_key] || [];
      if (typeof anchor.charStart === "number" && anchor.charStart >= 0) {
        positions[_key].push(anchor.charStart);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var nearestGap = Object.create(null);
  for (var _i = 0, _Object$entries = Object.entries(positions); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      key = _Object$entries$_i[0],
      coords = _Object$entries$_i[1];
    if (!Array.isArray(coords) || coords.length < 2) continue;
    var sorted = coords.slice().sort(function (a, b) {
      return a - b;
    });
    var gaps = new Map();
    for (var i = 0; i < sorted.length; i++) {
      var gap = Infinity;
      if (i > 0) gap = Math.min(gap, sorted[i] - sorted[i - 1]);
      if (i < sorted.length - 1) gap = Math.min(gap, sorted[i + 1] - sorted[i]);
      gaps.set(sorted[i], gap);
    }
    nearestGap[key] = gaps;
  }
  var _iterator2 = _createForOfIteratorHelper(list),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _totals$_key2;
      var _anchor = _step2.value;
      if (!_anchor) continue;
      var _key2 = _anchor.repeatKey;
      _anchor.repeatKeyTotal = _key2 ? (_totals$_key2 = totals[_key2]) !== null && _totals$_key2 !== void 0 ? _totals$_key2 : 0 : 0;
      if (_key2 && nearestGap[_key2] && typeof _anchor.charStart === "number") {
        var _gap = nearestGap[_key2].get(_anchor.charStart);
        _anchor.repeatKeyNearestGap = typeof _gap === "number" ? _gap : Infinity;
      } else {
        _anchor.repeatKeyNearestGap = Infinity;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}
function resolveTokenPosition(text, tokenText, fromIndex) {
  if (!tokenText || typeof text !== "string") return -1;
  var textLength = text.length;
  if (!textLength) return -1;
  var searchStart = fromIndex;
  if (searchStart < 0) searchStart = 0;
  if (searchStart > textLength) searchStart = textLength;
  var idx = text.indexOf(tokenText, searchStart);
  if (idx !== -1) return idx;
  var trimmed = tokenText.trim();
  if (trimmed && trimmed !== tokenText) {
    idx = text.indexOf(trimmed, searchStart);
    if (idx !== -1) return idx;
  }
  if (searchStart > 0) {
    var retryStart = Math.max(0, searchStart - tokenText.length - 1);
    idx = text.indexOf(tokenText, retryStart);
    if (idx !== -1) return idx;
  }
  return text.indexOf(tokenText);
}
function findAnchorsNearChar(entry, type, charIndex) {
  var _collection$ordered;
  var collection = type === "target" ? entry === null || entry === void 0 ? void 0 : entry.targetAnchors : entry === null || entry === void 0 ? void 0 : entry.sourceAnchors;
  if (!(collection !== null && collection !== void 0 && (_collection$ordered = collection.ordered) !== null && _collection$ordered !== void 0 && _collection$ordered.length) || typeof charIndex !== "number" || charIndex < 0) {
    return {
      before: null,
      at: null,
      after: null
    };
  }
  var before = null;
  for (var i = 0; i < collection.ordered.length; i++) {
    var _ref15, _anchor$length, _anchor$tokenText;
    var anchor = collection.ordered[i];
    if (!anchor || anchor.charStart < 0) continue;
    var anchorEnd = typeof anchor.charEnd === "number" ? anchor.charEnd : anchor.charStart + Math.max(1, (_ref15 = (_anchor$length = anchor.length) !== null && _anchor$length !== void 0 ? _anchor$length : (_anchor$tokenText = anchor.tokenText) === null || _anchor$tokenText === void 0 ? void 0 : _anchor$tokenText.length) !== null && _ref15 !== void 0 ? _ref15 : 1);
    // Treat token end as exclusive so boundary positions resolve to the previous token.
    if (charIndex >= anchor.charStart && charIndex < anchorEnd) {
      return {
        before: before !== null && before !== void 0 ? before : anchor,
        at: anchor,
        after: findNextAnchorWithPosition(collection.ordered, i + 1)
      };
    }
    if (anchor.charStart > charIndex) {
      return {
        before: before,
        at: null,
        after: anchor
      };
    }
    before = anchor;
  }
  return {
    before: before,
    at: null,
    after: null
  };
}
function findNextAnchorWithPosition(list, startIndex) {
  if (!Array.isArray(list)) return null;
  for (var i = startIndex; i < list.length; i++) {
    var anchor = list[i];
    if (anchor && anchor.charStart >= 0) return anchor;
  }
  return null;
}
function tokenizeForAnchoring() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "syn";
  if (typeof text !== "string" || !text.length) return [];
  var tokens = [];
  var regex = /[^\s]+/g;
  var match;
  var idx = 1;
  while (match = regex.exec(text)) {
    tokens.push({
      token_id: "".concat(prefix).concat(idx++),
      token: match[0],
      start_char: match.index,
      end_char: match.index + match[0].length
    });
  }
  return tokens;
}

/***/ }),

/***/ "./src/logic/bridges/desktopTextBridge.js":
/*!************************************************!*\
  !*** ./src/logic/bridges/desktopTextBridge.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DesktopTextBridge: function() { return /* binding */ DesktopTextBridge; }
/* harmony export */ });
/* harmony import */ var _textBridge_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./textBridge.js */ "./src/logic/bridges/textBridge.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }

var DesktopTextBridge = /*#__PURE__*/function (_TextBridge) {
  function DesktopTextBridge(_ref) {
    var applyInsertSuggestion = _ref.applyInsertSuggestion,
      applyDeleteSuggestion = _ref.applyDeleteSuggestion;
    _classCallCheck(this, DesktopTextBridge);
    return _callSuper(this, DesktopTextBridge, [{
      applyInsertSuggestion: applyInsertSuggestion,
      applyDeleteSuggestion: applyDeleteSuggestion,
      forceSpacingCleanup: false,
      normalizationProfile: {
        collapseWhitespace: true,
        normalizeQuotes: true,
        normalizeDashes: true,
        normalizeEllipsis: false
      }
    }]);
  }
  _inherits(DesktopTextBridge, _TextBridge);
  return _createClass(DesktopTextBridge);
}(_textBridge_js__WEBPACK_IMPORTED_MODULE_0__.TextBridge);

/***/ }),

/***/ "./src/logic/bridges/onlineTextBridge.js":
/*!***********************************************!*\
  !*** ./src/logic/bridges/onlineTextBridge.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OnlineTextBridge: function() { return /* binding */ OnlineTextBridge; }
/* harmony export */ });
/* harmony import */ var _textBridge_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./textBridge.js */ "./src/logic/bridges/textBridge.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }

var OnlineTextBridge = /*#__PURE__*/function (_TextBridge) {
  function OnlineTextBridge(_ref) {
    var applyInsertSuggestion = _ref.applyInsertSuggestion,
      applyDeleteSuggestion = _ref.applyDeleteSuggestion;
    _classCallCheck(this, OnlineTextBridge);
    return _callSuper(this, OnlineTextBridge, [{
      applyInsertSuggestion: applyInsertSuggestion,
      applyDeleteSuggestion: applyDeleteSuggestion,
      forceSpacingCleanup: true,
      normalizationProfile: {
        collapseWhitespace: true,
        normalizeQuotes: true,
        normalizeDashes: true,
        normalizeEllipsis: true
      }
    }]);
  }
  _inherits(OnlineTextBridge, _TextBridge);
  return _createClass(OnlineTextBridge);
}(_textBridge_js__WEBPACK_IMPORTED_MODULE_0__.TextBridge);

/***/ }),

/***/ "./src/logic/bridges/textBridge.js":
/*!*****************************************!*\
  !*** ./src/logic/bridges/textBridge.js ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TextBridge: function() { return /* binding */ TextBridge; }
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var TextBridge = /*#__PURE__*/function () {
  function TextBridge(_ref) {
    var applyInsertSuggestion = _ref.applyInsertSuggestion,
      applyDeleteSuggestion = _ref.applyDeleteSuggestion,
      _ref$forceSpacingClea = _ref.forceSpacingCleanup,
      forceSpacingCleanup = _ref$forceSpacingClea === void 0 ? false : _ref$forceSpacingClea,
      _ref$normalizationPro = _ref.normalizationProfile,
      normalizationProfile = _ref$normalizationPro === void 0 ? null : _ref$normalizationPro;
    _classCallCheck(this, TextBridge);
    this.applyInsertSuggestionImpl = applyInsertSuggestion;
    this.applyDeleteSuggestionImpl = applyDeleteSuggestion;
    this.forceSpacingCleanup = forceSpacingCleanup;
    this.normalizationProfile = normalizationProfile || {
      collapseWhitespace: true,
      normalizeQuotes: false,
      normalizeDashes: false,
      normalizeEllipsis: false
    };
  }
  return _createClass(TextBridge, [{
    key: "applyInsert",
    value: function () {
      var _applyInsert = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(context, paragraph, suggestion) {
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              return _context.a(2, this.applyInsertSuggestionImpl(context, paragraph, suggestion));
          }
        }, _callee, this);
      }));
      function applyInsert(_x, _x2, _x3) {
        return _applyInsert.apply(this, arguments);
      }
      return applyInsert;
    }()
  }, {
    key: "applyDelete",
    value: function () {
      var _applyDelete = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(context, paragraph, suggestion) {
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              return _context2.a(2, this.applyDeleteSuggestionImpl(context, paragraph, suggestion));
          }
        }, _callee2, this);
      }));
      function applyDelete(_x4, _x5, _x6) {
        return _applyDelete.apply(this, arguments);
      }
      return applyDelete;
    }()
  }, {
    key: "applySuggestion",
    value: function () {
      var _applySuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(context, paragraph, suggestion) {
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              if (!((suggestion === null || suggestion === void 0 ? void 0 : suggestion.kind) === "insert")) {
                _context3.n = 1;
                break;
              }
              return _context3.a(2, this.applyInsert(context, paragraph, suggestion));
            case 1:
              return _context3.a(2, this.applyDelete(context, paragraph, suggestion));
          }
        }, _callee3, this);
      }));
      function applySuggestion(_x7, _x8, _x9) {
        return _applySuggestion.apply(this, arguments);
      }
      return applySuggestion;
    }()
  }, {
    key: "shouldForceSpacingCleanup",
    value: function shouldForceSpacingCleanup() {
      return this.forceSpacingCleanup;
    }
  }, {
    key: "getNormalizationProfile",
    value: function getNormalizationProfile() {
      return this.normalizationProfile;
    }
  }]);
}();

/***/ }),

/***/ "./src/logic/engine/CommaSuggestionEngine.js":
/*!***************************************************!*\
  !*** ./src/logic/engine/CommaSuggestionEngine.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CommaSuggestionEngine: function() { return /* binding */ CommaSuggestionEngine; }
/* harmony export */ });
/* harmony import */ var _Suggestion_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Suggestion.js */ "./src/logic/engine/Suggestion.js");
/* harmony import */ var _textUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./textUtils.js */ "./src/logic/engine/textUtils.js");
/* harmony import */ var _anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../anchoring/SyntheticAnchorProvider.js */ "./src/logic/anchoring/SyntheticAnchorProvider.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }



var MAX_PARAGRAPH_CHARS = 3000;
var PARAGRAPH_FIRST_MAX_CHARS = 1000;
var TRAILING_COMMA_REGEX = /[,\s]+$/;
var LOG_PREFIX = "[Vejice DEBUG DUMP]";
var DEBUG_DUMP_STORAGE_KEY = "vejice:debug:dumps";
var DEBUG_DUMP_LAST_STORAGE_KEY = "vejice:debug:lastDump";
if (typeof window !== "undefined") {
  if (!Array.isArray(window.__VEJICE_DEBUG_DUMPS__)) {
    window.__VEJICE_DEBUG_DUMPS__ = [];
  }
  if (!("__VEJICE_LAST_DEBUG_DUMP__" in window)) {
    window.__VEJICE_LAST_DEBUG_DUMP__ = null;
  }
  window.__VEJICE_DEBUG_DUMP_READY__ = true;
}
function isDeepDebugEnabled() {
  if (typeof window === "undefined") return false;
  var isTruthyFlag = function isTruthyFlag(value) {
    return value === true || value === 1 || value === "1" || value === "true";
  };
  if (isTruthyFlag(window.__VEJICE_DEBUG_DUMP__)) return true;
  if (isTruthyFlag(window.__VEJICE_DEBUG__)) return true;
  try {
    var storage = window.localStorage;
    if (storage) {
      var stored = storage.getItem("vejice:debug:dump");
      if (isTruthyFlag(stored)) return true;
    }
  } catch (_err) {
    // Ignore storage access failures.
  }
  return false;
}
function pushDeepDebugDump(payload) {
  if (!isDeepDebugEnabled() || typeof window === "undefined") return;
  var safePayload = _objectSpread({
    ts: Date.now()
  }, payload);
  window.__VEJICE_LAST_DEBUG_DUMP__ = safePayload;
  window.__VEJICE_DEBUG_DUMPS__ = window.__VEJICE_DEBUG_DUMPS__ || [];
  window.__VEJICE_DEBUG_DUMPS__.push(safePayload);
  if (window.__VEJICE_DEBUG_DUMPS__.length > 20) {
    window.__VEJICE_DEBUG_DUMPS__.shift();
  }
  try {
    console.log(LOG_PREFIX, safePayload);
  } catch (_err) {
    // Ignore logging failures in host environments that limit console payloads.
  }
  try {
    var storage = window.localStorage;
    if (!storage) return;
    storage.setItem(DEBUG_DUMP_LAST_STORAGE_KEY, JSON.stringify(safePayload));
    var existingRaw = storage.getItem(DEBUG_DUMP_STORAGE_KEY);
    var existing = existingRaw ? JSON.parse(existingRaw) : [];
    var list = Array.isArray(existing) ? existing : [];
    list.push(safePayload);
    while (list.length > 20) {
      list.shift();
    }
    storage.setItem(DEBUG_DUMP_STORAGE_KEY, JSON.stringify(list));
  } catch (_err2) {
    // Ignore storage failures in restricted runtimes.
  }
}
var CommaSuggestionEngine = /*#__PURE__*/function () {
  function CommaSuggestionEngine(_ref) {
    var anchorProvider = _ref.anchorProvider,
      apiClient = _ref.apiClient,
      _ref$notifiers = _ref.notifiers,
      notifiers = _ref$notifiers === void 0 ? {} : _ref$notifiers;
    _classCallCheck(this, CommaSuggestionEngine);
    this.anchorProvider = anchorProvider;
    this.apiClient = apiClient;
    this.lastDebugDump = null;
    this.debugDumps = [];
    this.notifiers = {
      onParagraphTooLong: notifiers.onParagraphTooLong || function () {},
      onSentenceTooLong: notifiers.onSentenceTooLong || function () {},
      onChunkApiFailure: notifiers.onChunkApiFailure || function () {},
      onChunkNonCommaChanges: notifiers.onChunkNonCommaChanges || function () {}
    };
  }
  return _createClass(CommaSuggestionEngine, [{
    key: "analyzeParagraph",
    value: function () {
      var _analyzeParagraph = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_ref2) {
        var paragraphIndex, originalText, normalizedOriginalText, paragraphDocOffset, _ref2$forceSentenceCh, forceSentenceChunks, paragraphText, forceSentenceByLength, useSentenceChunks, debugEnabled, debugDump, chunks, normalizedSource, processedMeta, chunkDetails, apiErrors, nonCommaChunkSkips, _iterator, _step, chunk, meta, detail, correctedChunk, _detail, _detail2, _detail3, _detail4, _detail5, baseForDiff, diffOps, hasDetailedChunk, canFallbackToSentences, _anchorsEntry, correctedParagraph, sourceTokens, targetTokens, anchorsEntry, suggestions, debugOpFlow, _i, _chunkDetails, _entry$metaRef, _entry$metaRef$remapp, entry, detailRef, ops, correctionTracking, correctionsPresent, fallbackOps, usingFallbackOnly, allOps, opFlow, _iterator2, _step2, op, offset, baseOp, adjustedOp, suggestion, _t, _t2, _t3, _t4, _t5;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              paragraphIndex = _ref2.paragraphIndex, originalText = _ref2.originalText, normalizedOriginalText = _ref2.normalizedOriginalText, paragraphDocOffset = _ref2.paragraphDocOffset, _ref2$forceSentenceCh = _ref2.forceSentenceChunks, forceSentenceChunks = _ref2$forceSentenceCh === void 0 ? false : _ref2$forceSentenceCh;
              paragraphText = typeof originalText === "string" ? originalText : "";
              forceSentenceByLength = paragraphText.length > PARAGRAPH_FIRST_MAX_CHARS;
              useSentenceChunks = forceSentenceChunks || forceSentenceByLength;
              debugEnabled = isDeepDebugEnabled();
              debugDump = debugEnabled ? {
                analysisMode: useSentenceChunks ? "sentence" : "paragraph",
                sentenceModeReason: forceSentenceChunks ? "forced" : forceSentenceByLength ? "paragraph-too-long" : "none",
                paragraphIndex: paragraphIndex,
                paragraphDocOffset: paragraphDocOffset,
                originalText: originalText,
                normalizedOriginalText: typeof normalizedOriginalText === "string" ? normalizedOriginalText : (0,_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.normalizeParagraphWhitespace)(originalText),
                chunks: [],
                final: {}
              } : null;
              chunks = splitParagraphIntoChunks(originalText, MAX_PARAGRAPH_CHARS, {
                preferWholeParagraph: !useSentenceChunks
              });
              if (chunks.length) {
                _context.n = 2;
                break;
              }
              _t = [];
              _context.n = 1;
              return this.anchorProvider.getAnchors({
                paragraphIndex: paragraphIndex,
                originalText: originalText,
                correctedText: originalText,
                sourceTokens: [],
                targetTokens: [],
                documentOffset: paragraphDocOffset
              });
            case 1:
              _t2 = _context.v;
              return _context.a(2, {
                suggestions: _t,
                apiErrors: 0,
                processedAny: false,
                anchorsEntry: _t2
              });
            case 2:
              normalizedSource = typeof normalizedOriginalText === "string" ? normalizedOriginalText : (0,_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.normalizeParagraphWhitespace)(originalText);
              chunks.forEach(function (chunk) {
                chunk.normalizedText = normalizedSource.slice(chunk.start, chunk.end);
              });
              processedMeta = [];
              chunkDetails = [];
              apiErrors = 0;
              nonCommaChunkSkips = 0;
              _iterator = _createForOfIteratorHelper(chunks);
              _context.p = 3;
              _iterator.s();
            case 4:
              if ((_step = _iterator.n()).done) {
                _context.n = 13;
                break;
              }
              chunk = _step.value;
              meta = {
                chunk: chunk,
                correctedText: chunk.normalizedText,
                detail: null,
                syntheticTokens: null
              };
              processedMeta.push(meta);
              if (!chunk.tooLong) {
                _context.n = 5;
                break;
              }
              this.notifiers.onSentenceTooLong(paragraphIndex, chunk.length);
              meta.syntheticTokens = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.tokenizeForAnchoring)(chunk.text, "p".concat(paragraphIndex, "_c").concat(chunk.index, "_syn_"));
              return _context.a(3, 12);
            case 5:
              detail = null;
              _context.p = 6;
              _context.n = 7;
              return this.apiClient.popraviPovedDetailed(chunk.normalizedText || chunk.text);
            case 7:
              detail = _context.v;
              _context.n = 9;
              break;
            case 8:
              _context.p = 8;
              _t3 = _context.v;
              apiErrors++;
              this.notifiers.onChunkApiFailure(paragraphIndex, chunk.index, _t3);
              meta.syntheticTokens = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.tokenizeForAnchoring)(chunk.text, "p".concat(paragraphIndex, "_c").concat(chunk.index, "_syn_"));
              return _context.a(3, 12);
            case 9:
              correctedChunk = detail.correctedText;
              if (debugEnabled && debugDump) {
                debugDump.chunks.push({
                  index: chunk.index,
                  start: chunk.start,
                  end: chunk.end,
                  normalizedInput: chunk.normalizedText || chunk.text,
                  correctedChunk: correctedChunk,
                  rawSourceText: (_detail = detail) === null || _detail === void 0 || (_detail = _detail.raw) === null || _detail === void 0 ? void 0 : _detail.source_text,
                  rawTargetText: (_detail2 = detail) === null || _detail2 === void 0 || (_detail2 = _detail2.raw) === null || _detail2 === void 0 ? void 0 : _detail2.target_text,
                  rawCorrections: (_detail3 = detail) === null || _detail3 === void 0 ? void 0 : _detail3.corrections,
                  rawSourceTokensCount: Array.isArray((_detail4 = detail) === null || _detail4 === void 0 ? void 0 : _detail4.sourceTokens) ? detail.sourceTokens.length : 0,
                  rawTargetTokensCount: Array.isArray((_detail5 = detail) === null || _detail5 === void 0 ? void 0 : _detail5.targetTokens) ? detail.targetTokens.length : 0
                });
              }
              if ((0,_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.onlyCommasChanged)(chunk.normalizedText || chunk.text, correctedChunk)) {
                _context.n = 10;
                break;
              }
              this.notifiers.onChunkNonCommaChanges(paragraphIndex, chunk.index, chunk.text, correctedChunk);
              nonCommaChunkSkips++;
              meta.syntheticTokens = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.tokenizeForAnchoring)(chunk.text, "p".concat(paragraphIndex, "_c").concat(chunk.index, "_syn_"));
              return _context.a(3, 12);
            case 10:
              meta.detail = detail;
              meta.correctedText = correctedChunk;
              baseForDiff = chunk.text || chunk.normalizedText || ""; // Always compute comma-only diff ops. Correction metadata can be incomplete
              // or carry positions that become inconsistent after chunk-level transforms.
              diffOps = collapseDuplicateDiffOps(filterCommaOps(baseForDiff, correctedChunk, diffCommasOnly(baseForDiff, correctedChunk)));
              if (!(!meta.detail && !diffOps.length)) {
                _context.n = 11;
                break;
              }
              return _context.a(3, 12);
            case 11:
              chunkDetails.push({
                chunk: chunk,
                metaRef: meta,
                baseForDiff: baseForDiff,
                correctedChunk: correctedChunk,
                diffOps: diffOps
              });
            case 12:
              _context.n = 4;
              break;
            case 13:
              _context.n = 15;
              break;
            case 14:
              _context.p = 14;
              _t4 = _context.v;
              _iterator.e(_t4);
            case 15:
              _context.p = 15;
              _iterator.f();
              return _context.f(15);
            case 16:
              hasDetailedChunk = processedMeta.some(function (meta) {
                return meta.detail;
              });
              canFallbackToSentences = !forceSentenceChunks && chunks.length === 1;
              if (!(!hasDetailedChunk && canFallbackToSentences && (apiErrors > 0 || nonCommaChunkSkips > 0))) {
                _context.n = 17;
                break;
              }
              return _context.a(2, this.analyzeParagraph({
                paragraphIndex: paragraphIndex,
                originalText: originalText,
                normalizedOriginalText: normalizedOriginalText,
                paragraphDocOffset: paragraphDocOffset,
                forceSentenceChunks: true
              }));
            case 17:
              if (hasDetailedChunk) {
                _context.n = 19;
                break;
              }
              _context.n = 18;
              return this.anchorProvider.getAnchors({
                paragraphIndex: paragraphIndex,
                originalText: originalText,
                correctedText: originalText,
                sourceTokens: [],
                targetTokens: [],
                documentOffset: paragraphDocOffset
              });
            case 18:
              _anchorsEntry = _context.v;
              return _context.a(2, {
                suggestions: [],
                apiErrors: apiErrors,
                processedAny: false,
                anchorsEntry: _anchorsEntry
              });
            case 19:
              correctedParagraph = processedMeta.map(function (meta) {
                var _meta$chunk$trailing;
                return meta.correctedText + ((_meta$chunk$trailing = meta.chunk.trailing) !== null && _meta$chunk$trailing !== void 0 ? _meta$chunk$trailing : "");
              }).join("");
              sourceTokens = [];
              targetTokens = [];
              processedMeta.forEach(function (meta) {
                var basePrefix = "p".concat(paragraphIndex, "_c").concat(meta.chunk.index, "_");
                if (meta.detail) {
                  var _rekeyTokensWithMap = rekeyTokensWithMap(meta.detail.sourceTokens, "".concat(basePrefix, "s")),
                    rekeyedSource = _rekeyTokensWithMap.tokens,
                    sourceMap = _rekeyTokensWithMap.map;
                  sourceTokens.push.apply(sourceTokens, _toConsumableArray(rekeyedSource));
                  var _rekeyTokensWithMap2 = rekeyTokensWithMap(meta.detail.targetTokens, "".concat(basePrefix, "t")),
                    rekeyedTarget = _rekeyTokensWithMap2.tokens;
                  targetTokens.push.apply(targetTokens, _toConsumableArray(rekeyedTarget));
                  meta.remappedCorrections = remapCorrections(meta.detail.corrections, sourceMap);
                } else if (meta.syntheticTokens && meta.syntheticTokens.length) {
                  var rekeyed = rekeyTokens(meta.syntheticTokens, "".concat(basePrefix, "syn_"));
                  sourceTokens.push.apply(sourceTokens, _toConsumableArray(rekeyed));
                  targetTokens.push.apply(targetTokens, _toConsumableArray(rekeyed));
                }
              });
              _context.n = 20;
              return this.anchorProvider.getAnchors({
                paragraphIndex: paragraphIndex,
                originalText: originalText,
                correctedText: correctedParagraph,
                sourceTokens: sourceTokens,
                targetTokens: targetTokens,
                documentOffset: paragraphDocOffset
              });
            case 20:
              anchorsEntry = _context.v;
              suggestions = [];
              debugOpFlow = debugEnabled ? [] : null;
              _i = 0, _chunkDetails = chunkDetails;
            case 21:
              if (!(_i < _chunkDetails.length)) {
                _context.n = 33;
                break;
              }
              entry = _chunkDetails[_i];
              detailRef = (_entry$metaRef = entry.metaRef) !== null && _entry$metaRef !== void 0 && _entry$metaRef.detail ? _objectSpread(_objectSpread({}, entry.metaRef.detail), {}, {
                corrections: (_entry$metaRef$remapp = entry.metaRef.remappedCorrections) !== null && _entry$metaRef$remapp !== void 0 ? _entry$metaRef$remapp : entry.metaRef.detail.corrections
              }) : null;
              ops = [];
              correctionTracking = detailRef !== null && detailRef !== void 0 && detailRef.corrections ? createCorrectionTracking() : null;
              correctionsPresent = correctionsHaveEntries(detailRef === null || detailRef === void 0 ? void 0 : detailRef.corrections);
              if (correctionsPresent) {
                ops = collectCommaOpsFromCorrections(detailRef, anchorsEntry, paragraphIndex, correctionTracking);
              }
              fallbackOps = entry.diffOps || [];
              if (fallbackOps.length) {
                if (!correctionsPresent || ops.length) {
                  fallbackOps = filterDiffOpsAgainstCorrections(fallbackOps, correctionTracking);
                }
                if (!correctionsPresent && detailRef && !ops.length) {
                  ops = fallbackOps.map(function (op) {
                    return _objectSpread(_objectSpread({}, op), {}, {
                      fromCorrections: true,
                      viaDiffFallback: true
                    });
                  });
                  fallbackOps = [];
                } else if (correctionsPresent) {
                  fallbackOps = fallbackOps.map(function (op) {
                    return _objectSpread(_objectSpread({}, op), {}, {
                      fromCorrections: true,
                      viaDiffFallback: true
                    });
                  });
                }
              }
              usingFallbackOnly = !ops.length;
              allOps = mergePreferredCommaOps(ops, fallbackOps);
              if (allOps.length) {
                _context.n = 22;
                break;
              }
              return _context.a(3, 32);
            case 22:
              opFlow = debugEnabled ? {
                chunkIndex: entry.chunk.index,
                fromCorrections: ops.map(function (op) {
                  return _objectSpread({}, op);
                }),
                fallbackOps: fallbackOps.map(function (op) {
                  return _objectSpread({}, op);
                }),
                usingFallbackOnly: usingFallbackOnly,
                keptOps: [],
                droppedOps: []
              } : null;
              _iterator2 = _createForOfIteratorHelper(allOps);
              _context.p = 23;
              _iterator2.s();
            case 24:
              if ((_step2 = _iterator2.n()).done) {
                _context.n = 28;
                break;
              }
              op = _step2.value;
              offset = entry.chunk.start;
              baseOp = op;
              adjustedOp = _objectSpread(_objectSpread({}, baseOp), {}, {
                pos: baseOp.pos + offset,
                originalPos: (typeof baseOp.originalPos === "number" ? baseOp.originalPos : baseOp.pos) + offset,
                correctedPos: (typeof baseOp.correctedPos === "number" ? baseOp.correctedPos : baseOp.pos) + offset
              });
              if (isOpConsistentWithTexts(adjustedOp, originalText, correctedParagraph)) {
                _context.n = 25;
                break;
              }
              if (opFlow) opFlow.droppedOps.push({
                reason: "inconsistent_with_texts",
                op: adjustedOp
              });
              return _context.a(3, 27);
            case 25:
              if (!shouldSuppressDueToRepeatedToken(anchorsEntry, adjustedOp)) {
                _context.n = 26;
                break;
              }
              if (opFlow) opFlow.droppedOps.push({
                reason: "repeated_token_suppression",
                op: adjustedOp
              });
              return _context.a(3, 27);
            case 26:
              suggestion = buildSuggestionFromOp({
                op: adjustedOp,
                paragraphIndex: paragraphIndex,
                anchorsEntry: anchorsEntry,
                originalText: originalText,
                correctedParagraph: correctedParagraph
              });
              if (suggestion) {
                suggestions.push(suggestion);
                if (opFlow) opFlow.keptOps.push({
                  op: adjustedOp,
                  suggestionId: suggestion.id
                });
              }
            case 27:
              _context.n = 24;
              break;
            case 28:
              _context.n = 30;
              break;
            case 29:
              _context.p = 29;
              _t5 = _context.v;
              _iterator2.e(_t5);
            case 30:
              _context.p = 30;
              _iterator2.f();
              return _context.f(30);
            case 31:
              if (opFlow && debugOpFlow) {
                debugOpFlow.push(opFlow);
              }
            case 32:
              _i++;
              _context.n = 21;
              break;
            case 33:
              if (debugEnabled && debugDump) {
                debugDump.final = {
                  correctedParagraph: correctedParagraph,
                  suggestionsCount: suggestions.length,
                  suggestions: suggestions.map(function (s) {
                    var _s$meta, _s$meta2, _s$meta3, _s$meta4, _s$meta5;
                    return {
                      id: s.id,
                      kind: s.kind,
                      paragraphIndex: s.paragraphIndex,
                      charHint: s.charHint,
                      op: s === null || s === void 0 || (_s$meta = s.meta) === null || _s$meta === void 0 ? void 0 : _s$meta.op,
                      sourceTokenBefore: s === null || s === void 0 || (_s$meta2 = s.meta) === null || _s$meta2 === void 0 || (_s$meta2 = _s$meta2.anchor) === null || _s$meta2 === void 0 || (_s$meta2 = _s$meta2.sourceTokenBefore) === null || _s$meta2 === void 0 ? void 0 : _s$meta2.tokenText,
                      sourceTokenAfter: s === null || s === void 0 || (_s$meta3 = s.meta) === null || _s$meta3 === void 0 || (_s$meta3 = _s$meta3.anchor) === null || _s$meta3 === void 0 || (_s$meta3 = _s$meta3.sourceTokenAfter) === null || _s$meta3 === void 0 ? void 0 : _s$meta3.tokenText,
                      targetTokenBefore: s === null || s === void 0 || (_s$meta4 = s.meta) === null || _s$meta4 === void 0 || (_s$meta4 = _s$meta4.anchor) === null || _s$meta4 === void 0 || (_s$meta4 = _s$meta4.targetTokenBefore) === null || _s$meta4 === void 0 ? void 0 : _s$meta4.tokenText,
                      targetTokenAfter: s === null || s === void 0 || (_s$meta5 = s.meta) === null || _s$meta5 === void 0 || (_s$meta5 = _s$meta5.anchor) === null || _s$meta5 === void 0 || (_s$meta5 = _s$meta5.targetTokenAfter) === null || _s$meta5 === void 0 ? void 0 : _s$meta5.tokenText
                    };
                  }),
                  opFlow: debugOpFlow || []
                };
                this.lastDebugDump = debugDump;
                this.debugDumps.push(debugDump);
                if (this.debugDumps.length > 20) {
                  this.debugDumps.shift();
                }
                pushDeepDebugDump(debugDump);
              }
              if (!(!suggestions.length && canFallbackToSentences && nonCommaChunkSkips > 0)) {
                _context.n = 34;
                break;
              }
              return _context.a(2, this.analyzeParagraph({
                paragraphIndex: paragraphIndex,
                originalText: originalText,
                normalizedOriginalText: normalizedOriginalText,
                paragraphDocOffset: paragraphDocOffset,
                forceSentenceChunks: true
              }));
            case 34:
              return _context.a(2, {
                suggestions: suggestions,
                apiErrors: apiErrors,
                processedAny: Boolean(suggestions.length),
                anchorsEntry: anchorsEntry,
                correctedParagraph: correctedParagraph
              });
          }
        }, _callee, this, [[23, 29, 30, 31], [6, 8], [3, 14, 15, 16]]);
      }));
      function analyzeParagraph(_x) {
        return _analyzeParagraph.apply(this, arguments);
      }
      return analyzeParagraph;
    }()
  }]);
}();
function buildSuggestionFromOp(_ref3) {
  var _op$originalPos2, _op$correctedPos;
  var op = _ref3.op,
    paragraphIndex = _ref3.paragraphIndex,
    anchorsEntry = _ref3.anchorsEntry,
    originalText = _ref3.originalText,
    correctedText = _ref3.correctedText;
  if (!op) return null;
  if (op.kind === "delete") {
    var _op$originalPos;
    var _metadata = buildDeleteSuggestionMetadata(anchorsEntry, (_op$originalPos = op.originalPos) !== null && _op$originalPos !== void 0 ? _op$originalPos : op.pos);
    if (!_metadata) return null;
    return (0,_Suggestion_js__WEBPACK_IMPORTED_MODULE_0__.createSuggestion)({
      id: "delete-".concat(paragraphIndex, "-").concat(op.pos),
      paragraphIndex: paragraphIndex,
      kind: "delete",
      charHint: {
        start: _metadata.charStart,
        end: _metadata.charEnd,
        documentStart: _metadata.documentCharStart,
        documentEnd: _metadata.documentCharEnd
      },
      tokenHint: buildTokenHint(_metadata),
      snippets: buildSnippetsFromMetadata(_metadata, originalText, correctedText),
      meta: {
        op: op,
        highlightText: _metadata.highlightText,
        anchor: _metadata,
        originalText: originalText,
        correctedText: correctedText
      }
    });
  }
  var metadata = buildInsertSuggestionMetadata(anchorsEntry, {
    originalCharIndex: (_op$originalPos2 = op.originalPos) !== null && _op$originalPos2 !== void 0 ? _op$originalPos2 : op.pos,
    targetCharIndex: (_op$correctedPos = op.correctedPos) !== null && _op$correctedPos !== void 0 ? _op$correctedPos : op.pos
  });
  if (!metadata) return null;
  return (0,_Suggestion_js__WEBPACK_IMPORTED_MODULE_0__.createSuggestion)({
    id: "insert-".concat(paragraphIndex, "-").concat(op.pos),
    paragraphIndex: paragraphIndex,
    kind: "insert",
    charHint: {
      start: metadata.targetCharStart,
      end: metadata.targetCharEnd,
      documentStart: metadata.targetDocumentCharStart,
      documentEnd: metadata.targetDocumentCharEnd
    },
    tokenHint: buildTokenHint(metadata),
    snippets: buildSnippetsFromMetadata(metadata, originalText, correctedText),
    meta: {
      op: op,
      highlightText: metadata.highlightText,
      anchor: metadata,
      originalText: originalText,
      correctedText: correctedText
    }
  });
}
function buildSnippetsFromMetadata(metadata, originalText, correctedText) {
  var snippets = {};
  if (metadata.highlightText) {
    snippets.focusWord = metadata.highlightText;
  }
  if (originalText) {
    snippets.leftSnippet = originalText.slice(Math.max(0, metadata.charStart - 24), metadata.charStart).trim();
    snippets.rightSnippet = originalText.slice(metadata.charEnd, metadata.charEnd + 24).trim();
  } else if (correctedText) {
    var _ref4, _metadata$targetCharS, _ref5, _metadata$targetCharE;
    var start = (_ref4 = (_metadata$targetCharS = metadata.targetCharStart) !== null && _metadata$targetCharS !== void 0 ? _metadata$targetCharS : metadata.charStart) !== null && _ref4 !== void 0 ? _ref4 : 0;
    var end = (_ref5 = (_metadata$targetCharE = metadata.targetCharEnd) !== null && _metadata$targetCharE !== void 0 ? _metadata$targetCharE : metadata.charEnd) !== null && _ref5 !== void 0 ? _ref5 : start;
    snippets.leftSnippet = correctedText.slice(Math.max(0, start - 24), start).trim();
    snippets.rightSnippet = correctedText.slice(end, end + 24).trim();
  }
  return snippets;
}
function buildTokenHint(meta) {
  var _meta$sourceTokenBefo, _meta$targetTokenBefo, _meta$sourceTokenAfte, _meta$targetTokenAfte, _meta$sourceTokenAt, _meta$targetTokenAt;
  if (!meta) return null;
  return {
    leftToken: ((_meta$sourceTokenBefo = meta.sourceTokenBefore) === null || _meta$sourceTokenBefo === void 0 ? void 0 : _meta$sourceTokenBefo.tokenText) || ((_meta$targetTokenBefo = meta.targetTokenBefore) === null || _meta$targetTokenBefo === void 0 ? void 0 : _meta$targetTokenBefo.tokenText) || null,
    rightToken: ((_meta$sourceTokenAfte = meta.sourceTokenAfter) === null || _meta$sourceTokenAfte === void 0 ? void 0 : _meta$sourceTokenAfte.tokenText) || ((_meta$targetTokenAfte = meta.targetTokenAfter) === null || _meta$targetTokenAfte === void 0 ? void 0 : _meta$targetTokenAfte.tokenText) || null,
    tokenId: ((_meta$sourceTokenAt = meta.sourceTokenAt) === null || _meta$sourceTokenAt === void 0 ? void 0 : _meta$sourceTokenAt.tokenId) || ((_meta$targetTokenAt = meta.targetTokenAt) === null || _meta$targetTokenAt === void 0 ? void 0 : _meta$targetTokenAt.tokenId) || null
  };
}
function splitParagraphIntoChunks() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var maxLen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MAX_PARAGRAPH_CHARS;
  var _ref6 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
    _ref6$preferWholePara = _ref6.preferWholeParagraph,
    preferWholeParagraph = _ref6$preferWholePara === void 0 ? true : _ref6$preferWholePara;
  var safeText = typeof text === "string" ? text : "";
  if (!safeText) return [];
  // For normal-sized paragraphs, keep full context in a single API call.
  // This avoids sentence splitter artifacts around abbreviations like "K. M.".
  if (preferWholeParagraph && safeText.length <= maxLen) {
    return [{
      index: 0,
      start: 0,
      end: safeText.length,
      length: safeText.length,
      text: safeText,
      trailing: "",
      tooLong: false
    }];
  }
  var placeholder = "\uE000";
  var protectedText = safeText;
  var sentences = [];
  var start = 0;
  var pushSentence = function pushSentence(contentEnd) {
    var gapEnd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : contentEnd;
    if (typeof contentEnd !== "number" || contentEnd <= start) {
      var _ref7;
      start = Math.max(start, (_ref7 = gapEnd !== null && gapEnd !== void 0 ? gapEnd : contentEnd) !== null && _ref7 !== void 0 ? _ref7 : start);
      return;
    }
    sentences.push({
      start: start,
      end: contentEnd,
      gapEnd: gapEnd !== null && gapEnd !== void 0 ? gapEnd : contentEnd
    });
    start = gapEnd !== null && gapEnd !== void 0 ? gapEnd : contentEnd;
  };
  for (var i = 0; i < protectedText.length; i++) {
    var ch = protectedText[i];
    if (ch === "\n") {
      pushSentence(i + 1, i + 1);
      continue;
    }
    if (/[.!?]/.test(ch)) {
      var contentEnd = i + 1;
      while (contentEnd < protectedText.length && /[\])"'»”’]+/.test(protectedText[contentEnd])) {
        contentEnd++;
      }
      var gapEnd = contentEnd;
      while (gapEnd < protectedText.length && /\s/.test(protectedText[gapEnd])) {
        gapEnd++;
      }
      pushSentence(contentEnd, gapEnd);
      i = gapEnd - 1;
    }
  }
  if (start < protectedText.length) {
    sentences.push({
      start: start,
      end: protectedText.length,
      gapEnd: protectedText.length
    });
  }
  return sentences.map(function (sentence, index) {
    var _sentence$gapEnd;
    var gapEnd = (_sentence$gapEnd = sentence.gapEnd) !== null && _sentence$gapEnd !== void 0 ? _sentence$gapEnd : sentence.end;
    var length = sentence.end - sentence.start;
    return {
      index: index,
      start: sentence.start,
      end: sentence.end,
      length: length,
      text: safeText.slice(sentence.start, sentence.end).replace(new RegExp(placeholder, "g"), "."),
      trailing: safeText.slice(sentence.end, gapEnd),
      tooLong: length > maxLen
    };
  });
}
function rekeyTokensInternal(tokens, prefix) {
  if (!Array.isArray(tokens)) {
    return {
      tokens: [],
      map: new Map()
    };
  }
  var idMap = new Map();
  var rekeyed = tokens.map(function (token, idx) {
    if (token && _typeof(token) === "object") {
      var newToken = _objectSpread(_objectSpread({}, token), {}, {
        token_id: "".concat(prefix).concat(idx + 1)
      });
      if (typeof token.token_id === "string") {
        idMap.set(token.token_id, newToken.token_id);
      }
      return newToken;
    }
    return {
      token_id: "".concat(prefix).concat(idx + 1),
      token: typeof token === "string" ? token : ""
    };
  });
  return {
    tokens: rekeyed,
    map: idMap
  };
}
function rekeyTokens(tokens, prefix) {
  return rekeyTokensInternal(tokens, prefix).tokens;
}
function rekeyTokensWithMap(tokens, prefix) {
  return rekeyTokensInternal(tokens, prefix);
}
function remapCorrections(corrections, idMap) {
  if (!corrections || !(idMap !== null && idMap !== void 0 && idMap.size)) return corrections;
  var remapGroup = function remapGroup(group) {
    var _idMap$get;
    if (!group) return group;
    var remapped = _objectSpread({}, group);
    var mappedStart = (_idMap$get = idMap.get(group.source_start)) !== null && _idMap$get !== void 0 ? _idMap$get : group.source_start;
    remapped.source_start = mappedStart;
    if (Array.isArray(group.corrections)) {
      remapped.corrections = group.corrections.map(function (corr) {
        var _idMap$get2;
        if (!corr) return corr;
        var mappedId = (_idMap$get2 = idMap.get(corr.source_id)) !== null && _idMap$get2 !== void 0 ? _idMap$get2 : corr.source_id;
        return _objectSpread(_objectSpread({}, corr), {}, {
          source_id: mappedId
        });
      });
    }
    return remapped;
  };
  if (Array.isArray(corrections)) {
    return corrections.map(remapGroup);
  }
  if (_typeof(corrections) === "object") {
    var remapped = {};
    for (var _i2 = 0, _Object$entries = Object.entries(corrections); _i2 < _Object$entries.length; _i2++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
        key = _Object$entries$_i[0],
        group = _Object$entries$_i[1];
      remapped[key] = remapGroup(group);
    }
    return remapped;
  }
  return corrections;
}
function correctionsHaveEntries(corrections) {
  if (!corrections) return false;
  if (Array.isArray(corrections)) {
    return corrections.some(function (group) {
      return Array.isArray(group === null || group === void 0 ? void 0 : group.corrections) && group.corrections.length;
    });
  }
  if (_typeof(corrections) === "object") {
    return Object.values(corrections).some(function (group) {
      return Array.isArray(group === null || group === void 0 ? void 0 : group.corrections) && group.corrections.length;
    });
  }
  return false;
}
function collapseDuplicateDiffOps(ops) {
  if (!Array.isArray(ops) || ops.length < 2) return ops;
  var deletePositions = ops.filter(function (op) {
    return (op === null || op === void 0 ? void 0 : op.kind) === "delete";
  }).map(function (op) {
    return typeof op.originalPos === "number" ? op.originalPos : op.pos;
  }).filter(function (pos) {
    return typeof pos === "number";
  });
  if (!deletePositions.length) return ops;
  var shouldDropInsert = function shouldDropInsert(pos) {
    return deletePositions.some(function (delPos) {
      return typeof delPos === "number" && Math.abs(delPos - pos) <= 0;
    });
  };
  return ops.filter(function (op) {
    if ((op === null || op === void 0 ? void 0 : op.kind) !== "insert") return true;
    var pos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    if (typeof pos !== "number") return true;
    return !shouldDropInsert(pos);
  });
}
function isOpConsistentWithTexts(op, originalText, correctedText) {
  if (!op || _typeof(op) !== "object") return false;
  var boundaryTolerance = op !== null && op !== void 0 && op.fromCorrections ? 3 : 0;
  if (op.kind === "delete") {
    var originalPos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    var correctedPos = typeof op.correctedPos === "number" ? op.correctedPos : op.pos;
    // Valid delete must have comma in original and no comma in corrected at this boundary.
    return hasCommaAtOrNearBoundary(originalText, originalPos, boundaryTolerance) && !hasCommaAtOrNearBoundary(correctedText, correctedPos, boundaryTolerance);
  }
  if (op.kind === "insert") {
    var _originalPos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    var _correctedPos = typeof op.correctedPos === "number" ? op.correctedPos : op.pos;
    // Valid insert must have comma in corrected and no comma in original at this boundary.
    return !hasCommaAtOrNearBoundary(originalText, _originalPos, boundaryTolerance) && hasCommaAtOrNearBoundary(correctedText, _correctedPos, boundaryTolerance);
  }
  return true;
}
function hasCommaAtOrNearBoundary(text, pos) {
  var tolerance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var safeTolerance = Math.max(0, Number.isFinite(tolerance) ? Math.floor(tolerance) : 0);
  for (var delta = -safeTolerance; delta <= safeTolerance; delta++) {
    if (hasCommaAtBoundary(text, pos + delta)) {
      return true;
    }
  }
  return false;
}
function hasCommaAtBoundary(text, pos) {
  if (typeof text !== "string" || !text.length) return false;
  var safePos = Number.isFinite(pos) ? Math.max(0, Math.min(Math.floor(pos), text.length)) : 0;
  var direct = [safePos - 1, safePos, safePos + 1];
  for (var _i3 = 0, _direct = direct; _i3 < _direct.length; _i3++) {
    var idx = _direct[_i3];
    if (idx >= 0 && idx < text.length && text[idx] === ",") {
      return true;
    }
  }
  var left = safePos - 1;
  while (left >= 0 && /\s/.test(text[left])) left--;
  if (left >= 0 && text[left] === ",") return true;
  var right = safePos;
  while (right < text.length && /\s/.test(text[right])) right++;
  if (right < text.length && text[right] === ",") return true;
  return false;
}
function filterCommaOps(original, corrected, ops) {
  return ops.filter(function (op) {
    if ((0,_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNumericComma)(original, corrected, op.kind, op.pos)) return false;
    if (op.kind === "insert") {
      var next = (0,_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.charAtSafe)(corrected, op.pos + 1);
      var noSpaceAfter = next && !/\s/.test(next);
      if (noSpaceAfter && !_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.QUOTES.has(next)) {
        return true;
      }
    }
    return true;
  });
}
function diffCommasOnly(original, corrected) {
  var ops = [];
  var i = 0;
  var j = 0;
  while (i < original.length || j < corrected.length) {
    var _original$i, _corrected$j;
    var o = (_original$i = original[i]) !== null && _original$i !== void 0 ? _original$i : "";
    var c = (_corrected$j = corrected[j]) !== null && _corrected$j !== void 0 ? _corrected$j : "";
    if (o === c) {
      i++;
      j++;
      continue;
    }
    if (c === "," && o !== ",") {
      if (/\s/.test(o)) {
        var relocateIdx = findCommaAfterWhitespace(original, i);
        if (relocateIdx >= 0) {
          i = relocateIdx;
          continue;
        }
      }
      ops.push({
        kind: "insert",
        pos: j,
        originalPos: i,
        correctedPos: j
      });
      j++;
      continue;
    }
    if (o === "," && c !== ",") {
      if (/\s/.test(c)) {
        var _relocateIdx = findCommaAfterWhitespace(corrected, j);
        if (_relocateIdx >= 0) {
          j = _relocateIdx;
          continue;
        }
      }
      ops.push({
        kind: "delete",
        pos: i,
        originalPos: i,
        correctedPos: j
      });
      i++;
      continue;
    }
    if (o) i++;
    if (c) j++;
  }
  return ops;
}
function findCommaAfterWhitespace(text, startIndex) {
  if (typeof text !== "string" || startIndex < 0 || startIndex >= text.length) {
    return -1;
  }
  var idx = startIndex;
  var sawWhitespace = false;
  while (idx < text.length && /\s/.test(text[idx])) {
    sawWhitespace = true;
    idx++;
  }
  if (!sawWhitespace || idx >= text.length) {
    return -1;
  }
  return text[idx] === "," ? idx : -1;
}
function createCorrectionTracking() {
  return {
    tokenIds: new Set(),
    unmatchedTokenIds: new Set(),
    intents: []
  };
}
function stripTrailingCommaAndSpace(text) {
  var safe = typeof text === "string" ? text : "";
  var match = safe.match(TRAILING_COMMA_REGEX);
  var trailing = match ? match[0] : "";
  var base = trailing ? safe.slice(0, -trailing.length) : safe;
  return {
    base: base,
    trailing: trailing,
    hasComma: trailing.includes(",")
  };
}
function analyzeCommaChangeFromCorrections() {
  var originalSegment = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var correctedSegment = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var orig = stripTrailingCommaAndSpace(originalSegment);
  var corr = stripTrailingCommaAndSpace(correctedSegment);
  if (orig.hasComma === corr.hasComma) return null;
  return {
    removeComma: orig.hasComma && !corr.hasComma,
    addComma: !orig.hasComma && corr.hasComma,
    originalSegment: originalSegment,
    correctedSegment: correctedSegment,
    baseText: orig.base || corr.base
  };
}
function normalizeTokenForComparison(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[.,!?;:“”„'"«»]/g, "").replace(/\s+/g, " ").trim();
}
function collectCommaOpsFromCorrections(detail, anchorsEntry, paragraphIndex, tracking) {
  var _tracking$intents;
  if (!(detail !== null && detail !== void 0 && detail.corrections) || !anchorsEntry) return [];
  var groups = Array.isArray(detail.corrections) ? detail.corrections : _typeof(detail.corrections) === "object" ? Object.values(detail.corrections) : [];
  if (!groups.length) return [];
  var ops = [];
  var seen = new Set();
  var _iterator3 = _createForOfIteratorHelper(groups),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var group = _step3.value;
      var entries = Array.isArray(group === null || group === void 0 ? void 0 : group.corrections) ? group.corrections : [];
      var _iterator5 = _createForOfIteratorHelper(entries),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _entry$source_id, _anchorsEntry$sourceA, _anchor$tokenText, _anchorsEntry$sourceA3;
          var entry = _step5.value;
          var analysis = analyzeCommaChangeFromCorrections(entry === null || entry === void 0 ? void 0 : entry.source_text, entry === null || entry === void 0 ? void 0 : entry.text);
          if (!analysis) continue;
          var tokenId = (_entry$source_id = entry === null || entry === void 0 ? void 0 : entry.source_id) !== null && _entry$source_id !== void 0 ? _entry$source_id : group === null || group === void 0 ? void 0 : group.source_start;
          if (!tokenId) continue;
          if (tracking !== null && tracking !== void 0 && tracking.tokenIds) {
            tracking.tokenIds.add(tokenId);
          }
          var _anchor = anchorsEntry === null || anchorsEntry === void 0 || (_anchorsEntry$sourceA = anchorsEntry.sourceAnchors) === null || _anchorsEntry$sourceA === void 0 || (_anchorsEntry$sourceA = _anchorsEntry$sourceA.byId) === null || _anchorsEntry$sourceA === void 0 ? void 0 : _anchorsEntry$sourceA[tokenId];
          if (!_anchor || !_anchor.matched || _anchor.charStart < 0) {
            if (tracking !== null && tracking !== void 0 && tracking.unmatchedTokenIds) {
              tracking.unmatchedTokenIds.add(tokenId);
            }
            continue;
          }
          var tokenText = (_anchor$tokenText = _anchor.tokenText) !== null && _anchor$tokenText !== void 0 ? _anchor$tokenText : "";
          var entrySource = typeof (entry === null || entry === void 0 ? void 0 : entry.source_text) === "string" ? entry.source_text : "";
          var placementAnchor = _anchor;
          if (entrySource && tokenText) {
            var normEntry = normalizeTokenForComparison(entrySource);
            var normToken = normalizeTokenForComparison(tokenText);
            if (normEntry !== normToken) {
              var _anchorsEntry$sourceA2;
              var merged = mergeAnchorsToMatchSourceText(entrySource, _anchor, anchorsEntry === null || anchorsEntry === void 0 || (_anchorsEntry$sourceA2 = anchorsEntry.sourceAnchors) === null || _anchorsEntry$sourceA2 === void 0 ? void 0 : _anchorsEntry$sourceA2.ordered);
              if (merged) {
                placementAnchor = merged;
              } else {
                continue;
              }
            }
          }
          var _baseText = (entrySource && entrySource.length ? entrySource : tokenText) || "";
          if (analysis.addComma && (!_baseText || !_baseText.trim()) && anchorsEntry !== null && anchorsEntry !== void 0 && (_anchorsEntry$sourceA3 = anchorsEntry.sourceAnchors) !== null && _anchorsEntry$sourceA3 !== void 0 && (_anchorsEntry$sourceA3 = _anchorsEntry$sourceA3.ordered) !== null && _anchorsEntry$sourceA3 !== void 0 && _anchorsEntry$sourceA3.length) {
            var coerced = findPreviousNonWhitespaceAnchor(anchorsEntry.sourceAnchors.ordered, _anchor.tokenId);
            if (coerced) {
              var _coerced$tokenText;
              placementAnchor = coerced;
              _baseText = (_coerced$tokenText = coerced.tokenText) !== null && _coerced$tokenText !== void 0 ? _coerced$tokenText : _baseText;
            }
          }
          if (!_baseText) {
            if (tracking !== null && tracking !== void 0 && tracking.unmatchedTokenIds) {
              tracking.unmatchedTokenIds.add(tokenId);
            }
            continue;
          }
          if (tracking !== null && tracking !== void 0 && tracking.intents) {
            tracking.intents.push({
              tokenId: tokenId,
              anchor: placementAnchor,
              analysis: analysis,
              baseText: _baseText
            });
          }
          if (analysis.removeComma) {
            var localIndex = _baseText.lastIndexOf(",");
            if (localIndex < 0) {
              if (tracking !== null && tracking !== void 0 && tracking.unmatchedTokenIds) {
                tracking.unmatchedTokenIds.add(tokenId);
              }
              continue;
            }
            var absolutePos = placementAnchor.charStart + localIndex;
            var key = "del-".concat(absolutePos);
            if (seen.has(key)) continue;
            seen.add(key);
            ops.push({
              kind: "delete",
              pos: absolutePos,
              originalPos: absolutePos,
              correctedPos: absolutePos,
              paragraphIndex: paragraphIndex,
              fromCorrections: true
            });
          } else if (analysis.addComma) {
            var analysisBase = typeof analysis.baseText === "string" && normalizeTokenForComparison(analysis.baseText) ? analysis.baseText : null;
            var effectiveBase = analysisBase !== null && analysisBase !== void 0 ? analysisBase : _baseText;
            var insertBase = effectiveBase.replace(TRAILING_COMMA_REGEX, "");
            var relative = insertBase.length;
            var _absolutePos = placementAnchor.charStart + relative;
            var _key = "ins-".concat(_absolutePos);
            if (seen.has(_key)) continue;
            seen.add(_key);
            ops.push({
              kind: "insert",
              pos: _absolutePos,
              originalPos: _absolutePos,
              correctedPos: _absolutePos,
              paragraphIndex: paragraphIndex,
              fromCorrections: true
            });
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  if (tracking && (_tracking$intents = tracking.intents) !== null && _tracking$intents !== void 0 && _tracking$intents.length) {
    tracking.blockedOriginalPositions = new Set(tracking.blockedOriginalPositions || []);
    tracking.blockedCorrectedPositions = new Set(tracking.blockedCorrectedPositions || []);
    var _iterator4 = _createForOfIteratorHelper(tracking.intents),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var _ref8, _ref9, _intent$baseText, _intent$analysis, _intent$analysis2, _intent$analysis3;
        var intent = _step4.value;
        var anchor = intent === null || intent === void 0 ? void 0 : intent.anchor;
        if (!anchor) continue;
        var baseText = (_ref8 = (_ref9 = (_intent$baseText = intent.baseText) !== null && _intent$baseText !== void 0 ? _intent$baseText : (_intent$analysis = intent.analysis) === null || _intent$analysis === void 0 ? void 0 : _intent$analysis.baseText) !== null && _ref9 !== void 0 ? _ref9 : anchor.tokenText) !== null && _ref8 !== void 0 ? _ref8 : "";
        var charStart = anchor.charStart;
        if (typeof charStart !== "number" || charStart < 0 || !baseText) continue;
        if ((_intent$analysis2 = intent.analysis) !== null && _intent$analysis2 !== void 0 && _intent$analysis2.removeComma) {
          var deleteIndex = baseText.lastIndexOf(",");
          if (deleteIndex >= 0) {
            tracking.blockedOriginalPositions.add(charStart + deleteIndex);
          }
        }
        if ((_intent$analysis3 = intent.analysis) !== null && _intent$analysis3 !== void 0 && _intent$analysis3.addComma) {
          var insertBaseLen = baseText.replace(TRAILING_COMMA_REGEX, "").length;
          tracking.blockedCorrectedPositions.add(charStart + insertBaseLen);
        }
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
  }
  return ops;
}
function findPreviousNonWhitespaceAnchor(list, tokenId) {
  if (!Array.isArray(list) || !tokenId) return null;
  var startIndex = list.findIndex(function (anchor) {
    return (anchor === null || anchor === void 0 ? void 0 : anchor.tokenId) === tokenId;
  });
  if (startIndex <= 0) return null;
  for (var i = startIndex - 1; i >= 0; i--) {
    var anchor = list[i];
    if (anchor !== null && anchor !== void 0 && anchor.tokenText && anchor.tokenText.trim()) {
      return anchor;
    }
  }
  return null;
}
function mergeAnchorsToMatchSourceText(entrySource, baseAnchor, orderedAnchors) {
  var _baseAnchor$tokenText, _leftAnchor;
  if (!entrySource || !baseAnchor || !(orderedAnchors !== null && orderedAnchors !== void 0 && orderedAnchors.length)) return null;
  var targetNormalized = normalizeTokenForComparison(entrySource);
  if (!targetNormalized) return null;
  var combinedText = (_baseAnchor$tokenText = baseAnchor.tokenText) !== null && _baseAnchor$tokenText !== void 0 ? _baseAnchor$tokenText : "";
  var normalizedCombined = normalizeTokenForComparison(combinedText);
  if (normalizedCombined === targetNormalized) return baseAnchor;
  var leftIndex = baseAnchor.tokenIndex - 1;
  var rightIndex = baseAnchor.tokenIndex + 1;
  var leftAnchor = baseAnchor;
  var rightAnchor = baseAnchor;
  var maxLength = entrySource.length + 20;
  while (combinedText.length <= maxLength) {
    var expanded = false;
    if (leftIndex >= 0) {
      var candidate = orderedAnchors[leftIndex];
      leftIndex--;
      if ((candidate === null || candidate === void 0 ? void 0 : candidate.tokenText) != null) {
        var _candidate$tokenText;
        combinedText = ((_candidate$tokenText = candidate.tokenText) !== null && _candidate$tokenText !== void 0 ? _candidate$tokenText : "") + combinedText;
        leftAnchor = candidate;
        normalizedCombined = normalizeTokenForComparison(combinedText);
        expanded = true;
        if (normalizedCombined === targetNormalized) break;
      }
    }
    if (normalizedCombined === targetNormalized) break;
    if (rightIndex < orderedAnchors.length) {
      var _candidate = orderedAnchors[rightIndex];
      rightIndex++;
      if ((_candidate === null || _candidate === void 0 ? void 0 : _candidate.tokenText) != null) {
        var _candidate$tokenText2;
        combinedText += (_candidate$tokenText2 = _candidate.tokenText) !== null && _candidate$tokenText2 !== void 0 ? _candidate$tokenText2 : "";
        rightAnchor = _candidate;
        normalizedCombined = normalizeTokenForComparison(combinedText);
        expanded = true;
        if (normalizedCombined === targetNormalized) break;
      }
    }
    if (!expanded) break;
  }
  if (normalizedCombined !== targetNormalized) return null;
  if (typeof ((_leftAnchor = leftAnchor) === null || _leftAnchor === void 0 ? void 0 : _leftAnchor.charStart) !== "number" || leftAnchor.charStart < 0) return null;
  return _objectSpread(_objectSpread({}, baseAnchor), {}, {
    charStart: leftAnchor.charStart,
    tokenIndex: leftAnchor.tokenIndex,
    tokenText: combinedText
  });
}
function filterDiffOpsAgainstCorrections(ops, tracking) {
  if (!tracking || !Array.isArray(ops) || !ops.length) return ops;
  var blockedOriginal = tracking.blockedOriginalPositions;
  var blockedCorrected = tracking.blockedCorrectedPositions;
  if (!(blockedOriginal !== null && blockedOriginal !== void 0 && blockedOriginal.size) && !(blockedCorrected !== null && blockedCorrected !== void 0 && blockedCorrected.size)) return ops;
  return ops.filter(function (op) {
    var originalPos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    var correctedPos = typeof op.correctedPos === "number" ? op.correctedPos : op.pos;
    if (op.kind === "delete" && blockedOriginal !== null && blockedOriginal !== void 0 && blockedOriginal.has(originalPos)) return false;
    if (op.kind === "insert" && blockedCorrected !== null && blockedCorrected !== void 0 && blockedCorrected.has(correctedPos)) return false;
    return true;
  });
}
function getCommaOpIdentity(op) {
  var originalPos = typeof (op === null || op === void 0 ? void 0 : op.originalPos) === "number" ? op.originalPos : op === null || op === void 0 ? void 0 : op.pos;
  var correctedPos = typeof (op === null || op === void 0 ? void 0 : op.correctedPos) === "number" ? op.correctedPos : op === null || op === void 0 ? void 0 : op.pos;
  return "".concat((op === null || op === void 0 ? void 0 : op.kind) || "unknown", ":").concat(originalPos, ":").concat(correctedPos);
}
function mergePreferredCommaOps(primaryOps, secondaryOps) {
  var merged = [];
  var seen = new Set();
  var pushUnique = function pushUnique(op) {
    if (!op) return;
    var key = getCommaOpIdentity(op);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(op);
  };
  (Array.isArray(primaryOps) ? primaryOps : []).forEach(pushUnique);
  (Array.isArray(secondaryOps) ? secondaryOps : []).forEach(pushUnique);
  return merged;
}
function shouldSuppressDueToRepeatedToken(anchorsEntry, op) {
  var _anchor$repeatKeyTota, _anchor$repeatKeyNear;
  if (op !== null && op !== void 0 && op.fromCorrections) return false;
  var anchor = findAnchorForDiffOp(anchorsEntry, op);
  if (!anchor) return false;
  var repeatKey = anchor.repeatKey;
  var repeatTotal = (_anchor$repeatKeyTota = anchor.repeatKeyTotal) !== null && _anchor$repeatKeyTota !== void 0 ? _anchor$repeatKeyTota : 0;
  if (!repeatKey || repeatTotal <= 1) return false;
  if (!/(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])+/.test(repeatKey)) return false;
  var gap = (_anchor$repeatKeyNear = anchor.repeatKeyNearestGap) !== null && _anchor$repeatKeyNear !== void 0 ? _anchor$repeatKeyNear : Infinity;
  return gap <= 80;
}
function findAnchorForDiffOp(anchorsEntry, op) {
  var _op$originalPos3, _op$correctedPos2, _around$at;
  if (!anchorsEntry || !op) return null;
  var isDelete = op.kind === "delete";
  var charIndex = isDelete ? (_op$originalPos3 = op.originalPos) !== null && _op$originalPos3 !== void 0 ? _op$originalPos3 : op.pos : (_op$correctedPos2 = op.correctedPos) !== null && _op$correctedPos2 !== void 0 ? _op$correctedPos2 : op.pos;
  if (typeof charIndex !== "number" || charIndex < 0) return null;
  var around = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.findAnchorsNearChar)(anchorsEntry, isDelete ? "source" : "target", charIndex);
  return (_around$at = around === null || around === void 0 ? void 0 : around.at) !== null && _around$at !== void 0 ? _around$at : null;
}
function buildDeleteSuggestionMetadata(entry, charIndex) {
  var _entry$documentOffset, _entry$originalText, _entry$paragraphIndex;
  if (!entry) return null;
  var sourceAround = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.findAnchorsNearChar)(entry, "source", charIndex);
  var documentOffset = (_entry$documentOffset = entry === null || entry === void 0 ? void 0 : entry.documentOffset) !== null && _entry$documentOffset !== void 0 ? _entry$documentOffset : 0;
  var charStart = Math.max(0, charIndex);
  var charEnd = charStart + 1;
  var paragraphText = (_entry$originalText = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText !== void 0 ? _entry$originalText : "";
  var highlightText = paragraphText.slice(charStart, charEnd) || ",";
  return {
    kind: "delete",
    paragraphIndex: (_entry$paragraphIndex = entry === null || entry === void 0 ? void 0 : entry.paragraphIndex) !== null && _entry$paragraphIndex !== void 0 ? _entry$paragraphIndex : -1,
    charStart: charStart,
    charEnd: charEnd,
    documentCharStart: documentOffset + charStart,
    documentCharEnd: documentOffset + charEnd,
    sourceTokenBefore: snapshotAnchor(sourceAround.before),
    sourceTokenAt: snapshotAnchor(sourceAround.at),
    sourceTokenAfter: snapshotAnchor(sourceAround.after),
    highlightText: highlightText
  };
}
function buildInsertSuggestionMetadata(entry, _ref0) {
  var _entry$documentOffset2, _ref1, _ref10, _ref11, _ref12, _sourceAround$at, _highlightAnchor$char, _entry$originalText2, _entry$paragraphIndex2;
  var originalCharIndex = _ref0.originalCharIndex,
    targetCharIndex = _ref0.targetCharIndex;
  if (!entry) return null;
  var srcIndex = typeof originalCharIndex === "number" ? originalCharIndex : -1;
  var targetIndex = typeof targetCharIndex === "number" ? targetCharIndex : srcIndex;
  var sourceAround = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.findAnchorsNearChar)(entry, "source", srcIndex);
  var targetAround = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.findAnchorsNearChar)(entry, "target", targetIndex);
  var documentOffset = (_entry$documentOffset2 = entry === null || entry === void 0 ? void 0 : entry.documentOffset) !== null && _entry$documentOffset2 !== void 0 ? _entry$documentOffset2 : 0;
  var highlightAnchor = (_ref1 = (_ref10 = (_ref11 = (_ref12 = (_sourceAround$at = sourceAround.at) !== null && _sourceAround$at !== void 0 ? _sourceAround$at : sourceAround.before) !== null && _ref12 !== void 0 ? _ref12 : sourceAround.after) !== null && _ref11 !== void 0 ? _ref11 : targetAround.at) !== null && _ref10 !== void 0 ? _ref10 : targetAround.before) !== null && _ref1 !== void 0 ? _ref1 : targetAround.after;
  var highlightCharStart = (_highlightAnchor$char = highlightAnchor === null || highlightAnchor === void 0 ? void 0 : highlightAnchor.charStart) !== null && _highlightAnchor$char !== void 0 ? _highlightAnchor$char : srcIndex;
  var highlightCharEnd = highlightAnchor === null || highlightAnchor === void 0 ? void 0 : highlightAnchor.charEnd;
  if (!(typeof highlightCharEnd === "number" && highlightCharEnd > highlightCharStart) && typeof highlightCharStart === "number" && highlightCharStart >= 0 && typeof (highlightAnchor === null || highlightAnchor === void 0 ? void 0 : highlightAnchor.tokenText) === "string" && highlightAnchor.tokenText.length > 0) {
    highlightCharEnd = highlightCharStart + highlightAnchor.tokenText.length;
  }
  if (!(typeof highlightCharEnd === "number" && highlightCharEnd > highlightCharStart)) {
    highlightCharEnd = highlightCharStart;
  }
  var paragraphText = (_entry$originalText2 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText2 !== void 0 ? _entry$originalText2 : "";
  var highlightText = "";
  if (highlightCharStart >= 0 && highlightCharEnd > highlightCharStart) {
    highlightText = paragraphText.slice(highlightCharStart, highlightCharEnd);
  }
  if (!highlightText && highlightCharStart >= 0) {
    highlightText = paragraphText.slice(highlightCharStart, highlightCharStart + 1);
  }
  return {
    kind: "insert",
    paragraphIndex: (_entry$paragraphIndex2 = entry === null || entry === void 0 ? void 0 : entry.paragraphIndex) !== null && _entry$paragraphIndex2 !== void 0 ? _entry$paragraphIndex2 : -1,
    targetCharStart: targetIndex,
    targetCharEnd: targetIndex >= 0 ? targetIndex + 1 : targetIndex,
    targetDocumentCharStart: targetIndex >= 0 ? documentOffset + targetIndex : targetIndex,
    targetDocumentCharEnd: targetIndex >= 0 ? documentOffset + targetIndex + 1 : targetIndex,
    highlightCharStart: highlightCharStart,
    highlightCharEnd: highlightCharEnd,
    highlightText: highlightText,
    sourceTokenBefore: snapshotAnchor(sourceAround.before),
    sourceTokenAt: snapshotAnchor(sourceAround.at),
    sourceTokenAfter: snapshotAnchor(sourceAround.after),
    targetTokenBefore: snapshotAnchor(targetAround.before),
    targetTokenAt: snapshotAnchor(targetAround.at),
    targetTokenAfter: snapshotAnchor(targetAround.after),
    highlightAnchorTarget: snapshotAnchor(highlightAnchor)
  };
}
function snapshotAnchor(anchor) {
  if (!anchor) return undefined;
  return {
    tokenId: anchor.tokenId,
    tokenIndex: anchor.tokenIndex,
    tokenText: anchor.tokenText,
    textOccurrence: anchor.textOccurrence,
    trimmedTextOccurrence: anchor.trimmedTextOccurrence,
    charStart: anchor.charStart,
    charEnd: anchor.charEnd,
    documentCharStart: anchor.documentCharStart,
    documentCharEnd: anchor.documentCharEnd,
    length: anchor.length,
    matched: anchor.matched,
    repeatKey: anchor.repeatKey,
    repeatKeyTotal: anchor.repeatKeyTotal,
    repeatKeyNearestGap: anchor.repeatKeyNearestGap
  };
}

/***/ }),

/***/ "./src/logic/engine/Suggestion.js":
/*!****************************************!*\
  !*** ./src/logic/engine/Suggestion.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Suggestion: function() { return /* binding */ Suggestion; },
/* harmony export */   createSuggestion: function() { return /* binding */ createSuggestion; },
/* harmony export */   normalizeSuggestion: function() { return /* binding */ normalizeSuggestion; }
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var SUGGESTION_KINDS = new Set(["insert", "delete"]);
var Suggestion = /*#__PURE__*/function () {
  function Suggestion(_ref) {
    var id = _ref.id,
      paragraphIndex = _ref.paragraphIndex,
      kind = _ref.kind,
      _ref$charHint = _ref.charHint,
      charHint = _ref$charHint === void 0 ? null : _ref$charHint,
      _ref$tokenHint = _ref.tokenHint,
      tokenHint = _ref$tokenHint === void 0 ? null : _ref$tokenHint,
      _ref$snippets = _ref.snippets,
      snippets = _ref$snippets === void 0 ? null : _ref$snippets,
      _ref$meta = _ref.meta,
      meta = _ref$meta === void 0 ? null : _ref$meta,
      _ref$debug = _ref.debug,
      debug = _ref$debug === void 0 ? null : _ref$debug;
    _classCallCheck(this, Suggestion);
    if (!SUGGESTION_KINDS.has(kind)) {
      throw new Error("Unsupported suggestion kind \"".concat(kind, "\""));
    }
    this.id = id !== null && id !== void 0 ? id : "".concat(kind, "-").concat(paragraphIndex, "-").concat(Date.now());
    this.paragraphIndex = typeof paragraphIndex === "number" ? paragraphIndex : -1;
    this.kind = kind;
    this.charHint = charHint;
    this.tokenHint = tokenHint;
    this.snippets = snippets || {};
    this.meta = meta || {};
    this.debug = debug || {};
  }
  return _createClass(Suggestion, [{
    key: "hasCharHint",
    value: function hasCharHint() {
      return Boolean(this.charHint && Number.isFinite(this.charHint.start));
    }
  }, {
    key: "hasTokenHint",
    value: function hasTokenHint() {
      return Boolean(this.tokenHint && (this.tokenHint.leftToken || this.tokenHint.rightToken));
    }
  }, {
    key: "getPreferredAnchor",
    value: function getPreferredAnchor() {
      var _this$snippets, _this$snippets2, _this$snippets3;
      if (this.hasCharHint()) return {
        type: "char",
        hint: this.charHint
      };
      if (this.hasTokenHint()) return {
        type: "token",
        hint: this.tokenHint
      };
      return (_this$snippets = this.snippets) !== null && _this$snippets !== void 0 && _this$snippets.leftSnippet || (_this$snippets2 = this.snippets) !== null && _this$snippets2 !== void 0 && _this$snippets2.rightSnippet || (_this$snippets3 = this.snippets) !== null && _this$snippets3 !== void 0 && _this$snippets3.focusWord ? {
        type: "snippet",
        hint: this.snippets
      } : null;
    }
  }]);
}();
function createSuggestion(data) {
  return new Suggestion(data);
}
function normalizeSuggestion(raw) {
  if (raw instanceof Suggestion) return raw;
  return new Suggestion(raw);
}

/***/ }),

/***/ "./src/logic/engine/textUtils.js":
/*!***************************************!*\
  !*** ./src/logic/engine/textUtils.js ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   QUOTES: function() { return /* binding */ QUOTES; },
/* harmony export */   charAtSafe: function() { return /* binding */ charAtSafe; },
/* harmony export */   findCommaAfterWhitespace: function() { return /* binding */ findCommaAfterWhitespace; },
/* harmony export */   isDigit: function() { return /* binding */ isDigit; },
/* harmony export */   isNumericComma: function() { return /* binding */ isNumericComma; },
/* harmony export */   makeAnchor: function() { return /* binding */ makeAnchor; },
/* harmony export */   normalizeForComparison: function() { return /* binding */ normalizeForComparison; },
/* harmony export */   normalizeParagraphForEquality: function() { return /* binding */ normalizeParagraphForEquality; },
/* harmony export */   normalizeParagraphWhitespace: function() { return /* binding */ normalizeParagraphWhitespace; },
/* harmony export */   normalizeTokenRepeatKey: function() { return /* binding */ normalizeTokenRepeatKey; },
/* harmony export */   onlyCommasChanged: function() { return /* binding */ onlyCommasChanged; }
/* harmony export */ });
var SPACE_EQUIVALENTS_REGEX = /[\u00A0\u202F\u2007]/g;
var TOKEN_REPEAT_LEADING_REGEX = /^[\s"'“”„()«»]+/g;
var TOKEN_REPEAT_TRAILING_REGEX = /[\s,.;:!?'"“”„()«»]+$/g;
function normalizeParagraphWhitespace(text) {
  if (typeof text !== "string" || !text.length) return typeof text === "string" ? text : "";
  return text.replace(SPACE_EQUIVALENTS_REGEX, " ");
}
function normalizeParagraphForEquality(text) {
  if (typeof text !== "string") return "";
  var normalized = normalizeParagraphWhitespace(text);
  normalized = normalized.replace(/\s+/g, " ");
  normalized = normalized.replace(/\s+,/g, ",");
  normalized = normalized.replace(/,\s*(?=\S)/g, ", ");
  return normalized.trim();
}
function normalizeTokenRepeatKey(text) {
  if (typeof text !== "string") return "";
  return text.replace(TOKEN_REPEAT_LEADING_REGEX, "").replace(TOKEN_REPEAT_TRAILING_REGEX, "").trim().toLowerCase();
}
var QUOTES = new Set(['"', "'", "“", "”", "„", "«", "»"]);
var isDigit = function isDigit(ch) {
  return ch >= "0" && ch <= "9";
};
var charAtSafe = function charAtSafe(s, i) {
  return i >= 0 && i < s.length ? s[i] : "";
};
function isNumericComma(original, corrected, kind, pos) {
  var s = kind === "delete" ? original : corrected;
  var prev = charAtSafe(s, pos - 1);
  var next = charAtSafe(s, pos + 1);
  return isDigit(prev) && isDigit(next);
}
function normalizeForComparison(text) {
  if (typeof text !== "string") return "";
  return text.replace(/\s+/g, "").replace(/,/g, "").replace(/[()]/g, "");
}
function onlyCommasChanged(original, corrected) {
  return normalizeForComparison(original) === normalizeForComparison(corrected);
}
function findCommaAfterWhitespace(text, startIndex) {
  if (typeof text !== "string" || startIndex < 0 || startIndex >= text.length) {
    return -1;
  }
  var idx = startIndex;
  var sawWhitespace = false;
  while (idx < text.length && /\s/.test(text[idx])) {
    sawWhitespace = true;
    idx++;
  }
  if (!sawWhitespace || idx >= text.length) {
    return -1;
  }
  if (text[idx] === ",") {
    return idx;
  }
  return -1;
}
function makeAnchor(text, idx) {
  var span = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16;
  var left = text.slice(Math.max(0, idx - span), idx);
  var right = text.slice(idx, Math.min(text.length, idx + span));
  return {
    left: left,
    right: right
  };
}

/***/ }),

/***/ "./src/logic/preveriVejice.js":
/*!************************************!*\
  !*** ./src/logic/preveriVejice.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyAllSuggestionsOnline: function() { return /* binding */ applyAllSuggestionsOnline; },
/* harmony export */   checkDocumentText: function() { return /* binding */ checkDocumentText; },
/* harmony export */   getPendingSuggestionsOnline: function() { return /* binding */ getPendingSuggestionsOnline; },
/* harmony export */   rejectAllSuggestionsOnline: function() { return /* binding */ rejectAllSuggestionsOnline; }
/* harmony export */ });
/* harmony import */ var _api_apiVejice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../api/apiVejice.js */ "./src/api/apiVejice.js");
/* harmony import */ var _utils_host_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/host.js */ "./src/utils/host.js");
/* harmony import */ var _engine_CommaSuggestionEngine_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./engine/CommaSuggestionEngine.js */ "./src/logic/engine/CommaSuggestionEngine.js");
/* harmony import */ var _anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./anchoring/SyntheticAnchorProvider.js */ "./src/logic/anchoring/SyntheticAnchorProvider.js");
/* harmony import */ var _anchoring_LemmatizerAnchorProvider_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./anchoring/LemmatizerAnchorProvider.js */ "./src/logic/anchoring/LemmatizerAnchorProvider.js");
/* harmony import */ var _adapters_wordOnlineAdapter_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./adapters/wordOnlineAdapter.js */ "./src/logic/adapters/wordOnlineAdapter.js");
/* harmony import */ var _adapters_wordDesktopAdapter_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./adapters/wordDesktopAdapter.js */ "./src/logic/adapters/wordDesktopAdapter.js");
/* harmony import */ var _bridges_onlineTextBridge_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./bridges/onlineTextBridge.js */ "./src/logic/bridges/onlineTextBridge.js");
/* harmony import */ var _bridges_desktopTextBridge_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./bridges/desktopTextBridge.js */ "./src/logic/bridges/desktopTextBridge.js");
/* harmony import */ var _engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./engine/textUtils.js */ "./src/logic/engine/textUtils.js");
var _Office;
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/* global Word, window, process, performance, console, Office, URL */











/** ─────────────────────────────────────────────────────────
 *  DEBUG helpers (flip DEBUG=false to silence logs)
 *  ───────────────────────────────────────────────────────── */
var envIsProd = function envIsProd() {
  var _process$env;
  return typeof process !== "undefined" && ((_process$env = process.env) === null || _process$env === void 0 ? void 0 : "development") === "production" || typeof window !== "undefined" && window.__VEJICE_ENV__ === "production";
};
var DEBUG_OVERRIDE = typeof window !== "undefined" && typeof window.__VEJICE_DEBUG__ === "boolean" ? window.__VEJICE_DEBUG__ : undefined;
var DEBUG = typeof DEBUG_OVERRIDE === "boolean" ? DEBUG_OVERRIDE : !envIsProd();
var log = function log() {
  var _console;
  for (var _len = arguments.length, a = new Array(_len), _key = 0; _key < _len; _key++) {
    a[_key] = arguments[_key];
  }
  return DEBUG && (_console = console).log.apply(_console, ["[Vejice CHECK]"].concat(a));
};
var warn = function warn() {
  var _console2;
  for (var _len2 = arguments.length, a = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    a[_key2] = arguments[_key2];
  }
  return DEBUG && (_console2 = console).warn.apply(_console2, ["[Vejice CHECK]"].concat(a));
};
var errL = function errL() {
  var _console3;
  for (var _len3 = arguments.length, a = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    a[_key3] = arguments[_key3];
  }
  return (_console3 = console).error.apply(_console3, ["[Vejice CHECK]"].concat(a));
};
var tnow = function tnow() {
  var _performance$now, _performance, _performance$now2;
  return (_performance$now = (_performance = performance) === null || _performance === void 0 || (_performance$now2 = _performance.now) === null || _performance$now2 === void 0 ? void 0 : _performance$now2.call(_performance)) !== null && _performance$now !== void 0 ? _performance$now : Date.now();
};
var SNIP = function SNIP(s) {
  var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 80;
  return typeof s === "string" ? s.slice(0, n) : s;
};
var MAX_AUTOFIX_PASSES = typeof Office !== "undefined" && ((_Office = Office) === null || _Office === void 0 || (_Office = _Office.context) === null || _Office === void 0 ? void 0 : _Office.platform) === "PC" ? 3 : 2;
var HIGHLIGHT_INSERT = "#FFF9C4"; // light yellow
var HIGHLIGHT_DELETE = "#FFCDD2"; // light red
var TRAILING_COMMA_REGEX = /[,\s]+$/;
var WORD_CHAR_REGEX = /(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])/;
var MAX_NORMALIZATION_PROBES = 20;
var pendingSuggestionsOnline = [];
var PENDING_SUGGESTIONS_STORAGE_KEY = "vejice.pendingSuggestionsOnline.v1";
var MAX_PARAGRAPH_CHARS = 3000; //???
var LONG_PARAGRAPH_MESSAGE = "Odstavek je predolg za preverjanje. Razdelite ga na krajše povedi in poskusite znova.";
var LONG_SENTENCE_MESSAGE = "Poved je predolga za preverjanje. Razdelite jo na krajše povedi in poskusite znova.";
var CHUNK_API_ERROR_MESSAGE = "Nekaterih povedi ni bilo mogoče preveriti zaradi napake strežnika. Ostale povedi so bile preverjene.";
var PARAGRAPH_NON_COMMA_MESSAGE = "API je spremenil več kot vejice. Preglejte odstavek.";
var TRACKED_CHANGES_PRESENT_MESSAGE = "Najprej sprejmite ali zavrnite obstoječe spremembe (Track Changes), nato ponovno zaženite preverjanje.";
var API_UNAVAILABLE_MESSAGE = "Storitev CJVT Vejice trenutno ni na voljo. Znova poskusite kasneje.";
var longSentenceNotified = false;
var chunkApiFailureNotified = false;
var BOOLEAN_TRUE = new Set(["1", "true", "yes", "on"]);
var BOOLEAN_FALSE = new Set(["0", "false", "no", "off"]);
function parseBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  var normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (BOOLEAN_TRUE.has(normalized)) return true;
  if (BOOLEAN_FALSE.has(normalized)) return false;
  return undefined;
}
function shouldUseLemmatizerAnchors() {
  if (typeof window !== "undefined") {
    if (typeof window.__VEJICE_LEMMAS_URL === "string" && window.__VEJICE_LEMMAS_URL) {
      log("Lemmas endpoint override via window:", window.__VEJICE_LEMMAS_URL);
    }
    if (typeof window.__VEJICE_LEMMAS_TIMEOUT_MS !== "undefined" && window.__VEJICE_LEMMAS_TIMEOUT_MS !== null) {
      log("Lemmas timeout override via window:", window.__VEJICE_LEMMAS_TIMEOUT_MS);
    }
    var override = parseBooleanFlag(window.__VEJICE_USE_LEMMATIZER__);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    var _parseBooleanFlag, _process$env2, _process$env3, _process$env4, _process$env5;
    var envValue = (_parseBooleanFlag = parseBooleanFlag((_process$env2 = process.env) === null || _process$env2 === void 0 ? void 0 : "true")) !== null && _parseBooleanFlag !== void 0 ? _parseBooleanFlag : parseBooleanFlag((_process$env3 = process.env) === null || _process$env3 === void 0 ? void 0 : "true");
    if (typeof envValue === "boolean") return envValue;
    if ((_process$env4 = process.env) !== null && _process$env4 !== void 0 && "https://127.0.0.1:4001/lemmas") {
      log("Lemmas endpoint override via env:", "https://127.0.0.1:4001/lemmas");
    }
    if ((_process$env5 = process.env) !== null && _process$env5 !== void 0 && "8000") {
      log("Lemmas timeout override via env:", "8000");
    }
  }
  return true;
}
function createAnchorProvider() {
  if (shouldUseLemmatizerAnchors()) {
    try {
      log("Lemmatizer anchor provider enabled");
      return new _anchoring_LemmatizerAnchorProvider_js__WEBPACK_IMPORTED_MODULE_4__.LemmatizerAnchorProvider();
    } catch (error) {
      errL("Failed to initialize LemmatizerAnchorProvider, falling back to synthetic", error);
    }
  }
  return new _anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_3__.SyntheticAnchorProvider();
}
function resetPendingSuggestionsOnline() {
  pendingSuggestionsOnline.length = 0;
  persistPendingSuggestionsOnline();
}
function addPendingSuggestionOnline(suggestion) {
  pendingSuggestionsOnline.push(suggestion);
  persistPendingSuggestionsOnline();
}
function getPendingSuggestionsOnline() {
  var debugSnapshot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  if (!debugSnapshot) return pendingSuggestionsOnline;
  return pendingSuggestionsOnline.map(function (sug) {
    return {
      id: sug === null || sug === void 0 ? void 0 : sug.id,
      kind: sug === null || sug === void 0 ? void 0 : sug.kind,
      paragraphIndex: sug === null || sug === void 0 ? void 0 : sug.paragraphIndex,
      meta: sug === null || sug === void 0 ? void 0 : sug.meta,
      originalPos: sug === null || sug === void 0 ? void 0 : sug.originalPos,
      snippets: sug === null || sug === void 0 ? void 0 : sug.snippets
    };
  });
}
function toSerializableSuggestion(suggestion) {
  if (!suggestion || _typeof(suggestion) !== "object") return null;
  var serializable = {
    id: suggestion.id,
    kind: suggestion.kind,
    paragraphIndex: suggestion.paragraphIndex,
    charHint: suggestion.charHint,
    snippets: suggestion.snippets,
    meta: suggestion.meta,
    originalPos: suggestion.originalPos
  };
  return serializable;
}
function persistPendingSuggestionsOnline() {
  if (typeof window === "undefined") return;
  try {
    var storage = window.localStorage;
    if (!storage) return;
    if (!pendingSuggestionsOnline.length) {
      storage.removeItem(PENDING_SUGGESTIONS_STORAGE_KEY);
      return;
    }
    var payload = pendingSuggestionsOnline.map(function (sug) {
      return toSerializableSuggestion(sug);
    }).filter(Boolean);
    storage.setItem(PENDING_SUGGESTIONS_STORAGE_KEY, JSON.stringify(payload));
  } catch (storageErr) {
    warn("persistPendingSuggestionsOnline failed", storageErr);
  }
}
function restorePendingSuggestionsOnline() {
  if (pendingSuggestionsOnline.length) return pendingSuggestionsOnline.length;
  if (typeof window === "undefined") return 0;
  try {
    var storage = window.localStorage;
    if (!storage) return 0;
    var raw = storage.getItem(PENDING_SUGGESTIONS_STORAGE_KEY);
    if (!raw) return 0;
    var parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    var _iterator = _createForOfIteratorHelper(parsed),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var item = _step.value;
        if (!item || _typeof(item) !== "object") continue;
        pendingSuggestionsOnline.push(item);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return pendingSuggestionsOnline.length;
  } catch (storageErr) {
    warn("restorePendingSuggestionsOnline failed", storageErr);
    return 0;
  }
}
if (typeof window !== "undefined") {
  if (!Array.isArray(window.__VEJICE_DEBUG_DUMPS__)) {
    window.__VEJICE_DEBUG_DUMPS__ = [];
  }
  if (!("__VEJICE_LAST_DEBUG_DUMP__" in window)) {
    window.__VEJICE_LAST_DEBUG_DUMP__ = null;
  }
  window.__VEJICE_DEBUG_DUMP_READY__ = true;
  window.__VEJICE_DEBUG_STATE__ = window.__VEJICE_DEBUG_STATE__ || {};
  window.__VEJICE_DEBUG_STATE__.getPendingSuggestionsOnline = getPendingSuggestionsOnline;
  window.__VEJICE_DEBUG_STATE__.getParagraphAnchorsOnline = function () {
    return anchorProvider.paragraphAnchors;
  };
  window.getVejiceDebugDump = function () {
    return window.__VEJICE_LAST_DEBUG_DUMP__ || null;
  };
  window.getVejiceDebugDumps = function () {
    return Array.isArray(window.__VEJICE_DEBUG_DUMPS__) ? _toConsumableArray(window.__VEJICE_DEBUG_DUMPS__) : [];
  };
  window.getVejiceDebugStatus = function () {
    return {
      ready: Boolean(window.__VEJICE_DEBUG_DUMP_READY__),
      debug: window.__VEJICE_DEBUG__,
      dump: window.__VEJICE_DEBUG_DUMP__,
      state: _typeof(window.__VEJICE_DEBUG_STATE__),
      dumps: Array.isArray(window.__VEJICE_DEBUG_DUMPS__) ? window.__VEJICE_DEBUG_DUMPS__.length : 0,
      hasLastDump: Boolean(window.__VEJICE_LAST_DEBUG_DUMP__)
    };
  };
  window.getPendingSuggestionsOnline = getPendingSuggestionsOnline;
  window.getPendingSuggestionsSnapshot = function () {
    return getPendingSuggestionsOnline(true);
  };
}
var toastDialog = null;
function showToastNotification(message) {
  var _Office$context;
  if (!message) return;
  if (typeof Office === "undefined" || !((_Office$context = Office.context) !== null && _Office$context !== void 0 && (_Office$context = _Office$context.ui) !== null && _Office$context !== void 0 && _Office$context.displayDialogAsync)) {
    warn("Toast notification unavailable", message);
    return;
  }
  var origin = typeof window !== "undefined" && window.location && window.location.origin || null;
  if (!origin) {
    warn("Toast notification: origin unavailable");
    return;
  }
  var toastUrl = new URL("toast.html", origin);
  toastUrl.searchParams.set("message", message);
  Office.context.ui.displayDialogAsync(toastUrl.toString(), {
    height: 20,
    width: 30,
    displayInIframe: true
  }, function (asyncResult) {
    if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) {
      warn("Toast notification failed", asyncResult.error);
      return;
    }
    if (toastDialog) {
      try {
        toastDialog.close();
      } catch (err) {
        warn("Toast notification: failed to close previous dialog", err);
      }
    }
    toastDialog = asyncResult.value;
    var closeDialog = function closeDialog() {
      if (!toastDialog) return;
      try {
        toastDialog.close();
      } catch (err) {
        warn("Toast notification: failed to close dialog", err);
      } finally {
        toastDialog = null;
      }
    };
    toastDialog.addEventHandler(Office.EventType.DialogMessageReceived, closeDialog);
    toastDialog.addEventHandler(Office.EventType.DialogEventReceived, closeDialog);
  });
}
function notifyParagraphTooLong(paragraphIndex, length) {
  var label = paragraphIndex + 1;
  var msg = "Odstavek ".concat(label, ": ").concat(LONG_PARAGRAPH_MESSAGE, " (").concat(length, " znakov).");
  warn("Paragraph too long – skipped", {
    paragraphIndex: paragraphIndex,
    length: length
  });
  showToastNotification(msg);
}
function notifySentenceTooLong(paragraphIndex, length) {
  var label = paragraphIndex + 1;
  var msg = "Odstavek ".concat(label, ": ").concat(LONG_SENTENCE_MESSAGE, " (").concat(length, " znakov).");
  warn("Sentence too long – skipped", {
    paragraphIndex: paragraphIndex,
    length: length
  });
  if (longSentenceNotified) return;
  longSentenceNotified = true;
  showToastNotification(msg);
}
function notifyChunkApiFailure(paragraphIndex, chunkIndex) {
  var paragraphLabel = paragraphIndex + 1;
  var chunkLabel = chunkIndex + 1;
  var msg = "Odstavek ".concat(paragraphLabel, ", poved ").concat(chunkLabel, ": ").concat(CHUNK_API_ERROR_MESSAGE);
  warn("Sentence skipped due to API error", {
    paragraphIndex: paragraphIndex,
    chunkIndex: chunkIndex
  });
  if (chunkApiFailureNotified) return;
  chunkApiFailureNotified = true;
  showToastNotification(msg);
}
function notifyChunkNonCommaChanges(paragraphIndex, chunkIndex, original, corrected) {
  var paragraphLabel = paragraphIndex + 1;
  var chunkLabel = chunkIndex + 1;
  var msg = "Odstavek ".concat(paragraphLabel, ", poved ").concat(chunkLabel, ": API je spremenil ve\u010D kot vejice. Preglejte poved ro\u010Dno.");
  warn("Sentence skipped due to non-comma changes", {
    paragraphIndex: paragraphIndex,
    chunkIndex: chunkIndex,
    original: original,
    corrected: corrected
  });
  showToastNotification(msg);
}
var anchorProvider = createAnchorProvider();
var anchorProviderSupportsCharHints = typeof anchorProvider.supportsCharHints === "function" ? anchorProvider.supportsCharHints() : false;
if (anchorProviderSupportsCharHints) {
  log("Anchor provider supports char hints; snippet fallback cleanup disabled");
}
var commaEngine = new _engine_CommaSuggestionEngine_js__WEBPACK_IMPORTED_MODULE_2__.CommaSuggestionEngine({
  anchorProvider: anchorProvider,
  apiClient: {
    popraviPoved: _api_apiVejice_js__WEBPACK_IMPORTED_MODULE_0__.popraviPoved,
    popraviPovedDetailed: _api_apiVejice_js__WEBPACK_IMPORTED_MODULE_0__.popraviPovedDetailed
  },
  notifiers: {
    onParagraphTooLong: notifyParagraphTooLong,
    onSentenceTooLong: notifySentenceTooLong,
    onChunkApiFailure: notifyChunkApiFailure,
    onChunkNonCommaChanges: notifyChunkNonCommaChanges
  }
});
if (typeof window !== "undefined") {
  window.__VEJICE_DEBUG_STATE__ = window.__VEJICE_DEBUG_STATE__ || {};
  window.__VEJICE_DEBUG_STATE__.getEngineDebugDump = function () {
    return commaEngine.lastDebugDump || null;
  };
  window.__VEJICE_DEBUG_STATE__.getEngineDebugDumps = function () {
    return Array.isArray(commaEngine.debugDumps) ? _toConsumableArray(commaEngine.debugDumps) : [];
  };
  window.getVejiceDebugDump = function () {
    return commaEngine.lastDebugDump || window.__VEJICE_LAST_DEBUG_DUMP__ || null;
  };
  window.getVejiceDebugDumps = function () {
    if (Array.isArray(commaEngine.debugDumps) && commaEngine.debugDumps.length) {
      return _toConsumableArray(commaEngine.debugDumps);
    }
    return Array.isArray(window.__VEJICE_DEBUG_DUMPS__) ? _toConsumableArray(window.__VEJICE_DEBUG_DUMPS__) : [];
  };
}
var onlineTextBridge = new _bridges_onlineTextBridge_js__WEBPACK_IMPORTED_MODULE_7__.OnlineTextBridge({
  applyInsertSuggestion: applyInsertSuggestion,
  applyDeleteSuggestion: applyDeleteSuggestion
});
var desktopTextBridge = new _bridges_desktopTextBridge_js__WEBPACK_IMPORTED_MODULE_8__.DesktopTextBridge({
  applyInsertSuggestion: applyInsertSuggestion,
  applyDeleteSuggestion: applyDeleteSuggestion
});
var normalizationProbeCount = 0;
function getActiveTextBridge() {
  return (0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)() ? onlineTextBridge : desktopTextBridge;
}
function getNormalizationProfile() {
  return getActiveTextBridge().getNormalizationProfile();
}
var wordOnlineAdapter = new _adapters_wordOnlineAdapter_js__WEBPACK_IMPORTED_MODULE_5__.WordOnlineAdapter({
  highlightSuggestion: highlightSuggestionOnline,
  textBridge: onlineTextBridge,
  clearSuggestionMarkers: clearOnlineSuggestionMarkers
});
var wordDesktopAdapter = new _adapters_wordDesktopAdapter_js__WEBPACK_IMPORTED_MODULE_6__.WordDesktopAdapter({
  textBridge: desktopTextBridge
});
function notifyParagraphNonCommaChanges(paragraphIndex, original, corrected) {
  var label = paragraphIndex + 1;
  warn("Paragraph skipped due to non-comma changes", {
    paragraphIndex: paragraphIndex,
    original: original,
    corrected: corrected
  });
  showToastNotification("Odstavek ".concat(label, ": ").concat(PARAGRAPH_NON_COMMA_MESSAGE));
}
function notifyTrackedChangesPresent() {
  warn("Tracked changes present – aborting check");
  showToastNotification(TRACKED_CHANGES_PRESENT_MESSAGE);
}
var apiFailureNotified = false;
function notifyApiUnavailable() {
  if (apiFailureNotified) return;
  apiFailureNotified = true;
  warn("API unavailable – notifying toast");
  showToastNotification(API_UNAVAILABLE_MESSAGE);
}
function resetNotificationFlags() {
  apiFailureNotified = false;
  longSentenceNotified = false;
  chunkApiFailureNotified = false;
}
function documentHasTrackedChanges(_x) {
  return _documentHasTrackedChanges.apply(this, arguments);
}
function _documentHasTrackedChanges() {
  _documentHasTrackedChanges = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(context) {
    var revisions, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          if (context !== null && context !== void 0 && context.document) {
            _context.n = 1;
            break;
          }
          return _context.a(2, false);
        case 1:
          if (!(0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)()) {
            _context.n = 2;
            break;
          }
          return _context.a(2, false);
        case 2:
          revisions = context.document.revisions;
          if (!(!revisions || typeof revisions.load !== "function")) {
            _context.n = 3;
            break;
          }
          return _context.a(2, false);
        case 3:
          _context.p = 3;
          revisions.load("items");
          _context.n = 4;
          return context.sync();
        case 4:
          return _context.a(2, revisions.items.length > 0);
        case 5:
          _context.p = 5;
          _t = _context.v;
          if (!((_t === null || _t === void 0 ? void 0 : _t.code) === "ApiNotFound")) {
            _context.n = 6;
            break;
          }
          warn("Revisions API unavailable on this host – skipping tracked changes guard");
          return _context.a(2, false);
        case 6:
          throw _t;
        case 7:
          return _context.a(2);
      }
    }, _callee, null, [[3, 5]]);
  }));
  return _documentHasTrackedChanges.apply(this, arguments);
}
function countSnippetOccurrencesBefore(text, snippet, limit) {
  if (!snippet) return 0;
  var safeText = typeof text === "string" ? text : "";
  var hop = Math.max(1, snippet.length);
  var count = 0;
  var idx = safeText.indexOf(snippet);
  while (idx !== -1 && idx < limit) {
    count++;
    idx = safeText.indexOf(snippet, idx + hop);
  }
  return count;
}
function canonicalizeWithBoundaryMap(text) {
  var profile = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getNormalizationProfile();
  var source = typeof text === "string" ? text : "";
  var canonical = "";
  var boundary = new Array(source.length + 1).fill(0);
  var prevWasSpace = false;
  var normalizeChar = function normalizeChar(ch) {
    if (profile !== null && profile !== void 0 && profile.normalizeQuotes) {
      if ("\"“”„«»".includes(ch)) return "\"";
      if ("'`´‘’".includes(ch)) return "'";
    }
    if (profile !== null && profile !== void 0 && profile.normalizeDashes && "–—‑−".includes(ch)) {
      return "-";
    }
    if (profile !== null && profile !== void 0 && profile.normalizeEllipsis && ch === "…") {
      return "...";
    }
    return ch;
  };
  for (var i = 0; i < source.length; i++) {
    var ch = source[i];
    var isSpace = /[\s\u00A0\u202F\u2007]/.test(ch);
    if (isSpace) {
      if ((profile === null || profile === void 0 ? void 0 : profile.collapseWhitespace) !== false) {
        if (!prevWasSpace) {
          canonical += " ";
          prevWasSpace = true;
        }
      } else {
        canonical += ch;
        prevWasSpace = false;
      }
    } else {
      canonical += normalizeChar(ch);
      prevWasSpace = false;
    }
    boundary[i + 1] = canonical.length;
  }
  return {
    canonical: canonical,
    boundary: boundary
  };
}
function logNormalizationProbe(sourceText, targetText, sourceIndex, profile) {
  if (!DEBUG || normalizationProbeCount >= MAX_NORMALIZATION_PROBES) return;
  normalizationProbeCount++;
  var idx = Math.max(0, Math.floor(sourceIndex || 0));
  var left = Math.max(0, idx - 18);
  var right = Math.min((sourceText || "").length, idx + 18);
  var targetLeft = Math.max(0, idx - 18);
  var targetRight = Math.min((targetText || "").length, idx + 18);
  warn("normalization probe: prefix mismatch", {
    profile: profile,
    sourceIndex: idx,
    sourceSnippet: (sourceText || "").slice(left, right),
    targetSnippet: (targetText || "").slice(targetLeft, targetRight)
  });
}
function mapIndexAcrossCanonical(sourceText, targetText, sourceIndex) {
  var _src$boundary$safeSrc;
  var profile = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : getNormalizationProfile();
  if (!Number.isFinite(sourceIndex) || sourceIndex < 0) return 0;
  var src = canonicalizeWithBoundaryMap(sourceText, profile);
  var dst = canonicalizeWithBoundaryMap(targetText, profile);
  if (!src.canonical.length || !dst.canonical.length) return 0;
  var safeSrcIndex = Math.max(0, Math.min(Math.floor(sourceIndex), sourceText.length));
  var srcCanonicalPos = (_src$boundary$safeSrc = src.boundary[safeSrcIndex]) !== null && _src$boundary$safeSrc !== void 0 ? _src$boundary$safeSrc : 0;
  var srcPrefix = src.canonical.slice(0, srcCanonicalPos);
  var directPos = dst.canonical.startsWith(srcPrefix) ? srcCanonicalPos : -1;
  if (directPos < 0) {
    logNormalizationProbe(sourceText, targetText, sourceIndex, profile);
  }
  var estimatePos = src.canonical.length > 0 ? Math.round(srcCanonicalPos / src.canonical.length * dst.canonical.length) : srcCanonicalPos;
  var findBestFallbackPos = function findBestFallbackPos() {
    var leftCtx = src.canonical.slice(Math.max(0, srcCanonicalPos - 20), srcCanonicalPos);
    var rightCtx = src.canonical.slice(srcCanonicalPos, Math.min(src.canonical.length, srcCanonicalPos + 20));
    if (!leftCtx && !rightCtx) return Math.min(Math.max(0, estimatePos), dst.canonical.length);
    var candidates = [];
    if (leftCtx) {
      var idx = dst.canonical.indexOf(leftCtx);
      while (idx !== -1) {
        candidates.push(idx + leftCtx.length);
        idx = dst.canonical.indexOf(leftCtx, idx + 1);
      }
    } else if (rightCtx) {
      var _idx = dst.canonical.indexOf(rightCtx);
      while (_idx !== -1) {
        candidates.push(_idx);
        _idx = dst.canonical.indexOf(rightCtx, _idx + 1);
      }
    }
    if (!candidates.length) return Math.min(Math.max(0, estimatePos), dst.canonical.length);
    var bestPos = candidates[0];
    var bestScore = Number.POSITIVE_INFINITY;
    for (var _i = 0, _candidates = candidates; _i < _candidates.length; _i++) {
      var pos = _candidates[_i];
      var dstRight = dst.canonical.slice(pos, Math.min(dst.canonical.length, pos + rightCtx.length));
      var mismatch = 0;
      var overlap = Math.min(dstRight.length, rightCtx.length);
      for (var i = 0; i < overlap; i++) {
        if (dstRight[i] !== rightCtx[i]) mismatch++;
      }
      mismatch += Math.abs(rightCtx.length - dstRight.length);
      var distance = Math.abs(pos - estimatePos);
      var score = mismatch * 3 + distance;
      if (score < bestScore) {
        bestScore = score;
        bestPos = pos;
      }
    }
    return Math.min(Math.max(0, bestPos), dst.canonical.length);
  };
  var targetCanonicalPos = directPos >= 0 ? Math.min(directPos, dst.canonical.length) : findBestFallbackPos();
  if (targetCanonicalPos <= 0) return 0;
  var low = 0;
  var high = targetText.length;
  while (low < high) {
    var _dst$boundary$mid;
    var mid = Math.floor((low + high) / 2);
    if (((_dst$boundary$mid = dst.boundary[mid]) !== null && _dst$boundary$mid !== void 0 ? _dst$boundary$mid : 0) < targetCanonicalPos) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return Math.max(0, Math.min(low, targetText.length));
}
function getRangeForCharacterSpan(_x2, _x3, _x4, _x5, _x6) {
  return _getRangeForCharacterSpan.apply(this, arguments);
}
function _getRangeForCharacterSpan() {
  _getRangeForCharacterSpan = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(context, paragraph, paragraphText, charStart, charEnd) {
    var reason,
      fallbackSnippet,
      text,
      safeStart,
      computedEnd,
      safeEnd,
      snippet,
      _matches,
      _matches2,
      liveText,
      searchSnippet,
      matches,
      mappedStart,
      occurrence,
      idx,
      _args2 = arguments,
      _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          reason = _args2.length > 5 && _args2[5] !== undefined ? _args2[5] : "span";
          fallbackSnippet = _args2.length > 6 ? _args2[6] : undefined;
          if (!(!paragraph || typeof paragraph.getRange !== "function")) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, null);
        case 1:
          if (!(!Number.isFinite(charStart) || charStart < 0)) {
            _context2.n = 2;
            break;
          }
          return _context2.a(2, null);
        case 2:
          text = typeof paragraphText === "string" ? paragraphText : paragraph.text || "";
          if (text) {
            _context2.n = 3;
            break;
          }
          return _context2.a(2, null);
        case 3:
          safeStart = Math.max(0, Math.min(Math.floor(charStart), text.length ? text.length - 1 : 0));
          computedEnd = Math.max(safeStart + 1, Math.floor(charEnd !== null && charEnd !== void 0 ? charEnd : safeStart + 1));
          safeEnd = Math.min(computedEnd, text.length);
          snippet = text.slice(safeStart, safeEnd);
          if (!snippet && typeof fallbackSnippet === "string" && fallbackSnippet.length) {
            snippet = fallbackSnippet;
          }
          if (snippet) {
            _context2.n = 4;
            break;
          }
          return _context2.a(2, null);
        case 4:
          _context2.p = 4;
          if (!(typeof paragraph.text !== "string")) {
            _context2.n = 5;
            break;
          }
          paragraph.load("text");
          _context2.n = 5;
          return context.sync();
        case 5:
          liveText = typeof paragraph.text === "string" ? paragraph.text : text;
          searchSnippet = snippet;
          _context2.n = 6;
          return searchParagraphForSnippet(context, paragraph, searchSnippet);
        case 6:
          matches = _context2.v;
          if (!(!((_matches = matches) !== null && _matches !== void 0 && (_matches = _matches.items) !== null && _matches !== void 0 && _matches.length) && snippet.trim() && snippet.trim() !== snippet)) {
            _context2.n = 8;
            break;
          }
          searchSnippet = snippet.trim();
          _context2.n = 7;
          return searchParagraphForSnippet(context, paragraph, searchSnippet);
        case 7:
          matches = _context2.v;
        case 8:
          if ((_matches2 = matches) !== null && _matches2 !== void 0 && (_matches2 = _matches2.items) !== null && _matches2 !== void 0 && _matches2.length) {
            _context2.n = 9;
            break;
          }
          warn("getRangeForCharacterSpan(".concat(reason, "): snippet not found"), {
            snippet: snippet,
            safeStart: safeStart
          });
          return _context2.a(2, null);
        case 9:
          mappedStart = mapIndexAcrossCanonical(text, liveText, safeStart);
          occurrence = countSnippetOccurrencesBefore(liveText, searchSnippet, mappedStart);
          idx = Math.min(occurrence, matches.items.length - 1);
          return _context2.a(2, matches.items[idx]);
        case 10:
          _context2.p = 10;
          _t2 = _context2.v;
          warn("getRangeForCharacterSpan(".concat(reason, ") failed"), _t2);
          return _context2.a(2, null);
      }
    }, _callee2, null, [[4, 10]]);
  }));
  return _getRangeForCharacterSpan.apply(this, arguments);
}
function getRangeForAnchorSpan(_x7, _x8, _x9, _x0, _x1) {
  return _getRangeForAnchorSpan.apply(this, arguments);
}
function _getRangeForAnchorSpan() {
  _getRangeForAnchorSpan = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(context, paragraph, anchorsEntry, charStart, charEnd) {
    var reason,
      fallbackSnippet,
      candidates,
      liveText,
      _i2,
      _candidates2,
      candidate,
      range,
      _args3 = arguments;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          reason = _args3.length > 5 && _args3[5] !== undefined ? _args3[5] : "span";
          fallbackSnippet = _args3.length > 6 ? _args3[6] : undefined;
          candidates = [];
          if (anchorsEntry !== null && anchorsEntry !== void 0 && anchorsEntry.originalText) {
            candidates.push({
              text: anchorsEntry.originalText,
              label: "orig"
            });
          }
          liveText = paragraph === null || paragraph === void 0 ? void 0 : paragraph.text;
          if (liveText && (!candidates.length || liveText !== candidates[0].text)) {
            candidates.push({
              text: liveText,
              label: "live"
            });
          }
          if (!candidates.length) {
            candidates.push({
              text: "",
              label: "empty"
            });
          }
          _i2 = 0, _candidates2 = candidates;
        case 1:
          if (!(_i2 < _candidates2.length)) {
            _context3.n = 5;
            break;
          }
          candidate = _candidates2[_i2];
          if (candidate.text) {
            _context3.n = 2;
            break;
          }
          return _context3.a(3, 4);
        case 2:
          _context3.n = 3;
          return getRangeForCharacterSpan(context, paragraph, candidate.text, charStart, charEnd, "".concat(reason, "-").concat(candidate.label), fallbackSnippet);
        case 3:
          range = _context3.v;
          if (!range) {
            _context3.n = 4;
            break;
          }
          return _context3.a(2, range);
        case 4:
          _i2++;
          _context3.n = 1;
          break;
        case 5:
          return _context3.a(2, null);
      }
    }, _callee3);
  }));
  return _getRangeForAnchorSpan.apply(this, arguments);
}
function searchParagraphForSnippet(_x10, _x11, _x12) {
  return _searchParagraphForSnippet.apply(this, arguments);
}
function _searchParagraphForSnippet() {
  _searchParagraphForSnippet = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(context, paragraph, snippet) {
    var range, matches;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          range = paragraph.getRange();
          matches = range.search(snippet, {
            matchCase: true,
            matchWholeWord: false,
            ignoreSpace: false,
            ignorePunct: false
          });
          matches.load("items");
          _context4.n = 1;
          return context.sync();
        case 1:
          return _context4.a(2, matches);
      }
    }, _callee4);
  }));
  return _searchParagraphForSnippet.apply(this, arguments);
}
function buildDeleteSuggestionMetadata(entry, charIndex) {
  var _entry$documentOffset, _entry$originalText, _entry$paragraphIndex;
  var sourceAround = findAnchorsNearChar(entry, "source", charIndex);
  var documentOffset = (_entry$documentOffset = entry === null || entry === void 0 ? void 0 : entry.documentOffset) !== null && _entry$documentOffset !== void 0 ? _entry$documentOffset : 0;
  var charStart = Math.max(0, charIndex);
  var charEnd = charStart + 1;
  var paragraphText = (_entry$originalText = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText !== void 0 ? _entry$originalText : "";
  var highlightText = paragraphText.slice(charStart, charEnd) || ",";
  return {
    kind: "delete",
    paragraphIndex: (_entry$paragraphIndex = entry === null || entry === void 0 ? void 0 : entry.paragraphIndex) !== null && _entry$paragraphIndex !== void 0 ? _entry$paragraphIndex : -1,
    charStart: charStart,
    charEnd: charEnd,
    documentCharStart: documentOffset + charStart,
    documentCharEnd: documentOffset + charEnd,
    sourceTokenBefore: snapshotAnchor(sourceAround.before),
    sourceTokenAt: snapshotAnchor(sourceAround.at),
    sourceTokenAfter: snapshotAnchor(sourceAround.after),
    highlightText: highlightText
  };
}
function buildInsertSuggestionMetadata(entry, _ref) {
  var _entry$documentOffset2, _ref2, _ref3, _ref4, _ref5, _sourceAround$at, _highlightAnchor$char, _highlightAnchor$char2, _entry$originalText2, _entry$paragraphIndex2;
  var originalCharIndex = _ref.originalCharIndex,
    targetCharIndex = _ref.targetCharIndex;
  var srcIndex = typeof originalCharIndex === "number" ? originalCharIndex : -1;
  var targetIndex = typeof targetCharIndex === "number" ? targetCharIndex : srcIndex;
  var sourceAround = findAnchorsNearChar(entry, "source", srcIndex);
  var targetAround = findAnchorsNearChar(entry, "target", targetIndex);
  var documentOffset = (_entry$documentOffset2 = entry === null || entry === void 0 ? void 0 : entry.documentOffset) !== null && _entry$documentOffset2 !== void 0 ? _entry$documentOffset2 : 0;
  var highlightAnchor = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_sourceAround$at = sourceAround.at) !== null && _sourceAround$at !== void 0 ? _sourceAround$at : sourceAround.before) !== null && _ref5 !== void 0 ? _ref5 : sourceAround.after) !== null && _ref4 !== void 0 ? _ref4 : targetAround.at) !== null && _ref3 !== void 0 ? _ref3 : targetAround.before) !== null && _ref2 !== void 0 ? _ref2 : targetAround.after;
  var highlightCharStart = (_highlightAnchor$char = highlightAnchor === null || highlightAnchor === void 0 ? void 0 : highlightAnchor.charStart) !== null && _highlightAnchor$char !== void 0 ? _highlightAnchor$char : srcIndex;
  var highlightCharEnd = (_highlightAnchor$char2 = highlightAnchor === null || highlightAnchor === void 0 ? void 0 : highlightAnchor.charEnd) !== null && _highlightAnchor$char2 !== void 0 ? _highlightAnchor$char2 : srcIndex;
  var paragraphText = (_entry$originalText2 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText2 !== void 0 ? _entry$originalText2 : "";
  var highlightText = "";
  if (highlightCharStart >= 0 && highlightCharEnd > highlightCharStart) {
    highlightText = paragraphText.slice(highlightCharStart, highlightCharEnd);
  }
  if (!highlightText && highlightCharStart >= 0) {
    highlightText = paragraphText.slice(highlightCharStart, highlightCharStart + 1);
  }
  return {
    kind: "insert",
    paragraphIndex: (_entry$paragraphIndex2 = entry === null || entry === void 0 ? void 0 : entry.paragraphIndex) !== null && _entry$paragraphIndex2 !== void 0 ? _entry$paragraphIndex2 : -1,
    targetCharStart: targetIndex,
    targetCharEnd: targetIndex >= 0 ? targetIndex + 1 : targetIndex,
    targetDocumentCharStart: targetIndex >= 0 ? documentOffset + targetIndex : targetIndex,
    targetDocumentCharEnd: targetIndex >= 0 ? documentOffset + targetIndex + 1 : targetIndex,
    highlightCharStart: highlightCharStart,
    highlightCharEnd: highlightCharEnd,
    highlightText: highlightText,
    sourceTokenBefore: snapshotAnchor(sourceAround.before),
    sourceTokenAt: snapshotAnchor(sourceAround.at),
    sourceTokenAfter: snapshotAnchor(sourceAround.after),
    targetTokenBefore: snapshotAnchor(targetAround.before),
    targetTokenAt: snapshotAnchor(targetAround.at),
    targetTokenAfter: snapshotAnchor(targetAround.after),
    highlightAnchorTarget: snapshotAnchor(highlightAnchor)
  };
}
function buildDeleteRangeCandidates(suggestion) {
  var _suggestion$meta;
  var ranges = [];
  var meta = suggestion === null || suggestion === void 0 || (_suggestion$meta = suggestion.meta) === null || _suggestion$meta === void 0 ? void 0 : _suggestion$meta.anchor;
  if (!meta) return ranges;
  var addRange = function addRange(start, end, snippet) {
    if (!Number.isFinite(start) || start < 0) return;
    var safeEnd = Number.isFinite(end) && end > start ? end : start + 1;
    ranges.push({
      start: start,
      end: safeEnd,
      snippet: snippet
    });
  };
  addRange(meta.highlightCharStart, meta.highlightCharEnd, meta.highlightText);
  addRange(meta.charStart, meta.charEnd, meta.highlightText);
  if (meta.highlightAnchorTarget) {
    addRange(meta.highlightAnchorTarget.charStart, meta.highlightAnchorTarget.charEnd, meta.highlightAnchorTarget.tokenText);
  }
  var charHint = suggestion === null || suggestion === void 0 ? void 0 : suggestion.charHint;
  addRange(charHint === null || charHint === void 0 ? void 0 : charHint.start, charHint === null || charHint === void 0 ? void 0 : charHint.end, meta.highlightText);
  return ranges;
}
function buildInsertRangeCandidates(suggestion) {
  var _suggestion$meta2;
  var ranges = [];
  var meta = suggestion === null || suggestion === void 0 || (_suggestion$meta2 = suggestion.meta) === null || _suggestion$meta2 === void 0 ? void 0 : _suggestion$meta2.anchor;
  if (!meta) return ranges;
  var addRange = function addRange(start, end, snippet) {
    if (!Number.isFinite(start) || start < 0) return;
    var safeEnd = Number.isFinite(end) && end > start ? end : start + 1;
    ranges.push({
      start: start,
      end: safeEnd,
      snippet: snippet
    });
  };
  var addAnchor = function addAnchor(anchor) {
    if (!anchor) return;
    addRange(anchor.charStart, anchor.charEnd, anchor.tokenText);
  };
  addRange(meta.highlightCharStart, meta.highlightCharEnd, meta.highlightText);
  addRange(meta.targetCharStart, meta.targetCharEnd, meta.highlightText);
  addRange(meta.charStart, meta.charEnd, meta.highlightText);
  var charHint = suggestion === null || suggestion === void 0 ? void 0 : suggestion.charHint;
  addRange(charHint === null || charHint === void 0 ? void 0 : charHint.start, charHint === null || charHint === void 0 ? void 0 : charHint.end, meta.highlightText);
  addAnchor(meta.highlightAnchorTarget);
  addAnchor(meta.sourceTokenAt);
  addAnchor(meta.targetTokenAt);
  addAnchor(meta.sourceTokenBefore);
  addAnchor(meta.targetTokenBefore);
  return ranges;
}

// Vstavi vejico na podlagi sidra
function insertCommaAt(_x13, _x14, _x15, _x16, _x17) {
  return _insertCommaAt.apply(this, arguments);
} // Po potrebi dodaj presledek po vejici (razen pred narekovaji ali števkami)
function _insertCommaAt() {
  _insertCommaAt = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(context, paragraph, original, corrected, atCorrectedPos) {
    var _makeAnchor, left, right, pr, m, after, _m, before;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          _makeAnchor = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.makeAnchor)(corrected, atCorrectedPos), left = _makeAnchor.left, right = _makeAnchor.right;
          pr = paragraph.getRange();
          if (!(left.length > 0)) {
            _context5.n = 3;
            break;
          }
          m = pr.search(left, {
            matchCase: false,
            matchWholeWord: false
          });
          m.load("items");
          _context5.n = 1;
          return context.sync();
        case 1:
          if (m.items.length) {
            _context5.n = 2;
            break;
          }
          warn("insert: left anchor not found");
          return _context5.a(2);
        case 2:
          after = m.items[0].getRange("After");
          after.insertText(",", Word.InsertLocation.before);
          _context5.n = 7;
          break;
        case 3:
          if (right) {
            _context5.n = 4;
            break;
          }
          warn("insert: no right anchor at paragraph start");
          return _context5.a(2);
        case 4:
          _m = pr.search(right, {
            matchCase: false,
            matchWholeWord: false
          });
          _m.load("items");
          _context5.n = 5;
          return context.sync();
        case 5:
          if (_m.items.length) {
            _context5.n = 6;
            break;
          }
          warn("insert: right anchor not found");
          return _context5.a(2);
        case 6:
          before = _m.items[0].getRange("Before");
          before.insertText(",", Word.InsertLocation.before);
        case 7:
          return _context5.a(2);
      }
    }, _callee5);
  }));
  return _insertCommaAt.apply(this, arguments);
}
function ensureSpaceAfterComma(_x18, _x19, _x20, _x21) {
  return _ensureSpaceAfterComma.apply(this, arguments);
} // Briši samo znak vejice
function _ensureSpaceAfterComma() {
  _ensureSpaceAfterComma = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(context, paragraph, corrected, atCorrectedPos) {
    var next, _makeAnchor2, left, right, pr, m, beforeRight, _m2, before;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          next = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.charAtSafe)(corrected, atCorrectedPos + 1);
          if (!(!next || /\s/.test(next) || _engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(next) || (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(next))) {
            _context6.n = 1;
            break;
          }
          return _context6.a(2);
        case 1:
          _makeAnchor2 = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.makeAnchor)(corrected, atCorrectedPos + 1), left = _makeAnchor2.left, right = _makeAnchor2.right;
          pr = paragraph.getRange();
          if (!(left.length > 0)) {
            _context6.n = 4;
            break;
          }
          m = pr.search(left, {
            matchCase: false,
            matchWholeWord: false
          });
          m.load("items");
          _context6.n = 2;
          return context.sync();
        case 2:
          if (m.items.length) {
            _context6.n = 3;
            break;
          }
          warn("space-after: left anchor not found");
          return _context6.a(2);
        case 3:
          beforeRight = m.items[0].getRange("Before");
          beforeRight.insertText(" ", Word.InsertLocation.before);
          _context6.n = 7;
          break;
        case 4:
          if (!(right.length > 0)) {
            _context6.n = 7;
            break;
          }
          _m2 = pr.search(right, {
            matchCase: false,
            matchWholeWord: false
          });
          _m2.load("items");
          _context6.n = 5;
          return context.sync();
        case 5:
          if (_m2.items.length) {
            _context6.n = 6;
            break;
          }
          warn("space-after: right anchor not found");
          return _context6.a(2);
        case 6:
          before = _m2.items[0].getRange("Before");
          before.insertText(" ", Word.InsertLocation.before);
        case 7:
          return _context6.a(2);
      }
    }, _callee6);
  }));
  return _ensureSpaceAfterComma.apply(this, arguments);
}
function deleteCommaAt(_x22, _x23, _x24, _x25) {
  return _deleteCommaAt.apply(this, arguments);
}
function _deleteCommaAt() {
  _deleteCommaAt = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(context, paragraph, original, atOriginalPos) {
    var pr, ordinal, i, matches, idx;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.n) {
        case 0:
          pr = paragraph.getRange();
          ordinal = 0;
          for (i = 0; i <= atOriginalPos && i < original.length; i++) {
            if (original[i] === ",") ordinal++;
          }
          if (!(ordinal === 0)) {
            _context7.n = 1;
            break;
          }
          warn("delete: no comma found in original at pos", atOriginalPos);
          return _context7.a(2);
        case 1:
          matches = pr.search(",", {
            matchCase: false,
            matchWholeWord: false
          });
          matches.load("items");
          _context7.n = 2;
          return context.sync();
        case 2:
          idx = ordinal - 1;
          if (!(idx >= matches.items.length)) {
            _context7.n = 3;
            break;
          }
          warn("delete: comma ordinal out of range", ordinal, "/", matches.items.length);
          return _context7.a(2);
        case 3:
          matches.items[idx].insertText("", Word.InsertLocation.replace);
        case 4:
          return _context7.a(2);
      }
    }, _callee7);
  }));
  return _deleteCommaAt.apply(this, arguments);
}
function highlightSuggestionOnline(_x26, _x27, _x28) {
  return _highlightSuggestionOnline.apply(this, arguments);
}
function _highlightSuggestionOnline() {
  _highlightSuggestionOnline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(context, paragraph, suggestion) {
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.n) {
        case 0:
          if (suggestion) {
            _context8.n = 1;
            break;
          }
          return _context8.a(2, false);
        case 1:
          if (!(suggestion.kind === "delete")) {
            _context8.n = 2;
            break;
          }
          return _context8.a(2, highlightDeleteSuggestion(context, paragraph, suggestion));
        case 2:
          return _context8.a(2, highlightInsertSuggestion(context, paragraph, suggestion));
      }
    }, _callee8);
  }));
  return _highlightSuggestionOnline.apply(this, arguments);
}
function countCommasUpTo(text, pos) {
  var count = 0;
  for (var i = 0; i <= pos && i < text.length; i++) {
    if (text[i] === ",") count++;
  }
  return count;
}
function highlightDeleteSuggestion(_x29, _x30, _x31) {
  return _highlightDeleteSuggestion.apply(this, arguments);
}
function _highlightDeleteSuggestion() {
  _highlightDeleteSuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(context, paragraph, suggestion) {
    var _ref13, _suggestion$meta$orig, _suggestion$meta9, _suggestion$meta0, _ref14, _ref15, _suggestion$charHint$2, _suggestion$charHint3, _suggestion$meta1, _ref16, _suggestion$charHint$3, _suggestion$charHint4, _ref17, _meta$highlightText, _suggestion$meta10;
    var paragraphText, meta, entry, charStart, charEnd, highlightText, targetRange, _suggestion$meta11;
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.n) {
        case 0:
          paragraphText = (_ref13 = (_suggestion$meta$orig = (_suggestion$meta9 = suggestion.meta) === null || _suggestion$meta9 === void 0 ? void 0 : _suggestion$meta9.originalText) !== null && _suggestion$meta$orig !== void 0 ? _suggestion$meta$orig : paragraph.text) !== null && _ref13 !== void 0 ? _ref13 : "";
          meta = ((_suggestion$meta0 = suggestion.meta) === null || _suggestion$meta0 === void 0 ? void 0 : _suggestion$meta0.anchor) || {};
          entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
          charStart = (_ref14 = (_ref15 = (_suggestion$charHint$2 = (_suggestion$charHint3 = suggestion.charHint) === null || _suggestion$charHint3 === void 0 ? void 0 : _suggestion$charHint3.start) !== null && _suggestion$charHint$2 !== void 0 ? _suggestion$charHint$2 : meta.charStart) !== null && _ref15 !== void 0 ? _ref15 : (_suggestion$meta1 = suggestion.meta) === null || _suggestion$meta1 === void 0 || (_suggestion$meta1 = _suggestion$meta1.op) === null || _suggestion$meta1 === void 0 ? void 0 : _suggestion$meta1.originalPos) !== null && _ref14 !== void 0 ? _ref14 : -1;
          charEnd = (_ref16 = (_suggestion$charHint$3 = (_suggestion$charHint4 = suggestion.charHint) === null || _suggestion$charHint4 === void 0 ? void 0 : _suggestion$charHint4.end) !== null && _suggestion$charHint$3 !== void 0 ? _suggestion$charHint$3 : meta.charEnd) !== null && _ref16 !== void 0 ? _ref16 : typeof charStart === "number" && charStart >= 0 ? charStart + 1 : charStart;
          highlightText = (_ref17 = (_meta$highlightText = meta.highlightText) !== null && _meta$highlightText !== void 0 ? _meta$highlightText : (_suggestion$meta10 = suggestion.meta) === null || _suggestion$meta10 === void 0 ? void 0 : _suggestion$meta10.highlightText) !== null && _ref17 !== void 0 ? _ref17 : ",";
          targetRange = null;
          if (!(Number.isFinite(charStart) && charStart >= 0)) {
            _context9.n = 2;
            break;
          }
          _context9.n = 1;
          return getRangeForAnchorSpan(context, paragraph, entry, charStart, charEnd, "highlight-delete", highlightText);
        case 1:
          targetRange = _context9.v;
        case 2:
          if (targetRange) {
            _context9.n = 4;
            break;
          }
          _context9.n = 3;
          return findCommaRangeByOrdinal(context, paragraph, paragraphText, (_suggestion$meta11 = suggestion.meta) === null || _suggestion$meta11 === void 0 ? void 0 : _suggestion$meta11.op);
        case 3:
          targetRange = _context9.v;
          if (targetRange) {
            _context9.n = 4;
            break;
          }
          return _context9.a(2, false);
        case 4:
          targetRange.font.highlightColor = HIGHLIGHT_DELETE;
          context.trackedObjects.add(targetRange);
          suggestion.highlightRange = targetRange;
          addPendingSuggestionOnline(suggestion);
          return _context9.a(2, true);
      }
    }, _callee9);
  }));
  return _highlightDeleteSuggestion.apply(this, arguments);
}
function highlightInsertSuggestion(_x32, _x33, _x34) {
  return _highlightInsertSuggestion.apply(this, arguments);
}
function _highlightInsertSuggestion() {
  _highlightInsertSuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(context, paragraph, suggestion) {
    var _ref18, _suggestion$meta$corr, _suggestion$meta12, _suggestion$meta13, _suggestion$snippets$, _suggestion$snippets, _suggestion$meta$op$p, _suggestion$meta14, _suggestion$snippets$2, _suggestion$snippets2, _suggestion$meta$op$p2, _suggestion$meta15;
    var corrected, anchor, entry, rawLeft, rawRight, lastWord, leftContext, searchOpts, range, resolveAnchorEnd, highlightAnchorCandidate, anchorEnd, _anchor$highlightAnch, _anchor$sourceTokenAt, _anchor$targetTokenAt, metaEndCandidate, metaEnd, wordSearch, leftSearch, rightSnippet, rightSearch;
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.n) {
        case 0:
          corrected = (_ref18 = (_suggestion$meta$corr = (_suggestion$meta12 = suggestion.meta) === null || _suggestion$meta12 === void 0 ? void 0 : _suggestion$meta12.correctedText) !== null && _suggestion$meta$corr !== void 0 ? _suggestion$meta$corr : paragraph.text) !== null && _ref18 !== void 0 ? _ref18 : "";
          anchor = ((_suggestion$meta13 = suggestion.meta) === null || _suggestion$meta13 === void 0 ? void 0 : _suggestion$meta13.anchor) || {};
          entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
          rawLeft = (_suggestion$snippets$ = (_suggestion$snippets = suggestion.snippets) === null || _suggestion$snippets === void 0 ? void 0 : _suggestion$snippets.leftSnippet) !== null && _suggestion$snippets$ !== void 0 ? _suggestion$snippets$ : corrected.slice(0, (_suggestion$meta$op$p = (_suggestion$meta14 = suggestion.meta) === null || _suggestion$meta14 === void 0 || (_suggestion$meta14 = _suggestion$meta14.op) === null || _suggestion$meta14 === void 0 ? void 0 : _suggestion$meta14.pos) !== null && _suggestion$meta$op$p !== void 0 ? _suggestion$meta$op$p : 0);
          rawRight = (_suggestion$snippets$2 = (_suggestion$snippets2 = suggestion.snippets) === null || _suggestion$snippets2 === void 0 ? void 0 : _suggestion$snippets2.rightSnippet) !== null && _suggestion$snippets$2 !== void 0 ? _suggestion$snippets$2 : corrected.slice((_suggestion$meta$op$p2 = (_suggestion$meta15 = suggestion.meta) === null || _suggestion$meta15 === void 0 || (_suggestion$meta15 = _suggestion$meta15.op) === null || _suggestion$meta15 === void 0 ? void 0 : _suggestion$meta15.pos) !== null && _suggestion$meta$op$p2 !== void 0 ? _suggestion$meta$op$p2 : 0);
          lastWord = extractLastWord(rawLeft || "");
          leftContext = (rawLeft || "").slice(-20).replace(/[\r\n]+/g, " ");
          searchOpts = {
            matchCase: false,
            matchWholeWord: false
          };
          range = null;
          resolveAnchorEnd = function resolveAnchorEnd(candidate) {
            if (!Number.isFinite(candidate === null || candidate === void 0 ? void 0 : candidate.charStart) || candidate.charStart < 0) return null;
            if (Number.isFinite(candidate === null || candidate === void 0 ? void 0 : candidate.charEnd) && candidate.charEnd > candidate.charStart) {
              return candidate.charEnd;
            }
            if (typeof (candidate === null || candidate === void 0 ? void 0 : candidate.tokenText) === "string" && candidate.tokenText.length > 0) {
              return candidate.charStart + candidate.tokenText.length;
            }
            return candidate.charStart + 1;
          };
          highlightAnchorCandidate = [anchor.highlightAnchorTarget, anchor.sourceTokenAt, anchor.targetTokenAt, anchor.sourceTokenBefore, anchor.targetTokenBefore].find(function (candidate) {
            return Number.isFinite(candidate === null || candidate === void 0 ? void 0 : candidate.charStart) && candidate.charStart >= 0;
          });
          if (!highlightAnchorCandidate) {
            _context0.n = 2;
            break;
          }
          anchorEnd = resolveAnchorEnd(highlightAnchorCandidate);
          _context0.n = 1;
          return getRangeForAnchorSpan(context, paragraph, entry, highlightAnchorCandidate.charStart, anchorEnd, "highlight-insert-anchor", highlightAnchorCandidate.tokenText || anchor.highlightText);
        case 1:
          range = _context0.v;
        case 2:
          if (!(!range && Number.isFinite(anchor.highlightCharStart) && anchor.highlightCharStart >= 0)) {
            _context0.n = 4;
            break;
          }
          metaEndCandidate = {
            charStart: anchor.highlightCharStart,
            charEnd: anchor.highlightCharEnd,
            tokenText: ((_anchor$highlightAnch = anchor.highlightAnchorTarget) === null || _anchor$highlightAnch === void 0 ? void 0 : _anchor$highlightAnch.tokenText) || ((_anchor$sourceTokenAt = anchor.sourceTokenAt) === null || _anchor$sourceTokenAt === void 0 ? void 0 : _anchor$sourceTokenAt.tokenText) || ((_anchor$targetTokenAt = anchor.targetTokenAt) === null || _anchor$targetTokenAt === void 0 ? void 0 : _anchor$targetTokenAt.tokenText) || anchor.highlightText
          };
          metaEnd = resolveAnchorEnd(metaEndCandidate);
          _context0.n = 3;
          return getRangeForAnchorSpan(context, paragraph, entry, anchor.highlightCharStart, metaEnd, "highlight-insert-meta", anchor.highlightText);
        case 3:
          range = _context0.v;
        case 4:
          if (!(!range && lastWord)) {
            _context0.n = 6;
            break;
          }
          wordSearch = paragraph.getRange().search(lastWord, {
            matchCase: false,
            matchWholeWord: true
          });
          wordSearch.load("items");
          _context0.n = 5;
          return context.sync();
        case 5:
          if (wordSearch.items.length) {
            range = wordSearch.items[wordSearch.items.length - 1];
          }
        case 6:
          if (!(!range && leftContext && leftContext.trim())) {
            _context0.n = 8;
            break;
          }
          leftSearch = paragraph.getRange().search(leftContext.trim(), searchOpts);
          leftSearch.load("items");
          _context0.n = 7;
          return context.sync();
        case 7:
          if (leftSearch.items.length) {
            range = leftSearch.items[leftSearch.items.length - 1];
          }
        case 8:
          if (range) {
            _context0.n = 10;
            break;
          }
          rightSnippet = (rawRight || "").replace(/,/g, "").trim();
          rightSnippet = rightSnippet.slice(0, 8);
          if (!rightSnippet) {
            _context0.n = 10;
            break;
          }
          rightSearch = paragraph.getRange().search(rightSnippet, searchOpts);
          rightSearch.load("items");
          _context0.n = 9;
          return context.sync();
        case 9:
          if (rightSearch.items.length) {
            range = rightSearch.items[0];
          }
        case 10:
          if (range) {
            _context0.n = 11;
            break;
          }
          return _context0.a(2, false);
        case 11:
          try {
            range = range.getRange("Content");
          } catch (err) {
            warn("highlight insert: failed to focus range", err);
          }
          range.font.highlightColor = HIGHLIGHT_INSERT;
          context.trackedObjects.add(range);
          suggestion.highlightRange = range;
          addPendingSuggestionOnline(suggestion);
          return _context0.a(2, true);
      }
    }, _callee0);
  }));
  return _highlightInsertSuggestion.apply(this, arguments);
}
function findCommaRangeByOrdinal(_x35, _x36, _x37, _x38) {
  return _findCommaRangeByOrdinal.apply(this, arguments);
}
function _findCommaRangeByOrdinal() {
  _findCommaRangeByOrdinal = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(context, paragraph, original, op) {
    var ordinal, commaSearch;
    return _regenerator().w(function (_context1) {
      while (1) switch (_context1.n) {
        case 0:
          ordinal = countCommasUpTo(original, op.pos);
          if (!(ordinal <= 0)) {
            _context1.n = 1;
            break;
          }
          warn("highlight delete: no comma ordinal", op);
          return _context1.a(2, null);
        case 1:
          commaSearch = paragraph.getRange().search(",", {
            matchCase: false,
            matchWholeWord: false
          });
          commaSearch.load("items");
          _context1.n = 2;
          return context.sync();
        case 2:
          if (!(!commaSearch.items.length || ordinal > commaSearch.items.length)) {
            _context1.n = 3;
            break;
          }
          warn("highlight delete: comma search out of range");
          return _context1.a(2, null);
        case 3:
          return _context1.a(2, commaSearch.items[ordinal - 1]);
      }
    }, _callee1);
  }));
  return _findCommaRangeByOrdinal.apply(this, arguments);
}
function extractLastWord(text) {
  var match = text.match(/((?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])+)(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*$/);
  return match ? match[1] : "";
}
function tryApplyDeleteUsingMetadata(_x39, _x40, _x41) {
  return _tryApplyDeleteUsingMetadata.apply(this, arguments);
}
function _tryApplyDeleteUsingMetadata() {
  _tryApplyDeleteUsingMetadata = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(context, paragraph, suggestion) {
    var _suggestion$meta16, _ref19, _ref20, _meta$sourceTokenAt2, _ref21, _ref22, _ref23, _suggestion$charHint$4, _suggestion$charHint5, _suggestion$meta17, _ref24, _suggestion$charHint$5, _suggestion$charHint6;
    var meta, entry, sourceAnchor, charStart, fallbackEndFromToken, charEnd, _entry$originalText3, liveText, sourceText, mappedStart, commaIndex, delta, left, right, commaRange;
    return _regenerator().w(function (_context10) {
      while (1) switch (_context10.n) {
        case 0:
          meta = suggestion === null || suggestion === void 0 || (_suggestion$meta16 = suggestion.meta) === null || _suggestion$meta16 === void 0 ? void 0 : _suggestion$meta16.anchor;
          if (meta) {
            _context10.n = 1;
            break;
          }
          return _context10.a(2, false);
        case 1:
          entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
          sourceAnchor = (_ref19 = (_ref20 = (_meta$sourceTokenAt2 = meta.sourceTokenAt) !== null && _meta$sourceTokenAt2 !== void 0 ? _meta$sourceTokenAt2 : meta.sourceTokenBefore) !== null && _ref20 !== void 0 ? _ref20 : meta.sourceTokenAfter) !== null && _ref19 !== void 0 ? _ref19 : meta.highlightAnchorTarget;
          charStart = (_ref21 = (_ref22 = (_ref23 = (_suggestion$charHint$4 = (_suggestion$charHint5 = suggestion.charHint) === null || _suggestion$charHint5 === void 0 ? void 0 : _suggestion$charHint5.start) !== null && _suggestion$charHint$4 !== void 0 ? _suggestion$charHint$4 : meta.charStart) !== null && _ref23 !== void 0 ? _ref23 : sourceAnchor === null || sourceAnchor === void 0 ? void 0 : sourceAnchor.charStart) !== null && _ref22 !== void 0 ? _ref22 : (_suggestion$meta17 = suggestion.meta) === null || _suggestion$meta17 === void 0 || (_suggestion$meta17 = _suggestion$meta17.op) === null || _suggestion$meta17 === void 0 ? void 0 : _suggestion$meta17.originalPos) !== null && _ref21 !== void 0 ? _ref21 : -1;
          fallbackEndFromToken = typeof (sourceAnchor === null || sourceAnchor === void 0 ? void 0 : sourceAnchor.tokenText) === "string" && sourceAnchor.tokenText.length > 0 ? charStart + sourceAnchor.tokenText.length : charStart + 1;
          charEnd = (_ref24 = (_suggestion$charHint$5 = (_suggestion$charHint6 = suggestion.charHint) === null || _suggestion$charHint6 === void 0 ? void 0 : _suggestion$charHint6.end) !== null && _suggestion$charHint$5 !== void 0 ? _suggestion$charHint$5 : meta.charEnd) !== null && _ref24 !== void 0 ? _ref24 : fallbackEndFromToken;
          if (!(Number.isFinite(charStart) && charStart >= 0)) {
            _context10.n = 8;
            break;
          }
          paragraph.load("text");
          _context10.n = 2;
          return context.sync();
        case 2:
          liveText = paragraph.text || "";
          sourceText = (_entry$originalText3 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText3 !== void 0 ? _entry$originalText3 : liveText;
          mappedStart = mapIndexAcrossCanonical(sourceText, liveText, charStart);
          commaIndex = -1;
          delta = 0;
        case 3:
          if (!(delta <= 3)) {
            _context10.n = 6;
            break;
          }
          left = mappedStart - delta;
          right = mappedStart + delta;
          if (!(left >= 0 && liveText[left] === ",")) {
            _context10.n = 4;
            break;
          }
          commaIndex = left;
          return _context10.a(3, 6);
        case 4:
          if (!(right < liveText.length && liveText[right] === ",")) {
            _context10.n = 5;
            break;
          }
          commaIndex = right;
          return _context10.a(3, 6);
        case 5:
          delta++;
          _context10.n = 3;
          break;
        case 6:
          if (!(commaIndex >= 0)) {
            _context10.n = 8;
            break;
          }
          _context10.n = 7;
          return getRangeForAnchorSpan(context, paragraph, entry, commaIndex, commaIndex + 1, "apply-delete-comma", ",");
        case 7:
          commaRange = _context10.v;
          if (!commaRange) {
            _context10.n = 8;
            break;
          }
          commaRange.insertText("", Word.InsertLocation.replace);
          return _context10.a(2, true);
        case 8:
          return _context10.a(2, false);
      }
    }, _callee10);
  }));
  return _tryApplyDeleteUsingMetadata.apply(this, arguments);
}
function tryApplyDeleteUsingHighlight(_x42, _x43, _x44) {
  return _tryApplyDeleteUsingHighlight.apply(this, arguments);
}
function _tryApplyDeleteUsingHighlight() {
  _tryApplyDeleteUsingHighlight = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(context, paragraph, suggestion) {
    var entry, tryByRange, candidates, i, candidate, safeEnd, span, _t4;
    return _regenerator().w(function (_context12) {
      while (1) switch (_context12.p = _context12.n) {
        case 0:
          entry = anchorProvider.getAnchorsForParagraph(suggestion === null || suggestion === void 0 ? void 0 : suggestion.paragraphIndex);
          tryByRange = /*#__PURE__*/function () {
            var _ref25 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(range) {
              var _t3;
              return _regenerator().w(function (_context11) {
                while (1) switch (_context11.p = _context11.n) {
                  case 0:
                    if (range) {
                      _context11.n = 1;
                      break;
                    }
                    return _context11.a(2, false);
                  case 1:
                    _context11.p = 1;
                    range.insertText("", Word.InsertLocation.replace);
                    return _context11.a(2, true);
                  case 2:
                    _context11.p = 2;
                    _t3 = _context11.v;
                    warn("apply delete: highlight span removal failed", _t3);
                    return _context11.a(2, false);
                }
              }, _callee11, null, [[1, 2]]);
            }));
            return function tryByRange(_x74) {
              return _ref25.apply(this, arguments);
            };
          }();
          candidates = buildDeleteRangeCandidates(suggestion);
          i = 0;
        case 1:
          if (!(i < candidates.length)) {
            _context12.n = 9;
            break;
          }
          candidate = candidates[i];
          if (!(!Number.isFinite(candidate.start) || candidate.start < 0)) {
            _context12.n = 2;
            break;
          }
          return _context12.a(3, 8);
        case 2:
          safeEnd = Number.isFinite(candidate.end) && candidate.end > candidate.start ? candidate.end : candidate.start + 1;
          span = null;
          _context12.p = 3;
          _context12.n = 4;
          return getRangeForAnchorSpan(context, paragraph, entry, candidate.start, safeEnd, "apply-delete-highlight-".concat(i), candidate.snippet);
        case 4:
          span = _context12.v;
          _context12.n = 6;
          break;
        case 5:
          _context12.p = 5;
          _t4 = _context12.v;
          warn("apply delete: candidate span lookup failed", _t4);
          return _context12.a(3, 8);
        case 6:
          _context12.n = 7;
          return tryByRange(span);
        case 7:
          if (!_context12.v) {
            _context12.n = 8;
            break;
          }
          return _context12.a(2, true);
        case 8:
          i++;
          _context12.n = 1;
          break;
        case 9:
          return _context12.a(2, false);
      }
    }, _callee12, null, [[3, 5]]);
  }));
  return _tryApplyDeleteUsingHighlight.apply(this, arguments);
}
function applyDeleteSuggestionLegacy(_x45, _x46, _x47) {
  return _applyDeleteSuggestionLegacy.apply(this, arguments);
}
function _applyDeleteSuggestionLegacy() {
  _applyDeleteSuggestionLegacy = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(context, paragraph, suggestion) {
    var _ref26, _ref27, _suggestion$meta$op$o2, _suggestion$meta18, _suggestion$meta19, _suggestion$charHint7;
    var pos, ordinal, commaSearch, idx;
    return _regenerator().w(function (_context13) {
      while (1) switch (_context13.n) {
        case 0:
          pos = (_ref26 = (_ref27 = (_suggestion$meta$op$o2 = (_suggestion$meta18 = suggestion.meta) === null || _suggestion$meta18 === void 0 || (_suggestion$meta18 = _suggestion$meta18.op) === null || _suggestion$meta18 === void 0 ? void 0 : _suggestion$meta18.originalPos) !== null && _suggestion$meta$op$o2 !== void 0 ? _suggestion$meta$op$o2 : (_suggestion$meta19 = suggestion.meta) === null || _suggestion$meta19 === void 0 || (_suggestion$meta19 = _suggestion$meta19.op) === null || _suggestion$meta19 === void 0 ? void 0 : _suggestion$meta19.pos) !== null && _ref27 !== void 0 ? _ref27 : (_suggestion$charHint7 = suggestion.charHint) === null || _suggestion$charHint7 === void 0 ? void 0 : _suggestion$charHint7.start) !== null && _ref26 !== void 0 ? _ref26 : 0;
          ordinal = countCommasUpTo(paragraph.text || "", pos);
          if (!(ordinal <= 0)) {
            _context13.n = 1;
            break;
          }
          warn("apply delete: no ordinal");
          return _context13.a(2, false);
        case 1:
          commaSearch = paragraph.getRange().search(",", {
            matchCase: false,
            matchWholeWord: false
          });
          commaSearch.load("items");
          _context13.n = 2;
          return context.sync();
        case 2:
          idx = ordinal - 1;
          if (!(!commaSearch.items.length || idx >= commaSearch.items.length)) {
            _context13.n = 3;
            break;
          }
          warn("apply delete: ordinal out of range");
          return _context13.a(2, false);
        case 3:
          commaSearch.items[idx].insertText("", Word.InsertLocation.replace);
          return _context13.a(2, true);
      }
    }, _callee13);
  }));
  return _applyDeleteSuggestionLegacy.apply(this, arguments);
}
function applyDeleteSuggestion(_x48, _x49, _x50) {
  return _applyDeleteSuggestion.apply(this, arguments);
}
function _applyDeleteSuggestion() {
  _applyDeleteSuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14(context, paragraph, suggestion) {
    return _regenerator().w(function (_context14) {
      while (1) switch (_context14.n) {
        case 0:
          _context14.n = 1;
          return tryApplyDeleteUsingMetadata(context, paragraph, suggestion);
        case 1:
          return _context14.a(2, _context14.v);
      }
    }, _callee14);
  }));
  return _applyDeleteSuggestion.apply(this, arguments);
}
function findTokenRangeForAnchor(_x51, _x52, _x53) {
  return _findTokenRangeForAnchor.apply(this, arguments);
}
function _findTokenRangeForAnchor() {
  _findTokenRangeForAnchor = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16(context, paragraph, anchorSnapshot) {
    var fallbackOrdinal, tryFind, range, trimmed;
    return _regenerator().w(function (_context16) {
      while (1) switch (_context16.n) {
        case 0:
          if (anchorSnapshot !== null && anchorSnapshot !== void 0 && anchorSnapshot.tokenText) {
            _context16.n = 1;
            break;
          }
          return _context16.a(2, null);
        case 1:
          fallbackOrdinal = typeof anchorSnapshot.textOccurrence === "number" ? anchorSnapshot.textOccurrence : typeof anchorSnapshot.tokenIndex === "number" ? anchorSnapshot.tokenIndex : 0;
          tryFind = /*#__PURE__*/function () {
            var _ref28 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15(text, ordinalHint) {
              var wholeWord, matches, ordinal, targetIndex;
              return _regenerator().w(function (_context15) {
                while (1) switch (_context15.n) {
                  case 0:
                    if (text) {
                      _context15.n = 1;
                      break;
                    }
                    return _context15.a(2, null);
                  case 1:
                    wholeWord = WORD_CHAR_REGEX.test(text) && !/(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(text);
                    matches = paragraph.getRange().search(text, {
                      matchCase: false,
                      matchWholeWord: wholeWord
                    });
                    matches.load("items");
                    _context15.n = 2;
                    return context.sync();
                  case 2:
                    if (matches.items.length) {
                      _context15.n = 3;
                      break;
                    }
                    return _context15.a(2, null);
                  case 3:
                    ordinal = typeof ordinalHint === "number" ? ordinalHint : typeof anchorSnapshot.tokenIndex === "number" ? anchorSnapshot.tokenIndex : fallbackOrdinal;
                    targetIndex = Math.max(0, Math.min(ordinal, matches.items.length - 1));
                    return _context15.a(2, matches.items[targetIndex]);
                }
              }, _callee15);
            }));
            return function tryFind(_x75, _x76) {
              return _ref28.apply(this, arguments);
            };
          }();
          _context16.n = 2;
          return tryFind(anchorSnapshot.tokenText, anchorSnapshot.textOccurrence);
        case 2:
          range = _context16.v;
          if (!range) {
            _context16.n = 3;
            break;
          }
          return _context16.a(2, range);
        case 3:
          trimmed = anchorSnapshot.tokenText.trim();
          if (!(trimmed && trimmed !== anchorSnapshot.tokenText)) {
            _context16.n = 5;
            break;
          }
          _context16.n = 4;
          return tryFind(trimmed, anchorSnapshot.trimmedTextOccurrence);
        case 4:
          range = _context16.v;
          if (!range) {
            _context16.n = 5;
            break;
          }
          return _context16.a(2, range);
        case 5:
          return _context16.a(2, null);
      }
    }, _callee16);
  }));
  return _findTokenRangeForAnchor.apply(this, arguments);
}
function selectInsertAnchor(meta) {
  if (!meta) return null;
  var candidates = [meta.sourceTokenAfter ? {
    anchor: meta.sourceTokenAfter,
    location: Word.InsertLocation.before
  } : null, meta.sourceTokenAt ? {
    anchor: meta.sourceTokenAt,
    location: Word.InsertLocation.after
  } : null, meta.sourceTokenBefore ? {
    anchor: meta.sourceTokenBefore,
    location: Word.InsertLocation.after
  } : null, meta.targetTokenBefore ? {
    anchor: meta.targetTokenBefore,
    location: Word.InsertLocation.before
  } : null, meta.targetTokenAt ? {
    anchor: meta.targetTokenAt,
    location: Word.InsertLocation.after
  } : null].filter(Boolean);
  var _iterator2 = _createForOfIteratorHelper(candidates),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _candidate$anchor;
      var candidate = _step2.value;
      if (candidate !== null && candidate !== void 0 && (_candidate$anchor = candidate.anchor) !== null && _candidate$anchor !== void 0 && _candidate$anchor.matched && Number.isFinite(candidate.anchor.charStart) && candidate.anchor.charStart >= 0) {
        return candidate;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return null;
}
function tryApplyInsertUsingMetadata(_x54, _x55, _x56) {
  return _tryApplyInsertUsingMetadata.apply(this, arguments);
}
function _tryApplyInsertUsingMetadata() {
  _tryApplyInsertUsingMetadata = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee21(context, paragraph, suggestion) {
    var _suggestion$meta20, _ref33, _ref34, _ref35, _meta$highlightAnchor, _suggestion$charHint$6, _suggestion$charHint8;
    var meta, entry, insertCommaAtChar, findTokenStartByHint, cleanWordToken, replaceGapBetweenAnchors, insertCommaAfterToken, insertCommaBeforeToken, anchor, anchorStart, anchorEnd, range, _meta$sourceTokenAfte2, _meta$sourceTokenBefo2, afterAnchor, beforeAnchor, _hasTokenAnchors, insertionCharStart, hasTokenAnchors, _t5, _t6;
    return _regenerator().w(function (_context21) {
      while (1) switch (_context21.p = _context21.n) {
        case 0:
          meta = suggestion === null || suggestion === void 0 || (_suggestion$meta20 = suggestion.meta) === null || _suggestion$meta20 === void 0 ? void 0 : _suggestion$meta20.anchor;
          if (meta) {
            _context21.n = 1;
            break;
          }
          return _context21.a(2, false);
        case 1:
          entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
          insertCommaAtChar = /*#__PURE__*/function () {
            var _ref29 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17(charIndex, traceLabel) {
              var text, insertionPos, trimStart, nextChar, prevChar, withFollowingSpace, commaText, replaceWhitespaceRange, insertRange;
              return _regenerator().w(function (_context17) {
                while (1) switch (_context17.n) {
                  case 0:
                    paragraph.load("text");
                    _context17.n = 1;
                    return context.sync();
                  case 1:
                    text = paragraph.text || "";
                    if (!(!Number.isFinite(charIndex) || charIndex < 0 || charIndex > text.length)) {
                      _context17.n = 2;
                      break;
                    }
                    return _context17.a(2, false);
                  case 2:
                    // Move insertion point to first non-space char to avoid creating "word ,next".
                    insertionPos = charIndex;
                    while (insertionPos < text.length && /\s/.test(text[insertionPos])) {
                      insertionPos++;
                    }
                    // Expand backwards over spaces so we can replace "   " with ", ".
                    trimStart = insertionPos;
                    while (trimStart > 0 && /\s/.test(text[trimStart - 1])) {
                      trimStart--;
                    }
                    nextChar = insertionPos < text.length ? text[insertionPos] : "";
                    prevChar = insertionPos > 0 ? text[insertionPos - 1] : "";
                    if (!(insertionPos > 0 && insertionPos < text.length && WORD_CHAR_REGEX.test(prevChar) && WORD_CHAR_REGEX.test(nextChar))) {
                      _context17.n = 3;
                      break;
                    }
                    warn("".concat(traceLabel, ": refusing in-word comma insertion"), {
                      insertionPos: insertionPos,
                      prevChar: prevChar,
                      nextChar: nextChar
                    });
                    return _context17.a(2, false);
                  case 3:
                    withFollowingSpace = nextChar && !/\s/.test(nextChar) && !_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(nextChar) && !(0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(nextChar);
                    commaText = withFollowingSpace ? ", " : ",";
                    if (!(trimStart < insertionPos)) {
                      _context17.n = 6;
                      break;
                    }
                    _context17.n = 4;
                    return getRangeForAnchorSpan(context, paragraph, entry, trimStart, insertionPos, "".concat(traceLabel, "-replace-whitespace"), text.slice(trimStart, insertionPos));
                  case 4:
                    replaceWhitespaceRange = _context17.v;
                    if (replaceWhitespaceRange) {
                      _context17.n = 5;
                      break;
                    }
                    return _context17.a(2, false);
                  case 5:
                    replaceWhitespaceRange.insertText(commaText, Word.InsertLocation.replace);
                    return _context17.a(2, true);
                  case 6:
                    _context17.n = 7;
                    return getRangeForAnchorSpan(context, paragraph, entry, insertionPos, Math.min(insertionPos + 1, text.length), "".concat(traceLabel, "-insert"), meta.highlightText);
                  case 7:
                    insertRange = _context17.v;
                    if (insertRange) {
                      _context17.n = 8;
                      break;
                    }
                    return _context17.a(2, false);
                  case 8:
                    insertRange.insertText(commaText, Word.InsertLocation.before);
                    return _context17.a(2, true);
                }
              }, _callee17);
            }));
            return function insertCommaAtChar(_x77, _x78) {
              return _ref29.apply(this, arguments);
            };
          }();
          findTokenStartByHint = function findTokenStartByHint(text, rawToken, hintIndex, occurrence) {
            var tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
            if (!tokenRaw || !text) return -1;
            var token = tokenRaw.replace(/^(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+|(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+$/g, "");
            // Only use token-based placement for clean whole words; otherwise fallback to char mapping.
            if (!token || /(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(token)) return -1;
            var safeOccurrence = Number.isFinite(occurrence) ? Math.max(0, Math.floor(occurrence)) : 0;
            var safeHint = Number.isFinite(hintIndex) ? Math.max(0, Math.floor(hintIndex)) : null;
            var tokenRegex = new RegExp("(^|[^\\p{L}\\d])(".concat(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ")(?=$|[^\\p{L}\\d])"), "gu");
            var positions = [];
            var match;
            while ((match = tokenRegex.exec(text)) !== null) {
              positions.push(match.index + match[1].length);
            }
            if (!positions.length) return -1;
            if (safeHint !== null) {
              var best = positions[0];
              var bestDist = Math.abs(positions[0] - safeHint);
              for (var i = 1; i < positions.length; i++) {
                var dist = Math.abs(positions[i] - safeHint);
                if (dist < bestDist) {
                  bestDist = dist;
                  best = positions[i];
                }
              }
              return best;
            }
            return positions[Math.min(safeOccurrence, positions.length - 1)];
          };
          cleanWordToken = function cleanWordToken(rawToken) {
            var tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
            var token = tokenRaw.replace(/^(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+|(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+$/g, "");
            if (!token || /(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(token)) return null;
            return token;
          };
          replaceGapBetweenAnchors = /*#__PURE__*/function () {
            var _ref30 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18(beforeAnchor, afterAnchor, traceLabel) {
              var _entry$originalText4;
              var liveText, originalText, beforeToken, afterToken, beforeHint, afterHint, beforeStart, afterStart, beforeEnd, gapText, insertRange, gapRange;
              return _regenerator().w(function (_context18) {
                while (1) switch (_context18.n) {
                  case 0:
                    if (!(!beforeAnchor || !afterAnchor)) {
                      _context18.n = 1;
                      break;
                    }
                    return _context18.a(2, false);
                  case 1:
                    paragraph.load("text");
                    _context18.n = 2;
                    return context.sync();
                  case 2:
                    liveText = paragraph.text || "";
                    originalText = (_entry$originalText4 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText4 !== void 0 ? _entry$originalText4 : "";
                    beforeToken = cleanWordToken(beforeAnchor.tokenText);
                    afterToken = cleanWordToken(afterAnchor.tokenText);
                    if (!(!beforeToken || !afterToken)) {
                      _context18.n = 3;
                      break;
                    }
                    return _context18.a(2, false);
                  case 3:
                    beforeHint = Number.isFinite(beforeAnchor.charEnd) ? mapIndexAcrossCanonical(originalText, liveText, beforeAnchor.charEnd) : null;
                    afterHint = Number.isFinite(afterAnchor.charStart) ? mapIndexAcrossCanonical(originalText, liveText, afterAnchor.charStart) : null;
                    beforeStart = findTokenStartByHint(liveText, beforeToken, beforeHint, beforeAnchor.textOccurrence);
                    afterStart = findTokenStartByHint(liveText, afterToken, afterHint, afterAnchor.textOccurrence);
                    if (!(beforeStart < 0 || afterStart < 0)) {
                      _context18.n = 4;
                      break;
                    }
                    return _context18.a(2, false);
                  case 4:
                    beforeEnd = beforeStart + beforeToken.length;
                    if (!(beforeEnd > afterStart)) {
                      _context18.n = 5;
                      break;
                    }
                    return _context18.a(2, false);
                  case 5:
                    gapText = liveText.slice(beforeEnd, afterStart);
                    if (!gapText.includes(",")) {
                      _context18.n = 6;
                      break;
                    }
                    return _context18.a(2, true);
                  case 6:
                    if (!/[^\s]/.test(gapText)) {
                      _context18.n = 7;
                      break;
                    }
                    return _context18.a(2, false);
                  case 7:
                    if (!(beforeEnd === afterStart)) {
                      _context18.n = 10;
                      break;
                    }
                    _context18.n = 8;
                    return getRangeForAnchorSpan(context, paragraph, entry, afterStart, Math.min(afterStart + 1, liveText.length), "".concat(traceLabel, "-insert-at-gap"), afterToken);
                  case 8:
                    insertRange = _context18.v;
                    if (insertRange) {
                      _context18.n = 9;
                      break;
                    }
                    return _context18.a(2, false);
                  case 9:
                    insertRange.insertText(", ", Word.InsertLocation.before);
                    return _context18.a(2, true);
                  case 10:
                    _context18.n = 11;
                    return getRangeForAnchorSpan(context, paragraph, entry, beforeEnd, afterStart, "".concat(traceLabel, "-replace-gap"), gapText || " ");
                  case 11:
                    gapRange = _context18.v;
                    if (gapRange) {
                      _context18.n = 12;
                      break;
                    }
                    return _context18.a(2, false);
                  case 12:
                    gapRange.insertText(", ", Word.InsertLocation.replace);
                    return _context18.a(2, true);
                }
              }, _callee18);
            }));
            return function replaceGapBetweenAnchors(_x79, _x80, _x81) {
              return _ref30.apply(this, arguments);
            };
          }();
          insertCommaAfterToken = /*#__PURE__*/function () {
            var _ref31 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee19(tokenAnchor, traceLabel) {
              var _entry$originalText5, _liveText$liveIndex;
              var liveText, tokenTextRaw, tokenText, tokenOrdinal, originalText, anchorEnd, hintIndex, tokenStart, _liveText$tokenStart, wsStart, firstTokenChar, commaText, beforeTokenWsRange, liveIndex, insertedViaChar, nextChar, _liveText$wsEnd, wsEnd, afterWsChar, withSpace, _commaText, replaceRange;
              return _regenerator().w(function (_context19) {
                while (1) switch (_context19.n) {
                  case 0:
                    if (tokenAnchor) {
                      _context19.n = 1;
                      break;
                    }
                    return _context19.a(2, false);
                  case 1:
                    paragraph.load("text");
                    _context19.n = 2;
                    return context.sync();
                  case 2:
                    liveText = paragraph.text || "";
                    tokenTextRaw = typeof tokenAnchor.tokenText === "string" ? tokenAnchor.tokenText : "";
                    tokenText = tokenTextRaw.trim() || tokenTextRaw;
                    tokenOrdinal = typeof tokenAnchor.textOccurrence === "number" ? tokenAnchor.textOccurrence : typeof tokenAnchor.tokenIndex === "number" ? tokenAnchor.tokenIndex : 0;
                    originalText = (_entry$originalText5 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText5 !== void 0 ? _entry$originalText5 : "";
                    anchorEnd = Number.isFinite(tokenAnchor.charEnd) ? tokenAnchor.charEnd : typeof tokenAnchor.tokenText === "string" ? tokenAnchor.charStart + tokenAnchor.tokenText.length : tokenAnchor.charStart;
                    hintIndex = mapIndexAcrossCanonical(originalText, liveText, anchorEnd);
                    if (!tokenText) {
                      _context19.n = 4;
                      break;
                    }
                    tokenStart = findTokenStartByHint(liveText, tokenText, hintIndex, tokenOrdinal);
                    if (!(tokenStart > 0 && /\s/.test(liveText[tokenStart - 1]))) {
                      _context19.n = 4;
                      break;
                    }
                    wsStart = tokenStart - 1;
                    while (wsStart > 0 && /\s/.test(liveText[wsStart - 1])) {
                      wsStart--;
                    }
                    firstTokenChar = (_liveText$tokenStart = liveText[tokenStart]) !== null && _liveText$tokenStart !== void 0 ? _liveText$tokenStart : "";
                    commaText = firstTokenChar && !/\s/.test(firstTokenChar) && !_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(firstTokenChar) && !(0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(firstTokenChar) ? ", " : ",";
                    _context19.n = 3;
                    return getRangeForAnchorSpan(context, paragraph, entry, wsStart, tokenStart, "".concat(traceLabel, "-normalize-before-token"), liveText.slice(wsStart, tokenStart));
                  case 3:
                    beforeTokenWsRange = _context19.v;
                    if (!beforeTokenWsRange) {
                      _context19.n = 4;
                      break;
                    }
                    beforeTokenWsRange.insertText(commaText, Word.InsertLocation.replace);
                    return _context19.a(2, true);
                  case 4:
                    liveIndex = hintIndex;
                    if (!(Number.isFinite(liveIndex) && liveIndex >= 0)) {
                      _context19.n = 6;
                      break;
                    }
                    _context19.n = 5;
                    return insertCommaAtChar(liveIndex, "".concat(traceLabel, "-mapped-char"));
                  case 5:
                    insertedViaChar = _context19.v;
                    if (!insertedViaChar) {
                      _context19.n = 6;
                      break;
                    }
                    return _context19.a(2, true);
                  case 6:
                    nextChar = (_liveText$liveIndex = liveText[liveIndex]) !== null && _liveText$liveIndex !== void 0 ? _liveText$liveIndex : "";
                    if (!(nextChar && /\s/.test(nextChar))) {
                      _context19.n = 8;
                      break;
                    }
                    wsEnd = liveIndex;
                    while (wsEnd < liveText.length && /\s/.test(liveText[wsEnd])) {
                      wsEnd++;
                    }
                    afterWsChar = (_liveText$wsEnd = liveText[wsEnd]) !== null && _liveText$wsEnd !== void 0 ? _liveText$wsEnd : "";
                    withSpace = afterWsChar && !/\s/.test(afterWsChar) && !_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(afterWsChar) && !(0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(afterWsChar);
                    _commaText = withSpace ? ", " : ",";
                    _context19.n = 7;
                    return getRangeForAnchorSpan(context, paragraph, entry, liveIndex, wsEnd, "".concat(traceLabel, "-replace-ws"), liveText.slice(liveIndex, wsEnd));
                  case 7:
                    replaceRange = _context19.v;
                    if (!replaceRange) {
                      _context19.n = 8;
                      break;
                    }
                    replaceRange.insertText(_commaText, Word.InsertLocation.replace);
                    return _context19.a(2, true);
                  case 8:
                    return _context19.a(2, false);
                }
              }, _callee19);
            }));
            return function insertCommaAfterToken(_x82, _x83) {
              return _ref31.apply(this, arguments);
            };
          }();
          insertCommaBeforeToken = /*#__PURE__*/function () {
            var _ref32 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee20(tokenAnchor, traceLabel) {
              var _entry$originalText6;
              var liveText, tokenTextRaw, tokenText, tokenOrdinal, originalText, anchorStart, hintIndex, tokenStart, wsStart, _liveText$tokenStart2, firstTokenChar, commaText, beforeTokenWsRange, liveIndex, insertedViaChar;
              return _regenerator().w(function (_context20) {
                while (1) switch (_context20.n) {
                  case 0:
                    if (tokenAnchor) {
                      _context20.n = 1;
                      break;
                    }
                    return _context20.a(2, false);
                  case 1:
                    paragraph.load("text");
                    _context20.n = 2;
                    return context.sync();
                  case 2:
                    liveText = paragraph.text || "";
                    tokenTextRaw = typeof tokenAnchor.tokenText === "string" ? tokenAnchor.tokenText : "";
                    tokenText = tokenTextRaw.trim() || tokenTextRaw;
                    tokenOrdinal = typeof tokenAnchor.textOccurrence === "number" ? tokenAnchor.textOccurrence : typeof tokenAnchor.tokenIndex === "number" ? tokenAnchor.tokenIndex : 0;
                    originalText = (_entry$originalText6 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText6 !== void 0 ? _entry$originalText6 : "";
                    anchorStart = Number.isFinite(tokenAnchor.charStart) ? tokenAnchor.charStart : -1;
                    hintIndex = anchorStart >= 0 ? mapIndexAcrossCanonical(originalText, liveText, anchorStart) : null;
                    if (!tokenText) {
                      _context20.n = 4;
                      break;
                    }
                    tokenStart = findTokenStartByHint(liveText, tokenText, hintIndex, tokenOrdinal);
                    if (!(tokenStart > 0)) {
                      _context20.n = 4;
                      break;
                    }
                    wsStart = tokenStart;
                    while (wsStart > 0 && /\s/.test(liveText[wsStart - 1])) {
                      wsStart--;
                    }
                    if (!(wsStart < tokenStart)) {
                      _context20.n = 4;
                      break;
                    }
                    firstTokenChar = (_liveText$tokenStart2 = liveText[tokenStart]) !== null && _liveText$tokenStart2 !== void 0 ? _liveText$tokenStart2 : "";
                    commaText = firstTokenChar && !/\s/.test(firstTokenChar) && !_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(firstTokenChar) && !(0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(firstTokenChar) ? ", " : ",";
                    _context20.n = 3;
                    return getRangeForAnchorSpan(context, paragraph, entry, wsStart, tokenStart, "".concat(traceLabel, "-normalize-before-token"), liveText.slice(wsStart, tokenStart));
                  case 3:
                    beforeTokenWsRange = _context20.v;
                    if (!beforeTokenWsRange) {
                      _context20.n = 4;
                      break;
                    }
                    beforeTokenWsRange.insertText(commaText, Word.InsertLocation.replace);
                    return _context20.a(2, true);
                  case 4:
                    if (!(anchorStart >= 0)) {
                      _context20.n = 6;
                      break;
                    }
                    liveIndex = hintIndex;
                    _context20.n = 5;
                    return insertCommaAtChar(liveIndex, "".concat(traceLabel, "-mapped-char"));
                  case 5:
                    insertedViaChar = _context20.v;
                    if (!insertedViaChar) {
                      _context20.n = 6;
                      break;
                    }
                    return _context20.a(2, true);
                  case 6:
                    return _context20.a(2, false);
                }
              }, _callee20);
            }));
            return function insertCommaBeforeToken(_x84, _x85) {
              return _ref32.apply(this, arguments);
            };
          }();
          anchor = (_ref33 = (_ref34 = (_ref35 = (_meta$highlightAnchor = meta.highlightAnchorTarget) !== null && _meta$highlightAnchor !== void 0 ? _meta$highlightAnchor : meta.sourceTokenAt) !== null && _ref35 !== void 0 ? _ref35 : meta.targetTokenAt) !== null && _ref34 !== void 0 ? _ref34 : meta.sourceTokenBefore) !== null && _ref33 !== void 0 ? _ref33 : meta.targetTokenBefore;
          anchorStart = anchor === null || anchor === void 0 ? void 0 : anchor.charStart;
          anchorEnd = Number.isFinite(anchor === null || anchor === void 0 ? void 0 : anchor.charEnd) && anchor.charEnd > anchor.charStart ? anchor.charEnd : typeof (anchor === null || anchor === void 0 ? void 0 : anchor.tokenText) === "string" && anchor.tokenText.length > 0 ? anchor.charStart + anchor.tokenText.length : undefined;
          if (!(Number.isFinite(anchorStart) && anchorStart >= 0)) {
            _context21.n = 13;
            break;
          }
          _context21.n = 2;
          return getRangeForAnchorSpan(context, paragraph, entry, anchorStart, anchorEnd, "apply-insert-lemma-anchor", (anchor === null || anchor === void 0 ? void 0 : anchor.tokenText) || meta.highlightText);
        case 2:
          range = _context21.v;
          if (!range) {
            _context21.n = 13;
            break;
          }
          _context21.p = 3;
          afterAnchor = (_meta$sourceTokenAfte2 = meta.sourceTokenAfter) !== null && _meta$sourceTokenAfte2 !== void 0 ? _meta$sourceTokenAfte2 : meta.targetTokenAfter;
          beforeAnchor = (_meta$sourceTokenBefo2 = meta.sourceTokenBefore) !== null && _meta$sourceTokenBefo2 !== void 0 ? _meta$sourceTokenBefo2 : meta.targetTokenBefore;
          _context21.n = 4;
          return replaceGapBetweenAnchors(beforeAnchor, afterAnchor, "apply-insert-token-gap");
        case 4:
          if (!_context21.v) {
            _context21.n = 5;
            break;
          }
          return _context21.a(2, true);
        case 5:
          _context21.n = 6;
          return insertCommaBeforeToken(afterAnchor, "apply-insert-lemma-after-token");
        case 6:
          if (!_context21.v) {
            _context21.n = 7;
            break;
          }
          return _context21.a(2, true);
        case 7:
          _context21.n = 8;
          return insertCommaAfterToken(beforeAnchor !== null && beforeAnchor !== void 0 ? beforeAnchor : anchor, "apply-insert-lemma-anchor");
        case 8:
          if (!_context21.v) {
            _context21.n = 9;
            break;
          }
          return _context21.a(2, true);
        case 9:
          _hasTokenAnchors = Boolean(beforeAnchor || afterAnchor || meta.sourceTokenAt || meta.targetTokenAt);
          if (!(!_hasTokenAnchors && Number.isFinite(anchorEnd) && anchorEnd >= 0)) {
            _context21.n = 11;
            break;
          }
          _context21.n = 10;
          return insertCommaAtChar(anchorEnd, "apply-insert-lemma-anchor");
        case 10:
          if (!_context21.v) {
            _context21.n = 11;
            break;
          }
          return _context21.a(2, true);
        case 11:
          _context21.n = 13;
          break;
        case 12:
          _context21.p = 12;
          _t5 = _context21.v;
          warn("apply insert metadata: failed to insert via lemma anchor", _t5);
        case 13:
          insertionCharStart = (_suggestion$charHint$6 = suggestion === null || suggestion === void 0 || (_suggestion$charHint8 = suggestion.charHint) === null || _suggestion$charHint8 === void 0 ? void 0 : _suggestion$charHint8.start) !== null && _suggestion$charHint$6 !== void 0 ? _suggestion$charHint$6 : Number.isFinite(meta.targetCharStart) ? meta.targetCharStart : -1;
          hasTokenAnchors = Boolean(meta.sourceTokenBefore || meta.sourceTokenAfter || meta.targetTokenBefore || meta.targetTokenAfter);
          if (!hasTokenAnchors) {
            _context21.n = 14;
            break;
          }
          return _context21.a(2, false);
        case 14:
          if (!(!Number.isFinite(insertionCharStart) || insertionCharStart < 0)) {
            _context21.n = 15;
            break;
          }
          return _context21.a(2, false);
        case 15:
          _context21.p = 15;
          _context21.n = 16;
          return insertCommaAtChar(insertionCharStart, "apply-insert-target-char");
        case 16:
          return _context21.a(2, _context21.v);
        case 17:
          _context21.p = 17;
          _t6 = _context21.v;
          warn("apply insert metadata: failed to insert via target char", _t6);
          return _context21.a(2, false);
      }
    }, _callee21, null, [[15, 17], [3, 12]]);
  }));
  return _tryApplyInsertUsingMetadata.apply(this, arguments);
}
function applyInsertSuggestion(_x57, _x58, _x59) {
  return _applyInsertSuggestion.apply(this, arguments);
}
function _applyInsertSuggestion() {
  _applyInsertSuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee22(context, paragraph, suggestion) {
    return _regenerator().w(function (_context22) {
      while (1) switch (_context22.n) {
        case 0:
          _context22.n = 1;
          return tryApplyInsertUsingMetadata(context, paragraph, suggestion);
        case 1:
          return _context22.a(2, _context22.v);
      }
    }, _callee22);
  }));
  return _applyInsertSuggestion.apply(this, arguments);
}
function normalizeCommaSpacingInParagraph(_x60, _x61) {
  return _normalizeCommaSpacingInParagraph.apply(this, arguments);
}
function _normalizeCommaSpacingInParagraph() {
  _normalizeCommaSpacingInParagraph = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee23(context, paragraph) {
    var text, idx, _text, toTrim, nextChar, afterRange;
    return _regenerator().w(function (_context23) {
      while (1) switch (_context23.n) {
        case 0:
          paragraph.load("text");
          _context23.n = 1;
          return context.sync();
        case 1:
          text = paragraph.text || "";
          if (text.includes(",")) {
            _context23.n = 2;
            break;
          }
          return _context23.a(2);
        case 2:
          idx = text.length - 1;
        case 3:
          if (!(idx >= 0)) {
            _context23.n = 10;
            break;
          }
          if (!(text[idx] !== ",")) {
            _context23.n = 4;
            break;
          }
          return _context23.a(3, 9);
        case 4:
          if (!(idx > 0 && /\s/.test(text[idx - 1]))) {
            _context23.n = 6;
            break;
          }
          _context23.n = 5;
          return getRangeForCharacterSpan(context, paragraph, text, idx - 1, idx, "trim-space-before-comma", " ");
        case 5:
          toTrim = _context23.v;
          if (toTrim) {
            toTrim.insertText("", Word.InsertLocation.replace);
          }
        case 6:
          nextChar = (_text = text[idx + 1]) !== null && _text !== void 0 ? _text : "";
          if (nextChar) {
            _context23.n = 7;
            break;
          }
          return _context23.a(3, 9);
        case 7:
          if (!(!/\s/.test(nextChar) && !_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(nextChar) && !(0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(nextChar))) {
            _context23.n = 9;
            break;
          }
          _context23.n = 8;
          return getRangeForCharacterSpan(context, paragraph, text, idx + 1, idx + 2, "space-after-comma", nextChar);
        case 8:
          afterRange = _context23.v;
          if (afterRange) {
            afterRange.insertText(" ", Word.InsertLocation.before);
          }
        case 9:
          idx--;
          _context23.n = 3;
          break;
        case 10:
          return _context23.a(2);
      }
    }, _callee23);
  }));
  return _normalizeCommaSpacingInParagraph.apply(this, arguments);
}
function cleanupCommaSpacingForParagraphs(_x62, _x63, _x64) {
  return _cleanupCommaSpacingForParagraphs.apply(this, arguments);
}
function _cleanupCommaSpacingForParagraphs() {
  _cleanupCommaSpacingForParagraphs = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee24(context, paragraphs, indexes) {
    var _ref36,
      _ref36$force,
      force,
      _iterator4,
      _step4,
      idx,
      paragraph,
      _args24 = arguments,
      _t7,
      _t8;
    return _regenerator().w(function (_context24) {
      while (1) switch (_context24.p = _context24.n) {
        case 0:
          _ref36 = _args24.length > 3 && _args24[3] !== undefined ? _args24[3] : {}, _ref36$force = _ref36.force, force = _ref36$force === void 0 ? false : _ref36$force;
          if (!(anchorProviderSupportsCharHints && !force)) {
            _context24.n = 1;
            break;
          }
          log("Skipping comma spacing cleanup – lemmatizer anchors already normalized.");
          return _context24.a(2);
        case 1:
          if (indexes !== null && indexes !== void 0 && indexes.size) {
            _context24.n = 2;
            break;
          }
          return _context24.a(2);
        case 2:
          _iterator4 = _createForOfIteratorHelper(indexes);
          _context24.p = 3;
          _iterator4.s();
        case 4:
          if ((_step4 = _iterator4.n()).done) {
            _context24.n = 9;
            break;
          }
          idx = _step4.value;
          paragraph = paragraphs.items[idx];
          if (paragraph) {
            _context24.n = 5;
            break;
          }
          return _context24.a(3, 8);
        case 5:
          _context24.p = 5;
          _context24.n = 6;
          return normalizeCommaSpacingInParagraph(context, paragraph);
        case 6:
          _context24.n = 8;
          break;
        case 7:
          _context24.p = 7;
          _t7 = _context24.v;
          warn("Failed to normalize comma spacing", _t7);
        case 8:
          _context24.n = 4;
          break;
        case 9:
          _context24.n = 11;
          break;
        case 10:
          _context24.p = 10;
          _t8 = _context24.v;
          _iterator4.e(_t8);
        case 11:
          _context24.p = 11;
          _iterator4.f();
          return _context24.f(11);
        case 12:
          return _context24.a(2);
      }
    }, _callee24, null, [[5, 7], [3, 10, 11, 12]]);
  }));
  return _cleanupCommaSpacingForParagraphs.apply(this, arguments);
}
function findRangeForInsert(_x65, _x66, _x67) {
  return _findRangeForInsert.apply(this, arguments);
}
function _findRangeForInsert() {
  _findRangeForInsert = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee25(context, paragraph, suggestion) {
    var _suggestion$snippets3, _suggestion$snippets4;
    var searchOpts, range, focusWord, wordSearch, leftFrag, leftSearch, _suggestion$snippets5, rightFrag, rightSearch;
    return _regenerator().w(function (_context25) {
      while (1) switch (_context25.n) {
        case 0:
          searchOpts = {
            matchCase: false,
            matchWholeWord: false
          };
          range = null;
          focusWord = (_suggestion$snippets3 = suggestion.snippets) === null || _suggestion$snippets3 === void 0 ? void 0 : _suggestion$snippets3.focusWord;
          if (!focusWord) {
            _context25.n = 2;
            break;
          }
          wordSearch = paragraph.getRange().search(focusWord, {
            matchCase: false,
            matchWholeWord: true
          });
          wordSearch.load("items");
          _context25.n = 1;
          return context.sync();
        case 1:
          if (wordSearch.items.length) {
            range = wordSearch.items[wordSearch.items.length - 1];
          }
        case 2:
          leftFrag = (((_suggestion$snippets4 = suggestion.snippets) === null || _suggestion$snippets4 === void 0 ? void 0 : _suggestion$snippets4.leftSnippet) || "").slice(-20).replace(/[\r\n]+/g, " ");
          if (!(!range && leftFrag.trim())) {
            _context25.n = 4;
            break;
          }
          leftSearch = paragraph.getRange().search(leftFrag.trim(), searchOpts);
          leftSearch.load("items");
          _context25.n = 3;
          return context.sync();
        case 3:
          if (leftSearch.items.length) {
            range = leftSearch.items[leftSearch.items.length - 1];
          }
        case 4:
          if (range) {
            _context25.n = 6;
            break;
          }
          rightFrag = (((_suggestion$snippets5 = suggestion.snippets) === null || _suggestion$snippets5 === void 0 ? void 0 : _suggestion$snippets5.rightSnippet) || "").replace(/,/g, "").trim();
          rightFrag = rightFrag.slice(0, 8);
          if (!rightFrag) {
            _context25.n = 6;
            break;
          }
          rightSearch = paragraph.getRange().search(rightFrag, searchOpts);
          rightSearch.load("items");
          _context25.n = 5;
          return context.sync();
        case 5:
          if (rightSearch.items.length) {
            range = rightSearch.items[0];
          }
        case 6:
          return _context25.a(2, range);
      }
    }, _callee25);
  }));
  return _findRangeForInsert.apply(this, arguments);
}
function clearHighlightForSuggestion(_x68, _x69, _x70) {
  return _clearHighlightForSuggestion.apply(this, arguments);
}
function _clearHighlightForSuggestion() {
  _clearHighlightForSuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee26(context, paragraph, suggestion) {
    var _suggestion$meta21, _suggestion$charHint$7, _suggestion$charHint9, _suggestion$charHint$8, _suggestion$charHint0, _metaAnchor$highlight;
    var entry, metaAnchor, charStart, charEnd, range;
    return _regenerator().w(function (_context26) {
      while (1) switch (_context26.n) {
        case 0:
          if (suggestion) {
            _context26.n = 1;
            break;
          }
          return _context26.a(2);
        case 1:
          if (!suggestion.highlightRange) {
            _context26.n = 2;
            break;
          }
          try {
            suggestion.highlightRange.font.highlightColor = null;
            context.trackedObjects.remove(suggestion.highlightRange);
          } catch (err) {
            warn("clearHighlightForSuggestion: failed via highlightRange", err);
          } finally {
            suggestion.highlightRange = null;
          }
          return _context26.a(2);
        case 2:
          entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
          metaAnchor = (_suggestion$meta21 = suggestion.meta) === null || _suggestion$meta21 === void 0 ? void 0 : _suggestion$meta21.anchor;
          if (metaAnchor) {
            _context26.n = 3;
            break;
          }
          return _context26.a(2);
        case 3:
          charStart = (_suggestion$charHint$7 = (_suggestion$charHint9 = suggestion.charHint) === null || _suggestion$charHint9 === void 0 ? void 0 : _suggestion$charHint9.start) !== null && _suggestion$charHint$7 !== void 0 ? _suggestion$charHint$7 : typeof metaAnchor.highlightCharStart === "number" ? metaAnchor.highlightCharStart : metaAnchor.charStart;
          charEnd = (_suggestion$charHint$8 = (_suggestion$charHint0 = suggestion.charHint) === null || _suggestion$charHint0 === void 0 ? void 0 : _suggestion$charHint0.end) !== null && _suggestion$charHint$8 !== void 0 ? _suggestion$charHint$8 : typeof metaAnchor.highlightCharEnd === "number" ? metaAnchor.highlightCharEnd : metaAnchor.charEnd;
          if (!(!paragraph || !Number.isFinite(charStart))) {
            _context26.n = 4;
            break;
          }
          return _context26.a(2);
        case 4:
          _context26.n = 5;
          return getRangeForAnchorSpan(context, paragraph, entry, charStart, charEnd, "clear-highlight", metaAnchor.highlightText || ((_metaAnchor$highlight = metaAnchor.highlightAnchorTarget) === null || _metaAnchor$highlight === void 0 ? void 0 : _metaAnchor$highlight.tokenText));
        case 5:
          range = _context26.v;
          if (range) {
            range.font.highlightColor = null;
          }
        case 6:
          return _context26.a(2);
      }
    }, _callee26);
  }));
  return _clearHighlightForSuggestion.apply(this, arguments);
}
function clearOnlineSuggestionMarkers(_x71, _x72, _x73) {
  return _clearOnlineSuggestionMarkers.apply(this, arguments);
}
function _clearOnlineSuggestionMarkers() {
  _clearOnlineSuggestionMarkers = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee27(context, suggestionsOverride, paragraphs) {
    var usingOverride, source, clearHighlight, _iterator5, _step5, _item$suggestion, _item$paragraph, _paragraphs$items, item, suggestion, paragraph, _t9;
    return _regenerator().w(function (_context27) {
      while (1) switch (_context27.p = _context27.n) {
        case 0:
          usingOverride = Array.isArray(suggestionsOverride);
          source = usingOverride ? suggestionsOverride : pendingSuggestionsOnline;
          clearHighlight = function clearHighlight(sug) {
            if (!(sug !== null && sug !== void 0 && sug.highlightRange)) return;
            try {
              sug.highlightRange.font.highlightColor = null;
              context.trackedObjects.remove(sug.highlightRange);
            } catch (err) {
              warn("Failed to clear highlight", err);
            } finally {
              sug.highlightRange = null;
            }
          };
          if (source.length) {
            _context27.n = 2;
            break;
          }
          if (usingOverride) {
            _context27.n = 1;
            break;
          }
          context.document.body.font.highlightColor = null;
          _context27.n = 1;
          return context.sync();
        case 1:
          return _context27.a(2);
        case 2:
          _iterator5 = _createForOfIteratorHelper(source);
          _context27.p = 3;
          _iterator5.s();
        case 4:
          if ((_step5 = _iterator5.n()).done) {
            _context27.n = 9;
            break;
          }
          item = _step5.value;
          suggestion = (_item$suggestion = item === null || item === void 0 ? void 0 : item.suggestion) !== null && _item$suggestion !== void 0 ? _item$suggestion : item;
          if (suggestion) {
            _context27.n = 5;
            break;
          }
          return _context27.a(3, 8);
        case 5:
          paragraph = (_item$paragraph = item === null || item === void 0 ? void 0 : item.paragraph) !== null && _item$paragraph !== void 0 ? _item$paragraph : paragraphs === null || paragraphs === void 0 || (_paragraphs$items = paragraphs.items) === null || _paragraphs$items === void 0 ? void 0 : _paragraphs$items[suggestion.paragraphIndex];
          if (!paragraph) {
            _context27.n = 7;
            break;
          }
          _context27.n = 6;
          return clearHighlightForSuggestion(context, paragraph, suggestion);
        case 6:
          _context27.n = 8;
          break;
        case 7:
          clearHighlight(suggestion);
        case 8:
          _context27.n = 4;
          break;
        case 9:
          _context27.n = 11;
          break;
        case 10:
          _context27.p = 10;
          _t9 = _context27.v;
          _iterator5.e(_t9);
        case 11:
          _context27.p = 11;
          _iterator5.f();
          return _context27.f(11);
        case 12:
          _context27.n = 13;
          return context.sync();
        case 13:
          if (!suggestionsOverride) {
            resetPendingSuggestionsOnline();
          }
        case 14:
          return _context27.a(2);
      }
    }, _callee27, null, [[3, 10, 11, 12]]);
  }));
  return _clearOnlineSuggestionMarkers.apply(this, arguments);
}
function getSuggestionSortPos(suggestion) {
  var _ref6, _ref7, _ref8, _suggestion$meta$op$o, _suggestion$meta3, _suggestion$meta4, _suggestion$meta5, _suggestion$charHint;
  return (_ref6 = (_ref7 = (_ref8 = (_suggestion$meta$op$o = suggestion === null || suggestion === void 0 || (_suggestion$meta3 = suggestion.meta) === null || _suggestion$meta3 === void 0 || (_suggestion$meta3 = _suggestion$meta3.op) === null || _suggestion$meta3 === void 0 ? void 0 : _suggestion$meta3.originalPos) !== null && _suggestion$meta$op$o !== void 0 ? _suggestion$meta$op$o : suggestion === null || suggestion === void 0 || (_suggestion$meta4 = suggestion.meta) === null || _suggestion$meta4 === void 0 || (_suggestion$meta4 = _suggestion$meta4.op) === null || _suggestion$meta4 === void 0 ? void 0 : _suggestion$meta4.correctedPos) !== null && _ref8 !== void 0 ? _ref8 : suggestion === null || suggestion === void 0 || (_suggestion$meta5 = suggestion.meta) === null || _suggestion$meta5 === void 0 || (_suggestion$meta5 = _suggestion$meta5.op) === null || _suggestion$meta5 === void 0 ? void 0 : _suggestion$meta5.pos) !== null && _ref7 !== void 0 ? _ref7 : suggestion === null || suggestion === void 0 || (_suggestion$charHint = suggestion.charHint) === null || _suggestion$charHint === void 0 ? void 0 : _suggestion$charHint.start) !== null && _ref6 !== void 0 ? _ref6 : -1;
}
function findWordTokenStartByHintInText(text, rawToken, hintIndex, occurrence) {
  var tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
  if (!tokenRaw || !text) return -1;
  var token = tokenRaw.replace(/^(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+|(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+$/g, "");
  if (!token || /(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(token)) return -1;
  var safeOccurrence = Number.isFinite(occurrence) ? Math.max(0, Math.floor(occurrence)) : 0;
  var safeHint = Number.isFinite(hintIndex) ? Math.max(0, Math.floor(hintIndex)) : null;
  var tokenRegex = new RegExp("(^|[^\\p{L}\\d])(".concat(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ")(?=$|[^\\p{L}\\d])"), "gu");
  var positions = [];
  var match;
  while ((match = tokenRegex.exec(text)) !== null) {
    positions.push(match.index + match[1].length);
  }
  if (!positions.length) return -1;
  if (safeHint === null) {
    return positions[Math.min(safeOccurrence, positions.length - 1)];
  }
  var best = positions[0];
  var bestDist = Math.abs(positions[0] - safeHint);
  for (var i = 1; i < positions.length; i++) {
    var dist = Math.abs(positions[i] - safeHint);
    if (dist < bestDist) {
      best = positions[i];
      bestDist = dist;
    }
  }
  // Reject far matches; these are the main source of in-word corruption.
  if (bestDist > 24) return -1;
  return best;
}
function resolveInsertOperationFromSnapshot(snapshotText, sourceText, suggestion) {
  var _suggestion$meta6, _meta$sourceTokenBefo, _meta$sourceTokenAfte;
  var meta = suggestion === null || suggestion === void 0 || (_suggestion$meta6 = suggestion.meta) === null || _suggestion$meta6 === void 0 ? void 0 : _suggestion$meta6.anchor;
  if (!meta) return null;
  var beforeAnchor = (_meta$sourceTokenBefo = meta.sourceTokenBefore) !== null && _meta$sourceTokenBefo !== void 0 ? _meta$sourceTokenBefo : meta.targetTokenBefore;
  var afterAnchor = (_meta$sourceTokenAfte = meta.sourceTokenAfter) !== null && _meta$sourceTokenAfte !== void 0 ? _meta$sourceTokenAfte : meta.targetTokenAfter;
  var findStartForAnchor = function findStartForAnchor(anchor) {
    var _ref9, _anchor$textOccurrenc;
    var preferEnd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!(anchor !== null && anchor !== void 0 && anchor.tokenText)) return {
      start: -1,
      token: null
    };
    var token = (anchor.tokenText || "").trim().replace(/^(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+|(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+$/g, "");
    if (!token || /(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(token)) return {
      start: -1,
      token: null
    };
    var sourceHint = preferEnd ? Number.isFinite(anchor.charEnd) ? anchor.charEnd : anchor.charStart + token.length : anchor.charStart;
    var mappedHint = Number.isFinite(sourceHint) ? mapIndexAcrossCanonical(sourceText, snapshotText, sourceHint) : null;
    var start = findWordTokenStartByHintInText(snapshotText, token, mappedHint, (_ref9 = (_anchor$textOccurrenc = anchor.textOccurrence) !== null && _anchor$textOccurrenc !== void 0 ? _anchor$textOccurrenc : anchor.tokenIndex) !== null && _ref9 !== void 0 ? _ref9 : 0);
    return {
      start: start,
      token: token
    };
  };

  // Best path: replace exact whitespace gap between before/after anchors.
  if (beforeAnchor && afterAnchor) {
    var before = findStartForAnchor(beforeAnchor, true);
    var after = findStartForAnchor(afterAnchor, false);
    if (before.start >= 0 && after.start >= 0) {
      var beforeEnd = before.start + before.token.length;
      if (beforeEnd <= after.start) {
        var gap = snapshotText.slice(beforeEnd, after.start);
        // Only treat as already satisfied when the direct token gap is just comma+spaces.
        if (/^\s*,\s*$/.test(gap)) {
          return {
            kind: "noop"
          };
        }
        // If there are non-whitespace chars in the gap, anchors are not adjacent; don't noop.
        if (!/[^\s]/.test(gap)) {
          return {
            kind: "insert",
            start: beforeEnd,
            end: after.start,
            replacement: ", ",
            snippet: gap || before.token
          };
        }
      }
    }
  }

  // Secondary path: normalize whitespace right before "after" token.
  if (afterAnchor) {
    var _after = findStartForAnchor(afterAnchor, false);
    if (_after.start > 0) {
      var wsStart = _after.start;
      while (wsStart > 0 && /\s/.test(snapshotText[wsStart - 1])) wsStart--;
      if (wsStart < _after.start) {
        return {
          kind: "insert",
          start: wsStart,
          end: _after.start,
          replacement: ", ",
          snippet: snapshotText.slice(wsStart, _after.start)
        };
      }
      return {
        kind: "insert",
        start: _after.start,
        end: _after.start,
        replacement: ", ",
        snippet: snapshotText.slice(Math.max(0, _after.start - 1), Math.min(snapshotText.length, _after.start + 1))
      };
    }
  }

  // Secondary path: normalize whitespace right after "before" token.
  if (beforeAnchor) {
    var _before = findStartForAnchor(beforeAnchor, true);
    if (_before.start >= 0) {
      var _beforeEnd = _before.start + _before.token.length;
      var wsEnd = _beforeEnd;
      while (wsEnd < snapshotText.length && /\s/.test(snapshotText[wsEnd])) wsEnd++;
      if (wsEnd > _beforeEnd) {
        return {
          kind: "insert",
          start: _beforeEnd,
          end: wsEnd,
          replacement: ", ",
          snippet: snapshotText.slice(_beforeEnd, wsEnd)
        };
      }
      return {
        kind: "insert",
        start: _beforeEnd,
        end: _beforeEnd,
        replacement: ", ",
        snippet: snapshotText.slice(Math.max(0, _beforeEnd - 1), Math.min(snapshotText.length, _beforeEnd + 1))
      };
    }
  }
  return null;
}
function resolveDeleteOperationFromSnapshot(snapshotText, sourceText, suggestion) {
  var _suggestion$meta7, _ref0, _ref1, _meta$sourceTokenAt, _ref10, _ref11, _ref12, _suggestion$charHint$, _suggestion$charHint2, _suggestion$meta8;
  var meta = suggestion === null || suggestion === void 0 || (_suggestion$meta7 = suggestion.meta) === null || _suggestion$meta7 === void 0 ? void 0 : _suggestion$meta7.anchor;
  if (!meta) return null;
  var sourceAnchor = (_ref0 = (_ref1 = (_meta$sourceTokenAt = meta.sourceTokenAt) !== null && _meta$sourceTokenAt !== void 0 ? _meta$sourceTokenAt : meta.sourceTokenBefore) !== null && _ref1 !== void 0 ? _ref1 : meta.sourceTokenAfter) !== null && _ref0 !== void 0 ? _ref0 : meta.highlightAnchorTarget;
  var charStart = (_ref10 = (_ref11 = (_ref12 = (_suggestion$charHint$ = suggestion === null || suggestion === void 0 || (_suggestion$charHint2 = suggestion.charHint) === null || _suggestion$charHint2 === void 0 ? void 0 : _suggestion$charHint2.start) !== null && _suggestion$charHint$ !== void 0 ? _suggestion$charHint$ : meta.charStart) !== null && _ref12 !== void 0 ? _ref12 : sourceAnchor === null || sourceAnchor === void 0 ? void 0 : sourceAnchor.charStart) !== null && _ref11 !== void 0 ? _ref11 : suggestion === null || suggestion === void 0 || (_suggestion$meta8 = suggestion.meta) === null || _suggestion$meta8 === void 0 || (_suggestion$meta8 = _suggestion$meta8.op) === null || _suggestion$meta8 === void 0 ? void 0 : _suggestion$meta8.originalPos) !== null && _ref10 !== void 0 ? _ref10 : -1;
  if (!Number.isFinite(charStart) || charStart < 0) return null;
  var mappedStart = mapIndexAcrossCanonical(sourceText, snapshotText, charStart);
  var commaIndex = -1;
  for (var delta = 0; delta <= 3; delta++) {
    var left = mappedStart - delta;
    var right = mappedStart + delta;
    if (left >= 0 && snapshotText[left] === ",") {
      commaIndex = left;
      break;
    }
    if (right < snapshotText.length && snapshotText[right] === ",") {
      commaIndex = right;
      break;
    }
  }
  if (commaIndex < 0) return null;
  return {
    kind: "delete",
    start: commaIndex,
    end: commaIndex + 1,
    replacement: "",
    snippet: ","
  };
}
function buildParagraphOperationsPlan(snapshotText, sourceText, suggestions) {
  var rawPlan = [];
  var skipped = [];
  var noop = [];
  var _iterator3 = _createForOfIteratorHelper(suggestions),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var suggestion = _step3.value;
      var op = null;
      if ((suggestion === null || suggestion === void 0 ? void 0 : suggestion.kind) === "delete") {
        op = resolveDeleteOperationFromSnapshot(snapshotText, sourceText, suggestion);
      } else {
        op = resolveInsertOperationFromSnapshot(snapshotText, sourceText, suggestion);
      }
      if (!op) {
        skipped.push(suggestion);
        continue;
      }
      if (op.kind === "noop") {
        noop.push(suggestion);
        continue;
      }
      rawPlan.push(_objectSpread(_objectSpread({}, op), {}, {
        suggestions: [suggestion],
        sortPos: getSuggestionSortPos(suggestion)
      }));
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  rawPlan.sort(function (a, b) {
    if (a.start !== b.start) return b.start - a.start;
    if (a.kind !== b.kind) return a.kind === "delete" ? -1 : 1;
    return b.sortPos - a.sortPos;
  });
  var consumed = new Set();
  var plan = [];
  for (var i = 0; i < rawPlan.length; i++) {
    if (consumed.has(i)) continue;
    var current = rawPlan[i];

    // Drop redundant inserts only when comma is already exactly at the insertion gap.
    if (current.kind === "insert") {
      var segment = snapshotText.slice(current.start, current.end);
      if (segment === current.replacement) {
        noop.push.apply(noop, _toConsumableArray(current.suggestions));
        continue;
      }
      if (current.replacement.startsWith(",")) {
        var segmentIsCommaGap = /^\s*,\s*$/.test(segment);
        var left = current.start - 1;
        while (left >= 0 && /\s/.test(snapshotText[left])) left--;
        var right = current.end;
        while (right < snapshotText.length && /\s/.test(snapshotText[right])) right++;
        var leftChar = left >= 0 ? snapshotText[left] : "";
        var rightChar = right < snapshotText.length ? snapshotText[right] : "";
        var segmentHasOnlyWhitespace = !/[^\s]/.test(segment);
        if (segmentIsCommaGap || segmentHasOnlyWhitespace && (leftChar === "," || rightChar === ",")) {
          noop.push.apply(noop, _toConsumableArray(current.suggestions));
          continue;
        }
      }
    }

    // Coalesce local delete+insert into a single replace to avoid visual "double comma then delete".
    if (current.kind === "delete") {
      var deletePos = current.start;
      var merged = false;
      for (var j = i + 1; j < rawPlan.length; j++) {
        if (consumed.has(j)) continue;
        var candidate = rawPlan[j];
        if (candidate.kind !== "insert") continue;
        if (Math.abs(candidate.start - deletePos) > 1) continue;
        if (!candidate.replacement.startsWith(",")) continue;
        var start = Math.min(current.start, candidate.start);
        var end = Math.max(current.end, candidate.end);
        plan.push({
          kind: "replace",
          start: start,
          end: end,
          replacement: ", ",
          snippet: snapshotText.slice(start, end) || ",",
          suggestions: [].concat(_toConsumableArray(current.suggestions), _toConsumableArray(candidate.suggestions)),
          sortPos: Math.max(current.sortPos, candidate.sortPos)
        });
        consumed.add(j);
        merged = true;
        break;
      }
      if (merged) continue;
    }
    plan.push(current);
  }
  return {
    plan: plan,
    skipped: skipped,
    noop: noop
  };
}
function applyAllSuggestionsOnline() {
  return _applyAllSuggestionsOnline.apply(this, arguments);
}
function _applyAllSuggestionsOnline() {
  _applyAllSuggestionsOnline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee29() {
    var restored, suggestionsByParagraph, _iterator6, _step6, sug, _t10;
    return _regenerator().w(function (_context29) {
      while (1) switch (_context29.p = _context29.n) {
        case 0:
          if (!pendingSuggestionsOnline.length) {
            restored = restorePendingSuggestionsOnline();
            if (restored > 0) {
              log("applyAllSuggestionsOnline: restored ".concat(restored, " pending suggestions from storage"));
            }
          }
          if (pendingSuggestionsOnline.length) {
            _context29.n = 1;
            break;
          }
          warn("applyAllSuggestionsOnline: no pending suggestions");
          return _context29.a(2);
        case 1:
          suggestionsByParagraph = new Map();
          _iterator6 = _createForOfIteratorHelper(pendingSuggestionsOnline);
          _context29.p = 2;
          _iterator6.s();
        case 3:
          if ((_step6 = _iterator6.n()).done) {
            _context29.n = 6;
            break;
          }
          sug = _step6.value;
          if (!(typeof (sug === null || sug === void 0 ? void 0 : sug.paragraphIndex) !== "number" || sug.paragraphIndex < 0)) {
            _context29.n = 4;
            break;
          }
          return _context29.a(3, 5);
        case 4:
          if (!suggestionsByParagraph.has(sug.paragraphIndex)) {
            suggestionsByParagraph.set(sug.paragraphIndex, []);
          }
          suggestionsByParagraph.get(sug.paragraphIndex).push(sug);
        case 5:
          _context29.n = 3;
          break;
        case 6:
          _context29.n = 8;
          break;
        case 7:
          _context29.p = 7;
          _t10 = _context29.v;
          _iterator6.e(_t10);
        case 8:
          _context29.p = 8;
          _iterator6.f();
          return _context29.f(8);
        case 9:
          if (suggestionsByParagraph.size) {
            _context29.n = 10;
            break;
          }
          return _context29.a(2);
        case 10:
          _context29.n = 11;
          return Word.run(/*#__PURE__*/function () {
            var _ref37 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee28(context) {
              var paras, touchedIndexes, processedSuggestions, failedSuggestions, _iterator7, _step7, _entry$originalText7, _step7$value, paragraphIndex, suggestions, paragraph, entry, snapshotText, sourceText, _buildParagraphOperat, plan, skipped, noop, _iterator9, _step9, suggestion, anyApplied, appliedCount, applyFailedCount, _iterator0, _step0, op, range, _iterator1, _step1, _suggestion, _iterator8, _step8, idx, _t0, _t1;
              return _regenerator().w(function (_context28) {
                while (1) switch (_context28.p = _context28.n) {
                  case 0:
                    _context28.n = 1;
                    return wordOnlineAdapter.getParagraphs(context);
                  case 1:
                    paras = _context28.v;
                    touchedIndexes = new Set();
                    processedSuggestions = [];
                    failedSuggestions = [];
                    _iterator7 = _createForOfIteratorHelper(suggestionsByParagraph.entries());
                    _context28.p = 2;
                    _iterator7.s();
                  case 3:
                    if ((_step7 = _iterator7.n()).done) {
                      _context28.n = 16;
                      break;
                    }
                    _step7$value = _slicedToArray(_step7.value, 2), paragraphIndex = _step7$value[0], suggestions = _step7$value[1];
                    paragraph = paras.items[paragraphIndex];
                    if (paragraph) {
                      _context28.n = 4;
                      break;
                    }
                    failedSuggestions.push.apply(failedSuggestions, _toConsumableArray(suggestions));
                    return _context28.a(3, 15);
                  case 4:
                    entry = anchorProvider.getAnchorsForParagraph(paragraphIndex);
                    paragraph.load("text");
                    _context28.n = 5;
                    return context.sync();
                  case 5:
                    snapshotText = paragraph.text || "";
                    sourceText = (_entry$originalText7 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText7 !== void 0 ? _entry$originalText7 : snapshotText;
                    _buildParagraphOperat = buildParagraphOperationsPlan(snapshotText, sourceText, suggestions), plan = _buildParagraphOperat.plan, skipped = _buildParagraphOperat.skipped, noop = _buildParagraphOperat.noop;
                    log("applyAll plan", {
                      paragraphIndex: paragraphIndex,
                      total: suggestions.length,
                      planned: plan.length,
                      skipped: skipped.length,
                      noop: noop.length
                    });
                    failedSuggestions.push.apply(failedSuggestions, _toConsumableArray(skipped));
                    _iterator9 = _createForOfIteratorHelper(noop);
                    try {
                      for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                        suggestion = _step9.value;
                        processedSuggestions.push({
                          suggestion: suggestion,
                          paragraph: paragraph
                        });
                      }
                    } catch (err) {
                      _iterator9.e(err);
                    } finally {
                      _iterator9.f();
                    }
                    anyApplied = false;
                    appliedCount = 0;
                    applyFailedCount = 0;
                    _iterator0 = _createForOfIteratorHelper(plan);
                    _context28.p = 6;
                    _iterator0.s();
                  case 7:
                    if ((_step0 = _iterator0.n()).done) {
                      _context28.n = 11;
                      break;
                    }
                    op = _step0.value;
                    _context28.n = 8;
                    return getRangeForCharacterSpan(context, paragraph, snapshotText, op.start, op.end, "apply-planned-".concat(op.kind), op.snippet);
                  case 8:
                    range = _context28.v;
                    if (range) {
                      _context28.n = 9;
                      break;
                    }
                    failedSuggestions.push.apply(failedSuggestions, _toConsumableArray(op.suggestions));
                    applyFailedCount++;
                    return _context28.a(3, 10);
                  case 9:
                    try {
                      range.insertText(op.replacement, Word.InsertLocation.replace);
                      anyApplied = true;
                      _iterator1 = _createForOfIteratorHelper(op.suggestions);
                      try {
                        for (_iterator1.s(); !(_step1 = _iterator1.n()).done;) {
                          _suggestion = _step1.value;
                          processedSuggestions.push({
                            suggestion: _suggestion,
                            paragraph: paragraph
                          });
                        }
                      } catch (err) {
                        _iterator1.e(err);
                      } finally {
                        _iterator1.f();
                      }
                      appliedCount++;
                    } catch (applyErr) {
                      warn("applyAllSuggestionsOnline: failed planned op", applyErr);
                      failedSuggestions.push.apply(failedSuggestions, _toConsumableArray(op.suggestions));
                      applyFailedCount++;
                    }
                  case 10:
                    _context28.n = 7;
                    break;
                  case 11:
                    _context28.n = 13;
                    break;
                  case 12:
                    _context28.p = 12;
                    _t0 = _context28.v;
                    _iterator0.e(_t0);
                  case 13:
                    _context28.p = 13;
                    _iterator0.f();
                    return _context28.f(13);
                  case 14:
                    log("applyAll result", {
                      paragraphIndex: paragraphIndex,
                      appliedCount: appliedCount,
                      applyFailedCount: applyFailedCount
                    });
                    if (anyApplied) {
                      touchedIndexes.add(paragraphIndex);
                    }
                  case 15:
                    _context28.n = 3;
                    break;
                  case 16:
                    _context28.n = 18;
                    break;
                  case 17:
                    _context28.p = 17;
                    _t1 = _context28.v;
                    _iterator7.e(_t1);
                  case 18:
                    _context28.p = 18;
                    _iterator7.f();
                    return _context28.f(18);
                  case 19:
                    _context28.n = 20;
                    return wordOnlineAdapter.clearHighlights(context, processedSuggestions);
                  case 20:
                    _context28.n = 21;
                    return cleanupCommaSpacingForParagraphs(context, paras, touchedIndexes, {
                      force: wordOnlineAdapter.shouldForceSpacingCleanup()
                    });
                  case 21:
                    _iterator8 = _createForOfIteratorHelper(touchedIndexes);
                    try {
                      for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                        idx = _step8.value;
                        anchorProvider.deleteAnchors(idx);
                      }
                    } catch (err) {
                      _iterator8.e(err);
                    } finally {
                      _iterator8.f();
                    }
                    pendingSuggestionsOnline.length = 0;
                    if (failedSuggestions.length) {
                      pendingSuggestionsOnline.push.apply(pendingSuggestionsOnline, failedSuggestions);
                      persistPendingSuggestionsOnline();
                    } else {
                      context.document.body.font.highlightColor = null;
                      persistPendingSuggestionsOnline();
                    }
                    _context28.n = 22;
                    return context.sync();
                  case 22:
                    return _context28.a(2);
                }
              }, _callee28, null, [[6, 12, 13, 14], [2, 17, 18, 19]]);
            }));
            return function (_x86) {
              return _ref37.apply(this, arguments);
            };
          }());
        case 11:
          return _context29.a(2);
      }
    }, _callee29, null, [[2, 7, 8, 9]]);
  }));
  return _applyAllSuggestionsOnline.apply(this, arguments);
}
function rejectAllSuggestionsOnline() {
  return _rejectAllSuggestionsOnline.apply(this, arguments);
}
/** ─────────────────────────────────────────────────────────
 *  MAIN: Preveri vejice – celoten dokument, po odstavkih
 *  ───────────────────────────────────────────────────────── */
function _rejectAllSuggestionsOnline() {
  _rejectAllSuggestionsOnline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee31() {
    return _regenerator().w(function (_context31) {
      while (1) switch (_context31.n) {
        case 0:
          _context31.n = 1;
          return Word.run(/*#__PURE__*/function () {
            var _ref38 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee30(context) {
              var paras;
              return _regenerator().w(function (_context30) {
                while (1) switch (_context30.n) {
                  case 0:
                    paras = context.document.body.paragraphs;
                    paras.load("items/text");
                    _context30.n = 1;
                    return context.sync();
                  case 1:
                    _context30.n = 2;
                    return wordOnlineAdapter.clearHighlights(context, null, paras);
                  case 2:
                    context.document.body.font.highlightColor = null;
                    _context30.n = 3;
                    return context.sync();
                  case 3:
                    return _context30.a(2);
                }
              }, _callee30);
            }));
            return function (_x87) {
              return _ref38.apply(this, arguments);
            };
          }());
        case 1:
          return _context31.a(2);
      }
    }, _callee31);
  }));
  return _rejectAllSuggestionsOnline.apply(this, arguments);
}
function checkDocumentText() {
  return _checkDocumentText.apply(this, arguments);
}
function _checkDocumentText() {
  _checkDocumentText = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee32() {
    return _regenerator().w(function (_context32) {
      while (1) switch (_context32.n) {
        case 0:
          resetNotificationFlags();
          if (!(0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)()) {
            _context32.n = 1;
            break;
          }
          return _context32.a(2, checkDocumentTextOnline());
        case 1:
          return _context32.a(2, checkDocumentTextDesktop());
      }
    }, _callee32);
  }));
  return _checkDocumentText.apply(this, arguments);
}
function checkDocumentTextDesktop() {
  return _checkDocumentTextDesktop.apply(this, arguments);
}
function _checkDocumentTextDesktop() {
  _checkDocumentTextDesktop = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee34() {
    var totalInserted, totalDeleted, paragraphsProcessed, apiErrors, _t15;
    return _regenerator().w(function (_context34) {
      while (1) switch (_context34.p = _context34.n) {
        case 0:
          log("START checkDocumentText()");
          totalInserted = 0;
          totalDeleted = 0;
          paragraphsProcessed = 0;
          apiErrors = 0;
          _context34.p = 1;
          _context34.n = 2;
          return Word.run(/*#__PURE__*/function () {
            var _ref39 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee33(context) {
              var doc, trackToggleSupported, prevTrack, paras, documentCharOffset, idx, paragraph, sourceText, normalizedSource, trimmed, paragraphDocOffset, pStart, result, suggestions, appliedInParagraph, _iterator10, _step10, suggestion, applied, _t11, _t12, _t13, _t14;
              return _regenerator().w(function (_context33) {
                while (1) switch (_context33.p = _context33.n) {
                  case 0:
                    _context33.n = 1;
                    return documentHasTrackedChanges(context);
                  case 1:
                    if (!_context33.v) {
                      _context33.n = 2;
                      break;
                    }
                    notifyTrackedChangesPresent();
                    return _context33.a(2);
                  case 2:
                    // naloži in začasno vključi sledenje spremembam
                    doc = context.document;
                    trackToggleSupported = false;
                    prevTrack = false;
                    _context33.p = 3;
                    doc.load("trackRevisions");
                    _context33.n = 4;
                    return context.sync();
                  case 4:
                    prevTrack = doc.trackRevisions;
                    doc.trackRevisions = true;
                    trackToggleSupported = true;
                    log("TrackRevisions:", prevTrack, "-> true");
                    _context33.n = 6;
                    break;
                  case 5:
                    _context33.p = 5;
                    _t11 = _context33.v;
                    warn("trackRevisions not available -> skip toggling", _t11);
                  case 6:
                    _context33.p = 6;
                    _context33.n = 7;
                    return wordDesktopAdapter.getParagraphs(context);
                  case 7:
                    paras = _context33.v;
                    log("Paragraphs found:", paras.items.length);
                    anchorProvider.reset();
                    documentCharOffset = 0;
                    idx = 0;
                  case 8:
                    if (!(idx < paras.items.length)) {
                      _context33.n = 31;
                      break;
                    }
                    paragraph = paras.items[idx];
                    sourceText = paragraph.text || "";
                    normalizedSource = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.normalizeParagraphWhitespace)(sourceText);
                    trimmed = normalizedSource.trim();
                    paragraphDocOffset = documentCharOffset;
                    documentCharOffset += sourceText.length + 1;
                    if (trimmed) {
                      _context33.n = 10;
                      break;
                    }
                    _context33.n = 9;
                    return anchorProvider.getAnchors({
                      paragraphIndex: idx,
                      originalText: sourceText,
                      correctedText: sourceText,
                      sourceTokens: [],
                      targetTokens: [],
                      documentOffset: paragraphDocOffset
                    });
                  case 9:
                    return _context33.a(3, 30);
                  case 10:
                    if (!(trimmed.length > MAX_PARAGRAPH_CHARS)) {
                      _context33.n = 11;
                      break;
                    }
                    notifyParagraphTooLong(idx, trimmed.length);
                    return _context33.a(3, 30);
                  case 11:
                    pStart = tnow();
                    paragraphsProcessed++;
                    log("P".concat(idx, ": len=").concat(sourceText.length, " | \"").concat(SNIP(trimmed), "\""));
                    result = void 0;
                    _context33.p = 12;
                    _context33.n = 13;
                    return commaEngine.analyzeParagraph({
                      paragraphIndex: idx,
                      originalText: sourceText,
                      normalizedOriginalText: normalizedSource,
                      paragraphDocOffset: paragraphDocOffset
                    });
                  case 13:
                    result = _context33.v;
                    _context33.n = 15;
                    break;
                  case 14:
                    _context33.p = 14;
                    _t12 = _context33.v;
                    apiErrors++;
                    warn("P".concat(idx, ": engine failed"), _t12);
                    notifyApiUnavailable();
                    return _context33.a(3, 30);
                  case 15:
                    apiErrors += result.apiErrors;
                    suggestions = result.suggestions || [];
                    if (suggestions.length) {
                      _context33.n = 16;
                      break;
                    }
                    return _context33.a(3, 30);
                  case 16:
                    appliedInParagraph = 0;
                    _iterator10 = _createForOfIteratorHelper(suggestions);
                    _context33.p = 17;
                    _iterator10.s();
                  case 18:
                    if ((_step10 = _iterator10.n()).done) {
                      _context33.n = 25;
                      break;
                    }
                    suggestion = _step10.value;
                    applied = false;
                    _context33.p = 19;
                    _context33.n = 20;
                    return wordDesktopAdapter.applySuggestion(context, paragraph, suggestion);
                  case 20:
                    applied = _context33.v;
                    _context33.n = 22;
                    break;
                  case 21:
                    _context33.p = 21;
                    _t13 = _context33.v;
                    warn("Desktop adapter failed to apply suggestion", _t13);
                  case 22:
                    if (applied) {
                      _context33.n = 23;
                      break;
                    }
                    return _context33.a(3, 24);
                  case 23:
                    appliedInParagraph++;
                    if (suggestion.kind === "insert") {
                      totalInserted++;
                    } else if (suggestion.kind === "delete") {
                      totalDeleted++;
                    }
                  case 24:
                    _context33.n = 18;
                    break;
                  case 25:
                    _context33.n = 27;
                    break;
                  case 26:
                    _context33.p = 26;
                    _t14 = _context33.v;
                    _iterator10.e(_t14);
                  case 27:
                    _context33.p = 27;
                    _iterator10.f();
                    return _context33.f(27);
                  case 28:
                    if (!appliedInParagraph) {
                      _context33.n = 30;
                      break;
                    }
                    _context33.n = 29;
                    return normalizeCommaSpacingInParagraph(context, paragraph);
                  case 29:
                    log("P".concat(idx, ": applied (ins=").concat(totalInserted, ", del=").concat(totalDeleted, ") | ").concat(Math.round(tnow() - pStart), " ms"));
                  case 30:
                    idx++;
                    _context33.n = 8;
                    break;
                  case 31:
                    _context33.p = 31;
                    if (!trackToggleSupported) {
                      _context33.n = 33;
                      break;
                    }
                    doc.trackRevisions = prevTrack;
                    _context33.n = 32;
                    return context.sync();
                  case 32:
                    log("TrackRevisions restored ->", prevTrack);
                  case 33:
                    return _context33.f(31);
                  case 34:
                    return _context33.a(2);
                }
              }, _callee33, null, [[19, 21], [17, 26, 27, 28], [12, 14], [6,, 31, 34], [3, 5]]);
            }));
            return function (_x88) {
              return _ref39.apply(this, arguments);
            };
          }());
        case 2:
          log("DONE checkDocumentText() | paragraphs:", paragraphsProcessed, "| inserted:", totalInserted, "| deleted:", totalDeleted, "| apiErrors:", apiErrors);
          _context34.n = 4;
          break;
        case 3:
          _context34.p = 3;
          _t15 = _context34.v;
          errL("ERROR in checkDocumentText:", _t15);
        case 4:
          return _context34.a(2);
      }
    }, _callee34, null, [[1, 3]]);
  }));
  return _checkDocumentTextDesktop.apply(this, arguments);
}
function checkDocumentTextOnline() {
  return _checkDocumentTextOnline.apply(this, arguments);
}
function _checkDocumentTextOnline() {
  _checkDocumentTextOnline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee36() {
    var paragraphsProcessed, suggestions, apiErrors, _t17;
    return _regenerator().w(function (_context36) {
      while (1) switch (_context36.p = _context36.n) {
        case 0:
          log("START checkDocumentTextOnline()");
          paragraphsProcessed = 0;
          suggestions = 0;
          apiErrors = 0;
          _context36.p = 1;
          _context36.n = 2;
          return Word.run(/*#__PURE__*/function () {
            var _ref40 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee35(context) {
              var paras, documentCharOffset, idx, _result$suggestions, p, original, normalizedOriginal, trimmed, paragraphDocOffset, result, _iterator11, _step11, suggestionObj, highlighted, _t16;
              return _regenerator().w(function (_context35) {
                while (1) switch (_context35.p = _context35.n) {
                  case 0:
                    _context35.n = 1;
                    return documentHasTrackedChanges(context);
                  case 1:
                    if (!_context35.v) {
                      _context35.n = 2;
                      break;
                    }
                    notifyTrackedChangesPresent();
                    return _context35.a(2);
                  case 2:
                    _context35.n = 3;
                    return wordOnlineAdapter.getParagraphs(context);
                  case 3:
                    paras = _context35.v;
                    _context35.n = 4;
                    return wordOnlineAdapter.clearHighlights(context, null, paras);
                  case 4:
                    resetPendingSuggestionsOnline();
                    anchorProvider.reset();
                    documentCharOffset = 0;
                    idx = 0;
                  case 5:
                    if (!(idx < paras.items.length)) {
                      _context35.n = 18;
                      break;
                    }
                    p = paras.items[idx];
                    original = p.text || "";
                    normalizedOriginal = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.normalizeParagraphWhitespace)(original);
                    trimmed = normalizedOriginal.trim();
                    paragraphDocOffset = documentCharOffset;
                    documentCharOffset += original.length + 1;
                    if (trimmed) {
                      _context35.n = 7;
                      break;
                    }
                    _context35.n = 6;
                    return anchorProvider.getAnchors({
                      paragraphIndex: idx,
                      originalText: original,
                      correctedText: original,
                      sourceTokens: [],
                      targetTokens: [],
                      documentOffset: paragraphDocOffset
                    });
                  case 6:
                    return _context35.a(3, 17);
                  case 7:
                    log("P".concat(idx, " ONLINE: len=").concat(original.length, " | \"").concat(SNIP(trimmed), "\""));
                    paragraphsProcessed++;
                    _context35.n = 8;
                    return commaEngine.analyzeParagraph({
                      paragraphIndex: idx,
                      originalText: original,
                      normalizedOriginalText: normalizedOriginal,
                      paragraphDocOffset: paragraphDocOffset
                    });
                  case 8:
                    result = _context35.v;
                    apiErrors += result.apiErrors;
                    if ((_result$suggestions = result.suggestions) !== null && _result$suggestions !== void 0 && _result$suggestions.length) {
                      _context35.n = 9;
                      break;
                    }
                    return _context35.a(3, 17);
                  case 9:
                    _iterator11 = _createForOfIteratorHelper(result.suggestions);
                    _context35.p = 10;
                    _iterator11.s();
                  case 11:
                    if ((_step11 = _iterator11.n()).done) {
                      _context35.n = 14;
                      break;
                    }
                    suggestionObj = _step11.value;
                    _context35.n = 12;
                    return wordOnlineAdapter.highlightSuggestion(context, p, suggestionObj);
                  case 12:
                    highlighted = _context35.v;
                    if (highlighted) {
                      suggestions++;
                    }
                  case 13:
                    _context35.n = 11;
                    break;
                  case 14:
                    _context35.n = 16;
                    break;
                  case 15:
                    _context35.p = 15;
                    _t16 = _context35.v;
                    _iterator11.e(_t16);
                  case 16:
                    _context35.p = 16;
                    _iterator11.f();
                    return _context35.f(16);
                  case 17:
                    idx++;
                    _context35.n = 5;
                    break;
                  case 18:
                    _context35.n = 19;
                    return context.sync();
                  case 19:
                    return _context35.a(2);
                }
              }, _callee35, null, [[10, 15, 16, 17]]);
            }));
            return function (_x89) {
              return _ref40.apply(this, arguments);
            };
          }());
        case 2:
          log("DONE checkDocumentTextOnline() | paragraphs:", paragraphsProcessed, "| suggestions:", suggestions, "| apiErrors:", apiErrors);
          _context36.n = 4;
          break;
        case 3:
          _context36.p = 3;
          _t17 = _context36.v;
          errL("ERROR in checkDocumentTextOnline:", _t17);
        case 4:
          return _context36.a(2);
      }
    }, _callee36, null, [[1, 3]]);
  }));
  return _checkDocumentTextOnline.apply(this, arguments);
}

/***/ }),

/***/ "./src/utils/host.js":
/*!***************************!*\
  !*** ./src/utils/host.js ***!
  \***************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isWordOnline: function() { return /* binding */ isWordOnline; }
/* harmony export */ });
/* global Office */

var isWordOnline = function isWordOnline() {
  var _Office, _Office2;
  var platform = (_Office = Office) === null || _Office === void 0 || (_Office = _Office.context) === null || _Office === void 0 ? void 0 : _Office.platform;
  var onlineConst = (_Office2 = Office) === null || _Office2 === void 0 || (_Office2 = _Office2.PlatformType) === null || _Office2 === void 0 ? void 0 : _Office2.OfficeOnline;
  return platform === onlineConst || platform === "OfficeOnline";
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
!function() {
/*!**********************************!*\
  !*** ./src/commands/commands.js ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../logic/preveriVejice.js */ "./src/logic/preveriVejice.js");
/* harmony import */ var _utils_host_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/host.js */ "./src/utils/host.js");
var _process$env$VEJICE_U, _process$env2;
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/* global Office, Word, window, process, performance, console, URLSearchParams */

// Wire your checker and expose globals the manifest calls.


var envIsProd = function envIsProd() {
  var _process$env;
  return typeof process !== "undefined" && ((_process$env = process.env) === null || _process$env === void 0 ? void 0 : "development") === "production" || typeof window !== "undefined" && window.__VEJICE_ENV__ === "production";
};
var DEBUG_OVERRIDE = typeof window !== "undefined" && typeof window.__VEJICE_DEBUG__ === "boolean" ? window.__VEJICE_DEBUG__ : undefined;
var DEBUG = typeof DEBUG_OVERRIDE === "boolean" ? DEBUG_OVERRIDE : !envIsProd();
var log = function log() {
  var _console;
  for (var _len = arguments.length, a = new Array(_len), _key = 0; _key < _len; _key++) {
    a[_key] = arguments[_key];
  }
  return DEBUG && (_console = console).log.apply(_console, ["[Vejice CMD]"].concat(a));
};
var errL = function errL() {
  var _console2;
  for (var _len2 = arguments.length, a = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    a[_key2] = arguments[_key2];
  }
  return (_console2 = console).error.apply(_console2, ["[Vejice CMD]"].concat(a));
};
var tnow = function tnow() {
  var _performance$now, _performance, _performance$now2;
  return (_performance$now = (_performance = performance) === null || _performance === void 0 || (_performance$now2 = _performance.now) === null || _performance$now2 === void 0 ? void 0 : _performance$now2.call(_performance)) !== null && _performance$now !== void 0 ? _performance$now : Date.now();
};
var done = function done(event, tag) {
  try {
    event && event.completed && event.completed();
  } catch (e) {
    errL("".concat(tag, ": event.completed() threw"), e);
  }
};
var revisionsApiSupported = function revisionsApiSupported() {
  try {
    var _Office, _Office$isSetSupporte;
    return Boolean((_Office = Office) === null || _Office === void 0 || (_Office = _Office.context) === null || _Office === void 0 || (_Office = _Office.requirements) === null || _Office === void 0 || (_Office$isSetSupporte = _Office.isSetSupported) === null || _Office$isSetSupporte === void 0 ? void 0 : _Office$isSetSupporte.call(_Office, "WordApi", "1.3"));
  } catch (err) {
    errL("Failed to check requirement set support", err);
    return false;
  }
};
var boolFromString = function boolFromString(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    var trimmed = value.trim().toLowerCase();
    if (!trimmed) return undefined;
    if (["1", "true", "yes", "on"].includes(trimmed)) return true;
    if (["0", "false", "no", "off"].includes(trimmed)) return false;
  }
  return undefined;
};
var queryMockFlag;
if (typeof window !== "undefined" && typeof URLSearchParams !== "undefined") {
  try {
    var params = new URLSearchParams(window.location.search || "");
    var q = params.get("mock");
    if (q !== null) queryMockFlag = boolFromString(q);
  } catch (err) {
    errL("Failed to parse ?mock query param", err);
  }
}
var envMockFlag = typeof process !== "undefined" ? boolFromString((_process$env$VEJICE_U = (_process$env2 = process.env) === null || _process$env2 === void 0 ? void 0 : "false") !== null && _process$env$VEJICE_U !== void 0 ? _process$env$VEJICE_U : "") : undefined;
var resolvedMock;
if (typeof queryMockFlag === "boolean") {
  resolvedMock = queryMockFlag;
} else if (typeof envMockFlag === "boolean") {
  resolvedMock = envMockFlag;
}
if (typeof window !== "undefined" && typeof resolvedMock === "boolean") {
  window.__VEJICE_USE_MOCK__ = resolvedMock;
  if (resolvedMock) log("Mock API mode is ENABLED");
}
Office.onReady(function () {
  var _Office2, _Office3;
  log("Office ready | Host:", (_Office2 = Office) === null || _Office2 === void 0 || (_Office2 = _Office2.context) === null || _Office2 === void 0 ? void 0 : _Office2.host, "| Platform:", (_Office3 = Office) === null || _Office3 === void 0 ? void 0 : _Office3.platform);
});

// —————————————————————————————————————————————
// Ribbon commands (must be globals)
// —————————————————————————————————————————————
window.checkDocumentText = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(event) {
    var t0, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          t0 = tnow();
          log("CLICK: Preveri vejice (checkDocumentText)");
          _context.p = 1;
          _context.n = 2;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.checkDocumentText)();
        case 2:
          log("DONE: checkDocumentText |", Math.round(tnow() - t0), "ms");
          _context.n = 4;
          break;
        case 3:
          _context.p = 3;
          _t = _context.v;
          errL("checkDocumentText failed:", _t);
        case 4:
          _context.p = 4;
          done(event, "checkDocumentText");
          log("event.completed(): checkDocumentText");
          return _context.f(4);
        case 5:
          return _context.a(2);
      }
    }, _callee, null, [[1, 3, 4, 5]]);
  }));
  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
window.acceptAllChanges = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(event) {
    var t0, _getPendingSuggestion, _getPendingSuggestion2, _getPendingSuggestion3, _getPendingSuggestion4, pendingBefore, pendingAfter, _err$message, _t2;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          t0 = tnow();
          log("CLICK: Sprejmi spremembe (acceptAllChanges)");
          _context3.p = 1;
          if (!(0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)()) {
            _context3.n = 3;
            break;
          }
          pendingBefore = (_getPendingSuggestion = (_getPendingSuggestion2 = (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.getPendingSuggestionsOnline)(true)) === null || _getPendingSuggestion2 === void 0 ? void 0 : _getPendingSuggestion2.length) !== null && _getPendingSuggestion !== void 0 ? _getPendingSuggestion : 0;
          log("Pending online suggestions before apply:", pendingBefore);
          _context3.n = 2;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.applyAllSuggestionsOnline)();
        case 2:
          pendingAfter = (_getPendingSuggestion3 = (_getPendingSuggestion4 = (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.getPendingSuggestionsOnline)(true)) === null || _getPendingSuggestion4 === void 0 ? void 0 : _getPendingSuggestion4.length) !== null && _getPendingSuggestion3 !== void 0 ? _getPendingSuggestion3 : 0;
          log("Pending online suggestions after apply:", pendingAfter);
          log("Applied online suggestions |", Math.round(tnow() - t0), "ms");
          _context3.n = 5;
          break;
        case 3:
          if (revisionsApiSupported()) {
            _context3.n = 4;
            break;
          }
          throw new Error("Revisions API is not available on this host");
        case 4:
          _context3.n = 5;
          return Word.run(/*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(context) {
              var revisions, count;
              return _regenerator().w(function (_context2) {
                while (1) switch (_context2.n) {
                  case 0:
                    revisions = context.document.revisions;
                    revisions.load("items");
                    _context2.n = 1;
                    return context.sync();
                  case 1:
                    count = revisions.items.length;
                    log("Revisions to accept:", count);
                    revisions.items.forEach(function (rev) {
                      return rev.accept();
                    });
                    _context2.n = 2;
                    return context.sync();
                  case 2:
                    log("Accepted revisions:", count, "|", Math.round(tnow() - t0), "ms");
                  case 3:
                    return _context2.a(2);
                }
              }, _callee2);
            }));
            return function (_x3) {
              return _ref3.apply(this, arguments);
            };
          }());
        case 5:
          _context3.n = 7;
          break;
        case 6:
          _context3.p = 6;
          _t2 = _context3.v;
          if (_t2 !== null && _t2 !== void 0 && (_err$message = _t2.message) !== null && _err$message !== void 0 && _err$message.includes("Revisions API is not available")) {
            errL("acceptAllChanges skipped: revisions API is not available on this host");
          } else {
            errL("acceptAllChanges failed:", _t2);
          }
        case 7:
          _context3.p = 7;
          done(event, "acceptAllChanges");
          log("event.completed(): acceptAllChanges");
          return _context3.f(7);
        case 8:
          return _context3.a(2);
      }
    }, _callee3, null, [[1, 6, 7, 8]]);
  }));
  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}();
window.rejectAllChanges = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(event) {
    var t0, _err$message2, _t3;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          t0 = tnow();
          log("CLICK: Zavrni spremembe (rejectAllChanges)");
          _context5.p = 1;
          if (!(0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)()) {
            _context5.n = 3;
            break;
          }
          _context5.n = 2;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.rejectAllSuggestionsOnline)();
        case 2:
          log("Cleared online suggestions |", Math.round(tnow() - t0), "ms");
          _context5.n = 5;
          break;
        case 3:
          if (revisionsApiSupported()) {
            _context5.n = 4;
            break;
          }
          throw new Error("Revisions API is not available on this host");
        case 4:
          _context5.n = 5;
          return Word.run(/*#__PURE__*/function () {
            var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(context) {
              var revisions, count;
              return _regenerator().w(function (_context4) {
                while (1) switch (_context4.n) {
                  case 0:
                    revisions = context.document.revisions;
                    revisions.load("items");
                    _context4.n = 1;
                    return context.sync();
                  case 1:
                    count = revisions.items.length;
                    log("Revisions to reject:", count);
                    revisions.items.forEach(function (rev) {
                      return rev.reject();
                    });
                    _context4.n = 2;
                    return context.sync();
                  case 2:
                    log("Rejected revisions:", count, "|", Math.round(tnow() - t0), "ms");
                  case 3:
                    return _context4.a(2);
                }
              }, _callee4);
            }));
            return function (_x5) {
              return _ref5.apply(this, arguments);
            };
          }());
        case 5:
          _context5.n = 7;
          break;
        case 6:
          _context5.p = 6;
          _t3 = _context5.v;
          if (_t3 !== null && _t3 !== void 0 && (_err$message2 = _t3.message) !== null && _err$message2 !== void 0 && _err$message2.includes("Revisions API is not available")) {
            errL("rejectAllChanges skipped: revisions API is not available on this host");
          } else {
            errL("rejectAllChanges failed:", _t3);
          }
        case 7:
          _context5.p = 7;
          done(event, "rejectAllChanges");
          log("event.completed(): rejectAllChanges");
          return _context5.f(7);
        case 8:
          return _context5.a(2);
      }
    }, _callee5, null, [[1, 6, 7, 8]]);
  }));
  return function (_x4) {
    return _ref4.apply(this, arguments);
  };
}();
}();
/******/ })()
;
//# sourceMappingURL=commands.js.map