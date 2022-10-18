const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid'); // instala o uuid

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers; // headers
   //verificar se o username já existe
   const userExist = users.find(user => user.username === username);
   if (!userExist) {
     response.status(404).json({
       error:"Account not found"
     });}
     request.user=userExist;
     return next();

}

app.post('/users', (request, response) => {
 const  {name, username} = request.body;
  //verificar se o username já existe
  const userExist = users.find(user => user.username === username);
  if (userExist) {
    response.status(400).json({
    error:"Account already exists"
  });}
  const user ={ // objeto para representar user
    id: uuidv4(), // precisa ser um uuid
    name, 
    username, 
    todos: []
  }
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadLine } = request.body;
  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done:false, // bolean para representar se estar feito ou não
    deadLine:new Date(deadLine),
    created_at: new Date()
  }
  user.todos.push(todo); // armazenando todos os todo em user.todos
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadLine } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id); // buscando o todo a ser alterado
  if(!todo){
    return response.status(404).json({
      error:"Todo not found"
  });}
  todo.title = title; // alterando o titulo
  todo.deadLine = new Date(deadLine); // alterando a data
  return response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user} = request;
  const { id } = request.params;
  const todo = user.todos.find(todo => todo.id === id); // buscando o todo a ser alterado
  if(!todo){
    return response.status(404).json({
      error:"Todo not found"
  });}
  todo.done = true; // alterando o estado do todo
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexTodo = user.todos.findIndex(todo => todo.id === id); // buscando o indice do todo a ser deletado
  if(indexTodo === -1){
    return response.status(404).json({
      error:"Todo not found"
  });}
  user.todos.splice(indexTodo, 1); // remover o todo

  return response.status(204).send();
});

module.exports = app;