# Apercu Pro Fonts

This directory contains the Apercu Pro font files used by the application.

## Required Font Files

The application expects these font files in this directory:
- `ApercuPro-Regular.woff` (400 weight)
- `ApercuPro-Medium.woff` (500 weight)
- `ApercuPro-Bold.woff` (700 weight)

## How to Upload Fonts

### Method 1: Direct File Upload (Local Development)
1. Copy your Apercu Pro font files to this directory: `public/fonts/`
2. Ensure the files are named exactly as listed above
3. Restart your development server

### Method 2: Via Git (Recommended for Production)
1. Add the font files to this directory
2. Commit and push to your repository:
   ```bash
   git add public/fonts/
   git commit -m "Add Apercu Pro fonts"
   git push
   ```

### Method 3: Via File Manager (if using hosting platform)
1. Access your hosting platform's file manager
2. Navigate to `public/fonts/`
3. Upload the three required font files

## Current Font Stack

The application uses this font stack with Apercu Pro as primary:
```css
font-family: 'Apercu Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

This provides:
- **Primary**: Apercu Pro (when font files are available)
- **macOS Fallback**: -apple-system (San Francisco)
- **Windows Fallback**: Segoe UI
- **Android Fallback**: Roboto
- **Universal Fallback**: Helvetica Neue, Arial, sans-serif

## Font Loading Behavior

- If Apercu Pro files are present: Uses Apercu Pro
- If Apercu Pro files are missing: Gracefully falls back to system fonts
- No broken layouts or loading issues

## Font Weights

- **Regular**: 400
- **Medium**: 500
- **Bold**: 700

## Performance Notes

- Apercu Pro fonts use `font-display: swap` for optimal loading
- System fonts provide instant fallback if custom fonts fail to load
- No layout shifts thanks to similar metrics between Apercu Pro and system fonts
- Fonts are cached by the browser after first load

## Troubleshooting

**Fonts not loading?**
1. Check that font files are in the correct location: `public/fonts/`
2. Verify file names match exactly (case-sensitive)
3. Check browser developer tools Network tab for 404 errors
4. Clear browser cache and reload

**Still seeing system fonts?**
- This is normal behavior when Apercu Pro files are missing
- The application gracefully falls back to system fonts
- Upload the font files to see Apercu Pro
