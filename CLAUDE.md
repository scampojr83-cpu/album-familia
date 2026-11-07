# ESPECIFICAÇÃO DO PROJETO — Álbum Familiar
# Álbum de fotos da nossa família (todos os ramos e sobrenomes), organizado por IA

## 1. SEU PAPEL E COMO TRABALHAR COMIGO
Você é um engenheiro de software sênior e também meu professor. Eu NÃO sei programar.
Regras de trabalho (obrigatórias em toda sessão):
1. Salve esta especificação, sem alterar o conteúdo, como CLAUDE.md na raiz do repositório.
   Mantenha também: PROGRESSO.md (o que está pronto, fase atual, pendências),
   DECISOES.md (cada decisão técnica, com data e motivo) e GUIA_DO_ADMIN.md
   (manual em linguagem simples para eu administrar o app).
2. No início de cada sessão, leia CLAUDE.md e PROGRESSO.md antes de qualquer coisa.
3. Trabalhe UMA fase por vez (seção 10). Antes de programar, mostre em até 10 linhas:
   o que vai construir, o que eu vou precisar fazer e quanto tempo isso me toma.
4. Nunca avance de fase sem minha aprovação explícita ("aprovado, pode seguir").
5. Quando eu precisar fazer algo fora daqui (criar conta, colar chave, clicar em um
   painel), dê o passo a passo numerado, com o nome exato de cada botão e menu, e
   espere eu confirmar. Uma tarefa por vez.
6. Explique em português simples, sem jargão. Se usar um termo técnico, explique em 1 frase.
7. Se faltar informação ou houver duas saídas razoáveis, PERGUNTE. Não suponha.
8. Não troque nenhuma tecnologia da seção 4 nem acrescente serviço pago sem me perguntar.
9. Nunca escreva chaves secretas no código nem no Git. Use variáveis de ambiente e
   me diga exatamente onde cadastrar cada uma.
10. Ao fim de cada fase: publique a versão, rode os testes, atualize PROGRESSO.md,
    faça commit com mensagem clara e me entregue um ROTEIRO DE TESTE NO CELULAR
    (passos numerados, resultado esperado de cada um).
11. Se um erro persistir depois de 2 tentativas, pare, explique a causa provável e
    me dê opções, em vez de continuar tentando às cegas.
12. Se algo pedido aqui for impossível em alguma plataforma (ex.: limitação do iPhone),
    diga isso antes de programar e proponha o melhor comportamento possível.
13. Faça SEMPRE UMA PERGUNTA POR VEZ. Espere a resposta antes de fazer a próxima.
    Nunca mande uma lista de perguntas na mesma mensagem.

## 2. OBJETIVO
Um app privado onde 10 a 30 parentes enviam fotos pelo celular e uma IA organiza tudo
sozinha: descreve, data, localiza, agrupa em eventos, reconhece quem aparece e permite
buscar em linguagem natural ("vovó na praia em 2019"). Deve ser tão simples que
avós com pouca familiaridade com celular consigam usar sem ajuda.

## 3. RESTRIÇÕES
- Custo mensal: ZERO. Use apenas planos gratuitos. Se algo for estourar um limite
  gratuito, avise antes e proponha alternativa. Observação: o Cloudflare R2 exige
  cartão cadastrado para ser ativado, mas não cobra dentro do plano gratuito.
- Plataforma: PWA (app web instalável) para Android e iPhone. Sem lojas de apps.
- Idioma da interface: português do Brasil. Datas dd/mm/aaaa. Fuso America/Sao_Paulo.
- Privacidade: nada é público. Toda foto exige login de membro. Respeitar a LGPD.
- Acessibilidade: botões grandes (mínimo 48px), fonte base 17px, alto contraste,
  opção "Letras grandes" no perfil, ícones sempre acompanhados de texto.
- Aparelhos antigos: o app deve funcionar bem em celulares de 4 a 5 anos atrás.

## 4. TECNOLOGIAS (fixas — não trocar sem perguntar)
- Frontend: React + Vite + TypeScript + Tailwind CSS; PWA com vite-plugin-pwa
  (manifesto completo, ícones, service worker, funciona instalado no iOS e Android).
- Hospedagem: Cloudflare Pages, com publicação automática a cada commit na branch main.
- Backend: Supabase (Auth, Postgres com Row Level Security em TODAS as tabelas,
  Edge Functions, pg_cron).
- E-mails de login: SMTP gratuito (ex.: Brevo ou Resend) configurado no Supabase Auth
  JÁ NA FASE 1. O e-mail embutido do Supabase só envia para membros da equipe do
  projeto e com limite muito baixo por hora; não serve para os parentes.
- Arquivos de foto/áudio: Cloudflare R2, bucket privado. Upload e leitura por URLs
  assinadas de curta duração geradas por Edge Function após checar se o usuário é membro.
- IA: Google Gemini API, modelo "Flash" mais recente disponível no plano gratuito
  (confirme o nome atual na documentação e deixe-o em variável de ambiente).
  Chamadas somente pelo servidor (Edge Function), nunca pelo navegador.
- Rostos: detecção e reconhecimento NO PRÓPRIO APARELHO com biblioteca de navegador
  (ex.: @vladmandic/human). A imagem do rosto não sai do celular; só o vetor numérico.
- Leitura de data/GPS da foto: exifr, ANTES da compressão (que apaga esses dados).
- Endereço a partir do GPS: serviço gratuito (ex.: Nominatim/OpenStreetMap) com cache
  no banco e no máximo 1 consulta por segundo.

## 5. USUÁRIOS E PAPÉIS
- Administrador (scampojr83@gmail.com): convida, remove, gerencia tudo, vê painel de uso.
- Membro: envia, comenta, reage, nomeia pessoas, edita o que enviou.
- Visitante: só vê álbuns liberados para ele (ex.: amigos da família).
Entrada: SOMENTE por convite (link com código, válido 7 dias, uso único).
Login: "Entrar com Google" e "Código de 6 dígitos por e-mail". NÃO usar link mágico
(no iPhone ele abre o Safari e não o app instalado). Teste o "Entrar com Google" no
app instalado no iPhone; se ele sair do app e não voltar logado, o código por e-mail
vira o login padrão no iPhone. Sessão longa: ninguém deve precisar logar de novo por
meses. Os e-mails saem pelo SMTP gratuito da seção 4.

## 6. FUNCIONALIDADES (com critério de pronto)
F1 Envio de fotos
- Escolher várias fotos da galeria ou tirar na hora.
- Somente no Android: aparecer no menu "Compartilhar" do celular (Web Share Target),
  inclusive a partir do WhatsApp. O iPhone não permite isso para apps web; lá o envio
  é sempre pela aba Enviar.
- No aparelho: ler EXIF, gerar versão grande (lado maior 2048px, WebP ~80%) e
  miniatura (400px). Não guardar o original por padrão (economia de espaço);
  opção do admin "guardar originais" desligada.
- Fila de envio salva no aparelho, com barra de progresso. Se a internet cair, espera
  e continua sozinha. Se o app for fechado, a fila continua de onde parou quando o
  app for aberto de novo; nenhuma foto se perde.
- Limitação do iPhone: o envio só acontece com o app aberto na tela. Durante o envio,
  mostrar "Mantenha o app aberto até terminar" e impedir que a tela apague, se possível.
- Duplicatas: hash perceptual no aparelho; se já existir, avisar "Esta foto já está
  no álbum (enviada por Fulano em dd/mm)" e não enviar.
- Fotos antigas escaneadas (sem data): a IA estima a década; mostrar como "estimado".
- Pronto quando: 20 fotos enviadas de uma vez pelo iPhone (com o app aberto) e pelo
  Android aparecem na linha do tempo com data e cidade corretas; e, ao fechar o app
  no meio do envio e reabrir, as fotos restantes terminam de subir.
F2 Organização por IA (automática, em segundo plano)
- Para cada foto, UMA chamada ao Gemini com saída em JSON validado:
  descricao (1 frase), tags (até 10), ocasiao (aniversário, Natal, viagem, churrasco,
  casamento, formatura, dia a dia, outro), ambiente (interno/externo), decada_estimada
  (só se não houver data), texto_visivel (placas, bolos, faixas), qualidade
  (boa/borrada/escura/print_de_tela) e motivo.
- Fila processada por pg_cron respeitando a cota gratuita (lotes pequenos, espera
  entre chamadas, nova tentativa com espera crescente). Nunca processar a mesma foto
  duas vezes. Se a cota acabar, continua no dia seguinte, sem erro para o usuário.
- Eventos automáticos: agrupar fotos próximas no tempo (intervalo < 6h) e no espaço
  (< 5 km). A IA dá um nome ao evento (ex.: "Aniversário da vó Maria — Boituva,
  mar/2025"). Qualquer membro pode renomear, juntar ou separar eventos.
- Fotos com qualidade ruim ou prints de tela vão para "Revisar", nunca são apagadas.
- Toda correção humana prevalece sobre a IA e não é sobrescrita depois.
F3 Pessoas
- Detectar rostos no aparelho na hora do envio; agrupar rostos parecidos; a família
  nomeia uma vez ("Quem é?") e o app passa a reconhecer.
- Desempenho: medir quanto o aparelho demora para analisar uma foto. Se for lento,
  pular a detecção nesse aparelho sem atrasar o envio, e avisar de forma simples.
  Opção "Reconhecer rostos neste celular" (ligada/desligada) no perfil. Fotos enviadas
  sem análise podem ser analisadas depois por outro membro que abrir a foto.
- Consentimento: cada membro aceita ou recusa o reconhecimento do próprio rosto;
  pais/responsáveis decidem por menores. Quem recusar não é reconhecido e seus
  vetores são apagados. Admin pode desligar o recurso inteiro.
- Álbum automático por pessoa e filtro "fotos com Fulano E Beltrano".
F4 Navegação e busca
- Início: "Novidades" (últimas fotos), "Neste dia" (mesma data em anos anteriores),
  eventos recentes.
- Abas inferiores: Início | Linha do tempo | Pessoas | Buscar | Enviar.
- Linha do tempo agrupada por ano > mês, rolagem rápida, carregamento progressivo.
- Busca em linguagem natural: o Gemini converte a frase em filtros (pessoas, período,
  lugar, ocasião, tags) + busca textual em português nas descrições. Mostrar os
  filtros entendidos como etiquetas removíveis.
- Mapa das fotos por cidade (sem endereço exato; ver seção 8).
F5 Convivência
- Comentários e reações (❤️ 😂 😮 😢).
- "Conte a história desta foto": gravação de áudio de até 2 min (pensado para os
  avós); o Gemini transcreve e o texto vira buscável.
- Notificações (Web Push): resumo no máximo 1x por dia ("12 fotos novas do churrasco
  de domingo") e quando alguém comenta foto sua. Cada pessoa pode desligar.
- Retrospectiva do ano em dezembro (seleção das melhores fotos por evento).
F6 Segurança e cuidado com os dados
- Lixeira de 30 dias; só quem enviou ou o admin apaga.
- Exportar tudo (fotos + planilha de dados) em ZIP, pelo painel do admin.
- Painel do admin: membros, convites, espaço usado vs. limite gratuito, cota de IA
  do dia, e-mails enviados no dia, fila pendente, erros recentes.
- Tarefa automática semanal (GitHub Actions) que acessa o Supabase para o projeto
  gratuito não ser pausado por inatividade.

## 7. DADOS (proposta — ajuste e registre em DECISOES.md)
familia, membros (papel, consentimento_rosto, letras_grandes), convites, fotos
(autor, data_foto, data_estimada, cidade, lat/lng arredondadas, chaves R2, hash,
status_ia, status_rostos, qualidade), analises_ia (json bruto + versão do modelo),
eventos, fotos_eventos, pessoas, rostos (vetor, caixa, pessoa, confirmado_por),
comentarios, reacoes, historias_audio (transcrição), notificacoes, fila_ia, log_erros.
RLS: só membros da família leem; só o autor ou o admin alteram/apagam.

## 8. PRIVACIDADE (LGPD)
- Tela de boas-vindas com termo curto e claro: o que é guardado, quem vê, que a IA
  do Google analisa as fotos, e como pedir exclusão. Aceite registrado com data.
- Rosto é dado biométrico (sensível): só com consentimento explícito, revogável.
- Localização: guardar coordenadas arredondadas (~1 km) e mostrar apenas a cidade.
- "Excluir minha conta e meus dados" no perfil.

## 9. QUALIDADE
- Testes automatizados nas regras de permissão (RLS) e nas funções de IA/upload.
- Toda tela com estado de carregando, vazio e erro, com mensagens humanas
  ("Sem internet. Suas fotos serão enviadas assim que a conexão voltar.").
- Abrir rápido em 4G: miniaturas, carregamento sob demanda, cache no aparelho.
- Nada de dados de exemplo misturados com dados reais.

## 10. FASES (uma por vez, cada uma termina com teste no celular)
0 Fundação: projeto, CLAUDE.md, publicação no Cloudflare Pages, PWA instalável.
1 Acesso: SMTP gratuito, login, convites, perfis, papéis, termo de privacidade.
2 Fotos: envio (F1), linha do tempo, visualizador, duplicatas, lixeira.
3 IA: análise, eventos, "Revisar", busca em linguagem natural (F2, F4).
4 Pessoas: rostos no aparelho, consentimento, álbuns por pessoa (F3).
5 Convivência: comentários, reações, histórias em áudio, Neste dia, notificações (F5).
6 Entrega: painel do admin, exportação, proteção contra pausa, revisão de
  segurança, GUIA_DO_ADMIN.md e mensagem-convite pronta para a família.

## 11. FORA DO ESCOPO (não fazer agora)
App nas lojas, vídeos longos, edição de fotos, rede social aberta, impressão de
álbuns, várias famílias no mesmo app. Ideias novas vão para uma lista "Futuro"
em PROGRESSO.md, sem implementar.
