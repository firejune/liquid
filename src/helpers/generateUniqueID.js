export default function generateUniqueID(exists) {
  let i = 1;
  while (i < 1e5) {
    if (!exists(i)) return i;
    i++;
  }
  return null;
}
