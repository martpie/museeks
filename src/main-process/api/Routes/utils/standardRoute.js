const standardRoute = (functionName) => {
    return (req, res) => {
        req.send(functionName);
        res.send('done');
    };
};

module.exports = standardRoute;