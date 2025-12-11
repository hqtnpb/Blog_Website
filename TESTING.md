# Testing Guide - Hotel Search & Filtering

## 🚀 Quick Start

### 1. Seed Database with Test Data

```bash
cd backend
node src/scripts/seedHotels.js
```

This will create 5 sample hotels in Barcelona and Madrid with rooms.

### 2. Start Backend Server

```bash
cd backend
npm start
```

Server should run on http://localhost:8000

### 3. Start Frontend

```bash
cd frontend
npm start
```

Frontend should run on http://localhost:3000

## 🧪 Testing Features

### A. Hotel Page (`/hotel`)

1. **Search Functionality**

   - Enter a location (e.g., "Barcelona", "Madrid")
   - Click Search button
   - Should navigate to `/search-results?q=Barcelona`

2. **Featured Hotels Display**
   - Should automatically load top-rated hotels on page load
   - Display 4 hotel cards with images, ratings, prices

### B. Search Results Page (`/search-results`)

1. **Basic Search**

   - Navigate to `/search-results?q=Barcelona`
   - Should display all hotels in Barcelona
   - Shows hotel cards with full details

2. **Filtering**

   **Price Range Filter:**

   - Drag price slider from $200-$1500
   - Hotels should filter based on minimum room price

   **Property Classification (Stars):**

   - Select 5-star or 4-star checkboxes
   - Should filter hotels by rating

   **Room Details:**

   - Adjust bedrooms, beds, bathrooms counters
   - Note: Basic filter (not fully integrated with backend yet)

   **Amenities:**

   - Select amenities like Wi-Fi, Breakfast, Spa
   - Filter rooms with selected amenities

   **Clear Filters:**

   - Click "Clear" button
   - All filters reset to default
   - Results refresh

3. **Sorting**

   - **Recommended**: Default sort by rating
   - **Price Low to High**: Cheapest rooms first
   - **Price High to Low**: Most expensive first
   - **Rating High to Low**: Best rated hotels first

4. **Pagination**
   - Shows 10 results per page
   - Navigate through pages at bottom
   - Page resets to 1 when filters change

## 📡 API Endpoints

### GET `/api/search-hotels`

**Parameters:**

```
query: string (search term)
page: number (default: 1)
limit: number (default: 10)
sort: string (recommended|price-low|price-high|rating-high)
filters: JSON string
```

**Example:**

```
GET /api/search-hotels?query=Barcelona&page=1&limit=10&sort=price-low&filters={"minPrice":200,"maxPrice":500,"propertyClass":["5-star"]}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Grand Palace Hotel",
      "city": "Barcelona",
      "country": "Spain",
      "rating": 5,
      "images": ["url1", "url2"],
      "minRoomPrice": 250,
      "roomCount": 3,
      "rooms": [...]
    }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 2
}
```

## 🐛 Known Issues & Limitations

1. **Filter Integration**: Some filters (bedrooms, distance, room size) are UI-only and need backend support
2. **Images**: Using Unsplash placeholder images
3. **Reviews**: Review counts show room count instead of actual reviews
4. **Distance**: Distance from center not calculated

## 🔍 What to Test

### ✅ Working Features

- [x] Hotel search by city name
- [x] Price range filtering
- [x] Star rating filtering
- [x] Sort by price (low/high)
- [x] Sort by rating
- [x] Pagination
- [x] Filter panel expand/collapse
- [x] Clear all filters
- [x] Product card displays hotel data
- [x] Navigation from hotel page to search results

### ⚠️ Partially Working

- [ ] Amenities filtering (frontend ready, needs backend)
- [ ] Room specifications (bedrooms, beds, bathrooms)
- [ ] Distance from center
- [ ] Booking options filters

### 🔧 To Be Implemented

- [ ] User authentication integration
- [ ] Favorite/wishlist functionality
- [ ] Advanced room availability checking
- [ ] Date range filtering
- [ ] Guest number filtering

## 📝 Test Scenarios

### Scenario 1: Basic Search Flow

1. Go to `/hotel`
2. Enter "Barcelona" in search
3. Click Search
4. Verify navigation to search results
5. Verify hotels from Barcelona displayed

### Scenario 2: Price Filtering

1. Go to `/search-results?q=Barcelona`
2. Adjust price slider to $200-$300
3. Verify only hotels with rooms in that range show
4. Change sort to "Price Low to High"
5. Verify sorting works

### Scenario 3: Star Rating Filter

1. Search for any city
2. Check "5-star" checkbox
3. Verify only 5-star hotels show
4. Add "4-star" checkbox
5. Verify both 4 and 5-star hotels show

### Scenario 4: Clear and Reset

1. Apply multiple filters (price, stars, amenities)
2. Click "Clear" button
3. Verify all filters reset
4. Verify results refresh

## 🎨 UI Components Status

- ✅ FilterPanel: Fully styled and functional
- ✅ ProductCard: Displays API data correctly
- ✅ SortBy: All options working
- ✅ Pagination: Working with API
- ✅ Loading states: Implemented
- ✅ Error states: Implemented
- ✅ Empty states: Implemented

## 🚦 Expected Behavior

**When filters change:**

- Page resets to 1
- API call made with new filters
- Loading spinner shows
- Results update
- URL parameters may update (optional)

**When sorting changes:**

- Page resets to 1
- Results re-ordered
- No new API call needed for some sorts

**When pagination changes:**

- New API call for that page
- Scroll to top (optional)
- Results for that page displayed
