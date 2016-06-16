/**
 * Created by faisal on 3/27/15.
 */

import Ember from 'ember';
// import ajax from 'ic-ajax';
/* global moment */

export default Ember.Component.extend({
  classNames: ['filter-bar'],
  alters: [],
  filters: {},
  filter_repr: function() { return JSON.stringify(this.get('filters')); }.property('filters'),
  isAlterTimeConstrained: true,
  // selected_alter: null,

  ajax: Ember.inject.service(),

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
      params['start'] = moment.min(moment(this.get('start_date_A')), moment(this.get('start_date_B')))
        .format("YYYY-MM-DD");
      params['end'] = moment.max(moment(this.get('start_date_A')), moment(this.get('start_date_B')))
        .format("YYYY-MM-DD");
    }

    var _this = this;
    this.get('ajax').request('https://eaf.smalldata.io/v1/aggregates/alters/data/', { data: params })
      .then(function(data) {
        // create a dictionary mapping 'displayed address' => '{ display, actual } for deduplication purposes
        // later we'll just convert it into a list of values and disregard the key
        var alters = data.reduce(function(acc, x) {
          var addr = x.address;

          // if there's no address at all, just continue
          if (addr == null || addr.trim() === "") { return acc; }

          // first, we want to split multiple addresses into multiple people
          // we do a little preprocessing to remove weird characters and make it easier to just format the thing
          var addresses = parseMails(addr);

          // it can either be a plain address or a name with an address following in parens (used to be brackets)
          // either way we're going to handle them the same
          addresses.forEach(function(x) {
            // if it's not already there, add it with formatting and junk
            if (x.indexOf("unknown.email") === -1 && !acc.hasOwnProperty(x)) {
              var trans_addr = x
                .replace("\r\n","")
                .replace("\"", "").replace("\"", "").replace("\"","") // i know they look the same, but they're not
                .replace("\'", "")
                .replace("<","&lt;").replace(">","&gt;")
                .trim();

              acc[x] = { display: trans_addr, value: x };
            }
          });

          return acc;
        }, {});

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

/**
 * Splits a string of comma-delimited complex email addresses into an array of strings
 * @param addr the string of addresses, e.g. from an email 'to' field
 */
function parseMails(addr) {
  var state = 0; // start outside any quoted strings
  var lastComma = 0;
  var accum = [];

  for (var i = 0; i < addr.length; i++) {
    var c = addr[i];

    switch (state) {
      case 0: // outside a quoted string
        if (c === '\"') { state = 1; }
        if (c === ',') {
          accum.push(addr.substr(lastComma, i-lastComma).trim());
          lastComma = i+1;
        }
        break;
      case 1: // within a quoted string
        if (c === '\"') { state = 0; }
        break;
    }
  }

  // FIXME: we should probably complain if we don't end up in state 0

  // push the final bit
  accum.push(addr.substr(lastComma, addr.length-lastComma).trim());

  return accum;
}
