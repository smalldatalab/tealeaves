/**
 * Created by faisal on 3/16/15.
 */

// import Ember from 'ember';
import BaseMod from 'tealeaves/components/vizmods/base-viz';
import tools from 'tealeaves/library/toolkit';
/* global d3 */

function generateChart(target_elem) {
  var svg = d3.select(target_elem),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y %b %d");

  var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeAccent);

  var stack = d3.stack();

  var area = d3.area()
    .x(function(d) { return x(d.data.date); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.tsv("datasets/data.tsv", function(error, data) {
    if (error) {
      throw error;
    }

    // console.log(data);

    var keys = [];

    // reformat the data a little bit
    for (var d of data) {
      // iterate through the rows
      d.date = parseDate(d.date);

      // iterate through the remaining columns excluding date
      for (var property in d) {
        if (d.hasOwnProperty(property) && property !== 'date') {
          d[property] = d[property]/100;
          keys.push(property);
        }
      }
    }

    x.domain(d3.extent(data, function(d) { return d.date; }));
    z.domain(keys);
    stack.keys(keys);

    var layer = g.selectAll(".layer")
      .data(stack(data))
      .enter().append("g")
      .attr("class", "layer");

    layer.append("path")
      .attr("class", "area")
      .style("fill", function(d) { return z(d.key); })
      .attr("d", area);

    layer.filter(function(d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
      .append("text")
      .attr("x", width - 6)
      .attr("y", function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
      .attr("dy", ".35em")
      .style("font", "13px sans-serif")
      .style("text-anchor", "end")
      .text(function(d) { return d.key; });

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"));
  });

  function type(d, i, columns) {
    d.date = parseDate(d.date);
    for (var i = 1, n = columns.length; i < n; ++i) {
      d[columns[i]] = d[columns[i]] / 100;
    }
    return d;
  }
}

export default BaseMod.extend({
  classNames: ['topic-line'],

  bind: function(start_date, end_date) {
    var _this = this;

    // display the spinner
    this.$(".loader").show();

    var $boxShell = this.$(".topicline-box");
    var $target = this.$(".topicline-box svg");

    // remove any elements in the SVG
    $target.empty();

    $target.attr('viewBox', `0 0 ${$boxShell.width()} ${$boxShell.height()}`);
    $target.attr('width', $boxShell.width());
    $target.attr('height', $boxShell.height());

    generateChart($target.get(0));

    // attempt to hit the eaf API
    // this returns a promise, which we'll use when it resolves
    /*
     this.get('eaf_api').query('mail_message', { min_date: tools.apiTZDateTime(start_date), max_date: tools.apiTZDateTime(end_date) })
     .then(function(data) {
     // we need to collapse on the user's name after removing single-level parentheticals
     var revised_counts = tools.countBy(data.objects.map((x) => x.from_field),
     function(k) { return k.replace(emails, '').replace(stripquotes, '').replace(stripparens, '').trim(); });

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
     */

    _this.$(".loader").hide();
  }
});
