import dayjs from 'dayjs';
import {FILTER_TYPE, MAX_EVENTS_LENGTH, SORTING_TYPES} from './const';

function humanizeWaypointDueDate(dueDate, format) {
  return dueDate ? dayjs(dueDate).format(format) : '';
}

function countDuration(dateFrom, dateTo) {
  return dayjs(dateTo).diff(dateFrom, 'm');
}

function formatDuration(minutes) {
  const days = Math.floor(minutes / 24 / 60);
  const hours = Math.floor(minutes / 60) - (days * 24);
  minutes = minutes - hours * 60 - days * 60 * 24;

  let result = '';
  if (days > 0) {
    result = `${days}D ${hours}H ${minutes}M`;
  } else {
    if (hours > 0) {
      result += `${hours}H `;
    }
    result += `${minutes}M`;
  }

  return result;
}

function isEscape(key) {
  return key === 'Escape' || key === 'Esc';
}

const formatDate = (date, formatPattern) => date ? dayjs(date).format(formatPattern) : '';

const getRoute = (events, destinations) => {
  let route = '';
  let routeDates = '';
  const eventsLength = events.length;
  const firstEvent = events[0];
  const lastEvent = events[eventsLength - 1];

  routeDates = `
    ${formatDate(firstEvent.dateFrom, 'DD MMM')}
    &nbsp;&mdash;&nbsp;
    ${formatDate(lastEvent.dateTo, 'DD MMM')}
  `;

  if (eventsLength <= MAX_EVENTS_LENGTH) {
    route = events
      .map((event) => destinations.find((destination) => destination.id === event.destination).name)
      .join(' &mdash; ');

    return {route, routeDates};
  }

  const firstRoutePoint = destinations.find((destination) => destination.id === firstEvent.destination);
  const lastRoutePoint = destinations.find((destination) => destination.id === lastEvent.destination);
  route = `${firstRoutePoint.name} &mdash; ... &mdash; ${lastRoutePoint.name}`;

  return {route, routeDates};
};

const getOfferById = (offers, type, id) =>
  offers
    .find((offer) => offer.type === type).offers
    .find((item) => item.id === id);

const getTotalEventPrice = (event, offers) =>
  event.basePrice + event.offers.reduce((sum, offer) => sum + getOfferById(offers, event.type, offer).price, 0);
const getTotalPrice = (events, offers) =>
  events.reduce((sum, event) => sum + getTotalEventPrice(event, offers), 0);

const filters = {
  [FILTER_TYPE.EVERYTHING]: (points) => points.filter((point) => point),
  [FILTER_TYPE.FUTURE]: (points) => points.filter((point) => new Date(point.dateFrom) > new Date()),
  [FILTER_TYPE.PRESENT]: (points) => points.filter((point) => new Date(point.dateFrom) <= new Date() && new Date() <= new Date(point.dateTo)),
  [FILTER_TYPE.PAST]: (points) => points.filter((point) => new Date(point.dateTo) < new Date()),
};

function getFilters() {
  return Object.entries(filters).map(([name, getPoints]) => ({
    name,
    getPoints,
  }));
}

const sorts = {
  [SORTING_TYPES.DAY]: (points) => points.sort((pointA, pointB) => new Date(pointA.dateFrom) - new Date(pointB.dateFrom)),
  [SORTING_TYPES.EVENT]: (points) => points,
  [SORTING_TYPES.TIME]: (points) => points.sort((pointA, pointB) => countDuration(pointB.dateFrom, pointB.dateTo) - countDuration(pointA.dateFrom, pointA.dateTo)),
  [SORTING_TYPES.PRICE]: (points) => points.sort((pointA, pointB) => pointB.basePrice - pointA.basePrice),
  [SORTING_TYPES.OFFERS]: (points) => points,
};

function getSorts() {
  return Object.entries(sorts).map(([name, getPoints]) => ({
    name,
    getPoints,
    isDisabled: name === SORTING_TYPES.EVENT || name === SORTING_TYPES.OFFERS
  }));
}

export {
  humanizeWaypointDueDate,
  countDuration,
  formatDuration,
  isEscape,
  formatDate,
  getRoute,
  getOfferById,
  getTotalEventPrice,
  getTotalPrice,
  getFilters,
  getSorts
};
