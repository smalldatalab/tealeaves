/**
 * Created by faisal on 3/5/15.
 */

import Ember from 'ember';
// import LoginControllerMixin from 'ember-simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  authenticator: 'authenticator:torii',
  actions: {
    'connect-eaf': function() {
      this.get('session').authenticate('ember-simple-auth-authenticator:torii', 'eaf-oauth2');
    },
    'disconnect-eaf': function() {
        this.get('session').invalidate();
    }
  }
});
