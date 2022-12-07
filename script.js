import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

let scene, 
    camera, 
    mouse, 
    renderer, 
    raycaster, 
    controls, 
    city, 
    buildings,
    sunGroup,
    rotateEnabled,
    unselectedColor,
    selectedColor,
    selectedObject,
    removing,
    adding,
    updating;

function Initialize() {

  ///     INITIALIZING     ///

  //renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  // Mouse actions
  mouse = new THREE.Vector2(1,1); //mouse coordinates
  raycaster = new THREE.Raycaster();

  //Camera
  const fov = 60;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000.0;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  camera.lookAt(new THREE.Vector3(0,3,0));
  
  //scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x29293d);
  
  //Light
  let sunColor = new THREE.Vector3(1.0, 1.0, 1.0);
  let sunIntensity = 1.0;
  let sunPos = new THREE.Vector3(0, 10, 0);
  let sun = new THREE.DirectionalLight(sunColor, sunIntensity);
  sun.position.set(sunPos.x, sunPos.y, sunPos.z);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.bias = -0.001;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 500.0;
  sun.shadow.camera.left = 100;
  sun.shadow.camera.right = -100;
  sun.shadow.camera.top = 100;
  sun.shadow.camera.bottom = -100;
  
  sunGroup = new THREE.Group(); //used to turn the sun around the city with rotation center (0,0,0)
  sunGroup.add(sun);
  
  const ambiantLight = new THREE.AmbientLight(0x080802);
  scene.add(ambiantLight);
  
  const hemiLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.2);
  scene.add(hemiLight);
  
  //CONTROLS
  controls = new OrbitControls(
    camera, 
    renderer.domElement);
  controls.target.set(0, 3, 0);
  
  //Options
  rotateEnabled = false;
  selectedObject = null;
  removing = false;
  adding = false;
  updating = false;

  //MATERIALS
  unselectedColor =  new THREE.Color(0xffffff);
  selectedColor = new THREE.Color(0x00ffff);
  
  const loader = new THREE.TextureLoader();
  
  const buildTextMaterial = new THREE.MeshStandardMaterial({
    map: loader.load('resources/building2.jpg')
  });
  
  // uniform to provide to the shaders
  var myUniforms = {
    pos_lumiere : {type: "v3", value: sunPos},
    poscamera : {type: "v3", value: camera.position},
    col_lumiere : {type: "v3", value: sunColor},
    col_obj: {type: "v3", value: new THREE.Vector3(1.0, 0.6, 0.3)},
    col_spec_lumiere : {type: "v3", value: sunColor},
    col_spec_obj : {type: "v3", value: new THREE.Vector3(1.0, 0.6, 0.3)},
    alpha : {type: "f", value: 1}
  };
    
      
  var shaderMaterial = new THREE.ShaderMaterial({
      uniforms : myUniforms,
      flatShading : true,
      vertexShader:   document.getElementById('vertex_shader').textContent,
      fragmentShader: document.getElementById('fragment_shader').textContent
  });

  // City

  city = new THREE.Group();
  city.add(sunGroup);
  buildings = new THREE.Group();
  city.add(buildings);
  scene.add(city);

  const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
          color: 0xe4bb67, 
          side: THREE.DoubleSide
      }));
  plane.castShadow = false;
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  city.add(plane);
  
  const parkGeometry= new THREE.PlaneGeometry(4,5); 
  const parkMaterial = new THREE.MeshStandardMaterial({
      color: 0x99cc00
  });
  let park = new THREE.Mesh(parkGeometry, parkMaterial);
  park.castShadow = false;
  park.receiveShadow = true;
  city.add(park);

  park.rotation.x = -Math.PI / 2;
  park.position.y += 0.01;
  
  function newBuilding(width, height, depth, buildings){
      const boxGeometry= new THREE.BoxGeometry(width,height,depth);
      const material = new THREE.MeshStandardMaterial({color: unselectedColor});
      const building = new THREE.Mesh(boxGeometry, material);
      building.castShadow = true;
      building.receiveShadow = true;
      building.position.y += height / 2 + 0.001;
      building.rotation.y = Math.PI / 2;
      buildings.add(building);
      return building
  }
  let tower1 = newBuilding(1,5,1, buildings);
  let tower2 = newBuilding(1,5,1, buildings);
  let tower3 = newBuilding(1,7,1, buildings);
  let tower4 = newBuilding(1,5,1.5, buildings);

  let build1 = newBuilding(2,3,1, buildings);
  let build2 = newBuilding(2.25,2,2, buildings);
  let build3 = newBuilding(2,3,1, buildings);

  let house1 = newBuilding(1,0.75,0.75, buildings);
  let house2 = newBuilding(1,1,0.75, buildings);
  let house3 = newBuilding(1,1,0.75, buildings);
  let house4 = newBuilding(1,0.75,0.75, buildings);

  tower1.position.x += 4.25; tower1.position.z += 0.5;
  tower2.position.x -= 4.25; tower2.position.z += 1.75;
  tower3.position.x += 4.25; tower3.position.z += 1.75;
  tower4.position.x -= 2; tower4.position.z -= 3.25;

  build1.position.x -= 4.25;
  build2.position.x -= 3.75; build2.position.z += 3.5;
  build3.position.x += 2.75; build3.position.z += 0;

  house1.position.x -= 2.5; house1.position.z += 0.25;
  house2.position.x -= 2.5; house2.position.z += 1.25;
  house3.position.x -= 2.5; house3.position.z -= 0.75;
  house4.position.x -= 2.5; house4.position.z -= 1.75;

  city.rotation.y += Math.PI / 4;
  window.requestAnimationFrame(animate);
}

function onPointerMove( event ) {
  event.preventDefault();
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  var rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
  mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;

}

function onPointerDown( event ){
  event.preventDefault();
  if(selectedObject){
    if(removing){
      buildings.remove(selectedObject);
    }
  }
}

function hoverBuildings(){
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(buildings.children, true);
  if(intersects.length > 0){
    if(intersects[0].object){
      intersects[0].object.material.transparent = true;
      intersects[0].object.material.opacity = 0.5;
      intersects[0].object.material.color = selectedColor;
      selectedObject = intersects[0].object;
    }
  }
}

function resetMaterial(object){
  if(object.material){
    object.material.opacity = 1.0;
    object.material.color = unselectedColor;
    selectedObject = null;
  }
}

function OnWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(){
  window.requestAnimationFrame(animate);
  controls.update();

  if(adding || removing || updating){
    //making sure that no object remains selected when it's not hovered.
    if (selectedObject){
        resetMaterial(selectedObject);
        selectedObject = null;
    }

    //selecting building if it is hovered
    hoverBuildings();

  }
  if(rotateEnabled){
    city.rotation.y += 0.005;
  }
  if (sunGroup.rotation.z < 0){
    sunGroup.rotation.z += 0.05;
  }
  else {
    sunGroup.rotation.z += 0.001;
  }

  renderer.render(scene, camera);
}


// HTML INTERACTIONS

document.getElementById("addButton").onclick = function() {
  removing = false;
  updating = false;
  adding = !adding;
};
document.getElementById("removeButton").onclick = function() {
  removing = !removing;
  adding = false;
  updating = false;
};
document.getElementById("updateButton").onclick = function() {
  adding = false;
  removing = false;
  updating = !updating;
};
document.getElementById("rotationButton").onclick = function() {ChangeRotationState()};

function ChangeRotationState(){
  const previous = rotateEnabled;
  rotateEnabled = !rotateEnabled;
  if (previous){
    document.getElementById("rotationButton").innerHTML = "Enable Rotation";
  }
  else{
    document.getElementById("rotationButton").innerHTML = "Disable Rotation";
  }
}

//EVENT LISTENERS

window.addEventListener('resize', () => {
  OnWindowResize();
}, false);
window.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);

window.onload = Initialize;

