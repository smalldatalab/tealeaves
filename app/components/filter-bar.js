/**
 * Created by faisal on 3/27/15.
 */

import Ember from 'ember';

export default Ember.Component.extend({
  localSettings: Ember.inject.service('local-settings'),

  classNames: ['filter-bar'],
  // master_params: {},
  dirty: false,
  filter_repr: Ember.computed(
    'master_params.alters.min_sent',
    'master_params.alters.selected_alter_list.[]',
    'master_params.alters.alter_list_type',
    'master_params.tokens.list.[]',
    'master_params.labels.list.[]',
    function() {
      return JSON.stringify(this.get('master_params'));
    }),

  init: function() {
    this._super(...arguments);

    // ensure the necessary endpoints exist
    this.set('master_params.alters', {});
    this.set('master_params.tokens', {});
    this.set('master_params.labels', {});
  },

  debug: function() {
    // this._super(...arguments);

    let ourParams = this.get('localSettings').get('settings.master_params');

    console.log("Loaded params: ", ourParams);

    if (ourParams) {
      console.log("Our params: ", ourParams);
      console.log("master_params: ", this.get('master_params'));
      this.set('master_params', ourParams);
      console.log("post-set master_params: ", this.get('master_params'));
      this.notifyPropertyChange('master_params');
    }
  },

  masterDirty: Ember.observer(
    'master_params.alters.min_sent',
    'master_params.alters.selected_alter_list.[]',
    'master_params.alters.alter_list_type',
    'master_params.tokens.list.[]',
    'master_params.labels.list.[]',
    function() {
      this.set('dirty', true);
    }
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
