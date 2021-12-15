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

var stars = [];

var mixers = [];

const up = new THREE.Vector3(0, 0, -1);
const axis = new THREE.Vector3();

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


var childWindow = "";
var newTabUrl = "../main/index.html";

var introTime = parseFloat(sessionStorage.getItem("introTime"));
var time = 0;

function checkRotation(){
  if (clock !== undefined)
  time += clock.getDelta();
  
  var rotSpeed = .02;
  var x = camera.position.x,
  y = camera.position.y,
  z = camera.position.z;
  
  // console.log(introTime, time);
  if (introTime > 0)
  {
    if (time < introTime + 1.6)
    {
      camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
      camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
    }
    else
    {
      childWindow = window.open(newTabUrl, "_self");
    }
  }
  camera.lookAt(scene.position);
}

function render() {
  animateObjects();
  checkRotation();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

initializeWorld();
render();
