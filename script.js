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
    plane,
    sunGroup,
    sunDefaultRotation,
    rotateEnabled,
    realisticSunlight,
    unselectedColor,
    selectedColor,
    selectedObject,
    point,
    removing,
    adding,
    house,
    tower,
    medium_building,
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
  sunDefaultRotation = 0.3;
  sunGroup.rotation.z = sunDefaultRotation;
  
  const ambiantLight = new THREE.AmbientLight(0x080802);
  scene.add(ambiantLight);
  
  const hemiLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.25);
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
  house = false;
  tower = false;
  medium_building = false;
  realisticSunlight = false;
  point = null;


  //MATERIALS
  unselectedColor =  new THREE.Color(0xffffff);
  selectedColor = new THREE.Color(0x00ffff);
  
  const loader = new THREE.TextureLoader();
  let towerTexture = loader.load('resources/building2.jpg');
  towerTexture.wrapS = THREE.RepeatWrapping;
  towerTexture.wrapT = THREE.RepeatWrapping;
  towerTexture.repeat.set( 1, 1 );

  let buildTexture = loader.load('resources/house.jpg');
  towerTexture.wrapS = THREE.RepeatWrapping;
  towerTexture.wrapT = THREE.RepeatWrapping;
  towerTexture.repeat.set( 1, 1 );
  
  let houseTexture = loader.load('resources/building3.jpg');
  towerTexture.wrapS = THREE.RepeatWrapping;
  towerTexture.wrapT = THREE.RepeatWrapping;
  towerTexture.repeat.set( 1, 1 );

  // City

  city = new THREE.Group();
  city.add(sunGroup);
  buildings = new THREE.Group();
  city.add(buildings);
  scene.add(city);

  plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
          color: 0xBCB9AE, 
          side: THREE.DoubleSide
      }));
  plane.castShadow = false;
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  city.add(plane);
  
  const parkGeometry= new THREE.PlaneGeometry(4,5); 
  const parkMaterial = new THREE.MeshStandardMaterial({
      color: 0x6CB63B
  });
  let park = new THREE.Mesh(parkGeometry, parkMaterial);
  park.castShadow = false;
  park.receiveShadow = true;
  city.add(park);

  park.rotation.x = -Math.PI / 2;
  park.position.y += 0.01;
  
    //new buildings functions 
    function newBuilding(width, height, depth, buildings){
      const boxGeometry= new THREE.BoxGeometry(width,height,depth);
      const buildTextMaterial = new THREE.MeshStandardMaterial({
        map: buildTexture
      });
      const building = new THREE.Mesh(boxGeometry, buildTextMaterial);
      building.castShadow = true;
      building.receiveShadow = true;
      building.position.y += height / 2 + 0.001;
      building.rotation.y = Math.PI / 2;
      buildings.add(building);
      return building
  }
  function newTower(width, height, depth, buildings){
    const boxGeometry= new THREE.BoxGeometry(width,height,depth);
    const buildTextMaterial = new THREE.MeshStandardMaterial({
      map: towerTexture
    });
    const building = new THREE.Mesh(boxGeometry, buildTextMaterial);
    building.castShadow = true;
    building.receiveShadow = true;
    building.position.y += height / 2 + 0.001;
    building.rotation.y = Math.PI / 2;
    buildings.add(building);
    return building
  }
  
  
  function newHouse(width, height, depth, buildings){
    const boxGeometry= new THREE.BoxGeometry(width,height,depth);
    const buildTextMaterial = new THREE.MeshStandardMaterial({
      map: houseTexture
    });
    const building = new THREE.Mesh(boxGeometry, buildTextMaterial);
    building.castShadow = true;
    building.receiveShadow = true;
    building.position.y += height / 2 + 0.001;
    building.rotation.y = Math.PI / 2;
    buildings.add(building);
    return building
  }

  let tower1 = newTower(1,5,1, buildings);
  let tower2 = newTower(1,5,1, buildings);
  let tower3 = newTower(1,7,1, buildings);
  let tower4 = newTower(1,5,1.5, buildings);
  let tower5 = newTower(1,5,1, buildings);
  let tower6 = newTower(1,7,2, buildings);
  let tower7 = newTower(1,5,1, buildings);
  let tower8 = newTower(1,5,1, buildings);
  let tower9 = newTower(1,7,1, buildings);
  let tower10 = newTower(1,7,2, buildings);
  let tower11 = newTower(1,5,1, buildings);
  let tower12 = newTower(1,5,1, buildings);
  let tower13 = newTower(1,7,1, buildings);

  let build1 = newBuilding(2,3,1, buildings);
  let build2 = newBuilding(2.25,2,2, buildings);
  let build3 = newBuilding(2,3,1, buildings);
  let build4 = newBuilding(2,3,1, buildings);
  let build5 = newBuilding(2,3,1, buildings);

  let house1 = newHouse(1,0.75,0.75, buildings);
  let house2 = newHouse(1,1,0.75, buildings);
  let house3 = newHouse(1,1,0.75, buildings);
  let house4 = newHouse(1,0.75,0.75, buildings);

  tower1.position.x += 4.25; tower1.position.z += 0.5;
  tower2.position.x -= 4.25; tower2.position.z += 1.75;
  tower3.position.x += 4.25; tower3.position.z += 1.75;
  tower4.position.x -= 2; tower4.position.z -= 3;
  tower5.position.x += 4.25; tower5.position.z += -0.5;
  tower6.position.x += 0; tower6.position.z += -4.25;
  tower7.position.x += 1.5; tower7.position.z += -4.25;
  tower8.position.x += 3; tower8.position.z += -4.25;
  tower9.position.x += 4.25; tower9.position.z += -4.25;
  tower10.position.x += 3.75; tower10.position.z += 4.25;
  tower11.position.x += 2; tower11.position.z += 4.25;
  tower12.position.x += -2; tower12.position.z += 4.25;
  tower13.position.x += -4.25; tower13.position.z += -3.5;

  build1.position.x -= 4.25;
  build2.position.x -= 3.75; build2.position.z += 3.5;
  build3.position.x += 2.75; build3.position.z += 1.25;
  build4.position.x -= 4.25; build4.position.z += -2;
  build5.position.x += 2.75; build5.position.z += -1.25;

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

function hoverPlane(){
  raycaster.setFromCamera(mouse, camera);
  const intersect = raycaster.intersectObject(plane, true);
  console.log("intersect : ", intersect[0].point);
  if(intersect[0]){
    if(intersect[0].point){
      point = intersect[0].point;
    }
  }
}

function onKeyDown(event){
  console.log("onKeyDown");
  let keyCode = event.code;
  if (keyCode == 'Enter') {
    if(removing){
      buildings.remove(selectedObject);
    }
    else if(adding){
      if(house){
        console.log("onKeyDown->Adding->house entered.");
        let newHouse = newHouse(1,1,0.75, buildings);
        newHouse.position.x += point.x;
        newHouse.position.z += point.z;
        buildings.add(newHouse);
      }
    }
    if(updating){
      document.addEventListener("keydown", onKeyDownUpdate,false);
    }
  }
}

function onKeyDownUpdate(event){
  if(event.key == 0 
    || event.key == 1
    || event.key == 2
    || event.key == 3
    || event.key == 4
    || event.key == 5
    || event.key == 6
    || event.key == 7
    || event.key == 8
    || event.key == 9){
      selectedObject.scale.y = event.key;
      selectedObject.position.y = event.key;
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

///     MAIN FUNCTION     ///

function animate(){
  window.requestAnimationFrame(animate);
  controls.update();

  if(removing || updating){
    //making sure that no object remains selected when it's not hovered.
    if (selectedObject){
        resetMaterial(selectedObject);
        selectedObject = null;
    }
    
    //selecting building if it is hovered
    hoverBuildings();

    if(selectedObject){
      document.addEventListener("keydown", onKeyDown, false);
    }
  }
  else if(adding){
    if (selectedObject){
      resetMaterial(selectedObject);
      selectedObject = null;
    }
    if (point){
      point = null;
    }
    hoverPlane();
    if(point){
      document.addEventListener("keydown", onKeyDown, false);
    }
  }
  if(rotateEnabled){
    city.rotation.y += 0.005;
  }
  if(realisticSunlight){

      if (sunGroup.rotation.z < 0){
        sunGroup.rotation.z += 0.05;
      }
      else {
        sunGroup.rotation.z += 0.001;
      }
  }

  renderer.render(scene, camera);
}


// HTML INTERACTIONS

document.getElementById("addButton").onclick = function() {
  removing = false;
  updating = false;
  adding = !adding;
};
document.getElementById("house").onclick = function() {
  house = true;
  tower = false;
  medium_building = false;
  removing = false;
  updating = false;
  if(!adding){adding = true;}
  console.log("adding : ", adding, "house", house);
};
document.getElementById("tower").onclick = function() {
  house = false;
  tower = true;
  medium_building = false;
  removing = false;
  updating = false;
  if(!adding){adding = true;}
};
document.getElementById("medium_building").onclick = function() {
  house = false;
  tower = false;
  medium_building = true;
  removing = false;
  updating = false;
  if(!adding){adding = true;}
};

document.getElementById("removeButton").onclick = function() {
  console.log("onclick Remove");
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
document.getElementById("realisticSunlight").onclick = function(){ChangeSunlightState()}

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

function ChangeSunlightState(){
  const previous = realisticSunlight;
  realisticSunlight = !realisticSunlight;
  if (previous){
    sunGroup.rotation.z = sunDefaultRotation;
    document.getElementById("realisticSunlight").innerHTML = "Enable Realistic Sunlight";
  }
  else{
    document.getElementById("realisticSunlight").innerHTML = "Disable Realistic Sunlight";
  }
}


//EVENT LISTENERS

window.addEventListener('resize', () => {
  OnWindowResize();
}, false);

window.addEventListener('pointermove', onPointerMove);

window.onload = Initialize;

