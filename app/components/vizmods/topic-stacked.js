/**
 * Created by faisal on 3/16/15.
 */

import Ember from 'ember';
import BaseMod from 'tealeaves/components/vizmods/base-viz';
import tools from 'tealeaves/library/toolkit';
/* global d3 */

export default BaseMod.extend({
  classNames: ['topic-stacked'],

  bind: function(start_date, end_date, filters) {
    var _this = this;

    // display the spinner
    this.$(".loader").show();

    var $boxShell = this.$(".topicstacked-box");
    var $target = this.$(".topicstacked-box svg");
    var $legend_target = this.$(".topic-legend");

    // remove any elements in the SVG
    $target.empty();
    $legend_target.empty();

    $target.attr('viewBox', `0 0 ${$boxShell.width()} ${$boxShell.height()}`);
    $target.attr('width', $boxShell.width());
    $target.attr('height', $boxShell.height());

    // we have to query for two things:
    // 1) the set of topics for this user
    // 2) the mail messages with associated 'topics' field keyed to set of topics

    _this.get('eaf_api').query('topic', {})
      .then(function(data) {
        var topic_set = data.objects.reduce(function(acc, v) { acc[v.id] = v.shortname; return acc; }, {});

        var params = {
          min_date: tools.apiTZDateTime(start_date),
          max_date: tools.apiTZDateTime(end_date),
          topics: 1 // 1 == true in this context
        };

        _this.applyAlterFilter(filters, params);
        _this.applyLabelFilter(filters, params);

        // once we have the topics, we can query for the messages and build the rest of the graph
        _this.get('eaf_api').query('mail_message', params)
          .then(function(message_data) {
            var msg_topics = message_data.objects.map(function(v) {
              return {'received_on': v.received_on, 'topics': v.topics};
            }).filter(function(v) {
              return v.topics.length > 0;
            });

            generateChart($target.get(0), $legend_target.get(0), topic_set, msg_topics, 'days');

            // now we can generate the chart
            _this.$(".loader").hide();
          });
      });
  }
});

function generateChart(target_elem, legend_elem, topic_set, message_data, bucket_width) {
  var margin = {
      top: 40,
      right: 30,
      bottom: 30,
      left: 50
    },
    width = Ember.$(target_elem).width() - margin.left - margin.right,
    height = Ember.$(target_elem).height() - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y-%m-%dT%I:%M:%S").parse;
  var formatDate = d3.time.format("%m/%d");
  var formatCount = d3.format(",.0f");

  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);
  var color = d3.scale.category20();

  // fix the colors to the topic IDs so they're consistent between vis components
  color.domain(Object.keys(topic_set));

  var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").tickFormat(formatDate);

  var yAxis = d3.svg.axis().scale(y)
    .orient("left");


  var stack = d3.layout.stack()
    .values(function(d) {
      return d.values;
    });

  // Create the SVG drawing area
  var svg = d3.select(target_elem)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Parse the date strings into javascript dates
  message_data.forEach(function(d) {
    d.received_on = parseDate(d.received_on);
  });

  // Determine the first and list dates in the data set
  var timeExtent = d3.extent(message_data, function(d) {
    return d.received_on;
  });

  // Create one bin per day, use an offset to include the first and last days(?)
  // FIXME: use the bucket_width parameter to determine

  var intervalBins = d3.time.days(d3.time.day.offset(timeExtent[0], -1),
    d3.time.day.offset(timeExtent[1], 0));

  if (bucket_width === 'weeks') {
    intervalBins = d3.time.week(d3.time.week.offset(timeExtent[0], -1),
      d3.time.week.offset(timeExtent[1], 0));
  }
  else if (bucket_width === 'months') {
    intervalBins = d3.time.months(d3.time.month.offset(timeExtent[0], -1),
      d3.time.month.offset(timeExtent[1], 0));
  }
  else {
    console.info("No/invalid bucket width specified, using default day interval");
  }

  // Use the histogram layout to create a function that will bin the data
  var binByInterval = d3.layout.histogram()
    .value(function(d) {
      return d.received_on;
    })
    .bins(intervalBins);

  // Use D3's nest function to group the data by borough
  var dataGroupedByBorough = d3.nest()
    .key(function(d) {
      return d.topics[0].topic_id;
    })
    .map(message_data, d3.map);

  // Apply the histogram binning function to the data and convert from
  // a map to an array so that the stack layout can consume it
  var histDataByBorough = [];
  dataGroupedByBorough.entries().map(function(o) {
    var key = o.key;
    var value = o.value;

    // Bin the data for each borough by day
    var histData = binByInterval(value);
    histDataByBorough.push({
      topic_id: key,
      values: histData
    });
  });

  var stackedHistData = stack(histDataByBorough);

  // Scale the range of the data by setting the domain
  x.domain(d3.extent(intervalBins));
  y.domain([0, d3.max(stackedHistData[stackedHistData.length - 1].values, function(d) {
    return d.y + d.y0;
  })]);

  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "topicstacked-tooltip")
    .style("opacity", 0);

  // Set up one group for each borough
  // Note that color doesn't have a domain set, so colors are assigned to boroughs
  // below on a first come, first serve basis
  var borough = svg.selectAll(".borough")
    .data(stackedHistData)
    .enter().append("g")
    .attr("class", "borough")
    .style("fill", function(d, i) {
      return color(d.topic_id);
    })
    // .style("stroke", function(d, i) {
    //   return d3.rgb(color(d.topic_id)).darker();
    // })
    .on("mouseover", function(d) {
      div.transition()
        .duration(200)
        .style("opacity", 0.9);
      div	.html(topic_set[d.topic_id])
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Months have slightly different lengths so calculate the width for each bin
  // Draw the rectangles, starting from the upper left corner and going down
  borough.selectAll(".bar")
    .data(function(d) {
      return d.values;
    })
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return x(d.x);
    })
    .attr("width", function(d) {
      return x(new Date(d.x.getTime() + d.dx)) - x(d.x) - 2;
    })
    .attr("y", function(d) {
      return y(d.y0 + d.y);
    })
    .attr("height", function(d) {
      return y(d.y0) - y(d.y0 + d.y);
    });

  // Add the X Axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis and label
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
  /*
   .append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 6)
   .attr("dy", ".71em")
   .style("text-anchor", "end")
   .text("Number of Rat Sightings");
   */

  // Add the legend to the second box
  Ember.$.each(topic_set, function(k, v) {
    // colored box + label container
    var $topic_set = Ember.$("<div />")
      .css('margin', '3px')
      .css('margin-left', '50px')
      .css('display', 'flex');

    // colored box
    Ember.$("<div />")
      .css('width', '15px')
      .css('height', '15px')
      .css('margin-right', '3px')
      .css('background-color', color(k))
      .appendTo($topic_set);

    // label
    Ember.$("<div />")
      .text(v)
      .appendTo($topic_set);

    $topic_set.appendTo(legend_elem);
  });
}
