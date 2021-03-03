import React, { useEffect, useState } from "react";
import { concat, interval, NEVER, of, Subject } from "rxjs";
import { map, scan, share, switchMap, takeUntil } from "rxjs/operators";
import "./style.css";

const pause$ = new Subject();
pause$.subscribe();

const stop$ = new Subject();
stop$.subscribe();

const pauser$ = pause$.pipe(scan((acc) => !acc, false));

const starter$ = of(false);
const stopwatch$ = concat(starter$, pauser$)
  .pipe(
    switchMap((stopped) => (stopped ? NEVER : interval(1000))),
    scan((acc) => acc + 1, 0),
    map((v) => {
      return {
        hh: Math.floor(Math.floor(v / 60) / 60) % 60,
        mm: Math.floor(v / 60) % 60,
        ss: v % 60,
      };
    }),
    takeUntil(stop$)
  )
  .pipe(share());

const initialStateTime = { hh: 0, mm: 0, ss: 0 };

const Stopwatch = () => {
  const [subscribtion, setSubscribtion] = useState(null);
  let [clicker, setClicker] = useState(0);
  const [stopwatchesList, setStopwatchesList] = useState([]);
  const [pause, setPause] = useState(false);
  const [state, setState] = useState(initialStateTime);
  const { hh, mm, ss } = state;

  useEffect(() => {
    setTimeout(() => {
      setClicker(0);
    }, 300);
  }, [clicker]);

  const startStop = () => {
    if (pause) {
      start();
      return;
    }
    if (hh || mm || ss) {
      stop();
      setStopwatchesList([...stopwatchesList, { hh, mm, ss }]);
      setState(initialStateTime);
      return;
    }
    start();
  };
  const wait = () => {
    if (hh || mm || ss) {
      setClicker(++clicker);
      if (clicker === 2) {
        pause$.next();
        setPause(true);
      }
    }
  };

  const resetHandler = () => {
    if (hh || mm || ss) {
      stop();
      setState(initialStateTime);
      const sub = stopwatch$.subscribe({
        next: (v) => setState(v),
      });
      setSubscribtion(sub);
    }
  };

  const start = () => {
    console.log(subscribtion);
    if (hh || mm || ss) {
      pause$.next();
      setPause(false);
    } else if (!subscribtion) {
      const sub = stopwatch$.subscribe({
        next: (v) => setState(v),
      });
      setSubscribtion(sub);
    }
  };
  const stop = () => {
    stop$.next();
    setSubscribtion(null);
  };

  return (
    <div className="wrapper">
      <hgroup>
        <h1>Stopwatch</h1>
      </hgroup>
      <div className="stopwatch">
        <div>
          <div className="cd-box">
            <p className="numbers hours">{hh < 10 ? `0${hh}` : hh}</p>
            <p className="strings timeRefHours">Hours</p>
          </div>

          <div className="cd-box">
            <p className="numbers minutes">{mm < 10 ? `0${mm}` : mm} </p>
            <p className="strings timeRefMinutes">Minutes</p>
          </div>

          <div className="cd-box">
            <p className="numbers seconds"> {ss < 10 ? `0${ss}` : ss}</p>
            <p className="strings timeRefSeconds">Seconds</p>
          </div>
        </div>

        <div className="btns-container">
          <button onClick={startStop} className="btn" id="start">
            Start/Stop
          </button>
          <button onClick={wait} className="btn" id="stop">
            Wait
          </button>
          <button onClick={resetHandler} className="btn" id="stop">
            Reset
          </button>
        </div>
        <ol className="stopwatches-list">
          {!!stopwatchesList.length &&
            stopwatchesList.map((el, i) => (
              <li key={i + 1 + "item"}>{`  ${el.hh < 10 ? `0${el.hh}` : el.hh} : ${
                el.mm < 10 ? `0${el.mm}` : el.mm
              } : ${el.ss < 10 ? `0${el.ss}` : el.ss}`}</li>
            ))}
        </ol>
      </div>
    </div>
  );
};

export default Stopwatch;
