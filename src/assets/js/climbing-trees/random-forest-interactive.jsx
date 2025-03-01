import React, { useState } from "react";
import forestData from "./random_forest.json";

const RandomForestVisualization = () => {
  // State to track which elements are visible
  const [visibleElements, setVisibleElements] = useState({
    tree1: false,
    tree2: false,
    tree3: false,
    rf: true,
  });

  const { trees, dataPoints } = forestData;

  const width = 400;
  const height = 400;

  // Function to get color based on probability
  const getProbabilityColor = (probability) => {
    // Interpolate between blue (class 0) and red (class 1)
    const r = Math.round(255 * probability);
    const b = Math.round(255 * (1 - probability));
    return `rgb(${r}, 75, ${b})`;
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
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow">
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
            style={{ borderColor: tree.color }}
          >
            {tree.name}
          </button>
        ))}
      </div>

      <div
        className="relative border border-gray-300 bg-white"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Decision boundaries */}
        {trees.map(
          (tree) =>
            visibleElements[tree.id] &&
            tree.heatmap.map((cell, idx) => (
              <div
                key={idx}
                className="absolute"
                style={{
                  left: `${cell.x}px`,
                  top: `${cell.y}px`,
                  width: "10px",
                  height: "10px", // XXX adjust
                  backgroundColor: getProbabilityColor(cell.probability),
                  opacity: 0.6,
                }}
              />
            )),
        )}

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Data points */}
          {dataPoints.map((point, idx) => (
            <circle
              key={idx}
              cx={point.x}
              cy={point.y}
              r="6"
              fill={point.cls === 1 ? "#ff6666" : "#6666ff"}
              stroke="#fff"
              strokeWidth="1"
            />
          ))}
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
      <div className="mt-4 text-sm text-gray-700 max-w-md text-center">
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
