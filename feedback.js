/* ============================================
   KANAK DOVLOPER - Feedback Form JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============ STATE ============
    let currentStep = 1;
    let score = 0;
    let starScore = 0;

    // ============ EMOJI RATING ============
    const emojiOptions = document.querySelectorAll('.emoji-option');
    emojiOptions.forEach(option => {
        option.addEventListener('click', () => {
            emojiOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            score = parseInt(option.dataset.score);

            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate(15);
        });
    });

    // ============ STAR RATING ============
    const stars = document.querySelectorAll('.star-rating i');
    const ratingText = document.getElementById('ratingText');

    const starLabels = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent!'];

    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const value = parseInt(star.dataset.star);
            highlightStars(value);
            ratingText.textContent = starLabels[value];
        });

        star.addEventListener('click', () => {
            starScore = parseInt(star.dataset.star);
            highlightStars(starScore);
            updateRatingText();
            if (navigator.vibrate) navigator.vibrate(15);
        });
    });

    document.querySelector('.star-rating').addEventListener('mouseleave', () => {
        highlightStars(starScore);
        updateRatingText();
    });

    function highlightStars(value) {
        stars.forEach(star => {
            const v = parseInt(star.dataset.star);
            star.classList.toggle('active', v <= value);
            star.className = v <= value ? 'fas fa-star active' : 'far fa-star';
        });
    }

    function updateRatingText() {
        if (starScore === 0) {
            ratingText.textContent = 'Tap a star to rate';
            ratingText.className = 'rating-text';
        } else {
            ratingText.textContent = starLabels[starScore];
            ratingText.className = 'rating-text ' + (starScore >= 4 ? 'high' : starScore >= 3 ? 'mid' : 'low');
        }
    }

    // ============ FEEDBACK TYPES ============
    const typeCards = document.querySelectorAll('.type-card');
    let selectedType = '';

    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            typeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedType = card.dataset.type;
            if (navigator.vibrate) navigator.vibrate(15);
        });
    });

    // ============ STEP NAVIGATION ============
    window.nextStep = function(step) {
        // Validation
        if (step === 2 && score === 0) {
            shakeElement();
            showErrorText('Please select your satisfaction rating');
            return;
        }
        if (step === 3 && !selectedType) {
            shakeElement();
            showErrorText('Please select a feedback type');
            return;
        }

        goToStep(step);
    };

    window.prevStep = function(step) {
        goToStep(step);
    };

    function goToStep(step) {
        currentStep = step;
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        document.getElementById('step' + step).classList.add('active');
        updateProgress(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateProgress(step) {
        const fill = document.getElementById('progressFill');
        fill.style.width = (step / 3) * 100 + '%';
    }

    // ============ ERROR HANDLING ============
    function showErrorText(msg) {
        const header = document.querySelector('#' + 'step' + currentStep + ' .step-header');
        const existing = document.querySelector('.error-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = msg;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: #f44336;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 8px 30px rgba(244, 67, 54, 0.4);
            transition: transform 0.3s ease;
            text-align: center;
            max-width: 90%;
        `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    function shakeElement() {
        const container = document.querySelector('.feedback-container');
        container.style.animation = 'none';
        container.offsetHeight;
        container.style.animation = 'shake 0.4s ease';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-8px); }
                40% { transform: translateX(8px); }
                60% { transform: translateX(-5px); }
                80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
        setTimeout(() => {
            container.style.animation = '';
            style.remove();
        }, 400);
    }

    // ============ FORM SUBMIT ============
    const form = document.getElementById('feedbackDetails');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();
        const recommend = document.querySelector('input[name="recommend"]:checked').value;

        // Validate
        if (!name || !email || !message) {
            showErrorText('Please fill all required fields');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showErrorText('Please enter a valid email address');
            return;
        }

        if (score === 0) score = starScore;

        // Build data
        const data = {
            name,
            email,
            phone,
            type: selectedType,
            emojiScore: score,
            starScore,
            message,
            recommend,
            timestamp: new Date().toISOString()
        };

        console.log('Feedback submitted:', data);

        // Show success (simulate API call for more realism)
        const submitBtn = form.querySelector('.btn-submit');
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        setTimeout(() => {
            showSuccess();
        }, 1500);
    });

    function showSuccess() {
        document.getElementById('feedbackForm').style.display = 'none';
        document.getElementById('successMessage').classList.add('show');
        document.querySelector('.progress-track').style.display = 'none';
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============ RESET ============
    window.resetForm = function() {
        // Reset states
        currentStep = 1;
        score = 0;
        starScore = 0;

        // Reset UI
        document.getElementById('successMessage').classList.remove('show');
        document.getElementById('feedbackForm').style.display = '';
        document.querySelector('.progress-track').style.display = '';

        emojiOptions.forEach(o => o.classList.remove('active'));
        stars.forEach(s => s.className = 'far fa-star');
        ratingText.textContent = 'Tap a star to rate';
        ratingText.className = 'rating-text';
        typeCards.forEach(c => c.classList.remove('active'));
        selectedType = '';

        document.getElementById('feedbackDetails').reset();

        goToStep(1);
    };

    // ============ HEADER SCROLL ============
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const y = window.pageYOffset;
        const brand = document.querySelector('.brand');
        if (y > lastScroll && y > 100) {
            brand.style.transform = 'scale(0.9)';
            brand.style.opacity = '0.5';
        } else {
            brand.style.transform = 'scale(1)';
            brand.style.opacity = '1';
        }
        lastScroll = y;
    }, { passive: true });

    // ============ HAPTIC FEEDBACK ============
    document.addEventListener('click', (e) => {
        if (e.target.closest('button, .emoji-option, .type-card, .star-rating i')) {
            if (navigator.vibrate) navigator.vibrate(8);
        }
    });

});