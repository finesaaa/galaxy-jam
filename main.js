import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

var camera;
var scene;
var renderer;
var stars = [];
var clock;
var mixers = [];

var fraction = 0;
var arrow;
const up = new THREE.Vector3(0, 0, -1);
const axis = new THREE.Vector3();
var pointsPath;

const cameraUp = new THREE.Vector3(0, 0, -1);
const cameraAxis = new THREE.Vector3();

function inializeArrow() {
  const material = new THREE.MeshNormalMaterial();
  const coneGeom = new THREE.ConeGeometry(1, 2, 10);
  coneGeom.translate(0, 2.5, 0);

  const cone = new THREE.Mesh(coneGeom, material);
  const cylinder = new THREE.CylinderGeometry(0.4, 0.6, 3, 10);

  cylinder.merge(cone.geometry, cone.matrix);
  cylinder.scale(0.05, 0.05, 0.05);

  arrow = new THREE.Mesh(cylinder, material);

  pointsPath = new THREE.CurvePath();

  const bezier1 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-1, 0, -5),
    new THREE.Vector3(-2, 0, -8),
    new THREE.Vector3(-10, 0, -14),
  );

  const bezier2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-10, 0, -14),
    new THREE.Vector3(-11.5, 0, -15),
    new THREE.Vector3(-16, 0, -20),
    new THREE.Vector3(-13, 0, -25),
  );

  const bezier3 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-13, 0, -25),
    new THREE.Vector3(-10, 0, -30),
    new THREE.Vector3(0, 0, -35),
    new THREE.Vector3(6, 0, -32),
  );

  const bezier4 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(6, 0, -32),
    new THREE.Vector3(12, 0, -29),
    new THREE.Vector3(17, 0, -25),
    new THREE.Vector3(21, 0, -20),
  );

  const bezier5 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(21, 0, -20),
    new THREE.Vector3(25, 0, -15),
    new THREE.Vector3(32, 0, -5),
    new THREE.Vector3(20, 0, 5),
  );

  const bezier6 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(20, 0, 5),
    new THREE.Vector3(12, 0, 11),
    new THREE.Vector3(1, 0, 7),
    new THREE.Vector3(0, 0, 0),
  );

  pointsPath.add(bezier1);
  pointsPath.add(bezier2);
  pointsPath.add(bezier3);
  pointsPath.add(bezier4);
  pointsPath.add(bezier5);
  pointsPath.add(bezier6);

  const points = pointsPath.getPoints(60);
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0xffffaa })
  );
  scene.add(line);

  console.log(pointsPath.getSpacedPoints());
}

function updateArrow() {
  const newPosition = pointsPath.getPoint(fraction);
  const tangent = pointsPath.getTangent(fraction);
  arrow.position.copy(newPosition);

  axis.crossVectors(up, tangent).normalize();
  const radians = Math.acos(up.dot(tangent));
  arrow.quaternion.setFromAxisAngle(axis, radians);

  var cameraFranction = fraction - 0.05;
  if (cameraFranction < 0) {
    cameraFranction += 1;
  }

  camera.lookAt(newPosition);
  const newCameraPosition = pointsPath.getPoint(cameraFranction);
  const cameraTangent = pointsPath.getTangent(cameraFranction);
  camera.position.copy(newCameraPosition);
  camera.position.y += 1;

  cameraAxis.crossVectors(cameraUp, cameraTangent).normalize();
  const cameraRadians = Math.acos(cameraUp.dot(cameraTangent));
  camera.quaternion.setFromAxisAngle(cameraAxis, cameraRadians);

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
  camera.position.z = 5;

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
    scene.add(model);
    arrow = model;
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

  inializeArrow();
  scene.add(arrow);
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

  updateArrow();
}

function render() {
  animateStars();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

init();
addSphere();
render();
