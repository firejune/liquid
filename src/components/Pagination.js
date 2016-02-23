import ComponentWithChildren from './ComponentWithChildren';
import PaginationItem from './PaginationItem';

class Pagination extends ComponentWithChildren {
  constructor() {
    super();
    this.element = $('<nav>');
    this.defineProperties([{
      id: 'size',
      label: 'Size',
      type: 'select',
      value: '',
      options: Pagination.possibleSizes
    }]);
  }

  initialize() {
    let p = new PaginationItem;
    p.initialize();
    p.properties.type = 'previous';

    this.insertLast(p);

    for (let i = 1; i < 6; i++) {
      p = new PaginationItem;
      p.initialize();
      p.properties.value = i;
      this.insertLast(p);
    }

    p = new PaginationItem;
    p.initialize();
    p.properties.type = 'next';

    this.insertLast(p);
  }

  update() {
    super.startUpdate();

    const ul = $('<ul class="pagination">');
    if (this.properties.size) {
      ul.addClass(this.properties.size);
    }
    this.element.children().appendTo(ul);
    this.element.append(ul);

    return super.finishUpdate();
  }

  canTakeChild(component) {
    return component instanceof PaginationItem;
  }
}

Pagination.possibleSizes = [
  { label: 'Small', value: 'pagination-sm' },
  { label: 'Default', value: '' },
  { label: 'Large', value: 'pagination-lg' }
];

export default Pagination;
