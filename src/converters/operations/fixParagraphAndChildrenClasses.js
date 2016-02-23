import walk from '../../helpers/walk';

export default function fixParagraphAndChildrenClasses(tree) {
  walk(tree, component => {
    if ((component.class === 'Caption' || component.class === 'Paragraph')
      && component.cssClasses.system.main) {
      component.cssClasses.system.lead = component.cssClasses.system.main;
      delete component.cssClasses.system.main;
    }

    if (component.class === 'HelpTextBlock' || component.class === 'StaticControl') {
      const cls = component.cssClasses.system;
      component.cssClasses.system = {
        main: cls
      };
    }
  });
}
