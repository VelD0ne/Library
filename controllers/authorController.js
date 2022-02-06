var Author = require('../models/author');//Подключение модели автора из базы данных
var async = require('async');//Подключение асинхронности 
var Book = require('../models/book');//Подключение модели книги из базы данных
const { body,validationResult } = require('express-validator');//Подключение валидатора для базы данных

exports.author_list = function(req, res, next) {//Вывод списка авторов

    Author.find()
      .sort([['family_name', 'ascending']])
      .exec(function (err, list_authors) {
        if (err) { return next(err); }
        res.render('author_list', { title: 'Author List', author_list: list_authors });
      });
  
  };

exports.author_detail = function(req, res, next) {//Детальная страница для конкретного автора

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
              .exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { 
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    });

};

exports.author_create_get = function(req, res, next) {//Создание автора GET
    res.render('author_form', { title: 'Create Author'});
};
let regexp = /[\p{Alpha}\p{M}\p{Nd}\p{Pc}\p{Join_C}]/gu;
exports.author_create_post = [//Создание автора POST



    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.').matches(regexp).withMessage('Некоретные символы при вводе фамилии'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.').matches(regexp).withMessage('Некоретные символы при вводе фамилии'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),


    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        }
        else {

            var author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            author.save(function (err) {
                if (err) { return next(err); }
                res.redirect(author.url);
            });
        }
    }
];

exports.author_delete_get = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // Без результатов.
            res.redirect('/catalog/authors');
        }
        // Удачно, значит рендерим.
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    });

};

// Обработчик удаления автора POST.
exports.author_delete_post = function(req, res, next) {

    async.parallel({
        author: function(callback) {
          Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.body.authorid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Успех
        if (results.authors_books.length > 0) {
            // Автор книги. Визуализация выполняется так же, как и для GET route.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
            return;
        }
        else {
            //У автора нет никаких книг. Удалить объект и перенаправить в список авторов.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // Успех-перейти к списку авторов
                res.redirect('/catalog/authors')
            })
        }
    });
};

exports.author_update_get = function(req, res, next) {
    async.parallel({
    author: function(callback) {
        Author.findById(req.params.id).exec(callback);
    }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author_form', { title: 'Update Author', author: results.author });
    //res.send('NOT IMPLEMENTED: Author update GET');
    });
};

exports.author_update_post = [
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.').matches(regexp).withMessage('Некоретные символы при вводе фамилии'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.').matches(regexp).withMessage('Некоретные символы при вводе фамилии'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),
    
    
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var author = new Author(
          { first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            async.parallel({
                author: function(callback) {
                    Author.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('author_form', { title: 'Update Author',author: results.author, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Author.findByIdAndUpdate(req.params.id, author, {}, function (err,theauthor) {
                if (err) { return next(err); }
                   // Successful - redirect to author detail page.
                   res.redirect(theauthor.url);
                });
        }
    }
]

/*function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
}; */