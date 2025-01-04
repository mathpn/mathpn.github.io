import { useState, useEffect } from "react";

const images = import.meta.glob("../../images/climbing-trees-1/frame_*.png", {
  eager: true,
});

const TreeDepthSlider = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(15); // Matches our Python output
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => (prev === totalFrames - 1 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalFrames]);

  const frameNumber = currentFrame.toString().padStart(2, "0");
  const currentImage = Object.entries(images).find(([key]) =>
    key.includes(`frame_${frameNumber}`),
  )?.[1];

  return (
    <div
      className="not-prose"
      style={{
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          backgroundColor: "#fff",
        }}
      >
        <img
          src={currentImage.default.src}
          style={{
            width: "100%",
            height: "auto",
            marginBottom: "20px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "10px",
          }}
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              minWidth: "80px",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <input
            type="range"
            min="0"
            max={totalFrames - 1}
            value={currentFrame}
            onChange={(e) => {
              setCurrentFrame(parseInt(e.target.value));
              setIsPlaying(false);
            }}
            style={{ flex: 1 }}
          />

          <div style={{ minWidth: "100px", color: "black" }}>
            Depth: {currentFrame + 1}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeDepthSlider;
