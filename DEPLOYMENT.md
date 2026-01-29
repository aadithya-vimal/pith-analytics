# Deployment Guide

## Production Readiness Summary

This application has been optimized for production deployment with the following enhancements:

### ✅ Implemented Features

1. **Error Handling**
   - React Error Boundary component catches and handles runtime errors
   - User-friendly error UI with recovery options
   - Comprehensive error logging

2. **Production Logging**
   - Environment-aware logging system
   - Silent in production, verbose in development
   - Structured error tracking with context

3. **Performance Optimizations**
   - Code splitting with React.lazy
   - Suspense boundaries for loading states
   - Lazy-loaded route components

4. **Code Quality**
   - Replaced all `console.log` statements with production logger
   - TypeScript type safety improvements
   - Centralized configuration (env.ts, constants.ts)

---

## Build Process

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Building for Production

```bash
# Install dependencies
npm install

# Run production build
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory.

---

## Server Requirements

### Critical: COOP/COEP Headers

This application requires specific HTTP headers to enable `SharedArrayBuffer` for WebAssembly performance:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### Configuration Examples

#### **Nginx**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
        
        # Required headers for WASM
        add_header Cross-Origin-Opener-Policy same-origin;
        add_header Cross-Origin-Embedder-Policy require-corp;
    }
}
```

#### **Apache (.htaccess)**

```apache
<IfModule mod_headers.c>
    Header set Cross-Origin-Opener-Policy "same-origin"
    Header set Cross-Origin-Embedder-Policy "require-corp"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

#### **Netlify (netlify.toml)**

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **Vercel (vercel.json)**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Environment Variables

Create a `.env.production` file (optional):

```bash
# Production mode (automatically set by Vite)
NODE_ENV=production

# Feature flags (optional)
VITE_ENABLE_AI=true
VITE_ENABLE_VISUALIZATION=true
```

---

## Performance Optimization

### Bundle Size

The application uses:
- **Code splitting**: Routes are lazy-loaded
- **Tree shaking**: Unused code is automatically removed
- **Compression**: Enable gzip/brotli on your server

### Recommended Server Settings

```nginx
# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/wasm;
gzip_min_length 1000;

# Enable caching for static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|wasm)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Browser Compatibility

### Minimum Requirements

- **WebAssembly support** (all modern browsers)
- **WebGPU support** (for AI features)
  - Chrome 113+
  - Edge 113+
  - Safari 18+ (experimental)

### Feature Detection

The app automatically detects WebGPU availability and shows appropriate messages if unavailable.

---

## Monitoring & Logging

### Production Logging

Logs are automatically filtered in production:
- Only `WARN` and `ERROR` levels are logged
- All logs include component context
- Errors include stack traces

### Recommended Monitoring

Consider integrating:
- **Sentry** for error tracking
- **Google Analytics** for usage analytics
- **LogRocket** for session replay

---

## Security Considerations

1. **Local-First Architecture**
   - All data processing happens in the browser
   - No data is sent to external servers
   - DuckDB and AI models run entirely client-side

2. **File Upload Security**
   - Maximum file size: 500MB (configurable in `constants.ts`)
   - Supported formats: CSV, JSON, Parquet only
   - Client-side validation before processing

3. **Content Security Policy**
   - Consider adding CSP headers for additional security
   - Allow `wasm-unsafe-eval` for WebAssembly

---

## Troubleshooting

### Build Errors

If you encounter TypeScript errors during build:

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### WASM Not Loading

**Symptom**: "SharedArrayBuffer is not defined"

**Solution**: Ensure COOP/COEP headers are correctly configured on your server.

### AI Model Not Loading

**Symptom**: "WebGPU not available"

**Solution**: 
- Use a WebGPU-compatible browser
- Ensure HTTPS is enabled (WebGPU requires secure context)
- Check browser flags if using experimental features

---

## Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test production build with `npm run preview`
- [ ] Configure COOP/COEP headers on server
- [ ] Enable gzip/brotli compression
- [ ] Set up caching for static assets
- [ ] Configure SPA fallback routing
- [ ] Test on target browsers
- [ ] Monitor error logs after deployment

---

## Support

For issues or questions:
- Check browser console for errors
- Verify COOP/COEP headers are set correctly
- Ensure WebGPU is available for AI features
- Review the application logs (development mode)

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-29
