import Ember from 'ember';

/* global d3 */

export default Ember.Component.extend({
  eaf_api: Ember.inject.service('eaf-api'),

  didInsertElement() {
    this._super(...arguments);

    this.generate();
  },

  bind: Ember.observer('start_date_A', 'start_date_B', 'end_date_A', 'end_date_B', function() {
    this.generate();
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
        console.log(data);
        renderChart(
          $target.get(0), data,
          this.get('start_date_A'), this.get('end_date_A'),
          this.get('start_date_B'), this.get('end_date_B')
        );
      });
  }
});

function renderChart(target_elem, data, start_A, end_A, start_B, end_B) {
  var margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
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
  var xScale = d3.time.scale().domain(week_extents).range([0, width - margin.right]);

  // var boxw = width/(week_densities.length);
  var h = d3.scale.linear().range([0, height - margin.top]).domain(d3.extent(week_densities, (d) => d['count']));

  // create bars
  svg.selectAll('rect')
    .data(week_densities)
    .enter()
      .append('rect')
      .attr('class', 'weekly-bar')
      .attr('width', d => xScale(d3.time.week.offset(d['week'], 1)) - xScale(d['week']) - 3 )
      .attr('height', function(d) { return h(d['count']); })
      .attr('x', function(d) { return xScale(d['week']); })
      .attr('y', (d) => (height - h(d['count'])));

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
}
