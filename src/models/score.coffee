BEST_KEY = 'score:best'

class Score
  constructor: ->
    @last = 0
    @best = if localStorage[BEST_KEY] then \
              parseInt(localStorage[BEST_KEY]) \
            else 0

  save: (score) =>
    @last = score

    if score > @best
      @setBest(score)

  getLast: (score) =>
    @last

  setBest: (score) ->
    @best = score
    localStorage[BEST_KEY] = score

  getBest: ->
    @best


module.exports = new Score()
