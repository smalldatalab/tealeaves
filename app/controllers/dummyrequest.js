/**
 * Created by faisal on 3/5/15.
 */

import Ember from 'ember';
// import LoginControllerMixin from 'ember-simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  ajax: Ember.inject.service('ajax'),
  actions: {
    'log-session': function() {
      console.log(this.get('session'));
    },
    'ping-eaf': function() {
      this.get('ajax').request('http://eaf.smalldata.io/v1/ping', { data: { hello: 'hi' }, headers: { Authorization: 'Bearer asdfasdfasdfasdf' } });
      console.log(this.get('session'));
    }
  }
});
