# Portfolio Deployment Guide for GoDaddy

## Overview
This guide will help you deploy your Framer-generated portfolio website to your GoDaddy domain.

## Prerequisites
- GoDaddy domain purchased and active
- GoDaddy hosting account (cPanel or similar)
- FTP client (FileZilla, WinSCP, or GoDaddy's File Manager)

## Step-by-Step Deployment Instructions

### 1. Access Your GoDaddy Hosting
1. Log into your GoDaddy account
2. Go to "My Products" → "Web Hosting"
3. Click "Manage" next to your hosting plan

**Note:** GoDaddy has different hosting interfaces depending on your plan:
- **Traditional Hosting**: Look for "cPanel Admin" or "File Manager"
- **Managed WordPress**: Uses a custom dashboard (not cPanel)
- **Newer Plans**: May use GoDaddy's updated interface

If you don't see cPanel, look for:
- "File Manager" 
- "Website Builder"
- "Files" section
- Or contact GoDaddy support to confirm your hosting type

### 2. Prepare Your Files
Your portfolio is already properly structured with:
- `page.html` files in each directory
- Proper folder structure for routing
- `.htaccess` file for URL rewriting

### 3. Upload Files to GoDaddy

**Option A: Using GoDaddy File Manager (Most Common)**
1. In your hosting dashboard, look for "File Manager" or "Files"
2. Navigate to the `public_html` folder (this is your website's root directory)
3. Upload all files from your PortfolioFramer folder
4. Make sure to upload the `.htaccess` file

**Option B: Using FTP Client**
1. Get FTP credentials from your hosting dashboard
2. Connect using FileZilla, WinSCP, or similar FTP client
3. Upload all files to the `public_html` directory
4. Ensure `.htaccess` is uploaded

**Option C: If you have cPanel**
1. Click "File Manager" in cPanel
2. Navigate to `public_html` folder
3. Upload all files from your PortfolioFramer folder
4. Make sure to upload the `.htaccess` file

### 4. File Structure on Server
Your files should be organized like this in `public_html`:
```
public_html/
├── .htaccess
├── page.html (homepage)
├── 404/
│   └── page.html
├── about/
│   └── page.html
├── articles/
│   ├── page.html
│   └── [article-folders]/
│       └── page.html
├── contact/
│   └── page.html
└── works/
    ├── page.html
    └── [work-folders]/
        └── page.html
```

### 5. Domain Configuration
1. In GoDaddy, go to "My Products" → "Domains"
2. Click "Manage" next to your domain
3. Set nameservers to point to your hosting:
   - ns1.secureserver.net
   - ns2.secureserver.net
4. Or use GoDaddy's DNS management to point A record to your hosting IP

### 6. SSL Certificate (Recommended)
1. In your hosting dashboard, look for "SSL/TLS", "Security", or "Let's Encrypt"
2. Enable SSL for your domain
3. This will give you HTTPS security
4. If you can't find SSL settings, contact GoDaddy support

### 7. Test Your Website
1. Visit your domain in a browser
2. Test all navigation links
3. Check that URLs work without `.html` extensions
4. Verify 404 page works

## URL Structure
With the `.htaccess` file, your URLs will work as:
- `yourdomain.com` → homepage
- `yourdomain.com/about` → about page
- `yourdomain.com/articles` → articles listing
- `yourdomain.com/articles/article-name` → specific article
- `yourdomain.com/works` → works listing
- `yourdomain.com/works/project-name` → specific project

## Troubleshooting

### Common Issues:
1. **404 errors**: Check that `.htaccess` file is uploaded
2. **Images not loading**: Verify all assets are uploaded
3. **Slow loading**: Enable compression in `.htaccess`
4. **Mixed content warnings**: Ensure SSL is properly configured

### GoDaddy-Specific Notes:
- **No cPanel?** Many newer GoDaddy plans use their own interface instead of cPanel
- Look for "File Manager", "Files", or "Website Builder" in your hosting dashboard
- If you have issues with `.htaccess`, contact GoDaddy support
- Make sure your hosting plan supports URL rewriting
- **Managed WordPress plans** don't support custom HTML files - you'd need traditional hosting

## Performance Optimization
The included `.htaccess` file provides:
- GZIP compression for faster loading
- Browser caching for static assets
- Security headers
- Proper MIME types

## Support
If you encounter issues:
1. Check GoDaddy's hosting documentation
2. Contact GoDaddy support
3. Verify file permissions (should be 644 for files, 755 for folders)

## Next Steps After Deployment
1. Set up Google Analytics (if desired)
2. Submit sitemap to Google Search Console
3. Test on mobile devices
4. Set up email forwarding if needed
