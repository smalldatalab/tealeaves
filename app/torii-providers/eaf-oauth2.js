/**
 * Created by faisal on 3/5/15.
 */

import Ember from 'ember';
import Provider from 'torii/providers/oauth2-bearer';
import {configurable} from 'torii/configuration';
// import env from '../config/environment';

export default Provider.extend({
    name: 'eaf-oauth2',
    baseUrl: ('http://eaf.smalldata.io/oauth/authorize'),

    responseParams: ['access_token', 'token_type', 'expires_in'],

    redirectUri: configurable('redirectUri', function(){
        // A hack that allows redirectUri to be configurable
        // but default to the superclass
        return this._super();
    }),

    open: function() {
        return this._super().then(function(authData){
            /*
            if (authData.authorizationCode && authData.authorizationCode === '200') {
                // indication that the user hit 'cancel', not 'ok'
                throw 'User canceled authorization';
            }
            */

          console.log("Auth data: ", JSON.stringify(authData));

            // hit the eaf API to get details about the user so we can restore our session
            return Ember.$.getJSON("http://eaf.smalldata.io/oauth/me", { access_token: authData.authorizationToken.access_token })
                .then(function(response) {
                    authData.user_id = response.id;
                    authData.userEmail = response.username;

                    return authData;
                });
        });
    },

    // just a passthrough so ember-simple-auth doesn't dump our authentication on refresh
    fetch: function(data) {
        return new Ember.RSVP.Promise(function(resolve) {
            resolve(data);
        });
    }
});
