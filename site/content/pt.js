// Page content for the pre-rendered Brazilian Portuguese pages. Only the site
// generator (scripts/build-site.js) reads this file; it is not shipped to
// browsers. Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'QR code de URL e texto',
    title: 'Gerador de QR code grátis que nunca expira | QRTurbo.app',
    description:
      'Crie QR codes grátis para links, WiFi, vCard e muito mais. Sem cadastro, sem período de teste, sem rastreamento: tudo no seu navegador e sem prazo de validade.',
    eyebrow: 'Gerador de QR code grátis',
    display: 'QR codes grátis que nunca param de funcionar.',
    lead:
      'Crie QR codes para links, WiFi, contatos e muito mais, direto no seu navegador. Sem cadastro, sem período de teste, sem redirecionamento: o seu conteúdo vai para dentro do próprio código, por isso ele funciona para sempre. Adicione logo, cores e uma moldura “Escaneie”.'
  },
  types: {
    wifi: {
      name: 'QR code do WiFi',
      title: 'Gerador de QR code do WiFi grátis, privado e seguro | QRTurbo.app',
      description:
        'Crie grátis um QR code do WiFi para suas visitas entrarem na rede com uma leitura. A senha fica no seu navegador. Sem cadastro, sem rastreamento, nunca expira.',
      eyebrow: 'Gerador de QR code do WiFi',
      display: 'Suas visitas se conectam ao WiFi com uma única leitura.',
      lead:
        'Digite o nome da rede e a senha para criar um QR code do WiFi. A senha nunca sai do seu dispositivo, e o código funciona enquanto as configurações da rede continuarem as mesmas.',
      aboutTitle: 'Como funciona o QR code do WiFi',
      about: [
        'Um QR code do WiFi contém o nome da rede (SSID), o tipo de segurança e a senha em um formato padrão que a câmera do iPhone e do Android entende. Ao escanear, o celular oferece a opção de entrar na rede, e ninguém precisa digitar uma senha longa.',
        'Imprima o código para sua casa, escritório, cafeteria ou imóvel de temporada e coloque-o onde as visitas possam ver. Se você mudar a senha ou o nome da rede, crie um código novo.',
        'Muitos geradores on-line enviam a sua senha para os servidores deles. O QRTurbo.app cria o código no seu navegador, então a sua senha nunca é enviada nem armazenada em lugar nenhum.'
      ]
    },
    vcard: {
      name: 'QR code vCard',
      title: 'QR code vCard grátis para cartão de visita | QRTurbo.app',
      description:
        'Crie grátis um QR code vCard para o seu cartão de visita. Uma leitura salva nome, telefone, e-mail e endereço nos contatos. Sem cadastro, nunca expira.',
      eyebrow: 'Gerador de QR code vCard',
      display: 'Compartilhe seus contatos com uma única leitura.',
      lead:
        'Adicione seu nome, telefone, e-mail e endereço para criar um QR code vCard para cartões de visita, crachás e assinaturas de e-mail. Os dados ficam no próprio código, não em um servidor.',
      aboutTitle: 'Como funciona o QR code vCard',
      about: [
        'Um QR code vCard contém um cartão de visita digital no formato vCard. Quando alguém escaneia o código, o celular oferece salvar os dados como um novo contato, sem precisar digitar nada à mão.',
        'Preencha só os campos que você quer compartilhar. Quanto mais dados você adiciona, mais denso o código fica, então imprima com pelo menos 2,5 cm de largura e teste antes de encomendar uma tiragem grande de cartões.',
        'Como os dados ficam codificados diretamente no código, não é possível alterá-los depois. Se o seu telefone ou cargo mudar, crie um código novo para a próxima impressão.'
      ]
    },
    sms: {
      name: 'QR code de SMS e ligação',
      title: 'Gerador de QR code grátis para SMS e ligação | QRTurbo.app',
      description:
        'Crie grátis um QR code que abre uma mensagem de texto ou inicia uma ligação, com SMS pré-preenchido. Feito no seu navegador, sem cadastro, nunca expira.',
      eyebrow: 'Gerador de QR code para SMS e ligação',
      display: 'Abra um SMS ou inicie uma ligação com uma única leitura.',
      lead:
        'Crie um QR code que abre uma mensagem de texto pré-preenchida ou liga para um número de telefone. Funciona muito bem para atendimento ao cliente, reservas, sorteios e adesivos de assistência técnica.',
      aboutTitle: 'Como funciona o QR code de SMS e ligação',
      about: [
        'Um QR code de SMS abre o app de mensagens com o número de telefone e a sua mensagem já preenchidos, então quem escaneia só precisa tocar em enviar. Um QR code de ligação abre o discador com o número pronto para ligar.',
        'Digite sempre o número no formato internacional, por exemplo +55 11 91234-5678, para que o código também funcione para quem usa um celular de outro país.',
        'O celular nunca envia a mensagem nem faz a ligação automaticamente. Quem escaneia sempre precisa confirmar antes.'
      ]
    },
    email: {
      name: 'QR code de e-mail',
      title: 'QR code de e-mail grátis com mensagem pronta | QRTurbo.app',
      description:
        'Crie grátis um QR code de e-mail que abre uma nova mensagem com destinatário, assunto e texto já preenchidos. Sem cadastro, sem rastreamento, nunca expira.',
      eyebrow: 'Gerador de QR code de e-mail',
      display: 'Abra um e-mail pronto para enviar com uma única leitura.',
      lead:
        'Adicione destinatário, assunto e mensagem para criar um QR code de e-mail para avaliações, solicitações de suporte, pedidos e inscrições.',
      aboutTitle: 'Como funciona o QR code de e-mail',
      about: [
        'Um QR code de e-mail contém um link mailto. Ao escanear, o app de e-mail abre com destinatário, assunto e mensagem já preenchidos, e quem escaneia decide se vai enviar.',
        'Mantenha curta a mensagem pré-preenchida. Textos longos deixam o código mais denso e mais difícil de ler a distância.',
        'Use um assunto claro, como “Avaliação: mesa 12”, para organizar com facilidade as mensagens que você receber.'
      ]
    },
    event: {
      name: 'QR code de evento de agenda',
      title: 'QR code de evento grátis para adicionar à agenda | QRTurbo.app',
      description:
        'Crie grátis um QR code de evento. Uma leitura adiciona título, horário, local e detalhes à agenda do celular. Feito no seu navegador, nunca expira.',
      eyebrow: 'Gerador de QR code de evento',
      display: 'Seu evento na agenda dos convidados com uma única leitura.',
      lead:
        'Digite o título, o horário e o local do evento para criar um QR code para convites, cartazes, ingressos e salas de reunião.',
      aboutTitle: 'Como funciona o QR code de evento',
      about: [
        'Um QR code de evento contém um compromisso de agenda no formato iCalendar. Ao escanear, a pessoa pode adicionar o evento à agenda com a data, o horário e o local certos.',
        'O suporte a QR codes de agenda varia entre celulares e apps de leitura. Teste o código com um iPhone e com um Android antes de imprimir os convites.',
        'Preencha o campo de local para que os convidados encontrem o endereço direto pela agenda.'
      ]
    },
    location: {
      name: 'QR code de localização',
      title: 'Gerador de QR code de localização grátis | QRTurbo.app',
      description:
        'Crie grátis um QR code de localização que abre um endereço ou coordenadas no app de mapas. Ótimo para convites e placas. Sem cadastro, nunca expira.',
      eyebrow: 'Gerador de QR code de localização',
      display: 'Mostre o caminho com uma única leitura.',
      lead:
        'Digite um endereço ou coordenadas para criar um QR code que abre o local em um app de mapas. Use em convites, panfletos, placas e instruções de entrega.',
      aboutTitle: 'Como funciona o QR code de localização',
      about: [
        'Um endereço gera um QR code com um link de busca do Google Maps, que abre no navegador ou em um app de mapas em qualquer celular. Coordenadas geram um link geo, que abre direto no app de mapas padrão do celular.',
        'Coordenadas são a opção mais precisa para lugares sem endereço, como um sítio, o início de uma trilha ou o portão de acesso a um evento.',
        'Teste o código no seu próprio celular para conferir se ele aponta exatamente para o lugar certo.'
      ]
    },
    social: {
      name: 'QR code para redes sociais',
      title: 'QR code grátis para Instagram e redes sociais | QRTurbo.app',
      description:
        'Crie grátis um QR code para o seu perfil no Instagram, TikTok, YouTube, LinkedIn e outras redes. É só digitar seu usuário. Sem cadastro, nunca expira.',
      eyebrow: 'Gerador de QR code para redes sociais',
      display: 'Transforme o público presencial em seguidores.',
      lead:
        'Escolha uma plataforma e digite seu nome de usuário para criar um QR code que abre o seu perfil. Funciona com Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky e muito mais.',
      aboutTitle: 'Como funciona o QR code para redes sociais',
      about: [
        'Um QR code para redes sociais contém um link para o seu perfil. Ao escanear, o perfil abre no app, se ele estiver instalado, ou no navegador.',
        'Digite seu nome de usuário e o QRTurbo.app monta o endereço certo do perfil para a plataforma escolhida. Você também pode colar a URL completa do perfil.',
        'Coloque o código em embalagens, cartões de visita, cartazes e estandes de eventos. Adicione uma moldura com uma chamada curta, como “Siga a gente”, para que as pessoas saibam o que vão encontrar.'
      ]
    },
    whatsapp: {
      name: 'QR code do WhatsApp',
      title: 'QR code do WhatsApp grátis para iniciar conversa | QRTurbo.app',
      description:
        'Crie grátis um QR code do WhatsApp que abre uma conversa com o seu número e uma mensagem pronta. Feito no seu navegador. Sem cadastro, nunca expira.',
      eyebrow: 'Gerador de QR code do WhatsApp',
      display: 'Comece uma conversa no WhatsApp com uma única leitura.',
      lead:
        'Digite seu número de telefone ou nome de usuário do WhatsApp e, se quiser, uma mensagem. Seus clientes podem falar com você sem precisar salvar o seu número antes.',
      aboutTitle: 'Como funciona o QR code do WhatsApp',
      about: [
        'Um QR code do WhatsApp contém um link wa.me. Ao escanear, abre uma conversa com você, com a mensagem pré-preenchida pronta para enviar.',
        'Digite o número no formato internacional, com o código do país, por exemplo +55 11 91234-5678. Espaços e hífens são removidos automaticamente.',
        'O código contém o próprio link wa.me, e não um redirecionamento, então continua funcionando enquanto o número usar o WhatsApp.'
      ]
    },
    app: {
      name: 'QR code para baixar app',
      title: 'QR code grátis para App Store e Google Play | QRTurbo.app',
      description:
        'Crie grátis um QR code para a página de download do seu app ou para o link da App Store ou do Google Play. Sem cadastro, sem redirecionamento, nunca expira.',
      eyebrow: 'Gerador de QR code para download de app',
      display: 'Leve as pessoas direto para o seu app.',
      lead:
        'Adicione a página do seu app, o link da App Store e o link do Google Play para criar um QR code de download.',
      aboutTitle: 'Como funciona o QR code para download de app',
      about: [
        'Um QR code guarda um único link, e o QRTurbo.app nunca adiciona redirecionamento. Se você tem uma página que leva quem usa iPhone para a App Store e quem usa Android para o Google Play, use essa página como URL web para ter o melhor resultado em qualquer celular.',
        'Sem uma página assim, escolha qual link de loja o código vai abrir, ou imprima códigos separados para a App Store e o Google Play.',
        'Confira se os links das lojas são públicos e não têm parâmetros de rastreamento que você não quer compartilhar.'
      ]
    }
  },
  comparison: {
    title: 'QR codes grátis que nunca param de funcionar',
    intro:
      'Muitos geradores de QR code “grátis” criam códigos dinâmicos que apontam para o próprio servidor de redirecionamento. Quando o período de teste acaba, o código é desativado, muitas vezes quando já foi impresso em cardápios, cartões de visita ou embalagens. O QRTurbo.app funciona de outro jeito.',
    headers: {
      feature: 'Pergunta',
      dynamic: 'QR code típico de “teste grátis”',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Onde fica o seu conteúdo?',
        dynamic: 'No servidor do provedor, atrás de um link curto de redirecionamento',
        qrturbo: 'Dentro do próprio QR code'
      },
      {
        feature: 'O que acontece quando o teste acaba?',
        dynamic: 'O código é desativado até você pagar',
        qrturbo: 'Nada. Não existe período de teste, e o código continua funcionando'
      },
      {
        feature: 'Precisa criar uma conta?',
        dynamic: 'Geralmente, sim',
        qrturbo: 'Não'
      },
      {
        feature: 'Quem vê as suas leituras?',
        dynamic: 'Cada leitura passa pelo provedor',
        qrturbo: 'Ninguém. As leituras nunca chegam até nós'
      },
      {
        feature: 'Quanto custa?',
        dynamic: 'Uma assinatura mensal ou anual',
        qrturbo: 'Nada, inclusive para uso comercial'
      }
    ],
    note:
      'A única desvantagem: um QR code estático não pode ser editado depois de impresso. Se você talvez precise mudar o destino mais tarde, crie o código para uma página que você controla e atualize essa página.'
  },
  faq: {
    title: 'Perguntas frequentes',
    items: [
      {
        q: 'Os QR codes criados com o QRTurbo.app expiram?',
        a: 'Não. O QRTurbo.app cria QR codes estáticos: o seu link, texto ou dados de contato são codificados diretamente no código. Não há nenhum servidor no meio, então não há nada que possa expirar ou ser desativado. O código continua funcionando enquanto o conteúdo for válido, por exemplo, enquanto existir o site para o qual ele aponta.'
      },
      {
        q: 'Por que o meu QR code de outro site parou de funcionar?',
        a: 'Muitos geradores criam QR codes dinâmicos por padrão. Eles contêm um link curto para o servidor do provedor, que redireciona cada leitura para o seu endereço real. Quando o teste grátis ou a assinatura termina, o provedor desliga o redirecionamento e o código impresso para de funcionar. Os códigos do QRTurbo.app contêm o seu conteúdo real e nunca dependem de nós.'
      },
      {
        q: 'O QRTurbo.app é grátis mesmo? Posso usar os códigos para fins comerciais?',
        a: 'Sim. Não há cadastro, período de teste, marca d’água nem limite de leituras. Você pode usar os QR codes que criar para fins pessoais e comerciais, como cartões de visita, cardápios, embalagens e publicidade.'
      },
      {
        q: 'Posso alterar um QR code depois de imprimir?',
        a: 'Não. Um QR code estático não pode ser editado, porque o conteúdo faz parte do próprio desenho do código. Se você acha que vai mudar o destino, crie o código para um endereço que você controla, como uma página do seu próprio site, e atualize essa página.'
      },
      {
        q: 'De que tamanho devo imprimir um QR code?',
        a: 'Imprima com pelo menos 2 × 2 cm. Como regra prática, o código deve ter pelo menos um décimo da distância de leitura: um cartaz lido a 2 metros precisa de um código de uns 20 cm. Para impressão, baixe um SVG ou um PNG grande e deixe vazia a zona de silêncio ao redor do código.'
      },
      {
        q: 'Por que o meu QR code não está sendo lido?',
        a: 'As causas mais comuns são pouco contraste entre o código e o fundo, uma zona de silêncio pequena demais, um logo que cobre boa parte do código ou conteúdo demais para o tamanho impresso. O QRTurbo.app avisa você sobre esses riscos. Teste sempre o código com alguns celulares diferentes antes de imprimir.'
      },
      {
        q: 'Meus dados estão seguros? Vocês conseguem ver a minha senha do WiFi?',
        a: 'Seus dados ficam no seu dispositivo. O QR code é gerado por código que roda no seu navegador, e nada do que você digita ou envia vai para um servidor, então ninguém consegue ver a sua senha do WiFi nem os seus dados de contato. Depois da primeira visita, o gerador também funciona offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Geradores de QR code grátis'
  }
};
