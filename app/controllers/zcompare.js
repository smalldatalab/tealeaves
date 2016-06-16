/**
 * Created by faisal on 3/2/15.
 */

import Ember from 'ember';
import all_components from 'tealeaves/library/component-list';

/* global d3 */

export default Ember.Controller.extend({
  A_title: "Half a Month Ago",
  B_title: "Last 14 Days",
  A_start_date: d3.time.week.floor(d3.time.week.offset(new Date(), -3)),
  A_end_date: d3.time.day.offset(d3.time.week.floor(new Date()), -4),
  B_start_date: d3.time.day.floor(d3.time.week.offset(new Date(), -2)),
  B_end_date: d3.time.day.floor(new Date()),
  available_components: JSON.parse(JSON.stringify(all_components)),
  selected_component: null,
  filters: {},
  filter_repr: function() { return JSON.stringify(this.get('filters')); }.property('filters'),
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
    updateFilter: function(filters) {
      this.set('filters', filters);
      console.log("Updated filter?: ", this.get('filters'));
      this.notifyPropertyChange('filters');
    }
  }
});
