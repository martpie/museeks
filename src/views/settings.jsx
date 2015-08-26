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
                <MusicFoldersList refreshingLibrary={ this.props.refreshingLibrary } />

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
            musicFolders : nconf.get('musicFolders')
        };
    },

    render: function () {

        if(!this.props.refreshingLibrary) {

            var buttonsGroup = (
                <ButtonGroup>
                    <Button bsSize='small' onClick={ this.addFolder }>
                        <i className={'fa fa-plus'}></i>
                        Import a folder
                    </Button>
                    <Button bsSize='small' onClick={ this.refreshLibrary }>
                        <i className={ !this.props.refreshingLibrary ? 'fa fa-refresh' : 'fa fa-refresh fa-spin' }></i>
                        { !this.props.refreshingLibrary ? 'Refresh Library' : 'Refreshing Library'}
                    </Button>
                    <Button bsSize='small' bsStyle={'danger'} onClick={ this.resetLibrary }>
                        Reset library
                    </Button>
                </ButtonGroup>
            );

        } else {

            var buttonsGroup = (
                <ButtonGroup>
                    <Button bsSize='small' disabled onClick={ this.addFolder }>
                        <i className={'fa fa-plus'}></i>
                        Import a folder
                    </Button>
                    <Button bsSize='small' disabled onClick={ this.refreshLibrary }>
                        <i className={ !this.props.refreshingLibrary ? 'fa fa-refresh' : 'fa fa-refresh fa-spin' }></i>
                        { !this.props.refreshingLibrary ? 'Refresh Library' : 'Refreshing Library'}
                    </Button>
                    <Button bsSize='small' disabled bsStyle={'danger'} onClick={ this.resetLibrary }>
                        Reset library
                    </Button>
                </ButtonGroup>
            );
        }


        var list = this.state.musicFolders.map(function(folder, i) {
            return(
                <li key={i}>
                    <i onClick={ this.props.refreshingLibrary ? void(0) : this.removeFolder } data-target={ i } className={ this.props.refreshingLibrary ? 'fa fa-close delete-libray-folder disabled' : 'fa fa-close delete-libray-folder' }></i>
                    { folder }
                </li>
            );
        }.bind(this));

        return (
            <div className="settings-musicfolder">
                <h4>Library folders</h4>

                <p>You currently have { this.state.musicFolders.length } folder{ this.state.musicFolders.length < 2 ? '' : 's' } folders in your library.</p>

                <ul className={ this.state.musicFolders.length != 0 ? 'musicfolders-list' : 'musicfolders-list empty'}>
                    { list }
                </ul>

                { buttonsGroup }

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
        var self    = this;
        var folders = nconf.get('musicFolders');

        Instance.player.stop();

        Instance.setState({ library : null });

        db.reset();

        Instance.setState({
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
                                    if(metadata.album === null || metadata.album === '') metadata.album = 'Unknown';
                                    if(metadata.title === null || metadata.title === '') metadata.title = 'Unknown';

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

                    if(folders.length - 1 == index) {
                        Instance.setState({
                            refreshingLibrary: false
                        }, function() {

                            var end = new Date().getTime();
                            Instance.refreshLibrary();
                            alerts.add('success', 'Library refreshed in ' + ((end - start) / 1000)  + ' s');
                        });
                    }
                });
            });
        });
    }
});
