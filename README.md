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

## Campanha rp-process

Após **Acreção extrema**, a superfície da estrela de nêutrons entra em uma sequência de rp-process com fases individuais de **Cobre a Telúrio**. A campanha alterna Hidrogênio ionizável e prótons livres, usa estados instáveis com β⁺, competição `(γ,p)`, Barreira de Coulomb, os waiting points `⁶⁴Ge`, `⁶⁸Se` e `⁷²Kr`, e termina com o ciclo **Sn–Sb–Te**.
