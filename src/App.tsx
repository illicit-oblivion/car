import React, { useEffect, useRef, useState} from 'react';
import './App.css';


type Cord = {
  x: number,
  y: number,
}

type Size = {
  width: number,
  height: number,
}

type Direction = 'Top' | 'Left' | 'Right' | 'Bottom' | 'None';


type Obstacle = Size & Cord;

type RouteNode = Cord & {direction: Direction};

function angleDifference (targetA: number, sourceA: number) {
  const angle = targetA - sourceA
  return (angle + 180) % 360 - 180
}

const angles = {
  None: 90,
  Top: 0,
  Left: 270,
  Right: 90,
  Bottom: 180,
}

type SizeAndPosition = { points: [Cord] } & Size;

type MapInfoResponse = {
  obstacles: SizeAndPosition[];
  startPosition: SizeAndPosition;
}

function getAngle(direction: Direction, prevDirection: Direction) {
  const targetA = angles[direction];
  const sourceA = angles[prevDirection];
  const diff = angleDifference(targetA, sourceA);
  return sourceA + diff;
}

function App() {
  const [pathIndex, setPathIndex] = useState(0);
  const [startCarSizeAndPosition, setStartCarSizeAndPosition] = useState<SizeAndPosition | null>(null);

  const startCarRouteNode: RouteNode | null = startCarSizeAndPosition && {
    x: startCarSizeAndPosition.points[0].x,
    y: startCarSizeAndPosition.points[0].y,
    direction: 'None',
  }

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [shortest, setShortest] = useState<RouteNode[]>([]);
  const [view, setView] = useState<'car' | 'wagon'>('car');

  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(
     () => {
       fetch('http://localhost:5002/api/map/info').then(res => res.json())
           .then((res: MapInfoResponse) => {
             setStartCarSizeAndPosition(res.startPosition);
             const result = res.obstacles.map((it) => ({
               width: it.width,
               height: it.height,
               x: it.points[0]?.x,
               y: it.points[0]?.y,
             }));
             setObstacles(result)
           })
       }, [],
  );

  useEffect(() => {
    let currentIndex= 0 ;

    if (!shortest.length) {
      return;
    }

    const timer = setInterval(() => {
      if (currentIndex === shortest.length - 1) {
        clearInterval(timer);
        return;
      }
      currentIndex++
      setPathIndex(currentIndex);
    }, 200);

    return () => {
      return clearInterval(timer);
    };
  }, [shortest])

  const previousRouteNode = shortest[pathIndex - 1] ?? startCarRouteNode;

  if (!previousRouteNode || !startCarRouteNode || !startCarSizeAndPosition) {
    return null;
  }

  const currentRouteNode = shortest[pathIndex] ?? startCarRouteNode;
  const angle = getAngle(currentRouteNode.direction, previousRouteNode.direction);

  const handleClick = (targetX: number, targetY: number) => {
    if(!startCarSizeAndPosition) {
      return
    }

    const body = JSON.stringify({
      "startPosition": {
        "x": currentRouteNode.x,
        "y": currentRouteNode.y,
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
      {<img
        className="car"
        alt={'car'}
        ref={ref}
        src={view === 'car'?'/car.png': '/wagon.png'}
        style={{
          top: currentRouteNode.y,
          left: currentRouteNode.x,
          width: startCarSizeAndPosition.width,
          height: startCarSizeAndPosition.height ,
          transform: `rotate(${angle - 90}deg)`}}
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
