import Bar from './Bar';
import tabHandler from '../helpers/tabHandler';

export default class TabBar extends Bar {
  constructor(elem) {
    super();

    this.element = elem;
    this.tabHolder = elem.find('.tab-holder');
    this.domToContext = new WeakMap;

    tabHandler({
      app,
      tabAreas: [elem],
      onClick: this.onTabClick.bind(this),
      onChange: this.afterTabReorder.bind(this)
    });

    app.on('context-opened context-closed context-activated context-saved',
      this.scheduleUpdate.bind(this));

    app.on('context-changed', this.contextChanged.bind(this));
  }

  contextChanged(context) {
    const index = app.openedContexts.indexOf(context);
    const tab = this.tabHolder.find('.tab').eq(index);
    tab.toggleClass('unsaved', !context.isSaved());
    tab.find('.title').text(formatContextName(context.name));
  }

  onTabClick(e) {
    const context = this.domToContext.get(e.target.closest('.tab'));
    if (!context) return;
    if (e.button === 2) {
      app.contextMenu.show(e.pageX, e.pageY, [{
        name: 'Duplicate',
        action: app.openDuplicateDesign.bind(app, context)
      }, {
        name: 'Close',
        action: app.confirmCloseContext.bind(app, context)
      }]);
      e.stopPropagation();
      return;
    }

    if (e.button === 1) {
      app.confirmCloseContext(context);
      return;
    }

    if (e.target.matches('.close')) {
      app.confirmCloseContext(context);
      return;
    }

    if (!context.isActive()) {
      $(e.target).closest('.tab').addClass('active').siblings().removeClass('active');
      setTimeout(() => app.activateContext(context), 5);
    }
  }

  afterTabReorder() {
    const self = this;
    app.openedContexts = this.element.find('.tab').map(function() {
      return self.domToContext.get(this);
    }).toArray();
  }

  scheduleUpdate() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.update.bind(this), 25);
  }

  update() {
    const arr = [];
    for (let i = 0; i < app.openedContexts.length; i++) {
      const ctx = app.openedContexts[i];
      const tmp = $(
        '<div class="tab"><span class="title"></span><span class="close"></span></div>'
      );

      tmp.find('.title').text(formatContextName(ctx.name)).attr('title', ctx.path);
      tmp.toggleClass('active', ctx.isActive());
      tmp.toggleClass('unsaved', !ctx.isSaved());
      this.domToContext.set(tmp[0], ctx);
      arr.push(tmp);
    }

    if (arr.length) {
      this.element.show();
      this.tabHolder.html(arr);
    }
  }
}

function formatContextName(str) {
  if (str.length >= 30) {
    return `${str.slice(0, 30)}..`;
  }

  return str;
}
