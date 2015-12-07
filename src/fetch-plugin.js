import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

let sessionHeaders;

export function get(filePath) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath, function(err, buf) {
            if (err) reject(err);
            else resolve(buf.toString());
        });
    });
}

function getCsrfToken(config) {
    return fetch(config.url, {
        method: 'HEAD'
    })
        .then(function(res) {
            config.headers['X-BBXSRF'] = res.headers.get('X-BBXSRF') || '';
            config.headers.Cookie = res.headers.get('Set-Cookie');
            return request(config);
        });
}
function getURI(config) {
    let out = config.url;
    if (Object.keys(config.query).length) {
        const params = [];
        for (const key in config.query) {
            if (config.query.hasOwnProperty(key)) {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(config.query[key]));
            }
        }
        out += '?' + params.join('&');
    }
    return out;
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
    if (config.csrf && !config.headers['X-BBXSRF']) {
        return getCsrfToken(config);
    }
    config.headers.Authorization = 'Basic ' + new Buffer(config.username + ':' + config.password, 'utf8').toString('base64');
    const req = {
        method: config.method,
        headers: config.headers,
        body: config.body,
    };

    if (config.upload) {
        req.body = new FormData();
        req.body[config.upload] = fs.createReadStream(config.file);
        console.log(req);
    }
    const promise = fetch(getURI(config), req);

    if (config.download) {
        promise.then(function(res) {
            // write file
            res.body._readableState
                .pipe(fs.createWriteStream(config.file), {
                    end: function() {
                        promise.resolve(res);
                    }
                })
                .on('error', function(err) {
                    promise.reject(err);
                });
        });
    }
    return promise;
}

