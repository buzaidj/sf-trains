import './App.css';

function style(backgroundColor, textColor = 'white') {
    return {
        'background-color': backgroundColor,
        'color': textColor
    }
}

function bartShorten(lineCode) {
    return lineCode.split('-')[0]
}

export function longDirection(dir) {
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


export function lineCodeShorten(agency, lineCode) {
    switch (agency) {
        case 'BA':
            return bartShorten(lineCode);
        default:
            return lineCode;
    }
}


/** styling icons  */
export function iconStyle(lineCode) {
    switch (lineCode) {
        case 'Yellow-N':
        case 'Yellow-S':
        case 'Yellow':
            return style('#D7D700', 'white')
        case 'Green-N':
        case 'Green-S':
        case 'Green':
            return style('#6BB557')
        case 'Orange-N':
        case 'Orange-S':
        case 'Orange':
            return style('#EEA941')
        case 'Red-N':
        case 'Red-S':
        case 'Red':
            return style('#D93832');
        case 'C':
        case 'F':
        case 'PM':
        case 'PH':
            return {
                'background-color': 'rgb(180, 154, 54)',
                'color': 'black'
            }
        case 'N-OWL':
        case 'N OWL':
        case 'L-OWL':
            return {
                'background-color': 'rgb(102, 102, 102)',
                'color': 'white'
            }

        case 'KT':
            return {
                'background-color': 'black',
                'color': 'rgb(255, 255, 255)'

            }
        case 'M':
            return {
                'background-color': 'rgb(0, 133, 71)',
                'color': 'rgb(255, 255, 255)'
            }
        case 'J':
            return {
                'background-color': '#a96614',
                'color': '#fff'

            }
        case 'S':
            return {
                'background-color': '#ffd600',
                'color': '#000'
            }
        default:
            return {
                'background-color': 'rgb(0, 91, 149)',
                'color': 'rgb(255, 255, 255)'
            }
    }
}

export function filterLineIconStyle(filteredLines, lineCode) {
    if (filteredLines && !filteredLines.includes(lineCode)) {
      return iconStyle(lineCode);
    }
    else {
      return { 'backgroundColor': 'gray', 'color': 'lightgray' };
    }
}

export function filterDirectionIconStyle(filteredDirections, dirCode) {
    if (filteredDirections && !filteredDirections.includes(dirCode)) {
        return {'backgroundColor': 'black', 'color': 'white'};
    }
    else {
        return { 'backgroundColor': 'gray', 'color': 'lightgray' };
    }
}

export function dirExpand(dir){
    switch (dir){
        case 'N': return 'North';
        case 'S': return 'South';
        case 'E': return 'East';
        case 'W': return 'West';
        default: return dir;
    }

}