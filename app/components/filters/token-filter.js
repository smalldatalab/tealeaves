import Ember from 'ember';

export default Ember.Component.extend({
  init: function() {
    this._super(...arguments);
    this.set('params.list', []);
  },

  token_list_str: Ember.computed('params.list.[]', {
    get(key) {
      // console.log("token-filter(get token_list_str) => Key: ", key);
      return this.get('params.list').join(' ');
    },
    set(key, value) {
      // console.log("token-filter(set token_list_str) => Key: ", key, ", Value: ", value);
      if (value.trim() !== '') {
        this.get('params.list').setObjects(value.split(' '));
      } else {
        this.get('params.list').clear();
      }
      return this.get('params.list').join(' ');
    }
  }),

  updateMasterParams: function() {
    this.notifyPropertyChange('params');
  }.property('params.list')
});
