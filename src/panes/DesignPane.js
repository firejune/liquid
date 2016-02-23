import Pane from './Pane';
import smartEditableElement from '../helpers/smartEditableElement';
import mimeTypes from '../config/mime-types';
import parsePath from '../helpers/parsePath';
import callFuncArray from '../helpers/callFuncArray';
import Image from '../components/Image';
import JSResource from '../resources/JSResource';

class DesignPane extends Pane {
  constructor(elem) {
    super();

    this.element = elem;
    this.domToCategory = new WeakMap;
    this.domToGroup = new WeakMap;
    this.domToItem = new WeakMap;
    this.itemToDOM = new WeakMap;
    this.assetCategories = [{
      name: 'Pages',
      actions: [{
        name: 'Create New Page',
        action: [this, 'createNewPage']
      }],
      groups: [{
        getter: [app, 'context', 'pages', 'getAll'],
        setter: [this, 'pageSave'],
        actions: [{
          name: 'Open',
          action: [this, 'openPage'],
          condition: [this, 'canPageBeOpened']
        }, {
          name: 'Copy to',
          options: [this, 'pageCopyToOptions']
        }, {
          name: 'Duplicate',
          action: [this, 'duplicatePage']
        }, {
          name: 'Rename',
          action: [this, 'renameResourceAction']
        }, {
          name: 'Delete',
          action: [this, 'pageDeleteAction'],
          condition: [this, 'canPageBeDeleted']
        }],
        dbclick: [this, 'dbClickPage']
      }]
    }, {
      name: 'Styles',
      actions: [{
        name: 'Create New Stylesheet',
        action: [this, 'createNewCSSFile']
      }],
      groups: [{
        getter: [app, 'context', 'assets', 'css', 'getAll'],
        setter: [this, 'cssSave'],
        actions: [{
          name: 'Open',
          action: [this, 'openResource'],
          condition: [this, 'canResourceBeOpened']
        }, {
          name: 'Copy to',
          options: [this, 'cssCopyToOptions']
        }, {
          name: 'Duplicate',
          action: [this, 'duplicateCSS']
        }, {
          name: 'Rename',
          action: [this, 'renameResourceAction']
        }, {
          name: 'Delete',
          action: [this, 'cssDeleteAction']
        }],
        dbclick: [this, 'openResource']
      }]
    }, {
      name: 'JavaScript',
      actions: [{
        name: 'Create New JS',
        action: [this, 'createNewJSFile']
      }],
      groups: [{
        getter: [this, 'getDefaultJS'],
        locked: true
      }, {
        getter: [app, 'context', 'assets', 'js', 'getAll'],
        setter: [this, 'jsSave'],
        actions: [{
          name: 'Open',
          action: [this, 'openResource'],
          condition: [this, 'canResourceBeOpened']
        }, {
          name: 'Copy to',
          options: [this, 'jsCopyToOptions']
        }, {
          name: 'Rename',
          action: [this, 'renameResourceAction']
        }, {
          name: 'Delete',
          action: [this, 'jsDeleteAction']
        }],
        dbclick: [this, 'openResource']
      }]
    }, {
      name: 'Fonts',
      actions: [{
        name: 'Import Google Webfont',
        action: [this, 'importFontAction']
      }],
      groups: [{
        getter: [app, 'context', 'getThemeFonts'],
        locked: true
      }, {
        getter: [app, 'context', 'assets', 'fonts', 'getAll'],
        actions: [{
          name: 'Copy to',
          options: [this, 'fontCopyToOptions']
        }, {
          name: 'Delete',
          action: [this, 'fontDeleteAction']
        }]
      }]
    }, {
      name: 'Images',
      actions: [{
        name: 'Import Images',
        action: [this, 'importImageAction']
      }],
      groups: [{
        getter: [app, 'context', 'assets', 'images', 'getAll'],
        setter: [this, 'imageSave'],
        actions: [{
          name: 'Copy to',
          options: [this, 'imageCopyToOptions']
        }, {
          name: 'Rename',
          action: [this, 'renameResourceAction']
        }, {
          name: 'Delete',
          action: [this, 'imageDeleteAction']
        }],
        mouseenter: [this, 'mouseenterImage'],
        mouseleave: [this, 'mouseleaveImage'],
        mousedown: [this, 'mousedownImage']
      }]
    }];

    this.smartEditable = smartEditableElement({
      element: this.element,
      onStartEdit: this.assetStartSmartEdit.bind(this),
      onStopEdit: this.assetStopSmartEdit.bind(this),
      onCommit: this.assetCommitSmartEdit.bind(this)
    });

    this.imageTooltip = $('#image-asset-tooltip');
    this.imageTooltipShowTimeout = null;
    this.imageTooltipHideTimeout = null;
    this.imageTooltipVisible = false;
    this.mouseDownImage = false;

    this.element.on('mouseup', '.asset-category', this.mouseupAssetCategory.bind(this));
    this.element.on('mousedown', '.asset-item b', this.mousedownResource.bind(this));
    this.element.on('mouseup', '.asset-item b', this.mouseupResource.bind(this));
    this.element.on('mouseenter', '.asset-item b', this.mouseenterResource.bind(this));
    this.element.on('mouseleave', '.asset-item b', this.mouseleaveResource.bind(this));
    this.element.on('dblclick', '.asset-item b', this.dbclickResource.bind(this));

    app.on('context-menu-show', this.disableImageTooltip.bind(this));
    app.on('drag-start', this.disableImageTooltip.bind(this));
    app.on('context-menu-hide', this.enableImageTooltip.bind(this));
    app.on('drag-end', this.enableImageTooltip.bind(this));
    app.on('context-activated', this.contextActivated.bind(this));
    app.on('resize', this.appResized.bind(this));
    app.on('resource-changed', this.scheduleUpdate.bind(this));
  }

  assetStartSmartEdit() {
    this.disableImageTooltip();
  }

  assetStopSmartEdit() {
    this.enableImageTooltip();
  }

  assetCommitSmartEdit(item, newName) {
    const obj = this.domToItem.get(item[0]);
    const category = this.domToCategory.get(item[0]);
    const group = this.domToGroup.get(item[0]);

    if (!obj || !category || !group) return;

    newName = newName.trim();
    newName = obj.applyExtensionToName(newName);
    callFuncArray(group.setter, [obj, newName]);
  }

  appResized() {
    this.hideImageTooltip();
  }

  contextActivated() {
    this.scheduleUpdate();
  }

  mouseenterImage(image, e) {
    clearTimeout(this.imageTooltipShowTimeout);
    clearTimeout(this.imageTooltipHideTimeout);

    let delay = 250;
    if (this.imageTooltipVisible) delay = 50;

    const target = e.target.closest('.asset-item');
    this.imageTooltipShowTimeout = setTimeout(this.showImageTooltip.bind(this, target), delay);
  }

  /**
   * @param image
   * @param e
   */
  mouseleaveImage() {
    clearTimeout(this.imageTooltipShowTimeout);
    clearTimeout(this.imageTooltipHideTimeout);
    this.imageTooltipHideTimeout = setTimeout(this.hideImageTooltip.bind(this), 200);
  }

  mouseupAssetCategory(e) {
    const category = this.domToCategory.get(e.currentTarget);
    if (!category) return;

    if (e.button === 2) {
      const pos = app.mousePosition;

      let options = [];
      if (category.actions && category.actions.length) {
        options = category.actions.map(a => {
          return {
            name: a.name,
            action: () => callFuncArray(a.action, category)
          };
        });
      }
      app.contextMenu.show(pos.x, pos.y, options);
      return;
    }
    this.expandContract(category.name);
  }

  dbclickResource(e) {
    const node = e.currentTarget.parentNode;
    const group = this.domToGroup.get(node);
    if (!group) return;

    const item = this.domToItem.get(node);
    if (!item) return;

    if (group.dbclick) {
      callFuncArray(group.dbclick, [item, e]);
    }
  }

  mousedownResource(e) {
    const node = e.currentTarget.parentNode;
    const group = this.domToGroup.get(node);
    if (!group) return;

    const item = this.domToItem.get(node);
    if (!item) return;

    if (e.button === 2) {
      return;
    }

    if (group.mousedown) {
      callFuncArray(group.mousedown, [item, e]);
    }
  }

  mouseupResource(e) {
    const node = e.currentTarget.parentNode;
    const group = this.domToGroup.get(node);
    if (!group) return;

    const item = this.domToItem.get(node);
    if (!item) return;

    if (e.button === 2) {
      const pos = app.mousePosition;
      const options = [];
      if (group.actions && group.actions.length) {
        const visibleActions = group.actions.filter(a =>
          a.condition ? callFuncArray(a.condition, [item]) : true
        );

        for (const a of visibleActions) {
          (_a => {
            if (_a.action) {
              options.push({
                name: _a.name,
                action: () => callFuncArray(_a.action, [item, group])
              });
            } else if (a.options) {
              options.push({
                name: _a.name,
                options: callFuncArray(_a.options, [item])
              });
            }
          })(a);
        }
      }
      app.contextMenu.show(pos.x, pos.y, options);
    }
  }

  mouseenterResource(e) {
    const node = e.currentTarget.parentNode;
    const group = this.domToGroup.get(node);
    if (!group) return;

    const item = this.domToItem.get(node);
    if (!item) return;

    if (group.mouseenter) {
      callFuncArray(group.mouseenter, [item, e]);
    }
  }

  mouseleaveResource(e) {
    const node = e.currentTarget.parentNode;
    const group = this.domToGroup.get(node);
    if (!group) return;

    const item = this.domToItem.get(node);
    if (!item) return;

    if (group.mouseleave) {
      callFuncArray(group.mouseleave, [item, e]);
    }
  }

  getDefaultJS() {
    return [new JSResource('jquery.min.js'), new JSResource('bootstrap.min.js')];
  }

  showImageTooltip(target) {
    if (this.imageTooltipDisabled) return;

    const image = this.domToItem.get(target);
    if (!image) return;

    const img = new window.Image;
    img.onload = () => {
      const dimensions = `(${img.naturalWidth}x${img.naturalHeight})`;
      const rect = target.getBoundingClientRect();

      this.imageTooltip.css({
        top: rect.top + rect.height / 2,
        left: rect.left
      });
      this.imageTooltip.toggleClass('bottom', window.innerHeight - rect.bottom < 90);
      this.imageTooltip.find('.preview').css('background-image', `url(${image.blobURL})`);
      this.imageTooltip.find('.dimensions').text(dimensions);
      this.imageTooltip.fadeIn('fast');
      this.imageTooltipVisible = true;
    };

    img.src = image.blobURL;
  }

  /**
   * @param target
   */
  hideImageTooltip() {
    if (this.imageTooltipVisible) {
      this.imageTooltipVisible = false;
      this.imageTooltip.hide();
    }
  }

  disableImageTooltip() {
    this.imageTooltipDisabled = true;
    this.hideImageTooltip();
  }

  enableImageTooltip() {
    this.imageTooltipDisabled = false;
  }

  mousedownImage(item, e) {
    const target = $(e.currentTarget);
    const offset = target.offset();
    // const imageItem = target.closest('.asset-item');
    const img = new Image;

    img.initialize();
    img.properties.src = item.name;

    app.dragStart({
      component: img,
      origin: {
        top: offset.top,
        left: offset.left,
        width: target.outerWidth(),
        height: target.outerHeight()
      },
      dropActionUndo: () => {
        const parent = img.parent;
        img.remove();
        parent.update();
      }
    });
  }

  pageCopyToOptions(page) {
    return this.genericCopyToOptions(ctx => {
      const newPage = ctx.createPage(page.getNameWithoutExtension(), page.serialize());
      return {
        collection: ctx.pages,
        item: newPage
      };
    }, 'page', 'Insert Page');
  }

  cssCopyToOptions(css) {
    return this.genericCopyToOptions(ctx => {
      const newCSS = ctx.createCSS(css.getNameWithoutExtension(), css.serialize());
      return {
        collection: ctx.assets.css,
        item: newCSS
      };
    }, 'css', 'Insert Stylesheet');
  }

  jsCopyToOptions(js) {
    return this.genericCopyToOptions(ctx => {
      const newJS = ctx.createJS(js.getNameWithoutExtension(), js.serialize());
      return {
        collection: ctx.assets.js,
        item: newJS
      };
    }, 'js', 'Insert JS');
  }

  fontCopyToOptions(font) {
    return this.genericCopyToOptions(ctx => {
      if (ctx.assets.fonts.has(font.name)) {
        return false;
      }
      const newFont = ctx.assets.fonts.create(font.name, font.url);
      return {
        collection: ctx.assets.fonts,
        item: newFont
      };
    }, 'font', 'Insert Font');
  }

  imageCopyToOptions(img) {
    return this.genericCopyToOptions(ctx => {
      const newImage = ctx.createImage(
        img.getNameWithoutExtension(),
        img.extension,
        img.serialize()
      );

      return {
        collection: ctx.assets.images,
        item: newImage
      };
    }, 'image', 'Insert Image');
  }

  genericCopyToOptions(copyToDesignFn, type, title) {
    const options = [];

    for (const ctx of app.openedContexts) {
      if (ctx === app.context) continue;
      options.push({
        name: ctx.name,
        action: contextClick.bind(this, ctx)
      });
    }

    options.push({
      name: 'New Design',
      action: () => {
        const newDesign = app.createBlankDesign();
        app.openContext(newDesign);

        const target = copyToDesignFn(newDesign);
        if (!target) return;

        target.collection.add(target.item);
        newDesign.history.add({
          name: title,
          undo: () => {
            target.collection.remove(target.item);
            app.trigger('resource-changed', type, target.item);
          },
          redo: () => {
            target.collection.add(target.item);
            app.trigger('resource-changed', type, target.item);
          }
        });
      }
    });

    function contextClick(ctx) {
      const target = copyToDesignFn(ctx);
      if (!target) return;

      target.collection.add(target.item);
      ctx.history.add({
        name: title,
        undo: () => {
          target.collection.remove(target.item);
          app.trigger('resource-changed', type, target.item);
        },
        redo: () => {
          target.collection.add(target.item);
          app.trigger('resource-changed', type, target.item);
        }
      });
    }
    return options;
  }

  createNewPage() {
    return this.genericCreateResource(
      app.context.pages,
      app.context.createPage(),
      'page',
      'Create New Page'
    );
  }

  createNewCSSFile() {
    return this.genericCreateResource(
      app.context.assets.css,
      app.context.createCSS(),
      'css',
      'Create New Stylesheet'
    );
  }

  createNewJSFile() {
    return this.genericCreateResource(
      app.context.assets.js,
      app.context.createJS(),
      'js',
      'Create New JS'
    );
  }

  genericCreateResource(collection, item, type, title) {
    collection.add(item);
    app.trigger('resource-changed', type, item);
    app.context.history.add({
      name: title,
      undo: () => {
        collection.remove(item);
        app.trigger('resource-changed', type, item);
      },
      redo: () => {
        collection.add(item);
        app.trigger('resource-changed', type, item);
      }
    });

    return item;
  }

  importFontAction() {
    app.fontImportDialog.open({
      onSave: fonts => {
        if (!fonts.length) return;

        const toInsert = [];
        for (const f of fonts) {
          if (app.context.assets.fonts.has(f.name)) {
            continue;
          }
          toInsert.push(f);
        }

        if (!toInsert.length) return;

        app.context.assets.fonts.add(toInsert);
        app.trigger('resource-changed', 'font', toInsert);
        app.context.history.add({
          name: `Import Font${fonts.length > 1 ? 's' : ''}`,
          undo: () => {
            app.context.assets.fonts.remove(toInsert);
            app.trigger('resource-changed', 'font', toInsert);
          },
          redo: () => {
            app.context.assets.fonts.add(toInsert);
            app.trigger('resource-changed', 'font', toInsert);
          }
        });
      }
    });
  }

  importImageAction() {
    electron.showFileOpenDialog({
      filters: [{
        name: 'Image Files',
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg']
      }],
      defaultPath: electron.readSetting('lastImageImportPath')
        || electron.readSetting('lastDesignPath'),
      properties: ['openFile', 'multiSelections']
    }, paths => {
      if (!paths) return;
      electron.saveSetting('lastImageImportPath', paths[0]);
      this.importImagesByPaths(paths);
    });
  }

  renameResourceAction(item) {
    const node = $(this.itemToDOM.get(item));
    this.smartEditable.startEditing(node);
  }

  duplicatePage(page) {
    const clone = app.context.createPage(page.getNameWithoutExtension(), page.serialize());
    this.genericResourceDuplicateAction(clone, 'page', app.context.pages, 'Duplicate Page');
  }

  duplicateCSS(stylesheet) {
    const clone = app.context.createCSS(
      stylesheet.getNameWithoutExtension(),
      stylesheet.serialize()
    );

    this.genericResourceDuplicateAction(
      clone,
      'css',
      app.context.assets.css,
      'Duplicate Stylesheet'
    );
  }

  genericResourceDuplicateAction(clone, type, collection, title) {
    collection.add(clone);
    app.trigger('resource-changed', type, clone);
    app.context.history.add({
      name: title,
      undo: () => {
        collection.remove(clone);
        app.trigger('resource-changed', type, clone);
      },
      redo: () => {
        collection.add(clone);
        app.trigger('resource-changed', type, clone);
      }
    });
  }

  canResourceBeOpened(res) {
    return !app.editorPane.resourceIsBeingEdited(res);
  }

  canPageBeOpened(page) {
    return !page.isActive();
  }

  openPage(page) {
    if (page.isActive()) return;
    app.activatePage(page);
  }

  dbClickPage(page) {
    this.openPage(page);
  }

  openResource(res) {
    app.editorPane.openForEditing(res);
  }

  dbClickEditableResource(res) {
    this.openResource(res);
  }

  /**
   * @param page
   */
  canPageBeDeleted() {
    return app.context.pages.length > 1;
  }

  pageDeleteAction(item) {
    if (app.context.pages.length < 2) return;
    this.genericResourceDeleteAction(item, 'page', app.context.pages, 'Remove Page');
  }

  cssDeleteAction(item) {
    this.genericResourceDeleteAction(item, 'css', app.context.assets.css, 'Remove Stylesheet');
  }

  jsDeleteAction(item) {
    this.genericResourceDeleteAction(item, 'js', app.context.assets.js, 'Remove JS File');
  }

  imageDeleteAction(item) {
    this.genericResourceDeleteAction(
      item,
      'image',
      app.context.assets.images,
      'Remove Image Asset'
    );
  }

  fontDeleteAction(item) {
    this.genericResourceDeleteAction(item, 'font', app.context.assets.fonts, 'Remove Font Asset');
  }

  genericResourceDeleteAction(item, type, collection, title) {
    if (!collection.has(item.name)) return;
    collection.remove(item);
    app.trigger('resource-changed', type, item);
    app.context.history.add({
      name: title,
      undo: () => {
        collection.add(item);
        app.trigger('resource-changed', type, item);
      },
      redo: () => {
        collection.remove(item);
        app.trigger('resource-changed', type, item);
      }
    });
  }

  pageSave(item, newName) {
    this.genericResourceSaveAction(item, newName, 'page', app.context.pages, 'Rename Page');
  }

  cssSave(item, newName) {
    this.genericResourceSaveAction(
      item,
      newName,
      'css',
      app.context.assets.css,
      'Rename Stylesheet'
    );
  }

  jsSave(item, newName) {
    this.genericResourceSaveAction(item, newName, 'js', app.context.assets.js, 'Rename JS File');
  }

  imageSave(item, newName) {
    this.genericResourceSaveAction(
      item,
      newName,
      'image',
      app.context.assets.images,
      'Rename Image Asset'
    );
  }

  genericResourceSaveAction(item, newName, type, collection, title) {
    const oldName = item.name;
    const result = collection.rename(oldName, newName);

    if (result === -2) {
      return;
    }

    if (result < 1) {
      return false;
    }

    app.trigger('resource-changed', type, item);

    app.context.history.add({
      name: title,
      undo: () => {
        collection.rename(newName, oldName);
        app.trigger('resource-changed', type, item);
      },
      redo: () => {
        collection.rename(oldName, newName);
        app.trigger('resource-changed', type, item);
      }
    });
  }

  importImagesByPaths(paths) {
    if (!Array.isArray(paths)) return;

    const images = [];
    const operations = [];

    for (const path of paths) {
      const parsed = parsePath(path);
      const ext = parsed.extname.toLowerCase().replace('.', '');
      const type = mimeTypes[ext];
      if (!type) {
        continue;
      }

      operations.push(electron.readFile(path, 'base64'));
      images.push(app.context.assets.images.create(parsed.basename, ext));
    }

    Promise.all(operations).then(_operations => {
      for (let i = 0; i < images.length; i++) {
        images[i].data = `data:${mimeTypes[images[i].extension]};base64,${_operations[i]}`;
      }
      if (!images.length) return;

      const oldImages = app.context.assets.images.getAll();
      for (const item of images) {
        app.context.assets.images.add(item);
      }

      const newImages = app.context.assets.images.getAll();
      app.trigger('resource-changed', 'image', newImages);
      app.context.history.add({
        name: 'Image Import',
        undo: () => {
          app.context.assets.images.set(oldImages);
          app.trigger('resource-changed', 'image', newImages);
        },
        redo: () => {
          app.context.assets.images.set(newImages);
          app.trigger('resource-changed', 'image', newImages);
        }
      });
    }).catch(err => {
      app.alertDialog.open({
        title: 'Can\'t Import Image',
        message: 'An error occured while importing.'
      });
      console.error(err);
    });
  }

  renderAssetCategory(def) {
    const fragment = document.createDocumentFragment();
    const tmp = document.createElement('span');
    tmp.className = 'asset-category';
    tmp.dataset.category = def.name;

    const b = document.createElement('b');
    b.className = 'name';
    b.appendChild(document.createTextNode(def.name));
    tmp.appendChild(document.createElement('i'));
    tmp.appendChild(b);
    fragment.appendChild(tmp);

    const groupsHolder = document.createElement('div');
    groupsHolder.className = 'subtree';

    for (const g of def.groups) {
      const items = callFuncArray(g.getter);
      if (!items.length) continue;

      const group = document.createElement('div');
      for (const i of items) {
        const item = document.createElement('span');
        item.className = 'asset-item smart-editable';

        const _b = document.createElement('b');
        _b.className = 'name';
        _b.dataset.category = def.name;
        _b.appendChild(document.createElement('u'));
        _b.appendChild(document.createTextNode(i.name));
        _b.dataset.editvalue = i.getNameWithoutExtension();

        item.appendChild(_b);
        item.appendChild(document.createElement('input'));

        if (g.locked) {
          item.className += ' locked';
          const l = document.createElement('u');
          l.className = 'material-icon lock';
          l.textContent = 'lock_outline';
          item.appendChild(l);
        }

        group.appendChild(item);
        this.domToItem.set(item, i);
        this.itemToDOM.set(i, item);
        this.domToCategory.set(item, def);
        this.domToGroup.set(item, g);
      }
      groupsHolder.appendChild(group);
    }

    fragment.appendChild(groupsHolder);
    this.domToCategory.set(tmp, def);

    return fragment;
  }

  expandContract(name) {
    const status = app.context.uiState[name];
    if (status) {
      this.contractCategory(name);
    } else {
      this.expandCategory(name);
    }
  }

  expandCategory(name) {
    const span = this.element.find(`[data-category=${name}]`);
    span.next('.subtree').slideDown('fast');
    span.find('i').addClass('down');
    app.context.uiState[name] = true;
  }

  instantExpandCategory(name) {
    const span = this.element.find(`[data-category=${name}]`);
    span.next('.subtree').show();
    span.find('i').addClass('down');
    app.context.uiState[name] = true;
  }

  contractCategory(name) {
    const span = this.element.find(`[data-category=${name}]`);
    span.next('.subtree').slideUp('fast');
    span.find('i').removeClass('down');
    app.context.uiState[name] = false;
  }

  update() {
    const fragment = document.createDocumentFragment();
    for (const c of this.assetCategories) {
      const cat = this.renderAssetCategory(c);
      fragment.appendChild(cat);
    }

    this.element.find('.content').html(fragment);
    for (const c in app.context.uiState) {
      if (app.context.uiState[c] === true) {
        this.instantExpandCategory(c);
      }
    }
    return this.element;
  }
}

export default DesignPane;
