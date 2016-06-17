import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  actions: {
    'connect-eaf': function() {
      this.transitionToRoute('login');
    },
    'disconnect-eaf': function() {
      this.get('session').invalidate();
    }
  }
});
