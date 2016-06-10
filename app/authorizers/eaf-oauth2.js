/**
 * Created by faisal on 3/5/15.
 */

//
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

import OAuth2Bearer from 'ember-simple-auth/authorizers/oauth2-bearer';

export default OAuth2Bearer.extend();
