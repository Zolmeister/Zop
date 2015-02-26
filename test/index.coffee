require 'polyfill'

mock = require 'mock'
testsContext = require.context('./unit', true)
testsContext.keys().forEach testsContext
