# Ardua

**Ardua** é um jogo casual e educativo de astrofísica nuclear executado diretamente no navegador.

## Jogar online

A versão publicada fica em: https://ttamosauskas.github.io/Ardua/

## Executar localmente

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
- `.github/workflows/pages.yml` — publicação automática da `main` no GitHub Pages.

## Princípios técnicos

O projeto privilegia portabilidade e baixo atrito: JavaScript e CSS nativos, caminhos relativos e zero etapa de compilação. Mudanças de conteúdo e regras devem preservar a capacidade de abrir o jogo diretamente por `index.html`.
