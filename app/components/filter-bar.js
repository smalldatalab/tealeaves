/**
 * Created by faisal on 3/27/15.
 */

import Ember from 'ember';

export default Ember.Component.extend({
  localSettings: Ember.inject.service('local-settings'),

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

    // ensure the necessary endpoints exist
    this.set('master_params.alters', {});
    this.set('master_params.tokens', {});

    let ourParams = this.get('localSettings').get('settings.master_params');

    console.log("Loaded params: ", ourParams);

    if (ourParams) {
      Ember.assign(this.get('master_params'), ourParams);
      this.notifyPropertyChange('master_params');
    }
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
      this.$(".filter-items").toggle(300);
    },
    'applyFilter': function() {
      let master_params = this.get('master_params');

      // cache the settings in local storage so we can reload them when the page reloads
      this.get('localSettings').set('settings.master_params', master_params);

      console.log("Saved params: ", this.get('localSettings').get('settings.master_params'));

      this.sendAction('action', master_params);
      this.set('dirty', false);
    }
  }
});
