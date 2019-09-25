const statusCodeFromString = require('./status-code-from-string')

function withParsedStatusCode() {
    return ([originalUrl, statusCode, newUrl]) => {
        try {
            return ([
                originalUrl, statusCodeFromString(statusCode), newUrl
            ])
        } catch (e) {
            throw new Error(`Error while parsing [${originalUrl}, ${statusCode}, ${newUrl}]: ${e.message}`)
        }
    }
}

module.exports = withParsedStatusCode
