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
