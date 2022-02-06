var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    login: {type: String, required: true},
    password: {type: String, required: true},
    books: [{type: Schema.ObjectId, ref: 'BookInstance'}]
  }
);


UserSchema
.virtual('url')
.get(function () {
  return '/catalog/book/' + this._id;
});


module.exports = mongoose.model('User', UserSchema);