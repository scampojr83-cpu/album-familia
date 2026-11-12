# Guia do administrador

Manual em linguagem simples para administrar o app da família.
Ele cresce a cada fase concluída.

## Onde as coisas ficam
| O quê | Onde |
|---|---|
| Código do app | GitHub, repositório `album-familia` |
| Especificação e progresso | Arquivos `CLAUDE.md` e `PROGRESSO.md` no repositório |
| Desenho do ícone | `design/icones/icone-escolhido.svg` |
| Site publicado | https://album-familiar-ed1.pages.dev (Cloudflare Pages, gratuito) |

## Como uma mudança chega ao app
1. O Claude trabalha num rascunho (branch) e a Cloudflare gera um link de teste.
2. Você testa no celular pelo roteiro que ele entrega.
3. Se estiver tudo certo, você diz "aprovado, pode seguir".
4. O Claude abre um pedido no GitHub e você clica no botão verde **Merge**.
5. Em 1 a 2 minutos a Cloudflare publica a nova versão no endereço principal.

## Convidar um parente
1. Abra o app e toque na aba **Família**.
2. Em "Para quem é o convite?", escreva o nome (opcional).
3. Escolha **Membro da família** (vê tudo e envia fotos) ou **Visitante** (só vê o que for liberado).
4. Toque em **Criar convite** e depois em **Enviar convite**. Escolha o WhatsApp e a pessoa.
5. O convite vale 7 dias e serve para uma pessoa só. Se vencer, crie outro.

**No iPhone:** se o app pedir o código depois de instalado, a pessoa digita as 8 letras e números que estão na mensagem (ex.: `KQ7M-XR4T`).

## Cancelar um convite
Aba **Família** → "Convites em aberto" → **Cancelar**.

## Mudar o acesso ou remover alguém
Aba **Família** → "Quem está na família":
- **Tornar visitante / Tornar membro** muda o que a pessoa pode fazer.
- **Remover** tira o acesso da pessoa. Para ela voltar, mande um convite novo.

## Se alguém pedir para apagar os dados (LGPD)
A própria pessoa pode ir em **Perfil** → **Excluir minha conta e meus dados**. Se ela não conseguir, remova-a pela aba Família e avise o Claude para apagar o login dela no Supabase.

_(As próximas seções — ver o espaço usado, fazer backup — serão escritas nas fases seguintes.)_
