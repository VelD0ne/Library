var mongoose = require('mongoose');//Подключение базы данных
var moment = require('moment');

var Schema = mongoose.Schema; // Создание объекта базы данных

var AuthorSchema = new Schema( // Создание модели для базы данных(Автора)
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

AuthorSchema//Создание свойства для объектов данной модели (Полное имя)
.virtual('name')
.get(function () {
  return this.family_name + ', ' + this.first_name;
});

AuthorSchema//Создание свойства для объектов данной модели (Ссылка на конкретного автора)
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});


AuthorSchema//Создание свойства для объектов данной модели (Отформатированная дата рождения)
.get(function () {
  return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
});

AuthorSchema//Создание свойства для объектов данной модели (Отформатированная дата смерти)
.virtual('date_of_birth_formatted')
.get(function () {
  return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
});

AuthorSchema//Создание свойства для объектов данной модели (Отформатированная дата смерти)
.virtual('date_of_death_formatted')
.get(function () {
  return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
});

AuthorSchema//Создание свойства для объектов данной модели (Отформатированное время жизни)
.virtual('lifespan')
.get(function () {
  return this.date_of_birth ? moment(this.date_of_birth).format('MMMM Do, YYYY')+(this.date_of_death ? ' - '+ moment(this.date_of_death).format('MMMM Do, YYYY') : '') : '';
});

module.exports = mongoose.model('Author', AuthorSchema);//Экспорт созданной модели в базу данных