/**
 * Created by faisal on 2/24/15.
 */

import Ember from 'ember';
/* global moment */

export default Ember.Component.extend({
  classNames: ['vizbox','unloaded'],
  eaf_api: Ember.inject.service('eaf-api'),
  start_date: null,
  end_date: null,
  filters: null,
  visible: true,
  layout_direction: 'narrow',

  didInsertElement: function() {
    // append a loader so we don't have to inherit a template as well to get it
    Ember.$('<div class="loader"><i class="fa fa-cog fa-spin"></i></div>')
      .appendTo(this.$());

    // also append a broken/missing identifier
    Ember.$('<div class="borked"><i class="fa fa-question-circle"></i></div>')
      .appendTo(this.$());

    // animate the display of each module
    // this.$().fadeTo(0,0).hide().slideDown(200).fadeTo(200, 1);
    // this.$().hide().slideDown(800);
    this.$().fadeTo(0,0).hide().slideDown(200).fadeTo(200, 1);
    this._prebind();
  },

  _prebind: function() {
    var start_date = this.get('start_date');
    var end_date = this.get('end_date');
    var filters = JSON.parse(this.get('filters'));

    if (start_date == null || end_date == null) {
      // console.error("Can't refresh with a null range");
      // we just return here b/c this occurs quite commonly (i.e. when the user selects a start, but not end date)
      // they'll eventually rectify it, which will allow this to continue
      return;
    }

    // convert dates to moment.js moments so we can format them
    start_date = moment(start_date);
    end_date = moment(end_date);

    console.log("start: ", start_date, " end: ", end_date);

    // set us as loading (but hide the borked icon)
    this.$().removeClass("unloaded").children().show();
    this.$().find(".borked").hide();

    this.bind(start_date, end_date, filters);
  }.observes('start_date', 'end_date', 'filters'),

  /**
   * Fired when it's time to associate the component with data; override this
   * to set up your component and fill it with data.
   * @param start_date beginning of the period (inclusive) for which to display data
   * @param end_date end of the period (exclusive) for which to display data
   */
  bind: function(start_date, end_date) {
    // inheriting classes should definitely override this
    console.warn("bind() fired on base module with interval: ", start_date, " => ", end_date);
  }
});
