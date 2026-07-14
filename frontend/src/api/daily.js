const dailyQuotes = [
  "Small moments still count.",
  "One gentle step is enough today.",
  "Notice one good thing and let it stay.",
  "You are allowed to grow slowly.",
  "A quiet day can still be meaningful.",
  "Your feelings are part of the garden.",
  "Start where you are. That is enough.",
];

const weatherCodeMap = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mostly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Cloudy", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Foggy", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  61: { label: "Rainy", icon: "🌧️" },
  71: { label: "Snowy", icon: "❄️" },
  95: { label: "Stormy", icon: "⛈️" },
};

export function getDailyQuote(date = new Date()) {
  const dateKey = date.toISOString().slice(0, 10);
  const number = Number(dateKey.replaceAll("-", ""));
  const quote = dailyQuotes[number % dailyQuotes.length];

  return quote;
}
export async function getLocationName(latitude, longitude) {
  const params = new URLSearchParams({
    format: "json",
    lat: latitude,
    lon: longitude,
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Could not load location name.");
  }

  const data = await response.json();
  const address = data.address || {};

  return (
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state ||
    "Current location"
  );
}
export async function getCurrentWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,weather_code",
    temperature_unit: "celsius",
    timezone: "auto",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Could not load weather.");
  }

  const data = await response.json();
  const code = data.current.weather_code;
  const weather = weatherCodeMap[code] || { label: "Weather", icon: "🌤️" };

  return {
    temperature: Math.round(data.current.temperature_2m),
    label: weather.label,
    icon: weather.icon,
  };
}