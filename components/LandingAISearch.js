// Landing AI Search Modal Component
function LandingAISearch() {
  const [showAISearch, setShowAISearch] = React.useState(false);

  // Make function globally available
  React.useEffect(() => {
    window.openAISearch = () => setShowAISearch(true);
    return () => {
      delete window.openAISearch;
    };
  }, []);

  const handleSelectFood = (food) => {
    // Redirect to main app with selected food
    localStorage.setItem('selectedFood', JSON.stringify(food));
    window.location.href = 'index.html';
  };

  try {
    return showAISearch ? (
      <AIFoodSearch 
        onClose={() => setShowAISearch(false)}
        onSelectFood={handleSelectFood}
      />
    ) : null;
  } catch (error) {
    console.error('LandingAISearch component error:', error);
    return null;
  }
}