export default function deletePackageIDOriginFromCSS(blocks) {
  for (const block of blocks) {
    delete block.packageID;
    delete block.origin;
  }
}
