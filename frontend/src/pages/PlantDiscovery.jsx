import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

export default function PlantDiscovery() {
  const [plants, setPlants] = useState([]);
  const [nickname, setNickname] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [choosingId, setChoosingId] = useState(null);
  const [error, setError] = useState("");
  const [userPlants, setUserPlants] = useState([]);
  const [plantToDelete, setPlantToDelete] = useState(null);

  useEffect(() => {
    async function loadPlants() {
      try {
        const plantData = await apiRequest("/plants");
        setPlants(plantData.plants);

        const userPlantsData = await apiRequest("/user-plants");
        setUserPlants(userPlantsData.plants);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlants();
  }, []);

  const filteredPlants = useMemo(() => {
    return plants.filter((plant) =>
      plant.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [plants, search]);

  const ownedPlantTypeIds = useMemo(() => {
    return new Set(userPlants.map((userPlant) => userPlant.plant_type?.id));
  }, [userPlants]);

  async function refreshUserPlants() {
    const userPlantsData = await apiRequest("/user-plants");
    setUserPlants(userPlantsData.plants);
  }

  async function handleChoosePlant(plantTypeId) {
    setError("");
    setChoosingId(plantTypeId);

    try {
      await apiRequest("/user-plants", {
        method: "POST",
        body: JSON.stringify({
          plant_type_id: plantTypeId,
          nickname,
        }),
      });

      await refreshUserPlants();
      setNickname("");
    } catch (err) {
      setError(err.message);
    } finally {
      setChoosingId(null);
    }
  }

  async function handleSetCurrent(userPlantId) {
    setError("");

    try {
      const data = await apiRequest(`/user-plants/${userPlantId}/current`, {
        method: "PATCH",
      });

      setUserPlants((currentPlants) =>
        currentPlants.map((plant) => ({
          ...plant,
          is_current: plant.id === data.plant.id,
        })),
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeletePlant() {
    if (!plantToDelete) return;

    setError("");

    try {
      await apiRequest(`/user-plants/${plantToDelete.id}`, {
        method: "DELETE",
      });

      await refreshUserPlants();
      setPlantToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <section className="card">
          <p>Loading plants...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="shell plant-page">
      <section className="plant-heading">
        <div>
          <h1>Discover Your Plant</h1>
          <p>Create a gentle green space with daily reflections.</p>
        </div>

        <button className="circle-menu" type="button">
          ···
        </button>
      </section>

      <label className="search-box">
        <span>⌕</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Find your plants"
        />
      </label>

      {userPlants.length > 0 && (
        <section className="plant-section">
          <div className="section-row">
            <h2>Your Plants</h2>
            <span>{userPlants.length} owned</span>
          </div>

          <div className="owned-plants">
            {userPlants.map((userPlant) => (
              <article className="owned-plant-card" key={userPlant.id}>
                <button
                  className="delete-plant-button"
                  type="button"
                  aria-label={`Delete ${
                    userPlant.nickname || userPlant.plant_type?.name
                  }`}
                  onClick={() => setPlantToDelete(userPlant)}
                >
                  ×
                </button>

                <span className="owned-plant-emoji">
                  {userPlant.plant_type?.emoji || "🌱"}
                </span>

                <strong>
                  {userPlant.nickname || userPlant.plant_type?.name}
                </strong>

                <small>{userPlant.growth_stage}</small>

                {userPlant.is_current ? (
                  <span className="current-badge">Current</span>
                ) : (
                  <button
                    className="set-current-button"
                    type="button"
                    onClick={() => handleSetCurrent(userPlant.id)}
                  >
                    Set current
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <label className="nickname-box">
        Plant nickname
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Sunny, Bloom, Sprout..."
        />
      </label>

      {error && <p className="error">{error}</p>}

      <section className="plant-section">
        <div className="section-row">
          <h2>Available Plants</h2>
          <span>{filteredPlants.length} plants</span>
        </div>

        <div className="plant-grid">
          {filteredPlants.map((plant) => {
            const alreadyOwned = ownedPlantTypeIds.has(plant.id);

            return (
              <article className="card plant-card" key={plant.id}>
                <div className="plant-image-placeholder">
                  {plant.emoji || "🌱"}
                </div>

                <h3>{plant.name}</h3>
                <p>{plant.description}</p>

                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={alreadyOwned || choosingId === plant.id}
                  onClick={() => handleChoosePlant(plant.id)}
                >
                  {alreadyOwned
                    ? "Already owned"
                    : choosingId === plant.id
                      ? "Adding..."
                      : `Add ${plant.name}`}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {plantToDelete && (
        <div className="modal-backdrop">
          <section className="delete-modal card">
            <div className="modal-icon">🪴</div>
            <h2>Delete this plant?</h2>
            <p>
              {plantToDelete.nickname || plantToDelete.plant_type?.name} will be
              removed from your garden.
            </p>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setPlantToDelete(null)}
              >
                Keep plant
              </button>

              <button
                className="btn btn-danger"
                type="button"
                onClick={handleDeletePlant}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
