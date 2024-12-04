import styles from './QueueEmpty.module.css';

export default function QueueEmpty() {
  return (
    <div className={`${styles.queueEmpty} text-center`}>queue is empty</div>
  );
}
