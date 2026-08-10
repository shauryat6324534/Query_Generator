import React, { useState } from "react";
import { Search, Database, ChevronDown, ChevronRight, Key, Info, RefreshCw, Link, ArrowRight } from "lucide-react";

export default function SchemaExplorer({ schema = [], loading, error, onRefresh, onTableClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTables, setExpandedTables] = useState({});
  const [recentTables, setRecentTables] = useState([]);

  const toggleTable = (tableName) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
    
    // Add to recently used tables
    if (!recentTables.includes(tableName)) {
      setRecentTables((prev) => [tableName, ...prev.slice(0, 3)]);
    }
  };

  const handleTableSelect = (tableName) => {
    if (onTableClick) {
      onTableClick(tableName);
    }
  };

  // Filter tables based on search term
  const filteredSchema = schema.filter((table) =>
    table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-80 bg-brutalSage text-black flex flex-col h-full shrink-0 border-l-2 border-black font-satoshi overflow-hidden select-none z-30">
      
      {/* Explorer Header */}
      <div className="p-4 border-b-2 border-black bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-black shrink-0" />
          <h2 className="text-xs font-extrabold uppercase tracking-tight text-black">Schema Explorer</h2>
        </div>
        
        <button 
          onClick={onRefresh}
          title="Sync Database Schema"
          className="p-1.5 border border-black hover:bg-brutalYellow transition-colors flex items-center justify-center bg-white shadow-brutal-sm active:translate-y-0.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table Search */}
      <div className="p-3.5 bg-white border-b-2 border-black shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search catalog tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-black text-black placeholder-black/50 py-1.5 pl-8 pr-3 text-xs font-bold focus:outline-none focus:bg-brutalYellow/10 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-black absolute left-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Recently Used Tables Module */}
      {recentTables.length > 0 && (
        <div className="px-4 py-2 bg-[#d2e0dc] border-b-2 border-black shrink-0">
          <span className="text-[8px] font-extrabold uppercase tracking-widest text-black/55 block mb-1.5">Recently Used</span>
          <div className="flex flex-wrap gap-1.5">
            {recentTables.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (!expandedTables[tab]) {
                    toggleTable(tab);
                  }
                  handleTableSelect(tab);
                }}
                className="text-[10px] font-mono font-bold bg-white border border-black px-2 py-0.5 hover:bg-brutalYellow shadow-brutal-sm transition-all active:translate-y-0.5"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Schema Catalogue Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2.5">
            <RefreshCw className="w-6 h-6 text-black animate-spin" />
            <span className="text-xs font-extrabold">Reading metadata catalog...</span>
          </div>
        ) : error && schema.length === 0 ? (
          <div className="p-4 bg-white border-2 border-black text-xs space-y-2 shadow-brutal-sm">
            <p className="font-extrabold text-red-600">Dynamic Sync Interrupted</p>
            <p className="text-[10px] leading-relaxed text-black/75">{error}</p>
          </div>
        ) : filteredSchema.length === 0 ? (
          <div className="text-center py-20 text-xs font-semibold text-black/50 italic">
            No tables matched criteria
          </div>
        ) : (
          <div className="space-y-3.5">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-black/60 block pl-0.5">Tables Catalogue ({filteredSchema.length})</span>
            {filteredSchema.map((table) => {
              const isExpanded = !!expandedTables[table.tableName];
              
              // Find relations for the table
              const tableRelationships = table.relationships || (() => {
                const list = [];
                if (table.tableName === "employees") {
                  list.push({ columnName: "department_id", referencedTable: "departments", referencedColumn: "id" });
                }
                if (table.tableName === "departments") {
                  list.push({ columnName: "manager_id", referencedTable: "employees", referencedColumn: "id" });
                }
                if (table.tableName === "orders") {
                  list.push({ columnName: "customer_id", referencedTable: "customers", referencedColumn: "id" });
                }
                return list;
              })();

              return (
                <div key={table.tableName} className="bg-white border-2 border-black shadow-brutal transition-all overflow-hidden">
                  
                  {/* Table title */}
                  <button
                    onClick={() => {
                      toggleTable(table.tableName);
                      handleTableSelect(table.tableName);
                    }}
                    className="w-full text-left p-2.5 flex items-center justify-between font-mono text-xs font-extrabold hover:bg-brutalYellow transition-colors border-b border-black/10 last:border-b-0"
                  >
                    <span className="flex items-center gap-1 font-bold font-mono">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      {table.tableName}
                    </span>
                    <span className="text-[8px] px-1 bg-black text-white font-sans uppercase font-bold tracking-wider">
                      {table.columns.length} columns
                    </span>
                  </button>

                  {/* Columns Detail accordion box */}
                  {isExpanded && (
                    <div className="bg-[#fbfcfa] border-t border-black divide-y divide-black/5 p-2 space-y-1">
                      
                      {/* Columns list header */}
                      <span className="text-[8px] font-extrabold uppercase tracking-wider text-black/40 block px-1.5 py-0.5">Columns</span>
                      {table.columns.map((col) => {
                        // Check if FK
                        const isFk = col.isForeignKey || tableRelationships.some(r => r.columnName === col.columnName);
                        return (
                          <div key={col.columnName} className="flex items-center justify-between py-1.5 px-2 text-[11px] font-mono hover:bg-black/5 transition-colors">
                            <span className="flex items-center gap-1 font-bold font-mono text-black">
                              {col.isPrimaryKey && (
                                <Key className="w-3 h-3 text-brutalYellow stroke-[3px] fill-black shrink-0" title="Primary Key" />
                              )}
                              {isFk && (
                                <Link className="w-3 h-3 text-blue-600 shrink-0" title="Foreign Key" />
                              )}
                              {col.columnName}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-[9px] text-black/50 bg-black/5 border border-black/10 px-1 py-0.1 font-sans uppercase font-bold">
                                {col.dataType}
                              </span>
                              {!col.isNullable && (
                                <span className="text-[8px] bg-red-100 text-red-800 border border-red-200 px-1 py-0.1 font-sans font-bold" title="Not Nullable">
                                  NN
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}

                      {/* Relationships subsection */}
                      {tableRelationships.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-black/10 space-y-1">
                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-black/40 block px-1.5">Relationships</span>
                          {tableRelationships.map((rel, rIdx) => (
                            <div key={rIdx} className="px-1.5 py-1 text-[9px] font-mono text-black/85 flex items-center gap-1 flex-wrap">
                              <span className="font-bold font-mono">{rel.columnName}</span>
                              <ArrowRight className="w-2.5 h-2.5 shrink-0 text-black/60" />
                              <span className="font-extrabold font-mono text-blue-700 bg-blue-50 border border-blue-100 px-1">{rel.referencedTable}.{rel.referencedColumn}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
