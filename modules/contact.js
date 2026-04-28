/**
 * Contact Module - Email & Form Submission
 * Handles contact form submission via EmailJS with validation
 */

/**
 * Initialize EmailJS service
 */
function initializeEmailJS() {
  if (window.emailjs) {
    const cfg = APP_CONFIG.CONTACT;
    emailjs.init(cfg.EMAILJS_PUBLIC_KEY);
    console.log('EmailJS initialized');
  }
}

/**
 * Setup contact form event listeners
 * Handles form submission and Enter key support
 */
function initializeContactForm() {
  const sendBtn = document.querySelector(DOM_SELECTORS.SEND_BTN);
  const messageInput = document.querySelector(DOM_SELECTORS.MESSAGE_INPUT);
  const messageCount = document.querySelector(DOM_SELECTORS.MESSAGE_COUNT);
  const messageError = document.querySelector(DOM_SELECTORS.MESSAGE_ERROR);
  const maxLength = 240;
  const minLength = APP_CONFIG.CONTACT.MIN_MESSAGE_LENGTH;

  if (!sendBtn || !messageInput) {
    console.warn('Contact form elements not found');
    return;
  }

  messageInput.maxLength = maxLength;

  const updateMessageFeedback = () => {
    const trimmedLength = messageInput.value.trim().length;

    if (messageCount) {
      messageCount.textContent = `${trimmedLength} / ${maxLength}`;
      messageCount.classList.toggle('warning', trimmedLength > maxLength * 0.85);
      messageCount.classList.toggle('invalid', trimmedLength > 0 && trimmedLength < minLength);
    }
  };

  updateMessageFeedback();

  /**
   * Handle send button click
   */
  sendBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await sendMessage(messageInput, messageError);
  });

  /**
   * Allow Enter key to send message
   */
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });

  messageInput.addEventListener('input', () => {
    messageInput.setAttribute('aria-invalid', 'false');
    updateMessageFeedback();

    const trimmedLength = messageInput.value.trim().length;

    if (messageError && trimmedLength > 0 && trimmedLength < minLength) {
      messageError.textContent = `Minimum ${minLength} characters required.`;
      if (messageCount) {
        messageCount.classList.add('invalid');
      }
      return;
    }

    if (messageError) {
      messageError.textContent = '';
    }
  });
}

/**
 * Send contact message via EmailJS
 * @param {HTMLElement} inputElement - The message input field
 */
async function sendMessage(inputElement, errorElement) {
  const sendBtn = document.querySelector(DOM_SELECTORS.SEND_BTN);
  const cfg = APP_CONFIG.CONTACT;

  const message = inputElement.value.trim();

  const setError = (text) => {
    inputElement.setAttribute('aria-invalid', 'true');
    if (errorElement) {
      errorElement.textContent = text;
    }
  };

  // Validation
  if (!message) {
    setError('Message is required.');
    showToast('Please enter a message first!', 'warning');
    return;
  }

  if (message.length < cfg.MIN_MESSAGE_LENGTH) {
    setError(`Message must be at least ${cfg.MIN_MESSAGE_LENGTH} characters.`);
    showToast('Message too short!', 'warning');
    return;
  }

  if (!window.emailjs) {
    setError('Message service is temporarily unavailable.');
    showToast('Service unavailable.', 'error');
    return;
  }

  inputElement.setAttribute('aria-invalid', 'false');
  if (errorElement) {
    errorElement.textContent = '';
  }

  // Disable button during send
  sendBtn.disabled = true;

  const templateParams = {
    message: message,
    from_name: cfg.FORM_NAME,
    to_name: cfg.RECIPIENT_NAME
  };

  try {
    await emailjs.send(cfg.EMAILJS_SERVICE_ID, cfg.EMAILJS_TEMPLATE_ID, templateParams);
    showToast('✓ Signal synchronized. Message sent.', 'success');
    inputElement.value = '';
    inputElement.setAttribute('aria-invalid', 'false');
    const messageCount = document.querySelector(DOM_SELECTORS.MESSAGE_COUNT);
    if (messageCount) {
      messageCount.textContent = '0 / 240';
      messageCount.classList.remove('warning', 'invalid');
    }
    if (errorElement) {
      errorElement.textContent = '';
    }
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Message send failed:', error);
    setError('Unable to send right now. Please try again in a moment.');
    showToast('✗ Signal lost. Please try again.', 'error');
  } finally {
    sendBtn.disabled = false;
  }
}

window.initializeEmailJS = initializeEmailJS;
window.initializeContactForm = initializeContactForm;
window.sendMessage = sendMessage;
