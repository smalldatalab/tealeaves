/**
 * Created by faisal on 3/5/15.
 */

import Ember from 'ember';
// import LoginControllerMixin from 'ember-simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  ajax: Ember.inject.service('ajax'),
  eaf_api: Ember.inject.service('eaf-api'),

  actions: {
    'log-session': function() {
      console.log(this.get('session.data'));
    },
    'ping-eaf': function() {
      var token = this.get('session.data.authenticated.authorizationToken.access_token');
      this.get('ajax').request('http://eaf.smalldata.io/v1/ping', { data: { hello: 'hi' }, headers: { Authorization: 'Bearer ' + token } })
        .then(function(response) {
          console.log(response);
        });
    },
    'authed-ping-eaf': function() {
      var me = this;

      this.get('session').authorize('authorizer:eaf-oauth2', function(headerName, headerValue) {
        const headers = {};
        headers[headerName] = headerValue;
        const options = { data: { hello: 'hi' }, headers };

        console.log("Options: ", options);

        me.get('ajax').request('http://eaf.smalldata.io/v1/ping', options)
          .then(function(response) {
            console.log(response);
          })
          .catch(function(error) {
            console.error("ERROR!: ", error);
          });
      });
    },
    'lib-ping-eaf': function() {
      this.get('eaf_api').query('ping')
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error("ERROR!: ", error);
          this.get('session').invalidate();
          this.transitionToRoute('login');
        });
    }
  }
});
