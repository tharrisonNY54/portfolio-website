const { createServer } = require("https");
const { readFileSync, existsSync } = require("fs");
const { join } = require("path");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const keyPath = process.env.SSL_KEY_PATH || join(__dirname, "localhost-key.pem");
  const certPath = process.env.SSL_CERT_PATH || join(__dirname, "localhost.pem");

  if (!existsSync(keyPath) || !existsSync(certPath)) {
    console.error("\nSSL certificates not found.");
    console.error("Run: npm run generate-cert");
    console.error("Or set SSL_KEY_PATH and SSL_CERT_PATH in .env.local\n");
    process.exit(1);
  }

  const httpsOptions = {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath),
  };

  createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(8443, "0.0.0.0", () => {
    console.log("\nHTTPS server: https://localhost:8443\n");
  });
});
