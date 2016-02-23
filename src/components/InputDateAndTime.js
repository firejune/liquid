import InputBase from './InputBase';

class InputDateAndTime extends InputBase {
  constructor() {
    super();

    this.addCapabilities(['min', 'max', 'step', 'size']);

    this.defineProperties({
      id: 'type',
      label: 'Type',
      type: 'select',
      value: 'date',
      options: InputDateAndTime.possibleTypes,
      group: 'input-main'
    });
  }

  update() {
    this.attributes.type = this.properties.type;

    return super.update();
  }
}

InputDateAndTime.possibleTypes = [
  { label: 'Date', value: 'date' },
  { label: 'Time', value: 'time' },
  { label: 'Datetime Local', value: 'datetime-local' },
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' }
];

InputDateAndTime.prettyName = 'Date And Time Input';

export default InputDateAndTime;
