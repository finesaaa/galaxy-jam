const perspectiveAttrs = {
  fov: 45,
  near: 0.1,
  far: 500,
  initailPosition: {
    x: 0,
    y: 0,
    z: 1.6,
  },
};

const lightAttrs = {
  color: 0xffffff,
  intensity: 2.4,
  initailPosition: {
    x: 2,
    y: 2,
    z: 5,
  },
};

const starAttrs = {
  radius: 0.5,
  widthSegnments: 32,
  heightSegments: 32,
  color: 0xffffff,
  scale: 0.5,
  position: {
    zMin: -2000,
    zMax: 2000,
    zGap: 20,
  }
};

const pathLineAttrs = {
  divisions: 70,
  color: 0xffffaa,
  pathPoints: [
    [-8, 0, 12],
    [-9, 0, 7],
    [-9.5, 0, 3.4],
    [-18, 0, -2],
    [-19.5, 0, -3],
    [-24, 0, -8],
    [-21, 0, -13],
    [-18, 0, -18],
    [-8, 0, -23],
    [-2, 0, -20],
    [4, 0, -17],
    [9, 0, -13],
    [13, 0, -8],
    [17, 0, -3],
    [24, 0, 8],
    [12, 0, 17],
    [4, 0, 23],
    [-7, 0, 18],
  ],
  isDrawLines: true,
};

const rocketAttrs = {
  src: "./../../models/rocket/scene.gltf",
  scale: 0.001,
  initailPosition: {
    x: 0,
    y: 0,
    z: 0,
  },
  pathNum: 5,
  pathScale: 2.5,
  pathScaleAddition: 0.01,
};

const planetsAttrs = {
  mercury: {
    src: "./../../models/mercury/scene.gltf",
    scale: 0.001,
    initailPosition: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
};
