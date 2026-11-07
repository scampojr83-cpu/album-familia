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
