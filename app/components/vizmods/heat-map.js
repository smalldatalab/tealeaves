/**
 * Created by faisal on 3/16/15.
 */

// import Ember from 'ember';
import BaseMod from 'tealeaves/components/vizmods/base-viz';
import tools from 'tealeaves/library/toolkit';
/* global CalHeatMap */


function unitsSpanned(start, end, unit) {
  var s = start.clone().startOf(unit);
  var e = end.clone().endOf(unit);
  return Math.ceil(e.diff(s, unit, true));
}

export default BaseMod.extend({
  classNames: ['heat-map'],
  alters: [],
  total_mails: 0,
  bind: function(start_date, end_date, filters) {
    // display the spinner
    this.$(".loader").show();

    // create the cal-heatmapi library instance
    var cal = new CalHeatMap();

    // FIXME: determine the domain/subdomain based on the duration they've selected
    // for instance, more than a month means the domain is month => days
    // less than a month is weeks => days
    // less than a week is days => hours?

    // var prior_end = end_date.clone().subtract(1, 'day').endOf('day');

    var original_start = start_date.clone();
    var original_end = end_date.clone();

    // clamp start and end dates to the month to avoid awkward situations
    // (e.g. where they try to display half a month and wonder why they hadn't sent any emails before then)
    start_date.startOf('month');
    end_date.endOf('month');

    var domain = 'month', subdomain = 'x_day';
    // var duration = moment.duration(end_date.diff(start_date));
    // var duration_days = Math.ceil(duration.asDays());

    var range = unitsSpanned(start_date, end_date, 'months');

    /*
    if (duration_days <= 7) {
      // weekly view
      // FIXME: should this even be a thing? it creates a disconnect in how we compare the left and right
      domain = 'day';
      subdomain = 'hour';
      range = unitsSpanned(start_date, prior_end, 'days');
    }
    */

    // ensure we're displaying at least one range unit
    range = Math.max(range, 1);

    // init it now; we'll update it later
    this.$(".heatmap-box").css("padding", "20px").empty(); // flush the box before adding
    cal.init({
      itemSelector: this.$(".heatmap-box").get(0),
      domain: domain,
      subDomain: subdomain,
      start: start_date.toDate(),
      weekStartOnMonday: false,
      range: range,
      legend: [2,4,8,16,32],
      legendColors: ["#D5ECFF", "#2A5DB1"],
      domainGutter: 6,
      domainMargin: 1,
      cellSize: 18,
      legendCellSize: 18,
      tooltip: true,
      // highlight: d3.time.day.range(start_date.toDate(), end_date.toDate()),
      label: {
        position: "top"
      },
      subDomainTextFormat: function(date ,value) {
        return value;
      },
      considerMissingDataAsZero: false,
      minDate: start_date.toDate(),
      maxDate: end_date.toDate(),
      itemName: ["email","emails"]
      /*
      previousSelector: this.$(".prev-button").get(0),
      nextSelector: this.$(".next-button").get(0)
      */
    });

    // attempt to hit the eaf API
    // this returns a promise, which we'll use when it resolves
    var params = {
      min_date: tools.apiTZDateTime(original_start),
      max_date: tools.apiTZDateTime(original_end),
    };

    this.applyAlterFilter(filters, params);

    var _this = this;
    this.get('eaf_api').query('mail_message', params)
      .then(function(data) {
        // get the number of mails sent for each time; we should also convert the times to timestamps

        var day_counts = tools.countBy(data.objects.map(function(x) { return new Date(x.received_on).getTime()/1000; }));
        cal.update(day_counts);
      })
      .finally(function() {
        _this.$(".loader").hide();
      });
  }
});
