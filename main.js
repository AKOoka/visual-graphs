const mainGraph = document.getElementById('main-graph')
const ctx = mainGraph.getContext('2d')

const Tau = Math.PI * 2

const canvasWidth = 500
const canvasHeight = 250

const lineWidth = 5

const globalData = []
const zoom = { start: 0, end: 100 }
const zoomIndex = { start: null, end: null }

let minHeight = 0
let maxHeight = 0

let intrevalWidth = zoom.end - zoom.start
let intervalHeight = maxHeight - minHeight

;(function generateData (count, minimum, maximum) {
  console.time('generate')

  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  for (let i = 0; i <= count; i++) {
    globalData.push([i * 20, random(minimum, maximum)])
  }

  console.timeEnd('generate')
})(500000, 0, 500)

function getIndexs () {
  let i = 0

  minHeight = globalData[0][1]

  for (i; i < globalData.length; i++) {
    const x = globalData[i][0]
    const y = globalData[i][1]

    if (y > maxHeight) {
      maxHeight = y
    }

    if (y < minHeight) {
      minHeight = y
    }

    if (x === zoom.start) {
      zoomIndex.start = i

      break
    } else if (x > zoom.start) {
      zoomIndex.start = i - 1

      break
    }
  }

  for (i; i < globalData.length; i++) {
    const x = globalData[i][0]
    const y = globalData[i][1]

    if (y > maxHeight) {
      maxHeight = y
    }

    if (y < minHeight) {
      minHeight = y
    }

    if (x >= zoom.end) {
      zoomIndex.end = i

      break
    }
  }
}

function transformPoint (point) {
  const value = []

  value.push((point[0] - zoom.start) / intrevalWidth * canvasWidth)
  value.push(canvasHeight - lineWidth - (((point[1] - minHeight) / intervalHeight) * (1 - lineWidth / intervalHeight)) * canvasHeight)

  return value
}

document.getElementById('startInterval').addEventListener('change', event => {
  zoom.start = event.target.value

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  init()
})

document.getElementById('endInterval').addEventListener('change', event => {
  zoom.end = event.target.value

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  init()
})

mainGraph.width = canvasWidth
mainGraph.height = canvasHeight

function init () {
  console.time('draw')

  getIndexs()

  intrevalWidth = zoom.end - zoom.start
  intervalHeight = maxHeight - minHeight

  ctx.beginPath()

  ctx.strokeStyle = '#88ed2a'
  ctx.lineWidth = lineWidth

  ctx.moveTo(...transformPoint(globalData[zoomIndex.start]))

  for (let i = zoomIndex.start + 1; i <= zoomIndex.end; i++) {
    ctx.lineTo(...transformPoint(globalData[i]))
  }

  ctx.stroke()

  console.timeEnd('draw')
}

function anime () {
  requestAnimationFrame(anime)
}

init()
// anime()
