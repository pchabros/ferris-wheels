import { csv } from "d3";
import { useEffect, useState } from "react";
import "./App.css";
import { DataRaw, Data } from "./types";
import Plot from "./components/Plot";
import Card from "./UI/Card";

const url =
  "https://raw.githubusercontent.com/rfordatascience/tidytuesday/master/data/2022/2022-08-09/wheels.csv";

const preprocess = (d: DataRaw): Data => ({
  name: d.name,
  country: d.country,
  diameter: d.diameter ? +d.diameter : undefined,
  status: d.status,
  seating_capacity: d.seating_capacity ? +d.seating_capacity : undefined,
  hourly_capacity: d.hourly_capacity ? +d.hourly_capacity : undefined,
});

function App() {
  const [data, setData] = useState<Data[]>([]);
  useEffect(() => {
    csv(url, preprocess).then((data) =>
      setData(
        data.filter(
          ({ diameter, seating_capacity }) =>
            !isNaN(diameter!) && !isNaN(seating_capacity!)
        )
      )
    );
  }, []);
  return (
    <div className="App">
      <Card>
        <span className="plot-title">Ferris Wheels Around The World</span>
        {data.length > 0 && <Plot data={data as Data[]} />}
      </Card>
    </div>
  );
}

export default App;
