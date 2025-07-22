import { DataTypes } from "sequelize";
import sequelize from "../config/db.config";
import { v4 as uuidv4 } from "uuid";

export const MOD = sequelize.define("MOD", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  headBy: {
    type: DataTypes.STRING,
  },
  head: {
    type: DataTypes.STRING,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
  },
}, {
  tableName: "mods",
  timestamps: false,
});
