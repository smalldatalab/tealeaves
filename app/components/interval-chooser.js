/**
 * Created by faisal on 2/24/15.
 */

import Ember from 'ember';
/* global d3 */
/* global moment */

export default Ember.Component.extend({
  didInsertElement: function() {
    // save handle so we can get at the component inside the date change handler
    var _this = this;

    this.$('.input-daterange').datepicker({
      autoclose: true,
      todayHighlight: true
    }).on('changeDate', function(e) {
      // push start and end dates into component properties when set
      if (e.target.name == 'start') {
        _this.set('start_date', d3.time.day.floor(e.date));
      }
      else if (e.target.name == 'end') {
        _this.set('end_date', d3.time.day.offset(e.date, 1));
      }
    });
  },
  start_date: null,
  end_date: null,
  span_duration: function() {
    var s = this.get('start_date'), e = this.get('end_date');

    // if a start and end date have been chosen, return the duration in english (e.g. "3 weeks")
    if (s != null && e != null) {
      var sm = moment(s), em = moment(e);
      return sm.from(em, true);
    }

    return "(no interval selected)";
  }.property('start_date', 'end_date')
});
