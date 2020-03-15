const less = require('less')

module.exports = function(source) {
  let output = ''

  less.render(source, (err, c) => {
    output = c.css
    output = output.replace(/\n/g, '\\n')
  })

  return output
}
