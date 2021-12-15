import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { Flow } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/modifiers/CurveModifier.js";

var camera;
var scene;
var renderer;
var stars = [];

var fraction = 0;
var rocket;
const up = new THREE.Vector3(0, 0, -1);
const axis = new THREE.Vector3();
var pointsPath;
const text = "Mercury";
var textMeshs = [];
var buttonMesh;
var boundingBoxButton = null;

function inializePath()
{
  rocket = new THREE.Mesh();

  pointsPath = new THREE.CurvePath();
  const line = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-5.0, 1.0, -0.8),
    new THREE.Vector3(3.8, 1.0, -0.8),
    new THREE.Vector3(4.8, 1.0, -0.8),
    new THREE.Vector3(5.0, 1.0, -0.8),
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
  
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("./../../../assets/models/mercury/scene.gltf", function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.1, 0.1, 0.1);
    model.rotation.y = Math.PI * 1/3;
    model.position.set(0, 0.1, 0);
    scene.add(model);
    rocket = model;
  });
  
  const light = new THREE.PointLight(0xffffff, 2.4);
  light.position.set(2, 2, 5);
  scene.add(light);

  //back button
//   var cubeTexture = new THREE.ImageUtils.loadTexture("textures/start.png"); 

//   const buttonGeometry = new THREE.BoxGeometry(1.09, 0.35, 0.25);
//   const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: cubeTexture });
//   buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
//   buttonMesh.position.set(-4.0, 1.9, -1);
//   buttonMesh.rotation.x = - Math.PI / 30;
//   scene.add(buttonMesh);

//   const boundingBoxButton = new THREE.BoxHelper( buttonMesh, 0x000000 );
//   boundingBoxButton.update();
//   scene.add( boundingBoxButton ); 
  
  inializePath();

  const material = new THREE.LineBasicMaterial({
    color: 0x000000
  });
  const pointsLine = pointsPath.curves.reduce((p, d)=> [...p, ...d.getPoints(20)], []);
  const geometry = new THREE.BufferGeometry().setFromPoints( pointsLine );
  const pathLine = new THREE.Line( geometry, material );
  scene.add(pathLine);

  scene.add(rocket);
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

  updatePath();

  updateText();
}

var change = [];
var speed = [];
function drawText()
{
  const fontLoader = new THREE.FontLoader();

  for (let i = 0; i <= text.length; i++)
  {
    fontLoader.load("./../../fonts/poppins-semibold.json", function (font) {
      var textGeo = new THREE.TextGeometry(text.charAt(i), {
        font: font,
        size: 0.2,
        height: 0.1,
        bevelEnabled: false,
      });
  
      var textMaterial = new THREE.MeshPhongMaterial({
        color: 0xdddddd,
      });
      textMeshs[i] = new THREE.Mesh(textGeo, textMaterial);
      var addition = 0.25;
      if (i == 3)
        addition -= 0.1
        
      if (i > 0)
        textMeshs[i].position.set(textMeshs[i-1].position.x + addition, 0, 1);
      else
        textMeshs[i].position.set(-0.75, 0, 1);
      scene.add(textMeshs[i]);
    });
    
    if (i % 2 == 0)
    {
      change[i] = -0.02;
      speed[i] = -1/1000;
    }
    else
    {
      change[i] = 0.02;
      speed[i] = 1/1000;
    }
  }
}

function updateText()
{
  if (textMeshs.length >= text.length)
  {
    for (let i = 0; i < textMeshs.length; i++)
    {
      if (Math.abs(change[i]) >= 0.04)
      {
        change[i] = 0;
        speed[i] = -speed[i];
      }
      
      textMeshs[i].position.y += speed[i];
      change[i] += speed[i];
    }
  }
}

function render() {
  animateStars();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

init();
drawText();
addSphere();
render();
