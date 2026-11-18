const MIN_BUDGET = 5;
const MAX_BUDGET = 1000;

module.exports = (req, res, next) => {
  const { title, description, budget, category, deadline } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    errors.push('Title is required (min 5 characters)');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 20) {
    errors.push('Description is required (min 20 characters)');
  }

  const budgetNumber = Number(budget);
  if (budget === undefined || budget === null || budget === '' || Number.isNaN(budgetNumber)) {
    errors.push('Budget must be a number');
  } else if (budgetNumber < MIN_BUDGET || budgetNumber > MAX_BUDGET) {
    errors.push(`Budget must be between ${MIN_BUDGET} and ${MAX_BUDGET}`);
  }

  if (!category) {
    errors.push('Category is required');
  }

  if (!deadline || Number.isNaN(Date.parse(deadline))) {
    errors.push('A valid deadline is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  req.body.budget = budgetNumber;
  next();
};