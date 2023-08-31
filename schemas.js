const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

//Defent against XSS with Joi we have to write our own method to provide us for Xss
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                //saniziteHtml is a package from joi
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
})

//require Joi with the helper method to provide XSS
const Joi = BaseJoi.extend(extension);

module.exports.yogastudioSchema = Joi.object({
    studio: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        street: Joi.string().required().escapeHTML(),
        streetNumber: Joi.number().required().min(1),
        zipcode: Joi.number().required().min(10000),
        location: Joi.string().required().escapeHTML(),
        images: Joi.array().items(Joi.string()),
        description: Joi.string().required().escapeHTML(),
        offer: Joi.string().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})