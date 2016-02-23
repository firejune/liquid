import Component from './Component';

class ProgressBar extends Component {
  constructor() {
    super();

    this.defineProperties([{
      id: 'percentage',
      label: 'Percentage',
      type: 'textbox',
      value: ''
    }, {
      id: 'style',
      label: 'Style',
      type: 'select',
      value: '',
      options: ProgressBar.possibleStyles
    }, {
      id: 'striped',
      label: 'Striped',
      type: 'checkbox',
      value: false
    }, {
      id: 'animated',
      label: 'Animated',
      type: 'checkbox',
      value: false
    }, {
      id: 'showLabel',
      label: 'Show Label',
      type: 'checkbox',
      value: true
    }]);

    this.cssClasses.system = 'progress';
    this.element = $('<div>\n			<div></div>\n		</div>');
  }

  update() {
    const insideDiv = this.element.find('div');
    insideDiv.attr('class', 'progress-bar');
    insideDiv.empty();

    const percentage = this.properties.percentage || 0;
    if (this.properties.showLabel) {
      insideDiv.append(`${percentage}%`);
    } else {
      const span = $('<span class="sr-only">');
      span.text(`${percentage}%`);
      insideDiv.append(span);
    }

    if (this.properties.style) {
      insideDiv.addClass(this.properties.style);
    }

    if (this.properties.striped) {
      insideDiv.addClass('progress-bar-striped');
    }

    if (this.properties.animated) {
      insideDiv.addClass('active');
    }

    insideDiv.attr('aria-valuenow', percentage);
    insideDiv.attr('aria-valuemin', 0);
    insideDiv.attr('aria-valuemax', 100);
    insideDiv.css('width', `${percentage}%`);

    return super.update();
  }
}

ProgressBar.possibleStyles = [
  { label: 'Default', value: '' },
  { label: 'Success', value: 'progress-bar-success' },
  { label: 'Info', value: 'progress-bar-info' },
  { label: 'Warning', value: 'progress-bar-warning' },
  { label: 'Danger', value: 'progress-bar-danger' }
];

ProgressBar.prettyName = 'Progress Bar';

export default ProgressBar;
