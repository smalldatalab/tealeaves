/**
 * Created by faisal on 6/9/16.
 */

import Ember from 'ember';
import ToriiAuthenticator from 'ember-simple-auth/authenticators/torii';

const {inject: {service}} = Ember;

export default ToriiAuthenticator.extend({
  torii: service(),
  ajax: service(),

  authenticate() {
    const ajax = this.get('ajax');

    return this._super(...arguments).then((data) => {
      return ajax.request('/token', {
        type: 'POST',
        dataType: 'json',
        data: {'grant_type': 'facebook_auth_code', 'auth_code': data.authorizationCode}
      }).then((response) => {
        return {
          // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
          access_token: response.access_token,
          // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
          provider: data.provider
        };
      });
    });
  }
});
