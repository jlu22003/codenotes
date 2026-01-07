# CodeNotes - A Personal Portfolio & Blog

This repository contains the source code for a personal portfolio and blog built with Next.js, Nextra, and Tailwind CSS. The project is designed with a documentation-first approach, prioritizing clarity, structure, and extensibility. It serves as both a showcase of my work and a live case study in building intentional, content-driven web applications.

## Screenshots
<!-- TODO: Add screenshots of your site -->
<!-- 
![Homepage Hero Section](./docs/images/hero.png)
![Projects Carousel](./docs/images/projects.png)
![Dark Mode](./docs/images/dark-mode.png)
-->

## Live Demo
<!-- TODO: Update with your live site URL -->
🔗 [View Live Site](https://www.justinklu.com/)

## Key Features

- **Content-Driven Architecture**: Powered by Nextra and MDX, allowing for easy creation and management of portfolio pages, project details, and blog posts.
- **Modern Frontend Stack**: Built with Next.js 15 (using Turbopack) and React 19 for optimal performance and an excellent developer experience.
- **Advanced UI & Styling**: Styled with Tailwind CSS v4 and a custom OKLCH color system. Utilizes `shadcn/ui` for a library of robust, accessible components.
- **Dynamic Animations**: Features GSAP-powered animations including an infinite marquee for the skills section and smooth scroll-triggered effects.
- **Full-Text Search**: Implements fast, client-side search capabilities across all content using Pagefind, indexed automatically at build time.
- **Rich Component Library**: Includes custom components like a project showcase with Embla Carousel, a functional contact form connected to a Next.js API route, and interactive UI elements.
- **Type-Safe Codebase**: Fully written in TypeScript to ensure code quality, maintainability, and a better developer experience.
- **Floating Resume Download**: Persistent download button with tooltip, accessible from any page.

## Tech Stack

- **Framework**: Next.js 15, Nextra 4.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Animation**: GSAP (GreenSock Animation Platform)
- **Search**: Pagefind
- **UI Components**: Embla Carousel, Radix UI, Lucide Icons
- **Fonts**: Montserrat (headings), Roboto (body)

## Features Deep Dive

### Contact Form
- Built with controlled React components and form validation
- Supports multiple email providers (Resend, Nodemailer, FormSubmit)
- Real-time form validation and error handling
- Success/error state management with user feedback

### Search Functionality
- Powered by Pagefind - indexes all MDX content at build time
- Client-side, no server required
- Instant search results with highlighting
- Automatically updates on every build

### Performance Optimizations
- Next.js 15 with Turbopack for fast development
- Automatic image optimization with Next.js Image component
- Static page generation where possible
- Lazy loading for images and components
- Code splitting for optimal bundle sizes
- GSAP scroll-triggered animations for smooth UX

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js (v20 or higher recommended)
- npm, pnpm, or yarn

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jlu22003/codenotes.git
   cd codenotes
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional):**
   
   Create a `.env.local` file in the root directory for contact form functionality:
   ```bash
   # Option 1: Resend (Recommended)
   RESEND_API_KEY=your_resend_api_key_here

   # Option 2: Gmail/SMTP via Nodemailer
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your_app_specific_password
   ```

   **Note**: The contact form will log submissions to console if no email service is configured. See `src/app/api/contact/route.ts` for detailed setup instructions for each option.

4. **Run the development server:**
   
   The development server is powered by Next.js with Turbopack for maximum speed.
   ```bash
   npm run dev
   ```

5. **Open the application:**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

The repository is organized to separate concerns, making it easy to navigate and maintain.

```
codenotes/
├── src/
│   ├── app/
│   │   ├── [[...mdxPath]]/        # Dynamic MDX page routing
│   │   ├── api/
│   │   │   └── contact/           # Contact form API endpoint
│   │   ├── layout.tsx             # Root layout with Nextra config
│   │   └── globals.css            # Global styles & theme variables
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (Button, Card, etc.)
│   │   ├── sections/              # Page sections (Hero, Skills, Projects, Contact)
│   │   ├── blocks/                # shadcn blocks (CTA, Forms)
│   │   └── ResumeDownloadButton.tsx
│   └── content/                   # MDX content (pages, blog, projects)
│       ├── _meta.js               # Navigation configuration
│       ├── projects/
│       └── blog/
├── public/
│   ├── _pagefind/                 # Search index (generated at build)
│   └── resume.pdf                 # Resume file for download
├── package.json
└── README.md
```

## Environment Variables

<!-- TODO: Review and update with your actual configuration -->

This project requires the following environment variables for full functionality:

Create a `.env.local` file in the root directory:

```bash
# Contact Form - Choose ONE option:

# Option 1: Resend (Easiest, recommended)
# Sign up at https://resend.com (free tier: 100 emails/day)
RESEND_API_KEY=re_xxxxx

# Option 2: Gmail via Nodemailer
# Enable 2FA, then create App Password at https://myaccount.google.com/apppasswords
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Option 3: FormSubmit (No API key needed, just uncomment code in route.ts)
```

**Configuration**: Uncomment the desired email service in `src/app/api/contact/route.ts`

## Building for Production

To create a production-ready build of the site, run the following command:

```bash
npm run build
```

This command will:
1. Build the Next.js application
2. Execute the `postbuild` script, which runs Pagefind to index your site's content and places the search index in the `public/_pagefind` directory

To test the production build locally:
```bash
npm run start
```

## Deployment

<!-- TODO: Update repository URL and live site URL -->

This project is optimized for deployment on Vercel but can be deployed to any platform that supports Next.js.

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jlu22003/codenotes)

1. Click the button above or push to your GitHub repository
2. Import the project to Vercel
3. Add environment variables in the Vercel dashboard (if using contact form)
4. Deploy!

Vercel will automatically run the `postbuild` script to generate the search index.

### Other Platforms

The site can also be deployed to:
- **Netlify**: Supports Next.js with automatic builds
- **Cloudflare Pages**: Fast edge deployment
- **AWS Amplify**: Full AWS integration
- **Self-hosted**: Use Docker or deploy to any Node.js server

**Important**: Ensure your platform runs the `postbuild` script for search indexing.

## Customization

### Changing Colors

The site uses a custom OKLCH color system for precise, perceptually uniform colors.

1. **Edit theme variables** in `src/app/globals.css`:
   ```css
   :root {
     --primary: oklch(0.4341 0.0392 41.9938);  /* Your primary color */
     /* ... other colors ... */
   }
   ```

2. **Update Nextra theme** in `src/app/layout.tsx`:
   ```tsx
   <Head 
     color={{
       hue: 42,        // 0-360 degree hue
       saturation: 40, // 0-100 percentage
       lightness: {
         light: 43,
         dark: 65
       }
     }}
   />
   ```

### Adding Content

- **Blog Posts**: Create `.mdx` files in `src/content/blog/`
- **Projects**: Add project details in `src/content/projects/`
- **Pages**: Add new MDX pages in `src/content/`
- **Navigation**: Update `_meta.js` files to control sidebar structure

Example `_meta.js`:
```javascript
export default {
  index: 'Home',
  projects: 'Projects',
  blog: 'Blog',
  contact: 'Contact'
}
```

### Changing Fonts

<!-- TODO: Update if you change fonts -->

Custom fonts are configured in `src/app/layout.tsx`:
- **Headings**: Montserrat (bold, tracking-tight)
- **Body**: Roboto (regular weight)

To change fonts:
1. Install fonts via `next/font/google` or add custom fonts to `public/fonts/`
2. Update font imports in `layout.tsx`
3. Update CSS variables in `globals.css`

### Adding Components

shadcn/ui components can be added via CLI:
```bash
npx shadcn add button
npx shadcn add card
```

shadcnblocks components:
```bash
npx shadcn add @shadcnblocks/component-name
```

## Troubleshooting

### Build fails with TypeScript errors
```bash
# Skip linting during build
npm run build -- --no-lint
```

### Search not working
Ensure the postbuild script ran successfully:
```bash
npm run postbuild
```

### Port 3000 already in use
```bash
# Run on different port
npm run dev -- -p 3001
```

### Contact form not sending emails
1. Check your `.env.local` file exists and has correct values
2. Verify you've uncommented the correct email service in `src/app/api/contact/route.ts`
3. Check browser console and server logs for errors
4. For Gmail: Ensure you're using an App Password, not your regular password

### Hot reload not working in development
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Chrome DevTools `.well-known` error
This is a cosmetic warning from Chrome DevTools looking for developer config. It doesn't affect functionality and can be safely ignored.

## Known Issues

- [ ] Chrome DevTools warning for `.well-known` path (cosmetic, doesn't affect functionality)
- [ ] Search index requires manual rebuild after content changes in dev mode (run `npm run postbuild`)

## Roadmap

<!-- TODO: Update with your actual plans -->

- [ ] Add blog post series/categories
- [ ] Implement RSS feed
- [ ] Add view counter for projects
- [ ] Create CMS integration (Sanity/Contentful) for easier content management
- [ ] Add more GSAP animation presets
- [ ] Implement related posts suggestions
- [ ] Add newsletter subscription
- [ ] Create project case study template

## Contributing

This is a personal portfolio project, but suggestions and bug reports are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Nextra](https://nextra.site/) - Documentation framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [GSAP](https://greensock.com/gsap/) - Animation library
- [Pagefind](https://pagefind.app/) - Search indexing
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icon set

## Author

<!-- TODO: Update with your social links -->

**Justin K. Lu**
- Portfolio: [justinklu.com](https://www.justinklu.com/)
- GitHub: [@jlu22003](https://github.com/jlu22003)
- Email: justinklu@gmail.com
- Location: Alpharetta, GA

## Support

If you find this project helpful or inspiring, please consider:
- Giving it a ⭐️ on GitHub
- Sharing it with others
- [Hiring me](mailto:justinklu75@gmail.com) for your next project!

---

Built with ❤️ using Next.js, Nextra, and Tailwind CSS