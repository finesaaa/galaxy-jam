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
  const firstLine = new THREE.LineCurve3(
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(10, 0, 0)
  );
  const secondLine = new THREE.LineCurve3(
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-1, 1, 0)
  );

  const thirdLine = new THREE.LineCurve3(
    new THREE.Vector3(-1, 1, 0),
    new THREE.Vector3(-1, 1, 1)
  );

  const bezierLine = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 2),
    new THREE.Vector3(0, 1.5, 0),
    new THREE.Vector3(2, 1.5, -2),
    new THREE.Vector3(2, 2, -4)
  );
  // pointsPath.add(firstLine);
  // pointsPath.add(secondLine);
  // pointsPath.add(thirdLine);
  pointsPath.add(bezierLine);
}

function updateArrow() {
  const newPosition = pointsPath.getPoint(fraction);
  const tangent = pointsPath.getTangent(fraction);
  arrow.position.copy(newPosition);

  axis.crossVectors(up, tangent).normalize();
  const radians = Math.acos(up.dot(tangent));
  arrow.quaternion.setFromAxisAngle(axis, radians);

  const cameraFranction = fraction - 0.25;
  if (cameraFranction > 0) {
    const newCameraPosition = pointsPath.getPoint(cameraFranction);
    const cameraTangent = pointsPath.getTangent(cameraFranction);
    camera.lookAt(newPosition);
    camera.position.copy(newCameraPosition);
  
    cameraAxis.crossVectors(cameraUp, cameraTangent).normalize();
    const cameraRadians = Math.acos(cameraUp.dot(cameraTangent));
    camera.quaternion.setFromAxisAngle(cameraAxis, cameraRadians);
  }

  fraction += 0.001;
  if (fraction > 1) {
    fraction = 0;
  }
}

function init() {
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    1000
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

  loader.load("models/mercury/scene.gltf", function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.1, 0.1, 0.1);
    model.position.set(-2, 0, 0);
    scene.add(model);
  });

  loader.load("models/venus/scene.gltf", function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.1, 0.1, 0.1);
    model.position.set(2, 0, -100);
    scene.add(model);
  });

  loader.load("models/earth/scene.gltf", function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.1, 0.1, 0.1);
    model.position.set(2, 0, -100);
    scene.add(model);

    var mixer = new THREE.AnimationMixer(model); 
    mixer.clipAction(gltf.animations[0]).play();
    mixers.push(mixer);
  });

  // loader.load('models/mars/scene.gltf', function (gltf) {
  //   const model = gltf.scene
  //   model.scale.set(0.1, 0.1, 0.1)
  //   model.position.set(-2, 0, -1000)
  //   scene.add(model)
  // });

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(2, 2, 5);
  scene.add(light);

  const somePoints = [
    new THREE.Vector3(0.8, 0, -0.8),
    new THREE.Vector3(0.8, 0.6, 0.8),
    new THREE.Vector3(-0.8, 0, 0.8),
    new THREE.Vector3(-0.8, 0.2, -0.8),
  ];

  const curve = new THREE.CatmullRomCurve3(somePoints);
  curve.closed = true;

  const points = curve.getPoints(60);
  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0xffffaa })
  );
  scene.add(line);

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
  })

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
