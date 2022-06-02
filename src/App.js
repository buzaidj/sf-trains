import './App.css';
import { iconStyle } from './arrivalHelpers';
import React, { Component, useState, useEffect } from 'react'
import Select, { InputActionMeta } from 'react-select'
import opts from './options.json'
import RefreshIcon from '@mui/icons-material/Refresh';

const options = opts.options

// const arrivals =
//   [
//     { mins: 5, lineCode: 'N', lineName: 'Judah', direction: 'Outbound' },
//     { mins: 7, lineCode: 'S', lineName: 'Shuttle', direction: 'Outbound' },
//     { mins: 11, lineCode: 'M', lineName: 'Ocean View', direction: 'Outbound' },
//     { mins: 12, lineCode: 'KT', lineName: 'KT: K Ingleside-T Third Street', direction: 'Outbound' },
//   ]


const key = "80b27b9e-f65e-4c32-960a-a40a076561ba"
const REFRESH_TIME = 1200000; // 20 mins  
const MAX_ARRIVALS = 7;

function toTitleCase(str) {
  return str.toLowerCase().replace(/(?:^|[\s-/])\w/g, function (match) {
    return match.toUpperCase();
  });
}

/** Retrieves the icon styling for a given line code. For instance, bus route
 * 30's style has a background color of rgb(0, 91, 149) and a text color 
 * of white
 * 
 */
function Arrivals(props) {
  return <ul className='Arrivals'>{props.liProps.map(
    (prop) => <li>{ArrivalRow(prop)}</li>
  )}</ul>
}


function Mins(props) {
  switch (props.mins) {
    case 0:
      return <p className='mins'>Arriving <span className='minsNum'>now</span></p>;
    case 1:
      return <p className='mins'><span className='minsNum'>{props.mins}</span> min away</p>;
    default:
      return <p className='mins'><span className='minsNum'>{props.mins}</span> min away</p>;
  }
}

function longDirection(dir) {
  switch (dir) {
    case 'IB':
      return 'Inbound';
    case 'OB':
      return 'Outbound';
    default:
      return dir
  }
}

/** Returns a row for a given arrival with props mins 
 * (an integer), lineCode (e.g. N), lineName (e.g. Judah) 
 * and direction (e.g. outbound) */
function ArrivalRow(props) {
  return <div className='ArrivalRow'>
    <Mins mins={props.mins}></Mins>
    <i style={iconStyle(props.lineCode)} className='lineIcon'>{props.lineCode}</i>
    <p className='lineName'>{toTitleCase(props.lineName)}</p>
    <p className='direction'>{longDirection(props.direction)}</p>
  </div>;
}

function computeArrivalMins(expectedArrivalTime) {
  return Math.floor(Math.abs((Date.now() - Date.parse(expectedArrivalTime)) / 1000 / 60));
}

function createArrivals(data) {
  return data?.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit
    .map(x => x.MonitoredVehicleJourney)
    .map(j => Object({
      lineCode: j.LineRef,
      lineName: j.PublishedLineName,
      direction: j.DirectionRef,
      destination: j.DestinationName,
      mins: computeArrivalMins(j.MonitoredCall.ExpectedArrivalTime)
    }))
}


function toTimeStr(date) { return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }


function App() {
  const [stop, setStop] = useState(options[0])
  const [lastUpdateTime, setUpdateTime] = useState(Date.now())
  const [arrivalList, setArrivals] = useState([])

  function FetchData(stop) {
    fetch("http://api.511.org/transit/StopMonitoring?api_key=" + key + "&agency=SF&format=json&stopcode=" + stop.value)
      .then(res => res.json())
      .then(res => { setArrivals(createArrivals(res)) })
      .catch(error => console.log(error.message));
  }

  useEffect(() => {
    FetchData(stop);

    const interval = setInterval(() => {
      FetchData(stop);
    }, REFRESH_TIME);

    return () => clearInterval(interval);
  }, [stop])


  function HeaderRow(props) {
    return <div className='Header'>
      <p>
        Upcoming trains/buses at
        <span className='bold'> {props.station}</span>.
        Last updated at {toTimeStr(props.lastUpdateTime)}.
      </p>
      <button className='refresh' onClick={() => { setUpdateTime(Date.now()) }}><RefreshIcon></RefreshIcon></button>
    </div>
  }


  function onChange(valueMeta, actionMeta) {
    console.log(actionMeta.action);
    switch (actionMeta.action) {
      case 'select-option':
      case 'set-value':
        setUpdateTime(Date.now());
        setStop(valueMeta);
        FetchData(valueMeta);
        break;
      default:
        break;
    }
  }


  const StopSelector = () => (
    <Select id="StopSelector" options={options} onChange={onChange} />
  );


  return (
    <div id="app">
      <header>
        <HeaderRow station={stop.label} lastUpdateTime={lastUpdateTime}></HeaderRow>

        <StopSelector></StopSelector>
        <Arrivals liProps={arrivalList.slice(0, MAX_ARRIVALS)}></Arrivals>

      </header>
    </div >
  );
}

export default App;


