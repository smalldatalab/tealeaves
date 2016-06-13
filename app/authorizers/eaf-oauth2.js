/**
 * Created by faisal on 3/5/15.
 */

// import Base from 'ember-simple-auth/authorizers/base';
// import Ember from 'ember';
//
// export default Base.extend({
//   /**
//    @method authorize
//    @param {jqXHR} jqXHR The XHR request to authorize (see http://api.jquery.com/jQuery.ajax/#jqXHR)
//    @param {Object} requestOptions The options as provided to the `$.ajax` method (see http://api.jquery.com/jQuery.ajaxPrefilter/)
//    */
//   authorize: function(jqXHR) {
//     // var accessToken = this.get('session.content.token');
//     // FIXME: as of 9/9/15, this for some reason is now 'session.content.secure...' instead of just 'session.content' -- find out why
//     var accessToken = this.get('session.content.secure.authorizationToken.access_token');
//
//     if (this.get('session.isAuthenticated') && !Ember.isEmpty(accessToken)) {
//       jqXHR.setRequestHeader('Authorization', 'Bearer ' + accessToken);
//     }
//   }
// });

import Base from 'ember-simple-auth/authorizers/base';
import Ember from 'ember';

const { isEmpty } = Ember;

export default Base.extend({
  /**
   Includes the access token from the session data into the `Authorization`
   header as a Bearer token, e.g.:
   ```
   Authorization: Bearer 234rtgjneroigne4
   ```
   @method authorize
   @param {Object} data The data that the session currently holds
   @param {Function} block(headerName,headerContent) The callback to call with the authorization data; will receive the header name and header content as arguments
   @public
   */
  authorize(data, block) {
    const accessToken = data['access_token'];

    if (!isEmpty(accessToken)) {
      block('Authorization', `Bearer ${accessToken}`);
    }
  }
});
