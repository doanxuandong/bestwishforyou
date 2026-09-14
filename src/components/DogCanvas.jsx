import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundManager } from '../utils/audio';

export const DOG_BREEDS = [
  {
    id: 'shiba',
    name: 'Shiba Inu Tinh Anh',
    tagline: 'Dáng ngồi kiêu hãnh, ngực nở cổ vươn & siêu trung thành',
    badge: '🐕 Shiba Inu',
    color: '#f59e0b'
  },
  {
    id: 'corgi',
    name: 'Corgi Chân Ngắn Sploot',
    tagline: 'Dáng nằm bẹp úp bụng, mông trái tim đào lúc lắc siêu cưng',
    badge: '🦊 Corgi Sploot',
    color: '#f97316'
  },
  {
    id: 'poodle',
    name: 'Poodle Teddy Bông Xù',
    tagline: 'Toàn thân kết từ những chùm mây tròn bồng bềnh ngọt ngào',
    badge: '🐩 Poodle Teddy',
    color: '#ec4899'
  },
  {
    id: 'dachshund',
    name: 'Dachshund Lạp Xưởng',
    tagline: 'Thân dài xúc xích ngộ nghĩnh, 4 chân tí hin, tai rủ tha thướt',
    badge: '🌭 Chó Lạp Xưởng',
    color: '#b45309'
  },
  {
    id: 'pug',
    name: 'Pug Béo Mặt Xệ',
    tagline: 'Thân tròn ục ịch, ngấn mỡ vai gáy & mặt xệ núng nính',
    badge: '🐾 Pug Béo Ú',
    color: '#14b8a6'
  }
];

const DogCanvas = forwardRef(function DogCanvas({ currentDogIndex = 0, onPet }, ref) {
  const canvasRef = useRef(null);
  const internalRef = useRef({});

  useImperativeHandle(ref, () => ({
    petDog: (clientX, clientY) => {
      if (internalRef.current.petDog) {
        internalRef.current.petDog(clientX, clientY);
      }
    }
  }));

  const activeDogIndexRef = useRef(currentDogIndex);
  useEffect(() => {
    activeDogIndexRef.current = currentDogIndex;
    if (internalRef.current.switchDog) {
      internalRef.current.switchDog(currentDogIndex);
    }
  }, [currentDogIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffe8d6, 0.030);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Warm Morning Sunlight
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.25);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffecd2, 1.7);
    sunLight.position.set(4.5, 7.5, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xffa17a, 0.95);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Master Container for Puppies & Cushion
    const masterDogGroup = new THREE.Group();
    masterDogGroup.position.set(0, -0.62, 0);
    scene.add(masterDogGroup);

    // Generous Oval Morning Cushion
    const cushionGeo = new THREE.CylinderGeometry(2.1, 2.2, 0.28, 40);
    cushionGeo.scale(1.08, 1.0, 1.25);
    const cushionMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.position.set(0, -0.92, 0);
    cushion.receiveShadow = true;
    masterDogGroup.add(cushion);

    const cushionRimGeo = new THREE.TorusGeometry(2.1, 0.09, 16, 40);
    cushionRimGeo.rotateX(Math.PI / 2);
    cushionRimGeo.scale(1.08, 1.25, 1.0);
    const cushionRimMat = new THREE.MeshLambertMaterial({ color: 0xffedd5 });
    const cushionRim = new THREE.Mesh(cushionRimGeo, cushionRimMat);
    cushionRim.position.set(0, -0.78, 0);
    masterDogGroup.add(cushionRim);

    // Shared Reusable Elements
    const eyeBaseGeo = new THREE.SphereGeometry(0.12, 20, 20);
    const eyeSparkleGeo = new THREE.SphereGeometry(0.042, 12, 12);
    const eyeMiniSparkleGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const blushGeo = new THREE.SphereGeometry(0.12, 14, 14);
    blushGeo.scale(1.2, 0.55, 0.45);

    const eyeMat = new THREE.MeshPhongMaterial({ color: 0x18202c, shininess: 95 });
    const eyeSparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const darkNoseMat = new THREE.MeshLambertMaterial({ color: 0x221713 });
    const pinkBlushMat = new THREE.MeshLambertMaterial({ color: 0xffa8b6 });
    const innerEarMat = new THREE.MeshLambertMaterial({ color: 0xffb5c2 });
    const goldMetalMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.7, roughness: 0.25 });

    function createEyesAndBlush(parentHead, zOffset = 0.62, xOffset = 0.26, yOffset = 0.08) {
      const eyesGroup = new THREE.Group();
      parentHead.add(eyesGroup);

      [-1, 1].forEach((dir) => {
        const eyeContainer = new THREE.Group();
        eyeContainer.position.set(dir * xOffset, yOffset, zOffset);
        eyesGroup.add(eyeContainer);

        const eyeMesh = new THREE.Mesh(eyeBaseGeo, eyeMat);
        eyeContainer.add(eyeMesh);

        const sp1 = new THREE.Mesh(eyeSparkleGeo, eyeSparkleMat);
        sp1.position.set(-0.03 * dir, 0.04, 0.095);
        eyeContainer.add(sp1);

        const sp2 = new THREE.Mesh(eyeMiniSparkleGeo, eyeSparkleMat);
        sp2.position.set(0.04 * dir, -0.03, 0.095);
        eyeContainer.add(sp2);

        const blush = new THREE.Mesh(blushGeo, pinkBlushMat);
        blush.position.set(dir * (xOffset + 0.16), yOffset - 0.14, zOffset - 0.06);
        blush.rotation.set(0.1, dir * -0.35, dir * 0.1);
        parentHead.add(blush);
      });

      return eyesGroup;
    }

    // =========================================================================
    // 🐕 BREED 1: SHIBA INU (DÁNG NGỒI KIÊU HÃNH - CỔ CAO, NGỰC NỞ, EO THON)
    // =========================================================================
    function buildShiba() {
      const group = new THREE.Group();
      const shibaFurMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
      const urajiroMat = new THREE.MeshLambertMaterial({ color: 0xfffbf2 });
      const collarMat = new THREE.MeshLambertMaterial({ color: 0xe11d48 });

      // Dynamic Canine Torso: Chest thrust forward, slim waist pulled back
      const chestGeo = new THREE.SphereGeometry(0.72, 28, 24);
      chestGeo.scale(0.92, 1.05, 1.15);
      const chestMesh = new THREE.Mesh(chestGeo, shibaFurMat);
      chestMesh.position.set(0, 0.08, 0.15);
      chestMesh.castShadow = true;
      group.add(chestMesh);

      // Cream Urajiro Front Bib
      const bibGeo = new THREE.SphereGeometry(0.58, 20, 20);
      bibGeo.scale(0.75, 1.02, 0.45);
      const bib = new THREE.Mesh(bibGeo, urajiroMat);
      bib.position.set(0, 0.05, 0.72);
      group.add(bib);

      // Tapered Hindquarters (Hông thon phía sau)
      const hipsGeo = new THREE.SphereGeometry(0.55, 24, 20);
      hipsGeo.scale(0.85, 0.95, 0.95);
      const hips = new THREE.Mesh(hipsGeo, shibaFurMat);
      hips.position.set(0, -0.18, -0.38);
      hips.castShadow = true;
      group.add(hips);

      // Distinct Stately Neck (Cổ vươn cao dũng mãnh)
      const neckGeo = new THREE.CylinderGeometry(0.40, 0.52, 0.52, 24);
      neckGeo.rotateX(0.2);
      const neckMesh = new THREE.Mesh(neckGeo, shibaFurMat);
      neckMesh.position.set(0, 0.65, 0.22);
      group.add(neckMesh);

      // 2 Front Stately Legs (2 Chân trước thẳng đứng cắm xuống sàn)
      [-1, 1].forEach((dir) => {
        const legGeo = new THREE.CylinderGeometry(0.11, 0.10, 0.85, 16);
        const leg = new THREE.Mesh(legGeo, urajiroMat);
        leg.position.set(dir * 0.32, -0.48, 0.45);
        leg.castShadow = true;
        group.add(leg);

        const pawGeo = new THREE.SphereGeometry(0.15, 16, 16);
        pawGeo.scale(0.95, 0.65, 1.25);
        const paw = new THREE.Mesh(pawGeo, urajiroMat);
        paw.position.set(dir * 0.32, -0.86, 0.55);
        paw.castShadow = true;
        group.add(paw);
      });

      // 2 Hind Haunches (2 Đùi sau gập ngồi vững chãi bên hông)
      [-1, 1].forEach((dir) => {
        const haunchGeo = new THREE.SphereGeometry(0.38, 18, 18);
        haunchGeo.scale(0.55, 0.95, 1.15);
        const haunch = new THREE.Mesh(haunchGeo, shibaFurMat);
        haunch.position.set(dir * 0.52, -0.52, -0.28);
        haunch.rotation.set(0.15, 0, dir * 0.15);
        group.add(haunch);

        const hindPawGeo = new THREE.SphereGeometry(0.14, 14, 14);
        hindPawGeo.scale(1.0, 0.6, 1.2);
        const hindPaw = new THREE.Mesh(hindPawGeo, urajiroMat);
        hindPaw.position.set(dir * 0.48, -0.86, 0.05);
        group.add(hindPaw);
      });

      // Tightly Curled Donut Tail over back
      const tailGroup = new THREE.Group();
      tailGroup.position.set(0, -0.05, -0.75);
      group.add(tailGroup);

      const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.12, 0.45, -0.2),
        new THREE.Vector3(0.0, 0.85, -0.05),
        new THREE.Vector3(-0.25, 0.85, 0.22),
        new THREE.Vector3(-0.15, 0.55, 0.28)
      ]);
      const tailGeo = new THREE.TubeGeometry(tailCurve, 24, 0.12, 10, false);
      const tailMesh = new THREE.Mesh(tailGeo, shibaFurMat);
      tailMesh.castShadow = true;
      tailGroup.add(tailMesh);

      // Red Collar & Golden Bell
      const collarGeo = new THREE.TorusGeometry(0.56, 0.065, 12, 32);
      collarGeo.rotateX(Math.PI / 2.3);
      const collarMesh = new THREE.Mesh(collarGeo, collarMat);
      collarMesh.position.set(0, 0.78, 0.25);
      group.add(collarMesh);

      const bellMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), goldMetalMat);
      bellMesh.position.set(0, 0.68, 0.78);
      group.add(bellMesh);

      // Head Group (Chiseled fox skull)
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.25, 0.32);
      group.add(headGroup);

      const headGeo = new THREE.SphereGeometry(0.64, 32, 28);
      headGeo.scale(1.08, 0.95, 1.12);
      const headMesh = new THREE.Mesh(headGeo, shibaFurMat);
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      // White Cheeks (Urajiro)
      [-1, 1].forEach((dir) => {
        const cheekGeo = new THREE.SphereGeometry(0.38, 16, 16);
        cheekGeo.scale(0.85, 0.72, 0.4);
        const cheek = new THREE.Mesh(cheekGeo, urajiroMat);
        cheek.position.set(dir * 0.35, -0.12, 0.54);
        cheek.rotation.set(0.1, dir * -0.4, 0);
        headGroup.add(cheek);
      });

      // Fox-like tapered muzzle
      const snoutGeo = new THREE.ConeGeometry(0.32, 0.55, 18);
      snoutGeo.rotateX(Math.PI / 2);
      snoutGeo.scale(0.9, 0.7, 1.0);
      const snout = new THREE.Mesh(snoutGeo, urajiroMat);
      snout.position.set(0, -0.08, 0.82);
      headGroup.add(snout);

      const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), darkNoseMat);
      noseMesh.position.set(0, 0.02, 1.05);
      headGroup.add(noseMesh);

      // Round Shiba Eyebrow Dots ("Maro")
      [-1, 1].forEach((dir) => {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), urajiroMat);
        dot.position.set(dir * 0.22, 0.26, 0.65);
        headGroup.add(dot);
      });

      // Sharp Triangular Prick Ears
      const earGeo = new THREE.ConeGeometry(0.26, 0.55, 4);
      earGeo.scale(1, 1, 0.45);

      const leftEarGroup = new THREE.Group();
      leftEarGroup.position.set(-0.42, 0.55, 0.1);
      leftEarGroup.rotation.set(-0.1, 0, 0.25);
      headGroup.add(leftEarGroup);
      leftEarGroup.add(new THREE.Mesh(earGeo, shibaFurMat));

      const innerEarMesh = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 4), innerEarMat);
      innerEarMesh.position.set(0, -0.05, 0.05);
      leftEarGroup.add(innerEarMesh);

      const rightEarGroup = new THREE.Group();
      rightEarGroup.position.set(0.42, 0.55, 0.1);
      rightEarGroup.rotation.set(-0.1, 0, -0.25);
      headGroup.add(rightEarGroup);
      rightEarGroup.add(new THREE.Mesh(earGeo, shibaFurMat));

      const rightInner = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 4), innerEarMat);
      rightInner.position.set(0, -0.05, 0.05);
      rightEarGroup.add(rightInner);

      const eyesGroup = createEyesAndBlush(headGroup, 0.64, 0.26, 0.07);

      return {
        root: group,
        headGroup,
        bodyMesh: chestMesh,
        leftEarGroup,
        rightEarGroup,
        tailGroup,
        eyesGroup,
        bellMesh
      };
    }

    // =========================================================================
    // 🦊 BREED 2: CORGI SPLOOT (DÁNG NẰM BẸP ÚP BỤNG, THÂN DÀI, MÔNG TRÁI TIM)
    // =========================================================================
    function buildCorgi() {
      const group = new THREE.Group();
      const corgiFurMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });
      const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const bandanaMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });

      // Horizontal Long Loaf Body resting flat on cushion
      const bodyGeo = new THREE.CylinderGeometry(0.58, 0.62, 1.55, 24);
      bodyGeo.rotateX(Math.PI / 2);
      bodyGeo.scale(1.15, 0.72, 1.0);
      const bodyMesh = new THREE.Mesh(bodyGeo, corgiFurMat);
      bodyMesh.position.set(0, -0.45, -0.05);
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      // White Underbelly Loaf
      const bellyGeo = new THREE.CylinderGeometry(0.48, 0.52, 1.35, 18);
      bellyGeo.rotateX(Math.PI / 2);
      bellyGeo.scale(0.85, 0.35, 1.0);
      const belly = new THREE.Mesh(bellyGeo, whiteMat);
      belly.position.set(0, -0.68, 0.02);
      group.add(belly);

      // Famous Corgi "Peach / Heart Butt" (Mông trái tim bồng bềnh ở đuôi)
      const heartButtGroup = new THREE.Group();
      heartButtGroup.position.set(0, -0.38, -0.85);
      group.add(heartButtGroup);

      [-1, 1].forEach((dir) => {
        const cheekGeo = new THREE.SphereGeometry(0.38, 20, 20);
        cheekGeo.scale(0.95, 0.85, 0.8);
        const cheek = new THREE.Mesh(cheekGeo, corgiFurMat);
        cheek.position.set(dir * 0.24, 0, 0);
        heartButtGroup.add(cheek);

        const whitePatchGeo = new THREE.SphereGeometry(0.24, 16, 16);
        whitePatchGeo.scale(0.85, 0.85, 0.4);
        const whitePatch = new THREE.Mesh(whitePatchGeo, whiteMat);
        whitePatch.position.set(dir * 0.22, -0.05, -0.28);
        heartButtGroup.add(whitePatch);
      });

      // Signature Corgi Sploot Hind Legs: Stretched straight backward along cushion!
      [-1, 1].forEach((dir) => {
        const legGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.55, 14);
        legGeo.rotateX(Math.PI / 2);
        const leg = new THREE.Mesh(legGeo, corgiFurMat);
        leg.position.set(dir * 0.48, -0.65, -0.95);
        leg.rotation.y = dir * 0.25;
        group.add(leg);

        const pawGeo = new THREE.SphereGeometry(0.13, 14, 14);
        pawGeo.scale(1.1, 0.55, 1.3);
        const paw = new THREE.Mesh(pawGeo, whiteMat);
        paw.position.set(dir * 0.55, -0.72, -1.25);
        group.add(paw);
      });

      // 2 Short Stubby Front Paws stretched in front
      [-1, 1].forEach((dir) => {
        const fLegGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.42, 14);
        fLegGeo.rotateZ(dir * 0.25);
        const fLeg = new THREE.Mesh(fLegGeo, corgiFurMat);
        fLeg.position.set(dir * 0.42, -0.62, 0.58);
        group.add(fLeg);

        const pawGeo = new THREE.SphereGeometry(0.16, 16, 16);
        pawGeo.scale(1.0, 0.55, 1.25);
        const paw = new THREE.Mesh(pawGeo, whiteMat);
        paw.position.set(dir * 0.46, -0.76, 0.78);
        paw.castShadow = true;
        group.add(paw);
      });

      // Cute Little Nub Tail between the peach cheeks
      const tailGroup = new THREE.Group();
      tailGroup.position.set(0, -0.32, -1.05);
      group.add(tailGroup);

      const tailGeo = new THREE.SphereGeometry(0.15, 14, 14);
      tailGeo.scale(1.0, 0.8, 0.9);
      const tailMesh = new THREE.Mesh(tailGeo, whiteMat);
      tailGroup.add(tailMesh);

      // Sky Blue Bandana Triangle
      const bandanaMesh = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.35, 3), bandanaMat);
      bandanaMesh.rotateX(Math.PI);
      bandanaMesh.scale.set(0.65, 0.55, 0.2);
      bandanaMesh.position.set(0, 0.05, 0.85);
      group.add(bandanaMesh);

      // Head Group (Raised up attentively from the resting sploot)
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.65, 0.55);
      group.add(headGroup);

      const headGeo = new THREE.SphereGeometry(0.66, 32, 28);
      headGeo.scale(1.08, 0.92, 1.05);
      const headMesh = new THREE.Mesh(headGeo, corgiFurMat);
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      // White Blaze running up the center of forehead
      const blazeGeo = new THREE.SphereGeometry(0.28, 16, 16);
      blazeGeo.scale(0.32, 1.35, 0.35);
      const blaze = new THREE.Mesh(blazeGeo, whiteMat);
      blaze.position.set(0, 0.22, 0.62);
      headGroup.add(blaze);

      // White Muzzle & Tongue
      const snoutGeo = new THREE.SphereGeometry(0.26, 18, 18);
      snoutGeo.scale(1.05, 0.8, 1.15);
      const snout = new THREE.Mesh(snoutGeo, whiteMat);
      snout.position.set(0, -0.06, 0.68);
      headGroup.add(snout);

      const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), darkNoseMat);
      noseMesh.position.set(0, 0.04, 0.92);
      headGroup.add(noseMesh);

      // Cute Pink Tongue Sticking Out (Corgi Sploot Blep!)
      const corgiTongueGeo = new THREE.SphereGeometry(0.09, 12, 12);
      corgiTongueGeo.scale(0.8, 0.28, 1.2);
      const corgiTongue = new THREE.Mesh(corgiTongueGeo, new THREE.MeshLambertMaterial({ color: 0xff6b81 }));
      corgiTongue.position.set(0.04, -0.16, 0.84);
      corgiTongue.rotation.set(0.2, 0.1, 0);
      headGroup.add(corgiTongue);

      // Huge Iconic Corgi Bat Ears (To bản xòe sang 2 bên)
      const earGeo = new THREE.CylinderGeometry(0.25, 0.06, 0.72, 16);
      earGeo.scale(1.15, 1.0, 0.35);

      const leftEarGroup = new THREE.Group();
      leftEarGroup.position.set(-0.52, 0.62, 0.05);
      leftEarGroup.rotation.set(-0.15, 0.1, 0.42);
      headGroup.add(leftEarGroup);
      leftEarGroup.add(new THREE.Mesh(earGeo, corgiFurMat));

      const innerEar = new THREE.Mesh(earGeo, innerEarMat);
      innerEar.scale.set(0.72, 0.75, 0.5);
      innerEar.position.set(0, -0.02, 0.04);
      leftEarGroup.add(innerEar);

      const rightEarGroup = new THREE.Group();
      rightEarGroup.position.set(0.52, 0.62, 0.05);
      rightEarGroup.rotation.set(-0.15, -0.1, -0.42);
      headGroup.add(rightEarGroup);
      rightEarGroup.add(new THREE.Mesh(earGeo, corgiFurMat));

      const rightInner = new THREE.Mesh(earGeo, innerEarMat);
      rightInner.scale.set(0.72, 0.75, 0.5);
      rightInner.position.set(0, -0.02, 0.04);
      rightEarGroup.add(rightInner);

      const eyesGroup = createEyesAndBlush(headGroup, 0.65, 0.28, 0.07);

      return {
        root: group,
        headGroup,
        bodyMesh,
        leftEarGroup,
        rightEarGroup,
        tailGroup,
        eyesGroup
      };
    }

    // =========================================================================
    // 🐩 BREED 3: POODLE TEDDY (TOÀN THÂN CÁC BÚI BÔNG TRÒN PHỒNG PHỀNH)
    // =========================================================================
    function buildPoodle() {
      const group = new THREE.Group();
      const poodleMat = new THREE.MeshLambertMaterial({ color: 0xf3cc9a }); // Soft Sweet Teddy
      const bowMat = new THREE.MeshLambertMaterial({ color: 0xec4899 });

      // Plump Cloud Puffs Body
      const bodyGeo = new THREE.SphereGeometry(0.76, 28, 24);
      bodyGeo.scale(1.15, 1.1, 1.05);
      const bodyMesh = new THREE.Mesh(bodyGeo, poodleMat);
      bodyMesh.position.set(0, -0.12, 0.05);
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      // Fluffy Chest Ball
      const chestFluff = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 20), poodleMat);
      chestFluff.position.set(0, 0.15, 0.48);
      group.add(chestFluff);

      // Fluffy Teddy Arms (2 Tay gấu bông tròn xù)
      [-1, 1].forEach((dir) => {
        const armGeo = new THREE.SphereGeometry(0.26, 16, 16);
        armGeo.scale(0.85, 1.25, 0.9);
        const arm = new THREE.Mesh(armGeo, poodleMat);
        arm.position.set(dir * 0.42, -0.22, 0.48);
        arm.rotation.set(0.3, 0, dir * -0.2);
        group.add(arm);

        // Fluffy Sitting Hind Paws
        const hPaw = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), poodleMat);
        hPaw.position.set(dir * 0.48, -0.68, 0.22);
        group.add(hPaw);
      });

      // Upright Pom-pom Ball Tail
      const tailGroup = new THREE.Group();
      tailGroup.position.set(0, -0.18, -0.65);
      group.add(tailGroup);

      const tailStemGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.52, 8);
      tailStemGeo.rotateX(Math.PI / 3.5);
      const tailStem = new THREE.Mesh(tailStemGeo, poodleMat);
      tailGroup.add(tailStem);

      const pomGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const pomMesh = new THREE.Mesh(pomGeo, poodleMat);
      pomMesh.position.set(0, 0.42, -0.28);
      pomMesh.castShadow = true;
      tailGroup.add(pomMesh);

      // Pink Bow-Tie on chest
      const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), bowMat);
      bowCenter.position.set(0, 0.38, 0.65);
      group.add(bowCenter);

      [-1, 1].forEach((dir) => {
        const wing = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 4), bowMat);
        wing.rotateZ(dir * (Math.PI / 2));
        wing.position.set(dir * 0.16, 0.38, 0.65);
        group.add(wing);
      });

      // Head Group (Teddy Bear Round Afro Head)
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.98, 0.18);
      group.add(headGroup);

      const headGeo = new THREE.SphereGeometry(0.68, 32, 28);
      const headMesh = new THREE.Mesh(headGeo, poodleMat);
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      // Distinct Giant Afro Crown Top Puffs
      const topAfro1 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 18), poodleMat);
      topAfro1.position.set(0, 0.55, 0.15);
      headGroup.add(topAfro1);

      [-1, 1].forEach((dir) => {
        const afroSide = new THREE.Mesh(new THREE.SphereGeometry(0.30, 14, 14), poodleMat);
        afroSide.position.set(dir * 0.25, 0.48, 0.26);
        headGroup.add(afroSide);
      });

      // Round Teddy Snout
      const snoutGeo = new THREE.SphereGeometry(0.22, 16, 16);
      snoutGeo.scale(1.0, 0.9, 1.1);
      const snout = new THREE.Mesh(snoutGeo, poodleMat);
      snout.position.set(0, -0.06, 0.65);
      headGroup.add(snout);

      const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), darkNoseMat);
      noseMesh.position.set(0, 0.02, 0.86);
      headGroup.add(noseMesh);

      // Long Fluffy Cloud Ears Draping Along Cheeks
      const earCloudGeo = new THREE.SphereGeometry(0.34, 16, 16);
      earCloudGeo.scale(0.85, 1.55, 0.85);

      const leftEarGroup = new THREE.Group();
      leftEarGroup.position.set(-0.58, 0.15, 0.05);
      leftEarGroup.rotation.z = 0.12;
      headGroup.add(leftEarGroup);
      leftEarGroup.add(new THREE.Mesh(earCloudGeo, poodleMat));

      const rightEarGroup = new THREE.Group();
      rightEarGroup.position.set(0.58, 0.15, 0.05);
      rightEarGroup.rotation.z = -0.12;
      headGroup.add(rightEarGroup);
      rightEarGroup.add(new THREE.Mesh(earCloudGeo, poodleMat));

      const eyesGroup = createEyesAndBlush(headGroup, 0.62, 0.25, 0.08);

      return {
        root: group,
        headGroup,
        bodyMesh,
        leftEarGroup,
        rightEarGroup,
        tailGroup,
        eyesGroup
      };
    }

    // =========================================================================
    // 🌭 BREED 4: DACHSHUND LẠP XƯỞNG (THÂN DÀI XÚC XÍCH, CHÂN TÍ HON, TAI RỦ)
    // =========================================================================
    function buildDachshund() {
      const group = new THREE.Group();
      const dachshundFurMat = new THREE.MeshLambertMaterial({ color: 0xa1521a }); // Rich Auburn Chestnut
      const tanMat = new THREE.MeshLambertMaterial({ color: 0xd9884e });
      const collarMat = new THREE.MeshLambertMaterial({ color: 0x059669 }); // Emerald green

      // Super Elongated Cylindrical Sausage Body (Thân xúc xích dài ngoẵng)
      const bodyGeo = new THREE.CylinderGeometry(0.48, 0.46, 2.05, 24);
      bodyGeo.rotateX(Math.PI / 2);
      bodyGeo.scale(1.0, 0.88, 1.0);
      const bodyMesh = new THREE.Mesh(bodyGeo, dachshundFurMat);
      bodyMesh.position.set(0, -0.46, -0.15);
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      // Tan Tan Chest & Underbelly
      const chestBibGeo = new THREE.SphereGeometry(0.45, 18, 18);
      chestBibGeo.scale(0.85, 0.85, 0.5);
      const chestBib = new THREE.Mesh(chestBibGeo, tanMat);
      chestBib.position.set(0, -0.38, 0.72);
      group.add(chestBib);

      // 4 Tiny Stumpy Legs (4 Chân ngắn tí hon củn lủn)
      [
        [-0.32, 0.65],
        [0.32, 0.65],
        [-0.30, -0.85],
        [0.30, -0.85]
      ].forEach(([lx, lz]) => {
        const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.38, 12);
        const leg = new THREE.Mesh(legGeo, tanMat);
        leg.position.set(lx, -0.72, lz);
        group.add(leg);

        const pawGeo = new THREE.SphereGeometry(0.12, 12, 12);
        pawGeo.scale(1.0, 0.5, 1.25);
        const paw = new THREE.Mesh(pawGeo, tanMat);
        paw.position.set(lx, -0.88, lz + 0.08);
        group.add(paw);
      });

      // Long Slender Whip Tail curling upward
      const tailGroup = new THREE.Group();
      tailGroup.position.set(0, -0.35, -1.15);
      group.add(tailGroup);

      const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.05, 0.25, -0.2),
        new THREE.Vector3(0.0, 0.65, -0.25),
        new THREE.Vector3(-0.08, 0.95, -0.12)
      ]);
      const tailGeo = new THREE.TubeGeometry(tailCurve, 20, 0.07, 8, false);
      const tailMesh = new THREE.Mesh(tailGeo, dachshundFurMat);
      tailMesh.castShadow = true;
      tailGroup.add(tailMesh);

      // Green Bandana Collar
      const collarGeo = new THREE.TorusGeometry(0.46, 0.055, 12, 32);
      collarGeo.rotateX(Math.PI / 2.2);
      const collarMesh = new THREE.Mesh(collarGeo, collarMat);
      collarMesh.position.set(0, 0.12, 0.82);
      group.add(collarMesh);

      // Head Group (Long Slender Hound Head & Snout)
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.68, 0.72);
      group.add(headGroup);

      const headGeo = new THREE.SphereGeometry(0.56, 28, 24);
      headGeo.scale(0.92, 0.88, 1.15);
      const headMesh = new THREE.Mesh(headGeo, dachshundFurMat);
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      // Long Pointed Canine Snout (Chiếc mõm dài ngoẵng đặc trưng)
      const snoutGeo = new THREE.ConeGeometry(0.26, 0.72, 18);
      snoutGeo.rotateX(Math.PI / 2);
      snoutGeo.scale(1.0, 0.75, 1.0);
      const snout = new THREE.Mesh(snoutGeo, tanMat);
      snout.position.set(0, -0.08, 0.78);
      headGroup.add(snout);

      const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), darkNoseMat);
      noseMesh.position.set(0, 0.02, 1.12);
      headGroup.add(noseMesh);

      // Tan Eyebrow Dots
      [-1, 1].forEach((dir) => {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), tanMat);
        dot.position.set(dir * 0.20, 0.24, 0.58);
        headGroup.add(dot);
      });

      // Long Droopy Hound Ears (Đôi tai to dài rủ tha thướt dọc má)
      const earGeo = new THREE.CylinderGeometry(0.14, 0.28, 0.82, 16);
      earGeo.scale(0.85, 1.0, 0.22);

      const leftEarGroup = new THREE.Group();
      leftEarGroup.position.set(-0.46, 0.22, 0.05);
      leftEarGroup.rotation.set(0.1, 0, 0.22);
      headGroup.add(leftEarGroup);

      const leftEar = new THREE.Mesh(earGeo, dachshundFurMat);
      leftEar.position.set(0, -0.32, 0);
      leftEarGroup.add(leftEar);

      const rightEarGroup = new THREE.Group();
      rightEarGroup.position.set(0.46, 0.22, 0.05);
      rightEarGroup.rotation.set(0.1, 0, -0.22);
      headGroup.add(rightEarGroup);

      const rightEar = new THREE.Mesh(earGeo, dachshundFurMat);
      rightEar.position.set(0, -0.32, 0);
      rightEarGroup.add(rightEar);

      const eyesGroup = createEyesAndBlush(headGroup, 0.58, 0.24, 0.08);

      return {
        root: group,
        headGroup,
        bodyMesh,
        leftEarGroup,
        rightEarGroup,
        tailGroup,
        eyesGroup
      };
    }

    // =========================================================================
    // 🐾 BREED 5: PUG BÉO Ú (THÂN TRÒN ỤC ỊCH, CHÂN MẬP, MẶT PHẲNG NÚNG NÍNH)
    // =========================================================================
    function buildPug() {
      const group = new THREE.Group();
      const fawnMat = new THREE.MeshLambertMaterial({ color: 0xdfcbaf });
      const darkMaskMat = new THREE.MeshLambertMaterial({ color: 0x242226 });
      const tealBandanaMat = new THREE.MeshLambertMaterial({ color: 0x14b8a6 });

      // Solid Chubby Barrel Torso without gaps
      const bodyGeo = new THREE.SphereGeometry(0.88, 32, 24);
      bodyGeo.scale(1.35, 1.05, 1.12);
      const bodyMesh = new THREE.Mesh(bodyGeo, fawnMat);
      bodyMesh.position.set(0, -0.20, 0.05);
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      // Thick Chubby Pug Neck
      const neckGeo = new THREE.CylinderGeometry(0.65, 0.78, 0.45, 24);
      const neck = new THREE.Mesh(neckGeo, fawnMat);
      neck.position.set(0, 0.35, 0.18);
      group.add(neck);

      // Wide Planted Front Paws (2 Chân trước béo múp chống sàn)
      [-1, 1].forEach((dir) => {
        const legGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.62, 16);
        legGeo.rotateZ(dir * -0.15);
        const leg = new THREE.Mesh(legGeo, fawnMat);
        leg.position.set(dir * 0.48, -0.55, 0.45);
        leg.castShadow = true;
        group.add(leg);

        const pawGeo = new THREE.SphereGeometry(0.19, 16, 16);
        pawGeo.scale(1.15, 0.65, 1.25);
        const paw = new THREE.Mesh(pawGeo, fawnMat);
        paw.position.set(dir * 0.52, -0.84, 0.55);
        paw.castShadow = true;
        group.add(paw);
      });

      // Chubby Sitting Haunches (Đùi sau to bè)
      [-1, 1].forEach((dir) => {
        const haunchGeo = new THREE.SphereGeometry(0.42, 18, 18);
        haunchGeo.scale(0.8, 0.7, 1.1);
        const haunch = new THREE.Mesh(haunchGeo, fawnMat);
        haunch.position.set(dir * 0.68, -0.55, -0.15);
        group.add(haunch);
      });

      // Tightly Curled Pig-tail Corkscrew on Upper Back
      const tailGroup = new THREE.Group();
      tailGroup.position.set(0, 0.05, -0.85);
      group.add(tailGroup);

      const corkGeo = new THREE.TorusGeometry(0.18, 0.075, 12, 28, Math.PI * 1.8);
      const corkMesh = new THREE.Mesh(corkGeo, fawnMat);
      corkMesh.rotation.set(0.4, 0.2, 0.8);
      corkMesh.castShadow = true;
      tailGroup.add(corkMesh);

      // Teal Bandana Collar sitting snugly on neck
      const collarGeo = new THREE.TorusGeometry(0.68, 0.065, 12, 32);
      collarGeo.rotateX(Math.PI / 2.2);
      collarGeo.scale(1.2, 1.0, 1.0);
      const collarMesh = new THREE.Mesh(collarGeo, tealBandanaMat);
      collarMesh.position.set(0, 0.42, 0.22);
      group.add(collarMesh);

      // Head Group (Sitting snugly on top of the chubby neck)
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.78, 0.28);
      group.add(headGroup);

      const headGeo = new THREE.SphereGeometry(0.72, 32, 28);
      headGeo.scale(1.32, 0.92, 1.0);
      const headMesh = new THREE.Mesh(headGeo, fawnMat);
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      // Signature Flat Black Face Mask
      const maskGeo = new THREE.SphereGeometry(0.48, 20, 20);
      maskGeo.scale(1.25, 0.82, 0.55);
      const mask = new THREE.Mesh(maskGeo, darkMaskMat);
      mask.position.set(0, -0.14, 0.58);
      headGroup.add(mask);

      // Drooping Jowls Muzzle (Hai cục mép xệ trễ xuống)
      [-1, 1].forEach((dir) => {
        const jowlGeo = new THREE.SphereGeometry(0.24, 16, 16);
        jowlGeo.scale(1.1, 0.85, 0.7);
        const jowl = new THREE.Mesh(jowlGeo, darkMaskMat);
        jowl.position.set(dir * 0.16, -0.18, 0.72);
        headGroup.add(jowl);
      });

      const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 14), darkNoseMat);
      noseMesh.position.set(0, -0.05, 0.88);
      headGroup.add(noseMesh);

      // Prominent Forehead Wrinkle Folds
      [-1, 1].forEach((dir) => {
        const wrinkleGeo = new THREE.TorusGeometry(0.22, 0.03, 8, 16, Math.PI);
        const wrinkle = new THREE.Mesh(wrinkleGeo, darkMaskMat);
        wrinkle.position.set(dir * 0.18, 0.24, 0.65);
        wrinkle.rotation.set(-0.25, 0, dir * -0.25);
        headGroup.add(wrinkle);
      });

      // Small Button Rose Ears
      const earGeo = new THREE.ConeGeometry(0.22, 0.38, 4);
      earGeo.scale(1.2, 0.9, 0.4);

      const leftEarGroup = new THREE.Group();
      leftEarGroup.position.set(-0.58, 0.42, 0.05);
      leftEarGroup.rotation.set(0.2, 0.1, 0.45);
      headGroup.add(leftEarGroup);
      leftEarGroup.add(new THREE.Mesh(earGeo, darkMaskMat));

      const rightEarGroup = new THREE.Group();
      rightEarGroup.position.set(0.58, 0.42, 0.05);
      rightEarGroup.rotation.set(0.2, -0.1, -0.45);
      headGroup.add(rightEarGroup);
      rightEarGroup.add(new THREE.Mesh(earGeo, darkMaskMat));

      const eyesGroup = createEyesAndBlush(headGroup, 0.66, 0.34, 0.06);

      return {
        root: group,
        headGroup,
        bodyMesh,
        leftEarGroup,
        rightEarGroup,
        tailGroup,
        eyesGroup
      };
    }

    // Build all 5 Unique Puppies with distinct default 3/4 angles to showcase their anatomy
    const puppies = [
      buildShiba(),
      buildCorgi(),
      buildPoodle(),
      buildDachshund(),
      buildPug()
    ];

    // Natural 3/4 display angles for each breed
    const breedDefaultAngles = [
      -0.24, // Shiba: alert slight 3/4 view
       0.48, // Corgi: 3/4 angle showing the long loaf body & sploot
      -0.18, // Poodle: cute sitting teddy angle
       0.55, // Dachshund: 3/4 side angle showing the full long sausage body & 4 feet
      -0.35  // Pug: angled showing the wide barrel body & corkscrew tail
    ];

    puppies.forEach((p, idx) => {
      masterDogGroup.add(p.root);
      p.defaultRotY = breedDefaultAngles[idx];
      p.root.rotation.y = breedDefaultAngles[idx];
      if (idx === activeDogIndexRef.current) {
        p.root.visible = true;
        p.root.scale.set(1, 1, 1);
      } else {
        p.root.visible = false;
        p.root.scale.set(0.001, 0.001, 0.001);
      }
    });

    // Spring & Jump Dog Switch Handler
    const switchDog = (newIndex) => {
      const prevIdx = activeDogIndexRef.current;

      puppies.forEach((p, idx) => {
        gsap.killTweensOf(p.root.scale);
        gsap.killTweensOf(p.root.rotation);

        if (idx === newIndex) {
          p.root.visible = true;
          const targetRot = p.defaultRotY || 0;
          p.root.rotation.y = targetRot + (newIndex > prevIdx ? -0.5 : 0.5);
          gsap.fromTo(
            p.root.scale,
            { x: 0.1, y: 0.1, z: 0.1 },
            {
              x: 1,
              y: 1,
              z: 1,
              duration: 0.55,
              ease: 'back.out(1.8)'
            }
          );
          gsap.to(p.root.rotation, {
            y: targetRot,
            duration: 0.45,
            ease: 'power2.out'
          });
        } else if (p.root.visible) {
          gsap.to(p.root.scale, {
            x: 0.001,
            y: 0.001,
            z: 0.001,
            duration: 0.22,
            ease: 'power2.in',
            onComplete: () => {
              p.root.visible = false;
            }
          });
        }
      });
    };

    internalRef.current.switchDog = switchDog;

    // --- 3D Radiant Fairy Butterfly ---
    const butterflyGroup = new THREE.Group();
    scene.add(butterflyGroup);

    const bBodyMat = new THREE.MeshStandardMaterial({
      color: 0x331822,
      roughness: 0.35,
      metalness: 0.15
    });

    const bHeadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), bBodyMat);
    bHeadMesh.position.set(0, 0.15, 0.02);
    butterflyGroup.add(bHeadMesh);

    const antMat = new THREE.MeshStandardMaterial({ color: 0x4a2228, roughness: 0.4 });
    const antTipMat = new THREE.MeshStandardMaterial({
      color: 0xffea75,
      emissive: 0xffaa00,
      emissiveIntensity: 0.95
    });
    const antGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.11, 8);
    const antTipGeo = new THREE.SphereGeometry(0.013, 8, 8);

    [-1, 1].forEach((dir) => {
      const ant = new THREE.Mesh(antGeo, antMat);
      ant.position.set(dir * 0.03, 0.21, 0.03);
      ant.rotation.set(0.15, 0, dir * -0.35);
      butterflyGroup.add(ant);

      const tip = new THREE.Mesh(antTipGeo, antTipMat);
      tip.position.set(dir * 0.055, 0.26, 0.045);
      butterflyGroup.add(tip);
    });

    const bThoraxMesh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), bBodyMat);
    bThoraxMesh.position.set(0, 0.06, 0.01);
    butterflyGroup.add(bThoraxMesh);

    const bAbdomenMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.01, 0.25, 12), bBodyMat);
    bAbdomenMesh.position.set(0, -0.09, -0.01);
    butterflyGroup.add(bAbdomenMesh);

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xff6b35,
      emissive: 0xff3b00,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      side: THREE.DoubleSide
    });
    const wingAccentMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffa000,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const hindWingMat = new THREE.MeshStandardMaterial({
      color: 0xff8c5a,
      emissive: 0xff4f1f,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      side: THREE.DoubleSide
    });

    const foreWingShape = new THREE.Shape();
    foreWingShape.moveTo(0, 0.02);
    foreWingShape.bezierCurveTo(0.15, 0.22, 0.40, 0.65, 0.75, 0.55);
    foreWingShape.bezierCurveTo(0.92, 0.45, 0.95, 0.18, 0.72, -0.02);
    foreWingShape.bezierCurveTo(0.50, -0.15, 0.25, -0.06, 0, 0.02);
    const foreWingGeo = new THREE.ShapeGeometry(foreWingShape);

    const innerForeShape = new THREE.Shape();
    innerForeShape.moveTo(0, 0.02);
    innerForeShape.bezierCurveTo(0.12, 0.18, 0.32, 0.48, 0.58, 0.42);
    innerForeShape.bezierCurveTo(0.70, 0.35, 0.70, 0.14, 0.52, 0.02);
    innerForeShape.bezierCurveTo(0.35, -0.08, 0.18, -0.03, 0, 0.02);
    const innerForeGeo = new THREE.ShapeGeometry(innerForeShape);

    const hindWingShape = new THREE.Shape();
    hindWingShape.moveTo(0, 0);
    hindWingShape.bezierCurveTo(0.18, -0.06, 0.50, -0.16, 0.52, -0.42);
    hindWingShape.bezierCurveTo(0.40, -0.58, 0.15, -0.50, 0, 0);
    const hindWingGeo = new THREE.ShapeGeometry(hindWingShape);

    // Left Wing Group
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-0.015, 0.05, 0);
    const leftForeWing = new THREE.Mesh(foreWingGeo, wingMat);
    leftForeWing.scale.set(-1, 1, 1);
    leftWingGroup.add(leftForeWing);

    const leftInnerFore = new THREE.Mesh(innerForeGeo, wingAccentMat);
    leftInnerFore.scale.set(-1, 1, 1);
    leftInnerFore.position.z = 0.003;
    leftWingGroup.add(leftInnerFore);

    const leftHindWing = new THREE.Mesh(hindWingGeo, hindWingMat);
    leftHindWing.scale.set(-1, 1, 1);
    leftWingGroup.add(leftHindWing);
    butterflyGroup.add(leftWingGroup);

    // Right Wing Group
    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.015, 0.05, 0);
    const rightForeWing = new THREE.Mesh(foreWingGeo, wingMat);
    rightWingGroup.add(rightForeWing);

    const rightInnerFore = new THREE.Mesh(innerForeGeo, wingAccentMat);
    rightInnerFore.position.z = 0.003;
    rightWingGroup.add(rightInnerFore);

    const rightHindWing = new THREE.Mesh(hindWingGeo, hindWingMat);
    rightWingGroup.add(rightHindWing);
    butterflyGroup.add(rightWingGroup);

    butterflyGroup.scale.set(0.72, 0.72, 0.72);

    // Dust Trail Behind Butterfly
    const dustTrail = [
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, opacity: 0.85 })), lag: 0.08 },
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffdf70, transparent: true, opacity: 0.7 })), lag: 0.16 },
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffb84d, transparent: true, opacity: 0.55 })), lag: 0.24 }
    ];
    dustTrail.forEach((d) => scene.add(d.mesh));

    // Floating Golden Stars
    const starGeo = new THREE.OctahedronGeometry(0.075, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xffa900,
      emissiveIntensity: 0.55,
      roughness: 0.2
    });
    const floatingStars = [
      { mesh: new THREE.Mesh(starGeo, starMat), x: -1.4, y: 1.55, z: 0.8, speed: 1.1 },
      { mesh: new THREE.Mesh(starGeo, starMat), x: 1.45, y: 1.42, z: 0.6, speed: 0.9 },
      { mesh: new THREE.Mesh(starGeo, starMat), x: -0.85, y: 1.25, z: 1.1, speed: 1.3 },
      { mesh: new THREE.Mesh(starGeo, starMat), x: 1.05, y: 1.75, z: 0.75, speed: 1.15 }
    ];
    floatingStars.forEach((s) => {
      s.mesh.position.set(s.x, s.y, s.z);
      scene.add(s.mesh);
    });

    // 3D Morning Clouds
    function createFluffyCloud(scale = 1) {
      const cloud = new THREE.Group();
      const cMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.65
      });
      [
        { r: 0.28, x: 0, y: 0, z: 0 },
        { r: 0.22, x: -0.24, y: -0.04, z: 0.02 },
        { r: 0.20, x: 0.25, y: -0.05, z: -0.02 },
        { r: 0.18, x: -0.12, y: 0.12, z: -0.01 },
        { r: 0.19, x: 0.14, y: 0.10, z: 0.01 }
      ].forEach((p) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(p.r, 16, 16), cMat);
        m.position.set(p.x, p.y, p.z);
        cloud.add(m);
      });
      cloud.scale.set(scale, scale * 0.75, scale * 0.85);
      return cloud;
    }

    const cloud1 = createFluffyCloud(1.2);
    cloud1.position.set(-1.9, 1.2, -1.5);
    scene.add(cloud1);

    const cloud2 = createFluffyCloud(0.95);
    cloud2.position.set(2.0, 1.5, -2.0);
    scene.add(cloud2);

    // Dust particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 10;
      particlePos[i + 1] = Math.random() * 6 - 2;
      particlePos[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffe29a,
      size: 0.07,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const dustParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(dustParticles);

    // Pointer Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const raycaster = new THREE.Raycaster();
    const rayMouse = new THREE.Vector2(-999, -999);

    const onPointerMove = (clientX, clientY) => {
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = -(clientY / window.innerHeight) * 2 + 1;
      mouse.targetX = x * 0.42;
      mouse.targetY = y * 0.32;
      rayMouse.x = x;
      rayMouse.y = y;
    };

    const handleMouseMove = (e) => onPointerMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Petting reaction on active puppy
    const petDog = (clientX, clientY) => {
      const activeIdx = activeDogIndexRef.current;
      const currentDog = puppies[activeIdx];
      if (!currentDog) return;

      soundManager.playBark(activeIdx);

      gsap.killTweensOf(masterDogGroup.scale);
      gsap.killTweensOf(currentDog.headGroup.rotation);
      gsap.killTweensOf([currentDog.leftEarGroup.rotation, currentDog.rightEarGroup.rotation]);
      gsap.killTweensOf(currentDog.tailGroup.rotation);
      gsap.killTweensOf(currentDog.eyesGroup.scale);

      gsap.fromTo(
        masterDogGroup.scale,
        { x: 1, y: 1, z: 1 },
        {
          x: 1.08,
          y: 0.92,
          z: 1.05,
          duration: 0.14,
          yoyo: true,
          repeat: 1,
          ease: 'power1.out',
          onComplete: () => {
            masterDogGroup.scale.set(1, 1, 1);
          }
        }
      );

      gsap.to(currentDog.headGroup.rotation, {
        x: currentDog.headGroup.rotation.x + 0.18,
        z: 0.14,
        duration: 0.16,
        yoyo: true,
        repeat: 1
      });

      gsap.to([currentDog.leftEarGroup.rotation, currentDog.rightEarGroup.rotation], {
        z: (i) => (i === 0 ? 0.45 : -0.45),
        duration: 0.12,
        yoyo: true,
        repeat: 3,
        ease: 'power2.inOut'
      });

      gsap.to(currentDog.tailGroup.rotation, {
        y: 0.95,
        duration: 0.11,
        yoyo: true,
        repeat: 5,
        ease: 'power1.inOut'
      });

      currentDog.eyesGroup.scale.y = 1;
      gsap.fromTo(
        currentDog.eyesGroup.scale,
        { y: 1 },
        {
          y: 0.12,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
          onComplete: () => {
            currentDog.eyesGroup.scale.y = 1;
          }
        }
      );

      const clickX = clientX || window.innerWidth / 2;
      const clickY = clientY || window.innerHeight / 2 + 20;
      if (onPet) {
        onPet(clickX, clickY);
      }
    };

    internalRef.current.petDog = petDog;

    const handleCanvasInteraction = (e) => {
      let clientX = e.clientX;
      let clientY = e.clientY;

      if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
        rayMouse.x = (clientX / window.innerWidth) * 2 - 1;
        rayMouse.y = -(clientY / window.innerHeight) * 2 + 1;
      }

      const activeIdx = activeDogIndexRef.current;
      const currentDog = puppies[activeIdx];
      if (!currentDog) return;

      raycaster.setFromCamera(rayMouse, camera);
      const intersects = raycaster.intersectObjects(currentDog.root.children, true);

      if (intersects.length > 0) {
        petDog(clientX, clientY);
      }
    };

    canvas.addEventListener('click', handleCanvasInteraction);
    canvas.addEventListener('touchend', handleCanvasInteraction);

    // Natural blinking
    let lastBlinkTime = 0;
    let blinkInterval = 3.2;

    const checkBlink = (time) => {
      if (time - lastBlinkTime > blinkInterval) {
        lastBlinkTime = time;
        blinkInterval = 2.4 + Math.random() * 3.2;

        const activeIdx = activeDogIndexRef.current;
        const currentDog = puppies[activeIdx];
        if (currentDog && !gsap.isTweening(currentDog.eyesGroup.scale)) {
          gsap.killTweensOf(currentDog.eyesGroup.scale);
          gsap.fromTo(
            currentDog.eyesGroup.scale,
            { y: 1 },
            {
              y: 0.06,
              duration: 0.09,
              yoyo: true,
              repeat: 1,
              ease: 'power2.inOut',
              onComplete: () => {
                currentDog.eyesGroup.scale.y = 1;
              }
            }
          );
        }
      }
    };

    // Camera & Framing Responsive Handling
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;

      camera.aspect = aspect;

      if (width < 480) {
        camera.position.set(0, 1.05, 7.8);
        masterDogGroup.position.set(0, -0.68, 0);
      } else if (width < 768) {
        camera.position.set(0, 0.98, 7.3);
        masterDogGroup.position.set(0, -0.62, 0);
      } else {
        camera.position.set(0, 0.88, 6.8);
        masterDogGroup.position.set(0, -0.56, 0);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Butterfly gentle flight & wing flap
      const flapSpeed = 16;
      const flapCycle = (Math.sin(elapsedTime * flapSpeed) + 1) * 0.5;
      const flapAngle = THREE.MathUtils.lerp(0.05, 0.82, Math.pow(flapCycle, 1.25));
      leftWingGroup.rotation.y = flapAngle;
      rightWingGroup.rotation.y = -flapAngle;
      leftWingGroup.rotation.z = Math.sin(elapsedTime * flapSpeed) * 0.16;
      rightWingGroup.rotation.z = -Math.sin(elapsedTime * flapSpeed) * 0.16;

      const bt = elapsedTime * 0.65;
      const prevX = butterflyGroup.position.x;
      const bx = Math.sin(bt) * 0.85 + Math.cos(bt * 0.38) * 0.22;
      const flutterLift = Math.sin(elapsedTime * flapSpeed) * 0.035;
      const by = (window.innerWidth < 480 ? 1.58 : 1.42) + Math.sin(bt * 1.3) * 0.14 + flutterLift;
      const bz = 1.35 + Math.cos(bt * 0.9) * 0.35;
      butterflyGroup.position.set(bx, by, bz);

      const dx = bx - prevX;
      butterflyGroup.rotation.x = 0.22 + Math.sin(bt * 1.3) * 0.06;
      butterflyGroup.rotation.z = Math.max(-0.25, Math.min(0.25, -dx * 2.0));
      butterflyGroup.rotation.y = Math.max(-0.35, Math.min(0.35, dx * 3.0));

      dustTrail.forEach((d, idx) => {
        const tLag = bt - d.lag;
        const tx = Math.sin(tLag) * 0.85 + Math.cos(tLag * 0.38) * 0.22;
        const ty = (window.innerWidth < 480 ? 1.58 : 1.42) + Math.sin(tLag * 1.3) * 0.14 - 0.03 * (idx + 1);
        const tz = 1.35 + Math.cos(tLag * 0.9) * 0.35 - 0.04 * (idx + 1);
        d.mesh.position.set(tx, ty, tz);
        d.mesh.scale.setScalar(0.7 + Math.sin(elapsedTime * 6 + idx) * 0.3);
      });

      floatingStars.forEach((s) => {
        s.mesh.rotation.x += 0.015 * s.speed;
        s.mesh.rotation.y += 0.02 * s.speed;
        s.mesh.position.y = s.y + Math.sin(elapsedTime * s.speed * 1.5) * 0.14;
      });

      cloud1.position.x += 0.0012;
      if (cloud1.position.x > 3.4) cloud1.position.x = -3.4;
      cloud2.position.x += 0.0008;
      if (cloud2.position.x > 3.6) cloud2.position.x = -3.6;

      cloud1.position.y = 1.2 + Math.sin(elapsedTime * 0.7) * 0.04;
      cloud2.position.y = 1.5 + Math.cos(elapsedTime * 0.5) * 0.04;

      // Active Dog Animation & Tracking
      const activeIdx = activeDogIndexRef.current;
      const currentDog = puppies[activeIdx];
      if (currentDog) {
        if (Math.abs(mouse.targetX) < 0.05 && Math.abs(mouse.targetY) < 0.05) {
          currentDog.headGroup.rotation.y = butterflyGroup.position.x * 0.16;
          currentDog.headGroup.rotation.x = -(butterflyGroup.position.y - 0.9) * 0.18;
        } else {
          currentDog.headGroup.rotation.y = mouse.x * 0.85;
          currentDog.headGroup.rotation.x = -mouse.y * 0.65;
        }

        const baseDogY = window.innerWidth < 480 ? -0.68 : (window.innerWidth < 768 ? -0.62 : -0.56);
        masterDogGroup.position.y = baseDogY + Math.sin(elapsedTime * 2.4) * 0.02;
        currentDog.bodyMesh.scale.y = (currentDog.bodyMesh.scale.y || 1) * 0.999 + Math.sin(elapsedTime * 2.4) * 0.001;

        currentDog.tailGroup.rotation.y = Math.sin(elapsedTime * 3.6) * 0.38;
        currentDog.tailGroup.rotation.z = Math.cos(elapsedTime * 2.6) * 0.08;

        if (currentDog.bellMesh) {
          currentDog.bellMesh.position.x = Math.sin(elapsedTime * 3.0) * 0.015;
        }
      }

      const positions = dustParticles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.0035;
        if (positions[i] > 4) positions[i] = -2;
      }
      dustParticles.geometry.attributes.position.needsUpdate = true;
      dustParticles.rotation.y = elapsedTime * 0.02;

      checkBlink(elapsedTime);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasInteraction);
      canvas.removeEventListener('touchend', handleCanvasInteraction);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [onPet]);

  return (
    <canvas
      ref={canvasRef}
      id="webgl-canvas"
      className="fixed inset-0 w-full h-full z-[1] pointer-events-auto touch-none"
    />
  );
});

export default DogCanvas;
