import * as THREE from "three";
import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

const width = window.innerWidth;
const height = window.innerHeight;
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100);
camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);
console.log(renderer.domElement);

const cameraControls = new CameraControls(camera, renderer.domElement);
cameraControls.mouseButtons.right = CameraControls.ACTION.OFFSET;

const raycaster = new THREE.Raycaster();

const box = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    opacity: 0.8,
    transparent: true,
    side: THREE.DoubleSide
  })
);
scene.add(box);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(sphere);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

renderer.domElement.addEventListener("mousedown", (event) =>
  setOrbitPoint(event.clientX, event.clientY)
);
renderer.domElement.addEventListener("touchstart", (event) =>
  setOrbitPoint(
    event.changedTouches[0].clientX,
    event.changedTouches[0].clientY
  )
);

renderer.render(scene, camera);

window.addEventListener("resize", onWindowResize);

(function anim() {
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();
  const updated = cameraControls.update(delta);

  requestAnimationFrame(anim);
  updated && renderer.render(scene, camera);
})();

const normalizedMouse = new THREE.Vector2();

function onWindowResize() {
  console.log("handleResize");
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function moveAlongZAxis() {
  console.log("move");
}

function setOrbitPoint(mouseX, mouseY) {
  const elRect = renderer.domElement.getBoundingClientRect();
  const canvasX = mouseX - elRect.left;
  const canvasY = mouseY - elRect.top;

  normalizedMouse.set(
    (canvasX / elRect.width) * 2.0 - 1.0,
    ((elRect.height - canvasY) / elRect.height) * 2.0 - 1.0
  );

  camera.updateMatrixWorld();
  raycaster.setFromCamera(normalizedMouse, camera);

  const intersections = raycaster.intersectObjects(scene.children);
  const filtered = intersections.filter(
    (intersection) => intersection.object === box
  );

  if (filtered.length !== 0) {
    sphere.position.copy(filtered[0].point);
    cameraControls.setOrbitPoint(
      filtered[0].point.x,
      filtered[0].point.y,
      filtered[0].point.z,
      false
    );
  }
}

window.moveAlongZAxis = moveAlongZAxis;
