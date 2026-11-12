# Decisões técnicas

Cada decisão com data e motivo. A mais recente fica no fim.

## 07/11/2026 — Especificação como fonte única
- **Decisão:** a especificação do projeto fica em `CLAUDE.md`, relida em toda sessão.
- **Motivo:** evita retrabalho e mantém as decisões estáveis entre sessões.

## 07/11/2026 — Uma pergunta por vez
- **Decisão:** regra 13 adicionada à seção 1 do `CLAUDE.md`: fazer sempre uma pergunta por vez.
- **Motivo:** pedido explícito do administrador.

## 07/11/2026 — Ícone do app
- **Decisão:** opção 1, "Álbum aberto" (livro de fotos com coração, fundo terracota). Arquivo: `design/icones/icone-escolhido.svg`.
- **Motivo:** escolha do administrador entre 4 opções apresentadas.

## 07/11/2026 — Endereço do app
- **Decisão:** usar o endereço gratuito da Cloudflare (`album-familiar.pages.dev`, ou com complemento se o nome estiver ocupado).
- **Motivo:** custo zero e mesma segurança (HTTPS, login obrigatório, RLS, URLs assinadas). Um domínio próprio pode ser acrescentado depois sem refazer nada.

## 07/11/2026 — Fluxo de aprovação das fases
- **Decisão:** o trabalho é feito num rascunho (branch). Cada fase tem um link de teste da Cloudflare. Após "aprovado, pode seguir", Claude abre um pull request para a branch `main` e o administrador confirma clicando em "Merge" no GitHub.
- **Motivo:** o app que a família usa (main) só muda com aprovação explícita.

## 07/11/2026 — Celular de teste
- **Decisão:** testes principais num Samsung Galaxy S23 Ultra (Android).
- **Motivo:** aparelho do administrador. Ainda falta definir como testar no iPhone e num celular antigo.

## 07/11/2026 — Base técnica da Fase 0
- **Decisão:** React 19 + Vite 8 + TypeScript + Tailwind CSS 4 + vite-plugin-pwa 2, com testes em Vitest. Node 22 (arquivo `.node-version`, lido pela Cloudflare).
- **Motivo:** tecnologias fixadas na seção 4 da especificação, nas versões estáveis atuais.
- **Detalhe:** os ícones PNG são gerados a partir de `design/icones/icone-escolhido.svg` pelo comando `npm run icones`; o mesmo desenho serve de ícone "maskable" (Android), pois o conteúdo fica dentro da área segura.

## 07/11/2026 — Endereço definitivo
- **Decisão:** o nome `album-familiar` já estava em uso na Cloudflare; o projeto ficou com o endereço `album-familiar-ed1.pages.dev` (versão principal).
- **Links de teste:** cada rascunho ganha um endereço próprio, ex.: `claude-focused-ramanujan-oe2.album-familiar-ed1.pages.dev`.

## 12/11/2026 — Fase 1: banco de dados de acesso
- **Decisão:** tabelas `familia`, `membros`, `convites` e `aceites_termo` (arquivo `supabase/migrations/20261112000000_fase1_acesso.sql`). RLS ligado em todas. O navegador só pode ler o que as regras liberam e mudar o próprio nome e "Letras grandes"; papel, convites, remoção e exclusão de conta passam por funções do banco que conferem quem está pedindo.
- **Motivo:** seção 7 da especificação, com o mínimo necessário para esta fase. As demais tabelas entram nas fases seguintes.
- **Testes:** `npm run test:banco` roda os testes das regras num Postgres temporário que imita o Supabase (`supabase/tests/`).

## 12/11/2026 — Administrador e convites
- **Decisão:** o e-mail do administrador fica numa função do banco (`email_administrador`). No primeiro acesso dele, a família é criada e ele vira administrador sem convite. Todos os outros precisam de convite.
- **Decisão:** código de convite com 8 letras e números, sem os que se confundem (I, O, 0, 1), mostrado como `ABCD-EFGH`. Vale 7 dias, serve para uma pessoa e pode ser cancelado. Só existem os papéis Membro e Visitante nos convites; ninguém vira administrador pelo app.
- **Motivo:** seção 5. O código curto pode ser ditado por telefone ou digitado por avós.

## 12/11/2026 — Convite no iPhone (limitação da plataforma)
- **Limitação:** no iPhone, o app instalado não enxerga o que foi guardado no Safari. Se a pessoa abre o link do convite no Safari e depois instala o app, o código não passa junto.
- **Decisão:** a mensagem de convite traz o código escrito. Se o app não achar o código guardado, ele pede para digitar (8 letras e números). No Android o código passa sozinho.

## 12/11/2026 — Login
- **Decisão:** "Entrar com Google" e "Código de 6 números por e-mail" (sem link mágico). A conta de login é criada no primeiro código pedido, mas só entra na família quem tem convite; sem convite, a pessoa não vê nada.
- **Decisão:** sessão longa: o app renova o acesso sozinho e guarda o login no aparelho. A Supabase, por padrão, não vence o login por tempo; não mudar isso.
- **Risco aceito:** qualquer pessoa pode pedir um código para o próprio e-mail (sem convite ela não entra em nada). O limite de envios por hora do Supabase protege a cota de e-mails.
- **Pendente de teste:** "Entrar com Google" dentro do app instalado no iPhone. Se não voltar logado, o código por e-mail vira o padrão no iPhone (seção 5).

## 12/11/2026 — Termo de privacidade
- **Decisão:** texto em `src/lib/termo.ts`, versão 1.0. Cada aceite fica registrado com data (`aceites_termo`). Se o texto mudar, a versão sobe e todos aceitam de novo.
- **Decisão:** "Excluir minha conta e meus dados" apaga o login, e o resto some em cascata. A conta do administrador não pode ser excluída pelo app.

## 12/11/2026 — Chaves do Supabase no app
- **Decisão:** o app usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, cadastradas na Cloudflare Pages. A chave "publishable" é feita para ficar no navegador; quem protege os dados é o RLS. A chave secreta do Supabase nunca vai para o app nem para o Git.
- **Sem configuração:** o app mostra "está sendo preparado" em vez de quebrar.
