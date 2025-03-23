const express = require('express');
const ping = require('ping');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

//aqui hago el endpoint para el ping
app.get('/ping', async (req, res) => {
  const host = req.query.host;
  if (!host) {
    return res.status(400).json({ error: 'Sin host en la petición' });
  }
  
  try {
    const result = await ping.promise.probe(host);
    res.json({
      host: result.host,
      alive: result.alive,
      time: result.time,
      output: result.output
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//inicio el servidor 
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});