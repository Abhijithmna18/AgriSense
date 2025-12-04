# Admin Mode - Editable Homepage

## Enabling Admin Mode

To enable admin editing capabilities on the homepage, use one of these methods:

### Method 1: localStorage Flag (Quick Test)
Open your browser console and run:
```javascript
localStorage.setItem('farmer_ai_isAdmin', 'true');
```
Then refresh the page. You'll see a floating pencil button in the bottom-right corner.

### Method 2: JWT Token with Admin Role
Login with an admin account. The system will automatically detect the `role: 'admin'` in your JWT token.

## Using the Admin Editor

1. **Open Editor**: Click the floating pencil FAB (bottom-right)
2. **Edit Content**: Use the tabs to edit different sections:
   - **Hero**: Title, subtitle, CTAs, background gradient
   - **Crops**: Edit featured crops (name, description, price)
   - **Marketplace**: Edit marketplace items
   - **Advisories**: Edit and reorder advisories (use up/down arrows)
   - **Theme**: Change primary and accent colors

3. **Preview**: Click "Preview" to see changes without saving
4. **Save**: Click "Save Changes" to persist to localStorage (and backend if available)
5. **Reset**: Click "Reset to Defaults" to restore original content

## Features

- ✅ **Live Preview**: See changes before saving
- ✅ **Auto-sync**: Attempts to sync to `/api/admin/mock-data` if backend available
- ✅ **Local Fallback**: Works offline with localStorage
- ✅ **Version Control**: Tracks last updated timestamp
- ✅ **Reorder Advisories**: Use up/down buttons to change order
- ✅ **Theme Customization**: Live color changes

## Data Storage

Mock data is stored in `localStorage` under key `farmer_ai_mock_home` with this structure:
```json
{
  "version": 1,
  "updatedAt": "2025-12-03T10:30:00.000Z",
  "data": {
    "hero": { ... },
    "featuredCrops": [ ... ],
    "marketplaceTop": [ ... ],
    "advisories": [ ... ],
    "theme": { ... }
  }
}
```

## Disabling Admin Mode

```javascript
localStorage.removeItem('farmer_ai_isAdmin');
```
Then refresh the page.

## Backend Sync (Optional)

If your backend implements `POST /api/admin/mock-data`, the editor will automatically sync saved data to the server. If the endpoint is unavailable, data remains local-only.

Expected backend endpoint:
```
POST /api/admin/mock-data
Authorization: Bearer <admin-token>
Body: { version, updatedAt, data }
```

## Troubleshooting

**Q: Pencil button not showing?**  
A: Check console for `localStorage.getItem('farmer_ai_isAdmin')`. Should return `'true'`.

**Q: Changes not saving?**  
A: Check browser console for errors. Verify localStorage is enabled.

**Q: Want to export/import data?**  
A: Open console and run:
```javascript
// Export
const data = JSON.parse(localStorage.getItem('farmer_ai_mock_home'));
console.log(JSON.stringify(data, null, 2));

// Import
const newData = { /* paste your data */ };
localStorage.setItem('farmer_ai_mock_home', JSON.stringify(newData));
location.reload();
```
