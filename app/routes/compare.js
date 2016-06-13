/**
 * Created by faisal on 3/3/15.
 */

import Ember from 'ember';
// import ajax from 'ic-ajax';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

/*
export default Ember.Route.extend(AuthenticatedRouteMixin, {
  session: Ember.inject.service('session'),
  model: function() {
    return this.get('component_list');
  },
  afterModel: function() {
    // just ping the server to make sure we're really connected
    this.get('session').authorize('authorizer:oauth2', (headerName, headerValue) => {
      const headers = {};
      headers[headerName] = headerValue;
      Ember.$.ajax('http://eaf.smalldata.io/api/ping', { headers });
    });
  },
  component_list: []
});
*/

export default Ember.Route.extend(AuthenticatedRouteMixin);
