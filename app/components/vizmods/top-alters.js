/**
 * Created by faisal on 3/16/15.
 */

// import Ember from 'ember';
import BaseMod from 'tealeaves/components/vizmods/base-viz';
import tools from 'tealeaves/library/toolkit';
/* global d3 */

import ajax from 'ic-ajax';

var emails = / ?<[^>]+>/g;
var stripquotes = /"/g;
var stripparens = /\([^)]*\)/g;

export default BaseMod.extend({
  classNames: ['top-alters'],
  alters: [],
  total_mails: 0,
  bind: function(start_date, end_date) {
    var _this = this;

    // display the spinner
    this.$(".loader").show();

    // attempt to hit the eaf API
    // this returns a promise, which we'll use when it resolves
    ajax('https://eaf.smalldata.io/v1/aggregates/alters/data/', { data: { start: tools.apiTZDateTime(start_date), end: tools.apiTZDateTime(end_date) } })
      .then(function(data) {
        // we need to collapse on the user's name after removing single-level parentheticals
        var revised_counts = tools.countBy(data.filter(function(x) { return x.address != null && x.count != null; }),
          function(k) { return k.address.replace(emails, '').replace(stripquotes, '').replace(stripparens, '').trim(); },
          function(x) { return x.count; });

        // convert the key:value map into a [{label: <key>, value: <value>},...] array, sigh
        revised_counts = Object.keys(revised_counts).map(function (key, idx) {
          return { id: idx+1, name: key, count: revised_counts[key] };
        });

        var total_mails = d3.max(revised_counts, function(x) { return x.count; });
        revised_counts.sort(function(a,b) { return b.count-a.count; });

        // update list that'll be reflected in this component's template immediately
        _this.set('total_mails', total_mails);
        _this.set('alters', revised_counts.slice(0,10));

        // _this.$(".d3box").html(data.map(function(x) { return x.address.replace(emails, "").trim() + " (" + x.count + ")"; }).join("<br />"));
      })
      .finally(function() {
        _this.$(".loader").hide();
      });
  }
});
