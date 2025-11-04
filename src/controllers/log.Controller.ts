import { Request, Response } from "express";
import httpStatus from "http-status";
import { Billing } from "../models/billing.model";
import { Customer } from "../models/customer.model";
import EditRequest from "../models/editRequest.model";
import LifeSaving from "../models/lifeSaving.model";
import { Marketer } from "../models/marketer";
import { MarketingHead } from "../models/marketingHead.model";
import { Mod } from "../models/mod.model";
import { Nvt } from "../models/nvt.model";
import { Percentage } from "../models/percentage.model";
import LifeHousing from "../models/plotBookingForm.model";
import { Role } from "../models/role.model";
import { RoleMenu } from "../models/roleMenu.model";
import { User } from "../models/user.model";
import { isNull, ReE, ReS, toAwait } from "../services/util.service";

export const getAllLogs = async (req: Request, res: Response) => {
  let err;
  let { date, page = "1", limit = "10", export: isExport } = req.query;

  let dateFilter: any = {};

  // Only apply date filter if date is provided
  if (date && !isNull(date as string)) {
    const queryDate = new Date(date as string);
    if (isNaN(queryDate.getTime())) {
      return ReE(
        res,
        { message: "Invalid date format!" },
        httpStatus.BAD_REQUEST
      );
    }

    // Set date range for the entire day
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    dateFilter = {
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };
  }
  // If no date provided and not exporting, default to today
  else if (isExport !== "true") {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    dateFilter = {
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };
  }
  // If exporting without date, fetch ALL logs (no date filter)

  // Define collections with their module names
  const collections = [
    { model: Customer, moduleName: "Customer", hasCreatedBy: true },
    { model: Percentage, moduleName: "Percentage", hasCreatedBy: true },
    { model: Marketer, moduleName: "Marketer", hasCreatedBy: true },
    { model: MarketingHead, moduleName: "Marketing Head", hasCreatedBy: true },
    { model: Role, moduleName: "Roles", hasCreatedBy: true },
    { model: User, moduleName: "Employee", hasCreatedBy: true },
    { model: RoleMenu, moduleName: "Roles & Menu Mapping", hasCreatedBy: true },
    { model: Billing, moduleName: "Billing", hasCreatedBy: true },
    { model: Nvt, moduleName: "NVT", hasCreatedBy: true },
    { model: Mod, moduleName: "MOD", hasCreatedBy: true },
    { model: EditRequest, moduleName: "Request", hasCreatedBy: true },
    { model: LifeSaving, moduleName: "Life Alliance", hasCreatedBy: true },
    { model: LifeHousing, moduleName: "Life Housing", hasCreatedBy: true },
    { model: LifeSaving, moduleName: "Life Saving", hasCreatedBy: true },
  ];

  // Fetch data from all collections
  let allLogs: any[] = [];

  for (const collection of collections) {
    let results: any[];
    const tuple: any = await toAwait(
      (collection.model as any)
        .find(dateFilter)
        .select("_id createdBy createdAt")
        .lean()
    );
    [err, results] = tuple;

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    if (results && results.length > 0) {
      const transformedResults = results.map((item: any) => {
        const log: any = {
          _id: item._id,
          moduleName: collection.moduleName,
          createdAt: item.createdAt,
        };

        // Only add createdBy if it exists and hasCreatedBy is true
        if (collection.hasCreatedBy && item.createdBy) {
          log.createdBy = item.createdBy;
        }

        return log;
      });

      allLogs = [...allLogs, ...transformedResults];
    }
  }
  // Check if no logs found - RETURN EMPTY ARRAY instead of 404
  if (allLogs.length === 0) {
    // For export
    if (isExport === "true") {
      return ReS(
        res,
        {
          message: "No logs found for the given date!",
          data: [],
          totalCount: 0,
        },
        httpStatus.OK
      );
    }
    // For pagination
    return ReS(
      res,
      {
        message: "No logs found for the given date!",
        data: [],
        pagination: {
          currentPage: parseInt(page as string),
          pageSize: parseInt(limit as string),
          totalCount: 0,
          totalPages: 0,
        },
      },
      httpStatus.OK
    );
  }

  // Sort by createdAt (newest first)
  allLogs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Handle export - return all data
  if (isExport === "true") {
    return ReS(
      res,
      {
        message: "Logs exported successfully",
        data: allLogs,
        totalCount: allLogs.length,
      },
      httpStatus.OK
    );
  }

  // Handle pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;

  const paginatedLogs = allLogs.slice(startIndex, endIndex);
  const totalCount = allLogs.length;
  const totalPages = Math.ceil(totalCount / limitNum);

  return ReS(
    res,
    {
      message: "Logs retrieved successfully",
      data: paginatedLogs,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalCount,
        totalPages,
      },
    },
    httpStatus.OK
  );
};
