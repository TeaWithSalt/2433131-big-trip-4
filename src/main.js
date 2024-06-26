import {render, RenderPosition} from './framework/render.js';
import WaypointsListPresenter from './presenter/waypoints-list-presenter.js';
import WaypointsModel from './model/waypoint-model.js';
import FilterPresenter from './presenter/filter-presenter';
import FilterModel from './model/filter-model';
import NewPointButtonView from './view/new-point-button-view';
import WaypointsService from './service/waypoints-service';
import {API_SRC, AUTHORIZATION} from './const';
import {getFilters, getSorts} from './utils';

const filters = getFilters();
const sorts = getSorts();

const mainContainer = document.querySelector('.trip-main');
const filterContainer = document.querySelector('.trip-controls__filters');
const eventContainer = document.querySelector('.trip-events');

const waypointsModel = new WaypointsModel({
  waypointsService: new WaypointsService(API_SRC, AUTHORIZATION)
});

const filterModel = new FilterModel();

const filterPresenter = new FilterPresenter({
  filterContainer,
  filterModel,
  waypointsModel,
  filters
});

const newPointButtonComponent = new NewPointButtonView({
  onClick: handleNewPointButtonClick
});

function handleNewPointFormClose() {
  newPointButtonComponent.element.disabled = false;
}

const eventPresenter = new WaypointsListPresenter({
  mainContainer,
  eventContainer,
  waypointsModel,
  filterModel,
  sorts,
  filters,
  onNewPointDestroy: handleNewPointFormClose
});

function handleNewPointButtonClick() {
  eventPresenter.createWaypoint();
  newPointButtonComponent.element.disabled = true;
}

render(newPointButtonComponent, mainContainer, RenderPosition.BEFOREEND);

filterPresenter.init();
eventPresenter.init();
waypointsModel.init();
