import * as React from 'react';

import * as Setting from '../Setting/Setting';

import * as styles from './SettingCheckbox.css';

interface Props {
  title: string;
  slug: string;
  defaultValue: boolean;
  onClick: (value: boolean) => void;
  description?: string;
}

export default class CheckboxSetting extends React.PureComponent<Props> {
  static defaultProps = {
    description: ''
  };

  constructor (props: Props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick (e: React.MouseEvent<HTMLInputElement>) {
    this.props.onClick(e.currentTarget.checked);
  }

  render () {
    const { slug, title, description } = this.props;
    return (
      <Setting.Section>
        <div className={styles.checkbox}>
          <Setting.Label htmlFor={`setting-${slug}`}>
            <input
              id={`setting-${slug}`}
              type='checkbox'
              onClick={this.onClick}
              defaultChecked={this.props.defaultValue}
            />
            <Setting.Title>{title}</Setting.Title>
            <Setting.Description>{description}</Setting.Description>
          </Setting.Label>
        </div>
      </Setting.Section>
    );
  }
}
