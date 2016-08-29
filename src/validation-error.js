'use strict'

module.exports = class ValidationError extends Error {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }

}