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

## Ritmo e progresso das fases

A barra existente usa o rótulo **PROGRESSO** e acompanha o `flowTarget` da fase; o objetivo científico permanece separado no texto superior. As classes internas de balanceamento são `quick` (60–90 s), `short` (90–150 s), `standard` (150–210 s), `long` (210–255 s) e `epic` (255–300 s). Essas janelas são metas de design, sem cronômetro ou derrota por tempo.

As fases iniciais privilegiam `quick`/`short`; cadeias mais profundas avançam para `standard`/`long`, enquanto marcos como Pb, Bi, Au, Th, U e o encerramento Sn–Sb–Te podem usar `epic`. Quanto mais cara a reconstrução histórica, menor a repetição do produto final: fases profundas tendem a exigir duas unidades, fazendo a reconstrução completa valer como a principal conquista do nível.

## Barreira de Coulomb

Após o tutorial, a Barreira de Coulomb depende da camada radial: núcleo e camada 1 não bloqueiam; camada 2 bloqueia 50% das tentativas; camada 3, 60%; camada 4, 80%. H, Deutério e Trítio são sempre isentos. O tutorial permanece determinístico: anéis 0–2 permitem a reação e anéis 3–4 bloqueiam, para tornar clara a relação entre posição e probabilidade de reação. A regra probabilística entra em vigor somente depois que o tutorial é concluído. Sempre que ocorre um bloqueio, o tooltip usa a mensagem fixa: “Aproxime os átomos do núcleo estelar para diminuir a resistência.”
