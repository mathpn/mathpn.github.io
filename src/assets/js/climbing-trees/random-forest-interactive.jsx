import { useState, useEffect, useRef } from "react";
import forestData from "./random_forest.json";

const RandomForestVisualization = () => {
  // State to track which elements are visible
  const [visibleElements, setVisibleElements] = useState({
    tree1: false,
    tree2: false,
    tree3: false,
    rf: true,
  });

  // State for responsive dimensions
  const [dimensions, setDimensions] = useState({
    width: 400,
    height: 400,
  });

  const containerRef = useRef(null);
  const { trees, dataPoints } = forestData;

  // Update dimensions based on container width
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Set max width to 400px, but scale down on smaller screens
        const newWidth = Math.min(400, containerWidth - 20); // 20px for padding
        setDimensions({
          width: newWidth,
          height: newWidth, // Keep it square
        });
      }
    };

    // Initial calculation
    updateDimensions();

    // Add resize listener
    window.addEventListener("resize", updateDimensions);

    // Cleanup
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Function to get color based on probability
  const getProbabilityColor = (probability) => {
    // Interpolate between blue (class 0) and red (class 1)
    const r = Math.round(255 * probability);
    const b = Math.round(255 * (1 - probability));
    return `rgb(${r}, 75, ${b})`;
  };

  // Function to scale coordinates based on current dimensions
  const scaleCoordinate = (coord, originalSize = 400) => {
    return (coord / originalSize) * dimensions.width;
  };

  // Show only the clicked element, hide others
  const showOnlyElement = (element) => {
    const newState = {};
    Object.keys(visibleElements).forEach((key) => {
      newState[key] = key === element;
    });
    setVisibleElements(newState);
  };

  return (
    <div
      className="flex flex-col items-center p-1 bg-gray-50 rounded-lg shadow w-full"
      ref={containerRef}
    >
      <h2 className="text-xl font-bold mb-2">
        Random Forest Decision Boundaries
      </h2>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {trees.map((tree) => (
          <button
            key={tree.id}
            onClick={() => showOnlyElement(tree.id)}
            className={`px-3 py-1 border rounded ${visibleElements[tree.id] ? "bg-gray-200" : "bg-white"}`}
            style={{ borderColor: "#000000" }}
          >
            {tree.name}
          </button>
        ))}
      </div>

      <div
        className="relative border border-gray-300 bg-white mx-auto"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        {/* Decision boundaries */}
        {trees.map(
          (tree) =>
            visibleElements[tree.id] &&
            tree.heatmap.map((cell, idx) => {
              // Calculate cell size based on current dimensions
              const cellSize = dimensions.width / 40; // 10px at 400px width

              return (
                <div
                  key={idx}
                  className="absolute"
                  style={{
                    left: `${scaleCoordinate(cell.x)}px`,
                    top: `${scaleCoordinate(cell.y)}px`,
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: getProbabilityColor(cell.prob),
                    opacity: 0.6,
                  }}
                />
              );
            }),
        )}

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Data points */}
          {dataPoints.map((point, idx) => {
            // Scale circle radius based on visualization size
            const radius = (dimensions.width / 400) * 6;

            return (
              <circle
                key={idx}
                cx={scaleCoordinate(point.x)}
                cy={scaleCoordinate(point.y)}
                r={radius}
                fill={point.cls === 1 ? "#ff6666" : "#6666ff"}
                stroke="#fff"
                strokeWidth={radius / 6}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend for data points */}
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-2 rounded-full"></div>
          <span>Class 1</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 mr-2 rounded-full"></div>
          <span>Class 0</span>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 text-sm text-gray-700 max-w-md text-center px-2">
        <p>
          This visualization shows how individual decision trees create simple
          orthogonal decision boundaries, while the combined random forest
          produces a smoother probabilistic boundary that better fits the data.
        </p>
        <p className="mt-2">
          Choose which decision boundary to show by clicking on the buttons.
        </p>
      </div>
    </div>
  );
};

export default RandomForestVisualization;
