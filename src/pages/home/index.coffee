z = require 'zorium'
_ = require 'lodash'

Game = require '../../components/game'

module.exports = class HomePage
  constructor: ->
    @state = z.state
      $game: new Game()

  render: =>
    {$game} = @state()

    z 'div',
      z $game
