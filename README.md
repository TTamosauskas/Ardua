# Ardua

**Ardua** é um jogo casual e educativo de astrofísica nuclear executado diretamente no navegador.

Jogue online: https://ttamosauskas.github.io/Ardua/

## Executar

Abra `index.html` em um navegador moderno. O jogo permanece inteiramente estático: sem servidor, build, framework ou dependências de runtime.

Para desenvolvimento, um servidor local simples também funciona:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Estrutura

- `index.html` — marcação e ponto de entrada do jogo.
- `assets/css/ardua.css` — interface, animações e apresentação visual.
- `assets/js/ardua.js` — dados nucleares, fases, estado, regras, interação e renderização.
- `docs/ARCHITECTURE.md` — visão técnica e convenções de manutenção.

## Princípios técnicos

O projeto privilegia portabilidade e baixo atrito: JavaScript e CSS nativos, caminhos relativos e zero etapa de compilação. Mudanças de conteúdo e regras devem preservar a capacidade de abrir o jogo diretamente por `index.html`.

## Validação

A validação de estrutura pode ser executada sem instalar dependências:

```bash
node --check assets/js/ardua.js
node tests/validate-static.js
```

A campanha inclui uma sequência de rp-process na superfície de uma estrela de nêutrons em acreção, com fases individuais de Cobre a Telúrio, alternando H ionizável e prótons livres, waiting points, competição `(γ,p)` e o ciclo terminal Sn–Sb–Te.

## Regra de ingredientes por fase

Fases de produção começam com material pronto suficiente para concluir somente uma unidade do objetivo. Se a meta pede três Cobres, por exemplo, a fase rp começa com um único Níquel; as unidades restantes exigem reconstruir a cadeia a partir de matéria-base. O mesmo princípio vale para as fases s/r de captura de nêutrons: uma única semente direta e Ferro como ponto de reconstrução agregado.

A Receita Recomendada acompanha essa reconstrução e aponta para a próxima reação executável da cadeia.

## Fases de captura de nêutrons

O processo-s e o processo-r usam variações relaxantes da mesma mecânica central: fluxo lento, fontes `¹³C(α,n)`/`²²Ne(α,n)`, pulsos térmicos, espera β−, ramificações, cascas mágicas por exposição e tempestades-r com freeze-out. As fases continuam sem game over e mantêm uma única semente direta do objetivo; as demais precisam ser reconstruídas pelo jogador.

## Feedback e cascatas causais

Toda transformação que contribui para o fluxo da fase produz feedback global de reação e alimenta uma Ressonância Estelar visual temporária. Quando a geometria e uma rota nuclear já aprendida permitem, o produto pode iniciar uma continuação física curta: fusão com um vizinho compatível, captura de nêutron alinhada à trajetória no processo-r, nova captura de próton próximo no rp-process ou reciclagem de um produto energético por uma receita estelar válida.

As cascatas nunca substituem a ação principal do jogador. O primeiro elo automático recebe 25% do crédito normal de `flow`, o segundo 10% e os seguintes 0%; o bônus total de uma mesma cascata não pode ultrapassar 10% do `flowTarget`. Ao cumprir o objetivo científico, fases baseadas em `flow` recebem no máximo um piso de 75% de progresso, preservando o último quarto para interação manual. Barreira de Coulomb, waiting points, instabilidade nuclear e compatibilidade ambiental continuam valendo normalmente durante continuidades automáticas.

## Primeira ocorrência e matéria reciclada

Fenômenos especiais usam a mesma infraestrutura didática dos produtos nucleares: na primeira ocorrência de uma reação em cadeia, cascata de nêutrons, tempestade-r, cadeia de prótons, reciclagem nuclear, fonte de nêutrons, ramificação, waiting point, freeze-out ou ciclo Sn–Sb–Te, o jogo pausa antes da animação característica e exibe um tooltip explicativo. Ao fechar o aviso, a sequência retoma do ponto em que foi interrompida; as ocorrências seguintes seguem diretamente para a animação.

A fase de Berílio-8 usa um objetivo por **linhagem de matéria**. Cada núcleo recebe uma proveniência transitória que é combinada nas fusões e preservada quando `⁸Be → He + He`. Se exatamente a mesma linhagem for reunida novamente para formar ⁸Be, a reação continua fisicamente válida e seus efeitos aparecem, mas ela não aumenta outra vez o contador científico. Misturar ou incorporar matéria nova cria uma linhagem diferente e pode registrar uma nova formação independente. Essa proteção é ativada somente em objetivos explicitamente marcados como recicláveis e não altera a contagem das demais redes.

## Reaction Motif da receita-objetivo

Fusões manuais de dois núcleos recebem uma cerimônia audiovisual especial somente quando a reação executada é a **receita final que realmente aumenta o objetivo científico da fase**. Reações intermediárias usadas para reconstruir reagentes, fusões opcionais e continuidades automáticas de cascata permanecem no feedback normal e não disparam essa sequência.

Ao selecionar o primeiro reagente de um par objetivo que pode ser completado naquele tabuleiro, toca a primeira nota do motivo. O segundo reagente correto toca uma segunda nota diferente. Depois que a Barreira de Coulomb é superada e a reação é confirmada, os dois núcleos ganham protagonismo, aumentam de escala e ocupam posições simétricas à esquerda e à direita do centro da estrela; ao atingir esse alinhamento toca a terceira nota. Os reagentes convergem, o produto aparece centralizado e as mesmas três frequências soam juntas como um acorde. O contador do objetivo e a barra são atualizados nesse momento de resolução.

Cada receita usa um motivo determinístico, de modo que a mesma reação mantém sua identidade sonora. Produtos estáveis usam uma tríade mais resolvida, enquanto produtos instáveis recebem uma relação suspensa. Se a Barreira de Coulomb bloquear a tentativa, as duas notas de seleção permanecem válidas, mas a terceira nota e o acorde não ocorrem; a combinação fica silenciosamente rearmada para uma nova tentativa. Na fase de Berílio-8, matéria reciclada não recebe a cerimônia porque não acrescenta novo crédito ao objetivo. Durante o Reaction Motif, o áudio adaptativo e banners secundários cedem prioridade à reação principal, e `prefers-reduced-motion` reduz o deslocamento visual sem remover a informação sonora. As notas individuais receberam ganho e um harmônico superior para permanecerem audíveis em alto-falantes pequenos; no encerramento da cerimônia, o produto real já está pré-renderizado e oculto na célula de destino, de modo que o overlay apenas entrega a imagem ao tabuleiro e não existe uma segunda transformação visual. A mesma gramática audiovisual também cobre as receitas-objetivo do Universo primordial, a recombinação da Era atômica e as observações do Atlas de fusões. Interações manuais mediadas por partículas — nêutrons, prótons, elétrons, neutrinos, fótons gama e raios cósmicos — usam o mesmo palco de destaque; no processo-s, isso inclui tanto a ativação das fontes `¹³C(α,n)`/`²²Ne(α,n)` quanto as capturas de nêutrons.

## Recompensa, descobertas e direção estética

O feedback de jogo é coordenado globalmente por um diretor de recompensas: reações comuns permanecem discretas, eventos importantes recebem partículas e áudio adicionais, cascatas ganham escalada audiovisual e marcos científicos podem assumir uma apresentação de assinatura. O texto de `CADEIA NUCLEAR`, `TEMPESTADE-r`, `CADEIA DE PRÓTONS` e equivalentes usa um único callout atualizado durante a sequência e permanece legível por cerca de 1,85 s após o último elo, evitando empilhamento de mensagens.

A estrela combina dois estados visuais independentes. A Ressonância Estelar representa atividade recente e decai com o tempo; uma aura derivada de `PROGRESSO` permanece durante a fase para mostrar transformação acumulada. Partículas de recompensa são deliberadamente escassas e limitadas, e o sistema respeita `prefers-reduced-motion` para reduzir animações quando solicitado pelo usuário.

O Menu inclui um **Atlas de descobertas** persistente para elementos-chave, processos e fenômenos. Carbono, Ferro, Ouro e Urânio recebem momentos de assinatura próprios, assim como eventos como freeze-out, Supernova, Estrela de Nêutrons, ciclo Sn–Sb–Te e Buraco Negro. Microconquistas como `TRIPLO-ALFA`, `WAITING POINT`, `RAMIFICAÇÃO`, `FONTE DE NÊUTRONS`, `CADEIA ×3/×4` e `REDE PREPARADA` reconhecem acontecimentos científicos ou domínio do tabuleiro sem moeda, loot, streak diário ou bônus obrigatório.

Uma cadeia é considerada preparada apenas quando a continuação já estava geometricamente disponível antes da reação inicial; o reconhecimento não tenta inferir intenção. A conclusão de uma fase também reserva um breve beat audiovisual antes de devolver protagonismo ao botão de avanço. Esses sistemas observam o motor científico existente e não alteram quais reações são válidas nem os requisitos de vitória.

## Ritmo e progresso das fases

A barra **PROGRESSO** representa o avanço efetivo da fase. Nas fases que usam `flowTarget`, ela mostra o menor avanço entre a atividade nuclear (`flow`) e o objetivo científico; portanto, só pode chegar a 100% quando ambos estiverem completos. Requisitos adicionais de objetivo — como waiting point, ramificação, fonte de nêutrons, prova radioativa ou freeze-out — também participam desse cálculo. Anã marrom e anã branca preservam seus indicadores próprios baseados diretamente no objetivo.

As classes internas de balanceamento são `quick` (60–90 s), `short` (90–150 s), `standard` (150–210 s), `long` (210–255 s) e `epic` (255–300 s). Essas janelas são metas de design, sem cronômetro ou derrota por tempo.

As fases iniciais privilegiam `quick`/`short`; cadeias mais profundas avançam para `standard`/`long`, enquanto marcos como Pb, Bi, Au, Th, U e o encerramento Sn–Sb–Te podem usar `epic`. Quanto mais cara a reconstrução histórica, menor a repetição do produto final: fases profundas tendem a exigir duas unidades, fazendo a reconstrução completa valer como a principal conquista do nível.

## Barreira de Coulomb

Após o tutorial, a Barreira de Coulomb depende da camada radial: núcleo e camada 1 não bloqueiam; camada 2 bloqueia 50% das tentativas; camada 3, 60%; camada 4, 80%. H, Deutério e Trítio são sempre isentos. O tutorial permanece determinístico: anéis 0–2 permitem a reação e anéis 3–4 bloqueiam, para tornar clara a relação entre posição e probabilidade de reação. A regra probabilística entra em vigor somente depois que o tutorial é concluído. Sempre que ocorre um bloqueio, o tooltip usa a mensagem fixa: “Aproxime os átomos do núcleo estelar para diminuir a resistência.”
