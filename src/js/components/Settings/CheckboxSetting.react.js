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
                <div className='checkbox'>
                    <label>
                        <input type='checkbox'
                               onClick={ this.onClick }
                               defaultChecked={ this.props.defaultValue }
                        />
                        <span className='setting-title'>{ this.props.title }</span>
                        <p className='setting-description'>{ this.props.description }</p>
                    </label>
                </div>
            </div>
        );
    }

    onClick(e) {

        this.props.onClick(e.target.checked);
    }
}
