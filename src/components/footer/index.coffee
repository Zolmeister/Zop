z = require 'zorium'
Button = require 'zorium-paper/button'
Icon = require 'zorium-paper/icon'

styles = require './index.styl'

module.exports = class Footer
  constructor: ->
    styles.use()

    @state = z.state
      $shareBtn: new Button()
      $shareIcon: new Icon()
      $restartBtn: new Button()
      $restartIcon: new Icon()

  render: ({onRestart}) =>
    {$shareBtn, $restartBtn, $shareIcon, $restartIcon} = @state

    z '.z-footer',
      z '.left',
        z $restartBtn,
          onclick: onRestart
          text: z 'div',
            {style: paddingRight: '24px'}
            z $shareIcon,
              icon: 'replay'
              shouldRipple: false
            'restart'
      z '.right',
        z $shareBtn,
          onclick: ->
            Clay('client.share.any', {
              text: 'Come play Zop! http://zop.zolmeister.com'
            })
          text: z 'div',
            {style: paddingLeft: '24px'}
            'share'
            z $shareIcon,
              icon: 'share-variant'
              shouldRipple: false
