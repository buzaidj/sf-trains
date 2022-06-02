import './App.css';
import { iconStyle } from './icon_style';
import React, { Component, useState } from 'react'
import Select, { InputActionMeta } from 'react-select'
import opts from './options.json'
import RefreshIcon from '@mui/icons-material/Refresh';

const options = opts.options

const arrivals =
  [
    { mins: 5, lineCode: 'N', lineName: 'Judah', direction: 'Outbound' },
    { mins: 7, lineCode: 'S', lineName: 'Shuttle', direction: 'Outbound' },
    { mins: 11, lineCode: 'M', lineName: 'Ocean View', direction: 'Outbound' },
    { mins: 12, lineCode: 'KT', lineName: 'KT: K Ingleside-T Third Street', direction: 'Outbound' },
  ]

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

/** Returns a row for a given arrival with props mins 
 * (an integer), lineCode (e.g. N), lineName (e.g. Judah) 
 * and direction (e.g. outbound) */
function ArrivalRow(props) {
  return <div className='ArrivalRow'>
    <p className='mins'><span className='minsNum'>{props.mins}</span> mins away</p>
    <i style={iconStyle(props.lineCode)} className='lineIcon'>{props.lineCode}</i>
    <p className='lineName'>{props.lineName}</p>
    <p className='direction'>{props.direction}</p>
  </div>;
}

function toTimeStr(date) { return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }


function App() {
  const [choice, setChoice] = useState(options[0])
  const [lastUpdateTime, setUpdateTime] = useState(Date.now())
  const [arrivalList, setArrivals] = useState([])

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
        setChoice(valueMeta);
    }
  }


  const StopSelector = () => (
    <Select id="StopSelector" options={options} onChange={onChange} />
  );


  return (
    <div id="app">
      <header>
        <HeaderRow station={choice.label} lastUpdateTime={lastUpdateTime}></HeaderRow>

        <StopSelector></StopSelector>
        <Arrivals liProps={arrivals}></Arrivals>

      </header>
    </div >
  );
}

export default App;


