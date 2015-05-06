/**
 * Created by faisal on 12/12/14.
 */

import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    this.transitionTo('info');
  }
});
