function withOriginalAsKey() {
    return ((rules, [originalUrl, statusCode, newUrl]) => {
        if (!originalUrl) { return rules }
        if (!statusCode && !newUrl) { return rules }
        if (!statusCode && newUrl) statusCode = 307
        const rule = [statusCode]
        if (newUrl) rule.push(newUrl)
        return { ...rules, [originalUrl]: rule }
    })
}

module.exports = withOriginalAsKey
