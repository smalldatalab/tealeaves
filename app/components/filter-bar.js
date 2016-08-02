/**
 * Created by faisal on 3/27/15.
 */

import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['filter-bar'],
  // master_params: {},
  dirty: false,
  filter_repr: function() {
    return JSON.stringify(this.get('master_params'));
  }.property(
    'master_params.alters.min_sent',
    'master_params.alters.selected_alter_list.[]',
    'master_params.alters.alter_list_type',
    'master_params.tokens.list.[]'
  ),

  init: function() {
    this._super(...arguments);

    // this.set('master_params', {});
    this.set('master_params.alters', {});
    this.set('master_params.tokens', {});
  },

  masterDirty: function() {
    this.set('dirty', true);
  }.observes(
    'master_params.alters.min_sent',
    'master_params.alters.selected_alter_list.[]',
    'master_params.alters.alter_list_type',
    'master_params.tokens.list.[]'
  ),

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
