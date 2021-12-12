import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import {
  OrbitControls
} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import {
  GLTFLoader
} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { Flow } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/modifiers/CurveModifier.js';

var camera, scene, renderer, stars = [];

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 5;

scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const gltfLoader = new GLTFLoader()
gltfLoader.load('models/rocket/scene.gltf', function (gltf) {
  const root = gltf.scene
  root.scale.set(0.002, 0.002, 0.002)
  root.position.set(0, 0, 0)
  scene.add(root)
});

const light = new THREE.PointLight(0xffffff , 2.0)
light.position.set(2,2,5)
scene.add(light)

const somePoints = [
  new THREE.Vector3(  1,   0, -1 ),
  new THREE.Vector3(  1, 0.6,  1 ),
  new THREE.Vector3( -1,   0,  1 ),
  new THREE.Vector3( -1, 0.2, -1 ),
];

const curve = new THREE.CatmullRomCurve3( somePoints );	
curve.closed = true;

const points = curve.getPoints( 60 );
const line = new THREE.LineLoop( new THREE.BufferGeometry( ).setFromPoints( points ), new THREE.LineBasicMaterial( { color: 0xffffaa } ) );
scene.add( line );

const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
const material = new THREE.MeshPhongMaterial( { color: 0xffff00, wireframe: false } );
const objectToCurve = new THREE.Mesh( geometry, material );

const flow = new Flow( objectToCurve ); 
flow.updateCurve( 0, curve );
scene.add( flow.object3D );

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
}

const fontLoader = new THREE.FontLoader();

fontLoader.load('/fonts/poppins-semibold.json', function(font) {
    var textGeo = new THREE.TextGeometry("g a l a x y . . .", {
    font: font,
    size: 0.2,
    height: 0.1,
    bevelEnabled: false
    });

    var textMaterial = new THREE.MeshPhongMaterial({
    color: 0xdddddd
    });
    var mesh = new THREE.Mesh(textGeo, textMaterial);
    mesh.position.set(-0.75, 0, 1);
    scene.add(mesh);
});

function render() {
  requestAnimationFrame(render);
  
  flow.moveAlongCurve( 0.006 );

  renderer.render(scene, camera);
  animateStars();
}

addSphere();
render();