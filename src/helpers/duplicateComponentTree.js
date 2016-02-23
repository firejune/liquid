import cleanupComponentTree from './cleanupComponentTree';
// import restoreComponentTree from './restoreComponentTree';

export default function duplicateComponentTree(elem) {
  const restoreComponentTree = require('./restoreComponentTree').default;
  const tree = restoreComponentTree(elem.serialize());

  cleanupComponentTree(tree);

  return tree;
}
