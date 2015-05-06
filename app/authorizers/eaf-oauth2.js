/**
 * Created by faisal on 3/5/15.
 */

import Base from 'simple-auth/authorizers/base';
import Ember from 'ember';

export default Base.extend({
  /**
   @method authorize
   @param {jqXHR} jqXHR The XHR request to authorize (see http://api.jquery.com/jQuery.ajax/#jqXHR)
   @param {Object} requestOptions The options as provided to the `$.ajax` method (see http://api.jquery.com/jQuery.ajaxPrefilter/)
   */
  authorize: function(jqXHR) {
    // var accessToken = this.get('session.content.token');
    var accessToken = this.get('session.content.authorizationToken.access_token');

    if (this.get('session.isAuthenticated') && !Ember.isEmpty(accessToken)) {
      jqXHR.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    }
  }
});
