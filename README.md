# Brandon Harwood's Personal Site

A personal, playful, and experimental blog and portfolio site built with Eleventy, TailwindCSS, and Netlify CMS. This repository can serve as a template for creating your own personal site with similar features.

## 🚀 Features

- Static site generation with [Eleventy](https://www.11ty.dev/)
- CSS with [TailwindCSS](https://tailwindcss.com/)
- Content Management System using [Netlify CMS](https://www.netlifycms.org/)
- Responsive design
- Blog with RSS feed
- Portfolio/Made Things section
- Collections feature
- Contact form
- Automatic image optimization
- Markdown support with extended features (footnotes, attributes)

## 🛠️ Tech Stack

- **Static Site Generator**: Eleventy (11ty)
- **CSS Framework**: TailwindCSS
- **CMS**: Netlify CMS
- **Hosting**: Netlify
- **Node Version**: >=18.0.0

## 📦 Installation & Setup

### Using as a Template

1. Create a new repository using this as a template:
   - Click the "Use this template" button at the top of this repository
   - Or clone and remove existing content:
```bash
git clone https://github.com/yourusername/brandonharwood-site.git my-site
cd my-site
```

2. Clean up existing content (if cloning):
```bash
# Remove existing content but keep the structure
rm -rf src/content/weblogs/*
rm -rf src/content/made-things/*
rm -rf src/content/collections/*
```

3. Install dependencies:
```bash
npm install
```

4. Configure your site:
   - Update `package.json` with your site's details
   - Modify `admin/config.yml` to configure Netlify CMS collections
   - Update site metadata in `.eleventy.js`
   - Create your `.env` file based on `.env.example` (Never commit your actual .env file!)

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Required environment variables
GITHUB_TOKEN=your_github_token
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=your_repo_name
```

⚠️ Security Note: Never commit your `.env` file or any sensitive tokens to the repository. The `.gitignore` file is configured to prevent this.

5. Add your content:
   - Add blog posts in `src/content/weblogs/`
   - Add portfolio items in `src/content/made-things/`
   - Add collections in `src/content/collections/`
   - Customize templates in `src/layouts/`

### Directory Structure

```
src/
├── content/           # Your content files (markdown)
│   ├── weblogs/      # Blog posts
│   ├── made-things/  # Portfolio items
│   └── collections/  # Collections
├── layouts/          # Page templates
├── styles/          # CSS files
└── static/          # Static assets
```

## 📄 Development

Start the development server:
```bash
npm start
```

Build the CSS:
```bash
npm run build:css
```

Build the site:
```bash
npm run build
```

## 📝 Content Management

The site uses Netlify CMS for content management. To access the CMS:

1. Navigate to `/admin` on your deployed site
2. Log in using Netlify Identity

Content types include:
- Blog posts
- Made Things (Portfolio items)
- Collections
- Experiments

## 🚀 Deployment

The site is configured for deployment on Netlify. To deploy:

```bash
npm run deploy
```

## 📄 License

This project is licensed under the MIT License, which means you can:
- ✅ Use it commercially
- ✅ Modify it
- ✅ Distribute it
- ✅ Use it privately
- ✅ Create derivative works

The only requirement is that you include the original copyright notice and license terms. See the LICENSE file for details.

## 👤 Author

**Brandon Harwood**

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 