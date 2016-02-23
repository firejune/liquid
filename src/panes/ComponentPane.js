import Pane from './Pane.js';
import components from '../components/';
import {filter} from 'fuzzaldrin';
// import Component from '../components/Component';
import Package from '../base/Package';
import executeDropCall from '../helpers/executeDropCall';
import smartEditableElement from '../helpers/smartEditableElement';
import enforceFileExtension from '../helpers/enforceFileExtension';
import buildBSComponentFormat from '../helpers/buildBSComponentFormat';
import parsePath from '../helpers/parsePath';

class ComponentPane extends Pane {
  constructor(elem) {
    super();

    this.element = elem;
    this.tabs = elem.find('.tabs');
    this.tabs.on('click', '.tab', this.tabClick.bind(this));
    this.searchString = '';
    this.searchInput = this.element.find('.studio input');
    this.searchInput.on('input', this.onSearch.bind(this));
    this.nothingFoundMessage = this.element.find('.nothing-found');

    const tmpSet = new Set;
    const keys = ['studio'];

    for (let i = 0; i < keys.length; i++) {
      const tmp = components[keys[i]];
      for (const c in tmp) {
        if (tmp.hasOwnProperty(c)) {
          tmp[c].forEach(co => tmpSet.add(co));
        }
      }
    }

    this.searchIndex = Array.from(tmpSet).map(item => {
      return {
        name: item.getName(),
        func: item
      };
    });

    this.suggestedHolder = this.element.find('.suggested');
    this.suggestedHolder.find('.category-name').on('click', this.suggestedToggle.bind(this));
    this.activeTab = 'studio';
    this.suggestedComponents = [];
    this.smartEditable = smartEditableElement({
      element: elem,
      onCommit: this.componentEdit.bind(this),
      onDelete: this.componentDelete.bind(this)
    });

    this.element.on('mousedown', '.item', this.mousedown.bind(this));
    this.element.on('click', '.item .menu', this.packageMenuClick.bind(this));
    this.element.on('mousedown', '.item .menu', false);
    this.element.on('click', '.no-components .button', e => {
      app.openURLInBrowser(e.target.href);
      e.preventDefault();
    });

    app.on('context-activated', () => {
      this.suggestedComponents = [];
      this.update();
    });

    app.on('component-focused', component => {
      this.suggestedComponents = component.constructor.suggestedComponents || [];
      this.scheduleSuggestedUpdate();
    });

    app.on('component-blurred', () => {
      this.suggestedComponents = [];
      this.scheduleSuggestedUpdate();
    });

    app.on('package-changed package-created package-deleted', () => {
      if (this.activeTab === 'user') {
        this.updatePackageList();
      } else {
        this.showTabBadge('user');
      }
    });
  }

  packageMenuClick(e) {
    const elem = $(e.currentTarget);
    const offset = elem.offset();
    const editable = elem.closest('.smart-editable');
    const pkg = editable.data('item');

    app.contextMenu.show(offset.left, offset.top + elem.height(), [{
      name: 'Rename',
      action: () => {
        this.smartEditable.startEditing(editable);
      }
    }, {
      name: 'Export',
      action: () => {
        let lastDesignPath = electron.readSetting('lastDesignPath');
        lastDesignPath = lastDesignPath ? lastDesignPath + electron.pathSeparator : '';

        electron.showFileSaveDialog({
          title: 'Export Component',
          defaultPath: `${lastDesignPath}${pkg.name}.bscomp`,
          filters: [{
            name: 'Psyclone Studio Component (.bscomp)',
            extensions: ['bscomp']
          }]
        }, path => {
          if (!path) return;

          path = enforceFileExtension(path, 'bscomp');
          electron.saveSetting('lastDesignPath', parsePath(path).dirname);

          const content = JSON.stringify(buildBSComponentFormat(pkg));
          electron.writeFile(path, content, 'gzip').catch(err => {
            app.alertDialog.open({
              title: 'Can\'t Write',
              message: 'An error occured and the file couldn\'t be written.'
            });
            console.error(err);
          });
        });
      }
    }, {
      name: 'Delete',
      action: () => {
        this.smartEditable.delete(editable);
      }
    }]);
  }

  showTabBadge(tab) {
    this.element.find(`.tabs .${tab}`).addClass('has-badge');
  }

  hideBadges() {
    this.element.find('.has-badge').removeClass('has-badge');
  }

  componentEdit(elem, newName) {
    if (!newName.trim().length) {
      return false;
    }

    const item = elem.data('item');
    const oldName = item.name;
    app.renamePackage(item, newName);
    app.context.history.add({
      name: 'Rename Component',
      undo: () => {
        app.renamePackage(item, oldName);
      },
      redo: () => {
        app.renamePackage(item, newName);
      }
    });
  }

  componentDelete(elem) {
    const item = elem.data('item');
    app.removePackage(item);
    app.context.history.add({
      name: 'Delete Component',
      undo: () => {
        app.addPackage(item);
      },
      redo: () => {
        app.removePackage(item);
      }
    });
  }

  tabClick(e) {
    const elem = $(e.target);
    if (elem.is('.active')) return;
    this.activeTab = elem.data('tab');
    this.updateTabs();
  }

  scheduleSuggestedUpdate() {
    clearTimeout(this._suggestedUpdateTimeout);

    this._suggestedUpdateTimeout = setTimeout(() => {
      this.updateSuggested();
    }, 30);
  }

  onSearch(e) {
    this.searchString = e.currentTarget.value;
    clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(this.updateComponentList.bind(this), 100);
  }

  mousedown(e) {
    const toolButton = $(e.currentTarget);
    const offset = toolButton.offset();
    if (toolButton.hasClass('editing')) return;

    e.preventDefault();
    const Item = toolButton.data('item');
    const dragProperties = {
      component: null,
      origin: {
        top: offset.top,
        left: offset.left,
        width: toolButton.outerWidth(),
        height: toolButton.outerHeight()
      }
    };

    dragProperties.dropHistory = 'Add New Component To Design';

    if (Item instanceof Function) {
      const elem = new Item;
      elem.initialize();
      dragProperties.component = elem;
      dragProperties.dropActionUndo = function() {
        const parent = dragProperties.component.parent;
        dragProperties.component.remove();
        parent.update();
      };
    } else if (Item instanceof Package) {
      dragProperties.component = Item.createTree();
      const op = Item.addResourcesToContextOperation(app.context);
      dragProperties.dropAction = function(dropCall) {
        executeDropCall(dropCall);
        op.do();
        app.designPane.update();
        app.canvas.refreshCSS();
        dragProperties.component.page().update();
      };
      dragProperties.dropActionUndo = function() {
        const parent = dragProperties.component.parent;
        dragProperties.component.remove();
        op.undo();
        app.designPane.update();
        app.canvas.refreshCSS();
        parent.update();
      };
    }

    app.dragStart(dragProperties);
  }

  update() {
    this.updateSuggested();
    this.updateTabs();
    return this.element;
  }

  updateTabs() {
    this.tabs.find('.active').removeClass('active');
    this.tabs.find(`.tab.${this.activeTab}`).addClass('active');
    this.element.find('.tab-target').removeClass('active');
    this.element.find(`.tab-target.${this.activeTab}`).addClass('active');

    if (this.activeTab === 'user') {
      this.updatePackageList();
    } else {
      this.updateComponentList();
    }
    this.hideBadges();
  }

  suggestedToggle() {
    this.suggestedHolder.toggleClass('collapsed');
  }

  updateSuggested() {
    const elem = this.element.find('.suggested-list').empty();
    const build = [];
    for (let i = 0; i < this.suggestedComponents.length; i++) {
      build.push(createComponentItem(components.all[this.suggestedComponents[i]]));
    }
    elem.html(build);
    this.suggestedHolder.toggle(build.length > 0);
  }

  updateComponentList() {
    let found = this.searchIndex;
    const searchString = this.searchString.trim();
    const searching = searchString.length > 0;
    const container = this.element.find('.tab-target.studio .list').empty();
    const build = [];

    let categoryDiv;
    const list = components.studio;
    this.nothingFoundMessage.hide();

    if (searching) {
      found = filter(found, searchString, {
        key: 'name'
      });
      if (!found.length) {
        this.nothingFoundMessage.show();
        return;
      }
      container.html(found.map(f => createComponentItem(f.func)));
      return;
    }

    for (const c in list) {
      if (list.hasOwnProperty(c)) {
        categoryDiv = $(
          `<div class="component-category"><span class="category-name">${c}</span></div>`
        );
        for (let i = 0; i < list[c].length; i++) {
          categoryDiv.append(createComponentItem(list[c][i]));
        }
        build.push(categoryDiv);
      }
    }

    container.html(build);
  }

  updatePackageList() {
    const container = this.element.find('.tab-target.user .list');
    const message = this.element.find('.tab-target.user .no-components').hide();
    const build = [];

    for (const pkg of app.packages) {
      build.push(createPackageItem(pkg));
    }

    container.html(build);

    if (!build.length) {
      message.show();
    }
  }
}

function createComponentItem(item) {
  const tmp = $(
    '<div class="item gray-item"><span class="badge"></span><span class="name"></span></div>'
  );

  tmp.find('.badge').text(item.getName().slice(0, 1).toLowerCase());
  tmp.find('.name').text(item.getName());
  tmp.data('item', item);
  return tmp;
}

function createPackageItem(item) {
  const tmp = $(
    '<div class="item gray-item smart-editable">' +
    '<span class="badge"><i class="material-icon star">star</i></span>' +
    '<span class="name"></span>' + '<input type="text" value="" />' +
    '<span class="menu"><span></span></span>' +
    '<span class="save"><i class="material-icon check">check</i></span>' +
    '</div>'
  );
  tmp.find('.name').text(item.name);
  tmp.data('item', item);
  return tmp;
}

export default ComponentPane;
