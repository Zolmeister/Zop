z = require 'zorium'
Button = require 'zorium-paper/button'
Icon = require 'zorium-paper/icon'

Score = require '../../models/score'

styles = require './index.styl'

module.exports = class GameOver
  constructor: ->
    styles.use()

    @state = z.state
      $shareBtn: new Button()
      $shareIcon: new Icon()
      $againBtn: new Button()
      $playIcon: new Icon()

  render: =>
    {$shareBtn, $againBtn, $shareIcon, $playIcon} = @state

    lastScore = Score.getLast()
    bestScore = Score.getBest()

    z '.z-game-over',
      z '.current-score', '' + lastScore
      z '.current-label', 'SCORE'
      z '.divider'
      z '.best-score', '' + bestScore
      z '.best-label', 'BEST'
      z '.buttons',
        z '.button',
          z $shareBtn,
            onclick: ->
              Clay('client.share.any', {
                text: "I scored #{lastScore} in Zop!
                       http://zop.zolmeister.com"
              })
            text:
              z 'div',
                {style: paddingRight: '24px'}
                z $shareIcon,
                  icon: 'share-variant'
                  shouldRipple: false
                'share score'
        z '.button',
          z $againBtn,
            onclick: ->
              z.router.go '/'
            text:
              z 'div',
                {style: paddingRight: '24px'}
                z $shareIcon,
                  icon: 'play'
                  shouldRipple: false
                'play again'
