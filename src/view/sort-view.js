import AbstractView from '../framework/view/abstract-view.js';

function createSortingItemTemplate(sorting, isChecked) {
  const {name, isDisabled} = sorting;

  return (`
    <div class="trip-sort__item  trip-sort__item--${name}">
        <input id="sort-${name}" class="trip-sort__input visually-hidden" type="radio" data-sort-type="${name}" name="trip-sort" value="sort-${name}" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
        <label class="trip-sort__btn" for="sort-${name}">${name}</label>
    </div>
  `);
}

function createSortTemplate(sortingItems, currentSort) {
  const SORTING_ITEM_TEMPLATE = sortingItems
    .map((sorting) => createSortingItemTemplate(sorting, sorting.name === currentSort))
    .join('');

  return (`
    <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
        ${SORTING_ITEM_TEMPLATE}
    </form>
  `);
}

export default class SortView extends AbstractView {
  #sorts;
  #handleTypeChange;
  #currentSort;

  constructor({sorts, onChange, currentSort}) {
    super();
    this.#sorts = sorts;
    this.#currentSort = currentSort;
    this.#handleTypeChange = onChange;

    this.element.addEventListener('click', this.#onChangeType);
  }

  get template() {
    return createSortTemplate(this.#sorts, this.#currentSort);
  }

  #onChangeType = (evt) => {
    if (evt.target.classList.contains('trip-sort__input')) {
      this.#handleTypeChange(evt.target.dataset.sortType);
    }
  };
}
