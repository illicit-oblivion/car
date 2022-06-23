import React, { useEffect, useRef, useState} from 'react';
import './App.css';


type Cord = {
  x: number,
  y: number,
  direction?: Direction;
}

type Size = {
  width: number,
  height: number,
}

type Direction = 'Top' | 'Left' | 'Right' | 'Bottom'


type Position = Size & Cord;


const getRotation = (direction: Direction) =>  {
  switch (direction) {
    case 'Top': {
      return -90;
    }

    case 'Bottom': {
      return 90
    }

    case 'Right': {
      return 0
    }
    case 'Left': {
      return 180;
    }
  }
}

function App() {
  const [carPosition, setCarPosition] = useState<Cord | null>(null);
  const [carSize, setCarSize] = useState<Size | null>(null);
  const [rotate, setRotate] = useState<number>(0)
  const [obstacles, setObstacles] = useState<Position[]>([]);
  const [shortest, setShortest] = useState<Cord[]>([]);
  const [view, setView] = useState<'car' | 'wagon'>('car');

  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(
     () => {
       fetch('http://localhost:5002/api/map/info').then(it => {
           it.json().then(response => {
             let startCarPosition = response.startPosition;
             setCarPosition({
               x: startCarPosition.points[0].x,
               y: startCarPosition.points[0].y,
             })
             setCarSize({
               width: startCarPosition.width,
               height: startCarPosition.height,
             })
             const result = response.obstacles.map((it: { width: number; height: number; points: { y: number; x: number }[]; }) => ({
               width: it.width,
               height: it.height,
               x: it.points[0].x,
               y: it.points[0].y,
             }));
             setObstacles(result)
           })
       });
    },
    [],
  );

  useEffect(() => {
    let currentIndex= 0 ;

    if (!shortest.length) {
      return;
    }

    const timer = setInterval(() => {
      if (currentIndex === shortest.length -1) {
        clearInterval(timer)
      }

      setCarPosition(shortest[currentIndex]);
      const prevDirection = currentIndex-1 >= 0 ? shortest[currentIndex-1].direction: undefined;
      const direction = shortest[currentIndex].direction;
      if (direction) {
         setRotate(getRotation( direction, prevDirection))
       }
      currentIndex++;
    }, 200);

    return () => {
      return clearInterval(timer);
    };
  }, [shortest])

  const handleClick = (targetX: number, targetY: number) => {
    if(!carPosition) {
      return
    }

    const body = JSON.stringify({
      "startPosition": {
        "x": carPosition.x,
        "y": carPosition.y,
      },
      "endPosition": {
        "x": targetX,
        "y": targetY
      }
    });
    fetch('http://localhost:5002/api/path/shortest', {method: 'POST', body,     headers: {
        'Content-Type': 'application/json-patch+json'
      }, }).then(it => {
      it.json().then(response => {
        setShortest(response.map((it: { x: number; y: number; direction: Direction }) => ({x: it.x, y: it.y, direction: it.direction})))
      })
    });
  }

  return (
    <div className="App" onClick={(ev) => handleClick(ev.clientX, ev.clientY)}>
      {carPosition && carSize && <img
        className="car"
        alt={'car'}
        ref={ref}
        src={view === 'car'?'/car.png': '/wagon.png'}
        style={{
          top: carPosition.y,
          left: carPosition.x,
          width:carSize.width,
          height: carSize.height ,
          transform: `rotate(${rotate}deg)`}}
      />}
      {obstacles.map((it, key) =>
          <div className="obstacle" key={key} style={{ top:it.y, left: it.x, width: it.width, height: it.height}}>
          </div>
      )}
      <div className='view-mode-buttons'>
        <label>
          <input type="radio" checked={view === 'wagon'} onChange={() => setView('wagon')}/>
          Тележка
        </label>
        <label>
          <input type="radio" checked={view === 'car'} onChange={() => setView('car')}/>
          Машинка
        </label>
      </div>
    </div>
  );
}

export default App;
