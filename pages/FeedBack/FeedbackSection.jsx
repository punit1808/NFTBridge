import React, { useState } from "react";
import "./FeedbackSection.css";

const scriptURL = import.meta.env.VITE_FEEDBACK_SCRIPT_URL;

const FeedbackSection = () => {
  const [ratings, setRatings] = useState({});
  const [hoveredStars, setHoveredStars] = useState({});
  const [comment, setComment] = useState("");
  const [Email, setEmail] = useState("");
  const [Institute, setInstitute] = useState("");
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const criteria = [
    "Security",
    "Efficiency",
    "User Experience",
    "Speed",
    "Reliability",
  ];

  const handleRatingChange = (criterion, value) => {
    setRatings((prev) => ({ ...prev, [criterion]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const feedback = { Email, Institute, ratings, comment };

    try {
      await fetch(
        `${scriptURL}`,
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedback),
        }
      );

      setLoading(false);
      setShowThankYou(true);
      setEmail("");
      setInstitute("");
      setRatings({});
      setComment("");

      setTimeout(() => setShowThankYou(false), 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setLoading(false);
      alert("Failed to send feedback. Please try again later.");
    }
  };

  return (
    <div className="feedback-wrapper">
      <div className={`feedback-container ${loading ? "blurred" : ""}`}>
        <h2>Feedback</h2>

        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Institute Name:</label>
          <input
            type="text"
            required
            placeholder="Enter your institute name"
            value={Institute}
            onChange={(e) => setInstitute(e.target.value)}
          />

          {criteria.map((criterion) => (
            <div key={criterion} className="rating-group">
              <label>{criterion}:</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${
                      (hoveredStars[criterion] || ratings[criterion]) >= star
                        ? "filled"
                        : ""
                    }`}
                    onMouseEnter={() =>
                      setHoveredStars((prev) => ({
                        ...prev,
                        [criterion]: star,
                      }))
                    }
                    onMouseLeave={() =>
                      setHoveredStars((prev) => ({ ...prev, [criterion]: 0 }))
                    }
                    onClick={() => handleRatingChange(criterion, star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))}

          <label>Comments:</label>
          <textarea
            placeholder="Share your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            Submit Feedback
          </button>
        </form>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loader"></div>
        </div>
      )}

      {showThankYou && (
        <div className="thank-you-box">
          <p>🎉 Thanks for your feedback!</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;
