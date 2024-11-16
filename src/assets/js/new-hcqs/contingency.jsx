const ContingencyTable1 = () => {
  return (
    <div className="float-none sm:float-end w-full sm:w-2/4 max-w-md p-0 sm:px-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-0 w-1/3 relative h-16">
              <div className="w-full h-full relative">
                <svg className="absolute top-0 left-0 w-full h-full">
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                    stroke="rgb(var(--color-border))"
                    strokeWidth="1"
                  />
                </svg>
                <div className="absolute bottom-1 left-1 text-xl">Death</div>
                <div className="absolute top-1 right-1 text-xl">WI</div>
              </div>
            </th>
            <th className="p-2 text-center w-1/3 text-2xl">Yes</th>
            <th className="p-2 text-center w-1/3 text-2xl">No</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="p-2 text-left text-2xl">Yes</th>
            <td className="p-2 text-center text-xl">50</td>
            <td className="p-2 text-center text-xl">50</td>
          </tr>
          <tr>
            <th className="p-2 text-left text-2xl">No</th>
            <td className="p-2 text-center text-xl">4950</td>
            <td className="p-2 text-center text-xl">4950</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ContingencyTable1Pt = () => {
  return (
    <div className="float-none sm:float-end w-full sm:w-2/4 max-w-md p-0 sm:px-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-0 w-1/3 relative h-16">
              <div className="w-full h-full relative">
                <svg className="absolute top-0 left-0 w-full h-full">
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                    stroke="rgb(var(--color-border))"
                    strokeWidth="1"
                  />
                </svg>
                <div className="absolute bottom-1 left-1 text-xl">Morte</div>
                <div className="absolute top-1 right-1 text-xl">VQ</div>
              </div>
            </th>
            <th className="p-2 text-center w-1/3 text-2xl">Sim</th>
            <th className="p-2 text-center w-1/3 text-2xl">Não</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="p-2 text-left text-2xl">Sim</th>
            <td className="p-2 text-center text-xl">50</td>
            <td className="p-2 text-center text-xl">50</td>
          </tr>
          <tr>
            <th className="p-2 text-left text-2xl">Não</th>
            <td className="p-2 text-center text-xl">4950</td>
            <td className="p-2 text-center text-xl">4950</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ContingencyTable2 = () => {
  return (
    <div className="float-none sm:float-end w-full sm:w-2/4 max-w-md p-0 sm:px-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-0 w-1/3 relative h-16">
              <div className="w-full h-full relative">
                <svg className="absolute top-0 left-0 w-full h-full">
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                    stroke="rgb(var(--color-border))"
                    strokeWidth="1"
                  />
                </svg>
                <div className="absolute bottom-1 left-1 text-xl">Death</div>
                <div className="absolute top-1 right-1 text-xl">WI</div>
              </div>
            </th>
            <th className="p-2 text-center w-1/3 text-2xl">Yes</th>
            <th className="p-2 text-center w-1/3 text-2xl">No</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="p-2 text-left text-2xl">Yes</th>
            <td className="p-2 text-center text-xl">100</td>
            <td className="p-2 text-center text-xl">50</td>
          </tr>
          <tr>
            <th className="p-2 text-left text-2xl">No</th>
            <td className="p-2 text-center text-xl">4900</td>
            <td className="p-2 text-center text-xl">4950</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ContingencyTable2Pt = () => {
  return (
    <div className="float-none sm:float-end w-full sm:w-2/4 max-w-md p-0 sm:px-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-0 w-1/3 relative h-16">
              <div className="w-full h-full relative">
                <svg className="absolute top-0 left-0 w-full h-full">
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                    stroke="rgb(var(--color-border))"
                    strokeWidth="1"
                  />
                </svg>
                <div className="absolute bottom-1 left-1 text-xl">Morte</div>
                <div className="absolute top-1 right-1 text-xl">VQ</div>
              </div>
            </th>
            <th className="p-2 text-center w-1/3 text-2xl">Sim</th>
            <th className="p-2 text-center w-1/3 text-2xl">Não</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="p-2 text-left text-2xl">Sim</th>
            <td className="p-2 text-center text-xl">100</td>
            <td className="p-2 text-center text-xl">50</td>
          </tr>
          <tr>
            <th className="p-2 text-left text-2xl">Não</th>
            <td className="p-2 text-center text-xl">4900</td>
            <td className="p-2 text-center text-xl">4950</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ContingencyTable3 = () => {
  return (
    <div className="float-none sm:float-end w-full sm:w-2/4 max-w-md p-0 sm:px-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-0 w-1/3 relative h-16">
              <div className="w-full h-full relative">
                <svg className="absolute top-0 left-0 w-full h-full">
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                    stroke="rgb(var(--color-border))"
                    strokeWidth="1"
                  />
                </svg>
                <div className="absolute bottom-1 left-1 text-xl">Death</div>
                <div className="absolute top-1 right-1 text-xl">WI</div>
              </div>
            </th>
            <th className="p-2 text-center w-1/3 text-2xl">Yes</th>
            <th className="p-2 text-center w-1/3 text-2xl">No</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="p-2 text-left text-2xl">Yes</th>
            <td className="p-2 text-center text-xl">6534</td>
            <td className="p-2 text-center text-xl">59466</td>
          </tr>
          <tr>
            <th className="p-2 text-left text-2xl">No</th>
            <td className="p-2 text-center text-xl">408</td>
            <td className="p-2 text-center text-xl">33592</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ContingencyTable3Pt = () => {
  return (
    <div className="float-none sm:float-end w-full sm:w-2/4 max-w-md p-0 sm:px-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-0 w-1/3 relative h-16">
              <div className="w-full h-full relative">
                <svg className="absolute top-0 left-0 w-full h-full">
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                    stroke="rgb(var(--color-border))"
                    strokeWidth="1"
                  />
                </svg>
                <div className="absolute bottom-1 left-1 text-xl">Morte</div>
                <div className="absolute top-1 right-1 text-xl">VQ</div>
              </div>
            </th>
            <th className="p-2 text-center w-1/3 text-2xl">Sim</th>
            <th className="p-2 text-center w-1/3 text-2xl">Não</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="p-2 text-left text-2xl">Sim</th>
            <td className="p-2 text-center text-xl">6534</td>
            <td className="p-2 text-center text-xl">59466</td>
          </tr>
          <tr>
            <th className="p-2 text-left text-2xl">Não</th>
            <td className="p-2 text-center text-xl">408</td>
            <td className="p-2 text-center text-xl">33592</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export {
  ContingencyTable1,
  ContingencyTable2,
  ContingencyTable3,
  ContingencyTable1Pt,
  ContingencyTable2Pt,
  ContingencyTable3Pt,
};
