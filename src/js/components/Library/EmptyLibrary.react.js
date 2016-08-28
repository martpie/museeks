import React, { PureComponent } from 'react';

export default class LoadingLibrary extends PureComponent {

    static propTypes = {
        message: React.PropTypes.string
    }

    render() {
        return (
            <div className='full-message'>
                <p>{ this.props.message }</p>
            </div>
        );
    }
}
