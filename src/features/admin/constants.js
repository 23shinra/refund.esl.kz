/** @readonly */
export const ADMIN_PANEL_TOKEN_KEY = 'qoldau_admin_panel_jwt';

/** @readonly */
export const ADMIN_API = Object.freeze({
  LOGIN: '/api/admin/auth/login',
  CREDENTIALS: '/api/admin/credentials',
  STATS: '/api/admin/stats',
  USERS: '/api/admin/users',
  CATALOG_TREE: '/api/admin/catalog-tree',
  PARTNERS: '/api/admin/partners',
  categoryGroups: '/api/admin/category-groups',
  categoryGroup: (id) => `/api/admin/category-groups/${id}`,
  subcategories: '/api/admin/subcategories',
  subcategory: (id) => `/api/admin/subcategories/${id}`,
  subcategoryPartners: (id) => `/api/admin/subcategories/${id}/partners`,
  userRole: (id) => `/api/admin/users/${id}`,
  questions: '/api/admin/questions',
  question: (id) => `/api/admin/questions/${id}`,
  questionsByService: (subId) => `/api/admin/questions?subcategory_id=${subId}`,
});

/** @readonly */
export const ADMIN_NAV = Object.freeze([
  { id: 'dashboard', label: 'Обзор' },
  { id: 'categories', label: 'Категории' },
  { id: 'services', label: 'Услуги' },
  { id: 'questions', label: 'Льготы / Вопросы' },
  { id: 'partners', label: 'Партнёры' },
  { id: 'users', label: 'Пользователи' },
  { id: 'account', label: 'Учётная запись' },
]);
