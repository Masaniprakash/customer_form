import { isValidObjectId } from "mongoose";

export const checkFormatOfMultiMenuInBody = async (body: any) => {

  if (!Array.isArray(body)) {
    return false; // Not an array
  }

  for (const menu of body) {
    if (
      !menu.menuId ||
      !isValidObjectId(menu.menuId) ||
      !(typeof menu.create === "boolean") ||
      !(typeof menu.read === "boolean") ||
      !(typeof menu.update === "boolean") ||
      !(typeof menu.delete === "boolean")
    ) {
      return false;
    }
  }

  return true;

}
