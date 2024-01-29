"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const postgresql_db_1 = __importDefault(require("./postgresql_db"));
const relation_1 = require("./relation");
const pgdb = new postgresql_db_1.default();
const relation = new relation_1.Relation();
function getHomeNumberSql() {
    return `select DISTINCT home_number from sde.person limit 1 offset 0`;
}
function getHomePersonSql(home_number) {
    return `select * from sde.person where home_number in ${home_number}`;
}
pgdb.select(getHomeNumberSql()).pipe((0, rxjs_1.map)(homeNumbers => homeNumbers.map(element => `'${element.home_number}'`)), (0, rxjs_1.map)(res => `(${res.join(', ')})`), (0, rxjs_1.tap)(x => console.log(x)), (0, rxjs_1.mergeMap)(homeNumbers => pgdb.select(getHomePersonSql(homeNumbers))), (0, rxjs_1.map)(persons => relation.run(persons))).subscribe(res => console.log(res));
