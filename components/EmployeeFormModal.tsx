
import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  employeeToEdit: Employee | null;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ isOpen, onClose, onAddEmployee, onUpdateEmployee, employeeToEdit }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setPosition(employeeToEdit.position);
      setSalary(String(employeeToEdit.salary));
      setJoinDate(employeeToEdit.joinDate);
    } else {
      setName('');
      setPosition('');
      setSalary('');
      setJoinDate(new Date().toISOString().slice(0, 10));
    }
  }, [employeeToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position || !salary || !joinDate || parseFloat(salary) <= 0) {
      showToast(t('errors.fillAllFields'), 'error');
      return;
    }
    
    const employeeData = {
      name,
      position,
      salary: parseFloat(salary),
      joinDate,
    };

    if (employeeToEdit) {
      onUpdateEmployee({ ...employeeData, id: employeeToEdit.id });
    } else {
      onAddEmployee(employeeData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-dark-800 rounded-lg shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-dark-400 hover:text-white text-2xl z-20">&times;</button>
        <h3 className="text-xl font-bold mb-6 text-center">{employeeToEdit ? t('employees.modal.editTitle') : t('employees.modal.addTitle')}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employeeName" className="block text-sm font-medium text-dark-300 mb-1">{t('employees.modal.nameLabel')}</label>
              <input
                type="text" id="employeeName" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
                placeholder={t('employees.modal.namePlaceholder')} required
              />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-dark-300 mb-1">{t('employees.modal.positionLabel')}</label>
              <input
                type="text" id="position" value={position} onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
                placeholder={t('employees.modal.positionPlaceholder')} required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-dark-300 mb-1">{t('employees.modal.salaryLabel')}</label>
              <input
                type="number" id="salary" min="0.01" step="0.01" value={salary} onChange={(e) => setSalary(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
                placeholder="0.00" required
              />
            </div>
            <div>
              <label htmlFor="joinDate" className="block text-sm font-medium text-dark-300 mb-1">{t('employees.modal.joinDateLabel')}</label>
              <input
                type="date" id="joinDate" value={joinDate} onChange={(e) => setJoinDate(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary [color-scheme:dark]"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
            <button type="button" onClick={onClose} className="bg-dark-600 hover:bg-dark-500 text-white font-bold py-2 px-4 rounded-md transition duration-300">{t('invoices.modal.cancelButton')}</button>
            <button type="submit" className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">{t('invoices.modal.saveButton')}</button>
          </div>
        </form>
      </div>
       <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EmployeeFormModal;
