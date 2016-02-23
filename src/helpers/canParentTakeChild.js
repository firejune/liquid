export default function canParentTakeChild(parent, child) {
  return parent && child && parent.canTakeChild(child) && child.canBeDroppedIn(parent);
}
