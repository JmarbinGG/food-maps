function OnboardingStep({ step, stepIndex, user, data, onDataUpdate, onNext, onPrevious, isFirst, isLast }) {
  const [stepData, setStepData] = React.useState({});

  const handleInputChange = (field, value) => {
    const newData = { ...stepData, [field]: value };
    setStepData(newData);
    onDataUpdate(newData);
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <div className="icon-heart text-3xl text-green-600"></div>
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-4">Welcome to Food Maps, {user.name}!</h3>
        <p className="text-gray-600 mb-6">
          {user.role === 'donor' && "Thank you for joining our mission to eliminate food waste. Let's set up your account to start sharing food with your community."}
          {user.role === 'recipient' && "Welcome! We're here to help connect you with available food in your area. Let's personalize your experience."}
          {user.role === 'volunteer' && "Thank you for volunteering! Your help makes a real difference. Let's get you set up to start delivering food to those in need."}
          {user.role === 'dispatcher' && "Welcome to the dispatch center! You'll help coordinate food distribution across your region. Let's configure your system."}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="icon-map text-2xl text-blue-600 mb-2"></div>
          <div className="font-medium">Smart Matching</div>
          <div className="text-gray-600">AI-powered food matching</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="icon-truck text-2xl text-green-600 mb-2"></div>
          <div className="font-medium">Route Optimization</div>
          <div className="text-gray-600">Efficient delivery routes</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="icon-users text-2xl text-purple-600 mb-2"></div>
          <div className="font-medium">Community Impact</div>
          <div className="text-gray-600">Help your neighbors</div>
        </div>
      </div>
    </div>
  );

  const renderLocationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Set Your Location</h3>
        <p className="text-gray-600">This helps us show you nearby food opportunities and optimize routes.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Address</label>
          <input
            type="text"
            placeholder="Enter your street address..."
            className="w-full p-3 border border-gray-300 rounded-lg"
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                handleInputChange('coordinates', {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                });
                alert('Location detected successfully!');
              });
            }
          }}
          className="w-full bg-blue-50 text-blue-700 p-3 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="icon-map-pin mr-2"></div>
          Use My Current Location
        </button>
        
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
          <div className="icon-shield mr-2"></div>
          Your location is used only to show nearby food and optimize deliveries. We never share your exact address.
        </div>
      </div>
    </div>
  );

  const renderRoleSpecificStep = () => {
    if (user.role === 'donor' && step.key === 'donor_preferences') {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Food Sharing Preferences</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">What types of food do you typically share?</label>
              <div className="grid grid-cols-2 gap-2">
                {['Prepared Meals', 'Fresh Produce', 'Packaged Foods', 'Bakery Items', 'Beverages', 'Other'].map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Typical quantity range</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg">
                <option>1-5 servings</option>
                <option>6-15 servings</option>
                <option>16-50 servings</option>
                <option>50+ servings</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (user.role === 'recipient' && step.key === 'recipient_needs') {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Food Preferences & Dietary Needs</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dietary restrictions</label>
              <div className="grid grid-cols-2 gap-2">
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Diabetic-Friendly'].map(diet => (
                  <label key={diet} className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{diet}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Food allergies</label>
              <input
                type="text"
                placeholder="e.g., nuts, dairy, shellfish..."
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      );
    }

    if (user.role === 'volunteer' && step.key === 'vehicle_info') {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Vehicle Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle type</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg"
                onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
              >
                <option>Car</option>
                <option>SUV/Van</option>
                <option>Truck</option>
                <option>Bicycle</option>
                <option>Motorcycle</option>
                <option>Walking</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Carrying capacity</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg">
                <option>Small (1-10 meals)</option>
                <option>Medium (11-25 meals)</option>
                <option>Large (26-50 meals)</option>
                <option>Extra Large (50+ meals)</option>
              </select>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">I have refrigeration/cooling capability</span>
              </label>
            </div>
          </div>
        </div>
      );
    }

    return <div>Role-specific step for {user.role}</div>;
  };

  const renderCompletionStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <div className="icon-check text-3xl text-green-600"></div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold mb-4">You're All Set!</h3>
        <p className="text-gray-600 mb-6">
          Your account has been configured. You can always update these settings later in your profile.
        </p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">What's Next?</h4>
        <div className="text-sm text-green-700 space-y-1">
          {user.role === 'donor' && <p>• Create your first food listing • Set up notifications • Explore nearby recipients</p>}
          {user.role === 'recipient' && <p>• Browse available food • Set up search alerts • Track your food consumption</p>}
          {user.role === 'volunteer' && <p>• Check available delivery tasks • Set your availability • View optimized routes</p>}
          {user.role === 'dispatcher' && <p>• Monitor system status • Review AI matching • Manage coverage areas</p>}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step.key) {
      case 'welcome': return renderWelcomeStep();
      case 'location': return renderLocationStep();
      case 'completion': return renderCompletionStep();
      default: return renderRoleSpecificStep();
    }
  };

  try {
    return (
      <div className="space-y-6">
        {renderCurrentStep()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className="px-6 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {!isFirst && <><div className="icon-arrow-left mr-2"></div>Previous</>}
          </button>
          
          <button
            onClick={onNext}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            {isLast ? 'Complete Setup' : 'Next'}
            {!isLast && <div className="icon-arrow-right ml-2"></div>}
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('OnboardingStep component error:', error);
    return null;
  }
}