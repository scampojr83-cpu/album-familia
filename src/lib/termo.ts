// Termo de privacidade (LGPD). Ao mudar o texto, aumente a versão:
// todos verão o termo de novo e o novo aceite fica registrado com data.
export const VERSAO_TERMO = '1.0';

export const TERMO: { titulo: string; texto: string }[] = [
  {
    titulo: 'O que guardamos',
    texto:
      'Seu nome, seu e-mail, as fotos que você enviar e a data e a cidade de cada foto. Nas próximas versões também os comentários, as reações e os áudios que você gravar.',
  },
  {
    titulo: 'Quem vê',
    texto:
      'Só quem foi convidado para o álbum da família. Nada é público. Visitantes veem apenas os álbuns liberados para eles.',
  },
  {
    titulo: 'Inteligência artificial',
    texto:
      'As fotos são analisadas pela inteligência artificial do Google (Gemini) para criar descrições, datas e eventos. O reconhecimento de rostos é feito no próprio celular e só acontece se você permitir; você pode mudar de ideia quando quiser.',
  },
  {
    titulo: 'Localização',
    texto: 'Guardamos só um ponto aproximado (cerca de 1 km) e mostramos apenas a cidade.',
  },
  {
    titulo: 'Como sair e apagar seus dados',
    texto:
      'Em Perfil, toque em "Excluir minha conta e meus dados". Você também pode pedir a exclusão ao administrador da família.',
  },
];

export function precisaAceitarTermo(versaoAceita: string | null): boolean {
  return versaoAceita !== VERSAO_TERMO;
}
