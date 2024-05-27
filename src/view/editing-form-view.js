import {humanizeWaypointDueDate, stringToDate} from '../utils.js';
import {ACTIONS, DATE_FORMAT_EDIT} from '../const.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import dayjs from 'dayjs';

function getEventOffer({id, title, price, isChecked}) {
  return `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${id}" type="checkbox" name="event-offer-${id}" data-offer-id="${id}" ${isChecked ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${id}">
        <span class="event__offer-title">${title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </label>
    </div>
  `;
}

function getEventOffers(allOffers, checkedOffers, type) {
  let result = '';
  for (const offer of allOffers.find((findOffer) => findOffer.type === type).offers) {
    result += getEventOffer({...offer, isChecked: checkedOffers?.includes(offer.id)});
  }
  return result;
}

function getEventOfferType(allOffers, n) {
  return `
    <div class="event__type-item">
    <input id="event-type-${allOffers[n].type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${allOffers[n].type}">
    <label class="event__type-label  event__type-label--${allOffers[n].type}" for="event-type-${allOffers[n].type}-1">${allOffers[n].type}</label>
    </div>
  `;
}

function getEventOfferTypes(allOffers) {
  let result = '';
  for (let i = 0; i <= allOffers.length - 1; i++) {
    result += getEventOfferType(allOffers, i);
  }
  return result;
}

function getDestinationPictures(pictures) {
  return `
    <div class="event__photos-container">
      <div class="event__photos-tape">
        ${pictures.map((picture) => `<img class="event__photo" src=${picture.src} alt=${picture.description}>`)}
      </div>
    </div>
  `;
}

function getDestinations(destinations) {
  let result = '';
  for (let i = 0; i <= destinations.length - 1; i++) {
    result += `<option value="${destinations[i].name}"></option>`;
  }
  return result;
}

function createEditingFormTemplate(allDestinations, allOffers, {
  editMode,
  type,
  destination,
  offers,
  basePrice,
  dateFrom,
  dateTo
}) {
  const destinationObject = allDestinations.find((dest) => dest.id === destination);
  const waypointType = type || 'flight';
  const offersList = getEventOffers(allOffers, offers, waypointType);

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${waypointType}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>

                ${getEventOfferTypes(allOffers)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${waypointType}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationObject?.name || ''}" list="destination-list-1">
            <datalist id="destination-list-1">
              ${getDestinations(allDestinations)}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${humanizeWaypointDueDate(dateFrom, DATE_FORMAT_EDIT)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${humanizeWaypointDueDate(dateTo, DATE_FORMAT_EDIT)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice || 0}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${editMode === ACTIONS.ADD_POINT ? 'Delete' : 'Cancel'}</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">${offersList ? 'Offers' : ''}</h3>
            <div class="event__available-offers">
                ${offersList}
            </div>
          </section>

          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">
                ${(destinationObject?.description || destinationObject?.pictures.length > 0) ? 'Destination' : ''}
            </h3>
            <p class="event__destination-description">${destinationObject?.description || ''}</p>
            ${destinationObject?.pictures ? getDestinationPictures(destinationObject?.pictures) : ''}
          </section>
        </section>
      </form>
    </li>
  `;
}

export default class EditingFormView extends AbstractStatefulView {
  #onFormSubmit;
  #onClose;
  #offers;
  #destinations;
  #onDelete;
  #editMode;

  constructor({offers, destinations, waypoint, onFormSubmit, onClose, onDelete}) {
    super();
    this.#editMode = this.#getEditMode();
    this._state = waypoint;
    this.#offers = offers;
    this.#destinations = destinations;
    this.editingForm = Object.assign({}, waypoint);
    this.#onFormSubmit = onFormSubmit;
    this.#onClose = onClose;
    this.#onDelete = onDelete;

    this._restoreHandlers();
  }

  get template() {
    return createEditingFormTemplate(this.#destinations, this.#offers, {editMode: this.#editMode, ...this._state});
  }

  reset(waypoint) {
    waypoint = this.editingForm;
    this.updateElement(waypoint);
  }

  #getEditMode() {
    return this._state.id ? ACTIONS.UPDATE_POINT : ACTIONS.ADD_POINT;
  }


  #closeFormHandler = (event) => {
    event.preventDefault();
    this.#onClose();
  };

  #submitFormHandler = (evt) => {
    evt.preventDefault();
    this.#onFormSubmit(this._state);
  };

  #changeTypeHandler = (evt) => {
    evt.preventDefault();
    this._state.type = evt.target.value;
    this.updateElement({
      type: this._state.type,
    });
  };

  #changeDestinationHandler = (evt) => {
    evt.preventDefault();
    if (this.#destinations.find((destination) => destination.name === evt.target.value)) {
      this._state.destination = this.#destinations.find((destination) => destination.name === evt.target.value).id;
      this.updateElement({
        destination: this._state.destination,
      });
    }
  };

  #changePriceHandler = (evt) => {
    evt.preventDefault();
    this._state.basePrice = parseInt(evt.target.value, 10);
    this.updateElement({
      basePrice: this._state.basePrice,
    });
  };

  #changeStartTimeHandler = (event) => {
    event.preventDefault();
    const dateValue = `${event.target.value}`;
    const data = stringToDate(dateValue, 'dd/mm/yy hh:ii');
    this._state.dateFrom = dayjs(data).format('YYYY-MM-DDTHH:mm:ss');
    this.updateElement({
      dateFrom: this._state.dateFrom,
    });
  };

  #changeEndTimeHandler = (event) => {
    event.preventDefault();
    const dateValue = `${event.target.value}`;
    const data = stringToDate(dateValue, 'dd/mm/yy hh:ii');
    this._state.dateTo = dayjs(data).format('YYYY-MM-DDTHH:mm:ss');
    this.updateElement({
      dateTo: this._state.dateTo,
    });
  };

  #changeOffersHandler = (event) => {
    event.preventDefault();
    const offers = [];
    this.element.querySelectorAll('.event__offer-checkbox:checked').forEach((element) => {
      offers.push(element.dataset.offerId);
    });
    this._state.offers = offers;
    this.updateElement({
      offers: this._state.offers,
    });
  };


  #deleteFromHandler = (evt) => {
    evt.preventDefault();
    this.#onDelete(this.editingForm);
  };

  _restoreHandlers() {
    this.element.querySelector('.event--edit').addEventListener('submit', this.#submitFormHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeFormHandler);
    this.element.querySelectorAll('.event__type-input').forEach((element) => {
      element.addEventListener('click', this.#changeTypeHandler);
    });
    this.element.querySelector('.event__input--destination').addEventListener('input', this.#changeDestinationHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#changePriceHandler);
    this.element.querySelector('input[name="event-start-time"]').addEventListener('change', this.#changeStartTimeHandler);
    this.element.querySelector('input[name="event-end-time"]').addEventListener('change', this.#changeEndTimeHandler);
    this.element.querySelectorAll('.event__offer-checkbox').forEach((element) => {
      element.addEventListener('click', this.#changeOffersHandler);
    });
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteFromHandler);
  }
}
