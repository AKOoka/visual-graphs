const mainGraph = document.getElementById('main-graph')
const mapGraph = document.getElementById('map-graph')

const ctx = mainGraph.getContext('2d')
const ctxMap = mapGraph.getContext('2d')

const canvasWidth = 500
const canvasHeight = 250

const mapHeight = 100

const lineWidth = 5

const globalData = []
let globalWidth = 0

let target = 0

const zoom = { start: 100, end: 200 }
const zoomIndex = { start: null, end: null }

let minHeight = 0
let maxHeight = 0

let intervalWidth = zoom.end - zoom.start
let intervalHeight = maxHeight - minHeight

const scaledPos = pos => (globalWidth / canvasWidth) * pos

function generateData (count, minimum, maximum) {
  console.time('generate')

  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  for (let i = 0; i <= count; i++) {
    globalData.push([i, random(minimum, maximum)])
  }

  console.timeEnd('generate')
}

function findHeight (start, end) {
  minHeight = globalData[start][1]
  maxHeight = globalData[start][1]

  for (let i = start + 1; i <= end; i++) {
    const y = globalData[i][1]

    if (y > maxHeight) {
      maxHeight = y
    }

    if (y < minHeight) {
      minHeight = y
    }
  }
}

function getIndexs () {
  let i = 0
  let x = globalData[i][0]

  for (i; i < globalData.length; i++) {
    x = globalData[i][0]

    if (x === zoom.start) {
      zoomIndex.start = i

      break
    } else if (x > zoom.start) {
      zoomIndex.start = i - 1

      break
    }
  }

  for (i; i < globalData.length; i++) {
    x = globalData[i][0]

    if (x >= zoom.end) {
      zoomIndex.end = i

      break
    }
  }

  intervalWidth = zoom.end - zoom.start
  intervalHeight = maxHeight - minHeight
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

function drawInterval () {
  getIndexs()

  findHeight(zoomIndex.start, zoomIndex.end)

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.beginPath()

  ctx.strokeStyle = '#88ed2a'
  ctx.lineWidth = lineWidth

  ctx.moveTo(...transformPoint(globalData[zoomIndex.start], zoom.start, intervalWidth, intervalHeight, minHeight, canvasHeight))

  for (let i = zoomIndex.start + 1; i <= zoomIndex.end; i++) {
    ctx.lineTo(...transformPoint(globalData[i], zoom.start, intervalWidth, intervalHeight, minHeight, canvasHeight))
  }

  ctx.stroke()
}

let stopAnime = true

const mapWrapper = document.getElementById('map-wrapper')
const startSlider = document.getElementById('start-slider')
const centerSlider = document.getElementById('center-slider')
const endSlider = document.getElementById('end-slider')

startSlider.style.left = zoom.start + 'px'
endSlider.style.left = zoom.end + 'px'

centerSlider.style.left = zoom.start + 'px'
centerSlider.style.right = canvasWidth - zoom.end + 'px'

const velocity = 0.15

let dragged = null

document.addEventListener('mousemove', event => {
  target = event.clientX - mapWrapper.offsetLeft

  if (dragged === startSlider && target > parseInt(endSlider.style.left)) {
    target = parseInt(endSlider.style.left)
  } else if (dragged === endSlider && target < parseInt(startSlider.style.left)) {
    target = parseInt(startSlider.style.left) + 5
  } else if (target < mapGraph.offsetLeft) {
    target = 0
  } else if (target > mapGraph.offsetLeft + mapGraph.width) {
    target = mapGraph.offsetLeft + mapGraph.width
  }
})

function anime () {
  if (stopAnime) {
    return
  }

  const startPos = parseInt(startSlider.style.left)
  const endPos = parseInt(endSlider.style.left)

  let newStart = startPos
  let newEnd = endPos

  const selectorWidth = (endPos - startPos) / 2

  if (dragged === startSlider) {
    newStart += (target - startPos) * velocity
  } else if (dragged === endSlider) {
    newEnd += (target - endPos) * velocity
  } else {
    if (target - selectorWidth < 0) {
      newStart += (0 - startPos) * velocity

      newEnd += (0 + selectorWidth * 2 - endPos) * velocity
    } else if (target + selectorWidth > canvasWidth) {
      newStart += (canvasWidth - selectorWidth * 2 - startPos) * velocity

      newEnd += (canvasWidth - endPos) * velocity
    } else {
      newStart += (target - selectorWidth - startPos) * velocity

      newEnd += (target + selectorWidth - endPos) * velocity
    }
  }

  startSlider.style.left = newStart + 'px'
  endSlider.style.left = newEnd + 'px'

  centerSlider.style.left = startSlider.style.left
  centerSlider.style.right = canvasWidth - newEnd + 'px'

  zoom.start = scaledPos(newStart)
  zoom.end = scaledPos(newEnd)

  drawInterval()

  requestAnimationFrame(anime)
}

document.addEventListener('mousedown', event => {
  if (event.target === startSlider || event.target === endSlider || event.target === centerSlider) {
    dragged = event.target

    stopAnime = false
    anime()
  }
})

document.addEventListener('mouseup', event => {
  dragged = null
  stopAnime = true
})

generateData(500, 0, 1500)

// ;(function () {
//   const pi = Math.PI * 2 / 1000

//   let x = 0

//   for (let i = 0; i < 1000; i++) {
//     x += pi

// const data = [Math.sin(x), x, Math.cos(x)]

//     globalData.push([x, Math.cos(x)])
//   }
// })()

drawMap()

// drawSlider(zoom.start)
// drawSlider(zoom.end)

drawInterval()
// anime()
