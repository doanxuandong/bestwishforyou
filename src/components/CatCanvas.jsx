import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundManager } from '../utils/audio';

const CatCanvas = forwardRef(function CatCanvas({ onPet }, ref) {
  const canvasRef = useRef(null);
  const internalRef = useRef({});

  useImperativeHandle(ref, () => ({
    petCat: (clientX, clientY) => {
      if (internalRef.current.petCat) {
        internalRef.current.petCat(clientX, clientY);
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffe8d6, 0.035);

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

    // 2. Lighting (Golden warm morning atmosphere)
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.15);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffecd2, 1.6);
    sunLight.position.set(4, 7, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xff9a76, 0.85);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // 3. Materials
    const catColor = 0xfffcf9; // Creamy warm white cat
    const orangeStripeColor = 0xffa964; // Gentle orange patches
    const pinkColor = 0xffb0ba; // Soft pink nose/ears/cheeks
    const eyeColor = 0x2b3846; // Deep navy gloss eyes

    const furMaterial = new THREE.MeshLambertMaterial({ color: catColor });
    const patchMaterial = new THREE.MeshLambertMaterial({ color: orangeStripeColor });
    const innerEarMaterial = new THREE.MeshLambertMaterial({ color: pinkColor });
    const noseMaterial = new THREE.MeshLambertMaterial({ color: pinkColor });
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: eyeColor, shininess: 90 });
    const eyeSparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const whiskerMaterial = new THREE.LineBasicMaterial({ color: 0xc4b5a5, linewidth: 2 });
    const collarMaterial = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
    const bellMaterial = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.65, roughness: 0.25 });

    const catGroup = new THREE.Group();
    catGroup.position.set(0, -0.65, 0);
    scene.add(catGroup);

    // --- Body ---
    const bodyGeo = new THREE.SphereGeometry(0.85, 32, 24);
    bodyGeo.scale(1, 1.15, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeo, furMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    catGroup.add(bodyMesh);

    // Cute orange patch on back
    const backPatchGeo = new THREE.SphereGeometry(0.5, 16, 16);
    backPatchGeo.scale(0.8, 1, 0.3);
    const backPatch = new THREE.Mesh(backPatchGeo, patchMaterial);
    backPatch.position.set(0.35, 0.25, -0.65);
    catGroup.add(backPatch);

    // --- Paws ---
    const pawGeo = new THREE.SphereGeometry(0.22, 16, 16);
    pawGeo.scale(0.9, 0.6, 1.25);

    const leftPaw = new THREE.Mesh(pawGeo, furMaterial);
    leftPaw.position.set(-0.42, -0.85, 0.65);
    leftPaw.castShadow = true;
    catGroup.add(leftPaw);

    const rightPaw = new THREE.Mesh(pawGeo, furMaterial);
    rightPaw.position.set(0.42, -0.85, 0.65);
    rightPaw.castShadow = true;
    catGroup.add(rightPaw);

    // --- Tail ---
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, -0.6, -0.8);
    catGroup.add(tailGroup);

    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.25, 0.35, -0.3),
      new THREE.Vector3(0.1, 0.8, -0.45),
      new THREE.Vector3(-0.15, 1.1, -0.35)
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 20, 0.09, 8, false);
    const tailMesh = new THREE.Mesh(tailGeo, patchMaterial);
    tailMesh.castShadow = true;
    tailGroup.add(tailMesh);

    // --- Collar & Bell ---
    const collarGeo = new THREE.TorusGeometry(0.72, 0.05, 12, 32);
    collarGeo.rotateX(Math.PI / 2.2);
    const collarMesh = new THREE.Mesh(collarGeo, collarMaterial);
    collarMesh.position.set(0, 0.6, 0.05);
    catGroup.add(collarMesh);

    const bellGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const bellMesh = new THREE.Mesh(bellGeo, bellMaterial);
    bellMesh.position.set(0, 0.48, 0.72);
    bellMesh.castShadow = true;
    catGroup.add(bellMesh);

    // --- Head Group ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0.15);
    catGroup.add(headGroup);

    // Head Base (Chubby cheeks)
    const headGeo = new THREE.SphereGeometry(0.72, 32, 28);
    headGeo.scale(1.1, 0.95, 1.02);
    const headMesh = new THREE.Mesh(headGeo, furMaterial);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Cute forehead patch
    const foreheadPatchGeo = new THREE.SphereGeometry(0.38, 16, 16);
    foreheadPatchGeo.scale(0.8, 0.9, 0.3);
    const foreheadPatch = new THREE.Mesh(foreheadPatchGeo, patchMaterial);
    foreheadPatch.position.set(-0.25, 0.3, 0.58);
    foreheadPatch.rotation.set(-0.1, 0.2, 0.1);
    headGroup.add(foreheadPatch);

    // --- Ears with wiggle ---
    const leftEarGroup = new THREE.Group();
    leftEarGroup.position.set(-0.48, 0.58, 0.1);
    leftEarGroup.rotation.z = 0.25;
    leftEarGroup.rotation.x = -0.15;
    headGroup.add(leftEarGroup);

    const earGeo = new THREE.ConeGeometry(0.28, 0.5, 4);
    earGeo.scale(1, 1, 0.45);
    const leftEarMesh = new THREE.Mesh(earGeo, furMaterial);
    leftEarGroup.add(leftEarMesh);

    const innerEarGeo = new THREE.ConeGeometry(0.18, 0.36, 4);
    innerEarGeo.scale(1, 1, 0.35);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, innerEarMaterial);
    leftInnerEar.position.set(0, -0.04, 0.05);
    leftEarGroup.add(leftInnerEar);

    const rightEarGroup = new THREE.Group();
    rightEarGroup.position.set(0.48, 0.58, 0.1);
    rightEarGroup.rotation.z = -0.25;
    rightEarGroup.rotation.x = -0.15;
    headGroup.add(rightEarGroup);

    const rightEarMesh = new THREE.Mesh(earGeo, patchMaterial);
    rightEarGroup.add(rightEarMesh);

    const rightInnerEar = new THREE.Mesh(innerEarGeo, innerEarMaterial);
    rightInnerEar.position.set(0, -0.04, 0.05);
    rightEarGroup.add(rightInnerEar);

    // --- Eyes (Glossy with anime sparkles) ---
    const eyesGroup = new THREE.Group();
    headGroup.add(eyesGroup);

    const eyeBaseGeo = new THREE.SphereGeometry(0.12, 20, 20);
    const eyeSparkleGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const eyeMiniSparkleGeo = new THREE.SphereGeometry(0.02, 8, 8);

    // Left Eye
    const leftEyeContainer = new THREE.Group();
    leftEyeContainer.position.set(-0.28, 0.08, 0.66);
    eyesGroup.add(leftEyeContainer);

    const leftEye = new THREE.Mesh(eyeBaseGeo, eyeMaterial);
    leftEyeContainer.add(leftEye);

    const leftSparkle1 = new THREE.Mesh(eyeSparkleGeo, eyeSparkleMaterial);
    leftSparkle1.position.set(-0.03, 0.04, 0.1);
    leftEyeContainer.add(leftSparkle1);

    const leftSparkle2 = new THREE.Mesh(eyeMiniSparkleGeo, eyeSparkleMaterial);
    leftSparkle2.position.set(0.04, -0.03, 0.1);
    leftEyeContainer.add(leftSparkle2);

    // Right Eye
    const rightEyeContainer = new THREE.Group();
    rightEyeContainer.position.set(0.28, 0.08, 0.66);
    eyesGroup.add(rightEyeContainer);

    const rightEye = new THREE.Mesh(eyeBaseGeo, eyeMaterial);
    rightEyeContainer.add(rightEye);

    const rightSparkle1 = new THREE.Mesh(eyeSparkleGeo, eyeSparkleMaterial);
    rightSparkle1.position.set(-0.03, 0.04, 0.1);
    rightEyeContainer.add(rightSparkle1);

    const rightSparkle2 = new THREE.Mesh(eyeMiniSparkleGeo, eyeSparkleMaterial);
    rightSparkle2.position.set(0.04, -0.03, 0.1);
    rightEyeContainer.add(rightSparkle2);

    // Blushing Cheeks
    const blushGeo = new THREE.SphereGeometry(0.12, 16, 16);
    blushGeo.scale(1.2, 0.5, 0.4);

    const leftBlush = new THREE.Mesh(blushGeo, innerEarMaterial);
    leftBlush.position.set(-0.46, -0.07, 0.58);
    leftBlush.rotation.set(0.1, -0.4, 0.1);
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, innerEarMaterial);
    rightBlush.position.set(0.46, -0.07, 0.58);
    rightBlush.rotation.set(0.1, 0.4, -0.1);
    headGroup.add(rightBlush);

    // Tiny Pink Nose
    const noseGeo = new THREE.SphereGeometry(0.05, 12, 12);
    noseGeo.scale(1.1, 0.8, 0.9);
    const noseMesh = new THREE.Mesh(noseGeo, noseMaterial);
    noseMesh.position.set(0, 0.01, 0.74);
    headGroup.add(noseMesh);

    // Snout / Mouth Muzzle
    const muzzleGeo = new THREE.SphereGeometry(0.11, 14, 14);
    muzzleGeo.scale(1.1, 0.85, 0.7);

    const leftMuzzle = new THREE.Mesh(muzzleGeo, furMaterial);
    leftMuzzle.position.set(-0.08, -0.07, 0.69);
    headGroup.add(leftMuzzle);

    const rightMuzzle = new THREE.Mesh(muzzleGeo, furMaterial);
    rightMuzzle.position.set(0.08, -0.07, 0.69);
    headGroup.add(rightMuzzle);

    // Whiskers
    function createWhisker(x1, y1, z1, x2, y2, z2) {
      const points = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geom, whiskerMaterial);
    }
    headGroup.add(createWhisker(-0.16, -0.05, 0.7, -0.65, 0.02, 0.72));
    headGroup.add(createWhisker(-0.16, -0.09, 0.7, -0.62, -0.14, 0.7));
    headGroup.add(createWhisker(0.16, -0.05, 0.7, 0.65, 0.02, 0.72));
    headGroup.add(createWhisker(0.16, -0.09, 0.7, 0.62, -0.14, 0.7));

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

    // Platform Cushion
    const cushionGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.25, 36);
    const cushionMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.position.set(0, -0.92, 0);
    cushion.receiveShadow = true;
    catGroup.add(cushion);

    // --- 3D Radiant Fairy Butterfly (Bay lượn đúng khoảng trống giữa chữ và đầu mèo, cánh to rõ 100%) ---
    const butterflyGroup = new THREE.Group();
    scene.add(butterflyGroup);

    // Thân bướm thon gọn, dễ thương
    const bBodyMat = new THREE.MeshStandardMaterial({
      color: 0x331822, // Nâu tím nhung sang trọng
      roughness: 0.35,
      metalness: 0.15
    });

    // Đầu bướm
    const bHeadGeo = new THREE.SphereGeometry(0.045, 14, 14);
    const bHeadMesh = new THREE.Mesh(bHeadGeo, bBodyMat);
    bHeadMesh.position.set(0, 0.15, 0.02);
    butterflyGroup.add(bHeadMesh);

    // 2 Râu cong xinh xắn với hạt ngọc vàng phát sáng
    const antMat = new THREE.MeshStandardMaterial({ color: 0x4a2228, roughness: 0.4 });
    const antTipMat = new THREE.MeshStandardMaterial({
      color: 0xffea75,
      emissive: 0xffaa00,
      emissiveIntensity: 0.95
    });
    const antGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.11, 8);
    const antTipGeo = new THREE.SphereGeometry(0.013, 8, 8);

    const leftAnt = new THREE.Mesh(antGeo, antMat);
    leftAnt.position.set(-0.03, 0.21, 0.03);
    leftAnt.rotation.set(0.15, 0, 0.35);
    butterflyGroup.add(leftAnt);
    const leftTip = new THREE.Mesh(antTipGeo, antTipMat);
    leftTip.position.set(-0.055, 0.26, 0.045);
    butterflyGroup.add(leftTip);

    const rightAnt = new THREE.Mesh(antGeo, antMat);
    rightAnt.position.set(0.03, 0.21, 0.03);
    rightAnt.rotation.set(0.15, 0, -0.35);
    butterflyGroup.add(rightAnt);
    const rightTip = new THREE.Mesh(antTipGeo, antTipMat);
    rightTip.position.set(0.055, 0.26, 0.045);
    butterflyGroup.add(rightTip);

    // Ngực & Bụng bướm
    const bThoraxGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const bThoraxMesh = new THREE.Mesh(bThoraxGeo, bBodyMat);
    bThoraxMesh.position.set(0, 0.06, 0.01);
    butterflyGroup.add(bThoraxMesh);

    const bAbdomenGeo = new THREE.CylinderGeometry(0.026, 0.01, 0.25, 12);
    const bAbdomenMesh = new THREE.Mesh(bAbdomenGeo, bBodyMat);
    bAbdomenMesh.position.set(0, -0.09, -0.01);
    butterflyGroup.add(bAbdomenMesh);

    // Màu cánh ban mai: Cam đào rực rỡ + Vàng kim tỏa nắng
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xff6b35,
      emissive: 0xff3b00,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.1,
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

    // Cánh trước to tròn hình cánh bướm tiêu chuẩn (Forewing: rộng 0.75, cao 0.60)
    const foreWingShape = new THREE.Shape();
    foreWingShape.moveTo(0, 0.02);
    foreWingShape.bezierCurveTo(0.15, 0.22, 0.40, 0.65, 0.75, 0.55);
    foreWingShape.bezierCurveTo(0.92, 0.45, 0.95, 0.18, 0.72, -0.02);
    foreWingShape.bezierCurveTo(0.50, -0.15, 0.25, -0.06, 0, 0.02);
    const foreWingGeo = new THREE.ShapeGeometry(foreWingShape);

    // Đốm sáng vàng kim rực rỡ bên trong cánh trước
    const innerForeShape = new THREE.Shape();
    innerForeShape.moveTo(0, 0.02);
    innerForeShape.bezierCurveTo(0.12, 0.18, 0.32, 0.48, 0.58, 0.42);
    innerForeShape.bezierCurveTo(0.70, 0.35, 0.70, 0.14, 0.52, 0.02);
    innerForeShape.bezierCurveTo(0.35, -0.08, 0.18, -0.03, 0, 0.02);
    const innerForeGeo = new THREE.ShapeGeometry(innerForeShape);

    // Cánh sau cong tròn mềm mại (Hindwing)
    const hindWingShape = new THREE.Shape();
    hindWingShape.moveTo(0, 0);
    hindWingShape.bezierCurveTo(0.18, -0.06, 0.50, -0.16, 0.52, -0.42);
    hindWingShape.bezierCurveTo(0.40, -0.58, 0.15, -0.50, 0, 0);
    const hindWingGeo = new THREE.ShapeGeometry(hindWingShape);

    // Cánh trái (Left Wing Group)
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

    // Cánh phải (Right Wing Group)
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

    // Kích thước bướm nhỏ nhắn, xinh xắn, vừa vặn hoàn hảo trong khoảng trống
    butterflyGroup.scale.set(0.75, 0.75, 0.75);

    // 3 Hạt bụi tiên vàng lấp lánh bay theo sau bướm (Sparkle Dust Trail)
    const dustTrail = [
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, opacity: 0.85 })), lag: 0.08 },
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffdf70, transparent: true, opacity: 0.7 })), lag: 0.16 },
      { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffb84d, transparent: true, opacity: 0.55 })), lag: 0.24 }
    ];
    dustTrail.forEach((d) => scene.add(d.mesh));

    // --- Floating 3D Golden Fairy Stars (Tinh thể sao 3D lấp lánh ở khoảng trống) ---
    const starGeo = new THREE.OctahedronGeometry(0.075, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xffa900,
      emissiveIntensity: 0.55,
      roughness: 0.2
    });
    const floatingStars = [
      { mesh: new THREE.Mesh(starGeo, starMat), x: -1.3, y: 1.65, z: 0.8, speed: 1.1 },
      { mesh: new THREE.Mesh(starGeo, starMat), x: 1.35, y: 1.45, z: 0.6, speed: 0.9 },
      { mesh: new THREE.Mesh(starGeo, starMat), x: -0.75, y: 1.25, z: 1.1, speed: 1.3 },
      { mesh: new THREE.Mesh(starGeo, starMat), x: 0.95, y: 1.85, z: 0.75, speed: 1.15 }
    ];
    floatingStars.forEach((s) => {
      s.mesh.position.set(s.x, s.y, s.z);
      scene.add(s.mesh);
    });

    // --- 3D Fluffy Morning Clouds ---
    function createFluffyCloud(scale = 1) {
      const cloud = new THREE.Group();
      const cMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.65
      });
      const parts = [
        { r: 0.28, x: 0, y: 0, z: 0 },
        { r: 0.22, x: -0.24, y: -0.04, z: 0.02 },
        { r: 0.20, x: 0.25, y: -0.05, z: -0.02 },
        { r: 0.18, x: -0.12, y: 0.12, z: -0.01 },
        { r: 0.19, x: 0.14, y: 0.10, z: 0.01 }
      ];
      parts.forEach((p) => {
        const geo = new THREE.SphereGeometry(p.r, 16, 16);
        const m = new THREE.Mesh(geo, cMat);
        m.position.set(p.x, p.y, p.z);
        cloud.add(m);
      });
      cloud.scale.set(scale, scale * 0.75, scale * 0.85);
      return cloud;
    }

    const cloud1 = createFluffyCloud(1.2);
    cloud1.position.set(-1.8, 1.3, -1.5);
    scene.add(cloud1);

    const cloud2 = createFluffyCloud(0.95);
    cloud2.position.set(1.9, 1.6, -2.0);
    scene.add(cloud2);

    // Mouse & Touch tracking coordinates
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const raycaster = new THREE.Raycaster();
    const rayMouse = new THREE.Vector2(-999, -999);

    const onPointerMove = (clientX, clientY) => {
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = -(clientY / window.innerHeight) * 2 + 1;
      mouse.targetX = x * 0.45;
      mouse.targetY = y * 0.35;

      rayMouse.x = x;
      rayMouse.y = y;
    };

    const handleMouseMove = (e) => {
      onPointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Petting reaction implementation
    const petCat = (clientX, clientY) => {
      soundManager.playMeow();
      soundManager.playPurr();

      // Kill previous tweens so rapid clicks don't trap the scales mid-transition
      gsap.killTweensOf(catGroup.scale);
      gsap.killTweensOf(headGroup.rotation);
      gsap.killTweensOf([leftEarGroup.rotation, rightEarGroup.rotation]);
      gsap.killTweensOf(tailGroup.rotation);
      gsap.killTweensOf(eyesGroup.scale);

      // Bounce & Wiggle Animation via GSAP (always cleanly resets)
      gsap.fromTo(catGroup.scale,
        { x: 1, y: 1 },
        {
          x: 1.08,
          y: 0.92,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: 'power1.out',
          onComplete: () => {
            catGroup.scale.set(1, 1, 1);
          }
        }
      );

      gsap.to(headGroup.rotation, {
        x: headGroup.rotation.x + 0.2,
        duration: 0.15,
        yoyo: true,
        repeat: 1
      });

      // Ear twitch
      gsap.to([leftEarGroup.rotation, rightEarGroup.rotation], {
        z: (i) => (i === 0 ? 0.45 : -0.45),
        duration: 0.12,
        yoyo: true,
        repeat: 3,
        ease: 'power2.inOut'
      });

      // Tail energetic swish
      gsap.to(tailGroup.rotation, {
        y: 0.8,
        duration: 0.18,
        yoyo: true,
        repeat: 3
      });

      // Close eyes warmly and GUARANTEE they reopen completely to y = 1
      eyesGroup.scale.y = 1;
      gsap.fromTo(eyesGroup.scale,
        { y: 1 },
        {
          y: 0.1,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
          onComplete: () => {
            eyesGroup.scale.y = 1;
          }
        }
      );

      const clickX = clientX || window.innerWidth / 2;
      const clickY = clientY || window.innerHeight / 2 + 20;
      if (onPet) {
        onPet(clickX, clickY);
      }
    };

    internalRef.current.petCat = petCat;

    // Direct canvas tap/click detection on cat
    const handleCanvasInteraction = (e) => {
      let clientX = e.clientX;
      let clientY = e.clientY;

      if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
        rayMouse.x = (clientX / window.innerWidth) * 2 - 1;
        rayMouse.y = -(clientY / window.innerHeight) * 2 + 1;
      }

      raycaster.setFromCamera(rayMouse, camera);
      const intersects = raycaster.intersectObjects(catGroup.children, true);

      if (intersects.length > 0) {
        petCat(clientX, clientY);
      }
    };

    canvas.addEventListener('click', handleCanvasInteraction);
    canvas.addEventListener('touchend', handleCanvasInteraction);

    // Natural blinking
    let lastBlinkTime = 0;
    let blinkInterval = 3.5;

    const checkBlink = (time) => {
      if (time - lastBlinkTime > blinkInterval) {
        lastBlinkTime = time;
        blinkInterval = 2.5 + Math.random() * 3.5;

        // Only blink if eyes are not currently tweened by petting
        if (!gsap.isTweening(eyesGroup.scale)) {
          gsap.killTweensOf(eyesGroup.scale);
          gsap.fromTo(eyesGroup.scale,
            { y: 1 },
            {
              y: 0.05,
              duration: 0.09,
              yoyo: true,
              repeat: 1,
              ease: 'power2.inOut',
              onComplete: () => {
                eyesGroup.scale.y = 1;
              }
            }
          );
        }
      }
    };

      // Responsive camera & positioning optimization for Mobile vs Desktop
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;

      camera.aspect = aspect;

      // Dynamic framing:
      // Mobile screens (portrait aspect < 0.8) place the cat at a natural height
      // with the butterfly fluttering gracefully right in the middle gap!
      if (width < 480) {
        camera.position.set(0, 1.35, 7.0);
        catGroup.position.set(0, -0.78, 0);
      } else if (width < 768) {
        camera.position.set(0, 1.25, 6.4);
        catGroup.position.set(0, -0.72, 0);
      } else {
        camera.position.set(0, 1.2, 5.8);
        catGroup.position.set(0, -0.65, 0);
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

      // Smooth tracking interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // --- 3D Butterfly flight & organic wing flapping (Vỗ cánh uyển chuyển, thấy rõ từng nhịp đập) ---
      const flapSpeed = 16;
      // Chu kỳ vỗ cánh: mở rộng cánh -> vỗ khép góc chữ V ~48 độ
      const flapCycle = (Math.sin(elapsedTime * flapSpeed) + 1) * 0.5; // từ 0 đến 1
      const flapAngle = THREE.MathUtils.lerp(0.05, 0.82, Math.pow(flapCycle, 1.25));
      leftWingGroup.rotation.y = flapAngle;
      rightWingGroup.rotation.y = -flapAngle;

      // Độ nhấp nhô đầu cánh lên xuống theo lực cản gió
      leftWingGroup.rotation.z = Math.sin(elapsedTime * flapSpeed) * 0.16;
      rightWingGroup.rotation.z = -Math.sin(elapsedTime * flapSpeed) * 0.16;

      const bt = elapsedTime * 0.65;
      const prevX = butterflyGroup.position.x;

      // Quỹ đạo bay lượn hình số 8 CHÍNH GIỮA KHOẢNG TRỐNG giữa câu chúc và tai mèo
      const bx = Math.sin(bt) * 0.85 + Math.cos(bt * 0.38) * 0.22;
      // Lực nâng mỗi nhịp vỗ cánh làm bướm bồng bềnh
      const flutterLift = Math.sin(elapsedTime * flapSpeed) * 0.035;
      // y = 1.72 đặt chú bướm chính giữa khoảng trống (dưới câu chúc 2.1, trên tai mèo 1.2)
      const by = (window.innerWidth < 480 ? 1.72 : 1.55) + Math.sin(bt * 1.3) * 0.16 + flutterLift;
      const bz = 1.35 + Math.cos(bt * 0.9) * 0.35;
      butterflyGroup.position.set(bx, by, bz);

      const dx = bx - prevX;
      // 1. Góc nhìn hướng về camera để người dùng luôn chiêm ngưỡng trọn vẹn đôi cánh
      butterflyGroup.rotation.x = 0.22 + Math.sin(bt * 1.3) * 0.06;

      // 2. Độ nghiêng lượn nhẹ nhàng khi đổi hướng
      butterflyGroup.rotation.z = Math.max(-0.25, Math.min(0.25, -dx * 2.0));

      // 3. Xoay nhẹ đầu theo hướng bay
      butterflyGroup.rotation.y = Math.max(-0.35, Math.min(0.35, dx * 3.0));

      // Cập nhật bụi tiên vàng lấp lánh bay theo sau bướm
      dustTrail.forEach((d, idx) => {
        const tLag = bt - d.lag;
        const tx = Math.sin(tLag) * 0.85 + Math.cos(tLag * 0.38) * 0.22;
        const ty = (window.innerWidth < 480 ? 1.72 : 1.55) + Math.sin(tLag * 1.3) * 0.16 - 0.03 * (idx + 1);
        const tz = 1.35 + Math.cos(tLag * 0.9) * 0.35 - 0.04 * (idx + 1);
        d.mesh.position.set(tx, ty, tz);
        d.mesh.scale.setScalar(0.7 + Math.sin(elapsedTime * 6 + idx) * 0.3);
      });

      // --- Floating Golden Fairy Stars Animation ---
      floatingStars.forEach((s) => {
        s.mesh.rotation.x += 0.015 * s.speed;
        s.mesh.rotation.y += 0.02 * s.speed;
        s.mesh.position.y = s.y + Math.sin(elapsedTime * s.speed * 1.5) * 0.14;
      });

      // --- Soft Clouds gentle drift ---
      cloud1.position.x += 0.0012;
      if (cloud1.position.x > 3.4) cloud1.position.x = -3.4;
      cloud2.position.x += 0.0008;
      if (cloud2.position.x > 3.6) cloud2.position.x = -3.6;

      cloud1.position.y = 1.2 + Math.sin(elapsedTime * 0.7) * 0.04;
      cloud2.position.y = 1.5 + Math.cos(elapsedTime * 0.5) * 0.04;

      // Cat head tracks cursor/touch, or cutely glances at the butterfly when user is idle!
      if (Math.abs(mouse.targetX) < 0.05 && Math.abs(mouse.targetY) < 0.05) {
        headGroup.rotation.y = butterflyGroup.position.x * 0.18;
        headGroup.rotation.x = -(butterflyGroup.position.y - 0.9) * 0.20;
      } else {
        headGroup.rotation.y = mouse.x * 0.9;
        headGroup.rotation.x = -mouse.y * 0.7;
      }

      // Cute natural breathing motion
      const baseCatY = window.innerWidth < 480 ? -0.78 : (window.innerWidth < 768 ? -0.72 : -0.65);
      catGroup.position.y = baseCatY + Math.sin(elapsedTime * 2.2) * 0.025;
      bodyMesh.scale.y = 1.15 + Math.sin(elapsedTime * 2.2) * 0.02;

      // Gentle tail idle swaying
      tailGroup.rotation.y = Math.sin(elapsedTime * 2.0) * 0.35;
      tailGroup.rotation.z = Math.cos(elapsedTime * 1.5) * 0.08;

      // Soft bell dangle
      bellMesh.position.x = Math.sin(elapsedTime * 3.0) * 0.015;

      // Upward drift for morning particles
      const positions = dustParticles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.0035;
        if (positions[i] > 4) {
          positions[i] = -2;
        }
      }
      dustParticles.geometry.attributes.position.needsUpdate = true;
      dustParticles.rotation.y = elapsedTime * 0.02;

      // Blinking controller
      checkBlink(elapsedTime);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasInteraction);
      canvas.removeEventListener('touchend', handleCanvasInteraction);
      cancelAnimationFrame(animationFrameId);

      // Dispose Three.js objects
      renderer.dispose();
      [
        bodyGeo, backPatchGeo, pawGeo, tailGeo, collarGeo, bellGeo,
        headGeo, foreheadPatchGeo, earGeo, innerEarGeo, eyeBaseGeo,
        eyeSparkleGeo, eyeMiniSparkleGeo, blushGeo, noseGeo, muzzleGeo,
        particleGeo, cushionGeo, bHeadGeo, bThoraxGeo, bAbdomenGeo,
        foreWingGeo, innerForeGeo, hindWingGeo, antGeo, antTipGeo
      ].forEach((geo) => {
        try { if (geo && geo.dispose) geo.dispose(); } catch (e) {}
      });

      [
        furMaterial, patchMaterial, innerEarMaterial, noseMaterial,
        eyeMaterial, eyeSparkleMaterial, whiskerMaterial, collarMaterial,
        bellMaterial, particleMat, cushionMat, bBodyMat, wingMat, wingAccentMat,
        hindWingMat, antMat, antTipMat
      ].forEach((mat) => {
        try { if (mat && mat.dispose) mat.dispose(); } catch (e) {}
      });
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

export default CatCanvas;
