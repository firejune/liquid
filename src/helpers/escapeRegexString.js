const regexEscape = /[-\/\\^$*+?.()|[\]{}]/g;

export default function escapeRegexString(str) {
  return str.replace(regexEscape, '\\$&');
}
