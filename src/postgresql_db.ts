import moment from 'moment';
import { Pool, QueryResult } from 'pg';
import { Observable, from, of } from 'rxjs';

class PostgresDB {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'mj_info',
      password: '123',
      port: 5432, // Change this based on your PostgreSQL configuration
    });
  }

  public async query(sql: string, values?: any): Promise<QueryResult> {
    try {
      const client = await this.pool.connect();
      const result = await client.query(sql, values);
      client.release();
      return result;
    } catch (error: any) {
      console.log(error)
      // throw new Error(`Error executing query: ${error.message}`);
    }
  }

  public select(sql: string): Observable<any> {
    const result = this.query(sql).then(res=>{
      if(res.rows.length > 0){
        return res.rows;
      }else{
        return res.rowCount
      }
    });
    
    return from(result);
  }

  public async insert(tableName: string, data: Record<string, any>): Promise<void> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = Array.from({ length: keys.length }, (_, i) => `$${i + 1}`).join(', ');

    const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

    await this.query(sql, values);
  }

  public async insertArray(tableName: string, dataArray: Record<string, any>[]): Promise<number> {
    if (dataArray.length === 0) {
      throw new Error('dataArray must not be empty');
    }

    const keys = Object.keys(dataArray[0]);

    // Format the values for each row
    const formattedValues = dataArray.map((data) => {
      // console.log(data)
      const rowValues = keys.map((key) => {
        const value = data[key];
        if (typeof value === 'object' && value instanceof Date) {
          return `'${moment(value).format('YYYY-MM-DD')}'`;
        } else if (typeof value === 'string') {
          return `'${value}'`
        } else {
          return value;
        }
      });
      return `(${rowValues.join(', ')})`;
    });

    const columns = keys.join(', ');
    const valuePlaceholders = formattedValues.join(', ');

    const sql = `INSERT INTO ${tableName} (${columns}) VALUES ${valuePlaceholders} RETURNING id`;
    // console.log(sql)
    try {
      const result = await this.pool.query(sql);
      const insertedRowCount = result.rowCount;
      console.log(`Data inserted into ${tableName} successfully. Inserted ${insertedRowCount} rows.`);
      return insertedRowCount;
    } catch (error) {
      console.error(`Error inserting data into ${tableName}:`, error.message);
      throw error;
    }
  }


  public async update(tableName: string, data: Record<string, any>, condition: Record<string, any>): Promise<void> {
    const updateSet = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const conditionKeys = Object.keys(condition);
    const conditionValues = Object.values(condition);

    const sql = `UPDATE ${tableName} SET ${updateSet} WHERE ${conditionKeys.join(' = $')} = $${conditionKeys.length + 1}`;
    await this.query(sql, [...Object.values(data), ...conditionValues]);
  }

  public async delete(tableName: string, condition: Record<string, any>): Promise<void> {
    const conditionKeys = Object.keys(condition);
    const conditionValues = Object.values(condition);

    const sql = `DELETE FROM ${tableName} WHERE ${conditionKeys.join(' = $')} = $${conditionKeys.length + 1}`;
    await this.query(sql, conditionValues);
  }
}

export default PostgresDB;
