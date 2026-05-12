const http = require("http");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_PASSWORD = process.env.SENDER_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: SENDER_EMAIL, pass: SENDER_PASSWORD },
});

const server = http.createServer((req, res) => {
  const setCORS = () => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  };

  if (req.method === "OPTIONS") {
    setCORS();
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    const file = path.join(__dirname, "index.html");
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }
      setCORS();
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
    return;
  }

  if (req.method === "POST" && req.url === "/send") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      setCORS();
      try {
        const { email } = JSON.parse(body);
        if (!email || !email.includes("@")) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "Некорректный email" }));
          return;
        }
        await transporter.sendMail({
          from: SENDER_EMAIL,
          to: email,
          subject: "Привет",
          text: "привет",
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
