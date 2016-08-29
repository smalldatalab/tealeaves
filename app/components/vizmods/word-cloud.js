/**
 * Created by faisal on 2/24/15.
 */

import Ember from 'ember';
import BaseMod from 'tealeaves/components/vizmods/base-viz';
import tools from 'tealeaves/library/toolkit';
/* global d3 */

var stopwords_default = new Set([
  "a", "about", "above", "across", "after", "again", "against", "all", "almost", "alone", "along",
  "already", "also", "although", "always", "among", "an", "and", "another", "any", "anybody", "anyone", "anything",
  "anywhere", "are", "area", "areas", "around", "as", "ask", "asked", "asking", "asks", "at", "away", "b", "back", "backed",
  "backing", "backs", "be", "became", "because", "become", "becomes", "been", "before", "began", "behind", "being", "beings",
  "best", "better", "between", "big", "both", "but", "by", "c", "came", "can", "cannot", "case", "cases", "certain", "certainly",
  "clear", "clearly", "come", "could", "d", "did", "differ", "different", "differently", "do", "does", "done", "down",
  "down", "downed", "downing", "downs", "during", "e", "each", "early", "either", "end", "ended", "ending", "ends",
  "enough", "even", "evenly", "ever", "every", "everybody", "everyone", "everything", "everywhere", "f", "face", "faces",
  "fact", "facts", "far", "felt", "few", "find", "finds", "first", "for", "four", "from", "full", "fully", "further",
  "furthered", "furthering", "furthers", "g", "gave", "general", "generally", "get", "gets", "give", "given", "gives",
  "go", "going", "good", "goods", "got", "great", "greater", "greatest", "group", "grouped", "grouping", "groups", "h",
  "had", "has", "have", "having", "he", "her", "here", "herself", "high", "high", "high", "higher", "highest", "him",
  "himself", "his", "how", "however", "i", "if", "important", "in", "interest", "interested", "interesting", "interests",
  "into", "is", "it", "its", "itself", "j", "just", "k", "keep", "keeps", "kind", "knew", "know", "known", "knows", "l",
  "large", "largely", "last", "later", "latest", "least", "less", "let", "lets", "like", "likely", "long", "longer",
  "longest", "m", "made", "make", "making", "man", "many", "may", "me", "member", "members", "men", "might", "more",
  "most", "mostly", "mr", "mrs", "much", "must", "my", "myself", "n", "necessary", "need", "needed", "needing", "needs",
  "never", "new", "new", "newer", "newest", "next", "no", "nobody", "non", "noone", "not", "nothing", "now", "nowhere",
  "number", "numbers", "o", "of", "off", "often", "old", "older", "oldest", "on", "once", "one", "only", "open",
  "opened", "opening", "opens", "or", "order", "ordered", "ordering", "orders", "other", "others", "our", "out", "over",
  "p", "part", "parted", "parting", "parts", "per", "perhaps", "place", "places", "point", "pointed", "pointing", "points",
  "possible", "present", "presented", "presenting", "presents", "problem", "problems", "put", "puts", "q", "quite", "r",
  "rather", "really", "right", "right", "room", "rooms", "s", "said", "same", "saw", "say", "says", "second", "seconds",
  "see", "seem", "seemed", "seeming", "seems", "sees", "several", "shall", "she", "should", "show", "showed", "showing",
  "shows", "side", "sides", "since", "small", "smaller", "smallest", "so", "some", "somebody", "someone", "something",
  "somewhere", "state", "states", "still", "still", "such", "sure", "t", "take", "taken", "than", "that", "the", "their",
  "them", "then", "there", "therefore", "these", "they", "thing", "things", "think", "thinks", "this", "those", "though",
  "thought", "thoughts", "three", "through", "thus", "to", "today", "together", "too", "took", "toward", "turn", "turned",
  "turning", "turns", "two", "u", "under", "until", "up", "upon", "us", "use", "used", "uses", "v", "very", "w", "want",
  "wanted", "wanting", "wants", "was", "way", "ways", "we", "well", "wells", "went", "were", "what", "when", "where",
  "whether", "which", "while", "who", "whole", "whose", "why", "will", "with", "within", "without", "work", "worked",
  "working", "works", "would", "x", "y", "year", "years", "yet", "you", "young", "younger", "youngest", "your", "yours",
  "z",
  "edu","com","org", "co", "ca", "io", "de", "i've", "i'll", "i'm", "am", "pm", "gt", "lt" // html detritus
]);

var this_jan = d3.time.year.floor(new Date());
var months = d3.time.month.range(this_jan, d3.time.year.offset(this_jan,1)).map(function(x) { return d3.time.format("%b")(x).toLowerCase(); });

stopwords_default = new Set([...stopwords_default, ...months]);

export default BaseMod.extend({
  classNames: ['word-cloud'],
  layout_engine: null,
  bind: function(start_date, end_date, filters) {
    var _this = this;
    var $me = _this.$();

    // display the spinner
    this.$(".loader").show();

    var params = {
      min_date: tools.apiTZDateTime(start_date),
      max_date: tools.apiTZDateTime(end_date),
      min_length: 4
    };

    this.applyAlterFilter(filters, params);
    this.applyLabelFilter(filters, params);

    // also apply stopword filter
    var stopwords = null;
    if (filters['tokens'] && filters['tokens']['list']) {
      // create a new list consisting of the merged words from the ignore list and the default set
      stopwords = new Set([...stopwords_default, ...filters['tokens']['list']]);
    } else {
      // just use the existing list
      stopwords = stopwords_default;
    }

    this.get('eaf_api').query('wordcloud_words', params)
      .then(function(response) {
        // this response is already of the form [{word: "hello", count: 12}, ...]
        var counts = response.words;

        var initial = counts.length;

        // remove all the stopwords
        counts = counts.filter(function(x) {
          return !stopwords.has(x.word);
        });

        console.log("Inital: " + initial + ", word count post-stopword-removal: " + counts.length);

        if (counts.length > 0) {
          // first ensure that we're not running a previous layout job
          if (_this.layout_engine !== null) {
            console.log("Interrupted existing layout engine!");

            _this.layout_engine.stop();
            _this.layout_engine = null;
          }

          makeCloud(_this, counts, counts.length, _this.$(".d3box").get(0), $me.width(), $me.height(),
            () => { // complete action
              // hide the spinner now
              _this.$(".loader").hide();
            },
            (word) => { // revoke action
              _this.get('filters.tokens.list').addObject(word);
              _this.sendAction('action');
            }
          );
        }
        else {
          // soooo redundant!
          _this.$(".loader").hide();
          _this.$(".borked").show();
          _this.$(".d3box").children().remove();
        }
      });
  },
});

/*
========================================================================
=== support functions for drawing word clouds below
========================================================================
*/

function makeCloud(parent, words, total, target, width, height, complete, revoke_action) {
  var fill = d3.scale.category20();

  // find largest and smallest word, then make a scale for that
  var maxval = words[0].times;
  var minval = words[words.length-1].times;

  // create a scale appropriate to the number of terms
  var scale = null;
  if (total > 400) {
    scale = d3.scale.pow().exponent(1).domain([minval, maxval]).range([minval, maxval]);
  }
  else {
    scale = d3.scale.linear().domain([minval, maxval]).range([5, 50]);
  }

  var target_sel = d3.select(target);
  // empty target prior to drawing
  target_sel.selectAll("*").remove();
  // also create the word_group that we'll be adding things to
  var word_group = target_sel.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + Math.round(width/2) + "," + Math.round(height/2) + ")");

  function draw(words) {
    console.log("DONE!");

    // mark the layout as having been completed so we don't attempt to stop it
    parent.layout_engine = null;

    // empty target prior to drawing
    // target_sel.selectAll("*").remove();

    word_group
      .selectAll("text")
      .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("cursor", "pointer")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; })
        .on('click', function(d) { if (revoke_action) { revoke_action(d.text); } })
        .append("svg:title")
        .text(function(d) { return d.text + " : " + d.count; });

    if (complete !== null) {
      complete();
    }
  }

  parent.layout_engine = d3.layout.cloud().size([width, height])
    .words(words.map(function(d) { return { text: d.word, count: d.times, size: scale(d.times) * 3 }; }))
    .timeInterval(5)
    .padding(2)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function(d) { return d.size; })
    // .on("word", draw_word)
    .on("end", draw)
    .start();

  /*
  function draw_word(word) {
    // console.log(word);

    word_group
      .selectAll("text")
      .data([word])
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("cursor", "pointer")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; })
        .on('click', function(d) { if (revoke_action) { revoke_action(d.text); } })
        .append("svg:title")
          .text(function(d) { return d.text + " : " + d.count; });
  }
  */
}

