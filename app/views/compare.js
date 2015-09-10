/**
 * Created by faisal on 3/18/15.
 */

import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    // FIXME: sorting totally munges the backing array; figure out a way to fake-sort and update the model
    // FIXME: apparently views are deprecated, so figure out how to factor this into a component? seems like a waste

    // Sortable rows
    Ember.$('.sortable').sortable({
      containerSelector: 'div.sortable',
      handle: '.handler',
      itemSelector: '.sortable-component',
      placeholder: '<div class="placeholder"/>'
    });
  }
});
