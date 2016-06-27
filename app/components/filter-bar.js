/**
 * Created by faisal on 3/27/15.
 */

import Ember from 'ember';
/* global moment */

export default Ember.Component.extend({
  classNames: ['filter-bar'],
  alters: [],
  filters: {},
  filter_repr: function() { return JSON.stringify(this.get('filters')); }.property('filters'),
  isAlterTimeConstrained: true,
  // selected_alter: null,

  eaf_api: Ember.inject.service('eaf-api'),

  didInsertElement: function() {
    this.bind();
  },

  bind: function() {
    this.bindAlters();
  }.observes('isAlterTimeConstrained'),

  filterAlterChanged: function() {
    this.filters['alter'] = this.get('selected_alter');
    this.notifyPropertyChange('filters');
    this.sendAction('action', this.get('filters'));
  }.observes('selected_alter'),

  actions: {
    'toggleFilters': function() {
      this.$(".filter-items").toggle(300);
    },
    'applyFilter': function() {
      this.sendAction('action', this.get('filters'));
    }
  },

  /**
   * Queries for list of alters and populates dropdown with the results.
   */
  bindAlters: function() {
    this.$(".alters-loader").show();

    var params = {};

    if (this.get('isAlterTimeConstrained')) {
      params['min_date'] = moment.min(moment(this.get('start_date_A')), moment(this.get('start_date_B')))
        .format("YYYY-MM-DD");
      params['max_date'] = moment.max(moment(this.get('start_date_A')), moment(this.get('start_date_B')))
        .format("YYYY-MM-DD");
    }

    var _this = this;
    this.get('eaf_api').query('alter', params)
      .then(function(data) {
        // create a dictionary mapping 'displayed address' => '{ display, actual } for deduplication purposes
        // later we'll just convert it into a list of values and disregard the key
        var alters = data.objects.map((x) => ({ display: x.name, value: x.email }));

        var sorted_alters = Object.keys(alters)
          .map(function(x) { return alters[x]; })
          .sort(function(a,b) { return a.display.localeCompare(b.display); });

        // select address column and remove all empty entries
        _this.set('alters', sorted_alters);
      })
      .finally(function() {
        // disable the loading spinner
        _this.$(".alters-loader").fadeOut(300);
      });
  }
});
