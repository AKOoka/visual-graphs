const mainGraph = document.getElementById('main-graph')
const mapGraph = document.getElementById('map-graph')

const ctx = mainGraph.getContext('2d')
const ctxMap = mapGraph.getContext('2d')

const canvasWidth = 500
const canvasHeight = 250

const mapHeight = 100

const mapWrapper = document.getElementById('map-wrapper')
const startSlider = document.getElementById('start-slider')
const centerSlider = document.getElementById('center-slider')
const endSlider = document.getElementById('end-slider')

const lineWidth = 5

const velocity = 0.15

const globalData = []
const globalSize = {
  width: 0,
  height: 0,
  minHeight: null
}

const zoom = {
  start: {
    position: null,
    index: null
  },
  end: {
    position: null,
    index: null
  }
}

const interval = {
  width: 0,
  height: 0,
  minHeight: 0,
  maxHeight: 0
}

let target = 0
let stopAnime = true
let dragged = null

function scaledPos (pos) {
  return (globalSize.width / canvasWidth) * pos
}

function generateData (count, minimum, maximum) {
  console.time('generate')

  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  for (let i = 0; i <= count; i++) {
    globalData.push([i, random(minimum, maximum)])
  }

  console.timeEnd('generate')
}

function findHeight (start, end) {
  interval.minHeight = globalData[start][1]
  interval.maxHeight = globalData[start][1]

  for (let i = start + 1; i <= end; i++) {
    const y = globalData[i][1]

    if (y > interval.maxHeight) {
      interval.maxHeight = y
    }

    if (y < interval.minHeight) {
      interval.minHeight = y
    }
  }
}

function getIndexs () {
  const { start, end } = zoom

  let i = 0
  let x = globalData[i][0]

  for (i; i < globalData.length; i++) {
    x = globalData[i][0]

    if (x === start.position) {
      start.index = i

      break
    } else if (x > start.position) {
      start.index = i - 1

      break
    }
  }

  for (i; i < globalData.length; i++) {
    x = globalData[i][0]

    if (x >= end.position) {
      end.index = i

      break
    }
  }
}

function transformPoint (point, start, inter, canvasH) {
  const value = []

  value.push((point[0] - start) / inter.width * canvasWidth)
  value.push(canvasH - lineWidth / 2 - (((point[1] - inter.minHeight) / inter.height) * (1 - lineWidth / 2 / inter.height)) * canvasH)

  return value
}

function drawMap () {
  ctxMap.beginPath()
  ctxMap.strokeStyle = '#88ed2a'
  ctxMap.lineWidth = 1

  ctxMap.moveTo(...transformPoint(globalData[0], 0, interval, mapHeight))

  for (let i = 1; i < globalData.length; i++) {
    ctxMap.lineTo(...transformPoint(globalData[i], 0, globalSize, mapHeight))
  }

  ctxMap.stroke()
}
// щас будем разбираться что такое Lua
function drawInterval () {
  const { start, end } = zoom

  getIndexs()

  findHeight(start.index, end.index)

  interval.width = end.position - start.position
  interval.height = interval.maxHeight - interval.minHeight

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.beginPath()

  ctx.strokeStyle = '#88ed2a'
  ctx.lineWidth = lineWidth

  ctx.moveTo(...transformPoint(globalData[start.index], zoom.start, interval, canvasHeight))
  // console.log(globalData.length)
  // console.log(end.index)

  for (let i = start.index + 1; i <= end.index; i++) {
    ctx.lineTo(...transformPoint(globalData[i], start.position, interval, canvasHeight))
  }

  ctx.stroke()
}

function dragTarget (event) {
  if (event.target === startSlider || event.target === endSlider || event.target === centerSlider) {
    dragged = event.target

    stopAnime = false
    anime()
  }
}

function dropTarget () {
  dragged = null
  stopAnime = true
}

function mousePosition (event) {
  const startPosition = parseInt(startSlider.style.left)
  const endPosition = parseInt(endSlider.style.left)

  target = event.clientX - mapWrapper.offsetLeft

  if (dragged === startSlider && target > endPosition) {
    target = endPosition
  } else if (dragged === endSlider && target < startPosition) {
    target = startPosition + 5 // 5 === width of startSlider && endSlider
  } else if (target < mapGraph.offsetLeft) {
    target = 0
  } else if (target > mapGraph.offsetLeft + mapGraph.width) {
    target = mapGraph.offsetLeft + mapGraph.width
  }
}

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

  zoom.start.position = scaledPos(newStart)
  zoom.end.position = scaledPos(newEnd)

  drawInterval()

  requestAnimationFrame(anime)
}

function init () {
  const { start, end } = zoom

  start.position = globalData[0][0]
  start.index = 0

  end.position = globalData[globalData.length - 1][0]
  end.index = globalData.length - 1

  mainGraph.width = canvasWidth
  mainGraph.height = canvasHeight

  mapGraph.width = canvasWidth
  mapGraph.height = mapHeight

  globalSize.height = 0
  globalSize.minHeight = globalData[0][1]
  globalSize.width = globalData[globalData.length - 1][0] - globalData[0][0]

  for (const data of globalData) {
    if (data[1] > globalSize.height) {
      globalSize.height = data[1]
    }

    if (data[1] < globalSize.minHeight) {
      globalSize.minHeight = data[1]
    }
  }

  startSlider.style.left = '0px'
  endSlider.style.left = canvasWidth + 'px'

  centerSlider.style.left = '0px'
  centerSlider.style.right = '0px'

  document.addEventListener('mousedown', dragTarget)
  document.addEventListener('mousemove', mousePosition)
  document.addEventListener('mouseup', dropTarget)
}

generateData(100, 0, 1500)

// ;(function () {
//   const pi = Math.PI * 2 / 1000

//   let x = 0

//   for (let i = 0; i < 1000; i++) {
//     x += pi

// const data = [Math.sin(x), x, Math.cos(x)]

//     globalData.push([x, Math.cos(x)])
//   }
// })()

init()

drawMap()

drawInterval()
