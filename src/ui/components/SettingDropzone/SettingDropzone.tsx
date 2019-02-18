import * as React from 'react';

import * as styles from './SettingDropzone.css';

interface Props {
  title: string;
  subtitle: string;
  onDrop: (e: DragEvent) => void;
  onClick: (e?: React.SyntheticEvent<HTMLDivElement>) => void;
}

interface State {
  state: string;
}

export default class Dropzone extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {
      state: 'idle'
    };

    this.onDrop = this.onDrop.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onKeyDown (e: React.KeyboardEvent<HTMLDivElement>) {
    e.persist();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    switch (e.nativeEvent.code) {
      case 'Space': {
        this.props.onClick();
        break;
      }
      default: {
        break;
      }
    }
  }

  onDragEnter () {
    this.setState({ state: 'dragging' });
  }

  onDragLeave () {
    this.setState({ state: 'idle' });
  }

  onDragOver (e: React.SyntheticEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  onDrop (e: React.SyntheticEvent<HTMLDivElement>) {
    e.preventDefault();
    this.setState({ state: 'idle' });
    if (this.props.onDrop) this.props.onDrop(e.nativeEvent as DragEvent);
  }

  render () {
    return (
      <div
        className={`${styles.dropzone} -is-${this.state.state}`}
        onDragEnter={this.onDragEnter}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onClick={this.props.onClick}
        onKeyDown={this.onKeyDown}
        role='button'
        tabIndex={0}
      >
        <div className={styles.dropzone__title}>{ this.props.title }</div>
        <div className={styles.dropzone__subtitle}>{ this.props.subtitle }</div>
      </div>
    );
  }
}
