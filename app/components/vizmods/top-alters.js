/**
 * Created by faisal on 3/16/15.
 */

// import Ember from 'ember';
import BaseMod from 'tealeaves/components/vizmods/base-viz';
import tools from 'tealeaves/library/toolkit';
/* global d3 */

var emails = / ?<[^>]+>/g;
var stripquotes = /"/g;
var stripparens = /\([^)]*\)/g;

function fullMailToDisplayName(k) {
  return k.replace(emails, '').replace(stripquotes, '').replace(stripparens, '').trim();
}

export default BaseMod.extend({
  classNames: ['top-alters'],
  alters: [],
  total_mails: 0,
  bind: function(start_date, end_date, filters) {
    var _this = this;

    // display the spinner
    this.$(".loader").show();

    var params = {
      min_date: tools.apiTZDateTime(start_date),
      max_date: tools.apiTZDateTime(end_date)
    };

    this.applyAlterFilter(filters, params);
    this.applyLabelFilter(filters, params);

    // attempt to hit the eaf API
    // this returns a promise, which we'll use when it resolves
    this.get('eaf_api').query('mail_message', params)
      .then(function(data) {
        console.log("Original alter email data: ", data);

        // TODO: we want to create the following structure: { display_name, num_of_emails, addresses: [] }

        // we need to collapse on the user's name after removing single-level parentheticals
        var revised_counts = tools.countBy(
          tools.flattened(data.objects.map((x) => ((x.labels.indexOf("SENT") === -1)?(x.from_field):x.to_field.split(',')))),
          function(k) { return fullMailToDisplayName(k); }
        );

        console.log("Flattened count data: ", revised_counts);

        // convert the key:value map into a [{label: <key>, value: <value>},...] array, sigh
        revised_counts = Object.keys(revised_counts).map(function (key, idx) {
          return { id: idx+1, name: key, count: revised_counts[key] };
        });

        var total_mails = d3.max(revised_counts, function(x) { return x.count; });
        revised_counts.sort(function(a,b) { return b.count-a.count; });

        revised_counts = revised_counts.map((item,idx) => { item['idx'] = idx+1; return item; });

        // update list that'll be reflected in this component's template immediately
        _this.set('total_mails', total_mails);
        _this.set('alters', revised_counts.slice(0,10));

        // _this.$(".d3box").html(data.map(function(x) { return x.address.replace(emails, "").trim() + " (" + x.count + ")"; }).join("<br />"));
      })
      .finally(function() {
        _this.$(".loader").hide();
      });
  },

  actions: {
    addAlterToList(alter) {
      let alters_list = this.get('filters.alters.selected_alter_list');

      // we should add every email address to which this alter corresponds...
      alters_list.addObject(alter);
      // this.sendAction('action');
    }
  }
});
