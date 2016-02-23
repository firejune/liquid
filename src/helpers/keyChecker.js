export default function keyChecker(linWinCondition, OSXCondition) {
  if (window.electron && electron.os === 'osx' && OSXCondition !== undefined) {
    return OSXCondition;
  }
  return linWinCondition;
}
