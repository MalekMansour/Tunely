const mysql = require('mysql2/promise');
const dbConfig = require('./config/db-config'); 

const pool = mysql.createPool(dbConfig);

const db = {
  query: async (sql, params) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [results] = await connection.execute(sql, params);
      return results;
    } catch (err) {
      console.error('Database Error:', err);
      throw err;
    } finally {
      if (connection) connection.release();
    }
  }
};

module.exports = db;
