const perspectiveAttrs = {
  fov: 45,
  near: 0.1,
  far: 500,
  initialPosition: {
    x: 0,
    y: 0,
    z: 1,
  },
};

const lightAttrs = {
  color: 0xffffff,
  intensity: 2.4,
  initialPosition: {
    x: 150,
    y: 0,
    z: -350,
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

const rocketAttrs = {
  src: "./../../models/rocket-astro/scene.gltf",
  scale: 0.05,
  initialPosition: {
    x: 0,
    y: 1,
    z: 490,
  },
};

const planetsAttrs = {
  mercury: {
    src: "./../../models/mercury/scene.gltf",
    scale: 0.001,
    initialPosition: {
      x: 0,
      y: 1,
      z: 0,
    },
  },
};
