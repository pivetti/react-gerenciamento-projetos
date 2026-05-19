# Relatório de Diagnóstico

## 1. Resumo executivo

O front-end React consegue consumir dados da API por chamadas `GET` e renderizar projetos, atividades, participantes, recursos, custos e riscos. A integração de leitura está implementada em `src/services/api.js`, usando `fetch` contra `VITE_API_URL` e os paths REST da API.

O fluxo de criação de projeto não está implementado no front-end. O botão visual "Novo Projeto" existe, mas não possui `onClick`, `Link`, `navigate`, abertura de modal, estado associado, formulário ou chamada `POST`. A API Spring, por outro lado, expõe `POST /projetos` com DTO e validações para criação.

Conclusão principal: o primeiro ponto de quebra confirmado está no front-end, no acionamento e implementação do fluxo "Novo Projeto", não na ausência de endpoint na API.

## 2. Estado da API Spring

Fonte analisada: cópia local do repositório `https://github.com/pivetti/api-spring-gerenciamento-projetos` em `_diagnostico_api_spring`.

### Stack e configuração

- Spring Boot 4.0.3, Java 21, Maven, packaging `war`.
- Dependências principais: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, PostgreSQL runtime, H2 para testes.
- Evidência: `_diagnostico_api_spring/pom.xml`.

### Entidades principais

- `Projeto`: entidade JPA `@Entity`, tabela `projetos`, campos `id`, `nome`, `descricao`, `objetivo`, `status`, `prioridade`, `dataInicio`, `dataFim`, `orcamentoPrevisto`, `percentualConcluido`; relacionamentos `@OneToMany` com participantes, atividades, riscos, recursos e custos.
  - Evidência: `_diagnostico_api_spring/src/main/java/com/example/demo/entity/Projeto.java:23`, `Projeto.java:30`, `Projeto.java:56`.
- `Usuario`: entidade `usuarios`, com relacionamento para `Participante`.
  - Evidência: `_diagnostico_api_spring/src/main/java/com/example/demo/entity/Usuario.java:20`, `Usuario.java:44`.
- `Atividade`: entidade `atividades`, com `@ManyToOne` para `Projeto` e `Participante`.
  - Evidência: `_diagnostico_api_spring/src/main/java/com/example/demo/entity/Atividade.java:24`, `Atividade.java:55`, `Atividade.java:59`.
- Também existem `Participante`, `Recurso`, `Custo` e `Risco`.
  - Evidência: `_diagnostico_api_spring/src/main/java/com/example/demo/entity/Participante.java:22`, `Recurso.java:23`, `Custo.java:21`, `Risco.java:20`.

### Controllers disponíveis

- `UsuarioController` em `/usuarios`.
- `ProjetoController` em `/projetos`.
- `AtividadeController` em `/atividades`.
- `ParticipanteController` em `/participantes`.
- `RecursoController` em `/recursos`.
- `CustoController` em `/custos`.
- `RiscoController` em `/riscos`.
- Evidência: `rg -n "@RestController|@RequestMapping" _diagnostico_api_spring/src/main/java/com/example/demo/controller`.

### Endpoints de projetos

| Método | Path | Função | Evidência |
|---|---|---|---|
| GET | `/projetos` | Listar todos os projetos | `_diagnostico_api_spring/src/main/java/com/example/demo/controller/ProjetoController.java:29` |
| GET | `/projetos/{id}` | Buscar projeto por ID | `_diagnostico_api_spring/src/main/java/com/example/demo/controller/ProjetoController.java:34` |
| POST | `/projetos` | Criar projeto | `_diagnostico_api_spring/src/main/java/com/example/demo/controller/ProjetoController.java:39` |
| PUT | `/projetos/{id}` | Atualizar projeto completo | `_diagnostico_api_spring/src/main/java/com/example/demo/controller/ProjetoController.java:45` |
| PATCH | `/projetos/{id}` | Atualizar projeto parcialmente | `_diagnostico_api_spring/src/main/java/com/example/demo/controller/ProjetoController.java:50` |
| DELETE | `/projetos/{id}` | Excluir projeto | `_diagnostico_api_spring/src/main/java/com/example/demo/controller/ProjetoController.java:56` |

### DTO de criação de projeto

`POST /projetos` recebe `ProjetoRequestDto` com os seguintes campos:

- Obrigatórios: `nome`, `status`, `prioridade`, `percentualConcluido`.
- Opcionais: `descricao`, `objetivo`, `dataInicio`, `dataFim`, `orcamentoPrevisto`.
- Validações: `nome` com `@NotBlank` e `@Size(max = 150)`, `descricao` e `objetivo` com `@Size(max = 1000)`, `orcamentoPrevisto` com `@PositiveOrZero`, `percentualConcluido` com `@NotNull` e `@Max(100)`.
- Evidência: `_diagnostico_api_spring/src/main/java/com/example/demo/dto/projeto/ProjetoRequestDto.java:25`, `ProjetoRequestDto.java:35`, `ProjetoRequestDto.java:38`, `ProjetoRequestDto.java:45`, `ProjetoRequestDto.java:48`.

`ProjetoResponseDto` retorna `id`, `nome`, `descricao`, `objetivo`, `status`, `prioridade`, `dataInicio`, `dataFim`, `orcamentoPrevisto`, `percentualConcluido`.

- Evidência: `_diagnostico_api_spring/src/main/java/com/example/demo/dto/projeto/ProjetoResponseDto.java:15`.

### CORS

A API possui configuração global de CORS para `/**`, liberando:

- Origins: `http://localhost:5173`, `http://127.0.0.1:5173`, `https://projecthub-chi-blush.vercel.app`.
- Métodos: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- Headers: `Authorization`, `Content-Type`, `Accept`.
- Evidência: `_diagnostico_api_spring/src/main/java/com/example/demo/config/CorsConfig.java:12`, `CorsConfig.java:13`, `CorsConfig.java:18`, `CorsConfig.java:19`.

### Autenticação e autorização

Não foi encontrada dependência `spring-boot-starter-security`, configuração `SecurityFilterChain`, filtro JWT ou biblioteca JWT.

- Evidência: busca por `spring-boot-starter-security`, `SecurityFilterChain`, `OncePerRequestFilter`, `jwt`, `auth` e termos relacionados retornou apenas o header `Authorization` no CORS.
- Evidência adicional: `_diagnostico_api_spring/pom.xml` contém web, JPA, validation, PostgreSQL e testes, mas não contém starter de security.

### Testes da API

O comando `.\mvnw.cmd test` executou com sucesso.

- Resultado: `Tests run: 30, Failures: 0, Errors: 0, Skipped: 0`.
- Evidência: saída do Maven em 2026-05-18 22:03 BRT.

## 3. Estado do Front-end React

### Stack

- React com Vite.
- Sem React Router identificado.
- Sem Axios identificado.
- Uso de `fetch` nativo.
- Tailwind CSS via plugin `@tailwindcss/vite`.
- Evidência: `package.json:7`, `package.json:18`, `vite.config.js:1`, `vite.config.js:7`, `src/services/api.js:189`, `src/main.jsx:2`.

### Como os dados são buscados

O front usa `loadDashboardData()` em `src/services/api.js` para buscar coleções em paralelo:

- `/projetos`
- `/participantes`
- `/atividades`
- `/recursos`
- `/custos`
- `/riscos`

Evidência: `src/services/api.js:9`, `src/services/api.js:188`, `src/services/api.js:327`.

A URL base vem de `VITE_API_URL` ou do fallback `https://api-spring-gerenciamento-projetos.onrender.com`.

- Evidência: `src/services/api.js:1`.
- Evidência local: `.env` contém `VITE_API_URL=https://api-spring-gerenciamento-projetos.onrender.com`.

### Normalização de projetos

O front normaliza a resposta da API para campos internos:

- `nome` ou `name` vira `name`.
- `descricao`, `description` ou `objetivo` vira `description`.
- `dataInicio` vira `startDate`.
- `dataFim` vira `endDate`.
- `orcamentoPrevisto` vira `budget`.
- `percentualConcluido` vira `completion`.

Evidência: `src/services/api.js:236`, `src/services/api.js:245`, `src/services/api.js:246`.

### Tela/listagem de projetos

`App.jsx` mantém estado de dashboard, busca os dados no `useEffect`, filtra projetos por busca e renderiza `ProjectsBoard` para as views `dashboard` e `projects`.

- Evidência: `src/App.jsx:249`, `src/App.jsx:270`, `src/App.jsx:322`.

`ProjectsBoard` renderiza `RecommendedCategories`, `ActionToolbar` e três `ProjectSection`: `TODO`, `PROJETOS ATIVOS` e `CONCLUIDOS`.

- Evidência: `src/App.jsx:205`, `src/App.jsx:213`, `src/App.jsx:219`, `src/App.jsx:224`.

`ProjectRow` renderiza cada projeto com nome, descrição, badges, prazo, orçamento e progresso.

- Evidência: `src/components/dashboard/ProjectRow.jsx:6`.

### Botão "Novo Projeto"

O botão textual "Novo Projeto" está em `ActionToolbar`.

- Evidência: `src/components/dashboard/ActionToolbar.jsx:29`, `ActionToolbar.jsx:34`.

O componente `ActionToolbar` recebe apenas `loading` e `onRefresh`; não recebe callback de criação.

- Evidência: `src/components/dashboard/ActionToolbar.jsx:16`.

O botão "Novo Projeto" não possui `onClick`, `Link`, `navigate`, `disabled`, abertura de modal nem submissão de formulário.

- Evidência: `src/components/dashboard/ActionToolbar.jsx:29`.

Também existe um botão "Adicionar novo projeto" em `ProjectSection`, exibido quando `showAddRow` é verdadeiro. Ele também não possui `onClick`.

- Evidência: `src/components/dashboard/ProjectSection.jsx:32`, `ProjectSection.jsx:33`, `ProjectSection.jsx:38`.

### Formulário, modal ou rota de criação

Não foi encontrado componente de formulário de projeto, modal/dialog de criação, rota de criação ou registro de React Router.

- Evidência: busca por `react-router`, `Router`, `Route`, `Link`, `useNavigate`, `navigate`, `form`, `modal`, `dialog`, `POST` em `src` não encontrou implementação de criação.
- Evidência adicional: `package.json` não lista `react-router-dom` nem `axios`.

### Build, lint e execução local

- `npm run lint`: passou sem erros.
- `npm run build`: falhou dentro do sandbox com erro `spawn EPERM` e binding nativo do Tailwind; repetido fora do sandbox, passou com sucesso.
- Build final: `✓ built in 251ms`, gerando `dist/index.html`, CSS e JS.
- Evidência: saída dos comandos em 2026-05-18 22:03 BRT.

Consulta real ao endpoint remoto `GET https://api-spring-gerenciamento-projetos.onrender.com/projetos` via PowerShell excedeu timeout de 120s no ambiente atual.

- Status: não confirmado via execução remota nesta investigação.
- Observação: isso não contradiz o comportamento observado pelo usuário de que a tela recebe dados; apenas indica que a chamada direta feita durante o diagnóstico não concluiu no tempo limite.

## 4. Fluxo do botão "Novo Projeto"

| Etapa | Status | Evidência | Observação |
|---|---|---|---|
| Clique no botão | Quebra | `src/components/dashboard/ActionToolbar.jsx:29` | O botão existe, mas não tem `onClick` nem navegação. O clique não dispara ação de aplicação. |
| Abertura de modal ou navegação | Não implementado | Busca por `modal`, `dialog`, `navigate`, `Link`, `Route` não encontrou fluxo de criação | Não há estado de modal nem roteador no projeto. |
| Renderização do formulário | Não implementado | Busca por `form` e componentes de criação não encontrou formulário de projeto | Não há tela/formulário para capturar `nome`, `status`, `prioridade`, etc. |
| Preenchimento dos dados | Não implementado | Não existe formulário associado ao botão | Sem campos de input para criação. |
| Envio para a API | Não implementado | `src/services/api.js` contém apenas `fetchCollection` com GET em `src/services/api.js:188` | Não há função `createProject` ou `POST /projetos`. |
| Resposta da API | Não foi possível verificar pelo front | API tem `POST /projetos` em `_diagnostico_api_spring/.../ProjetoController.java:39` | O backend oferece endpoint, mas o front não o chama. |
| Atualização da lista | Não implementado | `refreshDashboard` só recarrega dados manualmente em `src/App.jsx:249`; botão novo não chama nada | Após criação futura, será necessário atualizar estado ou recarregar lista. |

## 5. Integração Front-end x API

| Ponto verificado | Front-end | API | Compatível? | Evidência |
|---|---|---|---|---|
| URL base | `VITE_API_URL=https://api-spring-gerenciamento-projetos.onrender.com` | API esperada no Render | Sim, para produção informada | `.env`; `src/services/api.js:1` |
| Listagem de projetos | `GET /projetos` | `GET /projetos` | Sim | `src/services/api.js:10`; `ProjetoController.java:29` |
| Criação de projetos | Não implementada | `POST /projetos` existe | Não no front | `ActionToolbar.jsx:29`; `ProjetoController.java:39` |
| Método HTTP de leitura | `fetch` sem método explícito, portanto GET | Controller tem `@GetMapping` | Sim | `src/services/api.js:189`; `ProjetoController.java:29` |
| Request de criação | Não existe payload de criação | `ProjetoRequestDto` exige campos obrigatórios | Não implementado | `ProjetoRequestDto.java:25`, `:35`, `:38`, `:48` |
| Response de projeto | Front aceita `nome`, `descricao`, `objetivo`, `dataInicio`, `dataFim`, `orcamentoPrevisto`, `percentualConcluido` | API retorna esses campos | Sim para listagem | `src/services/api.js:236`; `ProjetoResponseDto.java:15` |
| Status de projeto | Front usa valores como `PLANEJADO`, `EM_ANDAMENTO`, `CONCLUIDO` | API enum `StatusProjeto` tem esses valores | Sim | `src/services/api.js` demo data; `StatusProjeto.java` |
| Prioridade | Front usa `BAIXA`, `MEDIA`, `ALTA`, `CRITICA` | API enum `Prioridade` tem esses valores | Sim | `Prioridade.java` |
| CORS local | Front Vite em `localhost:5173` | CORS libera `http://localhost:5173` e `127.0.0.1:5173` | Sim | `CorsConfig.java:13` |
| CORS produção | Origem específica liberada: `https://projecthub-chi-blush.vercel.app` | Se o front estiver em outro domínio, pode falhar | Parcial | `CorsConfig.java:13` |
| Autenticação | Front não envia token | API não aparenta exigir JWT/Security | Compatível | `src/services/api.js:189`; busca por Security/JWT sem resultado relevante |

## 6. Problemas encontrados

- Problema: Botão "Novo Projeto" sem ação.
- Evidência: `src/components/dashboard/ActionToolbar.jsx:29` define o botão e `ActionToolbar.jsx:34` exibe o texto, mas não há `onClick`, `Link`, `navigate` ou callback recebido pelo componente.
- Impacto: O clique não inicia nenhum fluxo de criação.
- Arquivo provável: `src/components/dashboard/ActionToolbar.jsx` e `src/App.jsx`.
- Severidade: Alta.

- Problema: Botão "Adicionar novo projeto" sem ação.
- Evidência: `src/components/dashboard/ProjectSection.jsx:33` define o botão de adição e `ProjectSection.jsx:38` exibe o texto, mas não há handler.
- Impacto: Existe uma segunda entrada visual para criação que também não funciona.
- Arquivo provável: `src/components/dashboard/ProjectSection.jsx` e `src/App.jsx`.
- Severidade: Média.

- Problema: Ausência de formulário/modal/tela de criação de projeto.
- Evidência: buscas por `form`, `modal`, `dialog`, `Route`, `Link`, `useNavigate`, `createBrowserRouter` e `POST` em `src` não encontraram fluxo de criação; `package.json` não possui `react-router-dom`.
- Impacto: Mesmo conectando o botão, não há UI para coletar os campos obrigatórios exigidos pela API.
- Arquivo provável: novo componente de formulário ou alteração em `src/App.jsx` e componentes de dashboard.
- Severidade: Alta.

- Problema: Ausência de função de serviço para criar projeto.
- Evidência: `src/services/api.js:188` implementa apenas `fetchCollection`; `loadDashboardData` em `src/services/api.js:327` apenas lista coleções.
- Impacto: O front não consegue chamar `POST /projetos` sem adicionar uma função HTTP específica.
- Arquivo provável: `src/services/api.js`.
- Severidade: Alta.

- Problema: Criação futura precisa respeitar campos obrigatórios do DTO da API.
- Evidência: `ProjetoRequestDto` exige `nome`, `status`, `prioridade` e `percentualConcluido` em `_diagnostico_api_spring/src/main/java/com/example/demo/dto/projeto/ProjetoRequestDto.java:25`, `:35`, `:38`, `:48`.
- Impacto: Um formulário incompleto receberá `400 Bad Request` por validação.
- Arquivo provável: futuro formulário de projeto e `src/services/api.js`.
- Severidade: Alta.

- Problema: CORS de produção pode estar restrito a um domínio específico.
- Evidência: `CorsConfig.java:13` libera `https://projecthub-chi-blush.vercel.app`, além de localhost/127.0.0.1.
- Impacto: Se o front real estiver hospedado em outro domínio, operações de browser podem falhar por CORS, inclusive criação.
- Arquivo provável: `_diagnostico_api_spring/src/main/java/com/example/demo/config/CorsConfig.java`.
- Severidade: Média.

## 7. Hipóteses ainda não confirmadas

- Hipótese: O endpoint remoto no Render pode estar lento, dormindo ou indisponível temporariamente, pois a consulta direta a `GET /projetos` excedeu 120s no ambiente de diagnóstico. Depende de novo teste em momento diferente ou observação do browser.
- Hipótese: Em produção, a origem real do front pode não ser `https://projecthub-chi-blush.vercel.app`; se for outro domínio, o CORS pode bloquear chamadas de criação. Depende de confirmar a URL pública usada pelo usuário.
- Hipótese: A criação via `POST /projetos` funciona no Render com Neon. O código e os testes locais indicam suporte, mas não foi feito POST remoto para evitar criar dados reais no banco.
- Hipótese: O navegador pode ter erros de console relacionados a recursos ou chamadas parciais. Não foi aberto um browser com DevTools durante esta investigação; build e lint foram verificados via terminal.

## 8. Ordem recomendada de correção

1. Definir o comportamento esperado do botão "Novo Projeto": modal na mesma tela ou rota/tela dedicada. Como o projeto não usa React Router, modal local tende a ser a menor mudança.
2. Criar a função de serviço `createProject` em `src/services/api.js`, usando `POST /projetos`, `Content-Type: application/json` e o payload compatível com `ProjetoRequestDto`.
3. Implementar um formulário mínimo com os campos obrigatórios da API: `nome`, `status`, `prioridade`, `percentualConcluido`; incluir opcionais conforme necessidade.
4. Conectar o botão "Novo Projeto" em `ActionToolbar` ao estado de abertura do formulário.
5. Decidir se o botão "Adicionar novo projeto" em `ProjectSection` chama o mesmo fluxo ou deve ser removido/ocultado depois.
6. Após criação bem-sucedida, atualizar a lista chamando `refreshDashboard` ou inserindo o projeto retornado no estado.
7. Validar no browser local em `http://localhost:5173`, verificando Network e Console.
8. Confirmar o domínio real do front em produção e ajustar CORS na API apenas se necessário.

## 9. Arquivos que provavelmente serão alterados depois

- `src/services/api.js`: adicionar função de criação de projeto com `POST /projetos` e tratamento de erro.
- `src/App.jsx`: manter estado de abertura/fechamento do fluxo de criação e acionar refresh após sucesso.
- `src/components/dashboard/ActionToolbar.jsx`: receber callback e conectar `onClick` ao botão "Novo Projeto".
- `src/components/dashboard/ProjectSection.jsx`: opcionalmente conectar "Adicionar novo projeto" ao mesmo callback ou remover duplicidade visual.
- Novo componente provável, por exemplo `src/components/dashboard/ProjectForm.jsx` ou `ProjectDialog.jsx`: criar UI de cadastro.
- `_diagnostico_api_spring/src/main/java/com/example/demo/config/CorsConfig.java`: alterar somente se o domínio real do front não estiver na lista de origins.

## 10. Conclusão

Devemos agir primeiro no front-end, conectando o botão "Novo Projeto" a um fluxo real de criação. A evidência mais forte é que `ActionToolbar` renderiza o botão sem handler, enquanto a API já expõe `POST /projetos` com DTO de criação e passou nos testes locais.

Depois disso, o segundo ponto crítico é garantir que o payload enviado pelo formulário siga exatamente `ProjetoRequestDto`: `nome`, `status`, `prioridade` e `percentualConcluido` são obrigatórios. Só depois faz sentido investigar CORS/Render/Neon para criação remota, porque hoje o front ainda não chega a fazer a chamada HTTP.
