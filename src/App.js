import './App.css';
import bart from './img/bart.jpg'
import { iconStyle, longDirection, filterLineIconStyle, filterDirectionIconStyle, directionExpand} from './arrivalHelpers';
import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import RefreshIcon from '@mui/icons-material/Refresh';

import { fetch511Arrivals, fetch511Stops, fetchBARTArrivals, fetchBARTStops} from './DataRetrieval';

import Map from './Map.js'
import InfoDialog from './Info';
import { FilterLinesAndDir } from './Filtering';

const key = "80b27b9e-f65e-4c32-960a-a40a076561ba"
const REFRESH_TIME = 1200000; // 20 mins  
const MAX_ARRIVALS = 100;

const agency = 'BA';

const bart_key = 'QBPD-5Q5V-9L3T-DWEI';


/** A list of all arriving buses/trains */
function Arrivals({arrivals}) {
  return <ul className='Arrivals'>{arrivals.map(
    (prop) => <li>{ArrivalRow(prop)}</li>
  )}</ul>
}

function Mins({mins}) {
  switch (mins) {
    case "Leaving":
      return <p className='mins'>Leaving <span className='arrivingNow'>now</span></p>;

    case 0:
    case "0":
      return <p className='mins'>Arriving <span className='arrivingNow'>now</span></p>;
    case 1:
    case "1":
      return <p className='mins'><span className='minsNum'>{mins}</span> min away</p>;
    default:
      return <p className='mins'><span className='minsNum'>{mins}</span> mins away</p>;
  }
}


/** Returns a row for a given arrival with props mins 
 * (an integer), lineCode (e.g. N), lineName (e.g. Judah) 
 * and direction (e.g. outbound) */
function ArrivalRow(props) {
  return <div className='ArrivalRow'>
    <Mins mins={props.mins}></Mins>
    <i style={iconStyle(props.lineCode)} className='lineIcon'>{props.lineCode}</i>
    <p className='lineName'>{props.lineName}</p>
    <p className='direction'>{longDirection(props.direction)}</p>
  </div>;
}

function toTimeStr(date) { return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }


function App() {
  const [stop, setStop] = useState(null);
  const [lastUpdateTime, setUpdateTime] = useState(null);
  const [arrivalList, setArrivals] = useState([]);
  const [filteredLines, setFilteredLines] = useState([]);
  const [filteredDirections, setFilteredDirections] = useState([]);
  const [stops, setStops] = useState([]);
  const [mapCenter, setMapCenter] = useState([37.77, -122.356]);
  const [mapZoom, setMapZoom] = useState(11);


  function fetchArrivals(stop) { fetchBARTArrivals(bart_key, stop, setArrivals, setUpdateTime, setStop); }
  function fetchStops() {fetchBARTStops(bart_key, setStops)}

  // function fetchArrivals(stop) { fetch511Arrivals(key, stop, setArrivals, setUpdateTime, setStop); }
  // function fetchStops() {fetch511Stops(key, setStops)}

  useEffect(() => {
    fetchArrivals(stop);
    fetchStops();
    const interval = setInterval(() => {
      setUpdateTime(Date.now());
      fetchArrivals(stop);
    }, REFRESH_TIME);

    return () => clearInterval(interval);
  }, [stop])

  function UpcomingHeaderRow(props) {
    if (!props.stop)
      return <p>Select a station on the map or dropdown to get started!</p>
    else
      return <p>
        Upcoming trains/buses at
        <span className='bold'> {props.stop.label}</span>.
        Last updated at {toTimeStr(lastUpdateTime)}.
      </p>
  }

  function HeaderRow(props) {
    return <div className='Header'>
      <UpcomingHeaderRow stop={props.stop}></UpcomingHeaderRow>
      <div className='refresh'>
        <InfoDialog></InfoDialog>
        {/* <button className='buttonHeader' onClick={() => { FetchData(stop); }}><InfoOutlinedIcon></InfoOutlinedIcon></button> */}
        <button className='buttonHeader' onMouseOver={() => { fetchArrivals(stop); }}><RefreshIcon></RefreshIcon></button>
      </div>
    </div>
  }

  /** When dropdown menu input changes */
  function onChange(stop, actionMeta) {
    switch (actionMeta.action) {
      case 'select-option':
        fetchArrivals(stop);
        setMapCenter(stop.location);
        setMapZoom(12);
        break;
      default:
        break;
    }
  }


  return (
    <div id="app">
      <header>
        <p style={{fontSize: '24px', fontWeight: 'bold', margin: 0, padding: 0}}>BART Arrivals 🚊 🌃</p>
        <HeaderRow stop={stop} lastUpdateTime={lastUpdateTime}></HeaderRow>
        {/* <MapContainer className="Map" center={mapCenter} zoom={mapZoom} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <div>
            <MarkersFromStops stops={stops}></MarkersFromStops>
          </div>
        </MapContainer> */}

        <Map center={mapCenter} zoom={mapZoom} stops={stops} fetchArrivals={fetchArrivals}></Map>
        <Select id="StopSelector" options={stops} onChange={onChange} />

        <FilterLinesAndDir arrivalList={arrivalList} filteredLines={filteredLines} filteredDirections={filteredDirections} setFilteredLines={setFilteredLines} setFilteredDirections={setFilteredDirections} stop={stop}></FilterLinesAndDir>

        <Arrivals arrivals={arrivalList.filter(x => !filteredLines.includes(x.lineCode) && !filteredDirections.includes(x.direction)).slice(0, MAX_ARRIVALS)}></Arrivals>

      </header>
    </div >
  );
}


export default App;
