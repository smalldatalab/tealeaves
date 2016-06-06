/**
 * Created by faisal on 2/24/15.
 */

// import Ember from 'ember';
import BaseMod from 'tealeaves/components/vizmods/base-viz';
import ajax from 'ic-ajax';
import tools from 'tealeaves/library/toolkit';
/* global d3 */

var stopwords = ["a", "about", "above", "across", "after", "again", "against", "all", "almost", "alone", "along",
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
  "z"];

var this_jan = d3.time.year.floor(new Date());
var months = d3.time.month.range(this_jan, d3.time.year.offset(this_jan,1)).map(function(x) { return d3.time.format("%b")(x).toLowerCase(); });

stopwords.addObjects(["edu","com","org", "co", "ca", "io", "de", "i've", "i'll", "i'm", "am", "pm", "gt", "lt"]);
stopwords.addObjects(months);

export default BaseMod.extend({
  classNames: ['word-cloud'],
  bind: function(start_date, end_date, filters) {
    var _this = this;
    var $me = _this.$();

    // display the spinner
    this.$(".loader").show();

    var params = {
      'min_date': tools.apiTZDateTime(start_date),
      'max_date': tools.apiTZDateTime(end_date),
      'nonpaged': true
    };

    if (filters && filters.hasOwnProperty('alter')) {
      console.log("Applying alter filter: ", filters['alter']);
      params['alter'] = filters['alter'];
    }

    // attempt to hit the eaf API
    // this returns a promise, which we'll use when it resolves
    ajax('https://eaf.smalldata.io/v1/tokens/', { data: params })
      .then(function(response) {
        // normalize the word counts first off
        var counts = normalizeWordCounts({}, response);

        // convert word=>counts into array of objects with keys 'word' and 'times', sorted desc on 'times'
        counts = Object.keys(counts)
          .map(function(k) { return { word: k, times: counts[k] }; });
        counts.sort(function(a,b) { return b.times - a.times; });

        // remove all the stopwords
        counts = counts.filter(function(x) { return stopwords.indexOf(x.word.toLowerCase()) === -1; });

        if (counts.length > 0) {
          makeCloud(counts, counts.length, _this.$(".d3box").get(0), $me.width(), $me.height(), function() {
            // hide the spinner now
            _this.$(".loader").hide();
          });
        }
        else {
          // soooo redundant!
          _this.$(".loader").hide();
          _this.$(".borked").show();
          _this.$(".d3box").children().remove();
        }
      });
  }
});

/*
========================================================================
=== support functions for drawing word clouds below
========================================================================
*/

/**
 * Recursively requests all the pages for a token interval and returns a single word=>count map
 * @param page the initial page to acquire (usually the first page)
 * @param args the arguments to the initial request
 * @param limit to the number of pages to accumulate
 * @param accumulator word-count map that is recursively populated and returned at the end
 * @param complete the function to execute when all tokens have been accumulated. receives the accumulator as an argument
 */
/*
function accumulateTokens(page, args, limit, accumulator, complete) {
  // chain iterative promises as long as we have extra pages to include and limit credits to spend
  console.log("Processing: ", page, args);

  var promise = ajax(page, args).then(function(response) {
    // collapse multiple records with the same word at different times into one word=>count by summing their counts
    accumulator = normalizeWordCounts(accumulator, response);

    // nest the call to the next page
    if (response.next != null && limit > 0) {
      return promise.then(accumulateTokens(response.next, {}, limit-1, accumulator, complete));
    }
    else {
      complete(accumulator);
    }
  });

  return promise;
}
*/

function normalizeWordCounts(accumulator, words) {
  return words.reduce(function(d, cur) {
    // use the "default dict" trick to initialize missing elements in the count
    // (cur.word in d && d[cur.word] !== null) || (d[cur.word] = 0);
    // ....actually, don't use that trick because it makes jslinters barf
    if (!(cur.word in d && d[cur.word] !== null)) {
      d[cur.word] = 0;
    }

    // add the number of times this word has occurred for each observation of it
    d[cur.word] += cur.count;
    // send back our augmented dictionary for the next round
    return d;
  }, accumulator);
}

function makeCloud(words, total, target, width, height, complete) {
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

  d3.layout.cloud().size([width, height])
    .words(words.map(function(d) { return { text: d.word, count: d.times, size: scale(d.times) * 3 }; }))
    .timeInterval(5)
    .padding(2)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function(d) { return d.size; })
    .on("end", draw)
    .start();

  function draw(words) {
    var target_sel = d3.select(target);

    // empty target prior to drawing
    target_sel.selectAll("*").remove();

    target_sel.append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + Math.round(width/2) + "," + Math.round(height/2) + ")")
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
          .append("svg:title")
          .text(function(d) { return d.text + " : " + d.count; });

    if (complete !== null) {
      complete();
    }
  }
}

