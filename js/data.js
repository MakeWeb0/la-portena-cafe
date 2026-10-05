/* =========================================================================
   La Porteña — datos del sitio
   Todo lo editable vive aquí: contacto, carta y tienda.
   ========================================================================= */

const CONFIG = {
  nombre:    'La Porteña',
  sub:       'Café · Bar',
  direccion: "Avinguda de l'Estació, 12",
  ciudad:    'Alicante',
  telefono:  '865 809 500',
  telHref:   '+34865809500',
  whatsapp:  '34865809500',           // ← cambia si el WhatsApp es otro número
  instagram: 'https://www.instagram.com/laportenialicante/',
  mapa:      "https://www.google.com/maps/search/La+Porte%C3%B1a+Avinguda+de+l'Estaci%C3%B3+12+Alicante",
  google:    'https://www.google.com/search?q=la+porte%C3%B1a+alicante',
  rating:    4.5,
  resenas:   471,
  horario: [
    { d: 'Lunes a sábado', h: '08:00 – 22:00' },
    { d: 'Domingo',        h: '09:00 – 14:00' }
  ],
  /* Lo mismo en horas, para el cartel «Abierto ahora» (hora de Alicante) */
  abre: { semana: [8, 22], dom: [9, 14] }
};

/* ---------- Promos de la pizarra de la puerta ---------- */
const PROMOS = [
  { t: 'Bocadillo serrano + caña', p: '5,80 €' },
  { t: 'Tapa + caña',              p: '4,90 €' },
  { t: 'Empanada + refresco',      p: '5,00 €' }
];

/* ---------- La carta ---------- */
const CARTA = [
  { tab: 'Desayuno', grupos: [
    { t: 'Café', items: [
      ['Espresso','1,30 €'], ['Con hielo','1,40 €'], ['Café con leche','1,90 €'],
      ['Café con leche + hielo','2,00 €'], ['Café con leche mediano','2,50 €'],
      ['Café con leche grande','3,20 €'], ['Cortado','1,40 €'], ['Cortado con hielo','1,50 €'],
      ['Cortado con leche de avena','1,70 €'], ['Bombón','1,70 €'], ['Bombón con hielo','1,80 €'],
      ['Americano','1,60 €'], ['Americano con hielo','1,70 €'], ['Americano mediano','1,90 €'],
      ['Americano grande','2,50 €'], ['Manchado','2,00 €'], ['Manchado con hielo','2,10 €'],
      ['Manchado con leche de avena','2,10 €'], ['Manchado mediano','2,50 €'],
      ['Manchado grande','3,20 €'], ['Mixto','2,30 €'], ['Mixto con hielo','2,40 €'],
      ['Carajillo Terry','2,60 €'], ['Carajillo Baileys','3,00 €'], ['Submarino','3,20 €'],
      ['Capuchino','2,80 €'], ['Capuchino con leche de avena','3,00 €']
    ], nota: 'Tenemos leche desnatada, entera, de avena y sin lactosa.' },
    { t: 'Leche', items: [
      ['Vaso de leche','1,20 €'], ['ColaCao','2,20 €'],
      ['Chocolate en taza','2,60 €'], ['Submarino','2,60 €']
    ]},
    { t: 'Té', items: [
      ['Pirámide','1,80 €'], ['Con leche','2,20 €'], ['Con limón','2,00 €'],
      ['Té solo','1,60 €'], ['Mate cocido','1,80 €'], ['Té grande','2,50 €']
    ]},
    { t: 'Tostadas', items: [
      ['Sin gluten con tomate','2,60 €'], ['Clásica (hasta las 13:00 h)','1,50 €'],
      ['Tostada clásica','2,00 €'], ['Mantequilla y mermelada','1,80 €'],
      ['Croissant mixto','2,50 €'], ['Croissant mantequilla y mermelada','2,10 €'],
      ['Serrano','1,30 €'], ['York','1,10 €'], ['Pavo','1,10 €'], ['Queso fresco','1,10 €'],
      ['Queso manchego','1,10 €'], ['Atún','1,60 €'], ['Anchoa','1,80 €'], ['Salmón','2,80 €'],
      ['Extra de mantequilla','0,50 €'], ['Extra de mermelada','0,50 €']
    ]},
    { t: 'Bollería', items: [
      ['Aragostine','1,20 €'], ['Canolli','1,50 €'], ['Croissant de mantequilla','1,50 €'],
      ['Croissant curvo dulce','1,50 €'], ['Croissant de chocolate','2,00 €'],
      ['Croissant Nutella','2,50 €'], ['Croissant mixto','2,50 €'],
      ['Palmerón de chocolate','2,50 €'], ['Cañón de dulce de leche','2,50 €'],
      ['Muffins','1,60 €'], ['Bizcocho','2,60 €'], ['Masitas secas','0,60 €'],
      ['Vigilante argentino','1,10 €'], ['Medialunas de mantequilla','1,30 €'],
      ['Docena de medialunas','14,00 €'], ['Flapjack de avena y chocolate','2,00 €'],
      ['Brownie con coco','2,50 €'], ['Cookie sin azúcar','3,00 €'],
      ['Profiteroles con nata ×4','2,50 €'],
      ['Roll · pistacho, Nutella, crema o dulce de leche','4,90 €'],
      ['Alfajores artesanales · chocolate negro, chocolate blanco, pistacho, avellana, Oreo, ron, Fernet, cacahuete, nuez o almendra','3,00 €'],
      ['Cocola sin gluten','2,00 €'],
      ['Brioche con crema y chocolate','3,50 € / 6 € / 10 €']
    ]},
    { t: 'Tartas', items: [
      ['Sacher','4,00 €'], ['Tiramisú','4,00 €'], ['Mousse de limón y merengue','4,00 €'],
      ['Chocotorta','4,00 €'], ['Cheesecake de arándanos','4,00 €'],
      ['Strudel sin azúcar','3,50 €'], ['Tartaletas frutales','4,50 €'],
      ['Carrot cake','4,90 €'], ['Red velvet','4,90 €'], ['Lotus','4,90 €'],
      ['Queso al horno','4,90 €'], ['Ferrero','4,90 €'], ['Oreo','4,90 €'],
      ['3 chocolates','4,90 €'], ['Kinder','4,90 €'], ['Explosión de chocolate','4,90 €'],
      ['Amandina','4,00 €'], ['Borrachito','3,50 €'],
      ['Brazo de nata o chocolate','3,50 €'], ['Manzana y crema','3,50 €'],
      ['Fruta y crema','3,50 €']
    ]}
  ]},

  { tab: 'Salado', grupos: [
    { t: 'Empanadas', items: [
      ['Bacon y queso','2,80 €'], ['Atún y cebolla','2,80 €'], ['Pisto','2,80 €'],
      ['York y queso Philadelphia','2,80 €'], ['Carne argentina','3,00 €'],
      ['Pollo argentino','3,00 €'], ['Queso de cabra y cebolla caramelizada','3,00 €'],
      ['Espinacas y queso','3,00 €'], ['Pollo BBQ','3,00 €'], ['Bonito','3,00 €'],
      ['Calzone de pollo','4,50 €']
    ]},
    { t: 'Bocadillos', items: [
      ['Sándwich de miga argentino','2,00 €'], ['Sándwich mixto','3,50 €'],
      ['Croissant mixto','2,50 €'], ['Napolitana de jamón y queso','2,00 €'],
      ['Quiche vegetal','4,00 €'], ['Jamón serrano','3,80 €'], ['Serrano y queso','4,90 €'],
      ['Pavo o york','3,60 €'], ['Pavo o york con queso','4,70 €'], ['Atún','4,60 €'],
      ['Atún con queso','5,50 €'], ['Tortilla','4,50 €']
    ]},
    { t: 'Tapas', items: [
      ['Pincho de tortilla','3,00 €'], ['Pincho de tortilla mixto','4,50 €'],
      ['Magro con tomate','3,00 €'], ['Albóndigas con tomate','3,00 €'],
      ['Ensaladilla rusa','3,00 €'], ['Queso con aceite','3,00 €'],
      ['Aceitunas','1,00 €'], ['Patatas snack','1,00 €']
    ]},
    { t: 'Panadería', items: [
      ['Pan de espelta','5,50 €'], ['7 cereales','3,90 €'], ['Maíz y chía','4,50 €'],
      ['Quinoa (solo jueves)','4,50 €'], ['Sarraceno','5,50 €'], ['Avena','3,40 €'],
      ['Ludovyco','4,90 €']
    ], nota: 'Por encargo.' }
  ]},

  { tab: 'Bebidas', grupos: [
    { t: 'Refrescos', items: [
      ['Agua natural','2,00 €'], ['Agua con gas','2,00 €'], ['Coca-Cola o Zero','2,50 €'],
      ['Fanta','2,50 €'], ['Sprite','2,50 €'], ['Aquarius','2,50 €'], ['Nestea','2,50 €'],
      ['Tónica','2,20 €'], ['Bitter Kas','2,50 €'], ['Red Bull','2,80 €'],
      ['Mano de Santo','2,80 €'], ['Zumo de piña o melocotón','2,50 €'],
      ['Batido de chocolate, fresa o vainilla','2,50 €'],
      ['Zumo natural pequeño','2,70 €'], ['Zumo natural grande','3,90 €']
    ]},
    { t: 'Cervezas', items: [
      ['Caña','2,20 €'], ['Pinta','2,50 €'], ['Tanque','3,50 €'], ['Corona','3,50 €'],
      ['Desperados','3,50 €'], ['1/5 Mahou','1,50 €'], ['1/5 Estrella','1,50 €'],
      ['1/5 Alhambra','1,80 €'], ['1/3 Estrella 0.0 Tostada','2,80 €'],
      ['1/3 Estrella 0.0 Rubia','2,80 €'], ['1/3 Amstel Oro 0.0','2,80 €'],
      ['Cerveza sin gluten','3,00 €'], ['Kombucha','3,50 €'], ['Estrella Galicia','2,50 €'],
      ['Mahou','2,50 €'], ['Alhambra Verde','2,80 €'], ['Alhambra Roja','2,80 €'],
      ['Heineken','2,80 €'], ['1906','2,80 €'], ['Maestra doble','2,80 €'],
      ['Radler Mahou','2,80 €'], ['El Águila sin filtrar','2,80 €'], ['IPA Mahou','3,00 €'],
      ['IPA Lagunitas','3,50 €'], ['Alhambra IPA Citrus','3,50 €'], ['Franziskaner','4,00 €'],
      ['Jirafa (3 L de cerveza) + 3 tapas','25,00 €']
    ]},
    { t: 'Vinos', items: [
      ['Blanco · Gorgorito','2,50 €'], ['Blanco · La Malcriada','2,50 €'],
      ['Blanco · Mariaquero','3,50 €'], ['Tinto · Abadía del Roble','2,50 €'],
      ['Tinto · Gorgorito','3,50 €'], ['Tinto · Albali','3,50 €']
    ]},
    { t: 'Vinos argentinos', items: [
      ['Catena Zapata Malbec','19,90 €'], ['Benjamín Nieto','9,90 €'],
      ['Nieto Senetiner Malbec','14,90 €'], ['Luigi Bosca','23,90 €'],
      ['Escorihuela Gascón','17,90 €'], ['Rutini Trumpeter','17,90 €']
    ]},
    { t: 'Sidra Maeloc', items: [
      ['Mora','2,80 €'], ['Fresa','2,80 €'], ['Piña y pera','2,80 €'],
      ['Dulce','2,80 €'], ['Seca','2,80 €'], ['Pera','2,80 €']
    ]}
  ]},

  { tab: 'Barra', grupos: [
    { t: 'Aperitivos', items: [
      ['Martini rojo','3,50 €'], ['Martini blanco','3,50 €'], ['Fabulosa blanco','4,00 €'],
      ['Fabulosa rojo','4,00 €'], ['Ribera','4,00 €'], ['Campari','7,00 €'],
      ['Aperol','7,00 €'], ['Fernet','7,00 €'], ['Granadina','7,00 €']
    ]},
    { t: 'Gin tonic', items: [
      ['Love Spirit','7,00 €'], ['Larios','7,00 €'], ['Tanqueray','7,00 €'],
      ['Beefeater','7,00 €'], ['Seagrams','7,00 €'], ['Larios 12','8,00 €']
    ]},
    { t: 'Vodka', items: [
      ['Love Spirit','7,00 €'], ['Absolut','7 € / 8 €'], ['Smirnoff','7,00 €']
    ]},
    { t: 'Tequila', items: [
      ['José Cuervo','3 € / 6 € / 8 €'], ['San José','3 € / 6 € / 8 €']
    ]},
    { t: 'Whisky', items: [
      ['J&B','2 € / 3,50 € / 7 €'], ['Jack Daniels','3,50 € / 7 € / 9 €'],
      ['White Label','2,50 € / 4,50 € / 7 €'], ['Red Label','3 € / 5 € / 7 €'],
      ['Black Label','7,00 €'], ['DYC','2,50 € / 4,50 € / 7 €'],
      ['Ballantines','3,50 € / 7 € / 9 €']
    ]},
    { t: 'Licores', items: [
      ['Baileys','3 € / 5 €'], ['Tía María','3 € / 5 €'], ['Crema de orujo','2 € / 3,50 €'],
      ['Crema de mango y tequila','3 € / 5 €'], ['Crema de maracuyá y tequila','3 € / 5 €'],
      ['Licor de café','2 € / 4 €'], ['Pacharán','2 € / 4 €'], ['Terry','2 € / 4 €'],
      ['Negrita','3,50 € / 6 €'], ['Brugal','3,50 € / 7 €'], ['Barceló','3,50 € / 7 €'],
      ['Licor 43','5,00 €'], ['Anís del Mono','3,50 €'], ['Disaronno','3 € / 5 €'],
      ['Baco','4,00 €'], ['Jägermeister + Red Bull','7,00 €'], ['Mojito','7,00 €']
    ]}
  ]},

  { tab: 'Argentina', grupos: [
    { t: 'Yerbas', items: [
      ['Playadito','6,50 € / 11 €'], ['Rosamonte','7 € / 12 €'], ['Cachamate','5,50 €'],
      ['Unión','5,80 €'], ['Cruz de Malta','7,00 €'], ['Nobleza Gaucha','7,50 €'],
      ['Taragüí','4,90 €'], ['CBSé frutos rojos','6,00 €'], ['CBSé naranja','7,00 €'],
      ['Verdeflor','5,80 €'], ['Baldo','13,00 €'], ['Silueta','12,00 €'],
      ['Mañanita','6,00 €'], ['Canarias','7,50 € / 13 €'], ['Sara','14,00 €']
    ]},
    { t: 'Almacén', items: [
      ['Mate cocido litoral','4,50 €'], ['Café Morenita','6,00 €'],
      ['Dulce de leche Conaprole','6,50 €'], ['Dulce de leche Havanna','6,00 €'],
      ['Mantecol 111 g','4,50 €'], ['Mantecol 253 g','7,50 €'],
      ['Dulce de batata Los Nietos','5,50 €'], ['Dulce de batata La Campagnola','10,90 €'],
      ['Dulce de batata Esnaola','13,50 €'], ['Dulce de membrillo Los Nietos','5,50 €'],
      ['Dulce de membrillo La Campagnola','10,90 €'], ['Dulce de membrillo Esnaola','13,50 €'],
      ['Dulce de batata y chocolate Esnaola','13,50 €'], ['Picodulce','0,50 €']
    ]},
    { t: 'Alfajores', items: [
      ['Punta Ballena triple','3,00 €'], ['Punta Ballena merengue','3,60 €'],
      ['Arcor','3,00 €'], ['Havanna','2,80 €'], ['Havannet','2,70 €'], ['Gusto','2,50 €']
    ]},
    { t: 'Galletitas', items: [
      ['Amor / Rumba','1,50 €'], ['Chocolinas','1,90 €'], ['Don Satur','2,90 €'],
      ['Criollitas','2,00 €'], ['Hogareñas','2,50 €']
    ]}
  ]}
];

/* =========================================================================
   TIENDA
   p: null       → se muestra "Precio disponible en breve"; el botón pasa a
                   consultar por WhatsApp en lugar de añadir al carrito.
   pickupOnly    → solo recogida en tienda (no se envía por mensajería).
   i             → foto real del producto.  g → ilustración (aún sin foto).
   ========================================================================= */

const SECCIONES = [
  { id:'yerbas',     t:'Yerbas',     d:'El mate de todos los días, de los suaves a los más fuertes.' },
  { id:'mates',      t:'Mates',      d:'Calabaza, madera, acero y vidrio. Curados y listos para cebar.' },
  { id:'termos',     t:'Termos',     d:'Acero con cierre a prueba de mochila.' },
  { id:'bombillas',  t:'Bombillas',  d:'Alpaca y acero, de pico plano o pico de loro.' },
  { id:'alfajores',  t:'Alfajores',  d:'Los de siempre y los que hacemos aquí cada mañana.' },
  { id:'galletitas', t:'Galletitas', d:'Para el mate de la tarde.' },
  { id:'almacen',    t:'Almacén',    d:'Dulce de leche, batata, membrillo y mantecol.' }
];

const img = s => `assets/img/tienda/${s}.jpg`;

const PRODUCTOS = [
  /* ---------------- YERBAS — fotos reales del local ---------------- */
  { id:'y01', s:'yerbas', n:'Taragüí',                    v:'500 g',        p:4.90,  i:img('taragui') },
  { id:'y02', s:'yerbas', n:'Unión Suave Original',       v:'500 g',        p:5.80,  i:img('union-suave') },
  { id:'y03', s:'yerbas', n:'Verdeflor Tradicional',      v:'con palo',     p:5.80,  i:img('verdeflor-tradicional') },
  { id:'y04', s:'yerbas', n:'Verdeflor Menta',            v:'500 g',        p:5.80,  i:img('verdeflor-menta') },
  { id:'y05', s:'yerbas', n:'Verdeflor Hierbas Serranas', v:'500 g',        p:5.80,  i:img('verdeflor-serranas') },
  { id:'y06', s:'yerbas', n:'Verdeflor Boldo',            v:'500 g',        p:5.80,  i:img('verdeflor-boldo') },
  { id:'y07', s:'yerbas', n:'Verdeflor Melisa',           v:'500 g',        p:5.80,  i:img('verdeflor-melisa') },
  { id:'y08', s:'yerbas', n:'Verdeflor Menta y Jengibre', v:'500 g',        p:5.80,  i:img('verdeflor-menta-jengibre') },
  { id:'y09', s:'yerbas', n:'Mañanita',                   v:'500 g',        p:6.00,  i:img('mananita') },
  { id:'y10', s:'yerbas', n:'CBSé Naranja',               v:'500 g',        p:7.00,  i:img('cbse-naranja') },
  { id:'y11', s:'yerbas', n:'Cruz de Malta Hojas Grandes',v:'500 g',        p:7.00,  i:img('cruz-de-malta') },
  { id:'y12', s:'yerbas', n:'Nobleza Gaucha',             v:'500 g',        p:7.50,  i:img('nobleza-gaucha') },
  { id:'y13', s:'yerbas', n:'Canarias',                   v:'500 g',        p:7.50,  i:img('canarias') },
  { id:'y14', s:'yerbas', n:'Rosamonte Tradicional',      v:'1 kg',         p:12.00, i:img('rosamonte') },
  { id:'y15', s:'yerbas', n:'Silueta Ideal Cabral',       v:'1 kg',         p:12.00, i:img('silueta') },
  { id:'y16', s:'yerbas', n:'Baldo',                      v:'lata 500 g',   p:13.00, i:img('baldo') },
  { id:'y17', s:'yerbas', n:'Sara Original Tradicional',  v:'1 kg',         p:14.00, i:img('sara') },
  { id:'y18', s:'yerbas', n:'CBSé Limón',                 v:'500 g',        p:null,  i:img('cbse-limon') },
  { id:'y19', s:'yerbas', n:'CBSé Jengibre',              v:'500 g',        p:null,  i:img('cbse-jengibre') },
  { id:'y20', s:'yerbas', n:'CBSé Pomelo',                v:'500 g',        p:null,  i:img('cbse-pomelo') },
  { id:'y21', s:'yerbas', n:'CBSé Hierbas Serranas',      v:'1 kg',         p:null,  i:img('cbse-serranas') },
  { id:'y22', s:'yerbas', n:'La Tranquera Tradicional',   v:'con palo',     p:null,  i:img('la-tranquera') },
  { id:'y23', s:'yerbas', n:'Armiño Clásica',             v:'1 kg',         p:null,  i:img('armino') },
  { id:'y24', s:'yerbas', n:'Cabral Para Nerviosos',      v:'1 kg',         p:null,  i:img('cabral-nerviosos') },
  { id:'y25', s:'yerbas', n:'Amanda Original',            v:'25 saquitos',  p:null,  i:img('amanda') },
  { id:'y26', s:'yerbas', n:'Playadito Mate Cocido',      v:'saquitos',     p:null,  i:img('playadito') },
  { id:'y27', s:'yerbas', n:'Rosamonte Mate Cocido',      v:'50 saquitos',  p:null,  i:img('rosamonte-cocido') },
  { id:'y28', s:'yerbas', n:'Nobleza Gaucha Mate Cocido', v:'50 saquitos',  p:null,  i:img('nobleza-cocido') },

  /* ---------------- MATES — ilustrados hasta tener foto ---------------- */
  { id:'m01', s:'mates', n:'Mate de calabaza',  v:'curado, con virola',        p:null, g:'calabaza' },
  { id:'m02', s:'mates', n:'Mate camionero',    v:'calabaza forrada en cuero', p:null, g:'camionero' },
  { id:'m03', s:'mates', n:'Mate de algarrobo', v:'madera torneada',           p:null, g:'madera' },
  { id:'m04', s:'mates', n:'Mate de acero',     v:'con base de silicona',      p:null, g:'acero' },
  { id:'m05', s:'mates', n:'Mate de vidrio',    v:'con funda',                 p:null, g:'vidrio' },
  { id:'m06', s:'mates', n:'Mate torpedo',      v:'alpaca repujada',           p:null, g:'torpedo' },

  /* ---------------- TERMOS ---------------- */
  { id:'t01', s:'termos', n:'Termo de acero 1 L',    v:'con pico cebador',        p:null, g:'termo' },
  { id:'t02', s:'termos', n:'Termo de acero 500 ml', v:'para llevar',             p:null, g:'termo-mini' },
  { id:'t03', s:'termos', n:'Termo 1,2 L',           v:'tapón a rosca',           p:null, g:'termo-alto' },
  { id:'t04', s:'termos', n:'Matera',                v:'bolso para mate y termo', p:null, g:'matera' },

  /* ---------------- BOMBILLAS ---------------- */
  { id:'b01', s:'bombillas', n:'Bombilla de alpaca',   v:'pico plano',        p:null, g:'bombilla' },
  { id:'b02', s:'bombillas', n:'Bombilla de acero',    v:'desmontable',       p:null, g:'bombilla' },
  { id:'b03', s:'bombillas', n:'Bombilla pico de loro',v:'alpaca cincelada',  p:null, g:'bombilla-loro' },

  /* ---------------- ALFAJORES — recogida en tienda ---------------- */
  { id:'a01', s:'alfajores', n:'Alfajor artesanal de la casa', v:'chocolate negro, blanco, pistacho, avellana, Oreo, ron, Fernet, cacahuete, nuez o almendra', p:3.00, pickupOnly:true, g:'alfajor' },
  { id:'a02', s:'alfajores', n:'Punta Ballena triple',   v:'', p:3.00, pickupOnly:true, g:'alfajor' },
  { id:'a03', s:'alfajores', n:'Punta Ballena merengue', v:'', p:3.60, pickupOnly:true, g:'alfajor' },
  { id:'a04', s:'alfajores', n:'Arcor',                  v:'', p:3.00, pickupOnly:true, g:'alfajor' },
  { id:'a05', s:'alfajores', n:'Havanna',                v:'', p:2.80, pickupOnly:true, g:'alfajor' },
  { id:'a06', s:'alfajores', n:'Havannet',               v:'', p:2.70, pickupOnly:true, g:'alfajor' },
  { id:'a07', s:'alfajores', n:'Gusto',                  v:'', p:2.50, pickupOnly:true, g:'alfajor' },

  /* ---------------- GALLETITAS — recogida en tienda ---------------- */
  { id:'g01', s:'galletitas', n:'Amor / Rumba', v:'', p:1.50, pickupOnly:true, g:'galleta' },
  { id:'g02', s:'galletitas', n:'Chocolinas',   v:'', p:1.90, pickupOnly:true, g:'galleta' },
  { id:'g03', s:'galletitas', n:'Don Satur',    v:'', p:2.90, pickupOnly:true, g:'galleta' },
  { id:'g04', s:'galletitas', n:'Criollitas',   v:'', p:2.00, pickupOnly:true, g:'galleta' },
  { id:'g05', s:'galletitas', n:'Hogareñas',    v:'', p:2.50, pickupOnly:true, g:'galleta' },

  /* ---------------- ALMACÉN — recogida en tienda ---------------- */
  { id:'c01', s:'almacen', n:'Dulce de leche Havanna',           v:'',      p:6.00,  pickupOnly:true, g:'tarro' },
  { id:'c02', s:'almacen', n:'Dulce de leche Conaprole',         v:'',      p:6.50,  pickupOnly:true, g:'tarro' },
  { id:'c03', s:'almacen', n:'Mantecol',                         v:'111 g', p:4.50,  pickupOnly:true, g:'barra' },
  { id:'c04', s:'almacen', n:'Mantecol',                         v:'253 g', p:7.50,  pickupOnly:true, g:'barra' },
  { id:'c05', s:'almacen', n:'Dulce de batata Los Nietos',       v:'',      p:5.50,  pickupOnly:true, g:'bloque' },
  { id:'c06', s:'almacen', n:'Dulce de batata La Campagnola',    v:'',      p:10.90, pickupOnly:true, g:'bloque' },
  { id:'c07', s:'almacen', n:'Dulce de batata Esnaola',          v:'',      p:13.50, pickupOnly:true, g:'bloque' },
  { id:'c08', s:'almacen', n:'Dulce de membrillo Los Nietos',    v:'',      p:5.50,  pickupOnly:true, g:'bloque' },
  { id:'c09', s:'almacen', n:'Dulce de membrillo La Campagnola', v:'',      p:10.90, pickupOnly:true, g:'bloque' },
  { id:'c10', s:'almacen', n:'Dulce de membrillo Esnaola',       v:'',      p:13.50, pickupOnly:true, g:'bloque' },
  { id:'c11', s:'almacen', n:'Dulce de batata y chocolate Esnaola', v:'',   p:13.50, pickupOnly:true, g:'bloque' },
  { id:'c12', s:'almacen', n:'Café Morenita',                    v:'',      p:6.00,  pickupOnly:true, g:'tarro' },
  { id:'c13', s:'almacen', n:'Mate cocido litoral',              v:'',      p:4.50,  pickupOnly:true, g:'caja' },
  { id:'c14', s:'almacen', n:'Picodulce',                        v:'',      p:0.50,  pickupOnly:true, g:'barra' }
];

/* ---------------- Reseñas reales ----------------
   Textos tal cual los escribieron sus autores. No inventes ninguna:
   para añadir más, cópialas literalmente desde Google y pégalas aquí.    */
const RESENAS = [
  { a:'Alejandra Okretic', e:5,
    t:'Bajamos del tren en Alicante y buscábamos un lugar donde desayunar. Nos encontramos ante la puerta de La Porteña, una pastelería argentina. ¡Riquísimo todo! No sabíamos qué pedir. Y tienen pan sin gluten, opciones para los celíacos. ¡Encantadoras las camareras!' },
  { a:'Marisa', e:5,
    t:'Me encantó… ¡todo! Yo, como argentina, digo «es de los míos… de mi gente linda»: cordial, amable, pródigo en información. En fin, más no se puede pedir: productos buenísimos, presentación impecable y las medialunas… ¡buenas, buenas, buenasssss!' },
  { a:'COSTAN', e:5,
    t:'Muy buen servicio y amables. El café es muy bueno y suave por solo 1,80 €. Hay muchas opciones de bollería y empanadas argentinas. Encima tienen un baño limpio.' },
  { a:'Paloma A. M.', e:5,
    t:'Cafetería situada cerca de la estación de tren, ideal para desayunar. Tiene dulces de elaboración propia, así como también empanadillas. Son rápidos.' }
];

/* Lo que más se repite en las reseñas */
const DESTACADOS = ['Medialunas', 'Empanadas', 'El café', 'La atención', 'Alfajores', 'Sin gluten'];
