/**
 * Created by faisal on 3/16/15.
 */

import Ember from 'ember';

export default Ember.Component.extend({
  value: 0,
  maxvalue: 0,
  didInsertElement: function() {
    this.updateWidth();
  },
  updateWidth: Ember.observer('value', 'maxvalue', function() {
    this.$(".progress-bar").css('width', (this.get('value')/this.get('maxvalue'))*100 + "%");
  })
});
