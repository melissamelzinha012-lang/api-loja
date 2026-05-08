// src/controllers/tarefaController.ts
import { Request, Response } from "express";
import * as TarefaModel from "../models/tarefaModel";
import { ApiResponse, Tarefa, FiltroQuery } from "../interfaces";

export async function listar(req: Request<{},{},{},FiltroQuery>, res: Response) {
  try {
    let tarefas = await TarefaModel.listarTodas();
    if (req.query.concluida === "true") tarefas = tarefas.filter(t => t.concluida);
    if (req.query.concluida === "false") tarefas = tarefas.filter(t => !t.concluida);
    if (req.query.prioridade) tarefas = tarefas.filter(t => t.prioridade === req.query.prioridade);
    res.json({ sucesso: true, dados: tarefas } as ApiResponse<Tarefa[]>);
  } catch { res.status(500).json({ sucesso: false, erro: 'Erro interno' }); }
}

export async function criar(req: Request, res: Response) {
  try {
    const { titulo, descricao, prioridade } = req.body;
    const erros: string[] = [];
    if (!titulo || typeof titulo !== "string") erros.push("titulo é obrigatório");
    if (!["alta","media","baixa"].includes(prioridade)) erros.push("prioridade inválida");
    if (erros.length > 0) { res.status(400).json({ sucesso:false, erros }); return; }
    const nova = await TarefaModel.criar({ titulo, descricao, prioridade });
    res.status(201).json({ sucesso: true, dados: nova });
  } catch { res.status(500).json({ sucesso: false, erro: 'Erro interno' }); }
}

export async function buscarPorId(req: Request, res: Response) {

  try {
    const id = Number(req.params.id);
    const tarefa = await TarefaModel.buscarPorId(id);
    if (!tarefa) {
      res.status(404).json({
        sucesso: false,
        erro: "Tarefa não encontrada"
      });
      return;
    }
    res.json({
      sucesso: true,
      dados: tarefa
    });
  } catch {
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno"
    });
  }
}


export async function atualizar(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const tarefaAtualizada =
      await TarefaModel.atualizar(id, req.body);
    if (!tarefaAtualizada) {
      res.status(404).json({
        sucesso: false,
        erro: "Tarefa não encontrada"
      });
      return;
    }
    res.json({
      sucesso: true,
      dados: tarefaAtualizada
    });
  } catch {
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno"
    });
  }
}

export async function remover(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const removida =
      await TarefaModel.remover(id);
    if (!removida) {
      res.status(404).json({
        sucesso: false,
        erro: "Tarefa não encontrada"
      });
      return;
    }

    res.status(204).send();
  } catch {
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno"
    });

  }
}

export async function listarPagina(req: Request, res: Response) {
  try {
    const tarefas =
      await TarefaModel.listarTodas();
    res.render("tarefas", { tarefas });
  } catch {
    res.render("erro", {
      mensagem: "Erro ao carregar tarefas"
    });
  }
}

export async function detalhePagina(req: Request, res: Response) {
  const id = Number(req.params.id);
  const tarefa =
    await TarefaModel.buscarPorId(id);
  if (!tarefa) {
    res.render("erro", {
      mensagem: "Tarefa não encontrada"
    });
    return;
  }
  res.render("detalhe", { tarefa });
}

export async function cadastrarPagina(req: Request, res: Response) {
  res.render("cadastrar");
}

export async function cadastrarForm(req: Request, res: Response) {
  const { titulo, descricao, prioridade } =
    req.body;
  await TarefaModel.criar({
    titulo,
    descricao,
    prioridade
  });
  res.redirect("/pagina/tarefas");
}

export async function concluirForm(req: Request, res: Response) {
  const id = Number(req.params.id);
  const tarefa =
    await TarefaModel.buscarPorId(id);
  if (!tarefa) {
    res.render("erro", {
      mensagem: "Tarefa não encontrada"
    });
    return;
  }
  await TarefaModel.atualizar(id, {
    concluida: !tarefa.concluida
  });
  res.redirect("/pagina/tarefas");
}

export async function excluirForm(req: Request, res: Response) {
  const id = Number(req.params.id);
  await TarefaModel.remover(id);
  res.redirect("/pagina/tarefas");
}