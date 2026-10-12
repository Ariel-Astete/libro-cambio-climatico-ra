const lecciones = {
  1: {
    titulo: "¿Qué es el cambio climático?",
    explicacion: "El clima cambia a lo largo del tiempo. El calentamiento actual está relacionado con el aumento de gases de efecto invernadero por actividades humanas. La Tierra y su atmósfera se muestran de forma esquemática.",
    pregunta: "¿En qué se diferencia el clima de un día del clima de una región a largo plazo?"
  },
  2: {
    titulo: "Causas del cambio climático",
    explicacion: "Al quemar combustibles fósiles y cambiar el uso del suelo, aumentan gases como el dióxido de carbono. Estos gases retienen parte del calor en la atmósfera; las partículas y flechas son símbolos didácticos.",
    pregunta: "¿Qué actividades cotidianas podrían reducir las emisiones de gases de efecto invernadero?"
  },
  3: {
    titulo: "Consecuencias ambientales",
    explicacion: "El aumento de temperatura contribuye a la pérdida de hielo y al aumento del nivel del mar. La animación representa estos procesos de manera conceptual, no a escala ni con una tasa real.",
    pregunta: "¿Cómo podría afectar a las comunidades el retroceso de un glaciar?"
  },
  4: {
    titulo: "Impacto en el Perú",
    explicacion: "Los glaciares andinos son importantes reservas de agua. La comparación visual del retroceso glaciar es esquemática: no muestra fechas, medidas ni el estado de un glaciar específico.",
    pregunta: "¿Por qué es importante cuidar las fuentes de agua de los Andes?"
  },
  5: {
    titulo: "Soluciones al cambio climático",
    explicacion: "Ahorrar energía, usar fuentes renovables, proteger ecosistemas y elegir formas sostenibles de transporte ayudan a reducir emisiones y fortalecer la adaptación.",
    pregunta: "¿Qué cambio posible podrías impulsar en tu comunidad?"
  }
};

const selector = document.querySelector("#pagina");
const escenas = document.querySelector("#escenas");
const marcador = document.querySelector("#marcador");
const estado = document.querySelector("#estado");
const boton = document.querySelector("#pausa");
const titulo = document.querySelector("#titulo");
const explicacion = document.querySelector("#explicacion");
const pregunta = document.querySelector("#pregunta");
let enPausa = false;
let marcadorVisible = false;

function mostrarPagina() {
  const leccion = lecciones[selector.value];
  titulo.textContent = leccion.titulo;
  explicacion.textContent = leccion.explicacion;
  pregunta.textContent = leccion.pregunta;

  const componente = escenas.components["clima-escenas"];
  if (componente) componente.setPage(selector.value);

  if (marcadorVisible) {
    estado.textContent = `Hiro detectado · Escena ${selector.value} activa.`;
  }
}

selector.addEventListener("change", mostrarPagina);
escenas.addEventListener("loaded", mostrarPagina);
escenas.addEventListener("componentinitialized", event => {
  if (event.detail.name === "clima-escenas") mostrarPagina();
});
mostrarPagina();

boton.addEventListener("click", () => {
  enPausa = !enPausa;
  if (enPausa) escenas.pause();
  else escenas.play();

  boton.textContent = enPausa ? "Continuar animación" : "Pausar animación";
  estado.textContent = enPausa ? "Animación pausada." : "Animación en marcha.";
});

marcador.addEventListener("markerFound", () => {
  marcadorVisible = true;
  estado.textContent = `Hiro detectado · Escena ${selector.value} activa.`;
});

marcador.addEventListener("markerLost", () => {
  marcadorVisible = false;
  estado.textContent = "Vuelve a enfocar el marcador Hiro completo.";
});

window.addEventListener("camera-error", () => {
  estado.textContent = "Revisa HTTPS, permisos y disponibilidad de cámara.";
});