import Ember from 'ember';

export default Ember.Component.extend({
  updateMasterParams: function() {
    this.notifyPropertyChange('params')
  }.observes('params.token_list_str')
});
