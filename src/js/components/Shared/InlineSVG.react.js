var React = require('react');
var assign = require('object-assign');


var InlineSVG = React.createClass({
    getDefaultProps: function() {
        return {
            element: 'i'
        };
    },
    propTypes: {
        src: React.PropTypes.string.isRequired,
        element: React.PropTypes.string
    },
    render: function() {
        return React.createElement(this.props.element, assign({
            dangerouslySetInnerHTML: { __html: this.props.src }
        }, this.props));
    }
});

module.exports = InlineSVG;
