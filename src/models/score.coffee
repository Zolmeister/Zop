BEST_KEY = 'score:best'

class Score
  constructor: ->
    @last = 0
    try
      @best = if localStorage[BEST_KEY] then \
                parseInt(localStorage[BEST_KEY]) \
              else 0
    catch e
      console.log e

  save: (score) =>
    @last = score

    if score > @best
      @setBest(score)

  getLast: (score) =>
    @last

  setBest: (score) ->
    @best = score
    try
      localStorage[BEST_KEY] = score
    catch e
      console.log e

  getBest: ->
    @best


module.exports = new Score()
