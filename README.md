# Rakibul Hasan — Portfolio

Live website: https://rakibulhasancs1.github.io/portfolio/

Plain HTML, CSS and JavaScript with a responsive layout and persistent light/dark theme. Real project screenshots and profile photography are included under assets/.

## Hosting
GitHub Pages publishes main, /(root). All asset paths are relative to support /portfolio/. No build or dependencies are required. The .nojekyll file disables Jekyll processing.

## Feedback
feedback-config.js contains only the public API origin: https://rakibul-portfolio-feedback.onrender.com. The Node.js backend and MongoDB credentials are not in this repository. The API's ALLOWED_ORIGINS must include https://rakibulhasancs1.github.io (origins do not include paths).

The form requires publication consent, validates field lengths and rating, prevents duplicate retries, and has a finite request timeout with errors that preserve the typed message. Feedback content is rendered with textContent to prevent HTML/script injection. The API applies additional validation, payload limits and database-backed submission rate limits.

## Security limits
The page uses a restrictive Content Security Policy allowing API requests only to the Render service. No database connection string, private key, token or .env file is deployed. CORS restricts browser access but is not authentication. This is a public feedback form: determined spam can bypass a honeypot and IP limits; CAPTCHA or moderation can be added if needed. Submitted reviews are immediately public after explicit consent.

Render Free can sleep. The form explains slow requests and lets the user retry without duplicate submissions. Free hosting cannot guarantee continuous availability.
