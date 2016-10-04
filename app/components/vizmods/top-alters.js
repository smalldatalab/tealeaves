/**
 * Created by faisal on 3/16/15.
 */

// import Ember from 'ember';
import BaseMod from 'tealeaves/components/vizmods/base-viz';
import tools from 'tealeaves/library/toolkit';
import addressparser from 'npm:addressparser';
/* global d3 */

var stripquotes = /"/g;
var stripparens = /\([^)]*\)/g;

function senderEmail(x) {
  return (x.labels.indexOf("SENT") === -1) ? x.from_field : x.to_field;
}

/**
 * For string in the form 'Display Name <address>' returns object w/name 'Display Name' and w/address 'address'.
 * Notes:
 * - for a string like 'address', both name and address are set to address
 * - extra wrapping quotes are removed from 'Display Name' if present
 * @param k the input display name + address string
 * @returns {{name: string, address: string}|*}
 */
function getNameAndAddress(k) {
  var matches = k.match(/([^<]+)<([^>]+)>/);

  if (matches) {
    return {
      name: matches[1].replace(stripquotes, '').replace(stripparens, '').trim(),
      address: matches[2]
    };
  }
  else {
    return { name: k, address: k };
  }
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

        // TODO: we want to create the following structure: { display_name, num_of_emails, addresses: Set() }
        // to do that, we probably need some kind of groupBy() primitive

        var grouped_names = data.objects.reduce((acc, cur) => {
          var addresses = addressparser(senderEmail(cur));

          // iterate over potentially many participants in this email
          addresses.map((info) => {
            if (info.name === '' && info.address) {
              info.name = info.address;
            }

            if (!acc.hasOwnProperty(info.name)) {
              acc[info.name] = { num_emails: 1, addresses: new Set([info.address]) };
            }
            else {
              acc[info.name].num_emails += 1;
              acc[info.name].addresses.add(info.address);
            }
          });

          return acc;
        }, {});

        /*
         // we need to collapse on the user's name after removing single-level parentheticals
         var revised_counts = tools.countBy(
         tools.flattened(data.objects.map((x) => otherPerson(x)),
         function(k) { return fullMailToDisplayName(k); }
         );
         */

        console.log("Flattened count data: ", grouped_names);

        // convert the key:value map into a [{label: <key>, value: <value>},...] array, sigh
        var revised_counts = Object.keys(grouped_names).map(function (key, idx) {
          return { id: idx+1, name: key, count: grouped_names[key].num_emails, addresses: Array.from(grouped_names[key].addresses) };
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

      alter.addresses.map((x) => {
        // we should add every email address to which this alter corresponds...
        alters_list.addObject(x);
      });

      // this.sendAction('action');
    }
  }
});
