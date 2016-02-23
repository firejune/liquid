import {html as beautifyHTML} from 'js-beautify';

import packageJSON from '../config.json';

import Point from './Point';
import Canvas from './Canvas';
import Context from './Context';
import ExportContext from './ExportContext';
import Page from './Page';
// import Package from './Package';
import Theme from './Theme';
import ContextMenu from './ContextMenu';

import InlineEditingBar from '../bars/InlineEditingBar';
import TabBar from '../bars/TabBar';
import ToolBar from '../bars/ToolBar';
import ColumnOperationsBar from '../bars/ColumnOperationsBar';

import OptionsPane from '../panes/OptionsPane';
import OverviewPane from '../panes/OverviewPane';
import ComponentPane from '../panes/ComponentPane';
import DesignPane from '../panes/DesignPane';
import EditorPane from '../panes/EditorPane';
import ColorPicker from '../panes/ColorPicker';

import Dialog from '../dialogs/Dialog';
import AlertDialog from '../dialogs/AlertDialog';
import AboutDialog from '../dialogs/AboutDialog';
import IconsDialog from '../dialogs/IconsDialog';
import LinkDialog from '../dialogs/LinkDialog';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import ImagesDialog from '../dialogs/ImagesDialog';
import FontImportDialog from '../dialogs/FontImportDialog';
import ComponentToPackageDialog from '../dialogs/ComponentToPackageDialog';
import ThemeManagerDialog from '../dialogs/ThemeManagerDialog';
import ThemeChooserDialog from '../dialogs/ThemeChooserDialog';
import NewDesignDialog from '../dialogs/NewDesignDialog';
import PreviewDialog from '../dialogs/PreviewDialog';
import PurchaseDialog from '../dialogs/PurchaseDialog';
import WhatsNewDialog from '../dialogs/WhatsNewDialog';
import CharacterInputDialog from '../dialogs/CharacterInputDialog';

import executeDropCall from '../helpers/executeDropCall';
// import restoreCSSList from '../helpers/restoreCSSList';
import parseCSS from '../helpers/parseCSS';
import parsePath from '../helpers/parsePath';
import buildBSDesignFormat from '../helpers/buildBSDesignFormat';
import buildBSComponentFormat from '../helpers/buildBSComponentFormat';
import parseBSComponentFormat from '../helpers/parseBSComponentFormat';
import parseBSDesignFormat from '../helpers/parseBSDesignFormat';
import enforceFileExtension from '../helpers/enforceFileExtension';
import parseDOMTree from '../helpers/parseDOMTree';
import stringifyParsedTree from '../helpers/stringifyParsedTree';
import cleanUpDataURL from '../helpers/cleanUpDataURL';
import readFileAsBase64 from '../helpers/readFileAsBase64';
import cookies from '../helpers/cookies';
import keyChecker from '../helpers/keyChecker';
import generateMenuTemplateForApp from '../helpers/generateMenuTemplateForApp';

import mimeTypes from '../config/mime-types';
import themes from '../config/bootstrap-themes';
import FontResource from '../resources/FontResource';

class Application {
  constructor() {
    this.aboveCanvas = false;
    this.aboveOverview = false;
    this.mousePosition = new Point;
    this.isDragging = false;
    this.draggedComponent = null;
    this.dropCall = null;
    this.inlineEditingBar = null;
    this.tabBar = null;
    this.toolBar = null;
    this.columnOperationsBar = null;
    this.overviewPane = null;
    this.optionsPane = null;
    this.componentPane = null;
    this.designPane = null;
    this.editorPane = null;
    this.context = null;
    this.openedContexts = [];
    this.packages = [];
    this.userThemes = [];
    this.recent = [];
    this.userCSSElement = null;
    this.canvas = null;
    this.pubsub = {};
    this.changedIDMap = {};
    this.optionsPaneCollapsedState = new Map;
    this.settings = {
      previewEnabled: false
    };
  }

  setup(doc, $) {
    const app = this;
    const iframe = $('#canvas iframe');
    const iframeDoc = $(iframe.prop('contentDocument'));

    this.themes = themes.map(t => {
      t.fonts = t.fonts.map(f => new FontResource(f.name, f.url));
      return t;
    });

    this.initPackages(electron.readSetting('packages', []));
    this.initThemes(electron.readSetting('themes', []));
    this.favoriteColors = electron.readSetting('favoriteColors', []);
    this.recent = electron.readSetting('recent', []);

    iframeDoc[0].open();
    iframeDoc[0].write('<!DOCTYPE html>');
    iframeDoc[0].close();

    this.alertDialog = new AlertDialog($('#alert-dialog'));
    this.aboutDialog = new AboutDialog($('#about-dialog'));
    this.iconsDialog = new IconsDialog($('#icons-dialog'));
    this.imagesDialog = new ImagesDialog($('#images-dialog'));
    this.linkDialog = new LinkDialog($('#link-dialog'));
    this.confirmDialog = new ConfirmDialog($('#confirm-dialog'));
    this.fontImportDialog = new FontImportDialog($('#font-import-dialog'));
    this.componentToPackageDialog = new ComponentToPackageDialog($('#component-to-package-dialog'));
    this.themeManagerDialog = new ThemeManagerDialog($('#theme-manager-dialog'));
    this.themeChooserDialog = new ThemeChooserDialog($('#theme-chooser-dialog'));
    this.newDesignDialog = new NewDesignDialog($('#new-design-dialog'));
    this.previewDialog = new PreviewDialog($('#preview-dialog'));
    this.purchaseDialog = new PurchaseDialog($('#purchase-dialog'));
    this.whatsNewDialog = new WhatsNewDialog($('#whats-new-dialog'));
    this.characterInputDialog = new CharacterInputDialog($('#character-input-dialog'));

    // this.overviewPane = new OverviewPane($('#overview-pane'));
    this.optionsPane = new OptionsPane($('#options-pane'));
    // this.componentPane = new ComponentPane($('#component-pane'));
    // this.designPane = new DesignPane($('#design-pane'));
    this.designPane = {
      importImageAction: function() {},
      importFontAction: function() {}
    };
    this.editorPane = new EditorPane($('#editor-pane'));
    this.userCSSElement = iframeDoc.find('#user-css');
    this.inlineEditingBar = new InlineEditingBar($('#inline-editing-bar'));
    // this.tabBar = new TabBar($('#tab-bar'));
    // this.toolBar = new ToolBar($('#tool-bar'));
    this.columnOperationsBar = new ColumnOperationsBar($('#column-operations-bar'));
    this.contextMenu = new ContextMenu($('#context-menu'));
    this.colorPicker = new ColorPicker($('#color-picker'));

    win.on('resize', this.resize.bind(this));
    win.on('focus', this.focus.bind(this));
    win.on('blur', this.blur.bind(this));
    win.on('mousewheel', this.scroll.bind(this));
    doc.on('mousemove', e => {
      if (!this.hasOpenedContexts()) return;
      this.mousePosition.x = e.pageX;
      this.mousePosition.y = e.pageY;
      this.canvas.mousePosition.x = Infinity;
      this.canvas.mousePosition.y = Infinity;
      this.onMousemove(e);
    });
    doc.on('mousedown', this.onMousedown.bind(this));
    doc.on('mouseup', this.onMouseup.bind(this));
    doc.on('contextmenu', false);

    this.focusTarget = $('#focus-target');
    this.focusTarget.focus();

    let refocusTimeout;
    doc.on('focusout', () => {
      if (!this.hasOpenedContexts()) return;
      refocusTimeout = setTimeout(() => {
        if (this.isInlineEditingActive()) {
          this.focusTarget.focus();
        }
      }, 20);
    });

    doc.on('focusin', e => {
      if (!this.hasOpenedContexts()) return;
      const target = $(e.target);
      if (this.isInlineEditingActive() && target.is('textarea, select, input')) {
        clearTimeout(refocusTimeout);
      }
    });

    doc.on('keydown', e => {
      if (!this.hasOpenedContexts()) return;

      const target = $(e.target);
      if (e.target !== this.focusTarget[0] && target.is('textarea, input, [contenteditable]')) {
        return;
      }

      this.trigger('keydown', e);
    });

    iframeDoc.on('click', e => {
      e.preventDefault();
      this.focusTarget.focus();
    });

    iframeDoc.on('click', 'a', e => {
      e.preventDefault();
    });

    doc.on('input', '#focus-target', () => {
      this.focusTarget.html('');
    });

    iframeDoc.on('mousemove', e => {
      if (!this.hasOpenedContexts()) return false;
      this.canvas.mousePosition.x = e.pageX;
      this.canvas.mousePosition.y = e.pageY;

      this.mousePosition.x = e.pageX * this.context.canvasDimensions.zoom +
        this.canvas.iframeOffset.left - iframe[0].contentWindow.scrollX;

      this.mousePosition.y = e.pageY * this.context.canvasDimensions.zoom +
        this.canvas.iframeOffset.top - iframe[0].contentWindow.scrollY;

      this.onMousemove(e);
    });

    iframeDoc.on('mouseup', this.onMouseup.bind(this));
    iframeDoc.on('mousedown', this.onMousedown.bind(this));
    iframeDoc.on('contextmenu', false);

    this.on('mousedown', e => {
      if (this.aboveCanvas) return;

      const target = $(e.target);
      const component = this.context.page.focusedComponent;

      if (component && component.isInlineEditingActivated) {
        if (!target.closest('#inline-editing-bar').length && !target.closest('#dialogs').length) {
          component.commit();
          e.preventDefault();
          return false;
        }
        return;
      }
    });

    this.on('keydown', e => {
      // ESC
      if (e.which === 27) {
        if (Dialog.isDialogShown()) {
          Dialog.getShownDialog().close();
          return false;
        }
        if (this.isInlineEditingActive()) {
          this.context.page.focusedComponent.discard();
          return false;
        }
      }

      // Enter
      if (e.which === 13) {
        if (this.isInlineEditingActive()) {
          this.context.page.focusedComponent.commit();
          return false;
        }
        if (this.context.page.focusedComponent
          && this.context.page.focusedComponent.flags.canBeEdited) {
          this.context.page.focusedComponent.activateInlineEditingAndMoveCaretToEnd();
          return false;
        }
      }
    }, -1);

    this.on('keydown', e => {
      // New: Ctrl + N or Cmd + N
      if (keyChecker(e.which === 78 && e.ctrlKey, e.which === 78 && e.metaKey)) {
        e.preventDefault();
        this.showDialogForNewDesign();
      }

      // Open: Ctrl + O or Cmd + O
      if (keyChecker(e.which === 79 && e.ctrlKey, e.which === 79 && e.metaKey)) {
        e.preventDefault();
        this.openDesignDialog();
      }

      // Undo/Redo: Ctrl + Z or Cmd + Z and + shiftKey = redo
      if (keyChecker(e.which === 90 && e.ctrlKey, e.which === 90 && e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      }

      // Redo: Ctrl + Y or Cmd + Y
      if (keyChecker(e.which === 89 && e.ctrlKey, e.which === 89 && e.metaKey)) {
        e.preventDefault();
        this.redo();
      }

      // Save: Ctrl + S or Cmd + S
      if (keyChecker(e.which === 83 && e.ctrlKey, e.which === 83 && e.metaKey)) {
        e.preventDefault();
        this.saveDesign(this.context);
      }

      // Close: Ctrl + W or Cmd + W
      if (keyChecker(e.which === 87 && e.ctrlKey, e.which === 87 && e.metaKey)) {
        e.preventDefault();
        this.confirmCloseContext(this.context);
        // TODO: 메뉴에서 닫기 쓰지 말고 여기에서 처리하자
      }

      // Duplicate: Ctrl + D or Cmd + D
      if (keyChecker(e.which === 68 && e.ctrlKey, e.which === 68 && e.metaKey)) {
        e.preventDefault();
        if (this.context.page.focusedComponent
          && this.context.page.focusedComponent.flags.canBeDuplicated) {
          this.context.page.focusedComponent.duplicateAction();
        }
      }

      // Copy: Ctrl + C or Cmd + C
      if (keyChecker(e.which === 67 && e.ctrlKey, e.which === 67 && e.metaKey)) {
        e.preventDefault();
        if (this.context.page.focusedComponent) {
          this.context.page.focusedComponent.copyAction();
        }
      }

      // Paste: Ctrl + V or Cmd + V
      if (keyChecker(e.which === 86 && e.ctrlKey, e.which === 86 && e.metaKey)) {
        e.preventDefault();
        if (this.context.page.focusedComponent
          && this.context.page.focusedComponent.pasteInsideAction) {
          this.context.page.focusedComponent.pasteInsideAction();
        }
      }

      // Focus Parent: Ctrl + Up or Cmd + Up
      if (keyChecker(e.which === 38 && e.ctrlKey, e.which === 38 && e.metaKey)) {
        e.preventDefault();
        if (this.context.page.focusedComponent) {
          this.context.page.focusedComponent.focusParent();
        }
      }

      // Focus Child: Ctrl + Down or Cmd + Down
      if (keyChecker(e.which === 40 && e.ctrlKey, e.which === 40 && e.metaKey)) {
        e.preventDefault();
        if (!this.context.page.focusedComponent) return;
        const pbl = this.context.previousBreadcrumbList;

        let child = null;
        if (pbl && pbl.length) {
          for (let i = 0; i < pbl.length; i++) {
            if (pbl[i] === this.context.page.focusedComponent
              && pbl[i + 1] && pbl[i + 1].isVisible()) {
              child = pbl[i + 1];
            }
          }
        }

        if (!child && this.context.page.focusedComponent.children) {
          const comp = this.context.page.focusedComponent.findFirstComponentChild();
          comp && comp.focus();
        }

        if (child) {
          child.focus();
        }
      }

      // Focus Next: Ctrl + Right or Cmd + Right
      if (keyChecker(e.which === 39 && e.ctrlKey, e.which === 39 && e.metaKey)) {
        e.preventDefault();
        if (!this.context.page.focusedComponent) return;
        this.context.page.focusedComponent.focusNextSibling();
      }

      // Focus Previous: Ctrl + Left or Cmd + Left
      if (keyChecker(e.which === 37 && e.ctrlKey, e.which === 37 && e.metaKey)) {
        e.preventDefault();
        if (!this.context.page.focusedComponent) return;
        this.context.page.focusedComponent.focusPreviousSibling();
      }

      // Delete
      if (e.which === 46) {
        e.preventDefault();
        if (this.context.page.focusedComponent
          && this.context.page.focusedComponent.flags.canBeDeleted) {
          this.context.page.focusedComponent.deleteAction();
        }
      }

      // Backspace
      if (e.which === 8) {
        e.preventDefault();
        if (this.context.page.focusedComponent
          && this.context.page.focusedComponent.flags.canBeEdited) {
          this.context.page.focusedComponent.activateInlineEditingAndEmpty();
        }
      }

      // Nothing or Print?: Ctrl + P or Cmd + P
      if (keyChecker(e.which === 80 && e.ctrlKey, e.which === 80 && e.metaKey)) {
        e.preventDefault();
      }

      // Refresh: Ctrl + R or Cmd + R
      if (keyChecker(
        e.which === 82 && e.ctrlKey && !this.inDevelopment(),
        e.which === 82 && e.metaKey && !this.inDevelopment())) {
        e.preventDefault();
      }

      // Zoom In: Ctrl + = or Cmd + =
      if (keyChecker(e.which === 187 && e.ctrlKey, e.which === 187 && e.metaKey)) {
        this.zoomIn();
        e.preventDefault();
      }

      // Zoom Out: Ctrl + - or Cmd + -
      if (keyChecker(e.which === 189 && e.ctrlKey, e.which === 189 && e.metaKey)) {
        this.zoomOut();
        e.preventDefault();
      }

      // Zoom Reset: Ctrl + 0 or Cmd + 0
      if (keyChecker(e.which === 48 && e.ctrlKey, e.which === 48 && e.metaKey)) {
        this.resetZoom();
        e.preventDefault();
      }
    }, 100);

    this.on('drag-start', () => {
      body.addClass('dragging');
    });

    this.on('drag-end', () => {
      body.removeClass('dragging');
    });

    this.canvas = new Canvas($('#canvas'));
    this.startScreen = $('#startscreen');

    this.startScreen.find('.button.create').on('click', this.showDialogForNewDesign.bind(this));
    this.startScreen.find('.button.open').on('click', this.openDesignDialog.bind(this));
    this.startScreen.find('.button.tutorial').on('click',
      this.loadTutorial.bind(this, 'getting-started'));

    this.startScreen.on('click', '.recent > div', function(e) {
      const design = $(this).data('item');
      if (e.target.nodeName === 'A') {
        app.removeRecentDesign(design.path);
        app.showStartScreen();
      } else {
        app.openDesignAction(design.path);
      }
    });

    const menu = $('#menu');
    menu.find('.new').on('click', this.showDialogForNewDesign.bind(this));
    menu.find('.open').on('click', this.openDesignDialog.bind(this));
    menu.find('.export').on('click', this.exportContext.bind(this));

    // const preview = menu.find('.preview').on('click', () => this.previewDialog.open());
    const preview = menu.find('.preview').on('click', () => this.purchaseDialog.open({
      daysRemaining: 5
    }));

    this.on('preview-status-change', () => {
      if (this.settings.previewEnabled) {
        preview.find('span').text('Preview (on)');
      } else {
        preview.find('span').text('Preview');
      }
    });

    const save = menu.find('.save');

    save.on('click', () => this.saveDesign(this.context));
    menu.find('.settings').on('click', () => this.changeThemeForDesign(this.context));

    const undo = menu.find('.undo');
    const redo = menu.find('.redo');
    undo.on('click', () => this.undo());
    redo.on('click', () => this.redo());

    this.on('context-changed context-activated context-saved', () => {
      undo.toggleClass('active', this.hasUndo());
      redo.toggleClass('active', this.hasRedo());
      save.toggleClass('active', this.context.canBeSaved());
    });

    this.on('context-closed', () => {
      if (!this.openedContexts.length) electron.setTitle('Psyclone Studio');
    });

    this.on('context-activated context-saved context-changed', () => {
      electron.setTitle(
        `${this.context.name}${(this.context.isSaved() ? '' : ' (unsaved)')} - Psyclone Studio`
      );
    });

    this.lastChange = Date.now();

    let lastJSStatus = false;
    this.on('context-changed context-activated page-activated', () => {
      this.lastChange = Date.now();
      if (!this.settings.previewEnabled) return;
      setTimeout(() => {
        if (this.context.hasJS() || this.context.hasJS() !== lastJSStatus) {
          electron.notifySSEClients({
            type: 'full'
          });
        } else {
          const parsed = parseDOMTree(this.context.page.html.element[0], this.context.page, {
            unmarkSystemElements: true
          });
          let html = stringifyParsedTree(parsed).replace(/<\/?html>/g, '');
          html = this.context.replaceUserCSSInPreviewString(html);
          html = this.context.replaceBlobURLsInString(html);
          electron.notifySSEClients({
            html,
            type: 'partial'
          });
        }
        lastJSStatus = this.context.hasJS();
      }, 20);
    });

    this.on('preview-setting-change', () => {
      if (this.settings.previewEnabled) {
        electron.listenOnNetwork(() => {
          this.trigger('preview-status-change');
        });
      } else {
        electron.stopListeningOnNetwork(() => {
          this.trigger('preview-status-change');
        });
      }
    });

    doc.on('drop', e => {
      processDroppedFiles(e);
      e.preventDefault();
      e.stopPropagation();
    });

    doc.on('dragover', e => {
      e.preventDefault();
      e.stopPropagation();
    });

    iframeDoc.on('drop', e => {
      processDroppedFiles(e);
      e.preventDefault();
      e.stopPropagation();
    });

    iframeDoc.on('dragover', e => {
      e.preventDefault();
      e.stopPropagation();
    });

    function processDroppedFiles(e) {
      const files = e.originalEvent.dataTransfer.files;
      if (!files || !files.length) return false;

      const bstudioRegex = /.(?:bscomp|bsdesign)$/;
      const imagesRegex = /^image\//;
      const images = [];
      const bspaths = [];

      for (let i = 0; i < files.length; i++) {
        if (imagesRegex.test(files[i].type)) {
          if (app.hasOpenedContexts()) {
            images.push(files[i].path);
          }
          continue;
        }
        if (bstudioRegex.test(files[i].name)) {
          bspaths.push(files[i].path);
        }
      }

      if (bspaths.length) {
        app.openBSPath(bspaths);
      }

      if (images.length) {
        app.designPane.importImagesByPaths(images);
      }
    }

    this.on('context-opened context-saved', ctx => {
      this.addToRecent(ctx.name, ctx.path);
      electron.addToRecent(ctx.path);
    });

    this.on('context-opened', this.hideStartScreen.bind(this));
    win.on('beforeunload', this.beforeUnload.bind(this));

    this.on('resource-changed', type => {
      if (type !== 'page') return;
      if (!this.context.pages.has(this.context.page.name)) {
        this.activatePage(this.context.pages.get(0));
      }
    });

    this.openBSPath(electron.commandLineArgs);
    this.rebuildMainMenu();

    let scheduleMenuRebuild = null;

    function rebuildMenuAction() {
      app.rebuildMainMenu();
    }

    this.on('context-activated context-closed context-changed context-saved ' +
      'component-focused component-blurred', () => {
      clearTimeout(scheduleMenuRebuild);
      scheduleMenuRebuild = setTimeout(rebuildMenuAction, 200);
    });
    this.updateNotification = $('#update-ready');
    this.updateNotification.on('click', () => {
      this.updateNotification.removeClass('visible');
    });
    window.applicationCache.addEventListener('updateready', () => {
      this.updateReady();
    });

    setInterval(this.checkToken.bind(this), 30 * 60 * 1e3);
    setTimeout(this.checkToken.bind(this), 30 * 1e3);
    setInterval(this.updateActivityCookies.bind(this), 5 * 60 * 1e3);

    this.updateSystemCookies();

    if (!electron.readSetting('lastRun')) {
      this.firstRun();
    } else {
      if (this.isTrial()) {
        const lastShow = electron.readSetting('lastPurchaseDialogShowDate');
        if (lastShow !== (new Date).toDateString()) {
          setTimeout(() => {
            electron.saveSetting('lastPurchaseDialogShowDate', (new Date).toDateString());
            this.purchaseDialog.open({
              daysRemaining: this.trialDaysRemaining()
            });
          }, 5 * 60 * 1e3);
        }
      }
      if (electron.readSetting('lastRunVersion') !== packageJSON.version) {
        setTimeout(() => {
          this.showWhatsNewDialog(true);
        }, 1e3);
      }
    }
    electron.saveSetting('lastRun', Date.now());
    electron.saveSetting('lastRunVersion', packageJSON.version);
  }

  initPackages(json) {
    this.packages = [];

    for (let pkg of json) {
      if (!pkg.package) {
        pkg = {
          'package': pkg,
          timestamp: Date.now(),
          version: 1
        };
      }

      try {
        pkg = parseBSComponentFormat(pkg);
      } catch (err) {
        console.error(err);
        continue;
      }

      this.packages.push(pkg);
    }
  }

  initThemes(json) {
    this.userThemes = [];

    for (const th of json) {
      const theme = new Theme;
      theme.unserialize(th);
      this.userThemes.push(theme);
    }
  }

  firstRun() {
    $.getJSON('./assets/first-run/default-components.json', data => {
      this.initPackages(data);
      this.savePackageSetting();
    });
  }

  hasToken() {
    return cookies.hasItem('token');
  }

  setToken(token, validity = Infinity) {
    return cookies.setItem('token', token, validity, '/');
  }

  getToken() {
    if (this.inDevelopment()) {
      return 'psyclonestudio';
    }
    return cookies.getItem('token');
  }

  removeToken() {
    return cookies.removeItem('token', '/');
  }

  getDeviceID() {
    return cookies.getItem('device');
  }

  getDeviceName() {
    return decodeURIComponent(cookies.getItem('device-name'));
  }

  getUpdatesUntil() {
    return new Date(Number(cookies.getItem('updates-until')) * 1e3).toLocaleDateString();
  }

  getVersion() {
    return packageJSON.version;
  }

  updateSystemCookies() {
    cookies.setItem('app-version', packageJSON.version, Infinity, '/');
    cookies.setItem('os', electron.os, Infinity, '/');
  }

  updateActivityCookies() {
    if (Date.now() - this.lastChange > 5 * 60 * 1e3) {
      return;
    }
    const totalActivity = (Number(cookies.getItem('activity')) || 0) + 5;
    cookies.setItem('activity', totalActivity, Infinity, '/');
  }

  isLicensed() {
    return this.hasToken();
  }

  isTrial() {
    return cookies.hasItem('trial') && cookies.getItem('trial') === '1';
  }

  trialDaysRemaining() {
    const expiresOn = new Date(this.getUpdatesUntil());
    if (expiresOn < Date.now()) {
      return 0;
    }
    return Math.round((expiresOn - Date.now()) / (24 * 60 * 60 * 1e3));
  }

  deleteLicenseKey() {
    this.confirmDialog.open({
      title: 'Delete License Key',
      message: [
        'Deleting the license key will unregister this computer from your account,',
        'and you will be able to add another in its place. Once you do this,',
        'this copy of Psyclone Studio will be deactivated. Continue?'
      ].join(' '),
      okButton: 'Delete Key',
      onOK: () => {
        $.post('/app/unregister-device', () => {
          setTimeout(() => {
            this.alertDialog.open({
              title: 'Key Was Deleted',
              message: 'Save your work and restart Psyclone Studio.'
            });
          }, 800);
          try {
            window.applicationCache.update();
          } catch (err) {
            //
          }
        });
      }
    });
  }

  checkToken() {
    $.getJSON('./assets/is-token-valid.json', isValid => {
      if (isValid) return;
      this.removeToken();
      try {
        window.applicationCache.update();
      } catch (err) {
        //
      }
    });
  }

  updateReady() {
    this.updateNotification.addClass('visible');
  }

  zoomIn() {
    if (!this.context) return;
    return this.canvas.zoomIn();
  }

  zoomOut() {
    if (!this.context) return;
    return this.canvas.zoomOut();
  }

  resetZoom() {
    if (!this.context) return;
    return this.canvas.resetZoom();
  }

  hasUndo() {
    if (!this.context) return false;
    if (this.isInlineEditingActive()) {
      return false;
    }
    return this.context.history.hasUndo();
  }

  hasRedo() {
    if (!this.context) return false;
    if (this.isInlineEditingActive()) {
      return false;
    }
    return this.context.history.hasRedo();
  }

  undoName() {
    if (!this.context) return 'Undo';
    return this.context.history.undoName();
  }

  redoName() {
    if (!this.context) return 'Redo';
    return this.context.history.redoName();
  }

  undo() {
    if (this.isInlineEditingActive()) {
      return false;
    }
    if (Dialog.isDialogShown()) {
      return false;
    }
    return this.context.history.undo();
  }

  redo() {
    if (this.isInlineEditingActive()) {
      return false;
    }
    if (Dialog.isDialogShown()) {
      return false;
    }
    return this.context.history.redo();
  }

  hasOpenedContexts() {
    return this.openedContexts.length > 0;
  }

  isDesignOpened(path) {
    return this.getIndexForDesign(path) > -1;
  }

  getIndexForDesign(path) {
    for (let i = 0; i < this.openedContexts.length; i++) {
      if (path === this.openedContexts[i].path) {
        return i;
      }
    }
    return -1;
  }

  switchToContext(id) {
    if (!this.openedContexts[id]) return;
    this.activateContext(this.openedContexts[id]);
  }

  saveDesign(context) {
    if (!context.canBeSaved()) return;
    if (context.existsOnDisk()) {
      this.writeContextToDisk(context, context.path);
    } else {
      let lastDesignPath = electron.readSetting('lastDesignPath');
      lastDesignPath = lastDesignPath ? lastDesignPath + electron.pathSeparator : '';

      electron.showFileSaveDialog({
        title: 'Save Design',
        defaultPath: `${lastDesignPath}${context.name}.bsdesign`,
        filters: [{
          name: 'Psyclone Studio Design (.bsdesign)',
          extensions: ['bsdesign']
        }]
      }, path => {
        if (!path) return;
        electron.saveSetting('lastDesignPath', parsePath(path).dirname);
        this.writeContextToDisk(context, path);
      });
    }
  }

  writeContextToDisk(context, path) {
    if (!path) return;
    path = enforceFileExtension(path, 'bsdesign');

    const parsed = parsePath(path);
    context.name = parsed.name;

    const content = JSON.stringify(buildBSDesignFormat(context));
    electron.writeFile(path, content, 'gzip').then(() => {
      context.markAsSaved(path);
      this.trigger('context-saved', context);
    }).catch(err => {
      this.alertDialog.open({
        title: 'Can\'t Write',
        message: 'An error occured and the file couldn\'t be written.'
      });
      console.error(err);
    });
  }

  saveDesignAs(context) {
    if (!context.canBeSavedAs()) return;
    electron.showFileSaveDialog({
      title: 'Save Design As',
      defaultPath: context.path,
      filters: [{
        name: 'Psyclone Studio Design (.bsdesign)',
        extensions: ['bsdesign']
      }]
    }, path => {
      if (!path) return;
      this.writeContextToDisk(context, path);
    });
  }

  showDialogForNewDesign() {
    this.newDesignDialog.open({
      name: '',
      path: '',
      theme: 'default',
      onSave: prop => {
        if (prop.template === 'blank') {
          this.openContext(Application.createContext(prop), true);
        } else {
          this.loadTemplate(prop.template);
        }
      }
    });
  }

  createBlankDesign() {
    return Application.createContext({
      theme: 'default'
    });
  }

  showAboutDialog() {
    this.aboutDialog.open({
      version: packageJSON.version,
      computerName: this.getDeviceName(),
      updatesUntil: this.getUpdatesUntil(),
      trial: this.isTrial()
    });
  }

  showWhatsNewDialog(upgraded = false) {
    $.get('/changelog/log.json', msg => {
      msg.upgraded = upgraded;
      this.whatsNewDialog.open(msg);
    });
  }

  changeThemeForDesign(context) {
    this.themeChooserDialog.open({
      theme: context.theme,
      onSave: prop => {
        const oldTheme = context.theme;
        const newTheme = prop.theme;

        update(newTheme);

        context.history.add({
          name: 'Change Design Theme',
          undo: () => {
            update(oldTheme);
          },
          redo: () => {
            update(newTheme);
          }
        });

        function update(theme) {
          context.theme = theme;
          const themePromises = [];

          for (const font of app.getThemeById(theme).fonts) {
            themePromises.push(app.canvas.preloadFont(font.name));
          }

          themePromises.push(context.loadThemeStyles());
          if (themePromises.length) {
            Promise.all(themePromises).then(exec);
          } else {
            exec();
          }

          function exec() {
            if (context.isActive()) {
              app.canvas.hideSystemUI();
              app.canvas.update();
              app.designPane.update();
              setTimeout(() => {
                app.canvas.refresh();
                app.canvas.showSystemUI();
              }, 500);
            }
          }
        }
      }
    });
  }

  importBootstrapThemeAction() {
    electron.showFileOpenDialog({
      filters: [{
        name: 'Bootstrap Theme (.css)',
        extensions: ['css']
      }],
      defaultPath: electron.readSetting('lastBootstrapThemePath')
                || electron.readSetting('lastDesignPath')
    }, path => {
      if (Array.isArray(path)) {
        path = path[0];
      }

      if (!path) return;

      electron.saveSetting('lastBootstrapThemePath', path);
      electron.readFile(path).then(contents => {
        const parsed = parsePath(path);
        const result = this.parseBootstrapTheme(contents, parsed.name.replace('.min', ''));
        this.addTheme(result);
        this.trigger('bootstrap-theme-added');
      }).catch(error => {
        console.error(error);
        this.alertDialog.open({
          title: 'Invalid CSS',
          message: 'This file contains invalid CSS and can\'t be imported.'
        });
      });
    });
  }

  parseBootstrapTheme(str, name = 'New Theme') {
    const parsed = parseCSS(str, {
      system: true
    }, {
      system: true
    });

    const fonts = [];
    const tmp = str.match(/@import url\("([^"]+)"\);/);
    if (tmp && tmp.length && tmp[1]) {
      fonts.push(new FontResource(tmp[1].match(/family=([^:,&]+)/)[1].replace(/\+/g, ' '), tmp[1]));
    }

    const theme = new Theme;
    theme.name = name;
    theme.fonts = fonts;
    theme.css = parsed;
    theme.raw = str;

    return theme;
  }

  exportContext(context) {
    context = context || this.context;
    electron.showFileOpenDialog({
      title: 'Export Destination',
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: electron.readSetting('lastExportPath')
                || electron.readSetting('lastDesignPath')
    }, path => {
      if (!Array.isArray(path)) return;

      const sep = electron.separator;
      const dir = path[0] + sep;
      electron.saveSetting('lastExportPath', dir);

      const exp = new ExportContext;
      exp.unserialize(this.context.serialize());

      for (const p of exp.pages.getAll()) {
        p.html.update();
      }

      const pagesHTML = exp.generateHTML();

      try {
        [
          `${dir}${sep}assets`,
          `${dir}${sep}assets${sep}img`,
          `${dir}${sep}assets${sep}js`,
          `${dir}${sep}assets${sep}css`,
          `${dir}${sep}assets${sep}bootstrap`,
          `${dir}${sep}assets${sep}bootstrap${sep}js`,
          `${dir}${sep}assets${sep}bootstrap${sep}css`,
          `${dir}${sep}assets${sep}bootstrap${sep}fonts`
        ].map(mkdir);
      } catch (err) {
        return error(err.message);
      }

      const operations = [];
      for (const ph of pagesHTML) {
        operations.push(electron.writeFile(dir + sep + ph.name, beautifyHTML(ph.html)));
      }

      const images = exp.assets.images.getAll();
      for (let i = 0; i < images.length; i++) {
        operations.push(electron.writeFile(
          `${dir}${sep}assets${sep}img${sep}${images[i].name}`,
          cleanUpDataURL(images[i].data),
          'raw-from-base64'
        ));
      }

      const sheet = exp.getStylesheetForActiveTheme();
      if (this.context.isThemeUserMade()) {
        const themeContent = this.context.getActiveTheme().raw;
        operations.push(electron.writeFile(dir + sep + sheet, themeContent));
      } else {
        const originalSheet = this.context.getStylesheetForActiveTheme();
        operations.push(copyFilePromise(originalSheet, dir + sep + sheet));
      }

      operations.push(copyFilePromise(
        './assets/embed/js/jquery.min.js',
        `${dir}${sep}assets${sep}js${sep}jquery.min.js`
      ));
      operations.push(copyFilePromise(
        './assets/embed/js/bootstrap.min.js',
        `${dir}${sep}assets${sep}bootstrap${sep}js${sep}bootstrap.min.js`
      ));
      operations.push(copyFilePromise(
        './assets/embed/bootstrap/fonts/glyphicons.css',
        `${dir}${sep}assets${sep}bootstrap${sep}fonts${sep}glyphicons.css`
      ));

      operations.push(['eot', 'svg', 'ttf', 'woff', 'woff2'].map(ext =>
        copyFilePromise(
          `./assets/embed/bootstrap/fonts/glyphicons-halflings-regular.${ext}`,
          `${dir}${sep}assets${sep}bootstrap${sep}fonts${sep}glyphicons-halflings-regular.${ext}`
        )
      ));

      if (exp.shouldIncludeFontAwesome()) {
        operations.push(copyFilePromise(
          './assets/embed/bootstrap/fonts/font-awesome.min.css',
          `${dir}${sep}assets${sep}bootstrap${sep}fonts${sep}font-awesome.min.css`
        ));

        operations.push(['eot', 'svg', 'ttf', 'woff', 'woff2'].map(ext =>
          copyFilePromise(
            `./assets/embed/bootstrap/fonts/fontawesome-webfont.${ext}`,
            `${dir}${sep}assets${sep}bootstrap${sep}fonts${sep}fontawesome-webfont.${ext}`
          )
        ));
      }

      for (const stylesheet of this.context.assets.css.getAll()) {
        operations.push(electron.writeFile(
          `${dir}${sep}assets${sep}css${sep}${stylesheet.name}`,
          exp.generateCSSForStylesheet(stylesheet, {env: 'export'}
        )));
      }

      for (const script of this.context.assets.js.getAll()) {
        operations.push(electron.writeFile(
          `${dir}${sep}assets${sep}js${sep}${script.name}`,
          script.value
        ));
      }

      Promise.all(operations).then(() => {
        console.log('Export Done!');
        this.alertDialog.open({
          title: 'Export Done!',
          message: `File path is '${dir}'`
        });
      }).catch(error);

      function mkdir(filepath) {
        if (!electron.mkdirSync(filepath)) {
          throw new Error('No rights');
        }
      }

      function copyFilePromise(from, to) {
        return readFileAsBase64(from).then(r =>
          electron.writeFile(to, r.content, 'raw-from-base64')
        );
      }

      function error(e) {
        console.error(e);
        this.alertDialog.open({
          title: 'Can\'t Export',
          message: 'An error occured while exporting this design. Please choose a different folder.'
        });
      }
    });
  }

  openDuplicateDesign(context) {
    this.openContext(Application.createContext({
      name: `${context.name} (copy)`,
      path: '',
      json: context.serialize(),
      theme: context.theme
    }));
  }

  openDialog(name, ext) {
    electron.showFileOpenDialog({
      filters: [{
        name,
        extensions: ext
      }],
      defaultPath: electron.readSetting('lastDesignPath'),
      properties: ['openFile', 'multiSelections']
    }, paths => {
      if (!paths) return;
      if (!Array.isArray(paths)) {
        paths = [paths];
      }

      electron.saveSetting('lastDesignPath', parsePath(paths[0]).dirname);
      this.openBSPath(paths);
    });
  }

  openDesignDialog() {
    this.openDialog('Psyclone Studio Design Files', ['bsdesign']);
  }

  openPackageDialog() {
    this.openDialog('Psyclone Studio Component Files', ['bscomp']);
  }

  openBSPath(paths) {
    if (!Array.isArray(paths)) {
      paths = [paths];
    }

    let lastDesignIndex = false;
    for (let i = 0; i < paths.length; i++) {
      const parsed = parsePath(paths[i]);
      if (parsed.extname.toLowerCase() === '.bsdesign') {
        lastDesignIndex = i;
      }
    }

    const packages = [];
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const parsed = parsePath(path);
      switch (parsed.extname.toLowerCase()) {
        case '.bscomp':
          packages.push(path);
          break;
        case '.bsdesign':
          this.openDesignAction(path, i === lastDesignIndex);
          break;
      }
    }

    if (packages.length) {
      this.openPackageAction(packages);
    }
  }

  openDesignAction(path, focusOnOpen = true) {
    if (!electron.pathExists(path)) return;
    if (this.isDesignOpened(path)) {
      this.switchToContext(this.getIndexForDesign(path));
      return;
    }

    electron.readFile(path, 'gzip').then(contents => {
      const context = parseBSDesignFormat(JSON.parse(contents), path);
      this.openContext(context, focusOnOpen);
    }).catch(error => {
      console.error(error);
      let message = 'An error occured while reading this design. It can\'t be opened.';

      if (error.message === 'version') {
        message =
          'This file was created in a newer version of Psyclone Studio and can\'t be opened.';
      }

      this.alertDialog.open({
        message,
        title: 'Can\'t Open'
      });
    });
  }

  openPackageAction(paths) {
    if (!paths) return;
    if (!Array.isArray(paths)) {
      paths = [paths];
    }

    paths = paths.filter(p => electron.pathExists(p));
    if (!paths.length) return;

    const ops = paths.map(p => electron.readFile(p, 'gzip'));

    Promise.all(ops).then(packages => {
      const readErrors = [];
      const existingPackages = [];
      const addedPackages = [];
      let pkg;

      for (let i = 0; i < packages.length; i++) {
        try {
          pkg = parseBSComponentFormat(JSON.parse(packages[i]));
        } catch (err) {
          readErrors.push(paths[i].slice(-30));
          continue;
        }

        if (this.packageExists(pkg.id)) {
          existingPackages.push(pkg.name.substr(0, 30));
          continue;
        }
        this.addPackage(pkg);
        addedPackages.push(pkg.name.substr(0, 30));
      }

      let message = '';
      if (addedPackages.length === 1) {
        message += `The component "${addedPackages[0]}" was added to your library. `;
      }
      if (addedPackages.length > 1) {
        message += `${addedPackages.length} components were added to your library. `;
      }
      if (existingPackages.length === 1) {
        message += `The component "${existingPackages[0]}" already exists in your library. `;
      }
      if (existingPackages.length > 1) {
        if (existingPackages.length === paths.length) {
          message += 'These components already exist in your library. ';
        } else {
          message += `${existingPackages.length} components already exist. `;
        }
      }
      if (readErrors.length === 1) {
        message += `The file "${readErrors[0]}" is corrupted and was not added to your library. `;
      }
      if (readErrors.length > 1) {
        if (readErrors.length === paths.length) {
          message += 'These files are corrupted and were not imported. ';
        } else {
          message += `${readErrors.length} files were corrupted and were not added. `;
        }
      }

      this.alertDialog.open({
        message,
        title: 'Component Import'
      });
    }).catch(error => {
      let message = 'An error occured while reading a component and it can\'t be imported.';
      if (error.message === 'version') {
        message =
          'This component was created in a newer version of Psyclone Studio and can\'t be opened.';
      }
      this.alertDialog.open({
        message,
        title: 'Can\'t Import'
      });
      console.error(error);
    });
  }

  openContext(ctx, switchTo = false) {
    if (!this.themeExists(ctx.theme)) {
      ctx.theme = 'default';
    }

    this.openedContexts.push(ctx);

    ctx.loadThemeStyles().then(() => {
      this.trigger('context-opened', ctx);
      if (switchTo) {
        this.activateContext(ctx);
      }
    });
  }

  confirmCloseContext(context) {
    if (!context) return;
    if (context.isActive() && this.isInlineEditingActive()) {
      this.context.page.focusedComponent.commit();
      return;
    }

    if (context.hasUnsavedChanges()) {
      this.confirmDialog.open({
        title: 'Close this Design?',
        message:
          'You have unsaved changes. If you close this design, you will lose them. Continue?',
        okButton: 'Close Design',
        onOK: this.closeContext.bind(this, context)
      });
    } else {
      this.closeContext(context);
    }
  }

  closeContext(ctx) {
    this.openedContexts.splice(this.openedContexts.indexOf(ctx), 1);
    this.trigger('context-closed', ctx);
    if (ctx.isActive()) {
      this.deactivateContext(ctx);
      if (this.openedContexts.length) {
        this.activateContext(this.openedContexts[0]);
        if (this.openedContexts[0].path) {
          electron.saveSetting('last opened', {
            name: this.openedContexts[0].name,
            path: this.openedContexts[0].path
          });
        } else {
          electron.saveSetting('last opened', null);
        }
      }
    }
    if (!this.openedContexts.length) {
      this.showStartScreen();
      electron.saveSetting('last opened', null);
      return;
    }
    ctx.destructor();
  }

  saveFavoriteColors() {
    electron.saveSetting('favoriteColors', this.favoriteColors);
  }

  isColorFavorite(color) {
    return this.favoriteColors.indexOf(color) !== -1;
  }

  toggleFavoriteColor(color) {
    if (this.isColorFavorite(color)) {
      this.removeFavoriteColor(color);
    } else {
      this.addFavoriteColor(color);
    }
  }

  addFavoriteColor(color) {
    if (this.favoriteColors.indexOf(color) === -1) {
      this.favoriteColors.push(color);
      this.saveFavoriteColors();
    }
  }

  removeFavoriteColor(color) {
    const index = this.favoriteColors.indexOf(color);
    if (index > -1) {
      this.favoriteColors.splice(index, 1);
      this.saveFavoriteColors();
    }
  }

  saveThemeSetting() {
    electron.saveSetting('themes', this.userThemes.map(t => t.serialize()));
  }

  themeExists(id) {
    return this.getThemeById(id) !== false;
  }

  getThemeById(id) {
    for (let i = 0; i < this.themes.length; i++) {
      if (this.themes[i].id === id) {
        return this.themes[i];
      }
    }

    for (let i = 0; i < this.userThemes.length; i++) {
      if (this.userThemes[i].id === id) {
        return this.userThemes[i];
      }
    }

    return false;
  }

  getAllThemes() {
    return this.userThemes.concat(this.themes);
  }

  removeTheme(theme) {
    const index = this.userThemes.indexOf(theme);
    if (index === -1) {
      return false;
    }

    this.userThemes.splice(index, 1);
    this.saveThemeSetting();
  }

  addTheme(theme) {
    this.userThemes.push(theme);
    this.userThemes.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
    this.saveThemeSetting();
  }

  renameTheme(theme, newName) {
    theme.name = newName;
    this.userThemes.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });

    this.saveThemeSetting();
  }

  isThemeUserMade(id) {
    for (let i = 0; i < this.userThemes.length; i++) {
      if (this.userThemes[i].id === id) {
        return true;
      }
    }

    return false;
  }

  isThemeUsedInOpenDesigns(id) {
    for (const ctx of this.openedContexts) {
      if (ctx.usesTheme(id)) {
        return true;
      }
    }
    return false;
  }

  savePackageSetting() {
    electron.saveSetting('packages', this.packages.map(p => buildBSComponentFormat(p)));
  }

  renamePackage(pkg, name) {
    pkg.name = name;
    this.trigger('package-changed');
    this.savePackageSetting();
  }

  removePackage(pkg) {
    const index = this.packages.indexOf(pkg);
    this.packages.splice(index, 1);
    this.trigger('package-deleted');
    this.savePackageSetting();
  }

  updatePackage(pkg, props) {
    pkg.css = props.css;
    pkg.fonts = props.fonts;
    pkg.images = props.images;
    pkg.version = props.version;
    pkg.components = props.components;

    this.trigger('package-changed');
    this.savePackageSetting();
  }

  addPackage(pkg) {
    if (this.packageExists(pkg.id)) {
      return false;
    }

    this.packages.push(pkg);
    this.packages.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;

      return 0;
    });

    this.trigger('package-created');
    this.savePackageSetting();

    return true;
  }

  getPackageById(id) {
    for (let i = 0; i < this.packages.length; i++) {
      if (this.packages[i].id === id) {
        return this.packages[i];
      }
    }

    return false;
  }

  packageExists(id) {
    return !!this.getPackageById(id);
  }

  showStartScreen() {
    const recent = this.startScreen.find('.recent');
    const arr = [];
    const recentDesigns = this.getRecentDesigns(4, true);

    let tmp;
    for (const design of recentDesigns) {
      tmp = $(
        '<div><a title="Remove From Recent">&times;</a><div class="name"></div>' +
        '<div class="path"></div></div>'
      );
      tmp.find('.name').text(design.name);
      tmp.find('.path').text(design.path);
      tmp.data('item', design);
      arr.push(tmp);
    }
    recent.html(arr);

    this.startScreen.removeClass('loading');
    this.startScreen.toggleClass('has-recent', !!recentDesigns.length);
    this.startScreen.toggleClass('show-tutorial', !recentDesigns.length);
    this.startScreen.show();
  }

  hideStartScreen() {
    this.startScreen.fadeOut('fast');
  }

  addToRecent(name, path) {
    if (!name || !path) return;

    this.removeRecentDesign(path);
    this.recent.unshift({
      name,
      path
    });

    if (this.recent.length > 10) {
      this.recent.length = 10;
    }

    electron.saveSetting('last opened', this.recent[0]);
    electron.saveSetting('recent', this.recent);
  }

  getRecentDesigns(count = 4, checkExists = false) {
    const recent = [];

    for (const r of this.recent) {
      if (recent.length >= count) break;
      if (checkExists && !electron.pathExists(r.path)) continue;
      recent.push(r);
    }

    return recent;
  }

  removeRecentDesign(path) {
    let index = -1;
    for (let i = 0; i < this.recent.length; i++) {
      if (this.recent[i].path === path) {
        index = i;
      }
    }
    if (index >= 0) {
      this.recent.splice(index, 1);
    }

    electron.saveSetting('recent', this.recent);
  }

  activateContext(ctx) {
    this.context = ctx;
    if (!ctx.page) {
      this.context.setActivePage();
    }
    this.changedIDMap = {};
    this.trigger('context-activated');
  }

  activatePage(page) {
    this.context.setActivePage(page);
    this.changedIDMap = {};
    this.trigger('page-activated');
  }

  deactivateContext() {
    this.context = null;
  }

  isInlineEditingActive() {
    return this.context.page.focusedComponent
      && this.context.page.focusedComponent.isInlineEditingActivated;
  }

  freezeUI() {
    $('#freeze-ui').show();
  }

  unfreezeUI() {
    $('#freeze-ui').hide();
  }

  dragStart(props) {
    this.trigger('drag-start', props);
    this.draggedComponent = props.component;
    this.dropHistory = props.dropHistory || 'Move Component';

    if (!props.dropAction) {
      props.dropAction = dropCall => {
        executeDropCall(dropCall);
        props.component.page().update();
      };
    }

    if (!props.dropActionUndo) {
      const parent = props.component.parent;
      const index = parent.childIndex(props.component);

      props.dropActionUndo = () => {
        parent.insertAt(props.component, index);
        props.component.page().update();
      };
    }

    this.dropAction = props.dropAction;
    this.dropActionUndo = props.dropActionUndo;

    props.component.startDragging();

    this.dragbox = document.getElementById('dragbox');
    this.ghost = document.getElementById('ghost');

    const ghostX = props.origin.left - this.mousePosition.x;
    const ghostY = props.origin.top - this.mousePosition.y;
    const ghostWidth = props.origin.width;
    const ghostHeight = props.origin.height;

    this.ghost.style.transform = `translate3D(${ghostX}px,${ghostY}px, 0)`;
    this.ghost.style.width = `${ghostWidth}px`;
    this.ghost.style.height = `${ghostHeight}px`;
    this.ghost.style.opacity = 0.5;
    this.dragbox.style.display = 'block';

    setTimeout(() => {
      this.ghost.style.transform = 'translate3d(10px, 10px, 0)';
      this.ghost.style.width = '14px';
      this.ghost.style.height = '14px';
      this.ghost.style.opacity = 0.9;
    }, 20);

    this.isDragging = true;
    this.dragbox.style.transform =
      `translate3D(${this.mousePosition.x}px,${this.mousePosition.y}px, 0)`;
  }

  dragEnd() {
    this.trigger('drag-end');
    this.draggedComponent.stopDragging();
    this.dragbox.style.display = 'none';

    if (this.dropCall) {
      this.dropCall.object.beforeDrop();

      const dropCall = this.dropCall;
      this.dropCall = {};
      this.dropAction(dropCall);

      this.context.history.add({
        name: this.dropHistory,
        undo: this.dropActionUndo.bind(this),
        redo: this.dropAction.bind(this, dropCall)
      });
    }

    this.draggedComponent = null;

    delete this.dropHistory;
    delete this.dropActionUndo;
    delete this.dropAction;

    this.isDragging = false;
  }

  onMousemove(e) {
    if (!this.hasOpenedContexts()) return;

    this.dropCall = null;
    this.trigger('mousemove', e);

    if (this.isDragging) {
      this.dragbox.style.transform =
        `translate3D(${this.mousePosition.x}px,${this.mousePosition.y}px, 0)`;
    }
  }

  onMouseup(e) {
    if (!this.hasOpenedContexts()) return;
    this.trigger('mouseup', e);

    if (this.isDragging) {
      this.dragEnd();
    }
  }

  onMousedown(e) {
    if (!this.hasOpenedContexts()) return;
    if (this.contextMenu.visible && !e.target.closest('#context-menu')) {
      this.contextMenu.hide();
    }

    if (this.aboveCanvas) {
      e.preventDefault();
    }

    this.trigger('mousedown', e);
  }

  beforeUnload() {
    if (this.inDevelopment() || this.quitConfirmed) {
      return;
    }

    for (const ctx of this.openedContexts) {
      if (ctx.hasUnsavedChanges()) {
        this.confirmDialog.open({
          onOK,
          title: 'Close Psyclone Studio?',
          message:
            'You have unsaved changes. If you close the application, you will lose them. Continue?',
          okButton: 'Close App'
        });

        return false;
      }
    }

    function onOK() {
      app.quitConfirmed = true;
      app.quit();
    }
  }

  quit() {
    electron.quit();
  }

  resize() {
    this.trigger('resize');
  }

  focus() {
    this.trigger('focus');
  }

  blur() {
    this.trigger('blur');
  }

  scroll(e) {
    this.trigger('scroll', e);
  }

  togglePreview() {
    if (this.settings.previewEnabled) {
      this.disablePreview();
    } else {
      this.enablePreview();
    }
  }

  enablePreview() {
    this.settings.previewEnabled = true;
    this.trigger('preview-setting-change');
  }

  disablePreview() {
    this.settings.previewEnabled = false;
    this.trigger('preview-setting-change');
  }

  openURLInBrowser(url) {
    electron.openBrowserWindow(url);
  }

  inDevelopment() {
    return electron.development;
  }

  onNetworkRequest(event, status, newURL, originalURL, httpResponseCode, requestMethod) {
    if (requestMethod !== 'GET') return;

    const url = new window.URL(newURL);
    const ignoreOrigins = [window.location.origin, 'https://psyclonestudio.io'];

    if (ignoreOrigins.indexOf(url.origin) === -1 && this.context) {
      this.canvas.scheduleRefresh(200);
      console.info('Refreshing Canvas Due To External HTTP Request', newURL);
    }
  }

  handlePreviewRequest(path) {
    return new Promise((resolve, reject) => {
      if (!this.settings.previewEnabled) {
        return reject();
      }

      if (path === '/bs-lastchange') {
        return resolve({
          content: this.lastChange.toString(),
          headers: {
            'Cache-Control': 'no-cache, must-revalidate, max-age=0'
          }
        });
      }

      if (path === '/') {
        const parsed = parseDOMTree(this.context.page.html.element[0], this.context.page, {
          unmarkSystemElements: true
        });

        let html = stringifyParsedTree(parsed);
        html = this.context.replaceUserCSSInPreviewString(html);
        html = this.context.replaceBlobURLsInString(html);
        html = `<!DOCTYPE html>\n${html}`;

        let scripts = '';
        for (const js of this.context.assets.js.getAll()) {
          scripts += `<script src="${js.name}"></script>\n`;
        }

        html = html.replace(
          '</head>',
          `<script id="bs-live-reload" src="./assets/embed/js/livereload.js" ` +
            `data-sseport="${electron.ssePort}" data-lastchange="${this.lastChange}"></script>\n` +
          '<script src="./assets/embed/js/jquery.min.js"></script>\n' +
          `<script src="./assets/embed/js/bootstrap.min.js"></script>\n${scripts}</head>`
        );

        return resolve({
          content: html,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, must-revalidate, max-age=0'
          }
        });
      }

      const decodedName = decodeURIComponent(path.slice(1));
      if (this.context.assets.images.has(decodedName)) {
        const img = this.context.assets.images.getByName(decodedName);
        return resolve({
          content: cleanUpDataURL(img.data),
          decode: 'base64',
          contentType: mimeTypes[img.extension]
        });
      }

      if (this.context.assets.js.has(decodedName)) {
        const js = this.context.assets.js.getByName(decodedName);
        return resolve({
          content: js.value,
          headers: {
            'Content-Type': 'text/javascript',
            'Cache-Control': 'no-cache, must-revalidate, max-age=0'
          }
        });
      }

      // const filePath = document.baseURI.replace(/\/$/, '') + path;
      const filePath = `${electron.appPath}${path}`;
      return resolve(readFileAsBase64(filePath));
    });
  }

  rebuildMainMenu() {
    const template = generateMenuTemplateForApp(this);
    electron.setMenu(template);
  }

  loadTutorial(tutorial) {
    this.openDesignFromURL(`./assets/tutorials/${tutorial}.json`);
  }

  loadTemplate(template) {
    this.openDesignFromURL(`./assets/templates/${template}.json`);
  }

  openDesignFromURL(jsonURL) {
    $.getJSON(jsonURL, data => {
      const context = parseBSDesignFormat(data);
      this.openContext(context, true);
    });
  }

  screenshotReady(dataURL) {
    this.trigger('screenshot-ready', dataURL);
  }

  on(str, cb, weight = 0) {
    const parsed = parseEventName(str);

    for (let i = 0; i < parsed.length; i++) {
      if (!(parsed[i].name in this.pubsub)) {
        this.pubsub[parsed[i].name] = [];
      }

      this.pubsub[parsed[i].name].push({
        weight,
        name: parsed[i].name,
        namespace: parsed[i].namespace,
        callback: cb
      });
    }

    for (let i = 0; i < parsed.length; i++) {
      this.pubsub[parsed[i].name].sort((a, b) => a.weight - b.weight);
    }

    return this;
  }

  off(str, cb) {
    const parsed = parseEventName(str);

    let queue;
    let newQueue;

    for (let i = 0; i < parsed.length; i++) {
      for (const k in this.pubsub) {
        if (this.pubsub.hasOwnProperty(k)) {
          if (parsed[i].name !== undefined && parsed[i].name !== k) {
            continue;
          }

          if (parsed[i].namespace !== undefined) {
            newQueue = [];
            queue = this.pubsub[k];

            for (let j = 0; j < queue.length; j++) {
              if (queue[j].namespace === parsed[i].namespace) {
                if (cb) {
                  if (queue[j].callback === cb) {
                    continue;
                  }
                } else continue;
              }
              newQueue.push(queue[j]);
            }
            this.pubsub[k] = newQueue;
          } else if (cb) {
            newQueue = [];
            queue = this.pubsub[k];
            for (let j = 0; j < queue.length; j++) {
              if (queue[j].callback === cb) {
                continue;
              }
              newQueue.push(queue[j]);
            }
            this.pubsub[k] = newQueue;
          } else {
            delete this.pubsub[k];
          }
        }
      }
    }

    return this;
  }

  trigger(str, ...rest) {
    const parsed = parseEventName(str);

    let queue;
    let result;

    for (let i = 0; i < parsed.length; i++) {
      if (!(parsed[i].name in this.pubsub)) {
        continue;
      }

      queue = this.pubsub[parsed[i].name];
      for (let j = 0, len = queue.length; j < len; j++) {
        if (parsed[i].namespace === undefined || parsed[i].namespace === queue[j].namespace) {
          result = queue[j].callback.apply(this.pubsub, rest);
          if (result === false) return this;
        }
      }
    }

    return this;
  }

  static createContext(options) {
    const {name = 'Untitled', path, theme, json} = options;
    const ctx = new Context(name, path, theme);

    if (!json) {
      const p = new Page('index.html');
      p.initialize();
      p.setContext(ctx);
      ctx.pages.add(p);
      ctx.setActivePage();
      const css = ctx.assets.css.create('styles.css');
      ctx.assets.css.add(css);
    } else {
      ctx.unserialize(json);
      ctx.name = name;
    }
    return ctx;
  }
}

const namespaceRegex = /([^\s\.]+)?(?:\.(\S+))?/;

function parseEventName(str) {
  const names = String(str).split(/\s+/);
  const events = new Array(names.length);
  let tmp;
  for (let i = 0; i < names.length; i++) {
    tmp = names[i].match(namespaceRegex);
    events[i] = {
      name: tmp[1],
      namespace: tmp[2]
    };
  }
  return events;
}

export default Application;
