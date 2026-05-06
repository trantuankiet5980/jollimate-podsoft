# Jollimate POD Shopify Theme

This repository contains the custom Shopify theme for Jollimate, a Print-on-Demand (POD) e-commerce store. It is built to deliver a high-performance, visually appealing, and highly converting shopping experience.

## Features

- **Custom POD Integrations**: Tailored sections and snippets to handle print-on-demand product customizations.
- **Optimized Performance**: Focused on fast loading times, minimizing main-thread blocking, and optimizing image assets for mobile and desktop.
- **Responsive Design**: Fully responsive layouts and dynamic drawers/filters adapted for all screen sizes.
- **Modern UI/UX**: Includes custom product cards, dynamic filters, and engaging micro-animations to enhance user experience.

## Directory Structure

- `/assets`: Contains CSS, JavaScript, and image assets.
- `/config`: Theme settings schema and configuration data.
- `/layout`: Master layout files (e.g., `theme.liquid`).
- `/locales`: Language translation files for multi-language support.
- `/sections`: Reusable theme sections (e.g., header, footer, main-product).
- `/snippets`: Smaller, reusable pieces of Liquid code.
- `/templates`: Page templates defined in JSON or Liquid formats.

## Setup and Development

To work on this theme locally, you will need the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli).

### Prerequisites

- Node.js installed
- Shopify CLI installed
- Access to the Jollimate Shopify store

### Local Development

1. Clone this repository to your local machine.
2. Navigate to the project directory:
   ```bash
   cd jollimate-podsoft
   ```
3. Start the local development server using the Shopify CLI:
   ```bash
   shopify theme dev
   ```
   *(You may be prompted to log in to your Shopify partner account or store).*
4. The CLI will provide a local server link (usually `http://127.0.0.1:9292`) where you can preview your changes in real-time.

## Deployment

To push your changes to the live or a staging theme, use the Shopify CLI:
```bash
shopify theme push
```
*(Ensure you are pushing to the correct theme ID to avoid overwriting the live production theme without prior review).*

## Technologies Used

- **Liquid**: Shopify's templating language.
- **HTML5 / Vanilla CSS / JavaScript**: Core frontend technologies.
- **JSON**: Used for defining page templates and theme settings schemas.
