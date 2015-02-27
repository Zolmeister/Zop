z = require 'zorium'
_ = require 'lodash'

GameOver = require '../../components/game_over'

module.exports = class GameOverPage
  constructor: ->
    @state = z.state
      $hello: new GameOver()

  render: =>
    {$hello} = @state()

    z 'div',
      z $hello
