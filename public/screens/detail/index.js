import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

var camera;
var scene;
var renderer;
var control;
var loader;
var clock;

var rocket;

var stars = [];
var mixers = [];
var objectsModel = {};

var fraction = 0;
const up = new THREE.Vector3(0, 0, -1);
const axis = new THREE.Vector3();
var pointsPath;

function inializePath()
{
  rocket = new THREE.Mesh();

  pointsPath = new THREE.CurvePath();
  const line = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.5, 0, -1.4),
    new THREE.Vector3(-0.2, 0, 0.2),
    new THREE.Vector3(0.4, -0.4, -1),
    new THREE.Vector3(0.5, -0.4, -1.9),
  );
  pointsPath.add(line);
}

function updatePath()
{
  const newPosition = pointsPath.getPoint(fraction);
  const tangent = pointsPath.getTangent(fraction);
  rocket.position.copy(newPosition);

  axis.crossVectors(up, tangent).normalize();
  const radians = Math.acos(up.dot(tangent));
  rocket.quaternion.setFromAxisAngle(axis, radians);

  fraction += 0.001;
  if (fraction > 1) {
    fraction = 0;
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize, false);

function initializeLight() {
  const ambientlight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientlight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 3, 4);
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
      if (objectAttrs.name == "rocket")
        rocket = model
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

  inializePath();

  const material = new THREE.LineBasicMaterial({
    color: 0x808080
  });
  const pointsLine = pointsPath.curves.reduce((p, d)=> [...p, ...d.getPoints(20)], []);
  const geometry = new THREE.BufferGeometry().setFromPoints( pointsLine );
  const pathLine = new THREE.Line( geometry, material );
  // scene.add(pathLine);
}

function updateObjects() {
  for (var i = 0; i < stars.length; i++) {
    var star = stars[i];

    star.position.z += i / starAttrs.speed;

    if (star.position.z > starAttrs.position.zMax) {
      star.position.z -= (starAttrs.position.zMax * 2);
    }
  }

  updatePath();

  mixers.forEach(function (mixer) {
    mixer.update(clock.getDelta());
  });

  var mercury = objectsModel[objectsAttrs.planetAttrs.name];
  if (mercury !== undefined) {
    mercury.rotation.y += objectsAttrs.planetAttrs.rotationSpeed;
  }
}

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function render() {
  updateObjects();

  control.update();


  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

initializeWorld();
render();
