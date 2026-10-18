import * as THREE from 'three'

/**
 * Procedural Dotted Continents Texture Generator
 * Recreates the exact glowing particle/dotted aesthetic from the user's reference image:
 * - Deep space dark navy ocean body
 * - Luminous white/cyan dotted matrix outlining continents & landmasses
 * - Bright city nodes & glowing coastline accents
 * - Latitude/Longitude orbital coordinate grid lines
 */
export function createDottedEarthTexture(): THREE.CanvasTexture {
  const width = 2048
  const height = 1024
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // 1. Deep Midnight Ocean Base
  const bgGrad = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.2,
    width / 2, height / 2, width * 0.7
  )
  bgGrad.addColorStop(0, '#030a16')
  bgGrad.addColorStop(0.6, '#020611')
  bgGrad.addColorStop(1, '#010309')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // 2. Latitude & Longitude Coordinate Grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)'
  ctx.lineWidth = 1

  // Parallels (Latitude lines every 15 degrees)
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * height
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Meridians (Longitude lines every 15 degrees)
  for (let lon = -180; lon <= 180; lon += 15) {
    const x = ((lon + 180) / 360) * width
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Equator & Prime Meridian highlighted
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(width / 2, 0)
  ctx.lineTo(width / 2, height)
  ctx.stroke()

  // 3. Define Continent Polygons in (lon, lat)
  const toCanvas = (lon: number, lat: number): [number, number] => {
    const x = ((lon + 180) / 360) * width
    const y = ((90 - lat) / 180) * height
    return [x, y]
  }

  const continents: [number, number][][] = [
    // Africa
    [
      [-5, 36], [10, 37], [25, 32], [32, 31], [34, 28], [37, 22], [43, 12], [51, 11],
      [49, 9], [42, 1], [40, -4], [40, -11], [35, -20], [32, -28], [28, -33], [19, -35],
      [18, -34], [15, -28], [12, -18], [9, -5], [9, 4], [3, 6], [-5, 5], [-12, 7],
      [-17, 12], [-17, 15], [-16, 21], [-13, 28], [-9, 32], [-5, 36]
    ],
    // Europe
    [
      [-9, 36], [-9, 43], [-1, 43], [-4, 48], [-1, 50], [5, 53], [8, 55], [10, 58],
      [5, 62], [15, 69], [28, 71], [32, 65], [40, 67], [50, 68], [60, 60], [50, 50],
      [40, 45], [30, 46], [28, 41], [24, 38], [20, 40], [15, 41], [15, 38], [12, 37],
      [8, 44], [3, 42], [-3, 37], [-9, 36]
    ],
    // British Isles
    [
      [-5, 50], [-1, 51], [1, 52], [0, 58], [-3, 58], [-6, 56], [-4, 53], [-5, 50]
    ],
    // Scandinavia
    [
      [5, 58], [10, 60], [18, 60], [24, 65], [20, 69], [12, 65], [5, 62], [5, 58]
    ],
    // Asia & Russia
    [
      [35, 32], [45, 40], [50, 38], [60, 42], [60, 60], [70, 72], [105, 77], [130, 72],
      [160, 70], [175, 66], [165, 60], [155, 55], [140, 50], [130, 42], [120, 38],
      [122, 30], [118, 22], [108, 18], [105, 10], [100, 5], [103, 1], [98, 8],
      [92, 16], [88, 22], [80, 16], [78, 8], [75, 14], [70, 22], [68, 25], [60, 25],
      [55, 27], [50, 25], [45, 13], [35, 28], [35, 32]
    ],
    // Arabian Peninsula
    [
      [35, 28], [40, 22], [45, 13], [54, 17], [60, 22], [56, 26], [50, 28], [40, 32], [35, 28]
    ],
    // India & Sri Lanka
    [
      [68, 25], [75, 14], [78, 8], [80, 16], [88, 22], [88, 27], [78, 30], [70, 28], [68, 25]
    ],
    // Japan
    [
      [130, 32], [135, 35], [140, 36], [142, 42], [145, 44], [141, 45], [138, 38], [130, 32]
    ],
    // Southeast Asia & Indonesia
    [
      [95, 5], [105, 5], [115, -4], [125, -8], [135, -4], [140, -2], [130, 1], [115, 2],
      [105, 10], [95, 5]
    ],
    // Australia
    [
      [114, -22], [120, -14], [135, -12], [142, -11], [146, -17], [153, -28], [150, -37],
      [140, -38], [130, -32], [115, -34], [114, -26], [114, -22]
    ],
    // North America
    [
      [-165, 65], [-160, 71], [-140, 70], [-125, 70], [-95, 70], [-80, 60], [-65, 60],
      [-55, 52], [-65, 44], [-75, 35], [-80, 25], [-82, 23], [-90, 29], [-97, 26],
      [-97, 20], [-88, 16], [-83, 9], [-78, 8], [-85, 12], [-95, 16], [-105, 20],
      [-110, 24], [-117, 32], [-124, 40], [-125, 48], [-135, 57], [-150, 60], [-165, 65]
    ],
    // Greenland
    [
      [-50, 60], [-40, 65], [-25, 75], [-35, 82], [-55, 82], [-60, 75], [-50, 60]
    ],
    // South America
    [
      [-75, 11], [-62, 10], [-50, 2], [-35, -5], [-37, -12], [-40, -22], [-48, -28],
      [-55, -35], [-65, -40], [-68, -54], [-75, -50], [-73, -40], [-71, -30], [-76, -14],
      [-80, -4], [-77, 2], [-75, 11]
    ]
  ]

  // Create combined continent path
  const path2d = new Path2D()
  for (const poly of continents) {
    if (poly.length < 2) continue
    const [startX, startY] = toCanvas(poly[0][0], poly[0][1])
    path2d.moveTo(startX, startY)
    for (let i = 1; i < poly.length; i++) {
      const [px, py] = toCanvas(poly[i][0], poly[i][1])
      path2d.lineTo(px, py)
    }
    path2d.closePath()
  }

  // 4. Fill Continents with Luminous Dotted Particle Grid
  // Step spacing: ~7 pixels on canvas (creates high density dots)
  const dotStep = 7

  for (let y = 40; y < height - 40; y += dotStep) {
    // Compress longitude spacing near poles for spherical uniformity
    const latNormalized = Math.abs((height / 2 - y) / (height / 2))
    const xStep = Math.max(dotStep, Math.round(dotStep / Math.cos(latNormalized * 1.1)))

    for (let x = 0; x < width; x += xStep) {
      if (ctx.isPointInPath(path2d, x, y)) {
        // Draw primary glowing dot
        const dotRadius = Math.random() > 0.85 ? 1.8 : 1.3
        const alpha = Math.random() > 0.8 ? 0.95 : 0.75

        ctx.fillStyle = `rgba(224, 242, 254, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
        ctx.fill()

        // Subtle cyan bloom around dot
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'
        ctx.beginPath()
        ctx.arc(x, y, dotRadius * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // 5. Outline Coastlines with Extra Bright Accent Dots
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)'
  ctx.lineWidth = 1.2
  ctx.setLineDash([2, 5])
  ctx.stroke(path2d)
  ctx.setLineDash([])

  // 6. Major Global City Constellations (Dense glowing hubs like the screenshot)
  const majorCities: [number, number, number][] = [
    // Europe
    [0, 51, 6], [2, 48, 6], [13, 52, 5], [12, 41, 5], [-3, 40, 5], [37, 55, 6],
    // North America
    [-74, 40, 7], [-87, 41, 5], [-118, 34, 6], [-122, 37, 5], [-80, 25, 5], [-79, 43, 5],
    // Asia
    [139, 35, 7], [121, 31, 7], [116, 39, 6], [126, 37, 6], [77, 28, 7], [72, 19, 7],
    [103, 1, 5], [100, 13, 5],
    // Middle East
    [55, 25, 6], [31, 30, 6], [44, 33, 5],
    // Africa
    [3, 6, 5], [18, -34, 5], [28, -26, 5], [36, -1, 5],
    // South America
    [-43, -22, 6], [-46, -23, 7], [-58, -34, 6], [-70, -33, 5], [-74, 4, 5],
    // Australia
    [151, -33, 6], [144, -37, 5], [115, -31, 4],
  ]

  for (const [lon, lat, size] of majorCities) {
    const [cx, cy] = toCanvas(lon, lat)
    const rad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 2.5)
    rad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    rad.addColorStop(0.3, 'rgba(125, 211, 252, 0.8)')
    rad.addColorStop(1, 'rgba(56, 189, 248, 0)')
    ctx.fillStyle = rad
    ctx.beginPath()
    ctx.arc(cx, cy, size * 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}
