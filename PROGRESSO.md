# Progresso do projeto

**Fase atual:** 1 — Acesso (código pronto em 12/11/2026; falta configurar os serviços e testar no celular). Fase 0 aprovada em 07/11/2026.

## Pronto
- [x] Especificação salva como `CLAUDE.md` (07/11/2026)
- [x] Arquivos de acompanhamento criados: `PROGRESSO.md`, `DECISOES.md`, `GUIA_DO_ADMIN.md`

## Fases
| Fase | Situação |
|---|---|
| 0 Fundação | Aprovada (07/11/2026) |
| 1 Acesso | Código pronto; aguardando configuração e teste |
| 2 Fotos | Não iniciada |
| 3 IA | Não iniciada |
| 4 Pessoas | Não iniciada |
| 5 Convivência | Não iniciada |
| 6 Entrega | Não iniciada |

- [x] Projeto criado: React + Vite + TypeScript + Tailwind + PWA (vite-plugin-pwa)
- [x] Tela "Bem-vindos à família" com instrução de instalação certa para Android, iPhone (Safari) e iPhone fora do Safari
- [x] Ícones PNG gerados a partir do ícone escolhido (`npm run icones`)
- [x] Testes automáticos (5 passando) e compilação ok

## Pendências
- Campos da especificação preenchidos: nome (Álbum Familiar), descrição sem sobrenome, admin scampojr83@gmail.com.
- Ícone escolhido: opção 1 (Álbum aberto).
- Endereço: gratuito da Cloudflare (.pages.dev).
- Aprovação: rascunho + link de teste + "Merge" no GitHub.
- Celular de teste: Samsung S23 Ultra (Android).
- iPhone: um parente com iPhone testa no fim de cada fase (~10 min).
- Perguntas iniciais da Fase 0: todas respondidas.
- [x] Cloudflare Pages conectada ao GitHub (projeto `album-familiar`, branch de produção `main`).
- [x] Link de teste no ar: https://claude-focused-ramanujan-oe2.album-familiar-ed1.pages.dev
- [x] Teste no Samsung S23 Ultra: 5 de 5 passos ok (07/11/2026).
- [x] Teste no iPhone: 5 de 5 passos ok (07/11/2026).
- [x] Fase 0 aprovada pelo administrador (07/11/2026).

## Fase 1 — Acesso (branch `claude/fase-1-acesso`)
- [x] Banco: famílias, membros, convites, aceites do termo, com RLS e testes (`npm run test:banco`)
- [x] Tela Entrar: "Entrar com Google" e código de 6 números por e-mail
- [x] Convites: criar, enviar pelo WhatsApp, cancelar; código digitável (útil no iPhone)
- [x] Termo de privacidade com aceite registrado; tela "Como a família te chama?"
- [x] Perfil: nome, "Letras grandes", sair, excluir conta
- [x] Família (só administrador): convites em aberto, mudar tipo de acesso, remover pessoa
- [x] 17 testes do app + testes do banco passando; build ok
- [ ] Tarefa 1 do administrador: criar conta e projeto no Supabase
- [ ] Tarefa 2: rodar o arquivo do banco no SQL Editor
- [ ] Tarefa 3: Brevo (SMTP gratuito) ligado ao Supabase + modelo de e-mail com o código
- [ ] Tarefa 4: credencial do Google para "Entrar com Google"
- [ ] Tarefa 5: cadastrar as 2 variáveis na Cloudflare Pages
- [ ] Teste no Samsung S23 Ultra e no iPhone (inclui Google no iPhone instalado)

## Futuro (ideias anotadas, sem implementar)
- (vazio)
