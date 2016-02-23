export default function parsePath(str, platform) {
  platform = platform || electron && electron.os || 'linux';

  let separator = '/';
  if (platform === 'windows') {
    separator = '\\';
  }

  const tmp = String(str).split(separator);
  let extname = '';
  let dirname = '';
  let basename = '';
  let name = '';

  if (tmp.length === 1) {
    basename = name = tmp[0];
  } else {
    basename = tmp.slice(-1)[0];
    dirname = tmp.slice(0, -1).join(separator);
  }

  const ext = basename.split('.');
  if (ext.length === 1) {
    name = ext[0];
  } else {
    extname = `.${ext.slice(-1)[0]}`;
    name = ext.slice(0, -1).join('.');
  }

  return {
    extname,
    dirname,
    basename,
    name
  };
}
