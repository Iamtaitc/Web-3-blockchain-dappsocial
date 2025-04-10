import React, { ReactNode } from 'react';

type Column = {
  header: string;
  accessor: string;
  cell?: (value: any, item: any) => ReactNode;
};

type DataTableProps = {
  columns: Column[];
  data: any[];
  onRowClick?: (item: any) => void;
};

const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  data, 
  onRowClick 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((column, index) => (
              <th 
                key={column.accessor}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                          ${index === 0 ? 'rounded-l-lg' : ''} 
                          ${index === columns.length - 1 ? 'rounded-r-lg' : ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, rowIndex) => (
            <tr 
              key={rowIndex}
              className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((column) => (
                <td key={`${rowIndex}-${column.accessor}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.cell 
                    ? column.cell(item[column.accessor], item)
                    : item[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
