import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const loader = new GLTFLoader()
loader.load('models/rocket.gltf', function(gltf){
    console.log(gltf)
    const root = gltf.scene
    root.scale.set(0.001, 0.001, 0.001)
    root.position.set(0, 1, 0)
    scene.add(root)
})

const light = new THREE.PointLight(0x404040 , 1)
light.position.set(2,2,5)
scene.add(light)


const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(65, sizes.width/sizes.height, 0.1, 100)
camera.position.set(0,1,2)
scene.add(camera)


const renderer = new THREE.WebGL1Renderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.gammaOutput = true

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

animate()

