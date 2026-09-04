# Arquitetura do Ardua

## Objetivo

Ardua é uma aplicação web estática de uma página. A arquitetura favorece execução offline, facilidade de publicação em GitHub Pages e iteração rápida no conteúdo científico.

## Camadas

### `index.html`
Contém somente a estrutura visual permanente, modais, HUD e contêineres de renderização. CSS e JavaScript ficam externos para reduzir conflitos durante manutenção.

### `assets/css/ardua.css`
Concentra layout responsivo, representação visual dos núcleos, estrelas, efeitos, tooltips e animações. Variáveis CSS no `:root` funcionam como tokens visuais do jogo.

### `assets/js/ardua.js`
Mantém o motor atual em um único escopo fechado para preservar o comportamento da versão jogável. Dentro dele existem blocos conceituais claros: catálogo de elementos/isótopos, receitas, definição de fases, geometria do tabuleiro, estado, regras de reação, progressão, renderização e eventos de interface.

## Próxima modularização recomendada

O próximo passo saudável, quando houver testes automatizados de gameplay, é separar o JavaScript em módulos de dados e motor: `data/elements`, `data/reactions`, `data/phases`, `engine/board`, `engine/reactions`, `engine/progression`, `ui/render` e `ui/events`. Essa etapa pede uma suíte de testes porque várias regras compartilham estado global e ordem de inicialização.

## Convenções

- O jogo deve continuar funcionando como conteúdo estático.
- Reposição de matéria usa a distribuição global definida no motor.
- Receitas recomendadas apontam para a próxima reação nuclear executável da cadeia.
- A Barreira de Coulomb é uma regra de gameplay posterior ao seu tutorial e respeita as exceções definidas para H, D e T.
- Novas fases devem declarar seus dados no catálogo de fases e reutilizar sistemas globais em vez de criar lógica paralela.

## Limpeza realizada

A migração removeu funções sem qualquer referência no código atual, um alias constante sem uso, comentários históricos de versões antigas e um fragmento CSS órfão remanescente de uma animação antiga. Nenhuma dependência externa foi adicionada.
