"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const rxjs_1 = require("rxjs");
class PostgresDB {
    constructor() {
        this.pool = new pg_1.Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'mj_info',
            password: '123',
            port: 5432, // Change this based on your PostgreSQL configuration
        });
    }
    query(sql, values) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield this.pool.connect();
                const result = yield client.query(sql, values);
                client.release();
                return result;
            }
            catch (error) {
                console.log(error);
                // throw new Error(`Error executing query: ${error.message}`);
            }
        });
    }
    select(sql) {
        const result = this.query(sql).then(res => res.rows);
        return (0, rxjs_1.from)(result);
    }
    insert(tableName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const placeholders = Array.from({ length: keys.length }, (_, i) => `$${i + 1}`).join(', ');
            const sql = `INSERT INTO sde.${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
            yield this.query(sql, values);
        });
    }
    insertArray(tableName, dataArray) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dataArray.length === 0) {
                throw new Error('dataArray must not be empty');
            }
            const keys = Object.keys(dataArray[0]);
            // Format the values for each row
            const formattedValues = dataArray.map((data) => {
                const rowValues = keys.map((key) => {
                    const value = data[key];
                    return typeof value === 'string' ? `'${value}'` : value;
                });
                return `(${rowValues.join(', ')})`;
            });
            const columns = keys.join(', ');
            const valuePlaceholders = formattedValues.join(', ');
            const sql = `INSERT INTO sde.${tableName} (${columns}) VALUES ${valuePlaceholders} RETURNING id`;
            try {
                const result = yield this.pool.query(sql);
                const insertedRowCount = result.rowCount;
                console.log(`Data inserted into ${tableName} successfully. Inserted ${insertedRowCount} rows.`);
                return insertedRowCount;
            }
            catch (error) {
                console.error(`Error inserting data into ${tableName}:`, error.message);
                throw error;
            }
        });
    }
    update(tableName, data, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateSet = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ');
            const conditionKeys = Object.keys(condition);
            const conditionValues = Object.values(condition);
            const sql = `UPDATE ${tableName} SET ${updateSet} WHERE ${conditionKeys.join(' = $')} = $${conditionKeys.length + 1}`;
            yield this.query(sql, [...Object.values(data), ...conditionValues]);
        });
    }
    delete(tableName, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const conditionKeys = Object.keys(condition);
            const conditionValues = Object.values(condition);
            const sql = `DELETE FROM ${tableName} WHERE ${conditionKeys.join(' = $')} = $${conditionKeys.length + 1}`;
            yield this.query(sql, conditionValues);
        });
    }
}
exports.default = PostgresDB;
