export default [
  {
    type: "DQ",
    ask: "¿Has tomado vitaminas anteriormente?",
    answers: [
      { a: "Sí", value: null },
      { a: "No", value: null },
      { a: "Si, pero las dejé de tomar", value: null },
    ],
    key: "1. Tomas vitaminas",
  },
  {
    type: "SOQ",
    ask: "Edad",
    answers: [
      { a: "18 - 30", value: null },
      { a: "31 - 50", value: "glow" },
      { a: "50+", value: "wellaid,magnesio" },
    ],
    key: "2. Edad",
  },
  {
    type: "DQ",
    ask: "Género",
    answers: [
      { a: "Femenino", value: null },
      { a: "Masculino", value: null },
      { a: "Otro", value: null },
    ],
    key: "3. Género",
  },
  {
    type: "MOQ",
    ask: "Objetivo principal para tomar vitaminas o suplementos",
    answers: [
      { a: "Embarazarte", value: null },
      { a: "Alergias", value: "wellaid" },
      { a: "Bienestar general", value: "wellaid,magnesio" },
      { a: "Mejorar sistema inmunológico", value: "wellaid" },
      { a: "Mejorar rendimiento físico", value: "recharge" },
      { a: "Mejorar niveles de energía", value: "recharge" },
      { a: "Belleza", value: "glow" },
      { a: "Mejorar la calidad del sueño", value: "magnesio" },
      { a: "Problemas digestivos", value: "happibelly" },
    ],
    key: "4. Objetivo",
  },
  {
    block: "Dieta y estilo de vida",
    type: "MOQ",
    ask: "¿Llevas alguna dieta especial?",
    answers: [
      { a: "Vegetariano", value: "recharge" },
      { a: "Paleo", value: null },
      { a: "Vegano", value: "recharge" },
      { a: "Libre de gluten", value: null },
      { a: "Libre de lactosa", value: null },
      { a: "Keto", value: "wellaid,happibelly" },
      { a: "Pescatariano", value: null },
      { a: "Ninguna / Otra", value: null },
    ],
    key: "5. Dieta",
  },
  {
    type: "SOQ",
    ask: "¿Cuántas porciones de fruta y verduras consumes al día?",
    answers: [
      { a: "0", value: "wellaid,magnesio,happibelly" },
      { a: "1", value: "wellaid,magnesio,happibelly" },
      { a: "2 - 3", value: "glow" },
      { a: ">4", value: null },
    ],
    key: "6. Frutas y verduras",
  },
  {
    type: "DQ",
    ask: "¿Consumes alcohol? ¿Cuántas copas a la semana?",
    answers: [
      { a: "0", value: null },
      { a: "2", value: "magnesio,happibelly" },
      { a: "4", value: "magnesio,happibelly" },
      { a: "6+", value: "magnesio,happibelly" },
    ],
    key: "7. Alcohol",
  },
  {
    type: "SOQ",
    ask: "¿Fumas?",
    answers: [
      { a: "Sí", value: "force wellaid" },
      { a: "No", value: null },
    ],
    key: "8. Fumas",
  },
  {
    type: "SOQ",
    ask:
    "¿Consumes bebidas con cafeína (café, té, bebidas energizantes)? ¿Cuántas tazas al día?",
    answers: [
      { a: "0 - 2", value: null },
      { a: "2 - 4", value: "remove recharge,magnesio", },
      { a: "4+", value: "remove recharge,magnesio" },
    ],
    key: "9. Tazas de Cafeína",
  },
  {
    type: "SOQ",
    ask: "¿Estás tomando algún medicamento que requiera receta médica?",
    answers: [
      { a: "Sí", value: "doctor" },
      { a: "No", value: null },
    ],
    key: "10. Medicamentos con receta",
  },
  {
    type: "SOQ",
    ask: "¿Tienes alguna condición médica especial?",
    answers: [
      { a: "Sí", value: 'condition' },
      { a: "No", value: null },
    ],
    key: "11. Condición médica especial",
  },
  {
    block: "Salud y Bienestar",
    type: "SOQ",
    ask:
    "¿Se te rompen mucho las uñas, sufres de piel seca o se te cae mucho el pelo?",
    answers: [
      { a: "Sí", value: "force glow" },
      { a: "No", value: null },
    ],
    key: "12. Vulnerable",
  },
  {
    type: "SOQ",
    ask:
    "¿Te enfermas con frecuencia, convives mucho con niños pequeños o vas a viajar en un avión durante el próximo mes?",
    answers: [
      { a: "Sí", value: "force wellaid" },
      { a: "No", value: null },
    ],
    key: "13. Precaución",
  },
  {
    type: "SOQ",
    ask:
    "En ocasiones, ¿Te sientes cansado o sin energía?, ¿Te da bajón de energía o sueño a media tarde?",
    answers: [
      { a: "Sí", value: "force recharge" },
      { a: "A veces", value: "force recharge,wellaid" },
      { a: "No", value: null },
    ],
    key: "14. Cansancio",
  },
  {
    type: "SOQ",
    ask:
    "¿Te cuesta trabajo concentrarte? ¿Te preocupa tu memoria a corto plazo?",
    answers: [
      { a: "Sí", value: "recharge" },
      { a: "A veces", value: "force recharge,wellaid" },
      { a: "No", value: null },
    ],
    key: "15. Baja concentración",
  },
  {
    type: "DQ",
    ask: "¿Qué tan seguido te sientes estresado?",
    answers: [
      { a: "Todo el tiempo", value: "wellaid,magnesio" },
      { a: "Casi siempre", value: "magnesio" },
      { a: "En ocasiones", value: "magnesio" },
      { a: "No me siento estresado", value: null },
    ],
    key: "16. Estresado",
  },
  {
    type: "SOQ",
    ask: "¿Haces ejercicio?",
    answers: [
      { a: "Sí", value: "recharge,magnesio" },
      { a: "No", value: "recharge,wellaid" },
    ],
    key: "17. Ejercicio",
  },
  {
    type: "SOQ",
    ask: "¿Qué tan sano consideras tu estilo de vida?",
    answers: [
      { a: "Muy Sano", value: "glow" },
      { a: "Moderadamente sano", value: "glow,recharge" },
      { a: "Poco sano", value: "glow,wellaid" },
    ],
    key: "18. Sano",
  },
  {
    type: "SOQ",
    ask: "¿Tienes síntomas como inflamación, gases y pesadez al terminar tus comidas? ",
    answers: [
      { a: "Sí", value: "force happibelly" },
      { a: "No", value: null },
    ],
    key: "19. Síntomas",
  },
  {
    type: "SOQ",
    ask: "¿Te cuesta trabajo quedarte dormido  y al despertar sientes que no descansaste? ",
    answers: [
      { a: "Sí", value: "force magnesio" },
      { a: "No", value: null },
    ],
    key: "20. Dormir",
  },
  {
    type: "IQ",
    ask: "Conoce tus resultados",
    answers: [],
    key: "",
  },
];