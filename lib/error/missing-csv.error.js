class MissingCsvError extends Error {
    constructor(message = 'Argument "csv" is required') {
        super(message)

        this.name = this.constructor.name
    }
}

module.exports = MissingCsvError
