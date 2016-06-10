/**
 * Created by faisal on 3/3/15.
 */

import Ember from 'ember';
import ajax from 'ic-ajax';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function() {
    return this.get('component_list');
  },
  afterModel: function() {
    // just ping the server to make sure we're really connected
    return this.get('session').authorize('authorizer:eaf-oauth2', function() {
      return ajax('http://eaf.smalldata.io/api/ping');
    });
  },
  component_list: []
});
