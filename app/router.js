import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('info', { path: "/info" });
  this.route('compare', { path: "/compare" });
});

export default Router;
