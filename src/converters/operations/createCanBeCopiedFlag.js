import walk from '../../helpers/walk';

export default function createCanBeCopiedFlag(tree) {
  walk(tree, component => {
    if (!component.flags) return;
    if (component.flags.canBeMoved === false) {
      component.flags.canBeCopied = false;
    }
  });
}
