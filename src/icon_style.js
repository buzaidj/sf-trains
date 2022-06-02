/** styling icons  */
export function iconStyle(lineCode) {
    switch (lineCode) {
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