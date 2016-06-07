import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('info');
  this.route('compare');
  this.route('browse');
  this.route('login');
  this.route('authed');
});

export default Router;
