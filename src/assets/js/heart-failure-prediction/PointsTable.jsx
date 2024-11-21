const PointsTable = () => {
  return (
    <div className="w-fit float-none sm:float-right ml-10">
      <table className="font-sans [border:1px_solid_rgb(var(--color-border))] border-collapse">
        <thead>
          <tr>
            <th className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">Variables</th>
            <th className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">Points</th>
          </tr>
        </thead>
        <tbody>
          {/* Age Group */}
          <tr>
            <td colSpan={2} className="[border-bottom:1px_solid_rgb(var(--color-border))] p-2">
              <strong>Age</strong>
            </td>
          </tr>
          <tr>
            <td className="p-2 pl-8 text-left">Age {"> "}70</td>
            <td className="p-2 text-left">+1</td>
          </tr>

          {/* Ejection fraction Group */}
          <tr>
            <td colSpan={2} className="[border-bottom:1px_solid_rgb(var(--color-border))] p-2">
              <strong>Ejection fraction</strong>
            </td>
          </tr>
          <tr>
            <td className="p-2 pl-8 text-left">Ejection fraction {"<="} 30%</td>
            <td className="p-2 text-left">+1</td>
          </tr>
          <tr>
            <td className="p-2 pl-8 text-left">Ejection fraction {"<="} 20%</td>
            <td className="p-2 text-left">+2</td>
          </tr>

          {/* Serum creatinine Group */}
          <tr>
            <td colSpan={2} className="[border-bottom:1px_solid_rgb(var(--color-border))] p-2">
              <strong>Serum creatinine</strong>
            </td>
          </tr>
          <tr>
            <td className="p-2 pl-8 text-left">Serum creatinine {">"} 0.9 mg/dL</td>
            <td className="p-2 text-left">+1</td>
          </tr>
          <tr>
            <td className="p-2 pl-8 text-left">Serum creatinine {">"} 1.8 mg/dL</td>
            <td className="p-2 text-left">+2</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PointsTable;