/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import('bower_components/d3/d3.min.js');
  app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.eot', { destDir: 'fonts' });
  app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf', { destDir: 'fonts' });
  app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.svg', { destDir: 'fonts' });
  app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff', { destDir: 'fonts' });
  app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2', { destDir: 'fonts' });
  app.import('bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker3.standalone.min.css');
  app.import('bower_components/bootstrap/dist/js/bootstrap.js');

  // font-awesome
  /*
  app.import("bower_components/font-awesome/css/font-awesome.css");
  app.import("bower_components/font-awesome/fonts/fontawesome-webfont.eot", { destDir: "fonts" });
  app.import("bower_components/font-awesome/fonts/fontawesome-webfont.svg", { destDir: "fonts" });
  app.import("bower_components/font-awesome/fonts/fontawesome-webfont.ttf", { destDir: "fonts" });
  app.import("bower_components/font-awesome/fonts/fontawesome-webfont.woff", { destDir: "fonts" });
  // app.import("bower_components/font-awesome/fonts/fontawesome-webfont.woff2", { destDir: "fonts" });
  app.import("bower_components/font-awesome/fonts/FontAwesome.otf", { destDir: "fonts" });
  */


  // jq/boostrap plugins
  app.import('bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js');
  app.import('bower_components/jquery-sortable/source/js/jquery-sortable-min.js');

  // time manipulation plugins
  app.import('bower_components/moment/moment.js');
  // app.import('bower_components/moment-timezone/builds/moment-timezone-with-data.min.js');
  app.import('bower_components/humanize-duration/humanize-duration.js');

  // d3 plugins
  app.import('bower_components/d3-cloud/build/d3.layout.cloud.js');
  app.import('bower_components/d3pie/d3pie/d3pie.min.js');

  // misc plugins
  app.import('bower_components/cal-heatmap/cal-heatmap.js');
  app.import('bower_components/cal-heatmap/cal-heatmap.css');
  app.import('bower_components/font-awesome-animation/dist/font-awesome-animation.min.css');

  return app.toTree();
};
