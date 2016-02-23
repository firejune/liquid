import ComponentWithChildren from './ComponentWithChildren';
// import ButtonOption from '../panes/ButtonOption';

const sizes = [{
  id: 'lg',
  title: 'LG'
}, {
  id: 'md',
  title: 'MD'
}, {
  id: 'sm',
  title: 'SM'
}, {
  id: 'xs',
  title: 'XS'
}];

const sizesIncreasingOrder = ['xs', 'sm', 'md', 'lg'];
const defaultWidthValues = {
  md: 12
};

export default class Column extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<div>');
    this.defineGroups([{
      id: 'col-size',
      label: 'Column Size'
    }, {
      id: 'col-offset',
      label: 'Column Offset',
      collapsed: true
    }, {
      id: 'col-push',
      label: 'Column Push',
      collapsed: true
    }, {
      id: 'col-pull',
      label: 'Column Pull',
      collapsed: true
    }]);

    this.defineProperties(sizes.map(s => {
      const options = [{
        label: 'None',
        value: -1
      }];

      for (let i = 1; i <= 12; i++) {
        options.push({
          label: String(i),
          value: i
        });
      }

      return {
        id: `col${s.id}`,
        label: s.title,
        type: 'select',
        value: defaultWidthValues[s.id] || -1,
        options,
        group: 'col-size'
      };
    }));

    this.defineProperties(sizes.map(s => {
      const options = [{
        label: 'None',
        value: -1
      }, {
        label: '0',
        value: 0
      }];

      for (let i = 1; i <= 12; i++) {
        options.push({
          label: String(i),
          value: i
        });
      }

      return {
        id: `col${s.id}Offset`,
        label: s.title,
        type: 'select',
        value: -1,
        options,
        group: 'col-offset'
      };
    }));

    this.defineProperties(sizes.map(s => {
      const options = [{
        label: 'None',
        value: -1
      }, {
        label: '0',
        value: 0
      }];

      for (let i = 1; i <= 12; i++) {
        options.push({
          label: String(i),
          value: i
        });
      }

      return {
        id: `col${s.id}Push`,
        label: s.title,
        type: 'select',
        value: -1,
        options,
        group: 'col-push'
      };
    }));

    this.defineProperties(sizes.map(s => {
      const options = [{
        label: 'None',
        value: -1
      }, {
        label: '0',
        value: 0
      }];

      for (let i = 1; i <= 12; i++) {
        options.push({
          label: String(i),
          value: i
        });
      }

      return {
        id: `col${s.id}Pull`,
        label: s.title,
        type: 'select',
        value: -1,
        options,
        group: 'col-pull'
      };
    }));
  }

  moveLeftAction() {
    const size = app.canvas.getSize();
    const oldOffset = this.properties[`col${size}Offset`];
    const offset = this.getDefaultValue('col', size, 'Offset', 0);
    if (offset === 0) {
      return;
    }
    const newOffset = offset - 1;
    this.properties[`col${size}Offset`] = newOffset;
    this.update();

    app.context.history.add({
      name: 'Change Column Offset',
      undo: () => {
        this.properties[`col${size}Offset`] = oldOffset;
        this.update();
      },
      redo: () => {
        this.properties[`col${size}Offset`] = newOffset;
        this.update();
      }
    });
  }

  moveRightAction() {
    const size = app.canvas.getSize();
    const oldOffset = this.properties[`col${size}Offset`];
    const offset = this.getDefaultValue('col', size, 'Offset', 0);
    if (offset === 12) {
      return;
    }
    const newOffset = offset + 1;
    this.properties[`col${size}Offset`] = newOffset;
    this.update();
    app.context.history.add({
      name: 'Change Column Offset',
      undo: () => {
        this.properties[`col${size}Offset`] = oldOffset;
        this.update();
      },
      redo: () => {
        this.properties[`col${size}Offset`] = newOffset;
        this.update();
      }
    });
  }

  widenAction() {
    const size = app.canvas.getSize();
    const oldWidth = this.properties[`col${size}`];
    const width = this.getDefaultValue('col', size, '', 12);
    if (width === 12) {
      return;
    }
    const newWidth = width + 1;
    this.properties[`col${size}`] = newWidth;
    this.update();
    app.context.history.add({
      name: 'Change Column Width',
      undo: () => {
        this.properties[`col${size}`] = oldWidth;
        this.update();
      },
      redo: () => {
        this.properties[`col${size}`] = newWidth;
        this.update();
      }
    });
  }

  narrowAction() {
    const size = app.canvas.getSize();
    const oldWidth = this.properties[`col${size}`];
    const width = this.getDefaultValue('col', size, '', 12);
    if (width === 1) {
      return;
    }
    const newWidth = width - 1;
    this.properties[`col${size}`] = newWidth;
    this.update();
    app.context.history.add({
      name: 'Change Column Width',
      undo: () => {
        this.properties[`col${size}`] = oldWidth;
        this.update();
      },
      redo: () => {
        this.properties[`col${size}`] = newWidth;
        this.update();
      }
    });
  }

  getDefaultValue(prefix, id, postfix = '', def = 0) {
    let val = def;
    let tmp;

    for (let i = 0; i < sizesIncreasingOrder.length; i++) {
      tmp = this.properties[prefix + sizesIncreasingOrder[i] + postfix];
      if (tmp >= 0) {
        val = tmp;
      }

      if (sizesIncreasingOrder[i] === id) {
        break;
      }
    }

    return Number(val);
  }

  canBeDroppedIn(component) {
    return super.canBeDroppedIn(component) && !(component instanceof Column);
  }

  update() {
    this.cssClasses.system = '';
    sizes.forEach(s => {
      if (this.properties[`col${s.id}`] > 0) {
        this.cssClasses.system += ` col-${s.id}-` + this.properties[`col${s.id}`];
      }
      if (this.properties[`col${s.id}Offset`] >= 0) {
        this.cssClasses.system += ` col-${s.id}-offset-` + this.properties[`col${s.id}Offset`];
      }
      if (this.properties[`col${s.id}Push`] >= 0) {
        this.cssClasses.system += ` col-${s.id}-push-` + this.properties[`col${s.id}Push`];
      }
      if (this.properties[`col${s.id}Pull`] >= 0) {
        this.cssClasses.system += ` col-${s.id}-pull-` + this.properties[`col${s.id}Pull`];
      }
    });

    return super.update();
  }
}
