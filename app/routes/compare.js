/**
 * Created by faisal on 3/3/15.
 */

import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('component_list');
  },
  component_list: ['vizmods/word-cloud', 'vizmods/word-cloud'],
  available_components: ['vizmods/word_cloud'],
  actions: {
    addVizModule: function() {
      this.get('component_list').pushObject('vizmods/word-cloud');
    }
  }
});
