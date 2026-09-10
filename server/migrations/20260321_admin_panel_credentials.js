/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('admin_panel_credentials', (t) => {
    t.integer('id').primary().defaultTo(1);
    t.string('login', 128).notNullable();
    t.string('password_hash', 255).notNullable();
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('admin_panel_credentials');
}
