const { z } = require('zod');
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorMessages = err.errors.map(
        (issue) => `${issue.path.join('.')} is ${issue.message}`
      );
      return next(new AppError(`Validation Error: ${errorMessages.join(', ')}`, 400));
    }
    next(err);
  }
};

module.exports = validate;
