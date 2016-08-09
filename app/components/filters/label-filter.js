/**
 * Created by faisal on 8/9/16.
 */

import Ember from 'ember';

export default Ember.Component.extend({
  // services
  eaf_api: Ember.inject.service('eaf-api'),

  init: function() {
    this._super(...arguments);
    this.set('params.list', []);

    this.bind();
  },

  // local properties
  isLoading: false,
  availableLabels: [],

  updateMasterParams: function() {
    this.notifyPropertyChange('params');
  }.property('params.list.[]'),

  bind: function() {
    this.bindLabels();
  },

  /**
   * Queries for list of alters and populates dropdown with the results.
   */
  bindLabels: function() {
    this.set('isLoading', true);

    var params = {};

    var _this = this;
    this.get('eaf_api').query('mail_label', params)
      .then(function(data) {
        _this.set('availableLabels', data['objects']);

        // add a set of default-selected labels
        _this.get('params.list').addObjects(['INBOX','SENT']);
      })
      .finally(function() {
        // disable the loading spinner
        _this.set('isLoading', false);
      });
  }
});
