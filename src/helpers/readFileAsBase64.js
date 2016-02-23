import fs from 'fs';
import path from 'path';

const mime = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'application/x-font-ttf',
  '.otf': 'font/opentype',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif'
};

export default function readFileAsBase64(filepath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      const ext = path.extname(filepath);
      const arrayBuffer = fs.readFileSync(filepath);

      if (arrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        for (let i = 0, len = bytes.byteLength; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }

        resolve({
          content: window.btoa(binary),
          decode: 'base64',
          contentType: mime[ext] || 'text/plain'
        });
      } else {
        reject(new Error(`'${filepath}' has no content`));
      }
    } else {
      reject(new Error(`'${filepath}' is not exists`));
    }

    // if (request.status !== 200) return reject();
    /*
    return resolve({
      content: window.btoa(binary),
      decode: 'base64',
      contentType: request.getResponseHeader('content-type')
    });
    */

    /*
    const request = new XMLHttpRequest;
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = oEvent => {
      if (request.status !== 200) return reject();

      const arrayBuffer = request.response;
      if (arrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        for (let i = 0, len = bytes.byteLength; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }

        return resolve({
          content: window.btoa(binary),
          decode: 'base64',
          contentType: request.getResponseHeader('content-type')
        });
      } else {
        reject();
      }
    };

    request.send(null);
    */
  });
}
