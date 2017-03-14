const routes = [{
    method : 'GET',
    path: '/',
    handler: (req, res) => {
        res({
            name : `Jackson's Computer`
        });
    }
}];

module.exports = {
    namespace : 'handshake',
    routes
};
