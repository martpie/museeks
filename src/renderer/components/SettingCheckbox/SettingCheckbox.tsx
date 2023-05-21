import * as Setting from '../Setting/Setting';

import styles from './SettingCheckbox.module.css';

type Props = {
  title: string;
  slug: string;
  defaultValue: boolean;
  onClick: (value: boolean) => void;
  description?: string;
};

export default function CheckboxSetting(props: Props) {
  const { slug, title, description } = props;
  return (
    <Setting.Section>
      <div className={styles.checkbox}>
        <Setting.Label htmlFor={`setting-${slug}`}>
          <input
            id={`setting-${slug}`}
            type='checkbox'
            onClick={(e) => props.onClick(e.currentTarget.checked)}
            defaultChecked={props.defaultValue}
          />
          <Setting.Title>{title}</Setting.Title>
          <Setting.Description>{description}</Setting.Description>
        </Setting.Label>
      </div>
    </Setting.Section>
  );
}
