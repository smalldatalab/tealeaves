/**
 * Created by faisal on 2/24/15.
 */

import Ember from 'ember';
/* global d3 */
/* global moment */
/* global humanizeDuration */

export default Ember.Component.extend({
  start_date: null,
  end_date: null,
  hasShiftControls: true,

  didInsertElement: function() {
    // save handle so we can get at the component inside the date change handler
    var _this = this;

    this.$('.input-daterange').datepicker({
      autoclose: true,
      todayHighlight: true,
      endDate: new Date()
    }).on('changeDate', function(e) {
      // push start and end dates into component properties when set
      if (e.target.name === 'start') {
        _this.set('start_date', d3.time.day.floor(e.date));
      }
      else if (e.target.name === 'end') {
        _this.set('end_date', d3.time.day.offset(e.date, 1));
      }
    });

    // sync up the start and end dates (if present; they might be null, which is fine)
    this.set_dates(this.get('start_date'), this.get('end_date'));
  },

  set_dates: function(st, en) {
    if (st != null && en != null) {
      /*
      // FIXME: for some reason this isn't triggering the range highlighting until the user re-clicks on a date
      this.$(".input-daterange .input-sm").each(function() {
        Ember.$(this).datepicker('update', (Ember.$(this).attr('name') === 'start')?st.toLocaleDateString():en.toLocaleDateString());
      });
      */

      // get the datepicker object and access its pickers directly
      var datepicker = this.$(".input-daterange").data('datepicker');
      datepicker.pickers[0].setDate(st);
      datepicker.pickers[1].setDate(en);
    }
  },

  span_duration: function() {
    var s = this.get('start_date'), e = this.get('end_date');

    // if a start and end date have been chosen, return the duration in english (e.g. "3 weeks")
    if (s != null && e != null) {
      var sm = moment(s), em = moment(d3.time.day.round(e));
      var duration = Math.abs(sm.valueOf() - (em.valueOf()));
      return humanizeDuration(duration, { units: ["w", "d", "h"] });
    }

    return "(no interval selected)";
  }.property('start_date', 'end_date'),

  right_exceeds_today: function() {
    if (!this.get('start_date') || !this.get('end_date')) {
      return false;
    }

    var s = d3.time.day.floor(this.get('start_date')), e = d3.time.day.floor(this.get('end_date'));

    return new Date(e.getTime() + (e-s)) >= new Date();
  }.property('start_date', 'end_date'),

  date_chosen: function() {
    var start_date = this.get('start_date');
    var end_date = this.get('end_date');

    if (start_date != null && end_date != null) {
      this.sendAction('action', start_date, end_date);
    }
  }.observes('start_date', 'end_date'),

  actions: {
    shift: function(dir) {
      var s = d3.time.day.floor(this.get('start_date')), e = d3.time.day.floor(this.get('end_date'));

      // if a start and end date have been chosen, return the duration in english (e.g. "3 weeks")
      if (s != null && e != null) {
        // measure the duration shift
        dir = ((dir === 'left')?-1:1);
        var adj_start = d3.time.day.floor(d3.time.day.offset(s, dir*7));
        var adj_end = d3.time.day.floor(d3.time.day.offset(e, dir*7 - 1)); // keep the range inclusive

        // bail if it shifts us past the present or before the min value
        if (adj_end >= new Date()) {
          return;
        }

        // do a little animated shake
        this.$(".input-daterange .shifter").css('position', 'relative').animate({left:15*dir}, 60, 'swing', function() {
          Ember.$(this).animate({left:0}, 100, 'swing');
        });

        this.set('start_date', adj_start);
        this.set('end_date', adj_end);

        // also synchronize the control values if they were changed in some other way
        this.$(".input-daterange .input-sm").each(function() {
          // only sync values that are non-null
          var date_obj = (Ember.$(this).attr('name') === 'start')?adj_start:adj_end;
          if (date_obj) {
            Ember.$(this).datepicker('setDate', date_obj.toLocaleDateString());
          }
        });
      }
    }
  }
});
