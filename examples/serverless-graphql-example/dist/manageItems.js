"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db = __importStar(require("./dynamodb"));
const v4_1 = __importDefault(require("uuid/v4"));
function response(statusCode, body) {
    return {
        statusCode,
        body: JSON.stringify(body),
    };
}
// fetch using /item/ID
exports.getItem = async (event) => {
    const itemId = event.pathParameters ? event.pathParameters.itemId : null;
    if (!itemId) {
        return response(404, {
            status: "error",
            error: "Item not found",
        });
    }
    const item = await db.getItem({
        TableName: process.env.ITEM_TABLE,
        Key: { itemId },
    });
    if (item.Item) {
        return response(200, {
            status: "success",
            item: item.Item,
        });
    }
    else {
        return response(404, {
            status: "error",
            error: "Item not found",
        });
    }
};
// upsert an item
// /item or /item/ID
exports.updateItem = async (event) => {
    let itemId = event.pathParameters ? event.pathParameters.itemId : v4_1.default();
    let createdAt = new Date().toISOString();
    // find item if exists
    const find = await db.getItem({
        TableName: process.env.ITEM_TABLE,
        Key: { itemId },
    });
    if (find.Item) {
        // save createdAt so we don't overwrite on update
        createdAt = find.Item.createdAt;
    }
    else {
        return response(404, {
            status: "error",
            error: "Item not found",
        });
    }
    if (!event.body) {
        return response(400, {
            status: "error",
            error: "Provide a JSON body",
        });
    }
    let body = JSON.parse(event.body);
    if (body.itemId) {
        // this will confuse DynamoDB, you can't update the key
        delete body.itemId;
    }
    const item = await db.updateItem({
        TableName: process.env.ITEM_TABLE,
        Key: { itemId },
        UpdateExpression: `SET ${db.buildExpression(body)}, createdAt = :createdAt, lastUpdatedAt = :lastUpdatedAt`,
        ExpressionAttributeValues: {
            ...db.buildAttributes(body),
            ":createdAt": createdAt,
            ":lastUpdatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
    });
    return response(200, {
        status: "success",
        item: item.Attributes,
    });
};
exports.deleteItem = async (event) => {
    const itemId = event.pathParameters ? event.pathParameters.itemId : null;
    if (!itemId) {
        return response(400, {
            status: "error",
            error: "Provide an itemId",
        });
    }
    // DynamoDB handles deleting already deleted files, no error :)
    const item = await db.deleteItem({
        TableName: process.env.ITEM_TABLE,
        Key: { itemId },
        ReturnValues: "ALL_OLD",
    });
    return response(200, {
        status: "success",
        itemWas: item.Attributes,
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuYWdlSXRlbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWFuYWdlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBRUEsK0NBQWdDO0FBQ2hDLGlEQUE0QjtBQUU1QixTQUFTLFFBQVEsQ0FBQyxVQUFrQixFQUFFLElBQVM7SUFDN0MsT0FBTztRQUNMLFVBQVU7UUFDVixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7S0FDM0IsQ0FBQTtBQUNILENBQUM7QUFFRCx1QkFBdUI7QUFDVixRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBc0IsRUFBd0IsRUFBRTtJQUM1RSxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO0lBRXhFLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWCxPQUFPLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDbkIsTUFBTSxFQUFFLE9BQU87WUFDZixLQUFLLEVBQUUsZ0JBQWdCO1NBQ3hCLENBQUMsQ0FBQTtLQUNIO0lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDO1FBQzVCLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVc7UUFDbEMsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFO0tBQ2hCLENBQUMsQ0FBQTtJQUVGLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtRQUNiLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNuQixNQUFNLEVBQUUsU0FBUztZQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7U0FDaEIsQ0FBQyxDQUFBO0tBQ0g7U0FBTTtRQUNMLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNuQixNQUFNLEVBQUUsT0FBTztZQUNmLEtBQUssRUFBRSxnQkFBZ0I7U0FD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