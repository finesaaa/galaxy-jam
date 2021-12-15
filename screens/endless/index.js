import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

var scene;
var renderer;
var clock;

var camera;

var rocket;

var stars = [];
var mixers = [];

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
  loader.load(rocketAttrs.src, function (gltf) {
    const model = gltf.scene;
    model.scale.set(rocketAttrs.scale, rocketAttrs.scale, rocketAttrs.scale);
    model.position.set(
      rocketAttrs.initialPosition.x,
      rocketAttrs.initialPosition.y,
      rocketAttrs.initialPosition.z
    );
    rocket = model;
    rocket.rotation.y = -Math.PI / 2 - 0.1;
    rocket.rotation.x = -Math.PI / 5;
    scene.add(rocket);

    var mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();
    mixers.push(mixer);
  });
}

function inializeObjects() {
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
  camera.position.z = perspectiveAttrs.initialPosition.z;
  camera.position.y = perspectiveAttrs.initialPosition.y;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  const light = new THREE.PointLight(lightAttrs.color, lightAttrs.intensity);
  light.position.set(
    lightAttrs.initialPosition.x,
    lightAttrs.initialPosition.y,
    lightAttrs.initialPosition.z
  );
  scene.add(light);

  loadModels();

  inializeObjects();
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
    // updateRocket();
  }
}

function render() {
  animateObjects();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

initializeWorld();
render();
