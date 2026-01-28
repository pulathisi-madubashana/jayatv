# Image Modal Implementation - Event Banner

## Overview
Implemented a reusable full-screen image modal/popup functionality for the Event Banner section. When users click on the event image, it opens a centered, responsive modal with smooth animations.

## Features Implemented

### 1. **Modal Open/Close Functionality**
   - Click image → Opens fullscreen modal
   - Multiple ways to close:
     - ✕ Close button (top corner)
     - Click outside (background)
     - ESC key press
     - All properly handled with event listeners

### 2. **Visual Design**
   - **Background**: Dark overlay (85% opacity) with 4px blur effect
   - **Image Container**: Centered, responsive sizing (max 90vw × 90vh)
   - **Close Button**: Positioned top-right with hover effects
   - **Overlay**: Smooth fade-in animation (0.3s)
   - **Container**: Scale-up animation (0.3s) for modern feel

### 3. **User Experience**
   - **Smooth Animations**:
     - Fade in for overlay
     - Scale up (0.9 → 1) for container
     - Hover effects on button with rotation
   - **Mobile Responsive**: Adjusted button size and positioning for mobile
   - **Accessibility**: Proper ARIA labels and keyboard support
   - **Body Scroll**: Disabled when modal opens, re-enabled when closed

### 4. **Image Click Interaction**
   - Button wrapper around image
   - Hover state shows "View fullscreen" tooltip
   - Image scales up slightly on hover (1 → 1.05)
   - Border brightens on hover
   - Active state with scale-down effect

## Files Created

### 1. `src/components/ui/ImageModal.tsx`
Core modal component with:
- Keyboard event handling (ESC key)
- Overlay click detection
- Body scroll management
- Event cleanup

### 2. `src/components/ui/ImageModal.css`
Comprehensive styling with:
- Fixed positioning overlay
- Centered container with flex layout
- Smooth animations (fade & scale)
- Mobile & desktop responsive breakpoints
- Hover and active states

## Files Modified

### `src/components/home/SpecialEventBanner.tsx`
- Added `ImageModal` component import
- Added state for `selectedImageUrl` and `selectedImageAlt`
- Added event handlers: `handleImageClick()`, `handleCloseModal()`
- Converted image div to clickable button with hover effects
- Added modal component to both single and carousel views
- Added tooltip text with language support (සිංහල/English)

## How It Works

### 1. **Image Click Flow**
```
User clicks image → handleImageClick()
  ↓
Sets selectedImageUrl & selectedImageAlt states
  ↓
ImageModal isOpen = true
  ↓
Modal renders with fade-in animation
  ↓
Body scroll disabled
```

### 2. **Modal Close Flow**
```
User closes (button/ESC/background click) → handleCloseModal()
  ↓
Clears selectedImageUrl & selectedImageAlt states
  ↓
ImageModal isOpen = false
  ↓
Modal unmounts, body scroll re-enabled
```

### 3. **Event Listeners**
- **ESC Key**: Handled in ImageModal useEffect
- **Overlay Click**: Handled with event.target comparison
- **Body Scroll**: Set/unset in useEffect cleanup

## Responsive Design

### Mobile (< 640px)
- Close button: 36px × 36px, positioned top-right (8px)
- Icon size: 20px
- Overlay padding: 12px

### Tablet/Desktop (≥ 1024px)
- Close button: 44px × 44px, positioned above image (-50px)
- Icon size: 24px (default)
- Modal max-size: 85vw × 85vh

## Browser Compatibility
- Modern browsers with CSS Grid, Flexbox, and backdrop-filter support
- Fallback styling for browsers without backdrop-filter
- Smooth transitions on all interactive elements

## Animation Details

### Fade In Animation
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
Duration: 0.3s, Timing: ease-in-out
```

### Scale In Animation
```css
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
Duration: 0.3s, Timing: ease-in-out
```

### Button Hover Effect
- Background opacity change
- Rotation animation (90deg)
- Smooth transition (0.2s)

## Accessibility Features
- ✓ Proper ARIA labels
- ✓ Semantic HTML (button element)
- ✓ Keyboard navigation (ESC key)
- ✓ Focus management
- ✓ Screen reader friendly

## Language Support
- ✓ Sinhala (සිංහල) - "පුරා පරිමාණයෙන් බලන්න"
- ✓ English - "View fullscreen"
- Uses existing language context from application

## Notes
- Modal is reusable and can be used in other components
- Z-index 999 ensures overlay appears above all content
- Event delegation prevents closing when clicking on image inside modal
- No external dependencies beyond lucide-react (X icon)
