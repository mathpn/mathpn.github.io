const ContingencyTable = () => {
  return (
    <div className="float-none sm:float-end w-full sm:w-2/4 max-w-md p-0 sm:px-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-1/3 relative h-16">
              <div className="absolute inset-0">
                <svg className="w-full h-full">
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                    stroke="rgb(var(--color-border))"
                    strokeWidth="1"
                  />
                </svg>
                <div className="p-1 absolute bottom-1 left-1 text-xl">Test</div>
                <div className="p-1 absolute top-1 right-1 text-xl">Ill</div>
              </div>
            </th>
            <th className="p-2 text-center w-1/3 text-2xl">Yes</th>
            <th className="p-2 text-center w-1/3 text-2xl">No</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="p-2 text-left text-2xl">Yes</th>
            <td className="p-2 text-center text-xl">9900</td>
            <td className="p-2 text-center text-xl">19800</td>
          </tr>
          <tr>
            <th className="p-2 text-left text-2xl">No</th>
            <td className="p-2 text-center text-xl">100</td>
            <td className="p-2 text-center text-xl">970200</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ContingencyTable;
