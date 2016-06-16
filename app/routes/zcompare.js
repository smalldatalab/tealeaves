/**
 * Created by faisal on 3/3/15.
 */

import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  session: Ember.inject.service('session'),
  ajax: Ember.inject.service('ajax'),
  model: function() {
    return this.get('component_list');
  },
  afterModel: function() {
    // just ping the server to make sure we're really connected
    console.log("right before routes:compare:authorize...");
    this.get('session').authorize('authorizer:oauth2', (headerName, headerValue) => {
      const headers = {};
      headers[headerName] = headerValue;
      this.get('ajax').request('http://eaf.smalldata.io/v1/ping', { headers: { headers } });
    });
  },
  component_list: []
});
