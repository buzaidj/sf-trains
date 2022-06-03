import './App.css';
import { iconStyle } from './arrivalHelpers';
import React, { Component, useState, useEffect } from 'react'
import Select, { InputActionMeta } from 'react-select'
import opts from './options.json'
import RefreshIcon from '@mui/icons-material/Refresh';

import 'leaflet/dist/leaflet.css';
import { MapContainer } from 'react-leaflet/MapContainer';
import { TileLayer } from 'react-leaflet/TileLayer';
import { useMap } from 'react-leaflet/hooks';
import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { height } from '@mui/system';


// const arrivals =
//   [
//     { mins: 5, lineCode: 'N', lineName: 'Judah', direction: 'Outbound' },
//     { mins: 7, lineCode: 'S', lineName: 'Shuttle', direction: 'Outbound' },
//     { mins: 11, lineCode: 'M', lineName: 'Ocean View', direction: 'Outbound' },
//     { mins: 12, lineCode: 'KT', lineName: 'KT: K Ingleside-T Third Street', direction: 'Outbound' },
//   ]


const key = "80b27b9e-f65e-4c32-960a-a40a076561ba"
const REFRESH_TIME = 120000; // 2 mins  
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
      return <p className='mins'>Arriving <span className='arrivingNow'>now</span></p>;
    case 1:
      return <p className='mins'><span className='minsNum'>{props.mins}</span> min away</p>;
    default:
      return <p className='mins'><span className='minsNum'>{props.mins}</span> mins away</p>;
  }
}

function longDirection(dir) {
  switch (dir) {
    case 'IB':
      return 'Inbound';
    case 'OB':
      return 'Outbound';
    case 'W':
      return 'West';
    case 'E':
      return 'East';
    case 'N':
      return 'North';
    case 'S':
      return 'South';
    default:
      return dir;
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

function computeMins(expectedArrivalTime) {
  console.log(Date.parse(expectedArrivalTime) - Date.now());
  console.log(Date.parse(expectedArrivalTime));
  console.log(expectedArrivalTime);
  return Math.floor(Math.abs((Date.parse(expectedArrivalTime) - Date.now()) / 1000 / 60));
}

function getExpectedTime(j) {
  for (const time of [j.MonitoredCall.ExpectedDepartureTime, j.MonitoredCall.ExpectedArrivalTime]) {
    if (time) {
      return time;
    }
  }
  return null;
}

function createArrivals(data) {
  return data?.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit
    .map(x => x.MonitoredVehicleJourney)
    .map(j => Object({
      lineCode: j.LineRef,
      lineName: j.PublishedLineName,
      direction: j.DirectionRef,
      destination: j.DestinationName,
      mins: computeMins(getExpectedTime(j))
    }))
}

function createStops(data) {
  return data?.Contents.dataObjects.ScheduledStopPoint
    .map(x => Object({
      value: x.id,
      label: x.Name,
      location: [x.Location.Latitude, x.Location.Longitude]
    }))
}


function toTimeStr(date) { return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }


function App() {
  const [stop, setStop] = useState({
    value: '16995',
    label: 'Powell Station Outbound'
  });
  const [lastUpdateTime, setUpdateTime] = useState(Date.now());
  const [arrivalList, setArrivals] = useState([]);
  const [filteredLines, setFilteredLines] = useState([]);
  const [stops, setStops] = useState([]);

  function FetchStops() {
    fetch(`http://api.511.org/transit/stopplaces?api_key=${key}&operator_id=SF&format=json`)
      .then(res => res.json())
      .then(res => { setStops(createStops(res)) })
      .catch(error => console.log(error.message));
  }

  function FetchData(stop) {
    console.log("Fetching data!");
    fetch("http://api.511.org/transit/StopMonitoring?api_key=" + key + "&agency=SF&format=json&stopcode=" + stop.value)
      .then(res => res.json())
      .then(res => { setArrivals(createArrivals(res)) })
      .catch(error => console.log(error.message));
  }

  useEffect(() => {
    setUpdateTime(Date.now());
    FetchData(stop);
    FetchStops();

    const interval = setInterval(() => {
      setUpdateTime(Date.now());
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
      <button className='refresh' onClick={() => { setUpdateTime(Date.now()); FetchData(stop); }}><RefreshIcon></RefreshIcon></button>
    </div>
  }


  function onChange(valueMeta, actionMeta) {
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
    <Select id="StopSelector" options={stops} onChange={onChange} />
  );

  function filterIconStyle(lineCode) {
    if (!filteredLines.includes(lineCode)) {
      return iconStyle(lineCode);
    }
    else {
      return { 'backgroundColor': 'gray', 'color': 'lightgray' };
    }
  }

  function filterLineClick(lineCode) {
    if (!filteredLines.includes(lineCode)) {
      setFilteredLines(filteredLines.concat([lineCode]));
    }
    else {
      setFilteredLines(filteredLines.filter((v, _) => v !== lineCode));
    }
  }

  function Filtering() {
    var lineCodes = [...new Set(arrivalList.map(x => x.lineCode))];
    return <div className='Filtering'>
      <p>Filter:</p>
      {
        lineCodes.map((x) => {
          return <i style={filterIconStyle(x)} className='lineIconFilter' onClick={() => filterLineClick(x)}>{x}</i>;
        }
        )
      }
    </div >
  }

  function MarkerFromStop(props) {
    return <Marker position={props.stop.location} icon={new Icon({ iconUrl: markerIconPng })}>
      <Popup>
        {props.stop.label} <br />
        <button onClick={
          () => {
            setUpdateTime(Date.now());
            setStop(props.stop);
            FetchData(props.stop);
          }
        }>Select this stop</button>
      </Popup>
    </Marker>
  }

  function MarkersFromStops(props) {
    var markers = [];
    for (var stop of props.stops) {
      markers.push(<MarkerFromStop stop={stop}></MarkerFromStop>);
    }
    return <div>{markers}</div>
  }


  return (
    <div id="app">
      <header>
        <HeaderRow station={stop.label} lastUpdateTime={lastUpdateTime}></HeaderRow>

        <StopSelector></StopSelector>
        {/* <MapContainer center={[37.7749, -122.4194]} zoom={14} scrollWheelZoom={false} style={{ height: '500px' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <div>
            <MarkersFromStops stops={stops}></MarkersFromStops>
          </div>

        </MapContainer> */}
        <Filtering></Filtering>
        <Arrivals liProps={arrivalList.filter(x => !filteredLines.includes(x.lineCode)).slice(0, MAX_ARRIVALS)}></Arrivals>

      </header>
    </div >
  );
}

export default App;


