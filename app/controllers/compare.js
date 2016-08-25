/**
 * Created by faisal on 3/2/15.
 */

import Ember from 'ember';
import all_components from 'tealeaves/library/component-list';

/* global d3 */

export default Ember.Controller.extend({
  A_title: "Interval A",
  B_title: "Interval B",

  A_start_date: d3.time.week.floor(d3.time.week.offset(new Date(), -4)),
  A_end_date: d3.time.week.floor(d3.time.week.offset(new Date(), -2)),

  B_start_date: d3.time.week.floor(d3.time.week.offset(new Date(), -2)),
  B_end_date: d3.time.day.floor(new Date()),

  available_components: Ember.A(JSON.parse(JSON.stringify(all_components))),
  selected_component: null,
  filters: {},
  update_filter: 0,
  filter_repr: Ember.computed('filters', function() { return JSON.stringify(this.get('filters')); }),
  no_components: Ember.computed.empty('available_components'),

  actions: {
    setIntervalA: function(start, end) {
      this.set('A_start_date', start);
      this.set('A_end_date', end);
    },
    setIntervalB: function(start, end) {
      this.set('B_start_date', start);
      this.set('B_end_date', end);
    },
    addVizModule: function(type) {
      var added = false;

      if (type === '*') {
        // special case, just add all the remaining modules
        this.get('model').pushObjects(this.get('available_components'));
        this.get('available_components').clear();
      }
      else {
        // if 'type' is specified, look up the component with that type; otherwise use the 'selected_component' value
        var selected = (!type)?this.get('selected_component'):this.get('available_components').find(function(x) { return x.type === type; });

        if (selected) {
          this.get('model').pushObject(selected);

          // reset selected component
          this.set('selected_component', null);

          // remove from the list of available components
          this.get('available_components').removeObject(selected);

          added = true;
        }
      }

      // if we did end up adding components, scroll so that the adder is visible
      if (added) {
        var $target = Ember.$("#add_module_btn");
        Ember.$('html, body').stop().animate({
          scrollTop: $target.offset().top + $target.height()
        }, 400);
      }
    },
    removeVizModule: function(item) {
      this.get('available_components').pushObject(item);
      this.set('available_components', this.get('available_components').sortBy('name'));
      this.get('model').removeObject(item);
    },
    toggleVizModuleVisibility: function(item) {
      Ember.set(item, 'invisible', !Ember.get(item, 'invisible'));
    },
    updateFilter: function() {
      console.log("Received request to update filter!");
      this.set('update_filter', (this.get('update_filter') + 1) % 20);
      this.notifyPropertyChange('update_filter');
    }
  }
});
