import React, { useEffect, useState } from "react";
import { interval, Subject } from "rxjs";
import { scan, share, takeUntil } from "rxjs/operators";

import "./style.css";

const action$ = new Subject();
action$.subscribe();

const stopwatch$ = interval(1000)
  .pipe(
    takeUntil(action$),
    scan((count) => count + 1)
  )
  .pipe(share());

const Stopwatch = () => {
  const [sub, setSub] = useState(false);
  const [stopwatchesList, setStopwatchesList] = useState([]);
  let [hours, setHours] = useState(0);
  let [minutes, setMinutes] = useState(0);
  let [seconds, setSeconds] = useState(0);
  let [counter, setCounter] = useState(0);
  let [clicker, setClicker] = useState(0);

  function renderTime() {
    !(seconds % 3599) && seconds !== 0 && setHours(++hours);
    !(seconds % 59) && seconds !== 0 && setMinutes(++minutes % 60);
    setSeconds(++seconds % 60);
  }

  useEffect(() => {
    sub && renderTime();
  }, [counter]);

  const startCount = () => {
    setSub(
      stopwatch$.subscribe(
        (time) => {
          setCounter(time + 1);
        },
        (err) => console.log("Err: ", err)
      )
    );
  };

  useEffect(() => {
    setTimeout(() => {
      setClicker(0);
    }, 300);
  }, [clicker]);

  const stopCount = () => {
    action$.next("stop");
    setSub(false);
  };

  const resetState = () => {
    setSeconds(0);
    setMinutes(0);
    setHours(0);
  };

  const startStopHandler = () => {
    if (sub) {
      stopCount();
      setStopwatchesList([...stopwatchesList, { h: hours, m: minutes, s: seconds }]);
      resetState();
    } else {
      startCount();
    }
  };

  const waitHandler = () => {
    if (sub) {
      setClicker(++clicker);
      if (clicker === 2) {
        stopCount();
      }
    }
    console.log(clicker);
  };

  const resetHandler = () => {
    if (sub) {
      action$.next("reset");
      resetState();
      startCount();
    }
  };

  return (
    <div className="wrapper">
      <hgroup>
        <h1>Stopwatch</h1>
      </hgroup>
      <div className="stopwatch">
        <div>
          <div className="cd-box">
            <p className="numbers hours">{hours < 10 ? `0${hours}` : hours}</p>
            <p className="strings timeRefHours">Hours</p>
          </div>

          <div className="cd-box">
            <p className="numbers minutes">{minutes < 10 ? `0${minutes}` : minutes}</p>
            <p className="strings timeRefMinutes">Minutes</p>
          </div>

          <div className="cd-box">
            <p className="numbers seconds">{seconds < 10 ? `0${seconds}` : seconds}</p>
            <p className="strings timeRefSeconds">Seconds</p>
          </div>
        </div>

        <div className="btns-container">
          <button onClick={startStopHandler} className="btn" id="start">
            Start/Stop
          </button>
          <button onClick={waitHandler} className="btn" id="stop">
            Wait
          </button>
          <button onClick={resetHandler} className="btn" id="stop">
            Reset
          </button>
        </div>
        <ol className="stopwatches-list">
          {!!stopwatchesList.length &&
            stopwatchesList.map((el, i) => (
              <li key={i + 1 + "item"}>{`  ${el.h < 10 ? `0${el.h}` : el.h} : ${el.m < 10 ? `0${el.m}` : el.m} : ${
                el.s < 10 ? `0${el.s}` : el.s
              }`}</li>
            ))}
        </ol>
      </div>
    </div>
  );
};

export default Stopwatch;
