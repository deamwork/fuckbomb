'use strict';

angular.module('app.filters', [])
.filter('slice', function() {
  return function(arr, start, end) {
    return arr.slice(start, end);
  };
})
.filter('passwordMatch', function() {
  return function(words, inputs) {
    if (_.isEmpty(words) 
      || _.isEmpty(inputs)
      || _.every(inputs, function(input) {
          var chars = input.chars;
          return !!chars && chars.length === 0;
        }))
        return words;
    
    return _.filter(words, function(word) {
      word = word.toLowerCase();
      
      // Loop through each input string
      for (var i = 0, len = inputs.length; i < len; ++i) {
        var input = inputs[i].chars.toLowerCase();
        if (input.length === 0)
          continue;
        
        var res = false;
        // Loop through each char in the input string
        for (var j = 0, len2 = input.length; j < len2; ++j) {
            // If the char at this position matches, the word passes this input position
            if (word.charAt(i) === input.charAt(j)) {
              res = true;
              break;
            }
        }
        
        // If a word ever fails an input position, fail the word
        if (!res)
          return false;
      }
      
      return true;
    });
  };
});