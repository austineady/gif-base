/* eslint-disable */
'use strict';

let config = {
  contentType: 'application/x-www-form-urlencoded'
};

function parse(req) {
  var result;
  try {
    result = JSON.parse(req.responseText);
  } catch (e) {
    result = req.responseText;
  }
  return result;
}

function xhr(type, url, data, cb) {
  const XHR = window.XMLHttpRequest || ActiveXObject;
  const request = new XHR('MSXML2.XMLHTTP.3.0');

  request.open(type, url, true);
  request.setRequestHeader('Content-type', config.contentType);
  request.onreadystatechange = function() {
    let req;
    if (request.readyState === 4) {
      req = parse(request);
      if (request.status >= 200 && request.status < 300) {
        cb(null, req);
      } else {
        cb(req);
      }
    }
  };
  request.send(data);
}

export default {
  get(src) {
    return new Promise(function(resolve, reject) {
      xhr('GET', src, null, function(err, res) {
        if (err) reject(err);
        else resolve(res);
      });
    });
  },
  put(url, data) {
    return new Promise(function(resolve, reject) {
      xhr('PUT', url, data, function(err, res) {
        if (err) reject(err);
        else resolve(res);
      });
    });
  },
  post(url, data) {
    return new Promise(function(resolve, reject) {
      xhr('POST', url, data, function(err, res) {
        if (err) reject(err);
        else resolve(res);
      });
    });
  },
  delete(url) {
    return new Promise(function(resolve, reject) {
      xhr('DELETE', url, null, function(err, res) {
        if (err) reject(err);
        else resolve(res);
      });
    });
  },
  setContentType(value) {
    config.contentType = value;
  }
};