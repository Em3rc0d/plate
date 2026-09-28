export type AcquisitionSection = {
  title: string;
  paragraphs: string[];
};

export type AcquisitionSource = {
  label: string;
  url: string;
  note: string;
};

export type AcquisitionFaq = {
  question: string;
  answer: string;
};

export type AcquisitionPage = {
  slug: string;
  shortTitle: string;
  eyebrow: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  lead: string;
  summary: string;
  checks: string[];
  sections: AcquisitionSection[];
  limitation: string;
  sources: AcquisitionSource[];
  faqs: AcquisitionFaq[];
  related: string[];
};

export const acquisitionPages: Record<string, AcquisitionPage> = {
  "consulta-vehicular-por-placa": {
    slug: "consulta-vehicular-por-placa",
    shortTitle: "Consulta vehicular por placa",
    eyebrow: "GUÍA DE CONSULTA VEHICULAR",
    title: "Consulta vehicular por placa en Perú: qué revisar antes de comprar",
    metaTitle: "Consulta vehicular por placa en Perú",
    metaDescription:
      "Consulta qué información conviene revisar con una placa en Perú: identidad, titularidad, SOAT, revisión técnica y papeletas según la cobertura disponible.",
    lead:
      "Una placa sirve como punto de partida para contrastar identidad del vehículo, situación registral y otros registros antes de entregar dinero por un auto usado.",
    summary:
      "La consulta vehicular no es una sola base de datos. En Perú, la información relevante está repartida entre registros y servicios distintos. Lo útil es entender qué responde cada fuente, qué no responde y en qué fecha fue consultada.",
    checks: [
      "Que marca, modelo, VIN, motor y color coincidan con el vehículo que estás viendo.",
      "Quién figura como titular registral y qué historial de titularidad fue devuelto.",
      "Qué restricciones o anotaciones devolvió la consulta registral.",
      "Estado e historial disponible de SOAT y revisión técnica.",
      "Papeletas pendientes dentro de las jurisdicciones cubiertas.",
    ],
    sections: [
      {
        title: "Qué muestra la consulta vehicular de SUNARP",
        paragraphs: [
          "SUNARP dispone de una Consulta Vehicular gratuita que permite revisar datos identificativos y de titularidad del vehículo. Su propia documentación señala que esta consulta es de carácter referencial y no sustituye la publicidad registral.",
          "Esto importa porque una consulta básica puede ayudarte a detectar una incongruencia, pero no debe interpretarse como una certificación completa de la situación jurídica del vehículo.",
        ],
      },
      {
        title: "Por qué conviene cruzar más de una fuente",
        paragraphs: [
          "Un vehículo puede tener identidad registral consistente y, al mismo tiempo, presentar una revisión técnica vencida, SOAT no vigente o papeletas pendientes. Son preguntas distintas y normalmente viven en sistemas distintos.",
          "PlacaClara organiza la respuesta por secciones y conserva el estado de cada una: información disponible, sin registros devueltos, no disponible, conflicto o fuente no habilitada.",
        ],
      },
      {
        title: "Qué revisar antes de pagar por un usado",
        paragraphs: [
          "No te quedes solo con que la placa exista. Compara físicamente VIN, serie, motor, color y modelo; verifica que la persona que vende tenga legitimidad para transferir; revisa la vigencia documental; y completa la revisión con una inspección mecánica independiente.",
        ],
      },
    ],
    limitation:
      "Una consulta por placa reduce incertidumbre documental, pero no demuestra por sí sola que el vehículo esté libre de todo antecedente ni que se encuentre en buen estado mecánico.",
    sources: [
      {
        label: "SUNARP · Servicios en línea",
        url: "https://serviciosenlinea.sunarp.gob.pe/portal/",
        note: "Acceso oficial a Consulta Vehicular y otros servicios registrales.",
      },
      {
        label: "SUNARP · Información general de Consulta Vehicular",
        url: "https://cdn.www.gob.pe/uploads/document/file/1951676/Consulta%20vehicular%20-%20informaci%C3%B3n%20general.pdf",
        note: "Documento oficial que describe los datos disponibles y el carácter referencial de la consulta.",
      },
    ],
    faqs: [
      {
        question: "¿Puedo consultar un vehículo solo con la placa?",
        answer:
          "Sí. Existen servicios que parten de la placa para consultar información vehicular. La información disponible depende de cada fuente y de su cobertura.",
      },
      {
        question: "¿La consulta vehicular reemplaza una copia literal o certificado registral?",
        answer:
          "No. La consulta básica es informativa. Cuando necesitas certeza registral para una operación, corresponde revisar la publicidad registral que aplique.",
      },
      {
        question: "¿Una placa sin resultados significa que el vehículo está limpio?",
        answer:
          "No. Puede significar que una fuente no devolvió registros, que no respondió o que esa cobertura no estaba habilitada. Es importante distinguir esos estados.",
      },
    ],
    related: [
      "historial-vehicular",
      "soat-por-placa",
      "revision-tecnica-por-placa",
      "papeletas-por-placa",
      "comprar-auto-usado",
    ],
  },

  "historial-vehicular": {
    slug: "historial-vehicular",
    shortTitle: "Historial vehicular",
    eyebrow: "GUÍA DE HISTORIAL VEHICULAR",
    title: "Historial vehicular por placa: qué mirar realmente en un auto usado",
    metaTitle: "Historial vehicular por placa en Perú",
    metaDescription:
      "Aprende qué revisar en el historial vehicular de un auto usado: identidad, titulares, registros previos, restricciones, SOAT, CITV y papeletas.",
    lead:
      "El historial útil no es un único número ni un semáforo: es una secuencia de datos que debes poder contrastar con su fuente, fecha y limitaciones.",
    summary:
      "Antes de comprar un vehículo usado conviene revisar tanto su identidad actual como los registros históricos disponibles. Un dato aislado puede ser correcto y aun así no contar toda la historia.",
    checks: [
      "Identidad actual: placa, VIN, motor, marca, modelo, año y color.",
      "Titular registral actual y registros históricos de titularidad disponibles.",
      "Fechas de cambios y posibles inconsistencias entre nombres, documentos o títulos.",
      "Restricciones o anotaciones registrales devueltas por la fuente.",
      "Historial documental complementario: SOAT, CITV y papeletas según cobertura.",
    ],
    sections: [
      {
        title: "Historial de titulares no es lo mismo que contar dueños",
        paragraphs: [
          "Una fuente puede devolver registros históricos sin garantizar que el conjunto sea exhaustivo. Si existen identidades ambiguas, documentos inconsistentes o eventos repetidos, convertir esos registros en un número de propietarios puede inducir a error.",
          "Por eso PlacaClara conserva los registros devueltos y evita afirmar un conteo total cuando la evidencia no permite hacerlo con seguridad.",
        ],
      },
      {
        title: "Qué señales merecen una revisión adicional",
        paragraphs: [
          "Cambios frecuentes de titularidad, fechas incompatibles, diferencias de VIN o motor, una restricción devuelta por la fuente o documentos que no coinciden son motivos para detener la compra y pedir documentación adicional.",
          "Ninguna de estas señales demuestra por sí sola fraude o un problema jurídico; sirven para formular mejores preguntas antes de pagar.",
        ],
      },
      {
        title: "El historial documental no reemplaza el estado físico",
        paragraphs: [
          "Un auto puede tener documentos al día y presentar desgaste, reparaciones estructurales o fallas mecánicas que no aparecen en una consulta documental. Combina la revisión de registros con inspección física y mecánica.",
        ],
      },
    ],
    limitation:
      "PlacaClara muestra el historial que las fuentes habilitadas devuelven en ese momento. No promete un historial universal de accidentes, propietarios, reparaciones o uso previo.",
    sources: [
      {
        label: "SUNARP · Consulta Vehicular",
        url: "https://serviciosenlinea.sunarp.gob.pe/portal/",
        note: "Referencia oficial para datos registrales básicos del vehículo.",
      },
      {
        label: "SUNARP · Servicios en línea",
        url: "https://www.gob.pe/sunarp-serviciosenlinea",
        note: "Portal oficial con acceso a servicios registrales y publicidad registral.",
      },
    ],
    faqs: [
      {
        question: "¿El historial de propietarios siempre está completo?",
        answer:
          "No necesariamente. Depende de lo que devuelva la fuente consultada y de la calidad de los registros. Un historial parcial debe presentarse como parcial.",
      },
      {
        question: "¿Muchos propietarios significan que el auto está mal?",
        answer:
          "No. Es una señal que merece contexto, no una conclusión. El estado real requiere revisar documentos, mantenimiento e inspección mecánica.",
      },
      {
        question: "¿El historial vehicular demuestra que nunca tuvo un accidente?",
        answer:
          "No. Solo puede mostrar los registros incluidos en la cobertura consultada. La ausencia de un registro no prueba ausencia de accidentes.",
      },
    ],
    related: [
      "consulta-vehicular-por-placa",
      "comprar-auto-usado",
      "soat-por-placa",
      "revision-tecnica-por-placa",
    ],
  },

  "soat-por-placa": {
    slug: "soat-por-placa",
    shortTitle: "SOAT por placa",
    eyebrow: "GUÍA DE SOAT",
    title: "SOAT por placa: qué comprobar antes de comprar un vehículo usado",
    metaTitle: "Consultar SOAT por placa en Perú",
    metaDescription:
      "Revisa qué datos del SOAT conviene comprobar por placa: vigencia, aseguradora y certificados disponibles, con fuente y fecha de consulta.",
    lead:
      "El SOAT es una pieza documental básica para circular. Antes de comprar un usado, conviene verificar su vigencia y no depender únicamente de una foto o captura enviada por el vendedor.",
    summary:
      "Una consulta de SOAT puede devolver aseguradora, fechas de vigencia y certificados disponibles. Lo importante es mirar la fecha efectiva del dato y distinguir entre póliza vigente, historial y ausencia de respuesta.",
    checks: [
      "Fecha de inicio y fin de vigencia del certificado actual.",
      "Aseguradora o entidad informada por la fuente.",
      "Número de póliza o certificado cuando esté disponible.",
      "Registros históricos devueltos y su orden cronológico.",
      "Posibles discrepancias entre el estado declarado y las fechas.",
    ],
    sections: [
      {
        title: "Vigencia y estado deben coincidir",
        paragraphs: [
          "No basta con leer una etiqueta que diga 'vigente'. La fecha de fin debe cubrir el momento de la consulta. Si la fuente devuelve un estado que no coincide con las fechas, el dato requiere revisión.",
        ],
      },
      {
        title: "Qué aporta el historial",
        paragraphs: [
          "Los certificados anteriores permiten entender continuidad de cobertura y contrastar datos del vehículo. Su existencia no demuestra por sí sola que no haya habido siniestros ni que el vehículo se encuentre en buen estado.",
        ],
      },
      {
        title: "SOAT y siniestralidad no son la misma consulta",
        paragraphs: [
          "La SBS dispone de un Reporte de Siniestralidad SOAT que puede consultarse por placa y está orientado al récord de accidentes y pólizas dentro de su alcance. Una consulta de vigencia del SOAT responde una pregunta distinta.",
        ],
      },
    ],
    limitation:
      "La información de SOAT depende de la fuente consultada y de su actualización. Un resultado no disponible no debe interpretarse como póliza inexistente.",
    sources: [
      {
        label: "SBS · Reporte SOAT/CAT y Seguro Vehicular",
        url: "https://servicios.sbs.gob.pe/reportesoat/",
        note: "Servicio oficial de consulta de siniestralidad y pólizas dentro de su alcance.",
      },
    ],
    faqs: [
      {
        question: "¿Puedo saber si el SOAT está vigente con la placa?",
        answer:
          "Las fuentes habilitadas pueden devolver vigencia y certificados asociados a la placa. Siempre revisa la fecha de consulta y el periodo de vigencia.",
      },
      {
        question: "¿SOAT vigente significa que el auto está en buen estado?",
        answer:
          "No. El SOAT es un requisito documental y de cobertura obligatoria; no es una inspección mecánica.",
      },
      {
        question: "¿La consulta de SOAT muestra todos los accidentes?",
        answer:
          "No necesariamente. Vigencia de SOAT y siniestralidad son coberturas diferentes y dependen de la fuente utilizada.",
      },
    ],
    related: [
      "revision-tecnica-por-placa",
      "consulta-vehicular-por-placa",
      "historial-vehicular",
      "comprar-auto-usado",
    ],
  },

  "revision-tecnica-por-placa": {
    slug: "revision-tecnica-por-placa",
    shortTitle: "Revisión técnica por placa",
    eyebrow: "GUÍA DE CITV",
    title: "Revisión técnica por placa: cómo interpretar el CITV de un vehículo",
    metaTitle: "Revisión técnica vehicular por placa en Perú",
    metaDescription:
      "Consulta qué revisar en el CITV por placa: vigencia, fecha de vencimiento, resultados e historial disponible antes de comprar un vehículo usado.",
    lead:
      "La revisión técnica vehicular ayuda a comprobar si un vehículo cuenta con un certificado de inspección vigente y qué resultados históricos devuelve la fuente.",
    summary:
      "El MTC mantiene un sistema de consulta de CITV por placa. Para una compra de usado, la vigencia actual importa, pero también conviene mirar los resultados anteriores disponibles.",
    checks: [
      "Fecha de vencimiento del certificado vigente.",
      "Resultado de la inspección y estado del certificado.",
      "Centro o planta de inspección cuando la fuente lo devuelve.",
      "Registros anteriores disponibles.",
      "Coherencia entre antigüedad del vehículo y documentación mostrada.",
    ],
    sections: [
      {
        title: "Qué se puede verificar en el sistema del MTC",
        paragraphs: [
          "El MTC permite consultar la revisión técnica por placa. Su información pública incluye el estado y fecha de vencimiento, y el propio ministerio ha indicado que el sistema puede mostrar registros anteriores dentro de su alcance.",
        ],
      },
      {
        title: "Una revisión aprobada no sustituye una inspección precompra",
        paragraphs: [
          "El CITV acredita el resultado de una inspección reglamentaria en una fecha concreta. No te dice cómo se encuentra hoy la suspensión, motor, caja, carrocería o estructura del vehículo.",
          "Antes de comprar, usa el CITV como una señal documental y realiza además una inspección mecánica independiente.",
        ],
      },
      {
        title: "Qué hacer si la revisión está vencida o no aparece",
        paragraphs: [
          "Pide al vendedor el certificado y contrástalo con la fuente oficial. Si el registro no aparece o la fuente no responde, no conviertas esa ausencia en una conclusión favorable.",
        ],
      },
    ],
    limitation:
      "La cobertura histórica de CITV puede ser limitada. PlacaClara muestra los certificados que la fuente habilitada devuelve, sin afirmar que constituyan el historial completo.",
    sources: [
      {
        label: "MTC · Consulta de revisión técnica vehicular",
        url: "https://sistemas.mtc.gob.pe/aplicaciones/consulta-de-inspeccion-tecnica-vehicular/",
        note: "Sistema oficial de consulta CITV por placa.",
      },
      {
        label: "MTC · Orientación sobre Revisión Técnica Vehicular",
        url: "https://www.gob.pe/institucion/mtc/pages/397-revision-tecnica-vehicular",
        note: "Información oficial sobre inspecciones técnicas y periodicidad.",
      },
    ],
    faqs: [
      {
        question: "¿Puedo consultar la revisión técnica solo con la placa?",
        answer:
          "Sí. El MTC dispone de un sistema de consulta por placa para verificar información del CITV.",
      },
      {
        question: "¿CITV vigente significa que el auto no tiene fallas?",
        answer:
          "No. Significa que obtuvo el resultado correspondiente en la inspección reglamentaria. No sustituye una revisión mecánica precompra.",
      },
      {
        question: "¿Se puede ver historial de revisiones?",
        answer:
          "Puede haber registros anteriores disponibles, pero la cantidad depende de la fuente. No debe asumirse un historial ilimitado.",
      },
    ],
    related: [
      "soat-por-placa",
      "papeletas-por-placa",
      "consulta-vehicular-por-placa",
      "comprar-auto-usado",
    ],
  },

  "papeletas-por-placa": {
    slug: "papeletas-por-placa",
    shortTitle: "Papeletas por placa",
    eyebrow: "GUÍA DE PAPELETAS",
    title: "Papeletas por placa: cómo revisar deudas sin confundir cobertura con historial completo",
    metaTitle: "Consultar papeletas por placa en Perú",
    metaDescription:
      "Revisa papeletas pendientes por placa dentro de la cobertura disponible para SUTRAN, Lima y Callao, y entiende las limitaciones por jurisdicción.",
    lead:
      "Las papeletas no viven en una única base nacional que resuelva todo. Antes de comprar un usado, debes saber qué jurisdicciones fueron consultadas y cuáles quedaron fuera.",
    summary:
      "Una consulta útil de papeletas debe decirte tanto lo que encontró como el alcance de la búsqueda. 'Sin registros' en una jurisdicción no significa 'sin multas en todo el Perú'.",
    checks: [
      "Papeletas pendientes devueltas por SUTRAN dentro de la cobertura.",
      "Papeletas pendientes en Lima cuando esa fuente está disponible.",
      "Papeletas pendientes en Callao cuando esa fuente está disponible.",
      "Monto publicado por la fuente, cuando existe.",
      "Jurisdicciones no cubiertas o fuentes temporalmente no disponibles.",
    ],
    sections: [
      {
        title: "Por qué la jurisdicción importa",
        paragraphs: [
          "Las infracciones pueden depender de la entidad que las administra. Una revisión de Lima no responde automáticamente por Callao, SUTRAN o todas las municipalidades del país.",
          "Por eso el reporte debe nombrar la jurisdicción y evitar resumir todo como 'sin multas' cuando la cobertura fue parcial.",
        ],
      },
      {
        title: "Monto pendiente no siempre equivale a deuda total",
        paragraphs: [
          "Algunas fuentes pueden devolver registros sin importe, descuentos temporales o estados que requieren revisión. PlacaClara conserva el monto publicado cuando existe y no inventa una suma cuando faltan datos.",
        ],
      },
      {
        title: "Qué hacer antes de cerrar la compra",
        paragraphs: [
          "Si aparecen papeletas, revisa entidad, fecha, código, estado e importe. Si una jurisdicción importante para el vehículo no está cubierta, consulta también el portal correspondiente antes de transferir dinero.",
        ],
      },
    ],
    limitation:
      "La cobertura actual de PlacaClara para papeletas se limita a las fuentes habilitadas y no representa todas las municipalidades del Perú ni un historial de multas pagadas.",
    sources: [
      {
        label: "SAT Lima · Servicios y consultas",
        url: "https://www.sat.gob.pe/",
        note: "Portal oficial del Servicio de Administración Tributaria de Lima.",
      },
      {
        label: "SUTRAN · Plataforma del Estado",
        url: "https://www.gob.pe/sutran",
        note: "Portal oficial de la Superintendencia de Transporte Terrestre.",
      },
    ],
    faqs: [
      {
        question: "¿Una consulta de Lima muestra todas las papeletas del Perú?",
        answer:
          "No. Las papeletas dependen de la entidad y jurisdicción. Una cobertura local no debe presentarse como cobertura nacional.",
      },
      {
        question: "¿PlacaClara muestra multas pagadas?",
        answer:
          "La cobertura comercial está orientada a papeletas pendientes devueltas por las fuentes habilitadas. No se promete un historial universal de multas pagadas.",
      },
      {
        question: "¿Sin registros devueltos significa cero deuda?",
        answer:
          "No necesariamente. Solo describe lo que devolvió esa fuente y esa jurisdicción en la fecha de consulta.",
      },
    ],
    related: [
      "consulta-vehicular-por-placa",
      "revision-tecnica-por-placa",
      "historial-vehicular",
      "comprar-auto-usado",
    ],
  },

  "comprar-auto-usado": {
    slug: "comprar-auto-usado",
    shortTitle: "Comprar un auto usado",
    eyebrow: "CHECKLIST PRECOMPRA",
    title: "Qué revisar antes de comprar un auto usado en Perú",
    metaTitle: "Qué revisar antes de comprar un auto usado en Perú",
    metaDescription:
      "Checklist para comprar un auto usado: identidad, titularidad, SOAT, revisión técnica, papeletas, documentos e inspección mecánica antes de pagar.",
    lead:
      "Una compra segura no depende de una sola consulta. La mejor secuencia combina identidad, registro, documentos de circulación, deudas y una inspección física antes de entregar dinero.",
    summary:
      "El objetivo no es encontrar un 'score perfecto', sino reducir sorpresas. Cada comprobación responde una pregunta distinta y debe quedar respaldada por su fuente y fecha.",
    checks: [
      "Compara placa, VIN, número de motor, marca, modelo, año y color con el vehículo físico.",
      "Verifica quién figura como titular registral y que la persona que vende pueda transferir.",
      "Revisa restricciones o anotaciones registrales devueltas.",
      "Comprueba SOAT y revisión técnica vigentes.",
      "Consulta papeletas dentro de las jurisdicciones relevantes.",
      "Haz inspección mecánica, prueba de manejo y revisión estructural independiente.",
    ],
    sections: [
      {
        title: "1. Identifica exactamente el vehículo",
        paragraphs: [
          "Empieza por lo que no debería variar: placa, VIN, número de motor y características principales. Una diferencia entre documentos, consulta y unidad física debe aclararse antes de seguir.",
        ],
      },
      {
        title: "2. Verifica titularidad y situación registral",
        paragraphs: [
          "Confirma quién figura como titular y revisa los registros históricos disponibles. Si una consulta devuelve una restricción, inconsistencia o identidad ambigua, pide documentación adicional antes de pagar.",
        ],
      },
      {
        title: "3. Revisa documentos para circular",
        paragraphs: [
          "SOAT y CITV responden preguntas distintas. Revisa vigencia real por fecha y no dependas únicamente de imágenes enviadas por el vendedor.",
        ],
      },
      {
        title: "4. Busca papeletas en las jurisdicciones relevantes",
        paragraphs: [
          "No existe una única consulta que represente automáticamente todas las municipalidades. Anota qué fuentes fueron revisadas y cuáles no.",
        ],
      },
      {
        title: "5. Termina con la inspección física",
        paragraphs: [
          "Una consulta documental no detecta compresión del motor, fugas, corrosión, reparaciones estructurales o desgaste de componentes. Antes de cerrar la compra, lleva el vehículo a una inspección independiente.",
        ],
      },
    ],
    limitation:
      "Este checklist reduce riesgos operativos y documentales, pero no constituye asesoría legal, certificación registral ni garantía sobre el estado mecánico del vehículo.",
    sources: [
      {
        label: "SUNARP · Servicios en línea",
        url: "https://www.gob.pe/sunarp-serviciosenlinea",
        note: "Acceso oficial a servicios registrales, incluida la Consulta Vehicular.",
      },
      {
        label: "MTC · Revisión Técnica Vehicular",
        url: "https://www.gob.pe/institucion/mtc/pages/397-revision-tecnica-vehicular",
        note: "Orientación oficial sobre inspecciones técnicas.",
      },
      {
        label: "SBS · Reporte SOAT",
        url: "https://servicios.sbs.gob.pe/reportesoat/",
        note: "Consulta oficial relacionada con pólizas y siniestralidad SOAT dentro de su alcance.",
      },
    ],
    faqs: [
      {
        question: "¿Qué debo revisar primero al comprar un usado?",
        answer:
          "Empieza por identidad física y registral: placa, VIN, motor, características y titularidad. Después revisa SOAT, CITV, papeletas y finalmente el estado mecánico.",
      },
      {
        question: "¿Un reporte vehicular reemplaza una inspección mecánica?",
        answer:
          "No. El reporte organiza evidencia documental. La condición física del vehículo requiere una inspección independiente.",
      },
      {
        question: "¿Debo pagar antes de saber qué fuentes pueden consultarse?",
        answer:
          "En PlacaClara la cobertura habilitada se muestra antes del pago. Eso permite saber qué categorías pueden formar parte de la consulta antes de continuar.",
      },
    ],
    related: [
      "consulta-vehicular-por-placa",
      "historial-vehicular",
      "soat-por-placa",
      "revision-tecnica-por-placa",
      "papeletas-por-placa",
    ],
  },
};

export const acquisitionSlugs = Object.keys(acquisitionPages);
