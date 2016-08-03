/**
 * Created by faisal on 3/3/15.
 */

import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  session: Ember.inject.service('session'),
  ajax: Ember.inject.service('ajax'),
  eaf_api: Ember.inject.service('eaf-api'),

  model: function() {
    return this.get('component_list');
  },
  beforeModel: function() {
    this._super(...arguments);

    // just ping the server to make sure we're really connected
    console.log("right before routes:compare:authorize...");
    this.get('eaf_api').ping(this);
  },
  component_list: []
});
