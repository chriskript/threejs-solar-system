import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 100; //Value to ensure visibility when zooming out
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 10;
const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;
const geo = new THREE.IcosahedronGeometry(1.0, 12);
const mat = new THREE.MeshStandardMaterial({
    color: 0xffd700, 
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
// mesh.add(wireMesh); // Commented out to disable the mesh on the Sun

const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemiLight);

// Create a starfield
function createStarfield() {
    const starCount = 10000; // Number of stars
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 200; // X position
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 200; // Y position
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 200; // Z position
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// Call the function to add stars to the scene
createStarfield();

// Update the Sun
const sunGeo = new THREE.SphereGeometry(1.0, 32, 32); //Sun
const sunMat = new THREE.MeshStandardMaterial({ 
    color: 0xffd700, // Base yellow color
    emissive: 0xff4500, // Add a burning orange glow
    emissiveIntensity: 0.5, // Control the intensity of the glow
    flatShading: false // Smooth shading for a more realistic look
});
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.castShadow = true;
sun.receiveShadow = true;

// Configure shadow properties for the Sun
const sunLight = new THREE.PointLight(0xffd700, 1, 50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 50;
sun.add(sunLight);

// Create a parent object to hold the entire solar system
const solarSystem = new THREE.Object3D();
solarSystem.rotation.x = THREE.MathUtils.degToRad(23.5); // Adjust tilt to 23.5 degrees
scene.add(solarSystem);

// Add the Sun and planets to the solar system
solarSystem.add(sun);

// Update planets to match the solar system
const planets = [];
const planetData = [
    { name: "Mercury", size: 0.1, distance: 2.0, color: 0xaaaaaa, speed: 0.02 },
    { name: "Venus", size: 0.2, distance: 3.0, color: 0xffcc99, speed: 0.015 },
    { name: "Earth", size: 0.25, distance: 4.0, color: 0x0000ff, speed: 0.01 },
    { name: "Mars", size: 0.15, distance: 5.0, color: 0xff4500, speed: 0.008 },
    { name: "Jupiter", size: 0.5, distance: 7.0, color: 0xffa500, speed: 0.005 },
    { name: "Saturn", size: 0.4, distance: 9.0, color: 0xffd27f, speed: 0.004 },
    { name: "Uranus", size: 0.35, distance: 11.0, color: 0x87ceeb, speed: 0.003 },
    { name: "Neptune", size: 0.35, distance: 13.0, color: 0x4682b4, speed: 0.002 },
];

const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('textures/earth_diffuse.jpg'); // Add Earth diffuse texture
const earthBumpMap = textureLoader.load('textures/earth_bump.jpg'); // Add Earth bump map

planetData.forEach((data) => {
    const planetGeo = new THREE.SphereGeometry(data.size, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({ 
        color: data.color,
        map: data.name === "Earth" ? earthTexture : null, // Apply texture to Earth
        bumpMap: data.name === "Earth" ? earthBumpMap : null, // Apply bump map to Earth
        bumpScale: data.name === "Earth" ? 0.05 : 0 // Adjust bump scale for Earth
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);

    planet.castShadow = true;
    planet.receiveShadow = true;

    const orbit = new THREE.Object3D();
    orbit.add(planet);
    planet.position.x = data.distance;

    // Add white circular path for the planet's orbit
    const orbitPathGeo = new THREE.RingGeometry(data.distance - 0.01, data.distance + 0.01, 64);
    const orbitPathMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
    });
    const orbitPath = new THREE.Mesh(orbitPathGeo, orbitPathMat);
    orbitPath.rotation.x = Math.PI / 2; // Align the orbit path to the solar system's plane
    solarSystem.add(orbitPath);

    // Add rings to Saturn
    if (data.name === "Saturn") {
        const ringGeo = new THREE.RingGeometry(0.5, 0.8, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffd27f,
            side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2; // Tilt the ring
        planet.add(ring);
    }

    solarSystem.add(orbit);
    planets.push({ planet, orbit, speed: data.speed });
});

// Update the animation loop to simulate orbits
function animate(t = 0) {
    requestAnimationFrame(animate);

    // Rotate the Sun
    sun.rotation.y = t * 0.0001;

    // Update planet orbits
    planets.forEach(({ orbit, speed }) => {
        orbit.rotation.y += speed;
    });

    mesh.rotation.y = t * 0.0001; // Rotate the main globe if needed
    renderer.render(scene, camera);
    controls.update();
}
animate();
