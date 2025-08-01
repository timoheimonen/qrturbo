/**
 * @description Main function to generate the QR code based on the active tab and user input.
 */
function generateQRCode() {
    let text;
    const activeTabButton = document.querySelector('.tab-link.active');
    if (!activeTabButton) return; // Exit if no active tab is found
    const activeTab = activeTabButton.dataset.tab;

    // --- Step 1: Gather data from the active tab ---
    if (activeTab === 'URLText') {
        text = document.getElementById('qr-text').value;
        if (!text) {
            alert('Please enter some text or a URL');
            return;
        }
    } else if (activeTab === 'VCard') { // VCard tab is active
        // Collect all vCard fields
        const vcard = {
            fn: document.getElementById('vcard-fn').value.trim(),
            ln: document.getElementById('vcard-ln').value.trim(),
            org: document.getElementById('vcard-org').value.trim(),
            title: document.getElementById('vcard-title').value.trim(),
            telWork: document.getElementById('vcard-tel-work').value.trim(),
            telMobile: document.getElementById('vcard-tel-mobile').value.trim(),
            email: document.getElementById('vcard-email').value.trim(),
            url: document.getElementById('vcard-url').value.trim(),
            street: document.getElementById('vcard-street').value.trim(),
            city: document.getElementById('vcard-city').value.trim(),
            state: document.getElementById('vcard-state').value.trim(),
            zip: document.getElementById('vcard-zip').value.trim(),
            country: document.getElementById('vcard-country').value.trim(),
        };

        // Enhanced validation: require at least one name, email, or phone (per RFC 6350)
        if (!vcard.fn && !vcard.ln && !vcard.email && !vcard.telMobile && !vcard.telWork) {
            alert('Please fill at least one of: First Name, Last Name, Email or Phone number.');
            return;
        }

        // Helper function to escape vCard field values (escape backslashes and semicolons)
        const escapeVCardField = (value) => {
            if (!value) return '';
            return value.replace(/[\\;]/g, '\\$&');
        };

        // Assemble the vCard string according to the vCard 3.0 format
        let vCardString = "BEGIN:VCARD\nVERSION:3.0\n";
        
        // Handle N (Name) field - ensure at least one name component is present
        const hasName = vcard.fn || vcard.ln;
        if (hasName) {
            const escapedLn = escapeVCardField(vcard.ln);
            const escapedFn = escapeVCardField(vcard.fn);
            vCardString += `N:${escapedLn};${escapedFn};;;\n`;
        }
        
        // Handle FN (Formatted Name) field - create a meaningful display name
        if (hasName) {
            const displayName = `${vcard.fn || ''} ${vcard.ln || ''}`.trim();
            vCardString += `FN:${escapeVCardField(displayName)}\n`;
        } else if (vcard.org) {
            // If no name, use organization as display name
            vCardString += `FN:${escapeVCardField(vcard.org)}\n`;
        }
        
        if (vcard.org) vCardString += `ORG:${escapeVCardField(vcard.org)}\n`;
        if (vcard.title) vCardString += `TITLE:${escapeVCardField(vcard.title)}\n`;
        if (vcard.telWork) vCardString += `TEL;TYPE=WORK,VOICE:${escapeVCardField(vcard.telWork)}\n`;
        if (vcard.telMobile) vCardString += `TEL;TYPE=CELL,VOICE:${escapeVCardField(vcard.telMobile)}\n`;
        if (vcard.email) vCardString += `EMAIL:${escapeVCardField(vcard.email)}\n`;
        if (vcard.url) vCardString += `URL:${escapeVCardField(vcard.url)}\n`;
        if (vcard.street || vcard.city || vcard.state || vcard.zip || vcard.country) {
            const escapedStreet = escapeVCardField(vcard.street);
            const escapedCity = escapeVCardField(vcard.city);
            const escapedState = escapeVCardField(vcard.state);
            const escapedZip = escapeVCardField(vcard.zip);
            const escapedCountry = escapeVCardField(vcard.country);
            vCardString += `ADR;TYPE=HOME:;;${escapedStreet};${escapedCity};${escapedState};${escapedZip};${escapedCountry}\n`;
        }
        vCardString += "END:VCARD";
        text = vCardString;
    } else if (activeTab === 'Wifi') { // Wifi tab is active
        const ssid = document.getElementById('wifi-ssid').value.trim();
        const password = document.getElementById('wifi-password').value; // No trim on password
        const authType = document.getElementById('wifi-auth').value;
        const isHidden = document.getElementById('wifi-hidden').checked;

        if (!ssid) {
            alert('Please enter the Network Name (SSID).');
            return;
        }

        // Escape special characters for the WIFI format: \, ;, ,, "
        const escapeWifi = (s) => s.replace(/([\\;,"])/g, '\\$1');

        let wifiString = `WIFI:S:${escapeWifi(ssid)};`;
        wifiString += `T:${authType};`;
        if (authType !== 'nopass') {
            wifiString += `P:${escapeWifi(password)};`;
        }
        if (isHidden) {
            wifiString += 'H:true;';
        }
        text = wifiString;
    } else if (activeTab === 'SMSPhone') { // SMS/Phone tab is active
        const type = document.querySelector('input[name="sms-phone-type"]:checked').value;
        const phoneNumber = document.getElementById('sms-phone-number').value.trim();

        if (!phoneNumber) {
            alert('Please enter a phone number.');
            return;
        }

        if (type === 'sms') {
            const message = document.getElementById('sms-message').value; // Don't trim message
            // Format: SMSTO:number:message
            text = `SMSTO:${phoneNumber}:${message}`;
        } else { // type === 'phone'
            text = `tel:${phoneNumber}`;
        }
    }
    
    if (!text) {
        // Fallback validation, though prior checks should prevent this.
        alert('No data provided for QR code.');
        return;
    }

    // --- Step 2: Prepare UI for generation (loading state) ---
    const qrContainer = document.getElementById('qr-container');
    const qrImage = document.getElementById('qr-image');
    const downloadBtn = document.getElementById('download-btn');
    const qrCodeText = document.getElementById('qr-code-text');
    const qrPlaceholder = document.getElementById('qr-placeholder');
    
    qrContainer.classList.add('loading');
    qrPlaceholder.style.display = 'none';
    qrImage.style.opacity = '0.3'; // Dim the old image while loading
    downloadBtn.style.display = 'none';
    qrCodeText.style.display = 'none';

    // Use a short timeout to allow the UI to update with the loading state before the (potentially blocking) QR generation.
    setTimeout(() => {
        // --- Step 3: Generate and display the QR code ---
        const sizeSelect = document.getElementById('size-select');
        const selectedSize = parseInt(sizeSelect.value);

        // Initialize QR code generator (type 0 = auto-detect, 'M' = medium error correction)
        const qr = qrcode(0, 'M');
        qr.addData(text);
        qr.make();

        // Set the generated QR code as a Data URL to the image element
        qrImage.src = qr.createDataURL(selectedSize);
        qrImage.style.display = 'block';
        qrImage.style.opacity = '1';
        
        // Display the raw text content of the QR code, preserving line breaks
        qrCodeText.innerHTML = text.replace(/\n/g, '<br>');
        qrCodeText.style.display = 'block';

        // --- Step 4: Finalize UI (remove loading state, show results) ---
        qrContainer.classList.remove('loading');
        downloadBtn.style.display = 'block';
        
        // Re-trigger the container's appearance animation for a nice effect
        qrContainer.style.animation = 'none';
        qrContainer.offsetHeight; // Force a DOM reflow to reset the animation
        qrContainer.style.animation = 'qrAppear 0.6s ease-out';
    }, 300);
}

/**
 * @description Handles downloading the generated QR code image.
 */
function downloadQRCode() {
    const qrImage = document.getElementById('qr-image');
    const activeTabButton = document.querySelector('.tab-link.active');
    if (!activeTabButton) return;
    const activeTab = activeTabButton.dataset.tab;
    let text;
     // Generate a user-friendly filename based on the input
    let filename = 'qrcode_unknown';
    
    if (activeTab === 'URLText') {
        const urlText = document.getElementById('qr-text').value.trim();
        if (urlText) {
            // For URLs, try to extract domain name, otherwise use first 30 chars
            if (urlText.startsWith('http')) {
                try {
                    const url = new URL(urlText);
                    filename = `url_${url.hostname.replace(/^www\./, '')}`;
                } catch {
                    filename = `text_${urlText.substring(0, 30)}`;
                }
            } else {
                filename = `text_${urlText.substring(0, 30)}`;
            }
        }
    } else if (activeTab === 'VCard') {
        const firstName = document.getElementById('vcard-fn').value.trim();
        const lastName = document.getElementById('vcard-ln').value.trim();
        const email = document.getElementById('vcard-email').value.trim();
        const org = document.getElementById('vcard-org').value.trim();
        
        if (firstName || lastName) {
            filename = `vcard_${firstName || ''}_${lastName || ''}`.trim();
        } else if (email) {
            filename = `vcard_${email.split('@')[0]}`;
        } else if (org) {
            filename = `vcard_${org}`;
        } else {
            filename = 'vcard_contact';
        }
    } else if (activeTab === 'Wifi') {
        const ssid = document.getElementById('wifi-ssid').value.trim();
        if (ssid) {
            filename = `wifi_${ssid}`;
        } else {
            filename = 'wifi_network';
        }
    } else if (activeTab === 'SMSPhone') {
        const type = document.querySelector('input[name="sms-phone-type"]:checked').value;
        const phoneNumber = document.getElementById('sms-phone-number').value.trim();
        if (phoneNumber) {
            filename = `${type}_${phoneNumber.replace(/[^\d+]/g, '')}`;
        } else {
            filename = `${type}_number`;
        }
    }

    // Sanitize the filename: allow alphanumeric, hyphens, underscores, limit length
    const safeText = filename
        .replace(/[^a-z0-9\-_]/gi, '_')  // Replace invalid chars with underscore
        .replace(/_+/g, '_')             // Replace multiple underscores with single
        .replace(/^_|_$/g, '')           // Remove leading/trailing underscores
        .substring(0, 50)                // Limit length
        || 'qrcode_unknown';             // Fallback if empty

    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.download = `qrcode_${safeText}.png`;
    link.href = qrImage.src;
    link.click();
    
    // Re-trigger the download button's animation for user feedback
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.style.animation = 'none';
    downloadBtn.offsetHeight; // Force reflow
    downloadBtn.style.animation = 'bounceIn 0.6s ease-out';
}

// Setup page logic after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // --- Element Selectors ---
    const tabsContainer = document.getElementById('tabs');
    const wifiAuthSelect = document.getElementById('wifi-auth');
    const wifiPasswordField = document.getElementById('wifi-password');
    const smsPhoneTypeRadios = document.querySelectorAll('input[name="sms-phone-type"]');
    const smsMessageGroup = document.getElementById('sms-message-group');
    const qrTextInput = document.getElementById('qr-text');
    const charCountDisplay = document.getElementById('char-count');
    const smsMessageInput = document.getElementById('sms-message');
    const smsCharCountDisplay = document.getElementById('sms-char-count');

    // --- Event Listeners ---

    // Track character count for the URL/Text input
    qrTextInput.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCountDisplay.textContent = `${currentLength} / 2000 characters`;
        charCountDisplay.classList.toggle('warning', currentLength >= 1800);
    });

    // Track character count for the SMS message input
    smsMessageInput.addEventListener('input', function() {
        const currentLength = this.value.length;
        smsCharCountDisplay.textContent = `${currentLength} / 300 characters`;
        smsCharCountDisplay.classList.toggle('warning', currentLength >= 250);
    });

    // Add a subtle scale effect on input focus for better UX
    document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], input[type="url"], textarea').forEach(el => {
        el.addEventListener('focus', function() {
            // The :focus CSS already handles this, but if you wanted JS-only:
            // this.style.transform = 'scale(1.02)';
        });
        el.addEventListener('blur', function() {
            // The :focus CSS already handles this, but if you wanted JS-only:
            // this.style.transform = 'scale(1)';
        });
    });

    // --- SMS/Phone Form Logic ---
    function updateSmsPhoneUI() {
        const selectedType = document.querySelector('input[name="sms-phone-type"]:checked').value;
        const isSms = selectedType === 'sms';
        // Use 'flex' to match the .input-group display property
        smsMessageGroup.style.display = isSms ? 'flex' : 'none';
        if (!isSms) {
            // Clear message when switching to phone call to avoid confusion
            document.getElementById('sms-message').value = '';
        }
    }
    smsPhoneTypeRadios.forEach(radio => radio.addEventListener('change', updateSmsPhoneUI));
    // Set initial state on page load
    updateSmsPhoneUI();

    // --- Wifi Form Logic ---
    // Toggle password field enabled state based on authentication type
    wifiAuthSelect.addEventListener('change', function() {
        const isPasswordNeeded = this.value !== 'nopass';
        wifiPasswordField.disabled = !isPasswordNeeded;
        if (!isPasswordNeeded) {
            wifiPasswordField.value = ''; // Clear password if not needed
        }
    });
    // Trigger change on load to set initial state
    wifiAuthSelect.dispatchEvent(new Event('change'));




    // --- Tab Switching Logic ---
    tabsContainer.addEventListener('click', function(event) {
        const clickedTab = event.target.closest('.tab-link');
        // Ignore clicks that are not on a a tab link or are on the already active tab
        if (!clickedTab || clickedTab.classList.contains('active')) {
            return;
        }

        const tabName = clickedTab.dataset.tab;

        // Store current scroll position before switching tabs
        const currentScrollY = window.scrollY;

        tabsContainer.querySelector('.active').classList.remove('active');
        clickedTab.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(tabName).style.display = 'block';

        // Restore scroll position after tab switch to prevent page jumping
        window.scrollTo(0, currentScrollY);

        // --- Reset UI state when switching tabs ---
        // Clear all input fields
        const allFormElements = document.querySelectorAll('.tab-content input, .tab-content textarea');
        allFormElements.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
        // Reset select elements in all tabs to their first option
        document.querySelectorAll('.tab-content select').forEach(select => select.selectedIndex = 0);

        // Manually set default states for specific controls after clearing
        document.getElementById('sms-type-sms').checked = true;

        // Manually trigger change events to reset dependent UI states
        document.getElementById('wifi-auth').dispatchEvent(new Event('change'));
        updateSmsPhoneUI();
        // Reset password field to be of type 'text' (always visible)
        document.getElementById('wifi-password').type = 'text';

        // Reset character counters
        const charCountDisplay = document.getElementById('char-count');
        charCountDisplay.textContent = '0 / 2000 characters';
        charCountDisplay.classList.remove('warning');
        const smsCharCountDisplay = document.getElementById('sms-char-count');
        smsCharCountDisplay.textContent = '0 / 300 characters';
        smsCharCountDisplay.classList.remove('warning');

        const qrContainer = document.getElementById('qr-container');
        const qrImage = document.getElementById('qr-image');
        const downloadBtn = document.getElementById('download-btn');
        const qrCodeText = document.getElementById('qr-code-text');
        const qrPlaceholder = document.getElementById('qr-placeholder');
        
        qrPlaceholder.style.display = 'block';
        qrImage.src = "";
        qrImage.style.display = 'none';
        downloadBtn.style.display = 'none';
        qrCodeText.style.display = 'none';
        qrContainer.classList.remove('loading');

        // Reset container animation to its initial slide-in state
        qrContainer.style.animation = 'none';
        qrContainer.offsetHeight; // Force reflow
        qrContainer.style.animation = 'slideInUp 0.8s ease-out 0.3s both';
    });

    // Apply a staggered animation delay to elements on page load for a smoother appearance
    const elements = document.querySelectorAll('input, button, select, textarea, .char-counter, .tab-link');
    elements.forEach((element, index) => element.style.animationDelay = `${0.1 + (index * 0.05)}s`);


}); 