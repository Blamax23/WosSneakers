function createSneakerScene(containerId, nom, heightDiv) {
    // Configuration de la scène Three.js
    alert("CE FICHIER EST BIEN CHARGÉ");
    const container = document.getElementById(containerId);
    container.style.width = '49%';
    container.style.height = heightDiv + '%';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('rgb(0, 0, 0)');

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

    // Éclairage
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);

    camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 10000);
    camera.position.set(25, 25, 25);

    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    // Contrôles
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.dampingFactor = 0.05;

    controls.rotateSpeed = 0.3;

    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.minPolarAngle = -Infinity;
    controls.maxPolarAngle = Infinity;

    controls.update();

    let autoRotate = true;

    function animate() {
        requestAnimationFrame(animate);

        renderer.domElement.addEventListener('mousedown', () => {
            autoRotate = false;
        });

        renderer.domElement.addEventListener('mouseup', () => {
            autoRotate = true;
        });

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // =======================
    // CHARGEMENT DU MODÈLE
    // =======================

    const loader = new THREE.GLTFLoader();
    let nomFichier = '/models/' + nom + '.glb';

    loader.load(
        nomFichier,
        (gltf) => {

            const model = gltf.scene;

            // ===========================
            // 🔴 ICI LE VRAI ZOOM
            // ===========================

            model.traverse((child) => {
                if (child.isMesh) {
                    child.scale.set(0.35, 0.35, 0.35);
                }
            });
            // → DIMINUE = modèle plus petit
            // → AUGMENTE = modèle plus grand

            // Recalcul APRÈS le scale
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            model.position.sub(center);

            if (containerId === 'chaussure-gauche') {
                model.position.x = -0.01;
                model.position.y = -0.05;
                model.position.z = 0.05;
            } else {
                model.position.x = 0.1;
                model.position.y = 0.0;
                model.position.z = 5;
            }

            const pivotGroup = new THREE.Group();
            scene.add(pivotGroup);

            pivotGroup.position.set(
                model.position.x,
                model.position.y,
                model.position.z
            );

            pivotGroup.add(model);

            model.position.set(0, 0, 0);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% chargé');
        },
        (error) => {
            console.error('Erreur lors du chargement:', error);
        }
    );

    // Resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    });

    function initRendererSize() {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    }

    initRendererSize();
}

// Appels
createSneakerScene('chaussure-gauche', 'bestnikeair', "100", "1");
createSneakerScene('chaussure-droite', 'in_underwear', "100", "1");