// routes/taskRoutes.js

const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");
const router = express.Router();

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ msg: "Acesso negado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token inválido" });
  }
};

// Criar uma nova tarefa
router.post("/tasks", verifyToken, async (req, res) => {
  const { title, description } = req.body;
  try {
    const task = new Task({ userId: req.userId, title, description });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ msg: "Erro ao criar tarefa" });
  }
});

// Obter todas as tarefas do usuário
router.get("/tasks", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Erro ao obter tarefas" });
  }
});

// Obter uma tarefa específica pelo ID
router.get("/tasks/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOne({ userId: req.userId, _id: req.params.id });
    if (!task) return res.status(404).json({ msg: "Tarefa não encontrada" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Erro ao buscar tarefa" });
  }
});

// Atualizar uma tarefa
router.put("/tasks/:id", verifyToken, async (req, res) => {
  const { title, description, completed } = req.body;
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { title, description, completed }, { new: true });
    if (!task) return res.status(404).json({ msg: "Tarefa não encontrada" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Erro ao atualizar tarefa" });
  }
});

// Excluir uma tarefa
router.delete("/tasks/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ msg: "Tarefa não encontrada" });
    res.status(200).json({ msg: "Tarefa excluída com sucesso" });
  } catch (err) {
    res.status(500).json({ msg: "Erro ao excluir tarefa" });
  }
});

module.exports = router;

