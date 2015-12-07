import needle from 'needle';
import fs from 'fs';
import log from './logger';
let sessionHeaders;

export function get(filePath) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath, function(err, buf) {
            if (err) reject(err);
            else resolve(buf.toString());
        });
    });
}

function getSessionHeaders(config) {
  return new Promise(function(resolve, reject) {
    if (sessionHeaders) resolve(sessionHeaders);
    else {
      needle.head(config.url, function(err, res) {
        if (err) reject(err);
        else {
          sessionHeaders = {
            Authorization: 'Basic ' + new Buffer(config.username + ':' + config.password, 'utf8').toString('base64'),
          }
          const csrf = res.headers['x-bbxsrf'];
          if (csrf) sessionHeaders['X-BBXSRF'] = csrf;

          resolve(sessionHeaders);
        }
      });
    }
  });
}

function parseNeedleResponse(res) {
  return {
    status: res.statusCode,
    statusText: res.statusMessage,
    headers: {
        get: (name) => res.headers[name.toLowerCase()],
        _raw: res.headers
    },
    text: () => Promise.resolve(res.body.toString()),
  };
}

/**
 * config properties:
 * url - string - url to call
 * method - string - http method
 * query - object - query hash
 * headers - object - headers hash
 * body - string - body to send
 * username - string - username
 * password - string - password
 * file - string - file path for upload/download
 * upload - string - name of the form field for upload
 * download - boolean - true if response is stream to download
 */
export function request(config) {
    return getSessionHeaders(config)
      .then(function(headers) {
        Object.assign(config.headers, headers);
        log('Headers', config.headers);

        return new Promise(function(resolve, reject) {
          needle.request(
            config.method,
            config.url,
            config.body,
            {
              headers: config.headers
            }, 
            function(err, res) {
              if (err) reject(err);
              else {
                if (config.headers.Authorization) {
                  sessionHeaders.Cookie = res.headers['set-cookie'];
                  delete sessionHeaders.Authorization;
                }
                resolve(parseNeedleResponse(res));
              }
            }
          );
        });
    }); 
}
