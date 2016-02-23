export default function executeCall(dropCall) {
  return dropCall.object[dropCall.method].apply(dropCall.object, dropCall.arguments || []);
}
