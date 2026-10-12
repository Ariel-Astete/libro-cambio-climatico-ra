// Three.js ya viene incluido en A-Frame.
const THREE = AFRAME.THREE;

AFRAME.registerComponent("orbita", {
  schema: {
    radio: {type: "number", default: 1},
    velocidad: {type: "number", default: 12}
  },

  init: function () {
    const r = this.data.radio;

    this.geometria = new THREE.RingGeometry(r - 0.006, r + 0.006, 64);
    this.material = new THREE.MeshBasicMaterial({
      color: "#8398b0",
      side: THREE.DoubleSide
    });

    const anillo = new THREE.Mesh(this.geometria, this.material);
    anillo.rotation.x = -Math.PI / 2;

    this.el.setObject3D("trayectoria", anillo);
  },

  tick: function (tiempo, delta) {
    if (!delta || !this.el.getAttribute("visible")) return;

    const radianes = this.data.velocidad * Math.PI / 180;
    this.el.object3D.rotation.y += radianes * delta / 1000;
  },

  remove: function () {
    this.el.removeObject3D("trayectoria");
    this.geometria.dispose();
    this.material.dispose();
  }
});
