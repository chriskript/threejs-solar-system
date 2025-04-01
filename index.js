import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 3;
const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;
const geo = new THREE.IcosahedronGeometry(1.0, 12);
const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
});
const wireMesh = new THREE.Mesh(geo, wireMat);
wireMesh.scale.setScalar(1.001);
mesh.add(wireMesh);

const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemiLight);

const clock = new THREE.Clock(); // Create a clock instance

function animate(t = 0) {
    requestAnimationFrame(animate);
    const delta = clock.getDelta(); // Get delta time
    mesh.rotation.y = t * 0.0001;
    animateSmallerGlobes(delta); // Call the function to animate smaller globes
    renderer.render(scene, camera);
    controls.update();
}
animate();

// Create a function to create a smaller globe
function createSmallerGlobe(radius, position) {
  const smallerGeo = new THREE.IcosahedronGeometry(0.2, 1);
  const smallerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
  });
  const smallerMesh = new THREE.Mesh(smallerGeo, smallerMat);
  smallerMesh.position.copy(position);
  const smallerGlobe = new THREE.Object3D();
  smallerGlobe.add(smallerMesh);
  return smallerGlobe;
}

// Create 5 smaller globes around the main globe
const smallerGlobes = [];
for (let i = 0; i < 6; i++) {
  const angle = i * Math.PI * 2 / 6;
  const radius = 0.5; // radius of the smaller globe
  const position = new THREE.Vector3(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
  const smallerGlobe = createSmallerGlobe(radius, position);
  scene.add(smallerGlobe);
  smallerGlobes.push(smallerGlobe); // Fixed duplicate creation
}

// Create a function to animate the smaller globes
function animateSmallerGlobes(delta) {
  smallerGlobes.forEach((smallerGlobe, i) => {
    const angle = i * Math.PI * 2 / 6 + clock.getElapsedTime() * 0.1; // Use clock instance
    smallerGlobe.position.x = Math.cos(angle) * 2;
    smallerGlobe.position.y = Math.sin(angle) * 2;
    smallerGlobe.position.z = 0;
    smallerGlobe.rotation.y = clock.getElapsedTime() * 0.1; // Update rotation
  });
}
