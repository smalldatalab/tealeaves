/**
 * Created by Faisal on 11/11/2014.
 */

// import Ember from 'ember';
import Base from 'simple-auth/authorizers/base';

export default Base.extend({
    // function courtesy of "amateur": http://stackoverflow.com/a/6021027
    updateQueryStringParameter: function (uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    },
    authorize: function(jgXHR, requestOptions) {
        // modify it to add the key from the session, if present
        if (this.session.get('key') != null) {
            // console.log("Original URL: ", requestOptions.url)
            requestOptions.url = this.updateQueryStringParameter(requestOptions.url, 'key', this.session.get('key'));
        }
    }
});
