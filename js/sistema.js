AFRAME.registerComponent("sistema-solar", {
  init: function () {
    const crear = (tag, atributos, padre) => {
      const e = document.createElement(tag);
      Object.entries(atributos).forEach(([k, v]) => e.setAttribute(k, v));
      padre.appendChild(e);
      return e;
    };

    crear("a-sphere", {
      radius: 0.36,
      color: "#ffcb47",
      material: "shader: flat"
    }, this.el);

    // Nombre, radio visual, distancia visual, color, grados/s, paginas.
    const planetas = [
      ["Mercurio", 0.08, 0.65, "#a2a2a2", 28, "2 5"],
      ["Venus",    0.12, 0.95, "#d9b174", 23, "2 5"],
      ["Tierra",   0.13, 1.25, "#2788ce", 18, "2 4 5"],
      ["Marte",    0.10, 1.55, "#c27750", 15, "2 5"],
      ["Jupiter",  0.25, 1.95, "#c89e7a", 11, "3 5"],
      ["Saturno",  0.22, 2.50, "#d6c287",  8, "3 5"],
      ["Urano",    0.17, 3.05, "#7cd8dd",  6, "3 5"],
      ["Neptuno",  0.16, 3.45, "#4169ce",  4, "3 5"]
    ];

    planetas.forEach(([nombre, radio, d, color, v, paginas], i) => {
      const giro = crear("a-entity", {
        orbita: `radio: ${d}; velocidad: ${v}`,
        rotation: `0 ${i * 45} 0`,
        "data-paginas": paginas
      }, this.el);

      const cuerpo = crear("a-entity", {
        position: `${d} 0 0`,
        animation: "property: rotation; to: 0 360 0; " +
          "dur: 6000; loop: true; easing: linear"
      }, giro);

      crear("a-sphere", {
        radius: radio,
        color,
        material: "shader: flat"
      }, cuerpo);

      if (nombre === "Tierra") {
        crear("a-sphere", {
          radius: 0.03,
          position: `0 0 ${radio}`,
          color: "#50b877",
          material: "shader: flat"
        }, cuerpo);
      }

      if (nombre === "Saturno") {
        crear("a-torus", {
          radius: 0.33,
          "radius-tubular": 0.035,
          rotation: "-65 0 0",
          color: "#f0d99b",
          material: "shader: flat"
        }, cuerpo);
      }
    });
  }
});
