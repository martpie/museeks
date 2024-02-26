import styles from './QueueEmpty.module.css';

export default function QueueEmpty() {
  return (
    <div className={`${styles.queue__empty} text-center`}>queue is empty</div>
  );
}
