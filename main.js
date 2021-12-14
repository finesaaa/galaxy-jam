import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

var pathPoints = [
  [-8, 0, 12],
  [-9, 0, 7],
  [-10.5, 0, 3],
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
  [-7, 0, 19],
];

var paths = [];
function addPath(scale) {
  var path = new THREE.CurvePath();

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

  const points = path.getPoints(60);
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0xffffaa })
  );
  scene.add(line);

  paths.push(path);
}

var camera;
var scene;
var renderer;
var stars = [];
var clock;
var mixers = [];

var fraction = 0;
var rocket;
const up = new THREE.Vector3(0, 0, -1);
const axis = new THREE.Vector3();

const cameraUp = new THREE.Vector3(0, 0, -1);
const cameraAxis = new THREE.Vector3();

function inializeRocket() {
  const material = new THREE.MeshNormalMaterial();
  const coneGeom = new THREE.ConeGeometry(1, 2, 10);
  coneGeom.translate(0, 2.5, 0);

  const cone = new THREE.Mesh(coneGeom, material);
  const cylinder = new THREE.CylinderGeometry(0.4, 0.6, 3, 10);

  cylinder.merge(cone.geometry, cone.matrix);
  cylinder.scale(0.05, 0.05, 0.05);

  addPath(1.5);
  addPath(1.51);
  addPath(1.49);
  addPath(1.52);
  addPath(1.48);
}

function updateRocket() {
  const newPosition = paths[0].getPoint(fraction);
  const tangent = paths[0].getTangent(fraction);
  rocket.position.copy(newPosition);

  axis.crossVectors(up, tangent).normalize();
  const radians = Math.acos(up.dot(tangent));
  rocket.quaternion.setFromAxisAngle(axis, radians);

  var cameraFranction = fraction - 0.015;
  if (cameraFranction < 0) {
    cameraFranction += 1;
  }

  camera.lookAt(newPosition);
  const newCameraPosition = paths[0].getPoint(cameraFranction);
  const cameraTangent = paths[0].getTangent(cameraFranction);
  camera.position.copy(newCameraPosition);
  camera.position.y += 1;

  cameraAxis.crossVectors(cameraUp, cameraTangent).normalize();
  const cameraRadians = Math.acos(cameraUp.dot(cameraTangent));
  // camera.quaternion.setFromAxisAngle(cameraAxis, cameraRadians);

  fraction += 0.0004;
  if (fraction > 1) {
    fraction = 0;
  }
}

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
  camera.position.z = 0;
  camera.position.y = 70;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);
  clock = new THREE.Clock();

  const loader = new GLTFLoader();
  loader.load("models/rocket/scene.gltf", function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.001, 0.001, 0.001);
    model.position.set(0, 0, 0);
    rocket = model;
    scene.add(rocket);
  });

  // loader.load("models/mercury/scene.gltf", function (gltf) {
  //   const model = gltf.scene;
  //   model.scale.set(0.1, 0.1, 0.1);
  //   model.position.set(-2, 0, 0);
  //   scene.add(model);
  // });

  // loader.load("models/venus/scene.gltf", function (gltf) {
  //   const model = gltf.scene;
  //   model.scale.set(0.1, 0.1, 0.1);
  //   model.position.set(2, 0, -90);
  //   scene.add(model);
  // });

  // loader.load("models/earth/scene.gltf", function (gltf) {
  //   const model = gltf.scene;
  //   model.scale.set(0.1, 0.1, 0.1);
  //   model.position.set(2, 0, -100);
  //   scene.add(model);

  //   var mixer = new THREE.AnimationMixer(model);
  //   mixer.clipAction(gltf.animations[0]).play();
  //   mixers.push(mixer);
  // });

  // loader.load('models/mars/scene.gltf', function (gltf) {
  //   const model = gltf.scene
  //   model.scale.set(0.1, 0.1, 0.1)
  //   model.position.set(-2, 0, -1000)
  //   scene.add(model)
  // });

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(2, 2, 5);
  scene.add(light);

  inializeRocket();
}

function addSphere() {
  for (var z = -1000; z < 1000; z += 20) {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32);
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    var sphere = new THREE.Mesh(geometry, material);

    sphere.position.x = Math.random() * 1000 - 500;
    sphere.position.y = Math.random() * 1000 - 500;

    sphere.position.z = z;

    sphere.scale.x = sphere.scale.y = 0.5;

    scene.add(sphere);

    stars.push(sphere);
  }
}

function animateStars() {
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
  animateStars();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

init();
addSphere();
render();
