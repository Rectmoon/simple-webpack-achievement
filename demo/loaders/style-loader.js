module.exports = function(source) {
  const output = `let style = document.createElement('style')
   style.innerHTML = ${JSON.stringify(source)}
   document.head.appendChild(style)
  `
  return output
}
