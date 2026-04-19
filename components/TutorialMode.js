// Interactive Tutorial Mode Component
function TutorialMode({ user, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isActive, setIsActive] = React.useState(true);
  const [highlightElement, setHighlightElement] = React.useState(null);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Force re-render on window resize to update positions
  React.useEffect(() => {
    const handleResize = () => forceUpdate();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tutorial steps based on user role
  const getTutorialSteps = () => {
    const baseSteps = [
      {
        title: "Welcome to Food Maps! ",
        description: "Let's take a quick tour to help you get started. This tutorial will show you how to make the most of our platform.",
        target: null,
        position: "center",
        action: null
      },
      {
        title: "Your Dashboard",
        description: "This is your main view. Here you can see all available food listings in your area.",
        target: ".map-container, #root > div > div:nth-child(2)",
        position: "center",
        action: null
      }
    ];

    if (user?.role === 'recipient') {
      return [
        ...baseSteps,
        {
          title: "Browse Food Listings ",
          description: "Switch between map and list view to find food near you. Listings show available food items from donors.",
          target: ".view-toggle, button[class*='view']",
          position: "bottom",
          action: null
        },
        {
          title: "Urgency Indicators",
          description: "Pay attention to urgency badges. Critical items need to be claimed within 2 hours. High urgency items expire in 6 hours.",
          target: ".status-available, .card",
          position: "left",
          action: null
        },
        {
          title: "Set Your Dietary Needs ",
          description: "Click on your profile to set dietary preferences and allergies. The app will recommend food that matches your needs!",
          target: "button[class*='profile'], .user-menu",
          position: "bottom",
          action: () => {
            // Highlight profile button
            const profileBtn = document.querySelector("button[class*='profile'], .user-menu");
            if (profileBtn) {
              profileBtn.style.animation = "pulse 1s infinite";
            }
          }
        },
        {
          title: "Claim Food Items ",
          description: "When you find food you need, click the 'Claim' button. You'll receive an SMS code to confirm your claim.",
          target: ".btn-primary, button[class*='claim']",
          position: "top",
          action: null
        },
        {
          title: "Pickup Status ",
          description: "After claiming, keep your pickup status current so donors and recipients know the handoff timing.",
          target: ".card, .listing-card",
          position: "right",
          action: null
        },
        {
          title: "Filter & Search ",
          description: "Use filters to find specific food types, adjust distance, or search by category. Make it easy to find what you need!",
          target: ".filter-panel, [class*='filter']",
          position: "right",
          action: null
        },
        {
          title: "Get Support ",
          description: "Need help? Open your profile menu and tap 'Message Support' to chat with our team anytime.",
          target: "[data-tutorial='message-support-button'], [data-tutorial='profile-menu-toggle']",
          position: "left",
          action: () => {
            const menuToggle = document.querySelector("[data-tutorial='profile-menu-toggle']");
            if (menuToggle) menuToggle.click();
            const supportBtn = document.querySelector("[data-tutorial='message-support-button']");
            if (supportBtn) {
              supportBtn.style.animation = "bounce 1s infinite";
            }
          }
        },
        {
          title: "You're All Set! ",
          description: "You're ready to start finding food. Claim urgent items quickly and keep your pickup status up to date.",
          target: null,
          position: "center",
          action: null
        }
      ];
    } else if (user?.role === 'donor') {
      return [
        ...baseSteps,
        {
          title: "Create Listings ",
          description: "Click 'Donate Food' to create a new listing. Add photos, description, quantity, and expiration date.",
          target: "button[class*='donate'], .btn-primary",
          position: "bottom",
          action: null
        },
        {
          title: "Set Urgency & Perishability",
          description: "Mark how perishable your food is. The app will automatically show urgency countdown timers to recipients!",
          target: ".card, form",
          position: "right",
          action: null
        },
        {
          title: "Track Your Impact ",
          description: "View your donor dashboard to see how many people you've helped and how much food you've saved from waste!",
          target: "button[class*='impact'], [class*='dashboard']",
          position: "bottom",
          action: null
        },
        {
          title: "Manage Claims ",
          description: "When someone claims your food, you'll see their contact info. Send them an SMS confirmation code.",
          target: ".card, .listing-card",
          position: "left",
          action: null
        },
        {
          title: "Claim Tracking ",
          description: "Track claim updates so you can confirm successful pickups and coordinate handoffs.",
          target: ".card",
          position: "right",
          action: null
        },
        {
          title: "Schedule Donations ",
          description: "Set up recurring donations if you regularly have surplus food. Help feed your community consistently!",
          target: "button[class*='schedule']",
          position: "bottom",
          action: null
        },
        {
          title: "Get Support ",
          description: "Questions? Open your profile menu and select 'Message Support' to reach our team anytime.",
          target: "[data-tutorial='message-support-button'], [data-tutorial='profile-menu-toggle']",
          position: "left",
          action: () => {
            const menuToggle = document.querySelector("[data-tutorial='profile-menu-toggle']");
            if (menuToggle) menuToggle.click();
            const supportBtn = document.querySelector("[data-tutorial='message-support-button']");
            if (supportBtn) {
              supportBtn.style.animation = "bounce 1s infinite";
            }
          }
        },
        {
          title: "You're Ready to Give! ",
          description: "You're all set to start helping your community! Create listings, manage claims, and track your positive impact. Thank you for being generous!",
          target: null,
          position: "center",
          action: null
        }
      ];
    } else {
      // Guest or other roles
      return [
        ...baseSteps,
        {
          title: "Sign Up to Get Started ",
          description: "Create an account to claim food as a recipient or donate food as a donor. It's free and takes just a minute!",
          target: "button[class*='login'], button[class*='sign']",
          position: "bottom",
          action: null
        },
        {
          title: "Explore the Map ",
          description: "See available food listings in your area. Each marker represents food available for pickup.",
          target: ".map-container",
          position: "center",
          action: null
        },
        {
          title: "Ready to Join? ",
          description: "Sign up now to start claiming food or donating to your community. Together we can reduce food waste!",
          target: null,
          position: "center",
          action: null
        }
      ];
    }
  };

  const steps = getTutorialSteps();
  const currentStepData = steps[currentStep];

  // Safety check for step data
  if (!currentStepData) {
    console.error('Invalid tutorial step:', currentStep);
    return null;
  }

  // Highlight target element
  React.useEffect(() => {
    if (!isActive) return;

    // Remove previous highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
      el.style.animation = '';
    });

    // Execute step action before target lookup so steps can reveal hidden targets (e.g., dropdown items).
    if (currentStepData?.action) {
      try {
        currentStepData.action();
      } catch (e) {
        console.warn('Error executing step action', e);
      }
    }

    if (currentStepData?.target) {
      const targets = currentStepData.target.split(',').map(s => s.trim());
      let element = null;

      for (const selector of targets) {
        try {
          element = document.querySelector(selector);
          if (element) break;
        } catch (e) {
          console.warn(`Invalid selector: ${selector}`, e);
        }
      }

      if (element) {
        element.classList.add('tutorial-highlight');
        setHighlightElement(element);

        // Scroll element into view
        setTimeout(() => {
          try {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          } catch (e) {
            console.warn('Failed to scroll element into view', e);
          }
        }, 100);
      } else {
        setHighlightElement(null);
        console.warn(`No element found for selectors: ${currentStepData.target}`);
      }
    } else {
      setHighlightElement(null);
    }

    return () => {
      // Cleanup
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
        el.style.animation = '';
      });
    };
  }, [currentStep, isActive, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (typeof window.showAlert === 'function') {
      window.showAlert('You can restart the tutorial anytime from your profile menu!', {
        title: 'Tutorial Skipped',
        variant: 'default'
      });
    }

    // Mark tutorial as completed
    try {
      localStorage.setItem('tutorial_completed', 'true');
    } catch (e) { }

    onClose();
  };

  const handleComplete = () => {
    if (typeof window.showAlert === 'function') {
      window.showAlert('Great job! You\'re ready to use Food Maps. Explore and enjoy!', {
        title: 'Tutorial Complete! ',
        variant: 'success'
      });
    }

    // Mark tutorial as completed
    try {
      localStorage.setItem('tutorial_completed', 'true');
    } catch (e) { }

    if (onComplete) onComplete();
    onClose();
  };

  const getTooltipPosition = () => {
    if (!highlightElement || currentStepData?.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: 'min(90vw, 28rem)'
      };
    }

    const rect = highlightElement.getBoundingClientRect();
    const position = currentStepData.position || 'bottom';
    const offset = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let style = { position: 'fixed', maxWidth: 'min(90vw, 28rem)' };

    // Determine best position based on available space
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;

    let finalPosition = position;

    // Auto-adjust position if not enough space
    if (position === 'top' && spaceTop < 300) finalPosition = 'bottom';
    if (position === 'bottom' && spaceBottom < 300) finalPosition = 'top';
    if (position === 'left' && spaceLeft < 300) finalPosition = 'right';
    if (position === 'right' && spaceRight < 300) finalPosition = 'left';

    switch (finalPosition) {
      case 'top':
        style.left = `${Math.max(200, Math.min(viewportWidth - 200, rect.left + rect.width / 2))}px`;
        style.top = `${Math.max(offset, rect.top - offset)}px`;
        style.transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        style.left = `${Math.max(200, Math.min(viewportWidth - 200, rect.left + rect.width / 2))}px`;
        style.top = `${Math.min(viewportHeight - 200, rect.bottom + offset)}px`;
        style.transform = 'translate(-50%, 0)';
        break;
      case 'left':
        style.left = `${Math.max(offset, rect.left - offset)}px`;
        style.top = `${Math.max(100, Math.min(viewportHeight - 100, rect.top + rect.height / 2))}px`;
        style.transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        style.left = `${Math.min(viewportWidth - 200, rect.right + offset)}px`;
        style.top = `${Math.max(100, Math.min(viewportHeight - 100, rect.top + rect.height / 2))}px`;
        style.transform = 'translate(0, -50%)';
        break;
      default:
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%)';
    }

    return style;
  };

  if (!isActive) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black transition-opacity z-[100]"
        style={{ opacity: highlightElement ? 0.7 : 0.5 }}
      />

      {/* Highlight spotlight effect */}
      {highlightElement && (
        <div
          className="fixed border-4 border-blue-500 rounded-lg pointer-events-none z-[101] transition-all duration-300"
          style={{
            top: `${highlightElement.getBoundingClientRect().top - 8}px`,
            left: `${highlightElement.getBoundingClientRect().left - 8}px`,
            width: `${highlightElement.getBoundingClientRect().width + 16}px`,
            height: `${highlightElement.getBoundingClientRect().height + 16}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.8)',
          }}
        />
      )}

      {/* Tutorial tooltip */}
      <div
        className="fixed z-[102] bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transition-all duration-300"
        style={getTooltipPosition()}
      >
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-t-xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
              title="Skip tutorial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Element not found warning */}
          {currentStepData.target && !highlightElement && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <p> <strong>Note:</strong> The element for this step is not currently visible. You can continue to the next step.</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors ${currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>

            <div className="flex justify-center gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${index === currentStep
                    ? 'bg-blue-500 w-6'
                    : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Skip option - only show on non-final steps */}
          {currentStep < steps.length - 1 && (
            <div className="text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip tutorial
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom styles for tutorial highlight */}
      <style>{`
        @keyframes tutorialPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .tutorial-highlight {
          animation: tutorialPulse 2s infinite;
          position: relative;
          z-index: 99 !important;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}

// Tutorial launcher button component
function TutorialLauncher({ user, onLaunch }) {
  const [showPrompt, setShowPrompt] = React.useState(false);

  React.useEffect(() => {
    // Check if user has completed tutorial
    try {
      const completed = localStorage.getItem('tutorial_completed');
      const shownThisSession = sessionStorage.getItem('tutorial_shown_this_session');

      // Only show the launcher if:
      // 1. Tutorial hasn't been completed
      // 2. Haven't auto-shown it this session (main tutorial already shown)
      // 3. User exists
      if (!completed && shownThisSession && user) {
        // Show prompt after 3 seconds if tutorial was already auto-shown but dismissed
        setTimeout(() => setShowPrompt(true), 3000);
      }
    } catch (e) { }
  }, [user]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 bg-white rounded-lg shadow-2xl p-4 max-w-xs animate-bounce">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex items-start gap-3">
        <div className="text-3xl"></div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1">New to Food Maps?</h4>
          <p className="text-sm text-gray-600 mb-3">Take a quick tour to learn how to use the app!</p>
          <button
            onClick={() => {
              setShowPrompt(false);
              onLaunch();
            }}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all text-sm"
          >
            Start Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

// Export components
window.TutorialMode = TutorialMode;
window.TutorialLauncher = TutorialLauncher;
