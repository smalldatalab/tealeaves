/**
 * Created by faisal on 6/28/16.
 */

import Ember from 'ember';
/* global moment */

export default Ember.Component.extend({
  // services
  eaf_api: Ember.inject.service('eaf-api'),

  init: function() {
    this._super(...arguments);

    this.set('params.min_sent', 0);
    this.set('params.selected_alter_list', []);
    this.set('params.alter_list_type', 'whitelist');
  },

  // our own local propeties
  alters: [],
  selected_alter: null,
  alter_list_type_options: {
    'whitelist': 'whitelist (only these people)',
    'blacklist': 'blacklist (not any of these people)'
  },
  isAlterTimeConstrained: true,

  updateMasterParams: function() {
    this.notifyPropertyChange('params');
  }.property('params.selected_alter_list.[]', 'params.alter_list_type', 'params.min_sent'),

  // lifecycle event handlers
  actions: {
    'add-alter': function(alter) {
      if (!alter) { return; }
      this.get('params.selected_alter_list').addObject(alter);
    },
    'remove-alter': function(alter) {
      this.get('params.selected_alter_list').removeObject(alter);
    }
  },

  didInsertElement: function() {
    this.bind();
  },

  bind: function() {
    this.bindAlters();
  }.observes('isAlterTimeConstrained', 'start_date_A', 'start_date_B', 'end_date_A', 'end_date_B'),

  /**
   * Queries for list of alters and populates dropdown with the results.
   */
  bindAlters: function() {
    this.$(".alters-loader").show();

    var params = {};

    if (this.get('isAlterTimeConstrained')) {
      params['min_date'] = moment.min(moment(this.get('start_date_A')), moment(this.get('start_date_B')))
        .format("YYYY-MM-DD");
      params['max_date'] = moment.max(moment(this.get('end_date_A')), moment(this.get('end_date_B')))
        .format("YYYY-MM-DD");
    }

    var _this = this;
    this.get('eaf_api').query('alter', params)
      .then(function(data) {
        // create a dictionary mapping 'displayed address' => '{ display, actual } for deduplication purposes
        // later we'll just convert it into a list of values and disregard the key
        var alters = data.objects
          .reduce((prev, cur) => { prev[cur.email] = cur.name; return prev; }, {});
        alters = Object.keys(alters).map((k) => ({ display: `${alters[k]} (${k})`, value: k }));
        alters.sort(function(a,b) { return a.display.localeCompare(b.display); });

        // select address column and remove all empty entries
        _this.set('alters', alters);
      })
      .finally(function() {
        // disable the loading spinner
        _this.$(".alters-loader").fadeOut(300);
      });
  }
});
