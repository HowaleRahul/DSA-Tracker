const router = require('express').Router();
let Question = require('../models/Question');

// GET all questions
router.route('/').get((req, res) => {
  Question.find()
    .then(questions => res.json(questions))
    .catch(err => res.status(400).json('Error: ' + err));
});

// POST a new question
router.route('/').post((req, res) => {
  const { name, url, platform, difficulty, tags, approach, timeComplexity, confidence, lastRevised, mistakes } = req.body;

  const newQuestion = new Question({
    name,
    url,
    platform,
    difficulty,
    tags,
    approach,
    timeComplexity,
    confidence: Number(confidence),
    lastRevised: Date.parse(lastRevised),
    mistakes
  });

  newQuestion.save()
    .then((savedQuestion) => res.json(savedQuestion))
    .catch(err => res.status(400).json('Error: ' + err));
});

// GET a specific question
router.route('/:id').get((req, res) => {
  Question.findById(req.params.id)
    .then(question => res.json(question))
    .catch(err => res.status(400).json('Error: ' + err));
});

// DELETE a specific question
router.route('/:id').delete((req, res) => {
  Question.findByIdAndDelete(req.params.id)
    .then(() => res.json('Question deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// UPDATE a specific question
router.route('/:id').put((req, res) => {
  Question.findById(req.params.id)
    .then(question => {
      question.name = req.body.name;
      question.url = req.body.url;
      question.platform = req.body.platform;
      question.difficulty = req.body.difficulty;
      question.tags = req.body.tags;
      question.approach = req.body.approach;
      question.timeComplexity = req.body.timeComplexity;
      question.confidence = Number(req.body.confidence);
      question.lastRevised = Date.parse(req.body.lastRevised);
      question.mistakes = req.body.mistakes;

      question.save()
        .then(() => res.json('Question updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// POST bulk import
router.route('/bulk').post((req, res) => {
  const questions = req.body;
  if (!Array.isArray(questions)) {
    return res.status(400).json('Error: Payload must be an array of questions');
  }

  // Remove _id from imported items to avoid duplicate key errors, Mongoose will generate new ones
  const sanitizedQuestions = questions.map(q => {
    const { _id, createdAt, updatedAt, __v, ...rest } = q;
    return rest;
  });

  Question.insertMany(sanitizedQuestions)
    .then((inserted) => res.json(inserted))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
