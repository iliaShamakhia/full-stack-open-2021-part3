const express =require('express');
const morgan =require('morgan');
const cors=require('cors');

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
let phonebook=[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons',(request,response)=>{
    response.json(phonebook);
});

app.get('/api/persons/:id',(request,response)=>{
  let id = Number(request.params.id);
  let person =phonebook.find(el=>el.id===id);
  if(person){
    response.json(person);
  }else{
    response.status(404).end();
  }
});

app.post('/api/persons',(request,response)=>{

  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name and number required' 
    });
  }
  let found=phonebook.find(el=>el.name===body.name);
  if(found){
    return response.status(400).json({ 
      error: 'name must be unique' 
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 999999)
  }

  phonebook = phonebook.concat(person);

  response.json(person);
});

app.delete('/api/persons/:id',(request,response)=>{
  let id = Number(request.params.id);
  phonebook=phonebook.filter(el=>el.id!==id);
  response.status(204).end();
});

app.get('/info',(request,response)=>{
    let persons=phonebook.length;
    response.send(`<p>Phonebook has info for ${persons} people</p>
                   <p>${new Date()}</p>`);
});

const PORT=process.env.PORT || 3001;
app.listen(PORT,()=>console.log(`listening at port ${PORT}`));