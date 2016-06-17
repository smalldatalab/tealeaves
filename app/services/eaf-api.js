import Ember from 'ember';

export default Ember.Service.extend({
  ajax: Ember.inject.service('ajax'),
  session: Ember.inject.service('session'),

  query: function(path, args, method) {
    const eafBasePath = 'http://eaf.smalldata.io/v1';
    const me = this;

    // var myFunc = function() { return new Promise(function(resolve) { libFunc(function() { resolve(1); }); }); };  myFunc().then(callback);
    // 15:30 < jaawerth> diphtherial: so basically, wrap the header-getting bit in a Promise that resolves to the headers object you created,
    // then you can do gotHeaders.then(function(headers) { return me.get('ajax').request(bleh, { method, headers }); })

    return new Promise(function(resolve, reject) {
      me.get('session').authorize('authorizer:eaf-oauth2', function(headerName, headerValue) {
        const headers = {};
        headers[headerName] = headerValue;
        var options = { method: method, data: args, headers };
        console.log("Query to ", path, " with options: ", options);

        return me.get('ajax').request(`${eafBasePath}/${path}`, options)
          .then(function(result) { resolve(result); })
          .catch(function(error) { reject(error); });
      });
    });
  },

  ping: function(source) {
    this.query('ping').catch(function(error) {
      console.log("Ping failed: ", error, "invalidating and logging in...");
      this.get('session').invalidate();
      source.transitionToLoginRoute();
    });
  }
});
