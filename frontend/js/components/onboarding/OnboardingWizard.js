function OnboardingWizard({ user, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [onboardingData, setOnboardingData] = React.useState({
    location: '',
    coordinates: null,
    preferences: {},
    availability: {},
    vehicle_info: {},
    experience_level: 'beginner'
  });

  const getStepsForUserRole = (role) => {
    const commonSteps = [
      { key: 'welcome', title: 'Welcome to Food Maps' },
      { key: 'location', title: 'Set Your Location' }
    ];

    const roleSpecificSteps = {
      donor: [
        { key: 'donor_preferences', title: 'Food Sharing Preferences' },
        { key: 'donor_schedule', title: 'Availability Settings' }
      ],
      recipient: [
        { key: 'recipient_needs', title: 'Food Preferences & Needs' },
        { key: 'household_info', title: 'Household Information' }
      ],
      volunteer: [
        { key: 'vehicle_info', title: 'Vehicle Information' },
        { key: 'volunteer_availability', title: 'Volunteer Schedule' }
      ],
      dispatcher: [
        { key: 'dispatcher_setup', title: 'Dispatch Center Setup' },
        { key: 'coverage_area', title: 'Coverage Area' }
      ]
    };

    const completionStep = { key: 'completion', title: 'You\'re All Set!' };
    
    return [...commonSteps, ...(roleSpecificSteps[role] || []), completionStep];
  };

  const steps = getStepsForUserRole(user.role);
  const currentStepData = steps[currentStep];

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

  const handleComplete = () => {
    const updatedUser = {
      ...user,
      ...onboardingData,
      onboardingCompleted: true,
      isNewUser: false
    };
    onComplete(updatedUser);
  };

  const updateOnboardingData = (data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Getting Started</h2>
                <p className="text-green-100 capitalize">{user.role} Setup</p>
              </div>
              <button onClick={onSkip} className="text-green-200 hover:text-white">
                Skip Setup
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-green-800 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 min-h-[400px]">
            <OnboardingStep
              step={currentStepData}
              stepIndex={currentStep}
              user={user}
              data={onboardingData}
              onDataUpdate={updateOnboardingData}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirst={currentStep === 0}
              isLast={currentStep === steps.length - 1}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('OnboardingWizard component error:', error);
    return null;
  }
}