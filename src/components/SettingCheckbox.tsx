import Flexbox from '../elements/Flexbox';
import * as Setting from './Setting';
import styles from './SettingCheckbox.module.css';

type Props = {
  title: string;
  slug: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
};

export default function CheckboxSetting(props: Props) {
  const { slug, title, description } = props;
  return (
    <div className={styles.checkbox}>
      <Flexbox gap={8} align="center">
        <input
          id={`setting-${slug}`}
          type="checkbox"
          onChange={(e) => props.onChange(e.currentTarget.checked)}
          checked={props.value}
        />
        <Setting.Label htmlFor={`setting-${slug}`} noMargin>
          {title}
        </Setting.Label>
      </Flexbox>
      <Setting.Description>{description}</Setting.Description>
    </div>
  );
}
