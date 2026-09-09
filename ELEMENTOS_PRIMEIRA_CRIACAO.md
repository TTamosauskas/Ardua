# Primeira criação dos elementos na trilha

Este arquivo registra, para cada elemento químico de Hidrogênio (Z=1) a Urânio (Z=92), a primeira fase canônica da campanha em que o elemento é criado.

- **Posição**: índice 1-based em `ARDUA_CAMPAIGN_GRAPH.baseOrder`.
- Fases de atlas injetadas em tempo de execução ficam fora desta numeração.
- A coluna **Nome exibido** acompanha a nomenclatura aplicada por `campaign-forge-names.js` quando a primeira criação jogável recebe o prefixo `Forjar`.
- **Hélio** possui duas rotas paralelas equivalentes na convergência primordial; concluir qualquer uma delas libera sua caixa em Descobertas.
- No modo editor, todas as caixas permanecem disponíveis.

| Z | Elemento | Símbolo | Nome exibido da primeira fase | ID da fase | Posição | Trecho da trilha |
|---:|---|:---:|---|---|---:|---|
| 1 | Hidrogênio | H | Big Bang | `bigbang` | 1 | Abertura |
| 2 | Hélio | He | Forjar Hélio / Hélio-4 via Trítio | `primordial_he3d` / `primordial_td` | 5 / 6 | Nucleossíntese primordial · convergência (ramo Hélio-3) / Nucleossíntese primordial · convergência (ramo Trítio) |
| 3 | Lítio | Li | Forjar Lítio | `primordial_li` | 7 | Nucleossíntese primordial · traços de Lítio |
| 4 | Berílio | Be | Forjar Berílio | `spallation_be` | 30 | Espalação cósmica · Berílio |
| 5 | Boro | B | Forjar Boro | `spallation` | 31 | Espalação cósmica · Boro |
| 6 | Carbono | C | Forjar Carbono | `c` | 27 | Formação de Carbono |
| 7 | Nitrogênio | N | Forjar Nitrogênio | `n` | 28 | Enriquecimento em Nitrogênio |
| 8 | Oxigênio | O | Forjar Oxigênio | `o` | 29 | Formação de Oxigênio |
| 9 | Flúor | F | Forjar Flúor | `nu_f` | 58 | Supernova · neutrinos |
| 10 | Neônio | Ne | Forjar Neônio | `carbon_burn` | 33 | Estrela massiva · queima de Carbono |
| 11 | Sódio | Na | Forjar Sódio | `proton_capture` | 35 | Nova habilidade · reação nuclear |
| 12 | Magnésio | Mg | Forjar Magnésio | `carbon_oxygen` | 37 | Estrela massiva · fusão de íons pesados |
| 13 | Alumínio | Al | Forjar Alumínio | `al` | 39 | A forja acelera |
| 14 | Silício | Si | Forjar Silício | `oxygen_burn` | 40 | Estrela massiva · queima de Oxigênio |
| 15 | Fósforo | P | Forjar Fósforo | `p` | 42 | Microfase · rede de estrela massiva |
| 16 | Enxofre | S | Forjar Enxofre | `s` | 43 | Forja em camadas |
| 17 | Cloro | Cl | Forjar Cloro | `cl` | 44 | Microfase · rede de estrela massiva |
| 18 | Argônio | Ar | Forjar Argônio | `ar` | 45 | Forja em camadas |
| 19 | Potássio | K | Forjar Potássio | `k` | 46 | Microfase · rede explosiva |
| 20 | Cálcio | Ca | Forjar Cálcio | `ca` | 47 | Forja em camadas |
| 21 | Escândio | Sc | Forjar Escândio | `sc` | 48 | Microfase · nucleossíntese explosiva |
| 22 | Titânio | Ti | Forjar Titânio | `ti` | 49 | Forja em camadas |
| 23 | Vanádio | V | Forjar Vanádio | `v` | 50 | Microfase · vizinhança do grupo do Ferro |
| 24 | Cromo | Cr | Forjar Cromo | `cr` | 51 | Queima avançada |
| 25 | Manganês | Mn | Forjar Manganês | `mn` | 52 | Queima avançada |
| 26 | Ferro | Fe | Forjar Ferro | `cr_alpha_fe` | 53 | Núcleo profundo · cadeia alfa |
| 27 | Cobalto | Co | Forjar Cobalto | `co` | 56 | Grupo do Ferro · Cobalto |
| 28 | Níquel | Ni | Forjar Níquel | `ni_fusion` | 57 | Queima de Silício · Níquel |
| 29 | Cobre | Cu | Forjar Cobre | `weak_s_cu` | 59 | Processo-s fraco |
| 30 | Zinco | Zn | Forjar Zinco | `weak_s_zn` | 60 | Processo-s fraco |
| 31 | Gálio | Ga | Forjar Gálio | `weak_s_ga` | 61 | Processo-s fraco |
| 32 | Germânio | Ge | Forjar Germânio | `weak_s_ge` | 62 | Processo-s fraco |
| 33 | Arsênio | As | Forjar Arsênio | `weak_s_as` | 63 | Processo-s fraco |
| 34 | Selênio | Se | Forjar Selênio | `weak_s_se` | 64 | Processo-s fraco |
| 35 | Bromo | Br | Forjar Bromo | `weak_s_br` | 65 | Processo-s fraco |
| 36 | Criptônio | Kr | Forjar Criptônio | `weak_s_kr` | 66 | Processo-s fraco |
| 37 | Rubídio | Rb | Forjar Rubídio | `rb` | 67 | Estrela AGB · processo-s |
| 38 | Estrôncio | Sr | Forjar Estrôncio | `sr` | 68 | Estrela AGB · processo-s |
| 39 | Ítrio | Y | Forjar Ítrio | `y` | 69 | Estrela AGB · processo-s |
| 40 | Zircônio | Zr | Forjar Zircônio | `zr` | 70 | Estrela AGB · processo-s |
| 41 | Nióbio | Nb | Forjar Nióbio | `nb` | 71 | Estrela AGB · processo-s |
| 42 | Molibdênio | Mo | Forjar Molibdênio | `gamma_mo` | 72 | Estrela AGB · processo-s |
| 43 | Tecnécio | Tc | Forjar Tecnécio | `tc` | 73 | Estrela AGB · processo-s |
| 44 | Rutênio | Ru | Forjar Rutênio | `gamma_ru` | 74 | Estrela AGB · processo-s |
| 45 | Ródio | Rh | Forjar Ródio | `rh` | 76 | Estrela AGB · processo-s |
| 46 | Paládio | Pd | Forjar Paládio | `pd` | 77 | Estrela AGB · processo-s |
| 47 | Prata | Ag | Forjar Prata | `ag` | 78 | Estrela AGB · processo-s |
| 48 | Cádmio | Cd | Forjar Cádmio | `cd` | 79 | Estrela AGB · processo-s |
| 49 | Índio | In | Forjar Índio | `in` | 80 | Estrela AGB · processo-s |
| 50 | Estanho | Sn | Forjar Estanho | `sn` | 81 | Estrela AGB · processo-s |
| 51 | Antimônio | Sb | Forjar Antimônio | `sb` | 82 | Estrela AGB · processo-s |
| 52 | Telúrio | Te | Forjar Telúrio | `te` | 83 | Estrela AGB · processo-s |
| 53 | Iodo | I | Forjar Iodo | `i` | 84 | Estrela AGB · processo-s |
| 54 | Xenônio | Xe | Forjar Xenônio | `xe` | 85 | Estrela AGB · processo-s |
| 55 | Césio | Cs | Forjar Césio | `cs` | 86 | Estrela AGB · processo-s |
| 56 | Bário | Ba | Forjar Bário | `ba` | 87 | Estrela AGB · processo-s |
| 57 | Lantânio | La | Forjar Lantânio | `la` | 88 | Estrela AGB · processo-s |
| 58 | Cério | Ce | Forjar Cério | `ce` | 89 | Estrela AGB · processo-s |
| 59 | Praseodímio | Pr | Forjar Praseodímio | `pr` | 90 | Estrela AGB · processo-s |
| 60 | Neodímio | Nd | Forjar Neodímio | `nd` | 91 | Estrela AGB · processo-s |
| 61 | Promécio | Pm | Forjar Promécio | `pm` | 92 | Estrela AGB · processo-s |
| 62 | Samário | Sm | Forjar Samário | `sm` | 93 | Estrela AGB · processo-s |
| 63 | Európio | Eu | Kilonova | `kilonova` | 97 | Terceira Geração · Evento de enriquecimento |
| 64 | Gadolínio | Gd | Forjar Gadolínio | `gd` | 99 | Kilonova · processo-r |
| 65 | Térbio | Tb | Forjar Térbio | `tb` | 100 | Kilonova · processo-r |
| 66 | Disprósio | Dy | Forjar Disprósio | `dy` | 101 | Kilonova · processo-r |
| 67 | Hólmio | Ho | Forjar Hólmio | `ho` | 102 | Kilonova · processo-r |
| 68 | Érbio | Er | Forjar Érbio | `er` | 103 | Kilonova · processo-r |
| 69 | Túlio | Tm | Forjar Túlio | `tm` | 104 | Kilonova · processo-r |
| 70 | Itérbio | Yb | Forjar Itérbio | `yb` | 105 | Kilonova · processo-r |
| 71 | Lutécio | Lu | Forjar Lutécio | `lu` | 106 | Kilonova · processo-r |
| 72 | Háfnio | Hf | Forjar Háfnio | `hf` | 107 | Kilonova · processo-r |
| 73 | Tântalo | Ta | Forjar Tântalo | `ta` | 108 | Kilonova · processo-r |
| 74 | Tungstênio | W | Forjar Tungstênio | `w` | 109 | Kilonova · processo-r |
| 75 | Rênio | Re | Forjar Rênio | `re` | 110 | Kilonova · processo-r |
| 76 | Ósmio | Os | Forjar Ósmio | `os` | 111 | Kilonova · processo-r |
| 77 | Irídio | Ir | Forjar Irídio | `ir` | 112 | Kilonova · processo-r |
| 78 | Platina | Pt | Forjar Platina | `pt` | 113 | Kilonova · processo-r |
| 79 | Ouro | Au | Forjar Ouro | `au` | 114 | Kilonova · processo-r |
| 80 | Mercúrio | Hg | Forjar Mercúrio | `hg` | 115 | Kilonova · processo-r |
| 81 | Tálio | Tl | Forjar Tálio | `tl` | 116 | Kilonova · processo-r |
| 82 | Chumbo | Pb | Forjar Chumbo | `pb` | 94 | Estrela AGB · processo-s |
| 83 | Bismuto | Bi | Forjar Bismuto | `bi` | 95 | Estrela AGB · processo-s |
| 84 | Polônio | Po | Forjar Polônio | `decay_po` | 124 | Cadeias radioativas |
| 85 | Astato | At | Forjar Astato | `decay_at` | 125 | Cadeias radioativas |
| 86 | Radônio | Rn | Forjar Radônio | `decay_rn` | 123 | Cadeias radioativas |
| 87 | Frâncio | Fr | Forjar Frâncio | `decay_fr` | 122 | Cadeias radioativas |
| 88 | Rádio | Ra | Forjar Rádio | `decay_ra` | 120 | Cadeias radioativas |
| 89 | Actínio | Ac | Forjar Actínio | `decay_ac` | 121 | Cadeias radioativas |
| 90 | Tório | Th | Forjar Tório | `th` | 117 | Kilonova · processo-r |
| 91 | Protactínio | Pa | Forjar Protactínio | `decay_pa` | 119 | Cadeias radioativas |
| 92 | Urânio | U | Forjar Urânio | `u` | 118 | Kilonova · processo-r |
