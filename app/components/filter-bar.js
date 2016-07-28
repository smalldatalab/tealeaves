/**
 * Created by faisal on 3/27/15.
 */

import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['filter-bar'],
  master_params: {},
  dirty: false,
  filter_repr: function() {
    return JSON.stringify(this.get('master_params'));
  }.property('master_params.alters', 'master_params.tokens'),

  masterDirty: function() {
    this.set('dirty', true);
  }.observes('master_params.alters', 'master_params.tokens'),

  actions: {
    'toggleFilters': function() {
      this.$(".filter-items").slideToggle(300);
    },
    'applyFilter': function() {
      this.sendAction('action', this.get('master_params'));
      this.set('dirty', false);
    }
  }
});
