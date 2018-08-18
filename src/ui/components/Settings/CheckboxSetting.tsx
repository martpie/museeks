import React, { PureComponent } from 'react';

/*
|--------------------------------------------------------------------------
| CheckboxSetting
|--------------------------------------------------------------------------
*/

interface Props {
  title: string,
  slug: string,
  defaultValue: boolean,
  onClick: (value: boolean) => void,
  description?: string,
}


export default class CheckboxSetting extends PureComponent<Props> {
  static defaultProps = {
    description: '',
  }

  constructor(props: Props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e: React.MouseEvent<HTMLInputElement>) {
    this.props.onClick(e.currentTarget.checked);
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
