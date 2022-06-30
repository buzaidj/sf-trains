import React, { useState } from 'react'


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
export function filterOnClick(filteredAttrs, setFilteredAttrs, attrClicked) {
    if (!filteredAttrs.includes(attrClicked)) {
        // attrClicked is not the filtered attrs, add it 
        setFilteredAttrs(filteredAttrs.concat([attrClicked]));
    }
    else {
        // attrClicked is in the filtered attrs, remove it
        setFilteredAttrs(filteredAttrs.filter((v, _) => v !== attrClicked));
    }
}


export function Filtering({arrivalList, attrSelector, iconStyle, filterIconStyle, filteredAttrs, setFilteredAttrs}) {    
    var attrs = [...new Set(arrivalList.map(attrSelector))];
    attrs.sort();
    return <div>{attrs.map((attr) => { return <i style={filterIconStyle(filteredAttrs, attr)} className={iconStyle} onClick={() => filterOnClick(filteredAttrs, setFilteredAttrs, attr)}>{attr}</i> })}</div>
}


//   function FilteringOld() {
//     var lineCodes = [...new Set(arrivalList.map(x => x.lineCode))];
//     if (stop)
//       return <div className='Filtering'>
//         <p>Filter:</p>
//         {
//           lineCodes.map((x) => {
//             return <i style={filterIconStyle(x)} className='lineIconFilter' onClick={() => filterOnClick(filteredLines, setFilteredLines, x)}>{x}</i>;
//           }
//           )
//         }
//       </div >
//     else return <div></div>
//   }
