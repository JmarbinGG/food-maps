# Smart Meal Suggestions - Implementation Documentation

## Overview
AI-powered meal suggestion system that prevents food waste by combining expiring items into quick, practical meals. **Not fancy recipes** - these are simple, dignified meals anyone can make in 5-20 minutes.

## Core Philosophy

### "Safety, Dignity, and Nutrition Intersect"
- **Safety**: Only suggests food that's safe to eat, with clear timing warnings
- **Dignity**: Real meals that feel normal and satisfying, not "survival food"  
- **Nutrition**: Balanced combinations (protein + vegetables, grains + greens)
- **Waste Prevention**: Uses items expiring within 72 hours, prioritizes most urgent

## User Experience

### What Users Get
Instead of generic recipes, users see contextual suggestions:
> "You've got chicken + greens expiring soon, here's a 15-minute meal."

### Example Flow
1. User has claimed: chicken (18h left), greens (36h), tomatoes (48h)
2. AI suggests: **Quick Protein Salad** - 10 minutes, no cooking
3. Shows exact items being used with expiration countdown
4. Simple 5-step instructions anyone can follow
5. Alternatives: "Turn into a wrap", "Add hard-boiled eggs"

## Meal Generation Algorithm

### Input Data
- Claimed listings with expiration dates
- Filters items expiring within 72 hours
- Categorizes by urgency: critical (<24h), high (<48h), medium (<72h)

### Ingredient Categorization
AI groups items into:
- **Proteins**: chicken, turkey, beef, fish, meat
- **Greens**: lettuce, spinach, kale, salad mix
- **Vegetables**: carrots, peppers, broccoli, tomatoes
- **Fruits**: apples, berries, oranges
- **Grains**: rice, pasta, bread, tortillas
- **Dairy**: cheese, milk, yogurt
- **Prepared**: leftovers, pre-cooked meals

### Meal Patterns (7 Types)

#### 1. Protein + Greens = Quick Salad/Wrap
- **Cook Time**: 10 minutes
- **Difficulty**: Easy - No cooking
- **Example**: Chicken breast + mixed greens + cherry tomatoes
- **Steps**: Chop protein → wash greens → add veggies → dress → season
- **Urgency**: Critical if protein <24h

#### 2. Protein + Vegetables = Stir-Fry
- **Cook Time**: 15 minutes  
- **Difficulty**: Easy - One pan
- **Example**: Chicken + carrots + peppers + onions
- **Steps**: Heat pan → cook protein → add veggies → stir-fry → season
- **Urgency**: Critical if protein <24h

#### 3. Vegetables + Grains = Veggie Bowl
- **Cook Time**: 20 minutes
- **Difficulty**: Easy - One pot
- **Example**: Carrots + broccoli + rice
- **Steps**: Prepare grain → chop veggies → sauté → serve → top
- **Urgency**: High if veggies <48h

#### 4. Greens + Vegetables/Fruits = Big Salad
- **Cook Time**: 10 minutes
- **Difficulty**: Easy - No cooking
- **Example**: Lettuce + tomatoes + cucumbers + apple
- **Steps**: Wash/tear greens → chop toppings → combine → add protein → dress
- **Urgency**: High if greens <48h

#### 5. Bakery + Anything = Toast/Sandwich
- **Cook Time**: 5 minutes
- **Difficulty**: Very Easy
- **Example**: Bread + chicken + greens + tomatoes
- **Steps**: Toast bread → layer fillings → add condiments → season → cut
- **Urgency**: High if bread <48h

#### 6. Fruit + Dairy/Grain = Quick Breakfast
- **Cook Time**: 5 minutes
- **Difficulty**: Very Easy - No cooking
- **Example**: Strawberries + bananas + yogurt
- **Steps**: Put base in bowl → chop fruit → mix → add sweetener → enjoy
- **Urgency**: Medium if fruit <48h

#### 7. Prepared/Leftovers = Just Reheat
- **Cook Time**: 3 minutes
- **Difficulty**: Very Easy - Just reheat
- **Example**: Leftover pasta + side salad
- **Steps**: Reheat until steaming (165°F) → check temperature → serve with sides
- **Urgency**: Critical if prepared food <24h

### Ranking & Deduplication
- Sorts by urgency (critical → high → medium)
- Returns top 5 suggestions
- Filters duplicates by meal ID

## UI Components

### Main Modal
```
┌─────────────────────────────────────┐
│  👨‍🍳 Smart Meal Suggestions         │
│  Prevent waste with quick meals      │
├─────────────────────────────────────┤
│  💡 These meals prevent waste AND    │
│      provide nutrition               │
├─────────────────────────────────────┤
│  🔥 #1 Quick Protein Salad           │
│     [USE TODAY] badge                │
│     Chicken + greens expiring soon   │
│     ⏱️ 10 min | 👨‍🍳 No cooking      │
│     [See Recipe →]                   │
├─────────────────────────────────────┤
│  (More suggestions...)               │
└─────────────────────────────────────┘
```

### Recipe Detail View
```
┌─────────────────────────────────────┐
│  Quick Protein Salad                 │
│  ⏱️ 10 min | 👨‍🍳 No cooking         │
├─────────────────────────────────────┤
│  💡 Why This Meal:                   │
│  Use chicken + greens before expire  │
├─────────────────────────────────────┤
│  ⚠️ Food Safety:                     │
│  USE TODAY - protein expires soon    │
├─────────────────────────────────────┤
│  🥘 Using These Items:               │
│  ✓ Chicken (Use today)               │
│  ✓ Greens (2 days left)              │
│  ✓ Tomatoes (2 days left)            │
├─────────────────────────────────────┤
│  📝 Simple Steps:                    │
│  1. Chop chicken                     │
│  2. Wash and tear greens             │
│  3. Add chopped tomatoes             │
│  4. Drizzle with oil/lemon           │
│  5. Season with salt & pepper        │
├─────────────────────────────────────┤
│  🥗 Nutrition:                       │
│  High protein, vitamins, filling     │
├─────────────────────────────────────┤
│  ✨ Note:                             │
│  Restaurant-quality meal             │
├─────────────────────────────────────┤
│  🔄 Other Ways to Make This:         │
│  • Wrap in a tortilla                │
│  • Serve over rice                   │
│  • Turn into grain bowl              │
├─────────────────────────────────────┤
│  [✓ I'll Make This]  [Back]          │
└─────────────────────────────────────┘
```

## Safety Features

### Timing Warnings
- **Critical (<24h)**: 🔥 "USE TODAY" badge, red background
- **High (24-48h)**: 🟧 "USE SOON" badge, orange background  
- **Medium (48-72h)**: 🟨 Yellow background

### Safety Notes by Food Type
- **Prepared food <24h**: "⚠️ Use protein fillings today"
- **Prepared food (always)**: "🔥 HEAT THOROUGHLY - reach 165°F"
- **Greens <24h**: "🥬 Use greens today before they spoil"
- **Any protein <24h**: "🔥 COOK TONIGHT - expires within 24 hours"

### Temperature Guidance
- Reheating: "Make sure it's steaming hot (165°F if you can check)"
- Prepared meals: "HEAT THOROUGHLY - must reach 165°F"

## Dignity Features

### Language Choices
- ✅ "Restaurant-quality meal" / ❌ "Leftover dish"
- ✅ "Complete meal" / ❌ "Using scraps"
- ✅ "Simple cooking" / ❌ "Emergency recipe"
- ✅ "Fresh salad" / ❌ "Wilting greens"

### Dignity Notes
Each meal includes affirming context:
- "This is a complete, restaurant-quality meal"
- "Simple cooking that creates a proper hot meal"
- "Wholesome bowl meal - warm, satisfying, nutritious"
- "Fresh, crisp, restaurant-style salad"
- "Quick meal that feels normal and satisfying"
- "Bright, fresh, feel-good meal"
- "Full meal with minimal effort"

## Nutrition Focus

### Balanced Combinations
- Protein + Greens = Complete amino acids + vitamins
- Protein + Vegetables = Protein + fiber + micronutrients
- Vegetables + Grains = Fiber + complex carbs
- Fruit + Dairy = Natural sugars + calcium + probiotics

### Nutrition Messages
- "High protein, vitamins from greens, filling and nutritious"
- "Complete meal with protein and 3+ vegetables"
- "Fiber-rich, plant-based, very filling"
- "Vitamins, minerals, fiber - very healthy"
- "Natural sugars for energy, vitamins, easy to digest"

## Alternative Suggestions

### Recipe Flexibility
Each meal includes 3 alternatives:
- Equipment variations: "Grill/press it if you have a pan"
- Serving styles: "Serve over rice", "Turn into wrap"
- Additions: "Add hard-boiled eggs", "Mix in canned beans"
- Stretching: "Add to rice to stretch it", "Make into fried rice"

### Examples
```javascript
alternatives: [
  'Wrap in a tortilla if you have one',
  'Serve over rice or pasta',
  'Turn into a grain bowl'
]
```

## Tracking & Analytics

### localStorage Keys
- `meal_planned_{listingId}`: User clicked "I'll Make This"
  ```json
  {
    "meal": "Quick Protein Salad",
    "timestamp": "2026-01-22T15:30:00Z"
  }
  ```

### Future Analytics (Not Yet Implemented)
- Track which meals users actually make
- Learn preferred meal types
- Adjust suggestions based on cooking skill
- Track waste reduction (planned vs discarded)

## Integration Points

### App.js State
```javascript
const [showMealSuggestions, setShowMealSuggestions] = React.useState(false);
```

### Global Function
```javascript
window.openMealSuggestions = () => {
  setShowMealSuggestions(true);
};
```

### Props Required
```javascript
<SmartMealSuggestions
  user={user}
  claimedListings={listings.filter(l => 
    l.status === 'claimed' && 
    l.claimed_by === user.id
  )}
  onClose={() => setShowMealSuggestions(false)}
/>
```

### Header Menu Item
```javascript
{user?.role === 'recipient' && (
  <button onClick={() => window.openMealSuggestions?.()}>
    👨‍🍳 Meal Suggestions
  </button>
)}
```

## Edge Cases Handled

### No Expiring Items
Shows: "Nothing Expiring Soon! Your claimed items are still fresh."

### Only One Category
Still generates suggestions with what's available

### Prepared Food
Special handling:
- Always includes reheating temperature (165°F)
- Critical urgency if <24h
- Extra safety warnings

### Bakery Items
Special storage notes:
- "Don't refrigerate bread" warnings
- Counter storage recommendations
- Toasting suggestions

## Performance Optimizations

### Lazy Loading
- 500ms delay before generating suggestions (loading state)
- Only analyzes claimed items (not all listings)

### Efficient Filtering
- Single pass through listings
- Early return if no expiring items
- Top 5 limit prevents overwhelming UI

### Memory Management
- Uses React.useCallback for memoization
- Cleans up on unmount
- No backend calls (fully client-side)

## Testing

### Test Page: `test_meal_suggestions.html`
- 8 mock claimed items with various expiration dates
- Shows expected AI suggestions
- Full interactive demo

### Test Scenarios
1. **Critical urgency**: Prepared food <24h
2. **High urgency**: Protein + greens <48h
3. **Multiple combinations**: 8 items → 5+ unique meals
4. **No cooking options**: Salads, sandwiches
5. **Quick cooking**: Stir-fries, bowls (15-20 min)

## Future Enhancements

### Phase 2: Learning
- Track which meals users actually make
- Adjust cook time estimates based on skill level
- Learn dietary restrictions and preferences

### Phase 3: Community
- Share successful meal combinations
- User ratings and photos
- Cultural recipe variations

### Phase 4: Advanced AI
- Suggest substitutions for missing ingredients
- Generate custom recipes based on exact items
- Video tutorial integration
- Voice-guided cooking steps

## Impact Metrics (Expected)

### Waste Reduction
- **Before**: ~30% of claimed food wasted
- **Target**: <10% waste with meal suggestions
- **Method**: Combines items before expiration

### User Satisfaction
- **Dignity**: Meals feel "normal" and satisfying
- **Simplicity**: 5-20 min = accessible to all skill levels
- **Nutrition**: Balanced meals vs eating items separately

### Safety Improvement
- Clear expiration warnings
- Temperature guidelines
- Food pairing best practices

## Technical Stack
- **Frontend**: React 18, TailwindCSS
- **Storage**: localStorage (no backend required)
- **Algorithm**: Pure JavaScript, 7 meal pattern matchers
- **Performance**: Client-side, <500ms generation time

## File Location
`/home/ec2-user/project/components/SmartMealSuggestions.js`

## Related Components
- `SmartStorageCoach.js` - Provides food safety knowledge
- `SpoilageRiskAlerts.js` - Monitors food over time
- `SmartNotifications.js` - Can notify about meal opportunities
- `DietaryPreferences.js` - Could filter meal suggestions

---

**Last Updated**: January 22, 2026  
**Component Status**: ✅ Implemented and integrated  
**Test Status**: ✅ Test page created  
**Documentation Status**: ✅ Complete
