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
controls.enableZoom = true; // Ensure zooming is enabled
controls.zoomSpeed = 0.5; // Adjust zoom speed for smoother zooming

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

// Create a starfield using instanced rendering
function createStarfield() {
    const starCount = 10000; // Number of stars
    const starGeometry = new THREE.SphereGeometry(0.05, 8, 8); // Small sphere for stars
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const starMesh = new THREE.InstancedMesh(starGeometry, starMaterial, starCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < starCount; i++) {
        dummy.position.set(
            (Math.random() - 0.5) * 200, // X position
            (Math.random() - 0.5) * 200, // Y position
            (Math.random() - 0.5) * 200  // Z position
        );
        dummy.updateMatrix();
        starMesh.setMatrixAt(i, dummy.matrix);
    }

    scene.add(starMesh);
}

// Call the function to add stars to the scene
createStarfield();

// Update the Sun
const sunGeo = new THREE.SphereGeometry(1.0, 32, 32); //Sun
const sunMat = new THREE.MeshStandardMaterial({ 
    color: 0xff4500, // Base yellow color
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
    { 
        name: "Mercury", size: 0.1, distance: 2.0, color: 0xaaaaaa, speed: 0.02 
    },
    { 
        name: "Venus", size: 0.2, distance: 3.0, color: 0xffcc99, speed: 0.015 
    },
    { 
        name: "Earth", size: 0.25, distance: 4.0, color: 0x0000ff, speed: 0.01,
        moons: [
            { name: "Moon", size: 0.05, distance: 0.5, color: 0xaaaaaa, speed: 0.05 }
        ]
    },
    { 
        name: "Mars", size: 0.15, distance: 5.0, color: 0xff4500, speed: 0.008,
        moons: [
            { name: "Phobos", size: 0.02, distance: 0.3, color: 0x888888, speed: 0.08 },
            { name: "Deimos", size: 0.015, distance: 0.5, color: 0xaaaaaa, speed: 0.05 }
        ]
    },
    { 
        name: "Jupiter", size: 0.5, distance: 7.0, color: 0xffa500, speed: 0.005,
        moons: [
            { name: "Io", size: 0.05, distance: 0.7, color: 0xffcc00, speed: 0.1 },
            { name: "Europa", size: 0.04, distance: 1.0, color: 0xccccff, speed: 0.08 },
            { name: "Ganymede", size: 0.06, distance: 1.5, color: 0x999999, speed: 0.06 },
            { name: "Callisto", size: 0.05, distance: 2.0, color: 0x666666, speed: 0.04 }
        ]
    },
    { 
        name: "Saturn", size: 0.4, distance: 9.0, color: 0xffd27f, speed: 0.004,
        moons: [
            { name: "Titan", size: 0.06, distance: 1.2, color: 0xffd700, speed: 0.03 },
            { name: "Enceladus", size: 0.03, distance: 0.8, color: 0xffffff, speed: 0.05 }
        ]
    },
    { 
        name: "Uranus", size: 0.35, distance: 11.0, color: 0x87ceeb, speed: 0.003 
    },
    { 
        name: "Neptune", size: 0.35, distance: 13.0, color: 0x4682b4, speed: 0.002 
    },
];

const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('textures/earth_diffuse.jpg'); // Add Earth diffuse texture
const earthBumpMap = textureLoader.load('textures/earth_bump.jpg'); // Add Earth bump map

const planetTextures = {
    Mercury: textureLoader.load('textures/mercury.jpg'),
    Venus: textureLoader.load('textures/venus.jpg'),
    Earth: textureLoader.load('textures/earth_diffuse.jpg'),
    Mars: textureLoader.load('textures/mars.jpg'),
    Jupiter: textureLoader.load('textures/jupiter.jpg'),
    Saturn: textureLoader.load('textures/saturn.jpg'),
    Uranus: textureLoader.load('textures/uranus.jpg'),
    Neptune: textureLoader.load('textures/neptune.jpg'),
};

// Function to create a planet
function createPlanet({ name, size, distance, color, texture, bumpMap, bumpScale }) {
    const planetGeo = new THREE.SphereGeometry(size, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({
        color,
        map: texture || null,
        bumpMap: bumpMap || null,
        bumpScale: bumpScale || 0,
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.castShadow = true;
    planet.receiveShadow = true;

    const orbit = new THREE.Object3D();
    orbit.add(planet);
    planet.position.x = distance;

    return { planet, orbit };
}

// Function to create a moon
function createMoon({ size, distance, color, speed }) {
    const moonGeo = new THREE.SphereGeometry(size, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({ color });
    const moon = new THREE.Mesh(moonGeo, moonMat);

    const moonOrbit = new THREE.Object3D();
    moonOrbit.add(moon);
    moon.position.x = distance;

    return { moon, moonOrbit, speed };
}

// Refactor planet creation
planetData.forEach((data) => {
    const texture = planetTextures[data.name] || null;
    const bumpMap = data.name === "Earth" ? earthBumpMap : null;
    const bumpScale = data.name === "Earth" ? 0.05 : 0;

    const { planet, orbit } = createPlanet({
        name: data.name,
        size: data.size,
        distance: data.distance,
        color: data.color,
        texture,
        bumpMap,
        bumpScale,
    });

    // Add white circular path for the planet's orbit
    const orbitPathGeo = new THREE.RingGeometry(data.distance - 0.01, data.distance + 0.01, 64);
    const orbitPathMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
    });
    const orbitPath = new THREE.Mesh(orbitPathGeo, orbitPathMat);
    orbitPath.rotation.x = Math.PI / 2;
    solarSystem.add(orbitPath);

    // Add rings to Saturn
    if (data.name === "Saturn") {
        const ringGeo = new THREE.RingGeometry(0.5, 0.8, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffd27f,
            side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }

    // Add moons to the planet
    if (data.moons) {
        data.moons.forEach((moonData) => {
            const { moon, moonOrbit, speed } = createMoon(moonData);
            planet.add(moonOrbit);
            planets.push({ planet: moon, orbit: moonOrbit, speed });
        });
    }

    solarSystem.add(orbit);
    planets.push({ planet, orbit, speed: data.speed });
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let targetObject = null; // Track the current target object (planet or Sun)

// Create an overlay for displaying planet information
const infoOverlay = document.createElement('div');
infoOverlay.style.position = 'absolute';
infoOverlay.style.top = '10px';
infoOverlay.style.left = '10px';
infoOverlay.style.padding = '10px';
infoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
infoOverlay.style.color = 'white';
infoOverlay.style.fontFamily = 'Arial, sans-serif';
infoOverlay.style.fontSize = '14px';
infoOverlay.style.borderRadius = '5px';
infoOverlay.style.zIndex = '1000'; // Ensure it appears above the canvas
infoOverlay.style.display = 'none'; // Initially hidden
document.body.appendChild(infoOverlay);

// Function to update the overlay with planet information
function updateInfoOverlay(planetData) {
    infoOverlay.style.display = 'block';
    infoOverlay.innerHTML = `
        <strong>${planetData.name}</strong><br>
        Distance from Sun: ${planetData.distance} AU<br>
        Size: ${planetData.size}<br>
        Speed: ${planetData.speed}<br>
        Rotation: ${planetData.rotation || 'N/A'}<br>
        Revolution: ${planetData.revolution || 'N/A'}<br>
        Moons: ${planetData.moons ? planetData.moons.length : 0}
    `;
}

// Hide the overlay when no planet is selected
function hideInfoOverlay() {
    infoOverlay.style.display = 'none';
}

// Add event listener for mouse clicks
window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with planets and the Sun
    const objectsToCheck = planets.map(p => p.planet).concat(sun);
    const intersects = raycaster.intersectObjects(objectsToCheck);
    if (intersects.length > 0) {
        targetObject = intersects[0].object;
        controls.target.copy(targetObject.position); // Update OrbitControls target

        // Find the clicked planet's data
        const clickedPlanet = planets.find(p => p.planet === targetObject);
        if (clickedPlanet) {
            const planetDataEntry = planetData.find(p => p.name === clickedPlanet.planet.name);
            if (planetDataEntry) {
                updateInfoOverlay(planetDataEntry);
            }
        } else if (targetObject === sun) {
            hideInfoOverlay(); // Hide overlay if the Sun is clicked
        }
    }
});

// Smoothly move the camera to the target object
function moveToTargetObject() {
    if (targetObject) {
        const targetPosition = new THREE.Vector3();
        targetObject.getWorldPosition(targetPosition);

        // Smoothly interpolate the camera position
        camera.position.lerp(targetPosition.clone().add(new THREE.Vector3(0, 0, 2)), 0.1);

        // Look at the target object
        camera.lookAt(targetPosition);

        // Stop moving if the camera is close enough
        if (camera.position.distanceTo(targetPosition.clone().add(new THREE.Vector3(0, 0, 2))) < 0.1) {
            targetObject = null;
        }

        // Hide the overlay when the camera stops moving
        if (!targetObject) {
            hideInfoOverlay();
        }
    }
}

// Update the animation loop to include camera movement and panning
function animate(t = 0) {
    requestAnimationFrame(animate);

    // Rotate the Sun
    sun.rotation.y = t * 0.0001;

    // Update planet orbits
    planets.forEach(({ orbit, speed }) => {
        orbit.rotation.y += speed;
    });

    // Move the camera to the target object if needed
    moveToTargetObject();

    mesh.rotation.y = t * 0.0001; // Rotate the main globe if needed
    renderer.render(scene, camera);
    controls.update(); // Allow panning around the target
}
animate();
