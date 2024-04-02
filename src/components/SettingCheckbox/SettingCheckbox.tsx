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
    <div className={styles.checkbox}>
      <input
        id={`setting-${slug}`}
        type="checkbox"
        onClick={(e) => props.onClick(e.currentTarget.checked)}
        defaultChecked={props.defaultValue}
      />
      <Setting.Label htmlFor={slug} noMargin>
        {title}
      </Setting.Label>
      <Setting.Description>{description}</Setting.Description>
    </div>
  );
}
