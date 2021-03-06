/**
 * Created by faisal on 3/24/15.
 */

export default {
  /**
   * Returns an object where the keys are unique values from the array and the values are counts of their occurrences.
   * @param {Array} list the array on which to perform counting
   * @param {Function} [key] function that returns the identity of each element; just the element itself if undefined
   * @param {Function} [value] function that extracts a numerical field for summing (by default just '1')
   * @param {Object} [accumulator={}] an existing value:count object, or {} if undefined
   *
   * The accumulator parameter is for performing a counting operation across multiple invocations
   * of the function (say, in the case of counting paged results from an API.) You'd typically pass the
   * previous return value as that parameter when you invoke it the following time.
   */
  countBy: function(list, key, value, accumulator) {
    // apply defaults for unspecified parameters
    if (key == null) { key = function(a) { return a; }; }
    if (value == null) { value = function() { return 1; }; }
    if (accumulator == null) { accumulator = {}; }

    return list.reduce(function(d, cur) {
      var id = key(cur);
      if (!d.hasOwnProperty(id)) { d[id] = 0; } // init the slot if never seen
      d[id] += value(cur); // increment the slot that now is guaranteed to exist
      return d;
    }, accumulator);
  },

  /**
   * Given a moment.js moment, returns a datetime string with timezone in a format that the EAF can parse.
   * @param cand_moment a moment.js moment
   * @returns {String} an EAF-parseable datetime string with timezone
   */
  apiTZDateTime: function(cand_moment) {
    // FIXME: for now we're just leaving out the timezone because we're assuming utc
    return cand_moment.utcOffset(0).format("YYYY-MM-DD"); // cut off HH:mm:ss
  },

  /**
   * Given a moment.js moment, returns a date string with timezone in a format that the EAF can parse.
   * Note that the time component is omitted.
   * @param cand_moment a moment.js moment
   * @returns {String} an EAF-parseable date string with timezone
   */
  apiTZDate: function(cand_moment) {
    return cand_moment.format("YYYY-MM-DDZZ");
  },

  cumulativeMean: function(q, state) {
    // ensure state is initialized
    if (state == null) { state = {n: 0, v: 0}; }

    return q.reduce(function(accum, x) { return {n:accum.n+1, v: (x+accum.n*accum.v)/(accum.n+1) }; }, state);
  },

  /**
   * Performs a filter on each element on the array and, if the filter is truthy,
   * returns an array of the mapped result of each element.
   * @param l the array on which to perform the filter+map
   * @param filterfn the filtering function to perform; should return true/false
   * @param mapfn the map function to perform on each element
   * @returns {*|Array}
   */
  filtermap: function(l, filterfn, mapfn) {
    return l.reduce(function(acc,x) {
      if (filterfn(x)) { acc.push(mapfn(x)); }
      return acc;
    }, []);
  },

  /**
   * Performs a map on each element on the array and then executes filter on it;
   * returns an array of the mapped result of each element.
   * @param l the array on which to perform the map+filter
   * @param mapfn the map function to perform on each element
   * @param filterfn the filtering function to perform; should return true/false
   * @returns {*|Array}
   */
  mapfilter: function(l, mapfn, filterfn) {
    return l.reduce(function(acc,x) {
      var mapped = mapfn(x);
      if (filterfn(mapped)) { acc.push(mapped); }
      return acc;
    }, []);
  },

  /**
   * For a given array of arrays, returns the elements of each inner array 'flattened' into a single outer one.
   * @param input an array of arrays
   * @returns {*} an array of the elements within each inner array
     */
  flattened: function(input) {
    return input.reduce(function (a, b) { return a.concat(b); }, []);
  }

  /*
  normalizeWordCounts(accumulator, words) {
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
  },
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
   accumulateTokens(page, args, limit, accumulator, complete) {
     // chain iterative promises as long as we have extra pages to include and limit credits to spend
     console.log("Processing: ", page, args);

     var promise = ajax(page, args).then(function(response) {
     // collapse multiple records with the same word at different times into one word=>count by summing their counts
     accumulator = this.normalizeWordCounts(accumulator, response);

     // nest the call to the next page
     if (response.next != null && limit > 0) {
        return promise.then(this.accumulateTokens(response.next, {}, limit-1, accumulator, complete));
       }
       else {
        complete(accumulator);
       }
     });

     return promise;
   }
   */
};
