class UnsupportedInputError extends Error {
    constructor(message = 'Argument "csv" should be String or Buffer') {
        super(message)

        this.name = this.constructor.name
    }
}

module.exports = UnsupportedInputError
