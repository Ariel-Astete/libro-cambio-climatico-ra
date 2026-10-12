const THREE = AFRAME.THREE;

function addMesh(parent, geometry, material, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  parent.add(object);
  return object;
}

function addLights(parent) {
  parent.add(new THREE.HemisphereLight(0xe8f7ed, 0x435c4b, 2.1));
  const key = new THREE.DirectionalLight(0xfff1d0, 2.2);
  key.position.set(-3, 5, 4);
  parent.add(key);
}

function addSphericalPatch(parent, points, radius, color) {
  const toVector = ([latitude, longitude]) => {
    const lat = latitude * Math.PI / 180;
    const lon = longitude * Math.PI / 180;
    return new THREE.Vector3(
      radius * Math.cos(lat) * Math.sin(lon),
      radius * Math.sin(lat),
      radius * Math.cos(lat) * Math.cos(lon)
    );
  };
  const center = points.reduce((sum, point) => sum.add(toVector(point)), new THREE.Vector3())
    .divideScalar(points.length).normalize().multiplyScalar(radius);
  const vertices = [...center.toArray(), ...points.flatMap(point => toVector(point).toArray())];
  const indices = [];

  for (let index = 0; index < points.length; index += 1) {
    indices.push(0, index + 1, (index + 1) % points.length + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return addMesh(parent, geometry, new THREE.MeshStandardMaterial({
    color,
    roughness: 0.92,
    side: THREE.DoubleSide
  }));
}

function createEarth(parent) {
  const globe = new THREE.Group();
  globe.position.y = 1.08;
  parent.add(globe);

  addMesh(globe, new THREE.SphereGeometry(0.72, 40, 28), new THREE.MeshStandardMaterial({
    color: 0x2188a0,
    roughness: 0.82,
    metalness: 0.02
  }));

  const land = [
    [[70, -48], [60, -67], [48, -59], [38, -75], [24, -81], [9, -78], [-4, -80], [-18, -74], [-32, -69], [-50, -70], [-55, -58], [-37, -51], [-18, -45], [0, -50], [14, -61], [32, -54], [48, -43]],
    [[72, 5], [63, 29], [53, 42], [42, 34], [31, 47], [15, 43], [5, 35], [-7, 42], [-22, 40], [-34, 28], [-35, 18], [-20, 12], [-4, 15], [10, 4], [25, -7], [39, -2], [53, 10]],
    [[-12, 112], [-7, 130], [-18, 148], [-31, 151], [-40, 140], [-38, 119], [-26, 113]],
    [[8, 96], [18, 111], [10, 123], [-3, 118], [-7, 105]],
    [[74, -42], [83, -36], [78, -19], [68, -24], [61, -42]]
  ];
  land.forEach(points => addSphericalPatch(globe, points, 0.728, 0x83b76b));

  const atmosphere = addMesh(parent, new THREE.SphereGeometry(0.81, 36, 24),
    new THREE.MeshBasicMaterial({
      color: 0x73d9e6,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    }), [0, 1.08, 0]);

  return { globe, atmosphere };
}

function addLabel(text, parent, position, color = "#f5f5eb") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 112;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(20, 48, 41, 0.78)";
  context.beginPath();
  context.roundRect(6, 6, 500, 100, 18);
  context.fill();
  context.fillStyle = color;
  context.font = "700 34px Trebuchet MS, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 256, 57, 470);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  }));
  label.position.set(...position);
  label.scale.set(1.2, 0.27, 1);
  parent.add(label);
  return label;
}

AFRAME.registerComponent("clima-escenas", {
  init: function () {
    this.pages = {};
    this.page = null;
    this.elapsed = 0;
    this.animations = {
      earth: [],
      heat: [],
      particles: [],
      arrows: [],
      melting: [],
      turbines: [],
      sun: null
    };

    for (let page = 1; page <= 5; page += 1) {
      const group = new THREE.Group();
      group.visible = false;
      this.el.object3D.add(group);
      this.pages[page] = group;
      addLights(group);
    }

    this.createClimatePage();
    this.createCausesPage();
    this.createConsequencesPage();
    this.createPeruPage();
    this.createSolutionsPage();
    this.setPage("1");
  },

  createClimatePage: function () {
    const page = this.pages[1];
    const { globe, atmosphere } = createEarth(page);
    const halo = addMesh(page, new THREE.SphereGeometry(0.9, 30, 22),
      new THREE.MeshBasicMaterial({
        color: 0xff704d,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        depthWrite: false
      }), [0, 1.08, 0]);
    const heatRing = addMesh(page, new THREE.TorusGeometry(0.91, 0.025, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xff8658, transparent: true, opacity: 0.8 }),
      [0, 1.08, 0]);
    heatRing.rotation.x = Math.PI / 2;
    this.animations.earth.push(globe);
    this.animations.heat.push({ halo, ring: heatRing, atmosphere });
  },

  createCausesPage: function () {
    const page = this.pages[2];
    const { globe } = createEarth(page);
    this.animations.earth.push(globe);

    for (let index = 0; index < 12; index += 1) {
      const angle = index * Math.PI * 2 / 12;
      const vertical = Math.sin(index * 2.13) * 0.7;
      const radius = 0.97 + (index % 3) * 0.08;
      const mesh = addMesh(page, new THREE.SphereGeometry(0.045, 10, 8),
        new THREE.MeshStandardMaterial({
          color: index % 3 === 0 ? 0xf0785c : 0xe5bd62,
          emissive: 0x56271c,
          emissiveIntensity: 0.25
        }), [Math.sin(angle) * radius, 1.08 + vertical, Math.cos(angle) * radius]);
      this.animations.particles.push({ mesh, angle, vertical, radius, phase: index });
    }

    [[-0.72, 1.55, 0.08, 1], [0.52, 1.68, 0.16, -1], [0.78, 0.66, 0.08, -1], [-0.58, 0.61, 0.15, 1]].forEach(
      ([x, y, z, direction], index) => {
        const arrow = new THREE.Group();
        arrow.position.set(x, y, z);
        const vector = new THREE.Vector3(0, direction, 0);
        const helper = new THREE.ArrowHelper(vector, new THREE.Vector3(), 0.38, 0xff8758, 0.13, 0.09);
        helper.line.material.transparent = true;
        helper.line.material.opacity = 0.82;
        helper.cone.material.transparent = true;
        helper.cone.material.opacity = 0.82;
        arrow.add(helper);
        page.add(arrow);
        this.animations.arrows.push({ arrow, y, phase: index * 1.7 });
      }
    );
    addLabel("CO2 · CALOR", page, [0, 2.04, 0.04], "#ffe1a0");
  },

  createConsequencesPage: function () {
    const page = this.pages[3];
    addMesh(page, new THREE.BoxGeometry(3.25, 0.38, 2.1),
      new THREE.MeshStandardMaterial({ color: 0x526b4b, roughness: 1 }), [0, -0.08, 0]);

    [[-0.9, 0.43, 0.28], [-0.3, 0.49, 0.12], [0.7, 0.4, -0.12]].forEach(([x, height, z], index) => {
      const mountain = addMesh(page, new THREE.ConeGeometry(0.64, height * 2.1, 5),
        new THREE.MeshStandardMaterial({ color: index === 1 ? 0x71816b : 0x60775e }), [x, 0.15 + height, z]);
      mountain.rotation.y = index * 0.6;
      addMesh(page, new THREE.ConeGeometry(0.27, 0.42, 5),
        new THREE.MeshStandardMaterial({ color: 0xe9f1e7 }), [x, 0.15 + height * 1.72, z + 0.03]);
    });

    const water = addMesh(page, new THREE.BoxGeometry(2.35, 0.075, 1.28),
      new THREE.MeshStandardMaterial({ color: 0x41b6c4, transparent: true, opacity: 0.78, roughness: 0.3 }),
      [0, 0.15, 0.43]);
    const ice = new THREE.Group();
    ice.position.set(-0.15, 0.61, 0.39);
    page.add(ice);
    addMesh(ice, new THREE.ConeGeometry(0.43, 0.84, 5),
      new THREE.MeshStandardMaterial({ color: 0xf0f7f2, roughness: 0.42 }), [0, 0, 0]);
    addMesh(ice, new THREE.BoxGeometry(0.83, 0.26, 0.62),
      new THREE.MeshStandardMaterial({ color: 0xd9eff0, roughness: 0.35 }), [0.38, -0.24, 0.03]);
    this.animations.melting.push({ ice, water, baseY: ice.position.y, page: 3 });
    addLabel("HIELO", page, [-0.35, 1.48, 0.38]);
    addLabel("AGUA", page, [0.97, 0.38, 0.47], "#b7f2ed");
  },

  createPeruPage: function () {
    const page = this.pages[4];
    addMesh(page, new THREE.BoxGeometry(3.35, 0.38, 2.05),
      new THREE.MeshStandardMaterial({ color: 0x93694d, roughness: 1 }), [0, -0.08, 0]);

    const comparisons = [
      { x: -0.78, peak: 1.06, iceHeight: 0.62, color: 0x7f7563 },
      { x: 0.78, peak: 1.02, iceHeight: 0.31, color: 0x766a5a }
    ];
    comparisons.forEach((comparison, index) => {
      const mountain = addMesh(page, new THREE.ConeGeometry(0.79, comparison.peak * 2, 5),
        new THREE.MeshStandardMaterial({ color: comparison.color, roughness: 1 }),
        [comparison.x, comparison.peak, -0.06]);
      mountain.rotation.y = index * 0.45;
      addMesh(page, new THREE.ConeGeometry(0.36, 0.52, 5),
        new THREE.MeshStandardMaterial({ color: 0xeaf2ed }),
        [comparison.x, comparison.peak * 1.68, -0.02]);

      const glacier = new THREE.Group();
      glacier.position.set(comparison.x, 0.26 + comparison.iceHeight / 2, 0.43);
      page.add(glacier);
      addMesh(glacier, new THREE.ConeGeometry(0.35, comparison.iceHeight, 5),
        new THREE.MeshStandardMaterial({ color: 0xcce6e5, roughness: 0.4 }));
      this.animations.melting.push({
        ice: glacier,
        baseY: glacier.position.y,
        water: null,
        page: 4,
        amount: index === 0 ? 0.44 : 0.62
      });
    });

    addLabel("MAYOR EXTENSION", page, [-0.78, 2.02, 0.45], "#d9f2ea");
    addLabel("RETROCESO", page, [0.78, 1.98, 0.45], "#ffe0a0");
  },

  createSolutionsPage: function () {
    const page = this.pages[5];
    addMesh(page, new THREE.BoxGeometry(3.4, 0.3, 2.25),
      new THREE.MeshStandardMaterial({ color: 0x719152, roughness: 1 }), [0, -0.11, 0]);

    [[-1.18, 0.15, -0.5], [-0.78, 0.12, 0.45], [0.48, 0.18, -0.52], [1.15, 0.16, 0.5]].forEach(([x, y, z], index) => {
      addMesh(page, new THREE.CylinderGeometry(0.055, 0.085, 0.38, 7),
        new THREE.MeshStandardMaterial({ color: 0x79543b }), [x, y + 0.19, z]);
      [0.38, 0.61, 0.82].forEach((height, layer) => {
        addMesh(page, new THREE.ConeGeometry(0.3 - layer * 0.045, 0.45, 7),
          new THREE.MeshStandardMaterial({ color: index % 2 ? 0x317557 : 0x44845a }),
          [x, y + height, z]);
      });
    });

    const panel = new THREE.Group();
    panel.position.set(-0.2, 0.18, 0.64);
    panel.rotation.x = -0.22;
    page.add(panel);
    addMesh(panel, new THREE.BoxGeometry(0.88, 0.055, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x294b60, metalness: 0.22, roughness: 0.38 }));
    for (let index = 0; index < 4; index += 1) {
      addMesh(panel, new THREE.BoxGeometry(0.012, 0.058, 0.55),
        new THREE.MeshBasicMaterial({ color: 0x91d9e4 }), [-0.33 + index * 0.22, 0.031, 0]);
    }
    addMesh(panel, new THREE.CylinderGeometry(0.035, 0.05, 0.34, 8),
      new THREE.MeshStandardMaterial({ color: 0xd8ded0 }), [0, -0.17, 0]);

    [-1.05, 0.92].forEach((x, index) => {
      addMesh(page, new THREE.CylinderGeometry(0.025, 0.055, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0xe9e7d6 }), [x, 0.62, -0.45 + index * 0.45]);
      const rotor = new THREE.Group();
      rotor.position.set(x, 1.12, -0.45 + index * 0.45);
      page.add(rotor);
      for (let bladeIndex = 0; bladeIndex < 3; bladeIndex += 1) {
        const blade = addMesh(rotor, new THREE.BoxGeometry(0.09, 0.48, 0.045),
          new THREE.MeshStandardMaterial({ color: 0xf5f2df }), [0, 0.27, 0]);
        blade.rotation.z = bladeIndex * Math.PI * 2 / 3;
      }
      addMesh(rotor, new THREE.SphereGeometry(0.09, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xcbe66c }));
      this.animations.turbines.push(rotor);
    });

    this.animations.sun = addMesh(page, new THREE.SphereGeometry(0.25, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0xffc85a }), [1.18, 1.88, -0.08]);
  },

  setPage: function (page) {
    const nextPage = String(page);
    if (!this.pages[nextPage]) return;
    Object.entries(this.pages).forEach(([number, group]) => {
      group.visible = number === nextPage;
    });
    if (this.page !== nextPage) this.elapsed = 0;
    this.page = nextPage;
  },

  tick: function (_time, delta) {
    const step = Math.min(delta || 0, 50) / 1000;
    this.elapsed += step;

    if (this.page === "1") {
      this.animations.earth[0].rotation.y += step * 0.18;
      this.animations.heat.forEach(({ halo, ring, atmosphere }) => {
        const pulse = (Math.sin(this.elapsed * 1.8) + 1) / 2;
        halo.material.opacity = 0.055 + pulse * 0.055;
        atmosphere.material.opacity = 0.14 + pulse * 0.07;
        ring.rotation.y += step * 0.12;
      });
    }

    if (this.page === "2") {
      this.animations.earth[1].rotation.y += step * 0.12;
      this.animations.particles.forEach(({ mesh, angle, vertical, radius, phase }) => {
        const drift = this.elapsed * 0.22 + phase;
        mesh.position.set(
          Math.sin(angle + drift) * radius,
          1.08 + vertical + Math.sin(this.elapsed * 1.2 + phase) * 0.055,
          Math.cos(angle + drift) * radius
        );
      });
      this.animations.arrows.forEach(({ arrow, y, phase }) => {
        arrow.position.y = y + Math.sin(this.elapsed * 1.6 + phase) * 0.05;
      });
    }

    if (this.page === "3" || this.page === "4") {
      this.animations.melting.filter(item => String(item.page) === this.page).forEach(item => {
        const progress = Math.min(this.elapsed / 18, 0.72);
        const amount = item.amount || 0.68;
        item.ice.scale.y = 1 - progress * amount;
        item.ice.position.y = item.baseY - progress * 0.14;
        if (item.water) {
          item.water.scale.x = 1 + progress * 0.7;
          item.water.scale.z = 1 + progress * 0.32;
        }
      });
    }

    if (this.page === "5") {
      this.animations.turbines.forEach((rotor, index) => {
        rotor.rotation.z += step * (index ? -1.25 : 1.05);
      });
      this.animations.sun.rotation.y += step * 0.35;
    }
  }
});