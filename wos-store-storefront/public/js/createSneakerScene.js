function createSneakerScene(containerId, nom, heightDiv) {
    // Configuration de la scène Three.js
    const container = document.getElementById(containerId);
    container.style.width = '49%';
    container.style.height = heightDiv + '%';
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('rgb(0, 0, 0)'); // Ajout d'un fond gris clair

    // Ajustement du ratio de la caméra
    const width = container.clientWidth;
    const height = container.clientHeight;
    let camera = new THREE.PerspectiveCamera();

    // Configuration du renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Éclairage amélioré
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    if (containerId === 'chaussure-gauche') {
        camera = new THREE.PerspectiveCamera(3.25, width / height, 0.1, 10000);
        camera.position.set(3, 3, 3);
    } else {
        console.log("on est dans le droit");
        camera = new THREE.PerspectiveCamera(3, width / height, 0.1, 10000);
        camera.position.set(3, 4, 3);
    }
    scene.add(directionalLight);

    // Ajout d'une lumière d'appoint
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    // Configuration des contrôles
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Ajoute de l'inertie aux contrôles
    controls.enableZoom = false;
    controls.dampingFactor = 0.05;

    controls.rotateSpeed = 0.3;  // Réduit la vitesse de rotation (défaut: 1.0)
    controls.minPolarAngle = Math.PI / 4;  // Limite l'angle vertical minimum
    controls.maxPolarAngle = Math.PI / 1.5; // Limite l'angle vertical maximum
    controls.minAzimuthAngle = -Math.PI / 2; // Limite la rotation horizontale minimum
    controls.maxAzimuthAngle = Math.PI / 2;  // Limite la rotation horizontale maximum
    controls.minAzimuthAngle = -Infinity; // Pas de limite minimale
    controls.maxAzimuthAngle = Infinity;
    controls.minPolarAngle = -Infinity;
    controls.maxPolarAngle = Infinity;

    // Position initiale de la caméra
    controls.update();


    let autoRotate = true;

    // Fonction d'animation
    function animate() {
        requestAnimationFrame(animate);

        // Ajout des gestionnaires d'événements pour la souris
        renderer.domElement.addEventListener('mousedown', () => {
            autoRotate = false;
        });

        renderer.domElement.addEventListener('mouseup', () => {
            autoRotate = true;
        });

        //if (autoRotate) {
        //    modelGroup.rotation.y -= 0.005;
        //}

        controls.update();
        renderer.render(scene, camera);
    }

    // Démarrage de l'animation
    animate();

    // Chargement du modèle GLB
    const loader = new THREE.GLTFLoader();
    let nomFichier = '/models/' + nom + '.glb';

    loader.load(
        nomFichier,
        (gltf) => {

            const model = gltf.scene;

            // Calculer la boîte englobante
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            // Ajuster la position du modèle pour qu'il soit centré
            model.position.sub(center);

            if (containerId === 'chaussure-gauche') {
                model.position.x = -0.01;
                model.position.y = -0.05;
                model.position.z = 0.05;
            } else {
                model.position.x = 0.1;
                model.position.y = 0.0;
                model.position.z = 0.05;
            }

            console.log(model.position);

            const pivotGroup = new THREE.Group();
            scene.add(pivotGroup); // Ajoute le pivot à la scène

            // Positionne le pivot au même endroit que la chaussure
            pivotGroup.position.set(model.position.x, model.position.y, model.position.z);

            // Ajoute le modèle au pivot
            pivotGroup.add(model);

            // Déplace le modèle à l’intérieur du pivot (ajuste localement)
            model.position.set(0, 0, 0);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% chargé');
        },
        (error) => {
            console.error('Erreur lors du chargement:', error);
        }
    );

    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    });

    // Initialisation de la taille du renderer
    function initRendererSize() {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    }

    // Appel initial pour définir la taille du renderer
    initRendererSize();
}

// Appel de la fonction de création de la scène
createSneakerScene('chaussure-gauche', 'sb2-light', "100");
createSneakerScene('chaussure-droite', 'af1-light', "100");
//createSneakerScene('chaussure-droite', 'dunk', "100", "30");

