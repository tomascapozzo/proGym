-- ============================================================
-- proGym — Exercise Library Seed (87 exercises)
-- Run this AFTER 001_init.sql in your Supabase SQL Editor
-- ============================================================

insert into exercises (name, type, muscle_group, movement_pattern, equipment, difficulty, secondary_groups, modalities, notes) values

-- ── CUÁDRICEPS ─────────────────────────────────────────────
('Sentadilla con Barra',           'C.C', 'Cuadriceps',      'Sentadilla',         'Peso Libre',       'Avanzado',     'Gluteos, Isquiotibiales, Core',      'Powerbuilding, Atleta Hibrido',    'Back squat o front squat. Tecnica critica'),
('Sentadilla Goblet',              'C.C', 'Cuadriceps',      'Sentadilla',         'Peso Libre',       'Principiante', 'Gluteos, Core',                      'Salud, Atleta Hibrido',            'Con kettlebell o mancuerna. Ideal para aprender patron'),
('Prensa de Piernas',              'C.C', 'Cuadriceps',      'Sentadilla',         'Maquina',          'Principiante', 'Gluteos, Isquiotibiales',             'Salud, Powerbuilding',             'Posicion de pies cambia enfoque muscular'),
('Zancada',                        'C.C', 'Cuadriceps',      'Zancada',            'Peso Libre',       'Intermedio',   'Gluteos, Isquiotibiales',             'Todas',                            'Estatica o caminando. Con mancuernas o barra'),
('Step Up',                        'C.C', 'Cuadriceps',      'Zancada',            'Peso Libre',       'Principiante', 'Gluteos',                             'Salud, Atleta Hibrido',            'Muy bueno para corredores. Con o sin peso'),
('Zercher Squat',                  'C.C', 'Cuadriceps',      'Sentadilla',         'Peso Libre',       'Avanzado',     'Core, Gluteos, Antebrazos',           'Atleta Hibrido',                   'Barra sostenida en el doblez del codo'),
('Saltos Verticales',              'C.C', 'Cuadriceps',      'Sentadilla',         'Peso Libre',       'Avanzado',     'Core, Gluteos, Antebrazos',           'Atleta Hibrido',                   'Con o sin carga. Enfoque en potencia explosiva'),
('Extension de Cuadriceps',        'C.A', 'Cuadriceps',      'Aislamiento',        'Maquina',          'Principiante', NULL,                                  'Salud, Powerbuilding',             'Ideal para completar volumen. Cuidado con rodilla'),

-- ── ISQUIOTIBIALES ─────────────────────────────────────────
('Peso Muerto Rumano',             'C.C', 'Isquiotibiales',  'Bisagra de Cadera',  'Peso Libre',       'Intermedio',   'Gluteos, Lumbar',                     'Todas',                            'Piernas semi-extendidas. Empujar cadera hacia atras'),
('Buenos Dias',                    'C.C', 'Isquiotibiales',  'Bisagra de Cadera',  'Peso Libre',       'Avanzado',     'Gluteos, Lumbar',                     'Powerbuilding',                    'Requiere buena movilidad. Barra en trapecio'),
('Nordicos',                       'C.C', 'Isquiotibiales',  'Flexion de Rodilla', 'Peso Corporal',    'Avanzado',     'Gluteos',                             'Atleta Hibrido, Powerbuilding',    'Excentrico. Excelente para prevencion de lesiones'),
('Peso Muerto con Mancuernas',     'C.C', 'Isquiotibiales',  'Bisagra de Cadera',  'Peso Libre',       'Intermedio',   'Gluteos, Lumbar',                     'Todas',                            'Piernas semi-extendidas. Empujar cadera hacia atras'),
('Curl de Piernas Tumbado',        'C.A', 'Isquiotibiales',  'Aislamiento',        'Maquina',          'Principiante', NULL,                                  'Salud, Powerbuilding',             'Tumbado boca abajo'),
('Curl de Piernas Sentado',        'C.A', 'Isquiotibiales',  'Aislamiento',        'Maquina',          'Principiante', NULL,                                  'Salud, Powerbuilding',             'Menor tension en lumbar que el tumbado'),

-- ── GLÚTEOS ────────────────────────────────────────────────
('Hip Thrust',                     'C.C', 'Gluteos',         'Empuje de Cadera',   'Peso Libre',       'Intermedio',   'Isquiotibiales, Core',                'Todas',                            'Con barra o mancuerna sobre cadera'),
('Sentadilla Bulgara',             'C.C', 'Gluteos',         'Zancada Split',      'Peso Libre',       'Avanzado',     'Cuadriceps, Isquiotibiales',          'Powerbuilding, Atleta Hibrido',    'Pie trasero elevado. Alta demanda de equilibrio'),
('Saltos Horizontales',            'C.C', 'Gluteos',         'Sentadilla',         'Sin Equipamiento', 'Principiante', 'Cuadriceps',                          'Atleta Hibrido',                   'Salto horizontal a dos pies. Enfoque en potencia'),
('Patada Glutea en Cable',         'C.A', 'Gluteos',         'Aislamiento',        'Cable',            'Principiante', 'Isquiotibiales',                      'Salud, Powerbuilding',             'De pie con tobillera'),

-- ── PECHO ──────────────────────────────────────────────────
('Press de Banca Plano',           'C.C', 'Pecho',           'Empuje Horizontal',  'Peso Libre',       'Intermedio',   'Triceps, Hombro Anterior',            'Powerbuilding, Atleta Hibrido',    'Variante con mancuernas o en Smith'),
('Press de Banca Inclinado',       'C.C', 'Pecho',           'Empuje Inclinado',   'Peso Libre',       'Intermedio',   'Triceps, Hombro Anterior',            'Powerbuilding',                    '30-45 grados de inclinacion'),
('Fondos en Paralelas',            'C.C', 'Pecho',           'Empuje Vertical',    'Peso Corporal',    'Avanzado',     'Triceps, Hombro',                     'Powerbuilding, Atleta Hibrido',    'Con peso adicional para avanzados'),
('Push Up',                        'C.C', 'Pecho',           'Empuje Horizontal',  'Peso Corporal',    'Principiante', 'Triceps, Hombro, Core',               'Salud, Atleta Hibrido',            'Variantes: inclinado, declinado, diamante'),
('Aperturas con Mancuernas',       'C.A', 'Pecho',           'Aislamiento',        'Peso Libre',       'Intermedio',   'Hombro Anterior',                     'Powerbuilding',                    'Angulo plano o inclinado'),
('Crossover en Cable',             'C.A', 'Pecho',           'Aislamiento',        'Cable',            'Intermedio',   'Hombro Anterior',                     'Powerbuilding',                    'Angulo alto, medio o bajo'),
('Press en Maquina',               'C.A', 'Pecho',           'Empuje Horizontal',  'Maquina',          'Principiante', 'Triceps, Hombro',                     'Salud',                            'Ideal para principiantes por guia de movimiento'),

-- ── ESPALDA ────────────────────────────────────────────────
('Dominadas',                      'C.C', 'Espalda',         'Jale Vertical',      'Peso Corporal',    'Avanzado',     'Biceps, Core',                        'Powerbuilding, Atleta Hibrido',    'Agarre prono o supino. Banda para asistencia'),
('Remo con Barra',                 'C.C', 'Espalda',         'Jale Horizontal',    'Peso Libre',       'Intermedio',   'Biceps, Lumbar',                      'Todas',                            'Espalda recta. Tirar al ombligo'),
('Peso Muerto Convencional',       'C.C', 'Espalda',         'Bisagra de Cadera',  'Peso Libre',       'Avanzado',     'Gluteos, Isquiotibiales, Core, Trapecio', 'Powerbuilding',               'Tecnica critica. Requiere supervision inicial'),
('Remo SEAL',                      'C.C', 'Espalda',         'Jale Vertical',      'Peso Libre',       'Intermedio',   'Biceps, Antebrazo',                   'Todas',                            'Pecho apoyado en banco inclinado. Elimina el balanceo'),
('Remo con Mancuerna',             'C.A', 'Espalda',         'Jale Horizontal',    'Peso Libre',       'Principiante', 'Biceps',                              'Salud, Powerbuilding, Atleta Hibrido', 'Apoyo en banco para estabilidad'),
('Lat Pulldown',                   'C.A', 'Espalda',         'Jale Vertical',      'Maquina',          'Principiante', 'Biceps, Hombro',                      'Salud, Powerbuilding',             'Agarre ancho o cerrado'),
('Remo en Maquina',                'C.A', 'Espalda',         'Jale Horizontal',    'Maquina',          'Principiante', 'Biceps',                              'Salud',                            'Sin carga lumbar. Bueno para iniciar'),

-- ── HOMBROS ────────────────────────────────────────────────
('Press Militar con Barra',        'C.C', 'Hombros',         'Empuje Vertical',    'Peso Libre',       'Avanzado',     'Triceps, Trapecio',                   'Powerbuilding',                    'De pie o sentado'),
('Press con Mancuernas',           'C.C', 'Hombros',         'Empuje Vertical',    'Peso Libre',       'Intermedio',   'Triceps',                             'Powerbuilding, Salud',             'Sentado o de pie'),
('Elevaciones Laterales',          'C.A', 'Hombros',         'Aislamiento',        'Peso Libre',       'Principiante', 'Trapecio',                            'Powerbuilding, Salud',             'No balancear el torso. Tambien con banda o poleas'),
('Elevaciones Frontales',          'C.A', 'Hombros',         'Aislamiento',        'Peso Libre',       'Principiante', 'Pecho Superior',                      'Powerbuilding',                    'Con mancuerna, barra o poleas'),
('Face Pull',                      'C.A', 'Hombros',         'Jale Horizontal',    'Cable',            'Intermedio',   'Trapecio, Manguito Rotador',           'Powerbuilding, Atleta Hibrido',    'Excelente para salud del hombro'),
('Elevaciones Posteriores',        'C.A', 'Hombros',         'Jale Horizontal',    'Peso Libre',       'Avanzado',     'Trapecio, Manguito Rotador',           'Todas',                            'En banco inclinado o en maquina de pec deck invertida'),

-- ── BÍCEPS ─────────────────────────────────────────────────
('Curl con Barra',                 'C.A', 'Biceps',          'Aislamiento',        'Peso Libre',       'Principiante', 'Braquial, Braquiorradial',             'Todas',                            'Barra recta o EZ'),
('Curl con Mancuernas',            'C.A', 'Biceps',          'Aislamiento',        'Peso Libre',       'Principiante', 'Braquial',                            'Todas',                            'Alternado o simultaneo'),
('Curl en Cable',                  'C.A', 'Biceps',          'Aislamiento',        'Cable',            'Intermedio',   'Braquial',                            'Todas',                            'Tension constante en todo el recorrido'),
('Curl Araña',                     'C.A', 'Biceps',          'Aislamiento',        'Peso Libre',       'Principiante', 'Braquial',                            'Todas',                            'Pecho sobre banco inclinado. Elimina el balanceo'),
('Curl Bayesian',                  'C.A', 'Biceps',          'Aislamiento',        'Cable',            'Intermedio',   'Braquial',                            'Todas',                            'Cable detras del cuerpo. Maximo estiramiento del biceps'),
('Curl en Banco Inclinado',        'C.A', 'Biceps',          'Aislamiento',        'Peso Libre',       'Principiante', 'Braquial',                            'Todas',                            'Brazo colgando atras. Estiramiento completo'),
('Curl Martillo',                  'C.A', 'Biceps',          'Aislamiento',        'Peso Libre',       'Principiante', 'Braquial, Braquiorradial',             'Todas',                            'Agarre neutro. Trabaja braquiorradial'),

-- ── TRÍCEPS ────────────────────────────────────────────────
('Extension en Polea',             'C.A', 'Triceps',         'Aislamiento',        'Cable',            'Principiante', NULL,                                  'Powerbuilding, Salud',             'Con cuerda o barra recta'),
('Press Frances',                  'C.A', 'Triceps',         'Aislamiento',        'Peso Libre',       'Intermedio',   NULL,                                  'Powerbuilding',                    'Con barra EZ o mancuernas'),
('Fondos en Banco',                'C.A', 'Triceps',         'Aislamiento',        'Peso Corporal',    'Principiante', 'Pecho, Hombro',                       'Salud, Powerbuilding',             'Piernas estiradas para mayor dificultad'),

-- ── CORE ───────────────────────────────────────────────────
('Plancha Frontal',                'C.C', 'Core',            'Estabilizacion',     'Peso Corporal',    'Principiante', 'Hombros, Gluteos',                    'Todas',                            'Variantes: lateral, con elevacion de pierna'),
('Dead Bug',                       'C.C', 'Core',            'Estabilizacion',     'Peso Corporal',    'Principiante', 'Cadera',                              'Salud, Atleta Hibrido',            'Lumbar pegada al suelo. Esencial para corredores'),
('Pallof Press',                   'C.C', 'Core',            'Anti-Rotacion',      'Cable',            'Intermedio',   'Hombros',                             'Atleta Hibrido, Powerbuilding',    'De pie o arrodillado. Tension lateral del cable'),
('Ruedita',                        'C.C', 'Core',            'Estabilizacion',     'Mixto',            'Avanzado',     'Hombros',                             'Todas',                            'Ab wheel. Empezar con recorrido corto desde rodillas'),
('Crunch Abdominal',               'C.A', 'Core',            'Flexion de Tronco',  'Peso Corporal',    'Principiante', NULL,                                  'Salud',                            'No tirar del cuello'),
('Russian Twist',                  'C.A', 'Core',            'Rotacion de Tronco', 'Peso Libre',       'Intermedio',   'Oblicuos',                            'Salud, Atleta Hibrido',            'Con o sin peso'),
('Rueda Abdominal',                'C.A', 'Core',            'Extension de Tronco','Peso Corporal',    'Avanzado',     'Hombros, Espalda',                    'Powerbuilding, Atleta Hibrido',    'Empezar con recorrido corto desde rodillas'),

-- ── CUERPO COMPLETO ────────────────────────────────────────
('Fuerza Estricta',                'C.C', 'Cuerpo Completo', 'Empuje Vertical',    'Peso Libre',       'Avanzado',     'Triceps, Core, Trapecio',             'Atleta Hibrido, Powerbuilding',    'Press estricto sin impulso de piernas. Maximo control'),
('Push Press',                     'C.C', 'Cuerpo Completo', 'Empuje Vertical',    'Peso Libre',       'Avanzado',     'Cuadriceps, Triceps, Core',           'Atleta Hibrido',                   'Impulso de piernas para superar el punto de bloqueo'),
('Cargada (Power Clean)',          'C.C', 'Cuerpo Completo', 'Olimpico',           'Peso Libre',       'Avanzado',     'Cuerpo Completo',                     'Atleta Hibrido',                   'Potencia desde el piso hasta la clavicula. Requiere tecnica olimpica'),
('Cargada Colgada (Hang Clean)',   'C.C', 'Cuerpo Completo', 'Olimpico',           'Peso Libre',       'Avanzado',     'Cuerpo Completo',                     'Atleta Hibrido',                   'Desde la posicion colgada. Menos tecnica que el clean completo'),
('Clean Completo',                 'C.C', 'Cuerpo Completo', 'Olimpico',           'Peso Libre',       'Avanzado',     'Cuerpo Completo',                     'Atleta Hibrido',                   'Desde el piso hasta overhead. Alta complejidad tecnica'),
('Arrancada (Snatch)',             'C.C', 'Cuerpo Completo', 'Olimpico',           'Peso Libre',       'Avanzado',     'Cuerpo Completo',                     'Atleta Hibrido',                   'Movimiento olimpico completo. Mayor dificultad tecnica del levantamiento'),
('Thruster',                       'C.C', 'Cuerpo Completo', 'Empuje + Sentadilla','Peso Libre',       'Avanzado',     'Cuadriceps, Hombros, Core',           'Atleta Hibrido',                   'Sentadilla frontal + press. Alta demanda metabolica'),
('Salto al Cajon (Box Jump)',      'C.C', 'Cuerpo Completo', 'Salto',              'Sin Equipamiento', 'Intermedio',   'Cuadriceps, Gluteos, Pantorrilla',    'Atleta Hibrido',                   'Enfoque en aterrizaje suave. Variante: salto al cajon profundo'),
('Swing con Kettlebell',           'C.C', 'Cuerpo Completo', 'Bisagra de Cadera',  'Peso Libre',       'Intermedio',   'Gluteos, Isquiotibiales, Core',       'Atleta Hibrido, Salud',            'Potencia de cadera. No es sentadilla sino bisagra'),

-- ── CARDIO ─────────────────────────────────────────────────
('Trote Continuo',                 'C.C', 'Cardio',          'Carrera Continua',   'Sin Equipamiento', 'Principiante', NULL,                                  'Atleta Hibrido, Salud',            'Ritmo conversacional. Base aerobica'),
('Rodaje Largo',                   'C.C', 'Cardio',          'Carrera Continua',   'Sin Equipamiento', 'Intermedio',   NULL,                                  'Atleta Hibrido',                   '60-80% FCmax. Pilar del entrenamiento de running'),
('Tempo Run',                      'C.C', 'Cardio',          'Carrera a Umbral',   'Sin Equipamiento', 'Intermedio',   NULL,                                  'Atleta Hibrido',                   'Ritmo comodo-duro. 20-40 min continuos'),
('Intervalos Cortos',              'C.C', 'Cardio',          'Carrera Intervalada','Sin Equipamiento', 'Avanzado',     NULL,                                  'Atleta Hibrido',                   'Ej: 8x200m con recuperacion. Alta intensidad'),
('Intervalos Largos',              'C.C', 'Cardio',          'Carrera Intervalada','Sin Equipamiento', 'Avanzado',     NULL,                                  'Atleta Hibrido',                   'Ej: 4x1000m. Mejora VO2max'),
('Fartlek',                        'C.C', 'Cardio',          'Carrera Variable',   'Sin Equipamiento', 'Intermedio',   NULL,                                  'Atleta Hibrido',                   'Cambios de ritmo libres. Formato ludico'),
('Series en Cuesta',               'C.C', 'Cardio',          'Carrera en Pendiente','Sin Equipamiento','Avanzado',     'Cuadriceps, Gluteos',                 'Atleta Hibrido',                   'Fortalece piernas y mejora economia de carrera'),
('Caminata Rapida',                'C.C', 'Cardio',          'Caminata',           'Sin Equipamiento', 'Principiante', NULL,                                  'Salud',                            'Ideal para recuperacion activa o inicio'),
('Bicicleta Estatica',             'C.C', 'Cardio',          'Cardio',             'Maquina',          'Principiante', 'Cuadriceps, Gluteos',                 'Salud, Atleta Hibrido',            'Cardio sin impacto articular'),
('Natacion',                       'C.C', 'Cardio',          'Cardio',             'Sin Equipamiento', 'Principiante', 'Hombros',                             'Salud, Atleta Hibrido',            'Bajo impacto. Excelente para recuperacion activa'),

-- ── MOVILIDAD ──────────────────────────────────────────────
('Pigeon Pose',                    'C.A', 'Movilidad',       'Estiramiento Estatico',   'Sin Equipamiento', 'Intermedio',   'Gluteos, Psoas',              'Atleta Hibrido, Salud',            'Esencial para corredores. Libera cadera'),
('Hip Flexor Stretch',             'C.A', 'Movilidad',       'Estiramiento Estatico',   'Sin Equipamiento', 'Principiante', 'Psoas, Cuadriceps',           'Atleta Hibrido, Salud',            'Rodilla en el suelo. Empujar cadera adelante'),
('Frog Pose',                      'C.A', 'Movilidad',       'Estiramiento Estatico',   'Sin Equipamiento', 'Intermedio',   'Aductores, Gluteos',          'Todas',                            'Posicion de rana. Espalda recta'),
('Estiramiento Isquiotibiales',    'C.A', 'Movilidad',       'Estiramiento Estatico',   'Sin Equipamiento', 'Principiante', 'Lumbar',                      'Todas',                            'No forzar. Respirar profundo'),
('Movilidad de Tobillo',           'C.A', 'Movilidad',       'Movilidad Articular',     'Sin Equipamiento', 'Principiante', 'Pantorrilla, Aquiles',        'Atleta Hibrido, Salud',            'Critico para sentadilla y running'),
('Rotacion Toracica',              'C.A', 'Movilidad',       'Movilidad Articular',     'Sin Equipamiento', 'Principiante', 'Espalda, Hombros',             'Todas',                           'Tumbado de lado. Mejora movilidad de columna'),
('Cat-Cow',                        'C.A', 'Movilidad',       'Movilidad Articular',     'Sin Equipamiento', 'Principiante', 'Lumbar, Core',                'Todas',                            'Respiracion sincronizada con el movimiento'),
('Child''s Pose',                  'C.A', 'Movilidad',       'Estiramiento Estatico',   'Sin Equipamiento', 'Principiante', 'Lumbar, Hombros, Cadera',     'Todas',                            'Posicion de descanso activo'),
('Dislocaciones con Banda',        'C.A', 'Movilidad',       'Movilidad Articular',     'Banda Elastica',   'Intermedio',   'Pecho, Espalda',              'Powerbuilding, Atleta Hibrido',    'Mejora rango de movimiento de hombro'),
('Estiramiento Pectoral',          'C.A', 'Movilidad',       'Estiramiento Estatico',   'Sin Equipamiento', 'Principiante', 'Hombro Anterior',             'Powerbuilding',                    'Apoyar antebrazo en marco de puerta'),
('Foam Rolling Isquiotibiales',    'C.A', 'Movilidad',       'Liberacion Miofascial',   'Sin Equipamiento', 'Principiante', 'Pantorrilla',                 'Atleta Hibrido, Salud',            'Requiere foam roller. 60 seg por zona'),
('Foam Rolling Cuadriceps',        'C.A', 'Movilidad',       'Liberacion Miofascial',   'Sin Equipamiento', 'Principiante', 'TFL, Rodilla',                'Atleta Hibrido, Salud',            'Enfasis en banda iliotibial si hay dolor lateral'),
('World''s Greatest Stretch',      'C.C', 'Movilidad',       'Estiramiento Dinamico',   'Sin Equipamiento', 'Intermedio',   'Cadera, Columna, Hombros',    'Atleta Hibrido, Powerbuilding',    'Movimiento compuesto. Ideal de calentamiento');
