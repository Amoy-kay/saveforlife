// ===== GLOBAL STATE =====
let currentStep = 1;
const totalSteps = 6;
let userData = {};
let isLoading = false;

// Currency exchange rates (mock data)
const exchangeRates = {
    USD: { JMD: 155.0, EUR: 0.85, GBP: 0.73, CAD: 1.25 },
    JMD: { USD: 0.0065, EUR: 0.0055, GBP: 0.0047, CAD: 0.0081 },
    EUR: { USD: 1.18, JMD: 183.0, GBP: 0.86, CAD: 1.47 },
    GBP: { USD: 1.37, JMD: 212.0, EUR: 1.16, CAD: 1.71 },
    CAD: { USD: 0.80, JMD: 124.0, EUR: 0.68, GBP: 0.58 }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Show onboarding on first load
    showOnboarding();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update AI preview based on form inputs
    updateAIPreview();
    
    // Update currency display
    updateCurrencyDisplay();
}

// ===== ONBOARDING FUNCTIONS =====
function showOnboarding() {
    document.getElementById('onboarding').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    updateProgress();
}

function showMainApp() {
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    
    // Update welcome message with user's name
    if (userData.fullName) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const timeOfDay = getTimeOfDay();
        welcomeMessage.textContent = `${timeOfDay}, ${userData.fullName}!`;
    }
    
    // Update AI assistant name
    if (userData.aiName) {
        document.getElementById('aiMessage').textContent = `I'm ${userData.aiName}, let's save today!`;
        document.getElementById('chatAiName').textContent = userData.aiName;
    }
    
    // Update currency displays
    updateCurrencyDisplay();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    
    // Update progress bar
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        indicator.classList.remove('active', 'completed', 'pending');
        
        if (stepNumber < currentStep) {
            indicator.classList.add('completed');
        } else if (stepNumber === currentStep) {
            indicator.classList.add('active');
        } else {
            indicator.classList.add('pending');
        }
    });
}

function nextStep() {
    if (currentStep < totalSteps) {
        // Validate current step before proceeding
        if (!validateCurrentStep()) {
            return;
        }
        
        currentStep++;
        showStep(currentStep);
        updateProgress();
        updateNavigationButtons();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
        updateNavigationButtons();
    }
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.onboarding-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show current step
    const currentStepEl = document.getElementById(`step-${step}`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const completeBtn = document.getElementById('completeBtn');
    
    // Show/hide previous button
    prevBtn.style.display = currentStep > 1 ? 'flex' : 'none';
    
    // Show/hide next/complete buttons
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        completeBtn.style.display = 'flex';
    } else {
        nextBtn.style.display = 'flex';
        completeBtn.style.display = 'none';
    }
}

function validateCurrentStep() {
    const stepEl = document.getElementById(`step-${currentStep}`);
    const requiredFields = stepEl.querySelectorAll('input[required], select[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            field.focus();
            field.style.borderColor = 'var(--error-500)';
            
            // Reset border color after a delay
            setTimeout(() => {
                field.style.borderColor = '';
            }, 3000);
            
            return false;
        }
    }
    
    // Additional validation for specific steps
    switch (currentStep) {
        case 2:
            return validatePersonalInfo();
        case 4:
            return validateSavingsConfig();
        case 5:
            return validateNotifications();
        case 6:
            return validateAIConfig();
    }
    
    return true;
}

function validatePersonalInfo() {
    const age = parseInt(document.getElementById('age').value);
    const email = document.getElementById('email').value;
    
    if (age < 18 || age > 100) {
        alert('Please enter a valid age between 18 and 100.');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    
    return true;
}

function validateSavingsConfig() {
    const amount = parseFloat(document.getElementById('withdrawalAmount').value);
    if (amount <= 0) {
        alert('Please enter a valid withdrawal amount.');
        return false;
    }
    return true;
}

function validateNotifications() {
    const month1 = document.getElementById('notificationMonth1').value;
    const month2 = document.getElementById('notificationMonth2').value;
    
    if (!month1 || !month2) {
        alert('Please select two months for notifications.');
        return false;
    }
    
    if (month1 === month2) {
        alert('Please select two different months.');
        return false;
    }
    
    return true;
}

function validateAIConfig() {
    const aiName = document.getElementById('aiName').value.trim();
    if (!aiName) {
        alert('Please enter a name for your AI assistant.');
        return false;
    }
    return true;
}

function completeOnboarding() {
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading overlay
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        // Save user data
        saveUserData();
        
        // Hide loading
        hideLoading();
        
        // Show main app
        showMainApp();
    }, 2000);
}

function saveUserData() {
    // Collect data from all steps
    userData = {
        language: document.getElementById('language').value,
        country: document.getElementById('country').value,
        fullName: document.getElementById('fullName').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        email: document.getElementById('email').value,
        bankName: document.getElementById('bankName').value,
        accountNumber: document.getElementById('accountNumber').value,
        routingNumber: document.getElementById('routingNumber').value,
        withdrawalAmount: parseFloat(document.getElementById('withdrawalAmount').value),
        withdrawalFrequency: document.getElementById('withdrawalFrequency').value,
        savingsCurrency: document.getElementById('savingsCurrency').value,
        showLocalCurrency: document.getElementById('showLocalCurrency').checked,
        balanceNotifications: document.getElementById('balanceNotifications').value,
        notificationMonth1: document.getElementById('notificationMonth1').value,
        notificationMonth2: document.getElementById('notificationMonth2').value,
        aiName: document.getElementById('aiName').value,
        aiGender: document.getElementById('aiGender').value,
        currentBalance: 2847.50 // Mock balance
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('saveForLifeUserData', JSON.stringify(userData));
}

// ===== MAIN APP FUNCTIONS =====
function updateCurrencyDisplay() {
    const currencyToggle = document.getElementById('currencyToggle');
    const currencyBtns = currencyToggle.querySelectorAll('.currency-btn');
    const balanceAmount = document.getElementById('balanceAmount');
    const secondaryAmount = document.getElementById('secondaryAmount');
    const currencySymbol = document.getElementById('currencySymbol');
    
    if (!userData.savingsCurrency) {
        // Set defaults if user data not loaded
        userData.savingsCurrency = 'USD';
        userData.country = 'US';
    }
    
    // Set active button
    currencyBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.currency === 'local') {
            btn.textContent = getLocalCurrency();
            btn.dataset.currency = 'local';
        } else {
            btn.textContent = userData.savingsCurrency;
            btn.dataset.currency = 'savings';
        }
    });
    
    // Update display based on active currency
    const activeBtn = currencyToggle.querySelector('.active');
    if (activeBtn) {
        updateBalanceDisplay(activeBtn.dataset.currency);
    }
}

function updateBalanceDisplay(displayType) {
    const balanceAmount = document.getElementById('balanceAmount');
    const secondaryAmount = document.getElementById('secondaryAmount');
    const currencySymbol = document.getElementById('currencySymbol');
    
    const balance = userData.currentBalance || 2847.50;
    const savingsCurrency = userData.savingsCurrency || 'USD';
    const localCurrency = getLocalCurrency();
    
    if (displayType === 'local') {
        // Show local currency as primary
        const localAmount = balance;
        const savingsAmount = convertCurrency(balance, localCurrency, savingsCurrency);
        
        currencySymbol.textContent = getCurrencySymbol(localCurrency);
        balanceAmount.textContent = formatCurrency(localAmount, localCurrency);
        secondaryAmount.textContent = formatCurrency(savingsAmount, savingsCurrency);
    } else {
        // Show savings currency as primary
        const savingsAmount = convertCurrency(balance, localCurrency, savingsCurrency);
        const localAmount = convertCurrency(savingsAmount, savingsCurrency, localCurrency);
        
        currencySymbol.textContent = getCurrencySymbol(savingsCurrency);
        balanceAmount.textContent = formatCurrency(savingsAmount, savingsCurrency);
        secondaryAmount.textContent = formatCurrency(localAmount, localCurrency);
    }
}

function getLocalCurrency() {
    const country = userData.country || 'US';
    const countryToCurrency = {
        'US': 'USD',
        'JM': 'JMD',
        'CA': 'CAD',
        'GB': 'GBP',
        'AU': 'AUD',
        'DE': 'EUR',
        'FR': 'EUR',
        'ES': 'EUR',
        'IT': 'EUR'
    };
    return countryToCurrency[country] || 'USD';
}

function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'JMD': 'J$',
        'EUR': '€',
        'GBP': '£',
        'CAD': 'C$',
        'AUD': 'A$'
    };
    return symbols[currency] || '$';
}

function convertCurrency(amount, from, to) {
    if (from === to) return amount;
    
    if (exchangeRates[from] && exchangeRates[from][to]) {
        return amount * exchangeRates[from][to];
    }
    
    return amount; // Fallback
}

function formatCurrency(amount, currency) {
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

// ===== AI ASSISTANT FUNCTIONS =====
function updateAIPreview() {
    const aiName = document.getElementById('aiName').value;
    const aiGender = document.getElementById('aiGender').value;
    const aiPreviewName = document.getElementById('aiPreviewName');
    const avatarCircle = document.getElementById('avatarCircle');
    
    if (aiName) {
        aiPreviewName.textContent = aiName;
    }
    
    // Update avatar based on gender
    const icons = {
        male: 'user',
        female: 'user',
        neutral: 'user'
    };
    
    const colors = {
        male: 'var(--primary-500)',
        female: 'var(--primary-500)',
        neutral: 'var(--primary-500)'
    };
    
    avatarCircle.innerHTML = `<i data-lucide="${icons[aiGender] || 'user'}"></i>`;
    avatarCircle.style.color = colors[aiGender] || 'var(--primary-500)';
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function openAIChat() {
    const modal = document.getElementById('aiChatModal');
    modal.style.display = 'flex';
    
    // Initialize chat with AI introduction
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="message ai-message">
            <div class="message-avatar">
                <i data-lucide="user"></i>
            </div>
            <div class="message-content">
                <p>Hello! I'm ${userData.aiName || 'your AI assistant'}, here to help you reach your savings goals. How can I assist you today?</p>
            </div>
        </div>
    `;
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeAIChat() {
    const modal = document.getElementById('aiChatModal');
    modal.style.display = 'none';
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    chatInput.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        addChatMessage(aiResponse, 'ai');
    }, 1000);
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i data-lucide="user"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function generateAIResponse(userMessage) {
    const responses = [
        `That's a great question about your savings! Based on your current balance of $${userData.currentBalance || 2847.50}, you're doing really well!`,
        `I recommend setting aside at least 10% of your income for savings. You're currently saving $${userData.withdrawalAmount || 50} ${userData.withdrawalFrequency || 'weekly'} - that's excellent!`,
        `Your goal to save in ${userData.savingsCurrency || 'USD'} is smart, especially with the current exchange rates. Keep it up!`,
        `Remember, the key to successful saving is consistency. You're already on the right track with your automated ${userData.withdrawalFrequency || 'weekly'} deposits.`,
        `I noticed you've been very consistent with your savings! This discipline will help you reach your financial goals faster.`,
        `Would you like me to help you set up a specific savings goal? I can suggest amounts based on your current savings rate.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// ===== UTILITY FUNCTIONS =====
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Onboarding navigation
    document.getElementById('nextBtn').addEventListener('click', nextStep);
    document.getElementById('prevBtn').addEventListener('click', prevStep);
    document.getElementById('completeBtn').addEventListener('click', completeOnboarding);
    
    // AI preview updates
    document.getElementById('aiName').addEventListener('input', updateAIPreview);
    document.getElementById('aiGender').addEventListener('change', updateAIPreview);
    
    // Currency toggle
    document.getElementById('currencyToggle').addEventListener('click', function(e) {
        if (e.target.classList.contains('currency-btn')) {
            document.querySelectorAll('.currency-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            updateBalanceDisplay(e.target.dataset.currency);
        }
    });
    
    // Main app navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Quick action buttons
    document.getElementById('withdrawBtn').addEventListener('click', showWithdrawModal);
    document.getElementById('scheduleBtn').addEventListener('click', showScheduleModal);
    document.getElementById('goalsBtn').addEventListener('click', showGoalsModal);
    
    // AI Chat
    document.querySelector('.nav-item[data-tab="ai"]').addEventListener('click', openAIChat);
    document.getElementById('closeChatModal').addEventListener('click', closeAIChat);
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Modal close on overlay click
    document.getElementById('aiChatModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAIChat();
        }
    });
    
    // Form field events
    document.querySelectorAll('.input-field').forEach(field => {
        field.addEventListener('focus', function() {
            this.style.borderColor = '';
        });
    });
}

function switchTab(tab) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Handle specific tab actions
    switch (tab) {
        case 'ai':
            openAIChat();
            break;
        case 'goals':
            showGoalsModal();
            break;
        case 'settings':
            showSettingsModal();
            break;
    }
}

function showWithdrawModal() {
    const currentDate = new Date();
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
    const daysUntilWithdrawal = Math.ceil((endOfYear - currentDate) / (1000 * 60 * 60 * 24));
    
    alert(`Withdrawals are restricted until December 31, ${currentDate.getFullYear()}.\n\nDays remaining: ${daysUntilWithdrawal}\n\nThis restriction ensures better returns on your savings!`);
}

function showScheduleModal() {
    alert('Schedule Management\n\nCurrent Settings:\n• Amount: $' + (userData.withdrawalAmount || 50) + '\n• Frequency: ' + (userData.withdrawalFrequency || 'Weekly') + '\n\nThis feature would allow you to modify your automated savings schedule.');
}

function showGoalsModal() {
    alert('Savings Goals\n\nTrack your progress towards:\n• Emergency Fund: $5,000 (57% complete)\n• Vacation: $2,000 (142% complete)\n• New Car: $15,000 (19% complete)\n\nCreate and manage your savings goals here!');
}

function showSettingsModal() {
    alert('Settings\n\n• Account Information\n• Notification Preferences\n• Security Settings\n• Privacy Controls\n• Currency Settings\n\nManage your app preferences and account settings.');
}

// ===== LOAD USER DATA ON APP START =====
function loadUserData() {
    const savedData = localStorage.getItem('saveForLifeUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
        
        // Populate form fields if onboarding data exists
        if (userData.fullName) {
            // Show main app directly if user data exists
            showMainApp();
        }
    }
}

// Initialize app with saved data
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
});

// Keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    if (document.getElementById('onboarding').style.display !== 'none') {
        if (e.key === 'ArrowRight' && !e.shiftKey) {
            nextStep();
        } else if (e.key === 'ArrowLeft' && !e.shiftKey) {
            prevStep();
        }
    }
    
    // ESC key to close modals
    if (e.key === 'Escape') {
        closeAIChat();
    }
});

// Auto-save form data as user types
document.addEventListener('input', function(e) {
    if (e.target.matches('.input-field')) {
        // Debounce auto-save
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            autoSaveFormData();
        }, 500);
    }
});

function autoSaveFormData() {
    const formData = {};
    document.querySelectorAll('.input-field').forEach(field => {
        if (field.type === 'checkbox') {
            formData[field.id] = field.checked;
        } else {
            formData[field.id] = field.value;
        }
    });
    
    localStorage.setItem('saveForLifeFormData', JSON.stringify(formData));
}

// Restore form data on load
function restoreFormData() {
    const savedData = localStorage.getItem('saveForLifeFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = formData[fieldId];
                } else {
                    field.value = formData[fieldId];
                }
            }
        });
        
        // Update dependent elements
        updateAIPreview();
        updateCurrencyDisplay();
    }
}

// Call restore on page load
document.addEventListener('DOMContentLoaded', restoreFormData);