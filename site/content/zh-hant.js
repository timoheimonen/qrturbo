// Page content for the pre-rendered Traditional Chinese (Taiwan) pages. Only
// the site generator (scripts/build-site.js) reads this file; it is not
// shipped to browsers. Every locale file in this directory has exactly the
// same keys.

module.exports = {
  home: {
    name: '網址和文字 QR Code',
    title: '免費 QR Code 產生器，永不過期 | QRTurbo.app',
    description:
      '免費 QR Code 產生器，支援網址、WiFi、vCard 名片等。免註冊、無試用期、無追蹤，在瀏覽器中產生，永久有效。',
    eyebrow: '免費 QR Code 產生器',
    display: '永久有效的免費 QR Code。',
    lead:
      '直接在瀏覽器中為網址、WiFi、聯絡人等製作 QR Code。免註冊、無試用期、不轉址：內容直接寫進 QR Code，因此永遠有效。還能加入 Logo、自訂顏色和「掃一掃」外框。'
  },
  types: {
    wifi: {
      name: 'WiFi QR Code',
      title: '免費 WiFi QR Code 產生器，安全又私密 | QRTurbo.app',
      description:
        '免費產生 WiFi QR Code，訪客掃一下就能連上網路。密碼只留在您的瀏覽器中。免註冊、無追蹤、永不過期。',
      eyebrow: 'WiFi QR Code 產生器',
      display: '訪客掃一下，立即連上 WiFi。',
      lead:
        '輸入網路名稱和密碼，即可產生 WiFi QR Code。密碼絕不會離開您的裝置，只要網路設定不變，QR Code 就一直有效。',
      aboutTitle: 'WiFi QR Code 的運作方式',
      about: [
        'WiFi QR Code 以標準格式記錄網路名稱（SSID）、加密方式和密碼，iPhone 和 Android 手機的相機 App 都能辨識。掃描後，手機會詢問是否加入該網路，不必再手動輸入冗長的密碼。',
        '把 QR Code 印出來，貼在住家、辦公室、咖啡廳或民宿裡訪客看得到的地方。如果更改了密碼或網路名稱，請重新產生 QR Code。',
        '許多線上產生器會把您的密碼傳送到它們的伺服器。QRTurbo.app 直接在您的瀏覽器中產生 QR Code，密碼絕不會被上傳或儲存在任何地方。'
      ]
    },
    vcard: {
      name: 'vCard 名片 QR Code',
      title: '免費 vCard 電子名片 QR Code 產生器 | QRTurbo.app',
      description:
        '免費產生 vCard 名片 QR Code，掃一下就能把姓名、電話、電子郵件和地址存入通訊錄。免註冊，永不過期。',
      eyebrow: 'vCard 名片 QR Code 產生器',
      display: '掃一下，輕鬆交換聯絡資訊。',
      lead:
        '填入姓名、電話號碼、電子郵件和地址，即可產生 vCard QR Code，適用於名片、識別證和電子郵件簽名檔。資料儲存在 QR Code 本身，而不是伺服器上。',
      aboutTitle: 'vCard QR Code 的運作方式',
      about: [
        'vCard QR Code 以 vCard 格式記錄一張電子名片。對方掃描後，手機會詢問是否將資料儲存為新聯絡人，完全不必手動輸入。',
        '只要填寫您想分享的欄位即可。資料越多，QR Code 就越密集，因此列印寬度至少要 2.5 公分，大量印製名片前也請先測試掃描。',
        '由於資料直接編碼在 QR Code 中，產生後就無法修改。如果電話號碼或職稱有所變動，請在下次印製前重新產生 QR Code。'
      ]
    },
    sms: {
      name: '簡訊和電話 QR Code',
      title: '免費簡訊與電話 QR Code 產生器 | QRTurbo.app',
      description:
        '免費產生可開啟簡訊或直接撥打電話的 QR Code，還能預先填好簡訊內容。在瀏覽器中產生，免註冊，永不過期。',
      eyebrow: '簡訊和電話 QR Code 產生器',
      display: '掃一下，傳簡訊或打電話。',
      lead:
        '產生可開啟預填簡訊或撥打指定號碼的 QR Code，非常適合客服專線、訂位預約、抽獎活動和維修服務貼紙。',
      aboutTitle: '簡訊和電話 QR Code 的運作方式',
      about: [
        '簡訊 QR Code 會開啟訊息 App，並自動填好電話號碼和簡訊內容，掃描的人只要按下傳送即可。電話 QR Code 則會開啟撥號畫面，號碼已準備好撥出。',
        '請一律以國際格式輸入號碼，例如 +886 912 345 678，這樣使用外國門號的人也能順利使用。',
        '手機絕不會自動傳送簡訊或撥打電話，一定會先由掃描的人確認。'
      ]
    },
    email: {
      name: '電子郵件 QR Code',
      title: '免費電子郵件 QR Code 產生器，可預填內容 | QRTurbo.app',
      description:
        '免費產生電子郵件 QR Code，掃描即可開啟新郵件，收件人、主旨和內文都已填好。免註冊、無追蹤、永不過期。',
      eyebrow: '電子郵件 QR Code 產生器',
      display: '掃一下，開啟一封準備好的郵件。',
      lead:
        '填入收件人、主旨和內文，即可產生電子郵件 QR Code，用於意見回饋、客服需求、訂購和報名。',
      aboutTitle: '電子郵件 QR Code 的運作方式',
      about: [
        '電子郵件 QR Code 包含一個 mailto 連結。掃描後會開啟郵件 App，收件人、主旨和內文都已填好，由掃描的人決定是否寄出。',
        '預填的內文請盡量簡短。文字越長，QR Code 越密集，從遠處也越難掃描。',
        '使用清楚的主旨，例如「意見回饋：12 號桌」，方便您整理收到的郵件。'
      ]
    },
    event: {
      name: '行事曆活動 QR Code',
      title: '免費活動 QR Code 產生器，一鍵加入行事曆 | QRTurbo.app',
      description:
        '免費產生行事曆活動 QR Code，掃一下就能把活動名稱、時間、地點和詳情加入行事曆。在瀏覽器中產生，永不過期。',
      eyebrow: '行事曆活動 QR Code 產生器',
      display: '掃一下，活動直接加入行事曆。',
      lead:
        '輸入活動名稱、時間和地點，即可為邀請函、海報、門票和會議室產生 QR Code。',
      aboutTitle: '活動 QR Code 的運作方式',
      about: [
        '活動 QR Code 以 iCalendar 格式記錄一筆行事曆項目。掃描後，就能將活動連同正確的日期、時間和地點加入自己的行事曆。',
        '不同手機和掃描 App 對行事曆 QR Code 的支援程度不一。印製邀請函前，請分別用 iPhone 和 Android 手機測試。',
        '記得填寫地點欄位，讓來賓可以直接從行事曆找到地址。'
      ]
    },
    location: {
      name: '位置 QR Code',
      title: '免費位置 QR Code 產生器，掃描開啟地圖 | QRTurbo.app',
      description:
        '免費產生位置 QR Code，掃描即可在地圖 App 中開啟地址或座標，適合邀請函和指示牌。免註冊，永不過期。',
      eyebrow: '位置 QR Code 產生器',
      display: '掃一下，為您指引方向。',
      lead:
        '輸入地址或座標，產生可在地圖 App 中開啟該位置的 QR Code。適用於邀請函、傳單、指示牌和送貨說明。',
      aboutTitle: '位置 QR Code 的運作方式',
      about: [
        '輸入地址會產生一個含有 Google 地圖搜尋連結的 QR Code，在任何手機的瀏覽器或地圖 App 中都能開啟。輸入座標則會產生 geo 連結，直接在手機預設的地圖 App 中開啟。',
        '對於沒有門牌地址的地方，例如山上的小木屋、步道入口或活動會場的入口，座標是最精確的選擇。',
        '請用自己的手機測試 QR Code，確認它準確指向正確的位置。'
      ]
    },
    social: {
      name: '社群媒體 QR Code',
      title: '免費社群媒體 QR Code 產生器 | QRTurbo.app',
      description:
        '免費為您的 Instagram、TikTok、YouTube、LinkedIn 等帳號產生 QR Code，只要輸入使用者名稱。免註冊、無追蹤、永不過期。',
      eyebrow: '社群媒體 QR Code 產生器',
      display: '讓路過的訪客變成您的粉絲。',
      lead:
        '選擇平台並輸入使用者名稱，即可產生開啟您個人檔案的 QR Code。支援 Instagram、TikTok、YouTube、Facebook、X、LinkedIn、Threads、Bluesky 等平台。',
      aboutTitle: '社群媒體 QR Code 的運作方式',
      about: [
        '社群媒體 QR Code 包含指向您個人檔案的連結。掃描後，如果手機已安裝該 App，就會在 App 中開啟，否則會在瀏覽器中開啟。',
        '輸入使用者名稱後，QRTurbo.app 會自動為所選平台組出正確的個人檔案網址。您也可以直接貼上完整的個人檔案網址。',
        '可以把 QR Code 印在包裝、名片、海報和活動攤位上。再加上一個附有簡短行動呼籲的外框，例如「追蹤我們」，讓大家知道掃描後會看到什麼。'
      ]
    },
    whatsapp: {
      name: 'WhatsApp QR Code',
      title: '免費 WhatsApp QR Code 產生器，掃描開啟聊天 | QRTurbo.app',
      description:
        '免費產生 WhatsApp QR Code，掃描即可與您的號碼開始聊天，並預先填好訊息。在瀏覽器中產生，免註冊，永不過期。',
      eyebrow: 'WhatsApp QR Code 產生器',
      display: '掃一下，開始 WhatsApp 聊天。',
      lead:
        '輸入您的電話號碼或 WhatsApp 使用者名稱，以及選填的預設訊息。客戶不必先儲存您的號碼，就能直接聯絡您。',
      aboutTitle: 'WhatsApp QR Code 的運作方式',
      about: [
        'WhatsApp QR Code 包含一個 wa.me 連結。掃描後會開啟與您的聊天視窗，預填的訊息已準備好傳送。',
        '請以含國碼的國際格式輸入號碼，例如 +886 912 345 678。空格和連字號會自動移除。',
        'QR Code 直接包含 wa.me 連結本身，而不是轉址連結，因此只要該號碼仍在使用 WhatsApp，QR Code 就一直有效。'
      ]
    },
    app: {
      name: 'App 下載 QR Code',
      title: '免費 App Store、Google Play QR Code 產生器 | QRTurbo.app',
      description:
        '免費為 App 下載頁面、App Store 或 Google Play 連結產生 QR Code。在瀏覽器中產生，免註冊、不轉址、永不過期。',
      eyebrow: 'App 下載 QR Code 產生器',
      display: '讓使用者直接前往您的 App。',
      lead:
        '加入 App 的網頁、App Store 連結和 Google Play 連結，即可產生 App 下載 QR Code。',
      aboutTitle: 'App 下載 QR Code 的運作方式',
      about: [
        '一個 QR Code 只能包含一個連結，而 QRTurbo.app 絕不會加入轉址。如果您有一個網頁，能把 iPhone 使用者導向 App Store、把 Android 使用者導向 Google Play，請把它設為網頁網址，這樣在每支手機上都能有最好的效果。',
        '如果沒有這樣的網頁，請選擇 QR Code 要開啟哪個商店連結，或分別為 App Store 和 Google Play 印製 QR Code。',
        '請確認商店連結是公開的，而且不含您不想分享的追蹤參數。'
      ]
    }
  },
  comparison: {
    title: '永久有效的免費 QR Code',
    intro:
      '許多標榜「免費」的 QR Code 產生器，產生的其實是動態 QR Code，會先連到它們自己的轉址伺服器。試用期一結束，QR Code 就會被停用，而這時它往往早已印在菜單、名片或包裝上。QRTurbo.app 的做法完全不同。',
    headers: {
      feature: '問題',
      dynamic: '常見的「免費試用」QR Code',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: '您的內容存放在哪裡？',
        dynamic: '存放在服務商的伺服器上，透過短網址轉址',
        qrturbo: '就在 QR Code 本身裡'
      },
      {
        feature: '試用期結束後會怎樣？',
        dynamic: 'QR Code 會被停用，直到您付費為止',
        qrturbo: '什麼事都不會發生。沒有試用期，QR Code 持續有效'
      },
      {
        feature: '需要註冊帳號嗎？',
        dynamic: '通常需要',
        qrturbo: '不需要'
      },
      {
        feature: '誰看得到您的掃描紀錄？',
        dynamic: '每次掃描都會經過服務商',
        qrturbo: '沒有人。掃描絕不會經過我們'
      },
      {
        feature: '費用是多少？',
        dynamic: '按月或按年訂閱',
        qrturbo: '完全免費，商業用途也一樣'
      }
    ],
    note:
      '唯一的取捨：靜態 QR Code 印出後就無法修改。如果日後可能需要更改目的地，請讓 QR Code 指向一個由您自己管理的網頁，之後只要更新該網頁即可。'
  },
  faq: {
    title: '常見問題',
    items: [
      {
        q: 'QRTurbo.app 產生的 QR Code 會過期嗎？',
        a: '不會。QRTurbo.app 產生的是靜態 QR Code：您的連結、文字或聯絡資訊直接編碼在 QR Code 中。中間沒有任何伺服器，所以也沒有任何環節會過期或被停用。只要內容本身有效，例如連結的網站仍然存在，QR Code 就能一直使用。'
      },
      {
        q: '為什麼我在其他網站產生的 QR Code 失效了？',
        a: '許多產生器預設會產生動態 QR Code。這類 QR Code 包含一個指向服務商伺服器的短網址，每次掃描都會再轉址到您真正的網址。一旦免費試用或訂閱到期，服務商就會關閉轉址，已經印好的 QR Code 也跟著失效。QRTurbo.app 產生的 QR Code 包含您真正的內容，完全不依賴我們。'
      },
      {
        q: 'QRTurbo.app 真的免費嗎？可以商業使用嗎？',
        a: '是的。免註冊，沒有試用期、浮水印或掃描次數限制。您產生的 QR Code 可用於個人及商業用途，例如名片、菜單、包裝和廣告。'
      },
      {
        q: 'QR Code 印出來之後還能修改嗎？',
        a: '不能。靜態 QR Code 無法編輯，因為內容本身就是圖案的一部分。如果預期日後需要更改目的地，請讓 QR Code 指向一個由您自己管理的網址，例如您網站上的某個頁面，之後只要更新該頁面即可。'
      },
      {
        q: 'QR Code 應該印多大？',
        a: '列印尺寸至少要 2 × 2 公分。一般原則是，QR Code 的邊長至少應為掃描距離的十分之一：從 2 公尺外掃描的海報，QR Code 需要約 20 公分。印刷用途請下載 SVG 或大尺寸 PNG，並保持 QR Code 周圍的靜區空白。'
      },
      {
        q: '為什麼我的 QR Code 掃不出來？',
        a: '最常見的原因有：QR Code 與背景的對比度太低、靜區太小、Logo 遮住太多 QR Code，或內容相對於列印尺寸太多。QRTurbo.app 會提醒您注意這些風險。印製前，請務必用幾支不同的手機測試。'
      },
      {
        q: '我的資料安全嗎？你們看得到我的 WiFi 密碼嗎？',
        a: '您的資料只會留在您的裝置上。QR Code 由在您瀏覽器中執行的程式碼產生，您輸入或上傳的任何內容都不會傳送到伺服器，所以沒有人能看到您的 WiFi 密碼或聯絡資訊。首次造訪後，產生器也能離線使用。'
      }
    ]
  },
  typeLinks: {
    title: '免費 QR Code 產生器'
  }
};
