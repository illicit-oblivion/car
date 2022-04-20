import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const step = 15;

function App() {
  const [coords, setCoords] = useState<[number, number]>([0, 0]);
  const [rotate, setRotate] = useState(0)
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(
    () => {
      const listener = (event: KeyboardEvent) => {
        const { current } = ref;
        if (!current) {
          return;
        }

        const boundingClientRect = current.getBoundingClientRect();
        const { documentElement } = document;

        switch (event.code) {
          case 'ArrowUp': {
            const diff = boundingClientRect.top - step;
            if (diff > 0) {
              setCoords((prevValue) => [prevValue[0], prevValue[1] - step]);
            } else {
              setCoords((prevValue) => [prevValue[0], prevValue[1] - step - diff]);
            }
            setRotate(-90)
            break;
          }

          case 'ArrowDown': {
            const documentHeight = documentElement.clientHeight;
            const diff = documentHeight - (boundingClientRect.bottom + step);
            if (diff > 0) {
              setCoords((prevValue) => [prevValue[0], prevValue[1] + step]);
            } else {
              setCoords((prevValue) => [prevValue[0], prevValue[1] + step + diff]);
            }
            setRotate(90);
            break;
          }

          case 'ArrowRight': {
            const documentWidth = documentElement.clientWidth;
            const diff = documentWidth - (boundingClientRect.right + step);
            if (diff > 0) {
              setCoords((prevValue) => [prevValue[0] + step, prevValue[1]]);
            } else {
              setCoords((prevValue) => [prevValue[0] + step + diff, prevValue[1]]);
            }
            setRotate(0)
            break;
          }

          case 'ArrowLeft': {
            const diff = boundingClientRect.left - step;
            if (diff > 0) {
              setCoords((prevValue) => [prevValue[0] - step, prevValue[1]]);
            } else {
              setCoords((prevValue) => [prevValue[0] - step - diff, prevValue[1]]);
            }
            setRotate(180)
            break;
          }
          default: break;
        }
      };

      document.addEventListener('keydown', listener);

      return () => { document.removeEventListener('keydown', listener); };
    },
    [],
  );

  return (
    <div className="App">
      <img
        className="car"
        alt={'car'}
        ref={ref}
        src={'/car.png'}
        style={{ transform: `translate(${coords[0]}px, ${coords[1]}px) rotate(${rotate}deg)` }}
      />
    </div>
  );
}

export default App;
