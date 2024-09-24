import path from 'path';
import stationMapping from './station_mapping.json' assert { type: 'json' };

const __dirname = path.resolve();

app.use(express.static('public'))

// Fetch les deux APIs
async function fetchHistoricalWeather(stationId, year, month, day) {
  const url = `https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=${stationId}&Year=${year}&Month=${month}&Day=${day}&timeframe=1&submit=%20Download+Data`;
  const data = await fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching historical weather data: ${response.statusText}`);
      }
      return response.text();
    })
    .catch(error => console.error('Error:', error));
  return data;
}

async function fetchPrevisions(rss_feed) {
  const data = await fetch(rss_feed)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching weather forecast data: ${response.statusText}`);
      }
      return response.text();
    })
    .catch(error => console.error('Error:', error));
  return data;
}

// Routes pour les pages HTML :
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/info_journaliere', (req, res) => {
  res.sendFile(path.join(__dirname, 'vues/info_journaliere.html'));
});
app.get('/previsions_meteo', (req, res) => {
  res.sendFile(path.join(__dirname, 'vues/previsions_meteo.html'));
});

// Routes pour les données
app.get('/station_mapping', (req, res) => {
  if (stationMapping) {
    res.json(stationMapping);
  } else {
    res.status(500).send('Les données du fichier station_mapping.json ne sont pas disponibles.');
  }
});

app.get('/api-history', async (req, res) => {
  const { stationId, year, month, day } = req.query;
  try {
    const data = await fetchHistoricalWeather(stationId, year, month, day);
    res.send(data);
  } catch (error) {
    alert("Une erreur est survenue.");
    res.status(500).send(error.message);
  }
});

app.get('/api-previsions', async (req, res) => {
  const { rss_feed } = req.query;
  try {
    const data = await fetchPrevisions(rss_feed);
    res.send(data);
  } catch (error) {
    alert("Une erreur est survenue.");
    res.status(500).send(error.message);
  }
});
