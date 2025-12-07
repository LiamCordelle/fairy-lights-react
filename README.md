# Fairy Lights Controller

A React application for controlling fairy lights, modernized with Vite and PWA capabilities.

## Features

- **Modern Stack**: Built with React 18 and Vite.
- **PWA Ready**: Installable on Android/iOS as a standalone app.
- **Responsive**: Mobile-friendly UI with Ant Design.
- **Efficient**: Fast build times and optimized assets.

## Getting Started

### Prerequisites

- Node.js (v24+ recommended)
- npm

> **Tip:** If you use `nvm`, you can run `nvm use` to automatically switch to the correct Node version.

### Installation

```bash
npm install
```

### Development

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

```bash
npm start
```

### Build

Builds the app for production to the `build` folder.

```bash
npm run build
```

## Deployment

### Apache on Raspberry Pi

To host this application on a Raspberry Pi running Apache:

1.  **Build the project**:
    ```bash
    npm run build
    ```

2.  **Copy to Web Server**:
    Transfer the contents of the `build` directory to your Apache web root (usually `/var/www/html`).

    ```bash
    # Example copy command (adjust paths as needed)
    sudo cp -r build/* /var/www/html/
    ```

3.  **Permissions**:
    Ensure the files are readable by the web server user (`www-data`).
    ```bash
    sudo chown -R www-data:www-data /var/www/html
    ```

4.  **PWA Requirements (HTTPS)**:
    For the "Add to Home Screen" PWA feature to work, the site **must be served over HTTPS** (or `localhost`).
    - If accessing via IP (e.g., `http://192.168.1.x`), PWA features might be disabled by the browser security policy.
    - You can use **Let's Encrypt** (if proper domain) or generate a **Self-Signed Certificate** for local use to enable HTTPS on Apache.

### Generating a Self-Signed Certificate

To enable HTTPS on your Raspberry Pi (required for PWA):

1.  **Generate the Certificate**:
    Run this command on your Pi (replace `192.168.1.XX` with your Pi's actual IP address):
    ```bash
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/ssl/private/apache-selfsigned.key \
      -out /etc/ssl/certs/apache-selfsigned.crt \
      -subj "/C=GB/ST=London/L=London/O=Liam Cordelle's Raspberry Pi/CN=192.168.1.XX" \
      -addext "subjectAltName=IP:192.168.1.XX"
    ```
    *Note: The `subjectAltName` (SAN) is critical for Chrome on Android to accept the IP address.*

2.  **Configure Apache**:
    Edit the default SSL configuration:
    ```bash
    sudo nano /etc/apache2/sites-available/default-ssl.conf
    ```
    Update the `SSLCertificateFile` and `SSLCertificateKeyFile` lines:
    ```apache
    SSLCertificateFile      /etc/ssl/certs/apache-selfsigned.crt
    SSLCertificateKeyFile   /etc/ssl/private/apache-selfsigned.key
    ```

3.  **Enable SSL and Restart**:
    ```bash
    sudo a2enmod ssl
    sudo a2ensite default-ssl
    sudo systemctl restart apache2
    ```

4.  **Trust on Device**:
    When you visit `https://<YOUR-PI-IP>` on your phone, you will see a "Not Secure" warning. Click "Advanced" -> "Proceed" to accept the certificate. The "Add to Home Screen" option should now appear.

### Testing with ngrok (Alternative)

If you have trouble with self-signed certificates, you can use **ngrok** to get a public, secure HTTPS URL for your Pi.

1.  **Install ngrok**:
    ```bash
    curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && sudo apt update && sudo apt install ngrok
    ```
    *(Note: You'll need to sign up for a free account at ngrok.com to get an authtoken)*

2.  **Start Tunnel**:
    ```bash
    ngrok http 80
    ```
3.  **Use URL**: Use the provided `https://....ngrok-free.app` URL on your phone. It has valid SSL, so PWA installation will work immediately.

### iOS Support

Project supports "Add to Home Screen" on iOS (iPhone/iPad) as well.
1.  Open the site in **Safari**.
2.  Tap the **Share** button (box with an arrow pointing up).
3.  Scroll down and tap **"Add to Home Screen"**.
4.  Confirm the name and tap "Add".

### `.htaccess` (Optional)

If you use client-side routing (e.g., React Router) in the future, you will need to enable `mod_rewrite` and add an `.htaccess` file to redirect all requests to `index.html`. For this current single-page version without routing, it is not strictly necessary but good practice.

Create `/var/www/html/.htaccess`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```
