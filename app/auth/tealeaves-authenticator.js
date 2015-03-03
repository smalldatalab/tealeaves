/**
 * Created by Faisal on 11/11/2014.
 */

import Ember from 'ember';
import Base from 'simple-auth/authenticators/base';

export default Base.extend({
    authenticate: function(options) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            if ("key" in options) {
                resolve(options);
            }
            else {
                if ("error" in options) {
                    reject(options.error);
                }
                else {
                    reject("No token specified in the options");
                }
            }
        });
    },
    restore: function(data) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            if (data.key) {
                resolve(data);
            }
            else {
              reject("No token specified in the data payload");
            }
        });
    },
    invalidate: function(data) {
        return new Ember.RSVP.Promise(function(resolve) {
            // we omitted the 'reject' param since we don't ever reject here
            resolve(data);
        });
    }
});
