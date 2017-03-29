import React from 'react';

const colours = [
    '#D50000','#FF4081','#CE93D8','#AA00FF','#B39DDB','#6200EA','#3F51B5','#1A237E','#2962FF','#0091EA','#00B8D4','#00BFA5',
    '#A5D6A7','#00C853','#64DD17','#E6EE9C','#AEEA00','#FFD600','#FFAB00','#FF6D00','#FFAB91','#DD2600','#455A64','#263238'
];

export default (props) => {
    const { style, name, ...otherProps } = props;
    let { shape, size } = props;
    size = size || 25;
    shape = shape || 'square';

    const baseStyles = {
        borderRadius   : shape === 'square' ? '3px' : '50%',
        width          : `${size}px`,
        height         : `${size}px`,
        display        : 'flex',
        justifyContent : 'center',
        alignItems     : 'center',
    };

    const getColorIndex = (name) => {
        const firstLetterNumber = name.toLowerCase().charCodeAt(0) - 97;
        // Make sure it is between 0 and 24
        const firstLetterNumberNormalised = firstLetterNumber < 24 && firstLetterNumber >= 0 ? firstLetterNumber : 5;
        return Math.floor(firstLetterNumberNormalised * colours.length / 24);
    };

    const getInitials = (name) => {
        const nameSplit = name.replace('_',' ').replace('-',' ').replace('/',' ').split(' ');
        return nameSplit.length >= 2 ? `${nameSplit[0][0]}${nameSplit[1][0]}` : `${name[0]}${name[1]}`;
    };


    const colorStyles = {
        background: name ? colours[getColorIndex(name)] : '#eaeaea',
        color: 'white',
        fontSize: size > 25 ? '14px' : '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    };

    const actualStyles = Object.assign({}, baseStyles, colorStyles, style);

    return (
        <div style={ actualStyles } title={ name } { ... otherProps } >
            { name ? getInitials(name) : '  ' }
        </div>
    );
};
