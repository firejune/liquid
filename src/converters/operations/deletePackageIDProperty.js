import walk from '../../helpers/walk';

export default function deletePackageIDProperty(tree) {
  walk(tree, component => {
    if (!component.properties) return;
    delete component.properties.packageID;
  });
}
