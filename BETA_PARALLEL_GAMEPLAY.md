# Decaimento beta em paralelo

## Regra de gameplay

Fases nucleares com espera por decaimento beta nunca devem transformar a espera na única ação disponível. Quando um núcleo entra em `neutronBetaPending`, o jogo mantém esse processo em segundo plano e orienta a próxima receita produtiva necessária para reconstruir a cadeia e formar o próximo produto da fase.

O cabeçalho responde simultaneamente a duas perguntas:

1. O que está acontecendo? — exemplo: `Zn* decaindo`.
2. O que posso fazer agora? — exemplo: `Ferro + Nêutron → Níquel`.

Formato preferido: `Zn* decaindo • Ferro + Nêutron → Níquel`.

Quando mais de um núcleo estiver aguardando beta, o estado é resumido como `N núcleos decaindo` para não transformar o cabeçalho em log.

## Progresso visual

Todo núcleo em espera beta:

- mantém o tremor de instabilidade;
- recebe um arco circular abstrato de progresso;
- não mostra cronômetro ou número de rodadas ao jogador;
- perde tremor e arco assim que a transição beta é resolvida.

O arco usa a razão entre `neutronBetaStartRound`, `neutronBetaReadyRound` e `neutronBetaTotalRounds`.

## Escala temporal

`neutronBetaRounds` representa uma escala relativa do tempo de espera da rota/isótopo didaticamente representado. Não significa que uma rodada corresponde a uma unidade física de tempo e não deve ser interpretado como meia-vida literal do elemento químico.

- 1 rodada: transição rápida, quase sem gargalo;
- 2 rodadas: espera curta/padrão;
- 3 rodadas: waiting point moderado;
- 4 rodadas: waiting point forte.

Os valores são determinísticos por fase, nunca aleatórios.

Configuração atual:

- `weak_s_se`: 1;
- `nb`, `rb`: 2;
- `weak_s_ga`, `la`, `rh`: 3;
- `nd`, `sb`: 4.

## Progressão pedagógica

A campanha deve evoluir de receitas simples para cadeias e, nas fases avançadas, para processos simultâneos. O objetivo é que a espera beta funcione como uma oportunidade de iniciar ou continuar outra cadeia, não como tempo morto.

## Contrato de regressão

O deploy deve falhar se:

- o indicador circular desaparecer;
- o runtime deixar de registrar início/total da espera beta;
- o cabeçalho voltar a usar a instrução passiva `aguarde β− enquanto reconstrói a cadeia`;
- os tempos configurados saírem da escala 1–4 sem atualização explícita deste contrato.
