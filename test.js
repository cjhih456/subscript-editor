// const fs = require('fs')
// const line = fs.readFileSync('/Users/choeinhwan/Downloads/POJ2528/TESTS/E.1.dat').toString().trim().split('\n')

// const line = '11 11'.trim().split(' ').map(Number)
// const line = (require('fs').readFileSync(0) + '').trim().split('\n')
// const l = line.shift()
// const temp = line.splice(0, l).map((v) => {
//   const [x, y] = v.split(' ')
//   return { x, y }
// }).sort((a, b) => {
//   if (a.x === b.x) { return a.y - b.y }
//   return a.x - b.x
// }).map(a => `${a.x} ${a.y}`).join('\n')
// console.log(temp)
// const line = (require('fs').readFileSync(0) + '').trim().split('')

const [l, v] = (require('fs').readFileSync(0) + '').trim().split(' ')
console.log(l * l - v * v)
