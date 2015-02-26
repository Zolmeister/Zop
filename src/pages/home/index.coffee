z = require 'zorium'
_ = require 'lodash'

Game = require '../../components/game'

module.exports = class HomePage
  constructor: ->
    @state = z.state
      $hello: new Game()

  render: =>
    {$hello} = @state()

    z 'div',
      z $hello
