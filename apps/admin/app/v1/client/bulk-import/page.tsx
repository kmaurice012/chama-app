'use client';

import { useState } from 'react';
import { Upload, Download, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

type ImportType = 'members' | 'contributions' | 'loans';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkImportPage() {
  const [importType, setImportType] = useState<ImportType>('members');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', importType);

      const response = await fetch('/api/bulk-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: data.success || 0,
          failed: data.failed || 0,
          errors: data.errors || [],
        });
        setFile(null);
        // Reset file input
        const input = document.getElementById('file-input') as HTMLInputElement;
        if (input) input.value = '';
      } else {
        setResult({
          success: 0,
          failed: 0,
          errors: [data.error || 'Upload failed'],
        });
      }
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 0,
        errors: [error.message || 'Network error'],
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = (type: ImportType) => {
    const templates = {
      members: `Name,Email,Phone,Role,National ID,Address
John Doe,john@example.com,0712345678,member,12345678,Nairobi
Jane Smith,jane@example.com,0723456789,member,23456789,Mombasa`,
      contributions: `Member Email,Amount,Month,Year,Payment Date,Payment Method,Transaction Ref,Status,Notes
john@example.com,1000,1,2024,2024-01-15,mpesa,ABC123,paid,January contribution
jane@example.com,1000,1,2024,2024-01-15,cash,,paid,January contribution`,
      loans: `Member Email,Amount,Purpose,Due Date,Interest Rate,Status,Notes
john@example.com,5000,Business expansion,2024-12-31,10,approved,Approved by committee
jane@example.com,3000,School fees,2024-11-30,10,pending,Pending guarantor approval`,
    };

    const blob = new Blob([templates[type]], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importOptions = [
    {
      type: 'members' as ImportType,
      title: 'Bulk Add Members',
      description: 'Import multiple members with their details',
      icon: Users,
      color: 'blue',
      fields: ['Name', 'Email', 'Phone', 'Role', 'National ID', 'Address'],
    },
    {
      type: 'contributions' as ImportType,
      title: 'Bulk Import Contributions',
      description: 'Import historical contribution records',
      icon: DollarSign,
      color: 'green',
      fields: ['Member Email', 'Amount', 'Month', 'Year', 'Payment Date', 'Payment Method', 'Status'],
    },
    {
      type: 'loans' as ImportType,
      title: 'Bulk Import Loans',
      description: 'Import existing loan records',
      icon: TrendingUp,
      color: 'purple',
      fields: ['Member Email', 'Amount', 'Purpose', 'Due Date', 'Interest Rate', 'Status'],
    },
  ];

  const selectedOption = importOptions.find((opt) => opt.type === importType);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Bulk Import Data</h2>
        <p className="text-gray-600 mt-2">
          Quickly add members and import historical records using CSV files
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
            <div className="mt-2 text-sm text-yellow-700 space-y-1">
              <p>• Download the CSV template for the correct format</p>
              <p>• Ensure all required fields are filled</p>
              <p>• For members: Emails must be unique</p>
              <p>• For contributions/loans: Member emails must exist in the system</p>
              <p>• Large files may take time to process</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {importOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = importType === option.type;
          const colorClasses = {
            blue: isSelected ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:border-blue-300',
            green: isSelected ? 'bg-green-50 border-green-500' : 'border-gray-200 hover:border-green-300',
            purple: isSelected ? 'bg-purple-50 border-purple-500' : 'border-gray-200 hover:border-purple-300',
          }[option.color];

          const iconColor = {
            blue: 'text-blue-600',
            green: 'text-green-600',
            purple: 'text-purple-600',
          }[option.color];

          return (
            <button
              key={option.type}
              onClick={() => {
                setImportType(option.type);
                setFile(null);
                setResult(null);
              }}
              className={`p-6 border-2 rounded-lg text-left transition ${colorClasses}`}
            >
              <Icon className={`w-8 h-8 ${iconColor} mb-3`} />
              <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
              <p className="text-sm text-gray-600">{option.description}</p>
            </button>
          );
        })}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {selectedOption?.title}
          </h3>
          <button
            onClick={() => downloadTemplate(importType)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        {/* Required Fields */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Required CSV Columns:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedOption?.fields.map((field) => (
              <span
                key={field}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <label htmlFor="file-input" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                Choose a CSV file
              </span>
              <span className="text-gray-600"> or drag and drop</span>
            </label>
            <input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file && (
              <p className="mt-3 text-sm text-gray-600">
                Selected: <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {isUploading ? 'Uploading...' : 'Upload and Import'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Import Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Successfully Imported</p>
                <p className="text-2xl font-bold text-green-600">{result.success}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{result.failed}</p>
              </div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Errors:</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <ul className="space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How to Import Data</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>Click "Download Template" to get the CSV template with correct format</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>Fill in your data in Excel or Google Sheets (keep the header row)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>Save/Export the file as CSV format</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">4.</span>
            <span>Upload the CSV file using the form above</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">5.</span>
            <span>Review the results and fix any errors if needed</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
