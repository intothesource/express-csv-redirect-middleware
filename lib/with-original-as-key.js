function withOriginalAsKey() {
    return ((rules, [originalUrl, statusCode, newUrl]) => ({
        ...rules, [originalUrl]: [statusCode, newUrl]
    }))
}

module.exports = withOriginalAsKey
