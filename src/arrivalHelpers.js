import './App.css';

/** styling icons  */
export function iconStyle(lineCode) {
    switch (lineCode) {
        case 'C':
            return {
                'background-color': 'rgb(180, 154, 54)',
                'color': 'black'
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

