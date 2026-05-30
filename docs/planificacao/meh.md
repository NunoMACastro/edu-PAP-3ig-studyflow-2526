Studyflow - Hidratação

Estás no repositório StudyFlow.

Trabalha como arquiteto de software sénior, professor de programação e revisor de planificação PAP.

## Variáveis desta execução

MF_ALVO: MF1
MODO: {escolher um dos possíveis modos}

Valores possíveis para MODO:

- auditar_apenas: cria/atualiza relatório, mas não edita BKs.
- hidratar_corrigir: audita, corrige e reescreve BKs incompletos.
- corrigir_apenas: usa relatório existente e corrige BKs já trabalhados.

## Regra crítica sobre código existente em apps

O código existente em `apps/` pode ser uma resolução inicial dos alunos e pode estar errado, incompleto ou por corrigir.

Nesta execução:

- NÃO uses `apps/` como contrato técnico final.
- NÃO copies padrões, imports, DTOs, services, schemas ou componentes de `apps/` como se estivessem corretos.
- Podes usar `apps/` apenas para perceber a estrutura provável de pastas, se isso ajudar.
- A fonte de verdade técnica e funcional são os documentos canónicos e os BKs anteriores já corrigidos.
- Se precisares de mencionar `apps/` no relatório, diz apenas que foi tratado como código inicial não validado.
- Nos BKs destinados aos alunos, não escrevas frases sobre scaffold, auditoria, hidratação, código não corrigido ou conversa interna.

## Objetivo

Melhorar todos os guias BK da `MF_ALVO` para que fiquem tutoriais guiados, autocontidos, pedagógicos e tecnicamente coerentes para alunos do 12.º ano.

Cada BK deve permitir ao aluno implementar aquele requisito sem depender de adivinhação, pseudo-código, helpers por criar, snippets incompletos ou explicações fora do próprio BK.

No fim, os BKs da macrofase devem formar uma sequência coerente da aplicação StudyFlow, sem:

- imports partidos;
- endpoints contraditórios;
- schemas incompatíveis;
- regras de ownership incompletas;
- código solto;
- linguagem interna;
- funcionalidades prometidas mas não implementadas.

## Documentos obrigatórios a consultar antes de editar

Lê obrigatoriamente:

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- todos os BKs em `docs/planificacao/guias-bk/MF0/`
- todos os BKs da `MF_ALVO`
- todos os BKs das macrofases anteriores à `MF_ALVO`
- BKs posteriores que dependam de BKs da `MF_ALVO`

Usa os BKs da MF0 como referência mínima de qualidade, densidade pedagógica, explicação, estrutura linear e completude técnica.

## Regra de fundamentação documental por BK

Antes de escrever teoria, arquitetura ou código de cada BK, consulta a documentação canónica relevante para o domínio desse BK.

Para cada BK, consulta no mínimo:

- RF/RNF associados no header do BK.
- BKs declarados em `dependencias`.
- BK anterior e BK seguinte na sequência.
- BKs posteriores que dependem deste BK.
- `MATRIZ-CANONICA-BK.md`.
- `BACKLOG-MVP.md`.
- `CONTRATO-CAMPOS-BK.md`.
- `MF-VIEWS.md`.
- `PLANO-SPRINTS.md`.

A teoria, nomes de entidades, endpoints, permissões, fluxos, campos e validações devem nascer destas fontes.

Se uma decisão vier diretamente da documentação, marca como `CANONICO`.
Se for uma decisão técnica mínima necessária para implementar sem contrariar a documentação, marca como `DERIVADO`.
Se faltar informação indispensável, marca como `TODO (BLOCKER)` e regista no relatório.

## Regra de formato obrigatório: MF0 é contrato, não inspiração

Os BKs da `MF_ALVO` devem seguir o mesmo padrão estrutural dos BKs da `MF0`.

É proibido inventar layouts alternativos para o `Guia linear de implementação`.

Cada passo deve seguir exatamente esta estrutura, nesta ordem:

### Passo N - Nome claro

1. Explicação simples do objetivo.
2. Ficheiros envolvidos.
    - CRIAR: `caminho`
    - EDITAR: `caminho`
    - REVER: `caminho`
    - LOCALIZAÇÃO: ficheiro completo, função completa, classe completa ou zona exata.
3. O que fazer.
4. Código completo, correto e integrado.
5. Explicação do código.
6. Como validar este passo.
7. Erros comuns ou cenário negativo.

Não substituas esta estrutura por tabelas, mapas pedagógicos, resumos globais, secções alternativas ou qualquer layout inventado.

## Separação obrigatória entre relatório e BKs

O relatório de auditoria pode conter linguagem interna de trabalho.

Os BKs dos alunos NÃO podem conter linguagem interna.

Nos BKs, é proibido escrever expressões como:

- hidratação;
- pós-auditoria;
- scaffold real;
- scaffold parcial;
- roteiro genérico;
- conversa interna;
- este guia deixa de ser;
- código ainda não corrigido;
- snippet;
- exemplo simplificado;
- implementar depois;
- quando aplicável;
- helpers chamados;
- substituir mocks;
- pseudo-código;
- solução parcial.

Os BKs devem falar diretamente com o aluno, como tutorial:

- “Neste BK vais implementar...”
- “Este ficheiro guarda...”
- “Este service valida...”
- “Este erro evita...”

## Regras fundamentais

1. Não alteres IDs BK, RF, RNF, owners, prioridades, esforço, sprints, dependências, macrofase ou escopo sem evidência documental clara.
2. Não inventes requisitos, entidades, endpoints, campos, roles, permissões ou regras de negócio.
3. Se algo for inferido, marca como `DERIVADO`.
4. Se vier dos documentos oficiais, marca como `CANONICO`.
5. Se faltar contexto indispensável, usa `TODO (BLOCKER)` e explica o bloqueio no relatório.
6. Não uses pseudo-código como solução final.
7. Não deixes snippets soltos.
8. Todo o código escrito no BK deve ser código final previsto para aquele BK.
9. Todo o código deve encaixar com BKs anteriores e preparar BKs seguintes.
10. Preserva contratos definidos em fases anteriores.
11. Escreve em português de Portugal.
12. O texto deve ser adequado a alunos do 12.º ano.
13. Explica teoria antes da prática quando o conceito for novo.
14. Depois de cada bloco de código, explica o que faz, por que existe e que erro evita.

## Regra de conceitos teóricos completos

A secção `Conceitos teóricos` deve explicar mais do que o domínio da aplicação.

Para cada BK, inclui conceitos das categorias aplicáveis:

1. Conceitos de domínio da StudyFlow.
   Ex.: sala de estudo, turma, disciplina, material oficial, aluno inscrito, fonte processável.

2. Conceitos backend.
   Ex.: controller, service, module, DTO, schema Mongoose, ObjectId, dependency injection, guard, exception, HTTP status.

3. Conceitos frontend, se houver frontend.
   Ex.: componente React, `useState`, `useEffect`, formulário, loading/error/empty/success, `fetch`, `credentials: 'include'`.

4. Conceitos de segurança.
   Ex.: ownership, membership, sessão autenticada, validação no backend, não confiar em IDs enviados pelo frontend.

5. Conceitos de IA, se houver IA.
   Ex.: fontes, prompt, provider isolado, bloqueio sem fontes, guardrails, alucinação, fallback honesto.

Cada conceito importante deve responder:

- o que é;
- de onde vem no fluxo;
- para onde vai;
- para que serve;
- que erro evita.

## Regra de código completo

Um BK só pode incluir código se esse código estiver completo para o contexto do BK.

É proibido deixar:

- funções chamadas mas não implementadas;
- services que dependem de helpers inexistentes;
- imports sem origem clara;
- DTOs sem validação;
- controllers sem service correspondente;
- schemas sem relação com o service;
- frontend com `payload: unknown`;
- testes com `as any` como solução final;
- mocks como substituto da implementação;
- comentários tipo “implementar depois”.

Se o código depende de algo de BK anterior:

- indica explicitamente qual BK criou esse ficheiro/função;
- não voltes a reimplementar tudo se isso quebrar a sequência;
- mostra apenas a integração necessária neste BK.

Se o código é novo neste BK:

- mostra o ficheiro completo ou a versão completa da função/classe/componente a substituir;
- indica caminho completo;
- indica localização exata;
- explica a ligação com os ficheiros anteriores.

## Regra de legibilidade do código

O código nos BKs deve estar formatado como código real de projeto.

É proibido:

- comprimir classes, services ou funções inteiras numa só linha;
- omitir quebras de linha para poupar espaço;
- escrever código difícil de copiar, ler ou explicar;
- juntar múltiplos ficheiros sem separação clara.

Cada bloco deve ter:

- comentário inicial com o caminho do ficheiro;
- imports no topo;
- código formatado;
- nomes claros;
- separação visual entre responsabilidades.

## Contrato de executabilidade da aplicação

O objetivo não é apenas produzir BKs bem escritos. O objetivo é que, seguindo os BKs por ordem, a aplicação StudyFlow possa funcionar de forma real e coerente.

Todo o código apresentado nos BKs deve ser:

- funcional;
- integrado com a arquitetura global da app;
- coerente com os BKs anteriores;
- preparatório para os BKs seguintes;
- compatível com a stack definida;
- sem imports partidos;
- sem nomes de ficheiros contraditórios;
- sem endpoints duplicados ou inconsistentes;
- sem DTOs, schemas, services ou components que não encaixem entre si;
- sem funções chamadas mas não implementadas;
- sem código meramente ilustrativo apresentado como solução.

Cada BK deve ser tratado como uma entrega incremental da aplicação final.  
Depois de aplicar os BKs por ordem, o resultado esperado é uma app que compila, arranca e executa os fluxos documentados.

## Regra de integração entre BKs

Antes de escrever código num BK, confirma:

1. Que ficheiros, funções, schemas, DTOs, services e endpoints já foram criados em BKs anteriores.
2. Que nomes estás a reutilizar exatamente com a mesma grafia.
3. Que não estás a criar outro endpoint para a mesma responsabilidade.
4. Que não estás a duplicar modelos ou conceitos já existentes.
5. Que o próximo BK conseguirá importar e usar o que este BK cria.
6. Que não estás a quebrar comportamento definido em MF0 ou macrofases anteriores.

Se precisares de alterar uma decisão técnica anterior para a app funcionar:

- não alteres silenciosamente;
- regista como drift ou blocker;
- explica a razão;
- atualiza o BK afetado apenas se o escopo permitir.

## Gate de app funcional

Antes de considerar um BK como `OK`, responde explicitamente:

- Este código compila no contexto da app final prevista?
- Os imports apontam para ficheiros existentes ou criados em BKs anteriores?
- O controller chama um service existente?
- O service usa schemas/models existentes?
- O frontend chama endpoints reais definidos no backend?
- Os tipos do frontend correspondem ao payload e resposta do backend?
- O fluxo funciona com autenticação real?
- O fluxo falha de forma controlada nos negativos?
- Este BK deixa a app num estado mais funcional do que antes?
- O próximo BK consegue construir sobre este sem reescrever tudo?

Se alguma resposta for “não” ou “não sei”, o BK não pode ser marcado como `OK`.

## Regra de adequação semântica

Antes de escrever cada BK, identifica o domínio real do requisito.

Exemplos:

- IA adaptativa individual não é registo/login.
- Sala de estudo não é turma oficial.
- Material oficial de disciplina não é material privado do aluno.
- Voz da IA docente é estilo pedagógico textual, não áudio.
- IA da sala usa fontes partilhadas da sala.
- IA da turma usa materiais oficiais da disciplina.
- Publicações de professor não são notificações push.

O código, os nomes dos ficheiros, os DTOs, os schemas, os endpoints e os exemplos devem refletir o domínio real do BK.

## Proibição de domínio inventado

É proibido explicar ou implementar um conceito de domínio de forma genérica quando a StudyFlow já o define na documentação.

Exemplos:

- Sala de estudo deve ser explicada a partir de `RF14`, `RF15`, `RF16`, matriz/backlog e BKs relacionados.
- Turma oficial deve ser explicada a partir de `RF19`, `RF20`, `RF23`, `RF24` e contratos de BK.
- Material oficial de disciplina deve ser explicado a partir de `RF21` e requisitos de IA/fonte.
- IA da sala deve usar fontes partilhadas da sala.
- IA da turma/disciplina deve usar materiais oficiais da disciplina.
- Voz da IA docente é estilo pedagógico textual, não áudio.

Se a documentação não definir uma regra de negócio, não a apresentes como facto.

## Regras específicas StudyFlow

- Ownership do aluno é obrigatório em áreas de estudo, materiais, histórico, perfil IA e artefactos IA.
- Dados de aluno, sala, turma, disciplina e professor não podem ser misturados.
- Turma deve ser opcional quando o fluxo permitir estudo sem turma.
- IA privada, IA da sala e IA da turma/disciplina têm contextos separados.
- Qualquer geração IA deve bloquear quando não há fontes processáveis.
- A IA não pode inventar conteúdo factual.
- Não prometas RAG, embeddings, OCR, chunking semântico ou indexação automática se isso não estiver previsto na fase.
- Validação, autenticação, autorização e ownership são requisitos de segurança, não detalhes opcionais.

## Auditoria obrigatória

Cria ou atualiza:

`docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-{MF_ALVO}.md`

Classifica cada BK como:

- `OK`: pronto para aluno seguir.
- `PARCIAL`: tem estrutura, mas falta completude.
- `CRÍTICO`: o aluno não conseguiria implementar com segurança seguindo o guia.

Um BK só é `OK` se cumprir TODOS:

1. Objetivo claro.
2. Importância funcional e pedagógica.
3. Scope-in.
4. Scope-out.
5. Pré-requisitos concretos.
6. Dependências BK/RF/RNF.
7. Conceitos teóricos necessários.
8. Ficheiros a criar/editar/rever.
9. Localização exata das alterações.
10. Código completo e integrado.
11. Código comentado de forma didática.
12. Explicação após cada bloco de código.
13. Validação por passo.
14. Cenários negativos.
15. Expected results com HTTP status, mensagens ou comportamento.
16. Evidence para PR/defesa.
17. Handoff para próximo BK.
18. Coerência com BKs anteriores.
19. Preparação para BKs seguintes.
20. Sem linguagem interna.
21. Sem snippets soltos.
22. Sem pseudo-código.
23. Sem helpers por implementar.
24. Sem `payload: unknown` no frontend.
25. Sem `as any` em código apresentado como solução final.
26. Um BK não é `OK` se tiver código correto mas não explicado de forma suficiente para um aluno perceber por que está a escrevê-lo.

Para cada BK `PARCIAL` ou `CRÍTICO`, o relatório deve indicar:

- ficheiro;
- estado;
- problema principal;
- exemplos concretos;
- o que falta completar;
- risco pedagógico;
- risco técnico;
- dependências a reler;
- prioridade de correção.

O relatório deve terminar com ordem recomendada de correção.

## Hidratação/correção dos BKs

Se `MODO` for `hidratar_corrigir`, edita apenas os BKs da `MF_ALVO` marcados como `PARCIAL` ou `CRÍTICO`.

Para cada BK, inclui:

- objetivo;
- importância;
- scope-in;
- scope-out;
- estado antes;
- estado depois;
- pré-requisitos;
- glossário;
- conceitos teóricos;
- arquitetura do BK;
- ficheiros a criar/editar/rever;
- passos lineares;
- código completo;
- explicação do código;
- validação por passo;
- erros comuns;
- cenários negativos;
- expected results;
- critérios de aceite;
- evidence;
- handoff;
- changelog.

Cada passo deve seguir esta estrutura:

### Passo N - Nome claro

1. Objetivo do passo.
2. Ficheiros envolvidos:
    - CRIAR: `caminho`
    - EDITAR: `caminho`
    - REVER: `caminho`
    - LOCALIZAÇÃO: local exato
3. O que fazer.
4. Código completo, se houver implementação.
5. Explicação do código.
6. Como validar.
7. Erros comuns ou cenário negativo.

No fim do BK só podem ficar:

- Critérios de aceite
- Validação final
- Evidence para PR/defesa
- Handoff
- Changelog

Não deixes código novo solto no fim do BK.

## Regra de explicação e documentação didática do código

Todo o código incluído nos BKs deve ser documentado e explicado de forma didática, completa e explícita, adequada a alunos do 12.º ano.

Cada ficheiro novo deve incluir:

- uma breve explicação antes do bloco de código;
- comentários no próprio código quando a lógica não for óbvia;
- nomes de funções, variáveis, DTOs, services e componentes claros;
- uma explicação depois do bloco de código.

Depois de cada bloco de código, a explicação deve cobrir:

1. O que o código faz.
2. Porque existe neste BK.
3. Que ficheiros ou BKs anteriores usa.
4. Que ficheiros ou BKs seguintes prepara.
5. Que dados entram.
6. Que dados saem.
7. Que validações acontecem.
8. Que regra de segurança, ownership ou membership aplica.
9. Que erro comum evita.
10. Como testar se ficou correto.

Não basta dizer “este código cria o service” ou “este componente mostra a página”.

Quando houver funções, métodos, classes, DTOs, schemas, services, controllers ou componentes importantes, explica:

- responsabilidade;
- parâmetros;
- retorno;
- efeitos secundários;
- erros lançados;
- relação com a app final.

No código backend, documenta explicitamente:

- DTOs;
- schemas/models;
- services;
- controllers;
- guards/middleware;
- providers de IA;
- regras de ownership/membership;
- exceções e HTTP status esperados.

No código frontend, documenta explicitamente:

- cliente API;
- payload enviado;
- estados `loading`, `error`, `success` e `empty`;
- validação do formulário;
- relação entre componente e endpoint;
- por que se usa `credentials: 'include'`.

No código de IA, documenta explicitamente:

- fontes usadas;
- motivo do bloqueio sem fontes;
- estrutura do prompt;
- guardrails;
- limite entre resposta baseada em fontes e invenção;
- fallback quando a IA não consegue responder.

Os comentários no código devem ensinar o raciocínio, não repetir o óbvio.

Bom comentário:

```ts
// O userId vem da sessão para impedir que o frontend crie dados em nome de outro aluno.
```

Mau comentário:

```ts
// Cria uma variável userId.
```

Se um bloco de código for complexo, divide a explicação em partes pequenas antes de avançar para o próximo passo.

## Regra obrigatória de comentários no código

Todo o código apresentado nos BKs deve ter comentários didáticos suficientes para um aluno do 12.º ano perceber o raciocínio.

Cada bloco de código deve comentar, quando existir:

- o caminho do ficheiro;
- a responsabilidade da classe, função ou componente;
- campos importantes de schemas;
- validações de DTOs;
- regras de ownership ou membership;
- chamadas a services;
- exceções lançadas;
- chamadas `fetch`;
- uso de `credentials: 'include'`;
- hooks React como `useState` e `useEffect`;
- construção de prompts e fontes, quando houver IA.

Os comentários devem ensinar o raciocínio, não repetir o óbvio.

Bom comentário:

```ts
// O teacherId vem da sessão para impedir que o frontend crie turmas em nome de outro professor.
```

```ts
// Define teacherId.
```

Um bloco de código sem comentários didáticos suficientes não pode ser considerado completo.

## Qualidade backend obrigatória

Quando houver backend, inclui:

- endpoint;
- método HTTP;
- payload;
- DTO;
- validação;
- schema/model;
- service;
- controller;
- módulo;
- guard/middleware quando necessário;
- ownership/membership;
- erros esperados;
- códigos HTTP;
- cenários negativos de segurança.

## Qualidade frontend obrigatória

Quando houver frontend, inclui:

- cliente API tipado;
- página ou componente;
- estado local;
- formulário;
- loading;
- error;
- empty/success;
- validação mínima;
- `credentials: 'include'`;
- sem tokens em `localStorage`;
- sem `payload: unknown`.

## Qualidade IA obrigatória

Quando houver IA, inclui:

- input permitido;
- fontes usadas;
- bloqueio sem fontes;
- prompt de sistema;
- provider isolado;
- guardrails;
- explicabilidade;
- fallback honesto;
- negativos contra alucinação;
- separação entre recomendação e ação automática.

## Validação de coerência global

Além de validar cada BK isoladamente, verifica a coerência da macrofase completa:

- endpoints únicos e consistentes;
- nomes de módulos coerentes;
- schemas reutilizados corretamente;
- DTOs alinhados com frontend;
- services com responsabilidades claras;
- ownership/membership aplicado sempre no backend;
- fluxos principais executáveis do início ao fim;
- ausência de imports para ficheiros inexistentes;
- ausência de código que só funciona “em teoria”.

O critério final é: a app StudyFlow deve conseguir ser implementada seguindo os BKs por ordem, sem o aluno ter de inventar peças técnicas em falta.

## Gate de qualidade pedagógica antes de terminar cada BK

Antes de considerar um BK concluído, confirma manualmente:

- O guia segue o formato dos BKs da MF0.
- Todos os passos têm os pontos 1 a 7.
- Todos os passos indicam ficheiros envolvidos e localização exata.
- Todo o código novo tem comentários didáticos.
- Depois de cada bloco de código há explicação completa.
- A teoria inclui domínio StudyFlow e conceitos técnicos usados no BK.
- A teoria não inventa regras fora da documentação.
- Backend, frontend, segurança e IA são explicados quando aparecem no BK.
- Um aluno do 12.º ano consegue seguir o BK sem adivinhar peças em falta.

## Gate de qualidade antes de terminar

Depois de editar, executa estas verificações textuais:

```bash
rg -n "hidrata|pós-auditoria|scaffold|roteiro genérico|snippet|pseudo-código|implementar depois|quando aplicável|helpers chamados|Substitui os mocks|payload: unknown|as any|ContextAction|contextApi" docs/planificacao/guias-bk/{MF_ALVO}/*.md
```

Se aparecerem ocorrências nos BKs dos alunos, corrige.

Depois executa:

```bash
git diff --check
bash scripts/validate-planificacao.sh
```

Se o validador falhar:

- lê o erro;
- corrige se for causado pelas tuas alterações;
- se for bloqueio de infraestrutura, regista o erro exato no relatório e no resumo final;
- não escondas a falha.

## Mapa de integração obrigatório

No relatório de auditoria, mantém uma secção chamada `Mapa de integração da MF`.

Para cada BK editado, regista:

- ficheiros criados;
- ficheiros editados;
- exports produzidos;
- imports consumidos de BKs anteriores;
- endpoints criados;
- DTOs criados;
- schemas/models criados;
- services criados;
- componentes/páginas frontend criados;
- BKs seguintes que dependem destes elementos.

Antes de fechar a MF, confirma que não existem:

- dois endpoints para a mesma ação;
- dois schemas para a mesma entidade;
- nomes diferentes para o mesmo conceito;
- frontend a chamar endpoint inexistente;
- service a importar ficheiro não criado;
- BK seguinte dependente de algo que este BK não entregou.

## Resumo final obrigatório

No fim responde com:

- MF processada;
- número de BKs analisados;
- contagem OK/PARCIAL/CRÍTICO antes;
- BKs editados;
- principais lacunas corrigidas;
- decisões técnicas confirmadas;
- drift documental encontrado;
- verificações textuais executadas;
- resultado de `git diff --check`;
- resultado de `bash scripts/validate-planificacao.sh`;
- bloqueios ou TODOs restantes.
