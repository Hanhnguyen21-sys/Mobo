import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import {
  getCurrentWeather,
  getDailyQuote,
  getLocationName,
} from "../api/daily";
const stageEmoji = {
  Seed: "🌰",
  Sprout: "🌱",
  "Small plant": "🪴",
  "Young plant": "🌿",
  "Mature plant": "🌳",
  "Flowering plant": "🌷",
};

export default function Home() {
  const [plant, setPlant] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quote] = useState(getDailyQuote());
  const [weather, setWeather] = useState({
    temperature: null,
    label: "Loading weather",
    icon: "🌤️",
    location: "Detecting location...",
  });
  useEffect(() => {
    async function loadHome() {
      try {
        const plantData = await apiRequest("/user-plants/current");
        setPlant(plantData.plant);

        const rewardData = await apiRequest("/rewards/me");
        setRewards(rewardData.rewards);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;

              const weatherData = await getCurrentWeather(latitude, longitude);
              const locationName = await getLocationName(latitude, longitude);

              setWeather({
                ...weatherData,
                location: locationName,
              });
            } catch {
              setWeather({
                temperature: null,
                label: "Weather unavailable",
                icon: "🌤️",
                location: "Location unavailable",
              });
            }
          },
          () => {
            setWeather({
              temperature: null,
              label: "Location needed",
              icon: "📍",
              location: "Allow location access",
            });
          },
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, []);

  if (loading) {
    return (
      <main className="shell">
        <section className="card">
          <p>Loading home...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="shell">
        <section className="card">
          <p className="error">{error}</p>
        </section>
      </main>
    );
  }

  const progress =
    plant?.growth?.percentage ?? Math.min(100, plant?.total_points || 0);
  const pointsToNext = plant?.growth?.points_to_next ?? 0;
  const nextStage = plant?.growth?.next_stage || "complete growth";
  const plantEmoji =
    plant?.plant_type?.emoji || stageEmoji[plant?.growth_stage] || "🌱";

  const progressStyle = {
    background: `conic-gradient(var(--blue-green) ${
      progress * 3.6
    }deg, var(--surface-blue) 0deg)`,
  };

  return (
    <main className="shell home-page">
      <section className="home-heading">
        <div>
          <p className="eyebrow">Today</p>
          <h1>Welcome back</h1>
          <p>
            Small moments still count. Help your plant grow with one reflection
            today.
          </p>
        </div>

        <Link className="round-button" to="/plants">
          +
        </Link>
      </section>

      <section className="daily-grid">
        <article className="card weather-card">
          <div>
            <p className="eyebrow">Weather</p>
            <h2>
              {weather.temperature !== null
                ? `${weather.label} · ${weather.temperature}°C`
                : weather.label}
            </h2>

            <p className="weather-location">Location: {weather.location}</p>

            <p>A little sky check before caring for your plant.</p>
          </div>

          <div className="weather-icon">{weather.icon}</div>
        </article>

        <article className="card quote-card">
          <p className="eyebrow">Quote</p>
          <h2>{quote}</h2>
          <p>Your daily note of encouragement.</p>
        </article>
      </section>

      {!plant ? (
        <section className="card empty-plant-card">
          <h2>No plant yet</h2>
          <p>
            Choose your first plant to start growing with daily reflections.
          </p>
          <Link className="btn btn-primary" to="/plants">
            Choose a plant
          </Link>
        </section>
      ) : (
        <>
          <section className="card plant-care-card">
            <div className="progress-circle" style={progressStyle}>
              <div className="progress-circle-inner">
                <span>{plantEmoji}</span>
                <strong>{progress}%</strong>
              </div>
            </div>

            <div className="plant-info">
              <p className="eyebrow">Current Plant</p>
              <h2>
                {plant?.nickname || plant?.plant_type?.name || "My Plant"}
              </h2>
              <p>
                {plant?.plant_type?.name || "Plant"} ·{" "}
                {plant?.growth_stage || "Seed"}
              </p>

              <div className="progress-bar">
                <span style={{ width: `${progress}%` }} />
              </div>

              <p>
                {plant?.total_points || 0} points · {pointsToNext} to{" "}
                {nextStage}
              </p>
            </div>
          </section>

          <section className="care-actions">
            <Link className="care-action" to="/new-reflection?care=water">
              <span>💧</span>
              Water
            </Link>

            <Link className="care-action" to="/new-reflection?care=feed">
              <span>🌿</span>
              Feed
            </Link>

            <Link className="care-action" to="/new-reflection?care=care">
              <span>✨</span>
              Care
            </Link>
          </section>

          <section className="home-lower-grid">
            <article className="card">
              <div className="section-row">
                <h2>My Plants</h2>
                <Link to="/plants">+</Link>
              </div>

              <div className="plant-chip">
                <span>{plant?.plant_type?.emoji || plantEmoji}</span>
                <strong>
                  {plant?.nickname || plant?.plant_type?.name || "My Plant"}
                </strong>
              </div>
            </article>

            <article className="card">
              <h2>Rewards</h2>

              {rewards.length === 0 ? (
                <p>
                  No rewards yet. Keep reflecting to unlock your first reward.
                </p>
              ) : (
                <ul className="reward-list">
                  {rewards.map((item) => (
                    <li key={item.id}>🏅 {item.reward.name}</li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
}
