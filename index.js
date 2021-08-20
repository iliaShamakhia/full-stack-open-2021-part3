require('dotenv').config();
const express =require('express');
const morgan =require('morgan');
const cors=require('cors');
const Person = require('./models/person');

const app=express();
app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(morgan('tiny',{
  skip: function (req, res) { return req.method ==='POST'}
}));
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body',{
  skip: function (req, res) { return req.method !=='POST'}
}));

app.get('/api/persons',(request,response)=>{
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.get('/api/persons/:id',(request,response,next)=>{
  Person.findById(request.params.id).then(person => {
  if(person){  
    response.json(person);
  }else{
    response.status(404).end();
  }
  }).catch(error=>next(error));
});

app.put('/api/persons/:id',(request,response,next)=>{
  let body=request.body;
  let person={
    name:body.name,
    number:body.number,
  };
  Person.findByIdAndUpdate(request.params.id, person, { new: true,runValidators:false })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error))
});

app.post('/api/persons',(request,response,next)=>{
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name and number required' 
    });
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save().then(savedPerson => {
    response.json(savedPerson);
  }).catch(error=>next(error));
});

app.delete('/api/persons/:id',(request,response,next)=>{
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
});

app.get('/info',(request,response)=>{
  Person.countDocuments().then((count) =>{
    response.send(`<p>Phonebook has info for ${count} people</p>
                   <p>${new Date()}</p>`);
        });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {    
    return response.status(400).json({ error: error.message});
  }
  next(error);
};
app.use(errorHandler);

const PORT=process.env.PORT;
app.listen(PORT,()=>console.log(`listening at port ${PORT}`));