/**
 * A drop-in replacement for HTMLAudioElement that uses the Web Audio API.
 *
 * On Linux/WebKitGTK, using a native <audio> element causes WebKitGTK to
 * register its own MPRIS entry with active playback status alongside our
 * native one. This class plays audio through AudioContext instead, so
 * WebKitGTK's MPRIS entry stays inactive (Stopped).
 */

type EventHandler = (...args: unknown[]) => void;

export class WebAudioElement {
  private ctx: AudioContext;
  private gainNode: GainNode;
  private buffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private _src = '';
  private _volume = 1;
  private _muted = false;
  private _playbackRate = 1;
  private _defaultPlaybackRate = 1;
  private _paused = true;
  private _currentTime = 0;
  private _startedAt = 0; // AudioContext.currentTime when playback started
  private _offsetTime = 0; // Offset into the buffer in seconds
  private timeupdateInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private abortController: AbortController | null = null;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.ctx = new AudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);
  }

  get src(): string {
    return this._src;
  }

  set src(url: string) {
    this._src = url;
    this.stop();

    if (!url) return;

    this.loadPromise = this.loadAudio(url);
  }

  get paused(): boolean {
    return this._paused;
  }

  get currentTime(): number {
    if (!this._paused && this.sourceNode) {
      return (
        this._offsetTime +
        (this.ctx.currentTime - this._startedAt) * this._playbackRate
      );
    }
    return this._currentTime;
  }

  set currentTime(time: number) {
    this._currentTime = time;
    this._offsetTime = time;

    if (!this._paused && this.buffer) {
      this.startPlayback(time);
    }
  }

  get duration(): number {
    return this.buffer?.duration ?? 0;
  }

  get volume(): number {
    return this._volume;
  }

  set volume(v: number) {
    this._volume = v;
    this.gainNode.gain.value = this._muted ? 0 : v;
    this.dispatch('volumechange');
  }

  get muted(): boolean {
    return this._muted;
  }

  set muted(m: boolean) {
    this._muted = m;
    this.gainNode.gain.value = m ? 0 : this._volume;
    this.dispatch('volumechange');
  }

  get playbackRate(): number {
    return this._playbackRate;
  }

  set playbackRate(rate: number) {
    if (this.sourceNode) {
      // Save current position before rate change
      this._currentTime = this.currentTime;
      this._offsetTime = this._currentTime;
      this._startedAt = this.ctx.currentTime;
      this.sourceNode.playbackRate.value = rate;
    }
    this._playbackRate = rate;
  }

  get defaultPlaybackRate(): number {
    return this._defaultPlaybackRate;
  }

  set defaultPlaybackRate(rate: number) {
    this._defaultPlaybackRate = rate;
  }

  get error(): MediaError | null {
    return null;
  }

  async play(): Promise<void> {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Wait for pending load to complete
    if (this.loadPromise) {
      await this.loadPromise;
    }

    if (!this.buffer) return;

    if (this._paused) {
      this.startPlayback(this._currentTime);
      this._paused = false;
      this.dispatch('play');
      this.startTimeUpdate();
    }
  }

  pause(): void {
    if (!this._paused) {
      this._currentTime = this.currentTime;
      this._offsetTime = this._currentTime;
      this.stopSource();
      this._paused = true;
      this.dispatch('pause');
      this.stopTimeUpdate();
    }
  }

  addEventListener(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  removeEventListener(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  private dispatch(event: string): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler();
      }
    }
  }

  private async loadAudio(url: string): Promise<void> {
    // Cancel any in-progress fetch
    this.abortController?.abort();
    this.abortController = new AbortController();

    this.dispatch('loadstart');

    try {
      const response = await fetch(url, {
        signal: this.abortController.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // Check if the src changed while we were fetching
      if (this._src !== url) return;

      this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
      this._currentTime = 0;
      this._offsetTime = 0;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return; // Expected when src changes
      }
      this.dispatch('error');
    }
  }

  private startPlayback(fromTime: number): void {
    this.stopSource();

    if (!this.buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffer;
    source.playbackRate.value = this._playbackRate;
    source.connect(this.gainNode);
    source.onended = () => {
      if (this.sourceNode === source && !this._paused) {
        this._paused = true;
        this._currentTime = this.buffer?.duration ?? 0;
        this.stopTimeUpdate();
        this.dispatch('ended');
      }
    };

    const offset = Math.max(0, Math.min(fromTime, this.buffer.duration));
    source.start(0, offset);
    this._startedAt = this.ctx.currentTime;
    this._offsetTime = offset;
    this.sourceNode = source;
  }

  private stopSource(): void {
    if (this.sourceNode) {
      this.sourceNode.onended = null;
      try {
        this.sourceNode.stop();
      } catch {
        // ignore if already stopped
      }
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }

  private stop(): void {
    this._currentTime = 0;
    this._offsetTime = 0;
    this._paused = true;
    this.stopSource();
    this.stopTimeUpdate();
    this.buffer = null;
  }

  private startTimeUpdate(): void {
    this.stopTimeUpdate();
    this.timeupdateInterval = setInterval(() => {
      if (!this._paused) {
        this.dispatch('timeupdate');
      }
    }, 250);
  }

  private stopTimeUpdate(): void {
    if (this.timeupdateInterval !== null) {
      clearInterval(this.timeupdateInterval);
      this.timeupdateInterval = null;
    }
  }
}
