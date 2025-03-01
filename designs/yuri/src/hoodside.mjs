import { back } from './back.mjs'
import { front } from './front.mjs'

function yuriHoodSide({
  store,
  sa,
  Point,
  points,
  Path,
  paths,
  Snippet,
  snippets,
  measurements,
  macro,
  part,
}) {
  const neckOpening = store.get('frontNeckSeamLength') + store.get('backNeckSeamLength')
  const hoodOpening = measurements.head
  const neckCutoutDelta = store.get('neckCutoutFront') - store.get('neckCutoutBack')
  store.set('hoodCenterWidth', measurements.head / 10)
  const halfCenterPanel = store.get('hoodCenterWidth') / 2
  points.topLeft = new Point(0, 0)
  points.topRight = new Point(neckOpening, 0)
  points.neckRight = new Point(neckOpening, (hoodOpening - halfCenterPanel) / 2)
  points.neckLeft = new Point(0, points.neckRight.y)
  points.frontLeft = points.neckLeft.shift(-90, neckCutoutDelta)
  points.frontEdge = points.neckRight.shift(-90, neckCutoutDelta)
  points.neckEdge = points.neckLeft.shift(0, halfCenterPanel)
  points.neckEdgeCp2 = new Point(points.neckRight.x / 2, points.neckEdge.y)
  points.frontEdgeCp1 = new Point(points.neckEdgeCp2.x, points.frontEdge.y)
  points.shoulderNotch = new Path()
    .move(points.neckEdge)
    .curve(points.neckEdgeCp2, points.frontEdgeCp1, points.frontEdge)
    .shiftAlong(store.get('backNeckSeamLength') - halfCenterPanel)
  points.hoodTop = new Point(points.shoulderNotch.x, points.topLeft.y)
  points.hoodTopCp2 = points.hoodTop.shift(180, points.neckEdge.y * 0.7)
  points.hoodRim = new Point(points.frontEdge.x, points.neckRight.y * 0.2)
  points.hoodTopCp1 = points.hoodTop.shift(0, points.hoodTop.dx(points.hoodRim) / 2)
  points.frontEdgeCp2 = points.frontEdge.shift(90, halfCenterPanel)
  points._tmp1 = new Path()
    .move(points.hoodRim)
    .curve(points.hoodRim, points.hoodTopCp1, points.hoodTop)
    .shiftAlong(2)
    .rotate(90, points.hoodRim)
  points.hoodRimCp = points.hoodRim.shiftTowards(points._tmp1, points.neckRight.y / 3)
  points.neckRoll = points.neckRight.shift(180, halfCenterPanel)
  points._tmp2 = new Path()
    .move(points.neckRoll)
    .curve(points.neckRoll, points.hoodRimCp, points.hoodRim)
    .shiftAlong(2)
  points.neckRollCp2 = points.neckRoll.shiftTowards(points._tmp2, halfCenterPanel)
  points.neckRollCp1 = points.neckRollCp2.rotate(180, points.neckRoll)

  paths.seam = new Path()
    .move(points.frontEdge)
    .curve(points.frontEdgeCp2, points.neckRollCp1, points.neckRoll)
    .curve(points.neckRollCp2, points.hoodRimCp, points.hoodRim)
    .curve(points.hoodRim, points.hoodTopCp1, points.hoodTop)
    .curve(points.hoodTopCp2, points.neckEdge, points.neckEdge)
    .curve(points.neckEdgeCp2, points.frontEdgeCp1, points.frontEdge)
    .close()
    .attr('class', 'fabric')

  // Store length of center seam
  store.set(
    'hoodCenterLength',
    new Path()
      .move(points.hoodRim)
      .curve(points.hoodRim, points.hoodTopCp1, points.hoodTop)
      .curve(points.hoodTopCp2, points.neckEdge, points.neckEdge)
      .length()
  )

  if (sa)
    paths.sa = paths.seam
      .reverse() // Reversing this curve sidesteps a bezierjs edge case
      .offset(sa * -1)
      .addClass('fabric sa')

  /*
   * Annotations
   */
  // Cutlist
  store.cutlist.setCut({ cut: 4, from: 'fabric' })

  // TItle
  points.title = points.hoodTop.shift(-90, 50)
  macro('title', { at: points.title, nr: 5, title: 'hoodSide' })

  // Logo
  points.logo = points.title.shift(-90, 60)
  snippets.logo = new Snippet('logo', points.logo)

  // Grainline
  macro('grainline', {
    from: points.shoulderNotch,
    to: points.hoodTop,
  })

  // Dimensions
  const neckSeam = new Path()
    .move(points.neckEdge)
    .curve(points.neckEdgeCp2, points.frontEdgeCp1, points.frontEdge)
    .split(points.shoulderNotch)
  const centralSeam = new Path()
    .move(points.hoodRim)
    .curve(points.hoodRim, points.hoodTopCp1, points.hoodTop)
    .curve(points.hoodTopCp2, points.neckEdge, points.neckEdge)
    .reverse()
  const openingSeam = new Path()
    .move(points.neckRoll)
    .curve(points.neckRollCp2, points.hoodRimCp, points.hoodRim)
  macro('pd', {
    id: 'lNeckBackToNotch',
    path: neckSeam[0],
    d: sa + 15,
  })
  macro('pd', {
    id: 'lNotchToNeckFront',
    path: neckSeam[1],
    d: sa + 15,
  })
  macro('pd', {
    id: 'lCentralSeam',
    path: centralSeam,
    d: sa * -1 - 15,
  })
  macro('hd', {
    id: 'wAtNeck',
    from: points.neckEdge,
    to: points.frontEdge,
    y: points.frontEdge.y + sa + 30,
  })
  macro('hd', {
    id: 'wFull',
    from: centralSeam.edge('left'),
    to: points.frontEdge,
    y: points.frontEdge.y + sa + 45,
  })
  const openingEdge = openingSeam.edge('left')
  macro('hd', {
    id: 'wOpeningDepth',
    from: openingEdge,
    to: points.frontEdge,
    y: openingEdge.y,
  })
  macro('vd', {
    id: 'hToOpeningTop',
    from: points.frontEdge,
    to: points.hoodRim,
    x: points.hoodRim.x + sa + 15,
  })
  macro('vd', {
    id: 'hFull',
    from: points.frontEdge,
    to: points.hoodTop,
    x: points.hoodRim.x + sa + 30,
  })

  return part
}

export const hoodSide = {
  name: 'yuri.hoodSide',
  after: [front, back],
  measurements: ['head'],
  draft: yuriHoodSide,
}
