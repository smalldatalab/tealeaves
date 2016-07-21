import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('index', { path: '/' });
  this.route('zcompare');
  this.route('browse');
  this.route('login');
  this.route('authed');

  this.route('dummyrequest', { path: '/dumb' });
});

export default Router;
