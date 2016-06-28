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

var PersonList = Ember.Object.extend({
  persons: {},
  whitelist() {
    return Object.keys(filterObject(this.persons, (v) => v));
  },
  blacklist() {
    return Object.keys(filterObject(this.persons, (v) => !v));
  }
});

export default Ember.Component.extend({
  // services
  eaf_api: Ember.inject.service('eaf-api'),

  // properties and computed properties
  alters: [],
  isAlterTimeConstrained: true,

  selected_alter_list: PersonList.create(),
  selected_alter_whitelist: function() {
    return this.get('selected_alter_list').whitelist();
  }.property('selected_alter_list'),
  selected_alter_blacklist: function() {
    return this.get('selected_alter_list').blacklist();
  }.property('selected_alter_list'),

  updateMasterParams: function() {
    var alterlist = this.get('selected_alter_list');
    this.set('params', { alters: {
      whitelist: alterlist.whitelist(),
      blacklist: alterlist.blacklist()
    }});
  }.observes('selected_alter_list'),

  // lifecycle event handlers
  actions: {
    'add-alter-to-list': function(alter, addtoWhite) {
      if (!alter) { return; }

      var persons = this.get('selected_alter_list').get('persons');
      persons[alter] = addtoWhite;
      this.notifyPropertyChange('selected_alter_list');
      this.rerender();
    },
    'remove-alter': function(alter) {
      var persons = this.get('selected_alter_list').get('persons');
      delete persons[alter];
      this.notifyPropertyChange('selected_alter_list');
      this.rerender();
    },
    'swap-alter': function(alter, movetoWhite) {
      var persons = this.get('selected_alter_list').get('persons');
      persons[alter] = movetoWhite;
      this.notifyPropertyChange('selected_alter_list');
      this.rerender();
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
      params['max_date'] = moment.max(moment(this.get('start_date_A')), moment(this.get('start_date_B')))
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
