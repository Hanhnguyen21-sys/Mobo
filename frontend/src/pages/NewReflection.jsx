import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";

const carePrompts = {
  water: {
    title: "Water your plant",
    intro: "What gave you energy or relief today?",
    icon: "💧",
  },
  feed: {
    title: "Feed your plant",
    intro: "What did you learn, notice, or appreciate today?",
    icon: "🌿",
  },
  care: {
    title: "Care for your plant",
    intro: "How are you feeling right now?",
    icon: "✨",
  },
};

export default function NewReflection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const care = searchParams.get("care") || "care";
  const prompt = carePrompts[care] || carePrompts.care;

  const [emotions, setEmotions] = useState([]);
  const [formData, setFormData] = useState({
    content: "",
    emotion_id: "",
    visibility: "private",
    image_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmotions() {
      try {
        const data = await apiRequest("/emotions");
        setEmotions(data.emotions);

        if (data.emotions.length > 0) {
          setFormData((current) => ({
            ...current,
            emotion_id: data.emotions[0].id,
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEmotions();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await apiRequest("/posts", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          emotion_id: Number(formData.emotion_id),
        }),
      });

      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <section className="card">
          <p>Loading reflection form...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="shell reflection-page">
      <section className="reflection-heading">
        <div className="reflection-icon">{prompt.icon}</div>
        <h1>{prompt.title}</h1>
        <p>{prompt.intro}</p>
      </section>

      <form className="card reflection-form" onSubmit={handleSubmit}>
        <section className="prompt-card">
          <p className="eyebrow">Prompt</p>
          <h2>{prompt.intro}</h2>
        </section>

        <fieldset className="emotion-fieldset">
          <legend>How are you feeling?</legend>

          <div className="emotion-grid">
            {emotions.map((emotion) => (
              <label
                className={
                  String(formData.emotion_id) === String(emotion.id)
                    ? "emotion-pill selected"
                    : "emotion-pill"
                }
                key={emotion.id}
              >
                <input
                  type="radio"
                  name="emotion_id"
                  value={emotion.id}
                  checked={String(formData.emotion_id) === String(emotion.id)}
                  onChange={handleChange}
                />
                <span>{emotion.icon}</span>
                {emotion.name}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="reflection-textbox">
          <span>Write your reflection</span>
          <textarea
            name="content"
            rows="7"
            value={formData.content}
            onChange={handleChange}
            placeholder="Today I noticed..."
          />
        </label>

        <section className="reflection-options">
          <label className="cute-field">
            <span>Visibility</span>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option value="private">Private</option>
              <option value="friends">Friends</option>
            </select>
          </label>

          <label className="cute-field image-field">
            <span>Image URL</span>
            <input
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="Optional image link"
            />
          </label>
        </section>
        <section className="points-preview">
          <span>+10 reflection points | +5 image or long reflection bonus</span>
        </section>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save reflection"}
        </button>
      </form>
    </main>
  );
}
