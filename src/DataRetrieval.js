import { map } from "leaflet";
import { lineCodeShorten, directionExpand, capitalize } from "./arrivalHelpers";

const agency = 'BA';

function parse511Stops(data) {
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

function parse511Arrivals(data) {
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
    
  return data?.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit
  .map(x => x.MonitoredVehicleJourney)
  .map(j => Object({
    lineCode: lineCodeShorten(agency, j.LineRef),
    lineName: j.PublishedLineName,
    direction: directionExpand(j.DirectionRef),
    destination: j.DestinationName,
    mins: computeMins(getExpectedTime(j))
  }))
}


export function fetch511Stops(key, setStops) {
    fetch(`http://api.511.org/transit/stopplaces?api_key=${key}&operator_id=${agency}&format=json`)
      .then(res => res.json())
      .then(res => { setStops(parse511Stops(res)) })
      .catch(error => console.log(error.message));
}

export function fetch511Arrivals(key, stop, setArrivals, setUpdateTime, setStop ) {
    if (stop)
        fetch("http://api.511.org/transit/StopMonitoring?api_key=" + key + "&agency=" + agency + "&format=json&stopcode=" + stop.value)
        .then(res => res.json())
        .then(res => { setArrivals(parse511Arrivals(res)) })
        .then(() => setUpdateTime(Date.now()))
        .then(() => setStop(stop))
        // .then(() => setMapCenter(mapCenter))
        .catch(error => console.log(error.message));
}

function parseBARTStops(data) {
    return data.root.stations.station.map(x => Object({
        value: x.abbr,
        label: x.name,
        // location: [37.77, -122.41]
    }));
}

function getBARTStopsLocations(key, parsed_stop_data, setStops)
{
    var stops = [];
    for (const curr_stop of parsed_stop_data) {
      fetch(`https://api.bart.gov/api/stn.aspx?cmd=stninfo&key=${key}&orig=${curr_stop.value}&json=y`)
        .then(res => res.json())
        .then(res => res.root.stations.station)
        .then(x => { curr_stop.location = [parseFloat(x.gtfs_latitude), parseFloat(x.gtfs_longitude)]; stops = stops.concat([curr_stop]); setStops(stops) })
        .catch(error => {console.log(error.message); console.log("Error found!");});
    }
}

export function fetchBARTStops(key, setStops) {
    fetch(
        `https://api.bart.gov/api/stn.aspx?cmd=stns&json=y&key=${key}`
        // ,
        // {
        //     headers: { 'Access-Control-Allow-Origin': '*'}
        // }
    )
        .then(res => res.json())
        .then(res => parseBARTStops(res))
        .then(parsed => getBARTStopsLocations(key, parsed, setStops))
        .catch(error => {console.log(error.message); console.log("Error found!");});
}


function parseBARTArrivals(data){
  return data?.root.station[0].etd.map(
    a => a.estimate.map(
      est => Object(
        {
          lineCode: capitalize(est.color),
          lineName: a.destination,
          color: capitalize(est.color),
          hexcolor: est.hexcolor,
          direction: capitalize(est.direction),
          destination: a.destination,
          mins: est.minutes
        }
      )
    )
  ).flat().sort((a,b)=>parseInt(a.mins) - parseInt(b.mins))

}

export function fetchBARTArrivals(key, stop, setArrivals, setUpdateTime, setStop) {
    if (stop)
      fetch(`https://api.bart.gov/api/etd.aspx?cmd=etd&key=${ key }&orig=${ stop.value }&json=y`
        // ,
        // {
        //     headers: { 'Access-Control-Allow-Origin': '*'}
        // }
        )
          .then(res => res.json())
          .then(res => { 
              setArrivals(parseBARTArrivals(res)); 
              setUpdateTime(Date.parse(res.root.date + ' ' + res.root.time))
            })
          .then(() => setStop(stop))
          .catch(error => console.log(error.message));
}
