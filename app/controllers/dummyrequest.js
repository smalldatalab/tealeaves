/**
 * Created by faisal on 3/5/15.
 */

import Ember from 'ember';
import tools from 'tealeaves/library/toolkit';
// import LoginControllerMixin from 'ember-simple-auth/mixins/login-controller-mixin';

/* global moment */

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  ajax: Ember.inject.service('ajax'),
  eaf_api: Ember.inject.service('eaf-api'),
  query_min_date: null,
  query_max_date: null,

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
    },

    'exec-query': function() {
      this.set('query_loading', true);

      var params = {};

      if (this.get('useDateRange')) {
          params['min_date'] = tools.apiTZDateTime(moment(this.get('query_min_date')));
          params['max_date'] = tools.apiTZDateTime(moment(this.get('query_max_date')));
      }

      if (this.get('extraParams')) {
        for (var x of this.get('extraParams').split("&")) {
          var parts = x.split("=");
          params[parts[0]] = parts[1];
        }
      }

      this.get('eaf_api').query(this.get('query_path'), params)
        .then((response) => {
          this.set('query_result', JSON.stringify(response, null, 2));
          this.set('query_loading', false);
        })
        .catch((error) => {
          console.error("ERROR!: ", error);
          this.set('query_result', "ERROR: " + error);
          this.set('query_loading', false);
        });
    }
  }
});
