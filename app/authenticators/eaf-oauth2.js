/**
 * Created by faisal on 6/9/16.
 */

import Ember from 'ember';
import ToriiAuthenticator from 'ember-simple-auth/authenticators/torii';

const {inject: {service}} = Ember;

export default ToriiAuthenticator.extend({
  torii: service(),
  ajax: service(),

  authenticate: function() {
    return this._super(...arguments);
  }
});
