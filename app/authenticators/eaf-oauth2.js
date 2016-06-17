/**
 * Created by faisal on 6/9/16.
 */

import Ember from 'ember';
import ToriiAuthenticator from 'ember-simple-auth/authenticators/torii';

export default ToriiAuthenticator.extend({
  torii: Ember.inject.service('torii')
});
