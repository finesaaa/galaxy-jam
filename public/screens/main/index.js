import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

var scene;
var renderer;
var clock;
var loader;

var camera;
var cameraIndex = 0;

var paths = [];

var rocket;
var rocketIndex = 0;
var rocketFraction = 0;
var rocketDir = new THREE.Vector3(0, 0, -1);
var rocketAxis = new THREE.Vector3();

var rocketMovement = 0;
var dRocketMovement = rocketAttrs.movement.delta;
var isRocketMove = false;
var rocketIndexBefore = 0;

var planetsModel = {};
var planetsPath = {};
var planetsFraction = {};

var stars = [];

var mixers = [];

var pointModel;
var pointCounter = gameAttrs.pointFraction;

var asteroidsModel = [];
var asteroidCounter = gameAttrs.pointFraction * gameAttrs.asteroidMux;

function onKeydown(event) {
  if (event.keyCode == 65 || event.keyCode == 97) {
    // A atau a
    if (rocketIndex - 1 >= 0 && !isRocketMove) {
      rocketIndexBefore = rocketIndex;
      isRocketMove = true;
      rocketIndex -= 1;
    }
  } else if (event.keyCode == 68 || event.keyCode == 100) {
    // D atau d
    if (rocketIndex + 1 < paths.length && !isRocketMove) {
      rocketIndexBefore = rocketIndex;
      isRocketMove = true;
      rocketIndex += 1;
    }
  } else if (event.keyCode == 87 || event.keyCode == 119) {
    // W atau w
  } else if (event.keyCode == 83 || event.keyCode == 115) {
    // S atau s
  }
}
document.addEventListener("keydown", onKeydown, false);

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize, false);

function getRandom(max) {
  return Math.random() * max;
}

function getRandomInt(max) {
  return Math.floor(getRandom(max));
}

function interpolate(a, b, t) {
  return a + (b - a) * t;
}

function ease(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function createPath(scale) {
  var path = new THREE.CurvePath();
  var pathPoints = pathLineAttrs.pathPoints;

  for (var i = 0; i < pathPoints.length; i += 3) {
    let bezierPoints = [];
    for (var j = i; j < i + 3; j++) {
      bezierPoints.push(
        new THREE.Vector3(
          pathPoints[j][0] * scale,
          pathPoints[j][1] * scale,
          pathPoints[j][2] * scale
        )
      );
    }

    if (i + 3 == pathPoints.length) {
      bezierPoints.push(
        new THREE.Vector3(
          pathPoints[0][0] * scale,
          pathPoints[0][1] * scale,
          pathPoints[0][2] * scale
        )
      );
    } else {
      bezierPoints.push(
        new THREE.Vector3(
          pathPoints[j][0] * scale,
          pathPoints[j][1] * scale,
          pathPoints[j][2] * scale
        )
      );
    }

    let bezier = new THREE.CubicBezierCurve3(
      bezierPoints[0].multiplyScalar(scale),
      bezierPoints[1].multiplyScalar(scale),
      bezierPoints[2].multiplyScalar(scale),
      bezierPoints[3].multiplyScalar(scale)
    );
    path.add(bezier);
  }

  return path;
}

function addPath(scale, isDrawLine = pathLineAttrs.isDrawLines) {
  var path = createPath(scale);

  if (isDrawLine) {
    const points = path.getPoints(pathLineAttrs.divisions);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: pathLineAttrs.color })
    );

    scene.add(line);
  }

  paths.push(path);
}

function addStar(zPosition, scale = starAttrs.scale) {
  var geometry = new THREE.SphereGeometry(
    starAttrs.radius,
    starAttrs.widthSegnments,
    starAttrs.heightSegments
  );
  var material = new THREE.MeshBasicMaterial({
    color: starAttrs.color,
  });
  var sphere = new THREE.Mesh(geometry, material);

  sphere.scale.x = sphere.scale.y = scale;
  sphere.position.x =
    getRandom(starAttrs.position.zMax) - starAttrs.position.zMax / 2;
  sphere.position.y =
    getRandom(starAttrs.position.zMax) - starAttrs.position.zMax / 2;
  sphere.position.z = zPosition;

  scene.add(sphere);

  stars.push(sphere);
}

function loadModels() {
  loader.load(rocketAttrs.src, function (gltf) {
    const model = gltf.scene;
    model.scale.set(rocketAttrs.scale, rocketAttrs.scale, rocketAttrs.scale);
    model.position.set(
      rocketAttrs.initailPosition.x,
      rocketAttrs.initailPosition.y,
      rocketAttrs.initailPosition.z
    );

    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });

    let mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();
    mixers.push(mixer);

    rocket = model;

    scene.add(rocket);
  });

  for (var key in planetsAttrs) {
    let planetAttrs = planetsAttrs[key];

    loader.load(planetAttrs.src, function (gltf) {
      const model = gltf.scene;
      model.scale.set(planetAttrs.scale, planetAttrs.scale, planetAttrs.scale);

      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });

      let modelPath = createPath(planetAttrs.pathScale);
      let modelPosition = modelPath.getPoint(planetAttrs.pathFraction);
      model.position.set(modelPosition.x, modelPosition.y, modelPosition.z);

      let mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();
      mixers.push(mixer);

      planetsModel[planetAttrs.name] = model;
      planetsPath[planetAttrs.name] = modelPath;
      planetsFraction[planetAttrs.name] = planetAttrs.pathFraction;

      scene.add(model);
    });
  }

  loader.load(pointAttrs.src, function (gltf) {
    const model = gltf.scene;
    model.scale.set(pointAttrs.scale, pointAttrs.scale, pointAttrs.scale);

    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });

    pointModel = model;
  });

  asteroidsAttrs.forEach(function (asteroid) {
    loader.load(asteroid.src, function (gltf) {
      const model = gltf.scene;
      model.scale.set(asteroid.scale, asteroid.scale, asteroid.scale);

      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });

      asteroidsModel.push(model);
    });
  });
}

function inializeObjects() {
  var middlePathIndex = Math.floor(rocketAttrs.path.num / 2);
  for (var i = 0; i < rocketAttrs.path.num; i++) {
    var additionalScale =
      (middlePathIndex - i) * rocketAttrs.path.scaleAddition;
    addPath(rocketAttrs.path.scale + additionalScale);
  }

  rocketIndex = Math.floor(paths.length / 2);
  rocketIndexBefore = rocketIndex;
  cameraIndex = rocketIndex;

  for (
    var z = starAttrs.position.zMin;
    z < starAttrs.position.zMax;
    z += starAttrs.position.zGap
  ) {
    addStar(z);
  }
}

function initializeWorld() {
  camera = new THREE.PerspectiveCamera(
    perspectiveAttrs.fov,
    window.innerWidth / window.innerHeight,
    perspectiveAttrs.near,
    perspectiveAttrs.far
  );
  camera.position.x = perspectiveAttrs.initailPosition.x;
  camera.position.y = perspectiveAttrs.initailPosition.y;
  camera.position.z = perspectiveAttrs.initailPosition.z;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  loader = new GLTFLoader();

  const light = new THREE.PointLight(lightAttrs.color, lightAttrs.intensity);
  light.position.set(
    lightAttrs.initailPosition.x,
    lightAttrs.initailPosition.y,
    lightAttrs.initailPosition.z
  );
  scene.add(light);

  loadModels();

  inializeObjects();
}

function updateRocket() {
  const nextPosition = paths[rocketIndex].getPoint(rocketFraction);
  const tangent = paths[rocketIndex].getTangent(rocketFraction);

  var newX = nextPosition.x;
  var newY = nextPosition.y;
  var newZ = nextPosition.z;

  if (isRocketMove) {
    rocketMovement += dRocketMovement;
    if (rocketMovement >= 1) {
      rocketMovement = 0;
      isRocketMove = false;
      rocketIndexBefore = rocketIndex;
    }

    const currentPosition = paths[rocketIndexBefore].getPoint(rocketFraction);
    newX = interpolate(currentPosition.x, nextPosition.x, ease(rocketMovement));
    newY = interpolate(currentPosition.y, nextPosition.y, ease(rocketMovement));
    newZ = interpolate(currentPosition.z, nextPosition.z, ease(rocketMovement));
  }
  const newPosition = new THREE.Vector3(newX, newY, newZ);

  rocket.position.copy(newPosition);

  rocketAxis.crossVectors(rocketDir, tangent).normalize();
  const radians = Math.acos(rocketDir.dot(tangent));
  rocket.quaternion.setFromAxisAngle(rocketAxis, radians);

  var cameraFranction =
    rocketFraction - perspectiveAttrs.followRocket.subtraction;
  if (cameraFranction < 0) {
    cameraFranction += 1;
  }

  camera.lookAt(
    new THREE.Vector3(
      newPosition.x,
      newPosition.y + perspectiveAttrs.followRocket.additionalY * 0.5,
      newPosition.z
    )
  );
  if (perspectiveAttrs.followRocket.enabled) {
    const newCameraPosition = paths[cameraIndex].getPoint(cameraFranction);
    camera.position.copy(newCameraPosition);
    camera.position.y += perspectiveAttrs.followRocket.additionalY;
  }

  rocketFraction += rocketAttrs.movement.speed;
  if (rocketFraction > 1) {
    rocketFraction = 0;
  }

  for (var key in planetsModel) {
    const newPlanetPosition = planetsPath[key].getPoint(planetsFraction[key]);
    planetsModel[key].position.copy(newPlanetPosition);

    planetsFraction[key] += planetsAttrs[key].speed;
    if (planetsFraction[key] > 1) {
      planetsFraction[key] = 0;
    }
  }
}

function updateObstacle() {
  pointCounter -= rocketAttrs.movement.speed;
  asteroidCounter -= rocketAttrs.movement.speed;

  if (pointCounter <= 0) {
    pointCounter = gameAttrs.pointFraction;

    let fraction = rocketFraction + gameAttrs.additionalPointFraction;
    if (fraction >= 1.0) {
      fraction -= 1.0;
    }

    let index = getRandomInt(paths.length);
    let position = paths[index].getPoint(fraction);

    pointModel.position.set(position.x, position.y, position.z);
    scene.add(pointModel);
  }

  if (asteroidCounter <= 0) {
    asteroidCounter = gameAttrs.pointFraction * gameAttrs.asteroidMux;

    let fraction = rocketFraction + gameAttrs.additionalPointFraction;
    if (fraction >= 1.0) {
      fraction -= 1.0;
    }

    let index = getRandomInt(paths.length);
    let position = paths[index].getPoint(fraction);
    let asteroidIndex = getRandomInt(asteroidsModel.length);

    asteroidsModel[asteroidIndex].position.set(
      position.x,
      position.y,
      position.z
    );
    scene.add(asteroidsModel[asteroidIndex]);
  }
}

function updateObjects() {
  for (var i = 0; i < stars.length; i++) {
    var star = stars[i];

    star.position.z += i / starAttrs.speed;

    if (star.position.z > starAttrs.position.zMax) {
      star.position.z -= starAttrs.position.zMax * 2;
    }
  }

  var deltaSec = clock.getDelta();
  mixers.forEach(function (mixer) {
    mixer.update(deltaSec);
  });

  if (rocket !== undefined) {
    updateRocket();
  }

  updateObstacle();
}

function render() {
  updateObjects();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

initializeWorld();
render();
