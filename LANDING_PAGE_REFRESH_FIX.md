# Landing Page Refresh Fix - Company Posts Not Showing

## Problem
Company posts were not appearing on the home page (landing page) after being created.

## Root Cause
The public API endpoints were working correctly, but there were two issues:
1. **Authentication Interference**: The axios interceptor was adding auth tokens to public endpoints, which could cause issues
2. **No Auto-Refresh**: The landing page only fetched data once on mount, so new posts wouldn't appear without a full page reload

## Solution Applied

### 1. Direct Fetch API for Public Endpoints
**File**: `Frontend/src/services/publicService.js`

Changed all public API calls from using `apiService` (axios with auth interceptor) to using native `fetch()` API:

```javascript
// Before (using axios with auth interceptor)
const response = await apiService.get('/internships/public/', { 
  params: { ordering: '-created_at' } 
});

// After (using native fetch - no auth)
const response = await fetch('http://localhost:8000/api/internships/public/?ordering=-created_at', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
const data = await response.json();
```

**Benefits**:
- No authentication token sent to public endpoints
- Cleaner separation between authenticated and public requests
- Avoids potential CORS or auth-related issues

### 2. Auto-Refresh Mechanism
**File**: `Frontend/src/pages/public/LandingPage.jsx`

Added automatic refresh every 30 seconds:

```javascript
useEffect(() => {
  // Initial fetch
  fetchCompanies();
  fetchStats();
  
  // Set up auto-refresh every 30 seconds
  const refreshInterval = setInterval(() => {
    fetchCompanies();
    fetchStats();
  }, 30000); // 30 seconds
  
  // Cleanup interval on unmount
  return () => clearInterval(refreshInterval);
}, []);
```

### 3. Manual Refresh Button
Added a "Refresh" button in the Organizations section:

```javascript
<button 
  onClick={fetchCompanies} 
  className="btn-refresh"
  style={{
    marginTop: '10px',
    padding: '8px 16px',
    background: '#14a800',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }}
>
  {loading ? 'Loading...' : 'Refresh'}
</button>
```

### 4. Loading State
Added loading state to show feedback while fetching:

```javascript
const [loading, setLoading] = useState(true);

// In fetchCompanies
setLoading(true);
// ... fetch data ...
setLoading(false);

// In UI
{loading ? (
  <div>Loading partner organizations...</div>
) : companies.length > 0 ? (
  // Show companies
) : (
  // Show empty state
)}
```

## Files Modified

1. **Frontend/src/services/publicService.js**
   - Changed `getPublicInternships()` to use fetch API
   - Changed `getPublicCompanies()` to use fetch API
   - Changed `getPublicCompanyByName()` to use fetch API
   - Changed `getPublicStats()` to use fetch API

2. **Frontend/src/pages/public/LandingPage.jsx**
   - Added `loading` state
   - Added auto-refresh interval (30 seconds)
   - Added manual refresh button
   - Added loading indicator
   - Improved error handling

## How It Works Now

1. **On Page Load**: 
   - Fetches all open internships from `/api/internships/public/`
   - Groups them by company name
   - Displays up to 6 companies with most internships

2. **Auto-Refresh**: 
   - Every 30 seconds, automatically refetches data
   - Shows new posts without requiring page reload

3. **Manual Refresh**: 
   - Users can click "Refresh" button to immediately fetch latest data
   - Button shows "Loading..." while fetching

4. **No Authentication**: 
   - Public endpoints don't require login
   - Uses native fetch() to avoid auth token interference

## Testing

To verify the fix:

1. **Create a new internship post** as a company user
2. **Go to landing page** (http://localhost:5173/)
3. **Check Organizations section**:
   - Should show the company immediately (within 30 seconds)
   - Or click "Refresh" button to see it instantly

## Backend Endpoint

The backend endpoint is working correctly:

**Endpoint**: `GET /api/internships/public/`
- Returns all internships with `status='OPEN'` and `is_active=True`
- No authentication required (`@permission_classes([AllowAny])`)
- Includes company name, location, and all internship details

## Important Notes

1. **Company posts must have**:
   - `status = 'OPEN'` (not 'CLOSED' or 'FILLED')
   - `is_active = True`
   - Valid company profile with name

2. **Auto-refresh interval**: 30 seconds (can be adjusted if needed)

3. **Display limit**: Shows top 6 companies by number of internships

4. **Sorting**: Companies sorted by number of active internships (descending)

## Future Improvements

1. Add WebSocket support for real-time updates
2. Add pagination for companies (show more than 6)
3. Add filters (by location, industry, etc.)
4. Add search functionality
5. Cache data with proper invalidation strategy
