
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    const container = document.getElementById('drone-canvas');
    const status = document.getElementById('model-status');
    const reducedMotion3D = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initializeDrone() {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
      camera.position.set(8, 4.5, 11);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.prepend(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xdceeff, 0x07101b, 1.7));
      const key = new THREE.DirectionalLight(0xffffff, 3.2);
      key.position.set(5, 8, 7);
      scene.add(key);
      const rim = new THREE.PointLight(0x2997ff, 16, 28);
      rim.position.set(-7, 1, -5);
      scene.add(rim);
      const fill = new THREE.PointLight(0x714dff, 7, 24);
      fill.position.set(7, -2, -2);
      scene.add(fill);

      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(5.2, 64),
        new THREE.MeshBasicMaterial({ color: 0x1479d4, transparent: true, opacity: .09, depthWrite: false })
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = -2.4;
      scene.add(glow);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = .06;
      controls.enablePan = false;
      controls.minDistance = 8;
      controls.maxDistance = 18;
      controls.autoRotate = !reducedMotion3D;
      controls.autoRotateSpeed = 1.65;

      const resize = () => {
        const width = Math.max(container.clientWidth, 1);
        const height = Math.max(container.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      new ResizeObserver(resize).observe(container);

      const draco = new DRACOLoader();
      draco.setDecoderPath('./vendor/three/examples/jsm/libs/draco/gltf/');
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);
      loader.load('./FullDroneAssemblySura.glb', gltf => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 6.8 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        model.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.roughness = .34;
            child.material.metalness = .66;
          }
        });
        scene.add(model);
        status.hidden = true;
      }, xhr => {
        if (xhr.total) status.textContent = `LOADING FLIGHT ASSEMBLY ${Math.round(xhr.loaded / xhr.total * 100)}%`;
      }, () => {
        status.textContent = '3D ASSEMBLY UNAVAILABLE · CAD FILE REMAINS DOWNLOADABLE';
      });

      let active = true;
      const visibility = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { threshold: .02 });
      visibility.observe(container);
      function animate() {
        requestAnimationFrame(animate);
        if (!active) return;
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    }

    if ('IntersectionObserver' in window) {
      const loaderObserver = new IntersectionObserver(([entry], observer) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          initializeDrone();
        }
      }, { rootMargin: '300px' });
      loaderObserver.observe(container);
    } else {
      initializeDrone();
    }
