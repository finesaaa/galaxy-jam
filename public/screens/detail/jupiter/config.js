const perspectiveAttrs = {
  fov: 50,
  near: 0.1,
  far: 5000,
  initailPosition: {
    x: 0,
    y: 0,
    z: 0,
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

const objectsAttrs = {
  rocketAttrs: {
    name: "rocket",
    src: "./../../../assets/models/rocket-astro/scene.gltf",
    scale: 0.001,
    initailPosition: {
      x: 0,
      y: 0,
      z: -0.5,
    },
    initailRotation: {
      x: Math.PI / 4,
      y: Math.PI / 4,
      z: Math.PI / 4,
    },
  },
  mercuryAttrs: {
    name: "mercury",
    src: "./../../../assets/models/jupiter/scene.gltf",
    scale: 0.0004,
    initailPosition: {
      x: 0,
      y: 0,
      z: -2,
    },
    rotationSpeed: Math.PI / 1000,
  },
};
