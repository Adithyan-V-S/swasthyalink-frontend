# Images Directory

This directory contains all images and icons used in the Swasthyalink healthcare application.

## Structure

```
images/
├── hero-healthcare.jpg     # Main hero image for home page
├── security-icon.svg       # Security feature icon
├── family-icon.svg         # Family access feature icon
├── qr-icon.svg            # QR code feature icon
├── logo.svg               # Application logo
├── placeholder.jpg        # Default placeholder image
├── dashboard-bg.jpg       # Dashboard background
├── doctor-avatar.jpg      # Doctor profile avatar
├── patient-avatar.jpg     # Patient profile avatar
├── family-avatar.jpg      # Family member avatar
├── waves-bg.svg          # Background pattern
└── pattern-bg.svg        # UI pattern background
```

## Usage Guidelines

### 1. Image Component
Always use the `Image` component from `components/common/Image.jsx` for better:
- Error handling
- Loading states
- Fallback images
- Performance optimization

```jsx
import Image from '../components/common/Image';
import { EXTERNAL_IMAGES } from '../constants/images';

<Image
  src={EXTERNAL_IMAGES.HERO_HEALTHCARE}
  alt="Healthcare professionals"
  className="w-full h-64 object-cover rounded-lg"
  fallbackSrc="/placeholder.jpg"
/>
```

### 2. Image Constants
Use the constants from `constants/images.js` for consistent image paths:

```jsx
import { IMAGES, EXTERNAL_IMAGES } from '../constants/images';

// For local images
<Image src={IMAGES.HERO_HEALTHCARE} />

// For external images (development)
<Image src={EXTERNAL_IMAGES.HERO_HEALTHCARE} />
```

### 3. Image Optimization

#### Recommended Formats:
- **Photos**: WebP (primary), JPEG (fallback)
- **Icons**: SVG (scalable, lightweight)
- **Logos**: SVG or PNG with transparency

#### Size Guidelines:
- **Hero Images**: 800x600px or larger
- **Avatars**: 200x200px
- **Thumbnails**: 150x150px
- **Icons**: 24x24px (SVG)

#### Quality Settings:
- **Hero Images**: 85% quality
- **Avatars**: 80% quality
- **Thumbnails**: 75% quality

### 4. Alt Text Guidelines

Always provide meaningful alt text:
- Describe the image content
- Include context when relevant
- Keep it concise but descriptive

```jsx
// Good
alt="Healthcare professionals collaborating with digital technology"

// Avoid
alt="image"
alt=""
```

### 5. Loading Strategy

- **Above the fold**: Use `loading="eager"`
- **Below the fold**: Use `loading="lazy"` (default)
- **Critical images**: Preload with `<link rel="preload">`

### 6. Responsive Images

Use Tailwind classes for responsive images:

```jsx
<Image
  src={EXTERNAL_IMAGES.HERO_HEALTHCARE}
  alt="Healthcare professionals"
  className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-lg"
/>
```

## External Image Sources

For development and testing, we use Unsplash images:
- High quality, free to use
- Optimized for web
- Professional healthcare themes

## Adding New Images

1. Add the image file to this directory
2. Update `constants/images.js` with the new path
3. Use the `Image` component in your component
4. Add appropriate alt text
5. Test loading and error states

## Performance Tips

1. **Optimize images** before adding to the project
2. **Use WebP format** when possible
3. **Implement lazy loading** for below-the-fold images
4. **Provide fallback images** for better UX
5. **Use appropriate sizes** for different screen sizes 