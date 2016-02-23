const cleanRegex = /data\:.*base64,/;

export default function cleanUpDataURL(url) {
  return url.replace(cleanRegex, '');
}
