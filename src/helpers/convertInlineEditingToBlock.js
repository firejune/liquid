import clone from 'clone';

const p = {
  'class': 'Paragraph',
  cssClasses: {
    system: {},
    parent: ''
  },
  overrides: {},
  flags: {
    canBeMoved: true,
    canBeDeleted: true,
    canBeDuplicated: true,
    canBeEdited: true,
    canBePackaged: true
  },
  properties: {
    'text-lead': false,
    'text-alignment': '',
    'text-nowrap': false,
    'text-transformation': '',
    'contextual-color': '',
    'contextual-background': ''
  },
  children: []
};

export default function convertInlineEditingToBlock(component) {
  component.flags.canBeEdited = false;

  let paragraphStarted = false;
  const newChildren = [];
  for (let i = 0; i < component.children.length; i++) {
    if (component.children[i].class === 'InlineCharacter') {
      if (!paragraphStarted) {
        newChildren.push(clone(p));
        paragraphStarted = true;
      }
      newChildren[newChildren.length - 1].children.push(component.children[i]);
    } else {
      paragraphStarted = false;
      newChildren.push(component.children[i].children[0]);
    }
  }
  component.children = newChildren;
  return component;
}
