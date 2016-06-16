/**
 * Created by faisal on 3/3/15.
 */

import Ember from 'ember';
// import ajax from 'ic-ajax';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  ajax: Ember.inject.service(),
  model: function() {
    return this.get('component_list');
  },
  afterModel: function() {
    // just ping the server to make sure we're really connected
    console.log("right before routes:browse:authorize...");
    this.get('session').authorize('authorizer:oauth2', (headerName, headerValue) => {
      console.log("HOWDY");

      const headers = {};
      headers[headerName] = headerValue;
      console.log(headers);
      this.get('ajax').request('http://eaf.smalldata.io/v1/ping', { headers: { headers } });
    });
  },
  component_list: []
});
