/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('audiences', (t) => {
    t.increments('id').primary();
    t.string('code', 32).notNullable().unique(); // individual | legal
    t.string('title_ru', 255).notNullable();
    t.string('title_kz', 255).notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('category_groups', (t) => {
    t.increments('id').primary();
    t.integer('audience_id').notNullable().references('id').inTable('audiences').onDelete('RESTRICT');
    t.string('code', 64).notNullable().unique(); // e.g. ind-family
    t.string('title_ru', 255).notNullable();
    t.string('title_kz', 255).notNullable();
    t.text('description_ru').notNullable();
    t.text('description_kz').notNullable();
    t.integer('sort_order').notNullable().defaultTo(0);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('subcategories', (t) => {
    t.increments('id').primary();
    t.integer('group_id').notNullable().references('id').inTable('category_groups').onDelete('RESTRICT');
    t.string('code', 64).notNullable().unique(); // e.g. ind-family-payments
    t.string('title_ru', 255).notNullable();
    t.string('title_kz', 255).notNullable();
    t.text('description_ru').notNullable();
    t.text('description_kz').notNullable();
    t.integer('sort_order').notNullable().defaultTo(0);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('questions', (t) => {
    t.increments('id').primary();
    t.integer('subcategory_id').notNullable().references('id').inTable('subcategories').onDelete('RESTRICT');
    t.string('code', 80).notNullable().unique(); // e.g. ind-family-payments-1
    t.text('question_ru').notNullable();
    t.text('question_kz').notNullable();
    t.text('answer_ru').notNullable();
    t.text('answer_kz').notNullable();
    t.text('tags_ru').nullable(); // JSON string
    t.text('tags_kz').nullable();
    t.integer('sort_order').notNullable().defaultTo(0);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('applications', (t) => {
    t.increments('id').primary();
    t.integer('subcategory_id').notNullable().references('id').inTable('subcategories').onDelete('RESTRICT');
    t.integer('question_id').notNullable().references('id').inTable('questions').onDelete('RESTRICT');
    t.string('lang', 8).notNullable(); // ru | kz
    t.string('name', 120).nullable();
    t.string('phone', 32).notNullable();
    t.text('comment').nullable();
    t.string('status', 32).notNullable().defaultTo('new'); // new|in_progress|done
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw('CREATE INDEX idx_questions_subcategory ON questions(subcategory_id)');
  await knex.schema.raw('CREATE INDEX idx_applications_created_at ON applications(created_at)');
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('applications');
  await knex.schema.dropTableIfExists('questions');
  await knex.schema.dropTableIfExists('subcategories');
  await knex.schema.dropTableIfExists('category_groups');
  await knex.schema.dropTableIfExists('audiences');
}

