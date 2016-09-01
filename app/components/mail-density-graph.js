import Ember from 'ember';

/* global d3 */

export default Ember.Component.extend({
  eaf_api: Ember.inject.service('eaf-api'),
  regions: [],

  didInsertElement() {
    this._super(...arguments);
    // this.generate();
  },

  rangeChanged: Ember.observer('start_date_A', 'start_date_B', 'end_date_A', 'end_date_B', function() {
    var extents = [[this.get('start_date_A'), this.get('end_date_A')], [this.get('start_date_B'), this.get('end_date_B')]];

    // find and update our brushes
    this.regions.map((region, i) => {
      region.extent = extents[i];
      region.brush.extent(region.extent);

      // now draw the brush to match our extent
      // use transition to slow it down so we can see what is happening
      // remove transition so just d3.select(".brush") to just draw
      region.brush(d3.select(".interval.region-" + i).transition());

      // now fire the brushstart, brushmove, and brushend events
      // remove transition so just d3.select(".brush") to just draw
      // region.brush.event(d3.select(".interval.region-" + i).transition().delay(1000));
    });
  }),

  generate: Ember.observer('mail_meta', function() {
    var mail_meta = this.get('mail_meta');

    if (!mail_meta) {
      return;
    }

    var $boxShell = this.$(".mail-density-graph");
    var $target = this.$(".mail-density-graph svg");

    // remove any elements in the SVG
    $target.empty();

    $target.attr('viewBox', `0 0 ${$boxShell.width()} ${$boxShell.height()}`);
    $target.attr('width', $boxShell.width());
    $target.attr('height', $boxShell.height());

    this.renderChart(
      $target.get(0), this.get('mail_meta'),
      this.get('start_date_A'), this.get('end_date_A'),
      this.get('start_date_B'), this.get('end_date_B')
    );
  }),

  renderChart(target_elem, data, start_A, end_A, start_B, end_B) {
    var margin = {
        top: 0,
        right: 15,
        bottom: 20,
        left: 15
    };
    // var width = Ember.$(target_elem).width() - margin.left - margin.right;
    // var height = Ember.$(target_elem).height() - margin.top - margin.bottom;
    var width = 1140 - margin.left - margin.right, height = 60 - margin.top - margin.bottom;

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
      .attr('width', d => xScale(d3.time.week.offset(d['week'], 1)) - xScale(d['week']) - 2 )
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
    var brushG = svg.append("g").attr("class", "brushes");

    this.regions = [
      {extent: [start_A, end_A], brush: null, user_initiated: false},
      {extent: [start_B, end_B], brush: null, user_initiated: false}
    ];

    // sets up each region to have an associated brush
    this.regions.map((region, i) => {
      var _this = this;

      // create start handler when user input begins
      region.start_handler =  function() {
        region.user_initiated = true;
      };

      // creates end handler when user input ends
      region.end_handler = function() {
        var ext = region.brush.extent().map(d => d3.time.day.round(d));

        console.log("ext for brush ", i, " changed to ", ext);

        // sync up the surrounding page to this change
        /*
        if (region.user_initiated) {
          if (i === 0) {
            _this.set('start_date_A', ext[0]);
            _this.set('end_date_A', ext[1]);
          }
          else if (i === 1) {
            _this.set('start_date_B', ext[0]);
            _this.set('end_date_B', ext[1]);
          }

          region.user_initiated = false;
        }
        */
      };

      region.brush = d3.svg.brush()
        .x(xScale)
        .extent(region.extent)
        .on('brushstart', region.start_handler)
        .on('brushend', region.end_handler);

      var brushg = brushG.append("g")
        .attr("class", "interval region-" + i)
        .call(region.brush);

      brushg.selectAll("rect")
        .attr("height", height);
    });

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

