import InputText from './InputText';

class InputSearch extends InputText {
  constructor() {
    super();
    this.attributes.type = 'search';
  }
}

InputSearch.prettyName = 'Search Input';

export default InputSearch;
