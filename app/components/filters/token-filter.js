import Ember from 'ember';

export default Ember.Component.extend({
  token_list_str: '',

  updateMasterParams: function() {
    this.set('params.tokens', {
      list: this.get('token_list_str').split(' ')
    });
  }.observes('token_list_str')
});
