import React, { Component, SyntheticEvent } from 'react';
import classnames from 'classnames';


/*
|--------------------------------------------------------------------------
| Dropzone
|--------------------------------------------------------------------------
*/

interface Props {
  title: string,
  subtitle: string,
  onDrop: (e: DragEvent) => void,
  onClick: (e?: SyntheticEvent<HTMLDivElement>) => void,
}

interface State {
  state: string;
}


export default class Dropzone extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      state: 'idle',
    };

    this.onDrop = this.onDrop.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    switch (e.keyCode) {
      case 32: { // Space
        this.props.onClick();
        break;
      }
      default: {
        break;
      }
    }
  }

  onDragEnter() {
    this.setState({ state: 'dragging' });
  }

  onDragLeave() {
    this.setState({ state: 'idle' });
  }

  onDragOver(e: SyntheticEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  onDrop(e: SyntheticEvent<HTMLDivElement>) {
    e.preventDefault();
    this.setState({ state: 'idle' });
    if (this.props.onDrop) this.props.onDrop(e.nativeEvent as DragEvent);
  }

  render() {
    const classes = classnames('dropzone', this.state.state);

    return (
      <div
        className={classes}
        onDragEnter={this.onDragEnter}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onClick={this.props.onClick}
        onKeyDown={this.onKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className="title">{ this.props.title }</div>
        <div className="subtitle">{ this.props.subtitle }</div>
      </div>
    );
  }
}
