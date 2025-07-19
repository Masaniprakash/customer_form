import { Model, ModelStatic } from "sequelize";

export type AssociateModel = ModelStatic<Model> & {
  associate?: (models: any) => void;
};