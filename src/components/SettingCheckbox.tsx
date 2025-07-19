import { useId } from 'react';

import Flexbox from '../elements/Flexbox';
import * as Setting from './Setting';
import styles from './SettingCheckbox.module.css';

type Props = {
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
};

export default function CheckboxSetting(props: Props) {
  const { title, description } = props;
  const id = useId();

  return (
    <div className={styles.checkbox}>
      <Flexbox gap={8} align="center">
        <input
          id={id}
          type="checkbox"
          onChange={(e) => props.onChange(e.currentTarget.checked)}
          checked={props.value}
        />
        <Setting.Label htmlFor={id} noMargin>
          {title}
        </Setting.Label>
      </Flexbox>
      <Setting.Description>{description}</Setting.Description>
    </div>
  );
}
