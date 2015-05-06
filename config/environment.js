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

        APP: {
            // Here you can pass flags/options to your application instance
            // when it is created
            LOG_RESOLVER: false,
            LOG_TRANSITIONS: true
        },

        contentSecurityPolicy: {
            'default-src': "'none'",
            'script-src': "'self'",
            'font-src': "'self' http://fonts.gstatic.com", // Allow fonts to be loaded from http://fonts.gstatic.com
            'connect-src': "'self' https://eaf.smalldata.io",
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

    }

    ENV['simple-auth'] = {
        authorizer: 'authorizer:eaf-oauth2',
        crossOriginWhitelist: ['*'],
        authenticationRoute: 'login'
    };

    ENV['torii'] = {
        providers: {
            'eaf-oauth2': {
                apiKey: 'u?o8K=lPvJv?5NRJMgbqoxfApCu3RubDK.d0J6T8',
                redirectUri: 'http://tealeaves.smalldata.io/authed'
            }
        }
    };

    return ENV;
};
