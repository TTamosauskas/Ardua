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

## Famílias de mecânicas nucleares

O motor trata a progressão como templates reutilizáveis orientados por dados. Isso permite que elementos intermediários tenham fases próprias sem duplicar lógica de interface.

- **Fusão** — receitas de dois ou três núcleos, com condições de temperatura e Barreira de Coulomb.
- **Captura de prótons** — prótons livres podem tunelar a barreira e produzir estados proton-rich.
- **rp-process** — campanha em explosão de raios X com fases individuais de Cu a Te. Os templates incluem captura simples, captura em cadeia agregada, ionização `H → p + e⁻`, β⁺, waiting points, competição `(γ,p)` e ciclo terminal Sn–Sb–Te.
- **Processo-s** — captura de nêutrons seguida de β−; picos, ramificações e passagens agregadas usam diferentes quantidades de captura.
- **Processo-r** — tempestade de nêutrons seguida de cascatas β−/freeze-out, com metas específicas para terras raras, terceiro pico e actinídeos.

As fases rp são definidas em `RP_PROCESS_STEPS` e convertidas para fases por `rpPhaseFromStep`. Isótopos são mostrados explicitamente quando têm papel pedagógico claro, como ⁶⁴Ge, ⁶⁸Se e ⁷²Kr. Passagens intermediárias são identificadas como redes agregadas em vez de atribuir uma única reação fictícia à abundância total de um elemento.

O rp-process foi colocado depois de **Acreção extrema** e antes de **Limite de estabilidade**, representando a queima termonuclear de material H/He-rich na superfície de uma estrela de nêutrons. O bloco termina em Telúrio; elementos mais pesados continuam nas famílias de processo-s e processo-r já presentes na campanha.

## Testes estáticos

`tests/validate-static.js` verifica a presença e a ordem das 24 fases rp, os waiting points, o ciclo Sn–Sb–Te, as duas formas de combustível (H e p) e as referências estáticas do `index.html`. `node --check assets/js/ardua.js` continua sendo a validação sintática mínima do motor.

### Economia de ingredientes

Cada fase de produção deve oferecer exatamente uma oportunidade direta para o objetivo. Precursores pesados não são repostos automaticamente depois de consumidos. O motor usa matéria-base e rotas históricas já aprendidas para reconstruir novas sementes: no rp-process, Fe → Co → Ni inicia a cadeia cumulativa; nos processos weak-s, AGB-s e r, Ferro alimenta rotas agregadas de reconstrução antes das transições já aprendidas.
