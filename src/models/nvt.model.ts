import { DataTypes } from "sequelize";
import sequelize from "../config/db.config";
import { v4 as uuidv4 } from "uuid";

export const NVT = sequelize.define("NVT", {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  mod: {
    type: DataTypes.BOOLEAN,
  },
  conversion: {
    type: DataTypes.STRING,
  },
  initialPayment: {
    type: DataTypes.INTEGER,
  },
  emi: {
    type: DataTypes.INTEGER,
  },
  totalPayment: {
    type: DataTypes.INTEGER,
  },
  introducer: {
    type: DataTypes.STRING,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  customerId: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
}, {
  tableName: "nvts",
  timestamps: false,
});
