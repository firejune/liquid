export default function generateMenuTemplateForApp(app) {
  const template = [];
  const isOSX = electron.os === 'osx';
  const recent = [];

  for (const r of app.getRecentDesigns(10)) {
    recent.push({
      label: r.path,
      click: app.openDesignAction.bind(app, r.path)
    });
  }

  if (isOSX) {
    template.push({
      label: 'Psyclone Studio',
      submenu: [
        { label: 'About Psyclone Studio', click: app.showAboutDialog.bind(app) },
        { label: 'Delete License Key', click: app.deleteLicenseKey.bind(app) },
        { label: 'Purchase', click: app.openURLInBrowser.bind(app, 'https://payclonestudio.io/#purchase'), visible: app.isTrial() },
        { type: 'separator' },
        { label: 'Hide Psyclone Studio', accelerator: 'CmdOrCtrl+H', selector: 'hide:' },
        { label: 'Hide Others', accelerator: 'CmdOrCtrl+Shift+H', selector: 'hideOtherApplications:' },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', selector: 'terminate:' }
      ]
    });
  }

  const fileMenu = {
    label: 'File',
    submenu: [
      { label: 'New Design', accelerator: 'CmdOrCtrl+N', click: app.showDialogForNewDesign.bind(app) },
      { label: 'Open', accelerator: 'CmdOrCtrl+O', click: app.openDesignDialog.bind(app) },
      { label: 'Open Recent', enabled: recent.length > 0, submenu: recent },
      { label: 'Save', accelerator: 'CmdOrCtrl+S', enabled: app.hasOpenedContexts() && app.context.canBeSaved(), click: app.saveDesign.bind(app, app.context) },
      { label: 'Save As', accelerator: 'CmdOrCtrl+Shift+S', enabled: app.hasOpenedContexts() && app.context.existsOnDisk(), click: app.saveDesignAs.bind(app, app.context) },
      { type: 'separator' },
      { label: 'Import Component', click: app.openPackageDialog.bind(app) },
      { label: 'Component Library', click: app.openURLInBrowser.bind(app, 'https://payclonestudio.io/library') }
    ]
  };

  if (!isOSX) {
    fileMenu.submenu.push(
      { type: 'separator' },
      { label: 'Close Design', accelerator: 'Ctrl+W', enabled: app.hasOpenedContexts(), click: app.confirmCloseContext.bind(app, app.context) },
      { label: 'Quit', accelerator: 'Ctrl+Q', click: app.quit.bind(app) }
    );
  }

  template.push(fileMenu);

  if (isOSX) {
    template.push({
      label: 'Edit',
      submenu: [
        { label: app.undoName(), enabled: app.hasUndo(), accelerator: 'CmdOrCtrl+Z', click: app.undo.bind(app) },
        { label: app.redoName(), enabled: app.hasRedo(), accelerator: 'Shift+CmdOrCtrl+Z', click: app.redo.bind(app) },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' }
      ]
    });
  } else {
    template.push({
      label: 'Edit',
      submenu: [
        { label: app.undoName(), enabled: app.hasUndo(), accelerator: 'CmdOrCtrl+Z', click: app.undo.bind(app) },
        { label: app.redoName(), enabled: app.hasRedo(), accelerator: 'Shift+CmdOrCtrl+Z', click: app.redo.bind(app) }
      ]
    });
  }

  template.push({
    label: 'View',
    submenu: [
      { label: 'Full Screen', accelerator: isOSX ? 'Ctrl+Command+F' : 'F11', click: electron.toggleFullScreen },
      { type: 'separator' },
      { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
      { label: 'Close', enabled: !app.hasOpenedContexts(), accelerator: 'CmdOrCtrl+W', click: electron.quit },
      { type: 'separator' },
      { label: 'Zoom In', enabled: app.hasOpenedContexts(), click: app.zoomIn.bind(app) },
      { label: 'Zoom Out', enabled: app.hasOpenedContexts(), click: app.zoomOut.bind(app) },
      { label: 'Normal Size', enabled: app.hasOpenedContexts(), click: app.resetZoom.bind(app) }
    ]
  });

  if (app.context) {
    template.push({
      label: 'Design',
      submenu: [
        { label: 'Change Theme', click: app.changeThemeForDesign.bind(app, app.context) },
        { label: 'Manage Themes', click: app.themeManagerDialog.open.bind(app.themeManagerDialog) },
        { type: 'separator' },
        { label: 'Import Image', click: app.designPane.importImageAction.bind(app.designPane) },
        { label: 'Import Font', click: app.designPane.importFontAction.bind(app.designPane) },
        { type: 'separator' },
        { label: 'Export Design', click: app.exportContext.bind(app, app.context), accelerator: 'CmdOrCtrl+E' },
        { label: 'Duplicate Design', click: app.openDuplicateDesign.bind(app, app.context) },
        { label: 'Close Design', click: app.confirmCloseContext.bind(app, app.context), accelerator: 'CmdOrCtrl+W' }
      ]
    });
  }

  if (app.context && app.context.page.focusedComponent) {
    const componentMenu = { label: 'Component', submenu: [] };

    const visibleActions = app.context.page.focusedComponent.getVisibleActions()
      .filter(a => a.showInApplicationMenu);

    for (const action of visibleActions) {
      componentMenu.submenu.push({
        label: action.label,
        click: action.action,
        accelerator: action.accelerator
      });
    }

    if (visibleActions.length) {
      template.push(componentMenu);
    }
  }

  // if (app.inDevelopment()) {
    template.push({
      label: 'Development',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: electron.reloadWindow.bind(electron) },
        { label: 'Toggle DevTools', accelerator: isOSX ? 'Alt+Command+I' : 'Ctrl+Shift+I', click: electron.toggleDevTools.bind(electron) }
      ]
    });
  // }

  template.push({
    label: 'Help',
    submenu: [
      {
        label: 'Tutorials',
        submenu: [
          { label: 'Getting Started Guide', click: app.loadTutorial.bind(app, 'getting-started') },
          { label: 'Writing JavaScript And CSS', click: app.loadTutorial.bind(app, 'writing-javascript-and-css') },
          { label: 'The Bootstrap Grid', click: app.loadTutorial.bind(app, 'the-bootstrap-grid') },
          { label: 'Custom Components', click: app.loadTutorial.bind(app, 'custom-components') },
          { label: 'Preview And Export', click: app.loadTutorial.bind(app, 'preview-and-export') }
        ]
      },

      { type: 'separator' },
      { label: 'Delete License Key', click: app.deleteLicenseKey.bind(app), visible: !isOSX },
      { label: 'Purchase', click: app.openURLInBrowser.bind(app, 'https://payclonestudio.io/#purchase'), visible: app.isTrial() && !isOSX },
      { type: 'separator' },
      { label: 'Keyboard Shortcuts', click: app.openURLInBrowser.bind(app, 'https://payclonestudio.io/pages/keyboard-shortcuts') },
      { label: 'Bug Report', click: app.openURLInBrowser.bind(app, 'https://payclonestudio.io/bug-report') },
      { label: 'What\'s New', click: app.showWhatsNewDialog.bind(app) },
      { label: 'About Psyclone Studio', click: app.showAboutDialog.bind(app), visible: !isOSX }
    ]
  });

  return template;
}
