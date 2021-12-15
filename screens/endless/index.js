import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

var PLANE_WIDTH = 20;
var PLANE_LENGTH = 1000;
var PADDING = (PLANE_WIDTH / 5) * 2;

var camera;
var directionalLight;
var globalRenderID;
var hemisphereLight;
var renderer;
var scene;

var rocket;
var rocketActions;

var sun;
var sunActions;

var mixers = [];

var movingLeft = false;
var movingRight = false;
var movingDestinyX = null;

var game_running = true;

var clock = new THREE.Clock();

var cameraDegreesStart = -90;
var cameraDegreesEnd = 0;
var cameraPositionXStart = -45;
var cameraPositionXEnd = 0;
var cameraPositionZStart = 50;
var cameraPositionZEnd = 10;
var cameraIntroTime = 4000;
var cameraIntroDone = false;
var cameraInitialTimestamp = null;

var stars = [];

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
    rocket.rotation.y = -Math.PI / 2;
    rocket.rotation.z = Math.PI / 18;
    scene.add(rocket);

    rocketActions = new THREE.AnimationMixer(model);
    rocketActions.clipAction(gltf.animations[0]).play();
  });

  loader.load(sunAttrs.src, function (gltf) {
    const model = gltf.scene;
    model.scale.set(sunAttrs.scale, sunAttrs.scale, sunAttrs.scale);
    model.position.set(
      sunAttrs.initialPosition.x,
      sunAttrs.initialPosition.y,
      sunAttrs.initialPosition.z
    );
    sun = model;
    scene.add(sun);

    sunActions = new THREE.AnimationMixer(model);
    sunActions.clipAction(gltf.animations[0]).play();
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
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    perspectiveAttrs.fov,
    window.innerWidth / window.innerHeight,
    perspectiveAttrs.far,
    perspectiveAttrs.near
  );
  camera.position.set(
    cameraPositionXStart,
    10.6,
    PLANE_LENGTH / 2 + PLANE_LENGTH / 25 - cameraPositionZStart
  );
  camera.rotation.y = (cameraDegreesStart * Math.PI) / 180;

  scene.add(camera);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  var spotLight;
  var target;
  var targetGeometry;
  var targetMaterial;
  for (var i = 0; i < 5; i += 1) {
    targetGeometry = new THREE.BoxGeometry(1, 1, 1);
    targetMaterial = new THREE.MeshNormalMaterial();
    target = new THREE.Mesh(targetGeometry, targetMaterial);
    target.position.set(0, 2, (i * PLANE_LENGTH) / 5 - PLANE_LENGTH / 2.5);
    target.visible = false;
    scene.add(target);

    spotLight = new THREE.SpotLight(0xffffff, 0.1);
    spotLight.position.set(
      150,
      (i * PLANE_LENGTH) / 5 - PLANE_LENGTH / 2.5,
      -350
    );
    spotLight.castShadow = true;
    spotLight.target = target;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
  }
  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 99, 0);
  hemisphereLight = new THREE.HemisphereLight(0xfffbdb, 0x37474f, 1);
  hemisphereLight.position.y = 500;
  scene.add(directionalLight, hemisphereLight);

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
}

function render() {
  animateObjects();

  renderer.render(scene, camera);

  setTimeout(function () {
    globalRenderID = requestAnimationFrame(render);
  }, 1000 / 90);

  if (game_running == true) {
    if (cameraIntroDone == false) {
      if (cameraInitialTimestamp == null) {
        cameraInitialTimestamp = Date.now();
      }

      if (Date.now() > cameraInitialTimestamp + cameraIntroTime) {
        if (cameraPositionXStart != cameraPositionXEnd) {
          cameraPositionXStart = cameraPositionXStart + 1;

          camera.position.x = camera.position.x + 1;
        }

        if (cameraDegreesStart != cameraDegreesEnd) {
          cameraDegreesStart = cameraDegreesStart + 2;

          camera.rotation.y = (cameraDegreesStart * Math.PI) / 180;
        }

        if (cameraPositionZStart != cameraPositionZEnd) {
          cameraPositionZStart = cameraPositionZStart - 1;

          camera.position.z =
            PLANE_LENGTH / 2 + PLANE_LENGTH / 25 - cameraPositionZStart;
        }

        if (
          cameraDegreesStart == cameraDegreesEnd &&
          cameraPositionXStart == cameraPositionXEnd &&
          cameraPositionZStart == cameraPositionZEnd
        ) {
          cameraIntroDone = true;
        }
      }
    }

    if (rocketActions != undefined) rocketActions.update(clock.getDelta());

    if (movingDestinyX != null) {
      if (rocket.position.x != movingDestinyX) {
        if (movingLeft == true) {
          rocket.position.x = rocket.position.x - 0.5;
        } else if (movingRight == true) {
          rocket.position.x = rocket.position.x + 0.5;
        }
      } else {
        movingDestinyX = null;
        movingLeft = false;
        movingRight = false;
      }
    }
  }
}

initializeWorld();
render();
