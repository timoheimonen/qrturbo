// Brazilian Portuguese translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.pt = {
    app: {
      selectLanguage: 'Selecionar idioma'
    },
    aria: {
      themeGroup: 'Tema',
      lightTheme: 'Tema claro',
      darkTheme: 'Tema escuro',
      language: 'Idioma',
      qrTypes: 'Tipos de QR code'
    },
    tabs: {
      urlText: 'URL/Texto',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefone',
      wifi: 'WiFi',
      email: 'E-mail',
      calendarEvent: 'Evento',
      location: 'Localização',
      socialMedia: 'Redes sociais',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'Link de app'
    },
    fields: {
      textOrUrl: 'Texto ou URL',
      firstName: 'Nome',
      lastName: 'Sobrenome',
      organization: 'Empresa',
      title: 'Cargo',
      phoneWork: 'Telefone (trabalho)',
      phoneMobile: 'Telefone (celular)',
      email: 'E-mail',
      website: 'Site',
      street: 'Rua e número',
      city: 'Cidade',
      state: 'Estado',
      zip: 'CEP',
      country: 'País',
      ssid: 'Nome da rede (SSID)',
      password: 'Senha',
      authentication: 'Autenticação',
      hiddenNetwork: 'Esta é uma rede oculta',
      phoneNumber: 'Número de telefone',
      message: 'Mensagem (opcional)',
      qrSize: 'Tamanho do QR code',
      foregroundColor: 'Cor principal',
      backgroundColor: 'Cor de fundo',
      transparentBackground: 'Fundo transparente',
      errorCorrection: 'Correção de erros',
      downloadFormat: 'Formato de download',
      dotStyle: 'Estilo dos pontos',
      cornerSquare: 'Quadrado dos cantos',
      cornerDot: 'Ponto dos cantos',
      quietZone: 'Zona de silêncio (margem)',
      logoSize: 'Tamanho do logo',
      logoMargin: 'Margem do logo',
      logo: 'Logo (opcional)',
      styleOptions: 'Opções de estilo',
      emailTo: 'E-mail do destinatário',
      emailSubject: 'Assunto',
      emailBody: 'Mensagem',
      eventTitle: 'Título do evento',
      eventStart: 'Início',
      eventEnd: 'Término',
      eventLocation: 'Local',
      eventDescription: 'Descrição',
      locationAddress: 'Endereço ou local',
      latitude: 'Latitude',
      longitude: 'Longitude',
      socialPlatform: 'Plataforma',
      socialProfileType: 'Tipo de perfil',
      socialHandleOrUrl: 'Usuário ou URL do perfil',
      whatsappPhone: 'Número do WhatsApp ou @usuário',
      whatsappMessage: 'Mensagem (opcional)',
      mecardName: 'Nome',
      address: 'Endereço',
      appWebUrl: 'URL web / alternativa',
      appIosUrl: 'URL da App Store (iOS)',
      appAndroidUrl: 'URL da Play Store (Android)',
      appLinkTarget: 'Loja alternativa',
      frame: 'Moldura',
      frameText: 'Texto da moldura',
      frameColor: 'Cor da moldura'
    },
    placeholders: {
      url: 'ex.: https://www.exemplo.com.br',
      firstName: 'João',
      lastName: 'Silva',
      organization: 'ACME Ltda.',
      title: 'Desenvolvedor',
      phoneWork: '+55 11 3123-4567',
      phoneMobile: '+55 11 91234-5678',
      email: 'joao.silva@exemplo.com.br',
      website: 'https://www.exemplo.com.br',
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310-100',
      country: 'Brasil',
      ssid: 'ex.: WiFiDeCasa',
      wifiPassword: 'Sua senha secreta',
      phoneNumber: 'ex.: +5511912345678',
      smsMessage: 'Sua mensagem pré-preenchida aqui...',
      emailTo: 'contato@exemplo.com.br',
      emailSubject: 'Olá do QRTurbo.app',
      emailBody: 'Escreva sua mensagem de e-mail aqui...',
      eventTitle: 'Reunião de equipe',
      eventLocation: 'Sala de reunião ou endereço',
      eventDescription: 'Detalhes do evento...',
      locationAddress: 'Av. Paulista, 1578, São Paulo',
      latitude: '-23.561',
      longitude: '-46.656',
      socialHandle: '@usuario ou https://...',
      whatsappPhone: 'ex.: +5511912345678 ou @usuario',
      whatsappMessage: 'Sua mensagem de WhatsApp aqui...',
      mecardName: 'João Silva',
      address: 'Rua das Flores, 123, São Paulo',
      appWebUrl: 'https://exemplo.com.br/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Criar QR code',
      download: 'Baixar QR code',
      reset: 'Restaurar padrão',
      customize: 'Personalizar aparência (opcional)',
      chooseLogo: 'Escolher imagem',
      showPassword: 'Mostrar senha',
      hidePassword: 'Ocultar senha',
      showPayload: 'Mostrar dados do QR',
      hidePayload: 'Ocultar dados do QR'
    },
    options: {
      sizeMedium: 'Tela (512 px)',
      sizeLarge: 'Grande (1024 px)',
      sizePrint: 'Impressão (2048 px)',
      sizePoster: 'Pôster (4096 px)',
      frameNone: 'Sem moldura',
      frameBannerBottom: 'Rótulo abaixo',
      frameBannerTop: 'Rótulo acima',
      frameOutline: 'Contorno com rótulo',
      errorLow: 'L - Baixa (7%)',
      errorMedium: 'M - Média (15%)',
      errorQuartile: 'Q - Quartil (25%)',
      errorHigh: 'H - Alta (30%)',
      formatPng: 'PNG (bitmap)',
      formatSvg: 'SVG (vetorial)',
      formatPdf: 'PDF (documento)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Nenhuma',
      dotSquare: 'Quadrado',
      dotRounded: 'Arredondado',
      dotDots: 'Pontos',
      dotClassy: 'Elegante',
      dotClassyRounded: 'Elegante arredondado',
      dotExtraRounded: 'Extra-arredondado',
      cornerSquare: 'Quadrado',
      cornerExtraRounded: 'Extra-arredondado',
      cornerDot: 'Ponto',
      socialInstagram: 'Instagram',
      socialTikTok: 'TikTok',
      socialYouTube: 'YouTube',
      socialFacebook: 'Facebook',
      socialX: 'X / Twitter',
      socialLinkedIn: 'LinkedIn',
      socialSnapchat: 'Snapchat',
      socialPinterest: 'Pinterest',
      socialReddit: 'Reddit',
      socialThreads: 'Threads',
      socialBluesky: 'Bluesky',
      socialOther: 'Outra URL',
      socialTypePerson: 'Pessoa/Perfil',
      socialTypeCompany: 'Empresa',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Usar iOS se não houver URL web',
      appTargetAndroid: 'Usar Android se não houver URL web'
    },
    alerts: {
      enterText: 'Digite um texto ou uma URL',
      vcardRequired:
        'Preencha pelo menos um destes campos: Nome, Sobrenome, E-mail ou Telefone.',
      wifiSsidRequired: 'Informe o nome da rede (SSID).',
      wifiSsidLengthInvalid: 'O nome de uma rede WiFi pode ter no máximo 32 bytes em UTF-8.',
      wifiWpaPasswordInvalid:
        'Senhas WPA/WPA2 devem ter de 8 a 63 caracteres imprimíveis ou exatamente 64 caracteres hexadecimais.',
      wifiWepPasswordInvalid:
        'Senhas WEP devem ter 5 ou 13 caracteres imprimíveis, ou 10 ou 26 caracteres hexadecimais.',
      phoneRequired: 'Informe um número de telefone.',
      emailRequired: 'Preencha pelo menos um campo do e-mail.',
      emailInvalid: 'Informe um endereço de e-mail válido.',
      eventRequired: 'Informe o título e o horário de início do evento.',
      eventEndInvalid: 'O horário de término não pode ser anterior ao de início.',
      locationRequired: 'Informe um endereço ou as duas coordenadas.',
      locationCoordinatesInvalid: 'Informe coordenadas de latitude e longitude válidas.',
      socialRequired: 'Informe um nome de usuário ou a URL do perfil na rede social.',
      socialHandleInvalid: 'Informe um nome de usuário válido, usando letras, números, pontos, sublinhados ou hífens.',
      socialUrlInvalid: 'Informe uma URL de perfil válida que comece com http:// ou https://.',
      whatsappPhoneRequired: 'Informe um número de WhatsApp com o código do país ou um @usuário válido.',
      mecardRequired: 'Preencha pelo menos um destes campos: Nome, Telefone ou E-mail.',
      appLinkRequired: 'Informe a URL web, iOS ou Android do app.',
      urlInvalid: 'Informe uma URL válida que comece com http:// ou https://.',
      lowContrast:
        '⚠️ Contraste baixo detectado. Seu QR code pode ser difícil de ler. Use uma cor principal mais escura ou um fundo mais claro.',
      dataEmpty: 'Os dados do QR code estão vazios.',
      noData: 'Nenhum dado foi informado para o QR code.',
      libraryLoadFailed: 'Não foi possível carregar a biblioteca de QR code. Atualize a página.',
      generationError: 'Erro ao gerar o QR code',
      dataTooLong: 'Este conteúdo é grande demais para o nível de correção de erros selecionado. Encurte o conteúdo ou escolha um nível mais baixo.',
      pdfExportFailed: 'Não foi possível exportar o PDF. Tente novamente.',
      generateFirst: 'Crie um QR code primeiro.',
      resetSuccess: 'Personalização restaurada para o padrão',
      largeImageWarning:
        '⚠️ Arquivo de imagem grande ({{size}} MB). Use uma imagem menor para ter um desempenho melhor.',
      invalidImageFile: 'Selecione um arquivo de imagem válido (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} caracteres'
    },
    units: {
      modules: '{{count}} módulos'
    },
    labels: {
      sms: 'SMS',
      phone: 'Ligação'
    },
    warnings: {
      lowContrast:
        'O contraste baixo pode dificultar a leitura deste QR code. Use uma cor principal mais escura ou um fundo mais claro.',
      transparentBackground:
        'Fundos transparentes dependem da superfície final. Teste o QR code sobre o fundo exato antes de publicar.',
      quietZoneSmall:
        'A zona de silêncio está pequena demais. Use pelo menos 4 módulos para uma leitura confiável.',
      denseData:
        'Este QR code tem dados demais para o tamanho selecionado. Use um tamanho maior ou encurte o conteúdo.',
      logoErrorCorrection:
        'Logos grandes são lidos com mais confiabilidade usando correção de erros alta (H).',
      logoLarge:
        'O logo é grande e pode cobrir uma parte grande demais do QR code. Teste antes de imprimir ou compartilhar.'
    },
    brand: {
      tagline: 'seu lugar privado para criar QR codes'
    },
    trust: {
      local: 'Gerado no seu navegador',
      noUploads: 'Nada é enviado',
      noTracking: 'Sem rastreamento nem cookies',
      offline: 'Funciona offline',
      openSource: 'Código aberto',
      noExpiry: 'Nunca expira',
      noSignup: 'Sem cadastro'
    },
    workspace: {
      chooseType: 'Escolha um tipo',
      addContent: 'Adicione seu conteúdo',
      adjustLook: 'Tamanho e estilo'
    },
    preview: {
      title: 'Prévia',
      localBadge: 'Criado neste dispositivo'
    },
    how: {
      title: 'Como funciona',
      step1Title: 'Escolha',
      step1Text: 'Defina o que o código vai fazer: abrir um link, conectar a uma rede WiFi, salvar um contato e muito mais.',
      step2Title: 'Preencha',
      step2Text: 'Digite o seu conteúdo. A prévia é atualizada enquanto você escreve, aqui mesmo no seu navegador.',
      step3Title: 'Baixe',
      step3Text: 'Salve em PNG, SVG ou PDF. Teste a leitura antes de imprimir ou compartilhar.'
    },
    privacyInfo: {
      title: 'Privado desde a concepção',
      intro: 'QR codes costumam carregar dados pessoais: uma senha do WiFi, um número de telefone, um endereço residencial. O QRTurbo.app foi feito para que nada disso chegue a um servidor.',
      localTitle: 'Fica no seu dispositivo',
      localText: 'Os QR codes e os logos são gerados por código que roda no seu navegador. Não existe nenhum servidor que possa receber o que você digita.',
      staticTitle: 'Sem redirecionamento, sem prazo de validade',
      staticText: 'Seu conteúdo é codificado diretamente no QR code. As leituras nunca passam por nós, e o código nunca expira.',
      noTrackingTitle: 'Sem rastreamento',
      noTrackingText: 'Sem análises, anúncios, cookies ou contas. Só as suas escolhas de idioma e tema são salvas, localmente no seu navegador.',
      openSourceTitle: 'Aberto para inspeção',
      openSourceText: 'Todo o código-fonte é público no GitHub, então qualquer pessoa pode verificar essas afirmações.'
    },
    footer: {
      privacy1: 'Este gerador de QR code grátis funciona inteiramente no seu navegador.',
      privacy2: 'Nenhum dado é armazenado ou enviado para lugar nenhum. Sem rastreamento, sem anúncios, sem enrolação.',
      privacyPolicy: 'Política de Privacidade',
      termsOfUse: 'Termos de Uso',
      github: 'Ver código-fonte no GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Espaço ao redor do QR code (mínimo de 4 módulos para uma leitura confiável)',
      socialHandleHelper:
        'Digite um nome de usuário, como @usuario, ou cole a URL completa do perfil com https://.'
    },
    frame: {
      defaultText: 'ESCANEIE'
    },
    misc: {
      qrPlaceholder: 'O QR code vai aparecer aqui',
      socialPreview: 'Destino do QR',
      wifiPayloadHidden: 'Configuração do WiFi — senha oculta'
    }
  };
})();
