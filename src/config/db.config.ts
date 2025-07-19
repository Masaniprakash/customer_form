import { Sequelize } from "sequelize";

const sequelize = new Sequelize("customerform", "postgres", "postgresql", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

export default sequelize;
