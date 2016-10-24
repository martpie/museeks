import React, { PureComponent } from 'react';

/*
|--------------------------------------------------------------------------
| CheckboxSetting
|--------------------------------------------------------------------------
*/

export default class CheckboxSetting extends PureComponent {

    static propTypes = {
        title: React.PropTypes.string,
        description: React.PropTypes.string,
        defaultValue: React.PropTypes.bool,
        onClick: React.PropTypes.func
    }

    constructor(props) {

        super(props);

        this.onClick = this.onClick.bind(this);
    }

    render() {

        return (
            <div className='setting-section'>
                <h4>{ this.props.title }</h4>
                <div className='checkbox'>
                    <label>
                        <input type='checkbox'
                               onClick={ this.onClick }
                               defaultChecked={ this.props.defaultValue }
                        />
                        { this.props.description }
                        </label>
                    </div>
            </div>
        );
    }

    onClick(e) {

        this.props.onClick(e.target.checked);
    }
}
