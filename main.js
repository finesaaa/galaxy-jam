import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import {
  OrbitControls
} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import {
  GLTFLoader
} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

var camera, scene, renderer, stars = [];

function init() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 5;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  const loader = new GLTFLoader()
  loader.load('models/rocket/scene.gltf', function (gltf) {
    const root = gltf.scene
    root.scale.set(0.002, 0.002, 0.002)
    root.position.set(0, 1, 0)
    scene.add(root)
  });

  const light = new THREE.PointLight(0xffffff , 1)
  light.position.set(2,2,5)
  scene.add(light)
}


function addSphere() {
  for (var z = -1000; z < 1000; z += 20) {

    var geometry = new THREE.SphereGeometry(0.5, 32, 32)
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    var sphere = new THREE.Mesh(geometry, material)

    sphere.position.x = Math.random() * 1000 - 500;
    sphere.position.y = Math.random() * 1000 - 500;

    sphere.position.z = z;

    sphere.scale.x = sphere.scale.y = 2;

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
}

function render() {
  requestAnimationFrame(render);

  renderer.render(scene, camera);
  animateStars();
}

init();
addSphere();
render();