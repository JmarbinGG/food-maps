# Rule for Eliminating Mock Data Errors

When building or updating the Food Maps application:

- Never reference `mockData.listings`, `mockData.users`, or any `mockData` properties directly
- Always use empty arrays `[]` as default fallbacks for data arrays
- Initialize all data structures with safe defaults to prevent undefined errors
- Use the Trickle Database API exclusively for data operations
- Add proper null safety checks: `data = data || []` and `Array.isArray(data) ? data : []`
- When components expect data props, always provide default parameters: `listings = []`
- Avoid complex mock data systems that can cause initialization race conditions
- Keep the application simple and focus on real database integration
- If mock data is needed for testing, use simple in-memory objects without external dependencies