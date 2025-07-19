import { Request, Response } from "express";
import * as service from "../services/mod.service";

export const create = async (req: Request, res: Response) => res.status(201).json(await service.create(req.body));
export const getAll = async (_: Request, res: Response) => res.json(await service.getAll());
export const getById = async (req: Request, res: Response) => {
  const data = await service.getById(req.params.id);
  data ? res.json(data) : res.status(404).send("Not found");
};
export const update = async (req: Request, res: Response) => res.json(await service.update(req.params.id, req.body));
export const remove = async (req: Request, res: Response) => {
  await service.remove(req.params.id);
  res.sendStatus(204);
};
