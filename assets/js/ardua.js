/* Ardua — game engine and content. Static, dependency-free. */
(()=>{
'use strict';
const MAX_RADIUS=5;
const E={
 H:{n:1,name:'Hidrogênio',origin:'Universo primordial',process:'Matéria primordial e combustível das estrelas.',c:['#f7feff','#8ddbff','#439ce5']},
 Plus:{n:0,symbol:'+',name:'Partícula positiva',origin:'Representação simplificada da anã vermelha',process:'Peça positiva usada na etapa didática que antecede a cadeia próton-próton completa.',c:['#fff','#ff937b','#b8192d']},
 D:{n:1,mass:2,symbol:'²H',name:'Deutério',origin:'Nucleossíntese primordial + estrelas',process:'Núcleo de Hidrogênio com um próton e um nêutron. No Universo primordial, próton + nêutron abre a cadeia de núcleos leves.',c:['#f4fbff','#a9dcff','#5aa6df']},
 T:{n:1,mass:3,symbol:'³H',name:'Trítio',origin:'Nucleossíntese primordial',process:'Núcleo de Hidrogênio com um próton e dois nêutrons. É radioativo em escalas longas, mas permanece durante a nucleossíntese primordial.',c:['#f2fbff','#8fc9ef','#477fb8']},
 He3:{n:2,mass:3,symbol:'³He',name:'Hélio-3',origin:'Nucleossíntese primordial + redes estelares',process:'Núcleo de Hélio com dois prótons e um nêutron. Pode surgir quando Deutério captura um próton.',c:['#fff','#d9c6ff','#9a82e8']},
 HeU:{n:2,symbol:'He',name:'Hélio instável',origin:'Intermediário estelar simplificado',process:'Núcleo instável que treme e se desfaz após quatro rodadas se não for estabilizado.',unstable:true,c:['#fffbe8','#ffd889','#df8d43']},
 FeU:{n:26,symbol:'Fe*',name:'Ferro instável',origin:'Captura de nêutron',process:'Intermediário didático: depois de capturar um nêutron, o núcleo fica pronto para um decaimento β− que produz Cobalto.',c:['#fff8ef','#e0c5ad','#9b7357']},
 He:{n:2,name:'Hélio',origin:'Universo primordial + estrelas',process:'O núcleo ⁴He é um produto central da nucleossíntese primordial e também da fusão estelar.',c:['#fff','#e1c1ff','#9e7cff']},
 Li:{n:3,name:'Lítio',origin:'Universo primordial + fontes estelares específicas',process:'A nucleossíntese primordial produziu traços de Lítio. Em gigantes evoluídas, o mecanismo Cameron–Fowler pode transportar ⁷Be para regiões mais frias, onde a captura eletrônica forma ⁷Li.',c:['#fff8ef','#f0b5a7','#b85c53']},
 Be7:{n:4,mass:7,symbol:'⁷Be',name:'Berílio-7',origin:'Mecanismo Cameron–Fowler',process:'Intermediário estelar: ³He + ⁴He → ⁷Be + γ. O transporte para camadas mais frias permite captura eletrônica e formação de ⁷Li.',unstable:true,c:['#f8fff0','#d8efb7','#84a95f']},
 Be:{n:4,name:'Berílio',origin:'Espalação por raios cósmicos + outras fontes',process:'Isótopos estáveis de Berílio são produzidos em grande parte quando raios cósmicos fragmentam núcleos mais pesados no meio interestelar.',c:['#f8fff0','#cde5ad','#7fa568']},
 B:{n:5,name:'Boro',origin:'Espalação por raios cósmicos',process:'Grande parte do Boro cósmico surge quando partículas de alta energia fragmentam núcleos de Carbono, Nitrogênio e Oxigênio.',c:['#fff9e8','#e1c886','#947f42']},
 Be8:{n:4,mass:8,symbol:'Be',name:'Berílio-8',origin:'Intermediário do processo triplo-alfa',process:'Núcleo extremamente instável: pode surgir de dois núcleos de Hélio e rapidamente voltar a dois Hélios, ou capturar outro Hélio para formar Carbono.',unstable:true,c:['#fffbe8','#ffd889','#df8d43']},
 C:{n:6,name:'Carbono',origin:'Fusão estelar',process:'Produzido pela fusão de Hélio em estrelas evoluídas.',c:['#f8f8fb','#b7bfd2','#666f83']},
 C13:{n:6,mass:13,symbol:'¹³C',name:'Carbono-13',origin:'Bolsa de ¹³C em estrelas AGB',process:'Fonte lenta de nêutrons representada por ¹³C + ⁴He → ¹⁶O + n.',c:['#f8f8fb','#c8d0df','#737c91']},
 N:{n:7,name:'Nitrogênio',origin:'Redes de fusão estelar',process:'Participa de ciclos nucleares como o CNO.',c:['#f0f8ff','#9ecbff','#4f79c9']},
 O:{n:8,name:'Oxigênio',origin:'Fusão estelar',process:'Produzido em estrelas a partir de núcleos mais leves.',c:['#fff2f2','#ffb5bc','#ff6578']},
 Ne:{n:10,name:'Neônio',origin:'Estrelas massivas',process:'Aparece em fases avançadas de estrelas massivas.',c:['#fff9de','#ffd18d','#ff9638']},
 Ne22:{n:10,mass:22,symbol:'²²Ne',name:'Neônio-22',origin:'Pulsos térmicos de estrelas AGB',process:'Fonte quente de nêutrons representada por ²²Ne + ⁴He → ²⁵Mg + n.',c:['#fff9de','#ffdcaa','#f0a65e']},
 Na:{n:11,name:'Sódio',origin:'Estrelas massivas',process:'Produzido em redes de reações de estrelas evoluídas e massivas.',c:['#fff6e9','#ffcf99','#e98c45']},
 Mg:{n:12,name:'Magnésio',origin:'Estrelas massivas',process:'Formado em fases avançadas de queima estelar.',c:['#fffce9','#f4d78b','#d0a64a']},
 Al:{n:13,name:'Alumínio',origin:'Estrelas massivas',process:'Produzido em redes de reações de estrelas massivas.',c:['#fff','#d7dce5','#9ba4b3']},
 Si:{n:14,name:'Silício',origin:'Estrelas massivas',process:'Importante produto das fases finais de estrelas massivas.',c:['#f4fffd','#9eead6','#4db9ac']},
 S:{n:16,name:'Enxofre',origin:'Queima avançada',process:'Produzido em redes nucleares avançadas e explosivas.',c:['#fffceb','#ffef89','#e7c92b']},
 Ar:{n:18,name:'Argônio',origin:'Queima avançada',process:'Associado à queima avançada de estrelas massivas.',c:['#f6f6ff','#cfd5ff','#8192ff']},
 Ca:{n:20,name:'Cálcio',origin:'Queima avançada',process:'Produzido em redes nucleares avançadas e explosivas.',c:['#fbfff5','#d8f2aa','#95cb53']},
 Ti:{n:22,name:'Titânio',origin:'Queima avançada',process:'Produzido em ambientes estelares de alta temperatura.',c:['#fff','#c5e7ee','#74aab7']},
 Cr:{n:24,name:'Cromo',origin:'Queima avançada',process:'Associado às fases finais de estrelas massivas.',c:['#fff','#d0d6df','#8794a8']},
 Mn:{n:25,name:'Manganês',origin:'Queima avançada / explosiva',process:'Recebe contribuições de redes avançadas e supernovas.',c:['#fff5ef','#d9b7a7','#9c705e']},
 Fe:{n:26,name:'Ferro',origin:'Grupo do Ferro',process:'Marca a região em que a fusão comum deixa de sustentar a estrela.',c:['#fff','#c4cad3','#4f5869']},
 Co:{n:27,name:'Cobalto',origin:'Nucleossíntese explosiva + grupo do Ferro',process:'O Cobalto recebe contribuições importantes de ambientes explosivos e decaimentos de núcleos produzidos em supernovas.',c:['#f9f3ff','#c8b8d8','#806d91']},
 Ni:{n:28,name:'Níquel',origin:'Nucleossíntese explosiva + grupo do Ferro',process:'Isótopos de Níquel são produzidos em ambientes explosivos e participam como sementes de processos de captura de nêutrons.',c:['#fff','#d6e0ef','#6d829e']},
 Cu:{n:29,name:'Cobre',origin:'Estrelas massivas + nucleossíntese explosiva + processo-s fraco',process:'O Cobre recebe contribuições de estrelas massivas, explosões estelares e capturas lentas de nêutrons.',c:['#fff4e8','#e8a46d','#a85b2e']},
 Zn:{n:30,name:'Zinco',origin:'Nucleossíntese explosiva + outras contribuições',process:'O Zinco é fortemente associado a condições explosivas de alta energia; alguns isótopos também recebem contribuição de capturas de nêutrons.',c:['#f8fbff','#c9d4e3','#78879b']},
 Ga:{n:31,name:'Gálio',origin:'Estrelas massivas + processo-s fraco',process:'O Gálio pode receber contribuições de nucleossíntese em estrelas massivas e da rota de captura lenta de nêutrons.',c:['#fff9ef','#d6b788','#92724b']},
 Ge:{n:32,name:'Germânio',origin:'Estrelas massivas + captura de nêutrons',process:'O Germânio ocupa a transição entre produtos de estrelas massivas e elementos enriquecidos por capturas de nêutrons.',c:['#f5fbff','#b8d1d8','#66888f']},
 As:{n:33,name:'Arsênio',origin:'Origens estelares mistas + captura de nêutrons',process:'O Arsênio possui uma origem cósmica mista e pode surgir ao longo de redes que atravessam a região entre Ferro e Estrôncio.',c:['#fff7ef','#d3a88b','#895f4d']},
 Se:{n:34,name:'Selênio',origin:'Processo-s + outras fontes estelares',process:'O Selênio pode ser enriquecido por captura lenta de nêutrons, inclusive em estrelas evoluídas.',c:['#fffbe8','#e7c968','#a68129']},
 Br:{n:35,name:'Bromo',origin:'Origens estelares mistas + captura de nêutrons',process:'O Bromo aparece em rotas de nucleossíntese que atravessam núcleos progressivamente mais ricos em nêutrons.',c:['#fff0e7','#d68b68','#8f4936']},
 Kr:{n:36,name:'Criptônio',origin:'Processo-s + outras fontes',process:'Isótopos de Criptônio são produzidos por captura de nêutrons; enriquecimento de Kr é observado em material processado por estrelas AGB.',c:['#f5f2ff','#c4b8ed','#7666a8']},
 Rb:{n:37,name:'Rubídio',origin:'Processo-s · ramificações sensíveis à densidade de nêutrons',process:'O Rubídio é um importante diagnóstico do fluxo de nêutrons porque ramificações do processo-s alteram quanto Rb é produzido.',c:['#fff2f6','#ddb2c7','#936378']},
 Sr:{n:38,name:'Estrôncio',origin:'Processo-s',process:'Pode ser produzido por captura lenta de nêutrons.',c:['#fff8ef','#ffd1a3','#cf8c4e']},
 Ag:{n:47,name:'Prata',origin:'Captura de nêutrons',process:'Recebe contribuições de processos de captura de nêutrons.',c:['#fff','#e4e7ec','#a3aab5']},
 Ba:{n:56,name:'Bário',origin:'Processo-s',process:'Elemento clássico da captura lenta de nêutrons em estrelas evoluídas.',c:['#fff8ef','#ffcda0','#c17b41']},
 Eu:{n:63,name:'Európio',origin:'Processo-r',process:'Um marcador importante de material enriquecido pelo processo-r.',c:['#fff2ff','#e8b9ff','#a76acb']},
 Pt:{n:78,name:'Platina',origin:'Processo-r',process:'Elementos muito pesados podem surgir em ambientes ricos em nêutrons.',c:['#fff','#e6e2ef','#aaa4ba']},
 Au:{n:79,name:'Ouro',origin:'Processo-r',process:'Eventos extremamente ricos em nêutrons podem produzir Ouro.',c:['#fffbe8','#ffe17b','#c99516']},
 Pb:{n:82,name:'Chumbo',origin:'Processo-s + decaimento',process:'A captura lenta de nêutrons pode chegar à região do Chumbo.',c:['#f7fbff','#c3cbd5','#7c8796']},

 F:{n:9,name:'Flúor',origin:'Estrelas AGB + estrelas massivas + ν-processo',process:'O Flúor possui múltiplas origens. Nesta campanha, sua rota jogável destaca interações raras de neutrinos com núcleos de Neônio em uma supernova.',route:'ν-processo representado',c:['#f4fff0','#c9efa8','#76b45b']},
 P:{n:15,name:'Fósforo',origin:'Estrelas massivas + nucleossíntese explosiva',process:'O Fósforo é produzido em redes de estrelas massivas e recebe contribuição de explosões. A microfase representa uma rota nuclear agregada.',route:'Rede estelar agregada',c:['#fff8ed','#f4bc7a','#bd6c31']},
 Cl:{n:17,name:'Cloro',origin:'Estrelas massivas + nucleossíntese explosiva',process:'O Cloro recebe contribuições de redes avançadas de estrelas massivas e de explosões estelares.',route:'Rede estelar agregada',c:['#f4fff1','#bfe99f','#6fa94e']},
 K:{n:19,name:'Potássio',origin:'Estrelas massivas + supernovas',process:'O Potássio é produzido em redes avançadas e explosivas; a fase resume várias reações em um gesto de forja.',route:'Rede estelar agregada',c:['#f5efff','#c6a8ef','#7f5bb2']},
 Sc:{n:21,name:'Escândio',origin:'Nucleossíntese explosiva + estrelas massivas',process:'O Escândio é raro e sensível às condições de estrelas massivas e supernovas.',route:'Rede explosiva agregada',c:['#f8fbff','#c3d7e8','#7896ad']},
 V:{n:23,name:'Vanádio',origin:'Queima avançada + nucleossíntese explosiva',process:'O Vanádio recebe contribuições de redes próximas ao grupo do Ferro e de material processado em supernovas.',route:'Rede avançada agregada',c:['#fff7f2','#d6b4a2','#8c6c5d']},
 Y:{n:39,name:'Ítrio',origin:'Processo-s',process:'Ítrio, Estrôncio e Zircônio pertencem à região do primeiro pico do processo-s.',route:'Captura n + β−',c:['#f6fbff','#c8dce6','#7897a5']},
 Zr:{n:40,name:'Zircônio',origin:'Processo-s + outras contribuições',process:'O Zircônio é um elemento clássico da região do primeiro pico de captura lenta de nêutrons.',route:'Captura n + β−',c:['#f8fbff','#d5e0e8','#8999a5']},
 Nb:{n:41,name:'Nióbio',origin:'Captura de nêutrons + decaimentos',process:'O Nióbio aparece em redes de captura e decaimentos próximos ao primeiro pico do processo-s.',route:'Captura n + β−',c:['#f7f5ff','#c8c1df','#81789d']},
 Mo:{n:42,name:'Molibdênio',origin:'Processos s/r + p/γ em isótopos específicos',process:'O Molibdênio possui várias origens isotópicas. A fase especial destaca fotodesintegração em condições explosivas como uma rota para p-núcleos.',route:'γ-processo representado',c:['#fff','#d9dee6','#9099a5']},
 Tc:{n:43,name:'Tecnécio',origin:'Processo-s em estrelas evoluídas',process:'O Tecnécio possui somente isótopos radioativos. Sua presença em estrelas evoluídas é uma evidência histórica de nucleossíntese recente.',route:'Captura n + β−',stability:'Radioativo',c:['#f5fff2','#b9dda7','#6b9860']},
 Ru:{n:44,name:'Rutênio',origin:'Processos s/r + p/γ em isótopos específicos',process:'O Rutênio tem contribuições de várias rotas. Aqui, a fase especial destaca o γ-processo como uma das vias para isótopos proton-rich.',route:'γ-processo representado',c:['#fff','#d7dce5','#8993a1']},
 Rh:{n:45,name:'Ródio',origin:'Processos de captura de nêutrons',process:'O Ródio recebe contribuições de rotas de captura lenta e rápida de nêutrons.',route:'Captura n + β−',c:['#fff6f7','#e0bec5','#9a727b']},
 Pd:{n:46,name:'Paládio',origin:'Processos s + r',process:'O Paládio possui contribuições de diferentes ambientes de captura de nêutrons.',route:'Captura n + β−',c:['#fff','#dce3e8','#98a6af']},
 Cd:{n:48,name:'Cádmio',origin:'Processos s + r',process:'O Cádmio é construído por redes de captura de nêutrons em mais de um ambiente astrofísico.',route:'Captura n + β−',c:['#f7fbff','#c9d9e4','#8095a4']},
 In:{n:49,name:'Índio',origin:'Processos de captura de nêutrons',process:'O Índio aparece em redes pesadas de captura e decaimento.',route:'Captura n + β−',c:['#fff7f3','#d6b5a7','#8d6b5f']},
 Sn:{n:50,name:'Estanho',origin:'Processos s + r',process:'O Estanho possui vários isótopos estáveis e recebe contribuições de captura lenta e rápida.',route:'Captura n + β−',c:['#f8fbff','#cad5dd','#7f919d']},
 Sb:{n:51,name:'Antimônio',origin:'Processos de captura de nêutrons',process:'O Antimônio ocupa uma região em que capturas e decaimentos conectam vários elementos pesados.',route:'Captura n + β−',c:['#fff8ef','#d8bc8d','#8f764d']},
 Te:{n:52,name:'Telúrio',origin:'Processos r + s',process:'O Telúrio possui forte interesse na região do segundo pico do processo-r e também contribuições de outras rotas.',route:'Captura n + β−',c:['#fff4f7','#deb2c2','#956174']},
 I:{n:53,name:'Iodo',origin:'Processos de captura de nêutrons',process:'O Iodo é produzido em redes pesadas de captura e decaimento.',route:'Captura n + β−',c:['#f3efff','#c2aee7','#785aa3']},
 Xe:{n:54,name:'Xenônio',origin:'Processos s + r',process:'O Xenônio reúne isótopos produzidos por diferentes rotas e marca uma região importante de núcleos pesados.',route:'Captura n + β−',c:['#f3f7ff','#b8caf0','#6b82bb']},
 Cs:{n:55,name:'Césio',origin:'Processos de captura de nêutrons',process:'O Césio surge ao longo de rotas pesadas de captura e decaimento antes da região do Bário.',route:'Captura n + β−',c:['#fff0f4','#db9fb5','#98566f']},
 La:{n:57,name:'Lantânio',origin:'Processos s + r',process:'O Lantânio é um representante importante da região pesada produzida por captura de nêutrons.',route:'Processo-s representado',c:['#f7f4ff','#c8bce5','#8071a0']},
 Ce:{n:58,name:'Cério',origin:'Processos s + r',process:'O Cério é enriquecido em material processado por capturas de nêutrons em estrelas evoluídas.',route:'Processo-s representado',c:['#fff8ef','#e1c28d','#9b7845']},
 Pr:{n:59,name:'Praseodímio',origin:'Processos s + r',process:'O Praseodímio recebe contribuições de rotas lentas e rápidas de captura de nêutrons.',route:'Captura n + β−',c:['#f5fff3','#bad9ac','#729467']},
 Nd:{n:60,name:'Neodímio',origin:'Processos s + r',process:'O Neodímio é produzido por uma mistura de contribuições do processo-s e do processo-r.',route:'Captura n + β−',c:['#f3f5ff','#b7c2e6','#6e7aa8']},
 Pm:{n:61,name:'Promécio',origin:'Capturas de nêutrons + decaimentos',process:'O Promécio não possui isótopos estáveis; qualquer Pm cósmico é transitório em escalas suficientemente longas.',route:'Captura n + β−',stability:'Radioativo',c:['#fff1f5','#dea8bc','#965c72']},
 Sm:{n:62,name:'Samário',origin:'Processos s + r',process:'O Samário recebe contribuições importantes tanto de captura lenta quanto rápida.',route:'Captura n + β−',c:['#f7f2ff','#ceb9eb','#8869ad']},
 Gd:{n:64,name:'Gadolínio',origin:'Processo-r + processo-s',process:'O Gadolínio integra a região das terras raras produzida por capturas de nêutrons.',route:'Processo-r representado',c:['#eef9ff','#abd4e9','#648eab']},
 Tb:{n:65,name:'Térbio',origin:'Processo-r + processo-s',process:'O Térbio integra a região das terras raras e recebe contribuição de capturas rápidas.',route:'Processo-r representado',c:['#effff5','#a8ddbc','#5e9b76']},
 Dy:{n:66,name:'Disprósio',origin:'Processo-r + processo-s',process:'O Disprósio é abundante entre as terras raras e possui contribuição importante do processo-r.',route:'Processo-r representado',c:['#f6f3ff','#c5b6e8','#7963a1']},
 Ho:{n:67,name:'Hólmio',origin:'Processo-r + processo-s',process:'O Hólmio aparece na sequência de terras raras criada por captura de nêutrons.',route:'Processo-r representado',c:['#fff5f0','#ddb7a7','#956c5c']},
 Er:{n:68,name:'Érbio',origin:'Processo-r + processo-s',process:'O Érbio recebe contribuições de ambientes de captura lenta e rápida.',route:'Processo-r representado',c:['#f4fbff','#b8d5e5','#6e94a8']},
 Tm:{n:69,name:'Túlio',origin:'Processo-r + processo-s',process:'O Túlio é uma terra rara produzida em redes de captura de nêutrons.',route:'Processo-r representado',c:['#fff2f8','#ddaeca','#955f7e']},
 Yb:{n:70,name:'Itérbio',origin:'Processo-r + processo-s',process:'O Itérbio integra a região de terras raras formada por múltiplas rotas de captura.',route:'Processo-r representado',c:['#f6f6ff','#c5c8eb','#797da6']},
 Lu:{n:71,name:'Lutécio',origin:'Processo-r + processo-s',process:'O Lutécio encerra a série dos lantanídeos e recebe contribuições de captura de nêutrons.',route:'Processo-r representado',c:['#fff8ef','#dfc39b','#987a52']},
 Hf:{n:72,name:'Háfnio',origin:'Processos s + r',process:'O Háfnio é produzido por captura de nêutrons em estrelas e eventos extremos.',route:'Processo-r representado',c:['#f7fbff','#cad9e2','#8094a0']},
 Ta:{n:73,name:'Tântalo',origin:'Processos s + r',process:'O Tântalo possui uma origem isotópica complexa ligada a capturas de nêutrons.',route:'Processo-r representado',c:['#fff5ef','#ddba9f','#946d57']},
 W:{n:74,name:'Tungstênio',origin:'Processos s + r',process:'O Tungstênio é um núcleo pesado construído por rotas de captura lenta e rápida.',route:'Processo-r representado',c:['#f6f8ff','#c4ccdd','#7b879e']},
 Re:{n:75,name:'Rênio',origin:'Processos s + r',process:'O Rênio aparece na aproximação à região do terceiro pico de núcleos pesados.',route:'Processo-r representado',c:['#fff4f5','#d9afb5','#91666d']},
 Os:{n:76,name:'Ósmio',origin:'Processo-r + processo-s',process:'O Ósmio está próximo da região do terceiro pico de abundância do processo-r.',route:'Processo-r representado',c:['#f3f7ff','#bbc9df','#71839e']},
 Ir:{n:77,name:'Irídio',origin:'Processo-r + processo-s',process:'O Irídio é produzido em ambientes capazes de construir núcleos muito pesados.',route:'Processo-r representado',c:['#f5f2ff','#c2b6db','#786b91']},
 Hg:{n:80,name:'Mercúrio',origin:'Processos s + r + contribuições específicas',process:'O Mercúrio possui isótopos com origens variadas em redes pesadas de nucleossíntese.',route:'Processo-r representado',c:['#f7fbff','#c9d8e0','#82959e']},
 Tl:{n:81,name:'Tálio',origin:'Processos s + r + decaimentos',process:'O Tálio recebe contribuições de capturas pesadas e também aparece em cadeias radioativas.',route:'Processo-r representado',c:['#fff7ef','#d7bd94','#8f774f']},
 Bi:{n:83,name:'Bismuto',origin:'Região terminal do processo-s + processo-r',process:'Bismuto-209 marca a extremidade pesada alcançada pela rota clássica do processo-s antes de reciclagens por decaimento.',route:'Fim do processo-s',c:['#f7f2ff','#c9b5de','#806998']},
 Po:{n:84,name:'Polônio',origin:'Cadeias radioativas + nucleossíntese pesada',process:'O Polônio aparece como descendente transitório em séries de decaimento de núcleos muito pesados.',route:'Decaimento radioativo',stability:'Radioativo',c:['#fff2ef','#dfaea5','#975f59']},
 At:{n:85,name:'Astato',origin:'Cadeias radioativas raras',process:'O Astato é extremamente raro e pode aparecer em pequenos ramos de cadeias radioativas naturais.',route:'Ramo radioativo agregado',stability:'Radioativo',c:['#f5f0ff','#c0a8df','#76599a']},
 Rn:{n:86,name:'Radônio',origin:'Cadeias radioativas',process:'O Radônio é um gás radioativo produzido em cadeias de decaimento de Rádio e outros núcleos pesados.',route:'Decaimento α',stability:'Radioativo',c:['#eef6ff','#a9c5e8','#607fa8']},
 Fr:{n:87,name:'Frâncio',origin:'Ramos raros de cadeias radioativas',process:'O Frâncio é extremamente raro e aparece transitoriamente em ramos de séries naturais de decaimento.',route:'Ramo radioativo agregado',stability:'Radioativo',c:['#fff0f4','#dca2b6','#995a70']},
 Ra:{n:88,name:'Rádio',origin:'Cadeias radioativas',process:'O Rádio é um descendente radioativo importante das famílias de Urânio e Tório.',route:'Decaimento radioativo',stability:'Radioativo',c:['#fff9e9','#e4cc85','#9b8337']},
 Ac:{n:89,name:'Actínio',origin:'Cadeias radioativas',process:'O Actínio aparece em séries naturais de decaimento e dá nome a uma das famílias radioativas clássicas.',route:'Decaimento radioativo',stability:'Radioativo',c:['#f3fff2','#b5dba9','#6c9664']},
 Pa:{n:91,name:'Protactínio',origin:'Cadeias de Urânio + processo-r',process:'O Protactínio aparece como intermediário radioativo nas séries do Urânio e também pode ser produzido em ambientes muito ricos em nêutrons.',route:'Decaimento radioativo',stability:'Radioativo',c:['#f6f2ff','#c7b6e1','#7d689b']},
 Th:{n:90,name:'Tório',origin:'Processo-r',process:'Núcleo muito pesado produzido em ambientes extremos ricos em nêutrons.',c:['#fff2ef','#d7a39a','#944e49']},
 U:{n:92,name:'Urânio',origin:'Processo-r',process:'Núcleo muito pesado produzido em eventos de nucleossíntese extremos.',c:['#f4ffef','#a6d38f','#557a47']}
};
const ORDER=['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th','Pa','U'];
// elementos sem peso atômico padrão usam entre colchetes um número de massa representativo.
const ATOMIC_WEIGHTS={
 H:'1,008',He:'4,0026',Li:'6,94',Be:'9,0122',B:'10,81',C:'12,011',N:'14,007',O:'15,999',F:'18,998',Ne:'20,180',Na:'22,990',Mg:'24,305',Al:'26,982',Si:'28,085',P:'30,974',S:'32,06',Cl:'35,45',Ar:'39,948',K:'39,098',Ca:'40,078',Sc:'44,956',Ti:'47,867',V:'50,942',Cr:'51,996',Mn:'54,938',Fe:'55,845',Co:'58,933',Ni:'58,693',Cu:'63,546',Zn:'65,38',Ga:'69,723',Ge:'72,630',As:'74,922',Se:'78,971',Br:'79,904',Kr:'83,798',Rb:'85,468',Sr:'87,62',Y:'88,906',Zr:'91,224',Nb:'92,906',Mo:'95,95',Tc:'[98]',Ru:'101,07',Rh:'102,906',Pd:'106,42',Ag:'107,868',Cd:'112,414',In:'114,818',Sn:'118,710',Sb:'121,760',Te:'127,60',I:'126,904',Xe:'131,293',Cs:'132,905',Ba:'137,327',La:'138,905',Ce:'140,116',Pr:'140,908',Nd:'144,242',Pm:'[145]',Sm:'150,36',Eu:'151,964',Gd:'157,25',Tb:'158,925',Dy:'162,500',Ho:'164,930',Er:'167,259',Tm:'168,934',Yb:'173,045',Lu:'174,967',Hf:'178,49',Ta:'180,948',W:'183,84',Re:'186,207',Os:'190,23',Ir:'192,217',Pt:'195,084',Au:'196,967',Hg:'200,592',Tl:'204,38',Pb:'207,2',Bi:'208,980',Po:'[209]',At:'[210]',Rn:'[222]',Fr:'[223]',Ra:'[226]',Ac:'[227]',Th:'232,038',Pa:'231,036',U:'238,029'
};
const PARTICLE_INFO={
 neutral:{symbol:'◎',name:'Selecione',top:'INFORMAÇÃO',meta:'toque em uma peça',fact:'Toque em uma peça para ver seus dados, uma curiosidade e as receitas já aprendidas que usam esse objeto.'},
 singularity:{symbol:'∞',name:'Singularidade',top:'COSMOLOGIA',meta:'estado inicial · limite',fact:'Representa o limite em que nossos modelos clássicos deixam de descrever o Universo; o Big Bang parte de um estado extremamente quente e denso.'},
 p:{symbol:'p⁺',name:'Próton',top:'PARTÍCULA',meta:'carga +1 · núcleon',fact:'O próton tem carga positiva e é o núcleo do Hidrogênio-1. A quantidade de prótons determina qual é o elemento.'},
 n:{symbol:'n',name:'Nêutron',top:'PARTÍCULA',meta:'carga 0 · núcleon',fact:'O nêutron não tem carga elétrica. Livre, ele é instável; dentro de muitos núcleos, ajuda a manter a matéria nuclear ligada.'},
 e:{symbol:'e⁻',name:'Elétron',top:'PARTÍCULA',meta:'carga −1 · lépton',fact:'Elétrons formam a estrutura eletrônica dos átomos. Em plasmas quentes, eles permanecem livres dos núcleos.'},
 pos:{symbol:'e⁺',name:'Pósitron',top:'ANTIMATÉRIA',meta:'carga +1 · lépton',fact:'O pósitron é a antipartícula do elétron. Pode surgir em interações fracas e se aniquilar com um elétron produzindo fótons.'},
 nu:{symbol:'νₑ',name:'Neutrino',top:'PARTÍCULA',meta:'carga 0 · lépton',fact:'Neutrinos têm carga elétrica nula e interagem muito fracamente, atravessando enormes quantidades de matéria.'},
 antinu:{symbol:'ν̄ₑ',name:'Antineutrino',top:'PARTÍCULA',meta:'carga 0 · lépton',fact:'O antineutrino eletrônico acompanha processos β−, carregando energia e número leptônico para longe da reação.'},
 gamma:{symbol:'γ',name:'Fóton gama',top:'RADIAÇÃO',meta:'carga 0 · fóton',fact:'Raios gama são fótons de altíssima energia. Reações nucleares podem emiti-los ou, em ambientes extremos, absorvê-los.'},
 cosmic:{symbol:'RC',name:'Raio cósmico',top:'ALTA ENERGIA',meta:'carga varia · fluxo',fact:'Raios cósmicos são partículas de alta energia, sobretudo prótons e núcleos, capazes de fragmentar núcleos interestelares.'}
};
const ISOTOPE_FACTS={D:'tem um próton e um nêutron; sua sobrevivência abriu o caminho para a nucleossíntese primordial.',T:'tem um próton e dois nêutrons. É radioativo e decai por β− para Hélio-3.',He3:'tem dois prótons e um nêutron e participa tanto da nucleossíntese primordial quanto de redes estelares.',Be7:'é o intermediário do mecanismo Cameron–Fowler: nasce de ³He + ⁴He e, após ser transportado para uma região mais fria, captura um elétron e forma Lítio-7.',Be8:'é extremamente instável; sua breve existência é a ponte do processo triplo-alfa para a formação de Carbono.',HeU:'é um intermediário instável didático; sua vibração sinaliza uma janela curta para reagir.',FeU:'é um intermediário rico em nêutrons pronto para uma transformação β−.'};

const PRIMORDIAL_NUCLEAR_REACTIONS=[
 {id:'pn_d',unlock:'primordial_d',pieces:[],particles:['p','n'],out:'D',mass:2,emissions:['gamma'],label:'p + n → ²H + γ'},
 {id:'dn_t',unlock:'primordial_t',pieces:['D'],particles:['n'],out:'T',mass:3,emissions:['gamma'],label:'²H + n → ³H + γ',longRadioactive:true},
 {id:'dp_he3',unlock:'primordial_he3',pieces:['D'],particles:['p'],out:'He3',mass:3,emissions:['gamma'],label:'²H + p → ³He + γ'},
 {id:'he3d_he',unlock:'primordial_he3d',pieces:['He3','D'],particles:[],out:'He',mass:4,freeParticles:['p'],label:'³He + ²H → ⁴He + p'},
 {id:'td_he',unlock:'primordial_td',pieces:['T','D'],particles:[],out:'He',mass:4,freeParticles:['n'],label:'³H + ²H → ⁴He + n'},
 {id:'het_li',unlock:'primordial_li',pieces:['He','T'],particles:[],out:'Li',mass:7,emissions:['gamma'],label:'⁴He + ³H → ⁷Li + γ'}
];
const BROWN_FUSION={ing:['D','H'],out:'He3',emissions:['gamma'],brown:true};
const RED_UNSTABLE_FUSION={ing:['H','Plus'],out:'HeU',red:true};
const RED_STABLE_FUSION={ing:['HeU','HeU'],out:'He',red:true};
const CARBON_CARBON_FUSION={ing:['C','C'],out:'Ne',freeNuclei:['He'],minTemp:8e8,heavyIon:true};
const CARBON_OXYGEN_FUSION={ing:['C','O'],out:'Mg',freeNuclei:['He'],minTemp:1.1e9,heavyIon:true};
const OXYGEN_OXYGEN_FUSION={ing:['O','O'],out:'Si',freeNuclei:['He'],minTemp:1.5e9,heavyIon:true};
const CHROMIUM_ALPHA_FUSION={ing:['Cr','He'],out:'Fe',emissions:['gamma'],minTemp:2.8e9,heavyIon:true};
// Atlas de pares elementares até Z₁+Z₂=26. Os Q-values foram calculados a partir
// de massas atômicas de isótopos representativos. A categoria é uma decisão de
// gameplay/pedagogia; ela não substitui uma previsão completa de seção de choque.
const ATLAS_REACTIONS=[{"id":"atlas_c_c","a":"C","b":"C","A1":12,"A2":12,"compound":"Mg","compoundA":24,"category":"competing","channel":"alpha","barrier":36,"mainSym":"Ne","mainA":20,"label":"¹²C + ¹²C → ²⁰Ne + ⁴He","rounds":1,"rareMisses":1,"target":4,"q":4.617,"existingPhaseId":"carbon_burn","altChannel":"p","altLabel":"¹²C + ¹²C → ²³Na + p","altMainSym":"Na","altMainA":23},{"id":"atlas_c_o","a":"C","b":"O","A1":12,"A2":16,"compound":"Si","compoundA":28,"category":"competing","channel":"alpha","barrier":48,"mainSym":"Mg","mainA":24,"label":"¹²C + ¹⁶O → ²⁴Mg + ⁴He","rounds":3,"rareMisses":1,"target":4,"q":6.772,"existingPhaseId":"carbon_oxygen","altChannel":"p","altLabel":"¹²C + ¹⁶O → ²⁷Al + p","altMainSym":"Al","altMainA":27},{"id":"atlas_o_o","a":"O","b":"O","A1":16,"A2":16,"compound":"S","compoundA":32,"category":"competing","channel":"alpha","barrier":64,"mainSym":"Si","mainA":28,"label":"¹⁶O + ¹⁶O → ²⁸Si + ⁴He","rounds":3,"rareMisses":1,"target":4,"q":9.594,"existingPhaseId":"oxygen_burn","altChannel":"p","altLabel":"¹⁶O + ¹⁶O → ³¹P + p","altMainSym":"P","altMainA":31},{"id":"atlas_cr_he","a":"Cr","b":"He","A1":52,"A2":4,"compound":"Fe","compoundA":56,"category":"rare","channel":"gamma","barrier":48,"mainSym":"Fe","mainA":56,"label":"⁵²Cr + ⁴He → ⁵⁶Fe + γ","rounds":1,"rareMisses":1,"target":3,"q":7.613,"existingPhaseId":"cr_alpha_fe"},{"id":"atlas_h_be","a":"H","b":"Be","A1":1,"A2":9,"compound":"B","compoundA":10,"category":"rare","channel":"gamma","barrier":4,"mainSym":"B","mainA":10,"label":"H + ⁹Be → ¹⁰B + γ","rounds":2,"rareMisses":2,"target":3,"q":6.587,"anchorId":"spallation"},{"id":"atlas_h_b","a":"H","b":"B","A1":1,"A2":11,"compound":"C","compoundA":12,"category":"fragment","channel":"alpha","barrier":5,"mainSym":"Be8","mainA":8,"label":"H + ¹¹B → ⁸Be + ⁴He","rounds":3,"rareMisses":1,"target":3,"q":8.59,"anchorId":"c"},{"id":"atlas_h_o","a":"H","b":"O","A1":1,"A2":16,"compound":"F","compoundA":17,"category":"rare","channel":"gamma","barrier":8,"mainSym":"F","mainA":17,"label":"H + ¹⁶O → ¹⁷F + γ","rounds":2,"rareMisses":1,"target":3,"q":0.6,"anchorId":"nu_f"},{"id":"atlas_h_f","a":"H","b":"F","A1":1,"A2":19,"compound":"Ne","compoundA":20,"category":"fragment","channel":"alpha","barrier":9,"mainSym":"O","mainA":16,"label":"H + ¹⁹F → ¹⁶O + ⁴He","rounds":1,"rareMisses":1,"target":3,"q":8.114,"anchorId":"ne"},{"id":"atlas_he_li","a":"He","b":"Li","A1":4,"A2":7,"compound":"B","compoundA":11,"category":"endothermic","channel":"n","barrier":6,"mainSym":"B","mainA":10,"label":"⁴He + ⁷Li → ¹⁰B + n","rounds":2,"rareMisses":1,"target":3,"q":-2.79,"anchorId":"spallation"},{"id":"atlas_he_b","a":"He","b":"B","A1":4,"A2":11,"compound":"N","compoundA":15,"category":"favorable","channel":"gamma","barrier":10,"mainSym":"N","mainA":15,"label":"⁴He + ¹¹B → ¹⁵N + γ","rounds":1,"rareMisses":1,"target":3,"q":10.991,"anchorId":"n"},{"id":"atlas_he_n","a":"He","b":"N","A1":4,"A2":14,"compound":"F","compoundA":18,"category":"rare","channel":"gamma","barrier":14,"mainSym":"F","mainA":18,"label":"⁴He + ¹⁴N → ¹⁸F + γ","rounds":2,"rareMisses":2,"target":3,"q":4.415,"anchorId":"nu_f"},{"id":"atlas_he_f","a":"He","b":"F","A1":4,"A2":19,"compound":"Na","compoundA":23,"category":"endothermic","channel":"n","barrier":18,"mainSym":"Na","mainA":22,"label":"⁴He + ¹⁹F → ²²Na + n","rounds":2,"rareMisses":1,"target":3,"q":-1.952,"anchorId":"na"},{"id":"atlas_he_na","a":"He","b":"Na","A1":4,"A2":23,"compound":"Al","compoundA":27,"category":"endothermic","channel":"n","barrier":22,"mainSym":"Al","mainA":26,"label":"⁴He + ²³Na → ²⁶Al + n","rounds":1,"rareMisses":1,"target":3,"q":-2.966,"anchorId":"al"},{"id":"atlas_he_al","a":"He","b":"Al","A1":4,"A2":27,"compound":"P","compoundA":31,"category":"endothermic","channel":"n","barrier":26,"mainSym":"P","mainA":30,"label":"⁴He + ²⁷Al → ³⁰P + n","rounds":3,"rareMisses":1,"target":3,"q":-2.642,"anchorId":"p"},{"id":"atlas_he_p","a":"He","b":"P","A1":4,"A2":31,"compound":"Cl","compoundA":35,"category":"rare","channel":"gamma","barrier":30,"mainSym":"Cl","mainA":35,"label":"⁴He + ³¹P → ³⁵Cl + γ","rounds":2,"rareMisses":1,"target":3,"q":6.998,"anchorId":"cl"},{"id":"atlas_he_cl","a":"He","b":"Cl","A1":4,"A2":35,"compound":"K","compoundA":39,"category":"rare","channel":"gamma","barrier":34,"mainSym":"K","mainA":39,"label":"⁴He + ³⁵Cl → ³⁹K + γ","rounds":1,"rareMisses":1,"target":3,"q":7.219,"anchorId":"k"},{"id":"atlas_he_k","a":"He","b":"K","A1":4,"A2":39,"compound":"Sc","compoundA":43,"category":"rare","channel":"gamma","barrier":38,"mainSym":"Sc","mainA":43,"label":"⁴He + ³⁹K → ⁴³Sc + γ","rounds":3,"rareMisses":1,"target":3,"q":4.806,"anchorId":"sc"},{"id":"atlas_he_sc","a":"He","b":"Sc","A1":4,"A2":45,"compound":"V","compoundA":49,"category":"endothermic","channel":"n","barrier":42,"mainSym":"V","mainA":48,"label":"⁴He + ⁴⁵Sc → ⁴⁸V + n","rounds":1,"rareMisses":1,"target":3,"q":-2.241,"anchorId":"v"},{"id":"atlas_he_v","a":"He","b":"V","A1":4,"A2":51,"compound":"Mn","compoundA":55,"category":"endothermic","channel":"n","barrier":46,"mainSym":"Mn","mainA":54,"label":"⁴He + ⁵¹V → ⁵⁴Mn + n","rounds":2,"rareMisses":1,"target":3,"q":-2.293,"anchorId":"mn"},{"id":"atlas_li_li","a":"Li","b":"Li","A1":7,"A2":7,"compound":"C","compoundA":14,"category":"fragment","channel":"alpha","barrier":9,"mainSym":"Be","mainA":10,"label":"⁷Li + ⁷Li → ¹⁰Be + ⁴He","rounds":3,"rareMisses":1,"target":3,"q":14.782,"anchorId":"c"},{"id":"atlas_li_be","a":"Li","b":"Be","A1":7,"A2":9,"compound":"N","compoundA":16,"category":"fragment","channel":"alpha","barrier":12,"mainSym":"B","mainA":12,"label":"⁷Li + ⁹Be → ¹²B + ⁴He","rounds":1,"rareMisses":2,"target":3,"q":10.461,"anchorId":"n"},{"id":"atlas_li_b","a":"Li","b":"B","A1":7,"A2":11,"compound":"O","compoundA":18,"category":"fragment","channel":"alpha","barrier":15,"mainSym":"C","mainA":14,"label":"⁷Li + ¹¹B → ¹⁴C + ⁴He","rounds":2,"rareMisses":1,"target":3,"q":18.13,"anchorId":"o"},{"id":"atlas_li_c","a":"Li","b":"C","A1":7,"A2":12,"compound":"F","compoundA":19,"category":"fragment","channel":"alpha","barrier":18,"mainSym":"N","mainA":15,"label":"⁷Li + ¹²C → ¹⁵N + ⁴He","rounds":2,"rareMisses":1,"target":3,"q":12.381,"anchorId":"nu_f"},{"id":"atlas_li_n","a":"Li","b":"N","A1":7,"A2":14,"compound":"Ne","compoundA":21,"category":"fragment","channel":"alpha","barrier":21,"mainSym":"O","mainA":17,"label":"⁷Li + ¹⁴N → ¹⁷O + ⁴He","rounds":3,"rareMisses":2,"target":3,"q":16.154,"anchorId":"ne"},{"id":"atlas_li_o","a":"Li","b":"O","A1":7,"A2":16,"compound":"Na","compoundA":23,"category":"fragment","channel":"alpha","barrier":24,"mainSym":"F","mainA":19,"label":"⁷Li + ¹⁶O → ¹⁹F + ⁴He","rounds":1,"rareMisses":1,"target":3,"q":9.233,"anchorId":"na"},{"id":"atlas_li_f","a":"Li","b":"F","A1":7,"A2":19,"compound":"Mg","compoundA":26,"category":"fragment","channel":"alpha","barrier":27,"mainSym":"Ne","mainA":22,"label":"⁷Li + ¹⁹F → ²²Ne + ⁴He","rounds":3,"rareMisses":1,"target":3,"q":19.019,"anchorId":"mg"},{"id":"atlas_li_ne","a":"Li","b":"Ne","A1":7,"A2":20,"compound":"Al","compoundA":27,"category":"competing","channel":"p","barrier":30,"mainSym":"Mg","mainA":26,"label":"⁷Li + ²⁰Ne → ²⁶Mg + p","rounds":3,"rareMisses":1,"target":4,"q":16.791,"anchorId":"al","altChannel":"alpha","altLabel":"⁷Li + ²⁰Ne → ²³Na + ⁴He","altMainSym":"Na","altMainA":23},{"id":"atlas_li_na","a":"Li","b":"Na","A1":7,"A2":23,"compound":"Si","compoundA":30,"category":"competing","channel":"n","barrier":33,"mainSym":"Si","mainA":29,"label":"⁷Li + ²³Na → ²⁹Si + n","rounds":2,"rareMisses":1,"target":4,"q":19.201,"anchorId":"si","altChannel":"alpha","altLabel":"⁷Li + ²³Na → ²⁶Mg + ⁴He","altMainSym":"Mg","altMainA":26},{"id":"atlas_li_mg","a":"Li","b":"Mg","A1":7,"A2":24,"compound":"P","compoundA":31,"category":"competing","channel":"p","barrier":36,"mainSym":"Si","mainA":30,"label":"⁷Li + ²⁴Mg → ³⁰Si + p","rounds":2,"rareMisses":1,"target":4,"q":18.118,"anchorId":"p","altChannel":"alpha","altLabel":"⁷Li + ²⁴Mg → ²⁷Al + ⁴He","altMainSym":"Al","altMainA":27},{"id":"atlas_li_al","a":"Li","b":"Al","A1":7,"A2":27,"compound":"S","compoundA":34,"category":"competing","channel":"alpha","barrier":39,"mainSym":"Si","mainA":30,"label":"⁷Li + ²⁷Al → ³⁰Si + ⁴He","rounds":1,"rareMisses":1,"target":4,"q":19.718,"anchorId":"s","altChannel":"p","altLabel":"⁷Li + ²⁷Al → ³³P + p","altMainSym":"P","altMainA":33},{"id":"atlas_li_si","a":"Li","b":"Si","A1":7,"A2":28,"compound":"Cl","compoundA":35,"category":"competing","channel":"p","barrier":42,"mainSym":"S","mainA":34,"label":"⁷Li + ²⁸Si → ³⁴S + p","rounds":1,"rareMisses":1,"target":4,"q":16.057,"anchorId":"cl","altChannel":"alpha","altLabel":"⁷Li + ²⁸Si → ³¹P + ⁴He","altMainSym":"P","altMainA":31},{"id":"atlas_li_p","a":"Li","b":"P","A1":7,"A2":31,"compound":"Ar","compoundA":38,"category":"fragment","channel":"alpha","barrier":45,"mainSym":"S","mainA":34,"label":"⁷Li + ³¹P → ³⁴S + ⁴He","rounds":3,"rareMisses":1,"target":3,"q":17.973,"anchorId":"ar"},{"id":"atlas_li_s","a":"Li","b":"S","A1":7,"A2":32,"compound":"K","compoundA":39,"category":"competing","channel":"p","barrier":48,"mainSym":"Ar","mainA":38,"label":"⁷Li + ³²S → ³⁸Ar + p","rounds":3,"rareMisses":1,"target":4,"q":16.317,"anchorId":"k","altChannel":"alpha","altLabel":"⁷Li + ³²S → ³⁵Cl + ⁴He","altMainSym":"Cl","altMainA":35},{"id":"atlas_li_cl","a":"Li","b":"Cl","A1":7,"A2":35,"compound":"Ca","compoundA":42,"category":"fragment","channel":"alpha","barrier":51,"mainSym":"Ar","mainA":38,"label":"⁷Li + ³⁵Cl → ³⁸Ar + ⁴He","rounds":2,"rareMisses":1,"target":3,"q":18.183,"anchorId":"ca"},{"id":"atlas_li_ar","a":"Li","b":"Ar","A1":7,"A2":40,"compound":"Sc","compoundA":47,"category":"competing","channel":"p","barrier":54,"mainSym":"Ca","mainA":46,"label":"⁷Li + ⁴⁰Ar → ⁴⁶Ca + p","rounds":3,"rareMisses":1,"target":4,"q":15.718,"anchorId":"sc","altChannel":"alpha","altLabel":"⁷Li + ⁴⁰Ar → ⁴³K + ⁴He","altMainSym":"K","altMainA":43},{"id":"atlas_li_k","a":"Li","b":"K","A1":7,"A2":39,"compound":"Ti","compoundA":46,"category":"competing","channel":"alpha","barrier":57,"mainSym":"Ca","mainA":42,"label":"⁷Li + ³⁹K → ⁴²Ca + ⁴He","rounds":1,"rareMisses":1,"target":4,"q":17.222,"anchorId":"ti","altChannel":"p","altLabel":"⁷Li + ³⁹K → ⁴⁵Sc + p","altMainSym":"Sc","altMainA":45},{"id":"atlas_li_ca","a":"Li","b":"Ca","A1":7,"A2":40,"compound":"V","compoundA":47,"category":"competing","channel":"p","barrier":60,"mainSym":"Ti","mainA":46,"label":"⁷Li + ⁴⁰Ca → ⁴⁶Ti + p","rounds":1,"rareMisses":1,"target":4,"q":16.9,"anchorId":"v","altChannel":"alpha","altLabel":"⁷Li + ⁴⁰Ca → ⁴³Sc + ⁴He","altMainSym":"Sc","altMainA":43},{"id":"atlas_li_sc","a":"Li","b":"Sc","A1":7,"A2":45,"compound":"Cr","compoundA":52,"category":"competing","channel":"alpha","barrier":63,"mainSym":"Ti","mainA":48,"label":"⁷Li + ⁴⁵Sc → ⁴⁸Ti + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":19.903,"anchorId":"cr","altChannel":"p","altLabel":"⁷Li + ⁴⁵Sc → ⁵¹V + p","altMainSym":"V","altMainA":51},{"id":"atlas_li_ti","a":"Li","b":"Ti","A1":7,"A2":48,"compound":"Mn","compoundA":55,"category":"competing","channel":"alpha","barrier":66,"mainSym":"V","mainA":51,"label":"⁷Li + ⁴⁸Ti → ⁵¹V + ⁴He","rounds":1,"rareMisses":1,"target":4,"q":16.193,"anchorId":"mn","altChannel":"p","altLabel":"⁷Li + ⁴⁸Ti → ⁵⁴Cr + p","altMainSym":"Cr","altMainA":54},{"id":"atlas_li_v","a":"Li","b":"V","A1":7,"A2":51,"compound":"Fe","compoundA":58,"category":"competing","channel":"alpha","barrier":69,"mainSym":"Cr","mainA":54,"label":"⁷Li + ⁵¹V → ⁵⁴Cr + ⁴He","rounds":3,"rareMisses":1,"target":4,"q":17.213,"anchorId":"fe","altChannel":"n","altLabel":"⁷Li + ⁵¹V → ⁵⁷Fe + n","altMainSym":"Fe","altMainA":57},{"id":"atlas_be_be","a":"Be","b":"Be","A1":9,"A2":9,"compound":"O","compoundA":18,"category":"fragment","channel":"alpha","barrier":16,"mainSym":"C","mainA":14,"label":"⁹Be + ⁹Be → ¹⁴C + ⁴He","rounds":1,"rareMisses":1,"target":3,"q":17.252,"anchorId":"o"},{"id":"atlas_be_b","a":"Be","b":"B","A1":9,"A2":11,"compound":"F","compoundA":20,"category":"fragment","channel":"alpha","barrier":20,"mainSym":"N","mainA":16,"label":"⁹Be + ¹¹B → ¹⁶N + ⁴He","rounds":2,"rareMisses":2,"target":3,"q":11.907,"anchorId":"nu_f"},{"id":"atlas_be_c","a":"Be","b":"C","A1":9,"A2":12,"compound":"Ne","compoundA":21,"category":"fragment","channel":"alpha","barrier":24,"mainSym":"O","mainA":17,"label":"⁹Be + ¹²C → ¹⁷O + ⁴He","rounds":2,"rareMisses":2,"target":3,"q":9.732,"anchorId":"ne"},{"id":"atlas_be_n","a":"Be","b":"N","A1":9,"A2":14,"compound":"Na","compoundA":23,"category":"fragment","channel":"alpha","barrier":28,"mainSym":"F","mainA":19,"label":"⁹Be + ¹⁴N → ¹⁹F + ⁴He","rounds":3,"rareMisses":1,"target":3,"q":13.274,"anchorId":"na"},{"id":"atlas_be_o","a":"Be","b":"O","A1":9,"A2":16,"compound":"Mg","compoundA":25,"category":"fragment","channel":"alpha","barrier":32,"mainSym":"Ne","mainA":21,"label":"⁹Be + ¹⁶O → ²¹Ne + ⁴He","rounds":1,"rareMisses":2,"target":3,"q":9.918,"anchorId":"mg"},{"id":"atlas_be_f","a":"Be","b":"F","A1":9,"A2":19,"compound":"Al","compoundA":28,"category":"competing","channel":"n","barrier":36,"mainSym":"Al","mainA":27,"label":"⁹Be + ¹⁹F → ²⁷Al + n","rounds":3,"rareMisses":2,"target":4,"q":18.987,"anchorId":"al","altChannel":"p","altLabel":"⁹Be + ¹⁹F → ²⁷Mg + p","altMainSym":"Mg","altMainA":27},{"id":"atlas_be_ne","a":"Be","b":"Ne","A1":9,"A2":20,"compound":"Si","compoundA":29,"category":"competing","channel":"n","barrier":40,"mainSym":"Si","mainA":28,"label":"⁹Be + ²⁰Ne → ²⁸Si + n","rounds":3,"rareMisses":2,"target":4,"q":17.728,"anchorId":"si","altChannel":"alpha","altLabel":"⁹Be + ²⁰Ne → ²⁵Mg + ⁴He","altMainSym":"Mg","altMainA":25},{"id":"atlas_be_na","a":"Be","b":"Na","A1":9,"A2":23,"compound":"P","compoundA":32,"category":"competing","channel":"n","barrier":44,"mainSym":"P","mainA":31,"label":"⁹Be + ²³Na → ³¹P + n","rounds":2,"rareMisses":2,"target":4,"q":18.188,"anchorId":"p","altChannel":"p","altLabel":"⁹Be + ²³Na → ³¹Si + p","altMainSym":"Si","altMainA":31},{"id":"atlas_be_mg","a":"Be","b":"Mg","A1":9,"A2":24,"compound":"S","compoundA":33,"category":"competing","channel":"alpha","barrier":48,"mainSym":"Si","mainA":29,"label":"⁹Be + ²⁴Mg → ²⁹Si + ⁴He","rounds":2,"rareMisses":2,"target":4,"q":16.885,"anchorId":"s","altChannel":"n","altLabel":"⁹Be + ²⁴Mg → ³²S + n","altMainSym":"S","altMainA":32},{"id":"atlas_be_al","a":"Be","b":"Al","A1":9,"A2":27,"compound":"Cl","compoundA":36,"category":"competing","channel":"alpha","barrier":52,"mainSym":"P","mainA":32,"label":"⁹Be + ²⁷Al → ³²P + ⁴He","rounds":1,"rareMisses":2,"target":4,"q":16.032,"anchorId":"cl","altChannel":"p","altLabel":"⁹Be + ²⁷Al → ³⁵S + p","altMainSym":"S","altMainA":35},{"id":"atlas_be_si","a":"Be","b":"Si","A1":9,"A2":28,"compound":"Ar","compoundA":37,"category":"competing","channel":"alpha","barrier":56,"mainSym":"S","mainA":33,"label":"⁹Be + ²⁸Si → ³³S + ⁴He","rounds":1,"rareMisses":2,"target":4,"q":14.017,"anchorId":"ar","altChannel":"p","altLabel":"⁹Be + ²⁸Si → ³⁶Cl + p","altMainSym":"Cl","altMainA":36},{"id":"atlas_be_p","a":"Be","b":"P","A1":9,"A2":31,"compound":"K","compoundA":40,"category":"competing","channel":"alpha","barrier":60,"mainSym":"Cl","mainA":36,"label":"⁹Be + ³¹P → ³⁶Cl + ⁴He","rounds":3,"rareMisses":2,"target":4,"q":14.005,"anchorId":"k","altChannel":"p","altLabel":"⁹Be + ³¹P → ³⁹Ar + p","altMainSym":"Ar","altMainA":39},{"id":"atlas_be_s","a":"Be","b":"S","A1":9,"A2":32,"compound":"Ca","compoundA":41,"category":"competing","channel":"alpha","barrier":64,"mainSym":"Ar","mainA":37,"label":"⁹Be + ³²S → ³⁷Ar + ⁴He","rounds":3,"rareMisses":2,"target":4,"q":13.856,"anchorId":"ca","altChannel":"n","altLabel":"⁹Be + ³²S → ⁴⁰Ca + n","altMainSym":"Ca","altMainA":40},{"id":"atlas_be_cl","a":"Be","b":"Cl","A1":9,"A2":35,"compound":"Sc","compoundA":44,"category":"competing","channel":"p","barrier":68,"mainSym":"Ca","mainA":43,"label":"⁹Be + ³⁵Cl → ⁴³Ca + p","rounds":2,"rareMisses":2,"target":4,"q":13.455,"anchorId":"sc","altChannel":"alpha","altLabel":"⁹Be + ³⁵Cl → ⁴⁰K + ⁴He","altMainSym":"K","altMainA":40},{"id":"atlas_be_ar","a":"Be","b":"Ar","A1":9,"A2":40,"compound":"Ti","compoundA":49,"category":"competing","channel":"n","barrier":72,"mainSym":"Ti","mainA":48,"label":"⁹Be + ⁴⁰Ar → ⁴⁸Ti + n","rounds":3,"rareMisses":2,"target":4,"q":16.73,"anchorId":"ti","altChannel":"alpha","altLabel":"⁹Be + ⁴⁰Ar → ⁴⁵Ca + ⁴He","altMainSym":"Ca","altMainA":45},{"id":"atlas_be_k","a":"Be","b":"K","A1":9,"A2":39,"compound":"V","compoundA":48,"category":"competing","channel":"p","barrier":76,"mainSym":"Ti","mainA":47,"label":"⁹Be + ³⁹K → ⁴⁷Ti + p","rounds":1,"rareMisses":2,"target":4,"q":15.19,"anchorId":"v","altChannel":"alpha","altLabel":"⁹Be + ³⁹K → ⁴⁴Sc + ⁴He","altMainSym":"Sc","altMainA":44},{"id":"atlas_be_ca","a":"Be","b":"Ca","A1":9,"A2":40,"compound":"Cr","compoundA":49,"category":"competing","channel":"p","barrier":80,"mainSym":"V","mainA":48,"label":"⁹Be + ⁴⁰Ca → ⁴⁸V + p","rounds":1,"rareMisses":2,"target":4,"q":13.691,"anchorId":"cr","altChannel":"alpha","altLabel":"⁹Be + ⁴⁰Ca → ⁴⁵Ti + ⁴He","altMainSym":"Ti","altMainA":45},{"id":"atlas_be_sc","a":"Be","b":"Sc","A1":9,"A2":45,"compound":"Mn","compoundA":54,"category":"competing","channel":"p","barrier":84,"mainSym":"Cr","mainA":53,"label":"⁹Be + ⁴⁵Sc → ⁵³Cr + p","rounds":2,"rareMisses":2,"target":4,"q":18.275,"anchorId":"mn","altChannel":"alpha","altLabel":"⁹Be + ⁴⁵Sc → ⁵⁰V + ⁴He","altMainSym":"V","altMainA":50},{"id":"atlas_be_ti","a":"Be","b":"Ti","A1":9,"A2":48,"compound":"Fe","compoundA":57,"category":"competing","channel":"alpha","barrier":88,"mainSym":"Cr","mainA":53,"label":"⁹Be + ⁴⁸Ti → ⁵³Cr + ⁴He","rounds":1,"rareMisses":2,"target":4,"q":15.718,"anchorId":"fe","altChannel":"n","altLabel":"⁹Be + ⁴⁸Ti → ⁵⁶Fe + n","altMainSym":"Fe","altMainA":56},{"id":"atlas_b_b","a":"B","b":"B","A1":11,"A2":11,"compound":"Ne","compoundA":22,"category":"fragment","channel":"alpha","barrier":25,"mainSym":"O","mainA":18,"label":"¹¹B + ¹¹B → ¹⁸O + ⁴He","rounds":2,"rareMisses":1,"target":3,"q":15.693,"anchorId":"ne"},{"id":"atlas_b_c","a":"B","b":"C","A1":11,"A2":12,"compound":"Na","compoundA":23,"category":"fragment","channel":"alpha","barrier":30,"mainSym":"F","mainA":19,"label":"¹¹B + ¹²C → ¹⁹F + ⁴He","rounds":2,"rareMisses":1,"target":3,"q":7.73,"anchorId":"na"},{"id":"atlas_b_n","a":"B","b":"N","A1":11,"A2":14,"compound":"Mg","compoundA":25,"category":"fragment","channel":"alpha","barrier":35,"mainSym":"Ne","mainA":21,"label":"¹¹B + ¹⁴N → ²¹Ne + ⁴He","rounds":3,"rareMisses":2,"target":3,"q":14.838,"anchorId":"mg"},{"id":"atlas_b_o","a":"B","b":"O","A1":11,"A2":16,"compound":"Al","compoundA":27,"category":"competing","channel":"p","barrier":40,"mainSym":"Mg","mainA":26,"label":"¹¹B + ¹⁶O → ²⁶Mg + p","rounds":1,"rareMisses":1,"target":4,"q":12.856,"anchorId":"al","altChannel":"alpha","altLabel":"¹¹B + ¹⁶O → ²³Na + ⁴He","altMainSym":"Na","altMainA":23},{"id":"atlas_b_f","a":"B","b":"F","A1":11,"A2":19,"compound":"Si","compoundA":30,"category":"competing","channel":"n","barrier":45,"mainSym":"Si","mainA":29,"label":"¹¹B + ¹⁹F → ²⁹Si + n","rounds":3,"rareMisses":1,"target":4,"q":21.004,"anchorId":"si","altChannel":"alpha","altLabel":"¹¹B + ¹⁹F → ²⁶Mg + ⁴He","altMainSym":"Mg","altMainA":26},{"id":"atlas_b_ne","a":"B","b":"Ne","A1":11,"A2":20,"compound":"P","compoundA":31,"category":"competing","channel":"p","barrier":50,"mainSym":"Si","mainA":30,"label":"¹¹B + ²⁰Ne → ³⁰Si + p","rounds":3,"rareMisses":1,"target":4,"q":18.77,"anchorId":"p","altChannel":"alpha","altLabel":"¹¹B + ²⁰Ne → ²⁷Al + ⁴He","altMainSym":"Al","altMainA":27},{"id":"atlas_b_na","a":"B","b":"Na","A1":11,"A2":23,"compound":"S","compoundA":34,"category":"competing","channel":"alpha","barrier":55,"mainSym":"Si","mainA":30,"label":"¹¹B + ²³Na → ³⁰Si + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":21.146,"anchorId":"s","altChannel":"p","altLabel":"¹¹B + ²³Na → ³³P + p","altMainSym":"P","altMainA":33},{"id":"atlas_b_mg","a":"B","b":"Mg","A1":11,"A2":24,"compound":"Cl","compoundA":35,"category":"competing","channel":"p","barrier":60,"mainSym":"S","mainA":34,"label":"¹¹B + ²⁴Mg → ³⁴S + p","rounds":2,"rareMisses":1,"target":4,"q":17.377,"anchorId":"cl","altChannel":"alpha","altLabel":"¹¹B + ²⁴Mg → ³¹P + ⁴He","altMainSym":"P","altMainA":31},{"id":"atlas_b_al","a":"B","b":"Al","A1":11,"A2":27,"compound":"Ar","compoundA":38,"category":"fragment","channel":"alpha","barrier":65,"mainSym":"S","mainA":34,"label":"¹¹B + ²⁷Al → ³⁴S + ⁴He","rounds":1,"rareMisses":1,"target":3,"q":18.978,"anchorId":"ar"},{"id":"atlas_b_si","a":"B","b":"Si","A1":11,"A2":28,"compound":"K","compoundA":39,"category":"competing","channel":"p","barrier":70,"mainSym":"Ar","mainA":38,"label":"¹¹B + ²⁸Si → ³⁸Ar + p","rounds":1,"rareMisses":1,"target":4,"q":14.601,"anchorId":"k","altChannel":"alpha","altLabel":"¹¹B + ²⁸Si → ³⁵Cl + ⁴He","altMainSym":"Cl","altMainA":35},{"id":"atlas_b_p","a":"B","b":"P","A1":11,"A2":31,"compound":"Ca","compoundA":42,"category":"fragment","channel":"alpha","barrier":75,"mainSym":"Ar","mainA":38,"label":"¹¹B + ³¹P → ³⁸Ar + ⁴He","rounds":3,"rareMisses":1,"target":3,"q":16.517,"anchorId":"ca"},{"id":"atlas_b_s","a":"B","b":"S","A1":11,"A2":32,"compound":"Sc","compoundA":43,"category":"competing","channel":"alpha","barrier":80,"mainSym":"K","mainA":39,"label":"¹¹B + ³²S → ³⁹K + ⁴He","rounds":3,"rareMisses":1,"target":4,"q":14.034,"anchorId":"sc","altChannel":"p","altLabel":"¹¹B + ³²S → ⁴²Ca + p","altMainSym":"Ca","altMainA":42},{"id":"atlas_b_cl","a":"B","b":"Cl","A1":11,"A2":35,"compound":"Ti","compoundA":46,"category":"competing","channel":"alpha","barrier":85,"mainSym":"Ca","mainA":42,"label":"¹¹B + ³⁵Cl → ⁴²Ca + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":15.777,"anchorId":"ti","altChannel":"p","altLabel":"¹¹B + ³⁵Cl → ⁴⁵Sc + p","altMainSym":"Sc","altMainA":45},{"id":"atlas_b_ar","a":"B","b":"Ar","A1":11,"A2":40,"compound":"V","compoundA":51,"category":"competing","channel":"p","barrier":90,"mainSym":"Ti","mainA":50,"label":"¹¹B + ⁴⁰Ar → ⁵⁰Ti + p","rounds":3,"rareMisses":1,"target":4,"q":17.771,"anchorId":"v","altChannel":"alpha","altLabel":"¹¹B + ⁴⁰Ar → ⁴⁷Sc + ⁴He","altMainSym":"Sc","altMainA":47},{"id":"atlas_b_k","a":"B","b":"K","A1":11,"A2":39,"compound":"Cr","compoundA":50,"category":"competing","channel":"alpha","barrier":95,"mainSym":"Ti","mainA":46,"label":"¹¹B + ³⁹K → ⁴⁶Ti + ⁴He","rounds":1,"rareMisses":1,"target":4,"q":16.563,"anchorId":"cr","altChannel":"p","altLabel":"¹¹B + ³⁹K → ⁴⁹V + p","altMainSym":"V","altMainA":49},{"id":"atlas_b_ca","a":"B","b":"Ca","A1":11,"A2":40,"compound":"Mn","compoundA":51,"category":"competing","channel":"p","barrier":100,"mainSym":"Cr","mainA":50,"label":"¹¹B + ⁴⁰Ca → ⁵⁰Cr + p","rounds":1,"rareMisses":1,"target":4,"q":16.794,"anchorId":"mn","altChannel":"alpha","altLabel":"¹¹B + ⁴⁰Ca → ⁴⁷V + ⁴He","altMainSym":"V","altMainA":47},{"id":"atlas_b_sc","a":"B","b":"Sc","A1":11,"A2":45,"compound":"Fe","compoundA":56,"category":"competing","channel":"alpha","barrier":105,"mainSym":"Cr","mainA":52,"label":"¹¹B + ⁴⁵Sc → ⁵²Cr + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":20.59,"anchorId":"fe","altChannel":"p","altLabel":"¹¹B + ⁴⁵Sc → ⁵⁵Mn + p","altMainSym":"Mn","altMainA":55},{"id":"atlas_c_n","a":"C","b":"N","A1":12,"A2":14,"compound":"Al","compoundA":26,"category":"competing","channel":"p","barrier":42,"mainSym":"Mg","mainA":25,"label":"¹²C + ¹⁴N → ²⁵Mg + p","rounds":2,"rareMisses":2,"target":4,"q":8.767,"anchorId":"al","altChannel":"alpha","altLabel":"¹²C + ¹⁴N → ²²Na + ⁴He","altMainSym":"Na","altMainA":22},{"id":"atlas_c_f","a":"C","b":"F","A1":12,"A2":19,"compound":"P","compoundA":31,"category":"competing","channel":"p","barrier":54,"mainSym":"Si","mainA":30,"label":"¹²C + ¹⁹F → ³⁰Si + p","rounds":2,"rareMisses":1,"target":4,"q":15.657,"anchorId":"p","altChannel":"alpha","altLabel":"¹²C + ¹⁹F → ²⁷Al + ⁴He","altMainSym":"Al","altMainA":27},{"id":"atlas_c_ne","a":"C","b":"Ne","A1":12,"A2":20,"compound":"S","compoundA":32,"category":"competing","channel":"alpha","barrier":60,"mainSym":"Si","mainA":28,"label":"¹²C + ²⁰Ne → ²⁸Si + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":12.026,"anchorId":"s","altChannel":"p","altLabel":"¹²C + ²⁰Ne → ³¹P + p","altMainSym":"P","altMainA":31},{"id":"atlas_c_na","a":"C","b":"Na","A1":12,"A2":23,"compound":"Cl","compoundA":35,"category":"competing","channel":"p","barrier":66,"mainSym":"S","mainA":34,"label":"¹²C + ²³Na → ³⁴S + p","rounds":1,"rareMisses":1,"target":4,"q":13.113,"anchorId":"cl","altChannel":"alpha","altLabel":"¹²C + ²³Na → ³¹P + ⁴He","altMainSym":"P","altMainA":31},{"id":"atlas_c_mg","a":"C","b":"Mg","A1":12,"A2":24,"compound":"Ar","compoundA":36,"category":"competing","channel":"alpha","barrier":72,"mainSym":"S","mainA":32,"label":"¹²C + ²⁴Mg → ³²S + ⁴He","rounds":1,"rareMisses":1,"target":4,"q":9.657,"anchorId":"ar","altChannel":"p","altLabel":"¹²C + ²⁴Mg → ³⁵Cl + p","altMainSym":"Cl","altMainA":35},{"id":"atlas_c_al","a":"C","b":"Al","A1":12,"A2":27,"compound":"K","compoundA":39,"category":"competing","channel":"p","barrier":78,"mainSym":"Ar","mainA":38,"label":"¹²C + ²⁷Al → ³⁸Ar + p","rounds":3,"rareMisses":1,"target":4,"q":10.229,"anchorId":"k","altChannel":"alpha","altLabel":"¹²C + ²⁷Al → ³⁵Cl + ⁴He","altMainSym":"Cl","altMainA":35},{"id":"atlas_c_si","a":"C","b":"Si","A1":12,"A2":28,"compound":"Ca","compoundA":40,"category":"competing","channel":"alpha","barrier":84,"mainSym":"Ar","mainA":36,"label":"¹²C + ²⁸Si → ³⁶Ar + ⁴He","rounds":3,"rareMisses":1,"target":4,"q":6.314,"anchorId":"ca","altChannel":"p","altLabel":"¹²C + ²⁸Si → ³⁹K + p","altMainSym":"K","altMainA":39},{"id":"atlas_c_p","a":"C","b":"P","A1":12,"A2":31,"compound":"Sc","compoundA":43,"category":"competing","channel":"alpha","barrier":90,"mainSym":"K","mainA":39,"label":"¹²C + ³¹P → ³⁹K + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":6.942,"anchorId":"sc","altChannel":"p","altLabel":"¹²C + ³¹P → ⁴²Ca + p","altMainSym":"Ca","altMainA":42},{"id":"atlas_c_s","a":"C","b":"S","A1":12,"A2":32,"compound":"Ti","compoundA":44,"category":"fragment","channel":"alpha","barrier":96,"mainSym":"Ca","mainA":40,"label":"¹²C + ³²S → ⁴⁰Ca + ⁴He","rounds":2,"rareMisses":1,"target":3,"q":6.406,"anchorId":"ti"},{"id":"atlas_c_cl","a":"C","b":"Cl","A1":12,"A2":35,"compound":"V","compoundA":47,"category":"competing","channel":"p","barrier":102,"mainSym":"Ti","mainA":46,"label":"¹²C + ³⁵Cl → ⁴⁶Ti + p","rounds":1,"rareMisses":1,"target":4,"q":7.825,"anchorId":"v","altChannel":"alpha","altLabel":"¹²C + ³⁵Cl → ⁴³Sc + ⁴He","altMainSym":"Sc","altMainA":43},{"id":"atlas_c_ar","a":"C","b":"Ar","A1":12,"A2":40,"compound":"Cr","compoundA":52,"category":"competing","channel":"alpha","barrier":108,"mainSym":"Ti","mainA":48,"label":"¹²C + ⁴⁰Ar → ⁴⁸Ti + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":11.028,"anchorId":"cr","altChannel":"p","altLabel":"¹²C + ⁴⁰Ar → ⁵¹V + p","altMainSym":"V","altMainA":51},{"id":"atlas_c_k","a":"C","b":"K","A1":12,"A2":39,"compound":"Mn","compoundA":51,"category":"competing","channel":"p","barrier":114,"mainSym":"Cr","mainA":50,"label":"¹²C + ³⁹K → ⁵⁰Cr + p","rounds":3,"rareMisses":1,"target":4,"q":9.166,"anchorId":"mn","altChannel":"alpha","altLabel":"¹²C + ³⁹K → ⁴⁷V + ⁴He","altMainSym":"V","altMainA":47},{"id":"atlas_c_ca","a":"C","b":"Ca","A1":12,"A2":40,"compound":"Fe","compoundA":52,"category":"competing","channel":"p","barrier":120,"mainSym":"Mn","mainA":51,"label":"¹²C + ⁴⁰Ca → ⁵¹Mn + p","rounds":3,"rareMisses":1,"target":4,"q":6.108,"anchorId":"fe","altChannel":"alpha","altLabel":"¹²C + ⁴⁰Ca → ⁴⁸Cr + ⁴He","altMainSym":"Cr","altMainA":48},{"id":"atlas_n_n","a":"N","b":"N","A1":14,"A2":14,"compound":"Si","compoundA":28,"category":"competing","channel":"alpha","barrier":49,"mainSym":"Mg","mainA":24,"label":"¹⁴N + ¹⁴N → ²⁴Mg + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":17.235,"anchorId":"si","altChannel":"p","altLabel":"¹⁴N + ¹⁴N → ²⁷Al + p","altMainSym":"Al","altMainA":27},{"id":"atlas_n_o","a":"N","b":"O","A1":14,"A2":16,"compound":"P","compoundA":30,"category":"competing","channel":"p","barrier":56,"mainSym":"Si","mainA":29,"label":"¹⁴N + ¹⁶O → ²⁹Si + p","rounds":3,"rareMisses":2,"target":4,"q":12.733,"anchorId":"p","altChannel":"alpha","altLabel":"¹⁴N + ¹⁶O → ²⁶Al + ⁴He","altMainSym":"Al","altMainA":26},{"id":"atlas_n_f","a":"N","b":"F","A1":14,"A2":19,"compound":"S","compoundA":33,"category":"competing","channel":"alpha","barrier":63,"mainSym":"Si","mainA":29,"label":"¹⁴N + ¹⁹F → ²⁹Si + ⁴He","rounds":2,"rareMisses":2,"target":4,"q":20.846,"anchorId":"s","altChannel":"n","altLabel":"¹⁴N + ¹⁹F → ³²S + n","altMainSym":"S","altMainA":32},{"id":"atlas_n_ne","a":"N","b":"Ne","A1":14,"A2":20,"compound":"Cl","compoundA":34,"category":"competing","channel":"p","barrier":70,"mainSym":"S","mainA":33,"label":"¹⁴N + ²⁰Ne → ³³S + p","rounds":2,"rareMisses":2,"target":4,"q":15.118,"anchorId":"cl","altChannel":"alpha","altLabel":"¹⁴N + ²⁰Ne → ³⁰P + ⁴He","altMainSym":"P","altMainA":30},{"id":"atlas_n_na","a":"N","b":"Na","A1":14,"A2":23,"compound":"Ar","compoundA":37,"category":"competing","channel":"alpha","barrier":77,"mainSym":"S","mainA":33,"label":"¹⁴N + ²³Na → ³³S + ⁴He","rounds":1,"rareMisses":2,"target":4,"q":17.495,"anchorId":"ar","altChannel":"p","altLabel":"¹⁴N + ²³Na → ³⁶Cl + p","altMainSym":"Cl","altMainA":36},{"id":"atlas_n_mg","a":"N","b":"Mg","A1":14,"A2":24,"compound":"K","compoundA":38,"category":"competing","channel":"p","barrier":84,"mainSym":"Ar","mainA":37,"label":"¹⁴N + ²⁴Mg → ³⁷Ar + p","rounds":1,"rareMisses":2,"target":4,"q":12.589,"anchorId":"k","altChannel":"alpha","altLabel":"¹⁴N + ²⁴Mg → ³⁴Cl + ⁴He","altMainSym":"Cl","altMainA":34},{"id":"atlas_n_al","a":"N","b":"Al","A1":14,"A2":27,"compound":"Ca","compoundA":41,"category":"competing","channel":"alpha","barrier":91,"mainSym":"Ar","mainA":37,"label":"¹⁴N + ²⁷Al → ³⁷Ar + ⁴He","rounds":3,"rareMisses":2,"target":4,"q":14.189,"anchorId":"ca","altChannel":"n","altLabel":"¹⁴N + ²⁷Al → ⁴⁰Ca + n","altMainSym":"Ca","altMainA":40},{"id":"atlas_n_si","a":"N","b":"Si","A1":14,"A2":28,"compound":"Sc","compoundA":42,"category":"competing","channel":"p","barrier":98,"mainSym":"Ca","mainA":41,"label":"¹⁴N + ²⁸Si → ⁴¹Ca + p","rounds":3,"rareMisses":2,"target":4,"q":9.22,"anchorId":"sc","altChannel":"alpha","altLabel":"¹⁴N + ²⁸Si → ³⁸K + ⁴He","altMainSym":"K","altMainA":38},{"id":"atlas_n_p","a":"N","b":"P","A1":14,"A2":31,"compound":"Ti","compoundA":45,"category":"competing","channel":"alpha","barrier":105,"mainSym":"Ca","mainA":41,"label":"¹⁴N + ³¹P → ⁴¹Ca + ⁴He","rounds":2,"rareMisses":2,"target":4,"q":11.136,"anchorId":"ti","altChannel":"p","altLabel":"¹⁴N + ³¹P → ⁴⁴Sc + p","altMainSym":"Sc","altMainA":44},{"id":"atlas_n_s","a":"N","b":"S","A1":14,"A2":32,"compound":"V","compoundA":46,"category":"competing","channel":"p","barrier":112,"mainSym":"Ti","mainA":45,"label":"¹⁴N + ³²S → ⁴⁵Ti + p","rounds":2,"rareMisses":2,"target":4,"q":8.569,"anchorId":"v","altChannel":"alpha","altLabel":"¹⁴N + ³²S → ⁴²Sc + ⁴He","altMainSym":"Sc","altMainA":42},{"id":"atlas_n_cl","a":"N","b":"Cl","A1":14,"A2":35,"compound":"Cr","compoundA":49,"category":"competing","channel":"p","barrier":119,"mainSym":"V","mainA":48,"label":"¹⁴N + ³⁵Cl → ⁴⁸V + p","rounds":1,"rareMisses":2,"target":4,"q":11.039,"anchorId":"cr","altChannel":"alpha","altLabel":"¹⁴N + ³⁵Cl → ⁴⁵Ti + ⁴He","altMainSym":"Ti","altMainA":45},{"id":"atlas_n_ar","a":"N","b":"Ar","A1":14,"A2":40,"compound":"Mn","compoundA":54,"category":"competing","channel":"p","barrier":126,"mainSym":"Cr","mainA":53,"label":"¹⁴N + ⁴⁰Ar → ⁵³Cr + p","rounds":2,"rareMisses":2,"target":4,"q":15.822,"anchorId":"mn","altChannel":"alpha","altLabel":"¹⁴N + ⁴⁰Ar → ⁵⁰V + ⁴He","altMainSym":"V","altMainA":50},{"id":"atlas_n_k","a":"N","b":"K","A1":14,"A2":39,"compound":"Fe","compoundA":53,"category":"competing","channel":"p","barrier":133,"mainSym":"Mn","mainA":52,"label":"¹⁴N + ³⁹K → ⁵²Mn + p","rounds":3,"rareMisses":2,"target":4,"q":12.475,"anchorId":"fe","altChannel":"alpha","altLabel":"¹⁴N + ³⁹K → ⁴⁹Cr + ⁴He","altMainSym":"Cr","altMainA":49},{"id":"atlas_o_f","a":"O","b":"F","A1":16,"A2":19,"compound":"Cl","compoundA":35,"category":"competing","channel":"p","barrier":72,"mainSym":"S","mainA":34,"label":"¹⁶O + ¹⁹F → ³⁴S + p","rounds":2,"rareMisses":1,"target":4,"q":16.418,"anchorId":"cl","altChannel":"alpha","altLabel":"¹⁶O + ¹⁹F → ³¹P + ⁴He","altMainSym":"P","altMainA":31},{"id":"atlas_o_ne","a":"O","b":"Ne","A1":16,"A2":20,"compound":"Ar","compoundA":36,"category":"competing","channel":"alpha","barrier":80,"mainSym":"S","mainA":32,"label":"¹⁶O + ²⁰Ne → ³²S + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":11.812,"anchorId":"ar","altChannel":"p","altLabel":"¹⁶O + ²⁰Ne → ³⁵Cl + p","altMainSym":"Cl","altMainA":35},{"id":"atlas_o_na","a":"O","b":"Na","A1":16,"A2":23,"compound":"K","compoundA":39,"category":"competing","channel":"p","barrier":88,"mainSym":"Ar","mainA":38,"label":"¹⁶O + ²³Na → ³⁸Ar + p","rounds":1,"rareMisses":1,"target":4,"q":13.159,"anchorId":"k","altChannel":"alpha","altLabel":"¹⁶O + ²³Na → ³⁵Cl + ⁴He","altMainSym":"Cl","altMainA":35},{"id":"atlas_o_mg","a":"O","b":"Mg","A1":16,"A2":24,"compound":"Ca","compoundA":40,"category":"competing","channel":"alpha","barrier":96,"mainSym":"Ar","mainA":36,"label":"¹⁶O + ²⁴Mg → ³⁶Ar + ⁴He","rounds":1,"rareMisses":1,"target":4,"q":9.136,"anchorId":"ca","altChannel":"p","altLabel":"¹⁶O + ²⁴Mg → ³⁹K + p","altMainSym":"K","altMainA":39},{"id":"atlas_o_al","a":"O","b":"Al","A1":16,"A2":27,"compound":"Sc","compoundA":43,"category":"competing","channel":"alpha","barrier":104,"mainSym":"K","mainA":39,"label":"¹⁶O + ²⁷Al → ³⁹K + ⁴He","rounds":3,"rareMisses":1,"target":4,"q":9.448,"anchorId":"sc","altChannel":"p","altLabel":"¹⁶O + ²⁷Al → ⁴²Ca + p","altMainSym":"Ca","altMainA":42},{"id":"atlas_o_si","a":"O","b":"Si","A1":16,"A2":28,"compound":"Ti","compoundA":44,"category":"fragment","channel":"alpha","barrier":112,"mainSym":"Ca","mainA":40,"label":"¹⁶O + ²⁸Si → ⁴⁰Ca + ⁴He","rounds":3,"rareMisses":1,"target":3,"q":6.192,"anchorId":"ti"},{"id":"atlas_o_p","a":"O","b":"P","A1":16,"A2":31,"compound":"V","compoundA":47,"category":"competing","channel":"p","barrier":120,"mainSym":"Ti","mainA":46,"label":"¹⁶O + ³¹P → ⁴⁶Ti + p","rounds":2,"rareMisses":1,"target":4,"q":7.661,"anchorId":"v","altChannel":"alpha","altLabel":"¹⁶O + ³¹P → ⁴³Sc + ⁴He","altMainSym":"Sc","altMainA":43},{"id":"atlas_o_s","a":"O","b":"S","A1":16,"A2":32,"compound":"Cr","compoundA":48,"category":"competing","channel":"alpha","barrier":128,"mainSym":"Ti","mainA":44,"label":"¹⁶O + ³²S → ⁴⁴Ti + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":4.371,"anchorId":"cr","altChannel":"p","altLabel":"¹⁶O + ³²S → ⁴⁷V + p","altMainSym":"V","altMainA":47},{"id":"atlas_o_cl","a":"O","b":"Cl","A1":16,"A2":35,"compound":"Mn","compoundA":51,"category":"inaccessible","channel":"gamma","barrier":136,"mainSym":"Mn","mainA":51,"label":"¹⁶O + ³⁵Cl → ⁵¹Mn + γ","rounds":1,"rareMisses":1,"target":3,"q":14.493,"anchorId":"mn"},{"id":"atlas_o_ar","a":"O","b":"Ar","A1":16,"A2":40,"compound":"Fe","compoundA":56,"category":"inaccessible","channel":"gamma","barrier":144,"mainSym":"Fe","mainA":56,"label":"¹⁶O + ⁴⁰Ar → ⁵⁶Fe + γ","rounds":2,"rareMisses":1,"target":3,"q":20.83,"anchorId":"fe"},{"id":"atlas_f_f","a":"F","b":"F","A1":19,"A2":19,"compound":"Ar","compoundA":38,"category":"fragment","channel":"alpha","barrier":81,"mainSym":"S","mainA":34,"label":"¹⁹F + ¹⁹F → ³⁴S + ⁴He","rounds":3,"rareMisses":1,"target":3,"q":24.532,"anchorId":"ar"},{"id":"atlas_f_ne","a":"F","b":"Ne","A1":19,"A2":20,"compound":"K","compoundA":39,"category":"competing","channel":"p","barrier":90,"mainSym":"Ar","mainA":38,"label":"¹⁹F + ²⁰Ne → ³⁸Ar + p","rounds":3,"rareMisses":1,"target":4,"q":18.896,"anchorId":"k","altChannel":"alpha","altLabel":"¹⁹F + ²⁰Ne → ³⁵Cl + ⁴He","altMainSym":"Cl","altMainA":35},{"id":"atlas_f_na","a":"F","b":"Na","A1":19,"A2":23,"compound":"Ca","compoundA":42,"category":"fragment","channel":"alpha","barrier":99,"mainSym":"Ar","mainA":38,"label":"¹⁹F + ²³Na → ³⁸Ar + ⁴He","rounds":2,"rareMisses":1,"target":3,"q":21.273,"anchorId":"ca"},{"id":"atlas_f_mg","a":"F","b":"Mg","A1":19,"A2":24,"compound":"Sc","compoundA":43,"category":"competing","channel":"alpha","barrier":108,"mainSym":"K","mainA":39,"label":"¹⁹F + ²⁴Mg → ³⁹K + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":15.961,"anchorId":"sc","altChannel":"p","altLabel":"¹⁹F + ²⁴Mg → ⁴²Ca + p","altMainSym":"Ca","altMainA":42},{"id":"atlas_f_al","a":"F","b":"Al","A1":19,"A2":27,"compound":"Ti","compoundA":46,"category":"competing","channel":"alpha","barrier":117,"mainSym":"Ca","mainA":42,"label":"¹⁹F + ²⁷Al → ⁴²Ca + ⁴He","rounds":1,"rareMisses":1,"target":4,"q":17.438,"anchorId":"ti","altChannel":"p","altLabel":"¹⁹F + ²⁷Al → ⁴⁵Sc + p","altMainSym":"Sc","altMainA":45},{"id":"atlas_f_si","a":"F","b":"Si","A1":19,"A2":28,"compound":"V","compoundA":47,"category":"competing","channel":"p","barrier":126,"mainSym":"Ti","mainA":46,"label":"¹⁹F + ²⁸Si → ⁴⁶Ti + p","rounds":1,"rareMisses":1,"target":4,"q":13.859,"anchorId":"v","altChannel":"alpha","altLabel":"¹⁹F + ²⁸Si → ⁴³Sc + ⁴He","altMainSym":"Sc","altMainA":43},{"id":"atlas_f_p","a":"F","b":"P","A1":19,"A2":31,"compound":"Cr","compoundA":50,"category":"inaccessible","channel":"gamma","barrier":135,"mainSym":"Cr","mainA":50,"label":"¹⁹F + ³¹P → ⁵⁰Cr + γ","rounds":3,"rareMisses":1,"target":3,"q":24.334,"anchorId":"cr"},{"id":"atlas_f_s","a":"F","b":"S","A1":19,"A2":32,"compound":"Mn","compoundA":51,"category":"inaccessible","channel":"gamma","barrier":144,"mainSym":"Mn","mainA":51,"label":"¹⁹F + ³²S → ⁵¹Mn + γ","rounds":3,"rareMisses":1,"target":3,"q":20.741,"anchorId":"mn"},{"id":"atlas_f_cl","a":"F","b":"Cl","A1":19,"A2":35,"compound":"Fe","compoundA":54,"category":"inaccessible","channel":"gamma","barrier":153,"mainSym":"Fe","mainA":54,"label":"¹⁹F + ³⁵Cl → ⁵⁴Fe + γ","rounds":2,"rareMisses":1,"target":3,"q":25.754,"anchorId":"fe"},{"id":"atlas_ne_ne","a":"Ne","b":"Ne","A1":20,"A2":20,"compound":"Ca","compoundA":40,"category":"competing","channel":"alpha","barrier":100,"mainSym":"Ar","mainA":36,"label":"²⁰Ne + ²⁰Ne → ³⁶Ar + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":13.723,"anchorId":"ca","altChannel":"p","altLabel":"²⁰Ne + ²⁰Ne → ³⁹K + p","altMainSym":"K","altMainA":39},{"id":"atlas_ne_na","a":"Ne","b":"Na","A1":20,"A2":23,"compound":"Sc","compoundA":43,"category":"competing","channel":"alpha","barrier":110,"mainSym":"K","mainA":39,"label":"²⁰Ne + ²³Na → ³⁹K + ⁴He","rounds":1,"rareMisses":1,"target":4,"q":14.81,"anchorId":"sc","altChannel":"p","altLabel":"²⁰Ne + ²³Na → ⁴²Ca + p","altMainSym":"Ca","altMainA":42},{"id":"atlas_ne_mg","a":"Ne","b":"Mg","A1":20,"A2":24,"compound":"Ti","compoundA":44,"category":"fragment","channel":"alpha","barrier":120,"mainSym":"Ca","mainA":40,"label":"²⁰Ne + ²⁴Mg → ⁴⁰Ca + ⁴He","rounds":1,"rareMisses":1,"target":3,"q":11.446,"anchorId":"ti"},{"id":"atlas_ne_al","a":"Ne","b":"Al","A1":20,"A2":27,"compound":"V","compoundA":47,"category":"competing","channel":"p","barrier":130,"mainSym":"Ti","mainA":46,"label":"²⁰Ne + ²⁷Al → ⁴⁶Ti + p","rounds":3,"rareMisses":1,"target":4,"q":12.6,"anchorId":"v","altChannel":"alpha","altLabel":"²⁰Ne + ²⁷Al → ⁴³Sc + ⁴He","altMainSym":"Sc","altMainA":43},{"id":"atlas_ne_si","a":"Ne","b":"Si","A1":20,"A2":28,"compound":"Cr","compoundA":48,"category":"inaccessible","channel":"gamma","barrier":140,"mainSym":"Cr","mainA":48,"label":"²⁰Ne + ²⁸Si → ⁴⁸Cr + γ","rounds":3,"rareMisses":1,"target":3,"q":14.287,"anchorId":"cr"},{"id":"atlas_ne_p","a":"Ne","b":"P","A1":20,"A2":31,"compound":"Mn","compoundA":51,"category":"inaccessible","channel":"gamma","barrier":150,"mainSym":"Mn","mainA":51,"label":"²⁰Ne + ³¹P → ⁵¹Mn + γ","rounds":2,"rareMisses":1,"target":3,"q":16.761,"anchorId":"mn"},{"id":"atlas_ne_s","a":"Ne","b":"S","A1":20,"A2":32,"compound":"Fe","compoundA":52,"category":"inaccessible","channel":"gamma","barrier":160,"mainSym":"Fe","mainA":52,"label":"²⁰Ne + ³²S → ⁵²Fe + γ","rounds":2,"rareMisses":1,"target":3,"q":15.273,"anchorId":"fe"},{"id":"atlas_na_na","a":"Na","b":"Na","A1":23,"A2":23,"compound":"Ti","compoundA":46,"category":"competing","channel":"alpha","barrier":121,"mainSym":"Ca","mainA":42,"label":"²³Na + ²³Na → ⁴²Ca + ⁴He","rounds":2,"rareMisses":1,"target":4,"q":17.063,"anchorId":"ti","altChannel":"p","altLabel":"²³Na + ²³Na → ⁴⁵Sc + p","altMainSym":"Sc","altMainA":45},{"id":"atlas_na_mg","a":"Na","b":"Mg","A1":23,"A2":24,"compound":"V","compoundA":47,"category":"competing","channel":"p","barrier":132,"mainSym":"Ti","mainA":46,"label":"²³Na + ²⁴Mg → ⁴⁶Ti + p","rounds":2,"rareMisses":1,"target":4,"q":13.375,"anchorId":"v","altChannel":"alpha","altLabel":"²³Na + ²⁴Mg → ⁴³Sc + ⁴He","altMainSym":"Sc","altMainA":43},{"id":"atlas_na_al","a":"Na","b":"Al","A1":23,"A2":27,"compound":"Cr","compoundA":50,"category":"inaccessible","channel":"gamma","barrier":143,"mainSym":"Cr","mainA":50,"label":"²³Na + ²⁷Al → ⁵⁰Cr + γ","rounds":1,"rareMisses":1,"target":3,"q":23.535,"anchorId":"cr"},{"id":"atlas_na_si","a":"Na","b":"Si","A1":23,"A2":28,"compound":"Mn","compoundA":51,"category":"inaccessible","channel":"gamma","barrier":154,"mainSym":"Mn","mainA":51,"label":"²³Na + ²⁸Si → ⁵¹Mn + γ","rounds":1,"rareMisses":1,"target":3,"q":17.221,"anchorId":"mn"},{"id":"atlas_na_p","a":"Na","b":"P","A1":23,"A2":31,"compound":"Fe","compoundA":54,"category":"inaccessible","channel":"gamma","barrier":165,"mainSym":"Fe","mainA":54,"label":"²³Na + ³¹P → ⁵⁴Fe + γ","rounds":3,"rareMisses":1,"target":3,"q":22.284,"anchorId":"fe"},{"id":"atlas_mg_mg","a":"Mg","b":"Mg","A1":24,"A2":24,"compound":"Cr","compoundA":48,"category":"inaccessible","channel":"gamma","barrier":144,"mainSym":"Cr","mainA":48,"label":"²⁴Mg + ²⁴Mg → ⁴⁸Cr + γ","rounds":1,"rareMisses":1,"target":3,"q":14.955,"anchorId":"cr"},{"id":"atlas_mg_al","a":"Mg","b":"Al","A1":24,"A2":27,"compound":"Mn","compoundA":51,"category":"inaccessible","channel":"gamma","barrier":156,"mainSym":"Mn","mainA":51,"label":"²⁴Mg + ²⁷Al → ⁵¹Mn + γ","rounds":3,"rareMisses":1,"target":3,"q":17.113,"anchorId":"mn"},{"id":"atlas_mg_si","a":"Mg","b":"Si","A1":24,"A2":28,"compound":"Fe","compoundA":52,"category":"inaccessible","channel":"gamma","barrier":168,"mainSym":"Fe","mainA":52,"label":"²⁴Mg + ²⁸Si → ⁵²Fe + γ","rounds":3,"rareMisses":1,"target":3,"q":12.904,"anchorId":"fe"},{"id":"atlas_al_al","a":"Al","b":"Al","A1":27,"A2":27,"compound":"Fe","compoundA":54,"category":"inaccessible","channel":"gamma","barrier":169,"mainSym":"Fe","mainA":54,"label":"²⁷Al + ²⁷Al → ⁵⁴Fe + γ","rounds":1,"rareMisses":1,"target":3,"q":21.861,"anchorId":"fe"}];

const ATLAS_CATEGORY_INFO={
 favorable:{label:'REAÇÃO FAVORÁVEL'},
 rare:{label:'REAÇÃO RARA'},
 endothermic:{label:'CANAL ENDOTÉRMICO'},
 fragment:{label:'FRAGMENTAÇÃO RETARDADA'},
 competing:{label:'CANAIS CONCORRENTES'},
 inaccessible:{label:'AMBIENTE INSUFICIENTE'}
};
const ATLAS_BY_ID=new Map(ATLAS_REACTIONS.map(r=>[r.id,r]));
function atlasSpec(s=phase()){return s?.atlasId?ATLAS_BY_ID.get(s.atlasId)||null:null}
function atlasSecondaryWord(ch){return ch==='alpha'?'Hélio-4':ch==='p'?'Próton':ch==='n'?'Nêutron':'Fóton gama'}
function atlasHeaderLine(s=phase()){
 const sp=atlasSpec(s);if(!sp)return s.meta||'';
 const left=`${E[sp.a]?.name||sp.a} + ${E[sp.b]?.name||sp.b}`;
 if(sp.channel==='gamma')return `${left} → ${E[sp.compound]?.name||sp.compound} + Fóton gama`;
 return `${left} → ${E[sp.mainSym]?.name||sp.mainSym} + ${atlasSecondaryWord(sp.channel)}`;
}
function atlasSymbolicLine(s=phase()){return atlasSpec(s)?.label||s.meta||''}
function atlasPhaseInstruction(s=phase()){
 const sp=atlasSpec(s);if(!sp)return'Explore a colisão';
 if(sp.category==='fragment')return`Forme o núcleo composto e acompanhe sua fragmentação após ${sp.rounds} ${sp.rounds===1?'rodada':'rodadas'}`;
 if(sp.category==='endothermic')return'Mova os reagentes para o centro ou primeira camada antes de tentar o canal';
 if(sp.category==='inaccessible')return'Aproxime os núcleos e observe o encontro durante uma rodada';
 if(sp.category==='rare')return'Tente a colisão; após poucas aproximações a reação será garantida';
 if(sp.category==='competing')return'Una os núcleos e observe qual canal será acompanhado nesta fase';
 return'Una os dois núcleos para completar a transformação';
}
function atlasTooltipData(s=phase()){
 const sp=atlasSpec(s);if(!sp)return{title:'REAÇÃO NUCLEAR',text:'A colisão reorganiza os núcleos e pode abrir diferentes canais.'};
 const a=E[sp.a]?.name||sp.a,b=E[sp.b]?.name||sp.b,main=E[sp.mainSym]?.name||sp.mainSym;
 if(sp.category==='fragment')return{title:'FRAGMENTAÇÃO RETARDADA',text:`${a} e ${b} formam primeiro um núcleo composto excitado. Ele permanece tremendo por ${sp.rounds} ${sp.rounds===1?'rodada':'rodadas'} antes de liberar ${atlasSecondaryWord(sp.channel)} e deixar ${main}.`};
 if(sp.category==='endothermic')return{title:'CANAL ENDOTÉRMICO',text:`O canal acompanhado para ${a} e ${b} absorve energia. Nesta fase, leve os reagentes para o centro ou primeira camada para fornecer um ambiente mais energético.`};
 if(sp.category==='inaccessible')return{title:'AMBIENTE INSUFICIENTE',text:`A combinação entre ${a} e ${b} pode existir em condições mais extremas, porém este ambiente torna o encontro eficaz praticamente inacessível. Cada aproximação observada dura uma rodada.`};
 if(sp.category==='rare')return{title:'REAÇÃO RARA',text:`A transformação entre ${a} e ${b} é possível, porém encontros que seguem este canal são pouco prováveis. Para manter a fase relaxante, o jogo garante o resultado após poucas tentativas.`};
 if(sp.category==='competing')return{title:'CANAIS CONCORRENTES',text:`A colisão entre ${a} e ${b} pode seguir mais de um caminho e produzir diferentes elementos.`};
 return{title:'REAÇÃO FAVORÁVEL',text:`A colisão entre ${a} e ${b} libera energia e pode formar ${main}. O produto aparece depois que os núcleos vencem a aproximação elétrica.`};
}
function atlasVisualFor(sp){
 const z=Number(E[sp.compound]?.n||0);if(z<=8)return'redGiant';if(z<=12)return'massive';if(z<=16)return'supergiant';if(z<=22)return'advanced';return'ironCore';
}
function atlasPhaseFromSpec(sp){
 const info=ATLAS_CATEGORY_INFO[sp.category]||ATLAS_CATEGORY_INFO.favorable;
 return{id:`phase_${sp.id}`,branch:`Atlas de fusões · ${info.label.toLowerCase()}`,title:`Reação ${E[sp.a]?.name||sp.a}–${E[sp.b]?.name||sp.b}`,meta:sp.label,new:sp.mainSym,mode:'reactionExplore',atlasId:sp.id,anchorId:sp.anchorId||sp.existingPhaseId||null,target:sp.target,flowTarget:sp.target,visual:atlasVisualFor(sp),fill:0,micro:true,continueAfterComplete:true,fusionTempMax:Math.min(3.2e9,Math.max(1e8,sp.barrier*2e7)),menuTag:`${sp.a}+${sp.b}`,endLabel:'PRÓXIMA<br>REAÇÃO'};
}
const FUSIONS={
 D:{ing:['H','H'],out:'D',emissions:['positron','neutrino'],pp:true},
 He3:{ing:['D','H'],out:'He3',emissions:['gamma'],pp:true},
 He:{ing:['He3','He3'],out:'He',freeParticles:['p','p'],pp:true},
 Be7:{ing:['He3','He'],out:'Be7',emissions:['gamma'],minTemp:7e7,cameronFowler:true},
 Be8:{ing:['He','He'],out:'Be8'},
 C:{ing:['Be8','He'],out:'C',emissions:['gamma']},
 N:{ing:['C','H'],out:'N'},
 O:{ing:['C','He'],out:'O',emissions:['gamma']},
 Ne:{ing:['O','He'],out:'Ne',emissions:['gamma']},
 Na:{ing:['Ne','H'],out:'Na'},
 Mg:{ing:['Ne','He'],out:'Mg',emissions:['gamma']},
 Al:{ing:['Mg','H'],out:'Al'},
 Si:{ing:['Mg','He'],out:'Si',emissions:['gamma']},
 P:{ing:['Si','H'],out:'P'},
 S:{ing:['Si','He'],out:'S',emissions:['gamma']},
 Cl:{ing:['S','H'],out:'Cl'},
 Ar:{ing:['S','He'],out:'Ar',emissions:['gamma']},
 K:{ing:['Ar','H'],out:'K'},
 Ca:{ing:['Ar','He'],out:'Ca',emissions:['gamma']},
 Sc:{ing:['Ca','H'],out:'Sc'},
 Ti:{ing:['Ca','He'],out:'Ti',emissions:['gamma']},
 V:{ing:['Ti','H'],out:'V'},
 Cr:{ing:['Ti','He'],out:'Cr',emissions:['gamma']},
 Mn:{ing:['Cr','H'],out:'Mn'},
 Fe:{ing:['Mn','H'],out:'Fe'},
 Ni:{ing:['Si','Si'],out:'Ni',aggregate:true}
};
// Temperaturas mínimas aproximadas usadas apenas para decidir quais reações antigas
// continuam jogáveis em um ambiente posterior. As rotas agregadas continuam
// explicitamente didáticas, em vez de uma rede isotópica completa.
const FUSION_MIN_TEMP={D:4e6,He3:4e6,He:4e6,Be7:7e7,Be8:8e7,C:8e7,N:2e7,O:1e8,Ne:5e8,Na:5e8,Mg:6e8,Al:8e8,Si:8e8,P:1.3e9,S:1.3e9,Cl:1.5e9,Ar:1.5e9,K:1.7e9,Ca:1.7e9,Sc:2.0e9,Ti:2.0e9,V:2.2e9,Cr:2.2e9,Mn:2.5e9,Fe:2.8e9,Ni:2.5e9};
// Captura de prótons é um canal paralelo à fusão. Cada rota abaixo representa
// um isótopo específico: A sempre aumenta em 1. Produtos proton-rich podem
// permanecer tremendo por 1–5 rodadas antes de decair, enquanto estados não
// ligados reemitem o próton e ⁸Be mantém a janela já usada pelo triplo-alfa.
const PROTON_CAPTURES={
 D:{out:'He3',inputMass:2,minTemp:4e6,label:'²H + p → ³He + γ'},
 He3:{out:'Li',inputMass:3,minTemp:4e6,gamma:false,countsCapture:false,label:'³He + p → ⁴Li*',decay:{mode:'returnProton',rounds:1,to:'He3',toMass:3,label:'⁴Li* → ³He + p'}},
 He:{out:'Li',inputMass:4,minTemp:8e6,gamma:false,countsCapture:false,label:'⁴He + p → ⁵Li*',decay:{mode:'returnProton',rounds:1,to:'He',toMass:4,label:'⁵Li* → ⁴He + p'}},
 Li:{out:'Be8',inputMass:7,minTemp:1e7,gamma:false,label:'⁷Li + p → ⁸Be* → 2α'},
 C:{out:'N',inputMass:12,minTemp:2e7,label:'¹²C + p → ¹³N* + γ',decay:{mode:'betaPlus',rounds:5,to:'C',toMass:13,label:'¹³N* → ¹³C + e⁺ + νₑ'}},
 N:{out:'O',inputMass:14,minTemp:2e7,label:'¹⁴N + p → ¹⁵O* + γ',decay:{mode:'betaPlus',rounds:4,to:'N',toMass:15,label:'¹⁵O* → ¹⁵N + e⁺ + νₑ'}},
 Ne:{out:'Na',inputMass:20,minTemp:5e8,label:'²⁰Ne + p → ²¹Na* + γ',decay:{mode:'betaPlus',rounds:3,to:'Ne',toMass:21,label:'²¹Na* → ²¹Ne + e⁺ + νₑ'}},
 Na:{out:'Mg',inputMass:23,minTemp:5e8,label:'²³Na + p → ²⁴Mg + γ'},
 Mg:{out:'Al',inputMass:24,minTemp:8e8,label:'²⁴Mg + p → ²⁵Al* + γ',decay:{mode:'betaPlus',rounds:2,to:'Mg',toMass:25,label:'²⁵Al* → ²⁵Mg + e⁺ + νₑ'}},
 Al:{out:'Si',inputMass:27,minTemp:8e8,label:'²⁷Al + p → ²⁸Si + γ'},
 Si:{out:'P',inputMass:28,minTemp:1.3e9,label:'²⁸Si + p → ²⁹P* + γ',decay:{mode:'betaPlus',rounds:2,to:'Si',toMass:29,label:'²⁹P* → ²⁹Si + e⁺ + νₑ'}},
 P:{out:'S',inputMass:31,minTemp:1.3e9,label:'³¹P + p → ³²S + γ'},
 S:{out:'Cl',inputMass:32,minTemp:1.5e9,label:'³²S + p → ³³Cl* + γ',decay:{mode:'betaPlus',rounds:2,to:'S',toMass:33,label:'³³Cl* → ³³S + e⁺ + νₑ'}},
 Cl:{out:'Ar',inputMass:35,minTemp:1.5e9,label:'³⁵Cl + p → ³⁶Ar + γ'},
 Ar:{out:'K',inputMass:36,minTemp:1.7e9,label:'³⁶Ar + p → ³⁷K* + γ',decay:{mode:'betaPlus',rounds:1,to:'Ar',toMass:37,label:'³⁷K* → ³⁷Ar + e⁺ + νₑ'}},
 K:{out:'Ca',inputMass:39,minTemp:1.7e9,label:'³⁹K + p → ⁴⁰Ca + γ'},
 Ca:{out:'Sc',inputMass:40,minTemp:2.0e9,label:'⁴⁰Ca + p → ⁴¹Sc* + γ',decay:{mode:'betaPlus',rounds:1,to:'Ca',toMass:41,label:'⁴¹Sc* → ⁴¹Ca + e⁺ + νₑ'}},
 Sc:{out:'Ti',inputMass:45,minTemp:2.0e9,label:'⁴⁵Sc + p → ⁴⁶Ti + γ'},
 Ti:{out:'V',inputMass:44,minTemp:2.2e9,label:'⁴⁴Ti + p → ⁴⁵V* + γ',decay:{mode:'betaPlus',rounds:1,to:'Ti',toMass:45,label:'⁴⁵V* → ⁴⁵Ti + e⁺ + νₑ'}},
 V:{out:'Cr',inputMass:51,minTemp:2.2e9,label:'⁵¹V + p → ⁵²Cr + γ'},
 Cr:{out:'Mn',inputMass:48,minTemp:2.5e9,label:'⁴⁸Cr + p → ⁴⁹Mn* + γ',decay:{mode:'betaPlus',rounds:1,to:'Cr',toMass:49,label:'⁴⁹Mn* → ⁴⁹Cr + e⁺ + νₑ'}},
 Mn:{out:'Fe',inputMass:55,minTemp:2.8e9,label:'⁵⁵Mn + p → ⁵⁶Fe + γ'}
};

// rp-process: campanha relaxante de captura rápida de prótons em uma camada
// H/He-rich acrecionada por uma estrela de nêutrons. Cada fase representa um
// marco químico; isótopos são explícitos apenas nos waiting points clássicos ou
// em pontos especialmente informativos. As demais passagens são redes agregadas.
const RP_PROCESS_STEPS=[
 {id:'rp_cu',from:'Ni',to:'Cu',pattern:'capture',fuel:'p',label:'Ni + p → Cu · rede rp agregada',target:3},
 {id:'rp_zn',from:'Cu',to:'Zn',pattern:'chain',fuel:'H',chain:2,label:'Cu + 2p → Zn · rede rp agregada',target:3},
 {id:'rp_ga',from:'Zn',to:'Ga',pattern:'beta',fuel:'p',label:'Zn + p → Ga* · β⁺ compete com novas capturas',target:3,decay:{mode:'betaPlus',rounds:3,to:'Zn',label:'Ga* → Zn + e⁺ + νₑ'}},
 {id:'rp_ge',from:'Ga',to:'Ge',pattern:'waiting',fuel:'H',inputMass:63,productMass:64,label:'⁶³Ga + p → ⁶⁴Ge + γ',target:2,decay:{mode:'betaPlus',rounds:5,to:'Ga',toMass:64,label:'⁶⁴Ge → ⁶⁴Ga + e⁺ + νₑ'}},
 {id:'rp_as',from:'Ge',to:'As',pattern:'chain',fuel:'p',chain:2,label:'Ge + capturas p → As · bypass agregado',target:3},
 {id:'rp_se',from:'As',to:'Se',pattern:'waiting',fuel:'H',inputMass:67,productMass:68,label:'⁶⁷As + p → ⁶⁸Se + γ',target:2,decay:{mode:'betaPlus',rounds:5,to:'As',toMass:68,label:'⁶⁸Se → ⁶⁸As + e⁺ + νₑ'}},
 {id:'rp_br',from:'Se',to:'Br',pattern:'capture',fuel:'p',label:'Se + p → Br · rede rp agregada',target:3},
 {id:'rp_kr',from:'Br',to:'Kr',pattern:'waiting',fuel:'H',inputMass:71,productMass:72,label:'⁷¹Br + p → ⁷²Kr + γ',target:2,decay:{mode:'betaPlus',rounds:5,to:'Br',toMass:72,label:'⁷²Kr → ⁷²Br + e⁺ + νₑ'}},
 {id:'rp_rb',from:'Kr',to:'Rb',pattern:'capture',fuel:'p',label:'Kr + p → Rb · rede rp agregada',target:3},
 {id:'rp_sr',from:'Rb',to:'Sr',pattern:'chain',fuel:'H',inputMass:75,productMass:76,chain:2,label:'Rb + capturas p → ⁷⁶Sr · rede rp agregada',target:2},
 {id:'rp_y',from:'Sr',to:'Y',pattern:'beta',fuel:'p',label:'Sr + p → Y* · captura / β⁺',target:3,decay:{mode:'betaPlus',rounds:3,to:'Sr',label:'Y* → Sr + e⁺ + νₑ'}},
 {id:'rp_zr',from:'Y',to:'Zr',pattern:'photo',fuel:'H',inputMass:79,productMass:80,label:'⁷⁹Y + p → ⁸⁰Zr + γ',target:2,photoChance:.24},
 {id:'rp_nb',from:'Zr',to:'Nb',pattern:'chain',fuel:'p',chain:2,label:'Zr + capturas p → Nb · rede rp agregada',target:3},
 {id:'rp_mo',from:'Nb',to:'Mo',pattern:'capture',fuel:'H',inputMass:83,productMass:84,label:'⁸³Nb + p → ⁸⁴Mo + γ',target:2},
 {id:'rp_tc',from:'Mo',to:'Tc',pattern:'beta',fuel:'p',label:'Mo + p → Tc* · captura / β⁺',target:3,decay:{mode:'betaPlus',rounds:3,to:'Mo',label:'Tc* → Mo + e⁺ + νₑ'}},
 {id:'rp_ru',from:'Tc',to:'Ru',pattern:'chain',fuel:'H',inputMass:87,productMass:88,chain:2,label:'Tc + capturas p → ⁸⁸Ru · rede rp agregada',target:2},
 {id:'rp_rh',from:'Ru',to:'Rh',pattern:'capture',fuel:'p',label:'Ru + p → Rh · rede rp agregada',target:3},
 {id:'rp_pd',from:'Rh',to:'Pd',pattern:'chain',fuel:'H',chain:2,label:'Rh + capturas p → Pd · rede rp agregada',target:3},
 {id:'rp_ag',from:'Pd',to:'Ag',pattern:'barrier',fuel:'p',label:'Pd + p → Ag · a Barreira de Coulomb domina',target:3,outerSeed:true},
 {id:'rp_cd',from:'Ag',to:'Cd',pattern:'photo',fuel:'H',label:'Ag + p ⇄ Cd* + γ · captura compete com (γ,p)',target:3,photoChance:.30},
 {id:'rp_in',from:'Cd',to:'In',pattern:'beta',fuel:'p',label:'Cd + p → In* · captura / β⁺',target:3,decay:{mode:'betaPlus',rounds:2,to:'Cd',label:'In* → Cd + e⁺ + νₑ'}},
 {id:'rp_sn',from:'In',to:'Sn',pattern:'chain',fuel:'H',inputMass:99,productMass:100,chain:2,label:'In + capturas p → ¹⁰⁰Sn · rede rp agregada',target:2},
 {id:'rp_sb',from:'Sn',to:'Sb',pattern:'terminal',fuel:'p',label:'Sn + p → Sb · entrada do ciclo terminal',target:3},
 {id:'rp_te',from:'Sb',to:'Te',pattern:'cycle',fuel:'H',label:'Sn ↔ Sb ↔ Te · ciclo terminal do rp-process',target:2,decay:{mode:'rpCycle',rounds:3,to:'Sn',label:'Te* → α + Sn · ciclo Sn–Sb–Te agregado'}}
];
function rpPhaseFromStep(step){
 const patternName={capture:'captura simples',chain:'captura em cadeia',beta:'captura + β⁺',waiting:'waiting point',photo:'captura ⇄ fotodesintegração',barrier:'Barreira de Coulomb',terminal:'entrada do ciclo terminal',cycle:'ciclo Sn–Sb–Te'}[step.pattern]||'rede rp';
 return{id:step.id,branch:`Explosão de raios X · rp-process · ${E[step.to].name}`,title:`Formação de ${E[step.to].name}`,meta:step.label,new:step.to,mode:'rpProcess',target:step.target||3,visual:'xrayBurst',fill:30,seed:step.from,seedCount:1,menuTag:step.to,fusionTempMax:1.6e9,rp:{...step},rpPattern:patternName,objectiveOnlyProgress:true,endLabel:step.id==='rp_te'?'ENCERRAR<br>EXPLOSÃO':'CONTINUAR<br>rp-PROCESS'};
}
const RP_PROCESS_PHASES=RP_PROCESS_STEPS.map(rpPhaseFromStep);
const RP_FOUNDATION_STEPS=[
 {id:'rp_foundation_co',from:'Fe',to:'Co',pattern:'capture',chain:1,label:'Fe + p → Co · reconstrução rp agregada'},
 {id:'rp_foundation_ni',from:'Co',to:'Ni',pattern:'capture',chain:1,label:'Co + p → Ni · reconstrução rp agregada'}
];
function rpStep(s=phase()){return s?.mode==='rpProcess'?s.rp:null}
function rpAvailableSteps(s=phase()){
 const current=rpStep(s);if(!current)return[];const i=RP_PROCESS_STEPS.findIndex(x=>x.id===current.id);
 return[...RP_FOUNDATION_STEPS,...RP_PROCESS_STEPS.slice(0,Math.max(0,i)+1)];
}
function rpStepForSymbol(sym,s=phase()){return rpAvailableSteps(s).slice().reverse().find(step=>step.from===sym)||null}

function fusionMinTemp(r){if(Number.isFinite(Number(r?.minTemp)))return Number(r.minTemp);return r===BROWN_FUSION?1e6:Number(FUSION_MIN_TEMP[r?.out]||0)}
const DECAY_TRACKS=[
 [{sym:'U',mass:238,decay:'α'},{sym:'Th',mass:234,decay:'β−'},{sym:'Pa',mass:234,decay:'β−'},{sym:'U',mass:234,decay:'α'},{sym:'Th',mass:230,decay:'α'},{sym:'Ra',mass:226,decay:'α'},{sym:'Rn',mass:222,decay:'α'},{sym:'Po',mass:218,decay:'várias etapas'},{sym:'Pb',mass:206,decay:'estável'}],
 [{sym:'Th',mass:232,decay:'α'},{sym:'Ra',mass:228,decay:'β−'},{sym:'Ac',mass:228,decay:'β−'},{sym:'Th',mass:228,decay:'α'},{sym:'Ra',mass:224,decay:'α'},{sym:'Rn',mass:220,decay:'α'},{sym:'Po',mass:216,decay:'várias etapas'},{sym:'Pb',mass:208,decay:'estável'}],
 [{sym:'U',mass:235,decay:'α'},{sym:'Th',mass:231,decay:'β−'},{sym:'Pa',mass:231,decay:'α'},{sym:'Ac',mass:227,decay:'α · ramo'},{sym:'Fr',mass:223,decay:'α · ramo raro'},{sym:'At',mass:219,decay:'α'},{sym:'Bi',mass:215,decay:'várias etapas'},{sym:'Pb',mass:207,decay:'estável'}]
];
// Cadeias de decaimento agregadas para as microfases radioativas. O mesmo símbolo
// pode representar isótopos diferentes em fases diferentes; a mecânica ensina o
// sentido da transformação (α/β−), sem fingir uma única cadeia isotópica contínua.
const GUIDED_DECAYS={
 decay_pa:{U:{to:'Th',type:'alpha'},Th:{to:'Pa',type:'beta'}},
 decay_ra:{U:{to:'Th',type:'alpha'},Th:{to:'Ra',type:'alpha'}},
 decay_ac:{U:{to:'Th',type:'alpha'},Th:{to:'Ra',type:'alpha'},Ra:{to:'Ac',type:'beta'}},
 decay_fr:{U:{to:'Th',type:'alpha'},Th:{to:'Ra',type:'alpha'},Ra:{to:'Ac',type:'beta'},Ac:{to:'Fr',type:'alpha'}},
 decay_rn:{U:{to:'Th',type:'alpha'},Th:{to:'Ra',type:'alpha'},Ra:{to:'Rn',type:'alpha'}},
 decay_po:{Rn:{to:'Po',type:'alpha'}},
 decay_at:{U:{to:'Th',type:'alpha'},Th:{to:'Ra',type:'alpha'},Ra:{to:'Ac',type:'beta'},Ac:{to:'Fr',type:'alpha'},Fr:{to:'At',type:'alpha'}}
};
const PHASES=[
 {id:'bigbang',branch:'Abertura',title:'Big Bang',meta:'Partículas fundamentais do plasma primordial',new:'H',mode:'opening',target:0,visual:'bigBang',primordial:true,menuTag:'ABERTURA'},
 {id:'primordial_d',branch:'Nucleossíntese primordial · primeiro núcleo',title:'Forme Deutério',meta:'p + n → ²H + γ',new:'D',mode:'primordialNuclear',recipeId:'pn_d',target:4,visual:'primordialH',primordial:true,endLabel:'FORMAR<br>TRÍTIO',menuTag:'²H'},
 {id:'primordial_t',branch:'Nucleossíntese primordial · ramo rico em nêutrons',title:'Forme Trítio',meta:'²H + n → ³H + γ',new:'T',mode:'primordialNuclear',recipeId:'dn_t',target:4,visual:'primordialH',primordial:true,endLabel:'FORMAR<br>HÉLIO-3',menuTag:'³H'},
 {id:'primordial_he3',branch:'Nucleossíntese primordial · ramo rico em prótons',title:'Forme Hélio-3',meta:'²H + p → ³He + γ',new:'He3',mode:'primordialNuclear',recipeId:'dp_he3',target:4,visual:'primordialH',primordial:true,endLabel:'CONVERGIR PARA<br>HÉLIO-4',menuTag:'³He'},
 {id:'primordial_he3d',branch:'Nucleossíntese primordial · convergência',title:'Forme Hélio-4',meta:'³He + ²H → ⁴He + p',new:'He',mode:'primordialNuclear',recipeId:'he3d_he',target:4,visual:'primordialHe',primordial:true,endLabel:'OUTRO CAMINHO<br>PARA HÉLIO-4',menuTag:'⁴He'},
 {id:'primordial_td',branch:'Nucleossíntese primordial · convergência',title:'Forme Hélio-4',meta:'³H + ²H → ⁴He + n',new:'He',mode:'primordialNuclear',recipeId:'td_he',target:4,visual:'primordialHe',primordial:true,endLabel:'FORMAR TRAÇOS<br>DE LÍTIO',menuTag:'⁴He'},
 {id:'primordial_li',branch:'Nucleossíntese primordial · traços de Lítio',title:'Forme Lítio-7',meta:'⁴He + ³H → ⁷Li + γ',new:'Li',mode:'primordialNuclear',recipeId:'het_li',target:4,visual:'primordialLi',primordial:true,endLabel:'O UNIVERSO<br>ESFRIA',menuTag:'⁷Li'},
 {id:'atomic_he',branch:'Era atômica · recombinação do Hélio',title:'Forme átomos de Hélio',meta:'⁴He²⁺ + 2e⁻ → He',new:'He',mode:'atomicRecombination',atomicTarget:'He',target:4,visual:'primordialHe',primordial:true,endLabel:'RECOMBINAR<br>HIDROGÊNIO',menuTag:'He'},
 {id:'atomic_h',branch:'Era atômica · recombinação do Hidrogênio',title:'Forme átomos de Hidrogênio',meta:'p + e⁻ → H + γ',new:'H',mode:'atomicRecombination',atomicTarget:'H',target:6,visual:'primordialH',primordial:true,endLabel:'RECOMBINAR<br>LÍTIO',menuTag:'H'},
 {id:'atomic_li',branch:'Era atômica · recombinação do Lítio',title:'Forme átomos de Lítio',meta:'⁷Li³⁺ + 3e⁻ → Li',new:'Li',mode:'atomicRecombination',atomicTarget:'Li',target:4,visual:'primordialLi',primordial:true,endLabel:'FORMAR<br>PRIMEIROS ASTROS',menuTag:'Li'},
 {id:'brown',branch:'Nascimento estelar · massa muito baixa',title:'Anã marrom',meta:'Queima limitada de Deutério',new:'He3',mode:'fusion',target:4,visual:'brownDwarf',fill:7,pool:['D','H'],endLabel:'DEUTÉRIO<br>ESGOTADO',gravityDelay:190},
 {id:'he_red',branch:'Nova estrela · baixa massa',title:'Anã vermelha',meta:'Formação de Hélio estável',new:'He',mode:'fusion',target:6,visual:'redDwarf',fill:16,pool:['H'],gravityDelay:175},
 {id:'he_orange',branch:'Nova estrela · massa intermediária',title:'Anã laranja',meta:'Primeiros passos da cadeia próton-próton',new:'He3',mode:'fusion',target:5,visual:'orangeDwarf',fill:18,pool:['H','H','H','H','He'],gravityDelay:158,fusionTempMax:1.3e7},
 {id:'he_yellow',branch:'Nova estrela · semelhante ao Sol',title:'Anã amarela',meta:'Fusão de Hidrogênio',new:'He',mode:'fusion',target:6,visual:'yellowDwarf',fill:28,pool:['H','H','H','H','H','He'],gravityDelay:145,fusionTempMax:1.6e7},
 {id:'coulomb_intro',branch:'Gigante vermelha · nova habilidade',title:'Barreira de Coulomb',meta:'³He + ³He → ⁴He + 2p',new:'He',mode:'fusion',target:3,visual:'redGiant',fill:10,pool:['H'],gravityDelay:143,fusionTempMax:1.2e8,objectiveOnlyProgress:true,menuTag:'COULOMB',endLabel:'APRENDER<br>CONVECÇÃO'},
 {id:'stellar_convection',branch:'Gigante vermelha · transporte de matéria e energia',title:'Convecção Estelar',meta:'Reação no interior → corrente convectiva → transporte radial',new:'He',mode:'convection',target:3,visual:'redGiant',fill:34,pool:['H','H','He','He3'],gravityDelay:142,fusionTempMax:1.2e8,reuseFusion:true,objectiveOnlyProgress:true,menuTag:'CONVECÇÃO',endLabel:'PRODUZIR<br>LÍTIO'},
 {id:'stellar_li',branch:'Gigante vermelha · mecanismo Cameron–Fowler',title:'Produção estelar de Lítio',meta:'³He + ⁴He → ⁷Be + γ · transporte → ⁷Li + νₑ',new:'Li',mode:'fusion',target:4,visual:'redGiant',fill:36,pool:['H','H','H','He','He'],gravityDelay:142,fusionTempMax:1.2e8,objectiveOnlyProgress:true,menuTag:'⁷Li',endLabel:'ACENDER<br>TRIPLO-ALFA'},
 {id:'fragile',branch:'Núcleos frágeis',title:'Gigante vermelha',meta:'Berílio-8 instável',new:'Be8',mode:'fusion',target:3,visual:'redGiant',fill:42,pool:['H','H','He','He'],gravityDelay:140,fusionTempMax:1.2e8},
 {id:'c',branch:'Formação de Carbono',title:'Gigante vermelha',meta:'Berílio-8 + Hélio → Carbono',new:'C',mode:'fusion',target:8,visual:'redGiant',fill:44,pool:['H','H','He','He','C'],gravityDelay:138,fusionTempMax:1.2e8},
 {id:'n',branch:'Enriquecimento em Nitrogênio',title:'Gigante vermelha',meta:'Redes nucleares evoluídas',new:'N',mode:'fusion',target:7,visual:'redGiant',fill:48,pool:['H','H','He','C','C'],gravityDelay:134,fusionTempMax:1.3e8},
 {id:'o',branch:'Formação de Oxigênio',title:'Gigante vermelha',meta:'Carbono + Hélio → Oxigênio',new:'O',mode:'fusion',target:8,visual:'redGiant',fill:49,pool:['H','He','He','C','C','O'],gravityDelay:130,fusionTempMax:1.5e8},
 {id:'spallation_be',branch:'Espalação cósmica · Berílio',title:'Espalação cósmica',meta:'Raio cósmico fragmenta C, N ou O',new:'Be',mode:'spallation',target:4,visual:'interstellar',fill:20,endLabel:'PRODUZIR<br>BORO',menuTag:'Be'},
 {id:'spallation',branch:'Espalação cósmica · Boro',title:'Espalação cósmica',meta:'Raio cósmico fragmenta C, N ou O',new:'B',mode:'spallation',target:6,visual:'interstellar',fill:20,endLabel:'FORMAR<br>NOVA ESTRELA',menuTag:'B'},
 {id:'carbon_burn',branch:'Estrela massiva · queima de Carbono',title:'Queima de Carbono',meta:'Carbono + Carbono → Neônio + Hélio',new:'Ne',mode:'fusion',target:5,visual:'massive',fill:48,pool:['H','He','C','C','O'],gravityDelay:124,fusionTempMax:9e8,menuTag:'C+C'},
 {id:'ne',branch:'Nova estrela · alta massa',title:'Estrela massiva',meta:'Forja de Neônio',new:'Ne',mode:'fusion',target:7,visual:'massive',fill:50,pool:['H','H','He','C','O','O','Ne'],gravityDelay:122,fusionTempMax:8.7e8},
 {id:'proton_capture',branch:'Nova habilidade · reação nuclear',title:'Captura de Prótons',meta:'Capture prótons em núcleos diferentes',new:'Na',mode:'protonCapture',target:2,visual:'massive',fill:28,pool:['C','C','Ne','Ne','O','Mg'],gravityDelay:121,fusionTempMax:8.7e8,menuTag:'p+'},
 {id:'na',branch:'Redes de Carbono e Neônio',title:'Estrela massiva',meta:'Formação de Sódio',new:'Na',mode:'fusion',target:6,visual:'massive',fill:50,pool:['H','He','O','Ne','Ne'],gravityDelay:120,fusionTempMax:1e9},
 {id:'carbon_oxygen',branch:'Estrela massiva · fusão de íons pesados',title:'Fusão Carbono-Oxigênio',meta:'Carbono + Oxigênio → Magnésio + Hélio',new:'Mg',mode:'fusion',target:4,visual:'massive',fill:50,pool:['H','He','C','O','Ne'],gravityDelay:119,fusionTempMax:1.2e9,menuTag:'C+O'},
 {id:'mg',branch:'Queima avançada',title:'Estrela massiva',meta:'Formação de Magnésio',new:'Mg',mode:'fusion',target:7,visual:'massive',fill:51,pool:['H','He','O','Ne','Ne','Mg'],gravityDelay:118,fusionTempMax:1.6e9},
 {id:'al',branch:'A forja acelera',title:'Estrela massiva',meta:'Formação de Alumínio',new:'Al',mode:'fusion',target:6,visual:'massive',fill:51,pool:['H','He','Ne','Mg','Mg'],gravityDelay:116,fusionTempMax:1.7e9},
 {id:'oxygen_burn',branch:'Estrela massiva · queima de Oxigênio',title:'Queima de Oxigênio',meta:'Oxigênio + Oxigênio → Silício + Hélio',new:'Si',mode:'fusion',target:5,visual:'supergiant',fill:51,pool:['H','He','O','O','Mg'],gravityDelay:114,fusionTempMax:2.0e9,menuTag:'O+O'},
 {id:'si',branch:'Formação de Silício',title:'Estrela Supergigante',meta:'',new:'Si',mode:'fusion',target:7,visual:'supergiant',fill:52,pool:['H','He','Ne','Mg','Mg','Si'],gravityDelay:112,fusionTempMax:1.6e9},
 {id:'p',branch:'Microfase · rede de estrela massiva',title:'Fósforo',meta:'Rota nuclear agregada · Silício + próton representa uma rede maior',new:'P',mode:'fusion',target:3,visual:'supergiant',fill:48,pool:['H','He','Si','Si'],gravityDelay:111,micro:true,fusionTempMax:2e9},
 {id:'s',branch:'Forja em camadas',title:'Supergigante',meta:'Formação de Enxofre',new:'S',mode:'fusion',target:6,visual:'supergiant',fill:52,pool:['He','Mg','Si','Si'],gravityDelay:110,fusionTempMax:2e9},
 {id:'cl',branch:'Microfase · rede de estrela massiva',title:'Cloro',meta:'Rota nuclear agregada · redes avançadas e explosivas',new:'Cl',mode:'fusion',target:3,visual:'supergiant',fill:48,pool:['H','He','S','S'],gravityDelay:109,micro:true,fusionTempMax:2.2e9},
 {id:'ar',branch:'Forja em camadas',title:'Supergigante',meta:'Formação de Argônio',new:'Ar',mode:'fusion',target:6,visual:'supergiant',fill:52,pool:['He','Si','S','S'],gravityDelay:108,fusionTempMax:2.3e9},
 {id:'k',branch:'Microfase · rede explosiva',title:'Potássio',meta:'Rota nuclear agregada · captura de próton representa uma rede maior',new:'K',mode:'fusion',target:3,visual:'advanced',fill:49,pool:['H','He','Ar','Ar'],gravityDelay:107,micro:true,fusionTempMax:2.5e9},
 {id:'ca',branch:'Forja em camadas',title:'Supergigante',meta:'Formação de Cálcio',new:'Ca',mode:'fusion',target:6,visual:'advanced',fill:53,pool:['He','S','Ar','Ar'],gravityDelay:106,fusionTempMax:2.6e9},
 {id:'sc',branch:'Microfase · nucleossíntese explosiva',title:'Escândio',meta:'Rota agregada sensível às condições da explosão',new:'Sc',mode:'fusion',target:3,visual:'advanced',fill:49,pool:['H','He','Ca','Ca'],gravityDelay:105,micro:true,fusionTempMax:2.7e9},
 {id:'ti',branch:'Forja em camadas',title:'Supergigante',meta:'Formação de Titânio',new:'Ti',mode:'fusion',target:5,visual:'advanced',fill:53,pool:['He','Ar','Ca','Ca'],gravityDelay:104,fusionTempMax:2.8e9},
 {id:'v',branch:'Microfase · vizinhança do grupo do Ferro',title:'Vanádio',meta:'Rota nuclear agregada nas fases finais da estrela',new:'V',mode:'fusion',target:3,visual:'advanced',fill:49,pool:['H','He','Ti','Ti'],gravityDelay:103,micro:true,fusionTempMax:2.9e9},
 {id:'cr',branch:'Queima avançada',title:'Supergigante',meta:'Formação de Cromo',new:'Cr',mode:'fusion',target:5,visual:'advanced',fill:53,pool:['He','Ca','Ti','Ti'],gravityDelay:102,fusionTempMax:3e9},
 {id:'mn',branch:'Queima avançada',title:'Núcleo profundo',meta:'Formação de Manganês',new:'Mn',mode:'fusion',target:5,visual:'advanced',fill:53,pool:['H','He','Ti','Cr','Cr'],gravityDelay:100,fusionTempMax:3.2e9},
 {id:'cr_alpha_fe',branch:'Núcleo profundo · cadeia alfa',title:'Cadeia Alfa do Ferro',meta:'Cromo + Hélio → Ferro + Fóton gama',new:'Fe',mode:'fusion',target:4,visual:'ironCore',fill:53,pool:['H','He','Cr','Cr','Mn'],gravityDelay:99,fusionTempMax:3.2e9,menuTag:'Cr+He'},
 {id:'fe',branch:'Limite da fusão estelar',title:'Núcleo do grupo do Ferro',meta:'Formação de Ferro',new:'Fe',mode:'fusion',target:5,visual:'ironCore',fill:54,pool:['H','He','Cr','Mn','Mn'],gravityDelay:98,fusionTempMax:7e9},
 {id:'neutronize',branch:'Neutronização',title:'Colapso do núcleo',meta:'Comprima núcleos em nêutrons',new:'Fe',mode:'neutronize',target:8,visual:'ironCore',fill:54,pool:['O','Ne','Mg','Si','S','Ar','Ca','Ti','Cr','Mn','Fe','Fe'],endLabel:'LIBERAR ONDA<br>DE CHOQUE',gravityDelay:92},

 {id:'co',branch:'Grupo do Ferro · Cobalto',title:'Formação de Cobalto',meta:'Fe + n → Fe instável → β− + ν̄ₑ → Co',new:'Co',mode:'neutron',seed:'Fe',path:['Fe','Co'],captures:1,target:4,starterGroups:[['Fe'],['Mn','H'],['Cr','H'],['Ti','He']],allowBackground:['H','He','O','C'],chainRebuild:true,reuseFusion:true,manualDecay:true,objectiveOnlyProgress:true,visual:'ironCore',fill:44,neutronRate:690,endLabel:'FORMAR<br>NÍQUEL',menuTag:'Co',fusionTempMax:8e9},
 {id:'ni_fusion',branch:'Queima de Silício · Níquel',title:'Formação de Níquel',meta:'Rota agregada · rede de queima de Silício → grupo do Ferro',new:'Ni',mode:'fusion',target:4,visual:'ironCore',fill:48,pool:['H','He','Si','Si'],gravityDelay:96,endLabel:'OBSERVAR<br>NEUTRINOS',menuTag:'Ni',fusionTempMax:8e9},
 {id:'nu_f',branch:'Supernova · neutrinos',title:'Neutrinos da Supernova',meta:'Selecione ν → toque em Neônio',new:'F',mode:'neutrino',target:4,visual:'ironCore',fill:20,endLabel:'INICIAR<br>CAPTURAS n',menuTag:'F',fusionTempMax:6e9},
 {id:'weak_s_cu',branch:'Processo-s fraco · Cobre',title:'Formação de Cobre',meta:'Níquel + n → Cobre',new:'Cu',mode:'neutron',seed:'Ni',path:['Ni','Cu'],captures:1,target:4,starterGroups:[['Ni'],['O','C'],['Be8','He'],['C','He']],weakS:true,chainRebuild:true,visual:'massive',fill:40,neutronRate:760,endLabel:'FORMAR<br>ZINCO',menuTag:'Cu',fusionTempMax:2.5e9},
 {id:'weak_s_zn',branch:'Processo-s fraco · Zinco',title:'Formação de Zinco',meta:'Cobre + n → Zinco',new:'Zn',mode:'neutron',seed:'Cu',path:['Cu','Zn'],captures:1,target:5,starterGroups:[['Cu'],['Ni'],['O','C'],['Be8','He']],weakS:true,chainRebuild:true,visual:'massive',fill:40,neutronRate:740,endLabel:'FORMAR<br>GÁLIO',menuTag:'Zn',fusionTempMax:2.5e9},
 {id:'weak_s_ga',branch:'Processo-s fraco · Gálio',title:'Formação de Gálio',meta:'Zinco + n → Gálio',new:'Ga',mode:'neutron',seed:'Zn',path:['Zn','Ga'],captures:1,target:5,starterGroups:[['Zn'],['Cu'],['Ni'],['O','C']],weakS:true,chainRebuild:true,visual:'massive',fill:40,neutronRate:720,endLabel:'FORMAR<br>GERMÂNIO',menuTag:'Ga',fusionTempMax:2.5e9},
 {id:'weak_s_ge',branch:'Processo-s fraco · Germânio',title:'Formação de Germânio',meta:'Gálio + n → Germânio',new:'Ge',mode:'neutron',seed:'Ga',path:['Ga','Ge'],captures:1,target:6,starterGroups:[['Ga'],['Zn'],['Cu'],['Ni'],['O','C']],weakS:true,chainRebuild:true,visual:'massive',fill:40,neutronRate:700,endLabel:'FORMAR<br>ARSÊNIO',menuTag:'Ge',fusionTempMax:2.5e9},
 {id:'weak_s_as',branch:'Processo-s fraco · Arsênio',title:'Formação de Arsênio',meta:'Germânio + n → Arsênio',new:'As',mode:'neutron',seed:'Ge',path:['Ge','As'],captures:1,target:6,starterGroups:[['Ge'],['Ga'],['Zn'],['Cu'],['Ni'],['O','C']],weakS:true,chainRebuild:true,visual:'massive',fill:40,neutronRate:680,endLabel:'FORMAR<br>SELÊNIO',menuTag:'As',fusionTempMax:2.5e9},
 {id:'weak_s_se',branch:'Processo-s fraco · Selênio',title:'Formação de Selênio',meta:'Arsênio + n → Selênio',new:'Se',mode:'neutron',seed:'As',path:['As','Se'],captures:1,target:6,starterGroups:[['As'],['Ge'],['Ga'],['Zn'],['Cu'],['O','C']],weakS:true,chainRebuild:true,visual:'massive',fill:40,neutronRate:660,endLabel:'FORMAR<br>BROMO',menuTag:'Se',fusionTempMax:2.5e9},
 {id:'weak_s_br',branch:'Processo-s fraco · Bromo',title:'Formação de Bromo',meta:'Selênio + n → Bromo',new:'Br',mode:'neutron',seed:'Se',path:['Se','Br'],captures:1,target:7,starterGroups:[['Se'],['As'],['Ge'],['Ga'],['Zn'],['Cu'],['O','C']],weakS:true,chainRebuild:true,visual:'massive',fill:40,neutronRate:640,endLabel:'FORMAR<br>CRIPTÔNIO',menuTag:'Br',fusionTempMax:2.5e9},
 {id:'weak_s_kr',branch:'Processo-s fraco · Criptônio',title:'Formação de Criptônio',meta:'Bromo + n → Criptônio',new:'Kr',mode:'neutron',seed:'Br',path:['Br','Kr'],captures:1,target:3,starterGroups:[['Br'],['Se'],['As'],['Ge'],['O','C']],weakS:true,chainRebuild:true,visual:'massive',fill:40,neutronRate:620,endLabel:'MUDAR PARA<br>ESTRELA AGB',menuTag:'Kr',fusionTempMax:2.5e9},
 {id:'rb',branch:'Estrela AGB · ramificação do processo-s',title:'Ramificação do Rubídio',meta:'A densidade de nêutrons muda a rota · Kr → Rb',new:'Rb',mode:'neutron',seed:'Kr',path:['Kr','Rb'],captures:2,target:3,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Kr','Kr','Kr'],neutronRate:1050,endLabel:'ALCANÇAR<br>ESTRÔNCIO',menuTag:'Rb',fusionTempMax:3.5e8},
 {id:'sr',branch:'Primeiro pico do processo-s',title:'Estrela AGB · processo-s',meta:'Capturas e β− levam de Rb ao Estrôncio',new:'Sr',mode:'neutron',seed:'Rb',path:['Rb','Sr'],captures:2,target:3,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Rb','Rb','Rb'],neutronRate:1180,fusionTempMax:3e8},
 {id:'y',branch:'Microfase · captura de nêutrons',title:'Ítrio',meta:'Sr + n → isótopo instável → β− → Y',new:'Y',mode:'neutron',seed:'Sr',path:['Sr','Y'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Sr','Sr','Sr'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'zr',branch:'Microfase · captura de nêutrons',title:'Zircônio',meta:'Y + n → isótopo instável → β− → Zr',new:'Zr',mode:'neutron',seed:'Y',path:['Y','Zr'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Y','Y','Y'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'nb',branch:'Microfase · captura de nêutrons',title:'Nióbio',meta:'Zr + n → isótopo instável → β− → Nb',new:'Nb',mode:'neutron',seed:'Zr',path:['Zr','Nb'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Zr','Zr','Zr'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'gamma_mo',branch:'Microfase · rota de captura',title:'Molibdênio',meta:'Nb + capturas/β− → Mo · rota agregada',new:'Mo',mode:'neutron',seed:'Nb',path:['Nb','Mo'],captures:2,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Nb','Nb','Nb'],neutronRate:1150,micro:true,fusionTempMax:3.5e8},
 {id:'tc',branch:'Estrela AGB · evidência de nucleossíntese',title:'Tecnécio',meta:'Capture nêutrons · forme um núcleo radioativo observado em estrelas',new:'Tc',mode:'neutron',seed:'Mo',path:['Mo','Tc'],captures:2,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Mo','Mo','Mo'],neutronRate:1100,micro:true,fusionTempMax:3.5e8},
 {id:'gamma_ru',branch:'Microfase · rota de captura',title:'Rutênio',meta:'Tc + capturas/β− → Ru · rota agregada',new:'Ru',mode:'neutron',seed:'Tc',path:['Tc','Ru'],captures:2,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Tc','Tc','Tc'],neutronRate:1150,micro:true,fusionTempMax:3.5e8},
 {id:'gamma_process',branch:'Supernova · γ-processo',title:'Tempestade de Fótons',meta:'γ remove nêutrons de sementes pesadas · explore isótopos mais proton-rich',new:'Mo',mode:'gamma',target:3,visual:'ironCore',fill:18,isotopeMode:true,endLabel:'CONTINUAR<br>A FORJA',menuTag:'γ,n',fusionTempMax:4e9},
 {id:'rh',branch:'Microfase · captura de nêutrons',title:'Ródio',meta:'Ru + n → isótopo instável → β− → Rh',new:'Rh',mode:'neutron',seed:'Ru',path:['Ru','Rh'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Ru','Ru','Ru'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'pd',branch:'Microfase · captura de nêutrons',title:'Paládio',meta:'Rh + n → isótopo instável → β− → Pd',new:'Pd',mode:'neutron',seed:'Rh',path:['Rh','Pd'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Rh','Rh','Rh'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'ag',branch:'Microfase · captura de nêutrons',title:'Prata',meta:'Pd + n → isótopo instável → β− → Ag',new:'Ag',mode:'neutron',seed:'Pd',path:['Pd','Ag'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Pd','Pd','Pd'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'cd',branch:'Microfase · captura de nêutrons',title:'Cádmio',meta:'Ag + n → isótopo instável → β− → Cd',new:'Cd',mode:'neutron',seed:'Ag',path:['Ag','Cd'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Ag','Ag','Ag'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'in',branch:'Microfase · captura de nêutrons',title:'Índio',meta:'Cd + n → isótopo instável → β− → In',new:'In',mode:'neutron',seed:'Cd',path:['Cd','In'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Cd','Cd','Cd'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'sn',branch:'Microfase · captura de nêutrons',title:'Estanho',meta:'In + n → isótopo instável → β− → Sn',new:'Sn',mode:'neutron',seed:'In',path:['In','Sn'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','In','In','In'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'sb',branch:'Microfase · captura de nêutrons',title:'Antimônio',meta:'Sn + n → isótopo instável → β− → Sb',new:'Sb',mode:'neutron',seed:'Sn',path:['Sn','Sb'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Sn','Sn','Sn'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'te',branch:'Microfase · captura de nêutrons',title:'Telúrio',meta:'Sb + n → isótopo instável → β− → Te',new:'Te',mode:'neutron',seed:'Sb',path:['Sb','Te'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Sb','Sb','Sb'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'i',branch:'Microfase · captura de nêutrons',title:'Iodo',meta:'Te + n → isótopo instável → β− → I',new:'I',mode:'neutron',seed:'Te',path:['Te','I'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Te','Te','Te'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'xe',branch:'Microfase · captura de nêutrons',title:'Xenônio',meta:'I + n → isótopo instável → β− → Xe',new:'Xe',mode:'neutron',seed:'I',path:['I','Xe'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','I','I','I'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'cs',branch:'Microfase · captura de nêutrons',title:'Césio',meta:'Xe + n → isótopo instável → β− → Cs',new:'Cs',mode:'neutron',seed:'Xe',path:['Xe','Cs'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Xe','Xe','Xe'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'ba',mechanicPattern:'s-peak',branch:'Segundo pico do processo-s',title:'Bário',meta:'Capturas lentas acumulam matéria na região do segundo pico-s',new:'Ba',mode:'neutron',seed:'Cs',path:['Cs','Ba'],captures:2,target:3,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Cs','Cs','Cs'],neutronRate:1320,micro:true,fusionTempMax:3.5e8},
 {id:'la',mechanicPattern:'s-beta',branch:'Microfase · captura de nêutrons',title:'Lantânio',meta:'Ba + n → isótopo instável → β− → La',new:'La',mode:'neutron',seed:'Ba',path:['Ba','La'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Ba','Ba','Ba'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'ce',mechanicPattern:'s-capture',branch:'Microfase · captura de nêutrons',title:'Cério',meta:'La + n → isótopo instável → β− → Ce',new:'Ce',mode:'neutron',seed:'La',path:['La','Ce'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','La','La','La'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'pr',branch:'Microfase · captura de nêutrons',title:'Praseodímio',meta:'Ce + n → isótopo instável → β− → Pr',new:'Pr',mode:'neutron',seed:'Ce',path:['Ce','Pr'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Ce','Ce','Ce'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'nd',branch:'Microfase · captura de nêutrons',title:'Neodímio',meta:'Pr + n → isótopo instável → β− → Nd',new:'Nd',mode:'neutron',seed:'Pr',path:['Pr','Nd'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Pr','Pr','Pr'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'pm',branch:'Microfase · captura de nêutrons',title:'Promécio',meta:'Nd + n → isótopo instável → β− → Pm',new:'Pm',mode:'neutron',seed:'Nd',path:['Nd','Pm'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Nd','Nd','Nd'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'sm',branch:'Microfase · captura de nêutrons',title:'Samário',meta:'Pm + n → isótopo instável → β− → Sm',new:'Sm',mode:'neutron',seed:'Pm',path:['Pm','Sm'],captures:1,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Pm','Pm','Pm'],neutronRate:1200,micro:true,fusionTempMax:3.5e8},
 {id:'pb',mechanicPattern:'s-aggregate',branch:'Região terminal do processo-s',title:'Chumbo',meta:'Muitas capturas e β− são agregadas nesta passagem até Pb',new:'Pb',mode:'neutron',seed:'Sm',captures:4,target:3,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Sm','Sm','Sm'],neutronRate:1400,fusionTempMax:3e8},
 {id:'bi',mechanicPattern:'s-terminal',branch:'Limite do processo-s',title:'Bismuto',meta:'Pb + capturas/β− → Bi · região terminal da rota lenta',new:'Bi',mode:'neutron',seed:'Pb',path:['Pb','Bi'],captures:2,target:2,seedCount:4,visual:'agb',fill:31,pool:['He','C','O','Pb','Pb','Pb'],neutronRate:1450,micro:true,endLabel:'FORMAR<br>SISTEMA BINÁRIO',fusionTempMax:3.5e8},
 {id:'binary_neutron_stars',branch:'Segunda Geração · Sistemas compactos',title:'Sistema binário de estrelas de nêutrons',meta:'Duas estrelas de nêutrons perdem energia orbital e se aproximam até a fusão',new:'Fe',mode:'campaignMilestone',target:0,visual:'kilonova',fill:26,endEvent:'postTransition',endLabel:'FUNDIR<br>SISTEMA',menuTag:'BINÁRIO'},
 {id:'kilonova',branch:'Segunda Geração · Evento de enriquecimento',title:'Kilonova',meta:'A fusão lança matéria extremamente rica em nêutrons e abre o processo-r',new:'Eu',mode:'campaignMilestone',target:0,visual:'kilonova',fill:32,endEvent:'postTransition',endLabel:'INICIAR<br>PROCESSO-R',menuTag:'KILONOVA'},
 {id:'eu',mechanicPattern:'r-storm',branch:'Kilonova · início das terras raras',title:'Európio',meta:'Captura rápida de nêutrons · marcador clássico do processo-r',new:'Eu',mode:'neutron',seed:'Sm',captures:3,target:2,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Sm','Sm','Sm'],neutronRate:510,rprocess:true},
 {id:'gd',branch:'Kilonova · microfase do processo-r',title:'Gadolínio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Gd',mode:'neutron',seed:'Eu',path:['Eu','Gd'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Eu','Eu','Eu'],neutronRate:490,micro:true,rprocess:true},
 {id:'tb',branch:'Kilonova · microfase do processo-r',title:'Térbio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Tb',mode:'neutron',seed:'Gd',path:['Gd','Tb'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Gd','Gd','Gd'],neutronRate:490,micro:true,rprocess:true},
 {id:'dy',branch:'Kilonova · microfase do processo-r',title:'Disprósio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Dy',mode:'neutron',seed:'Tb',path:['Tb','Dy'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Tb','Tb','Tb'],neutronRate:490,micro:true,rprocess:true},
 {id:'ho',branch:'Kilonova · microfase do processo-r',title:'Hólmio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Ho',mode:'neutron',seed:'Dy',path:['Dy','Ho'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Dy','Dy','Dy'],neutronRate:490,micro:true,rprocess:true},
 {id:'er',branch:'Kilonova · microfase do processo-r',title:'Érbio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Er',mode:'neutron',seed:'Ho',path:['Ho','Er'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Ho','Ho','Ho'],neutronRate:490,micro:true,rprocess:true},
 {id:'tm',branch:'Kilonova · microfase do processo-r',title:'Túlio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Tm',mode:'neutron',seed:'Er',path:['Er','Tm'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Er','Er','Er'],neutronRate:490,micro:true,rprocess:true},
 {id:'yb',branch:'Kilonova · microfase do processo-r',title:'Itérbio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Yb',mode:'neutron',seed:'Tm',path:['Tm','Yb'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Tm','Tm','Tm'],neutronRate:490,micro:true,rprocess:true},
 {id:'lu',branch:'Kilonova · microfase do processo-r',title:'Lutécio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Lu',mode:'neutron',seed:'Yb',path:['Yb','Lu'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Yb','Yb','Yb'],neutronRate:490,micro:true,rprocess:true},
 {id:'hf',branch:'Kilonova · microfase do processo-r',title:'Háfnio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Hf',mode:'neutron',seed:'Lu',path:['Lu','Hf'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Lu','Lu','Lu'],neutronRate:490,micro:true,rprocess:true},
 {id:'ta',branch:'Kilonova · microfase do processo-r',title:'Tântalo',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Ta',mode:'neutron',seed:'Hf',path:['Hf','Ta'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Hf','Hf','Hf'],neutronRate:490,micro:true,rprocess:true},
 {id:'w',branch:'Kilonova · microfase do processo-r',title:'Tungstênio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'W',mode:'neutron',seed:'Ta',path:['Ta','W'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Ta','Ta','Ta'],neutronRate:490,micro:true,rprocess:true},
 {id:'re',branch:'Kilonova · microfase do processo-r',title:'Rênio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Re',mode:'neutron',seed:'W',path:['W','Re'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','W','W','W'],neutronRate:490,micro:true,rprocess:true},
 {id:'os',branch:'Kilonova · microfase do processo-r',title:'Ósmio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Os',mode:'neutron',seed:'Re',path:['Re','Os'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Re','Re','Re'],neutronRate:490,micro:true,rprocess:true},
 {id:'ir',branch:'Kilonova · microfase do processo-r',title:'Irídio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Ir',mode:'neutron',seed:'Os',path:['Os','Ir'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Os','Os','Os'],neutronRate:490,micro:true,rprocess:true},
 {id:'pt',mechanicPattern:'r-peak',branch:'Terceiro pico do processo-r',title:'Platina',meta:'Fluxo extremo de nêutrons alcança a região da Platina',new:'Pt',mode:'neutron',seed:'Ir',path:['Ir','Pt'],captures:3,target:2,seedCount:4,visual:'kilonova',fill:46,pool:['Ni','Ir','Ir','Ir'],neutronRate:470,rprocess:true},
 {id:'au',mechanicPattern:'r-freezeout',branch:'Captura rápida de nêutrons',title:'Ouro',meta:'Formação de Ouro em material extremamente rico em nêutrons',new:'Au',mode:'neutron',seed:'Pt',path:['Pt','Au'],captures:2,target:2,seedCount:4,visual:'kilonova',fill:46,pool:['Ni','Pt','Pt','Pt'],neutronRate:450,rprocess:true},
 {id:'hg',branch:'Kilonova · núcleos muito pesados',title:'Mercúrio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Hg',mode:'neutron',seed:'Au',path:['Au','Hg'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Au','Au','Au'],neutronRate:440,micro:true,rprocess:true},
 {id:'tl',branch:'Kilonova · núcleos muito pesados',title:'Tálio',meta:'Capturas rápidas em sequência → núcleo rico em nêutrons → cascata β−',new:'Tl',mode:'neutron',seed:'Hg',path:['Hg','Tl'],captures:3,target:1,seedCount:4,visual:'kilonova',fill:46,pool:['Fe','Ni','Hg','Hg','Hg'],neutronRate:435,micro:true,rprocess:true},
 {id:'th',mechanicPattern:'r-actinide',branch:'Actinídeos',title:'Tório',meta:'Muitas capturas e β− são agregadas até os actinídeos',new:'Th',mode:'neutron',seed:'Tl',captures:5,target:2,seedCount:4,visual:'kilonova',fill:46,pool:['Ni','Tl','Tl','Tl'],neutronRate:420,rprocess:true},
 {id:'u',mechanicPattern:'r-terminal',branch:'Extremo da nucleossíntese',title:'Urânio',meta:'O processo-r alcança um dos núcleos naturais mais pesados',new:'U',mode:'neutron',seed:'Th',path:['Th','U'],captures:4,target:2,seedCount:4,visual:'kilonova',fill:46,pool:['Ni','Th','Th','Th'],neutronRate:400,rprocess:true,endLabel:'ACOMPANHAR<br>O TEMPO'},
 {id:'decay_pa',branch:'Cadeias radioativas · Protactínio',title:'Protactínio',meta:'U → Th + He → β− → Pa',new:'Pa',mode:'guidedDecay',target:2,starterGroups:[['U'],['Th']],chainRebuild:true,objectiveOnlyProgress:true,visual:'interstellar',fill:24,endLabel:'FORMAR<br>RÁDIO',menuTag:'Pa'},
 {id:'decay_ra',branch:'Cadeias radioativas · Rádio',title:'Rádio',meta:'Th → Ra + He',new:'Ra',mode:'guidedDecay',target:2,starterGroups:[['Th'],['U']],chainRebuild:true,objectiveOnlyProgress:true,visual:'interstellar',fill:24,endLabel:'FORMAR<br>ACTÍNIO',menuTag:'Ra'},
 {id:'decay_ac',branch:'Cadeias radioativas · Actínio',title:'Actínio',meta:'Ra → Ac + β−',new:'Ac',mode:'guidedDecay',target:3,starterGroups:[['Ra'],['Th'],['U']],chainRebuild:true,objectiveOnlyProgress:true,visual:'interstellar',fill:24,endLabel:'FORMAR<br>FRÂNCIO',menuTag:'Ac'},
 {id:'decay_fr',branch:'Cadeias radioativas · Frâncio',title:'Frâncio',meta:'Ac → Fr + He',new:'Fr',mode:'guidedDecay',target:2,starterGroups:[['Ac'],['Ra'],['Th']],chainRebuild:true,objectiveOnlyProgress:true,visual:'interstellar',fill:24,endLabel:'FORMAR<br>RADÔNIO',menuTag:'Fr'},
 {id:'decay_rn',branch:'Cadeias radioativas · Radônio',title:'Radônio',meta:'Ra → Rn + He',new:'Rn',mode:'guidedDecay',target:3,starterGroups:[['Ra'],['Th'],['U']],chainRebuild:true,objectiveOnlyProgress:true,visual:'interstellar',fill:24,endLabel:'FORMAR<br>POLÔNIO',menuTag:'Rn'},
 {id:'decay_po',branch:'Cadeias radioativas · Polônio',title:'Polônio',meta:'Rn → Po + He',new:'Po',mode:'guidedDecay',target:2,starterGroups:[['Rn'],['Ra'],['Th']],chainRebuild:true,objectiveOnlyProgress:true,visual:'interstellar',fill:24,endLabel:'FORMAR<br>ASTATO',menuTag:'Po'},
 {id:'decay_at',branch:'Cadeias radioativas · Astato',title:'Astato',meta:'Fr → At + He',new:'At',mode:'guidedDecay',target:2,starterGroups:[['Fr'],['Ac'],['Ra'],['Th']],chainRebuild:true,objectiveOnlyProgress:true,visual:'interstellar',fill:24,endLabel:'FORMAR<br>ANÃ BRANCA',menuTag:'At'},
 {id:'white',branch:'Remanescentes compactos · Anã branca',title:'Anã branca',meta:'Crie 3 Carbonos e 3 Oxigênios',new:'O',mode:'whiteCompact',target:3,targetC:3,targetO:3,visual:'whiteDwarf',fill:12,endLabel:'CONTINUAR<br>REMANESCENTES',gravityDelay:170,menuTag:'REMNANESCENTE',fusionTempMax:2e7},
 {id:'final_collapse',branch:'Outra estrela massiva chega ao fim',title:'Colapso final',meta:'Comprima o núcleo até a ruptura',new:'Fe',mode:'neutronize',target:6,visual:'ironCore',fill:54,pool:['O','Ne','Mg','Si','S','Ar','Ca','Ti','Cr','Mn','Fe','Fe'],endEvent:'supernova',endLabel:'EXPLODIR<br>SUPERNOVA',gravityDelay:86,menuTag:'SUPERNOVA'},
 {id:'first_enrichment',branch:'Primeira Geração · Supernova',title:'Primeiro Enriquecimento',meta:'C, N, O, Ne, Mg, Si, Fe e sementes do processo-s fraco passam ao meio interestelar',new:'Fe',mode:'campaignMilestone',target:0,visual:'interstellar',fill:18,endEvent:'postTransition',endLabel:'FORMAR<br>SEGUNDA GERAÇÃO',menuTag:'1ª → 2ª'},
 {id:'second_birth',branch:'Segunda Geração · Nascimento estelar',title:'Segunda Geração',meta:'Nasce com H, He e Li + C, N, O e outros produtos herdados da Primeira Geração',new:'C',mode:'campaignMilestone',target:0,visual:'nebula',fill:16,endEvent:'postTransition',endLabel:'EXPLORAR<br>SEGUNDA GERAÇÃO',menuTag:'2ª GERAÇÃO'},
 {id:'second_enrichment',branch:'Segunda Geração · Herança química',title:'Segundo Enriquecimento',meta:'Espalação, AGB e processo-r acrescentam Be/B, produtos-s e núcleos pesados até U',new:'Fe',mode:'campaignMilestone',target:0,visual:'interstellar',fill:20,endEvent:'postTransition',endLabel:'FORMAR<br>TERCEIRA GERAÇÃO',menuTag:'2ª → 3ª'},
 {id:'third_birth',branch:'Terceira Geração · Universo enriquecido',title:'Terceira Geração',meta:'Nasce com CNO, grupo do Ferro, produtos-s e produtos-r herdados de ciclos anteriores',new:'Fe',mode:'campaignMilestone',target:0,visual:'nebula',fill:18,endEvent:'postTransition',endLabel:'EXPLORAR<br>TERCEIRA GERAÇÃO',menuTag:'3ª GERAÇÃO'},
 {id:'neutron_star',branch:'Remanescente da Supernova',title:'Estrela de nêutrons',meta:'Matéria comprimida em escala extrema',new:'Fe',mode:'remnant',target:6,visual:'neutronStar',fill:22,endEvent:'postTransition',endLabel:'FORMAR<br>PULSAR',menuTag:'REMNANESCENTE'},
 {id:'pulsar',branch:'Acreção e rotação',title:'Pulsar',meta:'Cada núcleo incorporado acelera o feixe',new:'Fe',mode:'pulsar',target:5,visual:'pulsar',fill:20,endEvent:'postTransition',endLabel:'ACREÇÃO<br>EXTREMA',menuTag:'ROTAÇÃO'},
 {id:'accretion',branch:'A estrela recebe nova matéria',title:'Acreção extrema',meta:'Matéria nova chega continuamente pela periferia',new:'Fe',mode:'accretion',target:6,visual:'accretion',fill:12,feedCap:14,endEvent:'postTransition',endLabel:'INICIAR<br>rp-PROCESS',menuTag:'ACREÇÃO'},
 ...RP_PROCESS_PHASES,
 {id:'stability',branch:'Massa crítica',title:'Limite de estabilidade',meta:'A acreção parou; matéria residual ainda orbita o núcleo',new:'Fe',mode:'collapseFinal',target:1,visual:'collapseFinal',fill:10,endEvent:'postTransition',endLabel:'FORMAR<br>BURACO NEGRO',menuTag:'COLAPSO'},
 {id:'black_hole',branch:'Colapso gravitacional',title:'Buraco negro',meta:'Buraco Negro + Átomo → Acreção',new:'Fe',mode:'blackhole',target:6,visual:'blackHole',fill:6,endEvent:'finale',endLabel:'CONCLUIR<br>CICLO CÓSMICO',menuTag:'HORIZONTE'}];

function installReactionAtlasPhases(phases){
 for(const sp of ATLAS_REACTIONS.filter(x=>x.existingPhaseId)){
   const p=phases.find(x=>x.id===sp.existingPhaseId);if(!p)continue;
   Object.assign(p,{mode:'reactionExplore',atlasId:sp.id,new:sp.mainSym,target:sp.target,flowTarget:sp.target,meta:sp.label,micro:true,continueAfterComplete:true,menuTag:`${sp.a}+${sp.b}`});
 }
 const groups=new Map();
 for(const sp of ATLAS_REACTIONS){if(sp.existingPhaseId||!sp.anchorId)continue;if(!groups.has(sp.anchorId))groups.set(sp.anchorId,[]);groups.get(sp.anchorId).push(sp)}
 const original=[...phases],expanded=[];
 for(const p of original){
   expanded.push(p);
   const group=groups.get(p.id);if(group)expanded.push(...group.map(atlasPhaseFromSpec));
 }
 phases.splice(0,phases.length,...expanded);
}
installReactionAtlasPhases(PHASES);

// Anã marrom: reservatório finito de ²H + H → ³He + γ; somente H pode ser reposto.
// Cada fase combina um objetivo científico com uma meta de atividade. Reações
// anteriores compatíveis ajudam a preencher a atividade sem substituir o objetivo novo.
function configureRelaxedFlow(phases){
 const byId=new Map(phases.map(p=>[p.id,p]));
 const set=(id,target,flowTarget,extra={})=>{const p=byId.get(id);if(!p)return;Object.assign(p,{target,flowTarget,continueAfterComplete:true,...extra})};
 phases.forEach(p=>{p.continueAfterComplete=true;p.flowTarget=p.flowTarget||Math.max(6,(p.target||1)*2)});
 set('bigbang',0,0,{continueAfterComplete:false});
 set('primordial_d',4,8);
 set('primordial_t',4,8);
 set('primordial_he3',4,8);
 set('primordial_he3d',4,8);
 set('primordial_td',4,8);
 set('primordial_li',4,8);
 set('atomic_he',4,8);
 set('atomic_h',6,6);
 set('atomic_li',4,12);
 set('brown',4,8,{endLabel:'DEUTÉRIO<br>ESGOTADO',continueAfterComplete:false});
 set('he_red',6,16);set('he_orange',5,20);set('he_yellow',6,24);set('coulomb_intro',3,9);set('stellar_li',4,12);
 set('fragile',5,10);set('c',8,18);set('n',7,16);set('o',8,18);
 set('white',6,6,{mode:'whiteCompact',fill:12,branch:'Remanescentes compactos · Anã branca',meta:'Crie 3 Carbonos e 3 Oxigênios',menuTag:'REMNANESCENTE',target:3,targetC:3,targetO:3});
 set('spallation_be',4,4);set('spallation',6,6);set('proton_capture',2,2);
 RP_PROCESS_PHASES.forEach(p=>set(p.id,p.target,Math.max(6,p.target*3)));
 for(const id of ['ne','na','mg','al','si','s','ar','ca'])set(id,7,18);
 for(const id of ['p','cl','k','sc','v'])set(id,4,14);
 for(const id of ['ti','cr','mn','fe'])set(id,6,16);
 set('neutronize',8,8);
 set('co',4,4);set('ni_fusion',4,12);set('nu_f',5,12);
 set('weak_s_cu',4,12);set('weak_s_zn',5,15);set('weak_s_ga',5,15);set('weak_s_ge',6,18);set('weak_s_as',6,18);set('weak_s_se',6,18);set('weak_s_br',7,21);set('weak_s_kr',3,9);
 for(const id of ['rb','sr'])set(id,3,14);
 for(const id of ['y','zr','nb','gamma_mo','tc','gamma_ru','rh','pd','ag','cd','in','sn','sb','te','i','xe','cs','ba','la','ce','pr','nd','pm','sm'])set(id,3,12);
 set('gamma_process',4,10);
 set('pb',3,16);set('bi',3,12);
 set('eu',3,18);
 for(const id of ['gd','tb','dy','ho','er','tm','yb','lu','hf','ta','w','re','os','ir'])set(id,2,12);
 for(const id of ['pt','au'])set(id,3,16);
 for(const id of ['hg','tl'])set(id,2,12);
 set('th',3,18);set('u',3,18);
 set('decay_pa',2,2);set('decay_ra',2,2);set('decay_ac',3,3);set('decay_fr',2,2);set('decay_rn',3,3);set('decay_po',2,2);set('decay_at',2,2);
 set('final_collapse',8,12);
 set('neutron_star',8,8);set('pulsar',7,7);set('accretion',8,8);
 set('stability',1,1);set('black_hole',6,6);
 // O alvo de uma fase de produção jamais começa pronto. A primeira unidade deve nascer do gesto aprendido.
 phases.forEach(p=>{if(p.mode==='fusion'&&Array.isArray(p.pool))p.pool=p.pool.filter(sym=>sym!==p.new)});
}
configureRelaxedFlow(PHASES);

// Orçamento de duração: classes internas usadas para manter as primeiras fases
// rápidas e permitir marcos progressivamente mais longos sem cronômetro ou derrota.
const DURATION_BUDGETS=Object.freeze({
 quick:{minSeconds:60,maxSeconds:90,flow:6},
 short:{minSeconds:90,maxSeconds:150,flow:9},
 standard:{minSeconds:150,maxSeconds:210,flow:12},
 long:{minSeconds:210,maxSeconds:255,flow:15},
 epic:{minSeconds:255,maxSeconds:300,flow:18}
});
function configurePhaseDurationBudget(phases){
 const byId=new Map(phases.map(p=>[p.id,p]));
 const classify=(p)=>{
   if(p.id==='bigbang'||p.primordial)return'quick';
   if(p.mode==='guidedDecay'||p.mode==='reactionExplore'||p.micro)return'short';
   if(['remnant','pulsar','accretion','collapseFinal','blackhole','neutronize'].includes(p.mode))return'short';
   if(p.mode==='rpProcess')return'standard';
   if(p.rprocess)return'long';
   if(p.visual==='agb'||p.weakS)return'standard';
   return p.mode==='fusion'?'standard':'short';
 };
 for(const p of phases)p.durationClass=classify(p);
 const setClass=(ids,cls)=>{for(const id of ids){const p=byId.get(id);if(p)p.durationClass=cls}};
 const setTarget=(ids,target)=>{for(const id of ids){const p=byId.get(id);if(p)p.target=target}};
 setClass(['primordial_d','primordial_t','primordial_he3','primordial_he3d','primordial_td','primordial_li','atomic_he','atomic_h'],'quick');
 setClass(['atomic_li','brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_convection'],'short');
 setClass(['stellar_li','fragile','c','n','o','spallation_be','spallation'],'standard');
 setClass(['weak_s_cu','weak_s_zn','weak_s_ga','weak_s_ge','weak_s_as','weak_s_se','weak_s_br','weak_s_kr'],'standard');
 setClass(['rb','sr','y','zr','nb','gamma_mo','tc','gamma_ru','rh','pd','ag','cd','in','sn','sb','te','i','xe','cs'],'standard');
 setClass(['ba','la','ce','pr','nd','pm','sm'],'long');
 setClass(['pb','bi'],'epic');
 setClass(['eu','gd','tb','dy','ho','er','tm','yb','lu','hf','ta','w','re','os','ir'],'long');
 setClass(['pt','au','th','u'],'epic');
 setClass(['hg','tl'],'long');
 setClass(['decay_pa','decay_ra','decay_ac','decay_fr','decay_rn','decay_po','decay_at','white','final_collapse','neutron_star','pulsar','accretion','stability','black_hole'],'short');
 setClass(['rp_cu','rp_zn','rp_ga','rp_ge','rp_as','rp_se','rp_br','rp_kr'],'standard');
 setClass(['rp_rb','rp_sr','rp_y','rp_zr','rp_nb','rp_mo','rp_tc','rp_ru','rp_rh','rp_pd','rp_ag','rp_cd','rp_in','rp_sn','rp_sb'],'long');
 setClass(['rp_te'],'epic');
 // Quanto mais cara a reconstrução, menor o número de produtos repetidos.
 setTarget(['atomic_li'],3);setTarget(['fragile'],4);setTarget(['c','n','o'],5);setTarget(['spallation'],4);
 const fragilePhase=byId.get('fragile');if(fragilePhase)fragilePhase.uniqueMatterObjective=true;
 setTarget(['ne','na','mg','al','si','s','ar','ca'],5);setTarget(['ti','cr','mn','fe'],4);
 setTarget(['weak_s_cu','weak_s_zn'],4);setTarget(['weak_s_ga','weak_s_ge','weak_s_as','weak_s_se','weak_s_br'],3);setTarget(['weak_s_kr'],2);
 setTarget(['rb','sr'],3);setTarget(['y','zr','nb','gamma_mo','tc','gamma_ru','rh','pd','ag','cd','in','sn','sb','te','i','xe','cs','ba','la','ce','pr','nd','pm','sm','pb','bi'],2);
 setTarget(['eu','gd','tb','dy','ho','er','tm','yb','lu','hf','ta','w','re','os','ir','pt','au','hg','tl','th','u'],2);
 setTarget(['rp_rb','rp_sr','rp_y','rp_zr','rp_nb','rp_mo','rp_tc','rp_ru','rp_rh','rp_pd','rp_ag','rp_cd','rp_in','rp_sn','rp_sb','rp_te'],2);
 // flowTarget mede ritmo, mas nunca deve transformar a fase em trabalho artificial.
 // Redes profundas naturalmente acumulam flow durante a reconstrução; o piso da
 // classe serve principalmente para as fases mais simples e repetíveis.
 for(const p of phases){
   const budget=DURATION_BUDGETS[p.durationClass]||DURATION_BUDGETS.standard;
   if(p.id==='bigbang'){p.flowTarget=0;continue}
   if(p.id==='brown'||p.mode==='whiteCompact')continue;
   if(['guidedDecay','reactionExplore','spallation','neutrino','gamma','protonCapture','convection','neutronize','remnant','pulsar','accretion','collapseFinal','blackhole'].includes(p.mode)){
     p.flowTarget=Math.max(1,p.target||1);continue;
   }
   if(p.primordial){p.flowTarget=Math.max(p.target||1,Math.min(budget.flow,(p.target||1)*2));continue}
   const objectiveFloor=Math.max(1,Math.ceil((p.target||1)*1.5));
   p.flowTarget=Math.max(objectiveFloor,budget.flow);
 }
 // Todos os modos recebem a janela-alvo como metadado de balanceamento.
 for(const p of phases){const b=DURATION_BUDGETS[p.durationClass]||DURATION_BUDGETS.standard;p.durationMinSeconds=b.minSeconds;p.durationMaxSeconds=b.maxSeconds}
}
configurePhaseDurationBudget(PHASES);

// Regra global de progressão relaxante: cada fase de captura recebe exatamente
// uma semente que pode produzir diretamente uma unidade do objetivo. As unidades
// restantes precisam ser reconstruídas pelo jogador a partir da matéria-base.
function configureSingleObjectiveIngredients(phases){
 for(const p of phases){
   if(p.mode==='rpProcess'){p.seedCount=1;p.singleObjectiveSeed=true;continue}
   const cls=neutronProcessClass(p);
   if(p.mode==='neutron'&&p.seed&&cls){
     p.seedCount=1;p.singleObjectiveSeed=true;p.chainRebuild=true;
     p.allowBackground=['H','He','C','N','O','Fe'];
     const baseCount=Math.max(0,(p.target||1)-1);
     p.starterGroups=[[p.seed],...Array.from({length:baseCount},()=>['Fe'])];
   }
 }
}
configureSingleObjectiveIngredients(PHASES);

// Personalidade das fases de captura de nêutrons. Os padrões abaixo alteram
// o ritmo/decisão sem mudar a regra central: uma única semente direta por fase.
function configureNeutronGameplay(phases){
 const byId=new Map(phases.map(p=>[p.id,p])),set=(ids,pattern,extra={})=>{for(const id of ids){const p=byId.get(id);if(p)Object.assign(p,{neutronPattern:pattern,...extra})}};
 set(['weak_s_cu','weak_s_ge'],'drizzle');
 set(['weak_s_zn'],'source22',{neutronSource:'Ne22',neutronSourceProduct:'Mg',neutronSourceBurst:6,requiresNeutronSource:true});
 set(['weak_s_ga','weak_s_se','nb','la','nd'],'betaWait',{neutronBetaRounds:2});
 set(['weak_s_br','gamma_mo','pd','sn','cs'],'pulse',{neutronPulseSize:4,neutronPulseInterval:1550});
 set(['weak_s_kr','gamma_ru','cd','te'],'pulseStrong',{neutronPulseSize:6,neutronPulseInterval:1900});
 set(['rb','rh','sb'],'branch',{neutronBetaRounds:2,requiresNeutronBranch:true});
 set(['sr','y','zr'],'shell',{neutronShellExposure:2});
 set(['tc','ag','in','i','xe','pr','pm','sm'],'source13',{neutronSource:'C13',neutronSourceProduct:'O',neutronSourceBurst:4,requiresNeutronSource:true});
 set(['ba','ce'],'shell',{neutronShellExposure:3});
 set(['pb'],'shell',{neutronShellExposure:4});
 set(['bi'],'pulseStrong',{neutronPulseSize:7,neutronPulseInterval:2100});
 set(['eu','gd','dy','er','yb','hf','w','os','pt','hg','th'],'rStorm',{neutronStormSize:9,neutronStormInterval:900});
 set(['tb','ho','tm','lu','ta','re','ir','tl'],'rWave',{neutronStormSize:6,neutronStormInterval:1250});
 set(['au','u'],'rFreezeout',{neutronStormSize:10,neutronStormInterval:820,requiresFreezeout:true});
}
configureNeutronGameplay(PHASES);

function neutronGameplay(s=phase()){
 const pattern=s?.neutronPattern||'';
 return{pattern,
  source:s?.neutronSource||null,sourceProduct:s?.neutronSourceProduct||null,sourceBurst:s?.neutronSourceBurst||0,
  requiresSource:!!s?.requiresNeutronSource,betaRounds:Math.max(1,s?.neutronBetaRounds||2),requiresBranch:!!s?.requiresNeutronBranch,
  shellExposure:Math.max(0,s?.neutronShellExposure||0),pulseSize:Math.max(0,s?.neutronPulseSize||0),pulseInterval:s?.neutronPulseInterval||0,
  stormSize:Math.max(0,s?.neutronStormSize||0),stormInterval:s?.neutronStormInterval||0,requiresFreezeout:!!s?.requiresFreezeout};
}
function neutronSourceLabel(s=phase()){
 const g=neutronGameplay(s);if(g.source==='C13')return'¹³C + ⁴He → ¹⁶O + n';if(g.source==='Ne22')return'²²Ne + ⁴He → ²⁵Mg + n';return'';
}
function neutronPatternLabel(s=phase()){
 const g=neutronGameplay(s);return g.pattern==='branch'?'RAMIFICAÇÃO':g.pattern==='shell'?'CASCA MÁGICA':g.pattern==='pulse'?'PULSO DE n':g.pattern==='pulseStrong'?'PULSO TÉRMICO':g.pattern==='rStorm'?'TEMPESTADE-r':g.pattern==='rWave'?'ONDA-r':g.pattern==='rFreezeout'?'TEMPESTADE → FREEZE-OUT':g.source?'FONTE DE NÊUTRONS':g.pattern==='betaWait'?'ESPERA β−':'FLUXO LENTO';
}

const STELLAR_POPUPS={
 bigBang:{kicker:'Início do Universo',title:'BIG BANG',sub:'Universo quente e denso → expansão',line:'Toque para iniciar a expansão',art:'bigBang'},
 primordialD:{kicker:'Nucleossíntese primordial',title:'PRIMEIRO NÚCLEO',sub:'p + n → ²H + γ',line:'Selecione um próton e depois um nêutron',art:'primordialH'},
 primordialT:{kicker:'Nucleossíntese primordial',title:'TRÍTIO',sub:'²H + n → ³H + γ',line:'Selecione ²H e depois um nêutron',art:'primordialH'},
 primordialHe3:{kicker:'Nucleossíntese primordial',title:'HÉLIO-3',sub:'²H + p → ³He + γ',line:'Selecione ²H e depois um próton',art:'primordialH'},
 primordialHe:{kicker:'Nucleossíntese primordial',title:'HÉLIO-4',sub:'³He + ²H → ⁴He + p',line:'Selecione ³He e depois ²H',art:'primordialHe'},
 primordialLi:{kicker:'Nucleossíntese primordial',title:'LÍTIO-7',sub:'⁴He + ³H → ⁷Li + γ',line:'Selecione ⁴He e depois ³H',art:'primordialLi'},
 atomicHe:{kicker:'Era atômica',title:'HÉLIO',sub:'⁴He²⁺ + 2e⁻ → He',line:'Selecione o núcleo de Hélio e depois um elétron',art:'primordialHe'},
 atomicH:{kicker:'Era atômica',title:'HIDROGÊNIO',sub:'p + e⁻ → H + γ',line:'Selecione um próton e depois um elétron',art:'primordialH'},
 atomicLi:{kicker:'Era atômica',title:'LÍTIO',sub:'⁷Li³⁺ + 3e⁻ → Li',line:'Selecione o núcleo de Lítio e depois um elétron',art:'primordialLi'},
 nebula:{kicker:'Nascimento estelar',title:'NEBULOSA',sub:'Uma nuvem fria começa a se concentrar',line:'Nuvens moleculares frias podem fragmentar e colapsar, formando núcleos que darão origem a novas estrelas.'},
 brownDwarf:{kicker:'Primeira tentativa de estrela',title:'ANÃ MARROM',sub:'Queima um reservatório pequeno de Deutério e depois esfria',line:'Una Deutério e Hidrogênio para formar Hélio-3 e liberar um fóton γ. O Deutério desta fase é finito: quando o reservatório acaba, a queima termina.'},
 redDwarf:{kicker:'Estrela de baixa massa',title:'ANÃ VERMELHA',sub:'Pequena, fria e extremamente longeva',line:'Dentro da estrela, quatro núcleos de Hidrogênio participam da cadeia próton-próton. Durante o processo, dois prótons tornam-se nêutrons; o saldo final é um núcleo de Hélio-4 e energia.'},
 orangeDwarf:{kicker:'Estrela de massa intermediária',title:'ANÃ LARANJA',sub:'Uma estrela K de sequência principal',line:'A cadeia próton-próton passa por Deutério e Hélio-3 antes de formar Hélio-4; a primeira etapa também libera um pósitron e um neutrino.'},
 yellowDwarf:{kicker:'Estrela semelhante ao Sol',title:'ANÃ AMARELA',sub:'Uma estrela G de sequência principal',line:'No ramo pp-I, dois núcleos de Hélio-3 se unem para formar Hélio-4 e devolvem dois prótons ao plasma, que podem voltar ao início da cadeia.'},
 redGiant:{kicker:'Evolução da estrela semelhante ao Sol',title:'GIGANTE VERMELHA',sub:'Camadas externas expandidas, núcleo muito quente',line:'Durante a queima de Hélio, o núcleo pode produzir Carbono e Oxigênio enquanto a superfície permanece relativamente fria.'},
 whiteDwarf:{kicker:'Remanescente compacto',title:'ANÃ BRANCA',sub:'Crie Carbono e Oxigênio para formar o núcleo remanescente',line:'Use Hélio para formar Berílio-8, depois Carbono e Oxigênio. A estratificação levará C/O ao interior enquanto Hélio e Hidrogênio permanecem nas regiões externas e a rede eletrônica atravessa todo o remanescente.'},
 neutrino:{kicker:'Supernova',title:'NEUTRINOS DA SUPERNOVA',sub:'Quase todos atravessam a matéria; raramente um interage',art:'ironCore',line:'Nesta representação do ν-processo, você direciona neutrinos para núcleos de Neônio. A interação é rara na natureza; o jogo a torna selecionável para mostrar como neutrinos também podem participar da origem do Flúor.'},
 gamma:{kicker:'Supernova',title:'TEMPESTADE DE FÓTONS',sub:'Radiação intensa também pode desmontar núcleos',art:'ironCore',line:'No γ-processo, fótons muito energéticos podem arrancar nêutrons de núcleos já existentes. Aqui cada impacto (γ,n) mantém Mo ou Ru, mas reduz o número de massa e cria um isótopo mais proton-rich.'},
 decayGarden:{kicker:'Bilhões de anos depois',title:'JARDIM RADIOATIVO',sub:'A matéria continua mudando depois que as estrelas terminam',art:'interstellar',line:'Toque em qualquer núcleo pulsante quando quiser. As setas α e β− respeitam as mudanças de isótopo mostradas; trechos longos aparecem explicitamente como várias etapas. Ramos raros revelam Frâncio e Astato.'},
 spallation:{kicker:'Meio interestelar',title:'ESPALAÇÃO CÓSMICA',sub:'Aqui, criar elementos significa quebrar núcleos',line:'Raios cósmicos de alta energia podem atingir Carbono, Nitrogênio e Oxigênio e fragmentá-los. Essas colisões ajudam a produzir núcleos leves como Lítio, Berílio e Boro.'},
 explosive:{kicker:'Supernova',title:'NUCLEOSSÍNTESE EXPLOSIVA',sub:'A explosão abre novas rotas além do grupo do Ferro',art:'ironCore',line:'Choques, altas temperaturas e expansão rápida produzem uma mistura de núcleos. Nesta representação agregada, Co, Ni, Cu, Zn, Ga e Ge aparecem como produtos de condições explosivas; o objetivo principal é Zinco.'},
 weakS:{kicker:'Outra linhagem estelar',title:'PROCESSO-S FRACO',sub:'Capturas lentas atravessam a região entre Ni e Kr',art:'massive',line:'Agora a campanha muda para outra estrela massiva. Um nêutron capturado cria um isótopo mais rico em nêutrons; quando ele sofre decaimento β−, um nêutron vira próton e a identidade química avança. A rota Ni→Kr é uma representação agregada de muitas capturas e decaimentos reais.'},
 agbBranch:{kicker:'Outra linhagem estelar',title:'RAMIFICAÇÃO DO PROCESSO-S',sub:'Rubídio revela a importância da densidade de nêutrons',art:'agb',line:'Em estrelas AGB, a competição entre capturar outro nêutron e decair pode desviar a rota nuclear. O Rubídio é usado como marcador dessas condições antes da chegada ao Estrôncio, no primeiro pico do processo-s.'},
 protonCapture:{kicker:'Nova habilidade',title:'CAPTURA DE PRÓTONS',sub:'p + núcleo → novo estado nuclear',line:'Aproxime um próton de núcleos diferentes e observe quais estados permanecem estáveis.',art:'massive'},
 massive:{kicker:'Nova escala de estrela',title:'ESTRELA MASSIVA',sub:'Uma forja muito mais quente e veloz',line:'Nas fases avançadas, estrelas massivas alcançam temperaturas suficientes para acender sucessivas redes de fusão.'},
 supergiant:{kicker:'Fases finais de estrela massiva',title:'SUPERGIGANTE',sub:'Uma enorme estrela com fusão em camadas',line:'Supergigantes podem manter diferentes combustíveis nucleares queimando em camadas ao redor de um núcleo cada vez mais pesado.'},
 deepCore:{kicker:'Interior extremo',title:'NÚCLEO PROFUNDO',sub:'As últimas fusões acontecem rapidamente',line:'À medida que o combustível fica mais pesado, cada estágio de queima tende a durar muito menos que o anterior.'},
 ironCore:{kicker:'Limite energético',title:'NÚCLEO DO GRUPO DO FERRO',sub:'A fusão deixa de sustentar o centro da estrela',line:'Núcleos próximos ao Ferro marcam o fim da sequência de fusões que fornece energia líquida para sustentar a estrela.'},
 collapse:{kicker:'Neutronização',title:'COLAPSO DO NÚCLEO',sub:'A gravidade comprime o centro em segundos',line:'Durante o colapso, o núcleo de Ferro atinge densidades extremas e a matéria torna-se muito rica em nêutrons.'},
 agb:{kicker:'Estrela evoluída',title:'ESTRELA AGB',sub:'Pulsos térmicos e captura lenta de nêutrons',line:'Em estrelas AGB, fontes internas de nêutrons alimentam o processo-s e ajudam a produzir elementos pesados ao longo do tempo.'},
 kilonova:{kicker:'Evento cósmico extremo',title:'KILONOVA',sub:'Ejetos muito ricos em nêutrons',line:'A matéria ejetada em fusões de estrelas de nêutrons oferece condições excepcionais para o processo-r formar núcleos muito pesados.'},
 neutronStar:{kicker:'Remanescente da Supernova',title:'ESTRELA DE NÊUTRONS',sub:'Uma massa estelar comprimida em poucos quilômetros',line:'Estrelas de nêutrons concentram uma massa comparável à do Sol em uma esfera com dezenas de quilômetros de diâmetro.'},
 pulsar:{kicker:'Rotação extrema',title:'PULSAR',sub:'Uma estrela de nêutrons com feixes que varrem o espaço',line:'Quando uma estrela de nêutrons recebe matéria, a transferência de momento angular pode acelerar sua rotação e produzir pulsações cada vez mais rápidas.'},
 accretion:{kicker:'Acreção extrema',title:'ESTRELA DE NÊUTRONS',sub:'O remanescente continua ganhando massa',line:'Em um sistema binário, matéria capturada de uma companheira pode formar um disco de acreção e aumentar a massa da estrela de nêutrons.'},
 rpProcess:{kicker:'Explosão termonuclear de raios X',title:'rp-PROCESS',sub:'Capturas rápidas de prótons em matéria acrecionada',line:'Hidrogênio e Hélio acumulados na superfície de uma estrela de nêutrons podem alimentar uma sequência de capturas de prótons e decaimentos β⁺. A campanha termina no ciclo Sn–Sb–Te.',art:'accretion'},
 stability:{kicker:'Massa crítica',title:'LIMITE DE ESTABILIDADE',sub:'A pressão interna já quase perde para a gravidade',line:'O limite máximo depende da física da matéria ultradensa. Acima dele, o remanescente pode colapsar para um buraco negro.'},
 blackHole:{kicker:'Colapso gravitacional',title:'BURACO NEGRO',sub:'Buraco Negro + Átomo → Acreção',line:'Selecione o Buraco Negro e um átomo. A matéria espirala para dentro, aquece e pode emitir radiação de alta energia antes de atravessar o horizonte.'}
};
function stellarKeyForPhase(s=phase()){
 if(s.mode==='opening'||s.id==='bigbang')return 'bigBang';
 if(s.id==='primordial_d')return 'primordialD';
 if(s.id==='primordial_t')return 'primordialT';
 if(s.id==='primordial_he3')return 'primordialHe3';
 if(['primordial_he3d','primordial_td'].includes(s.id))return 'primordialHe';
 if(s.id==='primordial_li')return 'primordialLi';
 if(s.id==='atomic_he')return 'atomicHe';
 if(s.id==='atomic_h')return 'atomicH';
 if(s.id==='atomic_li')return 'atomicLi';
 if(s.mode==='spallation')return 'spallation';
 if(s.mode==='protonCapture')return 'protonCapture';
 if(s.mode==='rpProcess')return 'rpProcess';
 if(s.mode==='neutrino')return 'neutrino';
 if(s.mode==='gamma')return 'gamma';
 if(s.mode==='decayGarden'||s.mode==='guidedDecay')return 'decayGarden';
 if(s.id==='ni_fusion')return 'ironCore';
 if(s.weakS)return 'weakS';
 if(s.id==='rb')return 'agbBranch';
 if(s.id==='final_collapse')return 'collapse';
 if(s.visual==='neutronStar')return 'neutronStar';
 if(s.visual==='pulsar')return 'pulsar';
 if(s.visual==='accretion')return 'accretion';
 if(s.visual==='collapseFinal')return 'stability';
 if(s.visual==='blackHole')return 'blackHole';
 if(s.mode==='neutronize')return 'collapse';
 if(s.visual==='nebula')return 'nebula';
 if(s.visual==='brownDwarf')return 'brownDwarf';
 if(s.visual==='redDwarf')return 'redDwarf';
 if(s.visual==='orangeDwarf')return 'orangeDwarf';
 if(s.visual==='yellowDwarf')return 'yellowDwarf';
 if(s.visual==='redGiant')return 'redGiant';
 if(s.visual==='whiteDwarf')return 'whiteDwarf';
 if(s.visual==='massive')return 'massive';
 if(s.visual==='supergiant')return 'supergiant';
 if(s.visual==='advanced')return 'supergiant';
 if(s.id==='mn')return 'deepCore';
 if(s.visual==='ironCore')return 'ironCore';
 if(s.visual==='agb')return 'agb';
 if(s.visual==='kilonova')return 'kilonova';
 return null;
}

const ELEMENT_FACTS={
 "H":"O hidrogênio é o elemento mais abundante do cosmos: representa cerca de 75% da matéria normal do Universo e é o principal combustível das estrelas.",
 "He":"O hélio foi identificado primeiro no espectro do Sol e só depois encontrado na Terra; seu nome vem de Hélios, o deus grego do Sol.",
 "Li":"O lítio é o metal mais leve e um dos poucos elementos produzidos em pequenas quantidades já nos primeiros minutos do Universo.",
 "Be":"O berílio é tão transparente aos raios X que é usado em janelas de equipamentos de raios X, apesar de ser um metal rígido e muito leve.",
 "B":"O boro forma materiais extremamente duros, como o carbeto de boro, e também é um micronutriente essencial para o crescimento das plantas.",
 "C":"Diamante e grafite são feitos do mesmo elemento, carbono; a diferença está apenas na maneira como seus átomos se organizam.",
 "N":"Quase 78% da atmosfera terrestre é nitrogênio, embora a maioria dos seres vivos não consiga usar diretamente o N₂ do ar.",
 "O":"O oxigênio corresponde a cerca de 21% da atmosfera terrestre e é o elemento mais abundante da crosta da Terra em massa.",
 "F":"O flúor é o elemento mais eletronegativo da tabela periódica e reage com praticamente todos os outros elementos.",
 "Ne":"O neônio deu origem às famosas luzes vermelho-alaranjadas dos letreiros; seu nome vem do grego neos, “novo”.",
 "Na":"O sódio metálico reage intensamente com água, mas seus íons são indispensáveis para impulsos nervosos e equilíbrio de fluidos no corpo.",
 "Mg":"O magnésio fica no centro da molécula de clorofila, ajudando as plantas a capturar a energia da luz.",
 "Al":"O alumínio é o metal mais abundante da crosta terrestre, mas raramente aparece puro porque se liga facilmente ao oxigênio.",
 "Si":"O silício é o segundo elemento mais abundante da crosta terrestre e sua capacidade de controlar corrente elétrica sustenta grande parte da eletrônica moderna.",
 "P":"O fósforo recebeu um nome que significa “portador de luz”; certas formas podem emitir um brilho fraco ao reagir lentamente com o oxigênio.",
 "S":"O enxofre puro praticamente não tem cheiro: o odor de “ovo podre” vem principalmente do gás sulfeto de hidrogênio.",
 "Cl":"O cloro elementar é um gás tóxico, enquanto o íon cloreto é parte do sal de cozinha e essencial ao equilíbrio químico do organismo.",
 "Ar":"O argônio compõe quase 1% do ar terrestre e recebeu um nome ligado à ideia de “inativo” por sua baixa reatividade química.",
 "K":"Uma pequena fração do potássio natural é o radioisótopo potássio-40, por isso alimentos e até o corpo humano possuem uma radioatividade natural minúscula.",
 "Ca":"O cálcio não serve apenas para ossos: seus íons funcionam como sinais químicos essenciais para a contração dos músculos e muitas atividades celulares.",
 "Sc":"O escândio foi previsto por Mendeleev antes de ser descoberto; ele o chamou provisoriamente de “eka-boro” ao notar uma lacuna em sua tabela.",
 "Ti":"O titânio combina baixa densidade, grande resistência e excelente resistência à corrosão, por isso aparece de implantes médicos a aeronaves.",
 "V":"O vanádio é um verdadeiro “camaleão químico”: seus diferentes estados de oxidação produzem cores intensas, característica ligada ao nome Vanadis, deusa nórdica associada à beleza.",
 "Cr":"Traços de cromo dão ao rubi sua cor vermelha e também podem contribuir para o verde das esmeraldas.",
 "Mn":"Átomos de manganês fazem parte do complexo que permite às plantas separar moléculas de água durante a fotossíntese e liberar oxigênio.",
 "Fe":"O ferro domina grande parte do núcleo da Terra e também ocupa uma posição especial nas estrelas: perto dele, a fusão deixa de liberar energia de forma eficiente.",
 "Co":"O cobalto está no centro da vitamina B12, uma das poucas vitaminas que contém diretamente um átomo metálico.",
 "Ni":"Muitos meteoritos metálicos são ricos em ferro e níquel, uma composição parecida com a esperada para os núcleos de pequenos corpos diferenciados.",
 "Cu":"O cobre é um dos poucos metais naturalmente coloridos e sua excelente condução elétrica fez dele um material central em fios e circuitos.",
 "Zn":"Uma fina camada de zinco pode proteger aço contra ferrugem por galvanização, corroendo-se preferencialmente no lugar do ferro.",
 "Ga":"O gálio derrete a apenas cerca de 30 °C, por isso um pequeno pedaço pode literalmente fundir com o calor da mão.",
 "Ge":"O germânio foi previsto por Mendeleev antes de ser descoberto e depois se tornou um dos materiais fundamentais dos primeiros transistores.",
 "As":"O arsênio é famoso por sua toxicidade, mas compostos como arseneto de gálio são valiosos em LEDs, lasers e eletrônica de alta frequência.",
 "Se":"O selênio recebeu seu nome de Selene, a deusa grega da Lua, e em pequenas quantidades é um micronutriente essencial.",
 "Br":"O bromo é o único elemento não metálico que é líquido em condições ambientes; seu vapor possui uma intensa cor castanho-avermelhada.",
 "Kr":"O criptônio é um gás nobre cujo nome vem do grego kryptos, “escondido”; ele é usado em algumas lâmpadas, flashes e lasers.",
 "Rb":"Transições extremamente regulares do rubídio-87 são usadas como referência em relógios atômicos compactos.",
 "Sr":"Sais de estrôncio produzem uma cor vermelha intensa e são usados para criar os tons carmesim de fogos de artifício.",
 "Y":"O ítrio aparece em fósforos, LEDs e cerâmicas avançadas; seu nome vem da vila sueca de Ytterby, famosa por revelar vários elementos.",
 "Zr":"O zircônio resiste muito bem à corrosão, enquanto seu óxido, zircônia, pode formar a gema sintética conhecida como zircônia cúbica.",
 "Nb":"Ligas de nióbio e titânio se tornam supercondutoras e são usadas nos ímãs extremamente fortes de muitos aparelhos de ressonância magnética.",
 "Mo":"O molibdênio suporta temperaturas elevadas e também é parte de enzimas essenciais que permitem a muitos organismos processar nitrogênio e enxofre.",
 "Tc":"O tecnécio foi o primeiro elemento produzido artificialmente e não possui nenhum isótopo estável.",
 "Ru":"O rutênio pertence ao grupo da platina e pequenas quantidades dele podem tornar ligas mais duras e resistentes ao desgaste.",
 "Rh":"O ródio é um dos metais mais raros e valiosos e é amplamente usado em catalisadores automotivos para reduzir gases poluentes.",
 "Pd":"O paládio pode incorporar grande quantidade de hidrogênio em sua estrutura metálica e também é importante em catalisadores.",
 "Ag":"A prata possui a maior condutividade elétrica entre os metais, embora cobre seja mais usado em fios por ser muito mais barato.",
 "Cd":"O cádmio absorve nêutrons com eficiência, característica que permitiu seu uso em alguns sistemas de controle de reatores nucleares.",
 "In":"O índio é muito macio e seu óxido combinado com estanho forma revestimentos transparentes e condutores usados em muitas telas sensíveis ao toque.",
 "Sn":"O estanho foi decisivo para a história humana porque, misturado ao cobre, produz bronze e deu nome a toda uma era tecnológica.",
 "Sb":"O antimônio é conhecido desde a Antiguidade e hoje seus compostos aparecem em ligas, semicondutores e materiais retardantes de chama.",
 "Te":"O telúrio é um dos poucos elementos batizados em homenagem à própria Terra: seu nome vem do latim tellus.",
 "I":"O iodo sólido pode formar um vapor violeta intenso e seus átomos são indispensáveis para os hormônios produzidos pela tireoide.",
 "Xe":"O xenônio é um gás nobre pesado que pode funcionar como anestésico e também como propelente em motores iônicos de espaçonaves.",
 "Cs":"A definição moderna do segundo é baseada exatamente em 9.192.631.770 oscilações associadas a uma transição do átomo de césio-133.",
 "Ba":"O sulfato de bário bloqueia fortemente raios X e, por ser muito pouco solúvel, é usado como contraste em certos exames do sistema digestivo.",
 "La":"O nome lantânio significa aproximadamente “escondido”, porque ele permaneceu oculto em minerais misturado a elementos quimicamente muito parecidos.",
 "Ce":"O cério é a terra rara mais abundante e ligas ricas nesse elemento produzem as faíscas de muitos acendedores.",
 "Pr":"Compostos de praseodímio podem dar ao vidro e à cerâmica tons verdes e amarelos característicos.",
 "Nd":"Ímãs de neodímio estão entre os ímãs permanentes mais fortes já produzidos e aparecem de fones de ouvido a motores elétricos.",
 "Pm":"O promécio não possui isótopos estáveis e recebeu o nome de Prometeu, personagem mitológico que roubou o fogo dos deuses.",
 "Sm":"Ímãs de samário-cobalto mantêm boa parte de sua força mesmo em temperaturas elevadas, característica útil em ambientes extremos.",
 "Eu":"Compostos de európio produzem vermelho intenso em fósforos e marcas de segurança; astrônomos também usam o elemento como marcador do processo-r.",
 "Gd":"O gadolínio possui enorme capacidade de capturar nêutrons; compostos cuidadosamente ligados também são usados como agentes de contraste em ressonância magnética.",
 "Tb":"Compostos de térbio emitem um verde brilhante e são usados em fósforos de telas, lâmpadas e dispositivos de segurança.",
 "Dy":"O nome disprósio vem de uma palavra grega que significa “difícil de obter”, refletindo a dificuldade histórica de separá-lo das outras terras raras.",
 "Ho":"O hólmio possui um dos maiores momentos magnéticos entre os elementos e seus íons também são usados em alguns lasers médicos.",
 "Er":"Íons de érbio amplificam luz no comprimento de onda usado por fibras ópticas de telecomunicação, ajudando sinais a viajar grandes distâncias.",
 "Tm":"O túlio é uma das terras raras naturais menos abundantes e certos de seus isótopos podem ser usados como pequenas fontes de raios X.",
 "Yb":"O itérbio é usado em lasers de fibra de alta potência e em relógios atômicos experimentais de precisão extraordinária.",
 "Lu":"O lutécio é o mais pesado dos lantanídeos e aparece em cristais usados para detectar os fótons em alguns equipamentos de PET.",
 "Hf":"O háfnio absorve nêutrons com eficiência e também aparece em materiais “high-k” que permitiram reduzir ainda mais os transistores modernos.",
 "Ta":"O tântalo resiste excepcionalmente à corrosão e sua capacidade de armazenar carga em pouco volume o tornou importante em capacitores eletrônicos.",
 "W":"O tungstênio possui o maior ponto de fusão entre todos os metais puros, acima de 3.400 °C.",
 "Re":"O rênio é um dos elementos mais raros da crosta e ajuda superligas de turbinas a manter resistência em temperaturas extremas.",
 "Os":"O ósmio está entre os elementos naturais mais densos conhecidos e pertence ao mesmo grupo de metais nobres da platina.",
 "Ir":"O irídio resiste extraordinariamente à corrosão; uma camada mundial enriquecida nesse elemento ajudou a ligar o fim dos dinossauros ao impacto de um asteroide.",
 "Pt":"A platina é densa, pouco reativa e excelente catalisadora, por isso aparece tanto em joias quanto em processos químicos e catalisadores.",
 "Au":"O ouro é tão maleável que pode ser transformado em folhas extremamente finas, além de resistir muito bem à oxidação e ao escurecimento.",
 "Hg":"O mercúrio é o único metal que permanece líquido em condições ambientes comuns, característica que levou ao seu uso histórico em termômetros.",
 "Tl":"O tálio foi descoberto por uma linha verde brilhante em seu espectro; seu nome vem do grego thallos, “broto verde”.",
 "Pb":"O chumbo é muito denso e absorve bem radiação; isótopos estáveis de chumbo também aparecem como produtos finais de grandes cadeias naturais de decaimento.",
 "Bi":"O bismuto-209 foi considerado estável por muito tempo, mas hoje se sabe que sofre decaimento alfa com uma meia-vida enormemente maior que a idade do Universo.",
 "Po":"O polônio foi descoberto por Marie e Pierre Curie e recebeu esse nome em homenagem à Polônia, terra natal de Marie Curie.",
 "At":"O astato é um dos elementos naturais mais raros da Terra; todos os seus isótopos conhecidos são radioativos e de vida relativamente curta.",
 "Rn":"O radônio é um gás nobre radioativo produzido em cadeias de decaimento naturais e pode se acumular em ambientes fechados vindo do solo e das rochas.",
 "Fr":"O frâncio é extremamente raro na natureza e todos os seus isótopos são radioativos; seu nome homenageia a França.",
 "Ra":"O rádio é intensamente radioativo e seu decaimento pode produzir radônio; seu nome deriva da palavra latina para “raio”.",
 "Ac":"O actínio deu nome à série dos actinídeos e todos os seus isótopos são radioativos.",
 "Th":"O tório recebeu o nome do deus nórdico Thor e seu isótopo mais comum, tório-232, possui meia-vida comparável à idade do Universo.",
 "Pa":"O protactínio recebeu esse nome porque certos isótopos atuam como “pais” do actínio em cadeias radioativas naturais.",
 "U":"O urânio foi batizado em homenagem ao planeta Urano; cadeias naturais de seus isótopos terminam, após muitos decaimentos, em formas estáveis de chumbo."
};

const PHASE_FACTS={
 "bigbang":"O Big Bang não foi uma explosão em um ponto do espaço: foi a expansão do próprio espaço a partir de um estado extremamente quente e denso.",
 "primordial_d":"Quando o Universo esfriou o bastante para o Deutério sobreviver aos fótons energéticos, a nucleossíntese de núcleos leves pôde avançar rapidamente.",
 "primordial_t":"O Trítio possui um próton e dois nêutrons. Ele é radioativo, mas sua vida é enorme comparada aos poucos minutos da nucleossíntese primordial.",
 "primordial_he3":"³H e ³He têm o mesmo número de núcleons, mas trocar um nêutron por um próton muda a identidade química do núcleo.",
 "primordial_he3d":"A reação ³He + ²H → ⁴He + p devolve um próton ao plasma enquanto constrói um núcleo de Hélio-4.",
 "primordial_td":"A reação ³H + ²H → ⁴He + n devolve um nêutron: os dois ramos primordiais convergem para Hélio-4 por caminhos complementares.",
 "primordial_li":"O lítio primordial é muito raro; sua abundância continua sendo um teste importante dos modelos do Universo jovem.",
 "atomic_he":"A recombinação é uma mudança atômica: o núcleo permanece o mesmo enquanto elétrons passam a ficar ligados a ele.",
 "atomic_h":"O átomo neutro de Hidrogênio possui um próton e um elétron. Seu núcleo é exatamente um próton.",
 "atomic_li":"Um átomo neutro de Lítio possui três elétrons porque seu núcleo possui três prótons.",
 "brown":"As anãs marrons são pontes cósmicas entre planetas gigantes e estrelas; algumas possuem atmosferas exóticas com nuvens de silicatos e gotículas de ferro.",
 "he_red":"Anãs vermelhas consomem combustível tão lentamente que as menores podem brilhar por trilhões de anos — muito mais que a idade atual do Universo.",
 "he_orange":"Anãs laranjas podem permanecer estáveis por dezenas de bilhões de anos, mais tempo que estrelas semelhantes ao Sol.",
 "he_yellow":"O Sol funde centenas de milhões de toneladas de hidrogênio por segundo, convertendo uma pequena parte dessa massa diretamente em energia.",
 "coulomb_intro":"Núcleos positivos se repelem eletricamente. Regiões mais quentes e densas do interior estelar tornam encontros nucleares muito mais prováveis.",
 "fragile":"O berílio-8 existe por uma fração minúscula de segundo; essa instabilidade torna a formação de carbono nas estrelas um verdadeiro jogo de timing nuclear.",
 "white":"A pressão de degenerescência dos elétrons sustenta uma anã branca mesmo depois que a fusão nuclear sustentada terminou.",
 "spallation_be":"Berílio e boro são raros no cosmos porque estrelas os destroem com facilidade; raios cósmicos ajudam a repor esses elementos ao fragmentar C, N e O.",
 "spallation":"Boro e berílio são exceções curiosas: grande parte de sua produção cósmica vem da fragmentação de núcleos por raios cósmicos, não da fusão estelar comum.",
 "neutronize":"Durante o colapso do núcleo de uma estrela massiva, elétrons podem ser capturados por prótons, formando nêutrons e liberando neutrinos.",
 "nu_f":"Neutrinos interagem tão pouco com a matéria que quase todos atravessam uma estrela — e até a Terra — sem colidir com nada.",
 "gamma_process":"Na fotodesintegração, um fóton extremamente energético pode arrancar partículas de um núcleo sem precisar ser capturado por ele.",
 "decay_pa":"O protactínio recebeu esse nome porque certos isótopos atuam como “pais” do actínio em cadeias radioativas naturais.",
 "decay_ra":"O rádio é intensamente radioativo e seu decaimento pode produzir radônio; seu nome deriva da palavra latina para “raio”.",
 "decay_ac":"O actínio deu nome à série dos actinídeos e todos os seus isótopos são radioativos.",
 "decay_fr":"O frâncio é extremamente raro na natureza e todos os seus isótopos são radioativos; seu nome homenageia a França.",
 "decay_rn":"O radônio é um gás nobre radioativo produzido em cadeias de decaimento naturais e pode se acumular em ambientes fechados vindo do solo e das rochas.",
 "decay_at":"O astato é um dos elementos naturais mais raros da Terra; todos os seus isótopos conhecidos são radioativos e de vida relativamente curta.",
 "decay_garden":"As grandes cadeias naturais de decaimento do urânio e do tório atravessam muitos elementos diferentes antes de terminar em isótopos estáveis de chumbo.",
 "final_collapse":"O colapso do núcleo de uma estrela massiva acontece em uma fração de segundo e pode desencadear uma supernova que lança material enriquecido pelo espaço.",
 "neutron_star":"Uma estrela de nêutrons pode conter mais massa que o Sol em uma esfera com apenas algumas dezenas de quilômetros de diâmetro.",
 "pulsar":"Pulsares funcionam como faróis cósmicos: feixes de radiação varrem o espaço a cada rotação, e alguns giram centenas de vezes por segundo.",
 "accretion":"Matéria caindo em direção a um objeto compacto pode aquecer a milhões de graus em um disco de acreção e brilhar intensamente em raios X.",
 "stability":"Se uma estrela de nêutrons acumular massa além do que a pressão interna consegue sustentar, a gravidade pode vencer e provocar novo colapso.",
 "black_hole":"Nada que cruza o horizonte de eventos pode voltar para fora, mas o material ainda do lado de fora pode formar um disco extremamente brilhante."
};
function phaseFact(s=phase()){
 const specific=PHASE_FACTS[s.id];
 if(specific)return specific;
 if(ELEMENT_FACTS[s.new])return ELEMENT_FACTS[s.new];
 return 'Cada ambiente cósmico deixa uma assinatura diferente na matéria, revelando como estrelas, explosões e decaimentos constroem os elementos.';
}

function baseElementSym(sym){return({D:'H',T:'H',He3:'He',HeU:'He',Be7:'Be',Be8:'Be',FeU:'Fe'})[sym]||sym}
function discoveredInfoRecipes(){
 const out=[],seen=new Set(),cutoff=state.phaseIndex;
 const knownByPhase=id=>{const i=phaseIndexById.get(id);return i!==undefined&&i<=cutoff};
 const add=(label,reactants=[])=>{if(!label||seen.has(label))return;seen.add(label);out.push({label,reactants:new Set(reactants.filter(Boolean))})};
 // O painel é a memória curricular da fase atual: ao revisitar uma fase antiga,
 // receitas aprendidas depois dela ficam ocultas, mesmo que o save já tenha avançado.
 for(const r of PRIMORDIAL_NUCLEAR_REACTIONS)if(knownByPhase(r.unlock))add(r.label,[...(r.pieces||[]),...(r.particles||[])]);
 for(const sym of ['He','H','Li']){
   const id=atomicRecipeUnlock(sym);if(id&&knownByPhase(id)){
     const labels={He:'⁴He²⁺ + 2e⁻ → He + γ',H:'p + e⁻ → H + γ',Li:'⁷Li³⁺ + 3e⁻ → Li + γ'};
     add(labels[sym],sym==='H'?['p','e']:[sym,'e']);
   }
 }
 // As fusões já são reconstruídas a partir das fases até o índice atual.
 for(const r of learnedFusionRecipes())add(symbolicFusionLabel(r),[...(r.ing||[]),...(r.pp?['p']:[])]);
 for(let i=0;i<=cutoff;i++){const ph=PHASES[i];if(ph.mode!=='reactionExplore')continue;if(i===cutoff&&state.atlasProgress<=0)continue;const sp=atlasSpec(ph);if(sp)add(sp.label,[sp.a,sp.b]);}
 const captureIntro=phaseIndexById.get('proton_capture');
 if(captureIntro!==undefined&&captureIntro<=cutoff){for(const [from,r] of Object.entries(PROTON_CAPTURES))add(r.label||`${from} + p → ${r.out}`,[from,'p']);}
 for(const tr of allLearnedNeutronTransitions())add(`${infoSymbolFor(tr.from)} + n → β− → ${infoSymbolFor(tr.to)}`,[tr.from,'n']);
 for(let i=0;i<=cutoff;i++){
   const ph=PHASES[i],map=GUIDED_DECAYS[ph.id];
   if(map)for(const [from,tr] of Object.entries(map))add(tr.type==='alpha'?`${infoSymbolFor(from)} → ${infoSymbolFor(tr.to)} + He`:`${infoSymbolFor(from)} → ${infoSymbolFor(tr.to)} + e⁻ + ν̄ₑ`,[from]);
 }
 const decayGardenIndex=phaseIndexById.get('decay_garden');
 if(decayGardenIndex!==undefined&&decayGardenIndex<=cutoff){for(const track of DECAY_TRACKS)for(let i=0;i<track.length-1;i++){const a=track[i],b=track[i+1];if(a.decay==='estável')continue;add(`${a.mass||''}${a.sym} → ${b.mass||''}${b.sym} · ${a.decay}`,[a.sym]);}}
 const spBe=phaseIndexById.get('spallation_be'),spB=phaseIndexById.get('spallation');
 if(spBe!==undefined&&spBe<=cutoff)add('RC + C / N / O → Be',['cosmic','C','N','O']);
 if(spB!==undefined&&spB<=cutoff)add('RC + C / N / O → B',['cosmic','C','N','O']);
 const nuI=phaseIndexById.get('nu_f');if(nuI!==undefined&&nuI<=cutoff)add('ν + Ne → F',['nu','Ne']);
 const gI=phaseIndexById.get('gamma_process');if(gI!==undefined&&gI<=cutoff)add('γ + Mo / Ru → isótopo + n',['gamma','Mo','Ru']);
 const nzI=phaseIndexById.get('neutronize');if(nzI!==undefined&&nzI<=cutoff)add('p + e⁻ → n + νₑ',['p','e']);
 return out;
}
function objectivePreviewPiece(s=phase()){
 const sym=s.atomicTarget||s.new;
 if(!sym||!E[sym])return null;
 const matterState=s.mode==='atomicRecombination'?'atom':'nucleus';
 const boundElectrons=matterState==='atom'?Number(E[sym]?.n||0):0;
 const sp=s.mode==='reactionExplore'?atlasSpec(s):null;
 return{sym,free:true,matterState,boundElectrons,massNumber:sp?.mainA??primordialMassForSym(sym)};
}
function defaultInfoSelection(s=phase()){
 if(s.mode==='opening')return{type:'particle',kind:'singularity'};
 const preview=objectivePreviewPiece(s);
 if(preview)return{type:'preview',piece:preview,sym:preview.sym};
 return{type:'neutral',kind:'neutral'};
}
function infoSelectionResolved(){
 const a=state.infoSelection;
 if(a?.type==='piece'){const p=state.pieces.get(a.id);if(p)return{type:'piece',piece:p,sym:p.sym};return defaultInfoSelection()}
 if(a?.type==='particle'||a?.type==='cosmic'||a?.type==='preview')return a;
 return defaultInfoSelection();
}
function infoToken(sel){if(sel.type==='neutral')return null;if(sel.type==='particle')return sel.kind;if(sel.type==='cosmic')return sel.kind;return sel.piece?.sym||sel.sym}
function stripElementLead(text,name){
 const escaped=String(name||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return String(text||'').replace(new RegExp(`^(?:O|A)\\s+${escaped}\\s+`,'i'),'').replace(/^Este\s+/i,'').replace(/^Esta\s+/i,'');
}
function elementInfoFromSelection(sel){
 const raw=sel.piece?.sym||sel.sym,base=baseElementSym(raw),e=E[base]||E[raw];if(!e)return null;
 const piece=sel.piece,display=piece?pieceDisplaySymbol(piece):(E[raw]?.symbol||raw);
 const rawName=E[raw]?.name||e.name;
 let curiosity=ISOTOPE_FACTS[raw]||ELEMENT_FACTS[base]||E[raw]?.process||e.process||phaseFact();
 if(piece){
   const stateLabel=piece.matterState==='atom'?'Átomo':'Núcleo';
   const objectName=rawName;
   curiosity=stripElementLead(curiosity,objectName);
   curiosity=`${stateLabel} de ${objectName}: ${curiosity.charAt(0).toLowerCase()+curiosity.slice(1)}`;
 }
 return{base,e,raw,display,fact:curiosity};
}
function setInfoSelection(sel,flash=true){state.infoSelection=sel;renderInfoPanel();if(flash){const panel=$('infoPanel');panel?.classList.remove('flash');void panel?.offsetWidth;panel?.classList.add('flash')}}
function focusPieceInfo(p){if(!p)return;if(p.sym==='Plus')return focusParticleInfo('p',p.id);setInfoSelection({type:'piece',id:p.id,sym:p.sym},true)}
function focusParticleInfo(kind,id=null){setInfoSelection({type:'particle',kind,id},true)}
function renderInfoPanel(){
 const panel=$('infoPanel');if(!panel)return;const sel=infoSelectionResolved(),token=infoToken(sel),tile=$('infoTile'),z=$('infoZ'),symbol=$('infoSymbol'),name=$('infoName'),mass=$('infoMass'),fact=$('infoFact'),recipes=$('infoRecipes');
 const recipesTitle=panel.querySelector('.info-recipes-title');
 recipes.style.display='';
 if(sel.type==='neutral'){
   const d=PARTICLE_INFO.neutral;tile.classList.add('particle');tile.style.background='';z.textContent=d.top;symbol.textContent=d.symbol;name.textContent=d.name;mass.textContent=d.meta;fact.textContent='';recipes.innerHTML='';recipes.style.display='none';if(recipesTitle)recipesTitle.style.display='none';return;
 }
 if(sel.type==='particle'||sel.type==='cosmic'){
   const k=sel.kind||'p',d=PARTICLE_INFO[k]||PARTICLE_INFO.p;tile.classList.add('particle');tile.style.background='';z.textContent=d.top;symbol.textContent=d.symbol;name.textContent=d.name;mass.textContent=d.meta;fact.textContent=d.fact;
 }else{
   const d=elementInfoFromSelection(sel);if(!d)return;tile.classList.remove('particle');const colors=d.e.c||['#fff','#ccd6e8','#77839a'];tile.style.background=`radial-gradient(circle at 30% 20%,${colors[0]},${colors[1]} 46%,${colors[2]} 100%)`;z.textContent=String(d.e.n);symbol.textContent=d.base;name.textContent=d.e.name;mass.textContent=ATOMIC_WEIGHTS[d.base]||'—';fact.textContent=d.fact;
 }
 const matches=token?discoveredInfoRecipes().filter(r=>r.reactants.has(token)):[];recipes.innerHTML='';
 if(!matches.length){recipes.style.display='none';if(recipesTitle)recipesTitle.style.display='none';return}
 recipes.style.display='';if(recipesTitle)recipesTitle.style.display='';
 matches.forEach(r=>{const e=document.createElement('span');e.className='info-recipe';e.textContent=r.label;recipes.appendChild(e)});
}

const phaseIndexById=new Map(PHASES.map((p,i)=>[p.id,i]));

const coords=[],coordIndex=new Map();
for(let q=-MAX_RADIUS;q<=MAX_RADIUS;q++)for(let r=-MAX_RADIUS;r<=MAX_RADIUS;r++){const s=-q-r;if(Math.max(Math.abs(q),Math.abs(r),Math.abs(s))<=MAX_RADIUS){const i=coords.length;coords.push({q,r,ring:Math.max(Math.abs(q),Math.abs(r),Math.abs(s))});coordIndex.set(`${q},${r}`,i)}}
const dirs=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const neigh=coords.map(c=>dirs.map(([dq,dr])=>coordIndex.get(`${c.q+dq},${c.r+dr}`)).filter(v=>v!==undefined));
const byRing=Array.from({length:MAX_RADIUS+1},(_,ring)=>coords.map((c,i)=>c.ring===ring?i:null).filter(v=>v!==null));

const REPLENISHMENT_ABUNDANCE=[['H',90],['He',7],['C',1],['N',1],['Fe',1]];
const ABUNDANCE={
 primordial:[['H',9200],['He',800]],
 fusionBase:[['H',9200],['He',800],['O',30],['C',20]],
 solar:[['H',9100],['He',820],['O',30],['C',20],['Ne',8],['N',7],['Mg',4],['Si',4],['Fe',2],['S',2]],
 enriched:[['H',8600],['He',1100],['O',90],['C',60],['N',28],['Ne',25],['Mg',16],['Si',14],['S',8],['Fe',7],['Na',5],['Al',4],['Ca',2],['P',1],['Ar',1],['Ni',.8],['Cu',.25],['Zn',.2],['Kr',.05]],
 mature:[['H',8200],['He',1250],['O',130],['C',90],['N',36],['Ne',30],['Mg',22],['Si',20],['S',10],['Fe',10],['Sr',1.2],['Ba',.45],['Pb',.2],['Eu',.12],['Pt',.08],['Au',.06],['Th',.025],['U',.02]],
 agb:[['H',8000],['He',1500],['C',260],['O',150],['N',45],['Ne',18],['Fe',7],['Sr',2],['Ba',0.7],['Pb',0.25]],
 white:[['C',45],['O',55]],
 remnant:[['Fe',28],['Ni',24],['Si',14],['O',13],['S',7],['Ca',5],['Mg',5],['C',4]],
 collapse:[['O',4],['Ne',5],['Mg',7],['Si',14],['S',12],['Ar',9],['Ca',10],['Ti',8],['Cr',12],['Mn',11],['Fe',18]],
 kilonova:[['Fe',300],['Ni',270],['Si',100],['O',80],['Ag',18],['Eu',7],['Pt',5],['Au',4],['Th',1.2],['U',1],['He',10],['H',5]]
};
function isPrimordial(s=phase()){return !!s.primordial||s.mode==='opening'}
const SUPERGIANT_RADIUS_VISUALS=new Set(['massive','supergiant','advanced','ironCore','kilonova','xrayBurst']);
const SUPERGIANT_RADIUS_MODES=new Set(['collapseFinal','remnant','pulsar','accretion','blackhole','guidedDecay']);
const SUPERGIANT_ATLAS_ANCHORS=new Set(['nu_f','ne','na','mg','al','si','p','s','cl','ar','k','ca','sc','ti','v','cr','mn','fe']);
function phaseRadius(s=phase()){
  if(isPrimordial(s))return 3;
  if(s.id==='brown'||s.visual==='brownDwarf')return 1;
  if(s.id==='he_red'||s.visual==='redDwarf')return 2;
  if(s.id==='he_orange'||s.id==='he_yellow'||s.mode==='whiteCompact'||s.visual==='whiteDwarf')return 3;
  // Queima de Carbono é o precursor imediato do fork de Supergigantes.
  if(s.id==='carbon_burn')return 4;
  // Microfases Atlas acompanham a escala física do ponto da trilha em que vivem.
  if(s.mode==='reactionExplore'&&s.anchorId)return SUPERGIANT_ATLAS_ANCHORS.has(s.anchorId)?5:4;
  if(SUPERGIANT_RADIUS_MODES.has(s.mode)||SUPERGIANT_RADIUS_VISUALS.has(s.visual))return 5;
  if(s.visual==='redGiant'||s.visual==='agb')return 4;
  if(s.visual==='nebula')return 2;
  return 4;
}
function activeCells(){const r=phaseRadius();return coords.map((c,i)=>c.ring<=r?i:null).filter(v=>v!==null)}
function activeSet(){return new Set(activeCells())}
function fusionHistoryGroups(s=phase(),limit=4){
  if(!s||s.mode!=='fusion')return[];
  // Exemplos pedagógicos definidos explicitamente para preservar a cadeia visual desejada.
  if(s.id==='si')return[['Mg','He'],['Ne','He'],['C','He'],['Be8','He']];
  if(s.id==='p')return[['Si','H'],['Al','He'],['Mg','He'],['Ne','He']];
  if(s.id==='brown')return[['D','H']];
  if(s.id==='he_red')return[['H']];
  // A cadeia pp-I é aprendida dentro das anãs laranja/amarela; não entregue D ou ³He prontos
  // na fase que está ensinando esses intermediários.
  if(s.id==='he_orange'||s.id==='he_yellow')return[['H','H']];
  const first=phaseFusionRecipe(s);if(!first)return[];
  const groups=[[...first.ing]];let current=first;const seen=new Set([s.new]);
  while(groups.length<limit){
    const candidates=current.ing
      .filter(sym=>!seen.has(sym)&&FUSIONS[sym])
      .sort((a,b)=>(E[b]?.n||0)-(E[a]?.n||0));
    if(!candidates.length)break;
    const sym=candidates[0],producer=FUSIONS[sym];seen.add(sym);groups.push([...producer.ing]);current=producer;
  }
  return groups;
}
function phaseAbundance(s=phase()){
  // Geração descreve a composição herdada no nascimento, não o ambiente de toda fase.
  // Os perfis herdados aparecem nos marcos de enriquecimento/nascimento; AGB, Kilonova
  // e outros ambientes preservam seus perfis físicos específicos.
  if(['first_enrichment','second_birth','spallation_be','spallation'].includes(s.id))return ABUNDANCE.enriched;
  if(['second_enrichment','third_birth'].includes(s.id))return ABUNDANCE.mature;
  // Na Anã Branca, matéria nova representa acreção externa: quase toda H/He.
  // Carbono e Oxigênio do objetivo só podem surgir pelas receitas herdadas do jogador.
  if(s.mode==='whiteCompact')return ABUNDANCE.primordial;
  // Fases de fusão e do Atlas compartilham a mesma base cósmica. O Atlas entrega
  // somente um par do objetivo; o restante volta a ser matéria estelar abundante.
  if(s.mode==='fusion'||s.mode==='reactionExplore'||s.weakS||s.chainRebuild)return ABUNDANCE.fusionBase;
  if(['remnant','pulsar','accretion','blackhole'].includes(s.mode))return ABUNDANCE.remnant;
  if(s.mode==='collapseFinal')return ABUNDANCE.remnant;
  if(s.mode==='neutronize')return ABUNDANCE.collapse;
  if(['nebula','brownDwarf','redDwarf','orangeDwarf'].includes(s.visual))return ABUNDANCE.primordial;
  if(s.visual==='yellowDwarf'||s.visual==='redGiant')return ABUNDANCE.solar;
  if(s.visual==='whiteDwarf')return ABUNDANCE.white;
  if(s.visual==='agb')return ABUNDANCE.agb;
  if(s.visual==='kilonova')return ABUNDANCE.kilonova;
  return ABUNDANCE.enriched;
}
function weightedSpawn(profile=phaseAbundance()){
  const total=profile.reduce((sum,[,w])=>sum+w,0);let x=Math.random()*total;
  for(const [sym,w] of profile){x-=w;if(x<=0)return sym}
  return profile[0][0]
}
function replenishmentSymbol(){
  // Regra global de matéria nova após consumo: distribuição de gameplay inspirada
  // na abundância cósmica dos principais elementos escolhidos para o jogo.
  return weightedSpawn(REPLENISHMENT_ABUNDANCE)
}
function phaseGeometry(s=phase()){
  const r=phaseRadius(s);let factor=.80,max=390;
  if(isPrimordial(s))return {r:3,factor:.94,max:545};
  if(s.visual==='brownDwarf'){factor=.46;max=235}
  else if(s.visual==='whiteDwarf'){factor=.98;max=520}
  else if(s.visual==='nebula'){factor=.70;max=340}
  else if(s.visual==='redDwarf'){factor=.72;max=350}
  else if(s.visual==='orangeDwarf'){factor=.79;max=385}
  else if(s.visual==='yellowDwarf'){factor=.86;max=440}
  else if(s.visual==='redGiant'){factor=.98;max=560}
  else if(r===5){factor=.995;max=600}
  else if(r===3){factor=.90;max=470}
  else {factor=.985;max=555}
  return {r,factor,max};
}
function applyGeometry(){
  const g=phaseGeometry(),root=document.documentElement;
  const px=Math.max(260,Math.min(window.innerWidth*g.factor,g.max));
  root.style.setProperty('--starSize',`${px}px`);
  const minCell=g.r>=5?28:36,c=Math.max(minCell,Math.min(72,px*.88/(2*g.r+1)));
  root.style.setProperty('--cellSize',`${c}px`);
}
function desiredFill(){
  const s=phase(),count=activeCells().length;
  if(isPrimordial(s))return 0;
  if(s.id==='brown')return count;
  if(s.id==='coulomb_intro')return Math.min(count,s.fill||10);
  if(s.mode==='collapseFinal')return Math.min(count,s.fill||10);
  if(['remnant','pulsar','accretion','blackhole'].includes(s.mode))return Math.min(count,s.fill||18);
  if(s.mode==='whiteCompact')return Math.min(count,s.fill||24);
  let ratio=.86;
  if(s.visual==='brownDwarf'||s.visual==='whiteDwarf')ratio=.92;
  else if(s.visual==='nebula')ratio=.68;
  else if(s.visual==='redDwarf')ratio=.78;
  else if(s.visual==='orangeDwarf')ratio=.82;
  else if(s.visual==='yellowDwarf')ratio=.84;
  else if(s.visual==='kilonova')ratio=.76;
  return Math.max(Math.min(6,count),Math.min(count,Math.round(count*ratio)));
}

const state={phaseIndex:0,board:Array(coords.length).fill(null),pieces:new Map(),nextId:1,selected:[],created:{},discovered:new Set(),locked:false,fusionInProgress:false,neutrons:new Map(),nextN:1,neutronTimer:null,neutronTick:null,accretionTimer:null,phaseDone:false,popupOpen:false,popupKind:null,lastStellarKey:null,lessonResolver:null,productLessons:new Set(),ignited:false,phaseMilestoneAnnounced:false,crushed:0,absorbed:0,postInitialMatter:0,collapseMatterSnapshot:null,crushTimer:null,crushId:null,coreHoldTimer:null,suppressTapId:null,suppressTapUntil:0,nuclearRound:0,primordialParticles:new Map(),nextPrimordialId:1,primordialSelected:null,primordialDriftTimer:null,particleDrag:null,freeSelected:[],primordialTransfer:null,bigBangStarted:false,bigBangColorized:false,cosmicRays:new Map(),nextCosmicId:1,cosmicTimer:null,selectedCosmic:null,selectedNeutron:null,explosiveHits:0,decayFound:new Set(),postHoldLearned:false,blackHoleSelected:false,radioactiveProofDone:false,readyToAdvance:false,flow:0,flowMilestones:new Set(),contextRecipeKey:null,stratificationCoreGroup:null,protonCaptureUnlocked:false,protonCaptures:0,protonCaptureProducts:{},protonCaptureAttempts:{},rpIonized:0,rpPhotoReturns:0,rpCyclesObserved:0,rpWaitDecays:0,neutronSourceActivations:0,neutronPulsesObserved:0,neutronBranchesObserved:0,neutronBetaWaits:0,neutronFreezeouts:0,neutronStormsObserved:0,fusionAttempts:{},atlasProgress:0,atlasAttempts:{},atlasBarrierPassed:{},atlasPhaseTooltipSeen:false,coulombRepulsions:0,neutronBirths:0,neutronCaptureUnlocked:false,primordialDByProton:0,primordialDByNeutron:0,infoSelection:null,tooltipOpen:false,tooltipResolver:null,tooltipRestoreLock:false,rewardDiscoveries:new Set(),rewardAchievements:new Set(),signatureSeen:new Set(),rewardBannerTimer:null,rewardBannerToken:0,rewardLastShownAt:0,rewardPending:null,rewardPhaseComplete:false,chainCalloutTimer:null,chainCalloutRoot:null,preparedChainRoots:{},nextMatterOrigin:1,objectiveLineages:new Set(),objectiveMotifSelection:null,objectiveMotifActive:false,objectiveMotifRun:0};
const $=id=>document.getElementById(id);
const dom={star:$('starBoard'),core:$('starCore'),cells:$('cells'),pieces:$('pieces'),neutrons:$('neutrons'),lines:$('lines'),fx:$('fx'),objective:$('objective'),toast:$('toast'),ambient:$('ambientBanner'),remnant:$('remnantLayer'),remnantCore:$('remnantCore'),primordial:$('primordialLayer'),zones:$('stellarZones'),electronMesh:$('electronMesh'),singularity:$('singularityBtn'),cosmic:$('cosmicRays')};
function buildElectronMesh(){
 const host=dom.electronMesh;if(!host||host.childElementCount)return;
 const pts=[[50,6],[31,11],[69,12],[17,23],[44,22],[60,24],[82,25],[8,42],[28,39],[51,38],[72,40],[92,44],[16,58],[39,56],[61,58],[83,61],[8,75],[27,76],[49,73],[70,77],[91,76],[20,91],[43,89],[64,91],[81,88]];
 const links=[];for(let i=0;i<pts.length;i++){const ds=pts.map((p,j)=>j===i?null:[j,Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1])]).filter(Boolean).sort((a,b)=>a[1]-b[1]).slice(0,3);for(const [j,d] of ds){if(j<i||d>29)continue;links.push(`<line class="mesh-link${d>21?' soft':''}" x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[j][0]}" y2="${pts[j][1]}"/>`)}}
 const nodes=pts.map((p,i)=>`<div class="primordial-particle electron mesh-electron-node${i%3===0?' alt':i%4===0?' fast':''}" style="left:${p[0]}%;top:${p[1]}%;animation-delay:${-(i%9)*.31}s">−</div>`).join('');
 host.innerHTML=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${links.join('')}</svg>${nodes}`;
}
buildElectronMesh();
function phase(){return PHASES[state.phaseIndex]}
function pieceIsUnstable(piece){return !!piece&&(!!piece.unstable||!!E[piece.sym]?.unstable)}
function clearPieceInstability(piece){if(!piece)return;piece.unstable=false;piece.unstableBornRound=null;piece.unstableRounds=null;piece.unstableMode=null;piece.unstableTo=null;piece.unstableToMass=null;piece.unstableLabel=null;piece.atlasCompound=false;piece.atlasSpecId=null;piece.atlasLabel=null}
function armPieceInstability(piece,{rounds=2,mode=null,to=null,toMass=null,label=''}={},bornRound=state.nuclearRound){if(!piece)return piece;piece.unstable=true;piece.unstableBornRound=bornRound;piece.unstableRounds=Math.max(1,Math.min(5,Number(rounds)||2));piece.unstableMode=mode;piece.unstableTo=to;piece.unstableToMass=toMass??null;piece.unstableLabel=label||'';return piece}
function armIntrinsicInstability(piece,bornRound=state.nuclearRound){if(!piece)return piece;clearPieceInstability(piece);if(piece.sym==='HeU')return armPieceInstability(piece,{rounds:4,mode:'heU'},bornRound);if(piece.sym==='Be7')return armPieceInstability(piece,{rounds:1,mode:'be7',to:'Li',toMass:7,label:'⁷Be + e⁻ → ⁷Li + νₑ'},bornRound);if(piece.sym==='Be8')return armPieceInstability(piece,{rounds:2,mode:'be8'},bornRound);return piece}
function save(){localStorage.setItem('stellarForgeV1013',JSON.stringify({phaseIndex:state.phaseIndex,version:'10.80',phaseId:phase().id,discovered:[...state.discovered],ignited:state.ignited,productLessons:[...state.productLessons],protonCaptureUnlocked:state.protonCaptureUnlocked,neutronCaptureUnlocked:state.neutronCaptureUnlocked,rewardDiscoveries:[...state.rewardDiscoveries],rewardAchievements:[...state.rewardAchievements],signatureSeen:[...state.signatureSeen]}))}
function load(){try{const d=JSON.parse(localStorage.getItem('stellarForgeV1013')||'null');if(!d)return;const legacy={co:'ni_fusion',ni:'ni_fusion',explosive_zn:'ni_fusion',decay_garden:'white',primordial_n:'primordial_d',primordial_dn:'primordial_t',primordial_he:'primordial_he3d',primordial_h:'atomic_h'};const savedId=d.phaseId&&legacy[d.phaseId]?legacy[d.phaseId]:d.phaseId;let idx=savedId&&phaseIndexById.has(savedId)?phaseIndexById.get(savedId):(d.phaseIndex||0);if(!d.phaseId&&idx>=13)idx++;if(!d.phaseId&&idx>=14)idx++;state.phaseIndex=Math.max(0,Math.min(PHASES.length-1,idx));state.discovered=new Set(d.discovered||[]);state.ignited=!!d.ignited;state.productLessons=new Set(d.productLessons||[]);state.protonCaptureUnlocked=!!d.protonCaptureUnlocked||state.phaseIndex>=(phaseIndexById.get('proton_capture')??Infinity);state.neutronCaptureUnlocked=!!d.neutronCaptureUnlocked||state.phaseIndex>=(phaseIndexById.get('primordial_t')??Infinity);state.rewardDiscoveries=new Set(d.rewardDiscoveries||[]);state.rewardAchievements=new Set(d.rewardAchievements||[]);state.signatureSeen=new Set(d.signatureSeen||[])}catch(e){}}
function audioContextReady(){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return null;tone.ctx??=new Ctx();return tone.ctx}catch(e){return null}}
function tone(f=440,d=.05,t='sine',v=.03){
 try{const ctx=audioContextReady();if(!ctx)return;const play=()=>{try{const o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;o.type=t;o.frequency.setValueAtTime(f,now);g.gain.setValueAtTime(Math.max(.0001,v),now);o.connect(g);g.connect(ctx.destination);o.start(now);g.gain.exponentialRampToValueAtTime(.0001,now+d);o.stop(now+d+.02)}catch(e){}};if(ctx.state==='suspended'){const resumed=ctx.resume();if(resumed&&typeof resumed.then==='function')resumed.then(play).catch(()=>{});else play()}else play()}catch(e){}
}
function vibrate(p=10){if(navigator.vibrate)navigator.vibrate(p)}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function toast(s){return}
function announce(kicker,title,text=''){return false}

// Reward Director, Discovery System and adaptive procedural audio. These systems
// observe the scientific engine; they never decide whether a reaction is valid.
const REWARD_SIGNATURES=Object.freeze({
 carbon:{kicker:'MARCO ESTELAR',title:'CARBONO',text:'O triplo-alfa construiu um novo núcleo estável.',tone:392},
 iron:{kicker:'NÚCLEO ESTELAR',title:'FERRO',text:'A estrela alcançou a região em que a fusão comum deixa de sustentá-la.',tone:196},
 gold:{kicker:'PROCESSO-r',title:'OURO',text:'Uma rede extremamente rica em nêutrons alcançou o Ouro.',tone:523},
 uranium:{kicker:'NÚCLEO MUITO PESADO',title:'URÂNIO',text:'A cascata de capturas alcançou a região dos actinídeos.',tone:131},
 freezeout:{kicker:'PROCESSO-r',title:'FREEZE-OUT',text:'O fluxo de nêutrons cai e a rede passa a evoluir por decaimentos.',tone:247},
 supernova:{kicker:'EVENTO ESTELAR',title:'SUPERNOVA',text:'O núcleo libera sua matéria enriquecida para o meio interestelar.',tone:98},
 neutronStar:{kicker:'REMANESCENTE',title:'ESTRELA DE NÊUTRONS',text:'A matéria foi comprimida a um estado extremamente compacto.',tone:174},
 blackHole:{kicker:'REMANESCENTE FINAL',title:'BURACO NEGRO',text:'A matéria atravessa um horizonte do qual não retorna.',tone:65},
 rpCycle:{kicker:'rp-PROCESS',title:'CICLO Sn–Sb–Te',text:'A rede encontrou seu ciclo terminal nesta campanha.',tone:330}
});
const DISCOVERY_ATLAS=Object.freeze([
 {key:'element:C',kind:'element',sym:'C',title:'Carbono',group:'Elementos-chave',text:'Formado pelo processo triplo-alfa em estrelas evoluídas.'},
 {key:'element:Fe',kind:'element',sym:'Fe',title:'Ferro',group:'Elementos-chave',text:'Marca a transição para a evolução final de estrelas massivas.'},
 {key:'element:Au',kind:'element',sym:'Au',title:'Ouro',group:'Elementos-chave',text:'No Ardua, aparece em uma rede rica em nêutrons do processo-r.'},
 {key:'element:U',kind:'element',sym:'U',title:'Urânio',group:'Elementos-chave',text:'Um dos núcleos mais pesados alcançados pela campanha.'},
 {key:'process:s',kind:'phenomenon',glyph:'s',title:'Processo-s',group:'Processos',text:'Capturas lentas de nêutrons intercaladas com decaimentos.'},
 {key:'process:r',kind:'phenomenon',glyph:'r',title:'Processo-r',group:'Processos',text:'Capturas rápidas durante fluxos intensos de nêutrons.'},
 {key:'process:rp',kind:'phenomenon',glyph:'p',title:'rp-process',group:'Processos',text:'Capturas rápidas de prótons em uma estrela de nêutrons em acreção.'},
 {key:'phenomenon:tripleAlpha',kind:'phenomenon',glyph:'3α',title:'Triplo-alfa',group:'Fenômenos',text:'Berílio-8 instável recebe outro Hélio e forma Carbono.'},
 {key:'phenomenon:waitingPoint',kind:'phenomenon',glyph:'β⁺',title:'Waiting point',group:'Fenômenos',text:'Um núcleo proton-rich interrompe temporariamente a sequência de capturas.'},
 {key:'phenomenon:freezeout',kind:'phenomenon',glyph:'n↓',title:'Freeze-out',group:'Fenômenos',text:'O fluxo de nêutrons cai e os decaimentos passam a dominar.'},
 {key:'phenomenon:supernova',kind:'phenomenon',glyph:'✦',title:'Supernova',group:'Eventos cósmicos',text:'Uma explosão estelar dispersa matéria enriquecida.'},
 {key:'phenomenon:neutronStar',kind:'phenomenon',glyph:'NS',title:'Estrela de Nêutrons',group:'Eventos cósmicos',text:'Remanescente compacto sustentado por matéria extremamente densa.'},
 {key:'phenomenon:blackHole',kind:'phenomenon',glyph:'●',title:'Buraco Negro',group:'Eventos cósmicos',text:'Colapso extremo com formação de um horizonte de eventos.'},
 {key:'phenomenon:hawkingRadiation',kind:'phenomenon',glyph:'hν',title:'Radiação Hawking',group:'Fenômenos',text:'Efeito quântico extremamente tênue associado ao horizonte de eventos de um buraco negro.'},
 {key:'phenomenon:plannedChain',kind:'phenomenon',glyph:'×',title:'Cadeia planejada',group:'Domínio',text:'Uma continuação nuclear já estava geometricamente preparada antes da reação inicial.'}
]);
const MICRO_REWARDS=Object.freeze({
 firstReaction:['PRIMEIRA REAÇÃO','A estrela respondeu à sua primeira transformação.'],
 chain3:['CADEIA ×3','Três eventos ficaram causalmente conectados.'],
 chain4:['CADEIA ×4','A rede nuclear ganhou uma sequência longa.'],
 plannedChain:['REDE PREPARADA','Os reagentes da continuação já estavam posicionados.'],
 tripleAlpha:['TRIPLO-ALFA','Berílio-8 e Hélio convergiram para Carbono.'],
 neutronSource:['FONTE DE NÊUTRONS','Uma reação fonte alimentou o fluxo de capturas.'],
 thermalPulse:['PULSO TÉRMICO','O fluxo de nêutrons entrou em um pulso mais intenso.'],
 waitingPoint:['WAITING POINT','A sequência de prótons encontrou uma espera β⁺.'],
 branching:['RAMIFICAÇÃO','A captura competiu com o decaimento β−.'],
 freezeout:['FREEZE-OUT','O fluxo rápido cedeu lugar aos decaimentos.'],
 heavyNucleus:['NÚCLEO PESADO','A rede alcançou a região de Bário ou além.'],
 phaseComplete:['PROCESSO COMPLETO','Objetivo científico e ritmo da fase foram satisfeitos.']
});
function rewardReducedMotion(){return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
function rewardDirectorNeedsContinue(p){return['OBJETIVO CIENTÍFICO','MARCO','ATLAS ATUALIZADO'].includes(String(p?.kicker||'').toUpperCase())}
function rewardDirectorDismiss(){
 const b=dom.ambient;if(!b)return false;if(state.rewardBannerTimer)clearTimeout(state.rewardBannerTimer);state.rewardBannerTimer=null;state.rewardBannerToken++;b.classList.remove('show','awaiting-continue');b.dataset.priority='0';const btn=$('ambientContinueBtn');if(btn)btn.hidden=true;
 setTimeout(()=>{const next=state.rewardPending;state.rewardPending=null;if(next)rewardDirectorShow(next)},160);return true;
}
function rewardDirectorClear(){
 if(state.rewardBannerTimer)clearTimeout(state.rewardBannerTimer);state.rewardBannerTimer=null;state.rewardPending=null;state.rewardPhaseComplete=false;state.rewardBannerToken++;
 const b=dom.ambient;if(b){b.classList.remove('show','reward-banner','micro','discovery','signature','completion','awaiting-continue');b.dataset.priority='0'}const btn=$('ambientContinueBtn');if(btn)btn.hidden=true;
 const callout=dom.fx?.querySelector('.chain-callout');if(callout)callout.remove();if(state.chainCalloutTimer)clearTimeout(state.chainCalloutTimer);state.chainCalloutTimer=null;state.chainCalloutRoot=null;
}
function rewardDirectorShow(payload={}){
 const b=dom.ambient;if(!b||state.popupOpen||state.tooltipOpen)return false;
 const p={kicker:'DESCOBERTA',title:'',text:'',priority:1,duration:1700,kind:'micro',...payload};if(state.objectiveMotifActive){if(p.priority>=2)state.rewardPending=p;return false}const now=performance.now(),shown=b.classList.contains('show'),current=Number(b.dataset.priority||0),awaiting=b.classList.contains('awaiting-continue');
 if(shown&&awaiting){if(p.priority>=2)state.rewardPending=p;return false}
 if(shown&&(p.priority<current||(p.priority===current&&now-(state.rewardLastShownAt||0)<820))){if(p.priority>=2)state.rewardPending=p;return false}
 const token=++state.rewardBannerToken,needsContinue=rewardDirectorNeedsContinue(p);state.rewardLastShownAt=now;if(state.rewardBannerTimer)clearTimeout(state.rewardBannerTimer);state.rewardBannerTimer=null;
 b.className=`ambient-banner show reward-banner ${p.kind}${needsContinue?' awaiting-continue':''}`;b.dataset.priority=String(p.priority);$('ambientKicker').textContent=p.kicker;$('ambientTitle').textContent=p.title;$('ambientText').textContent=p.text||'';const btn=$('ambientContinueBtn');if(btn)btn.hidden=!needsContinue;
 if(needsContinue)return true;
 state.rewardBannerTimer=setTimeout(()=>{if(token!==state.rewardBannerToken)return;rewardDirectorDismiss()},Math.max(1200,p.duration));return true;
}
function rewardParticles(x,y,level=2){
 if(!dom.fx||level<2)return;const count=rewardReducedMotion()?Math.min(3,level):Math.min(12,3+level*2),existing=dom.fx.querySelectorAll('.reward-spark');for(let i=0;i<Math.max(0,existing.length-28);i++)existing[i]?.remove();
 const px=Number.isFinite(x)?x:starSize()/2,py=Number.isFinite(y)?y:starSize()/2;
 for(let i=0;i<count;i++){const d=document.createElement('i'),a=(Math.PI*2*i/count)+(Math.random()-.5)*.35,dist=24+Math.random()*(24+level*14);d.className='reward-spark';d.style.left=px+'px';d.style.top=py+'px';d.style.setProperty('--rx',`${Math.cos(a)*dist}px`);d.style.setProperty('--ry',`${Math.sin(a)*dist}px`);dom.fx.appendChild(d);setTimeout(()=>d.remove(),720)}
}
function ensureRewardProgressAura(){let d=dom.star?.querySelector('.reward-progress-aura');if(!d&&dom.star){d=document.createElement('div');d.className='reward-progress-aura';d.setAttribute('aria-hidden','true');dom.star.appendChild(d)}return d}
function applyRewardProgressVisuals(){
 const d=ensureRewardProgressAura();if(!d)return;const s=phase(),p=s.mode==='opening'?0:Math.max(0,Math.min(1,currentProgress()/100));d.style.setProperty('--progressAura',p.toFixed(3));d.classList.toggle('active',p>.08);dom.star.style.setProperty('--rewardProgress',p.toFixed(3));
}
function adaptiveAudioReaction(level=1,kind='reaction',step=1){
 if(level<2)return;const roots={nuclear:330,neutron:294,r:220,proton:392,energetic:494,decay:262,accretion:147,rotation:440,collapse:110,reaction:330},root=roots[kind]||330,scale=[1,1.125,1.25,1.5,1.667],ratio=scale[Math.min(scale.length-1,Math.max(0,step-1))];tone(root*ratio,.075,level>=4?'triangle':'sine',level>=4?.025:.012);if(level>=4)setTimeout(()=>tone(root*1.5,.11,'sine',.014),78)
}
function adaptiveAudioResolve(kind='completion'){const roots={supernova:82,blackHole:65,completion:330,neutronStar:174,freezeout:220},r=roots[kind]||330;setTimeout(()=>tone(r,.18,'sine',.018),70);setTimeout(()=>tone(r*1.25,.20,'sine',.016),155);setTimeout(()=>tone(r*1.5,.24,'triangle',.014),245)}
const RewardDirector=Object.freeze({show:rewardDirectorShow,clear:rewardDirectorClear,particles:rewardParticles});
function registerRewardDiscovery(key,{title='',text='',kicker='ATLAS ATUALIZADO',silent=false,priority=2}={}){
 if(!key||state.rewardDiscoveries.has(key))return false;state.rewardDiscoveries.add(key);save();if(!silent)RewardDirector.show({kicker,title:title||key,text,priority,duration:1850,kind:'discovery'});return true;
}
function unlockRewardAchievement(key,title=null,text=null){
 if(!key||state.rewardAchievements.has(key))return false;state.rewardAchievements.add(key);save();const m=MICRO_REWARDS[key]||[title||key,text||''];RewardDirector.show({kicker:'MARCO',title:title||m[0],text:text??m[1],priority:2,duration:1650,kind:'micro'});return true;
}
function signatureClass(key){return String(key||'').replace(/[^a-z0-9_-]/gi,'-')}
function playScientificSignature(key,x=starSize()/2,y=starSize()/2){
 const sig=REWARD_SIGNATURES[key];if(!sig||state.signatureSeen.has(key))return false;state.signatureSeen.add(key);registerRewardDiscovery(`phenomenon:${key}`,{title:sig.title,text:sig.text,silent:true});save();
 dom.star.classList.add('reward-signature',`signature-${signatureClass(key)}`);setTimeout(()=>dom.star?.classList.remove('reward-signature',`signature-${signatureClass(key)}`),rewardReducedMotion()?650:1900);RewardDirector.particles(x,y,4);RewardDirector.show({kicker:sig.kicker,title:sig.title,text:sig.text,priority:4,duration:2450,kind:'signature'});adaptiveAudioResolve(key);vibrate(rewardReducedMotion()?8:[10,18,14]);return true;
}
function discoveryUnlocked(entry){return entry.kind==='element'?state.discovered.has(entry.sym):state.rewardDiscoveries.has(entry.key)}
function renderDiscoveryAtlas(){
 const host=$('discoveryAtlas'),detail=$('discoveryDetail');if(!host)return;host.innerHTML='';let group='';
 for(const entry of DISCOVERY_ATLAS){if(entry.group!==group){group=entry.group;const h=document.createElement('div');h.className='discovery-group';h.textContent=group;host.appendChild(h)}const open=discoveryUnlocked(entry),b=document.createElement('button');b.type='button';b.className='discovery-card'+(open?' unlocked':' locked');const glyph=entry.kind==='element'?(E[entry.sym]?.symbol||entry.sym):(entry.glyph||'·');b.innerHTML=`<span class="discovery-glyph">${open?glyph:'?'}</span><span><strong>${open?entry.title:'Não descoberto'}</strong><small>${open?entry.group:'Continue explorando a campanha'}</small></span>`;if(open)b.addEventListener('click',()=>{if(detail)detail.innerHTML=`<strong>${entry.title}</strong><span>${entry.group}</span><p>${entry.text}</p>`});host.appendChild(b)}
}
const DiscoverySystem=Object.freeze({register:registerRewardDiscovery,achievement:unlockRewardAchievement,render:renderDiscoveryAtlas});
const AdaptiveAudio=Object.freeze({reaction:adaptiveAudioReaction,resolve:adaptiveAudioResolve});
const OBJECTIVE_MOTIF_ROOTS=Object.freeze([196,220,247,262,294,330]);
function objectiveMotifHash(text=''){let h=17;for(const ch of String(text))h=(h*31+ch.charCodeAt(0))>>>0;return h}
function objectiveMotifNotes(r){
 const root=OBJECTIVE_MOTIF_ROOTS[objectiveMotifHash(recipeKey(r))%OBJECTIVE_MOTIF_ROOTS.length],unstable=!!E[r?.out]?.unstable;
 return unstable?[root,root*(4/3),root*1.5]:[root,root*1.25,root*1.5];
}
function objectiveMotifPlayNote(r,index){const notes=objectiveMotifNotes(r),f=notes[Math.max(0,Math.min(2,index))],d=index===2?.28:.24,g=index===2?.086:.074;tone(f,d,'triangle',g);tone(f*2,d*.82,'sine',g*.30)}
function objectiveMotifChord(r,final=false){const notes=objectiveMotifNotes(r);for(const f of notes){tone(f,.52,'triangle',.040);tone(f*2,.42,'sine',.014)}if(final)tone(notes[0]*2,.56,'triangle',.022)}
function objectiveMotifSameRecipe(a,b){return !!a&&!!b&&recipeKey(a)===recipeKey(b)}
function objectiveMotifTargetRecipes(s=phase()){
 if(s.mode==='whiteCompact'){
   const info=whiteCounts(s),out=[];
   if(info.c<info.targetC)out.push(FUSIONS.C);
   if(info.o<info.targetO&&info.c>info.targetC)out.push(FUSIONS.O);
   return out.filter(Boolean);
 }
 if(s.mode!=='fusion')return[];
 return phaseFusionRecipes(s).filter(r=>r?.out===s.new);
}
function objectiveMotifReactionEligible(r,pieces=[],s=phase()){
 if(!r||state.chainAutoContext||state.phaseDone||state.readyToAdvance||r.ing?.length!==2||pieces.length!==2)return false;
 if(!objectiveMotifTargetRecipes(s).some(q=>objectiveMotifSameRecipe(q,r)))return false;
 if(s.uniqueMatterObjective&&!objectiveLineageIsFresh(s,mergeMatterLineages(pieces)))return false;
 if(s.mode==='whiteCompact'){
   const info=whiteCounts(s);if(r.out==='C')return info.c<info.targetC;if(r.out==='O')return info.o<info.targetO&&info.c>info.targetC;return false;
 }
 return !!s.new&&r.out===s.new&&(state.created[s.new]||0)<Math.max(1,s.target||1);
}
function objectiveMotifCandidateForFirst(piece,s=phase()){
 if(!piece||piece.cell===null||piece.cell===undefined||state.chainAutoContext)return null;
 for(const r of objectiveMotifTargetRecipes(s)){
   if(r.ing?.length!==2||!r.ing.includes(piece.sym))continue;
   for(const cell of neigh[piece.cell]||[]){const id=state.board[cell],other=id?state.pieces.get(id):null;if(!other||!same([piece.sym,other.sym],r.ing))continue;if(objectiveMotifReactionEligible(r,[piece,other],s))return r}
 }
 return null;
}
function objectiveMotifCancelSelection(){state.objectiveMotifSelection=null}
function objectiveMotifArmFirst(piece,{sound=true}={}){
 const r=objectiveMotifCandidateForFirst(piece);if(!r){objectiveMotifCancelSelection();return false}
 state.objectiveMotifSelection={recipeKey:recipeKey(r),cells:[piece.cell],ready:false};if(sound)objectiveMotifPlayNote(r,0);return true;
}
function objectiveMotifArmSecond(r,cells){
 const sel=state.objectiveMotifSelection,pieces=(cells||[]).map(c=>state.pieces.get(state.board[c])).filter(Boolean);
 if(!sel||sel.recipeKey!==recipeKey(r)||sel.cells?.[0]!==cells?.[0]||!objectiveMotifReactionEligible(r,pieces)){objectiveMotifCancelSelection();return false}
 sel.cells=[...cells];sel.ready=true;objectiveMotifPlayNote(r,1);return true;
}
function objectiveMotifSelectionReady(r,cells){const sel=state.objectiveMotifSelection;return !!sel?.ready&&sel.recipeKey===recipeKey(r)&&same(sel.cells||[],cells||[])}
function objectiveMotifNode(piece,kind='reactant'){
 const d=document.createElement('div'),shown=pieceDisplaySymbol(piece);d.className=`objective-motif-nucleus ${kind}`;d.style.background=elementStyle(piece.sym);d.innerHTML=`<span>${shown}</span>`;return d;
}
function objectiveMotifResultNode(piece){const d=objectiveMotifNode(piece,'result'),name=document.createElement('small');name.textContent=E[piece.sym]?.name||piece.sym;d.appendChild(name);return d}
function objectiveMotifFlushReward(){const next=state.rewardPending;if(!next)return;state.rewardPending=null;setTimeout(()=>{if(!state.objectiveMotifActive)rewardDirectorShow(next)},180)}
function objectiveMotifReset(){
 state.objectiveMotifRun++;state.objectiveMotifActive=false;state.objectiveMotifSelection=null;dom.star?.classList.remove('objective-motif-active');dom.star?.querySelectorAll('.objective-motif-stage').forEach(x=>x.remove());dom.star?.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'));dom.pieces?.querySelectorAll('.motif-grid-product,.motif-grid-ready').forEach(x=>x.classList.remove('motif-grid-product','motif-grid-ready'));
}
async function objectiveMotifPrepare(r,pieces,targetPoint){
 const run=++state.objectiveMotifRun,stage=document.createElement('div'),size=starSize(),center=size/2,reduced=rewardReducedMotion();state.objectiveMotifActive=true;dom.star.classList.add('objective-motif-active');stage.className='objective-motif-stage';dom.star.appendChild(stage);
 const nodes=pieces.map((p,i)=>{const d=objectiveMotifNode(p);d.style.left=p.x+'px';d.style.top=p.y+'px';d.dataset.side=i?'right':'left';stage.appendChild(d);dom.pieces.querySelector(`[data-id="${p.id}"]`)?.classList.add('motif-source');return d});
 await wait(reduced?35:70);if(run!==state.objectiveMotifRun)return null;
 nodes[0].style.left=(size*.28)+'px';nodes[1].style.left=(size*.72)+'px';for(const d of nodes){d.style.top=(center*.98)+'px';d.classList.add('aligned')}
 await wait(reduced?70:330);if(run!==state.objectiveMotifRun)return null;objectiveMotifPlayNote(r,2);stage.classList.add('aligned');await wait(reduced?45:135);return{run,stage,nodes,r,targetPoint,center};
}
async function objectiveMotifConverge(ctx){if(!ctx||ctx.run!==state.objectiveMotifRun)return false;const reduced=rewardReducedMotion();for(const d of ctx.nodes){d.style.left=ctx.center+'px';d.style.top=ctx.center+'px';d.classList.add('converging')}await wait(reduced?55:190);return ctx.run===state.objectiveMotifRun}
function objectiveMotifFinalCredit(s=phase()){if(s.mode==='whiteCompact')return objectiveSatisfied(s);return !!s.new&&(state.created[s.new]||0)>=Math.max(1,s.target||1)}
async function objectiveMotifReveal(ctx,product,targetPoint){
 if(!ctx||ctx.run!==state.objectiveMotifRun)return;const reduced=rewardReducedMotion(),result=objectiveMotifResultNode(product);result.style.left=ctx.center+'px';result.style.top=ctx.center+'px';ctx.stage.appendChild(result);requestAnimationFrame(()=>result.classList.add('visible'));objectiveMotifChord(ctx.r,objectiveMotifFinalCredit());updateHUD();RewardDirector.particles(ctx.center,ctx.center,3);vibrate(rewardReducedMotion()?5:[6,9,6]);await wait(reduced?90:310);if(ctx.run!==state.objectiveMotifRun)return;
 result.classList.add('settling');result.style.left=targetPoint.x+'px';result.style.top=targetPoint.y+'px';await wait(reduced?70:245);if(ctx.run!==state.objectiveMotifRun)return;const grid=dom.pieces.querySelector(`[data-id="${product.id}"]`);ctx.stage.remove();dom.star.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'));dom.star.classList.remove('objective-motif-active');if(grid){grid.classList.remove('motif-grid-product');grid.classList.add('motif-grid-ready');requestAnimationFrame(()=>requestAnimationFrame(()=>grid.classList.remove('motif-grid-ready')))}state.objectiveMotifActive=false;state.objectiveMotifSelection=null;objectiveMotifFlushReward();
}
function objectiveMotifBarrierBlocked(piece,r){
 const sel=state.objectiveMotifSelection;if(sel?.ready&&sel.recipeKey===recipeKey(r)){const notes=objectiveMotifNotes(r);tone(notes[1]*.75,.13,'sine',.017)}objectiveMotifCancelSelection();if(piece)setTimeout(()=>objectiveMotifArmFirst(piece,{sound:false}),80);
}
const ObjectiveReactionMotif=Object.freeze({targetRecipes:objectiveMotifTargetRecipes,eligible:objectiveMotifReactionEligible,reset:objectiveMotifReset});

// Objective Interaction Motif: extends the same audiovisual grammar to manual
// particle interactions and to objective interactions outside the stellar fusion grid.
function objectiveInteractionRecipe(key,out='H'){
 const safe=out&&E[out]?out:'H';return{ing:[`@${key}:a`,`@${key}:b`],out:safe,interactionKey:key};
}
function objectiveInteractionParticleGlyph(kind){return kind==='p'?'+':kind==='n'?'n':kind==='e'?'e⁻':kind==='nu'?'ν':kind==='gamma'?'γ':kind==='cosmic'?'✦':'•'}
function objectiveInteractionParticleBackground(kind){
 const map={p:'radial-gradient(circle at 36% 30%,#fff,#ffb795 44%,#bb4a38 78%)',n:'radial-gradient(circle at 36% 30%,#fff,#c5e2ff 44%,#567aa7 78%)',e:'radial-gradient(circle at 36% 30%,#fff,#bce6ff 44%,#4679ae 78%)',nu:'radial-gradient(circle at 36% 30%,#fff,#dacbff 44%,#7859b7 78%)',gamma:'radial-gradient(circle at 36% 30%,#fff,#ffe991 44%,#c89c2c 78%)',cosmic:'radial-gradient(circle at 36% 30%,#fff,#cceaff 44%,#5969c3 78%)'};return map[kind]||map.cosmic;
}
function objectiveInteractionPieceToken(piece){if(!piece)return null;return{x:piece.x,y:piece.y,sym:piece.sym,label:pieceDisplaySymbol(piece),sourceEl:dom.pieces?.querySelector(`[data-id="${piece.id}"]`),particle:false}}
function objectiveInteractionPrimordialToken(p){if(!p)return null;return{x:p.x,y:p.y,kind:p.kind,label:objectiveInteractionParticleGlyph(p.kind),sourceEl:dom.primordial?.querySelector(`[data-id="${p.id}"]`),particle:true}}
function objectiveInteractionNeutronToken(n){if(!n)return null;return{x:n.x,y:n.y,kind:'n',label:'n',sourceEl:dom.neutrons?.querySelector(`[data-id="${n.id}"]`),particle:true}}
function objectiveInteractionCosmicToken(ray,s=phase()){if(!ray)return null;const kind=s.mode==='neutrino'?'nu':s.mode==='gamma'?'gamma':'cosmic';return{x:ray.x,y:ray.y,kind,label:objectiveInteractionParticleGlyph(kind),sourceEl:dom.cosmic?.querySelector(`[data-id="${ray.id}"]`),particle:true}}
function objectiveInteractionNode(token){
 const d=document.createElement('div');d.className='objective-motif-nucleus objective-motif-token'+(token?.particle?' particle':'');d.style.background=token?.sym&&E[token.sym]?elementStyle(token.sym):objectiveInteractionParticleBackground(token?.kind);d.innerHTML=`<span>${token?.label||'•'}</span>`;return d;
}
function objectiveInteractionClearSources(){dom.star?.querySelectorAll('.motif-source').forEach(x=>x.classList.remove('motif-source'))}
function objectiveInteractionFinish(ctx){if(!ctx)return;ctx.stage?.remove();objectiveInteractionClearSources();dom.star?.classList.remove('objective-motif-active');state.objectiveMotifActive=false;state.objectiveMotifSelection=null;objectiveMotifFlushReward()}
async function objectiveInteractionPrepare(key,tokens,out,targetPoint){
 const usable=(tokens||[]).filter(Boolean);if(usable.length!==2)return null;if(state.objectiveMotifActive)objectiveMotifReset();const r=objectiveInteractionRecipe(key,out),run=++state.objectiveMotifRun,stage=document.createElement('div'),size=starSize(),center=size/2,reduced=rewardReducedMotion();state.objectiveMotifActive=true;dom.star.classList.add('objective-motif-active');stage.className='objective-motif-stage objective-interaction-stage';dom.star.appendChild(stage);
 const nodes=usable.map((token,i)=>{const d=objectiveInteractionNode(token);d.style.left=token.x+'px';d.style.top=token.y+'px';d.dataset.side=i?'right':'left';stage.appendChild(d);token.sourceEl?.classList.add('motif-source');return d});
 objectiveMotifPlayNote(r,0);await wait(reduced?28:105);if(run!==state.objectiveMotifRun)return null;objectiveMotifPlayNote(r,1);await wait(reduced?32:75);if(run!==state.objectiveMotifRun)return null;
 nodes[0].style.left=(size*.28)+'px';nodes[1].style.left=(size*.72)+'px';for(const d of nodes){d.style.top=(center*.98)+'px';d.classList.add('aligned')}
 await wait(reduced?70:285);if(run!==state.objectiveMotifRun)return null;objectiveMotifPlayNote(r,2);stage.classList.add('aligned');await wait(reduced?42:115);return{run,stage,nodes,r,targetPoint,center};
}
async function objectiveInteractionPrelude(key,tokens,out,targetPoint){const ctx=await objectiveInteractionPrepare(key,tokens,out,targetPoint);if(!ctx)return null;return(await objectiveMotifConverge(ctx))?ctx:null}
function objectiveInteractionLabelNode(glyph,caption){const d=document.createElement('div');d.className='objective-motif-nucleus result objective-motif-token particle interaction-result';d.style.background=objectiveInteractionParticleBackground('cosmic');d.innerHTML=`<span>${glyph||'•'}</span><small>${caption||'INTERAÇÃO'}</small>`;return d}
async function objectiveInteractionRevealLabel(ctx,glyph,caption,targetPoint){
 if(!ctx||ctx.run!==state.objectiveMotifRun)return;const reduced=rewardReducedMotion(),result=objectiveInteractionLabelNode(glyph,caption);result.style.left=ctx.center+'px';result.style.top=ctx.center+'px';ctx.stage.appendChild(result);requestAnimationFrame(()=>result.classList.add('visible'));objectiveMotifChord(ctx.r,false);RewardDirector.particles(ctx.center,ctx.center,2);vibrate(rewardReducedMotion()?4:[5,8,5]);await wait(reduced?80:235);if(ctx.run!==state.objectiveMotifRun)return;result.classList.add('settling');result.style.left=targetPoint.x+'px';result.style.top=targetPoint.y+'px';await wait(reduced?65:175);if(ctx.run!==state.objectiveMotifRun)return;objectiveInteractionFinish(ctx);
}
async function objectiveInteractionRevealPiece(ctx,product,targetPoint){
 if(!ctx||!product)return;renderPieces();const grid=dom.pieces?.querySelector(`[data-id="${product.id}"]`);if(grid)grid.classList.add('motif-grid-product');await objectiveMotifReveal(ctx,product,targetPoint);
}
async function objectiveInteractionImpact(key,tokens,out,targetPoint,glyph,caption='CAPTURA'){
 const ctx=await objectiveInteractionPrelude(key,tokens,out,targetPoint);if(!ctx)return false;await objectiveInteractionRevealLabel(ctx,glyph,caption,targetPoint);return true;
}
const ObjectiveInteractionMotif=Object.freeze({prepare:objectiveInteractionPrepare,prelude:objectiveInteractionPrelude,impact:objectiveInteractionImpact,reveal:objectiveInteractionRevealPiece});

function showChainCallout(rootId,kind,step,x,y){
 if(!dom.fx||step<2)return;let d=dom.fx.querySelector('.chain-callout');if(!d){d=document.createElement('div');d.className='chain-callout';dom.fx.appendChild(d)}state.chainCalloutRoot=rootId;const px=Number.isFinite(x)?Math.max(78,Math.min(starSize()-78,x)):starSize()/2,py=Number.isFinite(y)?Math.max(62,Math.min(starSize()-62,y-42)):starSize()*.34;d.style.left=px+'px';d.style.top=py+'px';d.innerHTML=`<small>${chainEventTitle(kind)}</small><strong>×${step}</strong>`;d.classList.remove('visible');void d.offsetWidth;d.classList.add('visible');if(state.chainCalloutTimer)clearTimeout(state.chainCalloutTimer);state.chainCalloutTimer=setTimeout(()=>{d.classList.remove('visible');setTimeout(()=>{if(!d.classList.contains('visible'))d.remove()},300)},1850);
}
function preparedContinuationForFusion(r,cells,target,s=phase()){
 if(state.chainAutoContext||!r||target===null||target===undefined||!fusionSandboxAllowed(s))return false;for(const n of neigh[target]||[]){if(cells.includes(n))continue;const id=state.board[n],p=id?state.pieces.get(id):null;if(!p)continue;if(exactRecipe([r.out,p.sym]))return true}return false;
}
function maybeScientificMoment(s=phase()){
 const sym=s?.new;if(sym&&E[sym]&&(state.created[sym]||0)>0){const key=`element:${sym}`,major={C:'carbon',Fe:'iron',Au:'gold',U:'uranium'}[sym];if(registerRewardDiscovery(key,{title:E[sym].name.toUpperCase(),text:E[sym].origin||'Novo elemento registrado no Atlas.',silent:!!major,priority:2})&&major)playScientificSignature(major);if((E[sym]?.n||0)>=56)unlockRewardAchievement('heavyNucleus');if(sym==='C'&&(s.id==='c'||s.mode==='whiteCompact')){registerRewardDiscovery('phenomenon:tripleAlpha',{title:'TRIPLO-ALFA',text:'Berílio-8 e Hélio formaram Carbono.',silent:true});unlockRewardAchievement('tripleAlpha')}}
}
function evaluateRewardAchievements(s=phase()){
 unlockRewardAchievement('firstReaction');
 if(s.mode==='neutron'&&(state.created[s.new]||0)>0)registerRewardDiscovery(s.rprocess?'process:r':'process:s',{title:s.rprocess?'PROCESSO-r':'PROCESSO-s',text:s.rprocess?'Capturas rápidas em fluxo intenso de nêutrons.':'Capturas lentas intercaladas com decaimentos.',silent:true});
 if(s.mode==='rpProcess'&&state.protonCaptures>0)registerRewardDiscovery('process:rp',{title:'rp-PROCESS',text:'Capturas rápidas de prótons.',silent:true});
 if(state.neutronSourceActivations>0)unlockRewardAchievement('neutronSource');
 const ng=s.mode==='neutron'?neutronGameplay(s):null;if(ng&&['pulse','pulseStrong','source22','source13'].includes(ng.pattern)&&state.neutronPulsesObserved>0)unlockRewardAchievement('thermalPulse');
 if(state.neutronBranchesObserved>0)unlockRewardAchievement('branching');
 if(state.neutronFreezeouts>0){registerRewardDiscovery('phenomenon:freezeout',{title:'FREEZE-OUT',text:'O fluxo de nêutrons caiu e a rede mudou de regime.',silent:true});unlockRewardAchievement('freezeout');playScientificSignature('freezeout')}
 if(s.mode==='rpProcess'&&[...state.pieces.values()].some(p=>p.unstableMode==='betaPlus')){registerRewardDiscovery('phenomenon:waitingPoint',{title:'WAITING POINT',text:'Um núcleo proton-rich entrou em espera β⁺.',silent:true});unlockRewardAchievement('waitingPoint')}
 maybeScientificMoment(s);
}
function phaseCompletionReward(s=phase()){
 if(state.rewardPhaseComplete)return;state.rewardPhaseComplete=true;unlockRewardAchievement('phaseComplete');dom.star.classList.add('completion-settle');setTimeout(()=>dom.star?.classList.remove('completion-settle'),1050);adaptiveAudioResolve('completion');
 if(s.mode==='convection'){RewardDirector.show({kicker:'OBJETIVO CIENTÍFICO',title:'CONVECÇÃO ESTELAR',text:'Você dominou o ciclo entre atividade nuclear e transporte convectivo.',priority:3,duration:1950,kind:'completion'})}
 else if(s.mode==='remnant'){registerRewardDiscovery('phenomenon:neutronStar',{title:'ESTRELA DE NÊUTRONS',text:'Remanescente compacto formado.',silent:true});playScientificSignature('neutronStar')}
 else if(s.mode==='blackhole'){registerRewardDiscovery('phenomenon:blackHole',{title:'BURACO NEGRO',text:'Horizonte de eventos alcançado.',silent:true});playScientificSignature('blackHole')}
 else if(s.id==='rp_te'||state.rpCyclesObserved>0)playScientificSignature('rpCycle');
 else RewardDirector.show({kicker:'OBJETIVO CIENTÍFICO',title:String(s.title||'FASE').toUpperCase(),text:'A estrela estabiliza enquanto a fase fica pronta para prosseguir.',priority:3,duration:1950,kind:'completion'});
}

function starSize(){return dom.star.clientWidth}
function cellSize(){const g=phaseGeometry(),minCell=g.r>=5?28:36;return Math.max(minCell,Math.min(72,starSize()*.88/(2*g.r+1)))}
function pos(c){const a=cellSize()*.58,x=starSize()/2+a*Math.sqrt(3)*(c.q+c.r/2),y=starSize()/2+a*1.5*c.r;return{x,y}}
function outside(i){const p=pos(coords[i]),c=starSize()/2,a=Math.atan2(p.y-c,p.x-c),rr=starSize()*.56+18+Math.random()*20;return{x:c+Math.cos(a)*rr,y:c+Math.sin(a)*rr}}
function elementStyle(sym){const c=E[sym].c;return`radial-gradient(circle at 36% 30%,${c[0]},${c[1]} 44%,${c[2]} 76%)`}
function freePoint(pad=42){const size=starSize(),c=size/2;for(let tries=0;tries<30;tries++){const x=pad+Math.random()*(size-pad*2),y=pad+Math.random()*(size-pad*2);if(Math.hypot(x-c,y-c)>52)return{x,y}}return{x:c+90,y:c}}
function createFreePiece(sym,x=null,y=null,opts={}){const pt=(x===null||y===null)?freePoint():{x,y},id=state.nextId++,piece={id,sym,cell:null,free:true,x:pt.x,y:pt.y,captures:0,matterState:opts.matterState||'nucleus',boundElectrons:Number(opts.boundElectrons||0),massNumber:opts.massNumber??E[sym]?.mass??null,longRadioactive:!!opts.longRadioactive,lineage:normalizeMatterLineage(opts.lineage?.length?opts.lineage:freshMatterLineage())};armIntrinsicInstability(piece);state.pieces.set(id,piece);return piece}
function nearestOpenStellarCell(x,y){
 const open=activeCells().filter(i=>state.board[i]===null);if(!open.length)return null;
 return open.reduce((best,cell)=>{const a=pos(coords[best]),b=pos(coords[cell]);return Math.hypot(b.x-x,b.y-y)<Math.hypot(a.x-x,a.y-y)?cell:best},open[0])
}
function createParticleReactionProduct(sym,x,y,opts={}){
 if(isPrimordial())return{piece:createFreePiece(sym,x,y,opts),cell:null,ejected:false};
 const cell=nearestOpenStellarCell(x,y);
 if(cell===null){const piece=createFreePiece(sym,x,y,opts);piece.stellarEjecting=true;return{piece,cell:null,ejected:true}}
 const piece=createPiece(sym,cell,false,opts);piece.x=x;piece.y=y;return{piece,cell,ejected:false}
}
async function settleParticleReactionProduct(spawn){
 if(!spawn?.piece||isPrimordial())return spawn?.piece||null;const piece=spawn.piece;
 if(spawn.ejected){const c=starSize()/2,dx=piece.x-c,dy=piece.y-c,d=Math.hypot(dx,dy),a=d>.001?Math.atan2(dy,dx):Math.random()*Math.PI*2,reach=Math.max(starSize()*1.30,Math.hypot(window.innerWidth,window.innerHeight)*.72);piece.x=c+Math.cos(a)*reach;piece.y=c+Math.sin(a)*reach;renderPieces();await wait(540);state.pieces.delete(piece.id);renderPieces();return null}
 const target=pos(coords[spawn.cell]);piece.x=target.x;piece.y=target.y;renderPieces();await wait(320);return piece
}
function stopPrimordialDrift(){if(state.primordialDriftTimer){clearInterval(state.primordialDriftTimer);state.primordialDriftTimer=null}}
function startPrimordialDrift(){
 stopPrimordialDrift();const s=phase();if(s.mode==='opening'||!state.primordialParticles.size)return;
 state.primordialDriftTimer=setInterval(()=>{
   const now=phase();if(now.mode==='opening'||state.phaseDone)return;
   const size=starSize(),pad=22,c=size/2,stellar=!isPrimordial(now);
   const freeProtons=[...state.primordialParticles.values()].filter(q=>q.kind==='p'&&!q.reacting);
   state.primordialParticles.forEach(p=>{
     if(p.reacting||p.dragging||p.throwing||state.primordialSelected===p.id)return;
     if(stellar&&advanceStellarShellParticle(p))return;
     let step=7+Math.random()*9,a=Math.random()*Math.PI*2;
     if(stellar&&p.kind==='p'){
       // Prótons livres continuam vagando, mas passam um pouco mais de tempo no interior.
       step=5+Math.random()*7;
       if(Math.random()<.34)a=Math.atan2(c-p.y,c-p.x)+(Math.random()-.5)*.75;
     }else if(stellar&&p.kind==='e'){
       // Elétrons são muito mais móveis e difusos; uma atração fraca ajuda a manter quase-neutralidade.
       step=11+Math.random()*12;
       if(freeProtons.length&&Math.random()<.13){
         const q=freeProtons.reduce((best,x)=>Math.hypot(x.x-p.x,x.y-p.y)<Math.hypot(best.x-p.x,best.y-p.y)?x:best,freeProtons[0]);
         a=Math.atan2(q.y-p.y,q.x-p.x)+(Math.random()-.5)*1.15;
       }
     }
     p.x=Math.max(pad,Math.min(size-pad,p.x+Math.cos(a)*step));
     p.y=Math.max(pad,Math.min(size-pad,p.y+Math.sin(a)*step));
   });
   renderPrimordialParticles();
 },stellarParticleDriftDelay(s))
}
function stellarParticleDriftDelay(s=phase()){return isPrimordial(s)?920:720}
function stellarCoreAnchor(){
 const centerCell=(byRing[0]||[])[0];
 if(centerCell===undefined)return{x:starSize()/2,y:starSize()/2,cell:null,piece:null};
 const id=state.board[centerCell],piece=id?state.pieces.get(id):null;
 if(piece&&!piece.free)return{x:piece.x,y:piece.y,cell:centerCell,piece};
 const q=pos(coords[centerCell]);return{x:q.x,y:q.y,cell:centerCell,piece:null};
}
function stellarShellOrbitRadius(kind,id){const size=starSize(),jitter=((id%7)-3)*size*.0045,kindBias=kind==='e'?size*.010:kind==='n'?-size*.005:0;return Math.max(size*.435,Math.min(size*.495,size*.468+jitter+kindBias))}
function primeStellarShellParticle(p,kind=p?.kind||'n'){
 if(!p||!['p','n','e'].includes(kind))return false;const c=starSize()/2,dx=p.x-c,dy=p.y-c;p.shellOrbiting=true;p.shellOrbitAngle=Math.atan2(dy||1,dx||1);p.shellOrbitRadius=stellarShellOrbitRadius(kind,p.id);p.shellOrbitDirection=p.id%2?1:-1;return true;
}
function stellarShellTarget(p,kind=p?.kind||'n'){if(!p)return null;if(!p.shellOrbiting)primeStellarShellParticle(p,kind);const c=starSize()/2,a=p.shellOrbitAngle||0,r=p.shellOrbitRadius||stellarShellOrbitRadius(kind,p.id);return{x:c+Math.cos(a)*r,y:c+Math.sin(a)*r}}
function advanceStellarShellParticle(p,kind=p?.kind||'n',angularStep=null){
 if(isPrimordial()||!p||!['p','n','e'].includes(kind))return false;if(!p.shellOrbiting)primeStellarShellParticle(p,kind);const c=starSize()/2,dx=p.x-c,dy=p.y-c,d=Math.hypot(dx,dy)||1,targetR=stellarShellOrbitRadius(kind,p.id),currentA=Math.atan2(dy,dx),dir=p.shellOrbitDirection||1,step=angularStep??(kind==='e'?.12:kind==='p'?.075:.055),radial=d+(targetR-d)*.28;p.shellOrbitRadius=targetR;p.shellOrbitAngle=currentA+dir*step;p.x=c+Math.cos(p.shellOrbitAngle)*radial;p.y=c+Math.sin(p.shellOrbitAngle)*radial;return true;
}
function clearPrimordialParticles(){stopPrimordialDrift();cancelParticleDrag();state.primordialParticles.clear();state.primordialSelected=null;if(dom.primordial)dom.primordial.innerHTML=''}
function primordialNeutronsStable(s=phase()){return s.mode==='opening'||s.mode==='primordialNuclear'||s.mode==='atomicRecombination'}
function primordialNeutronLifetime(s=phase()){
 // O decaimento do nêutron livre será apresentado depois da nucleossíntese primordial.
 // Dentro deste bloco, n é matéria-base estável para a linguagem da fase.
 return primordialNeutronsStable(s)?null:3
}
function particleCanBeThrown(p){return !!p&&['p','e','n'].includes(p.kind)&&!p.reacting}
function particlePointerPoint(ev){const r=dom.star.getBoundingClientRect(),scale=starSize()/Math.max(1,r.width),pad=22;return{x:Math.max(pad,Math.min(starSize()-pad,(ev.clientX-r.left)*scale)),y:Math.max(pad,Math.min(starSize()-pad,(ev.clientY-r.top)*scale))}}
function cancelParticleDrag(){const d=state.particleDrag;if(!d)return;if(d.holdTimer)clearTimeout(d.holdTimer);const p=state.primordialParticles.get(d.id);if(p){p.dragging=false;if(!p.throwing)renderPrimordialParticles()}state.particleDrag=null}
function armParticleDrag(id,el,ev){
 const p=state.primordialParticles.get(id);if(!particleCanBeThrown(p)||state.locked||state.phaseDone||ev.pointerType==='mouse'&&ev.button!==0)return;
 cancelParticleDrag();const pt=particlePointerPoint(ev),now=performance.now(),d={id,pointerId:ev.pointerId,el,active:false,lastX:pt.x,lastY:pt.y,lastT:now,vx:0,vy:0,holdTimer:null};state.particleDrag=d;
 try{el.setPointerCapture(ev.pointerId)}catch(e){}
 d.holdTimer=setTimeout(()=>{const cur=state.particleDrag,q=state.primordialParticles.get(id);if(!cur||cur!==d||!particleCanBeThrown(q))return;cur.active=true;q.dragging=true;q.throwing=false;q.throwVx=0;q.throwVy=0;if(state.primordialSelected===id)state.primordialSelected=null;vibrate(8);renderPrimordialParticles()},230)
}
function moveParticleDrag(id,ev){
 const d=state.particleDrag;if(!d||d.id!==id||d.pointerId!==ev.pointerId)return;const pt=particlePointerPoint(ev),now=performance.now();
 if(d.active){ev.preventDefault();const p=state.primordialParticles.get(id);if(!p)return cancelParticleDrag();const dt=Math.max(8,now-d.lastT),vx=(pt.x-d.lastX)/dt,vy=(pt.y-d.lastY)/dt;d.vx=d.vx*.45+vx*.55;d.vy=d.vy*.45+vy*.55;p.x=pt.x;p.y=pt.y;renderPrimordialParticles()}
 d.lastX=pt.x;d.lastY=pt.y;d.lastT=now
}
function animateParticleThrow(id,vx,vy){
 const p=state.primordialParticles.get(id);if(!p)return;const maxSpeed=.95,speed=Math.hypot(vx,vy);if(speed>maxSpeed){vx*=maxSpeed/speed;vy*=maxSpeed/speed}p.throwing=true;p.throwVx=vx;p.throwVy=vy;let last=performance.now(),frames=0;
 const step=now=>{const q=state.primordialParticles.get(id);if(!q||q.reacting||q.dragging){if(q)q.throwing=false;return}const dt=Math.min(34,Math.max(8,now-last));last=now;const size=starSize(),pad=22;q.x+=q.throwVx*dt;q.y+=q.throwVy*dt;if(q.x<pad){q.x=pad;q.throwVx=Math.abs(q.throwVx)*.62}else if(q.x>size-pad){q.x=size-pad;q.throwVx=-Math.abs(q.throwVx)*.62}if(q.y<pad){q.y=pad;q.throwVy=Math.abs(q.throwVy)*.62}else if(q.y>size-pad){q.y=size-pad;q.throwVy=-Math.abs(q.throwVy)*.62}const drag=Math.pow(.965,dt/16.67);q.throwVx*=drag;q.throwVy*=drag;renderPrimordialParticles();frames++;if(Math.hypot(q.throwVx,q.throwVy)>.018&&frames<110)requestAnimationFrame(step);else{q.throwing=false;q.throwVx=0;q.throwVy=0;renderPrimordialParticles();startPrimordialDrift()}};
 requestAnimationFrame(step)
}
function finishParticleDrag(id,ev,cancel=false){
 const d=state.particleDrag;if(!d||d.id!==id||d.pointerId!==ev.pointerId)return false;if(d.holdTimer)clearTimeout(d.holdTimer);const p=state.primordialParticles.get(id),wasActive=d.active;state.particleDrag=null;try{d.el.releasePointerCapture(ev.pointerId)}catch(e){}
 if(!p)return wasActive;if(wasActive){ev.preventDefault();ev.stopPropagation();p.dragging=false;p.suppressTapUntil=performance.now()+520;const v=cancel?{x:0,y:0}:{x:d.vx,y:d.vy};if(Math.hypot(v.x,v.y)>.06)animateParticleThrow(id,v.x,v.y);else{p.throwing=false;renderPrimordialParticles();startPrimordialDrift()}return true}return false
}
function createPrimordialParticle(kind,x=null,y=null,target=null){const pt=(x===null||y===null)?freePoint(25):{x,y},id=state.nextPrimordialId++,p={id,kind,x:pt.x,y:pt.y,reacting:false};if(kind==='n'){p.unstable=!primordialNeutronsStable();p.bornRound=state.nuclearRound;p.lifetimeRounds=primordialNeutronLifetime()}if(target){p.targetX=target.x;p.targetY=target.y}if(!isPrimordial()&&['p','n','e'].includes(kind))primeStellarShellParticle(p,kind);state.primordialParticles.set(id,p);return p}
function countFloatingParticle(kind){let n=0;state.primordialParticles.forEach(p=>{if(p.kind===kind)n++});return n}
function spawnFloatingParticle(kind,x=null,y=null){
 const start=(x===null||y===null)?freePoint(25):{x,y},p=createPrimordialParticle(kind,start.x,start.y),shell=!isPrimordial()&&['p','n','e'].includes(kind),dest=shell?stellarShellTarget(p,kind):freePoint(30);p.reacting=true;renderPrimordialParticles();
 requestAnimationFrame(()=>{p.x=dest.x;p.y=dest.y;renderPrimordialParticles()});
 setTimeout(()=>{const q=state.primordialParticles.get(p.id);if(q){q.reacting=false;renderPrimordialParticles();startPrimordialDrift()}},420);return p
}
function ensurePrimordialParticleMix({p=0,e=0,n=0}={}){for(const [kind,min] of Object.entries({p,e,n}))while(countFloatingParticle(kind)<min)createPrimordialParticle(kind)}
function snapshotPrimordialParticles(){const size=starSize();return[...state.primordialParticles.values()].map(p=>{const timed=p.kind==='n'&&Number.isFinite(p.lifetimeRounds);return{kind:p.kind,x:p.x/size,y:p.y/size,lifetimeRounds:timed?p.lifetimeRounds:null,lifeLeft:timed?Math.max(1,p.lifetimeRounds-(state.nuclearRound-(p.bornRound??state.nuclearRound))):null}})}
function restorePrimordialParticles(items=[]){const size=starSize();for(const item of items){const q=createPrimordialParticle(item.kind,Math.max(22,Math.min(size-22,item.x*size)),Math.max(22,Math.min(size-22,item.y*size)));if(q.kind==='n'&&!primordialNeutronsStable()&&item.lifeLeft!=null){q.unstable=true;q.lifetimeRounds=Math.max(3,Number(item.lifetimeRounds||0),Number(item.lifeLeft||0));q.bornRound=state.nuclearRound-(q.lifetimeRounds-Math.max(1,item.lifeLeft))}}}
function snapshotFreePieces(){const size=starSize();return[...state.pieces.values()].filter(p=>p.free).map(p=>({sym:p.sym,x:p.x/size,y:p.y/size,matterState:p.matterState||'nucleus',boundElectrons:Number(p.boundElectrons||0),massNumber:p.massNumber??E[p.sym]?.mass??null,longRadioactive:!!p.longRadioactive}))}
function countFree(sym,predicate=null){let n=0;state.pieces.forEach(p=>{if(p.free&&p.sym===sym&&(!predicate||predicate(p)))n++});return n}
function primordialGoalCount(s=phase()){return isPrimordial(s)&&s.mode!=='opening'?(state.created[s.new]||0):(state.created[s.new]||0)}
function primordialReactionById(id){return PRIMORDIAL_NUCLEAR_REACTIONS.find(r=>r.id===id)||null}
function campaignKnowledgeReached(id){
 const campaign=window.ARDUA_CAMPAIGN,gs=campaign?.getState?.(),aware=!!campaign&&!campaign.editor&&gs&&Array.isArray(gs.completed);
 if(aware)return gs.activeId===id||gs.completed.includes(id);
 const i=phaseIndexById.get(id);return i!==undefined&&state.phaseIndex>=i
}
function learnedPrimordialNuclearReactions(){return PRIMORDIAL_NUCLEAR_REACTIONS.filter(r=>campaignKnowledgeReached(r.unlock))}
function primordialReactionReady(r){
 if(!r)return false;
 const pc=counts(r.pieces||[]),fc=counts(r.particles||[]);
 for(const [sym,need] of Object.entries(pc))if(countFree(sym)<need)return false;
 for(const [kind,need] of Object.entries(fc))if(countFloatingParticle(kind)<need)return false;
 return true
}
function nextPrimordialReactionToward(r,seen=new Set()){
 if(!r||seen.has(r.id))return null;seen.add(r.id);
 if(primordialReactionReady(r))return r;
 const pc=counts(r.pieces||[]);
 for(const [sym,need] of Object.entries(pc)){
   if(countFree(sym)>=need)continue;
   const producers=learnedPrimordialNuclearReactions().filter(q=>q.out===sym&&q.id!==r.id).reverse();
   for(const producer of producers){
     const next=nextPrimordialReactionToward(producer,new Set(seen));
     if(next)return next
   }
 }
 return r
}
function primordialContextualReaction(s=phase()){
 if(s.mode!=='primordialNuclear')return null;
 const target=primordialReactionById(s.recipeId);
 return nextPrimordialReactionToward(target,new Set())||target
}
function primordialParticlePairReaction(kinds){return learnedPrimordialNuclearReactions().find(r=>r.pieces.length===0&&r.particles.length===2&&same(r.particles,kinds))||null}
function primordialMixedReaction(pieceSym,particleKind){return learnedPrimordialNuclearReactions().find(r=>r.pieces.length===1&&r.particles.length===1&&r.pieces[0]===pieceSym&&r.particles[0]===particleKind)||null}
function primordialPieceReaction(syms){return learnedPrimordialNuclearReactions().find(r=>r.particles.length===0&&r.pieces.length===syms.length&&same(r.pieces,syms))||null}
function primordialPossiblePieceRecipes(syms){const c=counts(syms);return learnedPrimordialNuclearReactions().filter(r=>{if(r.particles.length||r.pieces.length<syms.length)return false;const rc=counts(r.pieces);return Object.entries(c).every(([k,v])=>(rc[k]||0)>=v)})}
function atomicRecipeUnlock(sym){return sym==='He'?'atomic_he':sym==='H'?'atomic_h':sym==='Li'?'atomic_li':null}
function atomicRecombinationLearned(sym){const id=atomicRecipeUnlock(sym);return !!id&&campaignKnowledgeReached(id)}
function pieceCharge(p){return Math.max(0,Number(E[p?.sym]?.n||0)-Number(p?.boundElectrons||0))}
function pieceCanBindElectron(p){return !!p&&p.free&&['H','He','Li'].includes(p.sym)&&atomicRecombinationLearned(p.sym)&&pieceCharge(p)>0}
function primordialMassForSym(sym){return({H:1,D:2,T:3,He3:3,He:4,Li:7})[sym]??E[sym]?.mass??null}
function ensureFreshPrimordialParticle(kind){
 const existing=[...state.primordialParticles.values()].filter(p=>p.kind===kind&&!p.reacting);
 if(kind!=='n'||primordialNeutronsStable()){if(!existing.length)createPrimordialParticle(kind);return}
 const fresh=existing.some(p=>(p.lifetimeRounds||3)-(state.nuclearRound-(p.bornRound??state.nuclearRound))>=3);
 if(!fresh)createPrimordialParticle('n');
}
function ensurePrimordialRecipeStarter(s=phase()){
 if(s.mode!=='primordialNuclear')return;
 const r=primordialReactionById(s.recipeId);if(!r)return;
 // O tabuleiro nuclear chega limpo a esta função: coloque exatamente os núcleos
 // necessários para UMA execução da receita-alvo. Partículas livres são matéria-base.
 const neededPieces={};for(const sym of r.pieces||[])neededPieces[sym]=(neededPieces[sym]||0)+1;
 for(const [sym,count] of Object.entries(neededPieces))for(let i=0;i<count;i++)createFreePiece(sym,null,null,{matterState:'nucleus',boundElectrons:0,massNumber:primordialMassForSym(sym),longRadioactive:sym==='T'});
 for(const kind of new Set(r.particles||[]))ensureFreshPrimordialParticle(kind);
}
function ensureAtomicRecipeStarter(s=phase()){
 if(s.mode!=='atomicRecombination')return;
 ensureFreshPrimordialParticle('e');
 if(s.atomicTarget==='H'){ensureFreshPrimordialParticle('p');return}
 const sym=s.atomicTarget;if(!sym)return;
 // Exatamente um núcleo-alvo: suficiente para formar um átomo. Os próximos núcleos
 // precisam nascer da rede primordial já aprendida.
 createFreePiece(sym,null,null,{matterState:'nucleus',boundElectrons:0,massNumber:primordialMassForSym(sym)});
}
function fillPrimordialStage(){
 const s=phase();clearBoard();clearPrimordialParticles();dom.singularity.classList.remove('show','exploding');dom.star.classList.add('primordial-mode');
 if(s.mode==='opening'){state.primordialTransfer=null;dom.singularity.classList.add('show');state.bigBangStarted=false;state.bigBangColorized=false;document.body.classList.add('prebang');return}
 const transfer=state.primordialTransfer;state.primordialTransfer=null;
 // um conjunto completo do reagente nuclear/atômico que produz 1 unidade do objetivo.
 // Núcleos excedentes da fase anterior deixam de ser herdados como atalhos: as demais
 // unidades precisam ser reconstruídas usando as receitas já aprendidas.
 if(transfer?.particles)restorePrimordialParticles(transfer.particles);
 if(s.mode==='primordialNuclear'){
   // Fases 2–7 trabalham apenas com núcleons. Elétrons do Big Bang ficam fora deste bloco didático.
   for(const [id,p] of [...state.primordialParticles])if(p.kind==='e'||p.kind==='pos')state.primordialParticles.delete(id);
   ensurePrimordialParticleMix({p:12,e:0,n:14});ensurePrimordialRecipeStarter(s);startPrimordialDrift();return;
 }
 if(s.mode==='atomicRecombination'){
   // Elétrons e núcleons continuam abundantes como matéria-base; o núcleo-alvo aparece
   // apenas uma vez. Novos He/Li devem ser reconstruídos pela rede primordial acumulada.
   ensurePrimordialParticleMix({p:10,e:20,n:8});ensureAtomicRecipeStarter(s);startPrimordialDrift();return;
 }
}
function drawCells(){dom.cells.innerHTML='';const active=activeSet();coords.forEach((c,i)=>{if(!active.has(i))return;const p=pos(c),el=document.createElement('div');el.className='cell';el.dataset.cell=i;el.style.left=p.x+'px';el.style.top=p.y+'px';el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();moveSelectedAtom(i)});dom.cells.appendChild(el)});updateMoveTargets()}
function normalizeMatterLineage(lineage=[]){
 const raw=Array.isArray(lineage)?lineage:(lineage instanceof Set?[...lineage]:[]);return [...new Set(raw.map(String).filter(Boolean))].sort();
}
function freshMatterLineage(){return [`m${state.nextMatterOrigin++}`]}
function pieceMatterLineage(piece){if(!piece)return[];if(!Array.isArray(piece.lineage)||!piece.lineage.length)piece.lineage=freshMatterLineage();piece.lineage=normalizeMatterLineage(piece.lineage);return piece.lineage}
function mergeMatterLineages(pieces=[]){return normalizeMatterLineage(pieces.flatMap(pieceMatterLineage))}
function matterLineageKey(lineage=[]){return normalizeMatterLineage(lineage).join('|')}
function objectiveLineageIsFresh(s,lineage){if(!s?.uniqueMatterObjective)return true;const key=matterLineageKey(lineage);return !!key&&!state.objectiveLineages.has(key)}
function creditObjectiveLineage(s,lineage){if(!s?.uniqueMatterObjective)return true;const key=matterLineageKey(lineage);if(!key||state.objectiveLineages.has(key))return false;state.objectiveLineages.add(key);return true}
function createPiece(sym,cell,fromOutside=false,opts={}){const id=state.nextId++,p0=fromOutside?outside(cell):pos(coords[cell]),piece={id,sym,cell,x:p0.x,y:p0.y,captures:0,matterState:opts.matterState||'nucleus',boundElectrons:Number(opts.boundElectrons||0),massNumber:opts.massNumber??E[sym]?.mass??null,longRadioactive:!!opts.longRadioactive,lineage:normalizeMatterLineage(opts.lineage?.length?opts.lineage:freshMatterLineage())};armIntrinsicInstability(piece);state.pieces.set(id,piece);state.board[cell]=id;return piece}
function clearBoard(){state.board=Array(coords.length).fill(null);state.pieces.clear();state.selected=[];state.freeSelected=[];state.created={};dom.lines.innerHTML='';dom.pieces.innerHTML=''}
function exactStarterSymbols(s=phase()){
  if(!Array.isArray(s.starterGroups))return new Set();
  return new Set(s.starterGroups.flat());
}
function backgroundProfile(s=phase()){
  let profile=phaseAbundance(s);
  // Nas fases de reconstrução em cadeia, tudo o que foi explicitamente colocado
  // como reagente histórico é proibido no preenchimento automático. Assim cada
  // pista inicial aparece exatamente na quantidade declarada em starterGroups.
  if(s.chainRebuild&&Array.isArray(s.starterGroups)){
    const allowed=new Set(s.allowBackground||[]),forbidden=exactStarterSymbols(s);
    const filtered=profile.filter(([sym])=>allowed.has(sym)||!forbidden.has(sym));
    profile=filtered.length?filtered:[['H',1]];
  }
  return profile;
}
function incomingSymbol(avoidCurrentTarget=false){
 const s=phase();if(s.id==='brown'||s.id==='he_red'||s.id==='coulomb_intro')return 'H';let profile=backgroundProfile(s);
 if(avoidCurrentTarget&&['fusion'].includes(s.mode)&&s.new){const filtered=profile.filter(([sym])=>sym!==s.new);if(filtered.length)profile=filtered}
 return weightedSpawn(profile)
}
function peripheralEmptyCell(){
  const empties=activeCells().filter(i=>state.board[i]===null);
  if(!empties.length)return null;
  const maxRing=Math.max(...empties.map(i=>coords[i].ring));
  const edge=empties.filter(i=>coords[i].ring===maxRing);
  return edge[Math.floor(Math.random()*edge.length)]??empties[0];
}
function spawnAccretionMatter(){
  const s=phase();
  if(s.mode!=='accretion'||state.phaseDone||state.popupOpen||state.locked)return false;
  if(state.pieces.size>=(s.feedCap||14))return false;
  const cell=peripheralEmptyCell();if(cell===null)return false;
  const p=createPiece(replenishmentSymbol(),cell,true);renderPieces();
  requestAnimationFrame(()=>{const q=pos(coords[cell]);p.x=q.x;p.y=q.y;renderPieces()});
  return true;
}
function stopAccretionFeed(){if(state.accretionTimer){clearTimeout(state.accretionTimer);state.accretionTimer=null}}
function startAccretionFeed(){
  stopAccretionFeed();if(phase().mode!=='accretion'||state.phaseDone||state.popupOpen)return;
  const tick=()=>{if(phase().mode!=='accretion'||state.phaseDone){stopAccretionFeed();return}spawnAccretionMatter();state.accretionTimer=setTimeout(tick,760+Math.random()*520)};
  state.accretionTimer=setTimeout(tick,620);
}
function restoreMatterSnapshot(snapshot){
  clearBoard();applyGeometry();drawCells();const active=activeSet();
  for(const item of snapshot){let cell=item.cell;if(!active.has(cell)||state.board[cell]!==null){const empty=activeCells().find(i=>state.board[i]===null);if(empty===undefined)break;cell=empty}createPiece(item.sym,cell,false)}
  renderPieces();
}

function phaseFusionRecipes(s=phase()){
  if(s.id==='brown')return[BROWN_FUSION];
  if(s.id==='he_red')return[RED_UNSTABLE_FUSION,RED_STABLE_FUSION];
  if(s.id==='he_orange')return[FUSIONS.D,FUSIONS.He3];
  if(s.id==='he_yellow')return[FUSIONS.D,FUSIONS.He3,FUSIONS.He];
  if(s.id==='coulomb_intro')return[FUSIONS.He];
  if(s.id==='stellar_li')return[FUSIONS.Be7];
  if(s.id==='carbon_burn')return[CARBON_CARBON_FUSION];
  if(s.id==='carbon_oxygen')return[CARBON_OXYGEN_FUSION];
  if(s.id==='oxygen_burn')return[OXYGEN_OXYGEN_FUSION];
  if(s.id==='cr_alpha_fe')return[CHROMIUM_ALPHA_FUSION];
  if(s.mode==='whiteCompact')return[FUSIONS.Be8,FUSIONS.C,FUSIONS.O];
  const r=FUSIONS[s.new];
  return r?[r]:[];
}
function phaseFusionRecipe(s=phase()){return phaseFusionRecipes(s)[0]||null}
function starterIngredients(s=phase()){
  if(s.id==='he_red')return ['H'];
  // Nas fases que ensinam etapas sucessivas da cadeia pp, entregue somente os
  // reagentes da transformação que produz diretamente uma unidade do objetivo.
  // Depois da primeira unidade, o jogador reconstrói os intermediários pelas
  // receitas já aprendidas.
  if(s.id==='he_orange')return [...FUSIONS.He3.ing];
  if(s.id==='he_yellow')return [...FUSIONS.He.ing];
  if(Array.isArray(s.starterGroups))return s.starterGroups.flat();
  if(s.mode==='fusion'&&phaseFusionRecipe(s))return [...phaseFusionRecipe(s).ing];
  if(s.mode==='neutron'&&s.seed){
    const fuel=(fusionSandboxAllowed(s)&&recipeEnvironmentAllows(FUSIONS.D,s))?[...FUSIONS.D.ing]:[];
    return [...fuel,...Array(Math.max(1,s.seedCount||1)).fill(s.seed)];
  }
  return [];
}
function starterCluster(n){
  if(!n)return[];
  const active=activeSet(),centers=activeCells().slice().sort((a,b)=>coords[a].ring-coords[b].ring);
  for(const center of centers){
    const cluster=[center,...neigh[center].filter(x=>active.has(x))];
    if(cluster.length>=n)return cluster.slice(0,n);
  }
  return centers.slice(0,n);
}
function placeNeutronMechanicFuel(s,reserved){
 const g=neutronGameplay(s);if(s.mode!=='neutron'||!g.source)return reserved;
 const active=activeSet(),free=activeCells().filter(c=>!reserved.has(c)&&state.board[c]===null).sort(()=>Math.random()-.5);
 let sourceCell=null,heCell=null;
 for(const c of free){const n=(neigh[c]||[]).find(x=>active.has(x)&&!reserved.has(x)&&state.board[x]===null);if(n!==undefined){sourceCell=c;heCell=n;break}}
 if(sourceCell===null||heCell===null)return reserved;
 createPiece(g.source,sourceCell,false);createPiece('He',heCell,false);reserved.add(sourceCell);reserved.add(heCell);return reserved;
}

function placeStarterGroups(groups){
  const used=new Set(),active=activeSet(),all=activeCells();
  const shuffled=()=>all.slice().sort(()=>Math.random()-.5);
  for(const group of groups||[]){
    let cells=[];
    if(group.length===1){const c=shuffled().find(x=>!used.has(x));if(c!==undefined)cells=[c]}
    else{
      for(const center of shuffled()){
        if(used.has(center))continue;
        const near=neigh[center].filter(n=>active.has(n)&&!used.has(n)).sort(()=>Math.random()-.5);
        if(near.length>=group.length-1){cells=[center,...near.slice(0,group.length-1)];break}
      }
    }
    if(cells.length<group.length)cells=shuffled().filter(x=>!used.has(x)).slice(0,group.length);
    cells.forEach((cell,i)=>{if(i<group.length){createPiece(group[i],cell,false);used.add(cell)}})
  }
  return used;
}

function atlasPairMatches(sp,syms){return !!sp&&same([sp.a,sp.b],syms)}
function atlasFindEmptyPair(preferOuter=false){
 const active=activeSet(),cells=activeCells().filter(c=>state.board[c]===null).sort((a,b)=>{
   if(preferOuter){const aa=Math.abs((coords[a]?.ring??0)-2.5),bb=Math.abs((coords[b]?.ring??0)-2.5);if(aa!==bb)return aa-bb}
   return (coords[a]?.ring??0)-(coords[b]?.ring??0)
 });
 for(const a of cells){const n=(neigh[a]||[]).find(b=>active.has(b)&&state.board[b]===null);if(n!==undefined)return[a,n]}
 return null;
}
function atlasCreatePair(sp,preferOuter=false){
 const cells=atlasFindEmptyPair(preferOuter);if(!cells)return false;
 const a=createPiece(sp.a,cells[0],false,{massNumber:sp.A1}),b=createPiece(sp.b,cells[1],false,{massNumber:sp.A2});
 for(const q of [a,b]){const t=pos(coords[q.cell]);q.x=t.x;q.y=t.y}
 return true;
}
function hasAtlasAdjacentPair(sp=atlasSpec()){
 if(!sp)return false;const active=activeSet();
 for(const c of activeCells()){const id=state.board[c],p=id?state.pieces.get(id):null;if(!p||![sp.a,sp.b].includes(p.sym))continue;
   for(const n of neigh[c]||[]){if(!active.has(n))continue;const id2=state.board[n],q=id2?state.pieces.get(id2):null;if(q&&atlasPairMatches(sp,[p.sym,q.sym]))return true}
 }return false;
}
function atlasBackgroundProfile(s=phase()){
 const sp=atlasSpec(s),forbidden=new Set([sp?.mainSym].filter(Boolean));
 // H e He continuam abundantes mesmo quando participam da reação-alvo. Reagentes
 // pesados do par aparecem prontos somente na oportunidade inicial ou como sementes raras.
 for(const sym of [sp?.a,sp?.b])if(sym&&!['H','He'].includes(sym))forbidden.add(sym);
 const base=phaseAbundance(s).filter(([sym])=>!forbidden.has(sym));
 return base.length?base:ABUNDANCE.primordial;
}
function atlasBackgroundSymbol(s=phase()){return weightedSpawn(atlasBackgroundProfile(s))}
function atlasNeededCounts(sp){return counts([sp.a,sp.b])}
function atlasMissingReactants(sp,available=boardSymbolCounts()){
 const need=atlasNeededCounts(sp),missing=[];
 for(const [sym,n] of Object.entries(need))for(let i=0;i<Math.max(0,n-(available[sym]||0));i++)missing.push(sym);
 return missing;
}
function atlasSpawnFallbackReactant(sym,s=phase()){
 const sp=atlasSpec(s),cell=peripheralEmptyCell();if(!sp||cell===null)return false;
 const mass=sym===sp.a?sp.A1:(sym===sp.b?sp.A2:(E[sym]?.mass??null)),p=createPiece(sym,cell,true,{massNumber:mass});
 renderPieces();requestAnimationFrame(()=>{const q=pos(coords[cell]);p.x=q.x;p.y=q.y;renderPieces()});return true;
}
function fillAtlasStage(s=phase()){
 const sp=atlasSpec(s);if(!sp)return;const outer=sp.category==='endothermic'||sp.category==='inaccessible';
 // Exatamente uma oportunidade pronta, como nas fases normais de fusão.
 atlasCreatePair(sp,outer);
 const empties=activeCells().filter(cell=>state.board[cell]===null).sort(()=>Math.random()-.5),amount=Math.max(0,Math.min(desiredFill()-state.pieces.size,empties.length));
 empties.slice(0,amount).forEach((cell,i)=>createPiece(atlasBackgroundSymbol(s),cell,i<Math.min(22,amount)));
 if(protonCaptureAvailable(s)){ensureProtonCaptureFuel(2);startPrimordialDrift()}
 renderPieces();renderPrimordialParticles();requestAnimationFrame(()=>{state.pieces.forEach(p=>{if(p.cell!==null){const t=pos(coords[p.cell]);p.x=t.x;p.y=t.y}});renderPieces()});setTimeout(ensureOpportunity,420);
}
function ensureAtlasOpportunity(s=phase()){
 const sp=atlasSpec(s);if(!sp||state.phaseDone)return false;if(hasAtlasAdjacentPair(sp))return true;
 const available=boardSymbolCounts(),need=atlasNeededCounts(sp),missing=atlasMissingReactants(sp,available);
 // Se os dois reagentes já existem, o desafio passa a ser aproximá-los.
 if(!missing.length)return true;
 // Prefira sempre reconstruir o reagente por uma cadeia nuclear já aprendida.
 for(const sym of [...new Set(missing)]){const action=nextExecutableActionTowardSymbol(sym,s,new Set());if(action)return true}
 // Alguns pares do Atlas usam sementes que ainda não têm uma rota jogável (B, Be, F etc.).
 // Nesses casos entra uma única semente por vez pela periferia, nunca um par completo.
 const rare=[...new Set(missing)].sort((a,b)=>(E[a]?.n??999)-(E[b]?.n??999));
 if(rare.length&&atlasSpawnFallbackReactant(rare[0],s))return true;
 // Último recurso: preserve combustível leve para que a cadeia pp possa recomeçar.
 const h=(available.H||0);if(h<2){const cell=peripheralEmptyCell();if(cell!==null){createPiece('H',cell,true);renderPieces();return true}}
 return Object.entries(need).every(([sym,n])=>(boardSymbolCounts()[sym]||0)>=n);
}
function atlasNextRecipeLine(s=phase()){
 const sp=atlasSpec(s);if(!sp)return s.meta||'';
 const available=boardSymbolCounts(),need=atlasNeededCounts(sp),hasAll=Object.entries(need).every(([sym,n])=>(available[sym]||0)>=n);
 // A reação do Atlas só vira recomendação quando a quantidade inteira dos dois
 // reagentes já existe. Assim, Li + Li nunca aparece com apenas um Li na grade.
 if(hasAll)return atlasHeaderLine(s);
 const missing=atlasMissingReactants(sp,available),ordered=[...new Set(missing)].sort((a,b)=>(E[a]?.n??999)-(E[b]?.n??999));
 for(const sym of ordered){const action=nextExecutableActionTowardSymbol(sym,s,new Set());if(action&&guidanceActionIsExecutable(action,s))return guidanceActionLine(action)}
 // Durante a entrada de matéria-prima, mantenha explícito qual ingrediente ainda
 // está sendo reconstruído em vez de voltar prematuramente à receita final.
 return ordered.length?`Reconstrua ${E[ordered[0]]?.name||ordered[0]}`:atlasHeaderLine(s);
}
function atlasCandidateCells(s=phase()){
 const sp=atlasSpec(s);if(!sp||state.selected.length!==1)return[];
 const firstCell=state.selected[0],first=state.pieces.get(state.board[firstCell]);if(!first||![sp.a,sp.b].includes(first.sym))return[];
 return(neigh[firstCell]||[]).filter(c=>{const id=state.board[c],q=id?state.pieces.get(id):null;return !!q&&atlasPairMatches(sp,[first.sym,q.sym])});
}
function atlasPairKey(ids){return ids.slice().sort((a,b)=>a-b).join('-')}
function atlasGhost(x,y,label,tremble=false){
 const d=document.createElement('div');d.className='atlas-ghost'+(tremble?' tremble':'');d.textContent=label;d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);return d;
}
function atlasEnergyInflow(x,y){
 for(let i=0;i<8;i++){const d=document.createElement('i'),a=Math.random()*Math.PI*2,dist=55+Math.random()*55;d.className='atlas-energy-inflow';d.style.left=x+'px';d.style.top=y+'px';d.style.setProperty('--sx',`calc(-50% + ${Math.cos(a)*dist}px)`);d.style.setProperty('--sy',`calc(-50% + ${Math.sin(a)*dist}px)`);dom.fx.appendChild(d);setTimeout(()=>d.remove(),720)}
 tone(510,.10,'sine',.025);
}
function atlasShortOutcome(label){const parts=String(label||'').split('→');return(parts[1]||label||'').trim()}
async function atlasShowBranches(sp,x,y){
 const ghost=atlasGhost(x,y,`${infoSymbolFor(sp.compound)}*`,true);await wait(260);
 const labels=[{txt:atlasShortOutcome(sp.label),chosen:true},{txt:atlasShortOutcome(sp.altLabel||'outro canal'),chosen:false}];
 labels.forEach((o,i)=>{const d=document.createElement('div');d.className='atlas-branch'+(o.chosen?' chosen':'');d.textContent=o.txt;d.style.left=x+'px';d.style.top=y+'px';d.style.setProperty('--dx',`${i===0?'-115%':'15%'}`);d.style.setProperty('--dy',`${i===0?'-145%':'65%'}`);dom.fx.appendChild(d);setTimeout(()=>d.remove(),780)});
 tone(620,.10,'triangle',.03);await wait(520);ghost.remove();
}
async function atlasApproachAndReturn(ids,oneRound=true){
 const pieces=ids.map(id=>state.pieces.get(id)).filter(Boolean);if(pieces.length!==2)return;
 const [a,b]=pieces,ax=a.x,ay=a.y,bx=b.x,by=b.y,mx=(ax+bx)/2,my=(ay+by)/2,dx=bx-ax,dy=by-ay,len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len;
 a.x=mx-ux*8;a.y=my-uy*8;b.x=mx+ux*8;b.y=my+uy*8;a.atlasRebound=true;b.atlasRebound=true;renderPieces();tone(280,.08,'sine',.022);await wait(300);
 if(oneRound)await advanceNuclearRound();await wait(180);
 for(const q of pieces){q.atlasRebound=false;const t=pos(coords[q.cell]);q.x=t.x;q.y=t.y}renderPieces();tone(180,.07,'sine',.018);await wait(180);
}
function atlasSecondaryCell(origin){
 const active=activeSet();return (neigh[origin]||[]).find(c=>active.has(c)&&state.board[c]===null)??activeCells().find(c=>state.board[c]===null);
}
async function atlasEmitNeutron(x,y){
 const d=document.createElement('div');d.className='neutron passive';d.textContent='n';d.style.left=x+'px';d.style.top=y+'px';d.style.zIndex='46';dom.fx.appendChild(d);const a=Math.random()*Math.PI*2,dist=starSize()*.68;requestAnimationFrame(()=>{d.style.transition='transform .72s linear,opacity .72s linear';d.style.transform=`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(.6)`;d.style.opacity='0'});tone(430,.08,'sine',.02);await wait(740);d.remove();
}
async function atlasCreateSecondary(sp,origin,x,y){
 if(sp.channel==='alpha'){
   const cell=atlasSecondaryCell(origin);if(cell!==undefined){const q=createPiece('He',cell,false,{massNumber:4});q.x=x;q.y=y;q.newborn=true;renderPieces();requestAnimationFrame(()=>{const t=pos(coords[cell]);q.x=t.x;q.y=t.y;renderPieces()});setTimeout(()=>{const p=state.pieces.get(q.id);if(p){p.newborn=false;renderPieces()}},420)}
 }else if(sp.channel==='p'){
   const cell=atlasSecondaryCell(origin);if(cell!==undefined){const q=createPiece('H',cell,false,{massNumber:1});q.x=x;q.y=y;q.newborn=true;renderPieces();requestAnimationFrame(()=>{const t=pos(coords[cell]);q.x=t.x;q.y=t.y;renderPieces()});setTimeout(()=>{const p=state.pieces.get(q.id);if(p){p.newborn=false;renderPieces()}},420)}
 }else if(sp.channel==='n')await atlasEmitNeutron(x,y);
}
async function atlasCompleteChannel(sp,cells,ids,{endothermic=false}={}){
 const target=[...cells].sort((a,b)=>(coords[a]?.ring??99)-(coords[b]?.ring??99))[0],t=pos(coords[target]),pieces=ids.map(id=>state.pieces.get(id)).filter(Boolean);
 if(sp.category==='competing')await atlasShowBranches(sp,t.x,t.y);if(endothermic){atlasEnergyInflow(t.x,t.y);await wait(520)}const motif=pieces.length===2?await objectiveInteractionPrelude(`atlas:${sp.id}`,[objectiveInteractionPieceToken(pieces[0]),objectiveInteractionPieceToken(pieces[1])],sp.mainSym,t):null;
 cells.forEach(c=>state.board[c]=null);ids.forEach(id=>state.pieces.delete(id));renderPieces();const product=createPiece(sp.mainSym,target,false,{massNumber:sp.mainA});product.x=t.x;product.y=t.y;product.newborn=true;focusPieceInfo(product);state.created[sp.mainSym]=(state.created[sp.mainSym]||0)+1;state.discovered.add(sp.mainSym);state.atlasProgress++;recordFlow(1);state.selected=[];delete state.atlasBarrierPassed[atlasPairKey(ids)];if(motif)await objectiveInteractionRevealPiece(motif,product,t);else renderPieces();burst(t.x,t.y);if(sp.channel==='gamma')await emitGamma(t.x,t.y);else await atlasCreateSecondary(sp,target,t.x,t.y);setTimeout(()=>{const q=state.pieces.get(product.id);if(q){q.newborn=false;renderPieces()}},360);await afterNuclearAction({advanceRound:true,replenish:true,protectedPieceIds:[product.id]});ensureAtlasOpportunity();render();checkComplete();
}
async function atlasCreateFragmentCompound(sp,cells,ids){
 const target=[...cells].sort((a,b)=>(coords[a]?.ring??99)-(coords[b]?.ring??99))[0],t=pos(coords[target]),pieces=ids.map(id=>state.pieces.get(id)).filter(Boolean),motif=pieces.length===2?await objectiveInteractionPrelude(`atlas-fragment:${sp.id}`,[objectiveInteractionPieceToken(pieces[0]),objectiveInteractionPieceToken(pieces[1])],sp.compound,t):null;cells.forEach(c=>state.board[c]=null);ids.forEach(id=>state.pieces.delete(id));renderPieces();const compound=createPiece(sp.compound,target,false,{massNumber:sp.compoundA});compound.x=t.x;compound.y=t.y;compound.atlasCompound=true;compound.atlasSpecId=sp.id;compound.atlasLabel=`${infoSymbolFor(sp.compound)}*`;armPieceInstability(compound,{rounds:sp.rounds,mode:'atlasFragment',label:sp.label},state.nuclearRound+1);focusPieceInfo(compound);state.selected=[];delete state.atlasBarrierPassed[atlasPairKey(ids)];if(motif)await objectiveInteractionRevealPiece(motif,compound,t);else renderPieces();burst(t.x,t.y);tone(390,.12,'sawtooth',.03);await afterNuclearAction({advanceRound:true,replenish:true,protectedPieceIds:[compound.id]});ensureAtlasOpportunity();render();
}
async function resolveAtlasFragment(piece){
 if(!piece||!state.pieces.has(piece.id))return;const sp=ATLAS_BY_ID.get(piece.atlasSpecId);if(!sp)return;const x=piece.x,y=piece.y,origin=piece.cell;
 clearPieceInstability(piece);piece.sym=sp.mainSym;piece.massNumber=sp.mainA;piece.newborn=true;if(piece.sym==='Be8')armIntrinsicInstability(piece,state.nuclearRound+1);focusPieceInfo(piece);state.created[sp.mainSym]=(state.created[sp.mainSym]||0)+1;state.discovered.add(sp.mainSym);burst(x,y);await atlasCreateSecondary(sp,origin,x,y);state.atlasProgress++;recordFlow(1);tone(650,.12,'triangle',.04);
 setTimeout(()=>{const q=state.pieces.get(piece.id);if(q){q.newborn=false;renderPieces()}},380);ensureAtlasOpportunity();render();triggerPhaseMilestone();checkComplete();
}
async function resolveAtlasAttempt(cells){
 const s=phase(),sp=atlasSpec(s);if(s.mode!=='reactionExplore'||!sp||state.locked||cells.length!==2)return;const ids=cells.map(c=>state.board[c]),pieces=ids.map(id=>state.pieces.get(id));if(ids.some(x=>!x)||pieces.some(x=>!x)||!atlasPairMatches(sp,pieces.map(p=>p.sym)))return;
 state.locked=true;state.selected=[...cells];const innerCell=[...cells].sort((a,b)=>(coords[a]?.ring??99)-(coords[b]?.ring??99))[0],t=pos(coords[innerCell]);await teachAtlasPhaseOnce(s,t.x,t.y);
 const pairKey=atlasPairKey(ids);
 if(!state.atlasBarrierPassed[pairKey]){
   const barrierRecipe={ing:[sp.a,sp.b],out:sp.mainSym,heavyIon:true};
   if(!(await fusionBarrierPasses(barrierRecipe,cells,ids,[...cells].sort((a,b)=>(coords[a]?.ring??99)-(coords[b]?.ring??99))[0]))){state.locked=false;render();return}
   state.atlasBarrierPassed[pairKey]=true;
 }
 if(sp.category==='inaccessible'){
   const ctx=pieces.length===2?await objectiveInteractionPrelude(`atlas-inaccessible:${sp.id}`,[objectiveInteractionPieceToken(pieces[0]),objectiveInteractionPieceToken(pieces[1])],sp.mainSym,t):null;if(ctx)await objectiveInteractionRevealLabel(ctx,'×','SEM FUSÃO',t);else await atlasApproachAndReturn(ids,false);await advanceNuclearRound();state.atlasProgress++;recordFlow(1);state.selected=[];ensureAtlasOpportunity();state.locked=false;render();checkComplete();return;
 }
 if(sp.category==='rare'){
   const k=`rare:${sp.id}`,attempt=(state.atlasAttempts[k]||0)+1;state.atlasAttempts[k]=attempt;
   if(attempt<=sp.rareMisses){await atlasApproachAndReturn(ids,true);state.selected=[];state.locked=false;render();return}
   state.atlasAttempts[k]=0;await atlasCompleteChannel(sp,cells,ids);state.locked=false;return;
 }
 if(sp.category==='endothermic'){
   const target=[...cells].sort((a,b)=>(coords[a]?.ring??99)-(coords[b]?.ring??99))[0];
   if((coords[target]?.ring??9)>1){atlasEnergyInflow(t.x,t.y);await atlasApproachAndReturn(ids,true);state.selected=[];state.locked=false;render();return}
   await atlasCompleteChannel(sp,cells,ids,{endothermic:true});state.locked=false;return;
 }
 if(sp.category==='fragment'){await atlasCreateFragmentCompound(sp,cells,ids);state.locked=false;return}
 await atlasCompleteChannel(sp,cells,ids);state.locked=false;
}
function tapAtlasReaction(p){
 const s=phase(),sp=atlasSpec(s),cell=p?.cell;if(!sp||cell===null||cell===undefined)return false;
 if(state.selected.includes(cell)){state.selected=[];render();return true}
 if(!state.selected.length){
   if(![sp.a,sp.b].includes(p.sym))return false;
   const counterpart=(neigh[cell]||[]).some(n=>{const id=state.board[n],q=id?state.pieces.get(id):null;return !!q&&atlasPairMatches(sp,[p.sym,q.sym])});
   if(!counterpart)return false;
   state.selected=[cell];tone(315,.04);render();return true;
 }
 if(state.selected.length!==1)return false;
 const firstCell=state.selected[0],first=state.pieces.get(state.board[firstCell]);if(!first||![sp.a,sp.b].includes(first.sym))return false;
 if(!(neigh[firstCell]||[]).includes(cell)||!atlasPairMatches(sp,[first.sym,p.sym]))return false;
 state.selected=[firstCell,cell];render();setTimeout(()=>resolveAtlasAttempt([firstCell,cell]),80);return true;
}

function fillStage(){
  if(isPrimordial()){fillPrimordialStage();renderPieces();renderPrimordialParticles();return}
  clearPrimordialParticles();document.body.classList.remove('prebang');clearBoard();applyGeometry();drawCells();
  const s=phase();
  if(s.mode==='reactionExplore'){fillAtlasStage(s);return}
  if(s.id==='coulomb_intro'){
    const outerRing=phaseRadius(s),outer=(byRing[outerRing]||[]).slice().sort(()=>Math.random()-.5),outerSet=new Set(outer),used=new Set();
    let hePair=null;
    for(const a of outer){const b=(neigh[a]||[]).find(n=>outerSet.has(n));if(b!==undefined){hePair=[a,b];break}}
    if(!hePair)hePair=outer.slice(0,2);
    hePair.forEach(cell=>{if(cell!==undefined){createPiece('He3',cell,false);used.add(cell)}});
    const hexDist=(a,b)=>{const A=coords[a],B=coords[b],dq=A.q-B.q,dr=A.r-B.r,ds=(-A.q-A.r)-(-B.q-B.r);return Math.max(Math.abs(dq),Math.abs(dr),Math.abs(ds))};
    const hCount=Math.max(0,(s.fill||10)-used.size),chosen=[],candidates=activeCells().filter(c=>!used.has(c));
    while(chosen.length<hCount&&candidates.length){
      let bestIndex=0,bestScore=-Infinity;
      for(let i=0;i<candidates.length;i++){
        const c=candidates[i],anchors=[...used,...chosen],spread=anchors.length?Math.min(...anchors.map(a=>hexDist(c,a))):9,ringBias=(coords[c]?.ring||0)*.08,score=spread+ringBias+Math.random()*.12;
        if(score>bestScore){bestScore=score;bestIndex=i}
      }
      chosen.push(candidates.splice(bestIndex,1)[0]);
    }
    chosen.forEach(cell=>createPiece('H',cell,false));
    renderPieces();requestAnimationFrame(()=>{state.pieces.forEach(p=>{if(p.cell!==null){const q=pos(coords[p.cell]);p.x=q.x;p.y=q.y}});renderPieces()});return;
  }
  if(s.mode==='convection'){
    const inner=[...(byRing[0]||[]),...(byRing[1]||[])],used=new Set();
    inner.forEach(cell=>{createPiece('He3',cell,false);used.add(cell)});
    const edgeRing=phaseRadius(s);
    for(const [dq,dr] of dirs){const cell=coordIndex.get(`${dq*edgeRing},${dr*edgeRing}`);if(cell!==undefined&&!used.has(cell)){createPiece('H',cell,false);used.add(cell)}}
    const rest=activeCells().filter(cell=>!used.has(cell)).sort(()=>Math.random()-.5),pool=['H','H','He','He3'];
    const amount=Math.max(0,Math.min((s.fill||34)-used.size,rest.length));
    rest.slice(0,amount).forEach((cell,i)=>createPiece(pool[i%pool.length],cell,false));
    renderPieces();requestAnimationFrame(()=>{state.pieces.forEach(p=>{if(p.cell!==null){const q=pos(coords[p.cell]);p.x=q.x;p.y=q.y}});renderPieces()});return;
  }
  if(s.id==='brown'){
    const cells=activeCells(),pair=starterCluster(2),used=new Set(pair),reservoir=Math.min(s.target||4,Math.max(1,cells.length-2));
    let dPlaced=0;
    if(pair[0]!==undefined){createPiece('D',pair[0],false);dPlaced++;}
    if(pair[1]!==undefined)createPiece('H',pair[1],false);
    const rest=cells.filter(c=>!used.has(c)).sort(()=>Math.random()-.5);
    rest.forEach(cell=>{const sym=dPlaced<reservoir?'D':'H';createPiece(sym,cell,false);if(sym==='D')dPlaced++;});
    renderPieces();requestAnimationFrame(()=>{state.pieces.forEach(p=>{const t=pos(coords[p.cell]);p.x=t.x;p.y=t.y});renderPieces()});setTimeout(ensureOpportunity,420);return;
  }
  if(s.mode==='rpProcess'){
    const step=rpStep(s),cells=activeCells().slice(),used=new Set(),seedCount=1;
    const candidates=step?.outerSeed?cells.slice().sort((a,b)=>(coords[b]?.ring??0)-(coords[a]?.ring??0)):cells.slice().sort(()=>Math.random()-.5);
    for(let i=0;i<Math.min(seedCount,candidates.length);i++){
      const cell=candidates[i],q=createPiece(step.from,cell,false,{massNumber:step.inputMass??null});q.rpProgress=0;q.rpIsotope=!!step.inputMass;used.add(cell);
    }
    // Ferro é a semente-base da reconstrução: nunca conta como precursor direto
    // de Cu→Te, mas permite refazer Ni e toda a cadeia rp já aprendida.
    const baseFeed=Math.max(0,(s.target||1)-1),baseCells=cells.filter(c=>!used.has(c)).sort(()=>Math.random()-.5);
    for(let i=0;i<Math.min(baseFeed,baseCells.length);i++){const cell=baseCells[i];createPiece('Fe',cell,false);used.add(cell)}
    const rest=cells.filter(c=>!used.has(c)).sort(()=>Math.random()-.5),amount=Math.max(0,Math.min((s.fill||30)-used.size,rest.length));
    rest.slice(0,amount).forEach((cell,i)=>createPiece(i<8?'H':replenishmentSymbol(),cell,false));
    if(step.fuel==='p')ensureProtonCaptureFuel(5);
    startPrimordialDrift();renderPieces();renderPrimordialParticles();return;
  }
  if(s.mode==='protonCapture'){
    // A nova habilidade é paralela à fusão: a própria fase de apresentação já
    // oferece pares de receitas antigas para deixar essa herança visível no tabuleiro.
    const used=placeStarterGroups([['H','H'],['C','He'],['C'],['Ne'],['He3'],['D'],['Li']]);
    const cells=activeCells().filter(cell=>!used.has(cell)).sort(()=>Math.random()-.5),pool=s.pool||['C','Ne','O','Mg','H','He'];
    const amount=Math.max(0,Math.min((s.fill||24)-used.size,cells.length));
    cells.slice(0,amount).forEach((cell,i)=>createPiece(pool[i%pool.length],cell,false));
    ensureProtonCaptureFuel(4);startPrimordialDrift();renderPieces();renderPrimordialParticles();return;
  }
 if(s.mode==='spallation'){
    const cells=activeCells().slice().sort(()=>Math.random()-.5),pool=['C','N','O','C','O','N','C','O'];
    cells.slice(0,s.fill||20).forEach((cell,i)=>createPiece(pool[i%pool.length],cell,false));
    renderPieces();return;
  }
  if(s.mode==='neutrino'){
    const cells=activeCells().slice().sort(()=>Math.random()-.5),pool=['Ne','Ne','Ne','O','Ne','C'];
    cells.slice(0,s.fill||20).forEach((cell,i)=>createPiece(pool[i%pool.length],cell,false));renderPieces();return;
  }
  if(s.mode==='gamma'){
    const cells=activeCells().slice().sort(()=>Math.random()-.5),pool=['Mo','Ru','Mo','Ru'];
    cells.slice(0,s.fill||18).forEach((cell,i)=>{const q=createPiece(pool[i%pool.length],cell,false);q.massNumber=q.sym==='Mo'?100:104});renderPieces();return;
  }
  if(s.mode==='decayGarden'){
    state.decayFound=new Set();const cells=activeCells().slice().sort(()=>Math.random()-.5);
    DECAY_TRACKS.forEach((track,i)=>{const p=createPiece(track[0].sym,cells[i],false);p.decayTrack=track;p.decayIndex=0;p.massNumber=track[0].mass});
    renderPieces();return;
  }
  if(s.mode==='explosive'){
    const cells=activeCells().slice().sort(()=>Math.random()-.5),pool=['Fe','Ni','Fe','Ni','Si','S','Ca','Fe','Ni'];
    cells.slice(0,s.fill||38).forEach((cell,i)=>createPiece(pool[i%pool.length],cell,false));
    renderPieces();return;
  }
  if(s.mode==='whiteCompact'){
    // Três zonas legíveis: núcleo futuro (anéis 0–1), vão rarefeito (anel 2)
    // e matéria acrecionada H/He somente na periferia (anel 3).
    const outer=(byRing[phaseRadius(s)]||[]).slice().sort(()=>Math.random()-.5);
    const envelope=['He','H','He','H','He','H','He','H','He','H','He','H'];
    envelope.forEach((sym,i)=>{if(outer[i]!==undefined)createPiece(sym,outer[i],true)});
    renderPieces();
    requestAnimationFrame(()=>{state.pieces.forEach(p=>{if(p.cell!==null){const t=pos(coords[p.cell]);p.x=t.x;p.y=t.y}});renderPieces()});
    return;
  }
  const r=phaseRadius(),ingredients=starterIngredients(s);let starter=[],reserved;
  if(Array.isArray(s.starterGroups))reserved=placeStarterGroups(s.starterGroups);
  else{starter=starterCluster(ingredients.length);reserved=new Set(starter);starter.forEach((cell,i)=>{const p=createPiece(ingredients[i],cell,false)})}
  if(s.mode==='neutron')reserved=placeNeutronMechanicFuel(s,reserved);
  const cells=[];for(let ring=r;ring>=0;ring--)cells.push(...byRing[ring]);
  let remaining=cells.filter(cell=>!reserved.has(cell)).sort(()=>Math.random()-.5);
  // A receita atual já foi colocada uma única vez em starterIngredients.
  // Reagentes históricos de fases de fusão entram uma única vez; em fases com
  // starterGroups, esses grupos já foram colocados acima e nunca são duplicados.
  const historyIngredients=s.mode==='fusion'?fusionHistoryGroups(s).slice(1).flat():[];
  const historyCount=Math.min(historyIngredients.length,remaining.length);
  for(let i=0;i<historyCount;i++){const cell=remaining[i];createPiece(historyIngredients[i],cell,false);reserved.add(cell)}
  remaining=remaining.slice(historyCount).sort(()=>Math.random()-.5);
  const starterCount=reserved.size;const amount=Math.max(0,desiredFill()-starterCount-historyCount),chosen=remaining.slice(0,amount);
  chosen.forEach((cell,i)=>createPiece(incomingSymbol(true),cell,i<Math.min(22,chosen.length)));
  if(s.id==='he_red'){const n=2;for(let i=0;i<n;i++)createPrimordialParticle('p');startPrimordialDrift()}
  if(protonCaptureAvailable(s)){ensureProtonCaptureFuel(2);startPrimordialDrift()}
  renderPieces();renderPrimordialParticles();requestAnimationFrame(()=>{state.pieces.forEach(p=>{const t=pos(coords[p.cell]);p.x=t.x;p.y=t.y});renderPieces()});setTimeout(ensureOpportunity,420)
}
function counts(a){return a.reduce((m,x)=>(m[x]=(m[x]||0)+1,m),{})}
function same(a,b){const A=[...a].sort(),B=[...b].sort();return A.length===B.length&&A.every((v,i)=>v===B[i])}
function protonCaptureAvailable(s=phase()){
 const intro=phaseIndexById.get('proton_capture');
 if(isPrimordial(s)||isPostMode(s)||s.mode==='opening'||s.mode==='neutronize')return false;
 return s.mode==='protonCapture'||s.mode==='rpProcess'||state.protonCaptureUnlocked||(intro!==undefined&&state.phaseIndex>=intro);
}
function ensureProtonCaptureFuel(min=2){
 if(!protonCaptureAvailable())return;while(countFloatingParticle('p')<min)spawnFloatingParticle('p');renderPrimordialParticles();
}
function protonCaptureRoute(targetOrSym,s=phase()){
 const target=typeof targetOrSym==='string'?{sym:targetOrSym,massNumber:null}:targetOrSym;if(!target)return null;
 if(s.mode==='rpProcess'){
   const step=rpStepForSymbol(target.sym,s);if(!step)return null;
   const actualMass=Number(target.massNumber??step.inputMass??0)||null;
   return{out:step.to,inputMass:step.inputMass??null,minTemp:5e8,label:step.label,gamma:true,rp:true,pattern:step.pattern,chainCaptures:Math.max(1,step.chain||1),photoChance:Number(step.photoChance||0),decay:step.decay||null,targetMass:actualMass,productMass:step.productMass??(actualMass?actualMass+Math.max(1,step.chain||1):null)};
 }
 const r=PROTON_CAPTURES[target.sym];if(!r)return null;
 const actualMass=Number(target.massNumber??E[target.sym]?.mass??r.inputMass??0)||null;if(r.inputMass&&actualMass!==Number(r.inputMass))return null;if(Number(s.fusionTempMax||0)<Number(r.minTemp||0))return null;
 return{...r,targetMass:actualMass,productMass:actualMass?actualMass+1:Number(r.inputMass||0)+1};
}
function physicalCoulombRepulsions(z,s=phase()){
 if(!coulombMechanicUnlocked(s))return 0;
 const t=Number(s.fusionTempMax||0);let n=z<=6?0:z<=14?1:z<=28?2:3;if(t>=1.5e9)n--;if(t>=2.5e9)n--;return Math.max(0,Math.min(3,n));
}
function radialCoulombRepulsions(cell,fallback=0){
 if(!coulombMechanicUnlocked())return 0;
 const ring=Number(coords[cell]?.ring);if(ring===0)return 0;if(ring===1)return 1;if(ring===2)return 2;if(ring===3)return 3;return Math.max(0,Math.min(3,Number(fallback)||0));
}
function showCoulombBarrier(target){
 const z=Number(E[target.sym]?.n||1),d=document.createElement('div'),size=54+Math.min(64,z*2.25);d.className='coulomb-barrier'+(z>=10?' strong':'');d.style.left=target.x+'px';d.style.top=target.y+'px';d.style.width=size+'px';d.style.height=size+'px';dom.fx.appendChild(d);setTimeout(()=>d.remove(),760);return size/2;
}
function emitTunnelGhosts(x1,y1,x2,y2){for(let i=1;i<=3;i++){const d=document.createElement('div'),t=i/4;d.className='tunnel-ghost';d.style.left=(x1+(x2-x1)*t)+'px';d.style.top=(y1+(y2-y1)*t)+'px';dom.fx.appendChild(d);setTimeout(()=>d.remove(),500+i*35)}}
async function ionizeRpHydrogen(piece){
 const s=phase(),step=rpStep(s);if(s.mode!=='rpProcess'||step?.fuel!=='H'||state.locked||!piece||piece.sym!=='H')return false;
 state.locked=true;const {cell,x,y}=piece;if(state.board[cell]===piece.id)state.board[cell]=null;state.pieces.delete(piece.id);state.selected=[];
 spawnFloatingParticle('p',x-8,y);spawnFloatingParticle('e',x+10,y+4);state.rpIonized++;recordFlow(1);burst(x,y);tone(610,.08,'triangle',.028);captureTag(x,y,'H → p + e⁻');render();startPrimordialDrift();await wait(220);state.locked=false;ensureOpportunity();render();return true;
}
async function attemptProtonCapture(cell,protonId){
 const s=phase(),targetId=state.board[cell],target=targetId?state.pieces.get(targetId):null,p=state.primordialParticles.get(protonId);if(state.locked||state.phaseDone||!protonCaptureAvailable(s)||!target||!p||p.kind!=='p'||p.reacting)return;
 state.locked=true;state.selected=[cell];state.primordialSelected=null;
 const route=protonCaptureRoute(target,s),key=String(target.id),blocked=coulombRollBlocks(cell,s,target.sym);state.protonCaptureAttempts[key]=(state.protonCaptureAttempts[key]||0)+1;
 const ox=p.x,oy=p.y,z=Number(E[target.sym]?.n||1),dx=ox-target.x,dy=oy-target.y,len=Math.max(1,Math.hypot(dx,dy));
 if(blocked)await showCoulombTooltip(target.x,target.y);
 const barrier=blocked?showCoulombBarrier(target):Math.max(44,54+Math.min(64,z*2.25)),approach=Math.max(30,barrier*.72);p.reacting=true;p.x=target.x+dx/len*approach;p.y=target.y+dy/len*approach;renderPrimordialParticles();tone(250+Math.min(420,z*12),.08,'sine',.024);await wait(350);
 const viable=!!route&&!blocked,photoReturn=viable&&route.photoChance>0&&Math.random()<route.photoChance;
 if(viable&&!photoReturn&&route.rp&&route.pattern==='waiting')await teachProductOnce('waitingPoint',target.x,target.y);
 if(!viable||photoReturn){
   if(photoReturn){state.rpPhotoReturns++;await teachProductOnce('photodisintegration',target.x,target.y);captureTag(target.x,target.y,'(γ,p) · próton devolvido');tone(520,.09,'triangle',.026)}else{state.coulombRepulsions++;tone(150+Math.min(170,z*4),.10,'sawtooth',.026)}
   p.coulombDeflect=true;const side=(target.id%2?1:-1),px=-dy/len,py=dx/len;p.x=Math.max(24,Math.min(starSize()-24,ox+px*side*(30+Math.min(34,z))));p.y=Math.max(24,Math.min(starSize()-24,oy+py*side*(30+Math.min(34,z))));renderPrimordialParticles();vibrate(z>=10?[7,18,7]:6);await wait(360);p.reacting=false;p.coulombDeflect=false;state.primordialSelected=protonId;state.selected=[];state.locked=false;render();return;
 }
 await objectiveInteractionImpact(`proton:${s.id}:${target.sym}>${route.out}`,[objectiveInteractionPieceToken(target),objectiveInteractionPrimordialToken(p)],route.out,{x:target.x,y:target.y},'p','CAPTURA');state.primordialParticles.delete(protonId);renderPrimordialParticles();
 if(route.rp&&route.chainCaptures>1){
   target.rpProgress=(target.rpProgress||0)+1;
   if(target.rpProgress<route.chainCaptures){target.massNumber=target.massNumber?target.massNumber+1:null;captureTag(target.x,target.y,`p ${target.rpProgress}/${route.chainCaptures}`);await emitGamma(target.x,target.y);recordFlow(1);await afterNuclearAction({advanceRound:true,protectedPieceIds:[target.id]});ensureProtonCaptureFuel(rpStep(s)?.fuel==='p'?4:1);state.selected=[];state.locked=false;render();return}
 }
 target.sym=route.out;target.massNumber=route.productMass||null;target.rpIsotope=!!(route.rp&&route.productMass);target.captures=0;target.rpProgress=0;target.newborn=true;clearPieceInstability(target);if(route.decay)armPieceInstability(target,route.decay,state.nuclearRound+1);else if(E[target.sym]?.unstable)armIntrinsicInstability(target,state.nuclearRound+1);
 const productKey=`${target.massNumber||''}${target.sym}${pieceIsUnstable(target)?'*':''}`;state.protonCaptureProducts[productKey]=(state.protonCaptureProducts[productKey]||0)+1;burst(target.x,target.y);renderPieces();if(pieceIsUnstable(target)){captureTag(target.x,target.y,route.decay?.mode==='returnProton'?'estado não ligado':route.decay?.mode==='rpCycle'?'ciclo terminal':'núcleo proton-rich');tone(620,.10,'triangle',.032)}else captureTag(target.x,target.y,'p,γ');
 if(route.gamma!==false)await emitGamma(target.x,target.y);if(route.countsCapture!==false){state.protonCaptures++;state.discovered.add(route.out);if(s.mode==='protonCapture')recordFlow(1);if(s.mode==='rpProcess'){state.created[route.out]=(state.created[route.out]||0)+1;recordFlow(route.pattern==='waiting'?3:2)}}
 setTimeout(()=>{const q=state.pieces.get(target.id);if(q){q.newborn=false;renderPieces()}},360);await afterNuclearAction({advanceRound:true,protectedPieceIds:[target.id]});state.protonCaptureAttempts[key]=0;ensureProtonCaptureFuel(s.mode==='protonCapture'?3:(rpStep(s)?.fuel==='p'?4:1));state.selected=[];state.locked=false;render();checkComplete();const chainCtx=state.chainAutoContext,chainRoot=chainCtx?.rootId||startChainEvent('proton',target.x,target.y),chainDepth=chainCtx?.depth||1;if(!pieceIsUnstable(target))scheduleAutoProtonCascade(target.id,chainRoot,chainDepth);
}
function learnedFusionRecipes(){
  // Conhecimento cumulativo real: a campanha guarda as fases efetivamente alcançadas,
  // então ramos paralelos deixam de conceder receitas que o jogador ainda não viveu.
  const map=new Map(),campaign=window.ARDUA_CAMPAIGN,graphState=campaign?.getState?.(),done=new Set(graphState?.completed||[]),currentId=graphState?.activeId||phase()?.id,campaignAware=!!campaign&&!campaign.editor&&Array.isArray(graphState?.completed);
  const reached=(p,i)=>campaignAware?(done.has(p.id)||p.id===currentId):i<=state.phaseIndex;
  for(let i=0;i<PHASES.length;i++){
    const p=PHASES[i];if(!reached(p,i)||p.mode!=='fusion')continue;
    phaseFusionRecipes(p).forEach(r=>{const key=[...r.ing].sort().join('+')+'>'+r.out;map.set(key,r)})
  }
  const current=phase();if(current?.mode==='fusion')phaseFusionRecipes(current).forEach(r=>{const key=[...r.ing].sort().join('+')+'>'+r.out;map.set(key,r)});
  return[...map.values()]
}
const STELLAR_SANDBOX_VISUALS=new Set(['redGiant','massive','supergiant','advanced','ironCore','agb','whiteDwarf']);
const WHITE_DWARF_COMPATIBLE_OUTPUTS=new Set(['D','He3','He','Be8','C','N','O']);
function fusionSandboxAllowed(s=phase()){
  // Depois que uma fusão foi aprendida, ela continua acessível nas fases que usam a
  // grade nuclear. Modos primordiais e remanescentes compactos mantêm seus gestos próprios.
  if(!s||isPrimordial(s)||s.mode==='opening')return false;
  if(['remnant','pulsar','accretion','blackhole','neutronize'].includes(s.mode))return false;
  return true;
}
function recipeEnvironmentAllows(r,s=phase()){
  if(!r||!fusionSandboxAllowed(s))return false;
  // Estas três rotas são abstrações didáticas exclusivas de suas estrelas de origem.
  if(r===BROWN_FUSION)return s.id==='brown';
  if(r===RED_UNSTABLE_FUSION)return s.id==='he_red';
  if(r===RED_STABLE_FUSION)return s.id==='he_red';
  // Receitas de fusão já aprendidas permanecem jogáveis; temperatura segue como contexto científico.
  return true;
}
function fusionRecipeLearned(r){return !!r&&learnedFusionRecipes().some(x=>x===r||(x.out===r.out&&same(x.ing,r.ing)))}
function fusionRecipeCompatible(r,s=phase()){return fusionRecipeLearned(r)&&recipeEnvironmentAllows(r,s)}
function primordialFusionRecipe(r){return{...r,ing:[...(r.pieces||[])],primordialCarry:true}}
function activeFusionRecipes(){
  const s=phase(),map=new Map();
  for(const r of learnedFusionRecipes()){
    if(!recipeEnvironmentAllows(r,s))continue;
    map.set(recipeKey(r),r);
  }
  if(fusionSandboxAllowed(s))for(const pr of learnedPrimordialNuclearReactions()){
    if(pr.particles.length||pr.pieces.length<2)continue;
    const r=primordialFusionRecipe(pr);map.set(recipeKey(r),r);
  }
  return[...map.values()]
}
function exactRecipe(syms){return activeFusionRecipes().find(r=>same(r.ing,syms))||null}
function possibleRecipes(syms){const c=counts(syms);return activeFusionRecipes().filter(r=>{const rc=counts(r.ing);return Object.entries(c).every(([k,v])=>(rc[k]||0)>=v)})}
function selectedSyms(){return state.selected.map(i=>{const id=state.board[i];return id?state.pieces.get(id)?.sym:null}).filter(Boolean)}
function boardSymbolCounts(){const out={};state.pieces.forEach(p=>out[p.sym]=(out[p.sym]||0)+1);return out}
function hasRecipeIngredients(r,available=boardSymbolCounts()){const need=counts(r.ing);return Object.entries(need).every(([sym,n])=>(available[sym]||0)>=n)}
function recipeIsActive(r){return activeFusionRecipes().some(x=>x.out===r.out&&same(x.ing,r.ing))}
function connectedRecipeCluster(r,fixedCells=[]){
  const active=activeSet(),need=counts(r.ing),fixed=[...fixedCells];
  for(const cell of fixed){const id=state.board[cell],sym=id?state.pieces.get(id)?.sym:null;if(!sym||!(need[sym]>0))return null;need[sym]--}
  if(fixed.length>1){const seen=new Set([fixed[0]]),q=[fixed[0]],fixedSet=new Set(fixed);while(q.length){const c=q.shift();for(const n of neigh[c])if(fixedSet.has(n)&&!seen.has(n)){seen.add(n);q.push(n)}}if(seen.size!==fixed.length)return null}
  const remaining=()=>Object.values(need).reduce((a,b)=>a+b,0);
  if(!remaining())return fixed;
  const occupied=activeCells().filter(c=>state.board[c]);
  function dfs(chosen){
    if(!remaining())return chosen;
    let candidates;
    if(chosen.length){const set=new Set();for(const c of chosen)for(const n of neigh[c])if(active.has(n)&&state.board[n]&&!chosen.includes(n))set.add(n);candidates=[...set]}
    else candidates=occupied;
    for(const cell of candidates){const id=state.board[cell],sym=id?state.pieces.get(id)?.sym:null;if(!sym||!(need[sym]>0))continue;need[sym]--;const hit=dfs([...chosen,cell]);if(hit)return hit;need[sym]++}
    return null;
  }
  return dfs(fixed);
}
function hasAdjacentRecipe(r){return !!connectedRecipeCluster(r)}
// Cada fase aponta para a próxima reação realmente executável que leva ao objetivo.
// A busca atravessa recursivamente fusões e capturas de nêutrons já aprendidas,
// evitando ciclos e respeitando o ambiente atual.
function neutronTransitionKey(tr){return tr?`n:${tr.from}>${tr.to}@${tr.processClass||neutronProcessClass()||'current'}`:''}
function neutronTransitionActionable(tr,s=phase()){
 if(!tr||s.mode!=='neutron')return false;
 return speciesCount(tr.from)>0;
}
function guidanceActionLine(action){
 if(!action)return'';
 if(action.kind==='fusion')return topFusionLabel(action.recipe);
 if(action.kind==='cameronFowler'){const be7=[...state.pieces.values()].find(p=>p.sym==='Be7');if(be7?.cell!==null&&be7?.cell!==undefined&&be7InCoolLayer(be7))return 'Berílio-7 + elétron → Lítio-7 + Neutrino';return 'Mova Berílio-7 para uma camada externa';}
 if(action.kind==='neutron')return `${action.transition.from} + n → ${action.transition.to}`;
 return action.label||'';
}
function learnedProducerActionsFor(sym,s=phase()){
 const actions=[];
 const liIntro=phaseIndexById.get('stellar_li');
 if(sym==='Li'&&liIntro!==undefined&&state.phaseIndex>=liIntro)actions.push({kind:'cameronFowler',out:'Li',needs:['Be7'],key:'cf:Be7>Li'});
 // Capturas n pertencentes ao ambiente atual ganham prioridade para preservar
 // a cadeia pedagógica da fase (Zn←Cu←Ni, por exemplo).
 if(s.mode==='neutron'){
   const current=phaseNeutronTransitions(s).filter(tr=>tr.to===sym).map(tr=>({...tr,processClass:neutronProcessClass(s)}));
   const learned=learnedNeutronTransitions(s).filter(tr=>tr.to===sym),foundation=neutronFoundationTransition(s);
   const foundations=foundation&&foundation.to===sym?[foundation]:[];
   const seen=new Set();
   for(const tr of [...current,...learned,...foundations].reverse()){
     const k=neutronTransitionKey(tr);if(seen.has(k))continue;seen.add(k);
     actions.push({kind:'neutron',transition:tr,out:tr.to,needs:[tr.from],key:k});
   }
 }
 for(const r of activeFusionRecipes().filter(r=>r.out===sym).reverse())
   actions.push({kind:'fusion',recipe:r,out:r.out,needs:[...r.ing],key:`f:${recipeKey(r)}`});
 return actions;
}
function guidanceActionIsExecutable(action,s=phase()){
 if(!action)return false;
 if(action.kind==='fusion')return hasRecipeIngredients(action.recipe);
 if(action.kind==='cameronFowler')return speciesCount('Be7')>0;
 if(action.kind==='neutron')return neutronTransitionActionable(action.transition,s);
 return false;
}
function nextExecutableActionTowardSymbol(sym,s=phase(),seen=new Set()){
 const marker=`sym:${sym}`;if(seen.has(marker))return null;seen.add(marker);
 const producers=learnedProducerActionsFor(sym,s);
 // Sempre prefira a transformação que produz diretamente o ingrediente quando ela já pode ser feita.
 for(const action of producers)if(guidanceActionIsExecutable(action,s))return action;
 // Caso contrário, desça pelos reagentes ausentes até encontrar a primeira reação executável.
 for(const action of producers){
   const actionSeen=new Set(seen);actionSeen.add(action.key);
   const needs=counts(action.needs||[]),available=boardSymbolCounts();
   const ordered=Object.keys(needs).sort((a,b)=>{
     const ma=Math.max(0,(needs[a]||0)-(available[a]||0)),mb=Math.max(0,(needs[b]||0)-(available[b]||0));
     if(!!ma!==!!mb)return ma?-1:1;
     return (E[a]?.n??999)-(E[b]?.n??999)||a.localeCompare(b);
   });
   for(const need of ordered){
     if((available[need]||0)>=(needs[need]||0)&&action.kind!=='fusion')continue;
     const sub=nextExecutableActionTowardSymbol(need,s,new Set(actionSeen));
     if(sub)return sub;
   }
 }
 return null;
}
function nextExecutableActionTowardTransition(tr,s=phase()){
 if(!tr)return null;
 const direct={kind:'neutron',transition:tr,out:tr.to,needs:[tr.from],key:neutronTransitionKey(tr)};
 if(guidanceActionIsExecutable(direct,s))return direct;
 return nextExecutableActionTowardSymbol(tr.from,s,new Set([direct.key]))||direct;
}
function nextExecutableFusionToward(r,s=phase()){
 if(!r)return null;
 if(hasRecipeIngredients(r))return{kind:'fusion',recipe:r,out:r.out,needs:[...r.ing],key:`f:${recipeKey(r)}`};
 for(const need of orderedSpatialNeeds(r,s)){
   if(need.historical&&need.present>0&&!need.missing)continue;
   const sub=nextExecutableActionTowardSymbol(need.sym,s,new Set([`f:${recipeKey(r)}`]));
   if(sub)return sub;
 }
 return{kind:'fusion',recipe:r,out:r.out,needs:[...r.ing],key:`f:${recipeKey(r)}`};
}
function contextualRecipeFor(goal,visited=new Set()){
  if(visited.has(goal))return null;visited.add(goal);
  const r=FUSIONS[goal];if(!r||!recipeIsActive(r))return null;
  if(hasAdjacentRecipe(r))return r;
  for(const sym of [...new Set(r.ing)]){const precursor=contextualRecipeFor(sym,new Set(visited));if(precursor)return precursor}
  return null;
}
const POST_ATOM_MODES=new Set(['remnant','pulsar','accretion','blackhole']);
function isPostAtomMode(s=phase()){return POST_ATOM_MODES.has(s.mode)}
function isPostMode(s=phase()){return isPostAtomMode(s)||s.mode==='collapseFinal'}
const COULOMB_EXEMPT_SYMS=new Set(['H','D','T']);
const COULOMB_BLOCK_CHANCE_BY_RING=Object.freeze({0:0,1:0,2:.10,3:.20,4:.40,5:.50});
function coulombMechanicUnlocked(s=phase()){
 const intro=phaseIndexById.get('coulomb_intro');return intro!==undefined&&state.phaseIndex>=intro;
}
function coulombBlockChance(cell,s=phase(),sym=null){
 if(!coulombMechanicUnlocked(s)||cell===null||cell===undefined)return 0;
 if(sym&&COULOMB_EXEMPT_SYMS.has(sym))return 0;
 const ring=Math.max(0,Math.min(5,Number(coords[cell]?.ring)||0));
 if(s.id==='coulomb_intro')return ring<=2?0:1;
 return Number(COULOMB_BLOCK_CHANCE_BY_RING[ring]||0);
}
function coulombCellBlocked(cell,s=phase(),sym=null){
 return coulombBlockChance(cell,s,sym)>0;
}
function coulombRollBlocks(cell,s=phase(),sym=null){
 const chance=coulombBlockChance(cell,s,sym);return chance>0&&Math.random()<chance;
}
function atomicMovementAllowed(s=phase()){
 if(!coulombMechanicUnlocked(s))return false;
 if(isPrimordial(s)||s.mode==='neutronize'||isPostMode(s))return false;
 if(s.mode==='explosive')return false;
 return true;
}
function movableEmptyNeighbors(cell,s=phase()){
 if(!atomicMovementAllowed(s)||cell===null||cell===undefined)return[];
 const active=activeSet();return (neigh[cell]||[]).filter(n=>active.has(n)&&state.board[n]===null);
}
function canSelectAtomForMovement(p,s=phase()){return !!p&&!p.free&&p.cell!==null&&p.cell!==undefined&&movableEmptyNeighbors(p.cell,s).length>0}
function movementTargetCells(s=phase()){
 if(state.locked||state.phaseDone||state.selected.length!==1||!atomicMovementAllowed(s))return[];
 const source=state.selected[0],id=state.board[source],p=id?state.pieces.get(id):null;if(!p)return[];
 return movableEmptyNeighbors(source,s);
}
function updateMoveTargets(){const targets=new Set(movementTargetCells());dom.cells.querySelectorAll('.cell').forEach(el=>el.classList.toggle('move-target',targets.has(+el.dataset.cell)))}
function selectAtomForMovement(p){if(!canSelectAtomForMovement(p))return false;state.selected=[p.cell];state.primordialSelected=null;tone(300,.035,'sine',.018);render();return true}
async function moveSelectedAtom(targetCell){
 if(state.locked||state.phaseDone)return false;const targets=movementTargetCells();if(!targets.includes(targetCell))return false;
 const source=state.selected[0],id=state.board[source],p=id?state.pieces.get(id):null;if(!p)return false;
 state.locked=true;state.board[source]=null;state.board[targetCell]=id;p.cell=targetCell;const q=pos(coords[targetCell]);p.x=q.x;p.y=q.y;state.selected=[];state.contextRecipeKey=null;tone(275,.055,'sine',.022);vibrate(5);dom.star.classList.add('pulse');render();
 await wait(210);
 // Um deslocamento representa passagem de tempo: intermediários instáveis envelhecem
 // uma rodada e, em ambientes estratificados, toda a estrela responde com um único
 // pulso de reorganização. Não repomos matéria aqui: mover não equivale a acreção.
 if(phase().id==='coulomb_intro')await advanceNuclearRound();
 else await afterNuclearAction({advanceRound:true,replenish:false,protectedPieceIds:[id]});
 dom.star.classList.remove('pulse');ensureOpportunity();state.locked=false;render();checkComplete();return true;
}

function convectionMechanicUnlocked(s=phase()){
 const intro=phaseIndexById.get('stellar_convection');
 if(intro===undefined||state.phaseIndex<intro||isPrimordial(s)||s.mode==='opening')return false;
 if(['spallation','neutrino','gamma','guidedDecay','decayGarden','explosive','neutronize','collapseFinal'].includes(s.mode)||isPostMode(s))return false;
 return true;
}
function convectionChargePhaseAllows(s=phase(),fx={}){
 if(fx?.kind==='convection')return false;
 if(s.mode==='convection')return fx?.kind==='nuclear';
 return ['fusion','reactionExplore','protonCapture','rpProcess','neutron','whiteCompact'].includes(s.mode);
}
function grantConvectionFromCells(cells,s=phase()){
 if(!convectionMechanicUnlocked(s)||Number(state.convectionCharge||0)>=1||state.chainAutoContext)return false;
 const valid=[...(cells||[])].filter(c=>Number.isInteger(c)&&c>=0&&c<coords.length);
 if(!valid.some(c=>(coords[c]?.ring??99)<=1))return false;
 state.convectionCharge=1;state.convectionArmed=false;state.convectionConfirmPending=false;state.convectionPathCells=[];
 dom.star?.classList.add('convection-charged-flash');setTimeout(()=>dom.star?.classList.remove('convection-charged-flash'),620);
 tone(520,.08,'triangle',.028);vibrate(6);renderConvectionControl();return true;
}
function nearestCellToPoint(x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;let best=null,dist=Infinity;
 for(const cell of activeCells()){const p=pos(coords[cell]),d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;best=cell}}
 return best;
}
function maybeChargeConvectionFromAction(s=phase(),fx={}){
 if(!convectionChargePhaseAllows(s,fx))return false;
 const selected=(state.selected||[]).filter(c=>Number.isInteger(c));if(selected.length)return grantConvectionFromCells(selected,s);
 const cell=nearestCellToPoint(fx?.x,fx?.y);return cell===null?false:grantConvectionFromCells([cell],s);
}
function convectionConfirmationIsUiControl(target){
 const el=target instanceof Element?target:null;
 if(!el)return false;
 return !!el.closest('a,input,select,textarea,[role="dialog"],.modal,.stellar-intro,.event-tooltip,.ambient-banner,#menuOpenBtn,#closeMenu,#phaseEndBtn,#stellarStartBtn,#eventTooltipBtn,#ambientContinueBtn,#convectionBtn');
}
function ensureConvectionConfirmationListener(){
 if(state.convectionConfirmListenerInstalled)return;state.convectionConfirmListenerInstalled=true;
 document.addEventListener('pointerdown',ev=>{
   if(!state.convectionConfirmPending||state.locked||state.phaseDone)return;
   if(convectionConfirmationIsUiControl(ev.target))return;
   ev.preventDefault();ev.stopPropagation();const path=[...(state.convectionPathCells||[])];state.convectionConfirmPending=false;performConvection(path);
 },true);
}
function ensureConvectionControl(){
 let b=document.getElementById('convectionBtn');if(b){ensureConvectionConfirmationListener();return b}
 b=document.createElement('button');b.type='button';b.id='convectionBtn';b.className='convection-core-trigger';b.setAttribute('aria-label','Ativar convecção estelar');
 b.innerHTML='<span class="convection-glyph" aria-hidden="true">↕</span><span class="convection-gamma-orbit" aria-hidden="true">γ</span>';
 b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();toggleConvectionArmed()});dom.star.appendChild(b);ensureConvectionConfirmationListener();return b;
}
function renderConvectionControl(){
 const b=ensureConvectionControl(),available=convectionMechanicUnlocked(),charged=Number(state.convectionCharge||0)>0,armed=!!state.convectionArmed,pending=!!state.convectionConfirmPending,show=available&&charged&&!state.phaseDone;
 const centerCell=(byRing[0]||[])[0],centerId=centerCell===undefined?null:state.board[centerCell],centerPiece=centerId?state.pieces.get(centerId):null,anchor=centerPiece&&!centerPiece.free?{x:centerPiece.x,y:centerPiece.y}:(centerCell===undefined?null:pos(coords[centerCell]));
 if(anchor){b.style.left=anchor.x+'px';b.style.top=anchor.y+'px'}
 b.classList.toggle('show',show);b.classList.toggle('charged',show);b.classList.toggle('armed',armed);b.classList.toggle('pending',pending);b.disabled=!show||state.locked||pending;b.setAttribute('aria-pressed',armed?'true':'false');
 dom.star.classList.toggle('convection-core-charged',show);dom.star.classList.toggle('convection-confirm-pending',pending);
}
function toggleConvectionArmed(){
 if(!convectionMechanicUnlocked()||state.locked||state.phaseDone)return;
 if(Number(state.convectionCharge||0)<1){toast('Uma ação nuclear no centro ou na camada 1 carrega a convecção.');return}
 state.convectionArmed=!state.convectionArmed;state.convectionConfirmPending=false;state.convectionPathCells=[];state.selected=[];state.primordialSelected=null;objectiveMotifCancelSelection();
 if(state.convectionArmed){[330,415,520].forEach((f,i)=>setTimeout(()=>tone(f,.08,'sine',.019+i*.003),i*70));vibrate(5)}else tone(260,.05,'sine',.02);render();
}
function convectionAxialPoint(c){return{x:Math.sqrt(3)*(c.q+c.r/2),y:1.5*c.r}}
function convectionRadialPathTo(cell){
 if(!Number.isInteger(cell)||!coords[cell]||coords[cell].ring<1)return[];const target=convectionAxialPoint(coords[cell]),path=[cell];let current=cell,guard=0;
 while((coords[current]?.ring||0)>0&&guard++<MAX_RADIUS+2){
   const ring=coords[current].ring,inward=(neigh[current]||[]).filter(n=>(coords[n]?.ring??99)===ring-1);if(!inward.length)return[];
   inward.sort((a,b)=>{const A=convectionAxialPoint(coords[a]),B=convectionAxialPoint(coords[b]),crossA=Math.abs(A.x*target.y-A.y*target.x),crossB=Math.abs(B.x*target.y-B.y*target.x);return crossA-crossB||(A.x-target.x)**2+(A.y-target.y)**2-((B.x-target.x)**2+(B.y-target.y)**2)});
   current=inward[0];path.push(current);
 }
 return path.reverse();
}
function convectionPath(source,dest){
 if(!Number.isInteger(source)||!Number.isInteger(dest)||source===dest)return[];const sr=coords[source]?.ring??99,dr=coords[dest]?.ring??-1;if(sr>1||dr<=sr)return[];
 const full=convectionRadialPathTo(dest),at=full.indexOf(source);return at<0?[]:full.slice(at);
}
function convectionDestinationCells(){
 if(!state.convectionArmed||state.selected.length!==1)return[];const source=state.selected[0],sr=coords[source]?.ring??99;
 return activeCells().filter(cell=>state.board[cell]&&cell!==source&&(coords[cell]?.ring??-1)>sr&&convectionPath(source,cell).length>1);
}
function emitConvectionEnergyPulse(path,index,total){
 if(!dom.fx||!path.length)return;const from=path[Math.min(path.length-1,Math.floor(index*path.length/Math.max(1,total)))],to=path[path.length-1],a=pos(coords[from]),b=pos(coords[to]),d=document.createElement('div');
 d.className='convection-energy light';d.textContent='✦';d.style.left=a.x+'px';d.style.top=a.y+'px';dom.fx.appendChild(d);
 requestAnimationFrame(()=>{d.style.left=b.x+'px';d.style.top=b.y+'px';d.style.opacity='0';d.style.transform='translate(-50%,-50%) scale(.58)'});setTimeout(()=>d.remove(),760);
}
function releaseConvectionGamma(path){
 if(!dom.fx||!path.length)return;const c=starSize()/2,to=pos(coords[path[path.length-1]]),d=document.createElement('div');d.className='convection-gamma-release';d.textContent='γ';d.style.left=c+'px';d.style.top=c+'px';dom.fx.appendChild(d);
 requestAnimationFrame(()=>{d.style.left=to.x+'px';d.style.top=to.y+'px';d.style.opacity='0';d.style.transform='translate(-50%,-50%) scale(.7)'});setTimeout(()=>d.remove(),900);
}
async function performConvection(path){
 if(state.locked||Number(state.convectionCharge||0)<1)return false;const occupied=path.filter(cell=>state.board[cell]);if(occupied.length<2)return false;
 const firstConvection=!state.productLessons.has('convection');releaseConvectionGamma(path);state.locked=true;state.convectionCharge=0;state.convectionArmed=false;state.convectionConfirmPending=false;state.convectionPathCells=[];state.selected=[];objectiveMotifCancelSelection();renderConvectionControl();
 const ids=occupied.map(cell=>state.board[cell]),reversed=[...ids].reverse(),moves=[];occupied.forEach(cell=>state.board[cell]=null);
 occupied.forEach((cell,i)=>{const id=reversed[i],p=id?state.pieces.get(id):null;if(!p)return;const from=p.cell;state.board[cell]=id;p.cell=cell;p.convecting=true;if(from!==cell)moves.push({id,from,to:cell})});
 dom.star.classList.add('convection-active');renderPieces();[330,415,520,660].forEach((f,i)=>setTimeout(()=>tone(f,.11,'sine',.018+i*.004),i*85));vibrate([8,16,8]);
 requestAnimationFrame(()=>{for(const m of moves){const p=state.pieces.get(m.id);if(p){const q=pos(coords[m.to]);p.x=q.x;p.y=q.y}}renderPieces()});
 moves.forEach((m,i)=>setTimeout(()=>emitConvectionEnergyPulse(path,i,moves.length),110+i*55));await wait(720);
 for(const m of moves){const p=state.pieces.get(m.id);if(p)p.convecting=false}dom.star.classList.remove('convection-active');state.convectionMoves=(state.convectionMoves||0)+1;
 if(phase().mode==='convection')recordFlow(1,{kind:'convection',x:starSize()/2,y:starSize()/2,label:'energia transportada'});
 captureTag(starSize()/2,starSize()*.18,`ENERGIA TRANSPORTADA · ${moves.length}`);
 if(firstConvection){registerRewardDiscovery('phenomenon:stellarConvection',{title:'CONVECÇÃO ESTELAR',text:'Correntes de plasma transportam matéria e energia entre regiões da estrela.',silent:true});await teachProductOnce('convection',starSize()/2,starSize()/2)}
 ensureOpportunity();state.locked=false;render();checkComplete();return true;
}
function handleConvectionTap(p){
 if(!state.convectionArmed||state.convectionConfirmPending)return false;if(!p||p.free||p.cell===null||p.cell===undefined)return true;const cell=p.cell,ring=coords[cell]?.ring??99;
 if(ring<1){toast('Escolha um átomo em uma camada externa.');return true}
 const source=(byRing[0]||[])[0],path=convectionPath(source,cell);if(source===undefined||path.length<2){toast('Escolha um átomo conectado radialmente ao núcleo.');return true}
 state.convectionPathCells=path;state.convectionConfirmPending=true;state.convectionArmed=false;state.selected=[];tone(210,.08,'triangle',.026);setTimeout(()=>tone(165,.11,'sine',.024),70);vibrate([5,12,5]);render();toast('Coluna convectiva marcada · toque novamente para iniciar.');return true;
}

function fusionCandidateCells(){const set=new Set();state.selected.forEach(i=>neigh[i].forEach(n=>set.add(n)));state.selected.forEach(i=>set.delete(i));const cur=selectedSyms();return[...set].filter(i=>{const id=state.board[i];if(!id)return false;return possibleRecipes([...cur,state.pieces.get(id).sym]).length>0})}
function candidateCells(){const s=phase();if(state.convectionArmed&&state.selected.length===1)return convectionDestinationCells();if(s.mode==='neutronize'||isPostMode()||!state.selected.length)return[];if(s.id==='he_red'){const firstId=state.board[state.selected[0]],first=firstId?state.pieces.get(firstId):null;if(!first)return[];if(first.sym==='H')return[];if(first.sym!=='HeU')return[];return activeCells().filter(i=>{const id=state.board[i];return id&&state.pieces.get(id)?.sym==='HeU'})}if(s.mode==='reactionExplore')return[...new Set([...atlasCandidateCells(s),...fusionCandidateCells()])];return fusionCandidateCells()}
function superNum(n){const map={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};return String(n).split('').map(x=>map[x]||x).join('')}
function pieceDisplaySymbol(p){if(p?.atlasLabel)return p.atlasLabel;const e=E[p.sym],base=e?.symbol||p.sym;if(p?.neutronBetaPending)return `${base}*`;if(p?.neutronShellOpen)return `${base}◌`;if(p.matterState==='atom'){const q=pieceCharge(p);return q>0?`${p.sym}${q===1?'⁺':superNum(q)+'⁺'}`:p.sym}if(['D','T','He3','Be7'].includes(p.sym))return base;if(p.massNumber&&(p.rpIsotope||['H','He','Li'].includes(p.sym)))return `${superNum(p.massNumber)}${p.sym}`;return base}
function pieceSymbolScale(p,shownSym){
 const len=[...String(shownSym||'').replace(/\s+/g,'')].length;
 if(p?.sym==='Plus')return .34;
 if(len<=1)return .62;
 if(len===2)return .54;
 if(len===3)return .46;
 if(len===4)return .40;
 return .35;
}
function renderPieces(){
 const primordial=isPrimordial(),candidates=new Set(primordial?[]:candidateCells()),existing=new Map([...dom.pieces.querySelectorAll('.atom')].map(el=>[+el.dataset.id,el]));
 state.pieces.forEach((p,id)=>{
  let el=existing.get(id);
  if(!el){
   el=document.createElement('button');el.type='button';el.className='atom';el.dataset.id=id;el.draggable=false;
   el.addEventListener('contextmenu',ev=>ev.preventDefault());el.addEventListener('selectstart',ev=>ev.preventDefault());el.addEventListener('dragstart',ev=>ev.preventDefault());
   el.addEventListener('click',ev=>{ev.stopPropagation();if(state.suppressTapId===id&&performance.now()<state.suppressTapUntil)return;tapAtom(id)});
   // Toque curto continua sendo click normal; o hold só observa a duração.
   // As rotinas de hold concluído já usam suppressTapId para absorver o click posterior.
   el.addEventListener('pointerdown',ev=>{if(['neutronize','neutron','guidedDecay','decayGarden'].includes(phase().mode)||(isPostAtomMode()&&phase().mode!=='blackhole')){ev.stopPropagation();beginCrushHold(id,el,ev)}});
   el.addEventListener('pointerup',()=>cancelCrushHold(id));el.addEventListener('pointercancel',()=>cancelCrushHold(id));el.addEventListener('pointerleave',ev=>{if(ev.pointerType==='mouse')cancelCrushHold(id)});
   if(!window.PointerEvent){let touchHeld=false;el.addEventListener('touchstart',ev=>{if(['neutronize','neutron','guidedDecay','decayGarden'].includes(phase().mode)||(isPostAtomMode()&&phase().mode!=='blackhole')){touchHeld=true;beginCrushHold(id,el,ev)}},{passive:true});el.addEventListener('touchend',()=>{const wasHolding=state.crushId===id;cancelCrushHold(id);if(touchHeld&&wasHolding&&!(state.suppressTapId===id&&performance.now()<state.suppressTapUntil))setTimeout(()=>tapAtom(id),0);touchHeld=false},{passive:true});el.addEventListener('touchcancel',()=>{touchHeld=false;cancelCrushHold(id)},{passive:true})}
   dom.pieces.appendChild(el)
  }
  const e=E[p.sym],s=phase(),cap=(s.mode==='neutron'&&neutronEligible(p,s)&&p.captures>0)?`<span class="cap">n ${p.captures}/${s.captures}</span>`:'';
  el.style.background=elementStyle(p.sym);const shownSym=pieceDisplaySymbol(p);el.style.setProperty('--symScale',pieceSymbolScale(p,shownSym));el.innerHTML=`<span class="sym">${shownSym}</span>${cap}`;
  const selectedPrimordialParticle=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null,selectedFree=state.freeSelected.length?state.pieces.get(state.freeSelected[0]):null,primordialParticleTarget=primordial&&p.free&&selectedPrimordialParticle&&(!!primordialMixedReaction(p.sym,selectedPrimordialParticle.kind)||(selectedPrimordialParticle.kind==='e'&&pieceCanBindElectron(p))),primordialPieceTarget=primordial&&p.free&&selectedFree&&selectedFree.id!==p.id&&primordialPossiblePieceRecipes([selectedFree.sym,p.sym]).length>0,selected=primordial?state.freeSelected.includes(id):state.selected.includes(p.cell),neutronPartner=s.mode==='neutron'&&state.selectedNeutron!==null&&(neutronEligible(p,s)||universalNeutronCaptureEligible(p)),particleTarget=['spallation','neutrino','gamma'].includes(s.mode)&&state.selectedCosmic!==null&&particleTargets(s).includes(p.sym),stellarProtonTarget=!primordial&&selectedPrimordialParticle?.kind==='p'&&((stellarProtonRecipe(s)&&p.sym==='H')||(protonCaptureAvailable(s)&&!!protonCaptureRoute(p,s))),blackHoleTarget=s.mode==='blackhole'&&state.blackHoleSelected&&!selected,decayReady=(s.mode==='decayGarden'&&p.decayTrack&&p.decayIndex<p.decayTrack.length-1)||(s.mode==='guidedDecay'&&!!guidedTransitionFor(p,s))||(s.id==='co'&&p.sym==='FeU'&&p.radioactiveReady);
  const partner=(!primordial&&candidates.has(p.cell))||primordialParticleTarget||primordialPieceTarget||neutronPartner||particleTarget||stellarProtonTarget||blackHoleTarget;
  const matterClass=p.matterState==='atom'?' atomic-piece':' nucleus-piece';
  el.className='atom'+matterClass+(p.sym==='Plus'?' proton-piece':'')+(selected?' selected':'')+(partner&&!selected?' candidate':'')+(decayReady?' decay-ready':'')+(pieceIsUnstable(p)?' unstable':'')+(p.longRadioactive?' long-radioactive':'')+(p.radioactiveReady?' radioactive-proof':'')+(p.compacted?' compacted':'')+(p.atlasCompound?' atlas-compound':'')+(p.atlasRebound?' atlas-rebound':'')+(p.newborn?' newborn':'')+(p.convecting?' convecting':'')+(state.convectionArmed&&!state.convectionConfirmPending&&!p.free?' convection-choice':'')+((state.convectionPathCells||[]).includes(p.cell)?' convection-path':'');el.style.left=p.x+'px';el.style.top=p.y+'px';if(primordial&&p.free){el.style.setProperty('--floatDelay',`${-((id%19)*.17)}s`)}else el.style.removeProperty('--floatDelay');existing.delete(id)
 });existing.forEach(el=>el.remove())
}
async function decayFloatingNeutron(n){
 if(!n||!state.primordialParticles.has(n.id))return;const {x,y}=n;state.primordialParticles.delete(n.id);spawnFloatingParticle('p',x-10,y);spawnFloatingParticle('e',x+10,y);burst(x,y);tone(360,.09,'triangle',.025);await emitAntineutrino(x,y);render()
}
async function fuseHydrogenWithProton(hCell,protonId,r){
 if(state.locked)return;const hId=state.board[hCell],h=state.pieces.get(hId),p=state.primordialParticles.get(protonId);if(!h||h.sym!=='H'||!p||p.kind!=='p')return;
 state.locked=true;state.fusionInProgress=true;state.selected=[hCell];state.primordialSelected=null;const t=pos(coords[hCell]);
 if(coulombRollBlocks(hCell,phase(),h.sym)){await showCoulombTooltip(t.x,t.y);showCoulombBarrier(h);state.coulombRepulsions++;p.coulombDeflect=true;renderPrimordialParticles();tone(165,.10,'sawtooth',.026);vibrate(6);await wait(300);p.coulombDeflect=false;state.primordialSelected=protonId;state.selected=[hCell];state.locked=false;state.fusionInProgress=false;render();return}
 const motif=await objectiveInteractionPrelude(`proton-fusion:${phase().id}:${r.out}`,[objectiveInteractionPieceToken(h),objectiveInteractionPrimordialToken(p)],r.out,t);p.reacting=true;state.primordialParticles.delete(protonId);state.board[hCell]=null;state.pieces.delete(hId);renderPrimordialParticles();renderPieces();const np=createPiece(r.out,hCell,false);np.x=t.x;np.y=t.y;focusPieceInfo(np);if(pieceIsUnstable(np))np.unstableBornRound=state.nuclearRound+1;state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);recordFlow(r.out===phase().new?3:1);state.selected=[];if(motif)await objectiveInteractionRevealPiece(motif,np,t);else render();burst(t.x,t.y);await handleReactionEmissions(r,np);await wait(90);await afterNuclearAction({advanceRound:true,forceBoardPulse:true});state.fusionInProgress=false;state.locked=false;ensureOpportunity();render();checkComplete()
}
function stellarProtonRecipe(s=phase()){
 if(s.id==='he_red')return RED_UNSTABLE_FUSION;
 if(fusionRecipeCompatible(FUSIONS.D,s))return FUSIONS.D;
 return null
}
function tapStellarProton(id){
 const s=phase(),p=state.primordialParticles.get(id),r=stellarProtonRecipe(s),capture=protonCaptureAvailable(s);if((!r&&!capture)||state.locked||state.phaseDone||!p||p.kind!=='p'||p.reacting)return;
 if(state.primordialSelected===id){state.primordialSelected=null;render();return}
 const selectedCell=state.selected.length===1?state.selected[0]:undefined,selectedTarget=selectedCell!==undefined?state.pieces.get(state.board[selectedCell]):null,hCell=r?state.selected.find(c=>state.pieces.get(state.board[c])?.sym==='H'):undefined;if(hCell!==undefined){state.primordialSelected=id;render();setTimeout(()=>fuseHydrogenWithProton(hCell,id,r),70);return}
 if(capture&&selectedTarget&&protonCaptureRoute(selectedTarget,s)){state.primordialSelected=id;render();setTimeout(()=>attemptProtonCapture(selectedCell,id),70);return}
 state.primordialSelected=id;state.selected=[];tone(340,.04);render()
}
function cumulativeParticleInteractionAllowed(s=phase()){return !!s&&s.mode!=='opening'&&learnedPrimordialNuclearReactions().length>0}
function ensureCumulativeParticleFuel(s=phase()){
 if(!s||isPrimordial(s)||!cumulativeParticleInteractionAllowed(s))return;
 ensurePrimordialParticleMix({p:2,n:2,e:atomicRecombinationLearned('H')?2:0});startPrimordialDrift();
}
function renderPrimordialParticles(){
 if(!dom.primordial)return;const s=phase(),primordialActive=isPrimordial(s)&&s.mode!=='opening',canUseCumulative=cumulativeParticleInteractionAllowed(s),canUseStellarProton=!!stellarProtonRecipe(s)||protonCaptureAvailable(s),selectedParticle=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null,selectedPiece=state.freeSelected.length?state.pieces.get(state.freeSelected[0]):null,selectedBoardPiece=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null;dom.primordial.classList.toggle('active',(primordialActive||canUseStellarProton||canUseCumulative)&&!state.locked);const existing=new Map([...dom.primordial.querySelectorAll('.primordial-particle')].map(el=>[+el.dataset.id,el]));
 const foregroundFree=new Set();
 if(!isPrimordial(s))for(const kind of ['p','n','e']){const free=[...state.primordialParticles.values()].filter(p=>p.kind===kind&&!p.reacting).sort((a,b)=>((b.id===state.primordialSelected)-(a.id===state.primordialSelected))||a.id-b.id);free.slice(0,2).forEach(p=>foregroundFree.add(p.id))}
 state.primordialParticles.forEach((p,id)=>{let el=existing.get(id);if(!el){el=document.createElement('button');el.type='button';el.dataset.id=id;el.addEventListener('contextmenu',ev=>ev.preventDefault());el.addEventListener('pointerdown',ev=>armParticleDrag(id,el,ev));el.addEventListener('pointermove',ev=>moveParticleDrag(id,ev));el.addEventListener('pointerup',ev=>finishParticleDrag(id,ev,false));el.addEventListener('pointercancel',ev=>finishParticleDrag(id,ev,true));el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();const q=state.primordialParticles.get(id);if(q&&performance.now()<(q.suppressTapUntil||0))return;tapPrimordialParticle(id)});dom.primordial.appendChild(el)}const cls=p.kind==='p'?'proton':p.kind==='pos'?'positron':p.kind==='n'?'neutronfree':'electron',label=p.kind==='p'?'+':p.kind==='pos'?'e⁺':p.kind==='n'?'n':'−';let candidate=false,interactive=false;
   if(primordialActive&&!p.reacting){
     if(selectedPiece){candidate=!!primordialMixedReaction(selectedPiece.sym,p.kind)||(p.kind==='e'&&pieceCanBindElectron(selectedPiece));interactive=candidate||state.primordialSelected===id}
     else if(selectedParticle&&selectedParticle.id!==id){candidate=!!primordialParticlePairReaction([selectedParticle.kind,p.kind])||(atomicRecombinationLearned('H')&&same([selectedParticle.kind,p.kind],['p','e']));interactive=candidate||state.primordialSelected===id}
     else{interactive=learnedPrimordialNuclearReactions().some(r=>r.particles.includes(p.kind))||(p.kind==='e'&&['H','He','Li'].some(atomicRecombinationLearned))||(p.kind==='p'&&atomicRecombinationLearned('H'))}
   }else if((canUseStellarProton||canUseCumulative)&&!p.reacting){
     if(selectedBoardPiece){candidate=!!primordialMixedReaction(selectedBoardPiece.sym,p.kind)||(p.kind==='p'&&((stellarProtonRecipe(s)&&selectedBoardPiece.sym==='H')||(protonCaptureAvailable(s)&&protonCaptureRoute(selectedBoardPiece,s))));interactive=candidate}
     else if(selectedParticle&&selectedParticle.id!==id){candidate=!!primordialParticlePairReaction([selectedParticle.kind,p.kind])||(atomicRecombinationLearned('H')&&same([selectedParticle.kind,p.kind],['p','e']));interactive=candidate||state.primordialSelected===id}
     else{interactive=learnedPrimordialNuclearReactions().some(r=>r.particles.includes(p.kind))||(p.kind==='e'&&['H','He','Li'].some(atomicRecombinationLearned))||(p.kind==='p'&&canUseStellarProton)}
   }
   const reserve=!isPrimordial(s)&&['p','n','e'].includes(p.kind)&&!p.reacting&&!foregroundFree.has(id);el.className=`primordial-particle ${cls}${p.kind==='n'&&p.unstable?' unstable':''}${state.primordialSelected===id?' selected':''}${candidate?' candidate':''}${p.reacting?' reacting':''}${p.dragging?' dragging':''}${p.throwing?' throwing':''}${p.coulombDeflect?' coulomb-deflect':''}${p.tunneling?' tunneling':''}${reserve?' particle-reserve':''}`;el.textContent=label;el.style.pointerEvents=reserve?'none':'auto';el.setAttribute('aria-hidden',reserve?'true':'false');el.dataset.mechanical=interactive&&!reserve?'1':'0';el.style.left=p.x+'px';el.style.top=p.y+'px';existing.delete(id)});existing.forEach(el=>el.remove())
}
async function reactCumulativeProcessNeutronWithProton(proton,n){
 const r=primordialParticlePairReaction(['p','n']);if(!r||state.locked||!proton||!n)return;
 const x=(proton.x+n.x)/2,y=(proton.y+n.y)/2;state.locked=true;state.primordialSelected=null;state.selectedNeutron=null;
 await objectiveInteractionImpact(`cumulative:${phase().id}:p+n>D`,[objectiveInteractionPrimordialToken(proton),objectiveInteractionNeutronToken(n)],'D',{x,y},'γ','FUSÃO');
 state.primordialParticles.delete(proton.id);state.neutrons.delete(n.id);renderPrimordialParticles();renderNeutrons();
 const spawn=createParticleReactionProduct('D',x,y,{massNumber:2}),out=spawn.piece;out.newborn=true;state.created.D=(state.created.D||0)+1;state.discovered.add('D');focusPieceInfo(out);burst(x,y);await emitGamma(x,y);await settleParticleReactionProduct(spawn);await afterNuclearAction({advanceRound:true});
 setTimeout(()=>{const q=state.pieces.get(out.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;ensureOpportunity();render();
}
async function reactCumulativeBoardMixed(r,piece,particle){
 if(!r||state.locked||!piece||!particle||particle.reacting)return;const x=piece.x,y=piece.y;state.locked=true;state.selected=[];state.primordialSelected=null;
 await objectiveInteractionImpact(`cumulative:${phase().id}:${piece.sym}+${particle.kind}>${r.out}`,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(particle)],r.out,{x,y},particle.kind,'CAPTURA');
 particle.reacting=true;state.primordialParticles.delete(particle.id);renderPrimordialParticles();piece.sym=r.out;piece.massNumber=r.mass??E[r.out]?.mass??null;piece.captures=0;piece.newborn=true;state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);focusPieceInfo(piece);burst(x,y);await handleReactionEmissions(r,piece);await afterNuclearAction({advanceRound:true});
 setTimeout(()=>{const q=state.pieces.get(piece.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;ensureOpportunity();render();
}
async function reactCumulativeProcessNeutronMixed(r,piece,n){
 if(!r||state.locked||!piece||!n)return;const x=piece.x,y=piece.y,wasFree=!!piece.free;state.locked=true;state.selected=[];state.freeSelected=[];state.selectedNeutron=null;
 await objectiveInteractionImpact(`cumulative:${phase().id}:${piece.sym}+n>${r.out}`,[objectiveInteractionPieceToken(piece),objectiveInteractionNeutronToken(n)],r.out,{x,y},'n','CAPTURA');state.neutrons.delete(n.id);renderNeutrons();let out=piece;
 if(wasFree){state.pieces.delete(piece.id);out=createFreePiece(r.out,x,y,{massNumber:r.mass,longRadioactive:!!r.longRadioactive})}else{out.sym=r.out;out.massNumber=r.mass??E[r.out]?.mass??null;out.captures=0}
 out.newborn=true;state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);focusPieceInfo(out);burst(x,y);await handleReactionEmissions(r,out);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(out.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;ensureOpportunity();render();
}
function tapPrimordialParticle(id){
 const s=phase();const preview=state.primordialParticles.get(id);if(preview)focusParticleInfo(preview.kind,id);if(!isPrimordial(s)){
 const p=preview;if(!p||p.reacting||p.dragging||state.locked||state.phaseDone)return;
 const processN=state.selectedNeutron!==null?state.neutrons.get(state.selectedNeutron):null;
 if(processN&&p.kind==='p'&&primordialParticlePairReaction(['p','n']))return reactCumulativeProcessNeutronWithProton(p,processN);
 const free=state.freeSelected.length?state.pieces.get(state.freeSelected[0]):null;if(free){if(p.kind==='e'&&pieceCanBindElectron(free))return bindElectronToPiece(free,p);const mixed=primordialMixedReaction(free.sym,p.kind);if(mixed)return reactPrimordialMixed(mixed,free,p)}
 const board=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null;if(board){const mixed=primordialMixedReaction(board.sym,p.kind);if(mixed)return reactCumulativeBoardMixed(mixed,board,p)}
 if(state.primordialSelected===id){state.primordialSelected=null;render();return}
 if(state.primordialSelected!==null){const first=state.primordialParticles.get(state.primordialSelected);if(first){if(atomicRecombinationLearned('H')&&same([first.kind,p.kind],['p','e']))return recombineHydrogenParticles(first,p);const pair=primordialParticlePairReaction([first.kind,p.kind]);if(pair)return reactPrimordialParticlePair(pair,first,p)}}
 if(cumulativeParticleInteractionAllowed(s)&&learnedPrimordialNuclearReactions().some(r=>r.particles.includes(p.kind))){state.primordialSelected=id;tone(p.kind==='e'?460:p.kind==='n'?420:340,.04);render();return}
 if(p.kind==='p'&&(stellarProtonRecipe(s)||protonCaptureAvailable(s)))return tapStellarProton(id);return
}if(s.mode==='opening'||state.locked||state.phaseDone)return;const p=state.primordialParticles.get(id);if(!p||p.reacting||p.dragging)return;
 const selectedPiece=state.freeSelected.length?state.pieces.get(state.freeSelected[0]):null;
 if(selectedPiece){if(p.kind==='e'&&pieceCanBindElectron(selectedPiece))return bindElectronToPiece(selectedPiece,p);const mixed=primordialMixedReaction(selectedPiece.sym,p.kind);if(mixed)return reactPrimordialMixed(mixed,selectedPiece,p);state.freeSelected=[];invalidPrimordial(id);render();return}
 if(state.primordialSelected===id){state.primordialSelected=null;render();return}
 if(state.primordialSelected===null){const canStart=learnedPrimordialNuclearReactions().some(r=>r.particles.includes(p.kind))||(p.kind==='e'&&['H','He','Li'].some(atomicRecombinationLearned))||(p.kind==='p'&&atomicRecombinationLearned('H'));if(!canStart)return;state.primordialSelected=id;tone(p.kind==='e'?460:p.kind==='n'?420:340,.04);render();return}
 const first=state.primordialParticles.get(state.primordialSelected);if(!first){state.primordialSelected=id;render();return}
 if(atomicRecombinationLearned('H')&&same([first.kind,p.kind],['p','e']))return recombineHydrogenParticles(first,p);
 const pair=primordialParticlePairReaction([first.kind,p.kind]);if(pair)return reactPrimordialParticlePair(pair,first,p);
 state.primordialSelected=id;invalidPrimordial(id);render();
}
async function reactPrimordialParticlePair(r,a,b){
 if(state.locked||!a||!b||a.reacting||b.reacting)return;const s=phase(),x=(a.x+b.x)/2,y=(a.y+b.y)/2,goal=r.out===s.new&&primordialGoalCount(s)<Math.max(1,s.target||1);state.locked=true;state.primordialSelected=null;const motif=goal?await objectiveInteractionPrelude(`primordial:${s.id}:${r.out}`,[objectiveInteractionPrimordialToken(a),objectiveInteractionPrimordialToken(b)],r.out,{x,y}):null;
 a.reacting=true;b.reacting=true;if(!motif){a.x=x;a.y=y;b.x=x;b.y=y;renderPrimordialParticles();await wait(260)}state.primordialParticles.delete(a.id);state.primordialParticles.delete(b.id);renderPrimordialParticles();const spawn=createParticleReactionProduct(r.out,x,y,{massNumber:r.mass,longRadioactive:!!r.longRadioactive}),out=spawn.piece;out.newborn=true;focusPieceInfo(out);state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);recordFlow(r.out===s.new?2:1);if(motif)await objectiveInteractionRevealPiece(motif,out,{x,y});else render();burst(x,y);await handleReactionEmissions(r,out);await settleParticleReactionProduct(spawn);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(out.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}
async function reactPrimordialMixed(r,piece,particle){
 if(state.locked||!piece||!particle||particle.reacting)return;const s=phase(),x=piece.x,y=piece.y,goal=r.out===s.new&&primordialGoalCount(s)<Math.max(1,s.target||1);state.locked=true;state.freeSelected=[];state.primordialSelected=null;const motif=goal?await objectiveInteractionPrelude(`primordial:${s.id}:${r.out}`,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(particle)],r.out,{x,y}):null;
 particle.reacting=true;if(!motif){particle.x=x;particle.y=y;renderPrimordialParticles();await wait(220)}state.primordialParticles.delete(particle.id);state.pieces.delete(piece.id);renderPrimordialParticles();renderPieces();const out=createFreePiece(r.out,x,y,{massNumber:r.mass,longRadioactive:!!r.longRadioactive});out.newborn=true;focusPieceInfo(out);state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);recordFlow(r.out===s.new?2:1);if(motif)await objectiveInteractionRevealPiece(motif,out,{x,y});else render();burst(x,y);await handleReactionEmissions(r,out);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(out.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}
async function recombineHydrogenParticles(a,b){
 if(state.locked||a.reacting||b.reacting)return;const p=a.kind==='p'?a:b,e=a.kind==='e'?a:b;if(!p||!e)return;const s=phase(),x=(p.x+e.x)/2,y=(p.y+e.y)/2;state.locked=true;state.primordialSelected=null;const motif=await objectiveInteractionPrelude(`atomic:${s.id}:H`,[objectiveInteractionPrimordialToken(p),objectiveInteractionPrimordialToken(e)],'H',{x,y});p.reacting=true;e.reacting=true;state.primordialParticles.delete(p.id);state.primordialParticles.delete(e.id);renderPrimordialParticles();const spawn=createParticleReactionProduct('H',x,y,{matterState:'atom',boundElectrons:1,massNumber:1}),h=spawn.piece;h.newborn=true;focusPieceInfo(h);state.created.H=(state.created.H||0)+1;state.discovered.add('H');recordFlow(1);if(motif)await objectiveInteractionRevealPiece(motif,h,{x,y});else render();burst(x,y);await emitGamma(x,y);await settleParticleReactionProduct(spawn);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(h.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}
async function bindElectronToPiece(piece,electron){
 if(state.locked||!pieceCanBindElectron(piece)||!electron||electron.kind!=='e')return;const s=phase(),x=piece.x,y=piece.y,nextBound=Math.min(E[piece.sym].n,Number(piece.boundElectrons||0)+1),finalNeutral=nextBound>=E[piece.sym].n,objectiveNeutral=s.mode==='atomicRecombination'&&piece.sym===s.new&&finalNeutral;state.locked=true;state.freeSelected=[];state.primordialSelected=null;const key=`atomic:${s.id}:${piece.sym}:e`;const motif=objectiveNeutral?await objectiveInteractionPrelude(key,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(electron)],piece.sym,{x,y}):null;if(!objectiveNeutral)await objectiveInteractionImpact(key,[objectiveInteractionPieceToken(piece),objectiveInteractionPrimordialToken(electron)],piece.sym,{x,y},'e⁻','CAPTURA');electron.reacting=true;state.primordialParticles.delete(electron.id);renderPrimordialParticles();piece.boundElectrons=nextBound;piece.matterState='atom';piece.newborn=true;focusPieceInfo(piece);recordFlow(1);if(pieceCharge(piece)===0){state.created[piece.sym]=(state.created[piece.sym]||0)+1;state.discovered.add(piece.sym)}if(motif)await objectiveInteractionRevealPiece(motif,piece,{x,y});else renderPieces();burst(piece.x,piece.y);await emitGamma(piece.x,piece.y);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(piece.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}
function invalidPrimordial(id){const el=dom.primordial.querySelector(`[data-id="${id}"]`);if(el){el.classList.add('invalid');setTimeout(()=>el.classList.remove('invalid'),250)}tone(170,.06,'sawtooth');vibrate(8)}
function tapFreeAtom(id){
 const p=state.pieces.get(id);if(!p||!p.free||state.locked||state.phaseDone)return;const particle=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null;
 if(particle){if(particle.kind==='e'&&pieceCanBindElectron(p))return bindElectronToPiece(p,particle);const mixed=primordialMixedReaction(p.sym,particle.kind);if(mixed)return reactPrimordialMixed(mixed,p,particle);state.primordialSelected=null;invalidFreeAtom(id);render();return}
 if(state.freeSelected.includes(id)){state.freeSelected=[];render();return}
 if(!state.freeSelected.length){state.freeSelected=[id];tone(320,.04);render();return}
 const ids=[...state.freeSelected,id],syms=ids.map(x=>state.pieces.get(x)?.sym).filter(Boolean),r=primordialPieceReaction(syms);if(!r){state.freeSelected=[id];invalidFreeAtom(id);render();return}state.freeSelected=ids;render();setTimeout(()=>fuseFree(r,ids),70)
}
function invalidFreeAtom(id){const el=dom.pieces.querySelector(`[data-id="${id}"]`);if(el){el.classList.add('invalid');setTimeout(()=>el.classList.remove('invalid'),250)}tone(170,.06,'sawtooth');vibrate(8)}
async function fuseFree(r,ids){
 if(state.locked)return;const parts=ids.map(id=>state.pieces.get(id)).filter(Boolean);if(parts.length!==r.pieces.length)return;const s=phase(),x=parts.reduce((n,p)=>n+p.x,0)/parts.length,y=parts.reduce((n,p)=>n+p.y,0)/parts.length,goal=parts.length===2&&r.out===s.new&&primordialGoalCount(s)<Math.max(1,s.target||1);state.locked=true;const motif=goal?await objectiveInteractionPrelude(`primordial:${s.id}:${r.out}`,[objectiveInteractionPieceToken(parts[0]),objectiveInteractionPieceToken(parts[1])],r.out,{x,y}):null;if(!motif){parts.forEach(p=>{p.x=x;p.y=y});renderPieces();await wait(150)}ids.forEach(id=>state.pieces.delete(id));state.freeSelected=[];renderPieces();const out=createFreePiece(r.out,x,y,{massNumber:r.mass,longRadioactive:!!r.longRadioactive});out.newborn=true;focusPieceInfo(out);state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);recordFlow(r.out===s.new?2:1);if(motif)await objectiveInteractionRevealPiece(motif,out,{x,y});else render();burst(x,y);await handleReactionEmissions(r,out);await afterNuclearAction({advanceRound:true});setTimeout(()=>{const q=state.pieces.get(out.id);if(q){q.newborn=false;renderPieces()}},300);state.locked=false;render();checkComplete()
}
function stopCosmicRaySystem(){
 if(state.cosmicTimer){clearTimeout(state.cosmicTimer);state.cosmicTimer=null}
 state.cosmicRays.clear();state.selectedCosmic=null;if(dom.cosmic)dom.cosmic.innerHTML='';renderPieces()
}
function cosmicSpawnPoint(){
 const size=starSize(),edge=Math.floor(Math.random()*4),pad=12;
 if(edge===0)return{x:pad,y:pad+Math.random()*(size-pad*2),angle:0};
 if(edge===1)return{x:size-pad,y:pad+Math.random()*(size-pad*2),angle:Math.PI};
 if(edge===2)return{x:pad+Math.random()*(size-pad*2),y:pad,angle:Math.PI/2};
 return{x:pad+Math.random()*(size-pad*2),y:size-pad,angle:-Math.PI/2}
}
function energeticMode(s=phase()){return ['spallation','neutrino','gamma'].includes(s.mode)}
function particleTargets(s=phase()){
 if(s.mode==='spallation')return ['C','N','O'];
 if(s.mode==='neutrino')return ['Ne'];
 if(s.mode==='gamma')return s.isotopeMode?['Mo','Ru']:[];
 return []
}
function cosmicProductFor(id,s=phase()){if(s.mode==='spallation'){const seq=s.new==='Be'?['Be','Li','Be','B','Be','Li','Be']:['B','Be','B','Li','B','Be','B'];return seq[(id-1)%seq.length]}if(s.mode==='neutrino')return'F';if(s.mode==='gamma')return s.isotopeMode?'−n':s.new;return s.new}
function spawnCosmicRay(){
 const s=phase();if(!energeticMode(s)||state.phaseDone||state.popupOpen||state.locked)return false;
 if(state.cosmicRays.size>=4)return false;
 const id=state.nextCosmicId++,pt=cosmicSpawnPoint(),ray={id,x:pt.x,y:pt.y,angle:pt.angle,product:cosmicProductFor(id,s)};state.cosmicRays.set(id,ray);renderCosmicRays();return true
}
function startCosmicRaySystem(){
 stopCosmicRaySystem();if(!energeticMode()||state.phaseDone||state.popupOpen)return;
 const tick=()=>{if(!energeticMode()||state.phaseDone||state.popupOpen)return;spawnCosmicRay();state.cosmicTimer=setTimeout(tick,phase().mode==='spallation'?620:760)};
 spawnCosmicRay();state.cosmicTimer=setTimeout(tick,420)
}
function renderCosmicRays(){
 if(!dom.cosmic)return;const s=phase();if(!energeticMode(s)){dom.cosmic.innerHTML='';return}
 const existing=new Map([...dom.cosmic.querySelectorAll('.cosmic-ray')].map(el=>[+el.dataset.id,el]));
 const selectedBoardTarget=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null;
 state.cosmicRays.forEach((r,id)=>{let el=existing.get(id);if(!el){el=document.createElement('button');el.type='button';el.dataset.id=id;el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();selectCosmicRay(id)});dom.cosmic.appendChild(el)}const kind=s.mode==='neutrino'?' neutrino':s.mode==='gamma'?' gamma':'',candidate=state.selectedCosmic===null&&!!selectedBoardTarget&&particleTargets(s).includes(selectedBoardTarget.sym);el.className='cosmic-ray'+kind+(state.selectedCosmic===id?' selected':candidate?' candidate':'');const mark=s.mode==='neutrino'?'ν':s.mode==='gamma'?'γ':'+';el.innerHTML=`<span>${mark}</span><small>${s.mode==='gamma'?'(γ,n)':`→ ${r.product}`}</small>`;el.style.left=r.x+'px';el.style.top=r.y+'px';el.style.rotate=`${r.angle}rad`;existing.delete(id)});existing.forEach(el=>el.remove())
}
function selectCosmicRay(id){
 if(!energeticMode()||state.locked||state.phaseDone)return;const ray=state.cosmicRays.get(id);if(!ray)return;const mode=phase().mode;setInfoSelection({type:'cosmic',kind:mode==='neutrino'?'nu':mode==='gamma'?'gamma':'cosmic'},true);
 state.selectedCosmic=state.selectedCosmic===id?null:id;if(state.selectedCosmic!==null)state.selected=[];tone(phase().mode==='neutrino'?670:520,.05,'sine',.03);renderCosmicRays();renderPieces();updateMoveTargets();updateObjective()
}
function tapParticleTarget(id){
 const p=state.pieces.get(id),s=phase();if(!p||!energeticMode(s)||state.phaseDone)return;const targets=particleTargets(s);
 if(!targets.includes(p.sym)){toast(`Escolha um núcleo alvo: ${targets.join(', ')}.`);return}
 if(state.selectedCosmic===null){toast(s.mode==='neutrino'?'Selecione primeiro um ν.':s.mode==='gamma'?'Selecione primeiro um fóton γ.':'Selecione primeiro um raio cósmico.');return}
 fireCosmicRay(state.selectedCosmic,id)
}
function spallFragments(x,y){
 for(let i=0;i<6;i++){const d=document.createElement('i');d.className='spall-fragment';d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);const a=Math.random()*Math.PI*2,dist=32+Math.random()*50;requestAnimationFrame(()=>{d.style.transition='transform .52s ease-out,opacity .52s ease';d.style.transform=`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(.25)`;d.style.opacity='0'});setTimeout(()=>d.remove(),560)}
}
async function fireCosmicRay(rayId,targetId){
 if(state.locked)return;const s=phase(),ray=state.cosmicRays.get(rayId),target=state.pieces.get(targetId),targets=particleTargets(s);if(!ray||!target||!targets.includes(target.sym))return;state.locked=true;state.selectedCosmic=null;const {x,y,cell}=target,source=target.sym,out=ray.product,resultSym=s.mode==='gamma'&&s.isotopeMode?target.sym:out,motif=await objectiveInteractionPrelude(`energetic:${s.id}:${source}:${resultSym}`,[objectiveInteractionPieceToken(target),objectiveInteractionCosmicToken(ray,s)],resultSym,{x,y});state.cosmicRays.delete(rayId);renderCosmicRays();
 if(s.mode==='gamma'&&s.isotopeMode){target.massNumber=Math.max(E[target.sym].n+1,(target.massNumber||(target.sym==='Mo'?100:104))-1);target.newborn=true;state.created[s.new]=(state.created[s.new]||0)+1;recordFlow(3);if(motif)await objectiveInteractionRevealPiece(motif,target,{x,y});else renderPieces();spallFragments(x,y);burst(x,y);captureTag(x,y,'γ,n');vibrate([10,14,10]);setTimeout(()=>{const q=state.pieces.get(target.id);if(q){q.newborn=false;renderPieces()}},340);announce('γ-PROCESSO',`${target.sym} · A=${target.massNumber}`,'O fóton removeu um nêutron; o elemento permaneceu o mesmo, mas o isótopo ficou mais proton-rich.');await afterNuclearAction();state.locked=false;render();checkComplete();if(!state.phaseDone)setTimeout(spawnCosmicRay,120);return}
 if(state.board[cell]===targetId)state.board[cell]=null;state.pieces.delete(targetId);renderPieces();const product=createPiece(out,cell,false);product.x=x;product.y=y;product.newborn=true;focusPieceInfo(product);state.created[out]=(state.created[out]||0)+1;state.discovered.add(out);if(s.mode==='spallation'){if(out===s.new)recordFlow(1)}else recordFlow(out===s.new?3:1);if(motif)await objectiveInteractionRevealPiece(motif,product,{x,y});else renderPieces();spallFragments(x,y);burst(x,y);vibrate([12,18,14]);setTimeout(()=>{const q=state.pieces.get(product.id);if(q){q.newborn=false;renderPieces()}},360);if(!triggerPhaseMilestone()){const tag=s.mode==='neutrino'?'ν-PROCESSO':s.mode==='gamma'?'γ-PROCESSO':'ESPALAÇÃO';announce(tag,`${E[out].name.toUpperCase()} FORMADO`,`${state.created[out]||0}/${s.target}`)}await afterNuclearAction();state.locked=false;render();checkComplete();const chainRoot=startChainEvent('energetic',product.x,product.y);scheduleAutoFusionCascade(product.id,chainRoot,1,'energetic');if(!state.phaseDone)setTimeout(spawnCosmicRay,120)
}
function drawLines(){if(isPrimordial()){dom.lines.innerHTML='';return}if(state.selected.length<2){dom.lines.innerHTML='';return}let svg=`<svg viewBox="0 0 ${starSize()} ${starSize()}">`;for(let i=1;i<state.selected.length;i++){const a=pos(coords[state.selected[i-1]]),b=pos(coords[state.selected[i]]);svg+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="rgba(255,255,255,.88)" stroke-width="4" stroke-linecap="round"/>`}dom.lines.innerHTML=svg+'</svg>'}
function fusionLabel(r){if(r===BROWN_FUSION)return'²H + H → ³He + γ';if(r===RED_UNSTABLE_FUSION)return'H + próton → He instável';if(r===RED_STABLE_FUSION)return'He instável + He instável → He estável';if(r===FUSIONS.D)return'H + H → ²H + e⁺ + νₑ';if(r===FUSIONS.He3)return'²H + H → ³He + γ';if(r===FUSIONS.He)return'³He + ³He → He + 2 prótons';let base=`${r.ing.map(x=>E[x].name).join(' + ')} → ${E[r.out].name}`;if(r.freeNuclei?.length)base+=' + '+r.freeNuclei.map(x=>E[x]?.name||x).join(' + ');return r.emissions?.includes('gamma')?base+' + γ':base}
function topFusionLabel(r){if(r===BROWN_FUSION)return'²H + H → ³He';if(r===RED_UNSTABLE_FUSION)return'H + próton → He instável';if(r===RED_STABLE_FUSION)return'He instável + He instável → He estável';if(r===FUSIONS.D)return'H + H → ²H';if(r===FUSIONS.He3)return'²H + H → ³He';if(r===FUSIONS.He)return'³He + ³He → He';let base=`${r.ing.map(x=>E[x].name).join(' + ')} → ${E[r.out].name}`;if(r.freeNuclei?.length)base+=' + '+r.freeNuclei.map(x=>E[x]?.name||x).join(' + ');if(r.emissions?.includes('gamma'))base+=' + Fóton gama';return base}
function infoSymbolFor(sym){
 const special={D:'²H',T:'³H',He3:'³He',HeU:'He*',Be7:'⁷Be',Be8:'⁸Be',FeU:'Fe*',Plus:'p'};
 return special[sym]||E[sym]?.symbol||sym;
}
function symbolicFusionLabel(r){
 if(r===BROWN_FUSION)return'²H + H → ³He + γ';
 if(r===RED_UNSTABLE_FUSION)return'H + p → He*';
 if(r===RED_STABLE_FUSION)return'He* + He* → He';
 if(r===FUSIONS.D)return'H + H → ²H + e⁺ + νₑ';
 if(r===FUSIONS.He3)return'²H + H → ³He + γ';
 if(r===FUSIONS.He)return'³He + ³He → He + 2p';
 let base=`${(r.ing||[]).map(infoSymbolFor).join(' + ')} → ${infoSymbolFor(r.out)}`;
 if(r.freeNuclei?.length)base+=' + '+r.freeNuclei.map(infoSymbolFor).join(' + ');
 return r.emissions?.includes('gamma')?base+' + γ':base;
}
function headerRecipeLine(label){
 const names={
  p:'Próton','p⁺':'Próton',n:'Nêutron','e⁻':'Elétron','e⁺':'Pósitron','ν':'Neutrino','νₑ':'Neutrino','ν̄ₑ':'Antineutrino',γ:'Fóton gama',
  'β−':'Decaimento beta menos','β+':'Decaimento beta mais','²H':'Deutério','³H':'Trítio','³He':'Hélio-3','⁴He':'Hélio-4','⁷Li':'Lítio-7','⁷Be':'Berílio-7','⁸Be':'Berílio-8',
  'He*':'Hélio instável','Fe*':'Ferro instável','2p':'2 prótons','2e⁻':'2 elétrons','3e⁻':'3 elétrons','⁴He²⁺':'Hélio-4','⁷Li³⁺':'Lítio-7','RC':'Raio cósmico'
 };
 for(const sym of ORDER)if(E[sym]?.name)names[sym]=E[sym].name;
 names.D='Deutério';names.T='Trítio';names.He3='Hélio-3';names.Be7='Berílio-7';names.Be8='Berílio-8';names.HeU='Hélio instável';names.FeU='Ferro instável';
 return String(label||'').split(/(\s+|\+|→|\/|·|,|\(|\))/).map(t=>names[t]||t).join('');
}
function formulaHTML(label,boldSyms=null){
  const syms=[...new Set((Array.isArray(boldSyms)?boldSyms:[boldSyms]).filter(Boolean))];let out=label;
  for(const sym of syms){const name=E[sym]?.name;if(!name)continue;const plain=out.replace(/<[^>]*>/g,'');if(!plain.includes(name))continue;const i=out.indexOf(name);if(i>=0)out=out.slice(0,i)+`<strong>${name}</strong>`+out.slice(i+name.length)}
  return out;
}
function scienceScopeLabel(){return''}
function selectedGridPieceForFormula(){
 const cell=state.selected?.length===1?state.selected[0]:null,id=cell===null?null:state.board[cell];return id?state.pieces.get(id)||null:null
}
function formulaContainsSym(label,sym){const name=E[sym]?.name||'';return !!name&&headerRecipeLine(label).includes(name)}
function contextualRecipeForSelectedPiece(piece){
 if(!piece||piece.cell===null||piece.cell===undefined||!fusionSandboxAllowed())return null;
 const candidates=possibleRecipes([piece.sym]).map(r=>({r,cluster:connectedRecipeCluster(r,[piece.cell])})).filter(x=>x.cluster);
 if(!candidates.length)return null;const s=phase();candidates.sort((a,b)=>Number(b.r.out===s.new)-Number(a.r.out===s.new)||(E[a.r.out]?.n||0)-(E[b.r.out]?.n||0));return candidates[0].r
}
function contextualFormula(label,boldSyms=null){
 const piece=selectedGridPieceForFormula();if(!piece)return{label,boldSyms};
 const bold=[...(Array.isArray(boldSyms)?boldSyms:(boldSyms?[boldSyms]:[])),piece.sym];
 if(formulaContainsSym(label,piece.sym))return{label,boldSyms:bold};
 const recipe=contextualRecipeForSelectedPiece(piece);return recipe?{label:topFusionLabel(recipe),boldSyms:bold}:{label,boldSyms:bold}
}
function setFormula(label,boldSyms=null){const ctx=contextualFormula(label,boldSyms),tag=scienceScopeLabel(),shown=headerRecipeLine(ctx.label);$('formulaText').innerHTML=formulaHTML(shown,ctx.boldSyms)+(tag?'<small class="science-tag">'+tag+'</small>':'')}
function flashRecipeTwice(){const el=$('formulaText');if(!el)return;el.classList.remove('recipe-intro-flash');void el.offsetWidth;el.classList.add('recipe-intro-flash');setTimeout(()=>el.classList.remove('recipe-intro-flash'),1500)}
async function tapExplosiveTarget(id){
 const s=phase(),p=state.pieces.get(id);if(s.mode!=='explosive'||state.locked||state.phaseDone||!p)return;
 if(!['Fe','Ni'].includes(p.sym)){toast('Choque os núcleos do grupo do Ferro: Fe ou Ni.');tone(180,.05,'sawtooth',.02);return}
 state.locked=true;state.explosiveHits=(state.explosiveHits||0)+1;const products=['Co','Ni','Cu','Zn','Ga','Ge','Zn','Cu','Zn'];const product=products[(state.explosiveHits-1)%products.length];
 const el=dom.pieces.querySelector(`[data-id="${id}"]`);if(el)el.classList.add('crush-impact');captureTag(p.x,p.y,'CHOQUE');tone(125,.10,'sawtooth',.045);vibrate([14,18,24]);await wait(190);
 p.sym=product;p.captures=0;focusPieceInfo(p);state.created[product]=(state.created[product]||0)+1;state.discovered.add(product);recordFlow(product===s.new?3:1);renderPieces();burst(p.x,p.y);captureTag(p.x,p.y,product);const milestoneTriggered=triggerPhaseMilestone();if(!milestoneTriggered)announce('NUCLEOSSÍNTESE EXPLOSIVA',E[product].name.toUpperCase(),product==='Zn'?`${state.created.Zn||0}/${s.target} Zinco`:'Produto secundário da rede explosiva');tone(620+E[product].n*4,.10,'triangle',.04);await wait(120);await afterNuclearAction();state.locked=false;render();checkComplete()
}
function decayDiscoveryCount(s=phase()){const list=s.decayProducts||['Pa','Ac','Ra','Fr','Rn','At','Po'];return list.filter(sym=>state.decayFound.has(sym)||(state.created[sym]||0)>0).length}
async function tapDecayNucleus(id){
 const s=phase(),p=state.pieces.get(id);if(s.mode!=='decayGarden'||state.locked||state.phaseDone||!p?.decayTrack)return;
 const i=p.decayIndex||0;if(i>=p.decayTrack.length-1){toast(`${E[p.sym].name}: fim desta rota agregada.`);return}
 state.locked=true;const from=p.decayTrack[i],to=p.decayTrack[i+1];captureTag(p.x,p.y,from.decay||'decaimento');tone(from.decay?.includes('β')?760:520,.12,from.decay?.includes('β')?'triangle':'sine',.04);burst(p.x,p.y);await wait(180);
 if(from.decay?.includes('α'))await ejectAlphaHelium(p);else if(from.decay?.includes('β'))await emitBetaMinusProducts(p.x,p.y);await wait(100);
 p.decayIndex=i+1;p.sym=to.sym;p.massNumber=to.mass;p.captures=0;focusPieceInfo(p);state.created[to.sym]=(state.created[to.sym]||0)+1;state.discovered.add(to.sym);recordFlow(2);if(['Pa','Ac','Ra','Fr','Rn','At','Po'].includes(to.sym))state.decayFound.add(to.sym);p.newborn=true;renderPieces();captureTag(p.x,p.y,`${from.mass||''}${from.sym} → ${to.mass||''}${to.sym}`);setTimeout(()=>{const q=state.pieces.get(id);if(q){q.newborn=false;renderPieces()}},360);announce('DECAIMENTO GUIADO',E[to.sym].name.toUpperCase(),`${decayDiscoveryCount(s)}/${s.target} descendentes especiais descobertos`);tone(620+E[to.sym].n*2,.10,'triangle',.04);save();await wait(100);state.locked=false;render();checkComplete()
}
function brownBurnLimit(){return Math.max(1,phase().target||3)}
function brownAtLimit(){return phase().id==='brown'&&((state.created.He3||0)>=brownBurnLimit())}
// Recompensa global de reações e cascatas causais curtas.
// A ação do jogador mantém o crédito normal; consequências automáticas recebem
// crédito decrescente e nunca podem resolver a fase sozinhas.
const CHAIN_AUTO_FLOW_FACTORS=Object.freeze([.25,.10,0]);
const CHAIN_MAX_PROGRESS_BONUS=.10;
const CHAIN_OBJECTIVE_PROGRESS_FLOOR=.75;
const CHAIN_MAX_AUTO_DEPTH=4;
const CHAIN_EVENT_WINDOW_MS=2200;
let chainEventSeq=0,chainResonanceTimer=null;
function chainKindForPhase(s=phase()){
 if(s.mode==='neutron')return s.rprocess?'r':'neutron';
 if(s.mode==='rpProcess'||s.mode==='protonCapture')return'proton';
 if(['gamma','spallation','neutrino'].includes(s.mode))return'energetic';
 if(s.mode==='guidedDecay'||s.mode==='decayGarden')return'decay';
 if(s.mode==='accretion'||s.mode==='blackhole')return'accretion';
 if(s.mode==='pulsar')return'rotation';
 if(s.mode==='neutronize'||s.mode==='collapseFinal')return'collapse';
 if(s.mode==='fusion'||s.mode==='convection'||isPrimordial(s)||s.mode==='whiteCompact')return'nuclear';
 return'reaction';
}
function chainEventTitle(kind){return kind==='r'?'TEMPESTADE-r':kind==='neutron'?'CASCATA DE NÊUTRONS':kind==='proton'?'CADEIA DE PRÓTONS':kind==='energetic'?'RECICLAGEM NUCLEAR':kind==='decay'?'CASCATA DE DECAIMENTOS':kind==='accretion'?'ACREÇÃO':kind==='rotation'?'ROTAÇÃO':kind==='collapse'?'COLAPSO':kind==='nuclear'?'CADEIA NUCLEAR':'CASCATA'}
const CHAIN_LESSON_BY_KIND=Object.freeze({nuclear:'chainNuclear',neutron:'chainNeutron',r:'chainR',proton:'chainProton',energetic:'chainEnergetic'});
async function teachChainEffectOnce(kind,x,y){const key=CHAIN_LESSON_BY_KIND[kind];return key?teachProductOnce(key,x,y):false}
function resetChainFeedback(){
 objectiveMotifReset();state.chainEvent={id:0,kind:'',step:0,lastAt:0};state.chainAutoContext=null;state.chainBonusFlowByRoot={};state.preparedChainRoots={};state.resonance=0;
 if(chainResonanceTimer){clearInterval(chainResonanceTimer);chainResonanceTimer=null}
 rewardDirectorClear();document.documentElement.style.setProperty('--resonanceGlow','0');dom.star?.classList.remove('chain-resonance','reaction-reward','reaction-reward-strong','reward-signature','completion-settle');applyRewardProgressVisuals();
}
function applyReactionResonance(){const level=Math.max(0,Math.min(1,Number(state.resonance||0)));document.documentElement.style.setProperty('--resonanceGlow',level.toFixed(2));dom.star?.classList.toggle('chain-resonance',level>.035)}
function bumpReactionResonance(amount=.12){
 state.resonance=Math.min(1,Number(state.resonance||0)+Math.max(0,amount));applyReactionResonance();
 if(chainResonanceTimer)return;chainResonanceTimer=setInterval(()=>{state.resonance=Math.max(0,Number(state.resonance||0)-.055);applyReactionResonance();if(state.resonance<=0){clearInterval(chainResonanceTimer);chainResonanceTimer=null}},520);
}
function flashReactionReward(strength=1){if(!dom.star)return;const cls=strength>=3?'reaction-reward-strong':'reaction-reward';dom.star.classList.remove('reaction-reward','reaction-reward-strong');void dom.star.offsetWidth;dom.star.classList.add(cls);setTimeout(()=>dom.star?.classList.remove(cls),strength>=3?520:340)}
function reactionFeedback({kind=null,x=null,y=null,step=1,automatic=false,label=null,strength=1,rootId=null}={}){
 const k=kind||chainKindForPhase(),n=Math.max(1,Number(step)||1),level=n>=4?4:n>1?3:Math.max(1,Math.min(2,Number(strength)||1));bumpReactionResonance(.09+level*.035+Math.min(.18,(n-1)*.05));flashReactionReward(level);applyRewardProgressVisuals();
 if(Number.isFinite(x)&&Number.isFinite(y)&&label)captureTag(x,y,label);if(!state.objectiveMotifActive&&level>=2)rewardParticles(x,y,level);if(!state.objectiveMotifActive)AdaptiveAudio.reaction(level,k,n);
 if(n>1){showChainCallout(rootId,k,n,x,y);if(n===3)unlockRewardAchievement('chain3');if(n>=4)unlockRewardAchievement('chain4');if(n>=4)vibrate([7,12,9])}
}
function startChainEvent(kind=chainKindForPhase(),x=null,y=null){const id=++chainEventSeq;state.chainEvent={id,kind,step:1,lastAt:performance.now(),x,y};state.chainBonusFlowByRoot=state.chainBonusFlowByRoot||{};state.preparedChainRoots=state.preparedChainRoots||{};state.chainBonusFlowByRoot[id]=0;return id}
function extendChainEvent(rootId,kind,x=null,y=null){
 const now=performance.now(),k=kind||chainKindForPhase();let ev=state.chainEvent;
 if(!ev||ev.id!==rootId||now-(ev.lastAt||0)>CHAIN_EVENT_WINDOW_MS)ev={id:rootId||++chainEventSeq,kind:k,step:1,lastAt:now};
 ev.kind=k;ev.step=Math.min(99,Math.max(1,ev.step||1)+1);ev.lastAt=now;state.chainEvent=ev;reactionFeedback({kind:k,x,y,step:ev.step,automatic:true,rootId});if(ev.step===2&&state.preparedChainRoots?.[rootId]){registerRewardDiscovery('phenomenon:plannedChain',{title:'CADEIA PLANEJADA',text:'A continuação já estava preparada no tabuleiro.',silent:true});unlockRewardAchievement('plannedChain')}return ev.step;
}
function cascadeFlowAward(points,ctx,s=phase()){
 const depth=Math.max(2,Number(ctx?.depth)||2),factor=CHAIN_AUTO_FLOW_FACTORS[Math.min(CHAIN_AUTO_FLOW_FACTORS.length-1,depth-2)]||0,root=String(ctx?.rootId||'0'),cap=Math.max(0,Number(s.flowTarget||0)*CHAIN_MAX_PROGRESS_BONUS),used=Number(state.chainBonusFlowByRoot?.[root]||0),remaining=Math.max(0,cap-used),award=Math.min(Math.max(0,Number(points)||0)*factor,remaining);
 state.chainBonusFlowByRoot=state.chainBonusFlowByRoot||{};state.chainBonusFlowByRoot[root]=used+award;return award;
}
function objectiveFlowFloorApplies(s=phase()){return s.mode!=='opening'&&s.id!=='brown'&&s.mode!=='whiteCompact'&&Number(s.flowTarget||0)>0}
function autoFusionCandidate(product,s=phase()){
 if(!product||product.free||product.cell===null||product.cell===undefined||!fusionSandboxAllowed(s))return null;const options=[];
 for(const cell of neigh[product.cell]||[]){const id=state.board[cell],other=id?state.pieces.get(id):null;if(!other)continue;const r=exactRecipe([product.sym,other.sym]);if(!r)continue;options.push({other,r,goal:r.out===s.new?1:0})}
 options.sort((a,b)=>b.goal-a.goal||(E[b.r.out]?.n||0)-(E[a.r.out]?.n||0));return options[0]||null;
}
function scheduleAutoFusionCascade(pieceId,rootId,depth=1,kind='nuclear'){
 if(depth>=CHAIN_MAX_AUTO_DEPTH)return;setTimeout(async()=>{if(state.phaseDone||state.readyToAdvance||state.locked||state.selected.length||state.primordialSelected!==null)return;const product=state.pieces.get(pieceId),candidate=autoFusionCandidate(product);if(!product||!candidate)return;await teachChainEffectOnce(kind,product.x,product.y);if(state.phaseDone||state.readyToAdvance||!state.pieces.has(product.id))return;const refreshed=autoFusionCandidate(product);if(!refreshed)return;candidate.other=refreshed.other;candidate.r=refreshed.r;const ctx={rootId,depth:depth+1,kind,x:product.x,y:product.y,creditUsed:false,feedbackUsed:false};state.chainAutoContext=ctx;state.selected=[product.cell,candidate.other.cell];render();try{await fuse(candidate.r)}finally{if(state.chainAutoContext===ctx)state.chainAutoContext=null}},240);
}
function neutronTrajectoryCandidate(n,s=phase()){
 if(!n)return null;const speed=Math.hypot(n.vx||0,n.vy||0)||1,ux=(n.vx||0)/speed,uy=(n.vy||0)/speed,tol=Math.max(24,starSize()*.07),options=[];
 for(const p of state.pieces.values()){if(p.free||p.cell===null||p.cell===undefined||!(neutronEligible(p,s)||universalNeutronCaptureEligible(p)))continue;const dx=p.x-n.x,dy=p.y-n.y,forward=dx*ux+dy*uy;if(forward<0||forward>starSize()*.92)continue;const cross=Math.abs(dx*uy-dy*ux);if(cross>tol)continue;options.push({p,score:cross+forward*.025})}
 options.sort((a,b)=>a.score-b.score);return options[0]?.p||null;
}
function scheduleNeutronCascade(rootId,ids,{storm=false}={}){
 const list=[...(ids||[])],maxLinks=storm?3:2;if(!list.length)return;setTimeout(async()=>{let links=0,depth=1;for(const id of list){if(links>=maxLinks||depth>=CHAIN_MAX_AUTO_DEPTH||state.phaseDone||state.readyToAdvance||phase().mode!=='neutron')break;let spins=0;while(state.locked&&spins++<5)await wait(140);if(state.locked||state.selected.length||state.selectedNeutron!==null)break;const n=state.neutrons.get(id),target=neutronTrajectoryCandidate(n);if(!n||!target)continue;const cascadeKind=storm?'r':'neutron';await teachChainEffectOnce(cascadeKind,target.x,target.y);if(state.phaseDone||state.readyToAdvance||!state.neutrons.has(id)||!state.pieces.has(target.id))break;depth++;links++;const ctx={rootId,depth,kind:cascadeKind,x:target.x,y:target.y,creditUsed:false,feedbackUsed:false};state.chainAutoContext=ctx;state.selected=[target.cell];try{await captureNeutron(id)}finally{if(state.chainAutoContext===ctx)state.chainAutoContext=null}await wait(180)}},520);
}
function scheduleAutoProtonCascade(pieceId,rootId,depth=1){
 if(depth>=CHAIN_MAX_AUTO_DEPTH)return;setTimeout(async()=>{if(state.phaseDone||state.readyToAdvance||state.locked||state.selected.length||state.primordialSelected!==null)return;const target=state.pieces.get(pieceId),s=phase();if(!target||pieceIsUnstable(target)||!protonCaptureRoute(target,s))return;const nearby=[...state.primordialParticles.values()].filter(q=>q.kind==='p'&&!q.reacting).map(q=>({q,d:Math.hypot(q.x-target.x,q.y-target.y)})).filter(x=>x.d<=starSize()*.24).sort((a,b)=>a.d-b.d)[0];if(!nearby)return;await teachChainEffectOnce('proton',target.x,target.y);if(state.phaseDone||state.readyToAdvance||!state.pieces.has(target.id)||!state.primordialParticles.has(nearby.q.id))return;const ctx={rootId,depth:depth+1,kind:'proton',x:target.x,y:target.y,creditUsed:false,feedbackUsed:false};state.chainAutoContext=ctx;state.selected=[target.cell];try{await attemptProtonCapture(target.cell,nearby.q.id)}finally{if(state.chainAutoContext===ctx)state.chainAutoContext=null}},260);
}

function objectiveProgress(s=phase()){
 const done=objectiveSatisfied(s);if(done)return 1;
 const ratio=(n,d)=>Math.max(0,Math.min(.99,Number(n||0)/Math.max(1,Number(d||1))));
 const combine=parts=>Math.max(0,Math.min(.99,parts.reduce((sum,v)=>sum+Math.max(0,Math.min(1,Number(v)||0)),0)/Math.max(1,parts.length)));
 if(s.mode==='opening')return 0;
 if(s.mode==='convection')return ratio(state.convectionMoves,s.target);
 if(s.mode==='reactionExplore')return ratio(state.atlasProgress,s.target);
 if(s.mode==='decayGarden')return ratio(decayDiscoveryCount(s),s.target);
 if(s.mode==='whiteCompact'){const info=whiteCounts(s);return ratio(Math.min(info.c,info.targetC)+Math.min(info.o,info.targetO),info.targetC+info.targetO)}
 if(s.mode==='neutronize')return ratio(state.crushed,s.target);
 if(s.mode==='neutron'){
   const g=neutronGameplay(s),parts=[ratio(state.created[s.new]||0,s.target)];
   if(s.id==='tc'||s.id==='pm')parts.push(state.radioactiveProofDone?1:0);
   if(g.requiresSource)parts.push(state.neutronSourceActivations>=1?1:0);
   if(g.requiresBranch)parts.push(state.neutronBranchesObserved>=1?1:0);
   if(g.requiresFreezeout)parts.push(state.neutronFreezeouts>=1?1:0);
   return combine(parts);
 }
 if(s.mode==='blackhole')return ratio(state.absorbed,s.target);
 if(isPostMode(s))return ratio(state.absorbed,s.target);
 if(isPrimordial(s)&&s.mode!=='opening')return ratio(primordialGoalCount(s),s.target);
 if(s.mode==='rpProcess'){
   const step=rpStep(s),parts=[ratio(state.created[s.new]||0,s.target)];
   if(step?.pattern==='waiting')parts.push(state.rpWaitDecays>=1?1:0);
   if(step?.pattern==='cycle')parts.push(state.rpCyclesObserved>=1?1:0);
   return combine(parts);
 }
 if(s.mode==='protonCapture')return ratio(state.protonCaptures,s.target);
 if(s.id==='brown')return ratio(state.created.He3||0,brownBurnLimit());
 return ratio(state.created[s.new]||0,s.target);
}
function currentProgress(){
 const s=phase();if(s.mode==='opening')return 0;
 const objective=objectiveProgress(s);
 if(s.id==='brown'||s.mode==='whiteCompact'||Number(s.flowTarget||0)<=0)return objective*100;
 const flow=Math.max(0,Math.min(1,state.flow/Math.max(1,s.flowTarget||1)));
 return Math.min(objective,flow)*100;
}
function recordFlow(points=1,feedback=null){
 const s=phase();if(s.mode==='opening'||state.phaseDone)return;const fx=feedback||{};maybeChargeConvectionFromAction(s,fx);
 const ctx=state.chainAutoContext;let award=Math.max(0,Number(points)||0);if(s.mode==='convection'&&fx.kind!=='convection')award=0;if(ctx){if(!ctx.creditUsed){award=cascadeFlowAward(award,ctx,s);ctx.creditUsed=true}else award=0}
 const before=state.flow;state.flow+=award;
 if(ctx&&!ctx.feedbackUsed){extendChainEvent(ctx.rootId,ctx.kind||fx.kind||chainKindForPhase(s),ctx.x??fx.x,ctx.y??fx.y);ctx.feedbackUsed=true}else if(!ctx)reactionFeedback({kind:fx.kind||chainKindForPhase(s),x:fx.x,y:fx.y,step:1,label:fx.label||null,strength:Math.max(1,Math.min(2,Math.ceil((Number(points)||1)/2)))});
 evaluateRewardAchievements(s);applyRewardProgressVisuals();if(s.id==='brown')return;
 const target=Math.max(1,s.flowTarget||1),marks=[[.25,'25'],[.5,'50'],[.75,'75']];
 for(const [ratio,key] of marks){if(before<target*ratio&&state.flow>=target*ratio&&!state.flowMilestones.has(key)){state.flowMilestones.add(key);setTimeout(()=>{if(phase()!==s||state.phaseDone)return;announce('PROGRESSO DA FASE',`${key}% DO PROGRESSO`,key==='50'?'Você já domina o gesto desta fase. Continue no seu ritmo.':'Reações compatíveis também contam para este progresso.');},240)}}
}
function phaseMilestoneThreshold(s=phase()){if(s.mode==='opening'||s.mode==='showcase'||!s.target)return Infinity;if(s.id==='he_red')return Math.max(1,Math.ceil(s.target*.5));if(s.mode==='blackhole')return Math.max(1,Math.ceil((state.postInitialMatter||s.target)*.5));return Math.max(1,Math.ceil(s.target*.5))}
function phaseMilestoneReached(s=phase()){if(s.mode==='convection')return(state.convectionMoves||0)>=phaseMilestoneThreshold(s);if(s.mode==='reactionExplore')return state.atlasProgress>=phaseMilestoneThreshold(s);if(s.mode==='protonCapture')return state.protonCaptures>=phaseMilestoneThreshold(s);if(isPrimordial(s)&&s.mode!=='opening')return primordialGoalCount(s)>=phaseMilestoneThreshold(s);if(s.mode==='decayGarden')return decayDiscoveryCount(s)>=phaseMilestoneThreshold(s);if(s.mode==='guidedDecay')return(state.created[s.new]||0)>=phaseMilestoneThreshold(s);if(s.mode==='neutronize')return state.crushed>=phaseMilestoneThreshold(s);if(isPostMode(s))return state.absorbed>=phaseMilestoneThreshold(s);return(state.created[s.new]||0)>=phaseMilestoneThreshold(s)}
function triggerPhaseMilestone(){const s=phase();if(state.phaseMilestoneAnnounced||!phaseMilestoneReached(s))return false;state.phaseMilestoneAnnounced=true;const made=s.mode==='reactionExplore'?state.atlasProgress:(isPrimordial(s)&&s.mode!=='opening'?primordialGoalCount(s):(state.created[s.new]||0));dom.star.classList.add('milestone-flash');setTimeout(()=>dom.star.classList.remove('milestone-flash'),980);if(s.mode==='convection'){announce('CONVECÇÃO ESTELAR','CORRENTE ESTABELECIDA',`${state.convectionMoves}/${s.target} correntes convectivas realizadas`);tone(620,.14,'triangle',.04);vibrate([10,16,12]);return true}if(s.mode==='reactionExplore'){announce('ATLAS NUCLEAR','PADRÃO RECONHECIDO',`${state.atlasProgress}/${s.target} observações concluídas`);tone(610,.13,'triangle',.035);return true}if(s.mode==='decayGarden'){announce('TEMPO CÓSMICO','CADEIAS EM CURSO',`${decayDiscoveryCount(s)}/${s.target} descendentes especiais descobertos`);tone(560,.14,'sine',.038);return true}if(s.mode==='spallation'){announce('ESPALAÇÃO EM CURSO',`${E[s.new].name.toUpperCase()} INTERESTELAR`,`${made}/${s.target} núcleos de ${E[s.new].name} formados`);tone(720,.14,'triangle',.04);vibrate([12,18,20]);return true}if(isPrimordial(s)){announce('UNIVERSO PRIMORDIAL','SÍNTESE EM CURSO',`${made}/${s.target} ${E[s.new].name} formados`);tone(540,.13,'triangle',.032);return true}if(s.id==='he_red'){if(!state.ignited){state.ignited=true;dom.star.classList.add('ignited','ignition-flash');setTimeout(()=>dom.star.classList.remove('ignition-flash'),950);announce('IGNIÇÃO ESTELAR','A ANÃ VERMELHA ACENDEU',`${made}/${s.target} Hélios · brilho sustentado`);tone(820,.24,'triangle',.065);vibrate([20,35,45]);save()}return true}if(s.mode==='remnant'){announce('REMANESCENTE COMPACTO','GRAVIDADE EXTREMA',`${state.absorbed}/${s.target} núcleos incorporados`);tone(520,.18,'triangle',.04);vibrate([16,22,26]);return true}
if(s.mode==='pulsar'){announce('ROTAÇÃO ACELERA','FEIXES MAIS RÁPIDOS',`${state.absorbed}/${s.target} núcleos incorporados`);tone(760,.16,'sine',.045);vibrate([14,18,24]);return true}
if(s.mode==='accretion'){announce('ACREÇÃO INTENSA','DISCO MAIS LUMINOSO',`${state.absorbed}/${s.target} unidades incorporadas`);tone(610,.17,'triangle',.04);vibrate([16,22,28]);return true}
if(s.mode==='blackhole'){announce('HORIZONTE ATIVO','MATÉRIA DESAPARECE',`${state.pieces.size} unidades ainda orbitam`);tone(130,.2,'sine',.04);vibrate([18,25,32]);return true}
if(s.mode==='neutronize'){announce('COLAPSO ACELERA','GRAVIDADE EXTREMA',`${state.crushed}/${s.target} núcleos comprimidos`);tone(190,.18,'sawtooth',.04);vibrate([18,22,28]);return true}if(s.mode==='neutron'){announce('FLUXO INTENSIFICADO',s.title.toUpperCase(),`${made}/${s.target} ${E[s.new].name} formados`);tone(680,.16,'sine',.045);vibrate([14,24,18]);return true}if(s.id==='brown'){announce('QUEIMA LIMITADA','DEUTÉRIO CONSUMIDO',`${state.created.He3||0}/${brownBurnLimit()} núcleos do reservatório convertidos em ³He`);tone(560,.14,'triangle',.038);vibrate(16);return true}announce('ATIVIDADE INTENSA',s.title.toUpperCase(),`${made}/${s.target} ${E[s.new].name} formados`);tone(650,.16,'triangle',.042);vibrate(16);return true}
function clamp01(v){return Math.max(0,Math.min(1,v))}
function corePacking(){let weighted=0,max=0;const active=activeSet(),weights=[1,.78,.52,.30,.16];state.board.forEach((id,i)=>{if(!active.has(i))return;const w=weights[coords[i].ring]??.1;max+=w;if(id)weighted+=w});return max?weighted/max:0}
function visualIntensity(){const p=clamp01(currentProgress()/100),packing=corePacking();return clamp01(.08+p*.78+packing*.14)*100}
function sci(v,d=1){if(v===0)return'0';const exp=Math.floor(Math.log10(Math.abs(v)));const mant=v/Math.pow(10,exp);const supers={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};const e=String(exp).split('').map(c=>supers[c]||c).join('');return`${mant.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})}×10${e}`}
function speciesCount(sym){let n=0;state.pieces.forEach(p=>{if(p.sym===sym)n++});return n}
function recipeKey(r){return r?`${[...r.ing].sort().join('+')}>${r.out}`:''}
function activeRecipeByKey(key){return key?activeFusionRecipes().find(r=>recipeKey(r)===key)||null:null}
function protonAssistedDReady(s=phase()){return stellarProtonRecipe(s)===FUSIONS.D&&countFloatingParticle('p')>0&&speciesCount('H')>0}
// Uma receita é realmente acionável somente quando seus reagentes podem ser selecionados
// como um grupo conectado agora. A exceção é o próton flutuante da cadeia pp-I.
function reactionIsActionable(r,s=phase()){
 if(!r)return false;
 if(r===FUSIONS.D&&protonAssistedDReady(s))return true;
 return hasAdjacentRecipe(r);
}
function exactHistoricalSymbols(s=phase()){return new Set(Array.isArray(s.starterGroups)?s.starterGroups.flat():[])}
function recipeDependencyOutputs(r,seen=new Set()){
 const out=new Set();if(!r||seen.has(recipeKey(r)))return out;seen.add(recipeKey(r));out.add(r.out);
 for(const sym of [...new Set(r.ing)]){out.add(sym);const producer=activeFusionRecipes().find(q=>q.out===sym&&q!==r);if(producer)for(const x of recipeDependencyOutputs(producer,seen))out.add(x)}
 return out;
}
function recipeSupportsTarget(candidate,target){return !!candidate&&!!target&&recipeDependencyOutputs(target).has(candidate.out)}
function orderedSpatialNeeds(r,s=phase()){
 const available=boardSymbolCounts(),need=counts(r.ing),historical=exactHistoricalSymbols(s),items=[...new Set(r.ing)].map(sym=>({sym,missing:Math.max(0,(need[sym]||0)-(available[sym]||0)),present:available[sym]||0,z:E[sym]?.n??999,historical:historical.has(sym)}));
 // Ingredientes realmente ausentes vêm primeiro. Quando todos existem mas estão distantes,
 // prefira reconstruir o reagente mais leve/reutilizável. Um reagente histórico presente
 // nunca é tratado como ausente só por estar longe.
 items.sort((a,b)=>{
   if(!!a.missing!==!!b.missing)return a.missing?-1:1;
   if(a.historical!==b.historical)return a.historical?1:-1;
   return a.z-b.z||a.sym.localeCompare(b.sym);
 });
 return items;
}
function nextActionableRecipeToward(r,s=phase(),seen=new Set()){
 if(!r)return null;const key=recipeKey(r);if(seen.has(key))return null;seen.add(key);
 if(reactionIsActionable(r,s))return r;
 const needs=orderedSpatialNeeds(r,s);
 for(const item of needs){
   // Quantidades históricas exatas podem ser usadas quando se aproximarem, mas não sugerimos
   // fabricar uma cópia extra apenas para corrigir distância espacial.
   if(item.historical&&item.present>0&&!item.missing)continue;
   const producers=activeFusionRecipes().filter(q=>q.out===item.sym&&q!==r).reverse();
   for(const producer of producers){
     const action=nextActionableRecipeToward(producer,s,new Set(seen));
     if(action)return action;
   }
 }
 return null;
}
function whiteCounts(s=phase()){return {c:speciesCount('C'),o:speciesCount('O'),targetC:s.targetC||3,targetO:s.targetO||3}}
function whiteTargetRecipe(s=phase()){
 const info=whiteCounts(s);
 if(info.c<info.targetC)return FUSIONS.C;
 if(info.o<info.targetO){
   if(info.c<=info.targetC)return FUSIONS.C;
   return FUSIONS.O;
 }
 return FUSIONS.O;
}
function contextualObjectiveRecipe(s=phase()){
 if(s.id==='brown')return BROWN_FUSION;
 if(s.id==='he_red'){
   if(speciesCount('HeU')>=2)return RED_STABLE_FUSION;
   return RED_UNSTABLE_FUSION;
 }
 if(s.mode==='whiteCompact'){
   const target=whiteTargetRecipe(s);
   if(reactionIsActionable(target,s)){state.contextRecipeKey=recipeKey(target);return target}
   const previous=activeRecipeByKey(state.contextRecipeKey);
   if(previous&&reactionIsActionable(previous,s)&&recipeSupportsTarget(previous,target))return previous;
   const action=nextActionableRecipeToward(target,s,new Set());
   state.contextRecipeKey=recipeKey(action||target);
   return action||target;
 }
 const target=phaseFusionRecipes(s).slice().reverse()[0]||phaseFusionRecipe(s);
 if(!target)return null;
 // A transformação final sempre ganha prioridade assim que se torna espacialmente possível.
 if(reactionIsActionable(target,s)){state.contextRecipeKey=recipeKey(target);return target}
 // Evita uma receita "nervosa": mantenha a orientação atual enquanto ela continuar executável
 // e ainda pertencer à cadeia que leva ao objetivo.
 const previous=activeRecipeByKey(state.contextRecipeKey);
 if(previous&&reactionIsActionable(previous,s)&&recipeSupportsTarget(previous,target))return previous;
 const action=nextActionableRecipeToward(target,s,new Set());
 state.contextRecipeKey=recipeKey(action||target);
 return action||target;
}
function primordialProducerToward(sym){
 const producers=learnedPrimordialNuclearReactions().filter(r=>r.out===sym).slice().reverse();
 if(!producers.length)return null;
 for(const r of producers)if(primordialReactionReady(r))return r;
 for(const r of producers){const next=nextPrimordialReactionToward(r,new Set());if(next)return next}
 return producers[0];
}
function primordialNextRecipeLine(s=phase()){
 if(s.mode==='primordialNuclear')return primordialContextualReaction(s)?.label||s.meta||'';
 if(s.id==='atomic_h')return 'p + e⁻ → H + γ';
 if(s.id==='atomic_he'){
   const ion=[...state.pieces.values()].find(p=>p.free&&p.sym==='He'&&pieceCharge(p)>0);
   if(ion)return Number(ion.boundElectrons||0)===0?'⁴He²⁺ + e⁻ → He⁺ + γ':'He⁺ + e⁻ → He + γ';
   return primordialProducerToward('He')?.label||'Reconstrua um núcleo de ⁴He';
 }
 if(s.id==='atomic_li'){
   const ion=[...state.pieces.values()].find(p=>p.free&&p.sym==='Li'&&pieceCharge(p)>0);
   if(ion){const e=Number(ion.boundElectrons||0);return e===0?'⁷Li³⁺ + e⁻ → Li²⁺ + γ':e===1?'Li²⁺ + e⁻ → Li⁺ + γ':'Li⁺ + e⁻ → Li + γ'}
   return primordialProducerToward('Li')?.label||'Reconstrua um núcleo de ⁷Li';
 }
 return '';
}
function guidedDecayMap(s=phase()){return GUIDED_DECAYS[s.id]||null}
function guidedTransitionFor(p,s=phase()){const map=guidedDecayMap(s);return p&&map?map[p.sym]||null:null}
function guidedDecaySymbolAvailable(sym,s=phase()){return [...state.pieces.values()].some(p=>p.sym===sym&&!!guidedTransitionFor(p,s))}
function guidedDecayNextRecipeLine(s=phase()){
  const map=guidedDecayMap(s);if(!map)return '';
  const preferred=Object.keys(map).slice().reverse();
  for(const sym of preferred){if(guidedDecaySymbolAvailable(sym,s)){const tr=map[sym];return tr.type==='alpha'?`${sym} → ${tr.to} + He`:`${sym} → ${tr.to} + e⁻ + ν̄ₑ`}}
  return 'aperte e segure um átomo → decaimento';
}
function guidedDecayTopRecipeLine(s=phase()){
  const map=guidedDecayMap(s);if(!map)return '';
  const preferred=Object.keys(map).slice().reverse();
  for(const sym of preferred){if(guidedDecaySymbolAvailable(sym,s)){const tr=map[sym];return `${sym} → ${tr.to}`}}
  return 'aperte e segure um átomo → decaimento';
}
function neutronPhaseNextRecipeLine(s=phase()){
 const g=neutronGameplay(s),sourceLine=neutronSourceLabel(s);if(g.requiresSource&&state.neutronSourceActivations<1&&sourceLine)return sourceLine;
 const pending=[...state.pieces.values()].find(p=>p.neutronBetaPending);if(pending)return g.pattern==='branch'?`${pending.sym}* · capture outro n ou aguarde β−`:`${pending.sym}* · aguarde β− enquanto reconstrói a cadeia`;
 if(s.id==='co'){
   if([...state.pieces.values()].some(p=>p.sym==='FeU'&&p.radioactiveReady))return 'Fe instável → Co';
   if(speciesCount('Fe')>0)return 'Fe + n → Fe instável';
   const action=nextExecutableActionTowardSymbol('Fe',s,new Set());
   return guidanceActionLine(action)||'Fe + n → Fe instável';
 }
 const selected=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null,tr=selected?neutronTransitionFor(selected,s):null;
 if(tr)return `${tr.from} + n → ${tr.to}`;
 const current=phaseNeutronTransitions(s)[0];if(!current)return'';
 return guidanceActionLine(nextExecutableActionTowardTransition({...current,processClass:neutronProcessClass(s)},s))||`${current.from} + n → ${current.to}`;
}
function targetNucleusGuidance(sym,finalLine,s=phase()){
 if(speciesCount(sym)>0)return finalLine;
 const action=nextExecutableActionTowardSymbol(sym,s,new Set());
 return guidanceActionLine(action)||finalLine;
}
function energeticNextRecipeLine(s=phase()){
 if(s.mode==='neutrino')return targetNucleusGuidance('Ne','ν + Ne → F',s);
 if(s.mode==='spallation'){
   const targets=['C','N','O'];if(targets.some(sym=>speciesCount(sym)>0))return `raio cósmico + C / N / O → ${s.new}`;
   for(const sym of targets){const action=nextExecutableActionTowardSymbol(sym,s,new Set());if(action)return guidanceActionLine(action)}
   return `raio cósmico + C / N / O → ${s.new}`;
 }
 if(s.mode==='gamma'){
   const targets=s.isotopeMode?['Mo','Ru']:[];if(!targets.length||targets.some(sym=>speciesCount(sym)>0))return 'γ + Mo / Ru → isótopo';
   for(const sym of targets){const action=nextExecutableActionTowardSymbol(sym,s,new Set());if(action)return guidanceActionLine(action)}
   return 'γ + Mo / Ru → isótopo';
 }
 if(s.mode==='explosive'){
   if(speciesCount('Fe')>0||speciesCount('Ni')>0)return 'Fe / Ni + choque → Zn';
   for(const sym of ['Fe','Ni']){const action=nextExecutableActionTowardSymbol(sym,s,new Set());if(action)return guidanceActionLine(action)}
   return 'Fe / Ni + choque → Zn';
 }
 return'';
}
function conciseRecipeLine(s=phase()){
 if(s.mode==='reactionExplore')return atlasNextRecipeLine(s);
 if(s.mode==='opening')return 'Toque na singularidade abaixo';
 if(isPrimordial(s)&&s.mode!=='opening')return primordialNextRecipeLine(s);
 if(s.id==='brown')return '²H + H → ³He + γ';
 if(s.id==='he_red')return speciesCount('HeU')>=2?'He instável + He instável → He estável':'H + próton → He instável';
 if(s.mode==='convection'){if(state.convectionConfirmPending)return'Coluna marcada → toque novamente para iniciar';if(state.convectionArmed)return'↕ → selecione um átomo externo';if(state.convectionCharge)return'Toque em ↕ no núcleo estelar';return'Reação nuclear no centro ou camada 1 → Convecção'}
 if(s.id==='stellar_li'){const action=nextExecutableActionTowardSymbol('Li',s,new Set());return action?guidanceActionLine(action):'³He + ⁴He → ⁷Be + γ';}
 if(s.mode==='protonCapture')return 'p + núcleo → captura / estado instável';
 if(s.mode==='rpProcess'){const step=rpStep(s);if(step?.fuel==='H'&&countFloatingParticle('p')<1)return 'H → p + e⁻';if(step?.pattern==='waiting'&&(state.created[s.new]||0)>=s.target&&!state.rpWaitDecays)return `${E[s.new].name} proton-rich · aguarde β⁺ enquanto as rodadas passam`;const currentSeed=[...state.pieces.values()].find(p=>p.sym===step?.from);if(currentSeed)return step?.pattern==='waiting'?`${step.label} · ponto de espera`:step?.label||'núcleo + p → próximo núcleo';const rebuild=[...state.pieces.values()].map(p=>rpStepForSymbol(p.sym,s)).find(Boolean);return rebuild?.label||'Fe + p → Co · reconstrução da semente';}
 if(['spallation','neutrino','gamma'].includes(s.mode))return energeticNextRecipeLine(s);
 if(s.mode==='guidedDecay')return guidedDecayTopRecipeLine(s);
 if(s.mode==='decayGarden')return 'núcleo radioativo → descendente';
 if(s.mode==='explosive')return energeticNextRecipeLine(s);
 if(s.mode==='whiteCompact'){const target=whiteTargetRecipe(s),action=nextExecutableFusionToward(target,s);return action?guidanceActionLine(action):'Hélio + Hélio → Berílio-8';}
 if(s.mode==='showcase')return 'fusão → encerrada';
 if(s.mode==='neutronize')return 'compressão + e⁻ → n + νₑ';
 if(s.mode==='neutron')return neutronPhaseNextRecipeLine(s);
 if(s.mode==='remnant')return 'matéria → Estrela de Nêutrons';
 if(s.mode==='pulsar')return 'matéria → rotação';
 if(s.mode==='accretion')return 'matéria → acreção';
 if(s.mode==='collapseFinal')return 'massa crítica → colapso';
 if(s.mode==='blackhole')return 'Buraco Negro + Átomo → Acreção';
 if(s.mode==='fusion'){
   const target=phaseFusionRecipes(s).slice().reverse()[0]||phaseFusionRecipe(s),action=nextExecutableFusionToward(target,s);
   if(action?.kind==='fusion'&&action.recipe===FUSIONS.D&&protonAssistedDReady(s))return 'H + próton → ²H';
   if(action)return guidanceActionLine(action);
   const r=contextualObjectiveRecipe(s);if(r)return topFusionLabel(r);
 }
 return s.meta||'';
}
function updateHUD(){
 const s=phase();
 dom.singularity.classList.toggle('show',s.mode==='opening'&&!state.bigBangStarted);
 $('branchLabel').textContent='';$('phaseTitle').textContent=s.title;$('phaseMeta').textContent='';
 const p=currentProgress(),flowTarget=Math.max(0,s.flowTarget||0);
 $('stageProgress').style.width=p+'%';
 if(s.id==='brown')$('stageProgressText').textContent=`${state.created.He3||0}/${brownBurnLimit()}`;
 else if(s.mode==='convection')$('stageProgressText').textContent=`${state.convectionMoves||0}/${s.target}`;
 else if(s.mode==='whiteCompact'){const w=whiteCounts(s);$('stageProgressText').textContent=`C ${Math.min(w.c,w.targetC)}/${w.targetC} · O ${Math.min(w.o,w.targetO)}/${w.targetO}`}
 else {const shown=state.readyToAdvance?100:Math.min(99,Math.floor(p));$('stageProgressText').textContent=flowTarget?`${shown}%`:'';}
 $('stageProgressLabel').textContent=s.id==='brown'?(state.readyToAdvance?'RESERVATÓRIO ESGOTADO':'QUEIMA DE DEUTÉRIO'):s.mode==='convection'?(state.readyToAdvance?'CONCLUÍDA':'CONVECÇÃO'):(state.readyToAdvance?'CONCLUÍDA':'PROGRESSO');
 const progressEl=document.querySelector('.stage-progress');progressEl.classList.toggle('ready',state.readyToAdvance);progressEl.style.visibility=s.mode==='opening'?'hidden':'visible';
 $('phaseEndBtn').innerHTML=s.endLabel||'ESPALHAR<br>POEIRA ESTELAR';updateObjective();applyVisual();applyRewardProgressVisuals();renderInfoPanel()
}
function updateObjective(){
 const s=phase();
 if(s.mode==='reactionExplore'){const sp=atlasSpec(s),done=state.atlasProgress||0;if(sp?.category==='inaccessible')$('goalText').textContent=`Teste a aproximação ${s.target} vezes — ${done}/${s.target}`;else if(sp?.category==='fragment')$('goalText').textContent=`Observe ${s.target} fragmentações completas — ${done}/${s.target}`;else $('goalText').textContent=`Complete ${s.target} observações desta reação — ${done}/${s.target}`;setFormula(atlasNextRecipeLine(s));return}
 if(s.mode==='opening'){$('goalText').textContent='Inicie o Big Bang';setFormula(conciseRecipeLine(s));return}
 if(s.mode==='primordialNuclear'){const made=primordialGoalCount(s);$('goalText').textContent=`Forme ${s.target} ${s.target===1?'núcleo':'núcleos'} de ${E[s.new].name} — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='atomicRecombination'){const made=primordialGoalCount(s);$('goalText').textContent=`Forme ${s.target} ${s.target===1?'átomo':'átomos'} de ${E[s.new].name} — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.id==='coulomb_intro'){const made=state.created.He||0;$('goalText').textContent=`Crie ${s.target} núcleos estáveis de Hélio por Fusão — ${made}/${s.target}`;setFormula('Hélio-3 + Hélio-3 → Hélio-4 + 2 prótons');return}
 if(s.mode==='convection'){$('goalText').textContent=`Realize ${s.target} correntes convectivas — ${state.convectionMoves||0}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.id==='stellar_li'){const made=state.created.Li||0;$('goalText').textContent=`Produza ${s.target} núcleos de Lítio-7 pelo mecanismo Cameron–Fowler — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='protonCapture'){$('goalText').textContent=`Realize ${s.target} capturas de prótons — ${state.protonCaptures}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='rpProcess'){const made=state.created[s.new]||0,step=rpStep(s),suffix=step?.pattern==='waiting'?' · observe o waiting point':step?.pattern==='cycle'?' · observe o ciclo terminal':'';$('goalText').textContent=`Forme ${s.target} núcleos de ${E[s.new].name}${suffix} — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='spallation'){const made=state.created[s.new]||0;$('goalText').textContent=`Produza ${s.target} núcleos de ${E[s.new].name} — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='neutrino'){const made=state.created.F||0;$('goalText').textContent=`Produza ${s.target} núcleos de Flúor — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='gamma'){const made=state.created[s.new]||0;$('goalText').textContent=`Realize ${s.target} fotodesintegrações — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='guidedDecay'){const made=state.created[s.new]||0;$('goalText').textContent=`Crie ${s.target} ${s.target===1?'átomo':'átomos'} de ${E[s.new].name} por decaimento — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='decayGarden'){const found=decayDiscoveryCount(s);$('goalText').textContent=`Descubra ${s.target} descendentes — ${found}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='explosive'){const made=state.created.Zn||0;$('goalText').textContent=`Produza ${s.target} núcleos de Zinco — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='whiteCompact'){const info=whiteCounts(s);$('goalText').textContent=`Crie ${info.targetC} Carbonos e ${info.targetO} Oxigênios — C ${Math.min(info.c,info.targetC)}/${info.targetC} · O ${Math.min(info.o,info.targetO)}/${info.targetO}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='showcase'){$('goalText').textContent='Observe o remanescente';setFormula(conciseRecipeLine(s));return}
 if(s.mode==='neutronize'){$('goalText').textContent=`Comprima ${s.target} núcleos em nêutrons — ${state.crushed}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='remnant'){$('goalText').textContent=`Comprima ${s.target} núcleos — ${state.absorbed}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='pulsar'){$('goalText').textContent=`Incorpore ${s.target} núcleos — ${state.absorbed}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='accretion'){$('goalText').textContent=`Alimente o remanescente — ${state.absorbed}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='collapseFinal'){$('goalText').textContent='Supere o limite de estabilidade';setFormula(conciseRecipeLine(s));return}
 if(s.mode==='blackhole'){$('goalText').textContent=`Atraia ${s.target} átomos ao Buraco Negro — ${state.absorbed}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 const made=state.created[s.new]||0;
 if(s.uniqueMatterObjective){$('goalText').textContent=`Observe ${s.target} formações independentes de ${E[s.new].name} — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.id==='brown'){$('goalText').textContent=`Queime ${s.target} núcleos de Deutério — ${state.created.He3||0}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.id==='he_red'){$('goalText').textContent=`Crie ${s.target} núcleos estáveis de Hélio por Fusão — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.id==='he_orange'){$('goalText').textContent=`Crie ${s.target} núcleos de Hélio-3 por Fusão — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.id==='he_yellow'){$('goalText').textContent=`Crie ${s.target} núcleos estáveis de Hélio por Fusão — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));return}
 if(s.mode==='neutron'){const g=neutronGameplay(s),extras=[];if(g.requiresSource)extras.push(`fonte ${Math.min(1,state.neutronSourceActivations)}/1`);if(g.requiresBranch)extras.push(`ramificação ${Math.min(1,state.neutronBranchesObserved)}/1`);if(g.requiresFreezeout)extras.push(`freeze-out ${Math.min(1,state.neutronFreezeouts)}/1`);$('goalText').textContent=`Crie ${s.target} ${E[s.new].name} — ${made}/${s.target}${extras.length?' · '+extras.join(' · '):''}`;setFormula(conciseRecipeLine(s));return}
 $('goalText').textContent=s.mode==='fusion'?`Crie ${s.target} ${s.target===1?'átomo':'átomos'} de ${E[s.new].name} por Fusão — ${made}/${s.target}`:`Crie ${s.target} ${s.target===1?'átomo':'átomos'} de ${E[s.new].name} — ${made}/${s.target}`;setFormula(conciseRecipeLine(s));
}
function applyVisual(){const s=phase(),v=s.visual,root=document.documentElement,styles={nebula:['#fff3bc','#ffae5f','#4d2e82','rgba(255,126,72,.27)',.96],brownDwarf:['#ffe0a6','#9f532d','#351d31','rgba(169,86,47,.30)',.72],redDwarf:['#fff0ca','#ff7757','#6c2231','rgba(255,84,65,.38)',.84],orangeDwarf:['#fff6ce','#ffad56','#8c3e28','rgba(255,145,67,.42)',.91],yellowDwarf:['#fffbe0','#ffd66e','#a25228','rgba(255,199,81,.48)',1],whiteDwarf:['#ffffff','#dff2ff','#819bc2','rgba(210,237,255,.62)',.72],solar:['#fff9ce','#ffd06c','#9a4e28','rgba(255,192,83,.4)',1],redGiant:['#fff0b0','#ff7e48','#771d28','rgba(255,80,46,.48)',1.06],agb:['#ffe7a3','#f06d42','#6c2148','rgba(255,88,55,.42)',1.04],massive:['#eff8ff','#93c8ff','#3340a1','rgba(99,160,255,.48)',1.02],supergiant:['#fff','#b1d6ff','#4b4ac7','rgba(111,158,255,.58)',1.07],advanced:['#fffbd7','#ffb64f','#8d2843','rgba(255,132,67,.62)',1.08],ironCore:['#fff','#ff975a','#521722','rgba(255,72,47,.65)',1.08],kilonova:['#fff','#a6d8ff','#9e54d8','rgba(177,110,255,.6)',.96],interstellar:['#dfeaff','#6686c9','#18254d','rgba(85,129,215,.28)',.96],neutronStar:['#eaf9ff','#78baff','#1a2d80','rgba(104,178,255,.55)',.90],pulsar:['#fff','#89c9ff','#203ca3','rgba(128,199,255,.68)',.90],accretion:['#fff6cf','#ffb24e','#491d42','rgba(255,142,61,.58)',.92],xrayBurst:['#fffbe6','#8fd6ff','#44206d','rgba(132,206,255,.68)',.94],collapseFinal:['#fff','#ff8b62','#270b18','rgba(255,74,57,.66)',.88],blackHole:['#1b2543','#070914','#000','rgba(89,126,255,.20)',.90]};const a=styles[v]||styles.solar,prebang=s.mode==='opening'&&!state.bigBangColorized;document.body.classList.toggle('prebang',prebang);document.body.classList.toggle('bigbang-phase',s.mode==='opening');const spaceColors={bigBang:'#e10b17',primordialH:'#9f0814',primordialHe:'#4e0710',primordialLi:'#160307'};root.style.setProperty('--spaceBg',prebang?'#fff':(spaceColors[v]||'#000'));root.style.setProperty('--primordialGlow',prebang?'rgba(255,255,255,0)':v==='bigBang'?'rgba(255,210,130,.58)':v==='primordialH'?'rgba(255,80,40,.36)':v==='primordialHe'?'rgba(201,41,31,.28)':'rgba(112,24,29,.20)');dom.star.classList.toggle('primordial-mode',isPrimordial(s));dom.star.classList.toggle('spallation-mode',['spallation','neutrino','gamma'].includes(s.mode));dom.star.classList.toggle('decay-mode',s.mode==='guidedDecay');dom.star.classList.toggle('electron-network',s.mode==='guidedDecay'||s.mode==='whiteCompact');dom.star.classList.toggle('white-electron-network',s.mode==='whiteCompact');dom.star.classList.toggle('white-structure',s.mode==='whiteCompact');dom.star.classList.toggle('cumulative-shells',s.mode!=='fusion'&&s.mode!=='whiteCompact'&&fusionSandboxAllowed(s)&&stratificationStrength(s)>0);root.style.setProperty('--starA',a[0]);root.style.setProperty('--starB',a[1]);root.style.setProperty('--starC',a[2]);
  let glow=a[3];
  if(s.mode==='whiteCompact'){
    const ratio=Math.min(1,state.absorbed/Math.max(1,s.target||1));
    const alpha=(.62*(1-ratio*.78)).toFixed(3);
    glow=`rgba(210,237,255,${alpha})`;
  }
  root.style.setProperty('--starGlow',glow);root.style.setProperty('--starScale',1);const intensity=isPrimordial(s)?0:visualIntensity();root.style.setProperty('--activityGlow',(intensity/100*.34).toFixed(2));root.style.setProperty('--activityPulseTime',`${Math.max(.72,2.7-intensity*.018)}s`);const redIndex=phaseIndexById.get('he_red')??1,stellarEligible=!isPrimordial(s)&&!isPostMode(s)&&s.mode!=='rpProcess'&&v!=='brownDwarf'&&v!=='nebula',persistentLit=stellarEligible&&(state.phaseIndex>redIndex||state.ignited),active=phaseMilestoneReached(s);dom.star.classList.toggle('ignited',persistentLit);dom.star.classList.toggle('phase-active',active);dom.star.classList.toggle('neutron-active',active&&s.mode==='neutron');dom.star.classList.toggle('critical',v==='ironCore'||v==='kilonova'||v==='xrayBurst'||s.mode==='collapseFinal');dom.star.classList.toggle('remnant-mode',isPostMode(s)||s.mode==='rpProcess');dom.star.classList.toggle('blackhole-mode',s.mode==='blackhole');dom.star.classList.toggle('stability-mode',s.mode==='collapseFinal');dom.star.classList.toggle('post-active',isPostMode(s)&&active);renderRemnant()}
function renderRemnant(){
 const s=phase(),layer=dom.remnant;if(!layer)return;
 layer.className='remnant-layer';
 if(!isPostMode(s)&&s.mode!=='rpProcess'){layer.style.removeProperty('--beamPeriod');return}
 layer.classList.add('show');
 if(s.mode==='remnant')layer.classList.add('neutron-star');
 if(s.mode==='pulsar')layer.classList.add('pulsar');
 if(s.mode==='accretion'||s.mode==='rpProcess')layer.classList.add('accretion');
 if(s.mode==='collapseFinal')layer.classList.add('collapse-final');
 if(s.mode==='blackhole')layer.classList.add('black-hole');
 dom.remnantCore?.classList.toggle('blackhole-selected',s.mode==='blackhole'&&state.blackHoleSelected);
 if(s.mode==='blackhole')dom.remnantCore?.setAttribute('aria-label',state.blackHoleSelected?'Buraco Negro selecionado; escolha um átomo':'Selecionar Buraco Negro');
 const progress=Math.max(0,Math.min(1,state.absorbed/Math.max(1,s.target||1)));
 if(s.mode==='pulsar'){const period=2.45-(2.02*progress);layer.style.setProperty('--beamPeriod',`${period.toFixed(2)}s`)}
 else if(s.mode==='accretion'){layer.style.setProperty('--beamPeriod',`${Math.max(.34,.72-progress*.25).toFixed(2)}s`)}
 else layer.style.removeProperty('--beamPeriod');
}
function render(){drawLines();renderPieces();updateMoveTargets();renderPrimordialParticles();renderCosmicRays();updateHUD();renderNeutrons();renderConvectionControl();renderMenu()}
function handleFusionTap(p){
 const cell=p.cell;if(cell===null||cell===undefined)return false;
 if(state.selected.includes(cell)){state.selected=[];objectiveMotifCancelSelection();render();return true}
 if(!state.selected.length){
   const canStart=possibleRecipes([p.sym]).some(r=>!!connectedRecipeCluster(r,[cell]));
   if(!canStart&&!canSelectAtomForMovement(p))return false;
   state.selected=[cell];if(!objectiveMotifArmFirst(p))tone(canStart?320:300,.04);render();return true;
 }
 const test=[...selectedSyms(),p.sym],ex=exactRecipe(test);
 if(ex){state.selected.push(cell);render();objectiveMotifArmSecond(ex,[...state.selected]);setTimeout(()=>fuse(ex),95);return true}
 if(!state.selected.some(x=>neigh[x].includes(cell))){if(state.selected.length===1&&canSelectAtomForMovement(p)){state.selected=[cell];objectiveMotifCancelSelection();if(!objectiveMotifArmFirst(p))tone(300,.035);render();return true}return false}
 if(!possibleRecipes(test).length){if(state.selected.length===1&&canSelectAtomForMovement(p)){state.selected=[cell];objectiveMotifCancelSelection();if(!objectiveMotifArmFirst(p))tone(300,.035);render();return true}return false}
 state.selected.push(cell);render();return true;
}
function neutronSourceSelectedPiece(s=phase()){
 if(!state.selected.length)return null;const id=state.board[state.selected[0]],p=id?state.pieces.get(id):null;return p&&p.sym===neutronGameplay(s).source?p:null;
}
function handleNeutronSourceTap(p,s=phase()){
 const g=neutronGameplay(s);if(s.mode!=='neutron'||!g.source||!p)return false;
 const source=neutronSourceSelectedPiece(s);
 if(p.sym===g.source){state.selected=state.selected[0]===p.cell?[]:[p.cell];tone(430,.045,'sine',.025);render();return true}
 if(p.sym==='He'&&source){if(!(neigh[source.cell]||[]).includes(p.cell)){toast('Aproxime o Hélio da fonte de nêutrons.');return true}activateNeutronSource(source,p,s);return true}
 return false;
}
async function activateNeutronSource(source,helium,s=phase()){
 if(state.locked||!source||!helium)return;const g=neutronGameplay(s);state.locked=true;const at={x:source.x,y:source.y},sourceCell=source.cell,heCell=helium.cell;await teachProductOnce('neutronSource',at.x,at.y);const motif=await objectiveInteractionPrelude(`neutron-source:${s.id}:${g.source}`,[objectiveInteractionPieceToken(source),objectiveInteractionPieceToken(helium)],g.sourceProduct||'O',at);state.board[sourceCell]=null;state.board[heCell]=null;state.pieces.delete(source.id);state.pieces.delete(helium.id);renderPieces();const product=createPiece(g.sourceProduct||'O',sourceCell,false);product.x=at.x;product.y=at.y;state.neutronSourceActivations++;state.neutronPulsesObserved++;state.selected=[];recordFlow(1);if(motif)await objectiveInteractionRevealPiece(motif,product,at);else renderPieces();burst(at.x,at.y);captureTag(at.x,at.y,g.source==='C13'?'¹³C(α,n)':'²²Ne(α,n)');vibrate([8,14,8]);const count=Math.max(2,g.sourceBurst||4);for(let i=0;i<count;i++)spawnGeneratedNeutron(at.x+(Math.random()-.5)*18,at.y+(Math.random()-.5)*18);renderNeutrons();await wait(220);await afterNuclearAction({advanceRound:true});state.locked=false;ensureOpportunity();render();checkComplete();
}


function tapAtom(id){if(state.locked)return;const p=state.pieces.get(id);if(!p)return;focusPieceInfo(p);const s=phase();if(p.free&&cumulativeParticleInteractionAllowed(s))return tapFreeAtom(id);if(state.convectionArmed&&handleConvectionTap(p))return;if((p.sym==='Tc'||p.sym==='Pm')&&p.radioactiveReady)return tapRadioactiveProof(p);if(s.mode==='reactionExplore'){if(tapAtlasReaction(p))return;if(fusionSandboxAllowed(s)&&handleFusionTap(p))return;if(selectAtomForMovement(p))return;invalid(p.cell);return}
 const armedProton=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null;
 if(armedProton){const mixed=primordialMixedReaction(p.sym,armedProton.kind);if(mixed){state.selected=[p.cell];render();reactCumulativeBoardMixed(mixed,p,armedProton);return}}
 if(armedProton?.kind==='p'){
   const protonRecipe=stellarProtonRecipe(s),pid=armedProton.id;
   if(p.sym==='H'&&protonRecipe){state.selected=[p.cell];render();setTimeout(()=>fuseHydrogenWithProton(p.cell,pid,protonRecipe),70);return}
   if(protonCaptureAvailable(s)){state.selected=[p.cell];render();setTimeout(()=>attemptProtonCapture(p.cell,pid),70);return}
 }
 if(s.mode==='rpProcess'){
   if(rpStep(s)?.fuel==='H'&&p.sym==='H'){ionizeRpHydrogen(p);return}
   if(selectAtomForMovement(p))return;
   invalid(p.cell);return;
 }
 if(s.mode==='spallation'){if(state.selectedCosmic!==null)return tapParticleTarget(id);if(fusionSandboxAllowed(s)&&handleFusionTap(p))return;if(selectAtomForMovement(p))return;return tapParticleTarget(id)}
 if(['neutrino','gamma'].includes(s.mode)){
   // Com uma partícula energética armada, a mecânica principal tem prioridade.
   // Sem ela, receitas herdadas e reposicionamento continuam disponíveis.
   if(state.selectedCosmic!==null)return tapParticleTarget(id);
   if(fusionSandboxAllowed(s)&&handleFusionTap(p))return;
   if(selectAtomForMovement(p))return;
   return tapParticleTarget(id);
 }
 if(s.mode==='guidedDecay'||s.mode==='decayGarden'){if(fusionSandboxAllowed(s)&&handleFusionTap(p))return;if(selectAtomForMovement(p))return;return;}
 if(s.mode==='explosive'){
   if(fusionSandboxAllowed(s)&&handleFusionTap(p))return;
   return tapExplosiveTarget(id);
 }
 if(s.mode==='whiteCompact'){if(handleFusionTap(p))return;invalid(p.cell);return}if(isPrimordial(s)&&s.mode!=='opening')return tapFreeAtom(id);const cell=p.cell;if(s.mode==='collapseFinal'){if(fusionSandboxAllowed(s)&&handleFusionTap(p))return;toast('A matéria já está em órbita extrema. Segure o núcleo central.');return}if(s.mode==='blackhole'){if(state.selected.includes(cell)){state.selected=[];render();return}if(!state.blackHoleSelected){state.selected=[cell];tone(248,.05,'sine',.025);toast('Átomo selecionado · toque no Buraco Negro.');render();return}return completeBlackHoleAccretion(id)}if(isPostAtomMode(s)){if(state.postHoldLearned)return completePostAbsorb(id);toast('Segure o primeiro núcleo por 1 s; depois, use toques simples.');return}if(s.mode==='neutronize'){toast('Mantenha o átomo pressionado por 1 segundo.');return}
 if(s.id==='he_red'&&p.sym==='H'){
   state.selected=state.selected[0]===cell?[]:[cell];state.primordialSelected=null;tone(320,.04);render();return
 }
 if(s.id==='he_red'&&p.sym==='HeU')state.primordialSelected=null;
 if(s.mode==='neutron'){
   if(handleNeutronSourceTap(p,s))return;
   // Em estrelas AGB e no processo-s fraco, reações estelares já aprendidas continuam
   // disponíveis como ações opcionais, enquanto o objetivo principal segue a captura n.
   if(state.selectedNeutron!==null&&(neutronEligible(p,s)||universalNeutronCaptureEligible(p))){const nid=state.selectedNeutron;state.selected=[cell];render();captureNeutron(nid);return}
   if(neutronEligible(p,s)||universalNeutronCaptureEligible(p)){state.selected=state.selected[0]===cell?[]:[cell];tone(360,.04);render();return}
   if(state.selected.length){
     const firstId=state.board[state.selected[0]],first=firstId?state.pieces.get(firstId):null;
     if(neutronEligible(first,s))state.selected=[];
   }
   if(fusionSandboxAllowed(s)&&handleFusionTap(p))return;
   if(selectAtomForMovement(p))return;
   toast('Selecione um núcleo de uma rota de captura já desbloqueada, combine combustível conhecido ou mova um átomo para uma casa vizinha vazia.');render();return;
 }
 if(handleFusionTap(p))return;if(selectAtomForMovement(p))return;invalid(cell)
}
function beginCrushHold(id,el,ev){
  const s=phase(),p=state.pieces.get(id);
  const postHoldMode=isPostAtomMode(s)&&s.mode!=='blackhole';
  if((!['neutronize','neutron','guidedDecay','decayGarden'].includes(s.mode)&&!postHoldMode)||state.locked||state.phaseDone||!p)return;
  focusPieceInfo(p);ev?.stopPropagation?.();
  if(state.crushTimer)return;if(postHoldMode&&state.postHoldLearned)return;
  if(s.mode==='guidedDecay'&&!guidedTransitionFor(p,s))return;
  if(s.mode==='decayGarden'&&(!p.decayTrack||(p.decayIndex||0)>=p.decayTrack.length-1))return;
  if(s.id==='co'&&s.manualDecay&&!p.radioactiveReady)return;
  // Um núcleo escolhido como receptor fica protegido contra esmagamento acidental.
  if(s.mode==='neutron'&&!s.manualDecay&&state.selected.includes(p.cell)){toast(neutronEligible(p,s)?'Este núcleo está selecionado para capturar nêutrons.':'Este núcleo está selecionado para uma reação conhecida.');return}
  state.crushId=id;
  try{el.setPointerCapture?.(ev?.pointerId)}catch(e){}
  el.classList.add('crush-hold');
  tone(115,.12,'sine',.018);
  state.crushTimer=setTimeout(()=>s.mode==='decayGarden'?completeGardenDecayHold(id):s.mode==='guidedDecay'||(s.id==='co'&&p.radioactiveReady)?completeGuidedDecay(id):postHoldMode?completePostAbsorb(id):completeCrush(id),1000);
}
function cancelCrushHold(id){
  if(state.crushId!==id)return;
  if(state.crushTimer){clearTimeout(state.crushTimer);state.crushTimer=null}
  const el=dom.pieces.querySelector(`[data-id="${id}"]`);
  if(el)el.classList.remove('crush-hold');
  state.crushId=null;
}
function completeGardenDecayHold(id){
 state.crushTimer=null;state.crushId=null;const el=dom.pieces.querySelector(`[data-id="${id}"]`);if(el)el.classList.remove('crush-hold');state.suppressTapId=id;state.suppressTapUntil=performance.now()+800;return tapDecayNucleus(id)
}
const PRODUCT_LESSONS={
 helium:{title:'NÚCLEO DE HÉLIO LIBERADO',text:'Decaimentos alfa podem liberar um núcleo de Hélio-4, que permanece disponível para novas reações.'},
 proton:{title:'PRÓTON LIBERADO',text:'Algumas transformações devolvem prótons que podem participar de novas reações.'},
 electron:{title:'ELÉTRON LIBERADO (e⁻)',text:'No decaimento β−, um nêutron se transforma em próton e libera um elétron e um antineutrino eletrônico.'},
 positron:{title:'PÓSITRONS E NEUTRINOS',text:'Na interação fraca, um próton pode tornar-se nêutron enquanto pósitrons e neutrinos são emitidos; o pósitron pode se aniquilar com um elétron.'},
 neutrino:{title:'NEUTRINO (νₑ)',text:'Neutrinos têm carga elétrica nula e interagem muito fracamente com a matéria, escapando com facilidade do ambiente.'},
 antineutrino:{title:'ANTINEUTRINO (ν̄ₑ)',text:'O antineutrino eletrônico acompanha processos β− e escapa quase sem interagir com a matéria.'},
 gamma:{title:'FÓTON GAMA (γ)',text:'Raios gama são fótons emitidos por núcleos quando excesso de energia é liberado.'},
 hawking:{title:'RADIAÇÃO HAWKING',text:'O γ visto durante a acreção representa radiação produzida pela matéria aquecida antes do horizonte. A Radiação Hawking é um efeito quântico distinto, emitido pelo horizonte em intensidade extremamente pequena para buracos negros astrofísicos.'},
 coulomb:{title:'BARREIRA DE COULOMB',text:'Aproxime os átomos do núcleo estelar para diminuir a resistência.'},
 waitingPoint:{title:'PONTO DE ESPERA',text:'Alguns núcleos proton-rich desaceleram o rp-process. Continue fazendo ações nucleares: o núcleo pode sofrer β⁺ enquanto a rede procura outra rota.'},
 photodisintegration:{title:'FOTODESINTEGRAÇÃO (γ,p)',text:'Em radiação muito intensa, um fóton pode devolver o próton recém-capturado. A matéria permanece disponível para outra tentativa.'},
 rpCycle:{title:'CICLO Sn–Sb–Te',text:'Na região de Estanho, Antimônio e Telúrio, a rede pode fechar um ciclo. Esse comportamento representa o limite natural desta campanha do rp-process.'},
 chainNuclear:{title:'REAÇÃO EM CADEIA',text:'O produto de uma reação encontrou, no próprio tabuleiro, reagentes para uma continuação nuclear válida. Ao fechar este aviso, a próxima etapa acontecerá automaticamente.'},
 chainNeutron:{title:'CASCATA DE NÊUTRONS',text:'Um nêutron emitido encontrou outro núcleo compatível em sua trajetória. Cada nêutron é consumido por no máximo uma captura.'},
 chainR:{title:'TEMPESTADE-r',text:'Em um fluxo extremo de nêutrons, capturas sucessivas podem ocorrer antes que a rede tenha tempo de decair. A sequência automática continua curta e causal.'},
 chainProton:{title:'CADEIA DE PRÓTONS',text:'O produto recém-formado encontrou outro próton próximo e uma rota de captura válida. Waiting points e a Barreira de Coulomb ainda podem interromper a sequência.'},
 chainEnergetic:{title:'RECICLAGEM NUCLEAR',text:'Uma partícula ou produto liberado por um evento energético encontrou uma reação estelar já aprendida e pode alimentar outra transformação.'},
 neutronSource:{title:'FONTE DE NÊUTRONS',text:'Algumas reações liberam nêutrons que passam a alimentar o processo-s ou o processo-r. A animação a seguir mostra essa fonte entrando em atividade.'},
 branching:{title:'RAMIFICAÇÃO NUCLEAR',text:'Neste ponto, capturar outro nêutron compete com esperar o decaimento β−. Os dois caminhos representam destinos físicos diferentes para o mesmo núcleo instável.'},
 freezeout:{title:'FREEZE-OUT',text:'O fluxo rápido de nêutrons está terminando. Depois deste ponto, os decaimentos passam a dominar a evolução da rede nuclear.'},
 recycledMatter:{title:'MATÉRIA RECICLADA',text:'Esta mesma linhagem de matéria já produziu o intermediário observado. A reação continua válida, mas não conta novamente para o objetivo; incorpore matéria nova para registrar outra formação independente.'},
 stratification:{title:'CAMADAS ESTELARES',text:'Produtos mais pesados tendem a ocupar regiões internas, enquanto combustíveis mais leves dominam regiões externas.'},
 convection:{title:'CONVECÇÃO ESTELAR',text:'Uma reação nuclear aqueceu o interior. Fótons gama interagem repetidamente com o plasma, enquanto correntes convectivas transportam matéria e energia para outras regiões da estrela.'}
};
function positionEventTooltip(x,y){
 const tip=$('eventTooltip'),size=starSize(),w=Math.min(248,size*.72),margin=12,above=y>size*.46;
 const left=Math.max(w/2+margin,Math.min(size-w/2-margin,x)),top=above?Math.max(margin,y-18):Math.min(size-margin,y+18);
 const localX=Math.max(20,Math.min(w-20,x-(left-w/2)));
 tip.classList.toggle('above',above);tip.classList.toggle('below',!above);tip.style.left=left+'px';tip.style.top=top+'px';tip.style.setProperty('--arrow-x',localX+'px');
}
function closeEventTooltip(){
 if(!state.tooltipOpen)return;const tip=$('eventTooltip'),resolve=state.tooltipResolver,restore=!!state.tooltipRestoreLock;
 state.tooltipOpen=false;state.tooltipResolver=null;state.tooltipRestoreLock=false;tip.classList.remove('show');tip.setAttribute('aria-hidden','true');dom.star.classList.remove('event-paused');state.locked=restore;
 if((isPrimordial()&&phase().mode!=='opening')||protonCaptureAvailable(phase()))startPrimordialDrift();
 if(!state.phaseDone&&['neutron','neutronize'].includes(phase().mode))startNeutronSystem();
 if(!state.phaseDone&&phase().mode==='accretion')startAccretionFeed();
 if(!state.phaseDone&&['spallation','neutrino','gamma'].includes(phase().mode))startCosmicRaySystem();
 render();if(resolve)resolve(true);
}
function teachProductOnce(kind,x=starSize()/2,y=starSize()/2){
 if(state.productLessons.has(kind))return Promise.resolve(false);const data=PRODUCT_LESSONS[kind];if(!data)return Promise.resolve(false);
 state.productLessons.add(kind);save();state.tooltipOpen=true;state.tooltipRestoreLock=state.locked;state.locked=true;stopPrimordialDrift();stopNeutronSystem();stopCosmicRaySystem();stopAccretionFeed();
 $('eventTooltipTitle').textContent=data.title;$('eventTooltipText').textContent=data.text;positionEventTooltip(x,y);dom.star.classList.add('event-paused');const tip=$('eventTooltip');tip.classList.add('show');tip.setAttribute('aria-hidden','false');
 return new Promise(resolve=>{state.tooltipResolver=resolve})
}
function showCoulombTooltip(x=starSize()/2,y=starSize()/2){
 const data=PRODUCT_LESSONS.coulomb;if(!data||state.tooltipOpen)return Promise.resolve(false);
 state.productLessons.add('coulomb');save();state.tooltipOpen=true;state.tooltipRestoreLock=state.locked;state.locked=true;stopPrimordialDrift();stopNeutronSystem();stopCosmicRaySystem();stopAccretionFeed();
 $('eventTooltipTitle').textContent=data.title;$('eventTooltipText').textContent=data.text;positionEventTooltip(x,y);dom.star.classList.add('event-paused');const tip=$('eventTooltip');tip.classList.add('show');tip.setAttribute('aria-hidden','false');
 return new Promise(resolve=>{state.tooltipResolver=resolve})
}
function teachAtlasPhaseOnce(s=phase(),x=starSize()/2,y=starSize()/2){
 if(s.mode!=='reactionExplore'||state.atlasPhaseTooltipSeen)return Promise.resolve(false);const data=atlasTooltipData(s);
 state.atlasPhaseTooltipSeen=true;state.tooltipOpen=true;state.tooltipRestoreLock=state.locked;state.locked=true;stopPrimordialDrift();stopNeutronSystem();stopCosmicRaySystem();stopAccretionFeed();
 $('eventTooltipTitle').textContent=data.title;$('eventTooltipText').textContent=data.text;positionEventTooltip(x,y);dom.star.classList.add('event-paused');const tip=$('eventTooltip');tip.classList.add('show');tip.setAttribute('aria-hidden','false');
 return new Promise(resolve=>{state.tooltipResolver=resolve})
}
async function emitGamma(x,y,deferLesson=false){
 const first=!state.productLessons.has('gamma');if(first&&!deferLesson)await teachProductOnce('gamma',x,y);
 const d=document.createElement('div');d.className='gamma-emission';d.textContent='γ';d.addEventListener('click',ev=>{ev.stopPropagation();focusParticleInfo('gamma')});d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);
 const size=starSize(),c=size/2,dx=x-c,dy=y-c,base=Math.atan2(dy,dx),orbit=27,frames=[];for(let i=0;i<=16;i++){const a=(i/16)*Math.PI*4,ox=Math.cos(a)*orbit,oy=Math.sin(a)*orbit;frames.push({transform:`translate(calc(-50% + ${ox}px),calc(-50% + ${oy}px)) scale(${.9+.12*Math.sin(a)})`,opacity:1})}
 const exitA=base+(Math.random()-.5)*.7,dist=size*.78;frames.push({transform:`translate(calc(-50% + ${Math.cos(exitA)*dist}px),calc(-50% + ${Math.sin(exitA)*dist}px)) scale(.45)`,opacity:0});
 const anim=d.animate(frames,{duration:1450,easing:'cubic-bezier(.18,.72,.22,1)',fill:'forwards'});tone(980,.14,'sine',.035);await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;d.remove();resolve()};anim.onfinish=finish;setTimeout(finish,1600)});return first
}
function findFloatingElectron(){return[...state.primordialParticles.values()].find(p=>p.kind==='e'&&!p.reacting)||null}
async function emitGammaPair(x,y,deferLesson=false){
 const first=!state.productLessons.has('gamma');if(first&&!deferLesson)await teachProductOnce('gamma',x,y);const size=starSize(),a=Math.random()*Math.PI*2,dist=size*.82,els=[];
 for(const dir of [0,Math.PI]){const d=document.createElement('div');d.className='gamma-emission';d.textContent='γ';d.addEventListener('click',ev=>{ev.stopPropagation();focusParticleInfo('gamma')});d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);els.push(d);const ang=a+dir;requestAnimationFrame(()=>{d.style.transition='transform .72s cubic-bezier(.18,.72,.22,1),opacity .72s ease';d.style.transform=`translate(calc(-50% + ${Math.cos(ang)*dist}px),calc(-50% + ${Math.sin(ang)*dist}px)) scale(.42)`;d.style.opacity='0'})}
 tone(1040,.12,'sine',.035);await wait(760);els.forEach(d=>d.remove());return first
}
async function emitNeutrino(x,y,deferLesson=false,label='νₑ'){
 const first=!state.productLessons.has('neutrino');if(first&&!deferLesson)await teachProductOnce('neutrino',x,y);const d=document.createElement('div');d.className='neutron passive neutrino-emission';d.textContent=label;d.addEventListener('click',ev=>{ev.stopPropagation();focusParticleInfo('nu')});d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);const size=starSize(),a=Math.random()*Math.PI*2,dist=size*1.05;requestAnimationFrame(()=>{d.style.transition='transform .68s linear,opacity .68s linear';d.style.transform=`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(.72)`;d.style.opacity='0'});await wait(700);d.remove();return first
}
async function emitAntineutrino(x,y,deferLesson=false){
 const first=!state.productLessons.has('antineutrino');if(first&&!deferLesson)await teachProductOnce('antineutrino',x,y);const d=document.createElement('div');d.className='neutron passive neutrino-emission';d.textContent='ν̄ₑ';d.addEventListener('click',ev=>{ev.stopPropagation();focusParticleInfo('antinu')});d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);const size=starSize(),a=Math.random()*Math.PI*2,dist=size*1.05;requestAnimationFrame(()=>{d.style.transition='transform .68s linear,opacity .68s linear';d.style.transform=`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(.72)`;d.style.opacity='0'});await wait(700);d.remove();return first
}
async function emitPositron(x,y,deferLesson=false){
 const first=!state.productLessons.has('positron');if(first&&!deferLesson){await teachProductOnce('positron',x,y);state.productLessons.add('neutrino');save()}
 const pos=createPrimordialParticle('pos',x,y);pos.reacting=true;let electron=findFloatingElectron(),temporaryElectron=false;if(!electron){const ep=freePoint(30);electron=createPrimordialParticle('e',ep.x,ep.y);temporaryElectron=true}electron.reacting=true;renderPrimordialParticles();
 const mx=(pos.x+electron.x)/2,my=(pos.y+electron.y)/2;requestAnimationFrame(()=>{pos.x=mx;pos.y=my;electron.x=mx;electron.y=my;renderPrimordialParticles()});await wait(360);state.primordialParticles.delete(pos.id);state.primordialParticles.delete(electron.id);renderPrimordialParticles();burst(mx,my);const gammaFirst=!state.productLessons.has('gamma');if(gammaFirst)await teachProductOnce('gamma',mx,my);await emitGammaPair(mx,my,true);if(temporaryElectron)startPrimordialDrift();return{first,gammaFirst}
}
async function emitFreeReactionParticles(kinds,x,y){
 const list=kinds||[];if(!list.length)return;const firstP=list.includes('p')&&!state.productLessons.has('proton'),firstE=list.includes('e')&&!state.productLessons.has('electron');if(firstP)await teachProductOnce('proton',x,y);if(firstE)await teachProductOnce('electron',x,y);for(const kind of list)spawnFloatingParticle(kind,x,y);renderPrimordialParticles();await wait(430);
}
async function emitFreeReactionNuclei(kinds,x,y,originCell){
 for(const sym of kinds||[]){if(sym==='He'&&!state.productLessons.has('helium'))await teachProductOnce('helium',x,y);const active=activeSet(),candidates=[...(neigh[originCell]||[]),...activeCells()].filter((cell,i,a)=>active.has(cell)&&state.board[cell]===null&&a.indexOf(cell)===i);if(!candidates.length)continue;const cell=candidates[0],q=createPiece(sym,cell,false);q.x=x;q.y=y;q.newborn=true;renderPieces();requestAnimationFrame(()=>{const t=pos(coords[cell]);q.x=t.x;q.y=t.y;renderPieces()});setTimeout(()=>{const p=state.pieces.get(q.id);if(p){p.newborn=false;renderPieces()}},380);await wait(250)}
}
async function handleReactionEmissions(r,piece){
 if(!r||!piece)return;const emissions=r.emissions||[];
 if(emissions.includes('positron')&&emissions.includes('neutrino')){
   if(!state.productLessons.has('positron')){await teachProductOnce('positron',piece.x,piece.y);state.productLessons.add('neutrino');save()}
   await emitPositron(piece.x,piece.y,true);await emitNeutrino(piece.x,piece.y,true);
 }else{if(emissions.includes('positron'))await emitPositron(piece.x,piece.y);if(emissions.includes('neutrino'))await emitNeutrino(piece.x,piece.y)}
 if(emissions.includes('gamma'))await emitGamma(piece.x,piece.y);
 if(Array.isArray(r.freeParticles)&&r.freeParticles.length)await emitFreeReactionParticles(r.freeParticles,piece.x,piece.y);
 if(Array.isArray(r.freeNuclei)&&r.freeNuclei.length)await emitFreeReactionNuclei(r.freeNuclei,piece.x,piece.y,piece.cell);
}
async function emitBetaParticle(x,y,deferLesson=false){
 const first=!state.productLessons.has('electron');if(first&&!deferLesson)await teachProductOnce('electron',x,y);const d=document.createElement('div');d.className='primordial-particle electron decay-electron';d.textContent='−';d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);
 const a=Math.random()*Math.PI*2,dist=72+Math.random()*54,tx=x+Math.cos(a)*dist,ty=y+Math.sin(a)*dist;requestAnimationFrame(()=>{d.style.transition='transform .48s ease-out,opacity .48s ease';d.style.transform=`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(.72)`;d.style.opacity='.30'});await wait(430);d.remove();spawnFloatingParticle('e',Math.max(24,Math.min(starSize()-24,tx)),Math.max(24,Math.min(starSize()-24,ty)));renderPrimordialParticles();await wait(430);return first;
}
async function emitBetaMinusProducts(x,y){if(!state.productLessons.has('electron'))await teachProductOnce('electron',x,y);if(!state.productLessons.has('antineutrino'))await teachProductOnce('antineutrino',x,y);await Promise.all([emitBetaParticle(x,y,true),emitAntineutrino(x,y,true)])}
async function ejectAlphaHelium(p){
 const first=!state.productLessons.has('helium');if(first)await teachProductOnce('helium',p.x,p.y);
 const active=activeSet(),origin=p.cell;let cell=neigh[origin]?.find(n=>active.has(n)&&state.board[n]===null);
 if(cell===undefined)cell=activeCells().filter(i=>state.board[i]===null).sort((a,b)=>Math.abs(coords[a].ring-coords[origin].ring)-Math.abs(coords[b].ring-coords[origin].ring))[0];
 if(cell===undefined)return null;const he=createPiece('He',cell,false,{lineage:pieceMatterLineage(p)});he.x=p.x;he.y=p.y;he.newborn=true;requestAnimationFrame(()=>{const q=pos(coords[cell]);he.x=q.x;he.y=q.y;renderPieces()});setTimeout(()=>{const q=state.pieces.get(he.id);if(q){q.newborn=false;renderPieces()}},430);await wait(440);return he;
}
async function completeGuidedDecay(id){
 state.crushTimer=null;state.crushId=null;const s=phase(),p=state.pieces.get(id),el=dom.pieces.querySelector(`[data-id="${id}"]`);if(el)el.classList.remove('crush-hold');
 if(state.locked||state.phaseDone||!p)return;let tr=null;if(s.id==='co'&&p.sym==='FeU'&&p.radioactiveReady)tr={to:'Co',type:'beta'};else if(s.mode==='guidedDecay')tr=guidedTransitionFor(p,s);if(!tr)return;
 state.locked=true;state.suppressTapId=id;state.suppressTapUntil=performance.now()+800;const {x,y}=p;el?.classList.add('crush-impact');tone(tr.type==='beta'?700:500,.12,tr.type==='beta'?'triangle':'sine',.04);vibrate([12,16,12]);await wait(180);
 if(tr.type==='alpha')await ejectAlphaHelium(p);else await emitBetaMinusProducts(x,y);
 p.sym=tr.to;p.captures=0;p.radioactiveReady=false;p.newborn=true;focusPieceInfo(p);state.created[tr.to]=(state.created[tr.to]||0)+1;state.discovered.add(tr.to);const isGoal=tr.to===s.new;if(isGoal)recordFlow(1);burst(x,y);renderPieces();setTimeout(()=>{const q=state.pieces.get(id);if(q){q.newborn=false;renderPieces()}},360);tone(620+(E[tr.to]?.n||1)*2,.10,'triangle',.038);save();await wait(120);await afterNuclearAction();state.locked=false;ensureOpportunity();render();checkComplete();
}
async function completeCrush(id){
  state.crushTimer=null;state.crushId=null;
  const s=phase(),p=state.pieces.get(id);
  const el=dom.pieces.querySelector(`[data-id="${id}"]`);
  if(el)el.classList.remove('crush-hold');
  if(!['neutronize','neutron'].includes(s.mode)||state.locked||state.phaseDone||!p)return;
  const {x,y,cell}=p;
  state.suppressTapId=id;state.suppressTapUntil=performance.now()+800;
  if(el)el.classList.add('crush-impact','crush-consumed');
  captureTag(x,y,'GRAVIDADE');
  dom.star.classList.add('pulse');setTimeout(()=>dom.star.classList.remove('pulse'),420);
  tone(95,.20,'sawtooth',.045);vibrate([22,28,34]);
  await wait(210);
  if(state.board[cell]===id)state.board[cell]=null;
  state.pieces.delete(id);
  state.selected=state.selected.filter(c=>c!==cell);
  if(s.mode==='neutronize')state.crushed++;recordFlow(1);
  spawnGeneratedNeutron(x,y);
  if(s.mode==='neutronize')await emitNeutrino(x,y,false,'νₑ');
  if(s.mode==='neutronize'){
    const milestoneTriggered=triggerPhaseMilestone();
    if(!milestoneTriggered)announce('NÊUTRON LIBERADO',`${state.crushed}/${s.target} NÚCLEOS ESMAGADOS`,'O núcleo desapareceu e deixou um nêutron jogável.');
  }else{
    announce('NÊUTRON GERADO','NÚCLEO ESMAGADO',`Selecione ${E[s.seed].name} e toque no nêutron.`);
  }
  ensureOpportunity();save();render();checkComplete();
}

async function completePostAbsorb(id){
 state.crushTimer=null;state.crushId=null;
 const s=phase(),p=state.pieces.get(id),el=dom.pieces.querySelector(`[data-id="${id}"]`);
 if(el)el.classList.remove('crush-hold');
 if(!isPostAtomMode(s)||s.mode==='blackhole'||state.locked||state.phaseDone||!p)return;
 const {x,y,cell}=p,c=starSize()/2;
 state.suppressTapId=id;state.suppressTapUntil=performance.now()+800;
 if(el){el.style.transition='left .36s cubic-bezier(.2,.75,.25,1),top .36s cubic-bezier(.2,.75,.25,1),transform .36s ease,opacity .36s ease';el.style.left=c+'px';el.style.top=c+'px';el.style.transform='translate(-50%,-50%) scale(.08)';el.style.opacity='0'}
 captureTag(x,y,s.mode==='blackhole'?'HORIZONTE':'GRAVIDADE');
 tone(s.mode==='blackhole'?72:145,.20,s.mode==='blackhole'?'sine':'triangle',.04);vibrate([16,18,24]);
 await wait(330);
 if(state.board[cell]===id)state.board[cell]=null;state.pieces.delete(id);state.selected=[];state.absorbed++;state.postHoldLearned=true;recordFlow(1);
 const progress=Math.min(1,state.absorbed/Math.max(1,s.target));
 if(s.mode==='pulsar'){
   const period=2.45-(2.02*progress);
   announce('ROTAÇÃO ACELERADA',`${state.absorbed}/${s.target} NÚCLEOS`,`Período visual do feixe: ${period.toFixed(2).replace('.',',')} s`);
   tone(500+state.absorbed*38,.07,'sine',.035);
 }else if(s.mode==='remnant')announce('MATÉRIA INCORPORADA','ESTRELA DE NÊUTRONS',`${state.absorbed}/${s.target} núcleos comprimidos`);
 else if(s.mode==='accretion')announce('ACREÇÃO','MASSA INCORPORADA',`${state.absorbed}/${s.target} · nova matéria chega pela periferia`);
 else if(s.mode==='blackhole')announce('HORIZONTE DE EVENTOS','MATÉRIA CAPTURADA',`${state.pieces.size} unidades restantes`);
 const milestoneTriggered=triggerPhaseMilestone();
 save();render();checkComplete();if(s.mode==='accretion'&&!state.phaseDone)setTimeout(spawnAccretionMatter,180);
}

function emitHawkingQuantum(x,y){
 const d=document.createElement('div');d.className='hawking-quantum';d.textContent='hν';d.style.left=x+'px';d.style.top=y+'px';dom.fx.appendChild(d);const a=Math.random()*Math.PI*2,dist=starSize()*.34,anim=d.animate([{transform:'translate(-50%,-50%) scale(.45)',opacity:0},{offset:.18,transform:'translate(-50%,-50%) scale(1)',opacity:.88},{transform:`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(.55)`,opacity:0}],{duration:1050,easing:'cubic-bezier(.18,.72,.22,1)',fill:'forwards'});setTimeout(()=>d.remove(),1150);return anim
}
function blackHoleSpiral(el,x,y,c){
 if(!el?.animate)return Promise.resolve();const dx=x-c,dy=y-c,startR=Math.max(18,Math.hypot(dx,dy)),base=Math.atan2(dy,dx),frames=[];
 for(let i=0;i<=10;i++){const t=i/10,a=base+t*Math.PI*3.2,r=startR*Math.pow(1-t,1.18),px=c+Math.cos(a)*r,py=c+Math.sin(a)*r;frames.push({left:`${px}px`,top:`${py}px`,transform:`translate(-50%,-50%) scale(${Math.max(.06,1-t*.94)})`,opacity:Math.max(.04,1-t*.82),filter:`brightness(${1+t*.7})`})}
 const anim=el.animate(frames,{duration:920,easing:'cubic-bezier(.12,.72,.18,1)',fill:'forwards'});return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;resolve()};anim.onfinish=finish;setTimeout(finish,1040)})
}
function selectBlackHoleCore(){
 const s=phase();if(s.mode!=='blackhole'||state.locked||state.phaseDone)return;state.blackHoleSelected=!state.blackHoleSelected;tone(state.blackHoleSelected?118:92,.08,'sine',.025);vibrate(7);
 if(state.blackHoleSelected&&state.selected.length){const cell=state.selected[0],id=state.board[cell];if(id&&state.pieces.has(id)){state.selected=[];render();setTimeout(()=>completeBlackHoleAccretion(id),60);return}}
 toast(state.blackHoleSelected?'Buraco Negro selecionado · escolha um átomo.':'Seleção do Buraco Negro liberada.');render()
}
async function completeBlackHoleAccretion(id){
 const s=phase(),p=state.pieces.get(id),el=dom.pieces.querySelector(`[data-id="${id}"]`);if(s.mode!=='blackhole'||state.locked||state.phaseDone||!p)return;
 state.locked=true;state.blackHoleSelected=false;state.selected=[];const {x,y,cell}=p,c=starSize()/2;el?.classList.add('blackhole-accreting');captureTag(x,y,'ACREÇÃO');tone(146,.09,'sine',.026);setTimeout(()=>tone(196,.09,'sine',.025),150);setTimeout(()=>tone(247,.10,'triangle',.024),300);setTimeout(()=>tone(330,.12,'triangle',.022),455);vibrate([8,12,10]);
 const gammaPromise=(async()=>{await wait(430);return emitGamma(c,c,true)})();await blackHoleSpiral(el,x,y,c);
 if(cell!==null&&cell!==undefined&&state.board[cell]===id)state.board[cell]=null;state.pieces.delete(id);state.absorbed++;recordFlow(1);burst(c,c);captureTag(c,c,'HORIZONTE');announce('ACREÇÃO','MATÉRIA CAPTURADA',`${state.absorbed}/${s.target} átomos atraídos`);save();render();await gammaPromise;
 const firstHawking=!state.rewardDiscoveries.has('phenomenon:hawkingRadiation');if(firstHawking){registerRewardDiscovery('phenomenon:hawkingRadiation',{title:'RADIAÇÃO HAWKING',text:'Efeito quântico extremamente tênue associado ao horizonte de eventos.',silent:true});emitHawkingQuantum(c,c);await wait(220);await teachProductOnce('hawking',c,c)}
 state.locked=false;render();checkComplete()
}

function beginCoreHold(ev){
 const s=phase();if(s.mode==='blackhole'){ev.preventDefault?.();ev.stopPropagation?.();selectBlackHoleCore();return}if(s.mode!=='collapseFinal'||state.locked||state.phaseDone||state.coreHoldTimer)return;
 ev.preventDefault?.();ev.stopPropagation?.();
 try{dom.remnantCore.setPointerCapture?.(ev.pointerId)}catch(e){}
 dom.remnantCore.classList.add('core-hold');dom.star.classList.add('core-collapsing');tone(82,.34,'sawtooth',.032);vibrate([18,28,18]);
 state.coreHoldTimer=setTimeout(async()=>{state.coreHoldTimer=null;state.absorbed=1;recordFlow(1);tone(54,.55,'sine',.065);vibrate([28,30,55,35,70]);announce('LIMITE SUPERADO','COLAPSO GRAVITACIONAL','Órbitas aceleram enquanto o remanescente perde a sustentação.');save();render();checkComplete()},2000);
}
function cancelCoreHold(){if(!state.coreHoldTimer)return;clearTimeout(state.coreHoldTimer);state.coreHoldTimer=null;dom.remnantCore.classList.remove('core-hold');dom.star.classList.remove('core-collapsing')}

function invalid(cell){const id=state.board[cell],el=id?dom.pieces.querySelector(`[data-id="${id}"]`):null;if(el){el.classList.add('invalid');setTimeout(()=>el.classList.remove('invalid'),250)}tone(170,.07,'sawtooth');vibrate(10);state.selected=[];objectiveMotifCancelSelection();render()}
function be7InCoolLayer(piece,s=phase()){if(!piece||piece.cell===null||piece.cell===undefined)return false;const r=phaseRadius(s);return coords[piece.cell].ring>=Math.max(2,Math.ceil(r*.65))}
async function decayBe7(piece){
 if(!piece||!state.pieces.has(piece.id)||piece.sym!=='Be7')return;
 if(!be7InCoolLayer(piece)){piece.unstableBornRound=state.nuclearRound;piece.unstableRounds=1;captureTag(piece.x,piece.y,'TRANSPORTE PARA FORA');renderPieces();return}
 const at={x:piece.x,y:piece.y};piece.sym='Li';piece.massNumber=7;clearPieceInstability(piece);piece.newborn=true;focusPieceInfo(piece);state.created.Li=(state.created.Li||0)+1;state.discovered.add('Li');
 if(phase().id==='stellar_li')recordFlow(3);else recordFlow(1);burst(at.x,at.y);captureTag(at.x,at.y,'e⁻ → νₑ');tone(520,.11,'triangle',.035);vibrate([8,12,8]);renderPieces();await emitNeutrino(at.x,at.y,true);triggerPhaseMilestone();setTimeout(()=>{const q=state.pieces.get(piece.id);if(q){q.newborn=false;renderPieces()}},320);save();
}
async function decayBe8(piece){
 if(!piece||!state.pieces.has(piece.id)||piece.sym!=='Be8')return;
 const firstLesson=!state.productLessons.has('helium'),origin=piece.cell,at={x:piece.x,y:piece.y},lineage=pieceMatterLineage(piece);if(firstLesson)await teachProductOnce('helium',at.x,at.y);state.board[origin]=null;state.pieces.delete(piece.id);
 const first=createPiece('He',origin,false,{lineage});first.x=at.x;first.y=at.y;
 const active=activeSet();let secondCell=neigh[origin].find(n=>active.has(n)&&state.board[n]===null);
 if(secondCell===undefined){secondCell=activeCells().filter(i=>state.board[i]===null).sort((a,b)=>Math.abs(coords[a].ring-coords[origin].ring)-Math.abs(coords[b].ring-coords[origin].ring))[0]}
 if(secondCell!==undefined){const second=createPiece('He',secondCell,false,{lineage});second.x=at.x;second.y=at.y;requestAnimationFrame(()=>{const q=pos(coords[secondCell]);second.x=q.x;second.y=q.y;renderPieces()})}
 burst(at.x,at.y);tone(230,.11,'triangle',.04);vibrate([10,18,10]);announce('NÚCLEO INSTÁVEL','BERÍLIO-8 SE DESFEZ','⁸Be → Hélio + Hélio');renderPieces();await wait(430);
}
async function decayHeU(piece){
 if(!piece||!state.pieces.has(piece.id))return;const firstLesson=!state.productLessons.has('proton'),origin=piece.cell,at={x:piece.x,y:piece.y};if(firstLesson)await teachProductOnce('proton',at.x,at.y);state.board[origin]=null;state.pieces.delete(piece.id);
 const first=createPiece('H',origin,false);first.x=at.x;first.y=at.y;spawnFloatingParticle('p',at.x,at.y);
 burst(at.x,at.y);tone(255,.10,'triangle',.04);vibrate([10,14,10]);announce('NÚCLEO INSTÁVEL','HÉLIO SE DESFEZ','He instável → H + próton');render();await wait(430);
}
async function decayReturnProton(piece){
 if(!piece||!state.pieces.has(piece.id))return;const at={x:piece.x,y:piece.y},to=piece.unstableTo,toMass=piece.unstableToMass;if(!state.productLessons.has('proton'))await teachProductOnce('proton',at.x,at.y);piece.sym=to;piece.massNumber=toMass;clearPieceInstability(piece);burst(at.x,at.y);spawnFloatingParticle('p',at.x+18,at.y-8);tone(235,.09,'sine',.025);vibrate([7,14,7]);renderPieces();renderPrimordialParticles();
}
async function decayBetaPlusPiece(piece){
 if(!piece||!state.pieces.has(piece.id))return;const at={x:piece.x,y:piece.y},to=piece.unstableTo,toMass=piece.unstableToMass;if(!state.productLessons.has('positron')){await teachProductOnce('positron',at.x,at.y);state.productLessons.add('neutrino');save()}piece.sym=to;piece.massNumber=toMass;clearPieceInstability(piece);if(phase().mode==='rpProcess'){recordFlow(1);if(rpStep()?.pattern==='waiting')state.rpWaitDecays++}burst(at.x,at.y);tone(430,.10,'triangle',.03);renderPieces();await emitPositron(at.x,at.y,true);await emitNeutrino(at.x,at.y,true);render();
}
async function decayRpCycle(piece){
 if(!piece||!state.pieces.has(piece.id))return;const at={x:piece.x,y:piece.y},to=piece.unstableTo||'Sn';await teachProductOnce('rpCycle',at.x,at.y);await ejectAlphaHelium(piece);piece.sym=to;piece.massNumber=null;clearPieceInstability(piece);state.rpCyclesObserved++;recordFlow(2);burst(at.x,at.y);captureTag(at.x,at.y,'Sn–Sb–Te');tone(390,.12,'triangle',.035);renderPieces();
}
async function resolveUnstablePiece(piece){
 if(!piece||!state.pieces.has(piece.id))return;const mode=piece.unstableMode;if(mode==='atlasFragment')return resolveAtlasFragment(piece);if(mode==='be7'||piece.sym==='Be7')return decayBe7(piece);if(mode==='be8'||piece.sym==='Be8')return decayBe8(piece);if(mode==='heU'||piece.sym==='HeU')return decayHeU(piece);if(mode==='returnProton')return decayReturnProton(piece);if(mode==='betaPlus')return decayBetaPlusPiece(piece);if(mode==='rpCycle')return decayRpCycle(piece);clearPieceInstability(piece);renderPieces();
}
async function advanceNuclearRound(){
 state.nuclearRound++;
 const expired=[...state.pieces.values()].filter(p=>pieceIsUnstable(p)&&state.nuclearRound-(p.unstableBornRound??state.nuclearRound)>=(p.unstableRounds??2));
  for(const p of expired)await resolveUnstablePiece(p);
  await resolvePendingNeutronBetas();
  const freeExpired=primordialNeutronsStable()?[]:[...state.primordialParticles.values()].filter(p=>p.kind==='n'&&p.unstable&&state.nuclearRound-(p.bornRound??state.nuclearRound)>(p.lifetimeRounds??3));if(freeExpired.length)await Promise.all(freeExpired.map(n=>decayFloatingNeutron(n)));
}
async function fusionBarrierPasses(r,cells,ids,target){
 const s=phase();if(!coulombMechanicUnlocked(s))return true;
 const blocked=[...cells].filter(c=>{const id=state.board[c],p=id?state.pieces.get(id):null;return !!p&&coulombCellBlocked(c,s,p.sym)}).sort((a,b)=>(coords[b]?.ring??0)-(coords[a]?.ring??0));
 if(!blocked.length)return true;
 const blockedCell=blocked[0],blockedId=state.board[blockedCell],blockedPiece=blockedId?state.pieces.get(blockedId):null;
 if(!blockedPiece||!coulombRollBlocks(blockedCell,s,blockedPiece.sym))return true;
 const t={x:blockedPiece.x,y:blockedPiece.y};
 await showCoulombTooltip(t.x,t.y);showCoulombBarrier(blockedPiece);state.coulombRepulsions++;captureTag(t.x,t.y,'barreira de Coulomb');tone(165,.10,'sawtooth',.028);vibrate(7);await wait(300);state.selected=[blockedCell];objectiveMotifBarrierBlocked(blockedPiece,r);render();return false;
}
async function fuse(r){if(state.locked)return;state.locked=true;state.fusionInProgress=true;try{const cells=[...state.selected],target=[...cells].sort((a,b)=>coords[a].ring-coords[b].ring)[0],ids=cells.map(c=>state.board[c]),t=pos(coords[target]),preparedChain=preparedContinuationForFusion(r,cells,target),inputPieces=ids.map(id=>state.pieces.get(id)).filter(Boolean),productLineage=mergeMatterLineages(inputPieces),uniqueGoal=r.out===phase().new&&!!phase().uniqueMatterObjective,objectiveLineageFresh=!uniqueGoal||objectiveLineageIsFresh(phase(),productLineage),motifEligible=objectiveMotifReactionEligible(r,inputPieces,phase())&&objectiveMotifSelectionReady(r,cells);if(!(await fusionBarrierPasses(r,cells,ids,target)))return;if(uniqueGoal&&!objectiveLineageFresh)await teachProductOnce('recycledMatter',t.x,t.y);const motifCtx=motifEligible?await objectiveMotifPrepare(r,inputPieces,t):null;ids.forEach(id=>{const p=state.pieces.get(id);if(p){p.x=t.x;p.y=t.y}});dom.star.classList.add('pulse');renderPieces();await wait(140);if(motifCtx)await objectiveMotifConverge(motifCtx);cells.forEach(c=>state.board[c]=null);ids.forEach(id=>state.pieces.delete(id));const np=createPiece(r.out,target,false,{lineage:productLineage});np.x=t.x;np.y=t.y;focusPieceInfo(np);if(pieceIsUnstable(np))np.unstableBornRound=state.nuclearRound+1;const objectiveLineageCredited=!uniqueGoal||creditObjectiveLineage(phase(),productLineage);if(!uniqueGoal||objectiveLineageCredited)state.created[r.out]=(state.created[r.out]||0)+1;state.discovered.add(r.out);grantConvectionFromCells(cells,phase());if(uniqueGoal&&!objectiveLineageCredited)captureTag(t.x,t.y,'MATÉRIA RECICLADA · sem novo crédito');if(!phase().objectiveOnlyProgress||r.out===phase().new)recordFlow(r.out===phase().new&&objectiveLineageCredited?3:1,{kind:'nuclear',x:t.x,y:t.y,label:motifCtx?null:(r.out===phase().new&&objectiveLineageCredited?E[r.out].name:null)});state.selected=[];if(motifCtx){renderPieces();const motifGridProduct=dom.pieces.querySelector(`[data-id="${np.id}"]`);if(motifGridProduct)motifGridProduct.classList.add('motif-grid-product');await objectiveMotifReveal(motifCtx,np,t)}burst(t.x,t.y);await handleReactionEmissions(r,np);const milestoneTriggered=triggerPhaseMilestone();if(!motifCtx)tone(350+Math.max(1,E[r.out].n)*8,.09,'triangle',.042);if(!milestoneTriggered){let unstableHint='';if(r.out==='HeU')unstableHint=phase().id==='he_red'?'Crie outro He instável antes de 4 rodadas e una os dois para formar He estável.':'Ele treme e se desfaz após 4 rodadas.';else if(r.out==='Be7')unstableHint='Transporte o Berílio-7 para uma camada externa; ali a captura eletrônica formará Lítio-7.';else if(E[r.out]?.unstable)unstableHint=recipeIsActive(FUSIONS.C)?'Use-o na próxima ação nuclear para formar Carbono.':'Outra ação nuclear fará este núcleo se desfazer.';announce(E[r.out]?.unstable?'NÚCLEO INSTÁVEL':'NOVO ELEMENTO',E[r.out].name.toUpperCase(),unstableHint)};render();await wait(90);const protectedIds=phase().id==='coulomb_intro'?[...state.pieces.values()].filter(q=>q.sym==='He3').map(q=>q.id):[];await afterNuclearAction({advanceRound:true,forceBoardPulse:true,protectedPieceIds:protectedIds});const chainCtx=state.chainAutoContext,chainRoot=chainCtx?.rootId||startChainEvent('nuclear',np.x,np.y),chainDepth=chainCtx?.depth||1;if(preparedChain&&!chainCtx){state.preparedChainRoots=state.preparedChainRoots||{};state.preparedChainRoots[chainRoot]=true}scheduleAutoFusionCascade(np.id,chainRoot,chainDepth,'nuclear')}catch(err){console.error(err)}finally{if(state.objectiveMotifActive)objectiveMotifReset();state.fusionInProgress=false;state.locked=false;dom.star.classList.remove('pulse');ensureOpportunity();render()}checkComplete()}
function burst(x,y){const b=document.createElement('div');b.className='burst';b.style.left=x+'px';b.style.top=y+'px';b.innerHTML='<i class="wave"></i>';dom.fx.appendChild(b);setTimeout(()=>b.remove(),650)}
function stratificationStrength(s=phase()){
 if(isPrimordial(s))return 0;
 const byVisual={brownDwarf:.10,redDwarf:.10,orangeDwarf:.20,yellowDwarf:.35,redGiant:.65,whiteDwarf:.96,massive:.80,supergiant:1,ironCore:1,agb:.72,advanced:.72};
 return byVisual[s.visual]||0
}
function stellarStratificationActive(s=phase()){return stratificationStrength(s)>0}
async function afterNuclearAction({advanceRound=false,forceBoardPulse=false,replenish=true,protectedPieceIds=[]}={}){
 // Toda transformação nuclear pode reorganizar a estrela; a estratificação depende
 // do ambiente físico, não do botão/mecânica usada para produzir a transformação.
 // Em um movimento manual, a peça recém-movida pode ser protegida daquele pulso
 // específico para que a resposta da estrela não desfaça imediatamente a escolha do jogador.
 if(advanceRound)await advanceNuclearRound();
 if(forceBoardPulse||stellarStratificationActive(phase()))await gravityPulse({replenish,protectedPieceIds});
}
function stellarLayerGroup(sym){
 // Grupos de queima/estrutura estelar. Não são uma ordenação simples por massa.
 if(['H','D','T','Plus'].includes(sym))return 0;
 if(['He','He3','HeU','Be7','Be8'].includes(sym))return 1;
 if(['Be','B','C','C13','N','O','F'].includes(sym))return 2;
 if(['Ne','Ne22','Na','Mg','Al'].includes(sym))return 3;
 if(['Si','P','S','Cl','Ar','K','Ca'].includes(sym))return 4;
 if(['Sc','Ti','V','Cr','Mn','Fe','Co','Ni','FeU'].includes(sym))return 5;
 return 6; // pós-Fe: produtos de captura/explosão, não uma nova "casca central" automática.
}
function phaseCoreCeiling(s=phase()){
 if(isPrimordial(s))return 0;
 const visual=s.visual||'',targetGroup=stellarLayerGroup(s.new);
 if(['brownDwarf','redDwarf','orangeDwarf','yellowDwarf'].includes(visual))return 1;
 if(visual==='redGiant')return Math.min(2,Math.max(1,targetGroup));
 if(visual==='agb')return 2; // AGB: núcleo C/O; produtos-s pertencem às regiões de captura, não substituem o núcleo.
 if(visual==='massive'){
   if(s.weakS)return 5; // o processo-s fraco ocorre numa estrela que já possui sementes do grupo do Ferro.
   return Math.min(3,Math.max(1,targetGroup));
 }
 if(['supergiant','advanced'].includes(visual))return Math.min(5,Math.max(2,targetGroup));
 if(visual==='ironCore')return 5;
 return Math.min(5,Math.max(1,targetGroup));
}
function stellarCompositionByGroup(){
 const counts=[0,0,0,0,0,0,0];let total=0;
 state.pieces.forEach(p=>{if(p.free||p.cell===null)return;const g=stellarLayerGroup(p.sym);counts[g]++;total++});
 return{counts,total};
}
function corePresenceThreshold(group,total,s=phase()){
 if(group<=1)return 1;
 // Fe/Ni histórico já é suficiente para ancorar visualmente um núcleo em fases do grupo do Ferro/processo-s fraco.
 if(group===5&&(s.visual==='ironCore'||s.weakS))return 1;
 return Math.max(2,Math.ceil(total*.035));
}
function dynamicCoreGroup(s=phase()){
 const ceiling=phaseCoreCeiling(s),{counts,total}=stellarCompositionByGroup();
 let candidate=0;
 for(let g=1;g<=ceiling;g++)if(counts[g]>=corePresenceThreshold(g,total,s))candidate=g;
 let current=state.stratificationCoreGroup;
 if(current===null||current===undefined||current>ceiling)current=candidate;
 // Grupos mais pesados assumem o centro assim que se tornam relevantes.
 if(candidate>current)current=candidate;
 // Histerese: uma camada central já estabelecida só recua quando seu grupo desaparece de fato.
 else if(candidate<current&&!(counts[current]>0))current=candidate;
 state.stratificationCoreGroup=current;
 return current;
}
function preferredRing(sym,s=phase()){
 const max=phaseRadius(),group=stellarLayerGroup(sym),core=dynamicCoreGroup(s),visual=s.visual||'',ceiling=phaseCoreCeiling(s);
 if(max<=0)return 0;
 if(s.mode==='whiteCompact'){
   // A fase usa uma seção transversal deliberada: C/O acumulam no núcleo (0–1),
   // o anel 2 fica rarefeito e H/He/Be8 permanecem na periferia para alimentar as reações.
   if(['C','O'].includes(sym))return .55;
   if(['H','D','Plus','He','He3','HeU','Be7','Be8'].includes(sym))return max;
   return Math.min(1,max);
 }
 // H permanece o envelope de referência. Em estrelas jovens a força baixa mantém bastante mistura.
 if(group===0)return max;
 // Elementos pós-Fe não tomam automaticamente o lugar de Fe/Ni no centro.
 if(group===6){
   if(visual==='agb')return Math.max(1,max-2);     // produtos-s em regiões interiores, mas fora do núcleo C/O.
   if(core>=5)return Math.min(max,1.15);           // próximos ao núcleo do grupo do Ferro, sem substituí-lo.
   return Math.max(1,Math.min(max,max-2.35));
 }
 // Um produto novo e mais pesado começa em região interna, mas só conquista o centro após ficar abundante.
 if(group>core){
   if(group<=ceiling)return Math.min(max,.65);
   return visual==='agb'?Math.max(1,max-2):Math.min(max,1.35);
 }
 // O grupo mais pesado atualmente relevante ocupa a região mais interna; grupos anteriores recuam em sequência.
 const delta=Math.max(0,core-group);let ideal;
 if(delta===0)ideal=.22;
 else if(delta===1)ideal=1.25;
 else if(delta===2)ideal=2.15;
 else if(delta===3)ideal=2.95;
 else ideal=3.45;
 // Se ainda não há produto mais pesado relevante, He é naturalmente o material central disponível.
 if(core<=1&&group===1)ideal=.28;
 return Math.max(0,Math.min(max,ideal))
}
function stratifiedMoveTarget(p,active,s,movedIds){
 if(!p||p.free||p.cell===null||movedIds.has(p.id)||p.compacted)return null;
 const strength=stratificationStrength(s);if(strength<=0)return null;
 const fromRing=coords[p.cell].ring,ideal=preferredRing(p.sym,s),before=Math.abs(fromRing-ideal);
 if(before<.26)return null;
 const options=neigh[p.cell].filter(n=>active.has(n)&&state.board[n]===null).map(n=>({cell:n,dist:Math.abs(coords[n].ring-ideal)})).filter(x=>x.dist+1e-6<before);
 if(!options.length)return null;
 options.sort((a,b)=>a.dist-b.dist||Math.random()-.5);
 const improvement=before-options[0].dist,chance=Math.min(.92,strength*(.48+.18*improvement));
 if(Math.random()>chance)return null;
 const near=options.filter(x=>x.dist<=options[0].dist+.05);return near[Math.floor(Math.random()*near.length)].cell
}
async function gravityPulse({replenish=true,protectedPieceIds=[]}={}){
 const s=phase(),active=activeSet(),strength=stratificationStrength(s),protectedIds=new Set(protectedPieceIds||[]),movedIds=new Set(protectedIds);let stratifiedMoved=false;
 for(let pass=0;pass<7;pass++){
   let moved=false;const list=[...state.pieces.values()].filter(p=>p.cell!==null&&!p.free&&!protectedIds.has(p.id)).sort((a,b)=>coords[b.cell].ring-coords[a.cell].ring||(E[b.sym]?.n||0)-(E[a.sym]?.n||0));
   for(const p of list){
     let t=null;
     if(strength>0)t=stratifiedMoveTarget(p,active,s,movedIds);
     else{
       const inward=neigh[p.cell].filter(n=>active.has(n)&&coords[n].ring<coords[p.cell].ring&&state.board[n]===null);
       if(inward.length){inward.sort((a,b)=>coords[a].ring-coords[b].ring);t=inward[0]}
     }
     if(t!==null&&t!==undefined){state.board[p.cell]=null;state.board[t]=p.id;p.cell=t;const q=pos(coords[t]);p.x=q.x;p.y=q.y;moved=true;if(strength>0){movedIds.add(p.id);stratifiedMoved=true}}
   }
   renderPieces();if(!moved||strength>0)break;await wait(s.gravityDelay||90)
 }
 if(strength>0&&stratifiedMoved)await wait(Math.max(70,(s.gravityDelay||90)*.8));
 if(replenish){
   let empties=activeCells().filter(i=>state.board[i]===null).sort((a,b)=>coords[b].ring-coords[a].ring);
   if(s.mode==='whiteCompact')empties=empties.filter(i=>coords[i].ring===phaseRadius(s));
   const wanted=Math.max(0,Math.min(desiredFill()-state.pieces.size,empties.length));
   for(let i=0;i<wanted;i++)createPiece(replenishmentSymbol(),empties[i],true);renderPieces();await wait(45);
 }
 state.pieces.forEach(p=>{if(!p.free&&p.cell!==null){const q=pos(coords[p.cell]);p.x=q.x;p.y=q.y}});renderPieces();await wait(replenish?250:150);
 if(strength>=.65&&stratifiedMoved&&!state.productLessons.has('stratification'))await teachProductOnce('stratification',starSize()/2,starSize()/2);
 if(s.id==='brown'&&!state.phaseDone&&!brownCanBurnDeuterium())finishBrownStalled()
}
function brownCanBurnDeuterium(){
  const s=phase();if(s.id!=='brown')return true;if(brownAtLimit())return false;const c=boardSymbolCounts();return(c.D||0)>0&&(c.H||0)>0;
}
function finishBrownStalled(){
  const s=phase();if(s.id!=='brown'||state.phaseDone||state.readyToAdvance)return false;if(brownAtLimit())return true;ensureOpportunity();return false;
}
function ensureNeutronMechanicOpportunity(s=phase()){
 const g=neutronGameplay(s);if(s.mode!=='neutron'||!g.source||state.neutronSourceActivations>0)return false;
 const sourcePiece=[...state.pieces.values()].find(p=>p.sym===g.source),heliumPieces=[...state.pieces.values()].filter(p=>p.sym==='He');
 if(sourcePiece&&heliumPieces.some(h=>(neigh[sourcePiece.cell]||[]).includes(h.cell)))return false;
 const empties=activeCells().filter(c=>state.board[c]===null);if(sourcePiece){const h=(neigh[sourcePiece.cell]||[]).find(x=>state.board[x]===null&&activeSet().has(x));if(h===undefined)return false;createPiece('He',h,true);renderPieces();return true}
 if(heliumPieces.length){for(const he of heliumPieces){const c=(neigh[he.cell]||[]).find(x=>state.board[x]===null&&activeSet().has(x));if(c!==undefined){createPiece(g.source,c,true);renderPieces();return true}}}
 if(empties.length<2)return false;for(const c of empties){const h=(neigh[c]||[]).find(x=>state.board[x]===null&&x!==c&&activeSet().has(x));if(h!==undefined){createPiece(g.source,c,true);createPiece('He',h,true);renderPieces();return true}}return false;
}
function ensureOpportunity(){
  const s=phase();ensureCumulativeParticleFuel(s);if(ensureNeutronMechanicOpportunity(s))return;
  if(isPrimordial(s))return;
  if(s.mode==='reactionExplore')return ensureAtlasOpportunity(s);
  if(s.mode==='neutron'){
    if(s.chainRebuild){
      // Nessas fases o precursor direto é finito: nunca recrie Ni, Cu, Cs, Sm, Pt etc.
      // automaticamente. Quando a cadeia termina, só matéria-base pode reaparecer.
      if([...state.pieces.values()].some(p=>neutronEligible(p,s)||(s.id==='co'&&p.sym==='FeU'&&p.radioactiveReady)))return true;
      const foundation=neutronFoundationTransition(s);
      if(foundation){const cell=peripheralEmptyCell();if(cell!==null){createPiece('Fe',cell,true);renderPieces();return true}}
      if(s.id==='co'){
        if(activeFusionRecipes().some(hasAdjacentRecipe))return true;
        const heavy=[...state.pieces.values()].find(p=>['Mn','Cr','Ti'].includes(p.sym));
        if(heavy){const need=heavy.sym==='Ti'?'He':'H',cell=neigh[heavy.cell]?.find(n=>activeSet().has(n)&&state.board[n]===null);if(cell!==undefined){const q=createPiece(need,cell,true);requestAnimationFrame(()=>{const pt=pos(coords[cell]);q.x=pt.x;q.y=pt.y;renderPieces()});return true}}
        return false;
      }
      if(recipeEnvironmentAllows(FUSIONS.Ni,s)&&hasAdjacentRecipe(FUSIONS.Ni))return true;
      return false;
    }
    ensureSeed();if(fusionSandboxAllowed(s)&&recipeEnvironmentAllows(FUSIONS.D,s)&&!hasAdjacentRecipe(FUSIONS.D)){const active=activeSet(),cluster=starterCluster(2).filter(c=>state.board[c]===null).slice(0,2);if(cluster.length===2){cluster.forEach(cell=>createPiece('H',cell,true));renderPieces();requestAnimationFrame(()=>{cluster.forEach(cell=>{const q=state.pieces.get(state.board[cell]);if(q){const pt=pos(coords[cell]);q.x=pt.x;q.y=pt.y}});renderPieces()})}}return
  }
  if(s.mode==='rpProcess'){
    const step=rpStep(s);if(!step)return false;
    // Nunca reponha o precursor direto. Se toda a cadeia pesada for consumida,
    // reintroduza apenas Ferro, que é matéria-base e precisa ser processado pelo jogador.
    const hasRpRoute=[...state.pieces.values()].some(p=>!!rpStepForSymbol(p.sym,s));
    if(!hasRpRoute){const cell=peripheralEmptyCell();if(cell!==null)createPiece('Fe',cell,true)}
    if(step.fuel==='p')ensureProtonCaptureFuel(4);
    else if(![...state.pieces.values()].some(p=>p.sym==='H')){const cell=peripheralEmptyCell();if(cell!==null)createPiece('H',cell,true)}
    startPrimordialDrift();render();return true;
  }
  if(s.mode==='guidedDecay')return [...state.pieces.values()].some(p=>!!guidedTransitionFor(p,s));
  if(s.mode==='neutronize'||isPostMode(s))return;

  if(s.mode==='whiteCompact'){
    const outerRing=phaseRadius(s),outerCells=activeCells().filter(i=>coords[i].ring===outerRing),countsNow=boardSymbolCounts();
    const heCount=countsNow.He||0,hCount=countsNow.H||0;
    const placeLight=(sym)=>{const empties=outerCells.filter(i=>state.board[i]===null);if(!empties.length)return false;const cell=empties[Math.floor(Math.random()*empties.length)],p=createPiece(sym,cell,true);renderPieces();requestAnimationFrame(()=>{const q=pos(coords[cell]);p.x=q.x;p.y=q.y;renderPieces()});return true};
    let changed=false;
    // Reposição de segurança continua sendo exclusivamente H/He; nunca C/O prontos.
    if(heCount<5)changed=placeLight('He')||changed;
    if(hCount<4)changed=placeLight('H')||changed;
    if(!hasAdjacentRecipe(FUSIONS.Be8)){
      const outerHeCells=outerCells.filter(i=>state.board[i]!==null&&state.pieces.get(state.board[i])?.sym==='He');
      for(const cell of outerHeCells){const emptyNeighbor=neigh[cell].find(n=>coords[n].ring===outerRing&&state.board[n]===null);if(emptyNeighbor!==undefined){const p=createPiece('He',emptyNeighbor,true);renderPieces();requestAnimationFrame(()=>{const q=pos(coords[emptyNeighbor]);p.x=q.x;p.y=q.y;renderPieces()});return true}}
      changed=placeLight('He')||changed;
    }
    if(changed){render();return true}
    return hasAdjacentRecipe(FUSIONS.Be8)||hasAdjacentRecipe(FUSIONS.C)||hasAdjacentRecipe(FUSIONS.O);
  }
  if(s.id==='brown'){
    if(brownAtLimit())return false;const deuterium=[...state.pieces.values()].filter(p=>p.sym==='D');if(!deuterium.length)return false;if(hasAdjacentRecipe(BROWN_FUSION))return true;
    const active=activeSet();
    for(const d of deuterium){const cell=(neigh[d.cell]||[]).find(n=>active.has(n)&&state.board[n]===null);if(cell!==undefined){const h=createPiece('H',cell,true);renderPieces();requestAnimationFrame(()=>{const q=pos(coords[cell]);h.x=q.x;h.y=q.y;renderPieces()});return true}}
    // Tabuleiro cheio: reposicione um H já existente junto ao D, preservando o reservatório finito.
    const hydrogen=[...state.pieces.values()].find(p=>p.sym==='H');
    if(hydrogen){for(const d of deuterium){const target=(neigh[d.cell]||[]).find(n=>active.has(n)&&state.board[n]!==null&&state.board[n]!==hydrogen.id);if(target!==undefined){const displaced=state.pieces.get(state.board[target]),old=hydrogen.cell;state.board[target]=hydrogen.id;hydrogen.cell=target;state.board[old]=displaced.id;displaced.cell=old;for(const p of [hydrogen,displaced]){const q=pos(coords[p.cell]);p.x=q.x;p.y=q.y}renderPieces();return true}}}
    return false;
  }
  if(s.id==='he_red'){
    const c=boardSymbolCounts();if((c.HeU||0)>=2)return true;if((c.H||0)===0){const cell=activeCells().find(i=>state.board[i]===null);if(cell!==undefined)createPiece('H',cell,true)}while(countFloatingParticle('p')<2)spawnFloatingParticle('p');render();return true
  }
  if(s.id==='coulomb_intro'){
    // Nesta lição a movimentação já está disponível: nunca crie uma oportunidade artificial.
    // A única entrada de matéria acontece na reposição após uma reação nuclear consumidora.
    return true;
  }
  // Elementos já forjados nunca são reescritos para fabricar uma oportunidade artificial.
  // A reação-base da cadeia próton-próton é H + H → D; dela o jogador reconstrói ³He e He.
  const basic=FUSIONS.D;
  if(hasExactOnBoard(basic))return true;

  const active=activeSet();
  const ordered=activeCells().slice().sort((a,b)=>coords[b].ring-coords[a].ring);

  // Primeiro, complete um par ao lado de um H existente usando somente uma casa vazia.
  for(const cell of ordered){
    const id=state.board[cell];
    if(!id||state.pieces.get(id)?.sym!=='H')continue;
    const emptyNeighbor=neigh[cell].find(n=>active.has(n)&&state.board[n]===null);
    if(emptyNeighbor!==undefined){
      createPiece('H',emptyNeighbor,true);
      renderPieces();
      requestAnimationFrame(()=>{const p=state.pieces.get(state.board[emptyNeighbor]);if(p){const q=pos(coords[emptyNeighbor]);p.x=q.x;p.y=q.y;renderPieces()}});
      return true;
    }
  }

  // Depois, procure duas casas vazias adjacentes na periferia.
  for(const cell of ordered){
    if(state.board[cell]!==null)continue;
    const n=neigh[cell].find(x=>active.has(x)&&state.board[x]===null);
    if(n!==undefined){
      const p1=createPiece('H',cell,true),p2=createPiece('H',n,true);
      renderPieces();
      requestAnimationFrame(()=>{
        for(const p of [p1,p2]){const q=pos(coords[p.cell]);p.x=q.x;p.y=q.y}
        renderPieces();
      });
      return true;
    }
  }
  if(s.id==='brown'&&!brownCanBurnDeuterium())return finishBrownStalled();
  return false;
}
function hasExactOnBoard(r){const active=activeSet();if(r.ing.length===2){for(const i of activeCells()){const id=state.board[i];if(!id)continue;for(const n of neigh[i].filter(x=>active.has(x))){const id2=state.board[n];if(!id2)continue;if(same([state.pieces.get(id).sym,state.pieces.get(id2).sym],r.ing))return true}}}else if(r.ing.length===3){for(const i of activeCells()){const around=[i,...neigh[i].filter(x=>active.has(x))];for(let a=0;a<around.length;a++)for(let b=a+1;b<around.length;b++)for(let c=b+1;c<around.length;c++){const cells=[around[a],around[b],around[c]];const ids=cells.map(x=>state.board[x]);if(ids.every(Boolean)&&same(ids.map(x=>state.pieces.get(x).sym),r.ing))return true}}}return false}
function neutronProcessClass(s=phase()){if(s.mode!=='neutron')return null;if(s.rprocess)return'r';if(s.weakS)return'weak-s';if(s.visual==='agb')return'agb-s';return null}
function phaseNeutronTransitions(s=phase()){
 if(s.mode!=='neutron')return[];
 const out=[];
 if(Array.isArray(s.path)){for(let i=0;i<s.path.length-1;i++)out.push({from:s.path[i],to:s.path[i+1],captures:s.captures||1,rprocess:!!s.rprocess,phaseId:s.id})}
 else if(s.seed&&s.new)out.push({from:s.seed,to:s.new,captures:s.captures||1,rprocess:!!s.rprocess,phaseId:s.id});
 return out;
}
function allLearnedNeutronTransitions(){
 const map=new Map();
 for(const p of PHASES){
   if(!campaignKnowledgeReached(p.id))continue;
   const cls=neutronProcessClass(p);if(!cls)continue;
   for(const tr of phaseNeutronTransitions(p))map.set(`${tr.from}>${tr.to}@${cls}`,{...tr,processClass:cls})
 }
 return[...map.values()]
}
function neutronTransitionEnvironmentAllows(tr,s=phase()){
 const cls=neutronProcessClass(s);if(!cls||!tr)return false;
 // Processo-s fraco e AGB permanecem redes distintas no gameplay; o processo-r é
 // ainda mais extremo. A receita é lembrada, mas só fica executável na família compatível.
 return tr.processClass===cls
}
function learnedNeutronTransitions(s=phase()){return allLearnedNeutronTransitions().filter(tr=>neutronTransitionEnvironmentAllows(tr,s))}
function currentNeutronTransition(sym,s=phase()){return phaseNeutronTransitions(s).find(tr=>tr.from===sym)||null}
function neutronFoundationTransition(s=phase()){
 const cls=neutronProcessClass(s);
 if(cls==='weak-s')return{from:'Fe',to:'Ni',captures:2,rprocess:false,processClass:cls,rebuild:true,phaseId:'foundation_weak_s'};
 if(cls==='agb-s')return{from:'Fe',to:'Kr',captures:4,rprocess:false,processClass:cls,rebuild:true,phaseId:'foundation_agb_s'};
 if(cls==='r')return{from:'Fe',to:'Sm',captures:6,rprocess:true,processClass:cls,rebuild:true,phaseId:'foundation_r'};
 return null;
}
function neutronTransitionFor(p,s=phase()){if(!p||s.mode!=='neutron')return null;if(p.neutronBetaPending&&neutronGameplay(s).pattern!=='branch')return null;const foundation=neutronFoundationTransition(s);return currentNeutronTransition(p.sym,s)||(foundation&&p.sym===foundation.from?foundation:null)||learnedNeutronTransitions(s).slice().reverse().find(tr=>tr.from===p.sym)||null}
function neutronEligible(p,s=phase()){return !!neutronTransitionFor(p,s)}
function universalNeutronCaptureEligible(p){return !!(campaignKnowledgeReached('primordial_d')&&p&&p.sym==='H')}
function currentSeedEligible(p,s=phase()){return !!(p&&phaseNeutronTransitions(s).some(tr=>tr.from===p.sym))}
function ensureSeed(){
 const s=phase();if(s.mode!=='neutron')return false;
 if([...state.pieces.values()].some(p=>currentSeedEligible(p,s)))return true;
 if(s.chainRebuild)return false;
 const active=activeSet(),empties=activeCells().filter(i=>state.board[i]===null).sort((a,b)=>coords[b].ring-coords[a].ring);
 if(!empties.length)return false;
 const cell=empties[0],p=createPiece(s.seed,cell,true);renderPieces();requestAnimationFrame(()=>{const q=pos(coords[cell]);p.x=q.x;p.y=q.y;renderPieces()});return true;
}
function clearNeutronPending(piece){if(!piece)return;piece.neutronBetaPending=false;piece.neutronBetaReadyRound=null;piece.neutronBetaTransition=null;piece.neutronShellExposure=0;piece.neutronShellOpen=false}
function scheduleNeutronBeta(piece,s,tr){
 const g=neutronGameplay(s);piece.captures=0;piece.neutronBetaPending=true;piece.neutronBetaTransition={...tr};piece.neutronBetaReadyRound=state.nuclearRound+g.betaRounds;state.neutronBetaWaits++;state.selected=[];captureTag(piece.x,piece.y,`β− em ${g.betaRounds} rodadas`);tone(590,.08,'sine',.028);renderPieces();
}
async function resolvePendingNeutronBetas(){
 const s=phase();if(s.mode!=='neutron')return;const pending=[...state.pieces.values()].filter(p=>p.neutronBetaPending&&state.nuclearRound>=(p.neutronBetaReadyRound??Infinity));
 for(const p of pending){const tr=p.neutronBetaTransition;if(!tr)continue;if(neutronGameplay(s).pattern==='branch'){await teachProductOnce('branching',p.x,p.y);state.neutronBranchesObserved++}clearNeutronPending(p);await betaTransform(p,s,tr)}
}
function neutronCloudLimit(s=phase()){const g=neutronGameplay(s);return g.pattern==='rFreezeout'?12:g.pattern==='rStorm'?11:g.pattern==='rWave'?9:g.pulseSize?8:6}
function spawnNeutronBatch(count,{storm=false}={}){let made=0;for(let i=0;i<count;i++)if(spawnNeutron())made++;if(made){state.neutronPulsesObserved++;if(storm)state.neutronStormsObserved++;renderNeutrons()}return made}

function startNeutronSystem(){
 stopNeutronSystem();const s=phase();if(!['neutronize','neutron'].includes(s.mode))return;
 state.neutronTick=setInterval(moveNeutrons,s.mode==='neutronize'?70:82);
 if(s.mode==='neutron'){
   const g=neutronGameplay(s),limit=neutronCloudLimit(s);
   const emit=()=>{if(phase().mode!=='neutron'||state.phaseDone||state.popupOpen)return;if(state.neutrons.size>=limit)return;
     if(g.pattern==='rStorm'||g.pattern==='rWave'||g.pattern==='rFreezeout')spawnNeutronBatch(Math.min(g.stormSize||6,limit-state.neutrons.size),{storm:true});
     else if(g.pulseSize)spawnNeutronBatch(Math.min(g.pulseSize,limit-state.neutrons.size));
     else spawnNeutron();
   };
   emit();setTimeout(emit,g.pulseSize||g.stormSize?520:180);const interval=g.stormInterval||g.pulseInterval||Math.max(360,s.neutronRate||1050);state.neutronTimer=setInterval(emit,Math.max(420,interval));
 }
}
function stopNeutronSystem(){if(state.neutronTimer)clearInterval(state.neutronTimer);if(state.neutronTick)clearInterval(state.neutronTick);state.neutronTimer=null;state.neutronTick=null;state.selectedNeutron=null;state.neutrons.clear();dom.neutrons.innerHTML=''}
function spawnNeutron(){
 const s=phase();if(s.mode!=='neutron'||state.phaseDone||state.popupOpen)return false;
 const size=starSize(),c=size/2,a=Math.random()*Math.PI*2,r=size*.46,id=state.nextN++,x=c+Math.cos(a)*r,y=c+Math.sin(a)*r,speed=.9+Math.random()*.65;
 state.neutrons.set(id,{id,x,y,vx:-Math.cos(a)*speed+(Math.random()-.5)*.35,vy:-Math.sin(a)*speed+(Math.random()-.5)*.35,generated:false});renderNeutrons();return true
}
function placeNeutronOnStellarShell(n,force=false){
 if(!n)return false;if(force&&!n.shellOrbiting)primeStellarShellParticle(n,'n');return advanceStellarShellParticle(n,'n',.012)
}
function spawnGeneratedNeutron(x,y){
  if(!['neutronize','neutron'].includes(phase().mode))return;
  const id=state.nextN++,a=Math.random()*Math.PI*2,speed=1.0+Math.random()*.8,n={id,x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,generated:true};
  primeStellarShellParticle(n,'n');state.neutrons.set(id,n);
  renderNeutrons();
}
function moveNeutrons(){
 const s=phase();if(!['neutron','neutronize'].includes(s.mode))return;const c=starSize()/2,limit=starSize()*.44;
 for(const n of state.neutrons.values()){
   if(state.selectedNeutron===n.id)continue;
   if(placeNeutronOnStellarShell(n))continue;
   n.x+=(n.vx||0);n.y+=(n.vy||0);
   const dx=n.x-c,dy=n.y-c,d=Math.hypot(dx,dy)||1;
   if(d>limit){const nx=dx/d,ny=dy/d,dot=(n.vx||0)*nx+(n.vy||0)*ny;n.vx=(n.vx||0)-2*dot*nx;n.vy=(n.vy||0)-2*dot*ny;n.x=c+nx*limit;n.y=c+ny*limit}
 }
 renderNeutrons();
}

function renderNeutrons(){const s=phase();if(!['neutron','neutronize'].includes(s.mode)){dom.neutrons.innerHTML='';return}const sp=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null,partner=s.mode==='neutron'&&(neutronEligible(sp,s)||universalNeutronCaptureEligible(sp)),visible=new Set([...state.neutrons.values()].sort((a,b)=>((b.id===state.selectedNeutron)-(a.id===state.selectedNeutron))||a.id-b.id).slice(0,2).map(n=>n.id));const existing=new Map([...dom.neutrons.querySelectorAll('.neutron')].map(el=>[+el.dataset.id,el]));state.neutrons.forEach((n,id)=>{let el=existing.get(id);if(!el){el=document.createElement('button');el.dataset.id=id;el.textContent='n';el.addEventListener('click',ev=>{ev.stopPropagation();captureNeutron(id)});dom.neutrons.appendChild(el)}const selected=state.selectedNeutron===id,reserve=!visible.has(id);el.className='neutron'+(selected?' selected':partner?' candidate':'')+(s.mode==='neutronize'?' passive':'')+(reserve?' particle-reserve':'');el.style.pointerEvents=reserve?'none':'auto';el.setAttribute('aria-hidden',reserve?'true':'false');el.style.left=n.x+'px';el.style.top=n.y+'px';existing.delete(id)});existing.forEach(el=>el.remove())}
async function captureNeutron(id){
 focusParticleInfo('n',id);if(state.locked)return;
 const n=state.neutrons.get(id);if(!n)return;const s=phase(),particle=state.primordialSelected!==null?state.primordialParticles.get(state.primordialSelected):null,free=state.freeSelected.length?state.pieces.get(state.freeSelected[0]):null,board=state.selected.length?state.pieces.get(state.board[state.selected[0]]):null;
 if(particle?.kind==='p'&&primordialParticlePairReaction(['p','n'])){reactCumulativeProcessNeutronWithProton(particle,n);return}
 if(free){const r=primordialMixedReaction(free.sym,'n');if(r){reactCumulativeProcessNeutronMixed(r,free,n);return}}
 if(board){const r=primordialMixedReaction(board.sym,'n');if(r){reactCumulativeProcessNeutronMixed(r,board,n);return}}
 if(s.mode!=='neutron')return;
 if(!state.selected.length){state.selectedNeutron=state.selectedNeutron===id?null:id;tone(360,.05,'sine',.025);render();return}
 const cell=state.selected[0],pid=state.board[cell],p=pid?state.pieces.get(pid):null,tr=neutronTransitionFor(p,s),ng=neutronGameplay(s);
 if(p?.neutronBetaPending&&ng.pattern==='branch'){
   const branchTr=p.neutronBetaTransition;if(!branchTr)return;await teachProductOnce('branching',p.x,p.y);state.selectedNeutron=null;state.locked=true;await objectiveInteractionImpact(`neutron:${s.id}:branch:${p.sym}`,[objectiveInteractionPieceToken(p),objectiveInteractionNeutronToken(n)],branchTr.to||p.sym,{x:p.x,y:p.y},'n','CAPTURA');state.neutrons.delete(id);renderNeutrons();state.neutronBranchesObserved++;clearNeutronPending(p);captureTag(p.x,p.y,'captura antes do β−');await betaTransform(p,s,branchTr);state.selected=[];await afterNuclearAction({advanceRound:true});state.locked=false;ensureOpportunity();render();checkComplete();return;
 }
 if(universalNeutronCaptureEligible(p)){
   state.selectedNeutron=null;state.locked=true;await objectiveInteractionImpact(`neutron:${s.id}:H>D`,[objectiveInteractionPieceToken(p),objectiveInteractionNeutronToken(n)],'D',{x:p.x,y:p.y},'n','CAPTURA');state.neutrons.delete(id);renderNeutrons();p.sym='D';p.massNumber=2;p.captures=0;p.newborn=true;focusPieceInfo(p);state.discovered.add('D');burst(p.x,p.y);await emitGamma(p.x,p.y);setTimeout(()=>{const q=state.pieces.get(p.id);if(q){q.newborn=false;renderPieces()}},360);state.selected=[];await afterNuclearAction();state.locked=false;ensureOpportunity();render();checkComplete();return;
 }
 if(!tr){state.selected=[];state.selectedNeutron=id;render();return}
 if(ng.shellExposure>0&&!p.neutronShellOpen){
   state.selectedNeutron=null;state.locked=true;await objectiveInteractionImpact(`neutron:${s.id}:shell:${p.sym}`,[objectiveInteractionPieceToken(p),objectiveInteractionNeutronToken(n)],p.sym,{x:p.x,y:p.y},'n','EXPOSIÇÃO');state.neutrons.delete(id);renderNeutrons();p.neutronShellExposure=(p.neutronShellExposure||0)+1;captureTag(p.x,p.y,`EXPOSIÇÃO ${p.neutronShellExposure}/${ng.shellExposure}`);tone(500+p.neutronShellExposure*35,.06,'sine',.026);if(p.neutronShellExposure>=ng.shellExposure){p.neutronShellOpen=true;captureTag(p.x,p.y,'CASCA ATRAVESSADA');tone(760,.11,'triangle',.04)}state.selected=[p.cell];renderPieces();await afterNuclearAction({advanceRound:true});state.locked=false;ensureOpportunity();render();return;
 }
 state.selectedNeutron=null;state.locked=true;await objectiveInteractionImpact(`neutron:${s.id}:${p.sym}>${tr.to}`,[objectiveInteractionPieceToken(p),objectiveInteractionNeutronToken(n)],tr.to||p.sym,{x:p.x,y:p.y},'n','CAPTURA');state.neutrons.delete(id);renderNeutrons();p.captures=(p.captures||0)+1;const needsMoreCaptures=p.captures<tr.captures;captureTag(p.x,p.y,`+n ${p.captures}/${tr.captures}`);tone(520+p.captures*40,.05,'sine',.03);vibrate(8);
 if(p.captures>=tr.captures){
   if(s.manualDecay){p.sym='FeU';p.captures=0;p.radioactiveReady=true;p.newborn=true;state.selected=[];renderPieces();setTimeout(()=>{const q=state.pieces.get(p.id);if(q){q.newborn=false;renderPieces()}},340)}
   else if(['betaWait','branch'].includes(ng.pattern)){recordFlow(1);scheduleNeutronBeta(p,s,tr)}
   else if(ng.pattern==='rFreezeout'){await teachProductOnce('freezeout',p.x,p.y);recordFlow(1);state.neutronFreezeouts++;captureTag(p.x,p.y,'FREEZE-OUT');tone(350,.14,'sine',.035);if(state.neutronTimer)clearInterval(state.neutronTimer);state.neutronTimer=null;await wait(420);state.neutrons.clear();renderNeutrons();await wait(260);await betaTransform(p,s,tr);state.selected=[];if(!state.phaseDone)setTimeout(startNeutronSystem,700)}
   else{recordFlow(1);await betaTransform(p,s,tr);state.selected=[]}
 }else if(!s.manualDecay)recordFlow(1);
 await afterNuclearAction({advanceRound:true});
 // Se a rota exige várias capturas, acompanhe o núcleo após sua migração radial
 // para preservar o fluxo sem deixar uma seleção apontando para a célula antiga.
 if(needsMoreCaptures&&state.pieces.has(p.id))state.selected=[p.cell];
 const cascadeIds=!state.chainAutoContext&&s.rprocess&&!state.selected.length?[...state.neutrons.keys()].filter(nid=>nid!==id).slice(0,5):[],cascadeRoot=cascadeIds.length?startChainEvent('r',p?.x,p?.y):null;
 state.locked=false;ensureOpportunity();render();checkComplete();if(cascadeRoot)scheduleNeutronCascade(cascadeRoot,cascadeIds,{storm:true});
}
function captureTag(x,y,text){if(!dom.fx||!Number.isFinite(x)||!Number.isFinite(y)||!text)return null;const d=document.createElement('div');d.className='capture-tag';d.style.left=x+'px';d.style.top=y+'px';d.textContent=text;dom.fx.appendChild(d);setTimeout(()=>d.remove(),780);return d}
async function betaTransform(p,s,tr=neutronTransitionFor(p,s)){
 const before=p.sym,next=tr?.to;if(!next)return;
 captureTag(p.x,p.y,tr.rprocess?'RICO EM n':`${before}*`);tone(650,.07,'sine',.03);await wait(150);if(tr.rprocess){for(let k=0;k<3;k++){captureTag(p.x+(k-1)*10,p.y-8*k,'β−');emitBetaMinusProducts(p.x+(k-1)*4,p.y-4*k);tone(730+k*35,.055,'triangle',.032);await wait(90)}}else{captureTag(p.x,p.y,'β−');emitBetaMinusProducts(p.x,p.y);tone(760,.1,'triangle',.045);await wait(230)}
 p.sym=next;p.captures=0;clearNeutronPending(p);if(next==='Tc'||next==='Pm')p.radioactiveReady=true;focusPieceInfo(p);state.created[next]=(state.created[next]||0)+1;state.discovered.add(next);renderPieces();captureTag(p.x,p.y,`${before} → ${next}`);burst(p.x,p.y);
 const isGoal=next===s.new;recordFlow(isGoal?2:1);const milestoneTriggered=isGoal?triggerPhaseMilestone():false;if(!milestoneTriggered)announce(isGoal?'NOVO ELEMENTO':'REAÇÃO CONHECIDA',E[next].name.toUpperCase(),isGoal?`${state.created[next]}/${s.target}`:(tr.rprocess?'rota r já aprendida · capturas rápidas → cascata β− + ν̄ₑ':'rota s já aprendida · captura n → β− + ν̄ₑ'));tone(880,.12,'triangle',.05);save()
}
async function tapRadioactiveProof(p){
 if(!p?.radioactiveReady||state.locked)return;state.locked=true;const from=p.sym,daughter=from==='Tc'?'Ru':'Sm';captureTag(p.x,p.y,'β−');emitBetaMinusProducts(p.x,p.y);burst(p.x,p.y);tone(760,.12,'triangle',.04);await wait(260);p.sym=daughter;p.radioactiveReady=false;state.radioactiveProofDone=true;focusPieceInfo(p);state.discovered.add(daughter);recordFlow(1);renderPieces();captureTag(p.x,p.y,`${from} → ${daughter}`);announce('RADIOATIVIDADE OBSERVADA',`${E[from].name.toUpperCase()} → ${E[daughter].name.toUpperCase()}`,from==='Tc'?'Uma rota β representativa mostra por que o Tecnécio encontrado em estrelas precisa ter sido produzido recentemente.':'Uma rota β representativa reforça que o Promécio possui apenas isótopos radioativos.');await afterNuclearAction();state.locked=false;render();checkComplete()
}
function objectiveSatisfied(s=phase()){
 if(s.mode==='campaignMilestone')return true;
 if(s.mode==='convection')return(state.convectionMoves||0)>=s.target;
 if(s.mode==='reactionExplore')return state.atlasProgress>=s.target;
 if((s.id==='tc'||s.id==='pm')){const g=neutronGameplay(s);return(state.created[s.new]||0)>=s.target&&state.radioactiveProofDone&&(!g.requiresSource||state.neutronSourceActivations>=1)}
 if(s.mode==='decayGarden')return decayDiscoveryCount(s)>=s.target;
 if(s.mode==='whiteCompact'){const info=whiteCounts(s);return info.c>=info.targetC&&info.o>=info.targetO;}
 if(s.mode==='neutronize')return state.crushed>=s.target;
 if(s.mode==='neutron'){
   const made=state.created[s.new]||0,g=neutronGameplay(s);if(made<s.target)return false;if(g.requiresSource&&state.neutronSourceActivations<1)return false;if(g.requiresBranch&&state.neutronBranchesObserved<1)return false;if(g.requiresFreezeout&&state.neutronFreezeouts<1)return false;return true;
 }
 if(s.mode==='blackhole')return state.absorbed>=s.target;
 if(isPostMode(s))return state.absorbed>=s.target;
 if(isPrimordial(s)&&s.mode!=='opening')return primordialGoalCount(s)>=s.target;
 if(s.mode==='rpProcess'){const step=rpStep(s),made=state.created[s.new]||0;if(step?.pattern==='waiting')return made>=s.target&&state.rpWaitDecays>=1;if(step?.pattern==='cycle')return made>=s.target&&state.rpCyclesObserved>=1;return made>=s.target}
 if(s.mode==='protonCapture')return state.protonCaptures>=s.target;
 if(s.id==='brown')return brownAtLimit();
 return(state.created[s.new]||0)>=s.target
}
function checkComplete(){
 const s=phase();if(state.phaseDone||state.readyToAdvance)return;
 const objectiveDone=objectiveSatisfied(s);if(objectiveDone&&objectiveFlowFloorApplies(s)){const floor=Math.ceil(Math.max(0,s.flowTarget||0)*CHAIN_OBJECTIVE_PROGRESS_FLOOR);if(state.flow<floor)state.flow=floor}
 const flowDone=s.mode==='campaignMilestone'||s.id==='brown'||s.mode==='whiteCompact'||state.flow>=Math.max(0,s.flowTarget||0);if(!objectiveDone||!flowDone)return;
 state.readyToAdvance=true;state.selected=[];if(s.id==='brown')state.locked=true;save();$('phaseEndBtn').classList.remove('show');dom.star.classList.add('critical');phaseCompletionReward(s);setTimeout(()=>{if(phase()===s&&state.readyToAdvance)$('phaseEndBtn').classList.add('show')},720);
 if(s.id==='brown')announce('DEUTÉRIO ESGOTADO','A QUEIMA DA ANÃ MARROM TERMINOU','O pequeno reservatório de Deutério foi consumido; a fusão sustentada de Hidrogênio permanece fora de alcance.');
 else if(s.endEvent==='supernova')announce('OBJETIVO CONCLUÍDO','SUPERNOVA PRONTA','O núcleo está pronto. Você ainda pode explorar o tabuleiro antes de liberar a onda de choque.');
 else if(s.mode==='whiteCompact')announce('OBJETIVO CONCLUÍDO','ANÃ BRANCA FORMADA','Carbono e Oxigênio passaram a dominar o interior enquanto Hélio e Hidrogênio permanecem nas regiões externas e a rede eletrônica atravessa todo o remanescente.');
 else if(s.mode==='remnant')announce('OBJETIVO CONCLUÍDO','ESTRELA DE NÊUTRONS','Continue incorporando matéria ou prossiga quando quiser.');
 else if(s.mode==='pulsar')announce('OBJETIVO CONCLUÍDO','PULSAR ACELERADO','O feixe atingiu o marco da fase; você pode continuar alimentando-o.');
 else if(s.mode==='accretion')announce('OBJETIVO CONCLUÍDO','ACREÇÃO SUFICIENTE','Continue observando a matéria chegar ou prossiga para o limite.');
 else if(s.mode==='collapseFinal')announce('OBJETIVO CONCLUÍDO','LIMITE SUPERADO','O colapso está pronto para prosseguir.');
 else if(s.mode==='blackhole')announce('OBJETIVO CONCLUÍDO','BURACO NEGRO ALIMENTADO',`${state.absorbed} átomos completaram a acreção; conclua o ciclo quando quiser.`);
 else if(s.mode==='neutronize')announce('OBJETIVO CONCLUÍDO','MATÉRIA NEUTRON-RICA','Continue experimentando ou libere a onda de choque quando quiser.');
 else if(s.mode==='rpProcess')announce('OBJETIVO CONCLUÍDO',E[s.new].name.toUpperCase(),rpStep(s)?.pattern==='cycle'?'O ciclo Sn–Sb–Te marca o limite desta campanha de capturas rápidas de prótons.':'Continue capturando prótons ou prossiga para o próximo marco do rp-process.');
 else if(s.mode==='guidedDecay')announce('OBJETIVO CONCLUÍDO',E[s.new].name.toUpperCase(),'A cadeia permanece disponível enquanto houver núcleos históricos para transformar.');
 else if(s.mode==='decayGarden')announce('OBJETIVO CONCLUÍDO','CADEIAS PRINCIPAIS COMPLETAS','O jardim permanece ativo; continue acompanhando os decaimentos ou prossiga.');
 else if(s.mode==='neutrino')announce('OBJETIVO CONCLUÍDO','ν-PROCESSO','Continue direcionando neutrinos ou prossiga.');
 else if(s.mode==='gamma')announce('OBJETIVO CONCLUÍDO','γ-PROCESSO','Continue explorando isótopos ou prossiga.');
 else if(s.mode==='spallation')announce('OBJETIVO CONCLUÍDO',E[s.new].name.toUpperCase(),'Continue fragmentando C/N/O ou prossiga.');
 else if(s.mode==='explosive')announce('OBJETIVO CONCLUÍDO','NUCLEOSSÍNTESE EXPLOSIVA','A rede continua ativa até você decidir prosseguir.');
 else if(s.mode==='convection')announce('OBJETIVO CONCLUÍDO','CONVECÇÃO DOMINADA','A partir daqui, reações nucleares no centro ou na camada 1 podem alimentar novas correntes convectivas.');
 else if(s.mode==='reactionExplore')announce('OBJETIVO CONCLUÍDO',(ATLAS_CATEGORY_INFO[atlasSpec(s)?.category]?.label||'ATLAS NUCLEAR'),`Você observou ${state.atlasProgress} vezes o comportamento desta combinação.`);
 else announce('OBJETIVO CONCLUÍDO',E[s.new].name.toUpperCase(),'Continue explorando as transformações compatíveis ou prossiga quando quiser.');
 render()
}
function launchBigBangEjecta(count=260){
 return new Promise(resolve=>{
  const layer=document.createElement('div');layer.className='bigbang-ejecta-layer';document.body.appendChild(layer);
  const rect=dom.singularity.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,w=window.innerWidth,h=window.innerHeight,reach=Math.hypot(w,h)*.88+Math.max(w,h)*.54;
  const emissionWindow=2100,flightMin=1600,flightSpread=750;
  let maxTime=0;
  for(let i=0;i<count;i++){
   const el=document.createElement('div'),cycle=i%5,kind=cycle===4?'n':(cycle%2?'e':'p'),cls=kind==='p'?'proton':kind==='e'?'electron':'neutronfree';
   el.className=`primordial-particle ${cls} bigbang-ejecta`;el.textContent=kind==='p'?'+':kind==='e'?'−':'n';
   const wave=i/count,delay=wave*emissionWindow+Math.random()*110;
   const baseAngle=(Math.PI*2*(i%40)/40)+(Math.floor(i/40)*.29),angle=baseAngle+(Math.random()-.5)*.24;
   const flight=flightMin+Math.random()*flightSpread,dist=reach*(.9+Math.random()*.28),targetX=cx+Math.cos(angle)*dist,targetY=cy+Math.sin(angle)*dist;
   const bornScale=.62+Math.random()*.28;
   el.style.left=cx+'px';el.style.top=cy+'px';el.style.opacity='0';el.style.transform=`translate(-50%,-50%) scale(${bornScale})`;
   el.style.transition=`left ${flight}ms cubic-bezier(.18,.66,.22,1) ${delay}ms,top ${flight}ms cubic-bezier(.18,.66,.22,1) ${delay}ms,transform ${flight}ms ease-out ${delay}ms,opacity 140ms ease-out ${delay}ms`;
   layer.appendChild(el);maxTime=Math.max(maxTime,delay+flight);
   requestAnimationFrame(()=>{el.style.left=targetX+'px';el.style.top=targetY+'px';el.style.opacity='1';el.style.transform='translate(-50%,-50%) scale(.46)'});
   const fadeAt=delay+flight*.72;
   setTimeout(()=>{el.style.transition=`opacity ${Math.max(420,flight*.22)}ms ease-in`;el.style.opacity='0'},fadeAt);
  }
  setTimeout(()=>{layer.remove();resolve()},Math.ceil(maxTime)+40);
 })
}
function bigBangOvertureNote(delay,freq,duration=.28,gain=.022,type='sine'){setTimeout(()=>{if(phase().mode==='opening')tone(freq,duration,type,gain)},delay)}
function playBigBangOverture(){
 const phrase=(start,root)=>{[1,1.25,1.5].forEach((ratio,i)=>bigBangOvertureNote(start+i*145,root*ratio,.30,i===2?.028:.022,i===2?'triangle':'sine'))};
 bigBangOvertureNote(0,55,.82,.052,'sine');bigBangOvertureNote(0,82.5,.62,.024,'triangle');
 phrase(170,110);phrase(760,146.83);phrase(1360,164.81);
 setTimeout(()=>{if(phase().mode!=='opening')return;for(const f of [220,275,330]){tone(f,.70,'triangle',.027);tone(f*2,.48,'sine',.010)}},2240);
 setTimeout(()=>{if(phase().mode!=='opening')return;for(const f of [330,440,550])tone(f,.54,'sine',.016);tone(660,.42,'triangle',.014)},3030);
 setTimeout(()=>{if(phase().mode==='opening'){tone(440,.46,'sine',.014);tone(660,.38,'sine',.012);tone(880,.30,'sine',.009)}},3580);
}
async function launchBigBang(){
 const s=phase();if(s.mode!=='opening'||state.bigBangStarted)return;state.bigBangStarted=true;state.locked=true;dom.singularity.classList.add('exploding');const ejectaFlight=launchBigBangEjecta(260);const shock=document.createElement('div');shock.className='universe-shock';dom.fx.appendChild(shock);setTimeout(()=>shock.remove(),1000);playBigBangOverture();vibrate([25,20,45,25,65]);announce('BIG BANG','O UNIVERSO SE EXPANDE','A expansão revela prótons, elétrons e nêutrons no plasma primordial.');await wait(120);state.bigBangColorized=true;applyVisual();const size=starSize(),particles=[];for(let i=0;i<96;i++){const pt=freePoint(25),cycle=i%5,kind=cycle===4?'n':(cycle%2?'e':'p');particles.push({kind,x:pt.x/size,y:pt.y/size})}
 // A próxima fase só começa depois que toda a ejeção visual terminou.
 await ejectaFlight;await wait(160);state.primordialTransfer={particles};state.locked=false;startPhase((phaseIndexById.get('primordial_d')??1),true,false)
}
async function decayPrimordialTritiumForAtomicEra(){
 const tritium=[...state.pieces.values()].filter(p=>p.free&&p.sym==='T');if(!tritium.length)return;
 announce('O UNIVERSO ESFRIA','O TEMPO AVANÇA','O Trítio remanescente atravessa uma escala de tempo muito maior que a nucleossíntese e decai para Hélio-3.');
 for(const p of tritium){p.longRadioactive=false;p.sym='He3';p.massNumber=3;p.matterState='nucleus';p.boundElectrons=0;burst(p.x,p.y);renderPieces();await emitBetaMinusProducts(p.x,p.y);await wait(100)}
}
async function advancePrimordial(){
 const s=phase();if(!state.phaseDone)return;$('phaseEndBtn').classList.remove('show');state.locked=true;stopPrimordialDrift();dom.star.classList.add('primordial-transition');
 if(s.id==='primordial_li'){tone(165,.35,'sine',.035);await wait(420);await decayPrimordialTritiumForAtomicEra();announce('CENTENAS DE MILHARES DE ANOS DEPOIS','COMEÇA A ERA ATÔMICA','Os núcleos sobreviventes agora encontram elétrons em um Universo muito mais frio.');await wait(520)}
 const transfer={particles:snapshotPrimordialParticles(),pieces:snapshotFreePieces()};
 if(s.id==='atomic_li')state.primordialTransfer=null;else state.primordialTransfer=transfer;
 if(s.id==='atomic_li'){announce('CENTENAS DE MILHÕES DE ANOS DEPOIS','A GRAVIDADE REÚNE A MATÉRIA','Átomos e núcleos leves alimentam as primeiras estruturas e, depois, as primeiras estrelas.');tone(140,.42,'sine',.04);await wait(850)}else if(s.id!=='primordial_li'){tone(250,.18,'triangle',.03);await wait(330)}
 dom.star.classList.remove('primordial-transition');advancePhase()
}
async function scatterStage(){if(!state.phaseDone)return;const s=phase(),supernova=s.endEvent==='supernova';$('phaseEndBtn').classList.remove('show');if(supernova){await wait(rewardReducedMotion()?60:240);registerRewardDiscovery('phenomenon:supernova',{title:'SUPERNOVA',text:'Matéria enriquecida foi dispersa.',silent:true});playScientificSignature('supernova')}const layer=$('explosion');layer.innerHTML='';const size=starSize(),c=size/2;const clones=[];state.pieces.forEach((p,idx)=>{const el=document.createElement('div');el.className='atom '+((p.matterState||'nucleus')==='atom'?'atomic-piece':'nucleus-piece');el.style.background=elementStyle(p.sym);const shownSym=pieceDisplaySymbol(p);el.innerHTML=`<span class="sym">${shownSym}</span>`;el.style.left=p.x+'px';el.style.top=p.y+'px';layer.appendChild(el);clones.push({el,p,idx})});for(let i=0;i<(supernova?78:34);i++){const d=document.createElement('i');d.className='dust-speck';layer.appendChild(d);const a=Math.random()*Math.PI*2,dist=size*((supernova?.72:.42)+Math.random()*(supernova?.70:.35)),dur=(supernova?430:520)+Math.random()*(supernova?520:420);requestAnimationFrame(()=>{d.style.transition=`transform ${dur}ms ease-out,opacity ${dur}ms ease`;d.style.transform=`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(${supernova?.12:.25})`;d.style.opacity='0'})}dom.pieces.classList.add('hidden');tone(supernova?92:170,supernova?.55:.32,supernova?'sawtooth':'sine',supernova?.075:.05);vibrate(supernova?[35,24,55,30,75]:[18,30,24]);clones.forEach(({el,p,idx})=>{const radial=Math.atan2(p.y-c,p.x-c),a=radial+(Math.random()-.5)*(supernova?1.15:.8),dist=size*((supernova?.92:.52)+Math.random()*(supernova?.60:.28)),dur=(supernova?520:620)+Math.random()*(supernova?380:280)+idx*3;requestAnimationFrame(()=>{el.style.transition=`left ${dur}ms cubic-bezier(.15,.72,.2,1),top ${dur}ms cubic-bezier(.15,.72,.2,1),transform ${dur}ms ease,opacity ${dur*.9}ms ease`;el.style.left=(c+Math.cos(a)*dist)+'px';el.style.top=(c+Math.sin(a)*dist)+'px';el.style.transform=`translate(-50%,-50%) scale(${supernova?.22:.45})`;el.style.opacity='0'})});await wait(supernova?1050:900);advancePhase()}
async function compactAdvance(){
 if(!state.phaseDone)return;const s=phase();$('phaseEndBtn').classList.remove('show');state.locked=true;dom.star.classList.add('milestone-flash');
 if(s.mode==='collapseFinal')state.collapseMatterSnapshot=[...state.pieces.values()].map(p=>({sym:p.sym,cell:p.cell}));
 tone(s.mode==='collapseFinal'?72:260,s.mode==='collapseFinal'?.48:.22,s.mode==='collapseFinal'?'sine':'triangle',s.mode==='collapseFinal'?.055:.035);await wait(s.mode==='collapseFinal'?720:520);advancePhase();
}
async function finishCampaign(){
 if(!state.phaseDone)return;$('phaseEndBtn').classList.remove('show');state.locked=true;dom.star.classList.add('phase-active');registerRewardDiscovery('phenomenon:blackHole',{title:'BURACO NEGRO',text:'O ciclo cósmico terminou em um remanescente extremo.',silent:true});playScientificSignature('blackHole');announce('CICLO CÓSMICO','CONCLUÍDO','O Buraco Negro permanece como remanescente final desta jornada.');tone(72,.75,'sine',.055);vibrate([22,40,32,55]);toast('Ciclo cósmico concluído · use o Menu para revisitar as fases.');
}
function endPhaseAction(){
 const s=phase();if(!state.readyToAdvance)return;
 state.phaseDone=true;state.locked=true;stopPrimordialDrift();cancelParticleDrag();stopAccretionFeed();stopCosmicRaySystem();stopNeutronSystem();
 if(isPrimordial(s))return advancePrimordial();if(s.endEvent==='finale')return finishCampaign();if(s.endEvent==='postTransition')return compactAdvance();return scatterStage()
}
function advancePhase(){const next=(state.phaseIndex+1)%PHASES.length;startPhase(next,true)}
function startPhase(index,announcePhase=true,forcePopup=false){state.phaseIndex=Math.max(0,Math.min(PHASES.length-1,index));const s=phase(),captureIndex=phaseIndexById.get('proton_capture')??Infinity,neutronCaptureIndex=phaseIndexById.get('primordial_t')??Infinity,redIndex=phaseIndexById.get('he_red')??1,preserved=s.mode==='blackhole'&&Array.isArray(state.collapseMatterSnapshot)&&state.collapseMatterSnapshot.length?[...state.collapseMatterSnapshot]:null;if(state.phaseIndex>redIndex)state.ignited=true;if(state.phaseIndex>=captureIndex)state.protonCaptureUnlocked=true;if(state.phaseIndex>=neutronCaptureIndex)state.neutronCaptureUnlocked=true;state.phaseDone=false;state.readyToAdvance=false;state.flow=0;state.flowMilestones=new Set();resetChainFeedback();state.locked=false;state.popupOpen=false;state.popupKind=null;state.lessonResolver=null;state.phaseMilestoneAnnounced=false;state.created={};state.nextMatterOrigin=1;state.objectiveLineages=new Set();state.protonCaptures=0;state.protonCaptureProducts={};state.protonCaptureAttempts={};state.rpIonized=0;state.rpPhotoReturns=0;state.rpCyclesObserved=0;state.rpWaitDecays=0;state.neutronSourceActivations=0;state.neutronPulsesObserved=0;state.neutronBranchesObserved=0;state.neutronBetaWaits=0;state.neutronFreezeouts=0;state.neutronStormsObserved=0;state.fusionAttempts={};state.atlasProgress=0;state.atlasAttempts={};state.atlasBarrierPassed={};state.atlasPhaseTooltipSeen=false;state.coulombRepulsions=0;state.convectionCharge=0;state.convectionArmed=false;state.convectionConfirmPending=false;state.convectionPathCells=[];state.convectionMoves=0;state.convectionLessonShown=false;state.neutronBirths=0;state.primordialDByProton=0;state.primordialDByNeutron=0;state.nuclearRound=0;state.crushed=0;state.absorbed=0;state.postInitialMatter=0;state.explosiveHits=0;state.decayFound=new Set();state.postHoldLearned=false;state.blackHoleSelected=false;state.radioactiveProofDone=false;state.selected=[];state.contextRecipeKey=null;state.infoSelection=null;state.stratificationCoreGroup=null;if(state.tooltipOpen){const tip=$('eventTooltip');tip?.classList.remove('show');tip?.setAttribute('aria-hidden','true');state.tooltipOpen=false;state.tooltipResolver=null;dom.star.classList.remove('event-paused')}stopPrimordialDrift();stopAccretionFeed();stopCosmicRaySystem();if(state.crushTimer)clearTimeout(state.crushTimer);if(state.coreHoldTimer)clearTimeout(state.coreHoldTimer);state.crushTimer=null;state.crushId=null;state.coreHoldTimer=null;dom.remnantCore?.classList.remove('core-hold');dom.star.classList.remove('core-collapsing');stopNeutronSystem();$('stellarIntro').classList.remove('show');$('phaseEndBtn').classList.toggle('show',state.readyToAdvance);$('explosion').innerHTML='';dom.pieces.classList.remove('hidden');dom.star.classList.remove('critical','phase-active','neutron-active','milestone-flash','ignition-flash','remnant-mode','blackhole-mode','post-active','primordial-transition','spallation-mode','decay-mode','electron-network','white-electron-network','white-structure','cumulative-shells');applyGeometry();if(preserved){restoreMatterSnapshot(preserved);state.collapseMatterSnapshot=null}else{if(s.mode!=='blackhole')state.collapseMatterSnapshot=null;fillStage()}if(s.mode==='blackhole')state.postInitialMatter=state.pieces.size;ensureCumulativeParticleFuel(s);const popupShown=showStellarPopup(forcePopup);if(!popupShown&&['neutron','neutronize'].includes(s.mode))setTimeout(startNeutronSystem,420);if(!popupShown&&s.mode==='accretion')startAccretionFeed();if(!popupShown&&['spallation','neutrino','gamma'].includes(s.mode))startCosmicRaySystem();if(announcePhase&&!popupShown)announce(s.branch,s.title,s.mode==='showcase'?s.meta:(s.mode==='neutronize'?s.meta:s.meta||`Novo: ${E[s.new].name}`));save();render();if(s.mode==='campaignMilestone')setTimeout(checkComplete,80)}
function modalPrimaryLine(s=phase()){
 if(s.mode==='campaignMilestone')return s.meta;
 if(s.mode==='reactionExplore')return atlasSymbolicLine(s);
 if(s.mode==='opening')return 'Universo quente e denso → expansão';
 if(s.mode==='primordialNuclear')return primordialReactionById(s.recipeId)?.label||s.meta;
 if(s.id==='atomic_he')return '⁴He²⁺ + 2e⁻ → He';
 if(s.id==='atomic_h')return 'p + e⁻ → H + γ';
 if(s.id==='atomic_li')return '⁷Li³⁺ + 3e⁻ → Li';
 if(s.id==='brown')return '²H + H → ³He + γ';
 if(s.id==='he_red')return 'He instável + He instável → He estável';
 if(s.id==='he_orange')return 'H + H → ²H   ·   ²H + H → ³He';
 if(s.id==='he_yellow')return '³He + ³He → He';
 if(s.id==='coulomb_intro')return '³He + ³He → ⁴He + 2p';
 if(s.mode==='convection')return 'Reação nuclear no interior → energia → corrente convectiva';
 if(s.id==='stellar_li')return '³He + ⁴He → ⁷Be + γ → ⁷Li + νₑ';
 if(s.id==='fragile')return 'Hélio + Hélio → Berílio-8 instável';
 if(s.id==='c')return 'Berílio-8 + Hélio → Carbono + γ';
 if(s.id==='n')return 'Carbono + Hidrogênio → Nitrogênio';
 if(s.id==='o')return 'Carbono + Hélio → Oxigênio + γ';
 if(s.mode==='whiteCompact')return 'Hélio → Berílio-8 → Carbono → Oxigênio';
 if(s.mode==='protonCapture')return 'p + núcleo → novo estado nuclear';
 if(s.mode==='rpProcess')return rpStep(s)?.label||'capturas rápidas de prótons';
 if(s.mode==='spallation')return `Raio cósmico + C / N / O → ${E[s.new].name}`;
 if(s.mode==='neutrino')return 'ν + Neônio → Flúor';
 if(s.mode==='gamma')return 'Fóton (γ) + núcleo pesado → remove nêutron';
 if(s.mode==='explosive')return 'Choque da Supernova → elementos do grupo do Ferro e Zinco';
 if(s.mode==='guidedDecay')return guidedDecayNextRecipeLine(s);
 if(s.mode==='decayGarden')return 'Decaimentos α e β− → novos descendentes';
 if(s.mode==='neutron'){
   if(s.id==='co')return 'Fe + n → Fe instável → β− + ν̄ₑ → Co';
   const from=Array.isArray(s.path)?s.path[0]:s.seed;
   const g=neutronGameplay(s),src=neutronSourceLabel(s);if(g.requiresSource&&state.neutronSourceActivations<1&&src)return src;if(g.pattern==='shell')return `${from} · acumule exposição de nêutrons → ${s.new}`;if(g.pattern==='branch')return `${from} + n · capturar novamente ou aguardar β− → ${s.new}`;if(g.pattern==='rFreezeout')return `${from} + muitos n → freeze-out → cascata β− → ${s.new}`;if(s.rprocess)return `${from} + vários nêutrons → cascata β− + ν̄ₑ → ${s.new}`;
   return `${from} + nêutron → β− + ν̄ₑ → ${s.new}`;
 }
 if(s.mode==='neutronize')return 'compressão + e⁻ → n + νₑ';
 if(s.mode==='remnant')return 'Matéria comprimida → Estrela de Nêutrons';
 if(s.mode==='pulsar')return 'Acreção + rotação → Pulsar mais rápido';
 if(s.mode==='accretion')return 'Matéria em queda → remanescente mais massivo';
 if(s.mode==='collapseFinal')return 'Massa crítica → colapso gravitacional';
 if(s.mode==='blackhole')return 'Buraco Negro + Átomo → Acreção';
 if(s.mode==='fusion'){
   const r=phaseFusionRecipe(s);if(r)return fusionLabel(r);
 }
 return s.meta||'Explore o processo desta fase';
}
function modalSecondaryLine(s=phase()){
 if(s.id==='first_enrichment')return 'O que foi fabricado dentro da primeira estrela agora pode compor o gás da próxima geração';
 if(s.id==='second_birth')return 'Compare: C, N e O antes precisavam ser fabricados; agora já fazem parte da matéria inicial';
 if(s.id==='second_enrichment')return 'Produtos de AGB, espalação e Kilonova entram no reservatório químico compartilhado';
 if(s.id==='third_birth')return 'A matéria inicial já contém representantes do processo-s e do processo-r';
 if(s.mode==='campaignMilestone')return 'Observe a herança química e prossiga para a próxima geração';
 if(s.mode==='reactionExplore')return atlasPhaseInstruction(s);
 if(s.mode==='opening')return 'Inicie o Big Bang';
 if(s.id==='primordial_d')return 'Selecione um próton e depois um nêutron';
 if(s.id==='primordial_t')return 'Selecione ²H e depois um nêutron';
 if(s.id==='primordial_he3')return 'Selecione ²H e depois um próton';
 if(s.id==='primordial_he3d')return 'Selecione ³He e depois ²H';
 if(s.id==='primordial_td')return 'Selecione ³H e depois ²H';
 if(s.id==='primordial_li')return 'Selecione ⁴He e depois ³H';
 if(s.id==='atomic_he')return 'Selecione o núcleo de Hélio e depois um elétron';
 if(s.id==='atomic_h')return 'Selecione um próton e depois um elétron';
 if(s.id==='atomic_li')return 'Selecione o núcleo de Lítio e depois um elétron';
 if(s.id==='brown')return 'Consuma o reservatório finito de Deutério';
 if(s.id==='he_red')return 'Una dois Hélios instáveis';
 if(s.id==='ni_fusion')return 'Represente a queima de Silício formando Níquel';
 if(s.id==='he_orange')return 'Aprenda os dois primeiros passos da cadeia próton-próton';
 if(s.id==='he_yellow')return 'Complete a cadeia formando Hélio estável';
 if(s.id==='coulomb_intro')return 'Tente fundir os Hélios-3 da periferia e descubra como a posição muda a reação';
 if(s.mode==='convection')return '';
 if(s.id==='stellar_li')return 'Forme ⁷Be e transporte-o para uma camada externa antes da captura eletrônica';
 if(s.id==='fragile')return 'Use o núcleo instável antes que ele se desfaça';
 if(s.id==='carbon_burn')return 'Selecione um Carbono e depois outro Carbono';
 if(s.id==='carbon_oxygen')return 'Selecione Carbono e depois Oxigênio';
 if(s.id==='oxygen_burn')return 'Selecione um Oxigênio e depois outro Oxigênio';
 if(s.id==='cr_alpha_fe')return 'Selecione Cromo e depois Hélio';
 if(s.mode==='whiteCompact')return 'Crie C e O; a estratificação levará o núcleo ao interior';
 if(s.mode==='protonCapture')return 'Selecione um próton livre e depois escolha um núcleo';
 if(s.mode==='rpProcess'){const step=rpStep(s);if(step?.fuel==='H')return 'Toque em H para ionizar; depois use o próton no núcleo-semente';if(step?.pattern==='waiting')return 'Capture o próton e acompanhe o núcleo proton-rich enquanto as rodadas passam';if(step?.pattern==='cycle')return 'Forme Telúrio e observe o retorno agregado ao ciclo Sn–Sb–Te';return 'Selecione um próton livre e depois o núcleo-semente';}
 if(s.mode==='spallation')return `Quebre núcleos para produzir ${E[s.new].name}`;
 if(s.mode==='neutrino')return 'Selecione ν e depois um núcleo de Neônio';
 if(s.mode==='gamma')return 'Use fótons energéticos para alterar isótopos';
 if(s.mode==='explosive')return `Produza ${E[s.new]?.name||'novos elementos'} durante o choque`;
 if(s.mode==='guidedDecay')return 'Aperte e segure um átomo → decaimento';
 if(s.mode==='decayGarden')return 'Aperte e segure um átomo → decaimento';
 if(s.mode==='neutron'){const g=neutronGameplay(s),label=neutronPatternLabel(s);if(s.id==='co')return'Capture n no Ferro e depois segure o Ferro instável';if(g.source)return`${label}: selecione ${E[g.source].name} e depois Hélio para liberar um pulso`;if(g.pattern==='shell')return`${label}: exponha a semente a vários nêutrons antes da captura efetiva`;if(g.pattern==='branch')return`${label}: após a captura, escolha outro n ou deixe β− acontecer`;if(g.pattern==='rFreezeout')return`${label}: carregue a semente durante a tempestade e observe o silêncio do freeze-out`;return s.rprocess?`${label}: capture vários nêutrons antes da cascata β−`:`${label}: capture nêutrons e acompanhe os decaimentos β−`;}
 if(s.mode==='neutronize')return 'Comprima 8 núcleos em nêutrons';
 if(s.mode==='remnant')return 'Incorpore matéria ao remanescente';
 if(s.mode==='pulsar')return 'Incorpore matéria e acelere os feixes';
 if(s.mode==='accretion')return 'Alimente o remanescente com nova matéria';
 if(s.mode==='collapseFinal')return 'Supere o limite de estabilidade';
 if(s.mode==='blackhole')return 'Selecione o Buraco Negro e depois selecione um átomo';
 if(s.new&&E[s.new])return `Produza ${E[s.new].name} usando o que já aprendeu`;
 return 'Explore o fenômeno e prossiga quando concluir';
}
function phaseIntroGroup(s=phase()){
 if(s.mode==='reactionExplore')return 'Atlas de fusões até o Ferro';
 if(s.mode==='opening')return 'Universo primordial';
 if(s.mode==='primordialNuclear')return 'Nucleossíntese primordial';
 if(s.mode==='atomicRecombination')return 'Era atômica';
 return phaseFamily(s);
}
function phaseIntroTitle(s=phase(),base={}){
 const special={primordial_d:'PRIMEIRO NÚCLEO',primordial_t:'TRÍTIO',primordial_he3:'HÉLIO-3',primordial_he3d:'HÉLIO-4',primordial_td:'HÉLIO-4',primordial_li:'LÍTIO-7',atomic_he:'HÉLIO',atomic_h:'HIDROGÊNIO',atomic_li:'LÍTIO',coulomb_intro:'BARREIRA DE COULOMB',stellar_convection:'CONVECÇÃO ESTELAR',stellar_li:'LÍTIO ESTELAR'};
 return special[s.id]||String(s.title||base.title||'FASE').toUpperCase();
}
function showStellarPopup(force=false){
 const s=phase(),baseKey=stellarKeyForPhase(),base=STELLAR_POPUPS[baseKey];if(!base)return false;const key=`phase:${s.id}`;
 if(!force&&state.lastStellarKey===key)return false;let data={...base,kicker:phaseIntroGroup(s),title:phaseIntroTitle(s,base),sub:modalPrimaryLine(s),line:modalSecondaryLine(s),art:base.art||baseKey};
 if(s.id==='primordial_td')data={...data,sub:'³H + ²H → ⁴He + n',line:'Selecione ³H e depois ²H'};
 if(s.id==='ni_fusion')data={...data,title:'FORMAÇÃO DE NÍQUEL'};
 if(s.id==='co')data={...data,title:'FORMAÇÃO DE COBALTO'};
 if(s.mode==='guidedDecay'&&E[s.new])data={...data,title:E[s.new].name.toUpperCase(),art:'interstellar'};
 if(s.micro&&s.mode!=='reactionExplore'&&E[s.new])data={...data,title:E[s.new].name.toUpperCase()};
 if(['neutrino','gamma','guidedDecay'].includes(s.mode))data={...data,art:s.mode==='guidedDecay'?'interstellar':(base.art||baseKey)};
 state.lastStellarKey=key;state.popupOpen=true;state.popupKind='phase';state.locked=true;stopNeutronSystem();stopCosmicRaySystem();$('stellarStartBtn').textContent='COMEÇAR';
 $('introKicker').textContent=data.kicker;$('introTitle').textContent=data.title;$('introSub').textContent=data.sub;$('introLine').textContent=data.line;
 const art=$('stellarArt');if(art)art.className=`stellar-art ${data.art||baseKey}`;
 $('stellarIntro').classList.add('show');return true;
}
function closeStellarPopup(){
 const intro=$('stellarIntro');if(!state.popupOpen&&!intro?.classList.contains('show'))return;intro?.classList.remove('show');state.popupOpen=false;state.popupKind=null;$('stellarStartBtn').textContent='COMEÇAR';
 state.locked=state.phaseDone;if(!state.phaseDone&&['neutron','neutronize'].includes(phase().mode))startNeutronSystem();if(!state.phaseDone&&phase().mode==='accretion')startAccretionFeed();if(!state.phaseDone&&['spallation','neutrino','gamma'].includes(phase().mode))startCosmicRaySystem();if(isPrimordial()&&phase().mode!=='opening')startPrimordialDrift();render();setTimeout(flashRecipeTwice,70);
}

function phaseFamily(p){
 if(p.mode==='campaignMilestone')return p.branch;
 if(p.mode==='reactionExplore')return 'Atlas de fusões até o Ferro';
 if(p.mode==='opening'||p.mode==='primordialNuclear')return 'Universo primordial · nucleossíntese';
 if(p.mode==='atomicRecombination')return 'Era atômica · recombinação';
 if(['brown','he_red','he_orange','he_yellow','coulomb_intro','stellar_convection','stellar_li','fragile','c','n','o'].includes(p.id))return 'Estrelas de baixa e média massa';
 if(p.mode==='spallation'||p.mode==='guidedDecay')return p.mode==='guidedDecay'?'Tempo cósmico · radioatividade':'Meio interestelar';
 if(p.mode==='rpProcess')return 'Estrela de nêutrons em acreção · rp-process';
 if(p.mode==='protonCapture'||p.mode==='neutrino'||p.mode==='gamma'||['carbon_burn','carbon_oxygen','oxygen_burn','cr_alpha_fe','ne','na','mg','al','si','p','s','cl','ar','k','ca','sc','ti','v','cr','mn','fe','neutronize','co','ni_fusion'].includes(p.id))return 'Estrelas massivas e supernovas';
 if(p.weakS)return 'Outra estrela massiva · processo-s fraco';
 if(['rb','sr','y','zr','nb','tc','rh','pd','ag','cd','in','sn','sb','te','i','xe','cs','ba','la','ce','pr','nd','pm','sm','pb','bi'].includes(p.id))return 'Estrelas AGB · processo-s e rotas vizinhas';
 if(['eu','gd','tb','dy','ho','er','tm','yb','lu','hf','ta','w','re','os','ir','pt','au','hg','tl','th','u'].includes(p.id))return 'Kilonova · processo-r';
 return 'Remanescentes compactos'
}
function reactionScopeLabel(r,s=phase()){if(r?.aggregate||(r===phaseFusionRecipe(s)&&/agregad/i.test(s.meta||'')))return'ROTA AGREGADA';return''}
function renderMenu(){renderDiscoveryAtlas();const pm=$('phaseMenu');pm.innerHTML='';let family='';PHASES.forEach((p,i)=>{const f=phaseFamily(p);if(f!==family){family=f;const h=document.createElement('div');h.className='phase-family';h.textContent=f;pm.appendChild(h)}const b=document.createElement('button');b.className='phase-jump'+(i===state.phaseIndex?' current':'');b.innerHTML=`<span class="idx">${i+1}</span><span><strong>${p.title}</strong><small>${p.branch}</small></span><span class="new"></span>`;b.querySelector('.new').textContent=p.menuTag||(p.mode==='showcase'?'★':p.mode==='neutronize'?'GRAVIDADE':E[p.new].name);b.addEventListener('click',()=>{$('menuModal').classList.remove('show');startPhase(i,true,true)});pm.appendChild(b)});const rc=$('reactionCatalog');if(rc){rc.innerHTML='';
  const primordialActive=isPrimordial(phase())&&phase().mode!=='opening';
  learnedPrimordialNuclearReactions().forEach(r=>{const b=document.createElement('button');b.className='reaction-chip'+(primordialActive?' available':'');b.textContent=r.label;b.addEventListener('click',()=>{const $d=$('reactionDetail');if($d)$d.innerHTML=`<strong>${r.label}</strong><span>${primordialActive?'Disponível com reagentes compatíveis nesta era':'Receita primordial aprendida · permanece no repertório'}</span><p>Reação nuclear descoberta durante a nucleossíntese primordial. O ambiente e os reagentes presentes determinam quando ela pode voltar a ocorrer.</p>`});rc.appendChild(b)});
  for(const sym of ['He','H','Li'])if(atomicRecombinationLearned(sym)){const labels={He:'He²⁺ + 2e⁻ → He + γ',H:'p + e⁻ → H + γ',Li:'Li³⁺ + 3e⁻ → Li + γ'},available=phase().mode==='atomicRecombination';const b=document.createElement('button');b.className='reaction-chip'+(available?' available':'');b.textContent=labels[sym];b.addEventListener('click',()=>{const $d=$('reactionDetail');if($d)$d.innerHTML=`<strong>${labels[sym]}</strong><span>${available?'Recombinação eletrônica disponível nesta era':'Receita atômica aprendida · permanece no repertório'}</span><p>Os elétrons ligam-se ao núcleo em etapas até neutralizar sua carga. Em plasma quente, o mesmo conhecimento permanece enquanto o ambiente favorece ionização.</p>`});rc.appendChild(b)}
  const activeNow=new Set(activeFusionRecipes());learnedFusionRecipes().forEach(r=>{const b=document.createElement('button');b.className='reaction-chip'+(activeNow.has(r)?' available':'');b.textContent=fusionLabel(r);b.addEventListener('click',()=>{const min=fusionMinTemp(r),max=Number(phase().fusionTempMax||0),$d=$('reactionDetail'),scope=reactionScopeLabel(r);if($d)$d.innerHTML=`<strong>${fusionLabel(r)}</strong><span>${activeNow.has(r)?'Disponível com reagentes compatíveis nesta fase':'Receita aprendida · permanece no repertório'}${scope?` · ${scope}`:''}</span><p>${min?(max?`Contexto térmico: limiar didático ~${sci(min,1)} K · ambiente atual ~${sci(max,1)} K.`:`Contexto térmico da reação: ~${sci(min,1)} K.`):'Reação conhecida.'}</p>`});rc.appendChild(b)});if(phase().mode==='neutron')learnedNeutronTransitions(phase()).forEach(tr=>{const b=document.createElement('button');b.className='reaction-chip available';b.textContent=`${tr.from} + n → β− → ${tr.to}`;b.addEventListener('click',()=>{const $d=$('reactionDetail');if($d)$d.innerHTML=`<strong>${tr.from} → ${tr.to}</strong><span>Rota de captura já desbloqueada e compatível com este ambiente.</span><p>${tr.rprocess?'Múltiplas capturas rápidas são agregadas antes da cascata β−.':'Captura de nêutron e β− são representados de forma agregada.'}</p>`});rc.appendChild(b)})}
const pc=$('protonCaptureCatalog'),pd=$('protonCaptureDetail');if(pc){pc.innerHTML='';if(state.protonCaptureUnlocked||phase().mode==='protonCapture'){Object.entries(PROTON_CAPTURES).forEach(([from,r])=>{const b=document.createElement('button'),open=!!protonCaptureRoute(from,phase()),label=r.label||`${E[from]?.symbol||from} + p → ${r.out}`;b.className='reaction-chip'+(open?' available':'');b.textContent=label;b.addEventListener('click',()=>{if(!pd)return;let status=open?'Rota compatível com o ambiente atual':'Rota conhecida; a captura encontra uma barreira forte neste ambiente',detail='Ao aproximar cargas positivas, a repulsão cresce com a carga nuclear. Ambientes mais energéticos aumentam a chance de chegar à região onde a reação pode ocorrer.';if(r.decay?.mode==='returnProton'){status=`Estado não ligado · dura ${r.decay.rounds} rodada`;detail=`${r.decay.label}. O núcleo treme durante a janela de instabilidade e depois reemite o próton.`}else if(r.decay?.mode==='betaPlus'){status=`Núcleo proton-rich · ${r.decay.rounds} ${r.decay.rounds===1?'rodada':'rodadas'} até β+`;detail=`${r.decay.label}. As rodadas representam estabilidade relativa dentro do jogo, não uma conversão literal da meia-vida.`}else if(r.out==='Be8'){status='Núcleo instável · janela do ⁸Be';detail='O ⁸Be treme por duas rodadas: pode receber Hélio e formar Carbono ou se desfazer em dois núcleos de Hélio.'}pd.innerHTML=`<strong>${label}</strong><span>${status}</span><p>${detail}</p>`});pc.appendChild(b)})}else{pc.innerHTML='<span style="font-size:10px;color:#8fa6ce">Descubra esta habilidade durante a evolução estelar.</span>';}}
const c=$('catalog');c.innerHTML='';ORDER.forEach(sym=>{const e=E[sym],d=document.createElement('div');d.className='el-card';d.innerHTML=`<div class="n">${e.n}</div><div class="s">${sym}</div><div class="nm">${e.name}</div>`;d.addEventListener('click',()=>{$('catalogDetail').innerHTML=`<strong>${e.name} — ${e.n}</strong><span>${e.origin}</span>${e.route?`<span>Rota no jogo: ${e.route}</span>`:''}${e.stability?`<span>Estabilidade: ${e.stability}</span>`:''}<p>${e.process}</p>`});c.appendChild(d)})}
function bindReliableTap(el,action){
 if(!el||typeof action!=='function')return;let lastPointerUp=0;
 el.addEventListener('pointerup',ev=>{lastPointerUp=performance.now();ev.preventDefault();ev.stopPropagation();action()},true);
 el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();if(performance.now()-lastPointerUp<650)return;action()},true);
}
function bindPhaseStart(el){
 if(!el)return;let lastActivation=0;
 el.style.touchAction='manipulation';el.style.pointerEvents='auto';el.style.position='relative';el.style.zIndex='24';
 const activate=ev=>{
  const intro=$('stellarIntro');if(!state.popupOpen&&!intro?.classList.contains('show'))return;
  if(ev?.pointerType==='mouse'&&Number.isFinite(ev.button)&&ev.button!==0)return;
  const now=performance.now();if(now-lastActivation<450)return;lastActivation=now;
  ev?.preventDefault?.();ev?.stopPropagation?.();closeStellarPopup();
 };
 el.addEventListener('pointerdown',activate,true);
 el.addEventListener('click',activate,true);
 if(!window.PointerEvent)el.addEventListener('touchstart',activate,{capture:true,passive:false});
}
$('phaseEndBtn').addEventListener('click',endPhaseAction);bindReliableTap($('eventTooltipBtn'),closeEventTooltip);bindReliableTap($('ambientContinueBtn'),rewardDirectorDismiss);dom.singularity.addEventListener('click',launchBigBang);dom.remnantCore.addEventListener('contextmenu',ev=>ev.preventDefault());dom.remnantCore.addEventListener('selectstart',ev=>ev.preventDefault());dom.remnantCore.addEventListener('pointerdown',beginCoreHold);dom.remnantCore.addEventListener('pointerup',cancelCoreHold);dom.remnantCore.addEventListener('pointercancel',cancelCoreHold);if(!window.PointerEvent){dom.remnantCore.addEventListener('touchstart',ev=>{ev.preventDefault();beginCoreHold(ev)},{passive:false});dom.remnantCore.addEventListener('touchend',ev=>{ev.preventDefault();cancelCoreHold()},{passive:false});dom.remnantCore.addEventListener('touchcancel',cancelCoreHold,{passive:false})}bindPhaseStart($('stellarStartBtn'));$('menuOpenBtn').addEventListener('click',()=>{renderMenu();$('menuModal').classList.add('show')});$('closeMenu').addEventListener('click',()=>$('menuModal').classList.remove('show'));
window.addEventListener('resize',()=>{applyGeometry();drawCells();state.pieces.forEach(p=>{if(!p.free&&p.cell!==null){const q=pos(coords[p.cell]);p.x=q.x;p.y=q.y}else if(p.free){p.x=Math.max(28,Math.min(starSize()-28,p.x));p.y=Math.max(28,Math.min(starSize()-28,p.y))}});render()});
load();applyGeometry();startPhase(state.phaseIndex,false,true);
})();
