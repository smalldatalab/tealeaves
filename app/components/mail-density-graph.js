import Ember from 'ember';

/* global d3 */

export default Ember.Component.extend({
  eaf_api: Ember.inject.service('eaf-api'),
  brushes: [], // regular array, not a bindable value

  didInsertElement() {
    this._super(...arguments);

    this.generate();
  },

  rangeChanged: Ember.observer('start_date_A', 'start_date_B', 'end_date_A', 'end_date_B', function() {
    var extents = [[this.get('start_date_A'), this.get('end_date_A')], [this.get('start_date_B'), this.get('end_date_B')]];

    // find and update our brushes
    extents.map((d, i) => {
      var brush = this.brushes[i];

      brush.extent(d);

      // now draw the brush to match our extent
      // use transition to slow it down so we can see what is happening
      // remove transition so just d3.select(".brush") to just draw
      brush(d3.select(".interval.region-" + i).transition());

      // now fire the brushstart, brushmove, and brushend events
      // remove transition so just d3.select(".brush") to just draw
      brush.event(d3.select(".interval.region-" + i).transition().delay(1000));
    });
  }),

  generate() {
    var $boxShell = this.$(".mail-density-graph");
    var $target = this.$(".mail-density-graph svg");

    // remove any elements in the SVG
    $target.empty();

    $target.attr('viewBox', `0 0 ${$boxShell.width()} ${$boxShell.height()}`);
    $target.attr('width', $boxShell.width());
    $target.attr('height', $boxShell.height());

    this.get('eaf_api').query('mail_meta')
      .then((data) => {
        this.renderChart(
          $target.get(0), data,
          this.get('start_date_A'), this.get('end_date_A'),
          this.get('start_date_B'), this.get('end_date_B')
        );
      });
  },

  renderChart(target_elem, data, start_A, end_A, start_B, end_B) {
    var margin = {
        top: 0,
        right: 15,
        bottom: 20,
        left: 15
      },
      width = Ember.$(target_elem).width() - margin.left - margin.right,
      height = Ember.$(target_elem).height() - margin.top - margin.bottom;

    // get the SVG drawing area
    var svg = d3.select(target_elem)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the x-scale for time
    var week_densities = data['weekly_density'].map((x) => ({week: Date.parse(x['week']), count: x['count'] }));
    var week_extents = d3.extent(week_densities, d => d['week']);
    week_extents[1] = Date.now(); // includes the present time in xScale
    var xScale = d3.time.scale().domain(week_extents).range([0, width - margin.right]).clamp(true);

    // var boxw = width/(week_densities.length);
    var h = d3.scale.linear().range([0, height - margin.top]).domain(d3.extent(week_densities, (d) => d['count']));

    var xAxis = d3.svg.axis().scale(xScale);

    // x axis
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + (height) + ")")
      .call(xAxis);

    // bars
    svg.append("g").selectAll('rect')
      .data(week_densities)
      .enter()
      .append('rect')
      .attr('class', 'weekly-bar')
      .attr('width', d => xScale(d3.time.week.offset(d['week'], 1)) - xScale(d['week']) - 3 )
      .attr('height', function(d) { return h(d['count']); })
      .attr('x', function(d) { return xScale(d['week']); })
      .attr('y', (d) => (height - h(d['count'])));

    // labels
    svg.append("g").selectAll('text')
      .data(week_densities)
      .enter()
      .append('text')
      .attr('class', 'week-label')
      .classed('intruding', d => h(d['count']) > 16)
      .attr('x', function(d) { return xScale(d['week']); })
      .attr('y', (d) => (height - h(d['count'])))
      .attr('dx', d => (xScale(d3.time.week.offset(d['week'], 1)) - xScale(d['week']) - 3)/2)
      .attr("dy", d => { return (h(d['count']) > 16)?"1.1em":"-0.2em"; })
      .attr("text-anchor", "middle")
      .text(d => d['count']);

    // create brushes
    var extents = [[start_A, end_A], [start_B, end_B]];
    var brushG = svg.append("g").attr("class", "brushes");

    this.brushes.clear();

    for (var i = 0; i < 2; i++) {
      var brush = d3.svg.brush()
        .x(xScale)
        .extent(extents[i]);

      this.brushes.push(brush);

      var brushg = brushG.append("g")
        .attr("class", "interval region-" + i)
        .call(brush);

      brushg.selectAll("rect")
        .attr("height", height);
    }

    /*
     var overlays = d3.select(target_elem)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     // create interval overlays
     overlays.selectAll('rect')
     .data([[start_A, end_A], [start_B, end_B]])
     .enter()
     .append('rect')
     .attr('class', (d, i) => ('interval region-' + i) )
     .attr('width', d => (xScale(d[1]) - xScale(d[0])) )
     .attr('height', height)
     .attr('x', d => xScale(d[0]) );
     */
  }
});

