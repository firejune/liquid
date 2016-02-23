export default function callFuncArray(arr, args = []) {
  if (!Array.isArray(arr) || arr.length < 2) return false;
  if (!Array.isArray(args)) args = [args];

  let obj = arr[0];
  for (let i = 1; i < arr.length - 1; i++) {
    obj = obj[arr[i]];
  }

  return obj[arr[arr.length - 1]].apply(obj, args);
}
