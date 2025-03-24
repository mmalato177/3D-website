import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as THREE from 'three';

/**
* Generates and Manages the 3D Scene
*/
class ThreeDLoader {
    constructor() {
        this.scene = new THREE.Scene();
        this.pointLightFront;
        this.pointLightBack;
        this.ambientLight;

        let width = 1100;
        let height = 550;

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        this.camera.position.set(0.8, 1, 2.5);

        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Renderer
        this.canvas_3d = document.getElementById('canvas-3d');
        this.renderer = new THREE.WebGLRenderer({ canvas:  this.canvas_3d });
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0xeaeaea, 1);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);       
        this.controls.rotateSpeed = 0.4;

        // Animation
        this.__animate = this.animate.bind(this)
        this.delta = 0;
        this.clock = new THREE.Clock();
        this.minimum_latency = 1 / 60;

        // Objects
        this.objects = Array();

        // Materials
        this.nogueiraWood = new THREE.Color(0xffffff);
        this.nogueiraWood2 = new THREE.Color(0x553116);
        this.nogueiraWicker = new THREE.Color(0xffffff);

        this.imbuiaWood = new THREE.Color(0x8f8f8f);
        this.imbuiaWood2 = new THREE.Color(0x331d0d);
        this.imbuiaWicker = new THREE.Color(0xffffff);

        //Animations
        this.mixer;
        this.areDrawersOpen = false;
        this.isDrawerLOpen = false;
        this.isDrawerROpen = false;
        this.areDoorsOpen = false;
        this.isDoorLOpen = false;
        this.isDoorROpen = false;
     
        
        this.actionDrawerR;
        this.actionDrawerL;
        this.actionDoorR;
        this.actionDoorL;

        // Elements
        this.chk_plant;
        this.chk_laptop;
        this.chk_lamp;
        this.chk_books;

        this.neutral;
        this.warm;
        this.cold;
        
        this.intensitySlider;

        this.materialId;


        this.init()
    }

    init() {
        this.getElements();
        this.setEventListeners();
        this.load3DModel();
        
        this.canvas_3d.onclick = (event) => {
            var limits = event.target.getBoundingClientRect();

            this.mouse.x = 2 * (event.clientX - limits.left) / parseInt(this.canvas_3d.style.width) - 1;
            this.mouse.y = 1 - 2 *(event.clientY - limits.top) / parseInt(this.canvas_3d.style.height);
            
            this.catchFirst()
        }
    }

    getElements() {
        this.neutral = document.getElementById('normal');
        this.warm = document.getElementById('quente');
        this.cold = document.getElementById('fria');

        this.chk_plant = document.getElementById('chk_plant');
        this.chk_laptop = document.getElementById('chk_laptop');
        this.chk_lamp = document.getElementById('chk_lamp');
        this.chk_books = document.getElementById('chk_books');
        this.intensitySlider = document.getElementById('intensity');
        this.materialId = document.getElementById("inject-material");
    }

    /** 
    * Sets all Event Listeners.
    */
    setEventListeners() {
        // RePosition
        document.getElementById('repos').addEventListener('click',() => {
            this.repos();
        } );

        // Material
        document.getElementById('material1').addEventListener('click', () => {
            this.injectMaterial('Nogueira');
            this.changeMaterial(this.nogueiraWood, this.nogueiraWood2, this.nogueiraWicker);
        });
        document.getElementById('material2').addEventListener('click', () => {
            this.injectMaterial('Imbuia');
            this.changeMaterial(this.imbuiaWood, this.imbuiaWood2, this.imbuiaWicker);
        });

        // Objects
        this.chk_plant.addEventListener('change', () => this.displayObject(this.scene.getObjectByName("Plant"), this.chk_plant));
        this.chk_laptop.addEventListener('change', () => this.displayObject(this.scene.getObjectByName("Teclado"), this.chk_laptop));
        this.chk_lamp.addEventListener('change', () => this.displayObject(this.scene.getObjectByName("lamp"), this.chk_lamp));
        this.chk_books.addEventListener('change', () => {
            this.displayObject(this.scene.getObjectByName("book1"), this.chk_books)
            this.displayObject(this.scene.getObjectByName("book2"), this.chk_books)
        });

        // Animations
        document.getElementById('toggleDrawers').addEventListener('click', () => this.toggleDrawers());
        document.getElementById('toggleDoors').addEventListener('click', () => this.toggleDoors());

        // Lights
        this.intensitySlider.addEventListener('input', () => this.intensityInput());
        this.neutral.addEventListener('change', () => this.updateLights(0xffffff, this.neutral));
        this.warm.addEventListener('change', () => this.updateLights(0xfff2b5 , this.warm));
        this.cold.addEventListener('change', () => this.updateLights(0xbbf8ff, this.cold));
    }

    /**
     * Cleans all events created
     */
    cleanEventListeners() {
        // RePosition
        document.getElementById('repos').removeEventListener('click',() => {
            this.repos();
        } );

        // Material
        document.getElementById('material1').removeEventListener('click', () => {
            this.injectMaterial('Nogueira');
            this.changeMaterial(this.nogueiraWood, this.nogueiraWood2, this.nogueiraWicker);
        });
        document.getElementById('material2').removeEventListener('click', () => {
            this.injectMaterial('Imbuia');
            this.changeMaterial(this.imbuiaWood, this.imbuiaWood2, this.imbuiaWicker);
        });

        // Objects
        this.chk_plant.removeEventListener('change', () => this.displayObject(this.scene.getObjectByName("Plant"), this.chk_plant));
        this.chk_laptop.removeEventListener('change', () => this.displayObject(this.scene.getObjectByName("Teclado"), this.chk_laptop));
        this.chk_lamp.removeEventListener('change', () => this.displayObject(this.scene.getObjectByName("lamp"), this.chk_lamp));
        this.chk_books.removeEventListener('change', () => {
            this.displayObject(this.scene.getObjectByName("book1"), this.chk_books);
            this.displayObject(this.scene.getObjectByName("book2"), this.chk_books);
        });

        // Animations
        document.getElementById('toggleDrawers').removeEventListener('click', () => this.toggleDrawers());
        document.getElementById('toggleDoors').removeEventListener('click', () => this.toggleDoors());

        //Lights
        this.intensitySlider.removeEventListener('input', () => this.intensityInput());
        this.neutral.removeEventListener('change', () => this.updateLights(0xffffff, this.neutral));
        this.warm.removeEventListener('change', () => this.updateLights(0xfff2b5 , this.warm));
        this.cold.removeEventListener('change', () => this.updateLights(0xbbf8ff, this.cold));
    }

    
    repos(){
        this.controls.reset(); 
        this.resetActions();
        this.intensitySlider.value = 17.5;
        this.intensityInput();
    }


    // Lights

    intensityInput(){
        const intensity = parseFloat(this.intensitySlider.value);
        
        this.pointLightFront.intensity = intensity * 1.2;
        this.ambientLight.intensity = intensity * 0.07;
        this.pointLightBack.intensity = intensity * 0.8;
    }

    updateLights(type, radioBox){
        if (radioBox.checked) {
            let color = new THREE.Color(type)
            this.pointLightFront.color = color;
            this.pointLightBack.color = color;
            this.ambientLight.color = color;
        }
    }

    lights() {
        this.pointLightFront= new THREE.PointLight("white")
        this.pointLightFront.position.set(0, 2, 2)
        this.scene.add(this.pointLightFront)

        this.pointLightBack= new THREE.PointLight("white")
        this.pointLightBack.position.set(-2, 2, -2)
        this.scene.add(this.pointLightBack)

        this.ambientLight= new THREE.AmbientLight("white")
        this.scene.add(this.ambientLight)

        this.intensityInput();
    }

    
    // Animations

    execAction(action, isOpen) {
        let time = action.time
        action.reset();
    
        action.clampWhenFinished = true;
        action.setLoop(THREE.LoopOnce);
    
        const onAnimationFinished = () => {
            action.paused = true;
            action.playState = "paused";
            action.finished && action.finished.clear(); 
        };

        action.finished = new Promise(resolve => {
            action._resolve = resolve;
        });

        action.finished.then(onAnimationFinished);
        
        action.time = time; 
        action.timeScale = isOpen? -1 : 1;
        
        action.play();
    }
    
    toggleDrawers() {
        this.execAction(this.actionDrawerR, this.areDrawersOpen);
        this.execAction(this.actionDrawerL, this.areDrawersOpen);
        this.areDrawersOpen = !this.areDrawersOpen;
        this.isDrawerLOpen = this.isDrawerROpen = this.areDrawersOpen;
    }
    
    toggleDoors() {
        this.execAction(this.actionDoorR, this.areDoorsOpen);
        this.execAction(this.actionDoorL, this.areDoorsOpen);
        this.areDoorsOpen = !this.areDoorsOpen;
        this.isDoorLOpen = this.isDoorROpen = this.areDoorsOpen;
    }

    resetActions(){
        this.actionDrawerR.stop();
        this.actionDrawerL.stop();
        this.actionDoorR.stop();
        this.actionDoorL.stop();

        this.areDrawersOpen = false;
        this.isDrawerLOpen = false;
        this.isDrawerROpen = false;
        this.areDoorsOpen = false
        this.isDoorLOpen = false;
        this.isDoorROpen = false;
    }

    animate() {
        requestAnimationFrame(this.__animate);
        this.delta += this.clock.getDelta();
        if (this.delta < this.minimum_latency) return;

        let excess = this.delta % this.minimum_latency;

        if (this.mixer) {
            this.mixer.update(this.delta - excess);
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.delta = excess;
    }


    // Raycaster

    catchFirst() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        let intersected = this.raycaster.intersectObjects(this.objects)

        if (intersected.length > 0 && intersected[0].object.parent.name) {
            switch (intersected[0].object.parent.name) {
                case "Porta_R":
                    this.execAction(this.actionDoorR, this.isDoorROpen);
                    this.isDoorROpen = !this.isDoorROpen;
                    break;
                case "Porta_L":
                    this.execAction(this.actionDoorL, this.isDoorLOpen);
                    this.isDoorLOpen = !this.isDoorLOpen;
                    break;
                case "Gaveta_R":
                    this.execAction(this.actionDrawerR, this.isDrawerROpen);
                    this.isDrawerROpen = !this.isDrawerROpen;
                    break;
                case "Gaveta_L":
                    this.execAction(this.actionDrawerL, this.isDrawerLOpen);
                    this.isDrawerLOpen = !this.isDrawerLOpen;
                    break;
                default:
                    break;
            }
        }
    }


    // Objects

    displayObject(object, checkbox) {
        object ? object.visible = checkbox.checked : console.log("Object to display is null");
    }


    // Material 

    injectMaterial(name) {
        this.materialId.innerHTML = name;
    }

    changeMaterial(wood, wood2, wicker ) {
        this.objects.forEach( object => {
            if (object.type == "Group"){
                // wood
                object.children[0].material.color = wood;
                switch (object.name) {
                    case "Porta_R":
                    case "Porta_L":
                        //wicker
                        object.children[1].material.color = wicker;
                        break;
        
                    case "Gaveta_R":
                    case "Gaveta_L":
                        //wood
                        object.children[1].material.color  = wood2;
                        break;

                    default:
                        break;
                }
            } else {
                //wood
                object.material.color = wood;
            }
        });
    }


    /** 
    * Loads and Sets all the Scene related subjects.
    */
    async load3DModel() {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                './src/obj/vintageDesk.gltf',
                (gltf) => {
                    gltf.scene.traverse((child) => {
                        switch (child.name) {
                            case "Porta_R":
                            case "Gaveta_R":
                            case "Porta_L":
                            case "Gaveta_L":
                            case "Tampo":
                            case "Tampo2":
                            case "Pés":
                            case "Nicho":
                                this.objects.push(child);
                                break;

                            default:
                                break;
                        }
                    });

                    this.scene.add(gltf.scene);

                    let clipe1 = THREE.AnimationClip.findByName(gltf.animations, "GavetaEsquerda");
                    let clipe2 = THREE.AnimationClip.findByName(gltf.animations, "GavetaDir");
                    let clipe3 = THREE.AnimationClip.findByName(gltf.animations, "PortaEsq");
                    let clipe4 = THREE.AnimationClip.findByName(gltf.animations, "PortaDir");
                    if (clipe1 && clipe2 && clipe3 && clipe4) {
                        this.mixer = new THREE.AnimationMixer(this.scene);
                        this.actionDrawerL = this.mixer.clipAction(clipe1);
                        this.actionDrawerR = this.mixer.clipAction(clipe2);
                        this.actionDoorL = this.mixer.clipAction(clipe3);
                        this.actionDoorR = this.mixer.clipAction(clipe4);
                    } else {
                        console.error("Animação não encontrada");
                    }

                    resolve();
                },
                undefined,
                reject
            );
        })
        .then(() => {
            if(this.materialId.innerHTML == "Nogueira"){
                this.changeMaterial(this.nogueiraWood, this.nogueiraWood2, this.nogueiraWicker);
            } else if(this.materialId.innerHTML == "Imbuia"){
                this.changeMaterial(this.imbuiaWood, this.imbuiaWood2, this.imbuiaWicker);
            }

            this.lights();
            this.animate();
        })
        .catch((error) => {
            console.error("Model loading error:", error);
        });
    }
}

class ImageLoader {
    constructor() {
        this.carouselInner = document.getElementById('carouselInner');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.imagePaths = [
            './src/images/desk-1.jpg',
            './src/images/desk-2.jpg',
            './src/images/desk-3.jpg',
            './src/images/desk-4.jpg',
            './src/images/desk-5.jpg',
            './src/images/desk-6.jpg',
            './src/images/desk-7.jpg',
        ];
        this.numberOfSlides = this.imagePaths.length;
        this.slideWidth = 900;
        this.currentIndex = 0;

        this.init();
    }
    
    setEventListeners() {
        this.prevBtn.addEventListener('click', () => this.showPrevSlide());
        this.nextBtn.addEventListener('click', () => this.showNextSlide());
        document.getElementById('material1').addEventListener('click', () => this.injectMaterial('Nogueira'));
        document.getElementById('material2').addEventListener('click', () => this.injectMaterial('Imbuia'));
    }


    cleanEventListeners() {
        this.prevBtn.removeEventListener('click', () => this.showPrevSlide());
        this.nextBtn.removeEventListener('click', () => this.showNextSlide());
        document.getElementById('material1').removeEventListener('click', () => this.injectMaterial('Nogueira'));
        document.getElementById('material2').removeEventListener('click', () => this.injectMaterial('Imbuia'));
    }

    init() {
        this.injectSlides();
        this.setEventListeners();
    }
    
    injectMaterial(name) {
        document.getElementById("inject-material").innerHTML = name;
    }

    injectSlides() {
        this.imagePaths.forEach((path) => {
            const slide = document.createElement('div');
            slide.classList.add('carousel-item');
            const img = document.createElement('img');
            img.src = path;
            img.alt = 'Slide';
            img.setAttribute('data-enlargable', '');
            slide.appendChild(img);
            this.carouselInner.appendChild(slide);
        });
    }

    showSlide(index) {
        const newTransformValue = -index * this.slideWidth + 'px';
        this.carouselInner.style.transform = 'translateX(' + newTransformValue + ')';
    }

    showPrevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.numberOfSlides) % this.numberOfSlides;
        this.showSlide(this.currentIndex);
    }

    showNextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.numberOfSlides;
        this.showSlide(this.currentIndex);
    }
}


/**
* Responsable for changing between media. 3d and img.
*/
function mediaController() {
    let media_container = document.getElementById('media-container');
    let media = document.getElementById('media');
    let button = document.getElementById('inject');
    let mediaLoader = null;

    /** 
    * Replace the HTML inside media to 3D media
    */
    function injectThreeD() {
        media_container.style.backgroundColor = "#eaeaea";
        media.innerHTML = `
            <canvas id="canvas-3d"></canvas>
            <div class="option-container">
                <div class="option-menu">
                    <div class="text-menu-option">Iluminação:</div>
                    <div class="option-container">
                        <div class="option-menu">
                            <label><input id="fria" type="radio" name="iluminacao"  ><p class="text-option" >Fria</p></label>
                        </div>
                        <div class="option-menu">
                            <label><input id="normal" type="radio" name="iluminacao" checked ><p class="text-option">Normal</p></label>
                        </div>
                        <div class="option-menu">
                            <label><input id="quente" type="radio" name="iluminacao"  ><p class="text-option">Quente</p></label>
                        </div>
                    </div>
                    <div class="slidecontainer">
                        <input type="range" min="5" max="30" value="17,5" class="slider" id="intensity">
                    </div>
                </div>
                <div class="option-menu" style="margin-top:20px;">
                    <div class="option-menu" style="margin:auto;">
                        <div class="option-menu">
                            <button id="toggleDrawers" class="button-grey"><p class="text-red">Gavetas</p></button>
                        </div>
                        <div class="option-menu">
                            <button id="toggleDoors" class="button-grey"><p class="text-red">Portas</p></button>
                        </div>
                    </div>
                    <a id="repos"class="button-grey" style="margin-top:10px;"><p class="text-red">Repor</p></a>
                </div>
                <div class="option-menu">
                    <div class="text-menu-option">Objetos:</div>
                    <div class="option-container">
                        <div class="option-menu">
                            <label><input id="chk_plant" type="checkbox" checked><p class="text-option">Planta</p></label>
                            <label><input id="chk_books" type="checkbox" checked><p class="text-option">Livro</p></label>
                        </div>
                        <div class="option-menu">
                            <label><input id="chk_lamp" type="checkbox" checked><p class="text-option">Candeeiro</p></label>
                            <label><input id="chk_laptop" type="checkbox" checked><p class="text-option">Portátil</p></label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        button.innerHTML = "Voltar";

        mediaLoader = new ThreeDLoader();

    }

    /** 
    * Replace the HTML inside media to Image media
    */
    function injectImg() {
        media_container.style.backgroundColor = "#ffffff";
        media.innerHTML = `
        <div class="carousel">
            <div class="carousel-inner" id="carouselInner">
                <!-- Images will be dynamically added here -->
            </div>
            <div id="prevBtn">&#10094;</div>
            <div id="nextBtn">&#10095;</div>
        </div>
        `;
        button.innerHTML = 'Visualizar em 3D';

        mediaLoader = new ImageLoader();
    }

    /** 
    * Manages the changes between Image and 3D media
    */
    function change() {
        mediaLoader.cleanEventListeners();
        if (mediaLoader instanceof ImageLoader) {
            injectThreeD();
        } else {
            injectImg();
        }
    }

    // Main
    document.getElementById('injectButton').addEventListener('click', () => {
        change()
    })

    injectImg();
}

mediaController()


