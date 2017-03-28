export default [{
    method: 'GET',
    path: '',
    handler: {
        file: './web/index.html'
    }
}, {
    method: 'GET',
    path: 'dist/{path*}',
    handler: {
        directory: {
            path: './dist/',
        }
    }
}];
