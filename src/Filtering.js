import React, { useState } from 'react'
import { filterLineIconStyle, filterDirectionIconStyle} from './arrivalHelpers';
import './App.css';


/**
 * filterOnClick controls the React hook logic for changing the 
 * currenently filtered attributes
 * 
 * these attributes may be direction or line color
 * 
 * O(n) where n is the number of attributes
 * 
 * @param {Array[string]} filteredAttrs The list of all filtered attributes
 * @param {Array[string] => ()} setFilteredAttrs React hook function to set filtered attributes
 * @param {string} attrClicked The attribute that was clicked
 */
function filterOnClick(filteredAttrs, setFilteredAttrs, attrClicked) {
    if (!filteredAttrs.includes(attrClicked)) {
        // attrClicked is not the filtered attrs, add it 
        setFilteredAttrs(filteredAttrs.concat([attrClicked]));
    }
    else {
        // attrClicked is in the filtered attrs, remove it
        setFilteredAttrs(filteredAttrs.filter((v, _) => v !== attrClicked));
    }
}


function Filtering({arrivalList, attrSelector, iconStyle, filterIconStyle, filteredAttrs, setFilteredAttrs}) {    
    var attrs = [...new Set(arrivalList.map(attrSelector))];
    attrs.sort();
    return <div>{attrs.map((attr) => { return <i style={filterIconStyle(filteredAttrs, attr)} className={iconStyle} onClick={() => filterOnClick(filteredAttrs, setFilteredAttrs, attr)}>{attr}</i> })}</div>
}

export function FilterLinesAndDir({arrivalList, filteredLines, filteredDirections, setFilteredLines, setFilteredDirections, stop}) {
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