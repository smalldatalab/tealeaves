/**
 * Created by faisal on 4/7/15.
 */

import Ember from 'ember';
import BaseMod from 'tealeaves/components/vizmods/base-viz';
import tools from 'tealeaves/library/toolkit';
/* global d3 */

// import ajax from 'ic-ajax';

//function negmod(n, m) {
//  return ((n % m) + m) % m;
//}

export default BaseMod.extend({
  classNames: ['rhythm-map'],
  loadedCalendar: false,
  timezones: [
    { name: '(UTC -12:00) Eniwetok, Kwajalein', offset: -12 },
    { name: '(UTC -11:00) Midway Island, Samoa', offset: -11 },
    { name: '(UTC -10:00) Hawaii', offset: -10 },
    { name: '(UTC -9:00)  Alaska', offset: -9 },
    { name: '(UTC -8:00)  Pacific Time (US &amp; Canada)', offset: -8 },
    { name: '(UTC -7:00)  Mountain Time (US &amp; Canada)', offset: -7 },
    { name: '(UTC -6:00)  Central Time (US &amp; Canada), Mexico City', offset: -6 },
    { name: '(UTC -5:00)  Eastern Time (US &amp; Canada), Bogota, Lima', offset: -5 },
    { name: '(UTC -4:30)  Caracas', offset: -4.5 },
    { name: '(UTC -4:00)  Atlantic Time (Canada), La Paz, Santiago', offset: -4 },
    { name: '(UTC -3:30)  Newfoundland', offset: -3.5 },
    { name: '(UTC -3:00)  Brazil, Buenos Aires, Georgetown', offset: -3 },
    { name: '(UTC -2:00)  Mid-Atlantic', offset: -2 },
    { name: '(UTC -1:00)  Azores, Cape Verde Islands', offset: -1 },
    { name: '(UTC  0:00)  Western Europe Time, London, Lisbon, Casablanca, Greenwich', offset: 0 },
    { name: '(UTC +1:00)  Brussels, Copenhagen, Madrid, Paris', offset: 1 },
    { name: '(UTC +2:00)  Kaliningrad, South Africa, Cairo', offset: 2 },
    { name: '(UTC +3:00)  Baghdad, Riyadh, Moscow, St. Petersburg', offset: 3 },
    { name: '(UTC +3:30)  Tehran', offset: 3.5 },
    { name: '(UTC +4:00)  Abu Dhabi, Muscat, Yerevan, Baku, Tbilisi', offset: 4 },
    { name: '(UTC +4:30)  Kabul', offset: 4.5 },
    { name: '(UTC +5:00)  Ekaterinburg, Islamabad, Karachi, Tashkent', offset: 5 },
    { name: '(UTC +5:30)  Mumbai, Kolkata, Chennai, New Delhi', offset: 5.5 },
    { name: '(UTC +5:45)  Kathmandu', offset: 5.75 },
    { name: '(UTC +6:00)  Almaty, Dhaka, Colombo', offset: 6 },
    { name: '(UTC +6:30)  Yangon, Cocos Islands', offset: 6.5 },
    { name: '(UTC +7:00)  Bangkok, Hanoi, Jakarta', offset: 7 },
    { name: '(UTC +8:00)  Beijing, Perth, Singapore, Hong Kong', offset: 8 },
    { name: '(UTC +9:00)  Tokyo, Seoul, Osaka, Sapporo, Yakutsk', offset: 9 },
    { name: '(UTC +9:30)  Adelaide, Darwin', offset: 9.5 },
    { name: '(UTC +10:00) Eastern Australia, Guam, Vladivostok', offset: 10 },
    { name: '(UTC +11:00) Magadan, Solomon Islands, New Caledonia', offset: 11 },
    { name: '(UTC +12:00) Auckland, Wellington, Fiji, Kamchatka', offset: 12 }
  ],
  selected_timzone: 7,

  generateCalendar: function() {
    // don't regenerate the calendar if it's already been loaded!
    if (this.loadedCalendar) {
      return;
    }

    // programmatically generate the weekly calendar, as it's much easier to do it in code
    var start_of_week = d3.time.week.floor(new Date());
    this.wkFmt = d3.time.format("%a"); // 'Sun'
    this.wkFullFmt = d3.time.format("%A"); // 'Sunday'
    this.hourFmt = d3.time.format("%-I%p"); // '1pm'
    this.hourFmt24 = d3.time.format("%-H"); // '13'
    this.days_of_week = d3.time.day.range(start_of_week, d3.time.week.offset(start_of_week, 1));
    this.hours_of_day = d3.time.hour.range(start_of_week, d3.time.day.offset(start_of_week, 1));

    // for closing 'this' under the callbacks below
    var _this = this;

    // create the table structure itself
    var $table = Ember.$("<table />").addClass("rhythm-cal").prependTo(this.$());
    var $header = Ember.$("<tr />").addClass("cal-header").appendTo($table);

    // fill out the header row w/an empty column + columns for each day of the week
    $header.append(Ember.$("<th/>"));
    $header.append(this.days_of_week.map(function(x) { return Ember.$("<th/>").text(_this.wkFmt(x)); }));

    // now for each hour of the day create an extra row
    // the first column will hold the time of day and the rest will correspond to each weekday

    $table.append(this.hours_of_day.map(function(x) {
      var $row = Ember.$("<tr />");

      if ((_this.hourFmt24(x)|0) % 12 === 0) {
        // mark 12am and 12pm as special rows, so we can add a nice day divider there
        $row.addClass('meridian');
      }

      // the y-axis label
      $row.append(Ember.$("<td />").addClass("hours-rule").text(_this.hourFmt(x).toLowerCase()));

      // and the extra empty cells for each hour per day of week
      $row.append(_this.days_of_week.map(function(y) {
        return Ember.$("<td />")
          .addClass("weekday-hour")
          .data({
            weekday: _this.wkFullFmt(y),
            hour: _this.hourFmt24(x)
          });
      }));

      return $row;
    }));

    // mark the calendar as having been loaded
    this.loadedCalendar = true;
  },

  bind: function(start_date, end_date, filters) {
    // display the spinner
    this.$(".loader").show();

    // ensure the calendar itself exists
    if (!this.loadedCalendar) {
      this.generateCalendar();
      this.loadedCalendar = true;
    }

    /*
    var zone = this.get('selected_timezone');
    var hrOffset = (zone != null)?zone.offset:2;
    */

    var hrOffset = -(this.days_of_week[0].getTimezoneOffset()/60);

    var params = {
      start: tools.apiTZDateTime(start_date),
      end: tools.apiTZDateTime(end_date),
      offset: hrOffset
    };

    if (filters && filters.hasOwnProperty('alter')) {
      console.log("Applying alter filter: ", filters['alter']);
      params['alter'] = filters['alter'];
    }

    var _this = this;
    this.get('ajax').request('https://eaf.smalldata.io/v1/aggregates/weekly/data/', {
      data: params
    })
      .then(function(data) {
        // parse the totals payload
        var days = data['totals'];

        // the sum of all emails for all weekdays
        var weekly_total = d3.max(Object.keys(days), function(k) {
          var hours = days[k].hours;
          return d3.max(Object.keys(hours), function(y) {
            return hours[y];
          });
        });

        var color = d3.scale.linear()
          .domain([0, weekly_total])
          .range(["white", "#1C8AFF"]);

        // iterate through every weekday-hour cell
        _this.$("td.weekday-hour").each(function() {
          // check if this day exists; if not, report 0
          var curVal = 0;
          try { curVal = (days[Ember.$(this).data('weekday')]['hours'][Ember.$(this).data('hour')])|0; }
          catch (err) { curVal = 0; }

          // set up the current day cell
          Ember.$(this)
            .text(curVal)
            .css("background-color", (curVal > 0)?color(curVal|0):"white");
        });
      })
      .finally(function() {
        _this.$(".loader").hide();
      });


    // this.$(".loader").hide();
  }
});
