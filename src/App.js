import './App.css';
import bart from './img/bart.svg'
import { lineCodeShorten, iconStyle, longDirection, filterLineIconStyle, filterDirectionIconStyle, dirExpand} from './arrivalHelpers';
import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import RefreshIcon from '@mui/icons-material/Refresh';

import Map from './Map.js'
import InfoDialog from './Info';
import { filterOnClick, Filtering } from './Filtering';

const key = "80b27b9e-f65e-4c32-960a-a40a076561ba"
const REFRESH_TIME = 1200000; // 20 mins  
const MAX_ARRIVALS = 100;

const agency = 'BA';

function toTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|[\s-/])\w/g, function (match) {
    return match.toUpperCase();
  });
}

/** A list of all arriving buses/trains */
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
      lineCode: lineCodeShorten(agency, j.LineRef),
      lineName: j.PublishedLineName,
      direction: dirExpand(j.DirectionRef),
      destination: j.DestinationName,
      mins: computeMins(getExpectedTime(j))
    }))
}

function createStops(data) {
  return data?.Siri.ServiceDelivery.DataObjectDelivery.dataObjects.SiteFrame.stopPlaces.StopPlace
    .map(x => Object({
      value: x['@id'],
      label: x.Name,
      location: [parseFloat(x.Centroid.Location.Latitude), parseFloat(x.Centroid.Location.Longitude)],
      url: x.Url,
      mode: x.TransportMode
    }))
    .filter(x => {
      switch (agency) {
        case 'SF':
          return x.mode !== 'bus' && x.mode !== 'tram';
        case 'BA':
          return x.mode !== 'unknown' && x.value.substring(0, 6) !== 'place_';
        default:
          return x
      }
    }
    )
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

  function FetchStops() {
    fetch(`http://api.511.org/transit/stopplaces?api_key=${key}&operator_id=${agency}&format=json`)
      .then(res => res.json())
      .then(res => { setStops(createStops(res)) })
      .catch(error => console.log(error.message));
  }

  function FetchData(stop) {
    if (stop)
      fetch("http://api.511.org/transit/StopMonitoring?api_key=" + key + "&agency=" + agency + "&format=json&stopcode=" + stop.value)
        .then(res => res.json())
        .then(res => { setArrivals(createArrivals(res)) })
        .then(() => setUpdateTime(Date.now()))
        .then(() => setStop(stop))
        // .then(() => setMapCenter(mapCenter))
        .catch(error => console.log(error.message));
  }

  useEffect(() => {
    FetchData(stop);
    FetchStops();

    const interval = setInterval(() => {
      setUpdateTime(Date.now());
      FetchData(stop);
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
      <img src={bart} className="BART" alt="BART Logo" />
      <UpcomingHeaderRow stop={props.stop}></UpcomingHeaderRow>
      <div className='refresh'>
        <InfoDialog></InfoDialog>
        {/* <button className='buttonHeader' onClick={() => { FetchData(stop); }}><InfoOutlinedIcon></InfoOutlinedIcon></button> */}
        <button className='buttonHeader' onMouseOver={() => { FetchData(stop); }}><RefreshIcon></RefreshIcon></button>
      </div>
    </div>
  }

  /** When dropdown menu input changes */
  function onChange(valueMeta, actionMeta) {
    switch (actionMeta.action) {
      case 'select-option':
        FetchData(valueMeta);
        setMapCenter(valueMeta.location);
        setMapZoom(12);
        break;
      default:
        break;
    }
  }


  const StopSelector = () => (
    <Select id="StopSelector" options={stops} onChange={onChange} />
  );

  // function FilteringLines() {
  //   if (stop) {
  //   var lineCodes = [...new Set(arrivalList.map(x => x.lineCode))];
  //   lineCodes.sort();
  //     return <div className='Filtering'>
  //       <p style={{marginRight: '0.75rem'}}>Filter: </p>
  //       {
  //         lineCodes.map((x) => {
  //           return <i style={filterLineIconStyle(filteredLines, x)} className='lineIconFilter' onClick={() => filterOnClick(filteredLines, setFilteredLines, x)}>{x}</i>;
  //         }
  //         )
  //       }
  //     </div >
  //   }
  //   else return <div></div>
  // }

  // function FilteringDirections() {
  //   var directions = [...new Set(arrivalList.map(x => x.direction))];
  //   directions.sort();
  //   return <div className='Filtering'>
  //     {
  //       directions.map((x) => {
  //         return <i style={filterDirectionIconStyle(filteredDirections, x)} className='directionIconFilter' onClick={() => filterOnClick(filteredDirections, setFilteredDirections, x)}>{dirExpand(x)}</i>;
  //       }
  //       )
  //     }
  //   </div>

  // }

  function FilterLinesAndDir() {
    if (stop) {
      return <div className='FilterLinesAndDir'>
        <div className='Filtering'>
          <p style={{marginRight: '0.75rem'}}>Lines:</p>
          <Filtering arrivalList={arrivalList} attrSelector={x => x.lineCode} iconStyle='lineIconFilter' filterIconStyle={filterLineIconStyle} filteredAttrs={filteredLines} setFilteredAttrs={setFilteredLines}></Filtering>
        </div>
        <div style={{}} className='Filtering'>
          <p style={{marginRight: '0.75rem'}}>Directions:</p>
          <Filtering arrivalList={arrivalList} attrSelector={x=>x.direction} iconStyle='directionIconFilter' filterIconStyle={filterDirectionIconStyle} filteredAttrs={filteredDirections} setFilteredAttrs={setFilteredDirections}></Filtering>
        </div>
      </div>
    }
    else {
      return <div></div>
    }
  }


  return (
    <div id="app">
      <header>
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

        <Map center={mapCenter} zoom={mapZoom} stops={stops} FetchData={FetchData}></Map>
        <StopSelector></StopSelector>

        <FilterLinesAndDir></FilterLinesAndDir>

        <Arrivals liProps={arrivalList.filter(x => !filteredLines.includes(x.lineCode) && !filteredDirections.includes(x.direction)).slice(0, MAX_ARRIVALS)}></Arrivals>

      </header>
    </div >
  );
}


export default App;
