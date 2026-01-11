// Korean translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.ko = {
    meta: {
      title: '무료 QR 코드 생성기 - 색상, 로고 및 스타일 사용자 정의 | QRTurbo.app',
      description:
        'QRTurbo.app으로 무료로 사용자 정의 가능한 QR 코드를 즉시 생성하세요. 로고, 사용자 정의 색상 및 스타일을 추가하세요. URL, WiFi 네트워크, vCard, SMS 및 전화에 대한 QR 코드를 생성하세요. 광고 없음, 추적 없음 – 완전히 브라우저 기반이며 안전합니다.',
      keywords:
        'QR 코드 생성기, 사용자 정의 QR 코드, 로고가 있는 QR 코드, 컬러 QR 코드, 무료 QR 코드 제작자, WiFi QR 코드, vCard QR 코드, SMS QR 코드, 온라인 QR 도구, 추적 없는 QR 생성기'
    },
    app: {
      title: 'QRTurbo.app - 무료 QR 코드 생성기',
      subtitle: '로고, 색상 및 스타일로 사용자 정의 가능한 QR 코드를 만드세요. URL, WiFi, vCard, SMS 및 통화 지원',
      selectLanguage: '언어 선택'
    },
    tabs: {
      urlText: 'URL/텍스트',
      vcard: 'vCard',
      smsPhone: 'SMS/전화',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: '텍스트 또는 URL',
      firstName: '이름',
      lastName: '성',
      organization: '조직',
      title: '직함',
      phoneWork: '전화（직장）',
      phoneMobile: '전화（휴대폰）',
      email: '이메일',
      website: '웹사이트',
      street: '거리',
      city: '도시',
      state: '주/도',
      zip: '우편번호',
      country: '국가',
      ssid: '네트워크 이름（SSID）',
      password: '비밀번호',
      authentication: '인증',
      hiddenNetwork: '숨겨진 네트워크입니다',
      phoneNumber: '전화번호',
      message: '메시지（선택 사항）',
      qrSize: 'QR 코드 크기',
      foregroundColor: '전경색',
      backgroundColor: '배경색',
      errorCorrection: '오류 수정',
      downloadFormat: '다운로드 형식',
      dotStyle: '점 스타일',
      cornerSquare: '모서리 사각형',
      cornerDot: '모서리 점',
      quietZone: '정적 영역（여백）',
      logoSize: '로고 크기',
      logoMargin: '로고 여백',
      logo: '로고（선택 사항）',
      styleOptions: '스타일 옵션'
    },
    placeholders: {
      url: '예: https://www.example.com',
      firstName: '길동',
      lastName: '홍',
      organization: 'ACME 주식회사',
      title: '개발자',
      phoneWork: '+82-2-5555-1234',
      phoneMobile: '+82-10-5555-5678',
      email: 'gildong.hong@example.com',
      website: 'https://www.example.com',
      street: '중앙로 123',
      city: '서울',
      state: '서울특별시',
      zip: '04524',
      country: '대한민국',
      ssid: '예: 우리집WiFi',
      wifiPassword: '비밀 비밀번호',
      phoneNumber: '예: +821012345678',
      smsMessage: '미리 작성된 메시지를 여기에...'
    },
    actions: {
      generate: 'QR 코드 생성',
      download: 'QR 코드 다운로드',
      reset: '기본값으로 재설정',
      customize: '외관 사용자 정의（선택 사항）',
      chooseLogo: '이미지 선택'
    },
    options: {
      sizeSmall: '소（256px）',
      sizeMedium: '중（512px）',
      sizeLarge: '대（1024px）',
      errorLow: 'L - 낮음（7%）',
      errorMedium: 'M - 중간（15%）',
      errorQuartile: 'Q - 사분위（25%）',
      errorHigh: 'H - 높음（30%）',
      formatPng: 'PNG（래스터）',
      formatSvg: 'SVG（벡터）',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: '없음',
      dotSquare: '사각형',
      dotRounded: '둥근',
      dotDots: '점',
      dotClassy: '클래시',
      dotClassyRounded: '클래시 둥근',
      dotExtraRounded: '매우 둥근',
      cornerSquare: '사각형',
      cornerExtraRounded: '매우 둥근',
      cornerDot: '점'
    },
    alerts: {
      enterText: '텍스트 또는 URL을 입력하세요',
      vcardRequired: '다음 중 하나 이상을 입력하세요: 이름, 성, 이메일 또는 전화번호.',
      wifiSsidRequired: '네트워크 이름（SSID）을 입력하세요.',
      phoneRequired: '전화번호를 입력하세요.',
      lowContrast:
        '⚠️ 낮은 대비가 감지되었습니다. QR 코드가 스캔하기 어려울 수 있습니다. 더 어두운 전경색이나 더 밝은 배경색 사용을 고려하세요.',
      dataEmpty: 'QR 코드 데이터가 비어 있습니다.',
      noData: 'QR 코드에 대한 데이터가 제공되지 않았습니다.',
      libraryLoadFailed: 'QR 코드 라이브러리를 로드하지 못했습니다. 페이지를 새로 고침하세요.',
      generationError: 'QR 코드 생성 오류',
      generateFirst: '먼저 QR 코드를 생성하세요.',
      resetSuccess: '사용자 정의가 기본값으로 재설정되었습니다',
      largeImageWarning:
        '⚠️ 큰 이미지 파일（{{size}}MB）. 더 나은 성능을 위해 더 작은 이미지 사용을 고려하세요.',
      invalidImageFile: '유효한 이미지 파일（PNG, JPEG, SVG, GIF）을 선택하세요.'
    },
    counters: {
      characters: '{{current}} / {{max}} 자'
    },
    labels: {
      sms: 'SMS',
      phone: '전화'
    },
    footer: {
      privacy1: '이 무료 QR 코드 생성기는 브라우저에서 완전히 실행됩니다.',
      privacy2: '데이터가 저장되거나 전송되지 않습니다. 추적 없음, 광고 없음, 헛소리 없음.',
      github: 'GitHub에서 소스 코드 보기'
    },
    helpers: {
      quietZoneHelper: 'QR 코드 주변 공간（권장: 안정적인 스캔을 위해 4-16px）'
    },
    misc: {
      qrPlaceholder: 'QR 코드가 여기에 표시됩니다'
    }
  };
})();
