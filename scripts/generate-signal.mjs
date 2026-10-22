import { writeFileSync } from 'node:fs';

const FRAMES = 180;
const color = [0.85, 1, 0.39, 1];
const pale = [0.62, 0.86, 0.70, 1];
const staticValue = (k) => ({ a: 0, k });
const animated = (start, end) => ({
  a: 1,
  k: [
    { t: 0, s: [start], e: [end], i: { x: [1], y: [1] }, o: { x: [0], y: [0] } },
    { t: FRAMES, s: [end] }
  ]
});
const transform = (position = [0, 0, 0], scale = [100, 100, 100], opacity = 100, rotation = staticValue(0)) => ({
  o: staticValue(opacity), r: rotation, p: staticValue(position),
  a: staticValue([0, 0, 0]), s: staticValue(scale)
});
const groupTransform = () => ({
  ty: 'tr', p: staticValue([0, 0]), a: staticValue([0, 0]),
  s: staticValue([100, 100]), r: staticValue(0), o: staticValue(100),
  sk: staticValue(0), sa: staticValue(0)
});
const ellipse = (diameter, position = [0, 0]) => ({
  d: 1, ty: 'el', s: staticValue([diameter, diameter]), p: staticValue(position), nm: 'Ellipse'
});
const stroke = (paint, width, opacity) => ({
  ty: 'st', c: staticValue(paint), o: staticValue(opacity),
  w: staticValue(width), lc: 2, lj: 2, ml: 4, nm: 'Stroke'
});
const fill = (paint, opacity) => ({ ty: 'fl', c: staticValue(paint), o: staticValue(opacity), r: 1, nm: 'Fill' });
const layer = (name, index, shapes, options = {}) => ({
  ddd: 0, ind: index, ty: 4, nm: name, sr: 1,
  ks: transform([350, 350, 0], options.scale || [100, 100, 100], options.opacity ?? 100, options.rotation || staticValue(0)),
  ao: 0, shapes: [{ ty: 'gr', it: [...shapes, groupTransform()], nm: name }],
  ip: 0, op: FRAMES, st: 0, bm: 0
});

const layers = [
  layer('outer signal ring', 1, [ellipse(555), stroke(pale, 1.2, 45)]),
  layer('middle signal ring', 2, [ellipse(415), stroke(color, 1, 38)]),
  layer('inner signal ring', 3, [ellipse(286), stroke(pale, 1, 25)]),
  layer('orbiting point one', 4, [ellipse(11, [277, 0]), fill(color, 100)], { rotation: animated(0, 360) }),
  layer('orbiting point two', 5, [ellipse(7, [0, -207]), fill(pale, 100)], { rotation: animated(360, 0) }),
  layer('orbiting point three', 6, [ellipse(6, [-143, 0]), fill(color, 90)], { rotation: animated(0, -360) })
];
const data = { v: '5.12.2', fr: 30, ip: 0, op: FRAMES, w: 700, h: 700, nm: 'Karan RJ signal', ddd: 0, assets: [], layers, markers: [] };
writeFileSync(new URL('../public/animations/signal.json', import.meta.url), JSON.stringify(data));
