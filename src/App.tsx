import React, { useEffect, useRef, useState } from 'react';
import './App.css';

type Position = {
  width: number,
  height: number,
  x: number,
  y: number,
}

function App() {
  const [carPosition, setCarPosition] = useState<Position | null>(null);
  const [obstaclesPositions, setObstaclesPositions] = useState<Position[]>([]);
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(
     () => {
       fetch('http://localhost:5002/api/map/info').then(it => {
           it.json().then(response => {
             let startCarPosition = response.startPosition;
             setCarPosition({
               width: startCarPosition.width,
               height: startCarPosition.height,
               x: startCarPosition.points[0].x,
               y: startCarPosition.points[0].y,
             })
             const result = response.obstacles.map((it: { width: number; height: number; points: { y: number; x: number }[]; }) => ({
               width: it.width,
               height: it.height,
               x: it.points[0].x,
               y: it.points[0].y,
             }));
             setObstaclesPositions(result)
           })
       });
    },
    [],
  );

  return (
    <div className="App">
      {carPosition && <img
        className="car"
        alt={'car'}
        ref={ref}
        src={'/car.png'}
        style={{ top: carPosition.y, left: carPosition.x, width:carPosition.width, height: carPosition.height   }}
      />}
      {obstaclesPositions.map(it =>
          <div className="obstacle" style={{ top:it.y, left: it.x, width: it.width, height: it.height}}>
          </div>
      )}
    </div>
  );
}

export default App;
