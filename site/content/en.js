// Page content for the pre-rendered English pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'URL and text QR code',
    title: 'Free QR Code Generator That Never Expires | QRTurbo.app',
    description:
      'Create free QR codes for links, WiFi, vCards and more. No sign-up, no trial, no tracking: codes are made in your browser and never stop working.',
    eyebrow: 'Free QR code generator',
    display: 'Free QR codes that never stop working.',
    lead:
      'Create QR codes for links, WiFi, contacts and more, right in your browser. No sign-up, no trial, no redirects: your content goes straight into the code, so it keeps working forever. Add logos, colors and a “Scan me” frame.'
  },
  types: {
    wifi: {
      name: 'WiFi QR code',
      title: 'Free WiFi QR Code Generator, Private and Secure | QRTurbo.app',
      description:
        'Create a free WiFi QR code so guests can join your network with one scan. Your password stays in your browser. No sign-up, no tracking, never expires.',
      eyebrow: 'WiFi QR code generator',
      display: 'Guests join your WiFi with a single scan.',
      lead:
        'Enter your network name and password to create a WiFi QR code. The password never leaves your device, and the code works as long as your network settings stay the same.',
      aboutTitle: 'How WiFi QR codes work',
      about: [
        'A WiFi QR code contains the network name (SSID), the security type and the password in a standard format that the camera apps on iPhone and Android understand. Scanning it offers to join the network, so nobody needs to type a long password.',
        'Print the code for your home, office, café or holiday rental and place it where guests can see it. If you change the password or the network name, create a new code.',
        'Many online generators send your password to their servers. QRTurbo.app builds the code in your browser, so your password is never uploaded or stored anywhere.'
      ]
    },
    vcard: {
      name: 'vCard QR code',
      title: 'Free vCard QR Code Generator for Business Cards | QRTurbo.app',
      description:
        'Create a free vCard QR code for your business card. One scan saves your name, phone, email and address to the contacts app. No sign-up, never expires.',
      eyebrow: 'vCard QR code generator',
      display: 'Share your contact details with one scan.',
      lead:
        'Add your name, phone number, email and address to create a vCard QR code for business cards, name badges and email signatures. The details are stored in the code itself, not on a server.',
      aboutTitle: 'How vCard QR codes work',
      about: [
        'A vCard QR code contains a digital business card in the vCard format. When someone scans it, their phone offers to save the details as a new contact, so nothing needs to be typed by hand.',
        'Fill in only the fields you want to share. The more details you add, the denser the code becomes, so print it at least 2.5 cm (1 in) wide and test it before ordering a large batch of cards.',
        'Because the details are encoded directly in the code, they cannot be changed later. If your phone number or job title changes, create a new code for your next print run.'
      ]
    },
    sms: {
      name: 'SMS and phone call QR code',
      title: 'Free SMS and Phone Call QR Code Generator | QRTurbo.app',
      description:
        'Create a free QR code that opens a text message or starts a phone call. Add a pre-filled SMS text. Made in your browser, no sign-up, never expires.',
      eyebrow: 'SMS and phone call QR code generator',
      display: 'Start a text message or a phone call with one scan.',
      lead:
        'Create a QR code that opens a pre-filled text message or dials a phone number. It works well for customer service, bookings, competitions and service stickers.',
      aboutTitle: 'How SMS and phone QR codes work',
      about: [
        'An SMS QR code opens the messaging app with the phone number and your message already filled in, so the person scanning only needs to press send. A phone QR code opens the dialler with the number ready to call.',
        'Always enter the number in international format, for example +44 20 7946 0958, so the code also works for people with foreign phones.',
        'The phone never sends the message or makes the call automatically. The person scanning always confirms it first.'
      ]
    },
    email: {
      name: 'Email QR code',
      title: 'Free Email QR Code Generator with Pre-Filled Messages | QRTurbo.app',
      description:
        'Create a free email QR code that opens a new message with the recipient, subject and text already filled in. No sign-up, no tracking, never expires.',
      eyebrow: 'Email QR code generator',
      display: 'Open a ready-to-send email with one scan.',
      lead:
        'Add a recipient, subject and message to create an email QR code for feedback, support requests, orders and sign-ups.',
      aboutTitle: 'How email QR codes work',
      about: [
        'An email QR code contains a mailto link. Scanning it opens the email app with the recipient, subject and message already filled in, and the person scanning decides whether to send it.',
        'Keep the pre-filled message short. Long texts make the code denser and harder to scan from a distance.',
        'Use a clear subject line, such as “Feedback: table 12”, so you can easily sort the messages you receive.'
      ]
    },
    event: {
      name: 'Calendar event QR code',
      title: 'Free Event QR Code Generator, Add to Calendar | QRTurbo.app',
      description:
        'Create a free calendar event QR code. One scan adds the title, time, place and details to the calendar. Made in your browser, never expires.',
      eyebrow: 'Calendar event QR code generator',
      display: 'Put your event in their calendar with one scan.',
      lead:
        'Enter the event title, time and place to create a QR code for invitations, posters, tickets and meeting rooms.',
      aboutTitle: 'How event QR codes work',
      about: [
        'An event QR code contains a calendar entry in the iCalendar format. Scanning it lets people add the event to their calendar with the right date, time and location.',
        'Support for calendar QR codes varies between phones and scanner apps. Test the code with both an iPhone and an Android phone before you print invitations.',
        'Fill in the location field so guests can find the address straight from their calendar.'
      ]
    },
    location: {
      name: 'Location QR code',
      title: 'Free Location QR Code Generator for Maps | QRTurbo.app',
      description:
        'Create a free location QR code that opens an address or coordinates in a map app. Great for invitations and signs. No sign-up, never expires.',
      eyebrow: 'Location QR code generator',
      display: 'Show the way with one scan.',
      lead:
        'Enter an address or coordinates to create a QR code that opens the location in a map app. Use it on invitations, flyers, signs and delivery instructions.',
      aboutTitle: 'How location QR codes work',
      about: [
        'An address creates a QR code with a Google Maps search link, which opens in a browser or map app on any phone. Coordinates create a geo link that opens directly in the phone’s default map app.',
        'Coordinates are the most precise choice for places without a street address, such as a cottage, a trailhead or the gate to an event area.',
        'Test the code on your own phone to check that it points to exactly the right place.'
      ]
    },
    social: {
      name: 'Social media QR code',
      title: 'Free Social Media QR Code Generator | QRTurbo.app',
      description:
        'Create a free QR code for your Instagram, TikTok, YouTube, LinkedIn or other profile. Just type your username. No sign-up, no tracking, never expires.',
      eyebrow: 'Social media QR code generator',
      display: 'Turn real-world visitors into followers.',
      lead:
        'Choose a platform and enter your username to create a QR code that opens your profile. It works with Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky and more.',
      aboutTitle: 'How social media QR codes work',
      about: [
        'A social media QR code contains a link to your profile. Scanning it opens the profile in the app, if it is installed, or in the browser.',
        'Type your username and QRTurbo.app builds the correct profile address for the selected platform. You can also paste a full profile URL.',
        'Put the code on packaging, business cards, posters and event stands. Add a frame with a short call to action, such as “Follow us”, so people know what to expect.'
      ]
    },
    whatsapp: {
      name: 'WhatsApp QR code',
      title: 'Free WhatsApp QR Code Generator to Start a Chat | QRTurbo.app',
      description:
        'Create a free WhatsApp QR code that opens a chat with your number and a pre-filled message. Made in your browser. No sign-up, never expires.',
      eyebrow: 'WhatsApp QR code generator',
      display: 'Start a WhatsApp chat with one scan.',
      lead:
        'Enter your phone number or WhatsApp username and an optional message. Customers can contact you without saving your number first.',
      aboutTitle: 'How WhatsApp QR codes work',
      about: [
        'A WhatsApp QR code contains a wa.me link. Scanning it opens a chat with you, and your pre-filled message is ready to send.',
        'Enter the number in international format with the country code, for example +44 20 7946 0958. Spaces and dashes are removed automatically.',
        'The code contains the wa.me link itself, not a redirect, so it keeps working as long as the number uses WhatsApp.'
      ]
    },
    app: {
      name: 'App download QR code',
      title: 'Free App Store and Google Play QR Code Generator | QRTurbo.app',
      description:
        'Create a free QR code for your app’s download page, App Store or Google Play link. Made in your browser. No sign-up, no redirects, never expires.',
      eyebrow: 'App download QR code generator',
      display: 'Send people straight to your app.',
      lead:
        'Add your app’s web page, App Store link and Google Play link to create a QR code for app downloads.',
      aboutTitle: 'How app download QR codes work',
      about: [
        'A QR code holds one link, and QRTurbo.app never adds a redirect. If you have a web page that sends iPhone users to the App Store and Android users to Google Play, use it as the web URL for the best result on every phone.',
        'Without such a page, choose which store link the code opens, or print separate codes for the App Store and Google Play.',
        'Check that the store links are public and do not contain tracking parameters you do not want to share.'
      ]
    }
  },
  comparison: {
    title: 'Free QR codes that never stop working',
    intro:
      'Many “free” QR code generators create dynamic codes that point to their own redirect server. When the trial ends, the code is switched off, often after it has already been printed on menus, business cards or packaging. QRTurbo.app works differently.',
    headers: {
      feature: 'Question',
      dynamic: 'Typical “free trial” QR code',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Where is your content stored?',
        dynamic: 'On the provider’s server, behind a short redirect link',
        qrturbo: 'Inside the QR code itself'
      },
      {
        feature: 'What happens when the trial ends?',
        dynamic: 'The code is deactivated until you pay',
        qrturbo: 'Nothing. There is no trial, and the code keeps working'
      },
      {
        feature: 'Do you need an account?',
        dynamic: 'Usually yes',
        qrturbo: 'No'
      },
      {
        feature: 'Who sees your scans?',
        dynamic: 'Every scan passes through the provider',
        qrturbo: 'No one. Scans never reach us'
      },
      {
        feature: 'What does it cost?',
        dynamic: 'A monthly or yearly subscription',
        qrturbo: 'Nothing, including commercial use'
      }
    ],
    note:
      'The one trade-off: a static QR code cannot be edited after printing. If you may need to change the destination later, create the code for a page you control, and update that page instead.'
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'Do QR codes made with QRTurbo.app expire?',
        a: 'No. QRTurbo.app creates static QR codes: your link, text or contact details are encoded directly in the code. There is no server in between, so there is nothing that could expire or be switched off. A code keeps working as long as its content is valid, for example as long as the website it links to exists.'
      },
      {
        q: 'Why did my QR code from another website stop working?',
        a: 'Many generators create dynamic QR codes by default. They contain a short link to the provider’s server, which redirects each scan to your real address. When a free trial or subscription ends, the provider switches off the redirect and the printed code stops working. Codes from QRTurbo.app contain your real content and never depend on us.'
      },
      {
        q: 'Is QRTurbo.app really free? Can I use the codes commercially?',
        a: 'Yes. There is no sign-up, no trial, no watermark and no scan limit. You may use the QR codes you create for personal and commercial purposes, such as business cards, menus, packaging and advertising.'
      },
      {
        q: 'Can I change a QR code after printing it?',
        a: 'No. A static QR code cannot be edited, because the content is part of the pattern. If you expect to change the destination, create the code for an address you control, such as a page on your own website, and update that page instead.'
      },
      {
        q: 'How large should I print a QR code?',
        a: 'Print it at least 2 × 2 cm (0.8 × 0.8 in). As a rule of thumb, make the code at least one tenth of the scanning distance: a poster read from 2 metres away needs a code of about 20 cm. For print, download an SVG or a large PNG and keep the quiet zone around the code empty.'
      },
      {
        q: 'Why won’t my QR code scan?',
        a: 'The most common causes are low contrast between the code and its background, a quiet zone that is too small, a logo that covers too much of the code, or too much content for the printed size. QRTurbo.app warns you about these risks. Always test the code with a few different phones before printing.'
      },
      {
        q: 'Is my data safe? Can you see my WiFi password?',
        a: 'Your data stays on your device. The QR code is generated by code running in your browser, and nothing you type or upload is sent to a server, so no one can see your WiFi password or contact details. After the first visit, the generator also works offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Free QR code generators'
  }
};
