const express = require('express');
const cors = require('cors');
const uuid = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(401).json({ error: 'Unauthorized' })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const checkIfUserAlreadyExists = users.find(user => user.username === username)

  if (checkIfUserAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' })
  }

  const newUser = {
    id: uuid.v4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const newTodo = {
    id: uuid.v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const { id } = request.params

  const checkIfTodoExists = user.todos.find(todo => todo.id === id)

  if (!checkIfTodoExists) {
    return response.status(404).json({ error: 'todo not found' })
  }

  checkIfTodoExists.title = title
  checkIfTodoExists.deadline = deadline

  return response.status(200).json(checkIfTodoExists)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const checkIfTodoExists = user.todos.find(todo => todo.id === id)

  if (!checkIfTodoExists) {
    return response.status(404).json({ error: 'todo not found' })
  }

  checkIfTodoExists.done = true

  return response.status(200).json(checkIfTodoExists)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const checkIfTodoExists = user.todos.find(todo => todo.id === id)

  if (!checkIfTodoExists) {
    return response.status(404).json({ error: 'todo not found' })
  }

  user.todos.splice(checkIfTodoExists, 1)

  return response.status(204).send()
});

module.exports = app;