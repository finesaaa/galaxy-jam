import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

var scene;
var renderer;
var clock;

var camera;
var cameraIndex = 0;

var paths = [];

var rocket;
var rocketIndex = 0;
var fraction = 0;

var planets = {};

var stars = [];

var mixers = [];

const up = new THREE.Vector3(0, 0, -1);
const axis = new THREE.Vector3();

function onKeydown(event) {
  if (event.keyCode == 65 || event.keyCode == 97) {
    // A atau a
    if (rocketIndex - 1 >= 0) {
      rocketIndex -= 1;
    }
  } else if (event.keyCode == 68 || event.keyCode == 100) {
    // D atau d
    if (rocketIndex + 1 < paths.length) {
      rocketIndex += 1;
    }
  } else if (event.keyCode == 87 || event.keyCode == 119) {
    // W atau w
  } else if (event.keyCode == 83 || event.keyCode == 115) {
    // S atau s
  }
}
document.addEventListener("keydown", onKeydown, false);

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
  sphere.position.x = Math.random() * 1000 - 500;
  sphere.position.y = Math.random() * 1000 - 500;
  sphere.position.z = zPosition;

  scene.add(sphere);

  stars.push(sphere);
}

function loadModels() {
  const loader = new GLTFLoader();

  for (var key in planetsAttrs) {
    let planetAttrs = planetsAttrs[key];

    loader.load(planetAttrs.src, function (gltf) {
      const model = gltf.scene;
      model.scale.set(planetAttrs.scale, planetAttrs.scale, planetAttrs.scale);


      addPath(planetAttrs.pathScale);
      let modelPath = createPath(planetAttrs.pathScale);
      let modelPosition = modelPath.getPoint(planetAttrs.pathFraction);
      model.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
      scene.add(model);

      var mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();
      mixers.push(mixer);
    });
  }

  loader.load(rocketAttrs.src, function (gltf) {
    const model = gltf.scene;
    model.scale.set(rocketAttrs.scale, rocketAttrs.scale, rocketAttrs.scale);
    model.position.set(
      rocketAttrs.initailPosition.x,
      rocketAttrs.initailPosition.y,
      rocketAttrs.initailPosition.z
    );
    rocket = model;
    scene.add(rocket);
  });
}

function inializeObjects() {
  var middlePathIndex = Math.floor(rocketAttrs.pathNum / 2);
  for (var i = 0; i < rocketAttrs.pathNum; i++) {
    var additionalScale = (middlePathIndex - i) * rocketAttrs.pathScaleAddition;
    addPath(rocketAttrs.pathScale + additionalScale);
  }

  rocketIndex = Math.floor(paths.length / 2);
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
    perspectiveAttrs.far,
    perspectiveAttrs.near
  );
  camera.position.z = perspectiveAttrs.initailPosition.z;
  camera.position.y = perspectiveAttrs.initailPosition.y;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();

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
  const newPosition = paths[rocketIndex].getPoint(fraction);
  const tangent = paths[rocketIndex].getTangent(fraction);
  rocket.position.copy(newPosition);

  axis.crossVectors(up, tangent).normalize();
  const radians = Math.acos(up.dot(tangent));
  rocket.quaternion.setFromAxisAngle(axis, radians);

  var cameraFranction = fraction - 0.015;
  if (cameraFranction < 0) {
    cameraFranction += 1;
  }

  camera.lookAt(newPosition);
  const newCameraPosition = paths[cameraIndex].getPoint(cameraFranction);
  camera.position.copy(newCameraPosition);
  camera.position.y += 1;

  fraction += 0.0004;
  if (fraction > 1) {
    fraction = 0;
  }
}

function animateObjects() {
  for (var i = 0; i < stars.length; i++) {
    var star = stars[i];

    star.position.z += i / 100;

    if (star.position.z > 1000) {
      star.position.z -= 2000;
    }
  }

  mixers.forEach((mixer) => {
    mixer.update(clock.getDelta());
  });

  if (rocket !== undefined) {
    updateRocket();
  }
}

function render() {
  animateObjects();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

initializeWorld();
render();
