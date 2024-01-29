import { count, from, map, mergeMap, of, takeWhile, tap } from "rxjs";
import PostgresDB from "./postgresql_db";
import { Relation } from "./relation";

const pgdb = new PostgresDB();

const relation = new Relation();


let countRow = 0

let insertRow = 0;


function getHomeNumberSql() {
    return `select DISTINCT home_number from person where is_process = false limit 10000`
}

function getHomePersonSql(home_number: string) {
    return `select * from person where home_number in ${home_number}`
}

function updateIsProcessSql(home_numbers: string) {
    return `update person set is_process = ${true} where home_number in ${home_numbers}`
}

function run() {
    return pgdb.select(getHomeNumberSql()).pipe(
        takeWhile(homeNubers => homeNubers.length > 0),
        map(homeNumbers => homeNumbers.map(element => `'${element.home_number}'`)),
        map(res => `(${res.join(', ')})`),
        mergeMap(home_numbers => {
            return pgdb.select(updateIsProcessSql(home_numbers)).pipe(
                tap(res => {
                    countRow += res;
                    console.log('update:' + countRow)
                }),
                map(() => home_numbers)
            )
        }),

        // tap(x=>console.log(x)),
        mergeMap(homeNumbers => pgdb.select(getHomePersonSql(homeNumbers))),
        // map(result=>result.rows),
        // tap(x => {
        //     countRow += x.length
        //     console.log(countRow)
        // }),
        map(persons => relation.run(persons)),
    ).subscribe(res => {
        // console.log(res)
        if (res.length > 0) {
            insertRow += res.length;
            console.log('insert:', insertRow)
            pgdb.insertArray('person2', res).then(
                res => {
                    run()
                }
            )
        } else {
            console.log('ok')
        }
    })
}

run()


