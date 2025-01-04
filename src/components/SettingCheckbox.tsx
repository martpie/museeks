import cx from 'classnames';

import * as Setting from './Setting';

import styles from './SettingCheckbox.module.css';

type Props = {
  title: string;
  slug: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
};

export default function CheckboxSetting(props: Props) {
  const { slug, title, description, disabled } = props;

  const classNames = cx(styles.checkbox, { [styles.disabled]: disabled });

  return (
    <div className={classNames}>
      <input
        id={`setting-${slug}`}
        type="checkbox"
        onChange={(e) => props.onChange(e.currentTarget.checked)}
        checked={props.value}
        disabled={disabled}
      />
      <Setting.Label htmlFor={slug} noMargin>
        {title}
      </Setting.Label>
      <Setting.Description>{description}</Setting.Description>
    </div>
  );
}
