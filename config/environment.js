/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'tealeaves',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    extras: {
      eafBase: 'http://eaf.smalldata.io/v1'
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self'",
      'font-src': "'self' http://fonts.gstatic.com", // Allow fonts to be loaded from http://fonts.gstatic.com
      'connect-src': "'self' http://eaf.smalldata.io",
      'img-src': "'self'",
      'style-src': "'self' 'unsafe-inline' http://fonts.googleapis.com", // Allow inline styles and loaded CSS from http://fonts.googleapis.com
      'media-src': "'self'"
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV['torii'] = {
      providers: {
        'eaf-oauth2': {
          // note that this is the 'tealeaves local' API
          apiKey: '8786a7cd-7444-4e5b-b675-da6cf3e07186',
          redirectUri: 'http://localhost:4200/authed'
        }
      }
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV['torii'] = {
      providers: {
        'eaf-oauth2': {
          // note that this is the 'tealeaves' API
          apiKey: '26a5a24e-927d-413d-b389-bc1c89df15da',
          redirectUri: 'http://tealeaves.smalldata.io/authed'
        }
      }
    };
  }

  ENV['ember-simple-auth'] = {
    authenticationRoute: 'login'
  };

  return ENV;
};
