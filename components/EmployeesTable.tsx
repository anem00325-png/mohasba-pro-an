
import React from 'react';
import { Employee } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface EmployeesTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: number) => void;
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({ employees, onEdit, onDelete }) => {
  const { t, language } = useLanguage();
  const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name));
  const currency = language === 'ar' ? 'EGP' : 'USD';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right rtl:text-right">
        <thead className="border-b-2 border-dark-700 text-dark-400 uppercase text-sm">
          <tr>
            <th className="p-3 font-semibold text-right rtl:text-right">{t('employees.table.name')}</th>
            <th className="p-3 font-semibold text-center">{t('employees.table.position')}</th>
            <th className="p-3 font-semibold text-center">{t('employees.table.joinDate')}</th>
            <th className="p-3 font-semibold text-center">{t('employees.table.salary')}</th>
            <th className="p-3 font-semibold text-left rtl:text-left">{t('employees.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedEmployees.map((employee) => (
            <tr key={employee.id} className="border-b border-dark-700 hover:bg-dark-700/50">
              <td className="p-3 font-medium">{employee.name}</td>
              <td className="p-3 text-dark-400 text-center">{employee.position}</td>
              <td className="p-3 text-dark-400 text-center">{employee.joinDate}</td>
              <td className="p-3 font-mono font-semibold text-center text-secondary">
                {employee.salary.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency })}
              </td>
              <td className="p-3 text-left rtl:text-left space-x-2 rtl:space-x-reverse">
                <button onClick={() => onEdit(employee)} className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-bold">{t('employees.edit')}</button>
                <button onClick={() => onDelete(employee.id)} className="text-red-400 hover:text-red-300 transition-colors text-xs font-bold">{t('employees.delete')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(EmployeesTable);
