/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

views.settings = React.createClass({

    render: function() {
        return (
            <div className={'view view-settings view-withpadding'}>

                <h2>Settings</h2>
                <hr />

                {/* Music folders & library refresh*/}
                <MusicFoldersList />

            </div>
        );
    }
});



/*
|--------------------------------------------------------------------------
| Child - MusicFoldersList - manage import folders for library
|--------------------------------------------------------------------------
*/

var MusicFoldersList = React.createClass({

    getInitialState: function (){
        return {
            musicFolders      : nconf.get('musicFolders'),
            refreshingLibrary : false
        };
    },

    render: function () {


        var list = this.state.musicFolders.map(function(folder, i) {
            return(
                <li key={i}>
                    <Button onClick={ this.removeFolder } data-target={ i } bsSize={'xsmall'} className={'delete-libray-folder'}>Delete folder</Button>
                    { folder }
                </li>
            );
        }.bind(this));

        return (
            <div className="settings-musicfolder">
                <h4>Library folders</h4>

                <p>You currently have { this.state.musicFolders.length } folder{ this.state.musicFolders.length < 2 ? '' : 's' } folders in your library.</p>

                <ul className="musicfolders-list">
                    { list }
                </ul>

                <ButtonGroup>
                    <Button onClick={ this.addFolder }>
                        <i className={'fa fa-plus'}></i>
                        Import a folder
                    </Button>
                    <Button onClick={ this.refreshLibrary }>
                        <i className={ !this.state.refreshingLibrary ? 'fa fa-refresh' : 'fa fa-refresh fa-spin' }></i>
                        { !this.state.refreshingLibrary ? 'Refresh Library' : 'Refreshing Library'}
                    </Button>
                    <Button bsStyle={'danger'} onClick={ this.resetLibrary }>Reset library</Button>
                </ButtonGroup>

                <hr />
            </div>
        );
    },

    addFolder: function () {

        var self    = this;
        var folders = dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections']});

        folders.forEach(function (folder) {

            nconf.set('musicFolders', nconf.get('musicFolders').concat(folder));
            nconf.save(function (err) {
                if(!err) {
                    alerts.add('success', 'The folder ' + folder + ' was added to your library.' );

                    self.setState({
                        musicFolders: self.state.musicFolders.concat([folder])
                    });

                } else {
                    alerts.add('danger', 'The folder ' + folder + ' could not be added to your library.' );
                    throw err;
                }
            });
        });
    },

    removeFolder: function (e) {

        var mf = nconf.get('musicFolders');
        var removedFolder = mf.splice(e.target.getAttribute('data-target'), 1);

        this.setState({
            musicFolders: mf

        }, function () {

            nconf.save(function (err) {
                if(!err) {
                    alerts.add('success', 'The folder ' + removedFolder + ' was removed from your library.' );
                } else {
                    alerts.add('danger', 'The folder ' + removedFolder + ' could not be removed from your library.' );
                }
            });
        });
    },

    resetLibrary: function () {
        db.reset();
    },

    refreshLibrary: function () {

        var start   = new Date().getTime();
        var comp    = this;
        var folders = nconf.get('musicFolders');

        db.reset();

        comp.setState({
            refreshingLibrary: true
        }, function () {

            // Start the big thing

            folders.forEach(function(folder, index, folders) {

                walker  = walk.walk(folder, { followLinks: false });

                walker.on("file", function (root, fileStat, next) {
                    fs.readFile(path.resolve(root, fileStat.name), function (buffer) {

                        var file = path.join(root, fileStat.name);

                        if(supportedFormats.indexOf(mime.lookup(file)) > -1) {
                            // store in DB here

                            var parser = mmd(fs.createReadStream(file), { duration: true }, function (err, metadata) {

                                if (err) throw err;

                                else {
                                    delete metadata.picture;
                                    metadata.path = file;
                                    metadata.lArtist = metadata.artist.length === 0 ? ['unknown artist'] : metadata.artist[0].toLowerCase();

                                    if(metadata.artist.length === 0) metadata.artist = ['Unknown artist'];
                                    if(metadata.album === null)      metadata.album  =  'Unknown album';
                                    if(metadata.title === null)      metadata.title  =  'Unknown artist';

                                    db.insert(metadata, function (err, newDoc) {
                                        if(err) throw err;
                                    });
                                }
                            });
                        }
                        next();
                    });
                });
                walker.on("errors", function (root, nodeStatsArray, next) {
                    nodeStatsArray.forEach(function (n) {
                        console.error("[ERROR] " + n.name);
                        console.error(n.error.message || (n.error.code + ": " + n.error.path));
                    });
                    next();
                });
                walker.on("end", function () {
                    comp.setState({
                        refreshingLibrary: false
                    }, function() {

                        if(folders.length - 1 == index) {
                            var end = new Date().getTime();
                            alerts.add('success', 'Library refreshed in ' + (end - start) + ' ms');
                        }
                    });
                });
            });
        });
    }
});
