import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/*
|--------------------------------------------------------------------------
| CheckboxSetting
|--------------------------------------------------------------------------
*/

export default class CheckboxSetting extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    defaultValue: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    description: PropTypes.string,
  }

  static defaultProps = {
    description: '',
  }

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    this.props.onClick(e.target.checked);
  }

  render() {
    const { slug, title, description } = this.props;
    return (
      <div className="setting-section">
        <div className="checkbox">
          <label htmlFor={`setting-option-${slug}`}>
            <input
              id={`setting-option-${slug}`}
              type="checkbox"
              onClick={this.onClick}
              defaultChecked={this.props.defaultValue}
            />
            <span className="setting-title">{ title }</span>
            <p className="setting-description">{ description }</p>
          </label>
        </div>
      </div>
    );
  }
}
