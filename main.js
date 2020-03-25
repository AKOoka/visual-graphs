const mainGraph = document.getElementById('main-graph')
const mapGraph = document.getElementById('map-graph')

const ctx = mainGraph.getContext('2d')
const ctxMap = mapGraph.getContext('2d')

const Tau = Math.PI * 2

const canvasWidth = 1000
const canvasHeight = 250

const mapHeight = 100

const lineWidth = 5

const globalData = []
let globalWidth = 0

const zoom = { start: 100, end: 200 }
const zoomIndex = { start: null, end: null }

let minHeight = 0
let maxHeight = 0

let intervalWidth = zoom.end - zoom.start
let intervalHeight = maxHeight - minHeight

function generateData (count, minimum, maximum) {
  console.time('generate')

  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  for (let i = 0; i <= count; i++) {
    globalData.push([i, random(minimum, maximum)])
  }

  console.timeEnd('generate')
}

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

function transformPoint (point, start, intervalW, intervalH, minH, canvasH) {
  const value = []

  value.push((point[0] - start) / intervalW * canvasWidth)
  value.push(canvasH - lineWidth - (((point[1] - minH) / intervalH) * (1 - lineWidth / intervalH)) * canvasH)

  return value
}

mainGraph.width = canvasWidth
mainGraph.height = canvasHeight

mapGraph.width = canvasWidth
mapGraph.height = mapHeight

function drawMap () {
  let globalHeight = 0
  let globalMinHeight = globalData[0][1]

  globalWidth = globalData[globalData.length - 1][0] - globalData[0][0]

  for (const data of globalData) {
    if (data[1] > globalHeight) {
      globalHeight = data[1]
    }

    if (data[1] < globalMinHeight) {
      globalMinHeight = data[1]
    }
  }

  ctxMap.beginPath()
  ctxMap.strokeStyle = '#88ed2a'
  ctxMap.lineWidth = 1

  ctxMap.moveTo(...transformPoint(globalData[0], 0, intervalWidth, intervalHeight, minHeight, mapHeight))

  for (const point of globalData) {
    ctxMap.lineTo(...transformPoint(point, 0, globalWidth, globalHeight, globalMinHeight, mapHeight))
  }

  ctxMap.stroke()
}

// function drawSlider (x) {
//   ctxMap.beginPath()

//   ctxMap.strokeStyle = '#d82060'

//   ctxMap.lineWidth = 2

//   ctxMap.moveTo(x, 0)
//   ctxMap.lineTo(x, mapHeight)

//   ctxMap.stroke()
// }

function drawInterval () {
  // console.time('draw')

  getIndexs()

  intervalWidth = zoom.end - zoom.start
  intervalHeight = maxHeight - minHeight

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.beginPath()

  ctx.strokeStyle = '#88ed2a'
  ctx.lineWidth = lineWidth

  ctx.moveTo(...transformPoint(globalData[zoomIndex.start], zoom.start, intervalWidth, intervalHeight, minHeight, canvasHeight))

  for (let i = zoomIndex.start + 1; i <= zoomIndex.end; i++) {
    ctx.lineTo(...transformPoint(globalData[i], zoom.start, intervalWidth, intervalHeight, minHeight, canvasHeight))
  }

  ctx.stroke()

  // console.timeEnd('draw')
}

// function anime () {
//   requestAnimationFrame(anime)
// }

const trackMouse = document.getElementById('track-mouse')
const startSlider = document.getElementById('start-slider')
const centerSlider = document.getElementById('center-slider')
const endSlider = document.getElementById('end-slider')

startSlider.style.left = zoom.start + 'px'
endSlider.style.left = zoom.end + 'px'

centerSlider.style.left = zoom.start + 'px'
centerSlider.style.right = canvasWidth - zoom.end + 'px'

let dragged = null

trackMouse.addEventListener('mousemove', event => {
  if (dragged) {
    const startPos = Number(startSlider.style.left.replace('px', ''))
    const endPos = Number(endSlider.style.left.replace('px', ''))

    const selectorWidth = (endPos - startPos) / 2

    const scaledPos = pos => (globalWidth / canvasWidth) * pos

    console.log(selectorWidth)

    if (dragged === startSlider) {
      dragged.style.left = event.layerX + 'px'

      centerSlider.style.left = event.layerX + 'px'
    } else if (dragged === endSlider) {
      dragged.style.left = event.layerX + 'px'

      centerSlider.style.right = canvasWidth - event.layerX + 'px'
    } else {
      startSlider.style.left = event.layerX - selectorWidth + 'px'
      endSlider.style.left = event.layerX + selectorWidth + 'px'

      // console.log(`start === ${startSlider.style.left} end === ${endSlider.style.left}`)

      centerSlider.style.left = startSlider.style.left
      centerSlider.style.right = canvasWidth - endPos + 'px'
    }

    zoom.start = scaledPos(startPos)
    zoom.end = scaledPos(endPos)

    drawInterval()
  }
})

document.addEventListener('mousedown', event => {
  const startPos = Number(startSlider.style.left.replace('px', ''))
  const endPos = Number(endSlider.style.left.replace('px', ''))

  if (event.target === startSlider || event.target === endSlider) {
    dragged = event.target
  } else if (event.layerX > startPos && event.layerX < endPos) {
    dragged = centerSlider
  }
})

document.addEventListener('mouseup', event => {
  dragged = null
})

generateData(100, 0, 100000)

drawMap()

// drawSlider(zoom.start)
// drawSlider(zoom.end)

drawInterval()
// anime()
