import httpStatus from "http-status";
import mongoose from "mongoose";
import { ReE, ReS, toAwait } from "../services/util.service";
import { MarketingHead } from "../models/marketingHead.model";
import { Request, Response } from "express";

export const getMarketingHeadEstimates = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ReE(
      res,
      { message: "Invalid marketing head ID" },
      httpStatus.BAD_REQUEST
    );
  }

  let err, result;
  [err, result] = await toAwait(
    MarketingHead.aggregate([
      // 1️⃣ Match marketer _id
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },

      // 2️⃣ Lookup related general entries by marketer
      {
        $lookup: {
          from: "generals",
          let: { marketerId: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$marketer", "$$marketerId"] },
              },
            },
          ],
          as: "generalData",
        },
      },

      // 2.5️⃣ Add estimate count
      {
        $addFields: {
          estimateCount: { $size: "$generalData" },
        },
      },

      // 3️⃣ Unwind general data
      {
        $unwind: {
          path: "$generalData",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 4️⃣ Lookup customer info
      {
        $lookup: {
          from: "customers",
          let: { customerId: { $toObjectId: "$generalData.customer" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$customerId"] },
              },
            },
            {
              $project: { name: 1, email: 1, phone: 1 },
            },
          ],
          as: "customerData",
        },
      },

      // 5️⃣ Unwind customer data
      {
        $unwind: {
          path: "$customerData",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 6️⃣ Lookup billing data
      {
        $lookup: {
          from: "billings",
          localField: "generalData._id",
          foreignField: "general",
          as: "billingData",
        },
      },

      // 7️⃣ Calculate paid amount, installments count & earned money
      {
        $addFields: {
          totalAmountPaid: { $sum: "$billingData.amountPaid" },
          paidInstallments: { $size: "$billingData" },
          amountEarned: {
            $multiply: [
              { $sum: "$billingData.amountPaid" },
              { $divide: ["$generalData.percentage", 100] },
            ],
          },
        },
      },

      // 8️⃣ Final projection
      {
        $project: {
          _id: 0,
          marketerName: "$name",
          customerName: "$customerData.name",
          estimateCount: 1,
          noOfInstallments: "$generalData.noOfInstallments",
          paidInstallments: 1,
          percentage: "$generalData.percentage",
          amountEarned: { $round: ["$amountEarned", 2] },
          totalAmountPaid: 1,
        },
      },
    ])
  );

  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

  // ✅ Type assertion
  result = result as any[];

  if (!result || result.length === 0) {
    return ReE(
      res,
      { message: "Marketing head not found or has no estimates" },
      httpStatus.NOT_FOUND
    );
  }

  return ReS(
    res,
    { message: "Marketing head estimates found", data: result },
    httpStatus.OK
  );
};
