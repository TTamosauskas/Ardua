# Contrato cumulativo de receitas

Este documento define uma regra estrutural da campanha de Ardua.

## Regra principal

Cada fase deve tornar possível a aplicação de todas as receitas já aprendidas nas fases anteriores sempre que seus ingredientes estiverem disponíveis na superfície de interação correspondente.

A fase atual define o objetivo pedagógico e o crédito principal. O repertório de transformações permanece cumulativo ao longo da campanha.

## Consequências para o gameplay

1. Uma receita aprendida permanece no repertório do jogador nas fases posteriores.
2. Quando os ingredientes de uma fusão aprendida aparecem conectados na grade nuclear, a combinação pode ser selecionada e executada.
3. Uma borda verde de candidato representa uma ação válida. Tocar nesse candidato avança a seleção ou executa a receita completa.
4. O último ingrediente necessário dispara a transformação correspondente, mesmo quando o produto pertence a uma fase anterior.
5. Reações herdadas podem contribuir para o fluxo geral da fase; o objetivo específico recebe crédito principal quando o produto corresponde ao alvo atual.
6. Receitas primordiais envolvendo prótons, nêutrons e elétrons permanecem disponíveis nas superfícies que apresentam essas partículas.
7. Em fases que oferecem captura de nêutrons, transições de captura já aprendidas permanecem acessíveis quando o núcleo reagente reaparece.
8. Mecânicas explicitamente armadas, como um nêutron selecionado, um raio cósmico selecionado, uma partícula livre selecionada ou o Buraco Negro selecionado, conservam prioridade sobre aquele toque específico. Após a liberação dessa seleção, o repertório cumulativo volta a responder normalmente.

## Superfícies com gesto próprio

Fases de abertura, formação estelar e marcos narrativos usam interações próprias em vez da grade nuclear. Nas fases primordiais, o repertório cumulativo é aplicado pelo sistema específico de partículas, núcleos livres, recombinação e moléculas.

## Invariantes de interface

- `selected`: borda verde forte para o ingrediente atualmente escolhido.
- `candidate`: borda verde fina para ingredientes que mantêm pelo menos uma receita aprendida possível.
- Todo `candidate` clicável precisa ter um caminho real até o executor da receita.
- Combinações completas aprendidas executam a transformação em vez de virar apenas uma seleção visual.

## Proteção contra regressões

`scripts/validate-cumulative-recipes.js` é executado antes do deploy do GitHub Pages e verifica, entre outros pontos:

- memória das receitas baseada no histórico real da campanha;
- disponibilidade de fusões cumulativas em fases posteriores com grade nuclear;
- execução de candidatos verdes pelo manipulador de fusão;
- persistência das transições aprendidas entre fases de captura de nêutrons;
- continuidade das receitas primordiais cumulativas;
- ponte `p + n → D` antes do manipulador específico das fases de captura.

Qualquer mudança futura no motor deve preservar este contrato.


### Prioridade entre mecânicas aprendidas

Uma indicação visual de candidato válido é uma promessa de execução. Se `cumulativeFusionTapAvailable(...)` reconhecer o toque como parte de uma fusão aprendida, nenhum handler **passivo** de uma mecânica antiga pode consumir esse toque antes do executor da fusão. Mecânicas explicitamente armadas (por exemplo, um elétron já selecionado) e fases dedicadas àquela mecânica conservam prioridade. Fora desses casos, a receita cumulativa tem precedência.

Este contrato vale para todas as fases posteriores: por exemplo, depois de aprender `C + He → O`, essa transformação deve continuar executável em **Forjar Fósforo** e em toda superfície posterior compatível sempre que Carbono e Hélio estiverem disponíveis.
