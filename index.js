const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Datos en memoria (para demo)
const urlDatabase = [];
let counter = 1;

// Endpoint POST para acortar URL
app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);
    // Verificar que tenga http/https
    if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error('Invalid protocol');

    // Usar dns.lookup para validar host
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) return res.json({ error: 'invalid url' });

      // Guardar URL y asignar short_url
      const shortUrl = counter++;
      urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

      res.json({ original_url: originalUrl, short_url: shortUrl });
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

// Endpoint GET para redirigir
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const found = urlDatabase.find(u => u.short_url === shortUrl);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));