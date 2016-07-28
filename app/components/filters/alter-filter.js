/**
 * Created by faisal on 6/28/16.
 */

import Ember from 'ember';
/* global moment */

function filterObject(obj, predicate) {
  return Object.keys(obj)
    .filter(key => predicate(obj[key]))
    .reduce((res, key) => (res[key] = obj[key], res), {});
}

export default Ember.Component.extend({
  // services
  eaf_api: Ember.inject.service('eaf-api'),

  // properties and computed properties
  alters: [],
  isAlterTimeConstrained: true,

  selected_alter_list: Ember.computed(() => []),
  min_sent: 0,

  // alter list options
  alter_list_type_options: {
    'whitelist': 'whitelist (only these people)',
    'blacklist': 'blacklist (not any of these people)'
  },
  alter_list_type: 'whitelist',

  updateMasterParams: function() {
    this.set('params', { alters: {
      list: this.get('selected_alter_list'),
      list_type: this.get('alter_list_type'),
      min_sent: this.get('min_sent')
    }});
  }.observes('selected_alter_list.[]', 'alter_list_type', 'min_sent'),

  // lifecycle event handlers
  actions: {
    'add-alter': function(alter) {
      if (!alter) { return; }
      this.get('selected_alter_list').addObject(alter);
    },
    'remove-alter': function(alter) {
      this.get('selected_alter_list').removeObject(alter);
    }
  },

  didInsertElement: function() {
    this.bind();
  },

  bind: function() {
    this.bindAlters();
  }.observes('isAlterTimeConstrained'),

  /**
   * Queries for list of alters and populates dropdown with the results.
   */
  bindAlters: function() {
    this.$(".alters-loader").show();
    this.set('selected_alter', null);

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
