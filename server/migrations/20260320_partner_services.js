/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('partner_service_assignments', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('subcategory_id').notNullable().references('id').inTable('subcategories').onDelete('CASCADE');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.unique(['user_id', 'subcategory_id']);
  });
  await knex.schema.raw(
    'CREATE INDEX idx_partner_assignments_user ON partner_service_assignments(user_id)',
  );
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('partner_service_assignments');
}
