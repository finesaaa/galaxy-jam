const perspectiveAttrs = {
  fov: 50,
  near: 0.1,
  far: 5000,
  initailPosition: {
    x: 0,
    y: 20,
    z: 0,
  },
  followRocket: {
    enabled: true,
    subtraction: 0.0025,
    additionalY: 0.5,
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
  },
  speed: 100,
};

const pathLineAttrs = {
  divisions: 70,
  color: 0xffffaa,
  pathPoints: [
    [-8, 0.1, 12],
    [-9, 0.2, 7],
    [-9.5, 0.3, 3.4],
    [-18, 0.3, -2],
    [-19.5, 0.3, -3],
    [-24, 0.2, -8],
    [-21, 0.1, -13],
    [-18, 0.02, -18],
    [-8, 0, -23],
    [-2, 0, -20],
    [4, -0.02, -17],
    [9, -0.05, -13],
    [13, -0.1, -8],
    [17, -0.15, -3],
    [24, -0.2, 8],
    [12, -0.1, 17],
    [4, 0, 23],
    [-7, 0.02, 18],
  ],
  isDrawLines: true,
};

const rocketAttrs = {
  src: "./../../assets/models/rocket-astro/scene.gltf",
  scale: 0.001,
  initailPosition: {
    x: 0,
    y: 0,
    z: 0,
  },
  path: {
    num: 5,
    scale: 1.5,
    scaleAddition: 0.003,
  },
  movement: {
    speed: 0,
    delta: 0.2,
  },
};

const planetBaseScale = 1;
const planetsAttrs = {
  mercury: {
    name: "mercury",
    src: "./../../assets/models/mercury/scene.gltf",
    scale: planetBaseScale * (1 / 277),
    pathScale: 2.5,
    pathFraction: 0.1,
    speed: 0.0002,
  },
  venus: {
    name: "venus",
    src: "./../../assets/models/venus/scene.gltf",
    scale: planetBaseScale * (1 / 113),
    pathScale: 3,
    pathFraction: 0.2,
    speed: 0.0002,
  },
  earth: {
    name: "earth",
    src: "./../../assets/models/earth/scene.gltf",
    scale: planetBaseScale * (1 / 108),
    pathScale: 3,
    pathFraction: 0.3,
    speed: 0.0002,
  },
  mars: {
    name: "mars",
    src: "./../../assets/models/mars/scene.gltf",
    scale: planetBaseScale * (1 / 208),
    pathScale: 3,
    pathFraction: 0.5,
    speed: 0.0002,
  },
  jupiter: {
    name: "jupiter",
    src: "./../../assets/models/jupiter/scene.gltf",
    scale: planetBaseScale * (1 / 9.7),
    pathScale: 5,
    pathFraction: 0.6,
    speed: 0.0002,
  },
  saturn: {
    name: "saturn",
    src: "./../../assets/models/saturn/scene.gltf",
    scale: planetBaseScale * (1 / 11.4),
    pathScale: 4,
    pathFraction: 0.8,
    speed: 0.0002,
  },
  uranus: {
    name: "uranus",
    src: "./../../assets/models/uranus/scene.gltf",
    scale: planetBaseScale * (1 / 26.8),
    pathScale: 4,
    pathFraction: 0.9,
    speed: 0.0002,
  },
  neptune: {
    name: "neptune",
    src: "./../../assets/models/neptune/scene.gltf",
    scale: planetBaseScale * (1 / 27.7),
    pathScale: 3,
    pathFraction: 0,
    speed: 0.0002,
  },
};
