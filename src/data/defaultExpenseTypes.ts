import { v4 as uuidv4 } from 'uuid';
import type { ExpenseType } from '../types';

export function createDefaultExpenseTypes(): ExpenseType[] {
  return [
    {
      id: uuidv4(),
      name: '住房',
      category: 'split',
      defaultAll: false,
      builtIn: true,
    },
    {
      id: uuidv4(),
      name: '租車',
      category: 'split',
      defaultAll: true,
      builtIn: true,
    },
    {
      id: uuidv4(),
      name: '餐費',
      category: 'per-item',
      defaultAll: false,
      builtIn: true,
      options: [
        { id: uuidv4(), label: 'A 套餐', price: 0 },
        { id: uuidv4(), label: 'B 套餐', price: 0 },
        { id: uuidv4(), label: 'C 套餐', price: 0 },
      ],
    },
    {
      id: uuidv4(),
      name: '導覽費',
      category: 'split',
      defaultAll: true,
      builtIn: true,
    },
    {
      id: uuidv4(),
      name: '門票',
      category: 'per-item',
      defaultAll: false,
      builtIn: true,
      options: [
        { id: uuidv4(), label: '全票', price: 0 },
        { id: uuidv4(), label: '敬老票', price: 0 },
      ],
    },
    {
      id: uuidv4(),
      name: '高鐵/火車',
      category: 'per-item',
      defaultAll: false,
      builtIn: true,
      options: [
        { id: uuidv4(), label: '全票', price: 0 },
        { id: uuidv4(), label: '敬老票', price: 0 },
      ],
    },
    {
      id: uuidv4(),
      name: '預收公費',
      category: 'public-fund',
      defaultAll: true,
      builtIn: true,
      fundSubType: 'pre-collect',
    },
    {
      id: uuidv4(),
      name: '從公費支出',
      category: 'public-fund',
      defaultAll: false,
      builtIn: true,
      fundSubType: 'expense',
    },
  ];
}
