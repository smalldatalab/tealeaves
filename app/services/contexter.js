import Ember from 'ember';

export default Ember.Service.extend({
    messages: Ember.A([]),

    init() {
        this._super(...arguments);
        this.set('mail_entries', Ember.A([]));
    },

    consider() {

    }
});
