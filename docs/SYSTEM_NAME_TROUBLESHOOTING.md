# 🏷️ System Name/Brand Name Troubleshooting Guide

This guide helps you troubleshoot issues with the system name (brand name) not appearing in the admin settings.

## 🔍 Common Issues & Solutions

### Issue 1: System Name Field Not Visible in Settings

**Symptoms:**
- Admin Settings → General → System Branding section exists
- Logo upload works fine
- But no input field for system name/brand name
- Settings page loads but branding settings are empty

**Root Cause:**
The system name setting doesn't exist in the database in the correct format.

**Solutions:**

#### Solution A: Automatic Fix (Recommended)
The system now automatically creates the system name setting during deployment:

1. **Deploy your latest changes** - the build process will automatically:
   - Create the system name setting in the `branding` category
   - Set default value to "MOPGOM Global Youth Registration"
   - Make it editable in the admin panel

2. **Verify after deployment:**
   - Go to Admin → Settings → General
   - Look for "System Branding" section
   - You should see "System Name" input field

#### Solution B: Manual Database Fix
If the automatic fix doesn't work, you can manually add the setting:

```sql
-- Add system name setting to branding category
INSERT INTO settings (category, key, name, value, type, description, "createdAt", "updatedAt")
VALUES (
  'branding',
  'systemName',
  'System Name',
  '"MOPGOM Global Youth Registration"',
  'text',
  'System name displayed throughout the application',
  NOW(),
  NOW()
) ON CONFLICT (category, key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type;
```

### Issue 2: System Name Setting Exists But Not Displaying

**Symptoms:**
- Database has the setting
- API returns the setting
- But UI doesn't show the input field

**Debug Steps:**

1. **Check Browser Console:**
   ```javascript
   // Open browser console and run:
   fetch('/api/admin/settings')
     .then(r => r.json())
     .then(data => console.log('Settings:', data))
   ```

2. **Look for branding settings:**
   ```javascript
   // Should show branding category with systemName
   console.log('Branding settings:', data.settings.branding)
   ```

3. **Check if setting has correct structure:**
   ```javascript
   // Each setting should have: key, name, value, type, description
   data.settings.branding.forEach(s => console.log(s))
   ```

**Solutions:**

1. **Refresh Settings Cache:**
   - Hard refresh the page (Ctrl+F5)
   - Clear browser cache
   - Try in incognito mode

2. **Check Setting Format:**
   The setting must have this exact structure:
   ```json
   {
     "category": "branding",
     "key": "systemName",
     "name": "System Name",
     "value": "\"Your System Name\"",
     "type": "text",
     "description": "System name displayed throughout the application"
   }
   ```

### Issue 3: Can Edit System Name But Changes Don't Persist

**Symptoms:**
- System name input field appears
- Can type in new name
- Save button works
- But name reverts to old value

**Solutions:**

1. **Check API Response:**
   - Open Network tab in browser
   - Save a new system name
   - Look for POST request to `/api/admin/settings`
   - Check if response is successful

2. **Verify Database Update:**
   ```sql
   -- Check current value in database
   SELECT * FROM settings WHERE category = 'branding' AND key = 'systemName';
   ```

3. **Clear Cache:**
   - The system uses localStorage caching
   - Clear browser storage: F12 → Application → Local Storage → Clear All

## 🛠️ Manual Setup Instructions

If automatic setup fails, follow these steps:

### Step 1: Add System Name Setting

Run this in your database:

```sql
INSERT INTO settings (category, key, name, value, type, description, "createdAt", "updatedAt")
VALUES (
  'branding',
  'systemName',
  'System Name',
  '"MOPGOM Global Youth Registration"',
  'text',
  'System name displayed throughout the application',
  NOW(),
  NOW()
) ON CONFLICT (category, key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type;

INSERT INTO settings (category, key, name, value, type, description, "createdAt", "updatedAt")
VALUES (
  'branding',
  'systemDescription',
  'System Description',
  '"Youth registration and management platform"',
  'text',
  'Brief description of the system',
  NOW(),
  NOW()
) ON CONFLICT (category, key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type;
```

### Step 2: Verify Settings

```sql
-- Check all branding settings
SELECT category, key, name, value, type FROM settings WHERE category = 'branding';
```

Should return:
```
category | key               | name               | value                                    | type
---------|-------------------|--------------------|-----------------------------------------|------
branding | systemName        | System Name        | "MOPGOM Global Youth Registration"      | text
branding | systemDescription | System Description | "Youth registration and management..."  | text
branding | logoUrl           | System Logo URL    | "/uploads/branding/logo-123456.png"    | text
```

### Step 3: Clear Cache and Test

1. Clear browser cache
2. Restart application (if local)
3. Go to Admin → Settings → General
4. Look for System Branding section
5. You should see input fields for System Name and System Description

## 🔄 Quick Reset

To completely reset system name settings:

```sql
-- Remove existing branding settings
DELETE FROM settings WHERE category = 'branding' AND key IN ('systemName', 'systemDescription');

-- Add fresh settings
INSERT INTO settings (category, key, name, value, type, description, "createdAt", "updatedAt")
VALUES 
  ('branding', 'systemName', 'System Name', '"MOPGOM Global Youth Registration"', 'text', 'System name displayed throughout the application', NOW(), NOW()),
  ('branding', 'systemDescription', 'System Description', '"Youth registration and management platform"', 'text', 'Brief description of the system', NOW(), NOW());
```

## 📞 Getting Help

If the system name still doesn't appear:

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed API requests
3. **Verify database** has the correct settings
4. **Try different browser** to rule out caching issues
5. **Check user permissions** - only Super Admin and Admin can edit settings

---

**Note:** The latest deployment includes automatic system name setup, so this issue should be resolved after your next deployment.
