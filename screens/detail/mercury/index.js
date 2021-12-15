import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

var camera;
var scene;
var renderer;
var control;
var loader;
var clock;

var stars = [];
var mixers = [];
var objectsModel = {};

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize, false);

function initializeLight() {
  const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientlight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 3, 5);
  scene.add(pointLight);

  const Helper = new THREE.PointLightHelper(pointLight);
  scene.add(Helper);
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
  for (var key in objectsAttrs) {
    let objectAttrs = objectsAttrs[key];

    loader.load(objectAttrs.src, function (gltf) {
      const model = gltf.scene;
      model.scale.set(objectAttrs.scale, objectAttrs.scale, objectAttrs.scale);

      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });

      model.position.set(objectAttrs.initailPosition.x, objectAttrs.initailPosition.y, objectAttrs.initailPosition.z);
      
      var mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();
      mixers.push(mixer);
      
      objectsModel[objectAttrs.name] = model;
      
      scene.add(model);
    });
  }
}

function initializeObjects() {
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
    perspectiveAttrs.far,
  );
  camera.position.x = perspectiveAttrs.initailPosition.x;
  camera.position.y = perspectiveAttrs.initailPosition.y;
  camera.position.z = perspectiveAttrs.initailPosition.z;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(".webgl"),
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0.0);

  control = new OrbitControls(camera, renderer.domElement);

  control.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  }

  loader = new GLTFLoader();

  clock = new THREE.Clock();

  initializeLight();

  loadModels();
  initializeObjects();
}

function updateObjects() {
  for (var i = 0; i < stars.length; i++) {
    var star = stars[i];

    star.position.z += i / starAttrs.speed;

    if (star.position.z > starAttrs.position.zMax) {
      star.position.z -= (starAttrs.position.zMax * 2);
    }
  }

  mixers.forEach(function (mixer) {
    mixer.update(clock.getDelta());
  });

  var mercury = objectsModel[objectsAttrs.mercuryAttrs.name];
  if (mercury !== undefined) {
    mercury.rotation.y += objectsAttrs.mercuryAttrs.rotationSpeed;
  }
}

function render() {
  updateObjects();

  control.update();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

initializeWorld();
render();
