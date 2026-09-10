import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useI18n } from '../../utils/i18n.jsx';
import { readOnboardingProfile, writeOnboardingProfile } from '../../utils/onboardingProfile.js';
import { suggestSubcategories } from '../../utils/benefitsRepository.js';

const StyledWrap = styled.div`
  display: grid;
  gap: 12px;
`;

const StyledProgress = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(246, 249, 255, 0.75);
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StyledQuestion = styled.div`
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledHint = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.45;
`;

const StyledField = styled.label`
  display: grid;
  gap: 6px;
`;

const StyledLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.82);
  color: ${({ theme }) => theme.colors.text};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.1);
  }
`;

const StyledOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`;

const StyledOption = styled.button.attrs({ type: 'button' })`
  width: 100%;
  text-align: left;
  padding: 12px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme, $active }) => ($active ? 'rgba(37, 99, 235, 0.45)' : theme.colors.border)};
  background: ${({ $active }) => ($active ? 'rgba(37, 99, 235, 0.10)' : 'rgba(255, 255, 255, 0.78)')};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};

  &:hover {
    border-color: rgba(37, 99, 235, 0.45);
    background: rgba(37, 99, 235, 0.10);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledError = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
`;

const StyledRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
`;

const StyledPrimary = styled.button.attrs({ type: 'button' })`
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.12);
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 600;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(37, 99, 235, 0.45);
    background: rgba(37, 99, 235, 0.18);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StyledGhost = styled.button.attrs({ type: 'button' })`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 14px;

  &:hover {
    border-color: rgba(37, 99, 235, 0.35);
    background: rgba(37, 99, 235, 0.06);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const DEFAULT_FLOW = [
  {
    id: 'age',
    type: 'number',
    text: { ru: 'Сколько вам лет?', kz: 'Жасыңыз қанша?' },
    placeholder: { ru: 'Например: 28', kz: 'Мысалы: 28' },
  },
  {
    id: 'maritalStatus',
    type: 'single_choice',
    text: { ru: 'Семейное положение?', kz: 'Отбасылық жағдайыңыз?' },
    options: [
      { id: 'single', text: { ru: 'Не женат/не замужем', kz: 'Бойдақ/Тұрмыс құрмаған' } },
      { id: 'married', text: { ru: 'Женат/замужем', kz: 'Үйленген/Тұрмыста' } },
      { id: 'divorced', text: { ru: 'Разведён(а)', kz: 'Ажырасқан' } },
      { id: 'widowed', text: { ru: 'Вдовец/вдова', kz: 'Жесір' } },
    ],
  },
  {
    id: 'children',
    type: 'single_choice',
    text: { ru: 'Есть дети?', kz: 'Балаларыңыз бар ма?' },
    options: [
      { id: 'no', text: { ru: 'Нет', kz: 'Жоқ' } },
      { id: 'yes', text: { ru: 'Да', kz: 'Иә' } },
    ],
  },
  {
    id: 'employment',
    type: 'single_choice',
    text: { ru: 'Ваш статус занятости?', kz: 'Жұмыспен қамтылу мәртебеңіз?' },
    options: [
      { id: 'employed', text: { ru: 'Работаю', kz: 'Жұмыс істеймін' } },
      { id: 'selfEmployed', text: { ru: 'Самозанятый/ИП', kz: 'Өзін-өзі жұмыспен қамтыған/ЖК' } },
      { id: 'unemployed', text: { ru: 'Не работаю', kz: 'Жұмыссыз' } },
      { id: 'student', text: { ru: 'Учусь', kz: 'Оқимын' } },
      { id: 'retired', text: { ru: 'Пенсионер', kz: 'Зейнеткер' } },
    ],
  },
];

function normalizeAnswerValue(q, value) {
  if (q.type === 'number') {
    const n = Number(String(value ?? '').trim());
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n);
  }
  if (q.type === 'single_choice') return String(value ?? '').trim() || null;
  return String(value ?? '').trim() || null;
}

const BRANCH_QUESTIONS = {
  priority: {
    id: 'priority',
    type: 'single_choice',
    text: { ru: 'Что сейчас для вас актуальнее всего?', kz: 'Қазір сіз үшін ең өзекті мәселе қайсысы?' },
    hint: {
      ru: 'Выберите один вариант — мы подберём подходящие разделы.',
      kz: 'Бір нұсқаны таңдаңыз — біз сәйкес бөлімдерді ұсынамыз.',
    },
    options: [
      { id: 'family', text: { ru: 'Семья и дети', kz: 'Отбасы және балалар' } },
      { id: 'work', text: { ru: 'Работа/доход', kz: 'Жұмыс/табыс' } },
      { id: 'housing', text: { ru: 'Жильё/коммунальные', kz: 'Тұрғын үй/коммуналдық' } },
      { id: 'health', text: { ru: 'Здоровье', kz: 'Денсаулық' } },
      { id: 'education', text: { ru: 'Образование', kz: 'Білім' } },
      { id: 'other', text: { ru: 'Другое', kz: 'Басқа' } },
    ],
  },
  familyFocus: {
    id: 'familyFocus',
    type: 'single_choice',
    text: { ru: 'Что в теме семьи/детей важнее сейчас?', kz: 'Отбасы/балалар тақырыбында қазір не маңызды?' },
    options: [
      { id: 'payments', text: { ru: 'Пособия и выплаты', kz: 'Жәрдемақы және төлемдер' } },
      { id: 'maternity', text: { ru: 'Беременность/роды', kz: 'Жүктілік/босану' } },
      { id: 'kindergarten', text: { ru: 'Детсад/школа', kz: 'Балабақша/мектеп' } },
      { id: 'guardianship', text: { ru: 'Опека/усыновление', kz: 'Қамқоршылық/асырап алу' } },
      { id: 'singleParent', text: { ru: 'Один родитель', kz: 'Жалғыз ата-ана' } },
    ],
  },
  pregnancyNow: {
    id: 'pregnancyNow',
    type: 'single_choice',
    text: { ru: 'Беременность сейчас актуальна?', kz: 'Қазір жүктілік өзекті ме?' },
    options: [
      { id: 'pregnant', text: { ru: 'Да, беременна', kz: 'Иә, жүкті' } },
      { id: 'planning', text: { ru: 'Планируем', kz: 'Жоспарлап жүрміз' } },
      { id: 'afterBirth', text: { ru: 'После родов/в декрете', kz: 'Босанғаннан кейін/декрет' } },
      { id: 'no', text: { ru: 'Нет', kz: 'Жоқ' } },
    ],
  },
  kidsCount: {
    id: 'kidsCount',
    type: 'single_choice',
    text: { ru: 'Сколько детей?', kz: 'Қанша бала бар?' },
    options: [
      { id: '1', text: { ru: '1', kz: '1' } },
      { id: '2', text: { ru: '2', kz: '2' } },
      { id: '3plus', text: { ru: '3+', kz: '3+' } },
    ],
  },
  childrenAge: {
    id: 'childrenAge',
    type: 'single_choice',
    text: { ru: 'Возраст детей?', kz: 'Балалардың жасы?' },
    options: [
      { id: '0_3', text: { ru: '0–3', kz: '0–3' } },
      { id: '3_6', text: { ru: '3–6', kz: '3–6' } },
      { id: '6_18', text: { ru: '6–18', kz: '6–18' } },
      { id: '18_plus', text: { ru: '18+', kz: '18+' } },
      { id: 'different', text: { ru: 'Разные', kz: 'Әртүрлі' } },
    ],
  },
  childcareNeed: {
    id: 'childcareNeed',
    type: 'single_choice',
    text: { ru: 'Что важно по детям?', kz: 'Балалар бойынша не маңызды?' },
    options: [
      { id: 'payments', text: { ru: 'Пособия/выплаты', kz: 'Жәрдемақы/төлем' } },
      { id: 'benefits', text: { ru: 'Льготы/статусы', kz: 'Жеңілдіктер/мәртебе' } },
      { id: 'school', text: { ru: 'Школа/сад', kz: 'Мектеп/бақша' } },
      { id: 'health', text: { ru: 'Здоровье/реабилитация', kz: 'Денсаулық/реабилитация' } },
    ],
  },
  disability: {
    id: 'disability',
    type: 'single_choice',
    text: { ru: 'Есть инвалидность (у вас или ребёнка)?', kz: 'Мүгедектік бар ма (сізде немесе балада)?' },
    options: [
      { id: 'no', text: { ru: 'Нет', kz: 'Жоқ' } },
      { id: 'yes', text: { ru: 'Да', kz: 'Иә' } },
    ],
  },
  disabilityWho: {
    id: 'disabilityWho',
    type: 'single_choice',
    text: { ru: 'У кого инвалидность?', kz: 'Кімде мүгедектік бар?' },
    options: [
      { id: 'me', text: { ru: 'У меня', kz: 'Өзімде' } },
      { id: 'child', text: { ru: 'У ребёнка', kz: 'Балада' } },
      { id: 'both', text: { ru: 'У обоих', kz: 'Екеуінде де' } },
    ],
  },
  healthNeed: {
    id: 'healthNeed',
    type: 'single_choice',
    text: { ru: 'Какая поддержка по здоровью важнее?', kz: 'Денсаулық бойынша қандай қолдау маңызды?' },
    options: [
      { id: 'medicine', text: { ru: 'Лекарства', kz: 'Дәрі-дәрмек' } },
      { id: 'rehab', text: { ru: 'Реабилитация', kz: 'Реабилитация' } },
      { id: 'care', text: { ru: 'Уход/соцпомощь', kz: 'Күтім/әлеумет. көмек' } },
      { id: 'documents', text: { ru: 'Оформление статуса/документы', kz: 'Мәртебе/құжаттар' } },
    ],
  },
  incomeLevel: {
    id: 'incomeLevel',
    type: 'single_choice',
    text: { ru: 'Уровень дохода семьи (примерно)?', kz: 'Отбасы табысы (шамамен)?' },
    options: [
      { id: 'low', text: { ru: 'Низкий', kz: 'Төмен' } },
      { id: 'medium', text: { ru: 'Средний', kz: 'Орташа' } },
      { id: 'high', text: { ru: 'Высокий', kz: 'Жоғары' } },
      { id: 'dontKnow', text: { ru: 'Сложно сказать', kz: 'Білмеймін' } },
    ],
  },
  workType: {
    id: 'workType',
    type: 'single_choice',
    text: { ru: 'Формат работы?', kz: 'Жұмыс форматыңыз?' },
    options: [
      { id: 'official', text: { ru: 'Официально', kz: 'Ресми' } },
      { id: 'informal', text: { ru: 'Неофициально', kz: 'Бейресми' } },
      { id: 'ip', text: { ru: 'ИП/самозанятость', kz: 'ЖК/өзін-өзі жұмыспен қамту' } },
    ],
  },
  workGoal: {
    id: 'workGoal',
    type: 'single_choice',
    text: { ru: 'Что сейчас важнее по работе/доходу?', kz: 'Жұмыс/табыс бойынша қазір не маңызды?' },
    options: [
      { id: 'benefits', text: { ru: 'Пособия/поддержка', kz: 'Жәрдемақы/қолдау' } },
      { id: 'training', text: { ru: 'Обучение/повышение квалификации', kz: 'Оқу/біліктілікті арттыру' } },
      { id: 'business', text: { ru: 'Развитие бизнеса', kz: 'Бизнес дамыту' } },
      { id: 'tax', text: { ru: 'Налоги/статусы', kz: 'Салық/мәртебелер' } },
    ],
  },
  housingNeed: {
    id: 'housingNeed',
    type: 'single_choice',
    text: { ru: 'Что по жилью актуальнее?', kz: 'Тұрғын үй бойынша не маңызды?' },
    options: [
      { id: 'utilities', text: { ru: 'Субсидии/ЖКХ', kz: 'Субсидия/коммуналдық' } },
      { id: 'mortgage', text: { ru: 'Ипотека/жильё', kz: 'Ипотека/үй' } },
      { id: 'both', text: { ru: 'И то, и другое', kz: 'Екеуі де' } },
    ],
  },
  housingStatus: {
    id: 'housingStatus',
    type: 'single_choice',
    text: { ru: 'Ваше жильё сейчас?', kz: 'Қазіргі тұрғын үй жағдайыңыз?' },
    options: [
      { id: 'own', text: { ru: 'Своё', kz: 'Өз үйім' } },
      { id: 'rent', text: { ru: 'Аренда', kz: 'Жалдау' } },
      { id: 'mortgage', text: { ru: 'Ипотека', kz: 'Ипотека' } },
      { id: 'relatives', text: { ru: 'У родственников', kz: 'Туыстарда' } },
    ],
  },
  utilitiesIssue: {
    id: 'utilitiesIssue',
    type: 'single_choice',
    text: { ru: 'Коммунальные платежи — есть сложность?', kz: 'Коммуналдық төлемдер — қиындық бар ма?' },
    options: [
      { id: 'no', text: { ru: 'Нет', kz: 'Жоқ' } },
      { id: 'yes', text: { ru: 'Да', kz: 'Иә' } },
    ],
  },
  educationType: {
    id: 'educationType',
    type: 'single_choice',
    text: { ru: 'К какому обучению ближе вопрос?', kz: 'Қай оқу түріне қатысты?' },
    options: [
      { id: 'school', text: { ru: 'Школа', kz: 'Мектеп' } },
      { id: 'college', text: { ru: 'Колледж', kz: 'Колледж' } },
      { id: 'university', text: { ru: 'Вуз', kz: 'ЖОО' } },
      { id: 'adult', text: { ru: 'Курсы/переобучение', kz: 'Курс/қайта оқу' } },
    ],
  },
  studentAspect: {
    id: 'studentAspect',
    type: 'single_choice',
    text: { ru: 'Что в студенческой жизни важнее сейчас?', kz: 'Студенттік өмірде қазір не маңызды?' },
    options: [
      { id: 'money', text: { ru: 'Финансовая помощь', kz: 'Қаржылай қолдау' } },
      { id: 'transport', text: { ru: 'Скидки/транспорт', kz: 'Жеңілдіктер/көлік' } },
      { id: 'learning', text: { ru: 'Учёба/ресурсы', kz: 'Оқу/ресурстар' } },
      { id: 'internship', text: { ru: 'Стажировка/работа', kz: 'Тағылымдама/жұмыс' } },
    ],
  },
  unemployedGoal: {
    id: 'unemployedGoal',
    type: 'single_choice',
    text: { ru: 'Что вам нужнее сейчас?', kz: 'Қазір сізге не керек?' },
    options: [
      { id: 'job', text: { ru: 'Найти работу', kz: 'Жұмыс табу' } },
      { id: 'benefits', text: { ru: 'Пособия/выплаты', kz: 'Жәрдемақы/төлем' } },
      { id: 'training', text: { ru: 'Переобучение', kz: 'Қайта оқу' } },
    ],
  },
  seniorNeed: {
    id: 'seniorNeed',
    type: 'single_choice',
    text: { ru: 'Что важнее сейчас?', kz: 'Қазір не маңызды?' },
    options: [
      { id: 'medicine', text: { ru: 'Лекарства/лечение', kz: 'Дәрі-дәрмек/ем' } },
      { id: 'utilities', text: { ru: 'Коммунальные/субсидии', kz: 'Коммуналдық/субсидия' } },
      { id: 'care', text: { ru: 'Уход/реабилитация', kz: 'Күтім/реабилитация' } },
      { id: 'pension', text: { ru: 'Пенсия/выплаты', kz: 'Зейнетақы/төлем' } },
    ],
  },
};

function buildFlow(answers) {
  const flow = [...DEFAULT_FLOW];
  const used = new Set(flow.map((q) => q.id));

  const age = typeof answers.age === 'number' ? answers.age : Number(answers.age);
  const employment = String(answers.employment ?? '');
  const children = String(answers.children ?? '');

  const push = (q) => {
    if (!q || !q.id || used.has(q.id)) return;
    used.add(q.id);
    flow.push(q);
  };

  push(BRANCH_QUESTIONS.priority);

  const priority = String(answers.priority ?? '');
  const hasPriority = Boolean(priority);

  // only ask branch follow-ups AFTER priority chosen (to avoid irrelevant questions)
  if (hasPriority) {
    if (priority === 'family') push(BRANCH_QUESTIONS.familyFocus);
    if (priority === 'work') push(BRANCH_QUESTIONS.workGoal);
    if (priority === 'housing') push(BRANCH_QUESTIONS.housingNeed);
    if (priority === 'health') push(BRANCH_QUESTIONS.healthNeed);
    if (priority === 'education') push(BRANCH_QUESTIONS.educationType);
  }

  // family deep branch
  if (priority === 'family') {
    if (children === 'yes') {
      push(BRANCH_QUESTIONS.kidsCount);
      push(BRANCH_QUESTIONS.childrenAge);
      push(BRANCH_QUESTIONS.childcareNeed);
    } else {
      // no kids: pregnancy may be relevant if family focus chosen
      if (String(answers.familyFocus ?? '') === 'maternity') push(BRANCH_QUESTIONS.pregnancyNow);
    }
    if (String(answers.familyFocus ?? '') === 'singleParent') {
      push(BRANCH_QUESTIONS.incomeLevel);
    }
  }

  // work deep branch
  if (priority === 'work') {
    push(BRANCH_QUESTIONS.workType);
    push(BRANCH_QUESTIONS.incomeLevel);
  }

  // housing deep branch
  if (priority === 'housing') {
    push(BRANCH_QUESTIONS.housingStatus);
    if (String(answers.housingNeed ?? '') === 'utilities' || String(answers.housingNeed ?? '') === 'both') {
      push(BRANCH_QUESTIONS.utilitiesIssue);
    }
    if (!priority) {
      // noop
    }
  }

  // health deep branch
  if (priority === 'health') {
    push(BRANCH_QUESTIONS.disability);
    if (String(answers.disability ?? '') === 'yes') push(BRANCH_QUESTIONS.disabilityWho);
  }

  // education deep branch
  if (priority === 'education') {
    if (String(answers.educationType ?? '') === 'university' || employment === 'student') {
      push(BRANCH_QUESTIONS.studentAspect);
    }
  }

  // employment specific branches (only if explicitly selected)
  if (employment === 'student') push(BRANCH_QUESTIONS.studentAspect);
  if (employment === 'unemployed') push(BRANCH_QUESTIONS.unemployedGoal);
  if (employment === 'retired' || (Number.isFinite(age) && age >= 60)) push(BRANCH_QUESTIONS.seniorNeed);

  return flow;
}

function pickLabel(questionId, value, language) {
  const lang = language === 'kz' ? 'kz' : 'ru';
  const q = BRANCH_QUESTIONS[questionId];
  if (!q || q.type !== 'single_choice') return '';
  const opt = (q.options ?? []).find((o) => String(o.id) === String(value));
  const text = opt?.text?.[lang] ?? opt?.text?.ru ?? opt?.text?.kz ?? '';
  return String(text || '').trim();
}

function buildRecommendationQuery(answers, language) {
  const parts = [];
  const t = (ru, kz) => (language === 'kz' ? kz : ru);

  const age = typeof answers.age === 'number' ? answers.age : Number(answers.age);
  if (Number.isFinite(age)) parts.push(t(`возраст ${age}`, `жас ${age}`));

  if (answers.children === 'yes') parts.push(t('есть дети', 'балалар бар'));
  if (answers.childrenAge) parts.push(t(`возраст детей ${answers.childrenAge}`, `балалардың жасы ${answers.childrenAge}`));

  if (answers.employment) parts.push(t(`занятость ${answers.employment}`, `жұмыс мәртебесі ${answers.employment}`));
  if (answers.maritalStatus) parts.push(t(`семейное положение ${answers.maritalStatus}`, `отбасылық жағдай ${answers.maritalStatus}`));

  if (answers.priority) parts.push(t(`приоритет: ${pickLabel('priority', answers.priority, language) || answers.priority}`, `басымдық: ${pickLabel('priority', answers.priority, language) || answers.priority}`));
  if (answers.familyFocus) parts.push(t(pickLabel('familyFocus', answers.familyFocus, language), pickLabel('familyFocus', answers.familyFocus, language)));
  if (answers.pregnancyNow) parts.push(t(pickLabel('pregnancyNow', answers.pregnancyNow, language), pickLabel('pregnancyNow', answers.pregnancyNow, language)));
  if (answers.kidsCount) parts.push(t(`детей: ${answers.kidsCount}`, `бала саны: ${answers.kidsCount}`));
  if (answers.childcareNeed) parts.push(t(pickLabel('childcareNeed', answers.childcareNeed, language), pickLabel('childcareNeed', answers.childcareNeed, language)));
  if (answers.workGoal) parts.push(t(pickLabel('workGoal', answers.workGoal, language), pickLabel('workGoal', answers.workGoal, language)));
  if (answers.workType) parts.push(t(pickLabel('workType', answers.workType, language), pickLabel('workType', answers.workType, language)));
  if (answers.housingNeed) parts.push(t(pickLabel('housingNeed', answers.housingNeed, language), pickLabel('housingNeed', answers.housingNeed, language)));
  if (answers.housingStatus) parts.push(t(pickLabel('housingStatus', answers.housingStatus, language), pickLabel('housingStatus', answers.housingStatus, language)));
  if (answers.utilitiesIssue === 'yes') parts.push(t('коммунальные платежи: трудно', 'коммуналдық төлем: қиын'));
  if (answers.incomeLevel) parts.push(t(`доход: ${pickLabel('incomeLevel', answers.incomeLevel, language) || answers.incomeLevel}`, `табыс: ${pickLabel('incomeLevel', answers.incomeLevel, language) || answers.incomeLevel}`));
  if (answers.educationType) parts.push(t(pickLabel('educationType', answers.educationType, language), pickLabel('educationType', answers.educationType, language)));
  if (answers.studentAspect) parts.push(t(pickLabel('studentAspect', answers.studentAspect, language), pickLabel('studentAspect', answers.studentAspect, language)));
  if (answers.unemployedGoal) parts.push(t(pickLabel('unemployedGoal', answers.unemployedGoal, language), pickLabel('unemployedGoal', answers.unemployedGoal, language)));
  if (answers.seniorNeed) parts.push(t(pickLabel('seniorNeed', answers.seniorNeed, language), pickLabel('seniorNeed', answers.seniorNeed, language)));
  if (answers.disability === 'yes') parts.push(t('инвалидность', 'мүгедектік'));
  if (answers.disabilityWho) parts.push(t(pickLabel('disabilityWho', answers.disabilityWho, language), pickLabel('disabilityWho', answers.disabilityWho, language)));
  if (answers.healthNeed) parts.push(t(pickLabel('healthNeed', answers.healthNeed, language), pickLabel('healthNeed', answers.healthNeed, language)));

  return parts.join(' · ');
}

export function OnboardingWizard({ onDone }) {
  const { t, tl, language } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    const saved = readOnboardingProfile();
    return saved?.answers && typeof saved.answers === 'object' ? saved.answers : {};
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const flow = useMemo(() => buildFlow(answers), [answers]);
  const effectiveQuestion = flow[Math.min(stepIndex, Math.max(0, flow.length - 1))];

  const totalSteps = useMemo(() => flow.length, [flow.length]);
  const progressText = useMemo(() => {
    const shown = Math.min(stepIndex + 1, totalSteps);
    return `${shown} / ${totalSteps}`;
  }, [stepIndex, totalSteps]);

  useEffect(() => {
    setStepIndex((i) => Math.min(i, Math.max(0, flow.length - 1)));
  }, [flow.length]);

  useEffect(() => {
    setError('');
    if (!effectiveQuestion) return;
    const val = answers[effectiveQuestion.id];
    if (effectiveQuestion.type === 'single_choice') setInput(String(val ?? ''));
    else setInput(val == null ? '' : String(val));
  }, [effectiveQuestion?.id]);

  useEffect(() => {
    writeOnboardingProfile({ completed: false, answers });
  }, [answers]);

  const handleSelectOption = (id) => {
    setInput(id);
    setAnswers((prev) => ({ ...prev, [effectiveQuestion.id]: id }));
  };

  const handleInputChange = (v) => {
    setInput(v);
    setAnswers((prev) => ({ ...prev, [effectiveQuestion.id]: v }));
  };

  const canGoNext = useMemo(() => {
    if (!effectiveQuestion) return false;
    const normalized = normalizeAnswerValue(effectiveQuestion, answers[effectiveQuestion.id]);
    return normalized != null;
  }, [answers, effectiveQuestion]);

  const handleBack = async () => {
    setError('');
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = async () => {
    setError('');
    if (!effectiveQuestion) return;

    const normalized = normalizeAnswerValue(effectiveQuestion, answers[effectiveQuestion.id]);
    if (normalized == null) {
      setError(language === 'kz' ? 'Жауапты көрсетіңіз.' : 'Укажите ответ.');
      return;
    }

    setAnswers((prev) => ({ ...prev, [effectiveQuestion.id]: normalized }));

    const nextIndex = stepIndex + 1;
    const isLast = stepIndex >= flow.length - 1;
    if (!isLast) {
      setStepIndex(nextIndex);
      return;
    }

    const nextAnswers = { ...answers, [effectiveQuestion.id]: normalized };
    const query = buildRecommendationQuery(nextAnswers, language);
    const cleaned = suggestSubcategories(query, language, 10);
    const profile = { completed: true, completedAt: Date.now(), answers: nextAnswers, recommended: cleaned };
    writeOnboardingProfile(profile);
    onDone?.(profile);
  };

  const handleReset = () => {
    setError('');
    setStepIndex(0);
    setAnswers({});
    writeOnboardingProfile({ completed: false, answers: {} });
  };

  if (!effectiveQuestion) {
    return (
      <StyledWrap>
        <StyledQuestion>{language === 'kz' ? 'Анкета дайын.' : 'Анкета готова.'}</StyledQuestion>
        <StyledHint>
          {language === 'kz' ? 'Ұсыныстарды көрсету үшін аяқтаңыз.' : 'Завершите, чтобы увидеть рекомендации.'}
        </StyledHint>
        <StyledRow>
          <StyledGhost onClick={handleReset}>{language === 'kz' ? 'Қайта бастау' : 'Начать заново'}</StyledGhost>
          <StyledPrimary onClick={handleNext} disabled>
            {language === 'kz' ? 'Келесі' : 'Далее'}
          </StyledPrimary>
        </StyledRow>
      </StyledWrap>
    );
  }

  const title = tl(effectiveQuestion.text ?? effectiveQuestion.title ?? effectiveQuestion.question ?? effectiveQuestion.label);
  const hint = tl(effectiveQuestion.hint);
  const isChoice = effectiveQuestion.type === 'single_choice';

  return (
    <StyledWrap>
      <StyledProgress>
        <span>{t('nav.pickForYou')}</span>
        <span aria-label={language === 'kz' ? 'Прогресс' : 'Прогресс'}>{progressText}</span>
      </StyledProgress>

      <div>
        <StyledQuestion>{title}</StyledQuestion>
        {hint ? <StyledHint>{hint}</StyledHint> : null}
      </div>

      {isChoice ? (
        <StyledOptions role="listbox" aria-label={title}>
          {(effectiveQuestion.options ?? []).map((opt) => {
            const id = String(opt.id ?? opt.value ?? '');
            const active = String(answers[effectiveQuestion.id] ?? '') === id;
            return (
              <StyledOption
                key={id}
                $active={active}
                aria-selected={active}
                onClick={() => handleSelectOption(id)}
              >
                {tl(opt.text ?? opt.label ?? opt.title)}
              </StyledOption>
            );
          })}
        </StyledOptions>
      ) : (
        <StyledField>
          <StyledLabel>{language === 'kz' ? 'Жауап' : 'Ответ'}</StyledLabel>
          <StyledInput
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            inputMode={effectiveQuestion.type === 'number' ? 'numeric' : 'text'}
            placeholder={tl(effectiveQuestion.placeholder) || ''}
            aria-label={language === 'kz' ? 'Жауап' : 'Ответ'}
            autoFocus
          />
        </StyledField>
      )}

      {error ? <StyledError role="alert">{error}</StyledError> : null}

      <StyledRow>
        <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
          <StyledGhost onClick={handleBack} disabled={stepIndex === 0}>
            {language === 'kz' ? 'Артқа' : 'Назад'}
          </StyledGhost>
          <StyledGhost onClick={handleReset}>
            {language === 'kz' ? 'Қайта бастау' : 'Начать заново'}
          </StyledGhost>
        </div>
        <StyledPrimary onClick={handleNext} disabled={!canGoNext}>
          {language === 'kz' ? 'Далее' : 'Далее'}
        </StyledPrimary>
      </StyledRow>

      <StyledHint>
        {language === 'kz'
          ? 'Анкетадағы жауаптар тек осы құрылғыда сақталады.'
          : 'Ответы анкеты сохраняются только на этом устройстве.'}
      </StyledHint>
    </StyledWrap>
  );
}

OnboardingWizard.propTypes = {
  onDone: PropTypes.func,
};

OnboardingWizard.defaultProps = {
  onDone: undefined,
};

