import styles from './Scrollable.module.css';

type Props = {
  children: React.ReactNode;
  ref: React.Ref<HTMLDivElement>;
  className?: string;
};

export default function Scrollable(props: Props) {
  const className = props.className
    ? `${styles.scrollable} ${props.className}`
    : styles.scrollable;

  return (
    <div className={className} ref={props.ref}>
      {props.children}
    </div>
  );
}
