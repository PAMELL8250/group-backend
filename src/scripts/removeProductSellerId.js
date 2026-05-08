/**
 * One-time MySQL cleanup: drops FK constraint(s) on Products.sellerId and the column.
 * Run after pulling the model change that removes sellerId from Product:
 *   npm run db:drop-product-sellerid
 */
import "dotenv/config";
import sequelize from "../config/db.js";

async function resolveProductsTableName() {
  const [rows] = await sequelize.query("SHOW TABLES");
  const names = rows.map((r) => Object.values(r)[0]);
  const match = names.find((n) => String(n).toLowerCase() === "products");
  if (!match) {
    throw new Error("No table named `products` (case-insensitive) found in this database.");
  }
  return String(match);
}

async function main() {
  await sequelize.authenticate();
  const table = await resolveProductsTableName();
  const safeTable = table.replace(/`/g, "");
  const quoted = `\`${safeTable}\``;

  const [fkRows] = await sequelize.query(
    `SELECT DISTINCT CONSTRAINT_NAME AS name
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = :table
       AND COLUMN_NAME = 'sellerId'
       AND REFERENCED_TABLE_NAME IS NOT NULL`,
    { replacements: { table: safeTable } },
  );

  for (const row of fkRows) {
    const fk = row.name;
    console.log(`Dropping foreign key \`${fk}\` on ${quoted}...`);
    await sequelize.query(`ALTER TABLE ${quoted} DROP FOREIGN KEY \`${fk}\``);
  }

  const [colRows] = await sequelize.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = 'sellerId'`,
    { replacements: { table: safeTable } },
  );

  if (colRows.length > 0) {
    console.log(`Dropping column sellerId from ${quoted}...`);
    await sequelize.query(`ALTER TABLE ${quoted} DROP COLUMN \`sellerId\``);
  } else {
    console.log("Column sellerId is already gone.");
  }

  console.log("Done. Start the API as usual.");
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
