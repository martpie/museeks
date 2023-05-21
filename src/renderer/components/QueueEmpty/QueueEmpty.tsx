import styles from './QueueEmpty.module.css';

function QueueEmpty() {
  return <div className={`${styles.queue__empty} text-center`}>queue is empty</div>;
}

export default QueueEmpty;
