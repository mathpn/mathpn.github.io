const CharacteristicsTable = () => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full mx-auto border-collapse [border:1px_solid_rgb(var(--color-border))]">
        <thead>
          <tr>
            <th className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">Characteristic</th>
            <th className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">Attribute</th>
            <th className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">Coefficient</th>
            <th className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">Weight</th>
            <th className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">WeightScaled</th>
            <th className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">(Intercept)</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left"></td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">-2.50</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">-36.12</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0.00</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0</td>
          </tr>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">anaemia0</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">0</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0.00</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0.00</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">-0.45</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0</td>
          </tr>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">anaemia1</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">1</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0.69</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">9.92</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">9.46</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">9</td>
          </tr>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">age_bin</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">01 {"<="} 70</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0.00</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0.00</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">-0.45</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0</td>
          </tr>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">age_bin</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">02 {">"} 70</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">1.33</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">19.23</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">18.78</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">19</td>
          </tr>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">ejection_fraction_bin</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">01 {"<="} 20</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">2.65</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">38.24</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">37.78</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">38</td>
          </tr>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">ejection_fraction_bin</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">02 {"<="} 30</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">1.33</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">19.20</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">18.74</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">19</td>
          </tr>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">ejection_fraction_bin</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">03 {">"} 30</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0.00</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0.00</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">-0.45</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0</td>
          </tr>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">serum_creatinine_bin</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">01 {"<="} 0.9</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0.00</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0.00</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">-0.45</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">0</td>
          </tr>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">serum_creatinine_bin</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">02 {"<="} 1.8</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">1.06</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">15.27</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">14.81</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">15</td>
          </tr>
          <tr>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">serum_creatinine_bin</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-left">03 {">"} 1.8</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">3.01</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">43.42</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">42.97</td>
            <td className="[border:1px_solid_rgb(var(--color-border))] p-2 text-right">43</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CharacteristicsTable;