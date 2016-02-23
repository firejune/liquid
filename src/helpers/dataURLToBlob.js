export default function dataURLToBlob(dataURL) {
  const split = dataURL.split(',');
  const type = split[0].match(/data:(.*);base64/)[1];
  const binary = atob(split[1]);
  const array = new Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([new Uint8Array(array)], {
    type
  });
}
