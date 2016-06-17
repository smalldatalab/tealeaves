/**
 * Created by faisal on 3/3/15.
 */

import Ember from 'ember';
// import ajax from 'ic-ajax';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  ajax: Ember.inject.service(),
  eaf_api: Ember.inject.service("eaf-api"),

  model: function() {
    return this.get('component_list');
  },

  afterModel: function() {
    // just ping the server to make sure we're really connected
    console.log("right before routes:browse:authorize...");
    this.get('eaf_api').ping(this);
  },
  component_list: []
});
