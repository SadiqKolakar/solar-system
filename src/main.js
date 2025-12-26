import * as THREE from 'three';
import { Sun } from './components/Sun.js';
import { Planet } from './components/Planet.js';
import { AsteroidBelt } from './components/AsteroidBelt.js';
import { CameraController } from './utils/cameraController.js';
import planetsData from './data/planets.json';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Stars Background
const starGeo = new THREE.BufferGeometry();
const starCount = 10000;
const starPos = [];
for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 8000;
    const y = (Math.random() - 0.5) * 8000;
    const z = (Math.random() - 0.5) * 8000;
    starPos.push(x, y, z);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.6 });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// Camera Controller
const cameraController = new CameraController(camera, renderer.domElement);

// Objects
const objects = [];
const updatables = [];

// Load Data
const sunData = planetsData.find(p => p.id === 'sun');
const sun = new Sun(scene, sunData);
objects.push(sun.mesh);
updatables.push(sun);

// Planets
const planets = [];
planetsData.filter(p => p.id !== 'sun').forEach(data => {
    const planet = new Planet(scene, data);
    planets.push(planet);
    objects.push(planet.mesh);
    updatables.push(planet);
});

// Asteroid Belt
const asteroidBelt = new AsteroidBelt(scene);
updatables.push(asteroidBelt);

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// UI Elements
const landingScreen = document.getElementById('landing-screen');
const startBtn = document.getElementById('start-btn');
const infoPanel = document.getElementById('info-panel');
const resetBtn = document.getElementById('reset-btn');
const tourBtn = document.getElementById('tour-btn');
const loadingText = document.getElementById('loading');

loadingText.style.display = 'none';

// Event Listeners
startBtn.addEventListener('click', () => {
    landingScreen.classList.add('hidden');
    cameraController.reset();
});

resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    cameraController.reset();
    hideInfo();
});

tourBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const earth = planets.find(p => p.data.id === 'earth');
    if (earth) {
        cameraController.focusOn(earth.mesh);
        showInfo(earth.data);
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', onMouseClick);

function onMouseClick(event) {
    if (event.target.closest('button') || event.target.closest('#info-panel')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target.parent && !target.userData.data) {
            target = target.parent;
        }

        if (target.userData.data) {
            const data = target.userData.data;
            showInfo(data);
            cameraController.focusOn(target);
        }
    }
}

function showInfo(data) {
    document.getElementById('planet-name').textContent = data.name;
    document.getElementById('planet-type').textContent = data.type.replace('_', ' ').toUpperCase();
    document.getElementById('planet-desc').textContent = data.description;

    if (data.details) {
        document.getElementById('planet-distance').textContent = `${data.distance} units`; // Using units for now
        document.getElementById('planet-day').textContent = data.details.temperature || 'N/A'; // Reusing field for temp
        document.getElementById('planet-year').textContent = `${data.orbitalPeriod} days`;
        document.getElementById('planet-temp').textContent = data.details.massKg || 'N/A'; // Reusing field for mass

        // Update labels to match data
        document.querySelectorAll('.detail-label')[1].textContent = "Temperature";
        document.querySelectorAll('.detail-label')[3].textContent = "Mass";
    }

    infoPanel.classList.add('visible');
}

function hideInfo() {
    infoPanel.classList.remove('visible');
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    updatables.forEach(obj => obj.update());
    cameraController.update();

    renderer.render(scene, camera);
}

// Initial Camera Position
camera.position.set(0, 200, 400);
camera.lookAt(0, 0, 0);

animate();
