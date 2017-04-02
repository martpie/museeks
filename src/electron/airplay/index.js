import AirTunesServer from 'nodetunes';
import Speaker from 'speaker';

class AirplayServer {

    constructor(lib) {
        this.lib = lib;

        this.airtunes = new AirTunesServer({ serverName: 'Muzeeks' });

        this.speaker = new Speaker({
            channels: 2,
            bitDepth: 16,
            sampleRate: 44100
        });

        this.airtunes.on('clientConnected', (newStream) => {
            // keep a copy of our audio stream
            this.stream = newStream;

            // stop the player playing
            lib.store.dispatch(lib.actions.player.stop());

            // play the audio stream through the local speakers
            newStream.pipe(this.speaker);
        });

        this.airtunes.on('metadataChange', (metadata) => {
            lib.store.dispatch(lib.actions.player.setMetadata({
                title: metadata.minm,
                artist: [metadata.asar],
                album: metadata.asal,
                owner: {
                    isLocal: true
                }
            }));

            lib.store.dispatch(lib.actions.player.play());
        });

        this.airtunes.on('volumeChange', (volume) => volume);

        // doesn't seem to work unfortunately
        this.airtunes.on('artworkChange', (artwork) => artwork);

        this.airtunes.on('clientDisconnected', () => {
            // update the player state
            lib.store.dispatch(lib.actions.player.stop());

            // stop sending the client's audio to the speakers
            this.stream.unpipe();
        });
    }

    start() {
        this.airtunes.start();
    }
}

export default AirplayServer;
