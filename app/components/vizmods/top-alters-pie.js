/**
 * Created by faisal on 3/16/15.
 */

import Ember from 'ember';
import BaseMod from 'tealeaves/components/vizmods/base-viz';
import tools from 'tealeaves/library/toolkit';
/* global d3 */
/* global d3pie */

import ajax from 'ic-ajax';

var emails = / ?<[^>]+>/g;
var stripquotes = /"/g;
var stripparens = /\([^)]*\)/g;

export default BaseMod.extend({
  classNames: ['top-alters-pie'],
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
        /*
        var total_mails = d3.sum(data, function(x) { return x.count; });

        // update list that'll be reflected in this component's template immediately
        _this.set('total_mails', total_mails);
        _this.set('alters', data.map(function(x, idx) {
          return { id: idx+1, name: x.address.replace(emails, "").trim(), count: x.count };
        }));

        // _this.$(".d3box").html(data.map(function(x) { return x.address.replace(emails, "").trim() + " (" + x.count + ")"; }).join("<br />"));
        */

        _this.$(".d3box").empty();

        // we need to collapse on the user's name after removing single-level parentheticals
        var revised_counts = tools.countBy(data.filter(function(x) { return x.address != null && x.count != null; }),
          function(k) { return k.address.replace(emails, '').replace(stripquotes, '').replace(stripparens, '').trim(); },
          function(x) { return x.count; });

        // convert the key:value map into a [{label: <key>, value: <value>},...] array, sigh
        revised_counts = Object.keys(revised_counts).map(function (key) {
          return { label: key, value: revised_counts[key], color: strToColor(key) };
        });

        // if the revised_counts has too many categories to display nicely, filter it down a bit
        var i = 1;
        var leftovers = 0;
        var above = function(x) { return x.value > i; };
        var below = function(x) { return !above(x); };
        var access = function(x) { return x.count; };

        while (Object.keys(revised_counts).length > 15) {
          var corrected = revised_counts.filter(above);

          // ensure that we haven't thresholded off everything
          if (Object.keys(corrected).length < 5) {
            break;
          }

          // if we're still ok, copy corrected to revised and increment the threshold
          // in case we need to shave off any more records
          leftovers += d3.sum(revised_counts.filter(below), access);
          i += 1;
          revised_counts = corrected;
        }

        // add an 'other' category if we were forced to use it
        if (leftovers > 0) {
          revised_counts.push({ label: "other", value: leftovers, color: strToColor("(other)") });
        }

        makePie(_this, _this.$(".d3box").get(0), revised_counts);
      })
      .finally(function() {
        _this.$(".loader").hide();
      });
  }
});

function makePie(me, target, data) {
  var isWide = (me.get('layout_direction') === 'wide');

  var pie = new d3pie(target, {
    /*
    "header": {
      "title": {
        "text": "Lots of Programming Languages",
        "fontSize": 24,
        "font": "open sans"
      },
      "subtitle": {
        "text": "A full pie chart to show off label collision detection and resolution.",
        "color": "#999999",
        "fontSize": 12,
        "font": "open sans"
      },
      "titleSubtitlePadding": 9
    },
    */
    "footer": {
      "color": "#999999",
      "fontSize": 10,
      "font": "open sans",
      "location": "bottom-left"
    },
    "size": {
      "canvasHeight": 283,
      "canvasWidth": (isWide)?(1050):525,
      "pieOuterRadius": "90%"
    },
    "data": {
      "sortOrder": "value-desc",
      "content": data
    },
    "labels": {
      "outer": {
        "format": (isWide)?"label-value1":"none",
        "pieDistance": 32
      },
      "inner": {
        "format": "none",
        "hideWhenLessThanPercentage": 3
      },
      "mainLabel": {
        "fontSize": 11
      },
      "percentage": {
        "color": "#ffffff",
        "decimalPlaces": 0
      },
      "value": {
        "color": "#adadad",
        "fontSize": 11
      },
      "lines": {
        "enabled": true
      }
    },
    "tooltips": {
      "enabled": true,
      "type": "placeholder",
      "string": (isWide)?"{label}: {percentage}%":"{label}: {value}, {percentage}%"
    },
    "effects": {
      "pullOutSegmentOnClick": {
        "effect": "linear",
        "speed": 400,
        "size": 12
      }
    },
    callbacks: {
      onClickSegment: function(info) {
        // find the corresponding pie object
        // (we can't cache this reference because of container refreshing, which may change eventually)
        var $target = Ember.$(target);
        var $other = $target.closest('.row').find('.top-alters-pie').not($target.parent()).find(".d3box");
        var otherPie = $other.data('pie-obj');

        // close whichever segment is currently open...
        var currentSegment = otherPie.getOpenSegment();
        if (currentSegment) { otherPie.closeSegment(currentSegment.index); }

        // ...locate the segment id of the corresponding segment...
        var otherContent = otherPie.options.data.content;
        var otherSegment = otherContent.find(function(x) { return x.label === info.data.label; });

        // ...and then open the corresponding segment if it exists
        if (otherSegment && !info.expanded) {
          var otherIndex = otherContent.indexOf(otherSegment);
          otherPie.openSegment(otherIndex);
        }
      }
    }
  });

  // allow the pie object to be retrieved so we can programmatically select segments
  me.$(".d3box").data('pie-obj', pie);
}

// color hashing courtesy of http://stackoverflow.com/a/16348977
function strToColor(str) {
  var hash = 0, i;
  for (i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}
